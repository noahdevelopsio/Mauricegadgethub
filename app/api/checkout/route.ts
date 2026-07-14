import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

interface CartItemInput {
  product_id: string;
  variant_id: string | null;
  quantity: number;
}

interface CheckoutRequest {
  items: CartItemInput[];
  customer: {
    name: string;
    email: string;
    phone: string;
  };
  delivery: {
    method: "pickup" | "delivery";
    address: string;
  };
}

export async function POST(request: Request) {
  try {
    const body: CheckoutRequest = await request.json();
    const { items, customer, delivery } = body;

    // Validate body properties
    if (!items || items.length === 0 || !customer || !delivery) {
      return NextResponse.json(
        { error: { code: "INVALID_REQUEST", message: "Missing required checkout parameters." } },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    // 1. Retrieve store settings (for delivery fee)
    const { data: storeSettings, error: settingsError } = await supabase
      .from("store_settings")
      .select("flat_delivery_fee, free_delivery_threshold")
      .eq("id", 1)
      .single();

    if (settingsError || !storeSettings) {
      return NextResponse.json(
        { error: { code: "SETTINGS_ERROR", message: "Failed to load store configurations." } },
        { status: 500 }
      );
    }

    const flatDeliveryFee = Number(storeSettings.flat_delivery_fee);
    const freeDeliveryThreshold = storeSettings.free_delivery_threshold 
      ? Number(storeSettings.free_delivery_threshold) 
      : null;

    // 2. Fetch products and variants in the cart to check price and stock server-side (anti-tamper)
    const productIds = items.map((i) => i.product_id);
    const { data: dbProducts, error: productsError } = await supabase
      .from("products")
      .select("*, product_variants(*)")
      .in("id", productIds);

    if (productsError || !dbProducts || dbProducts.length === 0) {
      return NextResponse.json(
        { error: { code: "PRODUCTS_NOT_FOUND", message: "Some products in your cart could not be located in our database." } },
        { status: 400 }
      );
    }

    let subtotal = 0;
    const orderItemsToInsert: any[] = [];

    // 3. Process each cart item and compute totals
    for (const item of items) {
      const product = dbProducts.find((p) => p.id === item.product_id);
      if (!product) {
        return NextResponse.json(
          { error: { code: "PRODUCT_NOT_FOUND", message: `Product not found.` } },
          { status: 400 }
        );
      }

      let price = product.sale_price !== null && product.sale_price < product.base_price 
        ? Number(product.sale_price) 
        : Number(product.base_price);
      
      let variantNameSnapshot = "";
      let stockQuantity = product.stock_quantity;

      // Handle variant pricing/stock overrides
      if (item.variant_id) {
        const variant = product.product_variants?.find((v: any) => v.id === item.variant_id);
        if (!variant) {
          return NextResponse.json(
            { error: { code: "VARIANT_NOT_FOUND", message: `Selected variant for product '${product.name}' was not found.` } },
            { status: 400 }
          );
        }
        
        if (variant.price_override !== null && variant.price_override !== undefined) {
          price = Number(variant.price_override);
        }
        variantNameSnapshot = ` (${variant.variant_name})`;
        stockQuantity = variant.stock_quantity;
      }

      // Check stock levels
      if (item.quantity > stockQuantity) {
        return NextResponse.json(
          {
            error: {
              code: "OUT_OF_STOCK",
              message: `Requested quantity for '${product.name}${variantNameSnapshot}' exceeds available stock (${stockQuantity} left).`,
            },
          },
          { status: 400 }
        );
      }

      const lineTotal = price * item.quantity;
      subtotal += lineTotal;

      orderItemsToInsert.push({
        product_id: product.id,
        variant_id: item.variant_id,
        product_name_snapshot: `${product.name}${variantNameSnapshot}`,
        unit_price_snapshot: price,
        quantity: item.quantity,
        line_total: lineTotal,
      });
    }

    // Determine delivery charge
    const isFreeDelivery = freeDeliveryThreshold !== null && subtotal >= freeDeliveryThreshold;
    const deliveryFee = delivery.method === "delivery" && !isFreeDelivery ? flatDeliveryFee : 0;
    const total = subtotal + deliveryFee;

    // Temporary tx_ref identifier to insert the row first
    const tempTxRef = `pending-mgh-${crypto.randomUUID()}`;

    // 4. Create Order entry
    const { data: orderRow, error: orderError } = await supabase
      .from("orders")
      .insert({
        customer_name: customer.name,
        customer_email: customer.email,
        customer_phone: customer.phone,
        guest_email: customer.email,
        delivery_method: delivery.method,
        delivery_address: delivery.method === "delivery" ? delivery.address : null,
        delivery_fee: deliveryFee,
        subtotal: subtotal,
        total: total,
        status: "pending_payment",
        tx_ref: tempTxRef,
        order_number: "TEMP", // placeholder, trigger overrides
      })
      .select()
      .single();

    if (orderError || !orderRow) {
      console.error("Order creation database error:", orderError);
      return NextResponse.json(
        { error: { code: "ORDER_CREATION_FAILED", message: "Failed to register order in database." } },
        { status: 500 }
      );
    }

    const orderId = orderRow.id;
    const orderNumber = orderRow.order_number;

    // 5. Create Order Items entries
    const itemsWithOrderId = orderItemsToInsert.map((item) => ({
      ...item,
      order_id: orderId,
    }));

    const { error: itemsError } = await supabase
      .from("order_items")
      .insert(itemsWithOrderId);

    if (itemsError) {
      console.error("Order items insertion error:", itemsError);
      // Clean up order entry if item insertion failed
      await supabase.from("orders").delete().eq("id", orderId);
      return NextResponse.json(
        { error: { code: "ORDER_ITEMS_FAILED", message: "Failed to store order line items." } },
        { status: 500 }
      );
    }

    // 6. Generate final tx_ref using the DB-generated order number
    const numericPart = orderNumber.replace("MGH-", "");
    const randomSuffix = Math.random().toString(36).substring(2, 8).toUpperCase();
    const finalTxRef = `MGH-${numericPart}-${randomSuffix}`;

    // Update order with the final tx_ref
    const { error: txUpdateError } = await supabase
      .from("orders")
      .update({ tx_ref: finalTxRef })
      .eq("id", orderId);

    if (txUpdateError) {
      console.error("Order tx_ref update error:", txUpdateError);
      return NextResponse.json(
        { error: { code: "ORDER_UPDATE_FAILED", message: "Failed to initialize payment reference." } },
        { status: 500 }
      );
    }

    // 7. Request payment link from Flutterwave Standard payment gateway
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    
    const flwResponse = await fetch("https://api.flutterwave.com/v3/payments", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        tx_ref: finalTxRef,
        amount: total.toString(),
        currency: "NGN",
        redirect_url: `${siteUrl}/checkout/success`,
        customer: {
          email: customer.email,
          phonenumber: customer.phone,
          name: customer.name,
        },
        customizations: {
          title: "Maurice Gadgets Hub",
          description: `Payment for Order ${orderNumber}`,
          logo: "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?q=80&w=200&auto=format&fit=crop",
        },
      }),
    });

    const flwData = await flwResponse.json();

    if (!flwResponse.ok || flwData.status !== "success") {
      console.error("Flutterwave payment initialization error:", flwData);
      return NextResponse.json(
        { error: { code: "PAYMENT_GATEWAY_ERROR", message: flwData.message || "Failed to initialize Flutterwave transaction session." } },
        { status: 500 }
      );
    }

    return NextResponse.json({
      payment_link: flwData.data.link,
      order_number: orderNumber,
      tx_ref: finalTxRef,
    });

  } catch (error: any) {
    console.error("Checkout server exception:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_SERVER_ERROR", message: error.message || "An unexpected error occurred." } },
      { status: 500 }
    );
  }
}

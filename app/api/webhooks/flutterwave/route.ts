import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

interface WebhookPayload {
  event: string;
  data: {
    id: number;
    tx_ref: string;
    flw_ref: string;
    amount: number;
    currency: string;
    status: string;
    payment_type: string;
    [key: string]: any;
  };
}

export async function POST(request: Request) {
  try {
    const signature = request.headers.get("verif-hash");
    
    // 1. Verify webhook signature hash matches secret hash
    if (!signature || signature !== process.env.FLW_SECRET_HASH) {
      return NextResponse.json(
        { error: "Unauthorized. Signature mismatch." },
        { status: 401 }
      );
    }

    const payload: WebhookPayload = await request.json();
    const { event, data } = payload;

    // Only process charge.completed events
    if (event !== "charge.completed" || !data) {
      return NextResponse.json({ message: "Ignored event type." }, { status: 200 });
    }

    const flwTxId = data.id.toString();
    const txRef = data.tx_ref;
    const amount = Number(data.amount);
    const currency = data.currency;

    const supabase = createAdminClient();

    // 2. Idempotency Check: Verify if transaction has already been recorded as successful
    const { data: existingTx } = await supabase
      .from("transactions")
      .select("id")
      .eq("flw_transaction_id", flwTxId)
      .eq("status", "successful")
      .maybeSingle();

    if (existingTx) {
      return NextResponse.json({ message: "Transaction already processed successfully." }, { status: 200 });
    }

    // 3. Call Flutterwave API independently server-side to verify transaction authenticity
    const verifyUrl = `https://api.flutterwave.com/v3/transactions/${flwTxId}/verify`;
    const verifyResponse = await fetch(verifyUrl, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
    });

    const verifyData = await verifyResponse.json();

    if (!verifyResponse.ok || verifyData.status !== "success") {
      console.error("Flutterwave API verification call failed:", verifyData);
      return NextResponse.json(
        { error: "Verification failed with payment gateway." },
        { status: 500 }
      );
    }

    const verifiedStatus = verifyData.data.status;
    const verifiedAmount = Number(verifyData.data.amount);
    const verifiedCurrency = verifyData.data.currency;
    const verifiedTxRef = verifyData.data.tx_ref;

    // 4. Query matching order from DB
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("*, order_items(*)")
      .eq("tx_ref", txRef)
      .maybeSingle();

    if (orderError || !order) {
      console.error(`Order matching tx_ref '${txRef}' could not be found:`, orderError);
      return NextResponse.json(
        { error: "Order not found in database." },
        { status: 400 }
      );
    }

    // 5. Cross-check payment parameters to prevent price-tampering
    if (
      verifiedStatus !== "successful" ||
      verifiedTxRef !== txRef ||
      verifiedCurrency !== "NGN" ||
      Math.abs(verifiedAmount - Number(order.total)) > 0.01 // allow tiny floating tolerances
    ) {
      console.error("Payment parameters mismatch. Potential tampering detected:", {
        expected: { total: order.total, txRef, currency: "NGN" },
        received: { amount: verifiedAmount, txRef: verifiedTxRef, currency: verifiedCurrency, status: verifiedStatus },
      });
      
      // Update order status to failed payment
      await supabase.from("orders").update({ status: "payment_failed" }).eq("id", order.id);
      
      // Log failed transaction
      await supabase.from("transactions").insert({
        order_id: order.id,
        flw_transaction_id: flwTxId,
        tx_ref: txRef,
        amount: verifiedAmount,
        currency: verifiedCurrency,
        status: "failed",
        payment_type: data.payment_type || "unknown",
        raw_payload: payload,
      });

      return NextResponse.json({ error: "Payment verification mismatched parameters." }, { status: 400 });
    }

    // If order already marked paid, return OK (idempotency check)
    if (order.status === "paid") {
      return NextResponse.json({ message: "Order already completed." }, { status: 200 });
    }

    // 6. DB Updates (Success flow)
    // Update order paid status
    const { error: orderUpdateError } = await supabase
      .from("orders")
      .update({ status: "paid" })
      .eq("id", order.id);

    if (orderUpdateError) {
      console.error("Error updating order status in webhook:", orderUpdateError);
      return NextResponse.json({ error: "Failed to update order status." }, { status: 500 });
    }

    // Insert transaction audit row
    const { error: txError } = await supabase
      .from("transactions")
      .insert({
        order_id: order.id,
        flw_transaction_id: flwTxId,
        tx_ref: txRef,
        amount: verifiedAmount,
        currency: verifiedCurrency,
        status: "successful",
        payment_type: data.payment_type || "card",
        raw_payload: payload,
      });

    if (txError) {
      console.error("Error logging transaction row:", txError);
    }

    // 7. Atomic stock decrement for each ordered item
    const orderItems = order.order_items || [];
    for (const item of orderItems) {
      const { error: stockError } = await supabase.rpc("decrement_stock", {
        p_product_id: item.product_id,
        p_variant_id: item.variant_id,
        p_quantity: item.quantity,
      });

      if (stockError) {
        console.error(`Failed to decrement stock for product_id: ${item.product_id}, variant_id: ${item.variant_id}:`, stockError);
      }
    }

    return NextResponse.json({ message: "Webhook processed successfully." }, { status: 200 });

  } catch (error: any) {
    console.error("Webhook processing exception:", error);
    return NextResponse.json(
      { error: "Internal server error processing webhook." },
      { status: 500 }
    );
  }
}

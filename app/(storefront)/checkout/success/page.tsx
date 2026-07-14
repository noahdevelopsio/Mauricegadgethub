import { createClient } from "@/lib/supabase/server";
import PaymentVerifier from "@/components/storefront/payment-verifier";
import Link from "next/link";
import { CheckCircle2, ArrowRight, Home, AlertTriangle } from "lucide-react";

interface SuccessPageProps {
  searchParams: Promise<{
    tx_ref?: string;
    status?: string;
    transaction_id?: string;
  }>;
}

export const revalidate = 0; // Always fetch live order records on confirmation page

export default async function CheckoutSuccessPage(props: SuccessPageProps) {
  const searchParams = await props.searchParams;
  const { tx_ref: txRef } = searchParams;

  if (!txRef) {
    return (
      <main className="max-w-md mx-auto py-20 px-6 text-center font-sans">
        <AlertTriangle className="w-10 h-10 text-accent mb-4 mx-auto" />
        <h2 className="text-xl font-semibold text-ink mb-2">Invalid reference</h2>
        <p className="text-gray-500 text-sm mb-6">No transaction reference was provided for verification.</p>
        <Link href="/products" className="btn-primary py-2.5 px-5 text-xs font-semibold uppercase">
          Return to store
        </Link>
      </main>
    );
  }

  let order: any = null;

  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("orders")
      .select("*, order_items(*)")
      .eq("tx_ref", txRef)
      .maybeSingle();

    if (data) {
      order = data;
    }
  } catch (error) {
    console.error("Error retrieving order in CheckoutSuccessPage:", error);
  }

  if (!order) {
    return (
      <main className="max-w-md mx-auto py-20 px-6 text-center font-sans">
        <AlertTriangle className="w-10 h-10 text-accent mb-4 mx-auto" />
        <h2 className="text-xl font-semibold text-ink mb-2">Order not found</h2>
        <p className="text-gray-500 text-sm mb-6">The order matching reference '{txRef}' could not be located in our records.</p>
        <Link href="/products" className="btn-primary py-2.5 px-5 text-xs font-semibold uppercase">
          Return to store
        </Link>
      </main>
    );
  }

  // 1. Webhook delay/pending state
  if (order.status !== "paid") {
    return (
      <main className="max-w-7xl mx-auto py-20 px-6 md:px-12 bg-canvas">
        <PaymentVerifier txRef={txRef} orderNumber={order.order_number} />
      </main>
    );
  }

  // 2. Success state (paid)
  const orderItems = order.order_items || [];

  return (
    <main className="max-w-3xl mx-auto py-16 px-6 bg-canvas font-sans">
      <div className="border border-gray-300/60 p-8 md:p-12 bg-paper rounded-2xl shadow-card text-center flex flex-col items-center">
        
        {/* Success icon */}
        <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center text-success border border-success/20 mb-6">
          <CheckCircle2 className="w-8 h-8" />
        </div>

        <span className="text-xs uppercase font-extrabold tracking-widest text-success font-sans">Payment Completed</span>
        <h1 className="text-3xl md:text-4xl font-sans font-semibold tracking-tight text-ink mt-2 mb-2">
          Thank you for your order
        </h1>
        <p className="text-gray-500 text-sm max-w-md leading-relaxed mb-8">
          Your payment of <strong>₦{Number(order.total).toLocaleString()}</strong> was verified. We've sent a receipt details summary to your email.
        </p>

        {/* Order Details box */}
        <div className="w-full bg-canvas/40 border border-gray-300/30 p-6 rounded-xl flex flex-col gap-4 text-left text-xs text-gray-500 font-sans mb-8">
          <div className="flex justify-between font-bold text-ink border-b border-gray-300/20 pb-2 mb-1">
            <span>Order Reference:</span>
            <span>{order.order_number}</span>
          </div>

          <div className="flex justify-between">
            <span>Customer Name:</span>
            <span className="text-ink font-semibold">{order.customer_name}</span>
          </div>
          
          <div className="flex justify-between">
            <span>Delivery Method:</span>
            <span className="text-ink font-semibold uppercase">{order.delivery_method}</span>
          </div>

          {order.delivery_method === "delivery" && order.delivery_address && (
            <div className="flex flex-col gap-1 border-t border-gray-300/10 pt-2.5">
              <span className="font-semibold text-gray-400">Shipping Address:</span>
              <span className="text-ink font-semibold leading-relaxed">{order.delivery_address}</span>
            </div>
          )}

          <div className="hairline-divider" />

          {/* Items Summary list */}
          <div className="flex flex-col gap-2">
            <span className="font-semibold text-gray-400">Purchased Items:</span>
            {orderItems.map((item: any) => (
              <div key={item.id} className="flex justify-between items-center text-xs font-semibold text-ink pl-1">
                <span>{item.product_name_snapshot} × {item.quantity}</span>
                <span>₦{Number(item.line_total).toLocaleString()}</span>
              </div>
            ))}
          </div>

          <div className="hairline-divider" />

          <div className="flex justify-between items-baseline font-sans text-sm font-semibold">
            <span className="text-ink">Total Paid:</span>
            <span className="text-base text-accent font-bold">₦{Number(order.total).toLocaleString()}</span>
          </div>
        </div>

        {/* Actions navigation links */}
        <div className="flex flex-col sm:flex-row gap-3 w-full">
          <Link
            href={`/orders/track?order_number=${order.order_number}`}
            className="btn-primary py-3 text-xs font-semibold flex-grow flex items-center justify-center gap-1.5"
          >
            <span>Track your order</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
          
          <Link
            href="/"
            className="btn-secondary py-3 text-xs font-semibold flex-grow flex items-center justify-center gap-1.5"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Go to homepage</span>
          </Link>
        </div>

      </div>
    </main>
  );
}

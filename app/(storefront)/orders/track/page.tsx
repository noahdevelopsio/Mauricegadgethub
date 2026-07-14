import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { FileSearch, Truck, ShieldAlert, Package, Calendar } from "lucide-react";

interface TrackPageProps {
  searchParams: Promise<{
    order_number?: string;
    email?: string;
  }>;
}

export const revalidate = 0; // Always retrieve live tracking status

export default async function OrderTrackPage(props: TrackPageProps) {
  const searchParams = await props.searchParams;
  const { order_number: orderNumber, email } = searchParams;

  let order: any = null;
  let lookupAttempted = false;
  let lookupFailed = false;

  if (orderNumber && email) {
    lookupAttempted = true;
    try {
      const supabase = await createClient();
      
      const { data } = await supabase
        .from("orders")
        .select("*, order_items(*)")
        .eq("order_number", orderNumber.trim())
        .or(`customer_email.eq.${email.trim().toLowerCase()},guest_email.eq.${email.trim().toLowerCase()}`)
        .maybeSingle();

      if (data) {
        order = data;
      } else {
        lookupFailed = true;
      }
    } catch (error) {
      console.error("Error looking up order tracking info:", error);
      lookupFailed = true;
    }
  }

  // Status mapping helper
  const getStatusDetails = (status: string) => {
    switch (status) {
      case "pending_payment":
        return { label: "Pending Payment", color: "text-accent bg-accent/5 border-accent/20", desc: "Order submitted. Awaiting checkout completion." };
      case "paid":
        return { label: "Paid", color: "text-success bg-success/5 border-success/20", desc: "Payment confirmed. Awaiting order processing." };
      case "processing":
        return { label: "Processing", color: "text-accent bg-accent/5 border-accent/20", desc: "Our team is picking and packaging your gadgets." };
      case "shipped":
        return { label: "Shipped / Dispatched", color: "text-ink bg-gray-300/10 border-gray-300/30", desc: "Order has been dispatched from our showroom." };
      case "delivered":
        return { label: "Delivered", color: "text-success bg-success/5 border-success/20", desc: "Handed over to recipient. Thank you for shopping with us!" };
      case "cancelled":
        return { label: "Cancelled", color: "text-gray-500 bg-gray-100/50 border-gray-300", desc: "Order has been cancelled." };
      case "refunded":
        return { label: "Refunded", color: "text-gray-500 bg-gray-100/50 border-gray-300", desc: "Order amount refunded." };
      default:
        return { label: "Unknown", color: "text-gray-500 bg-gray-100/50 border-gray-300", desc: "Please contact support." };
    }
  };

  return (
    <main className="max-w-4xl mx-auto py-16 px-6 md:px-12 font-sans">
      <div className="border-b border-gray-300 pb-6 mb-10">
        <span className="text-xs uppercase font-extrabold tracking-widest text-accent font-sans">Support</span>
        <h1 className="text-4xl font-sans font-semibold tracking-tight text-ink mt-2">Track order</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-10 items-start">
        
        {/* LOOKUP FORM COL */}
        <section className="md:col-span-5 border border-gray-300/60 p-6 bg-paper rounded-2xl shadow-card">
          <h2 className="font-sans font-semibold text-lg text-ink mb-1.5 flex items-center gap-1.5">
            <FileSearch className="w-5 h-5 text-accent" />
            <span>Order search</span>
          </h2>
          <p className="text-gray-500 text-xs mb-6">
            Enter your order identifier and email to fetch live shipment updates.
          </p>

          {lookupFailed && (
            <div className="bg-error/10 border border-error text-error text-xs font-medium p-3.5 rounded-xl mb-6 flex gap-1.5 items-start">
              <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
              <span>No order matches found. Please confirm details.</span>
            </div>
          )}

          <form action="/orders/track" method="GET" className="flex flex-col gap-4 text-left">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="order_number" className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Order Number</label>
              <input
                id="order_number"
                name="order_number"
                type="text"
                required
                defaultValue={orderNumber || ""}
                placeholder="MGH-000123"
                className="bg-canvas border border-gray-300 p-3.5 font-sans text-xs focus:outline-none focus:ring-2 focus:ring-accent/15 focus:border-accent rounded-xl text-ink"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="email" className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Email Address</label>
              <input
                id="email"
                name="email"
                type="email"
                required
                defaultValue={email || ""}
                placeholder="customer@example.com"
                className="bg-canvas border border-gray-300 p-3.5 font-sans text-xs focus:outline-none focus:ring-2 focus:ring-accent/15 focus:border-accent rounded-xl text-ink"
              />
            </div>

            <button
              type="submit"
              className="btn-primary py-3.5 text-xs font-semibold uppercase tracking-wider text-center mt-2 w-full"
            >
              Track Order
            </button>
          </form>
        </section>

        {/* RESULTS COL */}
        <section className="md:col-span-7">
          {!lookupAttempted ? (
            <div className="border border-dashed border-gray-300/80 p-12 text-center rounded-2xl bg-paper/50 flex flex-col items-center">
              <Truck className="w-10 h-10 text-gray-400 mb-3" />
              <h3 className="font-sans font-semibold text-sm text-ink mb-1">Awaiting details</h3>
              <p className="text-gray-500 text-xs max-w-xs font-sans">
                Fill out the order lookup form to trace your shipping updates and details.
              </p>
            </div>
          ) : order ? (
            <div className="flex flex-col gap-6">
              
              {/* Order Status Display */}
              <div className="border border-gray-300/60 p-6 bg-paper rounded-2xl shadow-card flex flex-col gap-4 text-left">
                <div className="flex justify-between items-center flex-wrap gap-2 pb-3 border-b border-gray-100">
                  <div className="flex items-center gap-1.5 text-xs text-gray-500 font-bold uppercase tracking-wider">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span>Date: {new Date(order.created_at).toLocaleDateString("en-NG", { year: "numeric", month: "short", day: "numeric" })}</span>
                  </div>
                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border uppercase ${getStatusDetails(order.status).color}`}>
                    {getStatusDetails(order.status).label}
                  </span>
                </div>

                <div className="flex gap-3.5 items-start mt-2">
                  <div className="w-10 h-10 bg-accent/10 rounded-full flex items-center justify-center text-accent shrink-0 border border-accent/20">
                    🚚
                  </div>
                  <div>
                    <h3 className="font-sans font-semibold text-sm text-ink">Status update</h3>
                    <p className="text-gray-500 text-xs mt-0.5 leading-relaxed">
                      {getStatusDetails(order.status).desc}
                    </p>
                  </div>
                </div>

                {order.admin_notes && (
                  <div className="bg-canvas/50 p-4 rounded-xl text-xs text-gray-500 leading-relaxed border border-gray-300/25 mt-2">
                    💬 <strong>Staff notes:</strong> {order.admin_notes}
                  </div>
                )}
              </div>

              {/* Order Items & Summary */}
              <div className="border border-gray-300/60 p-6 bg-paper rounded-2xl shadow-card flex flex-col gap-4 text-left font-sans">
                <h3 className="font-sans font-semibold text-sm text-ink border-b border-gray-100 pb-2.5">
                  Order info
                </h3>

                <div className="flex flex-col gap-3">
                  {order.order_items?.map((item: any) => (
                    <div key={item.id} className="flex justify-between items-center text-xs text-gray-600 pl-1 font-medium">
                      <span>{item.product_name_snapshot} × {item.quantity}</span>
                      <span className="text-ink font-semibold">₦{Number(item.line_total).toLocaleString()}</span>
                    </div>
                  ))}
                </div>

                <div className="hairline-divider my-1" />

                <div className="flex flex-col gap-2.5 text-xs text-gray-500 font-medium">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span className="text-ink font-semibold">₦{Number(order.subtotal).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping fee:</span>
                    <span className="text-ink font-semibold">
                      {Number(order.delivery_fee) === 0 ? "Free" : `₦${Number(order.delivery_fee).toLocaleString()}`}
                    </span>
                  </div>
                </div>

                <div className="hairline-divider my-1" />

                <div className="flex justify-between items-baseline font-sans text-sm font-semibold">
                  <span className="text-ink">Total paid:</span>
                  <span className="text-base text-accent font-bold">₦{Number(order.total).toLocaleString()}</span>
                </div>
              </div>

            </div>
          ) : (
            <div className="border border-dashed border-error/50 p-12 text-center rounded-2xl bg-error/5 flex flex-col items-center">
              <ShieldAlert className="w-10 h-10 text-error mb-3" />
              <h3 className="font-sans font-semibold text-sm text-error mb-1">Search failed</h3>
              <p className="text-gray-500 text-xs max-w-xs font-sans">
                We couldn't retrieve order records matching the details. Please double-check inputs.
              </p>
            </div>
          )}
        </section>

      </div>
    </main>
  );
}

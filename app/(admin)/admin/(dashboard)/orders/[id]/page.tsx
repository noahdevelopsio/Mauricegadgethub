import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import OrderDetailsEditor from "@/components/admin/order-details-editor";
import { ArrowLeft, User, Truck, Receipt, Calendar } from "lucide-react";

interface OrderDetailsPageProps {
  params: Promise<{ id: string }>;
}

export const revalidate = 0; // Always query live order updates on detail page loads

export default async function AdminOrderDetailPage(props: OrderDetailsPageProps) {
  const params = await props.params;
  const { id } = params;

  let order: any = null;
  let transactions: any[] = [];

  try {
    const supabase = await createClient();

    // 1. Fetch order and associated line items
    const { data: orderData } = await supabase
      .from("orders")
      .select("*, order_items(*)")
      .eq("id", id)
      .maybeSingle();

    if (!orderData) {
      return notFound();
    }
    order = orderData;

    // 2. Fetch order payment transactions
    const { data: txData } = await supabase
      .from("transactions")
      .select("*")
      .eq("order_id", id);

    if (txData) {
      transactions = txData;
    }

  } catch (error) {
    console.error(`Error loading order details page [id=${id}]:`, error);
    return notFound();
  }

  const orderItems = order.order_items || [];

  return (
    <div className="flex flex-col gap-8 text-left font-sans pb-16">
      
      {/* HEADER AND BACK BUTTON */}
      <div>
        <Link href="/admin/orders" className="inline-flex items-center gap-1.5 text-xs font-semibold text-accent hover:text-accent-dark transition-colors mb-4">
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to orders</span>
        </Link>
        
        <div className="flex justify-between items-center flex-wrap gap-3">
          <div>
            <span className="text-xs uppercase font-extrabold tracking-widest text-accent">Order Log</span>
            <h1 className="text-3xl font-sans font-semibold tracking-tight text-ink mt-2">
              Details: {order.order_number}
            </h1>
          </div>
          
          <div className="flex items-center gap-2 text-xs text-gray-500 font-bold uppercase tracking-wider bg-paper border border-gray-300/60 py-2.5 px-4 rounded-xl shadow-card">
            <Calendar className="w-4 h-4 text-gray-400" />
            <span>Placed: {new Date(order.created_at).toLocaleDateString("en-NG", { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: ORDER ITEMS & TOTALS */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          
          {/* Order Items Table */}
          <div className="border border-gray-300/60 bg-paper rounded-2xl overflow-hidden shadow-card text-left font-sans">
            <div className="p-6 border-b border-gray-100">
              <h3 className="font-sans font-semibold text-sm text-ink">Line items</h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs font-sans">
                <thead>
                  <tr className="bg-canvas border-b border-gray-300 text-gray-500 uppercase font-bold tracking-wider">
                    <th className="p-4">Item description</th>
                    <th className="p-4">Unit price</th>
                    <th className="p-4 text-center">Quantity</th>
                    <th className="p-4 text-right">Line total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-300/30 text-gray-700 font-medium">
                  {orderItems.map((item: any) => (
                    <tr key={item.id} className="hover:bg-canvas/30 transition-colors">
                      <td className="p-4 font-semibold text-ink">{item.product_name_snapshot}</td>
                      <td className="p-4 text-gray-500">₦{Number(item.unit_price_snapshot).toLocaleString()}</td>
                      <td className="p-4 text-center font-semibold text-ink">{item.quantity}</td>
                      <td className="p-4 text-right font-bold text-ink">₦{Number(item.line_total).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Calculations summaries */}
            <div className="p-6 bg-canvas/30 border-t border-gray-100 flex flex-col items-end gap-3 font-sans text-xs text-gray-500 font-medium">
              <div className="w-full max-w-xs flex justify-between">
                <span>Subtotal:</span>
                <span className="text-ink font-semibold">₦{Number(order.subtotal).toLocaleString()}</span>
              </div>
              
              <div className="w-full max-w-xs flex justify-between">
                <span>Shipping Fee:</span>
                <span className="text-ink font-semibold">
                  {Number(order.delivery_fee) === 0 ? "Free" : `₦${Number(order.delivery_fee).toLocaleString()}`}
                </span>
              </div>

              <div className="w-full max-w-xs hairline-divider my-1" />

              <div className="w-full max-w-xs flex justify-between items-baseline text-sm font-semibold">
                <span className="text-ink">Total sum:</span>
                <span className="text-base text-accent font-bold">₦{Number(order.total).toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Payment transaction logs */}
          <div className="border border-gray-300/60 p-6 bg-paper rounded-2xl shadow-card flex flex-col gap-4 text-left font-sans">
            <h3 className="font-sans font-semibold text-sm text-ink border-b border-gray-100 pb-2.5 flex items-center gap-1.5">
              <Receipt className="w-4 h-4 text-gray-400" />
              <span>Gateway transactions logs</span>
            </h3>

            {transactions.length === 0 ? (
              <div className="py-4 text-center text-gray-400 text-xs">
                No payment transactions log rows recorded.
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {transactions.map((tx) => (
                  <div key={tx.id} className="bg-canvas p-4 rounded-xl border border-gray-300/30 text-xs text-gray-500 leading-relaxed font-medium flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                    <div className="flex flex-col gap-1 text-left">
                      <div className="font-semibold text-ink">Tx ID: {tx.flw_transaction_id}</div>
                      <div>Ref Code: <span className="font-bold text-gray-700">{tx.tx_ref}</span></div>
                      <div className="text-[10px] text-gray-400">Date: {new Date(tx.created_at).toLocaleString()}</div>
                    </div>
                    <div className="flex flex-col items-start sm:items-end gap-1.5">
                      <span className="font-bold text-ink">₦{Number(tx.amount).toLocaleString()}</span>
                      <span className={`inline-block px-2 py-0.5 rounded-full border text-[9px] font-extrabold uppercase ${
                        tx.status === "successful"
                          ? "text-success bg-success/5 border-success/20"
                          : "text-error bg-error/5 border-error/20"
                      }`}>
                        {tx.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* RIGHT COLUMN: CUSTOMER, DELIVERY & EDIT CONTROLS */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          
          {/* Customer Metadata Card */}
          <div className="border border-gray-300/60 p-6 bg-paper rounded-2xl shadow-card flex flex-col gap-4 text-left font-sans">
            <h3 className="font-sans font-semibold text-sm text-ink border-b border-gray-100 pb-2.5 flex items-center gap-1.5">
              <User className="w-4 h-4 text-gray-400" />
              <span>Customer details</span>
            </h3>

            <div className="flex flex-col gap-3.5 text-xs font-semibold text-ink">
              <div className="flex flex-col gap-0.5">
                <span className="text-[10px] text-gray-400 uppercase tracking-wider">Full Name</span>
                <span>{order.customer_name}</span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-[10px] text-gray-400 uppercase tracking-wider">Email Address</span>
                <span className="lowercase">{order.customer_email}</span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-[10px] text-gray-400 uppercase tracking-wider">Phone Number</span>
                <span>{order.customer_phone}</span>
              </div>
            </div>
          </div>

          {/* Delivery Parameters Card */}
          <div className="border border-gray-300/60 p-6 bg-paper rounded-2xl shadow-card flex flex-col gap-4 text-left font-sans">
            <h3 className="font-sans font-semibold text-sm text-ink border-b border-gray-100 pb-2.5 flex items-center gap-1.5">
              <Truck className="w-4 h-4 text-gray-400" />
              <span>Delivery parameters</span>
            </h3>

            <div className="flex flex-col gap-3.5 text-xs font-semibold text-ink">
              <div className="flex flex-col gap-0.5">
                <span className="text-[10px] text-gray-400 uppercase tracking-wider">Delivery Method</span>
                <span className="uppercase">{order.delivery_method}</span>
              </div>
              {order.delivery_method === "delivery" && (
                <div className="flex flex-col gap-0.5 leading-relaxed">
                  <span className="text-[10px] text-gray-400 uppercase tracking-wider">Shipping Address</span>
                  <span>{order.delivery_address || "—"}</span>
                </div>
              )}
            </div>
          </div>

          {/* Order Action Form */}
          <OrderDetailsEditor
            orderId={order.id}
            initialStatus={order.status}
            initialAdminNotes={order.admin_notes}
          />

        </div>

      </div>

    </div>
  );
}

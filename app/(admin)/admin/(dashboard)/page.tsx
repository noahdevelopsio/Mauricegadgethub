import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { CreditCard, ShoppingCart, RefreshCw, AlertTriangle, ArrowRight } from "lucide-react";

export const revalidate = 0; // Always fetch live stats on dashboard reload

export default async function AdminDashboardPage() {
  let todaySales = 0;
  let totalOrdersCount = 0;
  let pendingFulfillmentCount = 0;
  let lowStockCount = 0;
  let recentOrders: any[] = [];

  try {
    const supabase = await createClient();

    // 1. Fetch Today's Revenue (Total paid orders today)
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    
    const { data: todayPaidData } = await supabase
      .from("orders")
      .select("total")
      .eq("status", "paid")
      .gte("created_at", todayStart.toISOString());

    if (todayPaidData) {
      todaySales = todayPaidData.reduce((acc, o) => acc + Number(o.total), 0);
    }

    // 2. Fetch Total Orders volume count
    const { count: ordersCount } = await supabase
      .from("orders")
      .select("id", { count: "exact", head: true });
    
    if (ordersCount) totalOrdersCount = ordersCount;

    // 3. Fetch Pending Fulfillment count (Paid or Processing orders)
    const { count: pendingCount } = await supabase
      .from("orders")
      .select("id", { count: "exact", head: true })
      .in("status", ["paid", "processing"]);

    if (pendingCount) pendingFulfillmentCount = pendingCount;

    // 4. Fetch Low Stock Alerts count (stock <= 5)
    const { data: lowBaseProducts } = await supabase
      .from("products")
      .select("id")
      .eq("has_variants", false)
      .lte("stock_quantity", 5);

    const { data: lowVariants } = await supabase
      .from("product_variants")
      .select("id")
      .lte("stock_quantity", 5);

    lowStockCount = (lowBaseProducts?.length || 0) + (lowVariants?.length || 0);

    // 5. Fetch 5 Recent Orders
    const { data: recentData } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(5);

    if (recentData) recentOrders = recentData;

  } catch (error) {
    console.error("Error loading dashboard metrics:", error);
  }

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "paid":
        return "text-success bg-success/5 border-success/20";
      case "pending_payment":
        return "text-accent bg-accent/5 border-accent/20";
      case "processing":
        return "text-accent bg-accent/5 border-accent/20";
      case "shipped":
        return "text-ink bg-gray-300/10 border-gray-300/30";
      case "delivered":
        return "text-success bg-success/5 border-success/20";
      default:
        return "text-gray-500 bg-gray-100/50 border-gray-300";
    }
  };

  return (
    <div className="flex flex-col gap-8 text-left font-sans">
      <div>
        <span className="text-xs uppercase font-extrabold tracking-widest text-accent">Dashboard</span>
        <h1 className="text-3xl font-sans font-semibold tracking-tight text-ink mt-2">Overview</h1>
      </div>

      {/* METRIC CARDS GRID */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Today's Sales */}
        <div className="border border-gray-300/60 p-6 bg-paper rounded-2xl shadow-card flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Today's Sales</span>
            <span className="text-xl font-bold text-ink">₦{todaySales.toLocaleString()}</span>
          </div>
          <div className="w-10 h-10 bg-success/10 rounded-full flex items-center justify-center text-success border border-success/20">
            <CreditCard className="w-5 h-5" />
          </div>
        </div>

        {/* Total Orders */}
        <div className="border border-gray-300/60 p-6 bg-paper rounded-2xl shadow-card flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Total Orders</span>
            <span className="text-xl font-bold text-ink">{totalOrdersCount}</span>
          </div>
          <div className="w-10 h-10 bg-accent/10 rounded-full flex items-center justify-center text-accent border border-accent/20">
            <ShoppingCart className="w-5 h-5" />
          </div>
        </div>

        {/* Pending Fulfillment */}
        <div className="border border-gray-300/60 p-6 bg-paper rounded-2xl shadow-card flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Pending Fulfillment</span>
            <span className="text-xl font-bold text-ink">{pendingFulfillmentCount}</span>
          </div>
          <div className="w-10 h-10 bg-accent/10 rounded-full flex items-center justify-center text-accent border border-accent/20">
            <RefreshCw className="w-5 h-5" />
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="border border-gray-300/60 p-6 bg-paper rounded-2xl shadow-card flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Low Stock alerts</span>
            <span className={`text-xl font-bold ${lowStockCount > 0 ? "text-accent" : "text-ink"}`}>
              {lowStockCount}
            </span>
          </div>
          <div className={`w-10 h-10 rounded-full flex items-center justify-center border ${
            lowStockCount > 0 
              ? "bg-accent/10 text-accent border-accent/20 animate-pulse" 
              : "bg-gray-300/10 text-gray-400 border-gray-300/30"
          }`}>
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>

      </section>

      {/* RECENT ORDERS TABLE */}
      <section className="border border-gray-300/60 bg-paper rounded-2xl overflow-hidden shadow-card">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-sans font-semibold text-sm text-ink">Recent orders</h3>
          <Link href="/admin/orders" className="text-xs font-semibold text-accent hover:text-accent-dark transition-colors flex items-center gap-1">
            <span>Manage all</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <div className="p-12 text-center text-gray-400 text-sm">
            No orders recorded in database yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs font-sans">
              <thead>
                <tr className="bg-canvas border-b border-gray-300 text-gray-500 uppercase font-bold tracking-wider">
                  <th className="p-4">Order Ref</th>
                  <th className="p-4">Customer</th>
                  <th className="p-4">Amount</th>
                  <th className="p-4 text-center">Status</th>
                  <th className="p-4">Date</th>
                  <th className="p-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-300/30 text-gray-700 font-medium">
                {recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-canvas/30 transition-colors">
                    <td className="p-4 font-semibold text-ink">{order.order_number}</td>
                    <td className="p-4">{order.customer_name}</td>
                    <td className="p-4">₦{Number(order.total).toLocaleString()}</td>
                    <td className="p-4 text-center">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full border text-[9px] font-bold uppercase ${getStatusStyle(order.status)}`}>
                        {order.status.replace("_", " ")}
                      </span>
                    </td>
                    <td className="p-4">
                      {new Date(order.created_at).toLocaleDateString("en-NG", { month: "short", day: "numeric" })}
                    </td>
                    <td className="p-4 text-right">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="text-xs font-semibold text-accent hover:text-accent-dark hover:underline"
                      >
                        Details
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

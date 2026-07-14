import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Search, Eye } from "lucide-react";

interface SearchParams {
  search?: string;
  status?: string;
}

export const revalidate = 0; // Always retrieve live orders data

export default async function AdminOrdersPage(props: {
  searchParams: Promise<SearchParams>;
}) {
  const searchParams = await props.searchParams;
  const { search, status } = searchParams;

  let orders: any[] = [];

  try {
    const supabase = await createClient();
    let query = supabase.from("orders").select("*");

    if (search) {
      query = query.or(`order_number.ilike.%${search}%,customer_name.ilike.%${search}%,customer_email.ilike.%${search}%`);
    }

    if (status && status !== "all") {
      query = query.eq("status", status);
    }

    // Order by newest created
    query = query.order("created_at", { ascending: false });

    const { data } = await query;
    if (data) {
      orders = data;
    }
  } catch (error) {
    console.error("Error loading admin orders list:", error);
  }

  const getStatusStyle = (orderStatus: string) => {
    switch (orderStatus) {
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
      case "cancelled":
        return "text-gray-500 bg-gray-100/50 border-gray-300";
      default:
        return "text-gray-500 bg-gray-100/50 border-gray-300";
    }
  };

  const statuses = [
    { label: "All Statuses", value: "all" },
    { label: "Pending Payment", value: "pending_payment" },
    { label: "Paid", value: "paid" },
    { label: "Processing", value: "processing" },
    { label: "Shipped", value: "shipped" },
    { label: "Delivered", value: "delivered" },
    { label: "Cancelled", value: "cancelled" },
  ];

  return (
    <div className="flex flex-col gap-8 text-left font-sans">
      <div>
        <span className="text-xs uppercase font-extrabold tracking-widest text-accent">Fulfillment</span>
        <h1 className="text-3xl font-sans font-semibold tracking-tight text-ink mt-2">Orders</h1>
      </div>

      {/* FILTERS TOOLBAR */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-paper p-4 rounded-2xl border border-gray-300/60 shadow-card">
        
        {/* Search */}
        <form action="/admin/orders" method="GET" className="relative w-full max-w-sm flex-grow">
          <input
            type="text"
            name="search"
            defaultValue={search || ""}
            placeholder="Search by order #, name, or email..."
            className="bg-canvas border border-gray-300 py-2 px-4 pl-10 rounded-full font-sans text-xs w-full focus:bg-paper focus:outline-none focus:ring-2 focus:ring-accent/15 focus:border-accent transition-all text-ink"
          />
          <button type="submit" className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-accent">
            <Search className="w-3.5 h-3.5" />
          </button>
        </form>

        {/* Status selection form */}
        <form action="/admin/orders" method="GET" className="flex items-center gap-2">
          {search && <input type="hidden" name="search" value={search} />}
          <select
            name="status"
            defaultValue={status || "all"}
            onChange={(e) => e.target.form?.submit()}
            className="bg-canvas border border-gray-300 py-2 px-4 rounded-full font-sans text-xs focus:outline-none focus:ring-2 focus:ring-accent/15 focus:border-accent text-ink"
          >
            {statuses.map((st) => (
              <option key={st.value} value={st.value}>{st.label}</option>
            ))}
          </select>
        </form>

      </div>

      {/* ORDERS TABLE */}
      <div className="border border-gray-300/60 bg-paper rounded-2xl overflow-hidden shadow-card">
        {orders.length === 0 ? (
          <div className="p-16 text-center flex flex-col items-center">
            <span className="text-3xl mb-4">🛒</span>
            <h3 className="font-sans font-semibold text-base text-ink mb-1">No orders located</h3>
            <p className="text-gray-400 text-xs max-w-sm">
              We couldn't locate any orders matching your criteria.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs font-sans">
              <thead>
                <tr className="bg-canvas border-b border-gray-300 text-gray-500 uppercase font-bold tracking-wider">
                  <th className="p-4">Order Ref</th>
                  <th className="p-4">Customer info</th>
                  <th className="p-4">Delivery</th>
                  <th className="p-4">Subtotal</th>
                  <th className="p-4">Total</th>
                  <th className="p-4 text-center">Status</th>
                  <th className="p-4">Created date</th>
                  <th className="p-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-300/30 text-gray-700 font-medium">
                {orders.map((order) => {
                  return (
                    <tr key={order.id} className="hover:bg-canvas/30 transition-colors">
                      <td className="p-4 font-semibold text-ink">{order.order_number}</td>
                      <td className="p-4 flex flex-col">
                        <span className="text-ink font-semibold">{order.customer_name}</span>
                        <span className="text-[10px] text-gray-400 font-medium mt-0.5">{order.customer_email}</span>
                      </td>
                      <td className="p-4">
                        <span className="uppercase text-[10px] font-bold text-gray-500 bg-canvas px-2 py-0.5 rounded-full border border-gray-300/40">
                          {order.delivery_method}
                        </span>
                      </td>
                      <td className="p-4 text-gray-500">₦{Number(order.subtotal).toLocaleString()}</td>
                      <td className="p-4 font-bold text-ink">₦{Number(order.total).toLocaleString()}</td>
                      <td className="p-4 text-center">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full border text-[9px] font-bold uppercase ${getStatusStyle(order.status)}`}>
                          {order.status.replace("_", " ")}
                        </span>
                      </td>
                      <td className="p-4 text-gray-500">
                        {new Date(order.created_at).toLocaleDateString("en-NG", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </td>
                      <td className="p-4 text-right">
                        <Link
                          href={`/admin/orders/${order.id}`}
                          className="inline-flex items-center gap-1 text-gray-400 hover:text-accent transition-colors p-1.5 rounded-lg border border-transparent hover:border-gray-200 hover:bg-canvas"
                          title="View details"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

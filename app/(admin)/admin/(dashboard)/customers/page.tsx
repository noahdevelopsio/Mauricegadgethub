import { createClient } from "@/lib/supabase/server";
import { Users, Phone, Mail, ShoppingBag } from "lucide-react";

interface SearchParams {
  search?: string;
  type?: string;
}

export const revalidate = 0; // Retrieve live customer statistics on load

interface CustomerAgg {
  email: string;
  name: string;
  phone: string;
  type: "Registered" | "Guest";
  orderCount: number;
  totalSpent: number;
  joinedAt: string;
}

export default async function AdminCustomersPage(props: {
  searchParams: Promise<SearchParams>;
}) {
  const searchParams = await props.searchParams;
  const { search, type } = searchParams;

  let customers: CustomerAgg[] = [];

  try {
    const supabase = await createClient();

    // 1. Fetch registered profiles
    const { data: profiles } = await supabase
      .from("profiles")
      .select("*")
      .eq("role", "customer");

    // 2. Fetch all orders to compute transaction totals and guest customer records
    const { data: orders } = await supabase
      .from("orders")
      .select("*");

    const customerMap = new Map<string, CustomerAgg>();

    // 3. Populate unique users from order listings
    if (orders) {
      orders.forEach((o) => {
        // Fallback for guest checkout or null emails
        const email = o.customer_email || o.guest_email || `guest-${o.id}@mgh.com`;
        const isRegistered = !!o.user_id;
        const orderTotal = Number(o.total || 0);
        const isPaid = ["paid", "processing", "shipped", "delivered"].includes(o.status);

        if (customerMap.has(email)) {
          const existing = customerMap.get(email)!;
          existing.orderCount += 1;
          if (isPaid) {
            existing.totalSpent += orderTotal;
          }
          if (!existing.phone && o.customer_phone) existing.phone = o.customer_phone;
          if (o.customer_name && (!existing.name || existing.name === "Unknown Customer")) {
            existing.name = o.customer_name;
          }
          if (new Date(o.created_at) < new Date(existing.joinedAt)) {
            existing.joinedAt = o.created_at;
          }
          if (isRegistered) {
            existing.type = "Registered";
          }
        } else {
          customerMap.set(email, {
            email,
            name: o.customer_name || "Unknown Customer",
            phone: o.customer_phone || "N/A",
            type: isRegistered ? "Registered" : "Guest",
            orderCount: 1,
            totalSpent: isPaid ? orderTotal : 0,
            joinedAt: o.created_at,
          });
        }
      });
    }

    // 4. Add registered profiles who have not placed an order yet
    if (profiles) {
      profiles.forEach((p) => {
        const hasOrder = orders ? orders.some((o) => o.user_id === p.id) : false;
        if (!hasOrder) {
          const fakeEmailKey = `reg-${p.id}@mgh-user.com`;
          customerMap.set(fakeEmailKey, {
            email: "No email (Awaiting purchase)",
            name: p.full_name || "New Registered User",
            phone: p.phone || "N/A",
            type: "Registered",
            orderCount: 0,
            totalSpent: 0,
            joinedAt: p.created_at,
          });
        }
      });
    }

    // 5. Convert map to array and apply text filters
    customers = Array.from(customerMap.values());

    if (search) {
      const term = search.toLowerCase();
      customers = customers.filter(
        (c) =>
          c.name.toLowerCase().includes(term) ||
          c.email.toLowerCase().includes(term) ||
          c.phone.toLowerCase().includes(term)
      );
    }

    if (type && type !== "all") {
      customers = customers.filter((c) => c.type.toLowerCase() === type.toLowerCase());
    }

    // Sort by order count or purchase date
    customers.sort((a, b) => b.orderCount - a.orderCount || new Date(b.joinedAt).getTime() - new Date(a.joinedAt).getTime());

  } catch (error) {
    console.error("Error loading customer records:", error);
  }

  return (
    <div className="flex flex-col gap-8 text-left font-sans">
      <div>
        <span className="text-xs uppercase font-extrabold tracking-widest text-accent">Audience</span>
        <h1 className="text-3xl font-sans font-semibold tracking-tight text-ink mt-2">Customers</h1>
      </div>

      {/* SEARCH AND FILTERS */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-paper p-4 rounded-2xl border border-gray-300/60 shadow-card">
        
        {/* Search Input */}
        <form action="/admin/customers" method="GET" className="relative w-full max-w-sm flex-grow">
          <input
            type="text"
            name="search"
            defaultValue={search || ""}
            placeholder="Search by name, email, or phone..."
            className="bg-canvas border border-gray-300 py-2 px-4 pl-10 rounded-full font-sans text-xs w-full focus:bg-paper focus:outline-none focus:ring-2 focus:ring-accent/15 focus:border-accent transition-all text-ink"
          />
          <Users className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 w-3.5 h-3.5" />
        </form>

        {/* Customer Type Filter */}
        <form action="/admin/customers" method="GET" className="flex items-center gap-2">
          {search && <input type="hidden" name="search" value={search} />}
          <select
            name="type"
            defaultValue={type || "all"}
            onChange={(e) => e.target.form?.submit()}
            className="bg-canvas border border-gray-300 py-2 px-4 rounded-full font-sans text-xs text-ink focus:outline-none focus:ring-2 focus:ring-accent/15 focus:border-accent transition-all cursor-pointer"
          >
            <option value="all">All Customer Types</option>
            <option value="registered">Registered Users</option>
            <option value="guest">Guest Buyers</option>
          </select>
        </form>
      </div>

      {/* CUSTOMER LIST TABLE */}
      <div className="bg-paper border border-gray-300/60 rounded-2xl shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-xs font-sans text-ink">
            <thead>
              <tr className="bg-canvas/50 border-b border-gray-300/60 text-gray-500 font-semibold uppercase tracking-wider">
                <th className="py-4 px-6">Customer Details</th>
                <th className="py-4 px-6">Status / Contact</th>
                <th className="py-4 px-6 text-center">Orders</th>
                <th className="py-4 px-6 text-right">Total Revenue</th>
                <th className="py-4 px-6 text-right">Activity Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-300/40 font-medium">
              {customers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-gray-500 font-normal">
                    No customers found matching the search filters.
                  </td>
                </tr>
              ) : (
                customers.map((c, idx) => (
                  <tr key={idx} className="hover:bg-canvas/20 transition-colors">
                    {/* Customer Details */}
                    <td className="py-4 px-6">
                      <div className="font-semibold text-sm text-ink">{c.name}</div>
                      <div className="text-[10px] text-gray-500 mt-0.5 uppercase tracking-wide">
                        Joined: {new Date(c.joinedAt).toLocaleDateString("en-NG", { year: "numeric", month: "short", day: "numeric" })}
                      </div>
                    </td>
                    
                    {/* Status & Contact details */}
                    <td className="py-4 px-6">
                      <div className="flex flex-col gap-1">
                        <span className={`inline-block text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full border w-fit ${
                          c.type === "Registered"
                            ? "text-success bg-success/5 border-success/20"
                            : "text-gray-500 bg-gray-100/50 border-gray-300"
                        }`}>
                          {c.type}
                        </span>
                        <div className="flex items-center gap-1.5 text-gray-500 mt-1">
                          <Mail className="w-3 h-3 flex-shrink-0" />
                          <span className="truncate max-w-[200px]">{c.email}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-gray-500">
                          <Phone className="w-3 h-3 flex-shrink-0" />
                          <span>{c.phone}</span>
                        </div>
                      </div>
                    </td>

                    {/* Orders count */}
                    <td className="py-4 px-6 text-center">
                      <div className="inline-flex items-center gap-1 bg-canvas border border-gray-300/50 px-2.5 py-1 rounded-full text-xs font-semibold">
                        <ShoppingBag className="w-3 h-3 text-accent" />
                        <span>{c.orderCount}</span>
                      </div>
                    </td>

                    {/* Total Spent */}
                    <td className="py-4 px-6 text-right font-semibold text-accent text-sm">
                      ₦{c.totalSpent.toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>

                    {/* Registration / Joined Date */}
                    <td className="py-4 px-6 text-right text-gray-500 text-[11px]">
                      {new Date(c.joinedAt).toLocaleTimeString("en-NG", { hour: "2-digit", minute: "2-digit" })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

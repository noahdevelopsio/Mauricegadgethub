import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Search, ArrowUpRight } from "lucide-react";

interface SearchParams {
  search?: string;
}

export const revalidate = 0; // Always retrieve live logs

export default async function AdminTransactionsPage(props: {
  searchParams: Promise<SearchParams>;
}) {
  const searchParams = await props.searchParams;
  const { search } = searchParams;

  let transactions: any[] = [];

  try {
    const supabase = await createClient();
    let query = supabase
      .from("transactions")
      .select("*, order:orders(id, order_number, customer_name)");

    if (search) {
      // Query transaction logs matching raw text
      query = query.or(`flw_transaction_id.ilike.%${search}%,tx_ref.ilike.%${search}%`);
    }

    query = query.order("created_at", { ascending: false });

    const { data } = await query;
    if (data) {
      transactions = data;
    }
  } catch (error) {
    console.error("Error loading transactions audit logs:", error);
  }

  return (
    <div className="flex flex-col gap-8 text-left font-sans">
      <div>
        <span className="text-xs uppercase font-extrabold tracking-widest text-accent">Auditing</span>
        <h1 className="text-3xl font-sans font-semibold tracking-tight text-ink mt-2">Transactions</h1>
      </div>

      {/* FILTER TOOLBAR */}
      <div className="flex justify-between items-center bg-paper p-4 rounded-2xl border border-gray-300/60 shadow-card">
        <form action="/admin/transactions" method="GET" className="relative w-full max-w-sm">
          <input
            type="text"
            name="search"
            defaultValue={search || ""}
            placeholder="Search by transaction ID or payment reference..."
            className="bg-canvas border border-gray-300 py-2 px-4 pl-10 rounded-full font-sans text-xs w-full focus:bg-paper focus:outline-none focus:ring-2 focus:ring-accent/15 focus:border-accent transition-all text-ink"
          />
          <button type="submit" className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-accent">
            <Search className="w-3.5 h-3.5" />
          </button>
        </form>
        {search && (
          <Link href="/admin/transactions" className="text-xs text-accent hover:underline font-semibold pr-2">
            Clear Search
          </Link>
        )}
      </div>

      {/* TRANSACTIONS LOGS TABLE */}
      <div className="border border-gray-300/60 bg-paper rounded-2xl overflow-hidden shadow-card">
        {transactions.length === 0 ? (
          <div className="p-16 text-center flex flex-col items-center">
            <span className="text-3xl mb-4">💳</span>
            <h3 className="font-sans font-semibold text-base text-ink mb-1">No transactions logged</h3>
            <p className="text-gray-400 text-xs max-w-sm">
              We couldn't locate any transaction audit logs matching your criteria.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs font-sans">
              <thead>
                <tr className="bg-canvas border-b border-gray-300 text-gray-500 uppercase font-bold tracking-wider">
                  <th className="p-4">Transaction ID</th>
                  <th className="p-4">Order Ref</th>
                  <th className="p-4">Customer</th>
                  <th className="p-4">Amount</th>
                  <th className="p-4">Payment Method</th>
                  <th className="p-4 text-center">Status</th>
                  <th className="p-4">Processed Date</th>
                  <th className="p-4 text-right">View Order</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-300/30 text-gray-700 font-medium">
                {transactions.map((tx) => {
                  return (
                    <tr key={tx.id} className="hover:bg-canvas/30 transition-colors">
                      <td className="p-4 font-semibold text-ink">{tx.flw_transaction_id}</td>
                      <td className="p-4 font-bold text-gray-500">{tx.order?.order_number || "—"}</td>
                      <td className="p-4 text-gray-700">{tx.order?.customer_name || "—"}</td>
                      <td className="p-4 font-bold text-ink">₦{Number(tx.amount).toLocaleString()}</td>
                      <td className="p-4 uppercase text-[10px] text-gray-500 font-bold">{tx.payment_type}</td>
                      <td className="p-4 text-center">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full border text-[9px] font-extrabold uppercase ${
                          tx.status === "successful"
                            ? "text-success bg-success/5 border-success/20"
                            : "text-error bg-error/5 border-error/20"
                        }`}>
                          {tx.status}
                        </span>
                      </td>
                      <td className="p-4 text-gray-500">
                        {new Date(tx.created_at).toLocaleString("en-NG")}
                      </td>
                      <td className="p-4 text-right">
                        {tx.order?.id ? (
                          <Link
                            href={`/admin/orders/${tx.order.id}`}
                            className="inline-flex items-center gap-1 text-accent hover:text-accent-dark hover:underline font-semibold"
                          >
                            <span>Details</span>
                            <ArrowUpRight className="w-3.5 h-3.5" />
                          </Link>
                        ) : (
                          <span className="text-gray-400">Order deleted</span>
                        )}
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

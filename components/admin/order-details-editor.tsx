"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Loader2, Save } from "lucide-react";

interface OrderDetailsEditorProps {
  orderId: string;
  initialStatus: string;
  initialAdminNotes: string;
}

export default function OrderDetailsEditor({ orderId, initialStatus, initialAdminNotes }: OrderDetailsEditorProps) {
  const router = useRouter();
  const supabase = createClient();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [status, setStatus] = useState(initialStatus);
  const [adminNotes, setAdminNotes] = useState(initialAdminNotes || "");

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error: updateError } = await supabase
        .from("orders")
        .update({
          status: status,
          admin_notes: adminNotes.trim() || null,
        })
        .eq("id", orderId);

      if (updateError) throw updateError;

      alert("Order updated successfully.");
      router.refresh(); // Reload server data to reflect change in parent view
      
    } catch (err: any) {
      console.error("Error updating order fields:", err);
      setError(err.message || "Failed to update order details.");
    } finally {
      setLoading(false);
    }
  };

  const statuses = [
    { label: "Pending Payment", value: "pending_payment" },
    { label: "Paid", value: "paid" },
    { label: "Processing", value: "processing" },
    { label: "Shipped", value: "shipped" },
    { label: "Delivered", value: "delivered" },
    { label: "Cancelled", value: "cancelled" },
    { label: "Refunded", value: "refunded" },
  ];

  return (
    <form onSubmit={handleUpdate} className="border border-gray-300/60 p-6 bg-paper rounded-2xl shadow-card flex flex-col gap-5 text-left font-sans">
      <h3 className="font-sans font-semibold text-sm text-ink border-b border-gray-100 pb-2.5">
        Order actions
      </h3>

      {error && (
        <div className="bg-error/10 border border-error text-error text-xs font-medium p-3.5 rounded-xl">
          {error}
        </div>
      )}

      {/* Status dropdown */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="status" className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Fulfillment Status</label>
        <select
          id="status"
          disabled={loading}
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="bg-canvas border border-gray-300 p-3.5 font-sans text-xs focus:outline-none focus:ring-2 focus:ring-accent/15 focus:border-accent rounded-xl text-ink"
        >
          {statuses.map((st) => (
            <option key={st.value} value={st.value}>{st.label}</option>
          ))}
        </select>
      </div>

      {/* Admin tracking notes */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="notes" className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Staff notes (e.g. tracking codes)</label>
        <textarea
          id="notes"
          disabled={loading}
          value={adminNotes}
          onChange={(e) => setAdminNotes(e.target.value)}
          rows={4}
          placeholder="Courier dispatch code, pickup instructions, or client comments..."
          className="bg-canvas border border-gray-300 p-3.5 font-sans text-xs focus:outline-none focus:ring-2 focus:ring-accent/15 focus:border-accent rounded-xl text-ink"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="btn-primary py-3.5 font-semibold text-xs uppercase tracking-wider w-full flex items-center justify-center gap-2 hover:bg-accent-dark mt-2"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Updating order...</span>
          </>
        ) : (
          <>
            <Save className="w-4 h-4" />
            <span>Save Changes</span>
          </>
        )}
      </button>
    </form>
  );
}

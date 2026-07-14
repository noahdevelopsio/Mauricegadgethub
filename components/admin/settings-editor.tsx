"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Loader2, Save } from "lucide-react";

interface Settings {
  id: number;
  flat_delivery_fee: number;
  free_delivery_threshold: number | null;
  contact_email?: string | null;
  contact_phone?: string | null;
  showroom_address?: string | null;
}

interface SettingsEditorProps {
  initialSettings: Settings;
}

export default function SettingsEditor({ initialSettings }: SettingsEditorProps) {
  const router = useRouter();
  const supabase = createClient();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [flatFee, setFlatFee] = useState(initialSettings.flat_delivery_fee.toString());
  
  const [enableFreeThreshold, setEnableFreeThreshold] = useState(
    initialSettings.free_delivery_threshold !== null && initialSettings.free_delivery_threshold !== undefined
  );
  const [freeThreshold, setFreeThreshold] = useState(
    initialSettings.free_delivery_threshold ? initialSettings.free_delivery_threshold.toString() : ""
  );

  const [contactEmail, setContactEmail] = useState(initialSettings.contact_email || "");
  const [contactPhone, setContactPhone] = useState(initialSettings.contact_phone || "");
  const [address, setAddress] = useState(initialSettings.showroom_address || "");

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Form inputs validation
    if (parseFloat(flatFee) < 0) {
      setError("Shipping fee cannot be a negative value.");
      setLoading(false);
      return;
    }
    if (enableFreeThreshold && parseFloat(freeThreshold) <= 0) {
      setError("Free shipping threshold must be greater than zero.");
      setLoading(false);
      return;
    }

    try {
      const settingsPayload = {
        flat_delivery_fee: parseFloat(flatFee),
        free_delivery_threshold: enableFreeThreshold && freeThreshold ? parseFloat(freeThreshold) : null,
        contact_email: contactEmail.trim() || null,
        contact_phone: contactPhone.trim() || null,
        showroom_address: address.trim() || null,
      };

      const { error: updateError } = await supabase
        .from("store_settings")
        .update(settingsPayload)
        .eq("id", 1);

      if (updateError) throw updateError;

      alert("Settings updated successfully.");
      router.refresh();
      
    } catch (err: any) {
      console.error("Error saving store settings:", err);
      setError(err.message || "Failed to update configurations.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleUpdate} className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-left font-sans">
      
      {/* LEFT COLUMN: SETTINGS FIELDS */}
      <div className="lg:col-span-8 flex flex-col gap-6">
        
        {error && (
          <div className="bg-error/10 border border-error text-error text-xs font-medium p-4 rounded-xl">
            {error}
          </div>
        )}

        {/* Shipping settings */}
        <div className="border border-gray-300/60 p-6 bg-paper rounded-2xl shadow-card flex flex-col gap-5">
          <h3 className="font-sans font-semibold text-sm text-ink border-b border-gray-100 pb-2.5">
            Shipping configurations
          </h3>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="flatFee" className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Flat Shipping Fee (₦ NGN)</label>
            <input
              id="flatFee"
              type="number"
              required
              disabled={loading}
              value={flatFee}
              onChange={(e) => setFlatFee(e.target.value)}
              placeholder="2500"
              className="bg-canvas border border-gray-300 p-3.5 font-sans text-xs focus:outline-none focus:ring-2 focus:ring-accent/15 focus:border-accent rounded-xl text-ink"
            />
          </div>

          <div className="hairline-divider my-1" />

          {/* Free Shipping threshold */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between text-left">
              <div className="flex flex-col">
                <label className="text-xs font-semibold text-ink">Free delivery threshold</label>
                <span className="text-[10px] text-gray-400">Offer free shipping on orders above a set value</span>
              </div>
              <input
                type="checkbox"
                checked={enableFreeThreshold}
                onChange={(e) => setEnableFreeThreshold(e.target.checked)}
                className="accent-accent w-4 h-4 cursor-pointer"
              />
            </div>

            {enableFreeThreshold && (
              <div className="flex flex-col gap-1.5 transition-all">
                <label htmlFor="freeThreshold" className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Order Value Threshold (₦ NGN)</label>
                <input
                  id="freeThreshold"
                  type="number"
                  required
                  disabled={loading}
                  value={freeThreshold}
                  onChange={(e) => setFreeThreshold(e.target.value)}
                  placeholder="5000000"
                  className="bg-canvas border border-gray-300 p-3.5 font-sans text-xs focus:outline-none focus:ring-2 focus:ring-accent/15 focus:border-accent rounded-xl text-ink"
                />
              </div>
            )}
          </div>
        </div>

        {/* Contact settings */}
        <div className="border border-gray-300/60 p-6 bg-paper rounded-2xl shadow-card flex flex-col gap-5">
          <h3 className="font-sans font-semibold text-sm text-ink border-b border-gray-100 pb-2.5">
            Contact information
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="email" className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Contact Email</label>
              <input
                id="email"
                type="email"
                disabled={loading}
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                placeholder="support@mauricegadgetshub.com"
                className="bg-canvas border border-gray-300 p-3.5 font-sans text-xs focus:outline-none focus:ring-2 focus:ring-accent/15 focus:border-accent rounded-xl text-ink"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="phone" className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Contact Phone</label>
              <input
                id="phone"
                type="text"
                disabled={loading}
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                placeholder="+234 801 234 5678"
                className="bg-canvas border border-gray-300 p-3.5 font-sans text-xs focus:outline-none focus:ring-2 focus:ring-accent/15 focus:border-accent rounded-xl text-ink"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="address" className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Showroom address</label>
            <textarea
              id="address"
              disabled={loading}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              rows={3}
              placeholder="Ikeja Computer Village, Lagos, Nigeria."
              className="bg-canvas border border-gray-300 p-3.5 font-sans text-xs focus:outline-none focus:ring-2 focus:ring-accent/15 focus:border-accent rounded-xl text-ink"
            />
          </div>
        </div>

      </div>

      {/* RIGHT COLUMN: SAVE BAR */}
      <div className="lg:col-span-4">
        <div className="border border-gray-300/60 p-6 bg-paper rounded-2xl shadow-card flex flex-col gap-4 text-left">
          <h3 className="font-sans font-semibold text-sm text-ink border-b border-gray-100 pb-2.5">
            Actions
          </h3>
          <p className="text-[10px] text-gray-400 leading-relaxed">
            Saving configurations will immediately update checkout billing logic and client-facing layouts.
          </p>
          <button
            type="submit"
            disabled={loading}
            className="btn-primary py-3.5 font-semibold text-xs uppercase tracking-wider w-full flex items-center justify-center gap-2 hover:bg-accent-dark mt-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Saving configurations...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save Settings</span>
              </>
            )}
          </button>
        </div>
      </div>

    </form>
  );
}

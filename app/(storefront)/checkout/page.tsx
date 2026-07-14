import { createClient } from "@/lib/supabase/server";
import CheckoutForm from "@/components/storefront/checkout-form";

export const revalidate = 0; // Disable caching on checkout to always retrieve active store settings

export default async function CheckoutPage() {
  let flatDeliveryFee = 2500.00; // Default fallback
  let freeDeliveryThreshold: number | null = null;

  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("store_settings")
      .select("flat_delivery_fee, free_delivery_threshold")
      .eq("id", 1)
      .single();
    
    if (data) {
      flatDeliveryFee = Number(data.flat_delivery_fee);
      freeDeliveryThreshold = data.free_delivery_threshold ? Number(data.free_delivery_threshold) : null;
    }
  } catch (error) {
    console.error("Error fetching store delivery fees in CheckoutPage:", error);
  }

  return (
    <main className="max-w-7xl mx-auto py-12 px-6 md:px-12 bg-canvas">
      <CheckoutForm flatDeliveryFee={flatDeliveryFee} freeDeliveryThreshold={freeDeliveryThreshold} />
    </main>
  );
}

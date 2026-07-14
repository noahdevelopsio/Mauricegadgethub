import { createClient } from "@/lib/supabase/server";
import SettingsEditor from "@/components/admin/settings-editor";

export const revalidate = 0; // Always fetch live settings on load

export default async function AdminSettingsPage() {
  let settings: any = null;

  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("store_settings")
      .select("*")
      .eq("id", 1)
      .single();
    
    if (data) {
      settings = data;
    }
  } catch (error) {
    console.error("Error retrieving store settings in SettingsPage:", error);
  }

  return (
    <main className="flex flex-col gap-8 text-left font-sans pb-16">
      <div>
        <span className="text-xs uppercase font-extrabold tracking-widest text-accent font-sans">Management</span>
        <h1 className="text-3xl font-sans font-semibold tracking-tight text-ink mt-2">Store Settings</h1>
      </div>

      {settings ? (
        <SettingsEditor initialSettings={settings} />
      ) : (
        <div className="bg-error/10 border border-error text-error text-xs font-semibold p-4 rounded-xl">
          Error: Store settings record (ID=1) could not be loaded from database.
        </div>
      )}
    </main>
  );
}

import { createClient } from "@/lib/supabase/server";
import CategoryManager from "@/components/admin/category-manager";

export const revalidate = 0; // Always fetch live category records

export default async function AdminCategoriesPage() {
  let categories: any[] = [];

  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("categories")
      .select("*")
      .order("name", { ascending: true });

    if (data) categories = data;
  } catch (error) {
    console.error("Error loading categories in admin page:", error);
  }

  return (
    <main className="flex flex-col gap-8 text-left font-sans">
      <div>
        <span className="text-xs uppercase font-extrabold tracking-widest text-accent">Inventory</span>
        <h1 className="text-3xl font-sans font-semibold tracking-tight text-ink mt-2">Categories</h1>
      </div>

      <CategoryManager initialCategories={categories} />
    </main>
  );
}

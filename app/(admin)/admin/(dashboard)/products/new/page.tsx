import { createClient } from "@/lib/supabase/server";
import ProductForm from "@/components/admin/product-form";

export const revalidate = 0; // Always retrieve live categories/brands data

export default async function NewProductPage() {
  let categories: { id: string; name: string }[] = [];
  let brands: { id: string; name: string }[] = [];

  try {
    const supabase = await createClient();

    // Fetch active categories
    const { data: catData } = await supabase
      .from("categories")
      .select("id, name")
      .eq("is_active", true)
      .order("name", { ascending: true });

    if (catData) categories = catData;

    // Fetch brands
    const { data: brandData } = await supabase
      .from("brands")
      .select("id, name")
      .order("name", { ascending: true });

    if (brandData) brands = brandData;

  } catch (error) {
    console.error("Error loading new product page metadata:", error);
  }

  return (
    <main className="flex flex-col gap-8 text-left font-sans">
      <div>
        <span className="text-xs uppercase font-extrabold tracking-widest text-accent">Inventory</span>
        <h1 className="text-3xl font-sans font-semibold tracking-tight text-ink mt-2">New Product</h1>
      </div>

      <ProductForm categories={categories} brands={brands} />
    </main>
  );
}

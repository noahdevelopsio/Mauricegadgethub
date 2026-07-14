import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import ProductForm from "@/components/admin/product-form";

interface EditProductPageProps {
  params: Promise<{ id: string }>;
}

export const revalidate = 0; // Always fetch live product metrics on edit load

export default async function EditProductPage(props: EditProductPageProps) {
  const params = await props.params;
  const { id } = params;

  let product: any = null;
  let categories: { id: string; name: string }[] = [];
  let brands: { id: string; name: string }[] = [];

  try {
    const supabase = await createClient();

    // 1. Fetch product with its images and variants
    const { data: prodData } = await supabase
      .from("products")
      .select("*, product_images(*), product_variants(*)")
      .eq("id", id)
      .maybeSingle();

    if (!prodData) {
      return notFound();
    }
    product = prodData;

    // 2. Fetch categories
    const { data: catData } = await supabase
      .from("categories")
      .select("id, name")
      .eq("is_active", true)
      .order("name", { ascending: true });

    if (catData) categories = catData;

    // 3. Fetch brands
    const { data: brandData } = await supabase
      .from("brands")
      .select("id, name")
      .order("name", { ascending: true });

    if (brandData) brands = brandData;

  } catch (error) {
    console.error(`Error loading edit product page [id=${id}]:`, error);
    return notFound();
  }

  return (
    <main className="flex flex-col gap-8 text-left font-sans">
      <div>
        <span className="text-xs uppercase font-extrabold tracking-widest text-accent">Inventory</span>
        <h1 className="text-3xl font-sans font-semibold tracking-tight text-ink mt-2">Edit Product</h1>
      </div>

      <ProductForm categories={categories} brands={brands} initialProduct={product} />
    </main>
  );
}

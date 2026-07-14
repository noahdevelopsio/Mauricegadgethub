import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import ProductDetails from "@/components/storefront/product-details";

// Set dynamic revalidation of pages for ISR (revalidate every 60 seconds)
export const revalidate = 60;

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  try {
    const supabase = await createClient();
    const { data: products } = await supabase
      .from("products")
      .select("slug")
      .eq("status", "published");

    if (!products) return [];
    return products.map((p) => ({ slug: p.slug }));
  } catch (error) {
    console.error("Error in generateStaticParams:", error);
    return [];
  }
}

export default async function ProductPage(props: PageProps) {
  const params = await props.params;
  const { slug } = params;

  let product: any = null;

  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("products")
      .select("*, category:categories(name, slug), brand:brands(name, slug), product_images(*), product_variants(*)")
      .eq("slug", slug)
      .eq("status", "published")
      .single();

    if (data) {
      product = data;
    }
  } catch (error) {
    console.error(`Error fetching product [slug=${slug}]:`, error);
  }

  if (!product) {
    return notFound();
  }

  return (
    <main className="max-w-7xl mx-auto py-12 px-6 md:px-12 bg-canvas">
      <ProductDetails product={product} />
    </main>
  );
}

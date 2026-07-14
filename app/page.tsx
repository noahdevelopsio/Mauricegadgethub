import { createClient } from "@/lib/supabase/server";
import StorefrontLayout from "./(storefront)/layout";
import Link from "next/link";
import Image from "next/image";
import Hero from "@/components/storefront/hero";

interface ProductImage {
  id: string;
  url: string;
  is_primary: boolean;
}

interface Product {
  id: string;
  name: string;
  slug: string;
  base_price: number;
  sale_price: number | null;
  stock_quantity: number;
  product_images?: ProductImage[];
}

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
}

export default async function Home() {
  let featuredProducts: Product[] = [];
  let categories: Category[] = [];

  try {
    const supabase = await createClient();

    // Fetch featured products with their images
    const { data: productsData } = await supabase
      .from("products")
      .select("*, product_images(*)")
      .eq("is_featured", true)
      .eq("status", "published")
      .limit(4);

    if (productsData) {
      featuredProducts = productsData as unknown as Product[];
    }

    // Fetch categories
    const { data: categoriesData } = await supabase
      .from("categories")
      .select("*")
      .eq("is_active", true)
      .order("sort_order", { ascending: true })
      .limit(6);

    if (categoriesData) {
      categories = categoriesData as unknown as Category[];
    }
  } catch (error) {
    console.error("Error loading homepage data:", error);
  }

  const getProductImage = (product: Product) => {
    if (!product.product_images || product.product_images.length === 0) {
      return "https://images.unsplash.com/photo-1552820728-8b83bb6b773f?q=80&w=600&auto=format&fit=crop";
    }
    const primary = product.product_images.find((img) => img.is_primary);
    return primary ? primary.url : product.product_images[0].url;
  };

  return (
    <StorefrontLayout>
      {/* 1. Hero Section (Apple Dark-mode Launch style) */}
      <Hero />

      {/* 2. Brand Trust Badges (Minimalist horizontal row) */}
      <section className="bg-paper py-10 px-6 md:px-12 border-b border-gray-300">
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-8 text-center sm:text-left">
          <div className="flex flex-col gap-1">
            <h4 className="font-sans font-semibold text-sm text-ink">100% Genuine Products</h4>
            <p className="text-gray-500 text-xs font-sans">Authorized reseller of major premium global brands.</p>
          </div>
          <div className="flex flex-col gap-1 sm:pl-8 sm:border-l border-gray-300">
            <h4 className="font-sans font-semibold text-sm text-ink">Secure NGN Checkout</h4>
            <p className="text-gray-500 text-xs font-sans">Fast, seamless Flutterwave payments & card authorization.</p>
          </div>
          <div className="flex flex-col gap-1 sm:pl-8 sm:border-l border-gray-300">
            <h4 className="font-sans font-semibold text-sm text-ink">Official Store Warranty</h4>
            <p className="text-gray-500 text-xs font-sans">Comprehensive warranty support on all tech gadgets.</p>
          </div>
        </div>
      </section>

      {/* 3. Category Grid (Apple Rounded Cards with soft hover shadow) */}
      <section className="py-20 px-6 md:px-12 bg-canvas">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12">
            <div>
              <span className="text-xs uppercase font-extrabold tracking-widest text-accent font-sans">Categories</span>
              <h2 className="text-3xl md:text-4xl font-sans font-semibold tracking-tight text-ink mt-2">Shop by group</h2>
            </div>
            <Link href="/products" className="mt-4 md:mt-0 font-sans font-semibold text-sm text-accent hover:text-accent-dark transition-colors">
              View all products ›
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {categories.map((cat) => {
              return (
                <Link
                  key={cat.id}
                  href={`/category/${cat.slug}`}
                  className="bg-paper p-8 rounded-2xl flex flex-col justify-between aspect-[1.4] transition-all duration-300 hover:shadow-card hover:-translate-y-0.5 group border border-gray-300/30"
                >
                  <div>
                    <h3 className="font-sans font-semibold text-xl text-ink mb-2">
                      {cat.name}
                    </h3>
                    <p className="text-xs font-sans text-gray-500 leading-relaxed">
                      {cat.description || "Browse our catalog."}
                    </p>
                  </div>
                  <span className="font-sans font-semibold text-xs text-accent group-hover:text-accent-dark transition-colors mt-8">
                    Explore items ›
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* 4. Featured Products Grid (Apple minimalist card-grid) */}
      <section className="py-20 px-6 md:px-12 bg-paper">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12">
            <div>
              <span className="text-xs uppercase font-extrabold tracking-widest text-accent font-sans">Featured Deals</span>
              <h2 className="text-3xl md:text-4xl font-sans font-semibold tracking-tight text-ink mt-2">Hot in store</h2>
            </div>
            <Link href="/products" className="mt-4 md:mt-0 font-sans font-semibold text-sm text-accent hover:text-accent-dark transition-colors">
              Browse all ›
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {featuredProducts.map((product) => {
              const hasSale = product.sale_price !== null && product.sale_price < product.base_price;
              const displayPrice = hasSale ? product.sale_price : product.base_price;

              return (
                <Link
                  key={product.id}
                  href={`/products/${product.slug}`}
                  className="group bg-canvas/30 rounded-2xl border border-gray-300/40 p-4 flex flex-col h-full hover:shadow-card hover:-translate-y-0.5 transition-all duration-300"
                >
                  {/* Image container */}
                  <div className="relative aspect-square w-full bg-canvas/40 rounded-xl p-4 flex items-center justify-center overflow-hidden">
                    <Image
                      src={getProductImage(product)}
                      alt={product.name}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 250px"
                      className="object-contain p-4 group-hover:scale-103 transition-transform duration-500"
                    />
                    
                    {/* Stock indicator badge */}
                    {product.stock_quantity <= 0 ? (
                      <div className="absolute top-3 left-3 bg-neutral-900 text-white text-[9px] font-sans font-bold px-2 py-0.5 rounded-full uppercase">
                        Out of Stock
                      </div>
                    ) : product.stock_quantity <= 5 ? (
                      <div className="absolute top-3 left-3 bg-accent text-white text-[9px] font-sans font-bold px-2 py-0.5 rounded-full uppercase">
                        Low Stock
                      </div>
                    ) : null}

                    {/* Sale Badge */}
                    {hasSale && (
                      <div className="absolute top-3 right-3 bg-accent text-white text-[9px] font-sans font-bold px-2 py-0.5 rounded-full uppercase">
                        Sale
                      </div>
                    )}
                  </div>

                  {/* Info container */}
                  <div className="pt-4 px-1 flex flex-col flex-grow justify-between">
                    <div>
                      <h3 className="font-sans font-medium text-[15px] text-ink group-hover:text-accent transition-colors leading-snug">
                        {product.name}
                      </h3>
                      <div className="flex gap-2 items-baseline font-sans mt-1.5">
                        <span className="font-semibold text-[14px] text-accent">
                          ₦{Number(displayPrice).toLocaleString("en-NG")}
                        </span>
                        {hasSale && (
                          <span className="line-through text-[11px] text-gray-500 font-normal">
                            ₦{Number(product.base_price).toLocaleString("en-NG")}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="mt-5 pt-3 border-t border-gray-300/30 flex justify-between items-center text-xs font-semibold text-accent group-hover:text-accent-dark transition-colors">
                      <span>View details</span>
                      <span>›</span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>
    </StorefrontLayout>
  );
}

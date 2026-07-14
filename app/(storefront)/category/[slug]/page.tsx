import { createClient } from "@/lib/supabase/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { SlidersHorizontal, ShoppingBag } from "lucide-react";

export async function generateMetadata(props: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const params = await props.params;
  const { slug } = params;

  try {
    const supabase = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    const { data: category } = await supabase
      .from("categories")
      .select("name, description")
      .eq("slug", slug)
      .eq("is_active", true)
      .maybeSingle();

    if (category) {
      return {
        title: category.name,
        description: category.description || `Browse our authentic collection of ${category.name} in Ikeja, Lagos.`,
      };
    }
  } catch (error) {
    console.error("Error generating category metadata:", error);
  }

  return {
    title: "Category",
  };
}

interface SearchParams {
  brand?: string;
  sort?: string;
  page?: string;
}

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

export default async function CategoryPage(props: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<SearchParams>;
}) {
  const params = await props.params;
  const searchParams = await props.searchParams;
  const { slug } = params;
  const { brand, sort, page } = searchParams;

  const currentPage = page ? parseInt(page) : 1;
  const limit = 18;
  const from = (currentPage - 1) * limit;
  const to = from + limit - 1;

  let category: { id: string; name: string; description: string } | null = null;
  let products: Product[] = [];
  let brands: { id: string; name: string; slug: string }[] = [];
  let totalPages = 1;

  try {
    const supabase = await createClient();

    // 1. Fetch category metadata
    const { data: catData } = await supabase
      .from("categories")
      .select("id, name, description")
      .eq("slug", slug)
      .eq("is_active", true)
      .single();

    if (!catData) {
      return notFound();
    }
    category = catData;

    // 2. Fetch brands for filters
    const { data: brandData } = await supabase
      .from("brands")
      .select("id, name, slug")
      .order("name", { ascending: true });

    if (brandData) brands = brandData;

    // 3. Build product query
    let query = supabase
      .from("products")
      .select("*, product_images(*)", { count: "exact" })
      .eq("category_id", category.id)
      .eq("status", "published");

    if (brand) {
      const activeBrand = brands.find((b) => b.slug === brand);
      if (activeBrand) {
        query = query.eq("brand_id", activeBrand.id);
      }
    }

    if (sort === "price-asc") {
      query = query.order("base_price", { ascending: true });
    } else if (sort === "price-desc") {
      query = query.order("base_price", { ascending: false });
    } else {
      query = query.order("created_at", { ascending: false });
    }

    // Apply pagination range
    query = query.range(from, to);

    const { data: productsData, count } = await query;
    if (productsData) {
      products = productsData as unknown as Product[];
    }
    totalPages = count ? Math.ceil(count / limit) : 1;
  } catch (error) {
    console.error("Error loading category page:", error);
    return notFound();
  }

  const getProductImage = (product: Product) => {
    if (!product.product_images || product.product_images.length === 0) {
      return "https://images.unsplash.com/photo-1552820728-8b83bb6b773f?q=80&w=600&auto=format&fit=crop";
    }
    const primary = product.product_images.find((img) => img.is_primary);
    return primary ? primary.url : product.product_images[0].url;
  };

  const getFilterUrl = (newParams: Partial<SearchParams>) => {
    const combined = { ...searchParams, ...newParams };
    if (!newParams.page) {
      delete combined.page;
    }
    const queryParts = Object.entries(combined)
      .filter(([_, value]) => value !== undefined && value !== "")
      .map(([key, value]) => `${key}=${encodeURIComponent(value as string)}`);
    
    return queryParts.length > 0 ? `?${queryParts.join("&")}` : `/category/${slug}`;
  };

  return (
    <main className="max-w-7xl mx-auto py-16 px-6 md:px-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b border-gray-300 pb-6 mb-10">
        <div>
          <span className="text-xs uppercase font-extrabold tracking-widest text-accent font-sans">Category</span>
          <h1 className="text-4xl font-sans font-semibold tracking-tight text-ink mt-2">
            {category.name}
          </h1>
          <p className="text-gray-500 text-sm font-sans mt-2 max-w-xl">
            {category.description || `Browse all gadgets in ${category.name}.`}
          </p>
        </div>
        <p className="text-gray-500 text-xs font-sans mt-2 md:mt-0 select-none">
          Showing {products.length} results
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* 1. DESKTOP FILTERS SIDEBAR (Hidden on Mobile) */}
        <aside className="hidden lg:flex lg:col-span-3 flex-col gap-6 font-sans">
          
          {/* Brand Filter */}
          <div className="border border-gray-300/60 p-6 bg-paper rounded-2xl shadow-card">
            <h3 className="font-sans font-semibold text-xs uppercase tracking-wider text-ink border-b border-gray-100 pb-2.5 mb-4">
              Filter Brand
            </h3>
            <ul className="flex flex-col gap-3 text-xs font-semibold text-gray-500">
              <li>
                <Link
                  href={getFilterUrl({ brand: "" })}
                  className={`hover:text-ink transition-colors ${!brand ? "text-accent" : ""}`}
                >
                  All Brands
                </Link>
              </li>
              {brands.map((br) => (
                <li key={br.id}>
                  <Link
                    href={getFilterUrl({ brand: br.slug })}
                    className={`hover:text-ink transition-colors ${brand === br.slug ? "text-accent" : ""}`}
                  >
                    {br.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Sort Filter */}
          <div className="border border-gray-300/60 p-6 bg-paper rounded-2xl shadow-card">
            <h3 className="font-sans font-semibold text-xs uppercase tracking-wider text-ink border-b border-gray-100 pb-2.5 mb-4">
              Sort By
            </h3>
            <ul className="flex flex-col gap-3 text-xs font-semibold text-gray-500">
              <li>
                <Link
                  href={getFilterUrl({ sort: "" })}
                  className={`hover:text-ink transition-colors ${!sort ? "text-accent" : ""}`}
                >
                  Newest Arrival
                </Link>
              </li>
              <li>
                <Link
                  href={getFilterUrl({ sort: "price-asc" })}
                  className={`hover:text-ink transition-colors ${sort === "price-asc" ? "text-accent" : ""}`}
                >
                  Price: Low to High
                </Link>
              </li>
              <li>
                <Link
                  href={getFilterUrl({ sort: "price-desc" })}
                  className={`hover:text-ink transition-colors ${sort === "price-desc" ? "text-accent" : ""}`}
                >
                  Price: High to Low
                </Link>
              </li>
            </ul>
          </div>

          {(brand || sort) && (
            <Link
              href={`/category/${slug}`}
              className="text-center font-semibold text-xs bg-accent text-white py-3 rounded-full hover:bg-accent-dark transition-all"
            >
              Reset Filters
            </Link>
          )}
        </aside>

        {/* 2. MOBILE COLLAPSIBLE FILTERS (Visible only on Mobile/Tablet) */}
        <div className="lg:hidden col-span-1">
          <details className="group border border-gray-300/60 bg-paper rounded-2xl shadow-card overflow-hidden">
            <summary className="p-4 font-semibold text-xs uppercase tracking-wider text-ink cursor-pointer flex justify-between items-center select-none">
              <span className="flex items-center gap-2">
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>Filter & Sort Options</span>
              </span>
              <span className="text-gray-500 text-[10px] transition-transform duration-200 group-open:rotate-180">▼</span>
            </summary>
            
            <div className="p-6 border-t border-gray-100 flex flex-col gap-6 font-sans text-left">
              {/* Brand Filter */}
              <div>
                <h4 className="font-sans font-semibold text-xs uppercase tracking-wider text-ink border-b border-gray-100 pb-2 mb-3">
                  Filter Brand
                </h4>
                <div className="flex flex-wrap gap-2">
                  <Link
                    href={getFilterUrl({ brand: "" })}
                    className={`px-3 py-1.5 rounded-full border text-xs font-semibold transition-all ${
                      !brand 
                        ? "bg-accent border-accent text-white" 
                        : "border-gray-300/60 text-gray-500 hover:text-ink"
                    }`}
                  >
                    All Brands
                  </Link>
                  {brands.map((br) => {
                    const isSelected = brand === br.slug;
                    return (
                      <Link
                        key={br.id}
                        href={getFilterUrl({ brand: br.slug })}
                        className={`px-3 py-1.5 rounded-full border text-xs font-semibold transition-all ${
                          isSelected 
                            ? "bg-accent border-accent text-white" 
                            : "border-gray-300/60 text-gray-500 hover:text-ink"
                        }`}
                      >
                        {br.name}
                      </Link>
                    );
                  })}
                </div>
              </div>

              {/* Sort By */}
              <div>
                <h4 className="font-sans font-semibold text-xs uppercase tracking-wider text-ink border-b border-gray-100 pb-2 mb-3">
                  Sort By
                </h4>
                <div className="flex flex-wrap gap-2">
                  <Link
                    href={getFilterUrl({ sort: "" })}
                    className={`px-3 py-1.5 rounded-full border text-xs font-semibold transition-all ${
                      !sort 
                        ? "bg-accent border-accent text-white" 
                        : "bg-canvas border-gray-300/60 text-gray-500 hover:text-ink"
                    }`}
                  >
                    Newest
                  </Link>
                  <Link
                    href={getFilterUrl({ sort: "price-asc" })}
                    className={`px-3 py-1.5 rounded-full border text-xs font-semibold transition-all ${
                      sort === "price-asc"
                        ? "bg-accent border-accent text-white"
                        : "bg-canvas border-gray-300/60 text-gray-500 hover:text-ink"
                    }`}
                  >
                    Price: Low to High
                  </Link>
                  <Link
                    href={getFilterUrl({ sort: "price-desc" })}
                    className={`px-3 py-1.5 rounded-full border text-xs font-semibold transition-all ${
                      sort === "price-desc"
                        ? "bg-accent border-accent text-white"
                        : "bg-canvas border-gray-300/60 text-gray-500 hover:text-ink"
                    }`}
                  >
                    Price: High to Low
                  </Link>
                </div>
              </div>

              {/* Reset button inside mobile drawer */}
              {(brand || sort) && (
                <Link
                  href={`/category/${slug}`}
                  className="text-center font-semibold text-xs bg-accent text-white py-3 rounded-full hover:bg-accent-dark transition-all w-full block mt-2"
                >
                  Reset all filters
                </Link>
              )}
            </div>
          </details>
        </div>

        {/* 3. PRODUCTS GRID */}
        <section className="lg:col-span-9">
          {products.length === 0 ? (
            <div className="border border-gray-300/60 p-16 text-center bg-paper rounded-2xl flex flex-col items-center shadow-card">
              <ShoppingBag className="w-10 h-10 text-gray-400 mb-4" />
              <h3 className="font-sans font-semibold text-lg text-ink mb-2">No items here yet</h3>
              <p className="text-gray-500 text-sm max-w-md font-sans">
                We couldn't find any published products under this category matching your filters.
              </p>
              <Link href="/products" className="btn-primary mt-6 text-xs px-5 py-2.5">
                View all gadgets
              </Link>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {products.map((product) => {
                  const hasSale = product.sale_price !== null && product.sale_price < product.base_price;
                  const displayPrice = hasSale ? product.sale_price : product.base_price;

                  return (
                    <Link
                      key={product.id}
                      href={`/products/${product.slug}`}
                      className="group bg-paper rounded-2xl border border-gray-300/40 p-4 flex flex-col h-full hover:shadow-card hover:-translate-y-0.5 transition-all duration-300"
                    >
                      {/* Image */}
                      <div className="relative aspect-square w-full bg-canvas/40 rounded-xl p-4 flex items-center justify-center overflow-hidden">
                        <Image
                          src={getProductImage(product)}
                          alt={product.name}
                          fill
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 250px"
                          className="object-contain p-4 group-hover:scale-103 transition-transform duration-500"
                        />
                        
                        {product.stock_quantity <= 0 ? (
                          <div className="absolute top-3 left-3 bg-neutral-900 text-white text-[9px] font-sans font-bold px-2 py-0.5 rounded-full uppercase">
                            Out of Stock
                          </div>
                        ) : product.stock_quantity <= 5 ? (
                          <div className="absolute top-3 left-3 bg-accent text-white text-[9px] font-sans font-bold px-2 py-0.5 rounded-full uppercase">
                            Low Stock
                          </div>
                        ) : null}

                        {hasSale && (
                          <div className="absolute top-3 right-3 bg-accent text-white text-[9px] font-sans font-bold px-2 py-0.5 rounded-full uppercase">
                            Sale
                          </div>
                        )}
                      </div>

                      {/* Metadata */}
                      <div className="pt-4 px-1 flex flex-col flex-grow justify-between font-sans">
                        <div>
                          <h3 className="font-sans font-medium text-[15px] text-ink group-hover:text-accent transition-colors leading-snug">
                            {product.name}
                          </h3>
                          <div className="flex gap-2 items-baseline mt-1.5">
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

              {/* PAGINATION CONTROLS */}
              {totalPages > 1 && (
                <div className="flex justify-between items-center mt-12 pt-6 border-t border-gray-300/30 font-sans text-xs">
                  <Link
                    href={currentPage > 1 ? getFilterUrl({ page: (currentPage - 1).toString() }) : "#"}
                    className={`px-4 py-2 rounded-full border border-gray-300/60 font-semibold transition-all select-none ${
                      currentPage > 1 
                        ? "text-ink bg-paper hover:bg-canvas" 
                        : "text-gray-400 bg-canvas cursor-not-allowed pointer-events-none"
                    }`}
                  >
                    ‹ Previous
                  </Link>
                  <span className="text-gray-500 font-semibold select-none">
                    Page {currentPage} of {totalPages}
                  </span>
                  <Link
                    href={currentPage < totalPages ? getFilterUrl({ page: (currentPage + 1).toString() }) : "#"}
                    className={`px-4 py-2 rounded-full border border-gray-300/60 font-semibold transition-all select-none ${
                      currentPage < totalPages 
                        ? "text-ink bg-paper hover:bg-canvas" 
                        : "text-gray-400 bg-canvas cursor-not-allowed pointer-events-none"
                    }`}
                  >
                    Next ›
                  </Link>
                </div>
              )}
            </>
          )}
        </section>
      </div>
    </main>
  );
}

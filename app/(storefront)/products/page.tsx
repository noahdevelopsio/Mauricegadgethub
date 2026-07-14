import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import Image from "next/image";
import { Search, SlidersHorizontal } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "All Gadgets & Premium Consumer Tech",
  description: "Browse 100% genuine iPhones, Samsung Galaxy phones, PlayStation consoles, audio earbuds, and original chargers. Official store warranty and express delivery in Lagos.",
};

interface SearchParams {
  category?: string;
  brand?: string;
  minPrice?: string;
  maxPrice?: string;
  sort?: string;
  search?: string;
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
  category?: { name: string; slug: string };
  brand?: { name: string; slug: string };
  product_images?: ProductImage[];
}

export default async function ProductsPage(props: {
  searchParams: Promise<SearchParams>;
}) {
  const searchParams = await props.searchParams;
  const { category, brand, minPrice, maxPrice, sort, search, page } = searchParams;

  const currentPage = page ? parseInt(page) : 1;
  const limit = 18;
  const from = (currentPage - 1) * limit;
  const to = from + limit - 1;

  let products: Product[] = [];
  let categories: { id: string; name: string; slug: string }[] = [];
  let brands: { id: string; name: string; slug: string }[] = [];
  let totalPages = 1;

  try {
    const supabase = await createClient();

    // Fetch filters metadata
    const { data: catData } = await supabase
      .from("categories")
      .select("id, name, slug")
      .eq("is_active", true)
      .order("sort_order", { ascending: true });
    
    if (catData) categories = catData;

    const { data: brandData } = await supabase
      .from("brands")
      .select("id, name, slug")
      .order("name", { ascending: true });

    if (brandData) brands = brandData;

    // Start building query
    let query = supabase
      .from("products")
      .select("*, product_images(*)", { count: "exact" })
      .eq("status", "published");

    // Apply category filter
    if (category) {
      const activeCat = categories.find((c) => c.slug === category);
      if (activeCat) {
        query = query.eq("category_id", activeCat.id);
      }
    }

    // Apply brand filter
    if (brand) {
      const activeBrand = brands.find((b) => b.slug === brand);
      if (activeBrand) {
        query = query.eq("brand_id", activeBrand.id);
      }
    }

    // Apply price range filters
    if (minPrice) {
      query = query.gte("base_price", parseFloat(minPrice));
    }
    if (maxPrice) {
      query = query.lte("base_price", parseFloat(maxPrice));
    }

    // Apply search query filter
    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
    }

    // Apply sorting
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
    console.error("Error loading products catalog:", error);
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
    
    return queryParts.length > 0 ? `?${queryParts.join("&")}` : "/products";
  };

  return (
    <main className="max-w-7xl mx-auto py-16 px-6 md:px-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b border-gray-300 pb-6 mb-10 gap-4">
        <div>
          <span className="text-xs uppercase font-extrabold tracking-widest text-accent font-sans">Catalog</span>
          <h1 className="text-4xl font-sans font-semibold tracking-tight text-ink mt-2">All Gadgets</h1>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full md:w-auto">
          {/* SEARCH BAR (Highly visible on all screens, especially mobile) */}
          <form action="/products" method="GET" className="relative w-full sm:w-64">
            {category && <input type="hidden" name="category" value={category} />}
            {brand && <input type="hidden" name="brand" value={brand} />}
            {sort && <input type="hidden" name="sort" value={sort} />}
            <input
              type="text"
              name="search"
              defaultValue={search || ""}
              placeholder="Search products..."
              className="bg-paper border border-gray-300 py-2.5 px-4 pl-10 rounded-full font-sans text-xs w-full focus:outline-none focus:ring-2 focus:ring-accent/15 focus:border-accent transition-all text-ink shadow-card"
            />
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 w-3.5 h-3.5" />
          </form>
          <p className="text-gray-500 text-xs font-sans select-none shrink-0 text-left sm:text-right">
            Showing {products.length} results
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* 1. DESKTOP FILTERS SIDEBAR (Hidden on Mobile) */}
        <aside className="hidden lg:flex lg:col-span-3 flex-col gap-6 font-sans">
          {/* Active Search indicators */}
          {search && (
            <div className="bg-canvas border border-gray-300 p-5 rounded-2xl">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-gray-500">Active Search:</span>
              <div className="font-semibold text-sm text-ink mt-1">"{search}"</div>
              <Link href={getFilterUrl({ search: "" })} className="text-xs text-accent hover:text-accent-dark hover:underline font-semibold mt-2 inline-block">
                Clear search
              </Link>
            </div>
          )}

          {/* Categories Filter */}
          <div className="border border-gray-300/60 p-6 bg-paper rounded-2xl shadow-card">
            <h3 className="font-sans font-semibold text-xs uppercase tracking-wider text-ink border-b border-gray-100 pb-2.5 mb-4">
              Categories
            </h3>
            <ul className="flex flex-col gap-3 text-xs font-semibold text-gray-500">
              <li>
                <Link
                  href={getFilterUrl({ category: "" })}
                  className={`hover:text-ink transition-colors ${!category ? "text-accent" : ""}`}
                >
                  All Categories
                </Link>
              </li>
              {categories.map((cat) => (
                <li key={cat.id}>
                  <Link
                    href={getFilterUrl({ category: cat.slug })}
                    className={`hover:text-ink transition-colors ${category === cat.slug ? "text-accent" : ""}`}
                  >
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Brands Filter */}
          <div className="border border-gray-300/60 p-6 bg-paper rounded-2xl shadow-card">
            <h3 className="font-sans font-semibold text-xs uppercase tracking-wider text-ink border-b border-gray-100 pb-2.5 mb-4">
              Brands
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

          {/* Sorting panel */}
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

          {/* Reset Filters button */}
          {(category || brand || minPrice || maxPrice || sort || search) && (
            <Link
              href="/products"
              className="text-center font-semibold text-xs bg-accent text-white py-3 rounded-full hover:bg-accent-dark transition-all"
            >
              Reset all filters
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
              {/* Active Search indicators */}
              {search && (
                <div className="bg-canvas border border-gray-300 p-4 rounded-xl">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-gray-500">Active Search:</span>
                  <div className="font-semibold text-sm text-ink mt-1">"{search}"</div>
                  <Link href={getFilterUrl({ search: "" })} className="text-xs text-accent hover:text-accent-dark hover:underline font-semibold mt-2 inline-block">
                    Clear search
                  </Link>
                </div>
              )}

              {/* Categories Filter */}
              <div>
                <h4 className="font-sans font-semibold text-xs uppercase tracking-wider text-ink border-b border-gray-100 pb-2 mb-3">
                  Categories
                </h4>
                <div className="flex flex-wrap gap-2">
                  <Link
                    href={getFilterUrl({ category: "" })}
                    className={`px-3 py-1.5 rounded-full border text-xs font-semibold transition-all ${
                      !category 
                        ? "bg-accent border-accent text-white" 
                        : "bg-canvas border-gray-300/60 text-gray-500 hover:text-ink"
                    }`}
                  >
                    All Categories
                  </Link>
                  {categories.map((cat) => (
                    <Link
                      key={cat.id}
                      href={getFilterUrl({ category: cat.slug })}
                      className={`px-3 py-1.5 rounded-full border text-xs font-semibold transition-all ${
                        category === cat.slug 
                          ? "bg-accent border-accent text-white" 
                          : "bg-canvas border-gray-300/60 text-gray-500 hover:text-ink"
                      }`}
                    >
                      {cat.name}
                    </Link>
                  ))}
                </div>
              </div>

              {/* Brands Filter */}
              <div>
                <h4 className="font-sans font-semibold text-xs uppercase tracking-wider text-ink border-b border-gray-100 pb-2 mb-3">
                  Brands
                </h4>
                <div className="flex flex-wrap gap-2">
                  <Link
                    href={getFilterUrl({ brand: "" })}
                    className={`px-3 py-1.5 rounded-full border text-xs font-semibold transition-all ${
                      !brand 
                        ? "bg-accent border-accent text-white" 
                        : "bg-canvas border-gray-300/60 text-gray-500 hover:text-ink"
                    }`}
                  >
                    All Brands
                  </Link>
                  {brands.map((br) => (
                    <Link
                      key={br.id}
                      href={getFilterUrl({ brand: br.slug })}
                      className={`px-3 py-1.5 rounded-full border text-xs font-semibold transition-all ${
                        brand === br.slug 
                          ? "bg-accent border-accent text-white" 
                          : "bg-canvas border-gray-300/60 text-gray-500 hover:text-ink"
                      }`}
                    >
                      {br.name}
                    </Link>
                  ))}
                </div>
              </div>

              {/* Sorting Filter */}
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
                    Newest Arrival
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
              {(category || brand || minPrice || maxPrice || sort || search) && (
                <Link
                  href="/products"
                  className="text-center font-semibold text-xs bg-accent text-white py-3 rounded-full hover:bg-accent-dark transition-all w-full block mt-2"
                >
                  Reset all filters
                </Link>
              )}
            </div>
          </details>
        </div>

        {/* PRODUCTS GRID */}
        <section className="lg:col-span-9">
          {products.length === 0 ? (
            <div className="border border-gray-300/60 p-16 text-center bg-paper rounded-2xl flex flex-col items-center shadow-card">
              <Search className="w-10 h-10 text-gray-400 mb-4" />
              <h3 className="font-sans font-semibold text-lg text-ink mb-2">No Gadgets Found</h3>
              <p className="text-gray-500 text-sm max-w-md font-sans">
                We couldn't find any gadgets matching your filter options. Try clearing some filters or searching for something else.
              </p>
              <Link href="/products" className="btn-primary mt-6 text-xs px-5 py-2.5">
                Back to catalog
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

                        {/* Stock indicators */}
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

                      {/* Meta info */}
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

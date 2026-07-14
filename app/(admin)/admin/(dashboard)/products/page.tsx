import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import Image from "next/image";
import DeleteProductButton from "@/components/admin/delete-product-button";
import { Plus, Search, Edit2 } from "lucide-react";

interface SearchParams {
  search?: string;
}

export const revalidate = 0; // Always fetch live inventory records

export default async function AdminProductsPage(props: {
  searchParams: Promise<SearchParams>;
}) {
  const searchParams = await props.searchParams;
  const { search } = searchParams;

  let products: any[] = [];

  try {
    const supabase = await createClient();
    let query = supabase
      .from("products")
      .select("*, category:categories(name), product_images(url, is_primary)");

    if (search) {
      query = query.or(`name.ilike.%${search}%,sku.ilike.%${search}%`);
    }

    // Order by newest created
    query = query.order("created_at", { ascending: false });

    const { data } = await query;
    if (data) {
      products = data;
    }
  } catch (error) {
    console.error("Error loading admin products list:", error);
  }

  const getProductImage = (product: any) => {
    if (!product.product_images || product.product_images.length === 0) {
      return "https://images.unsplash.com/photo-1552820728-8b83bb6b773f?q=80&w=200&auto=format&fit=crop";
    }
    const primary = product.product_images.find((img: any) => img.is_primary);
    return primary ? primary.url : product.product_images[0].url;
  };

  return (
    <div className="flex flex-col gap-8 text-left font-sans">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <span className="text-xs uppercase font-extrabold tracking-widest text-accent">Inventory</span>
          <h1 className="text-3xl font-sans font-semibold tracking-tight text-ink mt-2">Products</h1>
        </div>
        
        <Link href="/admin/products/new" className="btn-primary flex items-center gap-1.5 py-2.5 text-xs font-semibold uppercase">
          <Plus className="w-4 h-4" />
          <span>New Product</span>
        </Link>
      </div>

      {/* FILTER / SEARCH TOOLBAR */}
      <div className="flex justify-between items-center bg-paper p-4 rounded-2xl border border-gray-300/60 shadow-card">
        <form action="/admin/products" method="GET" className="relative w-full max-w-sm">
          <input
            type="text"
            name="search"
            defaultValue={search || ""}
            placeholder="Search products by name or SKU..."
            className="bg-canvas border border-gray-300 py-2 px-4 pl-10 rounded-full font-sans text-xs w-full focus:bg-paper focus:outline-none focus:ring-2 focus:ring-accent/15 focus:border-accent transition-all text-ink"
          />
          <button type="submit" className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-accent">
            <Search className="w-3.5 h-3.5" />
          </button>
        </form>
        {search && (
          <Link href="/admin/products" className="text-xs text-accent hover:underline font-semibold pr-2">
            Clear Search
          </Link>
        )}
      </div>

      {/* PRODUCTS TABLE */}
      <div className="border border-gray-300/60 bg-paper rounded-2xl overflow-hidden shadow-card">
        {products.length === 0 ? (
          <div className="p-16 text-center flex flex-col items-center">
            <span className="text-3xl mb-4">📦</span>
            <h3 className="font-sans font-semibold text-base text-ink mb-1">No products found</h3>
            <p className="text-gray-400 text-xs max-w-sm">
              We couldn't find any products in your inventory. Add a new product to get started!
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs font-sans">
              <thead>
                <tr className="bg-canvas border-b border-gray-300 text-gray-500 uppercase font-bold tracking-wider">
                  <th className="p-4 w-16">Preview</th>
                  <th className="p-4">Product details</th>
                  <th className="p-4">SKU</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Base price</th>
                  <th className="p-4 text-center">Stock</th>
                  <th className="p-4 text-center">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-300/30 text-gray-700 font-medium">
                {products.map((product) => {
                  const hasSale = product.sale_price !== null && product.sale_price < product.base_price;
                  const stock = product.stock_quantity;

                  return (
                    <tr key={product.id} className="hover:bg-canvas/30 transition-colors">
                      {/* Image Thumbnail */}
                      <td className="p-4">
                        <div className="relative w-10 aspect-square bg-canvas rounded-lg p-1 border border-gray-300/20 overflow-hidden flex items-center justify-center">
                          <Image
                            src={getProductImage(product)}
                            alt={product.name}
                            fill
                            sizes="40px"
                            className="object-contain p-0.5"
                          />
                        </div>
                      </td>

                      {/* Name Details */}
                      <td className="p-4">
                        <span className="font-semibold text-ink leading-tight">{product.name}</span>
                        {product.has_variants && (
                          <span className="block text-[10px] text-gray-400 font-medium mt-0.5">Has variants options</span>
                        )}
                      </td>

                      {/* SKU */}
                      <td className="p-4 text-gray-500 font-semibold">{product.sku || "—"}</td>

                      {/* Category */}
                      <td className="p-4 text-gray-500">{product.category?.name || "—"}</td>

                      {/* Price */}
                      <td className="p-4">
                        <span className="font-semibold text-ink">₦{Number(product.base_price).toLocaleString()}</span>
                        {hasSale && (
                          <span className="block text-[10px] text-accent font-semibold mt-0.5">Sale: ₦{Number(product.sale_price).toLocaleString()}</span>
                        )}
                      </td>

                      {/* Stock count */}
                      <td className="p-4 text-center">
                        {product.has_variants ? (
                          <span className="text-gray-400">Variant-managed</span>
                        ) : stock <= 0 ? (
                          <span className="text-error font-bold">Out of stock</span>
                        ) : stock <= 5 ? (
                          <span className="text-accent font-bold">{stock} left</span>
                        ) : (
                          <span className="text-success font-semibold">{stock} available</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="p-4 text-center">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full border text-[9px] font-bold uppercase ${
                          product.status === "published" 
                            ? "text-success bg-success/5 border-success/20" 
                            : product.status === "draft"
                            ? "text-gray-500 bg-gray-100/50 border-gray-300"
                            : "text-error bg-error/5 border-error/20"
                        }`}>
                          {product.status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="p-4 text-right">
                        <div className="flex justify-end gap-1.5">
                          <Link
                            href={`/admin/products/${product.id}/edit`}
                            className="text-gray-400 hover:text-accent transition-colors p-1.5 rounded-lg border border-transparent hover:border-gray-200 hover:bg-canvas"
                            title="Edit product"
                          >
                            <Edit2 className="w-4 h-4" />
                          </Link>
                          
                          <DeleteProductButton productId={product.id} productName={product.name} />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import Image from "next/image";
import { Search, User } from "lucide-react";
import CartTrigger from "@/components/storefront/cart-trigger";

export default async function Header() {
  let categories: { name: string; slug: string }[] = [];

  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("categories")
      .select("name, slug")
      .eq("is_active", true)
      .order("sort_order", { ascending: true });
    
    if (data) {
      categories = data;
    }
  } catch (error) {
    console.error("Error fetching categories in Header:", error);
  }

  return (
    <header className="sticky top-0 z-50 bg-paper/80 backdrop-blur-md border-b border-gray-300 py-3.5 px-6 md:px-12 flex items-center justify-between transition-all">
      {/* Brand Logo */}
      <Link href="/" className="flex items-center gap-2 font-sans font-semibold text-lg uppercase tracking-tight text-ink hover:text-accent transition-colors">
        <Image src="/mgh-mark.svg" alt="Maurice logo" width={24} height={24} className="h-6 w-auto" />
        <span>Maurice</span>
      </Link>

      {/* Navigation Links */}
      <nav className="hidden md:flex gap-8 font-sans font-medium text-[13px] text-gray-700">
        <Link href="/products" className="hover:text-ink transition-colors pb-1">
          All Products
        </Link>
        {categories.map((cat) => (
          <Link
            key={cat.slug}
            href={`/category/${cat.slug}`}
            className="hover:text-ink transition-colors pb-1"
          >
            {cat.name}
          </Link>
        ))}
      </nav>

      {/* Action Icons */}
      <div className="flex items-center gap-6">
        {/* Search Form */}
        <form action="/products" method="GET" className="relative hidden sm:block">
          <input
            type="text"
            name="search"
            placeholder="Search gadgets..."
            className="bg-canvas border border-gray-300 py-1.5 px-4 pr-10 rounded-full font-sans text-xs w-48 focus:w-60 focus:bg-paper focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all duration-300 text-ink"
          />
          <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-accent transition-colors">
            <Search className="w-3.5 h-3.5" />
          </button>
        </form>

        {/* Cart Link */}
        <CartTrigger />

        {/* Account / Admin Link */}
        <Link href="/admin" className="text-gray-700 hover:text-ink transition-colors">
          <User className="w-5 h-5" />
        </Link>
      </div>
    </header>
  );
}

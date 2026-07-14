import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import Image from "next/image";
import SignOutButton from "@/components/admin/signout-button";
import { LayoutDashboard, ShoppingBag, FolderTree, CreditCard, ShoppingCart, Settings } from "lucide-react";

export const revalidate = 0; // Always query live session role data on layout load

export default async function AdminDashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  let staffName = "Staff Member";
  let staffRole = "staff";

  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, role")
        .eq("id", user.id)
        .single();
      
      if (profile) {
        staffName = profile.full_name || "Staff Member";
        staffRole = profile.role || "staff";
      }
    }
  } catch (error) {
    console.error("Error loading profile in admin layout:", error);
  }

  const sidebarLinks = [
    { label: "Dashboard", href: "/admin", icon: <LayoutDashboard className="w-4 h-4" /> },
    { label: "Products", href: "/admin/products", icon: <ShoppingBag className="w-4 h-4" /> },
    { label: "Categories", href: "/admin/categories", icon: <FolderTree className="w-4 h-4" /> },
    { label: "Orders", href: "/admin/orders", icon: <ShoppingCart className="w-4 h-4" /> },
    { label: "Transactions", href: "/admin/transactions", icon: <CreditCard className="w-4 h-4" /> },
    { label: "Settings", href: "/admin/settings", icon: <Settings className="w-4 h-4" /> },
  ];

  return (
    <div className="flex min-h-screen bg-canvas font-sans">
      
      {/* 1. SIDEBAR */}
      <aside className="w-64 border-r border-gray-300 bg-paper hidden md:flex flex-col select-none shrink-0">
        {/* Sidebar Header Brand */}
        <div className="p-6 border-b border-gray-300 flex items-center justify-between">
          <Link href="/admin" className="flex items-center gap-2 font-sans font-semibold text-base uppercase tracking-tight text-ink hover:text-accent transition-colors">
            <Image src="/mgh-mark.svg" alt="Maurice logo" width={20} height={20} className="h-5 w-auto" />
            <span>Maurice Hub</span>
          </Link>
          <span className="text-[10px] font-extrabold uppercase bg-accent/15 text-accent border border-accent/20 px-2 py-0.5 rounded-full">
            Admin
          </span>
        </div>

        {/* Sidebar Navigation */}
        <nav className="flex-grow p-4 flex flex-col gap-1 text-left text-xs font-semibold text-gray-500">
          {sidebarLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="flex items-center gap-3 py-3 px-4 rounded-xl hover:bg-canvas hover:text-ink transition-all duration-200"
            >
              {link.icon}
              <span>{link.label}</span>
            </Link>
          ))}
        </nav>
        
        {/* Sidebar Footer Shop Redirect */}
        <div className="p-6 border-t border-gray-300">
          <Link href="/" className="text-xs font-bold text-accent hover:text-accent-dark hover:underline flex items-center justify-center gap-1">
            <span>View Public Store ›</span>
          </Link>
        </div>
      </aside>

      {/* 2. MAIN CONTAINER */}
      <div className="flex-grow flex flex-col min-w-0">
        
        {/* Header toolbar */}
        <header className="h-16 border-b border-gray-300 bg-paper px-6 flex items-center justify-between select-none shrink-0">
          <div className="flex items-center gap-4">
            {/* Mobile navigation links (icons only) */}
            <div className="flex md:hidden gap-1.5 border border-gray-300 p-1.5 bg-canvas rounded-xl">
              {sidebarLinks.slice(0, 3).map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  title={link.label}
                  className="text-gray-500 hover:text-ink transition-colors p-1.5 hover:bg-paper rounded-lg"
                >
                  {link.icon}
                </Link>
              ))}
            </div>
            <h2 className="hidden md:block font-sans font-semibold text-sm text-ink uppercase tracking-wider">
              Management Portal
            </h2>
          </div>

          <div className="flex items-center gap-4">
            {/* Staff profile summary */}
            <div className="text-right flex flex-col text-xs pr-2">
              <span className="font-semibold text-ink leading-tight">{staffName}</span>
              <span className="text-[10px] text-gray-500 uppercase mt-0.5 tracking-wider font-semibold">
                {staffRole} Mode
              </span>
            </div>
            
            <div className="h-6 w-[1px] bg-gray-300" />
            
            <SignOutButton />
          </div>
        </header>

        {/* Content Wrapper */}
        <div className="flex-grow overflow-y-auto p-8 max-w-7xl mx-auto w-full">
          {children}
        </div>

      </div>

    </div>
  );
}

import Header from "@/components/storefront/header";
import Footer from "@/components/storefront/footer";
import CartDrawer from "@/components/storefront/cart-drawer";

export default function StorefrontLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Header component */}
      <Header />
      
      {/* Page Content */}
      <div className="flex-grow bg-canvas">
        {children}
      </div>

      {/* Footer component */}
      <Footer />

      {/* Slide-over Cart Drawer */}
      <CartDrawer />
    </div>
  );
}

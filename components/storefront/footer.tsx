import Link from "next/link";
import Image from "next/image";

export default function Footer() {
  return (
    <footer className="bg-canvas border-t border-gray-300 pt-16 pb-12 px-6 md:px-12">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 font-sans">
        
        {/* Info Column */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <Image src="/mgh-mark.svg" alt="Maurice logo" width={24} height={24} className="h-6 w-auto" />
            <h3 className="font-sans font-semibold text-base uppercase tracking-tight text-ink">
              Maurice
            </h3>
          </div>
          <p className="text-gray-500 text-sm leading-relaxed max-w-xs">
            E-commerce retail of premium, authentic tech devices. Built on precision, engineered for reliability, delivered with confidence.
          </p>
          <div className="mt-2 text-xs text-gray-500 font-medium">
            © {new Date().getFullYear()} Maurice Gadgets Hub
          </div>
        </div>

        {/* Categories / Links */}
        <div className="flex flex-col gap-4">
          <h4 className="font-sans font-semibold text-xs uppercase tracking-wider text-ink">
            Shop
          </h4>
          <ul className="flex flex-col gap-2.5 text-sm text-gray-500">
            <li><Link href="/category/phones" className="hover:text-ink transition-colors">Phones</Link></li>
            <li><Link href="/category/audio" className="hover:text-ink transition-colors">Earpods & Audio</Link></li>
            <li><Link href="/category/accessories" className="hover:text-ink transition-colors">Accessories</Link></li>
            <li><Link href="/category/gaming" className="hover:text-ink transition-colors">Gaming Consoles</Link></li>
          </ul>
        </div>

        {/* Support & Policies Links */}
        <div className="flex flex-col gap-4">
          <h4 className="font-sans font-semibold text-xs uppercase tracking-wider text-ink">
            Support
          </h4>
          <ul className="flex flex-col gap-2.5 text-sm text-gray-500">
            <li><Link href="/about" className="hover:text-ink transition-colors">Our Story</Link></li>
            <li><Link href="/contact" className="hover:text-ink transition-colors">Contact & Showroom</Link></li>
            <li><Link href="/faq" className="hover:text-ink transition-colors">FAQs</Link></li>
          </ul>
        </div>

        {/* Policies */}
        <div className="flex flex-col gap-4">
          <h4 className="font-sans font-semibold text-xs uppercase tracking-wider text-ink">
            Policies
          </h4>
          <ul className="flex flex-col gap-2.5 text-sm text-gray-500">
            <li><Link href="/policies/shipping" className="hover:text-ink transition-colors">Shipping & Returns</Link></li>
            <li><Link href="/policies/warranty" className="hover:text-ink transition-colors">Warranty Policy</Link></li>
            <li><Link href="/policies/privacy" className="hover:text-ink transition-colors">Privacy Policy</Link></li>
            <li><Link href="/policies/terms" className="hover:text-ink transition-colors">Terms of Service</Link></li>
          </ul>
        </div>

      </div>
    </footer>
  );
}

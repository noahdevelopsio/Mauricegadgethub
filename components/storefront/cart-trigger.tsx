"use client";

import { useCartStore } from "@/lib/store/cart";
import { ShoppingCart } from "lucide-react";
import { useEffect, useState } from "react";

export default function CartTrigger() {
  const { items, setCartOpen } = useCartStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const totalQty = mounted ? items.reduce((sum, item) => sum + item.quantity, 0) : 0;

  return (
    <button
      onClick={() => setCartOpen(true)}
      className="relative text-gray-700 hover:text-ink transition-colors p-1"
    >
      <ShoppingCart className="w-5 h-5" />
      {totalQty > 0 && (
        <span className="absolute -top-1 -right-1 bg-accent text-white text-[9px] font-bold font-sans rounded-full w-4 h-4 flex items-center justify-center border border-paper">
          {totalQty}
        </span>
      )}
    </button>
  );
}

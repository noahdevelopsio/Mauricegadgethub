"use client";

import { useCartStore } from "@/lib/store/cart";
import { X, Trash2, ShoppingBag } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function CartDrawer() {
  const { items, isCartOpen, setCartOpen, updateQuantity, removeItem } = useCartStore();
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch by waiting until component is mounted
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);

  return (
    <>
      {/* BACKGROUND BACKDROP */}
      <div
        onClick={() => setCartOpen(false)}
        className={`fixed inset-0 z-50 bg-black/40 backdrop-blur-xs transition-opacity duration-300 ${
          isCartOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      />

      {/* DRAWER PANEL */}
      <aside
        className={`fixed right-0 top-0 bottom-0 z-50 bg-paper w-full max-w-md border-l border-gray-300 shadow-hover flex flex-col transition-transform duration-300 ease-in-out ${
          isCartOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-300">
          <div className="flex items-center gap-2 font-sans font-semibold text-base text-ink">
            <ShoppingBag className="w-5 h-5 text-accent" />
            <span>Your Cart ({items.length})</span>
          </div>
          <button
            onClick={() => setCartOpen(false)}
            className="text-gray-500 hover:text-ink transition-colors p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content list */}
        <div className="flex-grow overflow-y-auto p-6 flex flex-col gap-6">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <span className="text-3xl mb-3">🛒</span>
              <p className="text-gray-500 text-sm font-sans">Your shopping cart is empty.</p>
              <button
                onClick={() => setCartOpen(false)}
                className="text-xs text-accent hover:text-accent-dark font-semibold mt-3 hover:underline"
              >
                Browse catalog ›
              </button>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.id} className="flex gap-4 border-b border-gray-100 pb-5 items-start font-sans">
                {/* Item Thumbnail */}
                <div className="relative w-16 aspect-square bg-canvas rounded-lg p-1.5 flex items-center justify-center border border-gray-300/30 overflow-hidden">
                  <Image
                    src={item.image_url}
                    alt={item.name}
                    fill
                    sizes="60px"
                    className="object-contain p-1"
                  />
                </div>

                {/* Meta details */}
                <div className="flex-grow flex flex-col gap-1 text-left">
                  <h4 className="font-sans font-medium text-sm text-ink leading-tight pr-4">
                    {item.name}
                  </h4>
                  <span className="font-semibold text-xs text-accent mt-0.5">
                    ₦{Number(item.price).toLocaleString("en-NG")}
                  </span>
                  
                  {/* Quantity selector */}
                  <div className="flex items-center border border-gray-300 bg-canvas rounded-full w-fit mt-2 h-7 overflow-hidden">
                    <button
                      disabled={item.quantity <= 1}
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="px-2.5 hover:bg-gray-300 disabled:opacity-30 font-bold transition-colors text-xs"
                    >
                      -
                    </button>
                    <span className="w-6 text-center text-xs font-semibold">{item.quantity}</span>
                    <button
                      disabled={item.quantity >= item.stock_quantity}
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="px-2.5 hover:bg-gray-300 disabled:opacity-30 font-bold transition-colors text-xs"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Delete button */}
                <button
                  onClick={() => removeItem(item.id)}
                  className="text-gray-400 hover:text-error transition-colors p-1"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer info & subtotal */}
        {items.length > 0 && (
          <div className="border-t border-gray-300 p-6 bg-canvas/30 flex flex-col gap-4 font-sans">
            <div className="flex justify-between items-baseline">
              <span className="text-sm font-medium text-gray-500">Subtotal:</span>
              <span className="text-xl font-semibold text-ink">
                ₦{Number(subtotal).toLocaleString("en-NG")}
              </span>
            </div>
            
            <p className="text-[11px] text-gray-400 text-left">
              Shipping & taxes calculated at checkout. Orders processed securely via Flutterwave.
            </p>

            <Link
              href="/checkout"
              onClick={() => setCartOpen(false)}
              className="btn-primary py-3.5 text-center text-sm font-semibold w-full mt-2"
            >
              Checkout Now
            </Link>
          </div>
        )}
      </aside>
    </>
  );
}

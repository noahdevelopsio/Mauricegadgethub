"use client";

import { useCartStore } from "@/lib/store/cart";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Loader2, CreditCard, ShoppingCart } from "lucide-react";

interface CheckoutFormProps {
  flatDeliveryFee: number;
  freeDeliveryThreshold: number | null;
}

export default function CheckoutForm({ flatDeliveryFee, freeDeliveryThreshold }: CheckoutFormProps) {
  const { items, clearCart } = useCartStore();
  
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [deliveryMethod, setDeliveryMethod] = useState<"pickup" | "delivery">("delivery");
  const [deliveryAddress, setDeliveryAddress] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
        <p className="text-gray-500 text-sm mt-3">Loading checkout page...</p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="max-w-md mx-auto text-center py-16 px-6 bg-paper rounded-2xl border border-gray-300/40 shadow-card">
        <ShoppingCart className="w-10 h-10 text-gray-400 mb-4 mx-auto" />
        <h2 className="text-2xl font-sans font-semibold text-ink mb-2">Your cart is empty</h2>
        <p className="text-gray-500 text-sm mb-6">You must add some items to your cart before proceeding to checkout.</p>
        <Link href="/products" className="btn-primary w-full text-xs py-3 font-semibold uppercase tracking-wider">
          Explore products
        </Link>
      </div>
    );
  }

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  
  // Compute shipping fee
  const isFreeDelivery = freeDeliveryThreshold !== null && subtotal >= freeDeliveryThreshold;
  const shippingFee = deliveryMethod === "delivery" && !isFreeDelivery ? flatDeliveryFee : 0;
  const total = subtotal + shippingFee;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Basic Validation
    if (name.trim().length < 3) {
      setError("Please enter your full name (minimum 3 characters).");
      setLoading(false);
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address.");
      setLoading(false);
      return;
    }
    if (phone.trim().length < 8) {
      setError("Please enter a valid phone number (minimum 8 characters).");
      setLoading(false);
      return;
    }
    if (deliveryMethod === "delivery" && deliveryAddress.trim().length < 8) {
      setError("Please enter a valid delivery address (minimum 8 characters).");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          items: items.map((item) => ({
            product_id: item.product_id,
            variant_id: item.variant_id,
            quantity: item.quantity,
          })),
          customer: { name, email, phone },
          delivery: {
            method: deliveryMethod,
            address: deliveryMethod === "delivery" ? deliveryAddress : "",
          },
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || "Failed to initialize payment checkout session.");
      }

      if (data.payment_link) {
        // Clear client cart store upon successful initialization redirect
        clearCart();
        window.location.href = data.payment_link;
      } else {
        throw new Error("No payment link returned from Flutterwave gateway.");
      }
    } catch (err: any) {
      console.error("Checkout submission error:", err);
      setError(err.message || "An unexpected error occurred. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
      
      {/* 1. CHECKOUT FORM COL */}
      <div className="lg:col-span-7">
        <Link href="/products" className="inline-flex items-center gap-1.5 text-xs font-semibold text-accent hover:text-accent-dark transition-colors mb-6">
          <ArrowLeft className="w-3 h-3" />
          <span>Back to catalog</span>
        </Link>
        
        <h1 className="text-3xl font-sans font-semibold tracking-tight text-ink mb-2 text-left">
          Checkout
        </h1>
        <p className="text-gray-400 text-xs mb-8 text-left">
          Please fill in your billing and delivery details.
        </p>

        {error && (
          <div className="bg-error/10 border border-error text-error text-xs font-medium p-4 rounded-xl mb-6 text-left">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-6 text-left">
          
          {/* Customer Details */}
          <div className="border border-gray-300/60 p-6 bg-paper rounded-2xl shadow-card flex flex-col gap-5">
            <h3 className="font-sans font-semibold text-sm text-ink border-b border-gray-100 pb-2.5">
              Contact information
            </h3>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="fullName" className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Full name</label>
              <input
                id="fullName"
                type="text"
                required
                disabled={loading}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                className="bg-canvas border border-gray-300 p-3.5 font-sans text-xs focus:outline-none focus:ring-2 focus:ring-accent/15 focus:border-accent rounded-xl text-ink"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="email" className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Email address</label>
                <input
                  id="email"
                  type="email"
                  required
                  disabled={loading}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="john@example.com"
                  className="bg-canvas border border-gray-300 p-3.5 font-sans text-xs focus:outline-none focus:ring-2 focus:ring-accent/15 focus:border-accent rounded-xl text-ink"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="phone" className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Phone number</label>
                <input
                  id="phone"
                  type="tel"
                  required
                  disabled={loading}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+234 801 234 5678"
                  className="bg-canvas border border-gray-300 p-3.5 font-sans text-xs focus:outline-none focus:ring-2 focus:ring-accent/15 focus:border-accent rounded-xl text-ink"
                />
              </div>
            </div>
          </div>

          {/* Delivery Method Selection */}
          <div className="border border-gray-300/60 p-6 bg-paper rounded-2xl shadow-card flex flex-col gap-5">
            <h3 className="font-sans font-semibold text-sm text-ink border-b border-gray-100 pb-2.5">
              Delivery option
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                disabled={loading}
                onClick={() => setDeliveryMethod("delivery")}
                className={`py-4 px-4 rounded-xl border flex flex-col items-center gap-1.5 font-sans transition-all duration-200 ${
                  deliveryMethod === "delivery"
                    ? "border-accent bg-accent/5 ring-1 ring-accent"
                    : "border-gray-300 hover:border-gray-500 bg-paper"
                }`}
              >
                <span className="text-xs font-bold text-ink">Doorstep Delivery</span>
                <span className="text-[10px] text-gray-400">Flat rate ₦{flatDeliveryFee.toLocaleString()}</span>
              </button>

              <button
                type="button"
                disabled={loading}
                onClick={() => setDeliveryMethod("pickup")}
                className={`py-4 px-4 rounded-xl border flex flex-col items-center gap-1.5 font-sans transition-all duration-200 ${
                  deliveryMethod === "pickup"
                    ? "border-accent bg-accent/5 ring-1 ring-accent"
                    : "border-gray-300 hover:border-gray-500 bg-paper"
                }`}
              >
                <span className="text-xs font-bold text-ink">In-Store Pickup</span>
                <span className="text-[10px] text-gray-400">Computer Village, Ikeja</span>
              </button>
            </div>

            {deliveryMethod === "delivery" ? (
              <div className="flex flex-col gap-1.5 mt-2 transition-all">
                <label htmlFor="address" className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Delivery address</label>
                <textarea
                  id="address"
                  required
                  disabled={loading}
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  placeholder="12 Allen Avenue, Ikeja, Lagos State"
                  rows={3}
                  className="bg-canvas border border-gray-300 p-3.5 font-sans text-xs focus:outline-none focus:ring-2 focus:ring-accent/15 focus:border-accent rounded-xl text-ink"
                />
              </div>
            ) : (
              <div className="bg-canvas p-4 rounded-xl text-xs text-gray-500 leading-relaxed mt-2 border border-gray-300/30">
                📌 <strong>Showroom address:</strong> Ikeja Computer Village, Lagos.<br />
                Pickup is free. Your items will be reserved immediately upon successful payment confirmation.
              </div>
            )}
          </div>

          {/* Checkout button */}
          <button
            type="submit"
            disabled={loading}
            className="btn-primary py-4 font-semibold text-sm w-full flex items-center justify-center gap-2 hover:bg-accent-dark transition-all duration-200 mt-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Redirecting to payment gateway...</span>
              </>
            ) : (
              <>
                <CreditCard className="w-4 h-4" />
                <span>Pay ₦{Number(total).toLocaleString("en-NG")} via Flutterwave</span>
              </>
            )}
          </button>

        </form>
      </div>

      {/* 2. ORDER SUMMARY COL */}
      <div className="lg:col-span-5 flex flex-col gap-6">
        <div className="border border-gray-300/60 p-6 bg-paper rounded-2xl shadow-card flex flex-col gap-5 text-left font-sans">
          <h3 className="font-sans font-semibold text-sm text-ink border-b border-gray-100 pb-2.5">
            Order summary
          </h3>

          {/* Cart items list */}
          <div className="flex flex-col gap-4 overflow-y-auto max-h-[300px]">
            {items.map((item) => (
              <div key={item.id} className="flex gap-3.5 items-center">
                <div className="relative w-12 aspect-square bg-canvas rounded-lg p-1 flex items-center justify-center border border-gray-300/20 overflow-hidden">
                  <Image
                    src={item.image_url}
                    alt={item.name}
                    fill
                    sizes="48px"
                    className="object-contain p-0.5"
                  />
                </div>
                <div className="flex-grow text-xs font-sans">
                  <h4 className="font-semibold text-ink leading-tight line-clamp-1">{item.name}</h4>
                  <p className="text-gray-400 mt-0.5 font-medium">Qty: {item.quantity}</p>
                </div>
                <span className="font-semibold text-xs text-ink">
                  ₦{(item.price * item.quantity).toLocaleString()}
                </span>
              </div>
            ))}
          </div>

          <div className="hairline-divider my-2" />

          {/* Summary pricing calculations */}
          <div className="flex flex-col gap-3.5 text-xs text-gray-500 font-medium">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span className="text-ink font-semibold">₦{subtotal.toLocaleString()}</span>
            </div>
            
            <div className="flex justify-between">
              <span>Shipping Fee:</span>
              <span className="text-ink font-semibold">
                {shippingFee === 0 ? "Free" : `₦${shippingFee.toLocaleString()}`}
              </span>
            </div>

            {isFreeDelivery && (
              <div className="text-[10px] text-success bg-success/5 border border-success/15 py-1 px-3 rounded-full text-center">
                🎉 Congratulations! Free delivery threshold unlocked.
              </div>
            )}
          </div>

          <div className="hairline-divider my-2" />

          <div className="flex justify-between items-baseline font-sans">
            <span className="text-sm font-semibold text-ink">Total to Pay:</span>
            <span className="text-xl font-bold text-accent">
              ₦{Number(total).toLocaleString("en-NG")}
            </span>
          </div>
        </div>
      </div>

    </div>
  );
}

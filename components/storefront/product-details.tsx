"use client";

import { useState } from "react";
import Image from "next/image";

interface ProductImage {
  id: string;
  url: string;
  is_primary: boolean;
  alt_text: string | null;
}

interface ProductVariant {
  id: string;
  variant_name: string;
  attributes: Record<string, string>;
  price_override: number | null;
  stock_quantity: number;
  sku: string | null;
}

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  base_price: number;
  sale_price: number | null;
  stock_quantity: number;
  has_variants: boolean;
  specifications: Record<string, string>;
  category?: { name: string; slug: string };
  brand?: { name: string; slug: string };
  product_images: ProductImage[];
  product_variants: ProductVariant[];
}

export default function ProductDetails({ product }: { product: Product }) {
  const { product_images, product_variants, has_variants, specifications } = product;

  // Image Gallery State
  const [selectedImg, setSelectedImg] = useState<string>(
    product_images.find((img) => img.is_primary)?.url || 
    product_images[0]?.url || 
    "https://images.unsplash.com/photo-1552820728-8b83bb6b773f?q=80&w=600&auto=format&fit=crop"
  );

  // Variant States
  const attributeKeys = Array.from(
    new Set(product_variants.flatMap((v) => Object.keys(v.attributes)))
  );

  const [selectedAttrs, setSelectedAttrs] = useState<Record<string, string>>(() => {
    if (!has_variants || product_variants.length === 0) return {};
    return product_variants[0].attributes;
  });

  const matchedVariant = product_variants.find((v) =>
    attributeKeys.every((key) => v.attributes[key] === selectedAttrs[key])
  );

  // Pricing calculation
  const hasSale = product.sale_price !== null && product.sale_price < product.base_price;
  const displayPrice = matchedVariant?.price_override !== null && matchedVariant?.price_override !== undefined
    ? matchedVariant.price_override
    : hasSale ? (product.sale_price as number) : product.base_price;

  const currentSku = matchedVariant?.sku || product.product_variants[0]?.sku || "MGH-DEFAULT";
  const currentStock = matchedVariant ? matchedVariant.stock_quantity : product.stock_quantity;

  const handleAttrSelect = (key: string, value: string) => {
    setSelectedAttrs((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const [quantity, setQuantity] = useState<number>(1);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 font-sans py-6">
      
      {/* 1. GALLERY COL */}
      <div className="lg:col-span-6 flex flex-col gap-4">
        {/* Main image container */}
        <div className="relative aspect-square w-full bg-paper rounded-2xl border border-gray-300/40 shadow-card flex items-center justify-center p-4">
          <Image
            src={selectedImg}
            alt={product.name}
            fill
            sizes="(max-width: 1024px) 100vw, 500px"
            className="object-contain p-8"
            priority
          />
        </div>

        {/* Thumbnails list */}
        {product_images.length > 1 && (
          <div className="flex gap-4 overflow-x-auto py-2">
            {product_images.map((img) => (
              <button
                key={img.id}
                onClick={() => setSelectedImg(img.url)}
                className={`relative w-20 aspect-square border rounded-xl flex items-center justify-center p-2 bg-paper transition-all ${
                  selectedImg === img.url ? "border-accent ring-2 ring-accent/15" : "border-gray-300 hover:border-gray-500"
                }`}
              >
                <Image
                  src={img.url}
                  alt={img.alt_text || product.name}
                  fill
                  sizes="80px"
                  className="object-contain p-1"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 2. ACTIONS/SPECS COL */}
      <div className="lg:col-span-6 flex flex-col items-start text-left gap-6">
        <div>
          {/* Breadcrumbs */}
          <div className="flex items-center gap-1.5 text-xs font-semibold text-accent mb-2">
            <span className="opacity-70">{product.brand?.name || "Premium"}</span>
            <span className="opacity-40">/</span>
            <span className="opacity-70">{product.category?.name}</span>
          </div>

          <h1 className="text-3xl md:text-4xl font-sans font-semibold tracking-tight text-ink">
            {product.name}
          </h1>
          
          <div className="text-xs text-gray-500 mt-1.5 font-medium uppercase tracking-wider">
            SKU: {currentSku}
          </div>
        </div>

        {/* Pricing */}
        <div className="flex items-baseline gap-3">
          <span className="text-3xl font-sans font-semibold text-accent">
            ₦{Number(displayPrice).toLocaleString("en-NG")}
          </span>
          {hasSale && !matchedVariant?.price_override && (
            <span className="line-through text-base text-gray-500 font-normal">
              ₦{Number(product.base_price).toLocaleString("en-NG")}
            </span>
          )}
        </div>

        {/* Description */}
        <p className="text-gray-700 text-[15px] leading-relaxed border-b border-gray-300/30 pb-6 w-full">
          {product.description}
        </p>

        {/* Dynamic Attribute Selectors (Variants) */}
        {has_variants && attributeKeys.map((key) => {
          const uniqueValues = Array.from(
            new Set(product_variants.map((v) => v.attributes[key]))
          );

          return (
            <div key={key} className="w-full flex flex-col items-start gap-2.5 border-b border-gray-300/30 pb-6">
              <span className="text-xs font-semibold text-ink uppercase tracking-wider">
                Select {key}
              </span>
              <div className="flex flex-wrap gap-2.5">
                {uniqueValues.map((val) => {
                  const isSelected = selectedAttrs[key] === val;
                  return (
                    <button
                      key={val}
                      onClick={() => handleAttrSelect(key, val)}
                      className={`text-xs font-semibold px-5 py-2.5 rounded-full border transition-all ${
                        isSelected 
                          ? "bg-accent border-accent text-white" 
                          : "border-gray-300 hover:border-gray-500 bg-paper text-ink"
                      }`}
                    >
                      {val}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}

        {/* Stock status & Checkout buttons */}
        <div className="w-full flex flex-col gap-4">
          <div className="flex items-center gap-2 font-sans font-semibold text-xs text-gray-500">
            <span>Availability:</span>
            {currentStock <= 0 ? (
              <span className="text-error font-bold">Out of Stock</span>
            ) : currentStock <= 5 ? (
              <span className="text-accent font-bold">Low Stock ({currentStock} left)</span>
            ) : (
              <span className="text-success font-bold">In Stock ({currentStock} available)</span>
            )}
          </div>

          {currentStock > 0 && (
            <div className="flex gap-4 mt-2">
              {/* Quantity Select */}
              <div className="flex border border-gray-300 bg-paper rounded-full overflow-hidden h-12">
                <button
                  disabled={quantity <= 1}
                  onClick={() => setQuantity((q) => q - 1)}
                  className="px-4 hover:bg-canvas disabled:opacity-30 font-bold transition-colors text-sm"
                >
                  -
                </button>
                <input
                  type="text"
                  readOnly
                  value={quantity}
                  className="w-10 text-center text-sm font-semibold focus:outline-none bg-transparent"
                />
                <button
                  disabled={quantity >= currentStock}
                  onClick={() => setQuantity((q) => q + 1)}
                  className="px-4 hover:bg-canvas disabled:opacity-30 font-bold transition-colors text-sm"
                >
                  +
                </button>
              </div>

              {/* Add to Cart button */}
              <button 
                onClick={() => alert(`Added ${quantity} ${product.name} to cart!`)}
                className="btn-primary h-12 flex items-center justify-center text-sm font-semibold flex-grow"
              >
                Add to Cart
              </button>
            </div>
          )}
        </div>

        {/* Specifications Table (Borderless Hairline Style) */}
        {Object.keys(specifications).length > 0 && (
          <div className="w-full mt-6">
            <h3 className="font-sans font-semibold text-xs uppercase tracking-wider text-ink border-b border-gray-300 pb-2 mb-4">
              Specifications
            </h3>
            <div className="border border-gray-300/40 bg-paper rounded-2xl overflow-hidden shadow-card">
              <table className="w-full text-left font-sans text-xs divide-y divide-gray-300/30">
                <tbody>
                  {Object.entries(specifications).map(([key, val]) => (
                    <tr key={key} className="divide-x divide-gray-300/30">
                      <td className="bg-canvas/30 font-semibold p-4 w-1/3 text-gray-500 border-r border-gray-300/30">{key}</td>
                      <td className="p-4 font-semibold text-ink">{val}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Loader2, Plus, Trash2, ArrowLeft, Image as ImageIcon } from "lucide-react";
import Link from "next/link";

interface Category {
  id: string;
  name: string;
}

interface Brand {
  id: string;
  name: string;
}

interface VariantInput {
  id?: string;
  variant_name: string;
  price_override: string;
  stock_quantity: number;
  sku: string;
  attributes: { key: string; value: string }[];
}

interface SpecInput {
  key: string;
  value: string;
}

interface ImageInput {
  url: string;
  alt_text: string;
  is_primary: boolean;
}

interface ProductFormProps {
  categories: Category[];
  brands: Brand[];
  initialProduct?: any; // If passed, we are in Edit Mode
}

export default function ProductForm({ categories, brands, initialProduct }: ProductFormProps) {
  const router = useRouter();
  const supabase = createClient();
  const isEditMode = !!initialProduct;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 1. Basic Fields State
  const [name, setName] = useState(initialProduct?.name || "");
  const [slug, setSlug] = useState(initialProduct?.slug || "");
  const [description, setDescription] = useState(initialProduct?.description || "");
  const [categoryId, setCategoryId] = useState(initialProduct?.category_id || "");
  const [brandId, setBrandId] = useState(initialProduct?.brand_id || "");
  const [basePrice, setBasePrice] = useState(initialProduct?.base_price ? initialProduct.base_price.toString() : "");
  const [salePrice, setSalePrice] = useState(initialProduct?.sale_price ? initialProduct.sale_price.toString() : "");
  const [sku, setSku] = useState(initialProduct?.sku || "");
  const [stockQuantity, setStockQuantity] = useState<number>(initialProduct?.stock_quantity || 0);
  const [status, setStatus] = useState<"draft" | "published" | "archived">(initialProduct?.status || "draft");
  const [isFeatured, setIsFeatured] = useState<boolean>(initialProduct?.is_featured || false);
  const [hasVariants, setHasVariants] = useState<boolean>(initialProduct?.has_variants || false);

  // 2. Specifications state (Key-Value)
  const [specs, setSpecs] = useState<SpecInput[]>(() => {
    if (initialProduct?.specifications) {
      return Object.entries(initialProduct.specifications).map(([key, value]) => ({
        key,
        value: value as string,
      }));
    }
    return [{ key: "", value: "" }];
  });

  // 3. Variants State
  const [variants, setVariants] = useState<VariantInput[]>(() => {
    if (initialProduct?.product_variants && initialProduct.product_variants.length > 0) {
      return initialProduct.product_variants.map((v: any) => ({
        id: v.id,
        variant_name: v.variant_name,
        price_override: v.price_override ? v.price_override.toString() : "",
        stock_quantity: v.stock_quantity,
        sku: v.sku || "",
        attributes: Object.entries(v.attributes || {}).map(([key, value]) => ({
          key,
          value: value as string,
        })),
      }));
    }
    return [];
  });

  // 4. Image attachments state (File uploads + URL fallbacks)
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imageUrls, setImageUrls] = useState<ImageInput[]>(() => {
    if (initialProduct?.product_images && initialProduct.product_images.length > 0) {
      return initialProduct.product_images.map((img: any) => ({
        url: img.url,
        alt_text: img.alt_text || "",
        is_primary: img.is_primary || false,
      }));
    }
    return [{ url: "", alt_text: "", is_primary: true }];
  });

  // Auto-generate URL friendly slug from product name in create mode
  useEffect(() => {
    if (!isEditMode && name) {
      setSlug(
        name
          .toLowerCase()
          .replace(/[^a-z0-9\s-]/g, "")
          .replace(/\s+/g, "-")
          .replace(/-+/g, "-")
          .trim()
      );
    }
  }, [name, isEditMode]);

  // Spec handlers
  const addSpecField = () => setSpecs([...specs, { key: "", value: "" }]);
  const removeSpecField = (idx: number) => setSpecs(specs.filter((_, i) => i !== idx));
  const handleSpecChange = (idx: number, field: keyof SpecInput, val: string) => {
    const updated = [...specs];
    updated[idx][field] = val;
    setSpecs(updated);
  };

  // Variant handlers
  const addVariant = () => {
    setVariants([
      ...variants,
      {
        variant_name: "",
        price_override: "",
        stock_quantity: 0,
        sku: "",
        attributes: [{ key: "", value: "" }],
      },
    ]);
  };
  const removeVariant = (idx: number) => setVariants(variants.filter((_, i) => i !== idx));
  const handleVariantChange = (variantIdx: number, field: keyof Omit<VariantInput, "attributes">, val: any) => {
    const updated = [...variants];
    updated[variantIdx] = { ...updated[variantIdx], [field]: val };
    setVariants(updated);
  };
  const handleVariantAttrChange = (variantIdx: number, attrIdx: number, field: "key" | "value", val: string) => {
    const updated = [...variants];
    updated[variantIdx].attributes[attrIdx][field] = val;
    setVariants(updated);
  };
  const addVariantAttr = (variantIdx: number) => {
    const updated = [...variants];
    updated[variantIdx].attributes.push({ key: "", value: "" });
    setVariants(updated);
  };
  const removeVariantAttr = (variantIdx: number, attrIdx: number) => {
    const updated = [...variants];
    updated[variantIdx].attributes = updated[variantIdx].attributes.filter((_, i) => i !== attrIdx);
    setVariants(updated);
  };

  // Image URL inputs handler
  const addImageUrlField = () => setImageUrls([...imageUrls, { url: "", alt_text: "", is_primary: false }]);
  const removeImageUrlField = (idx: number) => {
    const updated = imageUrls.filter((_, i) => i !== idx);
    // Ensure at least one primary image matches
    if (imageUrls[idx]?.is_primary && updated.length > 0) {
      updated[0].is_primary = true;
    }
    setImageUrls(updated);
  };
  const handleImageUrlChange = (idx: number, field: keyof ImageInput, val: any) => {
    const updated = imageUrls.map((item, i) => {
      if (i === idx) {
        return { ...item, [field]: val };
      }
      if (field === "is_primary" && val === true) {
        return { ...item, is_primary: false }; // set others false
      }
      return item;
    });
    setImageUrls(updated);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setImageFiles(Array.from(e.target.files));
    }
  };

  // Main Submit Action
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Basic Validations
    if (!categoryId) {
      setError("Please select a product category.");
      setLoading(false);
      return;
    }

    try {
      // 1. Upload files if any are selected
      const finalImageRecords: { url: string; alt_text: string; is_primary: boolean }[] = [];

      // Add existing or manual image URLs
      imageUrls.forEach((img) => {
        if (img.url.trim()) {
          finalImageRecords.push({
            url: img.url.trim(),
            alt_text: img.alt_text.trim() || name,
            is_primary: img.is_primary,
          });
        }
      });

      for (const file of imageFiles) {
        const fileExt = file.name.split(".").pop();
        const filePath = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

        // Upload to public product-images bucket
        const { error: uploadError } = await supabase.storage
          .from("product-images")
          .upload(filePath, file);

        if (uploadError) {
          console.error("Storage upload failed:", uploadError);
          throw new Error(`Image upload failed: ${uploadError.message}. Make sure your bucket 'product-images' exists on Supabase.`);
        }

        const { data: { publicUrl } } = supabase.storage
          .from("product-images")
          .getPublicUrl(filePath);

        // Make the first uploaded image primary if no primary exists
        const hasPrimary = finalImageRecords.some((img) => img.is_primary);
        finalImageRecords.push({
          url: publicUrl,
          alt_text: name,
          is_primary: !hasPrimary && finalImageRecords.length === 0,
        });
      }

      // Compile specs JSONB
      const specificationsJson: Record<string, string> = {};
      specs.forEach((item) => {
        if (item.key.trim() && item.value.trim()) {
          specificationsJson[item.key.trim()] = item.value.trim();
        }
      });

      const productPayload = {
        name: name.trim(),
        slug: slug.trim(),
        description: description.trim(),
        category_id: categoryId,
        brand_id: brandId || null,
        base_price: parseFloat(basePrice),
        sale_price: salePrice ? parseFloat(salePrice) : null,
        sku: sku.trim() || null,
        stock_quantity: hasVariants ? 0 : stockQuantity,
        has_variants: hasVariants,
        specifications: specificationsJson,
        status: status,
        is_featured: isFeatured,
      };

      let productId = initialProduct?.id;

      if (isEditMode) {
        // UPDATE existing product
        const { error: updateError } = await supabase
          .from("products")
          .update(productPayload)
          .eq("id", productId);

        if (updateError) throw updateError;
      } else {
        // INSERT new product
        const { data: newProd, error: insertError } = await supabase
          .from("products")
          .insert(productPayload)
          .select()
          .single();

        if (insertError) throw insertError;
        productId = newProd.id;
      }

      // 2. Sync product images (Delete old and insert new list)
      if (isEditMode) {
        await supabase.from("product_images").delete().eq("product_id", productId);
      }
      if (finalImageRecords.length > 0) {
        const imagesWithId = finalImageRecords.map((img) => ({
          product_id: productId,
          url: img.url,
          alt_text: img.alt_text,
          is_primary: img.is_primary,
        }));
        const { error: imgInsertError } = await supabase.from("product_images").insert(imagesWithId);
        if (imgInsertError) throw imgInsertError;
      }

      // 3. Sync variants
      if (isEditMode) {
        await supabase.from("product_variants").delete().eq("product_id", productId);
      }
      if (hasVariants && variants.length > 0) {
        const variantsWithId = variants.map((v) => {
          const attributesJson: Record<string, string> = {};
          v.attributes.forEach((attr) => {
            if (attr.key.trim() && attr.value.trim()) {
              attributesJson[attr.key.trim()] = attr.value.trim();
            }
          });

          return {
            product_id: productId,
            variant_name: v.variant_name.trim() || Object.values(attributesJson).join(" / "),
            attributes: attributesJson,
            price_override: v.price_override ? parseFloat(v.price_override) : null,
            stock_quantity: v.stock_quantity,
            sku: v.sku.trim() || null,
          };
        });

        const { error: variantInsertError } = await supabase.from("product_variants").insert(variantsWithId);
        if (variantInsertError) throw variantInsertError;
      }

      alert(isEditMode ? "Product updated successfully." : "Product created successfully.");
      router.push("/admin/products");
      router.refresh();

    } catch (err: any) {
      console.error("Error saving product:", err);
      setError(err.message || "An unexpected error occurred. Please verify data formats.");
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-left font-sans pb-16">
      
      {/* 1. PRIMARY INPUTS COL */}
      <div className="lg:col-span-8 flex flex-col gap-6">
        
        {/* Back Link */}
        <Link href="/admin/products" className="inline-flex items-center gap-1.5 text-xs font-semibold text-accent hover:text-accent-dark transition-colors mb-2">
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to products list</span>
        </Link>

        {error && (
          <div className="bg-error/10 border border-error text-error text-xs font-medium p-4 rounded-xl">
            {error}
          </div>
        )}

        {/* Basic Details Box */}
        <div className="border border-gray-300/60 p-6 bg-paper rounded-2xl shadow-card flex flex-col gap-5">
          <h3 className="font-sans font-semibold text-sm text-ink border-b border-gray-100 pb-2.5">
            Product details
          </h3>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="name" className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Product Name</label>
            <input
              id="name"
              type="text"
              required
              disabled={loading}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. iPhone 15 Pro Max"
              className="bg-canvas border border-gray-300 p-3.5 font-sans text-xs focus:outline-none focus:ring-2 focus:ring-accent/15 focus:border-accent rounded-xl text-ink"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="slug" className="text-xs font-semibold text-gray-500 uppercase tracking-wider">URL slug (unique)</label>
              <input
                id="slug"
                type="text"
                required
                disabled={loading}
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="iphone-15-pro-max"
                className="bg-canvas border border-gray-300 p-3.5 font-sans text-xs focus:outline-none focus:ring-2 focus:ring-accent/15 focus:border-accent rounded-xl text-ink"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="sku" className="text-xs font-semibold text-gray-500 uppercase tracking-wider">SKU Code</label>
              <input
                id="sku"
                type="text"
                disabled={loading}
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                placeholder="AP-IP15PM-256"
                className="bg-canvas border border-gray-300 p-3.5 font-sans text-xs focus:outline-none focus:ring-2 focus:ring-accent/15 focus:border-accent rounded-xl text-ink"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="desc" className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Description</label>
            <textarea
              id="desc"
              required
              disabled={loading}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              placeholder="Enter product description..."
              className="bg-canvas border border-gray-300 p-3.5 font-sans text-xs focus:outline-none focus:ring-2 focus:ring-accent/15 focus:border-accent rounded-xl text-ink"
            />
          </div>
        </div>

        {/* Categories, Brands & Pricing */}
        <div className="border border-gray-300/60 p-6 bg-paper rounded-2xl shadow-card flex flex-col gap-5">
          <h3 className="font-sans font-semibold text-sm text-ink border-b border-gray-100 pb-2.5">
            Classification & Pricing
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="category" className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Category</label>
              <select
                id="category"
                required
                disabled={loading}
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="bg-canvas border border-gray-300 p-3.5 font-sans text-xs focus:outline-none focus:ring-2 focus:ring-accent/15 focus:border-accent rounded-xl text-ink"
              >
                <option value="">Select category...</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="brand" className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Brand</label>
              <select
                id="brand"
                disabled={loading}
                value={brandId}
                onChange={(e) => setBrandId(e.target.value)}
                className="bg-canvas border border-gray-300 p-3.5 font-sans text-xs focus:outline-none focus:ring-2 focus:ring-accent/15 focus:border-accent rounded-xl text-ink"
              >
                <option value="">No brand / generic...</option>
                {brands.map((br) => (
                  <option key={br.id} value={br.id}>{br.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="basePrice" className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Base Price (₦ NGN)</label>
              <input
                id="basePrice"
                type="number"
                required
                disabled={loading}
                value={basePrice}
                onChange={(e) => setBasePrice(e.target.value)}
                placeholder="1600000"
                className="bg-canvas border border-gray-300 p-3.5 font-sans text-xs focus:outline-none focus:ring-2 focus:ring-accent/15 focus:border-accent rounded-xl text-ink"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="salePrice" className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Sale Price (₦ NGN - optional)</label>
              <input
                id="salePrice"
                type="number"
                disabled={loading}
                value={salePrice}
                onChange={(e) => setSalePrice(e.target.value)}
                placeholder="1550000"
                className="bg-canvas border border-gray-300 p-3.5 font-sans text-xs focus:outline-none focus:ring-2 focus:ring-accent/15 focus:border-accent rounded-xl text-ink"
              />
            </div>
          </div>
        </div>

        {/* Specifications (Dynamic Key-Value Grid) */}
        <div className="border border-gray-300/60 p-6 bg-paper rounded-2xl shadow-card flex flex-col gap-5">
          <div className="flex justify-between items-center border-b border-gray-100 pb-2.5">
            <h3 className="font-sans font-semibold text-sm text-ink">
              Specifications
            </h3>
            <button
              type="button"
              onClick={addSpecField}
              className="text-xs font-bold text-accent hover:text-accent-dark flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add row</span>
            </button>
          </div>

          <div className="flex flex-col gap-3.5">
            {specs.map((spec, idx) => (
              <div key={idx} className="flex gap-4 items-center">
                <input
                  type="text"
                  placeholder="e.g. RAM"
                  disabled={loading}
                  value={spec.key}
                  onChange={(e) => handleSpecChange(idx, "key", e.target.value)}
                  className="bg-canvas border border-gray-300 p-3 font-sans text-xs focus:outline-none focus:ring-2 focus:ring-accent/15 focus:border-accent rounded-xl text-ink flex-grow w-1/3"
                />
                <input
                  type="text"
                  placeholder="e.g. 8GB"
                  disabled={loading}
                  value={spec.value}
                  onChange={(e) => handleSpecChange(idx, "value", e.target.value)}
                  className="bg-canvas border border-gray-300 p-3 font-sans text-xs focus:outline-none focus:ring-2 focus:ring-accent/15 focus:border-accent rounded-xl text-ink flex-grow w-2/3"
                />
                <button
                  type="button"
                  onClick={() => removeSpecField(idx)}
                  className="text-gray-400 hover:text-error transition-colors p-1"
                  title="Remove spec"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Product Variants (Color, Storage options) */}
        <div className="border border-gray-300/60 p-6 bg-paper rounded-2xl shadow-card flex flex-col gap-5">
          <div className="flex justify-between items-center border-b border-gray-100 pb-2.5">
            <div className="flex flex-col text-left">
              <h3 className="font-sans font-semibold text-sm text-ink">
                Product variants
              </h3>
              <p className="text-[10px] text-gray-400 mt-0.5">Toggle option for storage or color override price/stock counts.</p>
            </div>
            
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={hasVariants}
                  onChange={(e) => setHasVariants(e.target.checked)}
                  className="accent-accent"
                />
                <span>Has Variants</span>
              </label>

              {hasVariants && (
                <button
                  type="button"
                  onClick={addVariant}
                  className="text-xs font-bold text-accent hover:text-accent-dark flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add variant</span>
                </button>
              )}
            </div>
          </div>

          {!hasVariants ? (
            <div className="flex flex-col gap-1.5">
              <label htmlFor="baseStock" className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Inventory Stock count</label>
              <input
                id="baseStock"
                type="number"
                required
                disabled={loading}
                value={stockQuantity}
                onChange={(e) => setStockQuantity(parseInt(e.target.value) || 0)}
                placeholder="20"
                className="bg-canvas border border-gray-300 p-3.5 font-sans text-xs focus:outline-none focus:ring-2 focus:ring-accent/15 focus:border-accent rounded-xl text-ink"
              />
            </div>
          ) : variants.length === 0 ? (
            <div className="p-8 text-center text-gray-400 text-xs border border-dashed border-gray-300 rounded-xl">
              Enable variants above and click "Add variant" to manage configurations.
            </div>
          ) : (
            <div className="flex flex-col gap-6 divide-y divide-gray-100">
              {variants.map((v, vIdx) => (
                <div key={vIdx} className="flex flex-col gap-4 pt-4 first:pt-0">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-semibold text-accent">Variant Option #{vIdx + 1}</span>
                    <button
                      type="button"
                      onClick={() => removeVariant(vIdx)}
                      className="text-gray-400 hover:text-error transition-colors p-1"
                      title="Remove variant"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="flex flex-col gap-1.5 col-span-1">
                      <label className="text-xs font-semibold text-gray-500">Variant Name</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Space Black / 256GB"
                        value={v.variant_name}
                        onChange={(e) => handleVariantChange(vIdx, "variant_name", e.target.value)}
                        className="bg-canvas border border-gray-300 p-3 font-sans text-xs focus:outline-none focus:ring-2 focus:ring-accent/15 focus:border-accent rounded-xl text-ink"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5 col-span-1">
                      <label className="text-xs font-semibold text-gray-500">Price Override (optional)</label>
                      <input
                        type="number"
                        placeholder="Price NGN"
                        value={v.price_override}
                        onChange={(e) => handleVariantChange(vIdx, "price_override", e.target.value)}
                        className="bg-canvas border border-gray-300 p-3 font-sans text-xs focus:outline-none focus:ring-2 focus:ring-accent/15 focus:border-accent rounded-xl text-ink"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5 col-span-1">
                      <label className="text-xs font-semibold text-gray-500">Stock Quantity</label>
                      <input
                        type="number"
                        required
                        placeholder="Stock count"
                        value={v.stock_quantity}
                        onChange={(e) => handleVariantChange(vIdx, "stock_quantity", parseInt(e.target.value) || 0)}
                        className="bg-canvas border border-gray-300 p-3 font-sans text-xs focus:outline-none focus:ring-2 focus:ring-accent/15 focus:border-accent rounded-xl text-ink"
                      />
                    </div>
                  </div>

                  {/* Attributes map list */}
                  <div className="flex flex-col gap-3 bg-canvas/30 p-4 border border-gray-300/30 rounded-xl">
                    <div className="flex justify-between items-center border-b border-gray-300/20 pb-2">
                      <span className="text-[10px] uppercase font-bold text-gray-400">Variant Attributes (JSON mappings)</span>
                      <button
                        type="button"
                        onClick={() => addVariantAttr(vIdx)}
                        className="text-[10px] font-bold text-accent flex items-center gap-0.5"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Add attribute</span>
                      </button>
                    </div>
                    {v.attributes.map((attr, attrIdx) => (
                      <div key={attrIdx} className="flex gap-2.5 items-center">
                        <input
                          type="text"
                          placeholder="e.g. storage"
                          value={attr.key}
                          onChange={(e) => handleVariantAttrChange(vIdx, attrIdx, "key", e.target.value)}
                          className="bg-canvas border border-gray-300 py-1.5 px-3 font-sans text-xs focus:outline-none rounded-lg text-ink w-1/3"
                        />
                        <input
                          type="text"
                          placeholder="e.g. 256GB"
                          value={attr.value}
                          onChange={(e) => handleVariantAttrChange(vIdx, attrIdx, "value", e.target.value)}
                          className="bg-canvas border border-gray-300 py-1.5 px-3 font-sans text-xs focus:outline-none rounded-lg text-ink w-2/3"
                        />
                        <button
                          type="button"
                          onClick={() => removeVariantAttr(vIdx, attrIdx)}
                          className="text-gray-400 hover:text-error transition-colors p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* 2. SIDEBAR STATE ACTIONS COL */}
      <div className="lg:col-span-4 flex flex-col gap-6">
        
        {/* Save Box */}
        <div className="border border-gray-300/60 p-6 bg-paper rounded-2xl shadow-card flex flex-col gap-5">
          <h3 className="font-sans font-semibold text-sm text-ink border-b border-gray-100 pb-2.5">
            Publication Status
          </h3>

          <div className="flex flex-col gap-1.5 text-left">
            <label htmlFor="status" className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</label>
            <select
              id="status"
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
              className="bg-canvas border border-gray-300 p-3.5 font-sans text-xs focus:outline-none focus:ring-2 focus:ring-accent/15 focus:border-accent rounded-xl text-ink"
            >
              <option value="draft">Draft / Hidden</option>
              <option value="published">Published / Public</option>
              <option value="archived">Archived</option>
            </select>
          </div>

          <div className="flex items-center justify-between border-t border-gray-100 pt-4 text-left">
            <div className="flex flex-col text-left">
              <label htmlFor="isFeatured" className="text-xs font-semibold text-ink">Featured Product</label>
              <span className="text-[10px] text-gray-400">Shows on homepage carousel</span>
            </div>
            <input
              id="isFeatured"
              type="checkbox"
              checked={isFeatured}
              onChange={(e) => setIsFeatured(e.target.checked)}
              className="accent-accent w-4 h-4 cursor-pointer"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary py-3.5 font-semibold text-sm w-full flex items-center justify-center gap-2 hover:bg-accent-dark mt-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Saving records...</span>
              </>
            ) : (
              <span>Save Product</span>
            )}
          </button>
        </div>

        {/* Product Images Box */}
        <div className="border border-gray-300/60 p-6 bg-paper rounded-2xl shadow-card flex flex-col gap-5 text-left">
          <h3 className="font-sans font-semibold text-sm text-ink border-b border-gray-100 pb-2.5">
            Product Images
          </h3>

          {/* File selector */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Upload files</label>
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:bg-canvas/40 transition-colors cursor-pointer relative flex flex-col items-center justify-center">
              <ImageIcon className="w-8 h-8 text-gray-400 mb-2" />
              <span className="text-xs font-bold text-gray-500">Attach device photos</span>
              <span className="text-[10px] text-gray-400 mt-1">Multi-files upload supported</span>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileChange}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              />
            </div>
            {imageFiles.length > 0 && (
              <div className="mt-2 text-xs text-accent font-semibold">
                📎 {imageFiles.length} file(s) selected
              </div>
            )}
          </div>

          <div className="hairline-divider my-1" />

          {/* Manual image URLs */}
          <div className="flex flex-col gap-3">
            <div className="flex justify-between items-center">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Image URLs list</label>
              <button
                type="button"
                onClick={addImageUrlField}
                className="text-[10px] font-bold text-accent flex items-center gap-0.5"
              >
                <Plus className="w-3 h-3" />
                <span>Add URL</span>
              </button>
            </div>

            {imageUrls.map((img, idx) => (
              <div key={idx} className="flex flex-col gap-2 bg-canvas/30 p-3.5 border border-gray-300/30 rounded-xl relative">
                <button
                  type="button"
                  onClick={() => removeImageUrlField(idx)}
                  className="absolute right-3 top-3 text-gray-400 hover:text-error transition-colors p-1"
                  title="Remove image URL"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>

                <div className="flex flex-col gap-1 pr-6">
                  <span className="text-[10px] font-bold text-gray-400">Image #{idx + 1} URL</span>
                  <input
                    type="text"
                    required
                    placeholder="https://images.unsplash.com/..."
                    value={img.url}
                    onChange={(e) => handleImageUrlChange(idx, "url", e.target.value)}
                    className="bg-canvas border border-gray-300 py-1.5 px-3 font-sans text-xs focus:outline-none rounded-lg text-ink"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2 mt-1">
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-bold text-gray-400">Alt text</span>
                    <input
                      type="text"
                      placeholder="iPhone preview"
                      value={img.alt_text}
                      onChange={(e) => handleImageUrlChange(idx, "alt_text", e.target.value)}
                      className="bg-canvas border border-gray-300 py-1.5 px-3 font-sans text-xs focus:outline-none rounded-lg text-ink"
                    />
                  </div>
                  <label className="flex items-center gap-1.5 text-[10px] font-bold text-gray-500 cursor-pointer select-none mt-4 justify-center">
                    <input
                      type="checkbox"
                      checked={img.is_primary}
                      onChange={(e) => handleImageUrlChange(idx, "is_primary", e.target.checked)}
                      className="accent-accent w-3 h-3"
                    />
                    <span>Primary Image</span>
                  </label>
                </div>
              </div>
            ))}
          </div>

        </div>

      </div>

    </form>
  );
}

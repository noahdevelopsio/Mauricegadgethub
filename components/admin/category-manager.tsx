"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Loader2, Plus, Trash2, FolderOpen } from "lucide-react";

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  is_active: boolean;
}

interface CategoryManagerProps {
  initialCategories: Category[];
}

export default function CategoryManager({ initialCategories }: CategoryManagerProps) {
  const router = useRouter();
  const supabase = createClient();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [isActive, setIsActive] = useState(true);

  // Generate slug dynamically from category name
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setName(val);
    setSlug(
      val
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .trim()
    );
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (name.trim().length < 2) {
      setError("Category name must be at least 2 characters.");
      setLoading(false);
      return;
    }

    try {
      const { error: insertError } = await supabase.from("categories").insert({
        name: name.trim(),
        slug: slug.trim(),
        description: description.trim() || null,
        is_active: isActive,
      });

      if (insertError) throw insertError;

      alert("Category added successfully.");
      setName("");
      setSlug("");
      setDescription("");
      setIsActive(true);
      router.refresh();
      
    } catch (err: any) {
      console.error("Error creating category:", err);
      setError(err.message || "Failed to create category. Ensure slug is unique.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCategory = async (id: string, catName: string) => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete category '${catName}'? Products in this category will have their category associations removed.`
    );
    if (!confirmDelete) return;

    try {
      const { error: deleteError } = await supabase.from("categories").delete().eq("id", id);
      if (deleteError) throw deleteError;

      alert("Category deleted successfully.");
      router.refresh();
    } catch (err: any) {
      console.error("Error deleting category:", err);
      alert(err.message || "Failed to delete category.");
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-left font-sans">
      
      {/* 1. CATEGORIES LISTING (Left) */}
      <div className="lg:col-span-7 border border-gray-300/60 bg-paper rounded-2xl overflow-hidden shadow-card flex flex-col h-fit">
        <div className="p-6 border-b border-gray-100 flex items-center gap-2">
          <FolderOpen className="w-5 h-5 text-accent" />
          <h3 className="font-sans font-semibold text-sm text-ink">Active Categories</h3>
        </div>

        {initialCategories.length === 0 ? (
          <div className="p-12 text-center text-gray-400 text-sm">
            No categories registered in database yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs font-sans">
              <thead>
                <tr className="bg-canvas border-b border-gray-300 text-gray-500 uppercase font-bold tracking-wider">
                  <th className="p-4">Category Name</th>
                  <th className="p-4">URL Slug</th>
                  <th className="p-4 text-center">Status</th>
                  <th className="p-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-300/30 text-gray-700 font-medium">
                {initialCategories.map((cat) => (
                  <tr key={cat.id} className="hover:bg-canvas/30 transition-colors">
                    <td className="p-4 font-semibold text-ink">
                      <span>{cat.name}</span>
                      {cat.description && (
                        <span className="block text-[10px] text-gray-400 font-medium mt-0.5 max-w-[200px] truncate">
                          {cat.description}
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-gray-500 font-semibold">{cat.slug}</td>
                    <td className="p-4 text-center">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full border text-[9px] font-bold uppercase ${
                        cat.is_active 
                          ? "text-success bg-success/5 border-success/20" 
                          : "text-gray-500 bg-gray-100/50 border-gray-300"
                      }`}>
                        {cat.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => handleDeleteCategory(cat.id, cat.name)}
                        className="text-gray-400 hover:text-error transition-colors p-1.5 rounded-lg border border-transparent hover:border-gray-200 hover:bg-canvas"
                        title="Delete category"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 2. ADD CATEGORY FORM (Right) */}
      <div className="lg:col-span-5 border border-gray-300/60 p-6 bg-paper rounded-2xl shadow-card h-fit flex flex-col gap-5">
        <h3 className="font-sans font-semibold text-sm text-ink border-b border-gray-100 pb-2.5">
          Add new category
        </h3>

        {error && (
          <div className="bg-error/10 border border-error text-error text-xs font-medium p-4 rounded-xl text-left">
            {error}
          </div>
        )}

        <form onSubmit={handleAddCategory} className="flex flex-col gap-4 text-left">
          
          <div className="flex flex-col gap-1.5">
            <label htmlFor="name" className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Category name</label>
            <input
              id="name"
              type="text"
              required
              disabled={loading}
              value={name}
              onChange={handleNameChange}
              placeholder="e.g. Laptops"
              className="bg-canvas border border-gray-300 p-3.5 font-sans text-xs focus:outline-none focus:ring-2 focus:ring-accent/15 focus:border-accent rounded-xl text-ink"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="slug" className="text-xs font-semibold text-gray-500 uppercase tracking-wider">URL slug (unique)</label>
            <input
              id="slug"
              type="text"
              required
              disabled={loading}
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="laptops"
              className="bg-canvas border border-gray-300 p-3.5 font-sans text-xs focus:outline-none focus:ring-2 focus:ring-accent/15 focus:border-accent rounded-xl text-ink"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="description" className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Description</label>
            <textarea
              id="description"
              disabled={loading}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Enter optional description..."
              className="bg-canvas border border-gray-300 p-3.5 font-sans text-xs focus:outline-none focus:ring-2 focus:ring-accent/15 focus:border-accent rounded-xl text-ink"
            />
          </div>

          <div className="flex items-center justify-between border-t border-gray-100 pt-4 text-left">
            <div className="flex flex-col">
              <label htmlFor="is_active" className="text-xs font-semibold text-ink">Active Status</label>
              <span className="text-[9px] text-gray-400">Available to display in storefront</span>
            </div>
            <input
              id="is_active"
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="accent-accent w-4 h-4 cursor-pointer"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary py-3.5 font-semibold text-sm w-full flex items-center justify-center gap-2 hover:bg-accent-dark transition-all duration-200 mt-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Creating category...</span>
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                <span>Add Category</span>
              </>
            )}
          </button>

        </form>
      </div>

    </div>
  );
}

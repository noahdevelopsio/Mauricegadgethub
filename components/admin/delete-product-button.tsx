"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Trash2, Loader2 } from "lucide-react";

interface DeleteProductButtonProps {
  productId: string;
  productName: string;
}

export default function DeleteProductButton({ productId, productName }: DeleteProductButtonProps) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete '${productName}'? This action cannot be undone and will delete all associated variants and images.`
    );
    if (!confirmDelete) return;

    setDeleting(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.from("products").delete().eq("id", productId);

      if (error) {
        throw error;
      }

      alert("Product deleted successfully.");
      router.refresh(); // Triggers server data reload
    } catch (err: any) {
      console.error("Error deleting product:", err);
      alert(err.message || "Failed to delete product. Please try again.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={deleting}
      className="text-gray-400 hover:text-error transition-colors p-1.5 rounded-lg border border-transparent hover:border-gray-200 hover:bg-canvas disabled:opacity-50"
      title="Delete product"
    >
      {deleting ? (
        <Loader2 className="w-4 h-4 animate-spin text-gray-500" />
      ) : (
        <Trash2 className="w-4 h-4" />
      )}
    </button>
  );
}

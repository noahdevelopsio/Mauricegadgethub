"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { LogOut } from "lucide-react";

export default function SignOutButton() {
  const router = useRouter();
  const supabase = createClient();

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      router.push("/admin/login");
      router.refresh();
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <button
      onClick={handleSignOut}
      className="flex items-center gap-2 text-xs font-semibold text-gray-500 hover:text-accent transition-colors p-1.5 rounded-lg border border-transparent hover:border-gray-300 hover:bg-canvas"
    >
      <LogOut className="w-4 h-4" />
      <span className="hidden sm:inline">Sign Out</span>
    </button>
  );
}

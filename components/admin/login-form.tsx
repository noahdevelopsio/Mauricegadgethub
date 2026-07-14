"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Loader2, Lock, ShieldAlert } from "lucide-react";

interface LoginFormProps {
  errorType?: string;
}

export default function AdminLoginForm({ errorType }: LoginFormProps) {
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(
    errorType === "unauthorized"
      ? "Access Denied: Admin or Staff privileges required."
      : null
  );

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setAuthError(null);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password,
      });

      if (error) {
        throw error;
      }

      // Force page refresh on redirect to ensure middleware checks the new session
      router.push("/admin");
      router.refresh();
      
    } catch (err: any) {
      console.error("Login verification exception:", err);
      setAuthError(err.message || "Authentication failed. Please verify credentials.");
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-paper border border-gray-300/60 p-8 rounded-2xl shadow-card font-sans text-left">
      
      {/* Brand Icon Header */}
      <div className="flex flex-col items-center text-center mb-8">
        <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center text-accent border border-accent/20 mb-4">
          <Lock className="w-5 h-5" />
        </div>
        <h2 className="text-2xl font-sans font-semibold text-ink tracking-tight">
          Admin Portal
        </h2>
        <p className="text-gray-500 text-xs mt-1">
          Sign in to manage inventory and fulfillment.
        </p>
      </div>

      {authError && (
        <div className="bg-error/10 border border-error/20 text-error text-xs font-medium p-4 rounded-xl mb-6 flex gap-2 items-start">
          <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{authError}</span>
        </div>
      )}

      <form onSubmit={handleLogin} className="flex flex-col gap-5">
        
        <div className="flex flex-col gap-1.5">
          <label htmlFor="email" className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Email address</label>
          <input
            id="email"
            type="email"
            required
            disabled={loading}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@mauricegadgetshub.com"
            className="bg-canvas border border-gray-300 p-3.5 font-sans text-xs focus:outline-none focus:ring-2 focus:ring-accent/15 focus:border-accent rounded-xl text-ink"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="password" className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Password</label>
          <input
            id="password"
            type="password"
            required
            disabled={loading}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="bg-canvas border border-gray-300 p-3.5 font-sans text-xs focus:outline-none focus:ring-2 focus:ring-accent/15 focus:border-accent rounded-xl text-ink"
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
              <span>Verifying session...</span>
            </>
          ) : (
            <span>Sign In</span>
          )}
        </button>

      </form>
    </div>
  );
}

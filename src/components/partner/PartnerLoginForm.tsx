"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { loginPartnerAction } from "@/lib/actions/partner-auth.actions";

export function PartnerLoginForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const res = await loginPartnerAction(formData);

    if (!res.success) {
      setError(res.error || "Failed to sign in.");
      setLoading(false);
    } else {
      router.push("/partner");
      router.refresh();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 bg-red-950/50 border border-red-500/40 rounded-lg text-xs text-red-300">
          {error}
        </div>
      )}

      <div>
        <label className="block text-xs font-medium text-slate-300 mb-1">Registered Partner Email</label>
        <input
          type="email"
          name="email"
          required
          placeholder="broker@agency.com"
          className="w-full px-3.5 py-2.5 bg-slate-900/80 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-slate-300 mb-1">Password</label>
        <input
          type="password"
          name="password"
          required
          placeholder="••••••••"
          className="w-full px-3.5 py-2.5 bg-slate-900/80 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-2.5 px-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-semibold text-sm rounded-lg shadow-lg shadow-amber-500/20 transition-all hover:scale-[1.02] disabled:opacity-50 disabled:pointer-events-none"
      >
        {loading ? "Authenticating..." : "Access Partner Portal"}
      </button>
    </form>
  );
}

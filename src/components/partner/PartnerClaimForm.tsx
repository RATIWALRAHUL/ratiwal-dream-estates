"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { claimPartnerInvitationAction } from "@/lib/actions/partner-auth.actions";

export function PartnerClaimForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tokenFromUrl = searchParams.get("token") || "";

  const [token, setToken] = useState(tokenFromUrl);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append("token", token);
    formData.append("password", password);
    if (phone) formData.append("phone", phone);

    const res = await claimPartnerInvitationAction(formData);

    if (!res.success) {
      setError(res.error || "Failed to claim invitation.");
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
        <label className="block text-xs font-medium text-slate-300 mb-1">Invitation Security Token</label>
        <input
          type="text"
          name="token"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          required
          placeholder="Paste your 64-character invite token"
          className="w-full px-3.5 py-2.5 bg-slate-900/80 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 font-mono focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-slate-300 mb-1">Authorized Mobile Number</label>
        <input
          type="tel"
          name="phone"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="+91 98765 43210"
          className="w-full px-3.5 py-2.5 bg-slate-900/80 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-slate-300 mb-1">Create Password</label>
        <input
          type="password"
          name="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          placeholder="At least 8 characters"
          className="w-full px-3.5 py-2.5 bg-slate-900/80 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-slate-300 mb-1">Confirm Password</label>
        <input
          type="password"
          name="confirmPassword"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          placeholder="Confirm password"
          className="w-full px-3.5 py-2.5 bg-slate-900/80 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-2.5 px-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-semibold text-sm rounded-lg shadow-lg shadow-amber-500/20 transition-all hover:scale-[1.02] disabled:opacity-50 disabled:pointer-events-none"
      >
        {loading ? "Activating Account..." : "Accept & Activate Account"}
      </button>
    </form>
  );
}

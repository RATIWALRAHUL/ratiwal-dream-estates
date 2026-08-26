"use client";

import React, { useState, useTransition, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ShieldCheck, Lock, Mail, User, Phone, AlertCircle, ArrowRight, CheckCircle2 } from "lucide-react";
import { claimInvitationAction } from "@/lib/actions/portal-auth.actions";

export function PortalClaimForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tokenParam = searchParams.get("token") || "";

  const [token, setToken] = useState(tokenParam);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (tokenParam) {
      setToken(tokenParam);
    }
  }, [tokenParam]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!token.trim()) {
      setError("Please provide a valid invitation token.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    startTransition(async () => {
      const res = await claimInvitationAction({
        token: token.trim(),
        password,
        name: name.trim() || undefined,
        phone: phone.trim() || undefined,
      });

      if (!res.success) {
        setError(res.error || "Failed to claim invitation.");
      } else {
        setSuccess(true);
        setTimeout(() => {
          router.push("/portal");
          router.refresh();
        }, 1200);
      }
    });
  };

  if (success) {
    return (
      <div className="w-full max-w-md mx-auto bg-[#071a28]/90 backdrop-blur-xl border border-white/10 rounded-2xl p-8 text-center shadow-2xl">
        <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center mx-auto mb-4 text-emerald-400">
          <CheckCircle2 className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-serif font-bold text-white mb-2">
          Account Successfully Activated!
        </h2>
        <p className="text-xs text-slate-300">
          Redirecting you to your personal Ratiwal Dream Estates customer portal...
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-[#071a28]/90 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl">
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#087fc3] to-[#055a8c] flex items-center justify-center mx-auto mb-3 shadow-lg">
            <ShieldCheck className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-serif font-bold text-white tracking-wide">
            Activate Customer Portal
          </h1>
          <p className="text-xs text-slate-300 mt-1">
            Claim your invitation and set up your secure credentials.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start space-x-2.5 text-rose-300 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!tokenParam && (
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Invitation Token
              </label>
              <input
                type="text"
                required
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="Paste token from your invitation"
                className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-[#087fc3] focus:ring-1 focus:ring-[#087fc3]"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Full Legal Name (Optional if already registered)
            </label>
            <div className="relative">
              <User className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Vikramaditya Singh"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-[#087fc3] focus:ring-1 focus:ring-[#087fc3]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Phone Number (Optional)
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-[#087fc3] focus:ring-1 focus:ring-[#087fc3]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Create Password (min. 8 characters)
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-[#087fc3] focus:ring-1 focus:ring-[#087fc3]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Confirm Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-[#087fc3] focus:ring-1 focus:ring-[#087fc3]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full mt-2 py-3 px-4 rounded-xl bg-gradient-to-r from-[#087fc3] to-[#066ca8] hover:from-[#098cd8] hover:to-[#087fc3] text-white text-sm font-semibold shadow-lg shadow-[#087fc3]/20 flex items-center justify-center space-x-2 transition-all disabled:opacity-50 cursor-pointer"
          >
            <span>{isPending ? "Activating Account..." : "Activate & Access Portal"}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-white/10 text-center">
          <p className="text-xs text-slate-400">
            Already activated?{" "}
            <Link href="/portal/login" className="text-[#087fc3] hover:underline font-medium">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

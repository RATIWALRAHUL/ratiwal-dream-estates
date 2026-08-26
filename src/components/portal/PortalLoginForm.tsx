"use client";

import React, { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Lock, Mail, AlertCircle, ArrowRight } from "lucide-react";
import { loginCustomerAction } from "@/lib/actions/portal-auth.actions";

export function PortalLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnUrl = searchParams.get("returnUrl") || "/portal";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const formData = new FormData();
    formData.append("email", email);
    formData.append("password", password);

    startTransition(async () => {
      const res = await loginCustomerAction(formData);
      if (!res.success) {
        setError(res.error || "Invalid email or password.");
      } else {
        router.push(returnUrl);
        router.refresh();
      }
    });
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-[#071a28]/90 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block mx-auto mb-4 group" aria-label="Ratiwal Dream Estates Home">
            <Image
              src="/images/brand/ratiwal-logo-white.svg"
              alt="Ratiwal Dream Estates"
              width={220}
              height={80}
              priority
              className="h-10 sm:h-11 w-auto max-w-[200px] object-contain mx-auto transition-transform duration-200 group-hover:scale-[1.02]"
            />
          </Link>
          <h1 className="text-2xl font-serif font-bold text-white tracking-wide">
            Customer Sign In
          </h1>
          <p className="text-xs text-slate-300 mt-1">
            Access your Ratiwal Dream Estates bookings, payment plans and identity records.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start space-x-2.5 text-rose-300 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Registered Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-[#087fc3] focus:ring-1 focus:ring-[#087fc3] transition-all"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-medium text-slate-300">
                Password
              </label>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-[#087fc3] focus:ring-1 focus:ring-[#087fc3] transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full mt-2 py-3 px-4 rounded-xl bg-gradient-to-r from-[#087fc3] to-[#066ca8] hover:from-[#098cd8] hover:to-[#087fc3] text-white text-sm font-semibold shadow-lg shadow-[#087fc3]/20 flex items-center justify-center space-x-2 transition-all disabled:opacity-50 cursor-pointer"
          >
            <span>{isPending ? "Authenticating..." : "Sign In to Portal"}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-white/10 text-center space-y-2">
          <p className="text-xs text-slate-400">
            Have an invitation link?{" "}
            <Link href="/portal/claim" className="text-[#087fc3] hover:underline font-medium">
              Claim your account
            </Link>
          </p>
          <p className="text-[11px] text-slate-500">
            Protected by end-to-end encryption & DPDP regulatory compliance.
          </p>
        </div>
      </div>
    </div>
  );
}

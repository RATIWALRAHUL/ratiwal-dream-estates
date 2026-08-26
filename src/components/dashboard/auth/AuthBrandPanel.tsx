"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ShieldCheck, Layers, FileCheck, Lock, Sparkles } from "lucide-react";

export function AuthBrandPanel() {
  return (
    <div className="relative h-full w-full bg-[#071a28] text-white p-8 sm:p-12 lg:p-16 flex flex-col justify-between overflow-hidden">
      {/* Ambient background glows */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-[#0088cc]/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-96 h-96 bg-[#087fc3]/10 rounded-full blur-3xl pointer-events-none" />
      
      {/* Subtle luxury grid texture */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)`,
          backgroundSize: "32px 32px",
        }}
      />

      {/* Top: Real Brand Logo & Platform Name */}
      <div className="relative z-10">
        <Link href="/" className="inline-flex items-center gap-3.5 group" aria-label="Ratiwal Dream Estates Home">
          <Image
            src="/images/brand/ratiwal-logo-white.svg"
            alt="Ratiwal Dream Estates"
            width={220}
            height={70}
            priority
            className="h-10 sm:h-12 w-auto max-w-[210px] object-contain transition-transform duration-200 group-hover:scale-[1.02]"
          />
          <div className="h-6 w-px bg-white/20" />
          <span className="text-[10px] sm:text-[11px] font-mono uppercase tracking-widest text-[#42b7e8] font-bold bg-[#0088cc]/15 px-2.5 py-1 rounded-md border border-[#0088cc]/30 backdrop-blur-xs">
            Control Center
          </span>
        </Link>
      </div>

      {/* Center: Headline, Value Pillars & Badge */}
      <div className="relative z-10 my-auto py-8 space-y-8 max-w-lg">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-xs text-[#42b7e8] font-medium backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Enterprise Land Banking & CRM Infrastructure</span>
          </div>

          <h2 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-white leading-[1.2]">
            Securely orchestrate premium plotted developments.
          </h2>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Access your administrative cockpit to manage JDA-approved plot inventories, review deal workflows, verify customer KYC, and monitor real-time platform operations.
          </p>
        </div>

        {/* Feature Points */}
        <div className="space-y-3 pt-2">
          <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs">
            <div className="w-8 h-8 rounded-xl bg-[#0088cc]/20 text-[#42b7e8] flex items-center justify-center shrink-0 mt-0.5">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white">Dynamic Inventory & Tower Matrix</h4>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Real-time plot status, unit reservations, and pricing index across Jaipur and Navi Mumbai.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs">
            <div className="w-8 h-8 rounded-xl bg-[#0088cc]/20 text-[#42b7e8] flex items-center justify-center shrink-0 mt-0.5">
              <FileCheck className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white">Legal Vault & Digital Custody</h4>
              <p className="text-[11px] text-slate-400 mt-0.5">
                RERA certificates, JDA 90A approvals, and chain title deeds with cryptographic audit trails.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs">
            <div className="w-8 h-8 rounded-xl bg-[#0088cc]/20 text-[#42b7e8] flex items-center justify-center shrink-0 mt-0.5">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white">Role-Based Access & DPDP Compliance</h4>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Multi-tenant data scoping, MFA protection, and tamper-evident audit logging.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom: Confidentiality & Compliance Notice */}
      <div className="relative z-10 pt-4 border-t border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-[11px] text-slate-400 font-mono">
        <div className="flex items-center gap-1.5 text-slate-300">
          <Lock className="w-3.5 h-3.5 text-[#42b7e8]" />
          <span>256-Bit SSL Encrypted Admin Portal</span>
        </div>
        <span>© 2026 Ratiwal Dream Estates Pvt. Ltd.</span>
      </div>
    </div>
  );
}

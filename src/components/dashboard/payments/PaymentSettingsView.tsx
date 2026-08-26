"use client";

import React from "react";
import Link from "next/link";
import { Settings, Shield, ArrowLeft, CreditCard, Lock, CheckCircle2 } from "lucide-react";

export function PaymentSettingsView() {
  return (
    <div className="space-y-6 antialiased max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono uppercase tracking-widest text-[#087fc3] font-bold">
              Treasury Governance
            </span>
          </div>
          <h1 className="text-2xl font-bold font-serif text-[#071a28] tracking-tight mt-1">
            Payment & Gateway Settings
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Provider configuration, webhook secrets, maker-checker rules, and statutory disclaimers.
          </p>
        </div>

        <Link
          href="/dashboard/payments"
          className="px-4 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-[#071a28] font-bold text-xs flex items-center gap-2 transition-colors shadow-2xs self-start sm:self-center"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Overview</span>
        </Link>
      </div>

      {/* Gateway Status Box */}
      <div className="bg-white rounded-3xl border border-[rgba(7,26,40,0.08)] p-6 shadow-xs space-y-4 text-xs">
        <h3 className="text-sm font-bold font-serif text-[#071a28] uppercase tracking-wider border-b border-slate-100 pb-2">
          Payment Provider & Integration Modes
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-[#fbfaf8] border border-slate-200 space-y-1">
            <div className="text-[10px] font-bold uppercase text-slate-400">Active Provider</div>
            <div className="font-bold text-[#071a28] text-base">Razorpay Payments</div>
            <div className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Adapter Connected</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[#fbfaf8] border border-slate-200 space-y-1">
            <div className="text-[10px] font-bold uppercase text-slate-400">Environment Mode</div>
            <div className="font-bold text-[#071a28] text-base font-mono">
              {process.env.NODE_ENV === "production" ? "LIVE" : "TEST / PREVIEW"}
            </div>
            <div className="text-[11px] text-slate-500">Secure server-side signatures</div>
          </div>

          <div className="p-4 rounded-2xl bg-[#fbfaf8] border border-slate-200 space-y-1">
            <div className="text-[10px] font-bold uppercase text-slate-400">Webhook Receiver</div>
            <div className="font-mono text-[#071a28] font-bold text-[11px] truncate">
              /api/webhooks/payments/razorpay
            </div>
            <div className="text-[11px] text-slate-500">HMAC-SHA256 Timing-Safe</div>
          </div>
        </div>
      </div>

      {/* Compliance & Security Rules */}
      <div className="bg-white rounded-3xl border border-[rgba(7,26,40,0.08)] p-6 shadow-xs space-y-4 text-xs">
        <h3 className="text-sm font-bold font-serif text-[#071a28] uppercase tracking-wider border-b border-slate-100 pb-2">
          Statutory Disclaimers & Governance Defaults
        </h3>

        <div className="space-y-4">
          <div>
            <label className="font-bold text-[#071a28] block mb-1">
              Statutory Real Estate Tax & Stamp Duty Disclaimer
            </label>
            <div className="p-4 rounded-2xl bg-[#fbfaf8] border border-slate-200 text-slate-600 leading-relaxed font-serif text-[11px]">
              Statutory taxes, stamp duty, registration charges, and GST are payable as per applicable government notifications at the time of demand and are subject to statutory verification. All collections are acknowledged through official payment receipts; formal conveyance deed is subject to final registry execution.
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[#071a28] text-white space-y-2">
            <div className="text-[10px] font-mono uppercase text-[#42b7e8] tracking-widest font-bold flex items-center gap-1.5">
              <Lock className="w-3 h-3" />
              <span>PCI-DSS & RBI Data Security Policy</span>
            </div>
            <p className="text-[11px] text-[#cbd5e1] leading-relaxed">
              Ratiwal Dream Estates strictly adheres to RBI card storage and payment aggregation directives. Full card numbers, CVV codes, UPI MPINs, and customer netbanking credentials are never accepted, processed, or persisted on our application servers.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

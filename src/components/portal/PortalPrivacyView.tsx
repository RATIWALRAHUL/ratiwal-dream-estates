"use client";

import React, { useState, useTransition } from "react";
import { ShieldCheck, FileText, CheckCircle2, AlertCircle, Send } from "lucide-react";
import { submitPrivacyRequestFromPortalAction } from "@/lib/actions/portal.actions";

export function PortalPrivacyView() {
  const [requestType, setRequestType] = useState<"ACCESS" | "RECTIFICATION" | "ERASURE" | "CONSENT_WITHDRAWAL" | "GRIEVANCE">("ACCESS");
  const [summary, setSummary] = useState("");
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(null);
    setError(null);

    if (!summary.trim()) {
      setError("Please describe the nature of your privacy request.");
      return;
    }

    startTransition(async () => {
      const res = await submitPrivacyRequestFromPortalAction({
        requestType,
        requestSummary: summary,
      });

      if (!res.success) {
        setError(res.error || "Failed to submit privacy request.");
      } else {
        setSuccess(`Privacy request ${res.requestNumber} submitted to our Data Protection Officer.`);
        setSummary("");
      }
    });
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <h1 className="text-2xl font-serif font-bold text-white tracking-wide">
          Privacy & DPDP Rights Center
        </h1>
        <p className="text-xs text-slate-300 mt-1">
          Exercise your statutory rights under the Digital Personal Data Protection (DPDP) Act and RERA data governance framework.
        </p>
      </div>

      {success && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* DPDP Information Notice */}
        <div className="bg-[#071a28]/90 border border-white/10 rounded-2xl p-6 text-white shadow-xl space-y-4 text-xs">
          <h2 className="text-base font-serif font-bold text-white flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Your Statutory Privacy Rights</span>
          </h2>

          <div className="space-y-3 text-slate-300 leading-relaxed">
            <div className="p-3 rounded-xl bg-white/5 border border-white/5 space-y-1">
              <div className="font-semibold text-white">Right to Access</div>
              <div className="text-[11px] text-slate-400">Request a summary of all digital personal data processed by Ratiwal Dream Estates.</div>
            </div>

            <div className="p-3 rounded-xl bg-white/5 border border-white/5 space-y-1">
              <div className="font-semibold text-white">Right to Correction & Erasure</div>
              <div className="text-[11px] text-slate-400">Request rectification of inaccurate identity details or erasure of non-statutory records. Note: Statutory booking/payment ledgers are retained for 8 years under RERA & PMLA.</div>
            </div>

            <div className="p-3 rounded-xl bg-white/5 border border-white/5 space-y-1">
              <div className="font-semibold text-white">Right to Grievance Redressal</div>
              <div className="text-[11px] text-slate-400">Submit a formal complaint directly to our designated Data Protection Officer (DPO).</div>
            </div>
          </div>
        </div>

        {/* Submit Request Form */}
        <div className="bg-[#071a28]/90 border border-white/10 rounded-2xl p-6 text-white shadow-xl space-y-4">
          <h2 className="text-base font-serif font-bold text-white flex items-center space-x-2">
            <FileText className="w-4 h-4 text-[#087fc3]" />
            <span>Submit a Privacy Request</span>
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-300 font-medium mb-1">Request Category</label>
              <select
                value={requestType}
                onChange={(e) => setRequestType(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs"
              >
                <option value="ACCESS" className="bg-[#071a28]">Access to Stored Personal Data</option>
                <option value="RECTIFICATION" className="bg-[#071a28]">Rectification / Correction</option>
                <option value="ERASURE" className="bg-[#071a28]">Erasure / Deletion of Marketing Data</option>
                <option value="CONSENT_WITHDRAWAL" className="bg-[#071a28]">Withdrawal of Optional Consents</option>
                <option value="GRIEVANCE" className="bg-[#071a28]">Formal Privacy Grievance</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">Details & Specifics</label>
              <textarea
                rows={4}
                required
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                placeholder="Provide details regarding your request..."
                className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs placeholder-slate-500"
              />
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="w-full py-2.5 rounded-xl bg-[#087fc3] hover:bg-[#066ca8] text-xs font-semibold text-white shadow-md flex items-center justify-center space-x-1.5 transition-all"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isPending ? "Submitting..." : "Submit to Privacy Officer"}</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import {
  Layers,
  ShieldAlert,
  Clock,
  RefreshCw,
  Lock,
  ArrowLeft,
  CheckCircle2,
  FileText,
} from "lucide-react";
import { setLegalHoldAction, runKycReconciliationAction } from "@/lib/actions/kyc.actions";
import { RetentionCategory } from "@/types/kyc";

interface KycSettingsViewProps {
  templates: any[];
  retentionPolicies: any[];
}

export function KycSettingsView({ templates, retentionPolicies }: KycSettingsViewProps) {
  const [isPending, startTransition] = useTransition();
  const [activeTab, setActiveTab] = useState<"TEMPLATES" | "RETENTION" | "RECONCILIATION">("TEMPLATES");
  const [reconcileResult, setReconcileResult] = useState<any | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const handleToggleLegalHold = (category: RetentionCategory, currentHold: boolean) => {
    setActionMessage(null);
    startTransition(async () => {
      const res = await setLegalHoldAction({
        category,
        holdActive: !currentHold,
        reason: !currentHold ? "Staff applied manual administrative legal hold" : "Staff lifted legal hold",
      });

      if (res.success) {
        setActionMessage(res.message);
      } else {
        setActionMessage(`Error: ${res.message}`);
      }
    });
  };

  const handleRunReconciliation = () => {
    setActionMessage(null);
    startTransition(async () => {
      const res = await runKycReconciliationAction();
      if (res.success) {
        setReconcileResult(res.data);
        setActionMessage(res.message);
      } else {
        setActionMessage(`Error: ${res.message}`);
      }
    });
  };

  return (
    <div className="space-y-6 antialiased">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono uppercase tracking-widest text-[#087fc3] font-bold">
              Compliance Administration
            </span>
          </div>
          <h1 className="text-2xl font-bold font-serif text-[#071a28] tracking-tight mt-1">
            KYC Settings & Governance
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Configure versioned requirement templates, statutory retention schedules, and run integrity reconciliation audits.
          </p>
        </div>

        <Link
          href="/dashboard/kyc"
          className="px-4 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-[#071a28] font-bold text-xs flex items-center gap-2 transition-colors shadow-2xs self-start sm:self-center"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Overview</span>
        </Link>
      </div>

      {actionMessage && (
        <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 text-blue-900 text-xs font-semibold">
          {actionMessage}
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab("TEMPLATES")}
          className={`px-4 py-2 rounded-xl font-bold text-xs transition-colors ${
            activeTab === "TEMPLATES"
              ? "bg-[#071a28] text-white shadow-xs"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          Requirement Templates ({templates.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("RETENTION")}
          className={`px-4 py-2 rounded-xl font-bold text-xs transition-colors ${
            activeTab === "RETENTION"
              ? "bg-[#071a28] text-white shadow-xs"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          Retention & Legal Holds ({retentionPolicies.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("RECONCILIATION")}
          className={`px-4 py-2 rounded-xl font-bold text-xs transition-colors ${
            activeTab === "RECONCILIATION"
              ? "bg-[#071a28] text-white shadow-xs"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          Integrity Reconciliation
        </button>
      </div>

      {/* Tab 1: Templates */}
      {activeTab === "TEMPLATES" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {templates.map((tpl) => (
            <div
              key={tpl._id}
              className="p-6 rounded-3xl bg-white border border-[rgba(7,26,40,0.08)] shadow-xs space-y-4 text-xs"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <div>
                  <h3 className="font-bold font-serif text-[#071a28] text-sm">{tpl.name}</h3>
                  <div className="text-[10px] font-mono text-slate-400">
                    {tpl.templateKey} (v{tpl.version}) • {tpl.partyType}
                  </div>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-bold">
                  {tpl.status}
                </span>
              </div>

              <p className="text-slate-500 text-[11px] leading-relaxed">{tpl.description}</p>

              <div className="space-y-2 pt-1">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Required Checklist Items ({tpl.requirements?.length || 0})
                </div>
                <div className="space-y-1.5">
                  {tpl.requirements?.map((req: any) => (
                    <div
                      key={req.key}
                      className="p-2.5 rounded-xl bg-[#fbfaf8] border border-slate-100 flex items-center justify-between text-[11px]"
                    >
                      <span className="font-bold text-[#071a28]">{req.displayName}</span>
                      <span className="font-mono text-[10px] text-slate-400">{req.documentType}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 2: Retention Policies */}
      {activeTab === "RETENTION" && (
        <div className="bg-white rounded-3xl border border-[rgba(7,26,40,0.08)] shadow-xs overflow-hidden">
          <div className="divide-y divide-slate-100 text-xs">
            {retentionPolicies.map((pol) => (
              <div
                key={pol._id}
                className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[#fbfaf8] transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[#071a28]">{pol.displayName}</span>
                    {pol.legalHoldActive && (
                      <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-900 border border-purple-300 text-[10px] font-bold flex items-center gap-1">
                        <Lock className="w-3 h-3" />
                        <span>Legal Hold Active</span>
                      </span>
                    )}
                  </div>
                  <div className="text-slate-500 text-[11px]">
                    Category: <strong>{pol.category}</strong> • Duration:{" "}
                    <strong>{pol.retentionPeriodDays} days</strong> (~
                    {Math.round(pol.retentionPeriodDays / 365)} years)
                  </div>
                  <div className="text-slate-400 text-[10px] italic">
                    Statutory Authority: {pol.statutoryReference}
                  </div>
                </div>

                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => handleToggleLegalHold(pol.category, pol.legalHoldActive)}
                  className={`px-3.5 py-1.5 rounded-xl font-bold text-xs transition-colors self-start sm:self-center whitespace-nowrap ${
                    pol.legalHoldActive
                      ? "bg-purple-50 text-purple-900 border border-purple-200 hover:bg-purple-100"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  {pol.legalHoldActive ? "Lift Legal Hold" : "Apply Legal Hold"}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Reconciliation */}
      {activeTab === "RECONCILIATION" && (
        <div className="bg-white rounded-3xl border border-[rgba(7,26,40,0.08)] p-6 md:p-8 shadow-xs space-y-6 text-xs">
          <div>
            <h3 className="text-sm font-bold font-serif text-[#071a28] uppercase tracking-wider">
              KYC System Integrity Reconciliation
            </h3>
            <p className="text-slate-500 mt-1">
              Scans all active bookings, KYC cases, document versions, and submission tokens to detect integrity anomalies.
            </p>
          </div>

          <button
            type="button"
            disabled={isPending}
            onClick={handleRunReconciliation}
            className="px-5 py-2.5 rounded-xl bg-[#071a28] hover:bg-[#0d2c42] disabled:opacity-50 text-white font-bold text-xs flex items-center gap-2 shadow-md transition-colors"
          >
            <RefreshCw className={`w-4 h-4 text-[#42b7e8] ${isPending ? "animate-spin" : ""}`} />
            <span>{isPending ? "Scanning System Integrity..." : "Run Integrity Audit"}</span>
          </button>

          {reconcileResult && (
            <div className="space-y-4 pt-4 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-700">
                  Total Records Audited: {reconcileResult.totalScanned}
                </span>
                <span className="font-mono text-slate-400 text-[11px]">
                  {new Date(reconcileResult.auditTimestamp).toLocaleString()}
                </span>
              </div>

              {reconcileResult.anomalies.length === 0 ? (
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Zero anomalies detected! All bookings and KYC records are fully consistent.</span>
                </div>
              ) : (
                <div className="space-y-2">
                  {reconcileResult.anomalies.map((a: any, idx: number) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 space-y-1"
                    >
                      <div className="flex items-center gap-2 font-bold">
                        <ShieldAlert className="w-4 h-4 text-rose-600" />
                        <span>{a.code}</span>
                        <span className="text-[10px] px-2 py-0.2 rounded-full bg-rose-200 text-rose-900">
                          {a.severity}
                        </span>
                      </div>
                      <p className="text-[11px] text-rose-800">{a.description}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

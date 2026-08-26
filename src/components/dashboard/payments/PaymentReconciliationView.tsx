"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import {
  RefreshCw,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { runPaymentReconciliationAction } from "@/lib/actions/payment.actions";
import { ReconciliationRunResult } from "@/lib/services/payment-reconciliation.service";

interface PaymentReconciliationViewProps {
  initialResult: ReconciliationRunResult;
}

export function PaymentReconciliationView({ initialResult }: PaymentReconciliationViewProps) {
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<ReconciliationRunResult>(initialResult);
  const [actionError, setActionError] = useState<string | null>(null);

  const handleRunRecon = () => {
    setActionError(null);
    startTransition(async () => {
      const res = await runPaymentReconciliationAction();
      if (!res.success) {
        setActionError(res.message);
      } else {
        setResult(res.data as ReconciliationRunResult);
      }
    });
  };

  const severityColors: Record<string, string> = {
    CRITICAL: "bg-rose-50 text-rose-800 border-rose-200",
    WARNING: "bg-amber-50 text-amber-800 border-amber-200",
    INFO: "bg-blue-50 text-blue-800 border-blue-200",
  };

  return (
    <div className="space-y-6 antialiased">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono uppercase tracking-widest text-[#087fc3] font-bold">
              Automated Integrity Scanner
            </span>
          </div>
          <h1 className="text-2xl font-bold font-serif text-[#071a28] tracking-tight mt-1">
            Payment Reconciliation Audit
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time ledger audit verifying unallocated funds, missing receipts, and stale payment claims.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-center">
          <Link
            href="/dashboard/payments"
            className="px-4 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-[#071a28] font-bold text-xs flex items-center gap-2 transition-colors shadow-2xs"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Overview</span>
          </Link>

          <button
            type="button"
            disabled={isPending}
            onClick={handleRunRecon}
            className="px-4 py-2 rounded-xl bg-[#071a28] hover:bg-[#0d2c42] disabled:opacity-50 text-white font-bold text-xs flex items-center gap-1.5 shadow-md transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#42b7e8] ${isPending ? "animate-spin" : ""}`} />
            <span>{isPending ? "Auditing..." : "Run Reconciliation Audit"}</span>
          </button>
        </div>
      </div>

      {actionError && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold">
          {actionError}
        </div>
      )}

      {/* Summary KPI Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
        <div className="p-5 rounded-3xl bg-white border border-[rgba(7,26,40,0.08)] shadow-xs space-y-1">
          <div className="text-[10px] font-bold uppercase text-slate-400">Total Scanned</div>
          <div className="text-2xl font-bold font-serif text-[#071a28]">{result.totalScanned}</div>
          <div className="text-[11px] text-slate-500">Financial records</div>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-[rgba(7,26,40,0.08)] shadow-xs space-y-1">
          <div className="text-[10px] font-bold uppercase text-slate-400">Critical Issues</div>
          <div className="text-2xl font-bold font-serif text-rose-600">
            {result.summary.criticalCount}
          </div>
          <div className="text-[11px] text-slate-500">Immediate action required</div>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-[rgba(7,26,40,0.08)] shadow-xs space-y-1">
          <div className="text-[10px] font-bold uppercase text-slate-400">Warnings / Stale</div>
          <div className="text-2xl font-bold font-serif text-amber-600">
            {result.summary.warningCount}
          </div>
          <div className="text-[11px] text-slate-500">Review pending claims</div>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-[rgba(7,26,40,0.08)] shadow-xs space-y-1">
          <div className="text-[10px] font-bold uppercase text-slate-400">Last Audit Run</div>
          <div className="font-bold text-[#071a28] font-mono text-[11px]">
            {new Date(result.auditTimestamp).toLocaleTimeString()}
          </div>
          <div className="text-[11px] text-slate-500">
            {new Date(result.auditTimestamp).toLocaleDateString()}
          </div>
        </div>
      </div>

      {/* Anomalies List */}
      <div className="bg-white rounded-3xl border border-[rgba(7,26,40,0.08)] shadow-xs overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold font-serif text-[#071a28] uppercase tracking-wider">
              Discrepancies & Integrity Findings ({result.anomalies.length})
            </h3>
            <p className="text-[11px] text-slate-500">
              Audit log of all detected financial anomalies with recommended remediations
            </p>
          </div>
        </div>

        {result.anomalies.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-xs space-y-2">
            <ShieldCheck className="w-10 h-10 text-emerald-500 mx-auto" />
            <p className="font-bold text-[#071a28] text-sm">All Financial Records In Balance</p>
            <p>No unallocated balances, missing receipts, or stale claims found in active dataset.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 text-xs">
            {result.anomalies.map((anom, idx) => (
              <div
                key={idx}
                className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-[#fbfaf8] transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] border ${
                        severityColors[anom.severity] || "bg-slate-100 text-slate-700"
                      }`}
                    >
                      {anom.severity}
                    </span>
                    <span className="font-mono font-bold text-[#071a28]">{anom.code}</span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      Type: {anom.entityType}
                    </span>
                  </div>
                  <p className="text-slate-700 font-medium">{anom.description}</p>
                  {anom.remediationAction && (
                    <p className="text-[#087fc3] text-[11px] font-semibold flex items-center gap-1">
                      <Zap className="w-3 h-3 text-[#087fc3]" />
                      <span>Remediation: {anom.remediationAction}</span>
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

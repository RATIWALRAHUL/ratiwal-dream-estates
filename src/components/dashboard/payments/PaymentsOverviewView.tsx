"use client";

import React from "react";
import Link from "next/link";
import {
  CreditCard,
  Layers,
  FileText,
  Clock,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Plus,
  RefreshCw,
} from "lucide-react";
import { PaymentOverviewMetrics } from "@/types/payment";
import { MoneyUtils } from "@/lib/utils/money";

interface PaymentsOverviewViewProps {
  metrics: PaymentOverviewMetrics;
  recentTransactions: any[];
  pendingManuals: any[];
}

export function PaymentsOverviewView({
  metrics,
  recentTransactions,
  pendingManuals,
}: PaymentsOverviewViewProps) {
  const statCards = [
    {
      label: "Total Collected",
      value: MoneyUtils.format(metrics.totalCollectedPaise, metrics.currency, { compact: true }),
      sublabel: `Verified captured receipts`,
      icon: CheckCircle2,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
    {
      label: "Scheduled & Due",
      value: MoneyUtils.format(metrics.totalDuePaise, metrics.currency, { compact: true }),
      sublabel: `Upcoming plan instalments`,
      icon: Clock,
      color: "text-[#087fc3]",
      bg: "bg-[#eaf5fa]",
    },
    {
      label: "Overdue Receivables",
      value: MoneyUtils.format(metrics.totalOverduePaise, metrics.currency, { compact: true }),
      sublabel: "Past milestone due dates",
      icon: AlertTriangle,
      color: "text-rose-600",
      bg: "bg-rose-50",
    },
    {
      label: "Processed Refunds",
      value: MoneyUtils.format(metrics.totalRefundedPaise, metrics.currency, { compact: true }),
      sublabel: "Returned transaction funds",
      icon: RotateCcw,
      color: "text-purple-600",
      bg: "bg-purple-50",
    },
  ];

  return (
    <div className="space-y-8 antialiased">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono uppercase tracking-widest text-[#087fc3] font-bold">
              PRD 16 • Financial Operations & Treasury
            </span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
              RBI Directions & GST Compliant
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold font-serif text-[#071a28] tracking-tight mt-1">
            Payments, Plans & Financial Ledger
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Institutional revenue management, milestone instalments, gateway transactions, and audit-grade receipts.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/manual-payments"
            className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-[#071a28] font-bold text-xs flex items-center gap-2 shadow-xs transition-colors"
          >
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            <span>Manual Review</span>
            {metrics.pendingManualReviewCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-amber-100 text-amber-800 text-[10px]">
                {metrics.pendingManualReviewCount}
              </span>
            )}
          </Link>

          <Link
            href="/dashboard/payment-plans/new"
            className="px-4 py-2.5 rounded-xl bg-[#071a28] hover:bg-[#0d2c42] text-white font-bold text-xs flex items-center gap-2 shadow-md transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>New Payment Plan</span>
          </Link>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((c) => {
          const Icon = c.icon;
          return (
            <div
              key={c.label}
              className="p-5 rounded-3xl bg-white border border-[rgba(7,26,40,0.08)] shadow-xs space-y-2 hover:border-slate-300 transition-colors"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  {c.label}
                </span>
                <div className={`w-8 h-8 rounded-xl ${c.bg} ${c.color} flex items-center justify-center`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-bold font-serif text-[#071a28]">{c.value}</div>
              <div className="text-[11px] text-slate-500">{c.sublabel}</div>
            </div>
          );
        })}
      </div>

      {/* Main Grid: Transactions Stream & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): Recent Transactions */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-3xl border border-[rgba(7,26,40,0.08)] p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold font-serif text-[#071a28] uppercase tracking-wider">
                  Recent Payment Transactions
                </h3>
                <p className="text-[11px] text-slate-500">Live online and verified offline collections</p>
              </div>
              <Link
                href="/dashboard/payments/transactions"
                className="text-xs font-bold text-[#087fc3] hover:underline flex items-center gap-1"
              >
                <span>View Ledger</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {recentTransactions.length === 0 ? (
              <div className="p-8 text-center bg-[#fbfaf8] rounded-2xl border border-dashed border-slate-200 text-xs text-slate-500">
                No recent payment transactions recorded.
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {recentTransactions.map((txn) => {
                  const statusColors: Record<string, string> = {
                    CAPTURED: "bg-emerald-50 text-emerald-800 border-emerald-200",
                    CREATED: "bg-blue-50 text-blue-800 border-blue-200",
                    PENDING: "bg-amber-50 text-amber-800 border-amber-200",
                    FAILED: "bg-rose-50 text-rose-800 border-rose-200",
                    REFUNDED: "bg-purple-50 text-purple-800 border-purple-200",
                    PARTIALLY_REFUNDED: "bg-purple-50 text-purple-800 border-purple-200",
                  };

                  return (
                    <div
                      key={txn._id}
                      className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs hover:bg-[#fbfaf8] rounded-xl px-2 transition-colors"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-[#071a28]">
                            {txn.paymentNumber}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-full font-bold text-[10px] border ${
                              statusColors[txn.status] || "bg-slate-100 text-slate-700"
                            }`}
                          >
                            {txn.status}
                          </span>
                          <span className="text-slate-400 font-mono text-[10px]">
                            {txn.method}
                          </span>
                        </div>
                        <div className="text-slate-600 font-semibold">
                          Booking: {txn.bookingId?.bookingNumber || "—"} • {txn.partyId?.displayName || "Buyer"}
                        </div>
                      </div>

                      <div className="flex items-center gap-4 text-right">
                        <div>
                          <div className="font-bold text-[#071a28]">
                            {MoneyUtils.format(txn.amountPaise, txn.currency)}
                          </div>
                          <div className="text-[10px] text-slate-400">
                            {new Date(txn.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Governance Quick Links */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-[rgba(7,26,40,0.08)] p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold font-serif text-[#071a28] uppercase tracking-wider">
              Financial Operations
            </h3>

            <div className="space-y-2 text-xs">
              <Link
                href="/dashboard/payment-plans"
                className="p-3.5 rounded-2xl bg-[#fbfaf8] border border-slate-100 hover:border-slate-300 flex items-center justify-between transition-colors block"
              >
                <div className="flex items-center gap-3">
                  <Layers className="w-4 h-4 text-[#087fc3]" />
                  <div>
                    <div className="font-bold text-[#071a28]">Payment Plans ({metrics.activePlanCount})</div>
                    <div className="text-[11px] text-slate-500">Milestones & scheduled plans</div>
                  </div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </Link>

              <Link
                href="/dashboard/receipts"
                className="p-3.5 rounded-2xl bg-[#fbfaf8] border border-slate-100 hover:border-slate-300 flex items-center justify-between transition-colors block"
              >
                <div className="flex items-center gap-3">
                  <FileText className="w-4 h-4 text-slate-700" />
                  <div>
                    <div className="font-bold text-[#071a28]">Payment Receipts</div>
                    <div className="text-[11px] text-slate-500">Issued immutable receipts</div>
                  </div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </Link>

              <Link
                href="/dashboard/refunds"
                className="p-3.5 rounded-2xl bg-[#fbfaf8] border border-slate-100 hover:border-slate-300 flex items-center justify-between transition-colors block"
              >
                <div className="flex items-center gap-3">
                  <RotateCcw className="w-4 h-4 text-purple-600" />
                  <div>
                    <div className="font-bold text-[#071a28]">Refund Requests</div>
                    <div className="text-[11px] text-slate-500">Approvals & provider refunds</div>
                  </div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </Link>

              <Link
                href="/dashboard/payments/reconciliation"
                className="p-3.5 rounded-2xl bg-[#fbfaf8] border border-slate-100 hover:border-slate-300 flex items-center justify-between transition-colors block"
              >
                <div className="flex items-center gap-3">
                  <RefreshCw className="w-4 h-4 text-emerald-600" />
                  <div>
                    <div className="font-bold text-[#071a28]">Reconciliation Audit</div>
                    <div className="text-[11px] text-slate-500">Discrepancy scanner</div>
                  </div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </Link>
            </div>
          </div>

          <div className="p-5 rounded-3xl bg-[#071a28] text-white space-y-2">
            <div className="text-[10px] font-mono uppercase text-[#42b7e8] tracking-widest font-bold">
              Monetary Integrity Policy
            </div>
            <h4 className="font-serif font-bold text-sm">Server-Authoritative Paise</h4>
            <p className="text-[11px] text-[#cbd5e1] leading-relaxed">
              All financial calculations are performed in integer paise without floating-point arithmetic. Amounts sent by the browser are never trusted.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

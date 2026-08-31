"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowRight, FileText, RefreshCw } from "lucide-react";
import { MoneyUtils } from "@/lib/utils/money";

interface PortalPaymentsViewProps {
  data: any;
}

export function PortalPaymentsView({ data }: PortalPaymentsViewProps) {
  const { paymentPlans, instalments, transactions, receipts, refunds } = data;

  const [selectedInstalment, setSelectedInstalment] = useState<any | null>(null);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-white tracking-wide">
            Payments & Milestone Ledger
          </h1>
          <p className="text-xs text-slate-300 mt-1">
            Server-calculated milestone instalments, transaction history, receipts, and refund requests.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            href="/portal/receipts"
            className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold text-white transition-all flex items-center space-x-1.5"
          >
            <FileText className="w-3.5 h-3.5 text-emerald-400" />
            <span>Receipts</span>
          </Link>
          <Link
            href="/portal/refunds"
            className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold text-white transition-all flex items-center space-x-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
            <span>Refunds</span>
          </Link>
        </div>
      </div>

      {/* Payment Plans & Milestone Instalments */}
      <div className="space-y-6">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-300">
          Active Milestone Instalments
        </h2>

        {instalments && instalments.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {instalments.map((inst: any) => {
              const isEligibleForPayment =
                inst.status === "DUE" ||
                inst.status === "OVERDUE" ||
                inst.status === "PARTIALLY_PAID" ||
                inst.status === "SCHEDULED";

              return (
                <div
                  key={inst._id}
                  className="bg-[#071a28]/90 border border-white/10 rounded-2xl p-6 text-white shadow-xl space-y-4 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-slate-400">
                        Milestone {inst.installmentIndex}
                      </span>
                      <span
                        className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${
                          inst.status === "PAID"
                            ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                            : inst.status === "OVERDUE"
                            ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                            : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                        }`}
                      >
                        {inst.status}
                      </span>
                    </div>

                    <h3 className="text-base font-serif font-bold text-white">{inst.name}</h3>

                    <div className="text-xs text-slate-400">
                      Due: {inst.dueDate ? new Date(inst.dueDate).toLocaleDateString("en-IN") : "Linked to site milestone"}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                    <div>
                      <div className="text-base font-bold font-serif text-white">
                        {MoneyUtils.formatINR(inst.installmentAmountPaise)}
                      </div>
                      {inst.outstandingAmountPaise > 0 && (
                        <div className="text-[10px] text-amber-400">
                          Outstanding: {MoneyUtils.formatINR(inst.outstandingAmountPaise)}
                        </div>
                      )}
                    </div>

                    {isEligibleForPayment && inst.status !== "PAID" && (
                      <Link
                        href={`/payments/pay/mock_${inst._id}`}
                        className="px-4 py-2 rounded-xl bg-[#087fc3] hover:bg-[#066ca8] text-xs font-semibold text-white shadow-md transition-all flex items-center space-x-1.5"
                      >
                        <span>Pay Online</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-[#071a28]/90 border border-white/10 rounded-2xl p-8 text-center text-slate-400 text-xs">
            No active payment milestones found for your bookings.
          </div>
        )}
      </div>

      {/* Recent Payment Transactions */}
      <div className="bg-[#071a28]/90 border border-white/10 rounded-2xl p-6 text-white shadow-xl space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-300">
          Payment Transactions
        </h2>

        {transactions && transactions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-white/10 text-slate-400 uppercase text-[10px]">
                <tr>
                  <th className="pb-3 font-medium">Txn Reference</th>
                  <th className="pb-3 font-medium">Method</th>
                  <th className="pb-3 font-medium">Amount</th>
                  <th className="pb-3 font-medium">Status</th>
                  <th className="pb-3 font-medium">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-slate-200">
                {transactions.map((txn: any) => (
                  <tr key={txn._id} className="hover:bg-white/5">
                    <td className="py-3 font-mono text-[#087fc3]">
                      {txn.paymentReference || txn.providerPaymentId || "TXN-PENDING"}
                    </td>
                    <td className="py-3">{txn.method}</td>
                    <td className="py-3 font-serif font-bold text-white">
                      {MoneyUtils.formatINR(txn.capturedAmountPaise || txn.amountPaise)}
                    </td>
                    <td className="py-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                          txn.status === "CAPTURED"
                            ? "bg-emerald-500/20 text-emerald-300"
                            : txn.status === "FAILED"
                            ? "bg-rose-500/20 text-rose-300"
                            : "bg-amber-500/20 text-amber-300"
                        }`}
                      >
                        {txn.status}
                      </span>
                    </td>
                    <td className="py-3 text-slate-400">
                      {new Date(txn.createdAt).toLocaleDateString("en-IN")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-6 text-xs text-slate-400">
            No transaction records recorded yet.
          </div>
        )}
      </div>
    </div>
  );
}

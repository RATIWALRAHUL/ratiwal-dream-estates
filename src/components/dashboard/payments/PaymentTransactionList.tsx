"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, CreditCard } from "lucide-react";
import { MoneyUtils } from "@/lib/utils/money";

interface PaymentTransactionListProps {
  transactions: any[];
}

export function PaymentTransactionList({ transactions }: PaymentTransactionListProps) {
  const statusColors: Record<string, string> = {
    CAPTURED: "bg-emerald-50 text-emerald-800 border-emerald-200",
    CREATED: "bg-blue-50 text-blue-800 border-blue-200",
    PENDING: "bg-amber-50 text-amber-800 border-amber-200",
    FAILED: "bg-rose-50 text-rose-800 border-rose-200",
    REFUNDED: "bg-purple-50 text-purple-800 border-purple-200",
    PARTIALLY_REFUNDED: "bg-purple-50 text-purple-800 border-purple-200",
  };

  return (
    <div className="space-y-6 antialiased">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono uppercase tracking-widest text-[#087fc3] font-bold">
              Treasury & Collections
            </span>
          </div>
          <h1 className="text-2xl font-bold font-serif text-[#071a28] tracking-tight mt-1">
            Payment Transactions Ledger ({transactions.length})
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Immutable audit record of all gateway orders, captured receipts, and offline settlements.
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

      <div className="bg-white rounded-3xl border border-[rgba(7,26,40,0.08)] shadow-xs overflow-hidden">
        {transactions.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-xs space-y-2">
            <CreditCard className="w-8 h-8 text-slate-400 mx-auto" />
            <p className="font-bold text-[#071a28]">No transactions recorded.</p>
            <p>Initiate a payment order or record an offline bank transfer.</p>
          </div>
        ) : (
          <div className="overflow-x-auto text-xs">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-[#fbfaf8] text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  <th className="py-3.5 px-6">Payment Number</th>
                  <th className="py-3.5 px-6">Booking / Customer</th>
                  <th className="py-3.5 px-6">Method & Source</th>
                  <th className="py-3.5 px-6">Status</th>
                  <th className="py-3.5 px-6 text-right">Amount</th>
                  <th className="py-3.5 px-6">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {transactions.map((txn) => (
                  <tr key={txn._id} className="hover:bg-[#fbfaf8]/80 transition-colors">
                    <td className="py-4 px-6 font-mono font-bold text-[#071a28]">
                      {txn.paymentNumber}
                      {txn.providerPaymentId && (
                        <div className="text-[10px] text-slate-400 font-mono">
                          Ref: {txn.providerPaymentId}
                        </div>
                      )}
                    </td>
                    <td className="py-4 px-6">
                      <div className="font-bold text-[#071a28]">
                        Booking: {txn.bookingId?.bookingNumber || "—"}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {txn.partyId?.displayName || "Purchasing Entity"}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="font-semibold text-slate-700">{txn.method.replace(/_/g, " ")}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{txn.source}</div>
                    </td>
                    <td className="py-4 px-6">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                          statusColors[txn.status] || "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {txn.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right font-bold text-[#071a28]">
                      {MoneyUtils.format(txn.amountPaise, txn.currency)}
                    </td>
                    <td className="py-4 px-6 text-slate-500 font-mono text-[11px]">
                      {new Date(txn.createdAt).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

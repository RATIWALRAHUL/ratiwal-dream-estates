"use client";

import Link from "next/link";
import { useState } from "react";
import { MoneyUtils } from "@/lib/utils/money";

interface StaffCommissionsViewProps {
  accruals: any[];
  plans: any[];
}

export function StaffCommissionsView({ accruals, plans }: StaffCommissionsViewProps) {
  const [filter, setFilter] = useState("ALL");

  const filtered = accruals.filter((a) => filter === "ALL" || a.status === filter);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-white tracking-wide">
            Broker Commission Ledger
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Deterministic commission accruals, statutory tax deductions, and maker-checker payout workflows.
          </p>
        </div>

        <Link
          href="/dashboard/commissions/payouts"
          className="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-semibold text-xs sm:text-sm rounded-lg shadow-lg shadow-amber-500/20 transition-all self-start sm:self-auto"
        >
          Manage Payout Batches →
        </Link>
      </div>

      <div className="flex items-center space-x-2 overflow-x-auto pb-1 bg-[#0d131f] border border-[#232f48] p-3 rounded-xl">
        {["ALL", "APPROVED", "PAYABLE", "PAID", "ESTIMATED", "ON_HOLD", "REVERSED"].map((st) => (
          <button
            key={st}
            onClick={() => setFilter(st)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
              filter === st
                ? "bg-amber-500 text-black font-semibold shadow-sm"
                : "bg-slate-800 text-slate-300 hover:bg-slate-700"
            }`}
          >
            {st.replace(/_/g, " ")}
          </button>
        ))}
      </div>

      <div className="bg-[#0d131f] border border-[#232f48] rounded-xl overflow-hidden shadow-xl">
        {filtered.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-sm">
            <p>No commission accruals found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-[#080d17] text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-800">
                <tr>
                  <th className="px-5 py-3.5">Accrual #</th>
                  <th className="px-5 py-3.5">Partner Agency</th>
                  <th className="px-5 py-3.5">Booking / Deal</th>
                  <th className="px-5 py-3.5">Gross (₹)</th>
                  <th className="px-5 py-3.5">TDS (₹)</th>
                  <th className="px-5 py-3.5">Net Payable (₹)</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {filtered.map((a) => (
                  <tr key={a._id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-5 py-4 font-mono text-amber-400 font-medium">
                      {a.accrualNumber}
                    </td>
                    <td className="px-5 py-4">
                      <div className="font-semibold text-white">{a.partnerId?.displayName || "Partner"}</div>
                      <div className="text-[11px] text-slate-400 font-mono">{a.partnerId?.partnerCode}</div>
                    </td>
                    <td className="px-5 py-4 font-mono text-slate-200">
                      {a.bookingId?.bookingNumber || "RDE-BKG-XXXX"}
                    </td>
                    <td className="px-5 py-4 font-semibold text-white">
                      {MoneyUtils.formatINR(a.grossCommissionPaise)}
                    </td>
                    <td className="px-5 py-4 text-red-400">
                      - {MoneyUtils.formatINR(a.tdsWithholdingPaise)}
                    </td>
                    <td className="px-5 py-4 font-bold text-emerald-400">
                      {MoneyUtils.formatINR(a.netPayablePaise)}
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
                        a.status === "PAID"
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                          : a.status === "APPROVED" || a.status === "PAYABLE"
                          ? "bg-sky-500/10 text-sky-400 border border-sky-500/30"
                          : "bg-amber-500/10 text-amber-400 border border-amber-500/30"
                      }`}>
                        {a.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-slate-400">
                      {new Date(a.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
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

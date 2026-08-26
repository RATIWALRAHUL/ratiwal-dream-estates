"use client";

import Link from "next/link";
import { useState } from "react";

interface CommissionItem {
  id: string;
  accrualNumber: string;
  bookingNumber: string;
  triggerMilestoneKey: string;
  grossCommissionPaise: number;
  tdsWithholdingPaise: number;
  gstAmountPaise: number;
  adjustedAmountPaise: number;
  netPayablePaise: number;
  paidAmountPaise: number;
  status: string;
  grossFormatted: string;
  tdsFormatted: string;
  gstFormatted: string;
  netFormatted: string;
  paidFormatted: string;
  createdAt: string;
}

interface PartnerCommissionsViewProps {
  commissions: CommissionItem[];
}

export function PartnerCommissionsView({ commissions }: PartnerCommissionsViewProps) {
  const [filter, setFilter] = useState<string>("ALL");

  const filtered = commissions.filter((c) => filter === "ALL" || c.status === filter);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-white tracking-wide">
            Commission Accruals & Ledger
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Deterministic commission calculations, statutory TDS withholding breakdowns, and payout release history.
          </p>
        </div>
        <Link
          href="/partner/statements"
          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs sm:text-sm font-medium rounded-lg border border-slate-700 transition-all self-start sm:self-auto"
        >
          View Statements →
        </Link>
      </div>

      {/* Filter tabs */}
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

      {/* Table */}
      <div className="bg-[#0d131f] border border-[#232f48] rounded-xl overflow-hidden shadow-xl">
        {filtered.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-sm">
            <p>No commission records found matching your filter.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-[#080d17] text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-800">
                <tr>
                  <th className="px-5 py-3.5">Accrual #</th>
                  <th className="px-5 py-3.5">Booking Reference</th>
                  <th className="px-5 py-3.5">Trigger Milestone</th>
                  <th className="px-5 py-3.5">Gross Commission</th>
                  <th className="px-5 py-3.5">TDS Withheld</th>
                  <th className="px-5 py-3.5">Net Payable</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {filtered.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-5 py-4 font-mono text-amber-400 font-medium">
                      {c.accrualNumber}
                    </td>
                    <td className="px-5 py-4 font-mono text-slate-200">
                      {c.bookingNumber}
                    </td>
                    <td className="px-5 py-4">
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[10px]">
                        {c.triggerMilestoneKey}
                      </span>
                    </td>
                    <td className="px-5 py-4 font-semibold text-white">
                      {c.grossFormatted}
                    </td>
                    <td className="px-5 py-4 text-red-400">
                      - {c.tdsFormatted}
                    </td>
                    <td className="px-5 py-4 font-bold text-emerald-400">
                      {c.netFormatted}
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
                        c.status === "PAID"
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                          : c.status === "APPROVED" || c.status === "PAYABLE"
                          ? "bg-sky-500/10 text-sky-400 border border-sky-500/30"
                          : c.status === "REVERSED"
                          ? "bg-red-500/10 text-red-400 border border-red-500/30"
                          : "bg-amber-500/10 text-amber-400 border border-amber-500/30"
                      }`}>
                        {c.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-slate-400">
                      {new Date(c.createdAt).toLocaleDateString("en-IN", {
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

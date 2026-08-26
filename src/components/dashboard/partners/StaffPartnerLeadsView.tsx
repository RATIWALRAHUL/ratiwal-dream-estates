"use client";

import Link from "next/link";
import { useState } from "react";

interface StaffPartnerLeadsViewProps {
  submissions: any[];
}

export function StaffPartnerLeadsView({ submissions }: StaffPartnerLeadsViewProps) {
  const [filter, setFilter] = useState("ALL");

  const filtered = submissions.filter((s) => filter === "ALL" || s.attributionStatus === filter);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-white tracking-wide">
            Channel Partner Lead Attribution
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Review broker-registered inquiries, deduplication results, and resolve attribution claims.
          </p>
        </div>
      </div>

      <div className="flex items-center space-x-2 overflow-x-auto pb-1 bg-[#0d131f] border border-[#232f48] p-3 rounded-xl">
        {["ALL", "ACCEPTED", "CONFLICT", "SUBMITTED", "REJECTED"].map((st) => (
          <button
            key={st}
            onClick={() => setFilter(st)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
              filter === st
                ? "bg-amber-500 text-black font-semibold shadow-sm"
                : "bg-slate-800 text-slate-300 hover:bg-slate-700"
            }`}
          >
            {st}
          </button>
        ))}
      </div>

      <div className="bg-[#0d131f] border border-[#232f48] rounded-xl overflow-hidden shadow-xl">
        {filtered.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-sm">
            <p>No partner lead submissions found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-[#080d17] text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-800">
                <tr>
                  <th className="px-5 py-3.5">Submission #</th>
                  <th className="px-5 py-3.5">Partner Agency</th>
                  <th className="px-5 py-3.5">Masked Client</th>
                  <th className="px-5 py-3.5">Estate / Property</th>
                  <th className="px-5 py-3.5">Deduplication Status</th>
                  <th className="px-5 py-3.5">Attribution Window</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {filtered.map((s) => (
                  <tr key={s._id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-5 py-4 font-mono text-amber-400 font-medium">
                      {s.submissionNumber}
                    </td>
                    <td className="px-5 py-4">
                      <div className="font-semibold text-white">{s.partnerId?.displayName || "Partner"}</div>
                      <div className="text-[11px] text-slate-400 font-mono">{s.partnerId?.partnerCode}</div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="text-slate-200">{s.clientNameMasked}</div>
                      <div className="text-[11px] text-slate-400 font-mono">{s.clientPhoneMasked}</div>
                    </td>
                    <td className="px-5 py-4 font-medium text-slate-200">
                      {s.propertyId?.title || "Property"}
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
                        s.attributionStatus === "ACCEPTED"
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                          : s.attributionStatus === "CONFLICT"
                          ? "bg-red-500/10 text-red-400 border border-red-500/30"
                          : "bg-amber-500/10 text-amber-400 border border-amber-500/30"
                      }`}>
                        {s.attributionStatus}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-slate-400 font-mono">
                      {s.attributionExpiryDate
                        ? new Date(s.attributionExpiryDate).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })
                        : "—"}
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

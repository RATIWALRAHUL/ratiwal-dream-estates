"use client";

import Link from "next/link";
import { useState } from "react";

interface LeadItem {
  id: string;
  submissionNumber: string;
  propertyTitle: string;
  propertyId?: string;
  clientNameMasked: string;
  clientPhoneMasked: string;
  clientEmailMasked?: string;
  budgetBand?: string;
  investmentIntent?: string;
  notes?: string;
  status: string;
  submittedAt: string;
  attributionExpiryDate?: string;
}

interface PartnerLeadsViewProps {
  leads: LeadItem[];
}

export function PartnerLeadsView({ leads }: PartnerLeadsViewProps) {
  const [filter, setFilter] = useState<string>("ALL");
  const [search, setSearch] = useState<string>("");

  const filteredLeads = leads.filter((l) => {
    const matchesFilter = filter === "ALL" || l.status === filter;
    const matchesSearch =
      l.clientNameMasked.toLowerCase().includes(search.toLowerCase()) ||
      l.submissionNumber.toLowerCase().includes(search.toLowerCase()) ||
      l.propertyTitle.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-white tracking-wide">
            Lead Pipeline & Attribution
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Track all registered buyer inquiries, attribution locks, and deal conversions in real-time.
          </p>
        </div>
        <Link
          href="/partner/leads/new"
          className="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-semibold text-xs sm:text-sm rounded-lg shadow-lg shadow-amber-500/20 transition-all inline-flex items-center space-x-2 self-start sm:self-auto"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span>Register New Lead</span>
        </Link>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#0d131f] border border-[#232f48] p-4 rounded-xl">
        <div className="w-full sm:w-72">
          <input
            type="text"
            placeholder="Search by client or submission #..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
          />
        </div>

        <div className="flex items-center space-x-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {["ALL", "ACCEPTED", "UNDER_REVIEW", "BOOKING_ACHIEVED", "CLOSED_LOST"].map((st) => (
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
      </div>

      {/* Table */}
      <div className="bg-[#0d131f] border border-[#232f48] rounded-xl overflow-hidden shadow-xl">
        {filteredLeads.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-sm">
            <p>No leads found matching your filter criteria.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-[#080d17] text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-800">
                <tr>
                  <th className="px-5 py-3.5">Submission #</th>
                  <th className="px-5 py-3.5">Client Profile</th>
                  <th className="px-5 py-3.5">Estate / Property</th>
                  <th className="px-5 py-3.5">Attribution Status</th>
                  <th className="px-5 py-3.5">Submitted On</th>
                  <th className="px-5 py-3.5">Lock Expiry</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {filteredLeads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-5 py-4 font-mono text-amber-400 font-medium">
                      {lead.submissionNumber}
                    </td>
                    <td className="px-5 py-4">
                      <div className="font-semibold text-white">{lead.clientNameMasked}</div>
                      <div className="text-[11px] text-slate-400 font-mono">{lead.clientPhoneMasked}</div>
                    </td>
                    <td className="px-5 py-4 font-medium text-slate-200">
                      {lead.propertyTitle}
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
                        lead.status === "ACCEPTED" || lead.status === "BOOKING_ACHIEVED"
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                          : lead.status === "UNDER_REVIEW" || lead.status === "SUBMITTED"
                          ? "bg-amber-500/10 text-amber-400 border border-amber-500/30"
                          : "bg-slate-800 text-slate-400 border border-slate-700"
                      }`}>
                        {lead.status?.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-slate-400">
                      {new Date(lead.submittedAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-5 py-4 text-slate-400 font-mono">
                      {lead.attributionExpiryDate
                        ? new Date(lead.attributionExpiryDate).toLocaleDateString("en-IN", {
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

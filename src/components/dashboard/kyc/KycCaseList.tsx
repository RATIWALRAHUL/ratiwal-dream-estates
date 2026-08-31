"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Search,
  Filter,
  ShieldCheck,
  Clock,
  AlertTriangle,
  Lock,
  Plus,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { KYC_CASE_STATUSES } from "@/types/kyc";

interface KycCaseListProps {
  initialCases: any[];
  total: number;
  currentPage: number;
  totalPages: number;
  properties: any[];
}

export function KycCaseList({
  initialCases,
  total,
  currentPage,
  totalPages,
  properties,
}: KycCaseListProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const currentStatus = searchParams.get("status") || "ALL";
  const currentProperty = searchParams.get("propertyId") || "";
  const blockingOnly = searchParams.get("blockingBookingOnly") === "true";
  const [searchTerm, setSearchTerm] = useState(searchParams.get("search") || "");

  const updateFilters = (key: string, val: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (val && val !== "ALL") {
      params.set(key, val);
    } else {
      params.delete(key);
    }
    params.set("page", "1");
    startTransition(() => {
      router.push(`/dashboard/kyc/cases?${params.toString()}`);
    });
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateFilters("search", searchTerm.trim() || null);
  };

  const statusColors: Record<string, string> = {
    COMPLETED: "bg-emerald-50 text-emerald-800 border-emerald-200",
    UNDER_REVIEW: "bg-blue-50 text-blue-800 border-blue-200",
    SUBMITTED: "bg-amber-50 text-amber-800 border-amber-200",
    ACTION_REQUIRED: "bg-rose-50 text-rose-800 border-rose-200",
    IN_PROGRESS: "bg-slate-100 text-slate-700 border-slate-200",
    EXPIRED: "bg-rose-100 text-rose-900 border-rose-300",
  };

  return (
    <div className="space-y-6 antialiased">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-serif text-[#071a28] tracking-tight">
            KYC Cases Directory
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Total {total} buyer identity due diligence cases registered.
          </p>
        </div>

        <Link
          href="/dashboard/kyc/cases/new"
          className="px-4 py-2.5 rounded-xl bg-[#071a28] hover:bg-[#0d2c42] text-white font-bold text-xs flex items-center gap-2 shadow-md transition-colors self-start sm:self-center"
        >
          <Plus className="w-4 h-4" />
          <span>New KYC Case</span>
        </Link>
      </div>

      {/* Filter Bar */}
      <div className="p-4 rounded-3xl bg-white border border-[rgba(7,26,40,0.08)] shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          {/* Search Input */}
          <form onSubmit={handleSearchSubmit} className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by case # or name..."
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 bg-[#fbfaf8] text-xs font-semibold placeholder:text-slate-400 focus:outline-none focus:border-[#087fc3]"
            />
          </form>

          {/* Status Selector */}
          <select
            value={currentStatus}
            onChange={(e) => updateFilters("status", e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-[#fbfaf8] text-xs font-semibold text-[#071a28] focus:outline-none focus:border-[#087fc3]"
          >
            <option value="ALL">All Statuses</option>
            {KYC_CASE_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s.replace(/_/g, " ")}
              </option>
            ))}
          </select>

          {/* Property Selector */}
          <select
            value={currentProperty}
            onChange={(e) => updateFilters("propertyId", e.target.value || null)}
            className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-[#fbfaf8] text-xs font-semibold text-[#071a28] focus:outline-none focus:border-[#087fc3]"
          >
            <option value="">All Properties</option>
            {properties.map((p) => (
              <option key={p._id} value={p._id}>
                {p.title}
              </option>
            ))}
          </select>

          {/* Blocking Booking Toggle */}
          <button
            type="button"
            onClick={() => updateFilters("blockingBookingOnly", blockingOnly ? null : "true")}
            className={`px-3 py-2 rounded-xl border font-bold flex items-center justify-center gap-2 transition-colors ${
              blockingOnly
                ? "bg-purple-50 border-purple-300 text-purple-900"
                : "bg-[#fbfaf8] border-slate-200 text-slate-600 hover:bg-slate-100"
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Blocking Bookings Only</span>
          </button>
        </div>
      </div>

      {/* Cases Table / Cards */}
      <div className="bg-white rounded-3xl border border-[rgba(7,26,40,0.08)] shadow-xs overflow-hidden">
        {initialCases.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-xs space-y-2">
            <p className="font-bold text-[#071a28]">No matching KYC cases found.</p>
            <p>Try adjusting your search query or filter criteria.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-[#fbfaf8] text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  <th className="py-3.5 px-6">Case Number</th>
                  <th className="py-3.5 px-6">Buyer Party</th>
                  <th className="py-3.5 px-6">Property / Deal</th>
                  <th className="py-3.5 px-6">Status</th>
                  <th className="py-3.5 px-6">Progress</th>
                  <th className="py-3.5 px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {initialCases.map((kCase) => (
                  <tr key={kCase._id} className="hover:bg-[#fbfaf8]/80 transition-colors">
                    <td className="py-4 px-6 font-mono font-bold text-[#071a28]">
                      {kCase.kycCaseNumber}
                    </td>
                    <td className="py-4 px-6">
                      <div className="font-bold text-[#071a28]">{kCase.partyId?.displayName || "—"}</div>
                      <div className="text-[11px] text-slate-400 font-mono">
                        {kCase.partyId?.partyType || "INDIVIDUAL"}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-slate-700 font-semibold">{kCase.propertyId?.title || "—"}</div>
                      {kCase.dealId && (
                        <div className="text-[11px] text-slate-400 font-mono">
                          Deal: {kCase.dealId.dealNumber}
                        </div>
                      )}
                    </td>
                    <td className="py-4 px-6">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                          statusColors[kCase.status] || "bg-slate-100 text-slate-700 border-slate-200"
                        }`}
                      >
                        {kCase.status.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                          <div
                            className="h-full bg-[#087fc3] rounded-full"
                            style={{
                              width: `${
                                kCase.totalRequirementsCount > 0
                                  ? (kCase.satisfiedRequirementsCount / kCase.totalRequirementsCount) * 100
                                  : 0
                              }%`,
                            }}
                          />
                        </div>
                        <span className="text-[11px] text-slate-500">
                          {kCase.satisfiedRequirementsCount}/{kCase.totalRequirementsCount}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <Link
                        href={`/dashboard/kyc/cases/${kCase._id}`}
                        className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-[#071a28] font-bold text-xs shadow-2xs transition-colors"
                      >
                        Workspace
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <div>
              Page {currentPage} of {totalPages}
            </div>
            <div className="flex items-center gap-2">
              <button
                disabled={currentPage <= 1 || isPending}
                onClick={() => updateFilters("page", String(currentPage - 1))}
                className="p-2 rounded-xl border border-slate-200 disabled:opacity-40 hover:bg-slate-50"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                disabled={currentPage >= totalPages || isPending}
                onClick={() => updateFilters("page", String(currentPage + 1))}
                className="p-2 rounded-xl border border-slate-200 disabled:opacity-40 hover:bg-slate-50"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

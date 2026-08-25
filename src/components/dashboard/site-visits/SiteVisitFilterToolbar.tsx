"use client";
import { useCallback } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Search, X, SlidersHorizontal } from "lucide-react";
import {
  SITE_VISIT_STATUSES,
  SITE_VISIT_PRIORITIES,
  MEETING_MODES,
  SITE_VISIT_SOURCES,
} from "@/types/site-visit";

const STATUS_LABELS: Record<string, string> = {
  REQUESTED: "Requested",
  PENDING_CONFIRMATION: "Pending",
  CONFIRMED: "Confirmed",
  RESCHEDULE_REQUESTED: "Rescheduling",
  CANCELLED: "Cancelled",
  COMPLETED: "Completed",
  NO_SHOW: "No-Show",
  ARCHIVED: "Archived",
};

const MODE_LABELS: Record<string, string> = {
  IN_PERSON: "In-Person Tour",
  VIRTUAL_TOUR: "Virtual Tour",
  OFFICE_CONSULTATION: "Office Consultation",
};

export function SiteVisitFilterToolbar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const setParam = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      params.delete("page"); // reset pagination
      router.push(`${pathname}?${params.toString()}`);
    },
    [router, pathname, searchParams]
  );

  const clearAll = () => {
    router.push(pathname);
  };

  const hasActiveFilters =
    searchParams.has("search") ||
    searchParams.has("status") ||
    searchParams.has("priority") ||
    searchParams.has("meetingMode") ||
    searchParams.has("source") ||
    searchParams.has("dateFrom") ||
    searchParams.has("dateTo");

  return (
    <div className="bg-white rounded-2xl border border-[rgba(7,26,40,0.08)] shadow-xs p-4 space-y-3">
      <div className="flex items-center gap-2">
        <SlidersHorizontal className="w-4 h-4 text-[#647581]" />
        <span className="text-[10px] font-mono uppercase tracking-widest text-[#647581] font-bold">Filters</span>
        {hasActiveFilters && (
          <button
            onClick={clearAll}
            className="ml-auto inline-flex items-center gap-1 text-xs text-rose-500 hover:text-rose-700 font-semibold transition-colors"
          >
            <X className="w-3 h-3" />
            Clear all
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-2">
        {/* Search */}
        <div className="lg:col-span-2 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#647581]" />
          <input
            type="search"
            placeholder="Reference, advisor, meeting point…"
            defaultValue={searchParams.get("search") ?? ""}
            onChange={(e) => setParam("search", e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-[rgba(7,26,40,0.12)] bg-[#f8f7f4] text-[#071a28] placeholder:text-[#647581] focus:outline-none focus:ring-2 focus:ring-[#087fc3]/30"
            aria-label="Search site visits"
          />
        </div>

        {/* Status */}
        <select
          value={searchParams.get("status") ?? ""}
          onChange={(e) => setParam("status", e.target.value)}
          className="px-3 py-2 text-xs rounded-xl border border-[rgba(7,26,40,0.12)] bg-[#f8f7f4] text-[#071a28] focus:outline-none focus:ring-2 focus:ring-[#087fc3]/30"
          aria-label="Filter by status"
        >
          <option value="">All Statuses</option>
          {SITE_VISIT_STATUSES.map((s) => (
            <option key={s} value={s}>{STATUS_LABELS[s] ?? s}</option>
          ))}
        </select>

        {/* Meeting Mode */}
        <select
          value={searchParams.get("meetingMode") ?? ""}
          onChange={(e) => setParam("meetingMode", e.target.value)}
          className="px-3 py-2 text-xs rounded-xl border border-[rgba(7,26,40,0.12)] bg-[#f8f7f4] text-[#071a28] focus:outline-none focus:ring-2 focus:ring-[#087fc3]/30"
          aria-label="Filter by meeting mode"
        >
          <option value="">All Tour Modes</option>
          {MEETING_MODES.map((m) => (
            <option key={m} value={m}>{MODE_LABELS[m] ?? m}</option>
          ))}
        </select>

        {/* Priority */}
        <select
          value={searchParams.get("priority") ?? ""}
          onChange={(e) => setParam("priority", e.target.value)}
          className="px-3 py-2 text-xs rounded-xl border border-[rgba(7,26,40,0.12)] bg-[#f8f7f4] text-[#071a28] focus:outline-none focus:ring-2 focus:ring-[#087fc3]/30"
          aria-label="Filter by priority"
        >
          <option value="">All Priorities</option>
          {SITE_VISIT_PRIORITIES.map((p) => (
            <option key={p} value={p}>{p.charAt(0) + p.slice(1).toLowerCase()}</option>
          ))}
        </select>

        {/* Date From */}
        <div>
          <label className="sr-only">Date from</label>
          <input
            type="date"
            defaultValue={searchParams.get("dateFrom") ?? ""}
            onChange={(e) => setParam("dateFrom", e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-xl border border-[rgba(7,26,40,0.12)] bg-[#f8f7f4] text-[#071a28] focus:outline-none focus:ring-2 focus:ring-[#087fc3]/30"
            aria-label="Date from"
          />
        </div>
      </div>
    </div>
  );
}

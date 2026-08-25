"use client";
import { useCallback } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Search, X, SlidersHorizontal } from "lucide-react";
import { LEAD_STATUSES, LEAD_PRIORITIES, LEAD_SOURCES } from "@/types/lead";

const STATUS_LABELS: Record<string, string> = {
  NEW: "New", CONTACTED: "Contacted", QUALIFIED: "Qualified",
  NURTURING: "Nurturing", NEGOTIATING: "Negotiating",
  WON: "Won", LOST: "Lost", SPAM: "Spam", ARCHIVED: "Archived",
};

const PRIORITY_LABELS: Record<string, string> = {
  LOW: "Low", NORMAL: "Normal", HIGH: "High", URGENT: "Urgent",
};

const SOURCE_LABELS: Record<string, string> = {
  PROPERTY_DETAIL: "Property Detail", PROPERTY_CARD: "Property Card",
  LOCATION_PAGE: "Location Page", HOMEPAGE_CTA: "Homepage CTA",
  CONTACT_PAGE: "Contact Page", ADVISOR_SECTION: "Advisor Section",
  DIRECT: "Direct", OTHER: "Other",
};

const FOLLOWUP_LABELS: Record<string, string> = {
  overdue: "Overdue", due_today: "Due Today",
  has_followup: "Has Follow-up", no_followup: "No Follow-up",
};

export function LeadsFilterToolbar() {
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
      params.delete("page"); // reset pagination on filter change
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
    searchParams.has("source") ||
    searchParams.has("followUpStatus") ||
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
            placeholder="Name, phone, reference…"
            defaultValue={searchParams.get("search") ?? ""}
            onChange={(e) => setParam("search", e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-[rgba(7,26,40,0.12)] bg-[#f8f7f4] text-[#071a28] placeholder:text-[#647581] focus:outline-none focus:ring-2 focus:ring-[#087fc3]/30"
            aria-label="Search leads"
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
          {LEAD_STATUSES.map((s) => (
            <option key={s} value={s}>{STATUS_LABELS[s]}</option>
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
          {LEAD_PRIORITIES.map((p) => (
            <option key={p} value={p}>{PRIORITY_LABELS[p]}</option>
          ))}
        </select>

        {/* Source */}
        <select
          value={searchParams.get("source") ?? ""}
          onChange={(e) => setParam("source", e.target.value)}
          className="px-3 py-2 text-xs rounded-xl border border-[rgba(7,26,40,0.12)] bg-[#f8f7f4] text-[#071a28] focus:outline-none focus:ring-2 focus:ring-[#087fc3]/30"
          aria-label="Filter by source"
        >
          <option value="">All Sources</option>
          {LEAD_SOURCES.map((s) => (
            <option key={s} value={s}>{SOURCE_LABELS[s]}</option>
          ))}
        </select>

        {/* Follow-up Status */}
        <select
          value={searchParams.get("followUpStatus") ?? ""}
          onChange={(e) => setParam("followUpStatus", e.target.value)}
          className="px-3 py-2 text-xs rounded-xl border border-[rgba(7,26,40,0.12)] bg-[#f8f7f4] text-[#071a28] focus:outline-none focus:ring-2 focus:ring-[#087fc3]/30"
          aria-label="Filter by follow-up status"
        >
          <option value="">All Follow-ups</option>
          {Object.entries(FOLLOWUP_LABELS).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
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

        {/* Date To */}
        <div>
          <label className="sr-only">Date to</label>
          <input
            type="date"
            defaultValue={searchParams.get("dateTo") ?? ""}
            onChange={(e) => setParam("dateTo", e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-xl border border-[rgba(7,26,40,0.12)] bg-[#f8f7f4] text-[#071a28] focus:outline-none focus:ring-2 focus:ring-[#087fc3]/30"
            aria-label="Date to"
          />
        </div>
      </div>
    </div>
  );
}

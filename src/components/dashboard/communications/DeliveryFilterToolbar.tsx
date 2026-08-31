"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback, useTransition } from "react";
import { RotateCcw, Filter } from "lucide-react";
import { NOTIFICATION_CHANNELS, DELIVERY_STATUSES, NOTIFICATION_EVENT_TYPES } from "@/types/communication";

export function DeliveryFilterToolbar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const createQueryString = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());
      params.delete("page"); // Reset page on filter change
      for (const [key, value] of Object.entries(updates)) {
        if (!value || value === "ALL") {
          params.delete(key);
        } else {
          params.set(key, value);
        }
      }
      return params.toString();
    },
    [searchParams]
  );

  const handleFilterChange = (key: string, value: string) => {
    startTransition(() => {
      const qs = createQueryString({ [key]: value });
      router.push(`${pathname}${qs ? `?${qs}` : ""}`);
    });
  };

  const handleReset = () => {
    startTransition(() => {
      router.push(pathname);
    });
  };

  const selectedChannel = searchParams.get("channel") || "ALL";
  const selectedStatus = searchParams.get("status") || "ALL";
  const selectedEventType = searchParams.get("eventType") || "ALL";
  const dateFrom = searchParams.get("dateFrom") || "";
  const dateTo = searchParams.get("dateTo") || "";

  const hasFilters =
    selectedChannel !== "ALL" ||
    selectedStatus !== "ALL" ||
    selectedEventType !== "ALL" ||
    !!dateFrom ||
    !!dateTo;

  return (
    <div className="bg-white rounded-2xl border border-[rgba(7,26,40,0.08)] shadow-xs p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs font-bold text-[#071a28]">
          <Filter className="w-3.5 h-3.5 text-[#087fc3]" />
          <span>Delivery Filters</span>
        </div>
        {hasFilters && (
          <button
            type="button"
            onClick={handleReset}
            disabled={isPending}
            className="inline-flex items-center gap-1 text-[10px] font-bold text-[#087fc3] hover:underline"
          >
            <RotateCcw className="w-2.5 h-2.5" />
            Reset Filters
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2">
        {/* Channel */}
        <select
          value={selectedChannel}
          onChange={(e) => handleFilterChange("channel", e.target.value)}
          disabled={isPending}
          className="px-3 py-2 text-xs rounded-xl border border-[rgba(7,26,40,0.12)] bg-[#f8f7f4] text-[#071a28] focus:outline-none focus:ring-2 focus:ring-[#087fc3]/30 font-medium"
        >
          <option value="ALL">All Channels</option>
          {NOTIFICATION_CHANNELS.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>

        {/* Status */}
        <select
          value={selectedStatus}
          onChange={(e) => handleFilterChange("status", e.target.value)}
          disabled={isPending}
          className="px-3 py-2 text-xs rounded-xl border border-[rgba(7,26,40,0.12)] bg-[#f8f7f4] text-[#071a28] focus:outline-none focus:ring-2 focus:ring-[#087fc3]/30 font-medium"
        >
          <option value="ALL">All Statuses</option>
          {DELIVERY_STATUSES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>

        {/* Event Type */}
        <select
          value={selectedEventType}
          onChange={(e) => handleFilterChange("eventType", e.target.value)}
          disabled={isPending}
          className="px-3 py-2 text-xs rounded-xl border border-[rgba(7,26,40,0.12)] bg-[#f8f7f4] text-[#071a28] focus:outline-none focus:ring-2 focus:ring-[#087fc3]/30 font-medium truncate"
        >
          <option value="ALL">All Event Types</option>
          {NOTIFICATION_EVENT_TYPES.map((e) => (
            <option key={e} value={e}>{e.replace(/_/g, " ")}</option>
          ))}
        </select>

        {/* Date From */}
        <input
          type="date"
          value={dateFrom}
          onChange={(e) => handleFilterChange("dateFrom", e.target.value)}
          disabled={isPending}
          placeholder="Date from"
          className="px-3 py-2 text-xs rounded-xl border border-[rgba(7,26,40,0.12)] bg-[#f8f7f4] text-[#071a28] focus:outline-none focus:ring-2 focus:ring-[#087fc3]/30 font-medium"
        />

        {/* Date To */}
        <input
          type="date"
          value={dateTo}
          onChange={(e) => handleFilterChange("dateTo", e.target.value)}
          disabled={isPending}
          placeholder="Date to"
          className="px-3 py-2 text-xs rounded-xl border border-[rgba(7,26,40,0.12)] bg-[#f8f7f4] text-[#071a28] focus:outline-none focus:ring-2 focus:ring-[#087fc3]/30 font-medium"
        />
      </div>
    </div>
  );
}

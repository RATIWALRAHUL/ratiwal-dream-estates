"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback, useTransition } from "react";
import { Calendar, Filter, RotateCcw } from "lucide-react";
import { ANALYTICS_DATE_PRESETS, AnalyticsDatePreset } from "@/types/analytics";

const PRESET_LABELS: Record<AnalyticsDatePreset, string> = {
  TODAY: "Today",
  YESTERDAY: "Yesterday",
  LAST_7_DAYS: "Last 7 Days",
  LAST_30_DAYS: "Last 30 Days",
  THIS_MONTH: "This Month",
  LAST_MONTH: "Last Month",
  LAST_QUARTER: "Last 90 Days",
  CUSTOM: "Custom Range",
};

export function AnalyticsDateRangeFilter() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const activePreset = (searchParams.get("preset") as AnalyticsDatePreset) || "LAST_30_DAYS";
  const dateFrom = searchParams.get("dateFrom") || "";
  const dateTo = searchParams.get("dateTo") || "";

  const createQueryString = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(updates)) {
        if (!value) {
          params.delete(key);
        } else {
          params.set(key, value);
        }
      }
      return params.toString();
    },
    [searchParams]
  );

  const handlePresetChange = (preset: AnalyticsDatePreset) => {
    startTransition(() => {
      const updates: Record<string, string | null> = { preset };
      if (preset !== "CUSTOM") {
        updates.dateFrom = null;
        updates.dateTo = null;
      }
      const qs = createQueryString(updates);
      router.push(`${pathname}${qs ? `?${qs}` : ""}`);
    });
  };

  const handleDateChange = (key: "dateFrom" | "dateTo", val: string) => {
    startTransition(() => {
      const qs = createQueryString({ preset: "CUSTOM", [key]: val });
      router.push(`${pathname}${qs ? `?${qs}` : ""}`);
    });
  };

  return (
    <div className="bg-white rounded-2xl border border-[rgba(7,26,40,0.08)] shadow-xs p-4 flex flex-wrap items-center justify-between gap-3">
      {/* Preset Pill Buttons */}
      <div className="flex flex-wrap items-center gap-1.5">
        <div className="flex items-center gap-1.5 text-xs font-bold text-[#071a28] mr-2">
          <Calendar className="w-3.5 h-3.5 text-[#087fc3]" />
          <span>Period:</span>
        </div>
        {ANALYTICS_DATE_PRESETS.map((p) => {
          const isSelected = activePreset === p;
          return (
            <button
              key={p}
              type="button"
              onClick={() => handlePresetChange(p)}
              disabled={isPending}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                isSelected
                  ? "bg-[#071a28] text-white shadow-xs"
                  : "bg-[#f8f7f4] text-[#647581] hover:text-[#071a28] hover:bg-slate-100"
              }`}
            >
              {PRESET_LABELS[p]}
            </button>
          );
        })}
      </div>

      {/* Custom Date Range Picker Inputs if CUSTOM preset */}
      {activePreset === "CUSTOM" && (
        <div className="flex items-center gap-2 text-xs">
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => handleDateChange("dateFrom", e.target.value)}
            disabled={isPending}
            className="px-3 py-1.5 rounded-xl border border-[rgba(7,26,40,0.12)] bg-[#f8f7f4] text-[#071a28] focus:outline-none focus:ring-2 focus:ring-[#087fc3]/30 text-xs font-medium"
          />
          <span className="text-[#647581] font-mono">to</span>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => handleDateChange("dateTo", e.target.value)}
            disabled={isPending}
            className="px-3 py-1.5 rounded-xl border border-[rgba(7,26,40,0.12)] bg-[#f8f7f4] text-[#071a28] focus:outline-none focus:ring-2 focus:ring-[#087fc3]/30 text-xs font-medium"
          />
        </div>
      )}
    </div>
  );
}

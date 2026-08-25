"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback, useTransition } from "react";
import { Search, Filter, RotateCcw, Building2 } from "lucide-react";
import {
  UNIT_CATEGORIES,
  UNIT_STATUSES,
  UNIT_CONFIGURATIONS,
  UnitCategory,
  UnitStatus,
  UnitConfiguration,
} from "@/types/inventory";

interface InventoryFiltersProps {
  properties: { _id: string; title: string }[];
}

export function InventoryFilters({ properties }: InventoryFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const propertyId = searchParams.get("propertyId") || "";
  const category = searchParams.get("category") || "ALL";
  const status = searchParams.get("status") || "ALL";
  const configuration = searchParams.get("configuration") || "ALL";
  const search = searchParams.get("search") || "";

  const createQueryString = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(updates)) {
        if (!value || value === "ALL") {
          params.delete(key);
        } else {
          params.set(key, value);
        }
      }
      params.set("page", "1");
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

  const hasFilters = propertyId || category !== "ALL" || status !== "ALL" || configuration !== "ALL" || search;

  return (
    <div className="bg-white rounded-2xl border border-[rgba(7,26,40,0.08)] shadow-xs p-4 space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search unit number, ref code, or block…"
            defaultValue={search}
            onChange={(e) => handleFilterChange("search", e.target.value)}
            className="w-full pl-9.5 pr-4 py-2 rounded-xl border border-[rgba(7,26,40,0.1)] bg-[#f8f7f4] text-xs font-medium text-[#071a28] focus:outline-none focus:ring-2 focus:ring-[#087fc3]/30"
          />
        </div>

        {/* Property Selector */}
        <div className="flex items-center gap-2">
          <select
            value={propertyId}
            onChange={(e) => handleFilterChange("propertyId", e.target.value)}
            disabled={isPending}
            className="px-3.5 py-2 rounded-xl border border-[rgba(7,26,40,0.1)] bg-[#f8f7f4] text-xs font-semibold text-[#071a28] focus:outline-none focus:ring-2 focus:ring-[#087fc3]/30"
          >
            <option value="">All Properties & Townships</option>
            {properties.map((p) => (
              <option key={p._id} value={p._id}>
                {p.title}
              </option>
            ))}
          </select>
        </div>

        {/* Category Selector */}
        <select
          value={category}
          onChange={(e) => handleFilterChange("category", e.target.value)}
          disabled={isPending}
          className="px-3.5 py-2 rounded-xl border border-[rgba(7,26,40,0.1)] bg-[#f8f7f4] text-xs font-semibold text-[#071a28] focus:outline-none focus:ring-2 focus:ring-[#087fc3]/30"
        >
          <option value="ALL">All Categories</option>
          {UNIT_CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c.replace(/_/g, " ")}
            </option>
          ))}
        </select>

        {/* Status Selector */}
        <select
          value={status}
          onChange={(e) => handleFilterChange("status", e.target.value)}
          disabled={isPending}
          className="px-3.5 py-2 rounded-xl border border-[rgba(7,26,40,0.1)] bg-[#f8f7f4] text-xs font-semibold text-[#071a28] focus:outline-none focus:ring-2 focus:ring-[#087fc3]/30"
        >
          <option value="ALL">All Statuses</option>
          {UNIT_STATUSES.map((s) => (
            <option key={s} value={s}>
              {s.replace(/_/g, " ")}
            </option>
          ))}
        </select>

        {/* Reset Button */}
        {hasFilters && (
          <button
            type="button"
            onClick={handleReset}
            disabled={isPending}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 text-xs font-bold transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        )}
      </div>
    </div>
  );
}

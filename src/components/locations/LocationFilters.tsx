"use client";

import { useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Filter, RotateCcw } from "lucide-react";

interface LocationFiltersProps {
  activeState: string;
  activeType: string;
  stateOptions: Array<{ label: string; value: string; count: number }>;
  typeOptions: Array<{ label: string; value: string }>;
  totalCount: number;
}

export function LocationFilters({
  activeState,
  activeType,
  stateOptions,
  typeOptions,
  totalCount,
}: LocationFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const handleStateChange = (state: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (state === "all") {
      params.delete("state");
    } else {
      params.set("state", state);
    }
    startTransition(() => {
      router.replace(`/locations?${params.toString()}#location-directory`, { scroll: false });
    });
  };

  const handleTypeChange = (type: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (type === "all") {
      params.delete("type");
    } else {
      params.set("type", type);
    }
    startTransition(() => {
      router.replace(`/locations?${params.toString()}#location-directory`, { scroll: false });
    });
  };

  const handleReset = () => {
    startTransition(() => {
      router.replace("/locations#location-directory", { scroll: false });
    });
  };

  const hasActiveFilters = activeState !== "all" || activeType !== "all";

  return (
    <div
      className="p-5 md:p-6 rounded-2xl bg-white border border-[rgba(7,26,40,0.1)] shadow-sm mb-8"
      aria-label="Location Directory Filters"
    >
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        {/* Left Side: Filter Groups */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-6 flex-wrap">
          {/* State / Region Filter */}
          <div>
            <span className="text-[11px] font-bold text-[#667d8f] uppercase tracking-wider block mb-2">
              Region / State:
            </span>
            <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by state">
              <button
                type="button"
                onClick={() => handleStateChange("all")}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 ${
                  activeState === "all"
                    ? "bg-[#031C2B] text-white shadow-sm"
                    : "bg-[#F5F1E9] text-[#4a6171] hover:bg-[#eae3d5] hover:text-[#031C2B]"
                }`}
                aria-pressed={activeState === "all"}
              >
                All Markets ({totalCount})
              </button>

              {stateOptions.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => handleStateChange(opt.value)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 ${
                    activeState.toLowerCase() === opt.value.toLowerCase()
                      ? "bg-[#031C2B] text-white shadow-sm"
                      : "bg-[#F5F1E9] text-[#4a6171] hover:bg-[#eae3d5] hover:text-[#031C2B]"
                  }`}
                  aria-pressed={activeState.toLowerCase() === opt.value.toLowerCase()}
                >
                  {opt.label} ({opt.count})
                </button>
              ))}
            </div>
          </div>

          {/* Property Category Filter */}
          <div>
            <span className="text-[11px] font-bold text-[#667d8f] uppercase tracking-wider block mb-2">
              Property Focus:
            </span>
            <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by property category">
              <button
                type="button"
                onClick={() => handleTypeChange("all")}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 ${
                  activeType === "all"
                    ? "bg-[#0784C8] text-white shadow-sm"
                    : "bg-[#F5F1E9] text-[#4a6171] hover:bg-[#eae3d5] hover:text-[#031C2B]"
                }`}
                aria-pressed={activeType === "all"}
              >
                All Categories
              </button>

              {typeOptions.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => handleTypeChange(opt.value)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 ${
                    activeType.toLowerCase() === opt.value.toLowerCase()
                      ? "bg-[#0784C8] text-white shadow-sm"
                      : "bg-[#F5F1E9] text-[#4a6171] hover:bg-[#eae3d5] hover:text-[#031C2B]"
                  }`}
                  aria-pressed={activeType.toLowerCase() === opt.value.toLowerCase()}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side: Reset Action & Status */}
        <div className="flex items-center justify-between sm:justify-end gap-4 pt-4 lg:pt-0 border-t lg:border-t-0 border-[rgba(7,26,40,0.06)]">
          {hasActiveFilters && (
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#e04865] hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#e04865] rounded-sm"
              aria-label="Reset all filters"
            >
              <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Reset Filters</span>
            </button>
          )}

          {isPending && (
            <span className="text-xs text-[#0784C8] animate-pulse">Updating markets...</span>
          )}
        </div>
      </div>
    </div>
  );
}

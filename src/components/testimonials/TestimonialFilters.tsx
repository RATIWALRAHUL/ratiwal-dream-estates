"use client";

import { useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { RotateCcw } from "lucide-react";

interface TestimonialFiltersProps {
  activeCategory: string;
  activeLocation: string;
  categoryOptions: Array<{ label: string; value: string }>;
  locationOptions: Array<{ label: string; value: string }>;
  totalCount: number;
}

export function TestimonialFilters({
  activeCategory,
  activeLocation,
  categoryOptions,
  locationOptions,
  totalCount,
}: TestimonialFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const handleCategoryChange = (category: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (category === "all") {
      params.delete("category");
    } else {
      params.set("category", category);
    }
    startTransition(() => {
      router.replace(`/testimonials?${params.toString()}#stories-directory`, { scroll: false });
    });
  };

  const handleLocationChange = (loc: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (loc === "all") {
      params.delete("location");
    } else {
      params.set("location", loc);
    }
    startTransition(() => {
      router.replace(`/testimonials?${params.toString()}#stories-directory`, { scroll: false });
    });
  };

  const handleReset = () => {
    startTransition(() => {
      router.replace("/testimonials#stories-directory", { scroll: false });
    });
  };

  const hasActiveFilters = activeCategory !== "all" || activeLocation !== "all";

  return (
    <div
      className="p-5 md:p-6 rounded-2xl bg-white border border-[rgba(7,26,40,0.1)] shadow-sm mb-8"
      aria-label="Client Stories Directory Filters"
    >
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        {/* Left Side: Filter Options */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-6 flex-wrap">
          {/* Property / Buyer Category */}
          <div>
            <span className="text-[11px] font-bold text-[#667d8f] uppercase tracking-wider block mb-2">
              Experience Category:
            </span>
            <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by property category">
              <button
                type="button"
                onClick={() => handleCategoryChange("all")}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 ${
                  activeCategory === "all"
                    ? "bg-[#031C2B] text-white shadow-sm"
                    : "bg-[#F5F1E9] text-[#4a6171] hover:bg-[#eae3d5] hover:text-[#031C2B]"
                }`}
                aria-pressed={activeCategory === "all"}
              >
                All Stories ({totalCount})
              </button>

              {categoryOptions.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => handleCategoryChange(opt.value)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 ${
                    activeCategory.toLowerCase() === opt.value.toLowerCase()
                      ? "bg-[#031C2B] text-white shadow-sm"
                      : "bg-[#F5F1E9] text-[#4a6171] hover:bg-[#eae3d5] hover:text-[#031C2B]"
                  }`}
                  aria-pressed={activeCategory.toLowerCase() === opt.value.toLowerCase()}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Location Filter */}
          <div>
            <span className="text-[11px] font-bold text-[#667d8f] uppercase tracking-wider block mb-2">
              Operating Region:
            </span>
            <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by location">
              <button
                type="button"
                onClick={() => handleLocationChange("all")}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 ${
                  activeLocation === "all"
                    ? "bg-[#0784C8] text-white shadow-sm"
                    : "bg-[#F5F1E9] text-[#4a6171] hover:bg-[#eae3d5] hover:text-[#031C2B]"
                }`}
                aria-pressed={activeLocation === "all"}
              >
                All Regions
              </button>

              {locationOptions.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => handleLocationChange(opt.value)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 ${
                    activeLocation.toLowerCase() === opt.value.toLowerCase()
                      ? "bg-[#0784C8] text-white shadow-sm"
                      : "bg-[#F5F1E9] text-[#4a6171] hover:bg-[#eae3d5] hover:text-[#031C2B]"
                  }`}
                  aria-pressed={activeLocation.toLowerCase() === opt.value.toLowerCase()}
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
              aria-label="Reset story filters"
            >
              <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Reset Filters</span>
            </button>
          )}

          {isPending && (
            <span className="text-xs text-[#0784C8] animate-pulse">Filtering stories...</span>
          )}
        </div>
      </div>
    </div>
  );
}

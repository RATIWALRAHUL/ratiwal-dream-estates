"use client";

import { useState, useTransition, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, RotateCcw, X } from "lucide-react";

interface InsightFiltersProps {
  activeCategory: string;
  activeSearch: string;
  categories: string[];
  totalCount: number;
}

export function InsightFilters({
  activeCategory,
  activeSearch,
  categories,
  totalCount,
}: InsightFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [searchTerm, setSearchTerm] = useState(activeSearch);
  const [prevActiveSearch, setPrevActiveSearch] = useState(activeSearch);

  // Sync state if URL changes externally during render
  if (activeSearch !== prevActiveSearch) {
    setPrevActiveSearch(activeSearch);
    setSearchTerm(activeSearch);
  }

  const updateFilters = (newCategory: string, newQuery: string) => {
    const params = new URLSearchParams(searchParams.toString());

    if (newCategory === "all" || !newCategory) {
      params.delete("category");
    } else {
      params.set("category", newCategory);
    }

    if (!newQuery.trim()) {
      params.delete("q");
    } else {
      params.set("q", newQuery.trim());
    }

    startTransition(() => {
      router.replace(`/insights?${params.toString()}#insights-directory`, { scroll: false });
    });
  };

  const handleCategorySelect = (cat: string) => {
    updateFilters(cat, searchTerm);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateFilters(activeCategory, searchTerm);
  };

  const handleClearSearch = () => {
    setSearchTerm("");
    updateFilters(activeCategory, "");
  };

  const handleReset = () => {
    setSearchTerm("");
    startTransition(() => {
      router.replace("/insights#insights-directory", { scroll: false });
    });
  };

  const hasActiveFilters = (activeCategory !== "all" && activeCategory !== "") || !!activeSearch;

  return (
    <div
      className="p-5 md:p-6 rounded-2xl bg-white border border-[rgba(7,26,40,0.1)] shadow-sm mb-8"
      aria-label="Insights Directory Search and Filters"
    >
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-6">
        {/* Search Input */}
        <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-md">
          <label htmlFor="insights-search" className="sr-only">
            Search property guides, checklists, or regulations
          </label>
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7a93a5]" aria-hidden="true" />
            <input
              id="insights-search"
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by keyword, JDA, 90A, RERA..."
              className="w-full pl-10 pr-10 py-2.5 rounded-full bg-[#F5F1E9] border border-[rgba(7,26,40,0.08)] text-xs sm:text-sm text-[#031C2B] placeholder:text-[#7a93a5] focus:outline-none focus:ring-2 focus:ring-[#0784C8] focus:bg-white transition-colors"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#7a93a5] hover:text-[#031C2B]"
                aria-label="Clear search text"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </form>

        {/* Status and Reset */}
        <div className="flex items-center justify-between lg:justify-end gap-4">
          <span className="text-xs text-[#667d8f] font-mono">
            {totalCount} {totalCount === 1 ? "Guide" : "Guides"} Available
          </span>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#e04865] hover:underline"
              aria-label="Reset all filters"
            >
              <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Reset Filters</span>
            </button>
          )}

          {isPending && (
            <span className="text-xs text-[#0784C8] animate-pulse">Filtering...</span>
          )}
        </div>
      </div>

      {/* Category Pills */}
      <div className="mt-5 pt-5 border-t border-[rgba(7,26,40,0.06)]">
        <span className="text-[11px] font-bold text-[#667d8f] uppercase tracking-wider block mb-2.5">
          Filter by Knowledge Track:
        </span>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Filter articles by category">
          <button
            type="button"
            onClick={() => handleCategorySelect("all")}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 ${
              activeCategory === "all" || !activeCategory
                ? "bg-[#031C2B] text-white shadow-sm"
                : "bg-[#F5F1E9] text-[#4a6171] hover:bg-[#eae3d5] hover:text-[#031C2B]"
            }`}
            aria-pressed={activeCategory === "all" || !activeCategory}
          >
            All Tracks
          </button>

          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => handleCategorySelect(cat)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 ${
                activeCategory.toLowerCase() === cat.toLowerCase()
                  ? "bg-[#031C2B] text-white shadow-sm"
                  : "bg-[#F5F1E9] text-[#4a6171] hover:bg-[#eae3d5] hover:text-[#031C2B]"
              }`}
              aria-pressed={activeCategory.toLowerCase() === cat.toLowerCase()}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

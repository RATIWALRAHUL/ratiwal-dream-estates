"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useState, useTransition } from "react";
import { Search, X, Filter, LayoutGrid, TableProperties, Sparkles } from "lucide-react";

export function LocationFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const currentSearchParam = searchParams.get("search") || "";
  const publicationStatus = searchParams.get("publicationStatus") || "ALL";
  const state = searchParams.get("state") || "ALL";
  const featured = searchParams.get("featured") || "ALL";
  const viewMode = searchParams.get("view") || "grid";

  const [search, setSearch] = useState(currentSearchParam);

  const applyFilters = (overrides: Record<string, string> = {}) => {
    const params = new URLSearchParams(searchParams.toString());

    const newSearch = overrides.search !== undefined ? overrides.search : search;
    const newPub = overrides.publicationStatus !== undefined ? overrides.publicationStatus : publicationStatus;
    const newState = overrides.state !== undefined ? overrides.state : state;
    const newFeatured = overrides.featured !== undefined ? overrides.featured : featured;
    const newView = overrides.view !== undefined ? overrides.view : viewMode;

    if (newSearch.trim()) params.set("search", newSearch.trim());
    else params.delete("search");

    if (newPub && newPub !== "ALL") params.set("publicationStatus", newPub);
    else params.delete("publicationStatus");

    if (newState && newState !== "ALL") params.set("state", newState);
    else params.delete("state");

    if (newFeatured && newFeatured !== "ALL") params.set("featured", newFeatured);
    else params.delete("featured");

    if (newView && newView !== "grid") params.set("view", newView);
    else params.delete("view");

    params.set("page", "1");

    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  const handleClear = () => {
    setSearch("");
    startTransition(() => {
      router.push(pathname);
    });
  };

  const hasActiveFilters =
    Boolean(currentSearchParam.trim()) ||
    publicationStatus !== "ALL" ||
    state !== "ALL" ||
    featured !== "ALL";

  return (
    <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[rgba(7,26,40,0.08)] shadow-[0_4px_20px_rgba(7,26,40,0.04)] space-y-4">
      {/* Top Filter Bar Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[rgba(7,26,40,0.06)]">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-[#eaf5fa] text-[#087fc3] flex items-center justify-center">
            <Filter className="w-3.5 h-3.5" />
          </div>
          <h2 className="text-xs font-bold font-mono text-[#071a28] uppercase tracking-wider">
            Filter Growth Corridors
          </h2>
          {hasActiveFilters && (
            <span className="px-2 py-0.5 rounded-full bg-[#087fc3]/10 text-[#087fc3] text-[10px] font-mono font-bold">
              Active Filters
            </span>
          )}
        </div>

        {/* Right Side: View Mode & Clear Button */}
        <div className="flex items-center gap-3">
          {hasActiveFilters && (
            <button
              type="button"
              onClick={handleClear}
              className="inline-flex items-center gap-1 text-xs font-semibold text-rose-600 hover:text-rose-700 hover:underline cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
              <span>Clear Filters</span>
            </button>
          )}

          {/* View Mode Toggle */}
          <div className="inline-flex p-1 rounded-xl bg-[#f7f5ef] border border-[rgba(7,26,40,0.08)]">
            <button
              type="button"
              onClick={() => applyFilters({ view: "grid" })}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                viewMode === "grid"
                  ? "bg-white text-[#071a28] shadow-xs border border-[rgba(7,26,40,0.08)]"
                  : "text-[#647581] hover:text-[#071a28]"
              }`}
              title="Visual Card Grid View"
            >
              <LayoutGrid className="w-3.5 h-3.5 text-[#087fc3]" />
              <span className="hidden sm:inline">Cards</span>
            </button>

            <button
              type="button"
              onClick={() => applyFilters({ view: "table" })}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                viewMode === "table"
                  ? "bg-white text-[#071a28] shadow-xs border border-[rgba(7,26,40,0.08)]"
                  : "text-[#647581] hover:text-[#071a28]"
              }`}
              title="Detailed Table View"
            >
              <TableProperties className="w-3.5 h-3.5 text-[#087fc3]" />
              <span className="hidden sm:inline">Table</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filter Inputs Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 text-xs">
        {/* Search */}
        <div className="relative lg:col-span-6">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#647581]" />
          <input
            type="text"
            value={search}
            maxLength={50}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") applyFilters();
            }}
            placeholder="Search by corridor name, city, or state..."
            className="w-full pl-10 pr-24 py-2.5 rounded-xl border border-[rgba(7,26,40,0.12)] bg-[#fffdf8] text-xs sm:text-sm text-[#071a28] placeholder:text-[#647581] focus:outline-none focus:border-[#087fc3] focus:ring-2 focus:ring-[#087fc3]/20"
          />
          <button
            type="button"
            onClick={() => applyFilters()}
            disabled={isPending}
            className="absolute right-1.5 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-lg bg-[#071a28] text-white text-xs font-semibold hover:bg-[#0a6ba3] transition-colors cursor-pointer shadow-xs"
          >
            {isPending ? "Filtering..." : "Search"}
          </button>
        </div>

        {/* State Filter */}
        <div className="lg:col-span-3">
          <select
            value={state}
            onChange={(e) => applyFilters({ state: e.target.value })}
            className="w-full p-2.5 rounded-xl border border-[rgba(7,26,40,0.1)] bg-white text-[#071a28] font-medium focus:border-[#087fc3] focus:ring-2 focus:ring-[#087fc3]/20 focus:outline-none"
          >
            <option value="ALL">All Regional States</option>
            <option value="Rajasthan">Rajasthan (Jaipur &amp; Ajmer)</option>
            <option value="Maharashtra">Maharashtra (Navi Mumbai / Panvel)</option>
            <option value="Haryana">Haryana (Bhiwadi / NCR)</option>
          </select>
        </div>

        {/* Publication Status */}
        <div className="lg:col-span-3">
          <select
            value={publicationStatus}
            onChange={(e) => applyFilters({ publicationStatus: e.target.value })}
            className="w-full p-2.5 rounded-xl border border-[rgba(7,26,40,0.1)] bg-white text-[#071a28] font-medium focus:border-[#087fc3] focus:ring-2 focus:ring-[#087fc3]/20 focus:outline-none"
          >
            <option value="ALL">All Publication Statuses</option>
            <option value="PUBLISHED">Live / Published</option>
            <option value="REVIEW">Under Review</option>
            <option value="DRAFT">Draft</option>
            <option value="ARCHIVED">Archived</option>
          </select>
        </div>
      </div>
    </div>
  );
}

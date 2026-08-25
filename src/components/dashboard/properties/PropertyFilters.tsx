"use client";

import Link from "next/link";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useState, useTransition } from "react";
import { Search, X, Filter, Plus } from "lucide-react";

interface PropertyFiltersProps {
  locations: { id: string; name: string }[];
}

export function PropertyFilters({ locations }: PropertyFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const currentSearchParam = searchParams.get("search") || "";
  const locationId = searchParams.get("locationId") || "ALL";
  const propertyType = searchParams.get("propertyType") || "ALL";
  const publicationStatus = searchParams.get("publicationStatus") || "ALL";
  const listingStatus = searchParams.get("listingStatus") || "ALL";
  const verificationStatus = searchParams.get("verificationStatus") || "ALL";
  const sortBy = searchParams.get("sortBy") || "updated";

  const [search, setSearch] = useState(currentSearchParam);

  const applyFilters = (overrides: Record<string, string> = {}) => {
    const params = new URLSearchParams(searchParams.toString());

    const newSearch = overrides.search !== undefined ? overrides.search : search;
    const newLoc = overrides.locationId !== undefined ? overrides.locationId : locationId;
    const newType = overrides.propertyType !== undefined ? overrides.propertyType : propertyType;
    const newPub = overrides.publicationStatus !== undefined ? overrides.publicationStatus : publicationStatus;
    const newList = overrides.listingStatus !== undefined ? overrides.listingStatus : listingStatus;
    const newVer = overrides.verificationStatus !== undefined ? overrides.verificationStatus : verificationStatus;
    const newSort = overrides.sortBy !== undefined ? overrides.sortBy : sortBy;

    if (newSearch.trim()) params.set("search", newSearch.trim());
    else params.delete("search");

    if (newLoc && newLoc !== "ALL") params.set("locationId", newLoc);
    else params.delete("locationId");

    if (newType && newType !== "ALL") params.set("propertyType", newType);
    else params.delete("propertyType");

    if (newPub && newPub !== "ALL") params.set("publicationStatus", newPub);
    else params.delete("publicationStatus");

    if (newList && newList !== "ALL") params.set("listingStatus", newList);
    else params.delete("listingStatus");

    if (newVer && newVer !== "ALL") params.set("verificationStatus", newVer);
    else params.delete("verificationStatus");

    if (newSort && newSort !== "updated") params.set("sortBy", newSort);
    else params.delete("sortBy");

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
    locationId !== "ALL" ||
    propertyType !== "ALL" ||
    publicationStatus !== "ALL" ||
    listingStatus !== "ALL" ||
    verificationStatus !== "ALL" ||
    sortBy !== "updated";

  return (
    <div className="p-5 rounded-2xl bg-white border border-[rgba(7,26,40,0.08)] shadow-xs space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-[#087fc3]" />
          <h2 className="text-xs font-bold font-mono text-[#071a28] uppercase tracking-wider">
            Filter & Search Catalog
          </h2>
        </div>

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

          <Link
            href="/dashboard/properties/new"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#071a28] text-white text-xs font-bold hover:bg-[#0a6ba3] transition-all shadow-xs shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Add Property</span>
          </Link>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#647581]" />
        <input
          type="text"
          value={search}
          maxLength={50}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") applyFilters();
          }}
          placeholder="Search by property title, slug, or highway corridor (Press Enter)..."
          className="w-full pl-10 pr-24 py-2.5 rounded-xl border border-[rgba(7,26,40,0.12)] text-xs sm:text-sm text-[#071a28] placeholder:text-[#647581] focus:outline-none focus:border-[#087fc3] focus:ring-2 focus:ring-[#087fc3]/10"
        />
        <button
          type="button"
          onClick={() => applyFilters()}
          disabled={isPending}
          className="absolute right-1.5 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-lg bg-[#071a28] text-white text-xs font-semibold hover:bg-[#0a6ba3] transition-colors cursor-pointer"
        >
          {isPending ? "Filtering..." : "Search"}
        </button>
      </div>

      {/* Filter Dropdowns Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 text-xs">
        <div>
          <label className="block text-[10px] font-mono uppercase text-[#647581] mb-1">
            Location
          </label>
          <select
            value={locationId}
            onChange={(e) => applyFilters({ locationId: e.target.value })}
            className="w-full p-2 rounded-xl border border-[rgba(7,26,40,0.1)] bg-white text-[#071a28] font-medium focus:border-[#087fc3] focus:outline-none"
          >
            <option value="ALL">All Hubs</option>
            {locations.map((loc) => (
              <option key={loc.id} value={loc.id}>
                {loc.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[10px] font-mono uppercase text-[#647581] mb-1">
            Type
          </label>
          <select
            value={propertyType}
            onChange={(e) => applyFilters({ propertyType: e.target.value })}
            className="w-full p-2 rounded-xl border border-[rgba(7,26,40,0.1)] bg-white text-[#071a28] font-medium focus:border-[#087fc3] focus:outline-none"
          >
            <option value="ALL">All Types</option>
            <option value="RESIDENTIAL_PLOT">Residential Plot</option>
            <option value="COMMERCIAL_PLOT">Commercial Plot</option>
            <option value="INDUSTRIAL_PLOT">Industrial Plot</option>
            <option value="FARM_LAND">Farm Land</option>
            <option value="VILLA">Villa</option>
          </select>
        </div>

        <div>
          <label className="block text-[10px] font-mono uppercase text-[#647581] mb-1">
            Publication
          </label>
          <select
            value={publicationStatus}
            onChange={(e) => applyFilters({ publicationStatus: e.target.value })}
            className="w-full p-2 rounded-xl border border-[rgba(7,26,40,0.1)] bg-white text-[#071a28] font-medium focus:border-[#087fc3] focus:outline-none"
          >
            <option value="ALL">All Statuses</option>
            <option value="PUBLISHED">Published (Live)</option>
            <option value="REVIEW">Under Review</option>
            <option value="DRAFT">Draft</option>
            <option value="ARCHIVED">Archived</option>
          </select>
        </div>

        <div>
          <label className="block text-[10px] font-mono uppercase text-[#647581] mb-1">
            Inventory
          </label>
          <select
            value={listingStatus}
            onChange={(e) => applyFilters({ listingStatus: e.target.value })}
            className="w-full p-2 rounded-xl border border-[rgba(7,26,40,0.1)] bg-white text-[#071a28] font-medium focus:border-[#087fc3] focus:outline-none"
          >
            <option value="ALL">All Availability</option>
            <option value="AVAILABLE">Available</option>
            <option value="LIMITED">Limited</option>
            <option value="RESERVED">Reserved</option>
            <option value="SOLD">Sold Out</option>
            <option value="UNAVAILABLE">Unavailable</option>
          </select>
        </div>

        <div>
          <label className="block text-[10px] font-mono uppercase text-[#647581] mb-1">
            Verification
          </label>
          <select
            value={verificationStatus}
            onChange={(e) => applyFilters({ verificationStatus: e.target.value })}
            className="w-full p-2 rounded-xl border border-[rgba(7,26,40,0.1)] bg-white text-[#071a28] font-medium focus:border-[#087fc3] focus:outline-none"
          >
            <option value="ALL">All Diligence</option>
            <option value="VERIFIED">Verified</option>
            <option value="UNDER_REVIEW">Under Review</option>
            <option value="UNVERIFIED">Unverified</option>
            <option value="EXPIRED">Expired</option>
          </select>
        </div>

        <div>
          <label className="block text-[10px] font-mono uppercase text-[#647581] mb-1">
            Sort Order
          </label>
          <select
            value={sortBy}
            onChange={(e) => applyFilters({ sortBy: e.target.value })}
            className="w-full p-2 rounded-xl border border-[rgba(7,26,40,0.1)] bg-white text-[#071a28] font-medium focus:border-[#087fc3] focus:outline-none"
          >
            <option value="updated">Recently Updated</option>
            <option value="newest">Newest Created</option>
            <option value="oldest">Oldest Created</option>
            <option value="title">Title (A-Z)</option>
            <option value="sortOrder">Sort Priority</option>
          </select>
        </div>
      </div>
    </div>
  );
}

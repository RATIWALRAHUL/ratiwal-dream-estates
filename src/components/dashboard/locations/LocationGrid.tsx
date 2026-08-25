"use client";

import Link from "next/link";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { MapPin, ChevronLeft, ChevronRight } from "lucide-react";
import type { PaginatedLocationsResult } from "@/lib/services/dashboard.service";
import { DashboardLocationCard } from "./DashboardLocationCard";

interface LocationGridProps {
  data: PaginatedLocationsResult;
}

export function LocationGrid({ data }: LocationGridProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const { items, pagination } = data;

  const goToPage = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(newPage));
    router.push(`${pathname}?${params.toString()}`);
  };

  if (items.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-[rgba(7,26,40,0.08)] p-12 text-center shadow-xs">
        <div className="w-12 h-12 rounded-2xl bg-[#f7f5ef] text-[#647581] flex items-center justify-center mx-auto mb-3">
          <MapPin className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-[#071a28] font-heading">No Regional Corridors Found</h3>
        <p className="text-xs text-[#647581] mt-1 max-w-sm mx-auto font-body">
          No location hubs match your selected filters. Try clearing filters to view all growth regions.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
        {items.map((loc) => (
          <DashboardLocationCard key={loc.id} location={loc} />
        ))}
      </div>

      {/* Pagination Controls */}
      {pagination.totalPages > 1 && (
        <div className="p-4 rounded-xl bg-white border border-[rgba(7,26,40,0.08)] shadow-xs flex items-center justify-between">
          <span className="text-xs font-mono text-[#647581]">
            Page {pagination.page} of {pagination.totalPages} ({pagination.totalItems} Total Hubs)
          </span>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={!pagination.hasPrevPage}
              onClick={() => goToPage(pagination.page - 1)}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-[rgba(7,26,40,0.1)] text-xs font-semibold text-[#071a28] hover:bg-[#f7f5ef] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>

            <button
              type="button"
              disabled={!pagination.hasNextPage}
              onClick={() => goToPage(pagination.page + 1)}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-[rgba(7,26,40,0.1)] text-xs font-semibold text-[#071a28] hover:bg-[#f7f5ef] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <span>Next</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

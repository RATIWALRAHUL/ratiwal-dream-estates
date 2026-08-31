"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { MapPin, ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { LocationActionMenu } from "./LocationActionMenu";
import type { PaginatedLocationsResult } from "@/lib/services/dashboard.service";

interface LocationTableProps {
  data: PaginatedLocationsResult;
}

export function LocationTable({ data }: LocationTableProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const { items, pagination } = data;

  const goToPage = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(newPage));
    router.push(`${pathname}?${params.toString()}`);
  };

  const statusBadges: Record<string, { bg: string; text: string; border: string }> = {
    PUBLISHED: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200" },
    REVIEW: { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200" },
    DRAFT: { bg: "bg-slate-100", text: "text-slate-700", border: "border-slate-200" },
    ARCHIVED: { bg: "bg-rose-50", text: "text-rose-700", border: "border-rose-200" },
  };

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl border border-[rgba(7,26,40,0.08)] shadow-[0_4px_20px_rgba(7,26,40,0.04)] overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-[rgba(7,26,40,0.06)] flex items-center justify-between">
          <span className="text-xs font-mono text-[#647581]">
            Showing <strong className="text-[#071a28]">{items.length}</strong> of{" "}
            <strong className="text-[#071a28]">{pagination.totalItems}</strong> growth hubs
          </span>

          <span className="text-xs font-mono text-[#647581]">
            Page {pagination.page} of {pagination.totalPages}
          </span>
        </div>

        {items.length === 0 ? (
          <div className="text-center py-16 px-4">
            <MapPin className="w-10 h-10 text-[#647581]/40 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-[#071a28] font-heading">No location hubs found</h3>
            <p className="text-xs text-[#647581] mt-1 max-w-sm mx-auto font-body">
              No growth corridor matches your current filter criteria.
            </p>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-[rgba(7,26,40,0.08)] bg-[#f7f5ef]/60 text-[#647581] font-mono uppercase tracking-wider text-[10px]">
                    <th className="py-3.5 px-4 font-semibold">Corridor Hub</th>
                    <th className="py-3.5 px-4 font-semibold">City &amp; State</th>
                    <th className="py-3.5 px-4 font-semibold">Townships</th>
                    <th className="py-3.5 px-4 font-semibold">Available Plots</th>
                    <th className="py-3.5 px-4 font-semibold">Status</th>
                    <th className="py-3.5 px-4 font-semibold">Audited Date</th>
                    <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[rgba(7,26,40,0.04)]">
                  {items.map((loc) => {
                    const pubStyle = statusBadges[loc.publicationStatus] || statusBadges.DRAFT;
                    const imageSrc = loc.heroImageUrl || `/images/locations/${loc.slug}.jpg`;

                    return (
                      <tr key={loc.id} className="hover:bg-[#f7f5ef]/40 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <div className="relative w-12 h-9 rounded-lg overflow-hidden shrink-0 bg-[#072435] border border-[rgba(7,26,40,0.1)]">
                              <Image
                                src={imageSrc}
                                alt={loc.name}
                                fill
                                sizes="48px"
                                className="object-cover"
                              />
                            </div>
                            <div>
                              <div className="flex items-center gap-1.5">
                                <p className="font-heading font-semibold text-sm text-[#071a28]">{loc.name}</p>
                                {loc.featured && (
                                  <span className="inline-flex items-center gap-0.5 text-[9px] font-mono font-bold text-amber-700 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200">
                                    <Sparkles className="w-2.5 h-2.5" />
                                    Featured
                                  </span>
                                )}
                              </div>
                              <p className="text-[10px] font-mono text-[#647581]">
                                /{loc.slug}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-4 text-[#071a28] font-medium font-body">
                          {loc.city}, {loc.state}
                        </td>

                        <td className="py-3.5 px-4 font-mono font-semibold text-[#071a28]">
                          {loc.propertyCount} Parcels
                        </td>

                        <td className="py-3.5 px-4 font-mono font-semibold text-[#087fc3]">
                          {loc.activePlotCount} Plots
                        </td>

                        <td className="py-3.5 px-4">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase border ${pubStyle.bg} ${pubStyle.text} ${pubStyle.border}`}>
                            {loc.publicationStatus}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-[11px] font-mono text-[#647581]">
                          {loc.lastVerifiedAt ? new Date(loc.lastVerifiedAt).toLocaleDateString() : "Verified"}
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Link
                              href={`/dashboard/locations/${loc.id}/edit`}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#eaf5fa] text-[#087fc3] hover:bg-[#087fc3] hover:text-white text-[11px] font-semibold transition-colors"
                            >
                              Edit
                            </Link>

                            <LocationActionMenu location={loc} />
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden divide-y divide-[rgba(7,26,40,0.06)] p-3 space-y-3">
              {items.map((loc) => {
                const pubStyle = statusBadges[loc.publicationStatus] || statusBadges.DRAFT;
                const imageSrc = loc.heroImageUrl || `/images/locations/${loc.slug}.jpg`;

                return (
                  <div key={loc.id} className="p-4 rounded-xl bg-[#f7f5ef]/40 border border-[rgba(7,26,40,0.06)] space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="relative w-14 h-11 rounded-lg overflow-hidden shrink-0 bg-[#072435]">
                        <Image
                          src={imageSrc}
                          alt={loc.name}
                          fill
                          sizes="56px"
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <h4 className="text-sm font-bold text-[#071a28] font-heading truncate">{loc.name}</h4>
                          <span className={`inline-flex items-center px-1.5 py-0.2 rounded-full text-[9px] font-mono font-bold uppercase border ${pubStyle.bg} ${pubStyle.text} ${pubStyle.border} shrink-0`}>
                            {loc.publicationStatus}
                          </span>
                        </div>
                        <p className="text-xs text-[#647581] font-body">{loc.city}, {loc.state}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-[rgba(7,26,40,0.06)]">
                      <div>
                        <span className="text-[10px] font-mono text-[#647581] block">Townships</span>
                        <span className="font-bold font-mono text-[#071a28]">{loc.propertyCount} Parcels</span>
                      </div>
                      <div>
                        <span className="text-[10px] font-mono text-[#647581] block">Available Plots</span>
                        <span className="font-mono text-[#087fc3] font-bold">{loc.activePlotCount} Available</span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-[rgba(7,26,40,0.06)] flex items-center justify-between gap-2">
                      <Link
                        href={`/dashboard/locations/${loc.id}/edit`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#eaf5fa] text-[#087fc3] text-xs font-semibold"
                      >
                        Edit Corridor
                      </Link>

                      <LocationActionMenu location={loc} />
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between p-4 bg-white rounded-2xl border border-[rgba(7,26,40,0.08)] shadow-xs">
          <button
            type="button"
            onClick={() => goToPage(pagination.page - 1)}
            disabled={!pagination.hasPrevPage}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-[rgba(7,26,40,0.12)] text-xs font-semibold text-[#071a28] hover:bg-[#f7f5ef] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous</span>
          </button>

          <span className="text-xs font-mono text-[#647581]">
            Page <strong className="text-[#071a28]">{pagination.page}</strong> of{" "}
            <strong className="text-[#071a28]">{pagination.totalPages}</strong>
          </span>

          <button
            type="button"
            onClick={() => goToPage(pagination.page + 1)}
            disabled={!pagination.hasNextPage}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-[rgba(7,26,40,0.12)] text-xs font-semibold text-[#071a28] hover:bg-[#f7f5ef] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            <span>Next</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}

import Link from "next/link";
import Image from "next/image";
import { ExternalLink, Building2, ArrowRight, Edit3, Layers, CheckCircle2, Clock } from "lucide-react";
import type { DashboardOverviewData } from "@/lib/services/dashboard.service";

interface RecentPropertiesTableProps {
  properties: DashboardOverviewData["recentProperties"];
}

export function RecentPropertiesTable({ properties }: RecentPropertiesTableProps) {
  const statusBadges: Record<
    string,
    { bg: string; text: string; border: string; dot: string; halo: string }
  > = {
    PUBLISHED: {
      bg: "bg-emerald-50/80",
      text: "text-emerald-700",
      border: "border-emerald-200",
      dot: "bg-emerald-500",
      halo: "shadow-[0_0_8px_#10b981]",
    },
    REVIEW: {
      bg: "bg-amber-50/80",
      text: "text-amber-700",
      border: "border-amber-200",
      dot: "bg-amber-500",
      halo: "shadow-[0_0_8px_#f59e0b]",
    },
    DRAFT: {
      bg: "bg-slate-100/80",
      text: "text-slate-700",
      border: "border-slate-200",
      dot: "bg-slate-400",
      halo: "shadow-none",
    },
    ARCHIVED: {
      bg: "bg-rose-50/80",
      text: "text-rose-700",
      border: "border-rose-200",
      dot: "bg-rose-500",
      halo: "shadow-[0_0_8px_#f43f5e]",
    },
  };

  const listingBadges: Record<string, { bg: string; text: string; border: string }> = {
    AVAILABLE: { bg: "bg-[#eaf5fa]", text: "text-[#087fc3]", border: "border-[#087fc3]/20" },
    LIMITED: { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200" },
    RESERVED: { bg: "bg-indigo-50", text: "text-indigo-700", border: "border-indigo-200" },
    SOLD: { bg: "bg-rose-50", text: "text-rose-700", border: "border-rose-200" },
    UNAVAILABLE: { bg: "bg-slate-100", text: "text-slate-600", border: "border-slate-200" },
  };

  return (
    <div className="p-6 sm:p-7 rounded-3xl bg-gradient-to-br from-white via-[#fffdf8] to-[#fbf9f4] border border-[rgba(7,26,40,0.08)] shadow-[0_4px_24px_rgba(7,26,40,0.03)] space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#eaf5fa] text-[#087fc3] border border-[#087fc3]/20 flex items-center justify-center shadow-xs">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-normal font-serif text-[#071a28] tracking-tight">
              Recently Recorded Properties & Townships
            </h2>
            <p className="text-xs text-[#647581] mt-0.5 font-sans">
              Latest master-planned developments synchronized in the portfolio database
            </p>
          </div>
        </div>

        <Link
          href="/dashboard/properties"
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white border border-[rgba(7,26,40,0.1)] text-xs font-bold text-[#071a28] hover:bg-[#071a28] hover:text-white transition-all shadow-2xs"
        >
          <span>View All Properties</span>
          <ArrowRight className="w-3.5 h-3.5 text-[#087fc3]" />
        </Link>
      </div>

      {properties.length === 0 ? (
        <div className="text-center py-12 text-xs text-[#647581] bg-white rounded-2xl border border-[rgba(7,26,40,0.06)]">
          No properties have been recorded in the database yet.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-[rgba(7,26,40,0.06)] bg-white">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#f7f5ef]/60 border-b border-[rgba(7,26,40,0.06)] text-[#647581] font-mono uppercase tracking-widest text-[10px]">
                <th className="py-3.5 px-4 font-bold">Property & Township</th>
                <th className="py-3.5 px-4 font-bold">Corridor Hub</th>
                <th className="py-3.5 px-4 font-bold text-right">Pricing</th>
                <th className="py-3.5 px-4 font-bold">Publication</th>
                <th className="py-3.5 px-4 font-bold">Availability</th>
                <th className="py-3.5 px-4 font-bold text-right">Quick Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[rgba(7,26,40,0.04)]">
              {properties.map((p) => {
                const pubStyle = statusBadges[p.publicationStatus] || statusBadges.DRAFT;
                const listStyle = listingBadges[p.listingStatus] || listingBadges.AVAILABLE;

                return (
                  <tr
                    key={p.id}
                    className="hover:bg-[#f7f5ef]/40 transition-all duration-150 group"
                  >
                    {/* Property Title & Type */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 border border-[rgba(7,26,40,0.08)] overflow-hidden shrink-0 flex items-center justify-center text-[#647581] relative">
                          <Building2 className="w-5 h-5 text-[#087fc3]" />
                        </div>
                        <div className="truncate max-w-[220px] sm:max-w-xs">
                          <p className="font-bold text-[#071a28] truncate group-hover:text-[#087fc3] transition-colors">
                            {p.title}
                          </p>
                          <p className="text-[10px] font-mono text-[#647581] uppercase tracking-wider truncate mt-0.5">
                            {p.propertyType.replace(/_/g, " ")}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Location */}
                    <td className="py-3.5 px-4 text-[#071a28] font-medium truncate max-w-[130px]">
                      {p.locationName}
                    </td>

                    {/* Price */}
                    <td className="py-3.5 px-4 font-mono font-bold text-[#071a28] text-right">
                      {p.priceDisplay}
                    </td>

                    {/* Publication Status with Halo Dot */}
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase border ${pubStyle.bg} ${pubStyle.text} ${pubStyle.border}`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${pubStyle.dot} ${pubStyle.halo}`} />
                        <span>{p.publicationStatus}</span>
                      </span>
                    </td>

                    {/* Listing Status */}
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-mono font-semibold border ${listStyle.bg} ${listStyle.text} ${listStyle.border}`}
                      >
                        {p.listingStatus}
                      </span>
                    </td>

                    {/* Quick Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          href={`/dashboard/properties/${p.id}/edit`}
                          className="p-1.5 rounded-lg border border-[rgba(7,26,40,0.08)] bg-white text-[#071a28] hover:bg-[#071a28] hover:text-white transition-all shadow-2xs"
                          title="Edit Property"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </Link>

                        <Link
                          href={`/dashboard/properties/${p.id}/inventory`}
                          className="p-1.5 rounded-lg border border-[rgba(7,26,40,0.08)] bg-white text-[#087fc3] hover:bg-[#087fc3] hover:text-white transition-all shadow-2xs"
                          title="Manage Plot Inventory"
                        >
                          <Layers className="w-3.5 h-3.5" />
                        </Link>

                        {p.isPublished && (
                          <Link
                            href={`/properties/${p.slug}`}
                            target="_blank"
                            className="p-1.5 rounded-lg border border-[rgba(7,26,40,0.08)] bg-[#071a28] text-white hover:bg-[#0a6ba3] transition-all shadow-2xs"
                            title="Open Public Page"
                          >
                            <ExternalLink className="w-3.5 h-3.5 text-[#42b7e8]" />
                          </Link>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

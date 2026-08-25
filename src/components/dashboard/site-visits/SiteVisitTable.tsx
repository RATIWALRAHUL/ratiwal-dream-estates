import Link from "next/link";
import { Eye, MapPin, Video, Building } from "lucide-react";
import { SiteVisitStatusBadge } from "./SiteVisitStatusBadge";
import { SiteVisitPriorityBadge } from "./SiteVisitPriorityBadge";
import type { SiteVisitListItem } from "@/lib/services/site-visit.service";

interface SiteVisitTableProps {
  items: SiteVisitListItem[];
  totalCount: number;
  page: number;
  perPage: number;
  totalPages: number;
  currentParams: string;
}

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Kolkata",
    hour12: true,
  });
}

export function SiteVisitTable({
  items,
  totalCount,
  page,
  perPage,
  totalPages,
  currentParams,
}: SiteVisitTableProps) {
  const base = new URLSearchParams(currentParams);

  function pageLink(p: number) {
    const params = new URLSearchParams(base.toString());
    params.set("page", String(p));
    return `/dashboard/site-visits?${params.toString()}`;
  }

  if (items.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-[rgba(7,26,40,0.08)] shadow-xs p-12 text-center">
        <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
          <Eye className="w-6 h-6 text-slate-400" />
        </div>
        <h3 className="text-base font-bold font-serif text-[#071a28] mb-1">No site visits found</h3>
        <p className="text-xs text-[#647581]">Try adjusting your filters or check the calendar agenda.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-[rgba(7,26,40,0.08)] shadow-xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-xs" role="table" aria-label="Site visits table">
          <thead>
            <tr className="border-b border-[rgba(7,26,40,0.06)] bg-[#f8f7f4]">
              <th className="px-4 py-3 text-left font-mono text-[10px] uppercase tracking-widest text-[#647581]">Reference</th>
              <th className="px-4 py-3 text-left font-mono text-[10px] uppercase tracking-widest text-[#647581]">Visitor</th>
              <th className="px-4 py-3 text-left font-mono text-[10px] uppercase tracking-widest text-[#647581]">Property</th>
              <th className="px-4 py-3 text-left font-mono text-[10px] uppercase tracking-widest text-[#647581]">Schedule</th>
              <th className="px-4 py-3 text-left font-mono text-[10px] uppercase tracking-widest text-[#647581]">Mode</th>
              <th className="px-4 py-3 text-left font-mono text-[10px] uppercase tracking-widest text-[#647581]">Advisor</th>
              <th className="px-4 py-3 text-left font-mono text-[10px] uppercase tracking-widest text-[#647581]">Status</th>
              <th className="px-4 py-3 text-left font-mono text-[10px] uppercase tracking-widest text-[#647581]">Priority</th>
              <th className="px-4 py-3 text-right font-mono text-[10px] uppercase tracking-widest text-[#647581]">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[rgba(7,26,40,0.04)]">
            {items.map((visit) => {
              const displayTime = visit.scheduledStartAt || visit.requestedStartAt;
              return (
                <tr key={visit.id} className="hover:bg-[#f8f7f4]/60 transition-colors group">
                  <td className="px-4 py-3">
                    <span className="font-mono text-[10px] font-bold text-[#647581] tracking-widest">
                      {visit.referenceNumber}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-semibold text-[#071a28] text-xs">{visit.visitorName}</p>
                    <p className="text-[10px] text-[#647581] font-mono">{visit.maskedPhone}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-[#071a28] text-xs truncate max-w-[150px] font-medium">
                      {visit.propertyTitle}
                    </p>
                    {visit.locationName && (
                      <p className="text-[10px] text-[#647581] truncate max-w-[150px]">
                        {visit.locationName}
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-[#071a28] text-xs font-mono font-medium">{formatDateTime(displayTime)}</p>
                    <p className="text-[10px] text-[#647581]">{visit.durationMinutes} mins</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-1 text-[10px] text-[#071a28]">
                      {visit.meetingMode === "VIRTUAL_TOUR" ? (
                        <Video className="w-3 h-3 text-[#087fc3]" />
                      ) : visit.meetingMode === "OFFICE_CONSULTATION" ? (
                        <Building className="w-3 h-3 text-[#087fc3]" />
                      ) : (
                        <MapPin className="w-3 h-3 text-[#087fc3]" />
                      )}
                      <span>
                        {visit.meetingMode === "VIRTUAL_TOUR"
                          ? "Virtual"
                          : visit.meetingMode === "OFFICE_CONSULTATION"
                          ? "Office"
                          : "On-site"}
                      </span>
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-[10px] text-[#071a28] truncate max-w-[120px] block">
                      {visit.assignedAdvisorName ?? (
                        <span className="text-amber-600 font-semibold">Unassigned</span>
                      )}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <SiteVisitStatusBadge status={visit.status} />
                  </td>
                  <td className="px-4 py-3">
                    <SiteVisitPriorityBadge priority={visit.priority} showLabel />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/dashboard/site-visits/${visit.id}`}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-bold text-[#087fc3] border border-[#087fc3]/30 hover:bg-[#087fc3]/5 transition-colors"
                      aria-label={`View visit ${visit.referenceNumber}`}
                    >
                      <Eye className="w-3 h-3" />
                      View
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="border-t border-[rgba(7,26,40,0.06)] px-4 py-3 flex items-center justify-between bg-[#f8f7f4]/40">
        <p className="text-[10px] text-[#647581] font-mono">
          {(page - 1) * perPage + 1}–{Math.min(page * perPage, totalCount)} of {totalCount.toLocaleString("en-IN")} visits
        </p>
        <div className="flex items-center gap-1">
          {page > 1 && (
            <Link
              href={pageLink(page - 1)}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-[rgba(7,26,40,0.12)] text-[#071a28] hover:bg-white transition-colors"
            >
              ← Prev
            </Link>
          )}
          {page < totalPages && (
            <Link
              href={pageLink(page + 1)}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-[rgba(7,26,40,0.12)] text-[#071a28] hover:bg-white transition-colors"
            >
              Next →
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

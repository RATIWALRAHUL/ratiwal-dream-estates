import Link from "next/link";
import { Eye, MapPin, Video, Building, Calendar, User } from "lucide-react";
import { SiteVisitStatusBadge } from "./SiteVisitStatusBadge";
import { SiteVisitPriorityBadge } from "./SiteVisitPriorityBadge";
import type { SiteVisitListItem } from "@/lib/services/site-visit.service";

interface SiteVisitCardListProps {
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
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Kolkata",
    hour12: true,
  });
}

export function SiteVisitCardList({
  items,
  totalCount,
  page,
  perPage,
  totalPages,
  currentParams,
}: SiteVisitCardListProps) {
  const base = new URLSearchParams(currentParams);

  function pageLink(p: number) {
    const params = new URLSearchParams(base.toString());
    params.set("page", String(p));
    return `/dashboard/site-visits?${params.toString()}`;
  }

  if (items.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-[rgba(7,26,40,0.08)] p-10 text-center">
        <p className="text-sm font-serif text-[#071a28] mb-1">No site visits found</p>
        <p className="text-xs text-[#647581]">Adjust filters or wait for new requests.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3" role="list" aria-label="Site visits">
      {items.map((visit) => {
        const displayTime = visit.scheduledStartAt || visit.requestedStartAt;
        return (
          <div
            key={visit.id}
            role="listitem"
            className="bg-white rounded-2xl border border-[rgba(7,26,40,0.08)] shadow-xs p-4 space-y-3"
          >
            {/* Header row */}
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-bold text-sm text-[#071a28]">{visit.visitorName}</p>
                <p className="text-[10px] font-mono text-[#647581]">{visit.maskedPhone}</p>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <SiteVisitPriorityBadge priority={visit.priority} />
                <SiteVisitStatusBadge status={visit.status} />
              </div>
            </div>

            {/* Property */}
            <div className="flex items-center gap-1.5 text-xs text-[#071a28] font-medium">
              <Building className="w-3.5 h-3.5 text-[#087fc3] shrink-0" />
              <span className="truncate">{visit.propertyTitle}</span>
            </div>

            {/* Schedule & Mode */}
            <div className="flex items-center justify-between text-[11px] text-[#647581] bg-[#f8f7f4] p-2.5 rounded-xl border border-[rgba(7,26,40,0.04)]">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#647581]" />
                <span className="font-mono text-[#071a28] font-semibold">{formatDateTime(displayTime)}</span>
              </div>
              <div className="flex items-center gap-1">
                {visit.meetingMode === "VIRTUAL_TOUR" ? (
                  <Video className="w-3 h-3 text-[#087fc3]" />
                ) : (
                  <MapPin className="w-3 h-3 text-[#087fc3]" />
                )}
                <span>{visit.meetingMode === "VIRTUAL_TOUR" ? "Virtual" : "On-site"}</span>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-1 text-[10px] text-[#647581]">
                <User className="w-3 h-3" />
                <span>{visit.assignedAdvisorName ?? <span className="text-amber-600 font-semibold">Unassigned</span>}</span>
              </div>
              <Link
                href={`/dashboard/site-visits/${visit.id}`}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-[10px] font-bold text-[#087fc3] border border-[#087fc3]/30 hover:bg-[#087fc3]/5 transition-colors"
                aria-label={`View visit ${visit.referenceNumber}`}
              >
                <Eye className="w-3 h-3" />
                View
              </Link>
            </div>
          </div>
        );
      })}

      {/* Pagination */}
      <div className="flex justify-between items-center pt-2">
        <p className="text-[10px] text-[#647581] font-mono">
          {(page - 1) * perPage + 1}–{Math.min(page * perPage, totalCount)} of {totalCount.toLocaleString("en-IN")}
        </p>
        <div className="flex gap-1">
          {page > 1 && (
            <Link
              href={pageLink(page - 1)}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-[rgba(7,26,40,0.12)] text-[#071a28] bg-white"
            >
              ← Prev
            </Link>
          )}
          {page < totalPages && (
            <Link
              href={pageLink(page + 1)}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-[rgba(7,26,40,0.12)] text-[#071a28] bg-white"
            >
              Next →
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

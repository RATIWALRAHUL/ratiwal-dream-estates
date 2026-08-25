import Link from "next/link";
import { AlertCircle, Eye, MapPin, Building2 } from "lucide-react";
import { LeadStatusBadge } from "./LeadStatusBadge";
import { LeadPriorityBadge } from "./LeadPriorityBadge";
import type { LeadListItem } from "@/lib/services/lead.service";

interface LeadCardListProps {
  items: LeadListItem[];
  totalCount: number;
  page: number;
  perPage: number;
  totalPages: number;
  currentParams: string;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Kolkata",
  });
}

export function LeadCardList({ items, totalCount, page, perPage, totalPages, currentParams }: LeadCardListProps) {
  const base = new URLSearchParams(currentParams);

  function pageLink(p: number) {
    const params = new URLSearchParams(base.toString());
    params.set("page", String(p));
    return `/dashboard/leads?${params.toString()}`;
  }

  if (items.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-[rgba(7,26,40,0.08)] p-10 text-center">
        <p className="text-sm font-serif text-[#071a28] mb-1">No leads found</p>
        <p className="text-xs text-[#647581]">Adjust filters or wait for new inquiries.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3" role="list" aria-label="Lead inquiries">
      {items.map((lead) => (
        <div
          key={lead.id}
          role="listitem"
          className="bg-white rounded-2xl border border-[rgba(7,26,40,0.08)] shadow-xs p-4 space-y-3"
        >
          {/* Header row */}
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="font-bold text-sm text-[#071a28] truncate">{lead.fullName}</p>
              <p className="text-[10px] font-mono text-[#647581]">{lead.maskedPhone}</p>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <LeadPriorityBadge priority={lead.priority} />
              <LeadStatusBadge status={lead.status} />
            </div>
          </div>

          {/* Interest */}
          {(lead.propertyTitle || lead.locationName) && (
            <div className="flex items-center gap-1.5 text-xs text-[#071a28]">
              {lead.propertyTitle ? <Building2 className="w-3 h-3 text-[#087fc3] shrink-0" /> : <MapPin className="w-3 h-3 text-[#087fc3] shrink-0" />}
              <span className="truncate">{lead.propertyTitle ?? lead.locationName}</span>
            </div>
          )}

          {/* Meta row */}
          <div className="flex items-center justify-between gap-2 text-[10px] text-[#647581]">
            <span className="font-mono tracking-widest">{lead.referenceNumber}</span>
            <span>{formatDate(lead.createdAt)}</span>
          </div>

          {/* Follow-up overdue */}
          {lead.nextFollowUpAt && lead.isFollowUpOverdue && (
            <div className="flex items-center gap-1.5 text-rose-600 text-[10px] font-bold" role="alert">
              <AlertCircle className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Follow-up overdue</span>
            </div>
          )}

          {/* Advisor */}
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-[#647581]">
              {lead.assignedToName ? `Advisor: ${lead.assignedToName}` : <span className="text-amber-600 font-semibold">Unassigned</span>}
            </span>
            <Link
              href={`/dashboard/leads/${lead.id}`}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-[10px] font-bold text-[#087fc3] border border-[#087fc3]/30 hover:bg-[#087fc3]/5 transition-colors"
              aria-label={`View lead ${lead.referenceNumber}`}
            >
              <Eye className="w-3 h-3" />
              View
            </Link>
          </div>
        </div>
      ))}

      {/* Pagination */}
      <div className="flex justify-between items-center pt-2">
        <p className="text-[10px] text-[#647581] font-mono">
          {((page - 1) * perPage) + 1}–{Math.min(page * perPage, totalCount)} of {totalCount.toLocaleString("en-IN")}
        </p>
        <div className="flex gap-1">
          {page > 1 && (
            <Link href={pageLink(page - 1)} className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-[rgba(7,26,40,0.12)] text-[#071a28] bg-white">← Prev</Link>
          )}
          {page < totalPages && (
            <Link href={pageLink(page + 1)} className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-[rgba(7,26,40,0.12)] text-[#071a28] bg-white">Next →</Link>
          )}
        </div>
      </div>
    </div>
  );
}

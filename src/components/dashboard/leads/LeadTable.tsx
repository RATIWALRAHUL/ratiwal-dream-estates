import Link from "next/link";
import { AlertCircle, Eye, Clock } from "lucide-react";
import { LeadStatusBadge } from "./LeadStatusBadge";
import { LeadPriorityBadge } from "./LeadPriorityBadge";
import type { LeadListItem } from "@/lib/services/lead.service";

interface LeadTableProps {
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
    year: "2-digit",
    timeZone: "Asia/Kolkata",
  });
}

function formatFollowUp(iso: string, isOverdue: boolean): string {
  const d = new Date(iso);
  const formatted = d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    timeZone: "Asia/Kolkata",
  });
  return isOverdue ? `${formatted} ⚠` : formatted;
}

const SOURCE_SHORT: Record<string, string> = {
  PROPERTY_DETAIL: "Prop. Detail",
  PROPERTY_CARD: "Prop. Card",
  LOCATION_PAGE: "Location",
  HOMEPAGE_CTA: "Homepage",
  CONTACT_PAGE: "Contact",
  ADVISOR_SECTION: "Advisor",
  DIRECT: "Direct",
  OTHER: "Other",
};

export function LeadTable({ items, totalCount, page, perPage, totalPages, currentParams }: LeadTableProps) {
  const base = new URLSearchParams(currentParams);

  function pageLink(p: number) {
    const params = new URLSearchParams(base.toString());
    params.set("page", String(p));
    return `/dashboard/leads?${params.toString()}`;
  }

  if (items.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-[rgba(7,26,40,0.08)] shadow-xs p-12 text-center">
        <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
          <Eye className="w-6 h-6 text-slate-400" />
        </div>
        <h3 className="text-base font-bold font-serif text-[#071a28] mb-1">No leads found</h3>
        <p className="text-xs text-[#647581]">Try adjusting your filters or check back when new inquiries arrive.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-[rgba(7,26,40,0.08)] shadow-xs overflow-hidden">
      {/* Table — desktop */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-xs" role="table" aria-label="Lead inquiries table">
          <thead>
            <tr className="border-b border-[rgba(7,26,40,0.06)] bg-[#f8f7f4]">
              <th className="px-4 py-3 text-left font-mono text-[10px] uppercase tracking-widest text-[#647581]">Reference</th>
              <th className="px-4 py-3 text-left font-mono text-[10px] uppercase tracking-widest text-[#647581]">Client</th>
              <th className="px-4 py-3 text-left font-mono text-[10px] uppercase tracking-widest text-[#647581]">Interest</th>
              <th className="px-4 py-3 text-left font-mono text-[10px] uppercase tracking-widest text-[#647581]">Source</th>
              <th className="px-4 py-3 text-left font-mono text-[10px] uppercase tracking-widest text-[#647581]">Status</th>
              <th className="px-4 py-3 text-left font-mono text-[10px] uppercase tracking-widest text-[#647581]">Priority</th>
              <th className="px-4 py-3 text-left font-mono text-[10px] uppercase tracking-widest text-[#647581]">Advisor</th>
              <th className="px-4 py-3 text-left font-mono text-[10px] uppercase tracking-widest text-[#647581]">Follow-up</th>
              <th className="px-4 py-3 text-left font-mono text-[10px] uppercase tracking-widest text-[#647581]">Received</th>
              <th className="px-4 py-3 text-right font-mono text-[10px] uppercase tracking-widest text-[#647581]">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[rgba(7,26,40,0.04)]">
            {items.map((lead) => (
              <tr key={lead.id} className="hover:bg-[#f8f7f4]/60 transition-colors group">
                <td className="px-4 py-3">
                  <span className="font-mono text-[10px] font-bold text-[#647581] tracking-widest">{lead.referenceNumber}</span>
                </td>
                <td className="px-4 py-3">
                  <p className="font-semibold text-[#071a28] text-xs">{lead.fullName}</p>
                  <p className="text-[10px] text-[#647581] font-mono">{lead.maskedPhone}</p>
                </td>
                <td className="px-4 py-3">
                  <p className="text-[#071a28] text-xs truncate max-w-[140px]">
                    {lead.propertyTitle || lead.locationName || <span className="text-[#647581] italic">General inquiry</span>}
                  </p>
                </td>
                <td className="px-4 py-3">
                  <span className="text-[10px] text-[#647581]">{SOURCE_SHORT[lead.source] ?? lead.source}</span>
                </td>
                <td className="px-4 py-3">
                  <LeadStatusBadge status={lead.status} />
                </td>
                <td className="px-4 py-3">
                  <LeadPriorityBadge priority={lead.priority} showLabel />
                </td>
                <td className="px-4 py-3">
                  <span className="text-[10px] text-[#071a28] truncate max-w-[100px] block">
                    {lead.assignedToName ?? <span className="text-amber-600 font-semibold">Unassigned</span>}
                  </span>
                </td>
                <td className="px-4 py-3">
                  {lead.nextFollowUpAt ? (
                    <span className={`inline-flex items-center gap-1 text-[10px] font-mono ${lead.isFollowUpOverdue ? "text-rose-600 font-bold" : "text-[#647581]"}`}>
                      {lead.isFollowUpOverdue && <AlertCircle className="w-3 h-3" aria-label="Overdue" />}
                      {formatFollowUp(lead.nextFollowUpAt, lead.isFollowUpOverdue)}
                    </span>
                  ) : (
                    <span className="text-[10px] text-slate-300">—</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <span className="text-[10px] text-[#647581]">{formatDate(lead.createdAt)}</span>
                </td>
                <td className="px-4 py-3 text-right">
                  <Link
                    href={`/dashboard/leads/${lead.id}`}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-bold text-[#087fc3] border border-[#087fc3]/30 hover:bg-[#087fc3]/5 transition-colors"
                    aria-label={`View lead ${lead.referenceNumber}`}
                  >
                    <Eye className="w-3 h-3" />
                    View
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer: count + pagination */}
      <div className="border-t border-[rgba(7,26,40,0.06)] px-4 py-3 flex items-center justify-between bg-[#f8f7f4]/40">
        <p className="text-[10px] text-[#647581] font-mono">
          {((page - 1) * perPage) + 1}–{Math.min(page * perPage, totalCount)} of {totalCount.toLocaleString("en-IN")} leads
        </p>
        <div className="flex items-center gap-1">
          {page > 1 && (
            <Link href={pageLink(page - 1)} className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-[rgba(7,26,40,0.12)] text-[#071a28] hover:bg-white transition-colors">
              ← Prev
            </Link>
          )}
          {page < totalPages && (
            <Link href={pageLink(page + 1)} className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-[rgba(7,26,40,0.12)] text-[#071a28] hover:bg-white transition-colors">
              Next →
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

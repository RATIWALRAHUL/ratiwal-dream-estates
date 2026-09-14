"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  Eye,
  Trash2,
  CheckSquare,
  Square,
  Loader2,
} from "lucide-react";
import { LeadStatusBadge } from "./LeadStatusBadge";
import { LeadPriorityBadge } from "./LeadPriorityBadge";
import type { LeadListItem } from "@/lib/services/lead.service";
import { deleteLeadAction, bulkDeleteLeadsAction } from "@/lib/actions/lead.actions";
import {
  showToast,
  confirmDeleteInquiry,
  confirmBulkDeleteInquiries,
} from "@/lib/sweetalert";

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

export function LeadTable({
  items,
  totalCount,
  page,
  perPage,
  totalPages,
  currentParams,
}: LeadTableProps) {
  const router = useRouter();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isPending, startTransition] = useTransition();

  const base = new URLSearchParams(currentParams);

  function pageLink(p: number) {
    const params = new URLSearchParams(base.toString());
    params.set("page", String(p));
    return `/dashboard/leads?${params.toString()}`;
  }

  const allOnPageSelected = items.length > 0 && items.every((item) => selectedIds.includes(item.id));
  const someSelected = selectedIds.length > 0;

  function toggleSelectAll() {
    if (allOnPageSelected) {
      const pageItemIds = new Set(items.map((i) => i.id));
      setSelectedIds((prev) => prev.filter((id) => !pageItemIds.has(id)));
    } else {
      const pageItemIds = items.map((i) => i.id);
      setSelectedIds((prev) => Array.from(new Set([...prev, ...pageItemIds])));
    }
  }

  function toggleSelectRow(id: string) {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  }

  async function handleSingleDelete(lead: LeadListItem) {
    const confirmed = await confirmDeleteInquiry(lead.referenceNumber, lead.fullName);
    if (!confirmed) return;

    startTransition(async () => {
      try {
        const res = await deleteLeadAction(lead.id);
        if (res.success) {
          setSelectedIds((prev) => prev.filter((id) => id !== lead.id));
          showToast.success("Inquiry Deleted", res.message || `Lead ${lead.referenceNumber} has been removed.`);
          router.refresh();
        } else {
          showToast.error("Deletion Failed", res.message || "Could not delete lead inquiry.");
        }
      } catch {
        showToast.error("Error", "An unexpected error occurred while deleting.");
      }
    });
  }

  async function handleBulkDelete() {
    if (selectedIds.length === 0) return;
    const confirmed = await confirmBulkDeleteInquiries(selectedIds.length);
    if (!confirmed) return;

    const idsToDelete = [...selectedIds];

    startTransition(async () => {
      try {
        const res = await bulkDeleteLeadsAction(idsToDelete);
        if (res.success) {
          setSelectedIds([]);
          showToast.success("Bulk Deletion Complete", res.message || `Deleted ${idsToDelete.length} lead inquiries.`);
          router.refresh();
        } else {
          showToast.error("Bulk Deletion Failed", res.message || "Could not delete selected leads.");
        }
      } catch {
        showToast.error("Error", "An unexpected error occurred during bulk deletion.");
      }
    });
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
    <div className="space-y-3">
      {/* Floating Selection Bar */}
      {someSelected && (
        <div className="sticky top-4 z-20 bg-[#071a28] text-white rounded-2xl p-3 px-4 shadow-xl border border-white/10 flex flex-wrap items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-3">
            <span className="px-2.5 py-1 rounded-lg bg-[#087fc3] text-white text-[11px] font-mono font-bold">
              {selectedIds.length} Selected
            </span>
            <span className="text-xs text-slate-300 hidden sm:inline">
              Manage inquiry records across the advisory pipeline
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setSelectedIds([])}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
            >
              Deselect All
            </button>
            <button
              type="button"
              disabled={isPending}
              onClick={handleBulkDelete}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold bg-rose-600 text-white hover:bg-rose-700 shadow-sm transition-all disabled:opacity-50"
            >
              {isPending ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Trash2 className="w-3.5 h-3.5" />
              )}
              <span>Delete Selected ({selectedIds.length})</span>
            </button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-[rgba(7,26,40,0.08)] shadow-xs overflow-hidden">
        {/* Table — desktop */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs" role="table" aria-label="Lead inquiries table">
            <thead>
              <tr className="border-b border-[rgba(7,26,40,0.06)] bg-[#f8f7f4]">
                <th className="w-10 px-4 py-3 text-center">
                  <button
                    type="button"
                    onClick={toggleSelectAll}
                    className="text-slate-400 hover:text-[#071a28] transition-colors p-1"
                    title={allOnPageSelected ? "Deselect all on this page" : "Select all on this page"}
                    aria-label="Toggle select all on page"
                  >
                    {allOnPageSelected ? (
                      <CheckSquare className="w-4 h-4 text-[#087fc3]" />
                    ) : someSelected ? (
                      <div className="w-4 h-4 rounded border-2 border-[#087fc3] bg-[#087fc3]/20 flex items-center justify-center">
                        <div className="w-2 h-0.5 bg-[#087fc3]" />
                      </div>
                    ) : (
                      <Square className="w-4 h-4 text-slate-300" />
                    )}
                  </button>
                </th>
                <th className="px-4 py-3 text-left font-mono text-[10px] uppercase tracking-widest text-[#647581]">Reference</th>
                <th className="px-4 py-3 text-left font-mono text-[10px] uppercase tracking-widest text-[#647581]">Client</th>
                <th className="px-4 py-3 text-left font-mono text-[10px] uppercase tracking-widest text-[#647581]">Interest</th>
                <th className="px-4 py-3 text-left font-mono text-[10px] uppercase tracking-widest text-[#647581]">Source</th>
                <th className="px-4 py-3 text-left font-mono text-[10px] uppercase tracking-widest text-[#647581]">Status</th>
                <th className="px-4 py-3 text-left font-mono text-[10px] uppercase tracking-widest text-[#647581]">Priority</th>
                <th className="px-4 py-3 text-left font-mono text-[10px] uppercase tracking-widest text-[#647581]">Advisor</th>
                <th className="px-4 py-3 text-left font-mono text-[10px] uppercase tracking-widest text-[#647581]">Follow-up</th>
                <th className="px-4 py-3 text-left font-mono text-[10px] uppercase tracking-widest text-[#647581]">Received</th>
                <th className="px-4 py-3 text-right font-mono text-[10px] uppercase tracking-widest text-[#647581]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[rgba(7,26,40,0.04)]">
              {items.map((lead) => {
                const isSelected = selectedIds.includes(lead.id);
                return (
                  <tr
                    key={lead.id}
                    className={`transition-colors group ${
                      isSelected ? "bg-[#087fc3]/5" : "hover:bg-[#f8f7f4]/60"
                    }`}
                  >
                    <td className="px-4 py-3 text-center">
                      <button
                        type="button"
                        onClick={() => toggleSelectRow(lead.id)}
                        className="text-slate-400 hover:text-[#071a28] transition-colors p-1"
                        aria-label={`Select lead ${lead.referenceNumber}`}
                      >
                        {isSelected ? (
                          <CheckSquare className="w-4 h-4 text-[#087fc3]" />
                        ) : (
                          <Square className="w-4 h-4 text-slate-300" />
                        )}
                      </button>
                    </td>
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
                      <div className="inline-flex items-center justify-end gap-1.5">
                        <Link
                          href={`/dashboard/leads/${lead.id}`}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-bold text-[#087fc3] border border-[#087fc3]/30 hover:bg-[#087fc3]/5 transition-colors"
                          aria-label={`View lead ${lead.referenceNumber}`}
                        >
                          <Eye className="w-3 h-3" />
                          View
                        </Link>
                        <button
                          type="button"
                          disabled={isPending}
                          onClick={() => handleSingleDelete(lead)}
                          className="inline-flex items-center gap-1 px-2 py-1.5 rounded-lg text-[10px] font-bold text-rose-600 border border-rose-200 hover:bg-rose-50 hover:border-rose-300 transition-colors disabled:opacity-50"
                          title="Delete inquiry"
                          aria-label={`Delete lead ${lead.referenceNumber}`}
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
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
    </div>
  );
}

"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  Eye,
  Trash2,
  MapPin,
  Building2,
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

export function LeadCardList({
  items,
  totalCount,
  page,
  perPage,
  totalPages,
  currentParams,
}: LeadCardListProps) {
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

  function toggleSelectCard(id: string) {
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
          showToast.success("Inquiry Deleted", res.message || `Lead ${lead.referenceNumber} removed.`);
          router.refresh();
        } else {
          showToast.error("Deletion Failed", res.message || "Failed to delete lead inquiry.");
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
          showToast.success("Bulk Deletion Complete", res.message || `Deleted ${idsToDelete.length} leads.`);
          router.refresh();
        } else {
          showToast.error("Bulk Deletion Failed", res.message || "Failed to delete selected leads.");
        }
      } catch {
        showToast.error("Error", "An unexpected error occurred during bulk deletion.");
      }
    });
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
      {/* Mobile Selection Header */}
      <div className="flex items-center justify-between p-2 px-3 rounded-xl bg-slate-100/80 border border-slate-200/60 text-xs">
        <button
          type="button"
          onClick={toggleSelectAll}
          className="flex items-center gap-2 font-medium text-slate-700 hover:text-slate-900"
        >
          {allOnPageSelected ? (
            <CheckSquare className="w-4 h-4 text-[#087fc3]" />
          ) : (
            <Square className="w-4 h-4 text-slate-400" />
          )}
          <span>{allOnPageSelected ? "Deselect Page" : "Select All on Page"}</span>
        </button>

        {someSelected && (
          <button
            type="button"
            disabled={isPending}
            onClick={handleBulkDelete}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold bg-rose-600 text-white shadow-xs disabled:opacity-50"
          >
            {isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
            <span>Delete ({selectedIds.length})</span>
          </button>
        )}
      </div>

      {/* Cards */}
      {items.map((lead) => {
        const isSelected = selectedIds.includes(lead.id);
        return (
          <div
            key={lead.id}
            role="listitem"
            className={`rounded-2xl border p-4 space-y-3 transition-all ${
              isSelected
                ? "bg-[#087fc3]/5 border-[#087fc3]/40 shadow-xs"
                : "bg-white border-[rgba(7,26,40,0.08)] shadow-xs"
            }`}
          >
            {/* Header row with checkbox */}
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-start gap-2.5 min-w-0">
                <button
                  type="button"
                  onClick={() => toggleSelectCard(lead.id)}
                  className="mt-0.5 text-slate-400 hover:text-[#071a28] p-0.5"
                  aria-label={`Select lead ${lead.referenceNumber}`}
                >
                  {isSelected ? (
                    <CheckSquare className="w-4 h-4 text-[#087fc3]" />
                  ) : (
                    <Square className="w-4 h-4 text-slate-300" />
                  )}
                </button>
                <div className="min-w-0">
                  <p className="font-bold text-sm text-[#071a28] truncate">{lead.fullName}</p>
                  <p className="text-[10px] font-mono text-[#647581]">{lead.maskedPhone}</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <LeadPriorityBadge priority={lead.priority} />
                <LeadStatusBadge status={lead.status} />
              </div>
            </div>

            {/* Interest */}
            {(lead.propertyTitle || lead.locationName) && (
              <div className="flex items-center gap-1.5 text-xs text-[#071a28]">
                {lead.propertyTitle ? (
                  <Building2 className="w-3 h-3 text-[#087fc3] shrink-0" />
                ) : (
                  <MapPin className="w-3 h-3 text-[#087fc3] shrink-0" />
                )}
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

            {/* Advisor & Action Buttons */}
            <div className="flex items-center justify-between pt-1 border-t border-slate-100">
              <span className="text-[10px] text-[#647581] truncate max-w-[150px]">
                {lead.assignedToName ? `Advisor: ${lead.assignedToName}` : <span className="text-amber-600 font-semibold">Unassigned</span>}
              </span>
              <div className="flex items-center gap-2">
                <Link
                  href={`/dashboard/leads/${lead.id}`}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-[10px] font-bold text-[#087fc3] border border-[#087fc3]/30 hover:bg-[#087fc3]/5 transition-colors"
                  aria-label={`View lead ${lead.referenceNumber}`}
                >
                  <Eye className="w-3 h-3" />
                  View
                </Link>
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => handleSingleDelete(lead)}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-bold text-rose-600 border border-rose-200 hover:bg-rose-50 transition-colors disabled:opacity-50"
                  aria-label={`Delete lead ${lead.referenceNumber}`}
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        );
      })}

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

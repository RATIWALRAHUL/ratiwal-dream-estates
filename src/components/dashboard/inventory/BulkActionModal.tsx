"use client";

import { useState, useTransition } from "react";
import { UnitStatus, UnitVisibility, UNIT_STATUSES, UNIT_VISIBILITIES } from "@/types/inventory";
import { bulkUpdateUnitsAction } from "@/lib/actions/inventory-unit.actions";
import { X, Loader2 } from "lucide-react";

interface BulkActionModalProps {
  selectedUnitIds: string[];
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function BulkActionModal({
  selectedUnitIds,
  isOpen,
  onClose,
  onSuccess,
}: BulkActionModalProps) {
  const [actionType, setActionType] = useState<"CHANGE_STATUS" | "CHANGE_VISIBILITY" | "ARCHIVE">("CHANGE_STATUS");
  const [newStatus, setNewStatus] = useState<UnitStatus>("AVAILABLE");
  const [newVisibility, setNewVisibility] = useState<UnitVisibility>("PUBLIC_DETAIL");
  const [reasonCode, setReasonCode] = useState<string>("BULK_STAFF_UPDATE");
  const [comment, setComment] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  if (!isOpen) return null;

  const handleConfirm = () => {
    setError(null);
    startTransition(async () => {
      const res = await bulkUpdateUnitsAction({
        unitIds: selectedUnitIds,
        actionType,
        newStatus: actionType === "CHANGE_STATUS" ? newStatus : undefined,
        newVisibility: actionType === "CHANGE_VISIBILITY" ? newVisibility : undefined,
        reasonCode,
        comment,
      });

      if (!res.success) {
        setError(res.message);
      } else {
        onSuccess();
        onClose();
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl border border-[rgba(7,26,40,0.1)] shadow-2xl max-w-md w-full p-6 space-y-5 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between pb-3 border-b border-[rgba(7,26,40,0.06)]">
          <div>
            <h3 className="text-base font-bold font-serif text-[#071a28]">
              Bulk Update ({selectedUnitIds.length} Units Selected)
            </h3>
            <p className="text-xs text-[#647581] mt-0.5">Batch modify inventory units safely</p>
          </div>
          <button type="button" onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-[#071a28]">
            <X className="w-4 h-4" />
          </button>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold">
            {error}
          </div>
        )}

        <div className="space-y-4 text-xs">
          <div>
            <label className="font-bold text-[#071a28] block mb-1.5">Action Type</label>
            <select
              value={actionType}
              onChange={(e) => setActionType(e.target.value as any)}
              disabled={isPending}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[rgba(7,26,40,0.12)] bg-[#f8f7f4] text-xs font-semibold text-[#071a28]"
            >
              <option value="CHANGE_STATUS">Change Status</option>
              <option value="CHANGE_VISIBILITY">Change Visibility</option>
            </select>
          </div>

          {actionType === "CHANGE_STATUS" && (
            <div>
              <label className="font-bold text-[#071a28] block mb-1.5">New Status</label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value as UnitStatus)}
                disabled={isPending}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[rgba(7,26,40,0.12)] bg-[#f8f7f4] text-xs font-semibold text-[#071a28]"
              >
                {UNIT_STATUSES.map((s) => (
                  <option key={s} value={s}>{s.replace(/_/g, " ")}</option>
                ))}
              </select>
            </div>
          )}

          {actionType === "CHANGE_VISIBILITY" && (
            <div>
              <label className="font-bold text-[#071a28] block mb-1.5">New Visibility</label>
              <select
                value={newVisibility}
                onChange={(e) => setNewVisibility(e.target.value as UnitVisibility)}
                disabled={isPending}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[rgba(7,26,40,0.12)] bg-[#f8f7f4] text-xs font-semibold text-[#071a28]"
              >
                {UNIT_VISIBILITIES.map((v) => (
                  <option key={v} value={v}>{v.replace(/_/g, " ")}</option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="font-bold text-[#071a28] block mb-1.5">Reason Code *</label>
            <input
              type="text"
              value={reasonCode}
              onChange={(e) => setReasonCode(e.target.value)}
              placeholder="e.g. BATCH_RELEASE_PHASE_2"
              required
              disabled={isPending}
              className="w-full px-3.5 py-2 rounded-xl border border-[rgba(7,26,40,0.12)] bg-[#f8f7f4] text-xs font-semibold"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            className="px-4 py-2 rounded-xl border border-[rgba(7,26,40,0.1)] text-[#647581] hover:text-[#071a28] text-xs font-bold transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isPending}
            className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-[#071a28] hover:bg-[#087fc3] text-white text-xs font-bold transition-all shadow-xs disabled:opacity-50"
          >
            {isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            <span>Apply Bulk Update</span>
          </button>
        </div>
      </div>
    </div>
  );
}

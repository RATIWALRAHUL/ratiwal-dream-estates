"use client";

import { useState, useTransition } from "react";
import { UnitStatus, PERMITTED_STATUS_TRANSITIONS } from "@/types/inventory";
import { transitionUnitStatusAction } from "@/lib/actions/inventory-unit.actions";
import { X, Loader2, ShieldCheck, AlertCircle } from "lucide-react";

interface UnitStatusModalProps {
  unitId: string;
  unitNumber: string;
  currentStatus: UnitStatus;
  currentVersion: number;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function UnitStatusModal({
  unitId,
  unitNumber,
  currentStatus,
  currentVersion,
  isOpen,
  onClose,
  onSuccess,
}: UnitStatusModalProps) {
  const [toStatus, setToStatus] = useState<UnitStatus>("AVAILABLE");
  const [reasonCode, setReasonCode] = useState<string>("OPERATIONAL_UPDATE");
  const [comment, setComment] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  if (!isOpen) return null;

  const allowedStatuses = PERMITTED_STATUS_TRANSITIONS[currentStatus] || [];

  const handleConfirm = () => {
    setError(null);
    startTransition(async () => {
      const res = await transitionUnitStatusAction({
        unitId,
        toStatus,
        currentVersion,
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
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[rgba(7,26,40,0.06)]">
          <div>
            <h3 className="text-base font-bold font-serif text-[#071a28]">
              Transition Unit Status
            </h3>
            <p className="text-xs text-[#647581] mt-0.5">Unit {unitNumber}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-[#071a28]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="space-y-4 text-xs">
          <div>
            <label className="font-bold text-[#071a28] block mb-1.5">Target Status *</label>
            <select
              value={toStatus}
              onChange={(e) => setToStatus(e.target.value as UnitStatus)}
              disabled={isPending}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[rgba(7,26,40,0.12)] bg-[#f8f7f4] text-xs font-semibold text-[#071a28]"
            >
              {allowedStatuses.map((s) => (
                <option key={s} value={s}>
                  {s.replace(/_/g, " ")}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="font-bold text-[#071a28] block mb-1.5">Reason Code *</label>
            <select
              value={reasonCode}
              onChange={(e) => setReasonCode(e.target.value)}
              disabled={isPending}
              className="w-full px-3.5 py-2 rounded-xl border border-[rgba(7,26,40,0.12)] bg-[#f8f7f4] text-xs font-semibold text-[#071a28]"
            >
              <option value="OPERATIONAL_UPDATE">Operational / Staff Update</option>
              <option value="CLIENT_INTEREST_HOLD">Client Interest / Temporary Hold</option>
              <option value="RESERVATION_REQUESTED">Customer Reservation (PRD 12 Pre-state)</option>
              <option value="LEGAL_TITLE_REVIEW">Legal Review / Title Verification</option>
              <option value="DEVELOPER_BLOCK">Developer Blocked Allocation</option>
              <option value="STATUS_REVERSAL">Correction / Status Reversal</option>
            </select>
          </div>

          <div>
            <label className="font-bold text-[#071a28] block mb-1.5">Sanitized Internal Comment</label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={2}
              placeholder="Reason context or management notes (no customer PII)…"
              disabled={isPending}
              className="w-full p-2.5 rounded-xl border border-[rgba(7,26,40,0.12)] bg-[#f8f7f4] text-xs font-medium text-[#071a28]"
            />
          </div>
        </div>

        {/* Buttons */}
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
            disabled={isPending || allowedStatuses.length === 0}
            className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-[#071a28] hover:bg-[#087fc3] text-white text-xs font-bold transition-all shadow-xs disabled:opacity-50"
          >
            {isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            <span>Confirm Transition</span>
          </button>
        </div>
      </div>
    </div>
  );
}

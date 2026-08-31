"use client";

import { useState } from "react";
import { AlertTriangle, RotateCcw, RefreshCw } from "lucide-react";

interface ReturnToDraftModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
  isPending: boolean;
}

export function ReturnToDraftModal({
  isOpen,
  onClose,
  onConfirm,
  isPending,
}: ReturnToDraftModalProps) {
  const [reason, setReason] = useState("");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
      <div className="max-w-md w-full p-6 rounded-3xl bg-white shadow-2xl border border-[rgba(7,26,40,0.1)] space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <RotateCcw className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#071a28]">Return to Draft for Corrections</h3>
            <p className="text-xs text-[#647581]">Provide feedback for the editorial submitter</p>
          </div>
        </div>

        <p className="text-xs text-[#647581]">
          Returning this property will move it back to DRAFT status and record your feedback in the audit history.
        </p>

        <div>
          <label className="block text-[10px] font-mono uppercase text-[#071a28] font-bold mb-1">
            Reason / Required Corrections <span className="text-rose-500">*</span>
          </label>
          <textarea
            required
            rows={3}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="e.g. Please update RERA certificate PDF and verify maximum price calculation."
            className="w-full p-3 rounded-xl border border-[rgba(7,26,40,0.12)] text-xs text-[#071a28] focus:outline-none focus:border-amber-500"
          />
        </div>

        <div className="flex items-center justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-[rgba(7,26,40,0.12)] text-[#071a28] text-xs font-semibold hover:bg-slate-50 cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => onConfirm(reason)}
            disabled={isPending || reason.trim().length < 5}
            className="px-4 py-2 rounded-xl bg-amber-600 text-white text-xs font-bold hover:bg-amber-700 disabled:opacity-40 transition-colors cursor-pointer"
          >
            {isPending ? "Returning..." : "Confirm Return"}
          </button>
        </div>
      </div>
    </div>
  );
}

interface ConcurrencyConflictModalProps {
  isOpen: boolean;
  onRefresh: () => void;
}

export function ConcurrencyConflictModal({
  isOpen,
  onRefresh,
}: ConcurrencyConflictModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
      <div className="max-w-md w-full p-6 rounded-3xl bg-white shadow-2xl border border-rose-200 text-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-[#071a28]">Concurrency Conflict Detected</h3>
        <p className="text-xs text-[#647581] leading-relaxed">
          This property was modified by another administrator since you opened this editor. To prevent overwriting recent changes, please refresh and review the latest version before saving again.
        </p>
        <button
          type="button"
          onClick={onRefresh}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#071a28] text-white text-xs font-bold hover:bg-[#0a6ba3] transition-colors cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Latest Version</span>
        </button>
      </div>
    </div>
  );
}

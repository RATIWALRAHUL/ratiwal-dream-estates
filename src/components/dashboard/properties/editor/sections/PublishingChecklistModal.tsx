"use client";

import { CheckCircle2, AlertTriangle, XCircle, ShieldCheck, X } from "lucide-react";
import type { PublishingChecklistResult } from "@/lib/services/property-editor.service";

interface PublishingChecklistModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmPublish: () => void;
  checklist: PublishingChecklistResult | null;
  isLoading: boolean;
  isPublishing: boolean;
  propertyTitle: string;
}

export function PublishingChecklistModal({
  isOpen,
  onClose,
  onConfirmPublish,
  checklist,
  isLoading,
  isPublishing,
  propertyTitle,
}: PublishingChecklistModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
      <div className="max-w-lg w-full p-6 sm:p-7 rounded-3xl bg-white shadow-2xl border border-[rgba(7,26,40,0.1)] space-y-5 max-h-[90vh] overflow-y-auto">
        <div className="flex items-start justify-between pb-3 border-b border-[rgba(7,26,40,0.06)]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#071a28]">Publishing Pre-Flight Review</h3>
              <p className="text-xs text-[#647581] line-clamp-1">{propertyTitle}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="p-1 rounded-lg text-[#647581] hover:text-[#071a28] cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {isLoading ? (
          <div className="py-12 text-center text-xs text-[#647581] animate-pulse">
            Evaluating 16 statutory and catalog validation rules...
          </div>
        ) : !checklist ? (
          <div className="py-8 text-center text-xs text-rose-600">
            Failed to run pre-flight checklist. Please try again.
          </div>
        ) : (
          <div className="space-y-4 text-xs">
            {/* Blocking Issues */}
            {checklist.blocking.length > 0 && (
              <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 space-y-2">
                <div className="flex items-center gap-2 text-rose-800 font-bold">
                  <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{checklist.blocking.length} Blocking Issue(s) — Cannot Publish</span>
                </div>
                <ul className="list-disc list-inside space-y-1 text-rose-700 text-[11px]">
                  {checklist.blocking.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Non-Blocking Warnings */}
            {checklist.warnings.length > 0 && (
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 space-y-2">
                <div className="flex items-center gap-2 text-amber-800 font-bold">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>{checklist.warnings.length} Advisory Warning(s)</span>
                </div>
                <ul className="list-disc list-inside space-y-1 text-amber-700 text-[11px]">
                  {checklist.warnings.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Ready Checklist Items */}
            {checklist.ready.length > 0 && (
              <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200 space-y-2">
                <div className="flex items-center gap-2 text-emerald-800 font-bold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{checklist.ready.length} Validation Check(s) Passed</span>
                </div>
                <ul className="list-disc list-inside space-y-1 text-emerald-700 text-[11px]">
                  {checklist.ready.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-[rgba(7,26,40,0.06)]">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-[rgba(7,26,40,0.12)] text-[#071a28] text-xs font-semibold hover:bg-slate-50 cursor-pointer"
          >
            Back to Editor
          </button>

          <button
            type="button"
            onClick={onConfirmPublish}
            disabled={!checklist?.canPublish || isPublishing || isLoading}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-xs cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{isPublishing ? "Publishing..." : "Confirm & Go Live"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

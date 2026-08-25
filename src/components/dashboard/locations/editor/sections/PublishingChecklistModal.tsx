"use client";

import { CheckCircle2, AlertTriangle, XCircle, ShieldCheck, X, Loader2 } from "lucide-react";
import type { LocationPublishingChecklistResult } from "@/lib/utils/location-intelligence";

interface PublishingChecklistModalProps {
  isOpen: boolean;
  onClose: () => void;
  checklist: LocationPublishingChecklistResult;
  onConfirmPublish: () => void;
  isPublishing: boolean;
  userRole: string;
}

export function PublishingChecklistModal({
  isOpen,
  onClose,
  checklist,
  onConfirmPublish,
  isPublishing,
  userRole,
}: PublishingChecklistModalProps) {
  if (!isOpen) return null;

  const canPublishRole = userRole === "ADMIN" || userRole === "SUPER_ADMIN";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 border border-[rgba(7,26,40,0.1)] shadow-2xl space-y-6 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-emerald-50 text-emerald-700 border border-emerald-100">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif text-xl text-[#071a28] font-normal">
                16-Point Publishing Pre-Flight Audit
              </h3>
              <p className="text-xs text-[#647581] font-body mt-0.5">
                Automated legal, territorial, and SEO compliance evaluation before going live.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#647581] hover:text-[#071a28] hover:bg-slate-50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Score Summary Bar */}
        <div className="grid grid-cols-3 gap-3 p-4 rounded-2xl bg-[#f7f5ef] border border-[rgba(7,26,40,0.06)] text-center font-mono">
          <div>
            <span className="text-[10px] text-emerald-700 font-bold uppercase block">Ready Checks</span>
            <span className="text-xl font-bold text-emerald-700">{checklist.readyCount}</span>
          </div>
          <div>
            <span className="text-[10px] text-amber-700 font-bold uppercase block">Warnings</span>
            <span className="text-xl font-bold text-amber-700">{checklist.warningCount}</span>
          </div>
          <div>
            <span className="text-[10px] text-rose-700 font-bold uppercase block">Blocking Issues</span>
            <span className="text-xl font-bold text-rose-700">{checklist.blockingCount}</span>
          </div>
        </div>

        {/* Checklist Items List */}
        <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
          {checklist.items.map((item) => {
            return (
              <div
                key={item.id}
                className={`p-3.5 rounded-2xl border flex items-start gap-3 text-xs transition-colors ${
                  item.status === "READY"
                    ? "bg-emerald-50/40 border-emerald-100 text-emerald-900"
                    : item.status === "WARNING"
                    ? "bg-amber-50/50 border-amber-200 text-amber-900"
                    : "bg-rose-50/50 border-rose-200 text-rose-900"
                }`}
              >
                {item.status === "READY" && (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                )}
                {item.status === "WARNING" && (
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                )}
                {item.status === "BLOCKING" && (
                  <XCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                )}

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-[#071a28] font-body">{item.title}</span>
                    <span className="text-[9px] font-mono font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-white/70">
                      {item.category}
                    </span>
                  </div>
                  <p className="text-[11px] mt-0.5 leading-relaxed font-body text-[#4a5568]">
                    {item.message}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-[rgba(7,26,40,0.15)] text-xs font-semibold text-[#071a28] hover:bg-slate-50 transition-colors font-body"
          >
            Close Checklist
          </button>

          <button
            type="button"
            onClick={onConfirmPublish}
            disabled={!checklist.canPublish || !canPublishRole || isPublishing}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed font-body"
          >
            {isPublishing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Publishing...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Confirm &amp; Publish Location</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

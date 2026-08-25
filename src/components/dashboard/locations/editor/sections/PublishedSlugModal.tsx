"use client";

import { useState, useTransition } from "react";
import { AlertTriangle, KeyRound, Loader2, X } from "lucide-react";
import { changePublishedLocationSlugAction } from "@/lib/actions/location.actions";
import { normalizeSlug } from "@/lib/utils/slug";

interface PublishedSlugModalProps {
  isOpen: boolean;
  onClose: () => void;
  locationId: string;
  currentSlug: string;
  onSuccess: (newSlug: string) => void;
}

export function PublishedSlugModal({
  isOpen,
  onClose,
  locationId,
  currentSlug,
  onSuccess,
}: PublishedSlugModalProps) {
  const [newSlug, setNewSlug] = useState(currentSlug);
  const [reason, setReason] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSlug.trim() || !reason.trim() || !confirmed) return;

    setErrorMsg(null);
    startTransition(async () => {
      const res = await changePublishedLocationSlugAction(locationId, {
        newSlug: normalizeSlug(newSlug),
        reason,
        confirmed: true,
      });

      if (res.success && res.data) {
        onSuccess(res.data.newSlug);
        onClose();
      } else {
        setErrorMsg(res.message);
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 border border-[rgba(7,26,40,0.1)] shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5 text-amber-700">
            <KeyRound className="w-5 h-5" />
            <h3 className="font-serif text-lg font-normal text-[#071a28]">
              Modify Published URL Slug
            </h3>
          </div>
          <button type="button" onClick={onClose} className="text-[#647581] hover:text-[#071a28]">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2.5 font-body">
          <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold">Super Admin Authorization Required</p>
            <p className="text-[11px] leading-relaxed text-amber-800">
              Changing a live location slug changes all public URLs (/locations/{currentSlug}). An automatic 308 permanent redirect record and audit log will be written.
            </p>
          </div>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-body">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#071a28] mb-1 font-body">
              Current Published Slug
            </label>
            <input
              type="text"
              disabled
              value={`/locations/${currentSlug}`}
              className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-mono text-[#647581]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#071a28] mb-1 font-body">
              New URL Slug Candidate <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={newSlug}
              onChange={(e) => setNewSlug(normalizeSlug(e.target.value))}
              placeholder="new-corridor-slug"
              className="w-full text-xs p-2.5 rounded-xl border border-[rgba(7,26,40,0.15)] font-mono text-[#071a28] focus:border-[#087fc3] focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#071a28] mb-1 font-body">
              Authorized Business Justification <span className="text-rose-500">*</span>
            </label>
            <textarea
              required
              rows={2}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Official renaming of regional corridor to align with state gazette..."
              className="w-full text-xs p-2.5 rounded-xl border border-[rgba(7,26,40,0.15)] focus:border-[#087fc3] focus:outline-hidden font-body"
            />
          </div>

          <label className="flex items-start gap-2 cursor-pointer text-xs text-[#071a28] font-body select-none pt-1">
            <input
              type="checkbox"
              required
              checked={confirmed}
              onChange={(e) => setConfirmed(e.target.checked)}
              className="w-4 h-4 mt-0.5 rounded text-amber-600 focus:ring-amber-600"
            />
            <span className="text-[11px] leading-tight">
              I understand this changes the live public route and confirm this change.
            </span>
          </label>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-[rgba(7,26,40,0.1)] text-xs font-semibold text-[#071a28] hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending || !newSlug.trim() || newSlug === currentSlug || !reason.trim() || !confirmed}
              className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold disabled:opacity-50"
            >
              {isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>Apply Slug Change</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

"use client";

import { useState, useTransition } from "react";
import { AlertTriangle, RotateCcw, Archive, Loader2, X } from "lucide-react";
import {
  returnLocationToDraftAction,
  archiveLocationAction,
  restoreLocationToDraftAction,
} from "@/lib/actions/location.actions";

interface ReturnToDraftModalProps {
  isOpen: boolean;
  onClose: () => void;
  locationId: string;
  onSuccess: () => void;
}

export function ReturnToDraftModal({
  isOpen,
  onClose,
  locationId,
  onSuccess,
}: ReturnToDraftModalProps) {
  const [reason, setReason] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) return;

    setErrorMsg(null);
    startTransition(async () => {
      const res = await returnLocationToDraftAction(locationId, { reason });
      if (res.success) {
        onSuccess();
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
            <RotateCcw className="w-5 h-5" />
            <h3 className="font-serif text-lg font-normal text-[#071a28]">
              Return Location to Draft
            </h3>
          </div>
          <button type="button" onClick={onClose} className="text-[#647581] hover:text-[#071a28]">
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-[#647581] leading-relaxed font-body">
          Please provide a specific review reason for returning this growth corridor to draft for editorial revisions.
        </p>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-body">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#071a28] mb-1 font-body">
              Revision Reason / Feedback <span className="text-rose-500">*</span>
            </label>
            <textarea
              required
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Missing official gazette source URL for upcoming Ring Road milestone..."
              className="w-full text-xs p-3 rounded-xl border border-[rgba(7,26,40,0.15)] focus:border-[#087fc3] focus:outline-hidden font-body shadow-2xs"
            />
          </div>

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
              disabled={isPending || !reason.trim()}
              className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold disabled:opacity-50"
            >
              {isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>Return to Draft</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

interface ArchiveLocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  locationId: string;
  locationName: string;
  propertyCount: number;
  onSuccess: () => void;
}

export function ArchiveLocationModal({
  isOpen,
  onClose,
  locationId,
  locationName,
  propertyCount,
  onSuccess,
}: ArchiveLocationModalProps) {
  const [reason, setReason] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) return;

    setErrorMsg(null);
    startTransition(async () => {
      const res = await archiveLocationAction(locationId, { reason });
      if (res.success) {
        onSuccess();
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
          <div className="flex items-center gap-2.5 text-rose-600">
            <Archive className="w-5 h-5" />
            <h3 className="font-serif text-lg font-normal text-[#071a28]">
              Archive Location Corridor
            </h3>
          </div>
          <button type="button" onClick={onClose} className="text-[#647581] hover:text-[#071a28]">
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-[#647581] leading-relaxed font-body">
          Archiving <strong>{locationName}</strong> will remove it from the public directory. If any published properties still depend on this location, the archival will be blocked.
        </p>

        {propertyCount > 0 && (
          <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center gap-2 font-body">
            <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600" />
            <span>This location currently has {propertyCount} active property parcel(s) associated with it.</span>
          </div>
        )}

        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-body">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#071a28] mb-1 font-body">
              Archival Justification <span className="text-rose-500">*</span>
            </label>
            <textarea
              required
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Masterplan revision completed; replaced with updated regional corridor..."
              className="w-full text-xs p-3 rounded-xl border border-[rgba(7,26,40,0.15)] focus:border-[#087fc3] focus:outline-hidden font-body shadow-2xs"
            />
          </div>

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
              disabled={isPending || !reason.trim()}
              className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold disabled:opacity-50"
            >
              {isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>Confirm Archival</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

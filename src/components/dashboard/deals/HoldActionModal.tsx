"use client";

import React, { useState, useTransition } from "react";
import { X } from "lucide-react";
import { acquireHoldAction, extendHoldAction, releaseHoldAction } from "@/lib/actions/deal.actions";

interface HoldActionModalProps {
  dealId: string;
  unitId?: string;
  activeHoldId?: string;
  mode: "ACQUIRE" | "EXTEND" | "RELEASE";
  isOpen: boolean;
  onClose: () => void;
}

export function HoldActionModal({
  dealId,
  unitId,
  activeHoldId,
  mode,
  isOpen,
  onClose,
}: HoldActionModalProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [durationHours, setDurationHours] = useState<number>(72);
  const [reason, setReason] = useState<string>("");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    startTransition(async () => {
      if (mode === "ACQUIRE") {
        if (!unitId) {
          setError("Unit must be selected before placing a hold.");
          return;
        }
        const res = await acquireHoldAction({
          dealId,
          unitId,
          durationHours,
        });
        if (!res.success) setError(res.message);
        else onClose();
      } else if (mode === "EXTEND") {
        if (!activeHoldId) return;
        const res = await extendHoldAction({
          holdId: activeHoldId,
          extensionHours: durationHours,
          reason: reason.trim() || "Customer requested additional time for financing",
        });
        if (!res.success) setError(res.message);
        else onClose();
      } else if (mode === "RELEASE") {
        if (!activeHoldId) return;
        const res = await releaseHoldAction({
          holdId: activeHoldId,
          reason: reason.trim() || "Hold released by staff",
        });
        if (!res.success) setError(res.message);
        else onClose();
      }
    });
  };

  const title =
    mode === "ACQUIRE"
      ? "Place Inventory Hold"
      : mode === "EXTEND"
      ? "Extend Hold Deadline"
      : "Release Inventory Hold";

  const description =
    mode === "ACQUIRE"
      ? "Temporarily lock this sellable unit and prevent concurrent allocation."
      : mode === "EXTEND"
      ? "Add extra hours to the active hold expiration window."
      : "Release the unit back to AVAILABLE inventory.";

  return (
    <div className="fixed inset-0 z-50 bg-[#071a28]/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl border border-[rgba(7,26,40,0.12)] shadow-2xl max-w-md w-full p-6 sm:p-8 space-y-5 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex justify-between items-start border-b border-[rgba(7,26,40,0.06)] pb-3.5">
          <div>
            <h3 className="text-base font-bold font-serif text-[#071a28]">{title}</h3>
            <p className="text-xs text-[#647581] mt-0.5">{description}</p>
          </div>
          <button onClick={onClose} disabled={isPending} className="text-[#647581] hover:text-[#071a28] p-1 rounded-lg transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {mode !== "RELEASE" && (
            <div>
              <label className="font-semibold text-[#071a28] block mb-1">
                {mode === "ACQUIRE" ? "Hold Duration (Hours)" : "Extension Duration (Hours)"}
              </label>
              <select
                value={durationHours}
                onChange={(e) => setDurationHours(parseInt(e.target.value, 10))}
                disabled={isPending}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[rgba(7,26,40,0.12)] bg-white text-xs font-semibold text-[#071a28] focus:border-[#0088cc] focus:outline-hidden"
              >
                <option value={24}>24 Hours (1 Day)</option>
                <option value={48}>48 Hours (2 Days)</option>
                <option value={72}>72 Hours (Standard 3 Days)</option>
                <option value={120}>120 Hours (5 Days Special)</option>
              </select>
            </div>
          )}

          {mode !== "ACQUIRE" && (
            <div>
              <label className="font-semibold text-[#071a28] block mb-1">
                Reason for {mode === "EXTEND" ? "Extension" : "Release"} *
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={2}
                required
                disabled={isPending}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[rgba(7,26,40,0.12)] bg-white text-xs text-[#071a28] focus:border-[#0088cc] focus:outline-hidden"
                placeholder={
                  mode === "EXTEND"
                    ? "Explain why the buyer requested additional time..."
                    : "Explain reason for releasing unit back to inventory..."
                }
              />
            </div>
          )}

          <div className="flex justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="px-4 py-2 rounded-xl border border-[rgba(7,26,40,0.12)] text-[#647581] font-semibold hover:bg-stone-50 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className={`px-5 py-2 rounded-xl text-white font-semibold transition shadow-xs cursor-pointer ${
                mode === "RELEASE"
                  ? "bg-rose-600 hover:bg-rose-700"
                  : "bg-[#0088cc] hover:bg-[#0077b5]"
              }`}
            >
              {isPending
                ? "Processing..."
                : mode === "ACQUIRE"
                ? "Place Hold"
                : mode === "EXTEND"
                ? "Extend Hold"
                : "Confirm Release"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

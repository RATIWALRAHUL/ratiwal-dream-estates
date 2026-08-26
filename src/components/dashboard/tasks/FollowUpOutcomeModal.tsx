"use client";

import React, { useState } from "react";
import { LEAD_FOLLOW_UP_OUTCOMES, LeadFollowUpOutcome } from "@/types/task";
import { completeLeadFollowUpAction } from "@/lib/actions/task.actions";
import { CheckCircle2, X } from "lucide-react";

interface FollowUpOutcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  leadId: string;
  taskId?: string;
  leadName?: string;
}

export function FollowUpOutcomeModal({
  isOpen,
  onClose,
  leadId,
  taskId,
  leadName,
}: FollowUpOutcomeModalProps) {
  const [outcome, setOutcome] = useState<LeadFollowUpOutcome>("CONTACTED");
  const [notes, setNotes] = useState("");
  const [needsNextFollowUp, setNeedsNextFollowUp] = useState(false);
  const [nextFollowUpAt, setNextFollowUpAt] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!notes.trim()) {
      setError("Please add brief notes describing the conversation.");
      return;
    }
    if (needsNextFollowUp && !nextFollowUpAt) {
      setError("Please choose a date and time for the next follow-up.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const res = await completeLeadFollowUpAction(
      leadId,
      taskId,
      outcome,
      notes.trim(),
      needsNextFollowUp ? nextFollowUpAt : undefined
    );

    setIsSubmitting(false);
    if (res.success) {
      onClose();
    } else {
      setError(res.message || "Failed to record follow-up.");
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="relative w-full max-w-lg rounded-3xl border border-[rgba(7,26,40,0.08)] bg-white shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[rgba(7,26,40,0.08)] bg-[#f8f7f4]">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <h3 className="font-serif text-lg font-bold text-[#071a28]">
              Record Follow-Up Outcome
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[#647581] hover:text-[#071a28] hover:bg-stone-200/50 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {leadName && (
            <p className="text-xs text-[#647581]">
              Client: <span className="font-bold text-[#071a28]">{leadName}</span>
            </p>
          )}

          {error && (
            <div className="p-3 text-xs text-rose-700 bg-rose-50 rounded-xl border border-rose-200">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-[#071a28] mb-1.5">
              Structured Outcome
            </label>
            <select
              value={outcome}
              onChange={(e) => setOutcome(e.target.value as LeadFollowUpOutcome)}
              className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-[rgba(7,26,40,0.12)] bg-white text-[#071a28] focus:outline-hidden focus:border-[#0088cc]"
            >
              {LEAD_FOLLOW_UP_OUTCOMES.map((oc) => (
                <option key={oc} value={oc}>
                  {oc.replace(/_/g, " ")}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#071a28] mb-1.5">
              Call / Meeting Summary Notes <span className="text-rose-500">*</span>
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Key discussion points, interest level, budget discussed, plot sizes..."
              className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-[rgba(7,26,40,0.12)] bg-white text-[#071a28] focus:outline-hidden focus:border-[#0088cc]"
              required
            />
          </div>

          <div className="pt-2 border-t border-[rgba(7,26,40,0.08)]">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={needsNextFollowUp}
                onChange={(e) => setNeedsNextFollowUp(e.target.checked)}
                className="w-4 h-4 rounded border-stone-300 text-[#0088cc] focus:ring-[#0088cc]"
              />
              <span className="text-xs font-semibold text-[#071a28]">
                Schedule next follow-up
              </span>
            </label>

            {needsNextFollowUp && (
              <div className="mt-3">
                <label className="block text-xs font-semibold text-[#647581] mb-1">
                  Next Follow-Up Date & Time
                </label>
                <input
                  type="datetime-local"
                  value={nextFollowUpAt}
                  onChange={(e) => setNextFollowUpAt(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-[rgba(7,26,40,0.12)] bg-white text-[#071a28] focus:outline-hidden focus:border-[#0088cc]"
                  required={needsNextFollowUp}
                />
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-[rgba(7,26,40,0.08)]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-[#647581] hover:bg-stone-100 rounded-xl transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 text-xs font-semibold text-white bg-[#0088cc] hover:bg-[#0077b5] rounded-xl shadow-xs transition disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? "Recording..." : "Save Outcome"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

"use client";
import { useState, useTransition } from "react";
import { CheckCircle2, UserX, XCircle, Loader2 } from "lucide-react";
import {
  completeSiteVisitAction,
  markSiteVisitNoShowAction,
  cancelSiteVisitAction,
} from "@/lib/actions/site-visit.actions";
import { SiteVisitStatusBadge } from "./SiteVisitStatusBadge";
import { SiteVisitPriorityBadge } from "./SiteVisitPriorityBadge";
import {
  CANCELLATION_REASONS,
  type SiteVisitStatus,
  type SiteVisitPriority,
  type CancellationReason,
} from "@/types/site-visit";

interface SiteVisitStatusPanelProps {
  visitId: string;
  status: SiteVisitStatus;
  priority: SiteVisitPriority;
  version: number;
}

const CANCELLATION_LABELS: Record<CancellationReason, string> = {
  CUSTOMER_REQUESTED: "Customer requested cancellation",
  ADVISOR_UNAVAILABLE: "Advisor unavailable",
  PROPERTY_UNAVAILABLE: "Property or access unavailable",
  WEATHER_OPERATIONAL: "Weather or operational logistics",
  DUPLICATE_BOOKING: "Duplicate booking",
  UNABLE_TO_CONTACT: "Unable to contact visitor",
  OTHER: "Other reason",
};

export function SiteVisitStatusPanel({
  visitId,
  status,
  priority,
  version,
}: SiteVisitStatusPanelProps) {
  const [activeModal, setActiveModal] = useState<"complete" | "noshow" | "cancel" | null>(null);

  // Complete Form
  const [outcomeSummary, setOutcomeSummary] = useState("");
  const [interestLevel, setInterestLevel] = useState<"HIGH" | "MEDIUM" | "LOW" | "UNDECIDED">("HIGH");
  const [recommendation, setRecommendation] = useState("");

  // No-Show Form
  const [noShowNote, setNoShowNote] = useState("");

  // Cancel Form
  const [cancelReason, setCancelReason] = useState<CancellationReason>("CUSTOMER_REQUESTED");
  const [cancelNote, setCancelNote] = useState("");

  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleComplete = (e: React.FormEvent) => {
    e.preventDefault();
    if (!outcomeSummary.trim()) {
      setError("Outcome summary is required.");
      return;
    }
    setError(null);
    startTransition(async () => {
      const result = await completeSiteVisitAction(
        visitId,
        {
          outcomeSummary,
          customerInterestLevel: interestLevel,
          followUpRecommendation: recommendation,
        },
        version
      );
      if (result.success) setActiveModal(null);
      else setError(result.message);
    });
  };

  const handleNoShow = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noShowNote.trim()) {
      setError("A note is required when recording a no-show.");
      return;
    }
    setError(null);
    startTransition(async () => {
      const result = await markSiteVisitNoShowAction(visitId, noShowNote, version);
      if (result.success) setActiveModal(null);
      else setError(result.message);
    });
  };

  const handleCancel = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await cancelSiteVisitAction(visitId, cancelReason, cancelNote, version);
      if (result.success) setActiveModal(null);
      else setError(result.message);
    });
  };

  const isConfirmed = status === "CONFIRMED";
  const isCancellable = status !== "CANCELLED" && status !== "COMPLETED" && status !== "ARCHIVED";

  return (
    <div className="bg-white rounded-2xl border border-[rgba(7,26,40,0.08)] shadow-xs p-5 space-y-4">
      <h3 className="text-[10px] font-mono uppercase tracking-widest text-[#647581] font-bold">
        Workflow Status
      </h3>

      <div className="flex items-center gap-2">
        <SiteVisitStatusBadge status={status} />
        <SiteVisitPriorityBadge priority={priority} showLabel />
      </div>

      {error && <p className="text-xs text-rose-600">{error}</p>}

      {/* Action Buttons */}
      <div className="space-y-2 pt-1">
        {isConfirmed && (
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setActiveModal("complete")}
              className="inline-flex items-center justify-center gap-1 py-2 px-3 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold transition-colors"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              Complete
            </button>
            <button
              onClick={() => setActiveModal("noshow")}
              className="inline-flex items-center justify-center gap-1 py-2 px-3 rounded-xl border border-rose-200 text-rose-700 hover:bg-rose-50 text-xs font-bold transition-colors"
            >
              <UserX className="w-3.5 h-3.5" />
              No-Show
            </button>
          </div>
        )}

        {isCancellable && (
          <button
            onClick={() => setActiveModal("cancel")}
            className="w-full inline-flex items-center justify-center gap-1 py-2 px-3 rounded-xl border border-[rgba(7,26,40,0.12)] text-[#647581] hover:text-rose-600 hover:bg-rose-50/50 text-xs font-semibold transition-colors"
          >
            <XCircle className="w-3.5 h-3.5" />
            Cancel Visit
          </button>
        )}
      </div>

      {/* Complete Modal */}
      {activeModal === "complete" && (
        <form onSubmit={handleComplete} className="space-y-3 p-4 rounded-xl bg-violet-50/60 border border-violet-200">
          <p className="text-xs font-bold text-violet-900">Mark Visit as Completed</p>
          <div>
            <label className="block text-[10px] font-mono uppercase text-[#647581] mb-1">Outcome Summary *</label>
            <textarea
              rows={2}
              placeholder="e.g. Toured plot demarcations, client liked plot #14..."
              value={outcomeSummary}
              onChange={(e) => setOutcomeSummary(e.target.value)}
              required
              className="w-full px-3 py-2 text-xs rounded-lg border border-[rgba(7,26,40,0.12)] bg-white text-[#071a28] focus:outline-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[10px] font-mono uppercase text-[#647581] mb-1">Interest Level</label>
              <select
                value={interestLevel}
                onChange={(e) => setInterestLevel(e.target.value as "HIGH" | "MEDIUM" | "LOW" | "UNDECIDED")}
                className="w-full px-2.5 py-2 text-xs rounded-lg border border-[rgba(7,26,40,0.12)] bg-white text-[#071a28] focus:outline-none"
              >
                <option value="HIGH">High (Ready to buy)</option>
                <option value="MEDIUM">Medium (Evaluating)</option>
                <option value="LOW">Low (Not interested)</option>
                <option value="UNDECIDED">Undecided</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-mono uppercase text-[#647581] mb-1">Recommendation</label>
              <input
                type="text"
                placeholder="Follow up on Monday"
                value={recommendation}
                onChange={(e) => setRecommendation(e.target.value)}
                className="w-full px-2.5 py-2 text-xs rounded-lg border border-[rgba(7,26,40,0.12)] bg-white text-[#071a28] focus:outline-none"
              >
              </input>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={isPending}
              className="flex-1 py-2 rounded-xl bg-violet-700 text-white text-xs font-bold disabled:opacity-50"
            >
              {isPending ? <Loader2 className="w-3 h-3 animate-spin mx-auto" /> : "Save Outcome"}
            </button>
            <button
              type="button"
              onClick={() => setActiveModal(null)}
              className="px-3 py-2 rounded-xl text-xs font-bold text-[#647581] border border-[rgba(7,26,40,0.12)]"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* No-Show Modal */}
      {activeModal === "noshow" && (
        <form onSubmit={handleNoShow} className="space-y-3 p-4 rounded-xl bg-rose-50/60 border border-rose-200">
          <p className="text-xs font-bold text-rose-900">Record Visitor No-Show</p>
          <div>
            <label className="block text-[10px] font-mono uppercase text-[#647581] mb-1">Note (Required) *</label>
            <textarea
              rows={2}
              placeholder="e.g. Visitor was unreachable by phone at scheduled time..."
              value={noShowNote}
              onChange={(e) => setNoShowNote(e.target.value)}
              required
              className="w-full px-3 py-2 text-xs rounded-lg border border-[rgba(7,26,40,0.12)] bg-white text-[#071a28] focus:outline-none"
            />
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={isPending}
              className="flex-1 py-2 rounded-xl bg-rose-700 text-white text-xs font-bold disabled:opacity-50"
            >
              {isPending ? <Loader2 className="w-3 h-3 animate-spin mx-auto" /> : "Confirm No-Show"}
            </button>
            <button
              type="button"
              onClick={() => setActiveModal(null)}
              className="px-3 py-2 rounded-xl text-xs font-bold text-[#647581] border border-[rgba(7,26,40,0.12)]"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Cancel Modal */}
      {activeModal === "cancel" && (
        <form onSubmit={handleCancel} className="space-y-3 p-4 rounded-xl bg-slate-50 border border-slate-200">
          <p className="text-xs font-bold text-[#071a28]">Cancel Site Visit</p>
          <div>
            <label className="block text-[10px] font-mono uppercase text-[#647581] mb-1">Reason *</label>
            <select
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value as CancellationReason)}
              className="w-full px-2.5 py-2 text-xs rounded-lg border border-[rgba(7,26,40,0.12)] bg-white text-[#071a28] focus:outline-none"
            >
              {CANCELLATION_REASONS.map((r) => (
                <option key={r} value={r}>{CANCELLATION_LABELS[r] ?? r}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-mono uppercase text-[#647581] mb-1">Additional Note (Optional)</label>
            <textarea
              rows={2}
              placeholder="Details on cancellation…"
              value={cancelNote}
              onChange={(e) => setCancelNote(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-[rgba(7,26,40,0.12)] bg-white text-[#071a28] focus:outline-none"
            />
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={isPending}
              className="flex-1 py-2 rounded-xl bg-slate-800 text-white text-xs font-bold disabled:opacity-50"
            >
              {isPending ? <Loader2 className="w-3 h-3 animate-spin mx-auto" /> : "Confirm Cancellation"}
            </button>
            <button
              type="button"
              onClick={() => setActiveModal(null)}
              className="px-3 py-2 rounded-xl text-xs font-bold text-[#647581] border border-[rgba(7,26,40,0.12)]"
            >
              Back
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

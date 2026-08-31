"use client";
import { useState, useTransition } from "react";
import { Calendar, CheckCircle2, RefreshCw, Loader2, MapPin } from "lucide-react";
import { confirmSiteVisitAction, rescheduleSiteVisitAction } from "@/lib/actions/site-visit.actions";
import type { SiteVisitStatus } from "@/types/site-visit";

interface SiteVisitSchedulePanelProps {
  visitId: string;
  status: SiteVisitStatus;
  requestedStartAt: string;
  requestedEndAt: string;
  scheduledStartAt?: string;
  scheduledEndAt?: string;
  durationMinutes: number;
  bufferBeforeMinutes: number;
  bufferAfterMinutes: number;
  meetingPointLabel?: string;
  meetingAddress?: string;
  meetingInstructions?: string;
  virtualMeetingUrl?: string;
  assignedAdvisor?: {
    id: string;
    name: string;
    email: string;
  };
  version: number;
}

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Kolkata",
    hour12: true,
  });
}

export function SiteVisitSchedulePanel({
  visitId,
  status,
  requestedStartAt,
  scheduledStartAt,
  scheduledEndAt,
  durationMinutes,
  bufferBeforeMinutes,
  bufferAfterMinutes,
  meetingPointLabel,
  meetingAddress,
  meetingInstructions,
  virtualMeetingUrl,
  assignedAdvisor,
  version,
}: SiteVisitSchedulePanelProps) {
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);

  // Form states for confirmation
  const [confirmStart, setConfirmStart] = useState("");
  const [pointLabel, setPointLabel] = useState(meetingPointLabel || "");
  const [address, setAddress] = useState(meetingAddress || "");
  const [instructions, setInstructions] = useState(meetingInstructions || "");
  const [meetingUrl, setMeetingUrl] = useState(virtualMeetingUrl || "");

  // Form states for reschedule
  const [rescheduleStart, setRescheduleStart] = useState("");
  const [rescheduleReason, setRescheduleReason] = useState("");

  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    const start = confirmStart ? new Date(confirmStart) : new Date(scheduledStartAt || requestedStartAt);
    const end = new Date(start.getTime() + durationMinutes * 60 * 1000);

    setError(null);
    startTransition(async () => {
      const result = await confirmSiteVisitAction(
        visitId,
        start.toISOString(),
        end.toISOString(),
        assignedAdvisor?.id || "",
        assignedAdvisor?.name || "",
        assignedAdvisor?.email || "",
        version,
        pointLabel,
        address,
        instructions,
        meetingUrl
      );
      if (result.success) {
        setShowConfirmModal(false);
      } else {
        setError(result.message);
      }
    });
  };

  const handleReschedule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rescheduleStart || !rescheduleReason.trim()) {
      setError("New date/time and a reason are required.");
      return;
    }
    const start = new Date(rescheduleStart);
    const end = new Date(start.getTime() + durationMinutes * 60 * 1000);

    setError(null);
    startTransition(async () => {
      const result = await rescheduleSiteVisitAction(
        visitId,
        start.toISOString(),
        end.toISOString(),
        rescheduleReason,
        version
      );
      if (result.success) {
        setShowRescheduleModal(false);
        setRescheduleStart("");
        setRescheduleReason("");
      } else {
        setError(result.message);
      }
    });
  };

  const isConfirmed = status === "CONFIRMED";
  const isPendingConfirmation = status === "PENDING_CONFIRMATION" || status === "REQUESTED";

  return (
    <div className="bg-white rounded-2xl border border-[rgba(7,26,40,0.08)] shadow-xs p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-[10px] font-mono uppercase tracking-widest text-[#647581] font-bold">
          Schedule & Logistics
        </h3>
        {isConfirmed && (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
            <CheckCircle2 className="w-3 h-3" />
            Locked
          </span>
        )}
      </div>

      {/* Time display */}
      <div className="p-3.5 rounded-xl bg-[#f8f7f4] border border-[rgba(7,26,40,0.06)] space-y-1.5">
        <div className="flex items-center gap-2 text-xs font-semibold text-[#071a28]">
          <Calendar className="w-4 h-4 text-[#087fc3]" />
          <span>{scheduledStartAt ? formatDateTime(scheduledStartAt) : formatDateTime(requestedStartAt)}</span>
        </div>
        <div className="flex items-center justify-between text-[10px] text-[#647581] font-mono">
          <span>Duration: {durationMinutes} mins</span>
          <span>Buffers: +{bufferBeforeMinutes}m / +{bufferAfterMinutes}m</span>
        </div>
        {scheduledEndAt && (
          <p className="text-[10px] text-[#647581] font-mono">
            Ends: {formatDateTime(scheduledEndAt)} (IST)
          </p>
        )}
      </div>

      {/* Meeting Point / Address (if available) */}
      {(meetingPointLabel || meetingAddress) && (
        <div className="space-y-1 text-xs">
          <p className="text-[10px] font-mono uppercase tracking-wider text-[#647581]">Meeting Point</p>
          <div className="flex items-start gap-1.5 text-[#071a28]">
            <MapPin className="w-3.5 h-3.5 text-[#087fc3] shrink-0 mt-0.5" />
            <div>
              {meetingPointLabel && <p className="font-semibold">{meetingPointLabel}</p>}
              {meetingAddress && <p className="text-[#647581] text-[11px]">{meetingAddress}</p>}
            </div>
          </div>
        </div>
      )}

      {error && <p className="text-xs text-rose-600">{error}</p>}

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-2 pt-1">
        {isPendingConfirmation && (
          <button
            onClick={() => setShowConfirmModal(true)}
            className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors shadow-xs"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            Confirm Schedule
          </button>
        )}

        {isConfirmed && (
          <button
            onClick={() => setShowRescheduleModal(true)}
            className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-[rgba(7,26,40,0.12)] text-[#071a28] hover:bg-[#f8f7f4] text-xs font-bold transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Reschedule
          </button>
        )}
      </div>

      {/* Confirm Modal */}
      {showConfirmModal && (
        <form onSubmit={handleConfirm} className="space-y-3 p-4 rounded-xl bg-emerald-50/50 border border-emerald-200">
          <p className="text-xs font-bold text-emerald-800">Confirm & Lock Site Visit</p>
          <div>
            <label className="block text-[10px] font-mono uppercase text-[#647581] mb-1">
              Confirmed Start Date & Time (IST)
            </label>
            <input
              type="datetime-local"
              value={confirmStart}
              onChange={(e) => setConfirmStart(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-[rgba(7,26,40,0.12)] bg-white text-[#071a28] focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
            />
          </div>
          <div>
            <label className="block text-[10px] font-mono uppercase text-[#647581] mb-1">Meeting Point Label</label>
            <input
              type="text"
              placeholder="e.g. Site Office / Main Gate"
              value={pointLabel}
              onChange={(e) => setPointLabel(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-[rgba(7,26,40,0.12)] bg-white text-[#071a28] focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-[10px] font-mono uppercase text-[#647581] mb-1">Meeting Address / Instructions</label>
            <textarea
              rows={2}
              placeholder="Directions or gate instructions…"
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-[rgba(7,26,40,0.12)] bg-white text-[#071a28] focus:outline-none resize-none"
            />
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={isPending}
              className="flex-1 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold disabled:opacity-50"
            >
              {isPending ? <Loader2 className="w-3 h-3 animate-spin mx-auto" /> : "Confirm Booking"}
            </button>
            <button
              type="button"
              onClick={() => setShowConfirmModal(false)}
              className="px-3 py-2 rounded-xl text-xs font-bold text-[#647581] border border-[rgba(7,26,40,0.12)]"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Reschedule Modal */}
      {showRescheduleModal && (
        <form onSubmit={handleReschedule} className="space-y-3 p-4 rounded-xl bg-amber-50/50 border border-amber-200">
          <p className="text-xs font-bold text-amber-800">Reschedule Site Visit</p>
          <div>
            <label className="block text-[10px] font-mono uppercase text-[#647581] mb-1">
              New Date & Time (IST) *
            </label>
            <input
              type="datetime-local"
              value={rescheduleStart}
              onChange={(e) => setRescheduleStart(e.target.value)}
              required
              className="w-full px-3 py-2 text-xs rounded-lg border border-[rgba(7,26,40,0.12)] bg-white text-[#071a28] focus:outline-none focus:ring-2 focus:ring-amber-500/30"
            />
          </div>
          <div>
            <label className="block text-[10px] font-mono uppercase text-[#647581] mb-1">Reason for Rescheduling *</label>
            <input
              type="text"
              placeholder="e.g. Visitor requested afternoon timing"
              value={rescheduleReason}
              onChange={(e) => setRescheduleReason(e.target.value)}
              required
              className="w-full px-3 py-2 text-xs rounded-lg border border-[rgba(7,26,40,0.12)] bg-white text-[#071a28] focus:outline-none"
            />
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={isPending}
              className="flex-1 py-2 rounded-xl bg-amber-600 text-white text-xs font-bold disabled:opacity-50"
            >
              {isPending ? <Loader2 className="w-3 h-3 animate-spin mx-auto" /> : "Save Reschedule"}
            </button>
            <button
              type="button"
              onClick={() => setShowRescheduleModal(false)}
              className="px-3 py-2 rounded-xl text-xs font-bold text-[#647581] border border-[rgba(7,26,40,0.12)]"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

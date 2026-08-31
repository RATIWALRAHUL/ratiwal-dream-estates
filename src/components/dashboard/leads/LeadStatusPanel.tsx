"use client";
import { useState, useTransition } from "react";
import { Loader2 } from "lucide-react";
import { changeLeadStatusAction, changeLeadPriorityAction } from "@/lib/actions/lead.actions";
import { LeadStatusBadge } from "./LeadStatusBadge";
import { LeadPriorityBadge } from "./LeadPriorityBadge";
import { LEAD_PRIORITIES, VALID_STATUS_TRANSITIONS, LOST_REASONS, type LeadStatus, type LeadPriority, type LostReason } from "@/types/lead";

interface LeadStatusPanelProps {
  leadId: string;
  status: LeadStatus;
  priority: LeadPriority;
  version: number;
  archivedAt?: string;
}

const STATUS_LABEL: Record<string, string> = {
  NEW: "New", CONTACTED: "Contacted", QUALIFIED: "Qualified",
  NURTURING: "Nurturing", NEGOTIATING: "Negotiating",
  WON: "Won", LOST: "Lost", SPAM: "Spam", ARCHIVED: "Archived",
};

const LOST_REASON_LABEL: Record<string, string> = {
  BUDGET_MISMATCH: "Budget mismatch", LOCATION_MISMATCH: "Location mismatch",
  TIMELINE_POSTPONED: "Timeline postponed", UNABLE_TO_CONTACT: "Unable to contact",
  CHOSE_ANOTHER_PROPERTY: "Chose another property", DUPLICATE: "Duplicate", OTHER: "Other",
};

export function LeadStatusPanel({ leadId, status, priority, version, archivedAt }: LeadStatusPanelProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [showLostForm, setShowLostForm] = useState(false);
  const [lostReason, setLostReason] = useState<LostReason>("OTHER");
  const [lostExplanation, setLostExplanation] = useState("");
  const [pendingStatus, setPendingStatus] = useState<LeadStatus | null>(null);

  const allowedNext = VALID_STATUS_TRANSITIONS[status] ?? [];
  const isArchived = !!archivedAt;

  const handleStatusChange = (newStatus: LeadStatus) => {
    if (newStatus === "LOST") { setPendingStatus(newStatus); setShowLostForm(true); return; }
    setError(null);
    startTransition(async () => {
      const result = await changeLeadStatusAction(leadId, newStatus, version);
      if (!result.success) setError(result.message);
    });
  };

  const handleLostConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pendingStatus) return;
    setError(null);
    startTransition(async () => {
      const result = await changeLeadStatusAction(leadId, pendingStatus, version, lostReason, lostExplanation);
      if (result.success) { setShowLostForm(false); } else { setError(result.message); }
    });
  };

  const handlePriorityChange = (newPriority: LeadPriority) => {
    setError(null);
    startTransition(async () => {
      const result = await changeLeadPriorityAction(leadId, newPriority, version);
      if (!result.success) setError(result.message);
    });
  };

  return (
    <div className="bg-white rounded-2xl border border-[rgba(7,26,40,0.08)] shadow-xs p-5 space-y-4">
      <h3 className="text-[10px] font-mono uppercase tracking-widest text-[#647581] font-bold">Status & Priority</h3>

      {/* Current */}
      <div className="flex items-center gap-2">
        <LeadStatusBadge status={status} />
        <LeadPriorityBadge priority={priority} showLabel />
        {isPending && <Loader2 className="w-3 h-3 animate-spin text-[#647581]" />}
      </div>

      {error && <p className="text-xs text-rose-600">{error}</p>}

      {/* Status transitions */}
      {!isArchived && allowedNext.length > 0 && (
        <div>
          <p className="text-[10px] font-mono text-[#647581] mb-2 uppercase tracking-wide">Change status to</p>
          <div className="flex flex-wrap gap-1.5">
            {allowedNext.map((s) => (
              <button key={s} onClick={() => handleStatusChange(s)} disabled={isPending}
                className="px-2.5 py-1.5 rounded-lg text-[10px] font-bold border border-[rgba(7,26,40,0.12)] text-[#071a28] hover:bg-[#f8f7f4] disabled:opacity-50 transition-colors">
                {STATUS_LABEL[s] ?? s}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Lost reason form */}
      {showLostForm && (
        <form onSubmit={handleLostConfirm} className="space-y-2 p-3 rounded-xl bg-rose-50 border border-rose-100">
          <p className="text-xs font-bold text-rose-700">Mark as Lost — Reason required</p>
          <select value={lostReason} onChange={(e) => setLostReason(e.target.value as LostReason)} required
            className="w-full px-2.5 py-2 text-xs rounded-lg border border-rose-200 bg-white text-[#071a28] focus:outline-none">
            {LOST_REASONS.map(r => <option key={r} value={r}>{LOST_REASON_LABEL[r] ?? r}</option>)}
          </select>
          <textarea value={lostExplanation} onChange={(e) => setLostExplanation(e.target.value)} rows={2} maxLength={1000}
            placeholder="Optional explanation…"
            className="w-full px-2.5 py-2 text-xs rounded-lg border border-rose-200 bg-white text-[#071a28] focus:outline-none resize-none" />
          <div className="flex gap-2">
            <button type="submit" disabled={isPending}
              className="flex-1 py-2 rounded-xl bg-rose-600 text-white text-xs font-bold disabled:opacity-50">
              {isPending ? <Loader2 className="w-3 h-3 animate-spin mx-auto" /> : "Confirm Lost"}
            </button>
            <button type="button" onClick={() => setShowLostForm(false)}
              className="px-3 py-2 rounded-xl text-xs font-bold text-[#647581] border border-[rgba(7,26,40,0.12)]">
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Priority */}
      {!isArchived && (
        <div>
          <p className="text-[10px] font-mono text-[#647581] mb-2 uppercase tracking-wide">Priority</p>
          <div className="flex flex-wrap gap-1.5">
            {LEAD_PRIORITIES.map((p) => (
              <button key={p} onClick={() => handlePriorityChange(p)} disabled={isPending || p === priority}
                className={`px-2.5 py-1.5 rounded-lg text-[10px] font-bold border transition-colors disabled:opacity-50 ${p === priority ? "bg-[#071a28] text-white border-[#071a28]" : "border-[rgba(7,26,40,0.12)] text-[#071a28] hover:bg-[#f8f7f4]"}`}>
                {p.charAt(0) + p.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

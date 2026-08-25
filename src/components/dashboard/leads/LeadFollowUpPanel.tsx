"use client";
import { useState, useTransition } from "react";
import { Clock, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { scheduleLeadFollowUpAction, completeLeadFollowUpAction } from "@/lib/actions/lead.actions";

interface LeadFollowUpPanelProps {
  leadId: string;
  nextFollowUpAt?: string;
  lastContactedAt?: string;
}

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString("en-IN", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
    timeZone: "Asia/Kolkata", hour12: true,
  });
}

export function LeadFollowUpPanel({ leadId, nextFollowUpAt, lastContactedAt }: LeadFollowUpPanelProps) {
  const [showSchedule, setShowSchedule] = useState(false);
  const [scheduledAt, setScheduledAt] = useState("");
  const [note, setNote] = useState("");
  const [completeOutcome, setCompleteOutcome] = useState("Connected");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const isOverdue = nextFollowUpAt && new Date(nextFollowUpAt) < new Date();

  const handleSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await scheduleLeadFollowUpAction(leadId, scheduledAt, note || undefined);
      if (result.success) { setShowSchedule(false); setScheduledAt(""); setNote(""); }
      else setError(result.message);
    });
  };

  const handleComplete = () => {
    setError(null);
    startTransition(async () => {
      const result = await completeLeadFollowUpAction(leadId, completeOutcome);
      if (!result.success) setError(result.message);
    });
  };

  return (
    <div className="bg-white rounded-2xl border border-[rgba(7,26,40,0.08)] shadow-xs p-5 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-[10px] font-mono uppercase tracking-widest text-[#647581] font-bold">Follow-up</h3>
        <button onClick={() => setShowSchedule(!showSchedule)} className="text-[10px] font-bold text-[#087fc3] hover:underline">
          {nextFollowUpAt ? "Reschedule" : "Schedule"}
        </button>
      </div>

      {nextFollowUpAt ? (
        <div className={`p-3 rounded-xl border ${isOverdue ? "bg-rose-50 border-rose-200" : "bg-emerald-50 border-emerald-200"}`}>
          <div className={`flex items-center gap-2 ${isOverdue ? "text-rose-700" : "text-emerald-700"}`}>
            {isOverdue ? <AlertCircle className="w-4 h-4" aria-label="Overdue" /> : <Clock className="w-4 h-4" />}
            <span className="text-xs font-bold">{isOverdue ? "Overdue" : "Scheduled"}</span>
          </div>
          <p className={`text-xs mt-1 font-mono ${isOverdue ? "text-rose-600" : "text-emerald-600"}`}>
            {formatDateTime(nextFollowUpAt)}
          </p>
          {/* Complete follow-up */}
          <div className="mt-3 flex items-center gap-2">
            <input type="text" value={completeOutcome} onChange={(e) => setCompleteOutcome(e.target.value)}
              placeholder="Outcome…" className="flex-1 px-2 py-1.5 text-xs rounded-lg border border-[rgba(7,26,40,0.12)] bg-white text-[#071a28] focus:outline-none focus:ring-1 focus:ring-[#087fc3]/30" />
            <button onClick={handleComplete} disabled={isPending}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold text-emerald-700 border border-emerald-200 hover:bg-emerald-50 disabled:opacity-50 transition-colors">
              {isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle className="w-3 h-3" />}
              Done
            </button>
          </div>
        </div>
      ) : (
        <p className="text-xs text-[#647581] italic">No follow-up scheduled.</p>
      )}

      {lastContactedAt && (
        <p className="text-[10px] text-[#647581]">Last contacted: {formatDateTime(lastContactedAt)}</p>
      )}

      {error && <p className="text-xs text-rose-600">{error}</p>}

      {showSchedule && (
        <form onSubmit={handleSchedule} className="space-y-2 pt-2 border-t border-[rgba(7,26,40,0.06)]">
          <div>
            <label className="block text-[10px] font-mono uppercase tracking-wide text-[#647581] mb-1">Date & Time (IST)</label>
            <input type="datetime-local" value={scheduledAt} onChange={(e) => setScheduledAt(e.target.value)} required
              className="w-full px-3 py-2 text-xs rounded-lg border border-[rgba(7,26,40,0.12)] bg-[#f8f7f4] text-[#071a28] focus:outline-none focus:ring-2 focus:ring-[#087fc3]/30" />
          </div>
          <input type="text" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Optional note"
            className="w-full px-3 py-2 text-xs rounded-lg border border-[rgba(7,26,40,0.12)] bg-[#f8f7f4] text-[#071a28] focus:outline-none focus:ring-2 focus:ring-[#087fc3]/30" />
          <div className="flex gap-2">
            <button type="submit" disabled={isPending}
              className="flex-1 py-2 rounded-xl bg-[#071a28] text-white text-xs font-bold disabled:opacity-50">
              {isPending ? <Loader2 className="w-3 h-3 animate-spin mx-auto" /> : "Schedule"}
            </button>
            <button type="button" onClick={() => setShowSchedule(false)}
              className="px-3 py-2 rounded-xl text-xs font-bold text-[#647581] border border-[rgba(7,26,40,0.12)]">
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

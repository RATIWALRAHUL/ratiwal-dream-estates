"use client";
import { useState, useTransition } from "react";
import { Phone, MessageSquare, Mail, Users, PlusCircle, Loader2 } from "lucide-react";
import { recordContactAttemptAction } from "@/lib/actions/lead.actions";
import { CONTACT_ATTEMPT_TYPES, CONTACT_ATTEMPT_OUTCOMES, type ContactAttemptType, type ContactAttemptOutcome } from "@/types/lead";

interface ContactAttempt {
  id: string;
  type: string;
  outcome: string;
  note?: string;
  actorName: string;
  nextFollowUpAt?: string;
  occurredAt: string;
}

interface LeadContactLogProps {
  leadId: string;
  attempts: ContactAttempt[];
}

const TYPE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  PHONE_ATTEMPTED: Phone,
  PHONE_CONNECTED: Phone,
  WHATSAPP_INITIATED: MessageSquare,
  EMAIL_SENT: Mail,
  IN_PERSON: Users,
  OTHER: Phone,
};

const TYPE_LABEL: Record<string, string> = {
  PHONE_ATTEMPTED: "Phone (no answer)",
  PHONE_CONNECTED: "Phone (connected)",
  WHATSAPP_INITIATED: "WhatsApp",
  EMAIL_SENT: "Email",
  IN_PERSON: "In-person",
  OTHER: "Other",
};

const OUTCOME_LABEL: Record<string, string> = {
  NO_ANSWER: "No answer", VOICEMAIL: "Voicemail", CONNECTED: "Connected",
  CALLBACK_REQUESTED: "Callback requested", NOT_INTERESTED: "Not interested",
  INTERESTED: "Interested", FOLLOW_UP_SCHEDULED: "Follow-up scheduled", OTHER: "Other",
};

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString("en-IN", {
    day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit",
    timeZone: "Asia/Kolkata", hour12: true,
  });
}

export function LeadContactLog({ leadId, attempts }: LeadContactLogProps) {
  const [showForm, setShowForm] = useState(false);
  const [type, setType] = useState<ContactAttemptType>("PHONE_ATTEMPTED");
  const [outcome, setOutcome] = useState<ContactAttemptOutcome>("NO_ANSWER");
  const [note, setNote] = useState("");
  const [nextFollowUp, setNextFollowUp] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await recordContactAttemptAction(leadId, type, outcome, note || undefined, nextFollowUp || undefined);
      if (result.success) {
        setShowForm(false);
        setNote("");
        setNextFollowUp("");
      } else {
        setError(result.message);
      }
    });
  };

  const sorted = [...attempts].sort((a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime());

  return (
    <div className="bg-white rounded-3xl border border-[rgba(7,26,40,0.08)] shadow-xs p-6 space-y-5">
      <div className="flex items-center justify-between pb-3.5 border-b border-[rgba(7,26,40,0.06)]">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-blue-500/10 text-[#087fc3] flex items-center justify-center">
            <Phone className="w-4 h-4" />
          </div>
          <h3 className="text-xs font-mono uppercase tracking-widest text-[#071a28] font-bold">
            Advisory Contact &amp; Outreach Log
          </h3>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-[#087fc3] hover:text-white text-xs font-bold text-[#071a28] transition-all"
        >
          <PlusCircle className="w-3.5 h-3.5" />
          <span>Log Interaction</span>
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="p-5 rounded-2xl bg-[#faf9f6] border border-[rgba(7,26,40,0.1)] space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-mono uppercase tracking-wide text-[#647581] mb-1 font-bold">
                Channel / Mode
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as ContactAttemptType)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-[rgba(7,26,40,0.12)] bg-white text-[#071a28] focus:outline-none focus:ring-2 focus:ring-[#087fc3]/30 shadow-2xs"
              >
                {CONTACT_ATTEMPT_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {TYPE_LABEL[t] ?? t}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-mono uppercase tracking-wide text-[#647581] mb-1 font-bold">
                Call / Contact Outcome
              </label>
              <select
                value={outcome}
                onChange={(e) => setOutcome(e.target.value as ContactAttemptOutcome)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-[rgba(7,26,40,0.12)] bg-white text-[#071a28] focus:outline-none focus:ring-2 focus:ring-[#087fc3]/30 shadow-2xs"
              >
                {CONTACT_ATTEMPT_OUTCOMES.map((o) => (
                  <option key={o} value={o}>
                    {OUTCOME_LABEL[o] ?? o}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-mono uppercase tracking-wide text-[#647581] mb-1 font-bold">
              Call Takeaways / Discussion Summary
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              maxLength={500}
              placeholder="e.g. Discussed 200 sq.yd plots in Jaipur Greens, client requesting master layout..."
              className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-[rgba(7,26,40,0.12)] bg-white text-[#071a28] placeholder:text-[#8c9ba5] focus:outline-none focus:ring-2 focus:ring-[#087fc3]/30 shadow-2xs"
            />
          </div>

          <div>
            <label className="block text-[10px] font-mono uppercase tracking-wide text-[#647581] mb-1 font-bold">
              Schedule Next Follow-Up (Optional)
            </label>
            <input
              type="datetime-local"
              value={nextFollowUp}
              onChange={(e) => setNextFollowUp(e.target.value)}
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-[rgba(7,26,40,0.12)] bg-white text-[#071a28] focus:outline-none focus:ring-2 focus:ring-[#087fc3]/30 shadow-2xs"
            />
          </div>

          {error && <p className="text-xs text-rose-600 font-medium">{error}</p>}

          <div className="flex gap-2 pt-1">
            <button
              type="submit"
              disabled={isPending}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#071a28] text-white text-xs font-bold hover:bg-[#087fc3] disabled:opacity-50 transition-all shadow-sm"
            >
              {isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
              Save Interaction
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-4 py-2 rounded-xl text-xs font-bold text-[#647581] border border-[rgba(7,26,40,0.12)] hover:bg-white transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {sorted.length === 0 ? (
        <div className="p-6 rounded-2xl bg-[#f8f7f4] border border-[rgba(7,26,40,0.06)] text-center">
          <Phone className="w-6 h-6 mx-auto mb-2 text-slate-300" />
          <p className="text-xs font-semibold text-[#071a28]">No outreach attempts logged</p>
          <p className="text-[11px] text-[#647581] mt-0.5">
            Click &quot;Log Interaction&quot; above to record calls, WhatsApp chats, or in-person meetings.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {sorted.map((attempt) => {
            const Icon = TYPE_ICONS[attempt.type] ?? Phone;
            return (
              <div
                key={attempt.id}
                className="flex items-start gap-3.5 p-4 rounded-2xl bg-[#f8f7f4] border border-[rgba(7,26,40,0.06)] hover:border-[#087fc3]/30 transition-colors"
              >
                <div className="w-8 h-8 rounded-xl bg-white border border-[rgba(7,26,40,0.08)] shadow-2xs flex items-center justify-center shrink-0 mt-0.5">
                  <Icon className="w-4 h-4 text-[#087fc3]" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-[#071a28]">
                      {TYPE_LABEL[attempt.type] ?? attempt.type} ·{" "}
                      <span className="text-[#087fc3]">{OUTCOME_LABEL[attempt.outcome] ?? attempt.outcome}</span>
                    </p>
                    <span className="text-[10px] font-mono text-[#647581]">
                      {formatDateTime(attempt.occurredAt)}
                    </span>
                  </div>
                  {attempt.note && (
                    <p className="text-xs text-[#536574] mt-1 leading-relaxed">{attempt.note}</p>
                  )}
                  <p className="text-[10px] text-[#8c9ba5] mt-1.5 font-mono">
                    Logged by {attempt.actorName}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

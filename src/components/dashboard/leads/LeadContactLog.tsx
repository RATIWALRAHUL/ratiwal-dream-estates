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
    <div className="bg-white rounded-2xl border border-[rgba(7,26,40,0.08)] shadow-xs p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-[10px] font-mono uppercase tracking-widest text-[#647581] font-bold">Contact Log</h3>
        <button
          onClick={() => setShowForm(!showForm)}
          className="inline-flex items-center gap-1 text-xs font-bold text-[#087fc3] hover:underline"
        >
          <PlusCircle className="w-3.5 h-3.5" />
          Log Contact
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="p-4 rounded-xl bg-[#f8f7f4] border border-[rgba(7,26,40,0.06)] space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[10px] font-mono uppercase tracking-wide text-[#647581] mb-1">Type</label>
              <select value={type} onChange={(e) => setType(e.target.value as ContactAttemptType)}
                className="w-full px-2.5 py-2 text-xs rounded-lg border border-[rgba(7,26,40,0.12)] bg-white text-[#071a28] focus:outline-none focus:ring-2 focus:ring-[#087fc3]/30">
                {CONTACT_ATTEMPT_TYPES.map(t => <option key={t} value={t}>{TYPE_LABEL[t] ?? t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-mono uppercase tracking-wide text-[#647581] mb-1">Outcome</label>
              <select value={outcome} onChange={(e) => setOutcome(e.target.value as ContactAttemptOutcome)}
                className="w-full px-2.5 py-2 text-xs rounded-lg border border-[rgba(7,26,40,0.12)] bg-white text-[#071a28] focus:outline-none focus:ring-2 focus:ring-[#087fc3]/30">
                {CONTACT_ATTEMPT_OUTCOMES.map(o => <option key={o} value={o}>{OUTCOME_LABEL[o] ?? o}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-[10px] font-mono uppercase tracking-wide text-[#647581] mb-1">Note (optional)</label>
            <input type="text" value={note} onChange={(e) => setNote(e.target.value)} maxLength={500}
              placeholder="Brief notes…"
              className="w-full px-2.5 py-2 text-xs rounded-lg border border-[rgba(7,26,40,0.12)] bg-white text-[#071a28] focus:outline-none focus:ring-2 focus:ring-[#087fc3]/30" />
          </div>
          <div>
            <label className="block text-[10px] font-mono uppercase tracking-wide text-[#647581] mb-1">Next Follow-up (optional)</label>
            <input type="datetime-local" value={nextFollowUp} onChange={(e) => setNextFollowUp(e.target.value)}
              className="w-full px-2.5 py-2 text-xs rounded-lg border border-[rgba(7,26,40,0.12)] bg-white text-[#071a28] focus:outline-none focus:ring-2 focus:ring-[#087fc3]/30" />
          </div>
          {error && <p className="text-xs text-rose-600">{error}</p>}
          <div className="flex gap-2">
            <button type="submit" disabled={isPending}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#071a28] text-white text-xs font-bold hover:bg-[#0d2c42] disabled:opacity-50 transition-colors">
              {isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : null}
              Save
            </button>
            <button type="button" onClick={() => setShowForm(false)}
              className="px-3.5 py-2 rounded-xl text-xs font-bold text-[#647581] border border-[rgba(7,26,40,0.12)] hover:bg-slate-50 transition-colors">
              Cancel
            </button>
          </div>
        </form>
      )}

      {sorted.length === 0 ? (
        <p className="text-xs text-[#647581] italic">No contact attempts recorded yet.</p>
      ) : (
        <div className="space-y-2">
          {sorted.map((attempt) => {
            const Icon = TYPE_ICONS[attempt.type] ?? Phone;
            return (
              <div key={attempt.id} className="flex items-start gap-3 p-3 rounded-xl bg-[#f8f7f4] border border-[rgba(7,26,40,0.06)]">
                <div className="w-7 h-7 rounded-lg bg-[#087fc3]/10 flex items-center justify-center shrink-0 mt-0.5">
                  <Icon className="w-3.5 h-3.5 text-[#087fc3]" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-[#071a28]">
                    {TYPE_LABEL[attempt.type] ?? attempt.type} — {OUTCOME_LABEL[attempt.outcome] ?? attempt.outcome}
                  </p>
                  {attempt.note && <p className="text-xs text-[#647581] mt-0.5">{attempt.note}</p>}
                  <p className="text-[10px] text-[#647581] mt-1 font-mono">{attempt.actorName} · {formatDateTime(attempt.occurredAt)}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

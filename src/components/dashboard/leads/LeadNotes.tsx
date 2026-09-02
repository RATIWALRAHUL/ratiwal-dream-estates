"use client";
import { useState, useTransition } from "react";
import { PlusCircle, Loader2, Lock, StickyNote, Send, Sparkles } from "lucide-react";
import { addLeadNoteAction } from "@/lib/actions/lead.actions";

interface Note {
  id: string;
  body: string;
  authorName: string;
  createdAt: string;
  editedAt?: string;
}

interface LeadNotesProps {
  leadId: string;
  notes: Note[];
  version: number;
}

function formatDateTime(iso: string) {
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

function getInitials(name: string) {
  if (!name) return "AD";
  const parts = name.trim().split(" ");
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

const QUICK_TAGS = [
  "📞 Call Log",
  "💰 Budget Discussion",
  "📍 Plot Preference",
  "🚗 Site Visit Planned",
  "⏳ Follow-up Required",
];

export function LeadNotes({ leadId, notes, version }: LeadNotesProps) {
  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleTagClick = (tag: string) => {
    setBody((prev) => (prev ? `${prev} [${tag}] ` : `[${tag}] `));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!body.trim()) return;
    setError(null);
    startTransition(async () => {
      const result = await addLeadNoteAction(leadId, body, version);
      if (result.success) {
        setBody("");
      } else {
        setError(result.message);
      }
    });
  };

  const sorted = [...notes].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return (
    <div className="bg-white rounded-3xl border border-[rgba(7,26,40,0.08)] shadow-xs p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between pb-3.5 border-b border-[rgba(7,26,40,0.06)]">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-700 flex items-center justify-center">
            <StickyNote className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-mono uppercase tracking-widest text-[#071a28] font-bold">
              Internal Advisory Notes
            </h3>
          </div>
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 text-[#647581] text-[10px] font-mono border border-slate-200">
          <Lock className="w-3 h-3 text-[#087fc3]" />
          <span>Private to Team</span>
        </div>
      </div>

      {/* Note Composer Card */}
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="rounded-2xl border border-[rgba(7,26,40,0.12)] bg-[#faf9f6] focus-within:bg-white focus-within:border-[#087fc3] focus-within:ring-2 focus-within:ring-[#087fc3]/15 transition-all p-4 shadow-2xs">
          {/* Quick Tag Pills */}
          <div className="flex flex-wrap items-center gap-1.5 mb-2.5">
            <span className="text-[10px] font-mono text-[#647581] mr-1 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-600" />
              Quick:
            </span>
            {QUICK_TAGS.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => handleTagClick(tag)}
                className="px-2 py-0.5 rounded-lg text-[10px] font-medium bg-white border border-[rgba(7,26,40,0.08)] text-[#071a28] hover:bg-[#087fc3] hover:text-white hover:border-[#087fc3] transition-all shadow-2xs"
              >
                {tag}
              </button>
            ))}
          </div>

          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Record internal consultation takeaways, client plot preferences, or negotiation terms (never visible to client)..."
            maxLength={5000}
            rows={3}
            className="w-full text-xs text-[#071a28] placeholder:text-[#8c9ba5] bg-transparent resize-none focus:outline-none min-h-[70px] leading-relaxed"
            aria-label="Note body"
            disabled={isPending}
          />

          <div className="flex items-center justify-between pt-2 border-t border-[rgba(7,26,40,0.06)] mt-2">
            <span className="text-[10px] font-mono text-[#647581]">
              {body.length} / 5000 characters
            </span>
            <button
              type="submit"
              disabled={isPending || !body.trim()}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#071a28] text-white text-xs font-bold hover:bg-[#087fc3] disabled:opacity-40 disabled:cursor-not-allowed shadow-sm transition-all hover:shadow hover:-translate-y-0.5"
            >
              {isPending ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Send className="w-3.5 h-3.5" />
              )}
              <span>Add Note</span>
            </button>
          </div>
        </div>
        {error && <p className="text-xs text-rose-600 font-medium">{error}</p>}
      </form>

      {/* Notes List */}
      {sorted.length === 0 ? (
        <div className="p-6 rounded-2xl bg-[#f8f7f4] border border-[rgba(7,26,40,0.06)] text-center">
          <StickyNote className="w-6 h-6 mx-auto mb-2 text-slate-300" />
          <p className="text-xs font-semibold text-[#071a28]">No internal notes recorded</p>
          <p className="text-[11px] text-[#647581] mt-0.5 max-w-sm mx-auto">
            Use the composer above to log private advisor takeaways, client preferences, or follow-up insights.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {sorted.map((note) => (
            <div
              key={note.id}
              className="p-4 rounded-2xl bg-[#f8f7f4] border border-[rgba(7,26,40,0.06)] hover:border-[#087fc3]/30 transition-colors"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-[#071a28] text-white text-[10px] font-bold flex items-center justify-center font-mono">
                    {getInitials(note.authorName)}
                  </div>
                  <span className="text-xs font-bold text-[#071a28]">{note.authorName}</span>
                </div>
                <span className="text-[10px] font-mono text-[#647581]">
                  {formatDateTime(note.createdAt)}
                  {note.editedAt ? " (edited)" : ""}
                </span>
              </div>
              <p className="text-xs text-[#071a28] whitespace-pre-wrap leading-relaxed pl-8">
                {note.body}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

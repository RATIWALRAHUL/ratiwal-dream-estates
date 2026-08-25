"use client";
import { useState, useTransition } from "react";
import { PlusCircle, Loader2 } from "lucide-react";
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
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
    timeZone: "Asia/Kolkata", hour12: true,
  });
}

export function LeadNotes({ leadId, notes, version }: LeadNotesProps) {
  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

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

  const sorted = [...notes].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <div className="bg-white rounded-2xl border border-[rgba(7,26,40,0.08)] shadow-xs p-5 space-y-4">
      <h3 className="text-[10px] font-mono uppercase tracking-widest text-[#647581] font-bold">Internal Notes</h3>

      {/* Add note form */}
      <form onSubmit={handleSubmit} className="space-y-2">
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Add an internal note… (never visible to client)"
          maxLength={5000}
          rows={3}
          className="w-full px-3 py-2.5 text-xs rounded-xl border border-[rgba(7,26,40,0.12)] bg-[#f8f7f4] text-[#071a28] placeholder:text-[#647581] focus:outline-none focus:ring-2 focus:ring-[#087fc3]/30 resize-none"
          aria-label="Note body"
          disabled={isPending}
        />
        {error && <p className="text-xs text-rose-600">{error}</p>}
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-[#647581]">{body.length}/5000</span>
          <button
            type="submit"
            disabled={isPending || !body.trim()}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#071a28] text-white text-xs font-bold hover:bg-[#0d2c42] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <PlusCircle className="w-3 h-3" />}
            Add Note
          </button>
        </div>
      </form>

      {/* Notes list */}
      {sorted.length === 0 ? (
        <p className="text-xs text-[#647581] italic">No notes yet.</p>
      ) : (
        <div className="space-y-3">
          {sorted.map((note) => (
            <div key={note.id} className="p-3 rounded-xl bg-[#f8f7f4] border border-[rgba(7,26,40,0.06)]">
              <p className="text-xs text-[#071a28] whitespace-pre-wrap leading-relaxed">{note.body}</p>
              <p className="text-[10px] text-[#647581] mt-2 font-mono">
                {note.authorName} · {formatDateTime(note.createdAt)}
                {note.editedAt ? " (edited)" : ""}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

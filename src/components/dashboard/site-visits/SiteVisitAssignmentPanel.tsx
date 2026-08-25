"use client";
import { useState, useTransition } from "react";
import { UserCheck, Loader2 } from "lucide-react";
import { assignSiteVisitAction } from "@/lib/actions/site-visit.actions";

interface SiteVisitAssignmentPanelProps {
  visitId: string;
  assignedAdvisor?: {
    id: string;
    name: string;
    email: string;
  };
  version: number;
  role: string;
}

export function SiteVisitAssignmentPanel({
  visitId,
  assignedAdvisor,
  version,
  role,
}: SiteVisitAssignmentPanelProps) {
  const canAssign = role === "ADMIN" || role === "SUPER_ADMIN";
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ id: "", email: "", name: "" });
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.id || !form.email || !form.name) {
      setError("All advisor fields are required.");
      return;
    }
    setError(null);
    startTransition(async () => {
      const result = await assignSiteVisitAction(visitId, form.id, form.name, form.email, version);
      if (result.success) {
        setShowForm(false);
      } else {
        setError(result.message);
      }
    });
  };

  return (
    <div className="bg-white rounded-2xl border border-[rgba(7,26,40,0.08)] shadow-xs p-5 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-[10px] font-mono uppercase tracking-widest text-[#647581] font-bold">
          Assigned Advisor
        </h3>
        {canAssign && !showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="text-[10px] font-bold text-[#087fc3] hover:underline"
          >
            {assignedAdvisor ? "Reassign" : "Assign"}
          </button>
        )}
      </div>

      {assignedAdvisor ? (
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-[#087fc3]/10 flex items-center justify-center text-[#087fc3] font-bold text-xs shrink-0">
            {assignedAdvisor.name.slice(0, 2).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-[#071a28] truncate">{assignedAdvisor.name}</p>
            <p className="text-[10px] text-[#647581] truncate">{assignedAdvisor.email}</p>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-amber-50 border border-amber-100">
          <UserCheck className="w-4 h-4 text-amber-500" />
          <p className="text-xs font-semibold text-amber-700">Unassigned</p>
        </div>
      )}

      {showForm && canAssign && (
        <form onSubmit={handleSubmit} className="space-y-2 pt-2 border-t border-[rgba(7,26,40,0.06)]">
          <input
            type="text"
            placeholder="Advisor ID"
            value={form.id}
            onChange={(e) => setForm((f) => ({ ...f, id: e.target.value }))}
            className="w-full px-3 py-2 text-xs rounded-lg border border-[rgba(7,26,40,0.12)] bg-[#f8f7f4] text-[#071a28] focus:outline-none focus:ring-2 focus:ring-[#087fc3]/30"
          />
          <input
            type="text"
            placeholder="Advisor Name"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            className="w-full px-3 py-2 text-xs rounded-lg border border-[rgba(7,26,40,0.12)] bg-[#f8f7f4] text-[#071a28] focus:outline-none focus:ring-2 focus:ring-[#087fc3]/30"
          />
          <input
            type="email"
            placeholder="Advisor Email"
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            className="w-full px-3 py-2 text-xs rounded-lg border border-[rgba(7,26,40,0.12)] bg-[#f8f7f4] text-[#071a28] focus:outline-none focus:ring-2 focus:ring-[#087fc3]/30"
          />
          {error && <p className="text-xs text-rose-600">{error}</p>}
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={isPending}
              className="flex-1 py-2 rounded-xl bg-[#071a28] text-white text-xs font-bold disabled:opacity-50 transition-colors"
            >
              {isPending ? <Loader2 className="w-3 h-3 animate-spin mx-auto" /> : "Confirm"}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
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

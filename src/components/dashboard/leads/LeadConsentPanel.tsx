"use client";
import { useState, useTransition } from "react";
import { ShieldCheck, ShieldOff, Loader2 } from "lucide-react";
import { recordConsentWithdrawalAction } from "@/lib/actions/lead.actions";

interface LeadConsentPanelProps {
  leadId: string;
  consentGranted: boolean;
  consentTextVersion: string;
  privacyPolicyVersion: string;
  consentTimestamp: string;
  consentSource: string;
  consentWithdrawnAt?: string;
  consentWithdrawalReason?: string;
  role: string;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("en-IN", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
    timeZone: "Asia/Kolkata", hour12: true,
  });
}

export function LeadConsentPanel({
  leadId, consentGranted, consentTextVersion, privacyPolicyVersion,
  consentTimestamp, consentSource, consentWithdrawnAt, consentWithdrawalReason, role,
}: LeadConsentPanelProps) {
  const canWithdraw = (role === "ADMIN" || role === "SUPER_ADMIN") && !consentWithdrawnAt;
  const [showForm, setShowForm] = useState(false);
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleWithdraw = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) { setError("A reason is required."); return; }
    setError(null);
    startTransition(async () => {
      const result = await recordConsentWithdrawalAction(leadId, reason);
      if (result.success) { setShowForm(false); } else { setError(result.message); }
    });
  };

  return (
    <div className="bg-white rounded-2xl border border-[rgba(7,26,40,0.08)] shadow-xs p-5 space-y-3">
      <h3 className="text-[10px] font-mono uppercase tracking-widest text-[#647581] font-bold">Consent</h3>

      {consentWithdrawnAt ? (
        <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 space-y-1">
          <div className="flex items-center gap-2 text-rose-700">
            <ShieldOff className="w-4 h-4" aria-hidden="true" />
            <span className="text-xs font-bold">Consent Withdrawn</span>
          </div>
          <p className="text-[10px] text-rose-600 font-mono">{formatDate(consentWithdrawnAt)}</p>
          {consentWithdrawalReason && <p className="text-[10px] text-rose-600">{consentWithdrawalReason}</p>}
        </div>
      ) : (
        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 space-y-1">
          <div className="flex items-center gap-2 text-emerald-700">
            <ShieldCheck className="w-4 h-4" aria-hidden="true" />
            <span className="text-xs font-bold">Consent Granted</span>
          </div>
          <p className="text-[10px] text-emerald-600 font-mono">{formatDate(consentTimestamp)}</p>
        </div>
      )}

      <div className="space-y-1 text-[10px] text-[#647581] font-mono">
        <p>Statement v{consentTextVersion}</p>
        <p>Privacy Policy v{privacyPolicyVersion}</p>
        <p>Purpose: INQUIRY_PROCESSING</p>
        <p>Source: {consentSource}</p>
      </div>

      {canWithdraw && (
        <button onClick={() => setShowForm(!showForm)}
          className="text-[10px] font-bold text-rose-500 hover:underline">
          Record withdrawal
        </button>
      )}

      {showForm && (
        <form onSubmit={handleWithdraw} className="space-y-2 pt-2 border-t border-[rgba(7,26,40,0.06)]">
          <textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={2} maxLength={1000} required
            placeholder="Reason for withdrawal (required)…"
            className="w-full px-3 py-2 text-xs rounded-lg border border-[rgba(7,26,40,0.12)] bg-[#f8f7f4] text-[#071a28] focus:outline-none focus:ring-2 focus:ring-rose-300/40 resize-none" />
          {error && <p className="text-xs text-rose-600">{error}</p>}
          <div className="flex gap-2">
            <button type="submit" disabled={isPending}
              className="flex-1 py-2 rounded-xl bg-rose-600 text-white text-xs font-bold disabled:opacity-50">
              {isPending ? <Loader2 className="w-3 h-3 animate-spin mx-auto" /> : "Record Withdrawal"}
            </button>
            <button type="button" onClick={() => setShowForm(false)}
              className="px-3 py-2 rounded-xl text-xs font-bold text-[#647581] border border-[rgba(7,26,40,0.12)]">
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

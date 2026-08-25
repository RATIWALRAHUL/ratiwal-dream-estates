"use client";

import { useState } from "react";
import { RefreshCw, Ban, Copy, Check, AlertCircle } from "lucide-react";
import { resendTeamInvitationAction, revokeTeamInvitationAction } from "@/lib/actions/team.actions";

interface InvitationActionsProps {
  invitationId: string;
  email: string;
  status: string;
}

export function InvitationActions({ invitationId, email, status }: InvitationActionsProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [resendResult, setResendResult] = useState<{ rawToken: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleResend = async () => {
    setIsLoading(true);
    setError(null);
    const res = await resendTeamInvitationAction(invitationId);
    setIsLoading(false);

    if (res.success && res.rawToken) {
      setResendResult({ rawToken: res.rawToken });
    } else {
      setError(res.message || "Failed to resend invitation.");
    }
  };

  const handleRevoke = async () => {
    const reason = window.prompt(`Please enter reason for revoking invitation for ${email}:`);
    if (!reason || !reason.trim()) return;

    setIsLoading(true);
    setError(null);
    const res = await revokeTeamInvitationAction(invitationId, reason);
    setIsLoading(false);

    if (!res.success) {
      setError(res.message || "Failed to revoke invitation.");
    }
  };

  const inviteLink = resendResult
    ? `${typeof window !== "undefined" ? window.location.origin : ""}/dashboard/team/invitations/accept?token=${resendResult.rawToken}`
    : "";

  const handleCopy = () => {
    if (inviteLink) {
      navigator.clipboard.writeText(inviteLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  return (
    <div className="flex flex-col items-end gap-1.5">
      {error && (
        <span className="text-[10px] text-rose-600 font-sans block">{error}</span>
      )}

      {resendResult ? (
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handleCopy}
            className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white text-[10px] font-bold flex items-center gap-1 hover:bg-emerald-700"
          >
            {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
            <span>{copied ? "Copied Link!" : "Copy New Link"}</span>
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-1.5 font-sans">
          {status === "INVITED" && (
            <>
              <button
                type="button"
                onClick={handleResend}
                disabled={isLoading}
                className="px-2.5 py-1 rounded-lg border border-[rgba(7,26,40,0.1)] text-[#071a28] hover:bg-[#f8f7f4] text-[10px] font-bold flex items-center gap-1 disabled:opacity-50"
                title="Resend invitation"
              >
                <RefreshCw className={`w-3 h-3 ${isLoading ? "animate-spin" : ""}`} />
                <span>Resend</span>
              </button>

              <button
                type="button"
                onClick={handleRevoke}
                disabled={isLoading}
                className="px-2.5 py-1 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 text-[10px] font-bold flex items-center gap-1 disabled:opacity-50"
                title="Revoke invitation"
              >
                <Ban className="w-3 h-3" />
                <span>Revoke</span>
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

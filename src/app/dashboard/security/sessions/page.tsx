"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Shield, ShieldAlert, Laptop, ArrowLeft, RefreshCw, Trash2, CheckCircle2 } from "lucide-react";
import { AdminAuthSessionDTO } from "@/types/dashboard-auth";
import {
  getAdminSessionsAction,
  revokeAdminSessionAction,
  revokeAllOtherAdminSessionsAction,
} from "@/lib/actions/dashboard-auth.actions";
import { SessionCard } from "@/components/dashboard/auth/SessionCard";
import { ReauthenticationDialog } from "@/components/dashboard/auth/ReauthenticationDialog";

export default function SecuritySessionsPage() {
  const [sessions, setSessions] = useState<AdminAuthSessionDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [revokingId, setRevokingId] = useState<string | null>(null);
  const [isReauthOpen, setIsReauthOpen] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const loadSessions = async () => {
    setIsLoading(true);
    const res = await getAdminSessionsAction();
    if (res.success && res.sessions) {
      setSessions(res.sessions);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    loadSessions();
  }, []);

  const handleRevokeSingle = async (sessionId: string) => {
    setRevokingId(sessionId);
    const res = await revokeAdminSessionAction(sessionId);
    setRevokingId(null);
    if (res.success) {
      setStatusMessage("Session terminated successfully.");
      setSessions(sessions.filter((s) => s.id !== sessionId));
    }
  };

  const handleRevokeAllOther = async (password: string) => {
    const res = await revokeAllOtherAdminSessionsAction(password);
    if (res.success) {
      setStatusMessage(`Successfully revoked ${res.revokedCount} other active session(s).`);
      loadSessions();
      return { success: true };
    }
    return { success: false, error: res.error || "Failed to terminate sessions." };
  };

  const otherSessionsCount = sessions.filter((s) => !s.isCurrent).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <Link
            href="/dashboard/settings/security"
            className="inline-flex items-center gap-1 text-xs text-[#647581] hover:text-[#071a28] mb-1 transition font-medium"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Security Settings</span>
          </Link>
          <h1 className="font-serif text-2xl md:text-3xl font-bold tracking-tight text-[#071a28]">
            Active Device Sessions
          </h1>
          <p className="text-xs md:text-sm text-[#647581] mt-1">
            Review and terminate browser sessions currently signed into your administrator account.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={loadSessions}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl border border-[rgba(7,26,40,0.12)] bg-white text-[#071a28] hover:bg-stone-50 transition shadow-2xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#0088cc] ${isLoading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </button>

          {otherSessionsCount > 0 && (
            <button
              type="button"
              onClick={() => setIsReauthOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-xs transition"
            >
              <Trash2 className="w-4 h-4" />
              <span>Log Out Other Devices ({otherSessionsCount})</span>
            </button>
          )}
        </div>
      </div>

      {statusMessage && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* Security Reassurance Banner */}
      <div className="p-5 rounded-3xl border border-[rgba(7,26,40,0.08)] bg-white shadow-[0_4px_20px_rgba(7,26,40,0.02)] flex items-start gap-3.5">
        <div className="w-10 h-10 rounded-2xl bg-[#eaf5fa] text-[#0088cc] border border-[#0088cc]/20 flex items-center justify-center shrink-0">
          <Shield className="w-5 h-5" />
        </div>
        <div className="text-xs text-[#647581] leading-relaxed">
          <h3 className="font-serif text-sm font-bold text-[#071a28] mb-0.5">
            Session Security & Automatic Revocation
          </h3>
          Sessions automatically expire after 7 days of inactivity (or 30 days if &ldquo;Remember this device&rdquo; was checked). Changing your password immediately invalidates all active sessions across all devices.
        </div>
      </div>

      {/* Sessions Stream */}
      <div className="space-y-4">
        <h2 className="font-serif text-base font-bold text-[#071a28]">
          Recognized Devices ({sessions.length})
        </h2>

        {isLoading ? (
          <div className="p-12 text-center text-xs text-[#647581] bg-white rounded-3xl border border-[rgba(7,26,40,0.08)]">
            Loading active sessions...
          </div>
        ) : sessions.length === 0 ? (
          <div className="p-12 text-center text-xs text-[#647581] bg-white rounded-3xl border border-[rgba(7,26,40,0.08)]">
            No active sessions found.
          </div>
        ) : (
          sessions.map((session) => (
            <SessionCard
              key={session.id}
              session={session}
              onRevoke={handleRevokeSingle}
              isRevoking={revokingId === session.id}
            />
          ))
        )}
      </div>

      {/* Reauthentication Modal */}
      <ReauthenticationDialog
        isOpen={isReauthOpen}
        onClose={() => setIsReauthOpen(false)}
        onConfirm={handleRevokeAllOther}
      />
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, AlertCircle, ArrowRight, ShieldCheck, Loader2 } from "lucide-react";

export function AcceptInvitationClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<any | null>(null);

  useEffect(() => {
    if (!token) {
      setError("No invitation token provided in the URL.");
    }
  }, [token]);

  const handleAccept = async () => {
    if (!token) return;
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/team/invitations/accept", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });

      const data = await res.json();
      setIsLoading(false);

      if (res.ok && data.success) {
        setSuccess(data);
      } else {
        setError(data.message || "Failed to accept invitation.");
      }
    } catch {
      setIsLoading(false);
      setError("An unexpected network error occurred while accepting invitation.");
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f7f4] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-xl border border-[rgba(7,26,40,0.08)] p-8 text-center space-y-6">
        <div className="w-14 h-14 rounded-2xl bg-[#087fc3]/10 text-[#087fc3] flex items-center justify-center mx-auto">
          <ShieldCheck className="w-7 h-7" />
        </div>

        <div>
          <h1 className="text-xl font-bold text-[#071a28]">Join Ratiwal Dream Estates</h1>
          <p className="text-xs text-[#647581] mt-1">
            Official team onboarding &amp; role-based access activation.
          </p>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2.5 text-left">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {success ? (
          <div className="space-y-4 py-2">
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs text-left">
              <div className="flex items-center gap-2 mb-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span className="font-bold">Account Activated!</span>
              </div>
              <p className="text-emerald-700 mb-2">
                Welcome to the team, <strong>{success.member?.fullName}</strong>! You have been granted the role of{" "}
                <strong>{success.member?.roleKey}</strong>.
              </p>
              <span className="font-mono text-[10px] text-emerald-800 block">
                Ref: {success.member?.memberReference}
              </span>
            </div>

            <Link
              href="/dashboard"
              className="w-full py-3 rounded-xl bg-[#071a28] text-white text-xs font-bold flex items-center justify-center gap-2 hover:bg-[#0c273c] shadow-xs"
            >
              <span>Go to Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-xs text-[#647581] text-left bg-slate-50 p-4 rounded-xl border border-slate-100">
              Clicking below will securely verify your one-time SHA-256 token and link your workspace permissions.
            </p>

            <button
              type="button"
              onClick={handleAccept}
              disabled={isLoading || !token}
              className="w-full py-3 rounded-xl bg-[#087fc3] text-white text-xs font-bold hover:bg-[#076fa8] shadow-xs flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Activating Account...</span>
                </>
              ) : (
                <span>Accept Invitation & Activate</span>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

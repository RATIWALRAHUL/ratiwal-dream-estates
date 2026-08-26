"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import {
  Building2,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ArrowLeft,
  Eye,
  Send,
} from "lucide-react";
import { reviewManualPaymentAction } from "@/lib/actions/payment.actions";
import { MoneyUtils } from "@/lib/utils/money";

interface ManualPaymentReviewViewProps {
  submissions: any[];
}

export function ManualPaymentReviewView({ submissions }: ManualPaymentReviewViewProps) {
  const [isPending, startTransition] = useTransition();
  const [selectedSub, setSelectedSub] = useState<any | null>(null);
  const [decision, setDecision] = useState<"VERIFY" | "REJECT" | "ACTION_REQUIRED">("VERIFY");
  const [reason, setReason] = useState("");
  const [notes, setNotes] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSub) return;

    setErrorMsg(null);
    setSuccessMsg(null);

    startTransition(async () => {
      const res = await reviewManualPaymentAction({
        submissionId: selectedSub._id.toString(),
        decision,
        rejectionReason: decision === "REJECT" ? reason : undefined,
        actionRequiredReason: decision === "ACTION_REQUIRED" ? reason : undefined,
        verificationNotes: notes.trim() || undefined,
      });

      if (!res.success) {
        setErrorMsg(res.message);
      } else {
        setSuccessMsg(res.message);
        setSelectedSub(null);
        setReason("");
        setNotes("");
      }
    });
  };

  const statusColors: Record<string, string> = {
    SUBMITTED: "bg-amber-50 text-amber-800 border-amber-200",
    UNDER_REVIEW: "bg-blue-50 text-blue-800 border-blue-200",
    VERIFIED: "bg-emerald-50 text-emerald-800 border-emerald-200",
    REJECTED: "bg-rose-50 text-rose-800 border-rose-200",
    ACTION_REQUIRED: "bg-purple-50 text-purple-800 border-purple-200",
  };

  return (
    <div className="space-y-6 antialiased">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono uppercase tracking-widest text-[#087fc3] font-bold">
              Maker-Checker Verification
            </span>
          </div>
          <h1 className="text-2xl font-bold font-serif text-[#071a28] tracking-tight mt-1">
            Offline & Manual Payments Queue ({submissions.length})
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Review NEFT/RTGS bank transfers, cheques, and demand drafts submitted for booking milestones.
          </p>
        </div>

        <Link
          href="/dashboard/payments"
          className="px-4 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-[#071a28] font-bold text-xs flex items-center gap-2 transition-colors shadow-2xs self-start sm:self-center"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Overview</span>
        </Link>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold">
          {errorMsg}
        </div>
      )}

      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
          {successMsg}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Submissions List (2 Cols) */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-[rgba(7,26,40,0.08)] shadow-xs overflow-hidden">
          {submissions.length === 0 ? (
            <div className="p-12 text-center text-slate-500 text-xs space-y-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
              <p className="font-bold text-[#071a28]">Manual review queue is clear!</p>
              <p>No offline payment claims currently require verification.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 text-xs">
              {submissions.map((sub) => (
                <div
                  key={sub._id}
                  className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[#fbfaf8] transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-[#071a28]">
                        {sub.submissionNumber}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full font-bold text-[10px] border ${
                          statusColors[sub.status] || "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {sub.status}
                      </span>
                      <span className="text-slate-400 font-mono text-[10px]">
                        Ref: {sub.referenceNumber}
                      </span>
                    </div>
                    <div className="text-slate-600 font-semibold">
                      Booking: {sub.bookingId?.bookingNumber || "—"} • Method: {sub.method.replace(/_/g, " ")}
                    </div>
                    <div className="text-slate-500 text-[11px]">
                      Bank: {sub.bankName || "—"} • Paid: {new Date(sub.paymentDate).toLocaleDateString()}
                    </div>
                  </div>

                  <div className="flex items-center gap-4 self-start sm:self-center">
                    <div className="text-right">
                      <div className="font-bold text-base text-[#071a28]">
                        {MoneyUtils.format(sub.claimedAmountPaise, sub.currency)}
                      </div>
                    </div>
                    {sub.status !== "VERIFIED" && sub.status !== "REJECTED" && (
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedSub(sub);
                          setDecision("VERIFY");
                        }}
                        className="px-3.5 py-1.5 rounded-xl bg-[#071a28] hover:bg-[#0d2c42] text-white font-bold text-xs shadow-xs transition-colors whitespace-nowrap"
                      >
                        Review
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Verification Drawer (1 Col) */}
        <div className="space-y-6">
          {selectedSub ? (
            <div className="bg-white rounded-3xl border-2 border-[#087fc3] p-6 shadow-md space-y-4 text-xs">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <h3 className="font-bold font-serif text-[#071a28] uppercase text-xs">
                  Review: {selectedSub.submissionNumber}
                </h3>
                <button
                  type="button"
                  onClick={() => setSelectedSub(null)}
                  className="text-slate-400 hover:text-slate-600 font-bold"
                >
                  ✕
                </button>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#fbfaf8] border border-slate-100 space-y-1.5 text-[11px]">
                <div className="flex justify-between">
                  <span className="text-slate-400">Claimed Amount:</span>
                  <strong className="text-[#071a28]">
                    {MoneyUtils.format(selectedSub.claimedAmountPaise, selectedSub.currency)}
                  </strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Reference / UTR:</span>
                  <strong className="font-mono text-slate-700">{selectedSub.referenceNumber}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Bank:</span>
                  <strong className="text-slate-700">{selectedSub.bankName || "—"}</strong>
                </div>
              </div>

              <form onSubmit={handleReview} className="space-y-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Decision *</label>
                  <select
                    value={decision}
                    onChange={(e) => setDecision(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-[#fbfaf8] text-xs font-semibold"
                  >
                    <option value="VERIFY">Verify & Approve (Capture + Issue Receipt)</option>
                    <option value="ACTION_REQUIRED">Action Required (Request Correction)</option>
                    <option value="REJECT">Reject Payment Claim</option>
                  </select>
                </div>

                {decision !== "VERIFY" && (
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">
                      Reason for {decision.replace(/_/g, " ")} *
                    </label>
                    <textarea
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      required
                      placeholder="Explain reason for customer or audit record..."
                      rows={3}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-[#fbfaf8] text-xs"
                    />
                  </div>
                )}

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Internal Notes</label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Bank statement confirmation details..."
                    rows={2}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-[#fbfaf8] text-xs"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isPending}
                  className="w-full py-2.5 rounded-xl bg-[#071a28] hover:bg-[#0d2c42] disabled:opacity-50 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-md"
                >
                  <Send className="w-3.5 h-3.5 text-[#42b7e8]" />
                  <span>{isPending ? "Processing..." : `Execute ${decision}`}</span>
                </button>
              </form>
            </div>
          ) : (
            <div className="p-6 rounded-3xl bg-white border border-[rgba(7,26,40,0.08)] shadow-xs space-y-3 text-xs">
              <h3 className="font-bold font-serif text-[#071a28] uppercase text-xs">
                Maker-Checker Segregation
              </h3>
              <p className="text-slate-500 leading-relaxed">
                Offline payments must be verified against bank credit statements before funds are credited to the customer's plan and official receipts are issued.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import { RotateCcw, ArrowLeft, CheckCircle2, AlertTriangle, Plus, Send } from "lucide-react";
import {
  approveAndExecuteRefundAction,
  createRefundRequestAction,
} from "@/lib/actions/payment.actions";
import { MoneyUtils } from "@/lib/utils/money";
import { RefundReasonCode, REFUND_REASON_CODES } from "@/types/payment";

interface RefundsManagementViewProps {
  refundRequests: any[];
  eligiblePayments: any[];
}

export function RefundsManagementView({
  refundRequests,
  eligiblePayments,
}: RefundsManagementViewProps) {
  const [isPending, startTransition] = useTransition();
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // New Refund Request Modal
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedPaymentId, setSelectedPaymentId] = useState(eligiblePayments[0]?._id?.toString() || "");
  const [refundAmountRupees, setRefundAmountRupees] = useState<number>(10000);
  const [reasonCode, setReasonCode] = useState<RefundReasonCode>("BOOKING_CANCELLED");
  const [explanation, setExplanation] = useState("");

  const handleApprove = (requestId: string) => {
    setActionError(null);
    setActionSuccess(null);
    startTransition(async () => {
      const res = await approveAndExecuteRefundAction(requestId);
      if (!res.success) {
        setActionError(res.message);
      } else {
        setActionSuccess(res.message);
      }
    });
  };

  const handleCreateRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPaymentId || !explanation.trim()) return;

    setActionError(null);
    setActionSuccess(null);

    startTransition(async () => {
      const res = await createRefundRequestAction({
        paymentId: selectedPaymentId,
        requestedAmountPaise: Math.round(refundAmountRupees * 100),
        reasonCode,
        explanation: explanation.trim(),
      });

      if (!res.success) {
        setActionError(res.message);
      } else {
        setActionSuccess(res.message);
        setIsCreateOpen(false);
        setExplanation("");
      }
    });
  };

  const statusColors: Record<string, string> = {
    SUBMITTED: "bg-amber-50 text-amber-800 border-amber-200",
    APPROVED: "bg-blue-50 text-blue-800 border-blue-200",
    COMPLETED: "bg-emerald-50 text-emerald-800 border-emerald-200",
    REJECTED: "bg-rose-50 text-rose-800 border-rose-200",
  };

  return (
    <div className="space-y-6 antialiased">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono uppercase tracking-widest text-[#087fc3] font-bold">
              Treasury & Settlements
            </span>
          </div>
          <h1 className="text-2xl font-bold font-serif text-[#071a28] tracking-tight mt-1">
            Refunds & Return Requests ({refundRequests.length})
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Maker-checker refund governance, provider execution, and allocation adjustments.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-center">
          <Link
            href="/dashboard/payments"
            className="px-4 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-[#071a28] font-bold text-xs flex items-center gap-2 transition-colors shadow-2xs"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Overview</span>
          </Link>

          <button
            type="button"
            onClick={() => setIsCreateOpen(true)}
            className="px-4 py-2 rounded-xl bg-[#071a28] hover:bg-[#0d2c42] text-white font-bold text-xs flex items-center gap-1.5 shadow-md transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Request Refund</span>
          </button>
        </div>
      </div>

      {actionError && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold">
          {actionError}
        </div>
      )}

      {actionSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
          {actionSuccess}
        </div>
      )}

      <div className="bg-white rounded-3xl border border-[rgba(7,26,40,0.08)] shadow-xs overflow-hidden">
        {refundRequests.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-xs space-y-2">
            <RotateCcw className="w-8 h-8 text-slate-400 mx-auto" />
            <p className="font-bold text-[#071a28]">No refund requests on record.</p>
            <p>All captured collections remain in good standing.</p>
          </div>
        ) : (
          <div className="overflow-x-auto text-xs">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-[#fbfaf8] text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  <th className="py-3.5 px-6">Request Number</th>
                  <th className="py-3.5 px-6">Booking / Customer</th>
                  <th className="py-3.5 px-6">Reason Code</th>
                  <th className="py-3.5 px-6">Amount</th>
                  <th className="py-3.5 px-6">Status</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {refundRequests.map((req) => (
                  <tr key={req._id} className="hover:bg-[#fbfaf8]/80 transition-colors">
                    <td className="py-4 px-6 font-mono font-bold text-[#071a28]">
                      {req.requestNumber}
                    </td>
                    <td className="py-4 px-6">
                      <div className="font-bold text-[#071a28]">
                        Booking: {req.bookingId?.bookingNumber || "—"}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {req.partyId?.displayName || "Purchaser"}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="font-semibold text-slate-700">
                        {req.reasonCode.replace(/_/g, " ")}
                      </div>
                      <div className="text-[10px] text-slate-400 truncate max-w-xs">
                        {req.explanation}
                      </div>
                    </td>
                    <td className="py-4 px-6 font-bold text-[#071a28]">
                      {MoneyUtils.format(req.requestedAmountPaise, req.currency)}
                    </td>
                    <td className="py-4 px-6">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                          statusColors[req.status] || "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {req.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      {req.status === "SUBMITTED" && (
                        <button
                          type="button"
                          disabled={isPending}
                          onClick={() => handleApprove(req._id.toString())}
                          className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-bold text-xs transition-colors shadow-xs"
                        >
                          Approve & Execute
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* New Refund Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white max-w-lg w-full rounded-3xl p-6 shadow-2xl space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="font-bold font-serif text-[#071a28] uppercase text-sm">
                Create Refund Request
              </h3>
              <button
                type="button"
                onClick={() => setIsCreateOpen(false)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateRequest} className="space-y-4">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Target Captured Payment *</label>
                <select
                  value={selectedPaymentId}
                  onChange={(e) => setSelectedPaymentId(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-[#fbfaf8]"
                >
                  {eligiblePayments.map((p) => (
                    <option key={p._id} value={p._id}>
                      {p.paymentNumber} — Booking {p.bookingId?.bookingNumber} ({MoneyUtils.format(p.capturedAmountPaise)})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Reason Code *</label>
                  <select
                    value={reasonCode}
                    onChange={(e) => setReasonCode(e.target.value as RefundReasonCode)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-[#fbfaf8]"
                  >
                    {REFUND_REASON_CODES.map((c) => (
                      <option key={c} value={c}>
                        {c.replace(/_/g, " ")}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Refund Amount (Rupees) *</label>
                  <input
                    type="number"
                    value={refundAmountRupees}
                    onChange={(e) => setRefundAmountRupees(Number(e.target.value))}
                    required
                    min={1}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-[#fbfaf8] font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Explanation & Rationale *</label>
                <textarea
                  value={explanation}
                  onChange={(e) => setExplanation(e.target.value)}
                  required
                  rows={3}
                  placeholder="Detail justification for refund..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-[#fbfaf8]"
                />
              </div>

              <button
                type="submit"
                disabled={isPending}
                className="w-full py-2.5 rounded-xl bg-[#071a28] hover:bg-[#0d2c42] disabled:opacity-50 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-md"
              >
                <Send className="w-3.5 h-3.5 text-[#42b7e8]" />
                <span>{isPending ? "Submitting..." : "Submit Refund Request"}</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

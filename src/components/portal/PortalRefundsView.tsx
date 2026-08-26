"use client";

import React, { useState, useTransition } from "react";
import { RefreshCw, Plus, AlertCircle, CheckCircle2, Clock } from "lucide-react";
import { submitRefundRequestFromPortalAction } from "@/lib/actions/portal.actions";
import { MoneyUtils } from "@/lib/utils/money";
import { RefundReasonCode } from "@/types/payment";

interface PortalRefundsViewProps {
  refunds: any[];
  eligiblePayments: any[];
}

export function PortalRefundsView({ refunds, eligiblePayments }: PortalRefundsViewProps) {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedPaymentId, setSelectedPaymentId] = useState(eligiblePayments[0]?._id?.toString() || "");
  const [refundAmountRupees, setRefundAmountRupees] = useState<number>(10000);
  const [reasonCode, setReasonCode] = useState<RefundReasonCode>("BOOKING_CANCELLED");
  const [explanation, setExplanation] = useState("");
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleCreateRefund = (e: React.FormEvent) => {
    e.preventDefault();
    setActionError(null);
    setActionSuccess(null);

    startTransition(async () => {
      const res = await submitRefundRequestFromPortalAction({
        paymentId: selectedPaymentId,
        refundAmountRupees,
        reasonCode,
        explanation,
      });

      if (!res.success) {
        setActionError(res.error || "Failed to submit refund request.");
      } else {
        setActionSuccess(`Refund request ${res.requestNumber} submitted successfully for review.`);
        setIsCreateOpen(false);
        setExplanation("");
      }
    });
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-white tracking-wide">
            Refunds & Return Claims
          </h1>
          <p className="text-xs text-slate-300 mt-1">
            Submit and track refund requests for eligible captured payments.
          </p>
        </div>

        {eligiblePayments && eligiblePayments.length > 0 && (
          <button
            type="button"
            onClick={() => setIsCreateOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-[#087fc3] hover:bg-[#066ca8] text-xs font-semibold text-white shadow-md flex items-center space-x-1.5 transition-all self-start"
          >
            <Plus className="w-4 h-4" />
            <span>Request Refund</span>
          </button>
        )}
      </div>

      {actionError && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start space-x-2">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{actionError}</span>
        </div>
      )}

      {actionSuccess && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-start space-x-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* Refunds History Table */}
      <div className="bg-[#071a28]/90 border border-white/10 rounded-2xl p-6 text-white shadow-xl space-y-4">
        {refunds && refunds.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-white/10 text-slate-400 uppercase text-[10px]">
                <tr>
                  <th className="pb-3 font-medium">Request Number</th>
                  <th className="pb-3 font-medium">Reason</th>
                  <th className="pb-3 font-medium">Amount</th>
                  <th className="pb-3 font-medium">Status</th>
                  <th className="pb-3 font-medium">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-slate-200">
                {refunds.map((ref: any) => (
                  <tr key={ref._id} className="hover:bg-white/5">
                    <td className="py-3 font-mono text-[#087fc3]">{ref.requestNumber}</td>
                    <td className="py-3">{ref.reasonCode}</td>
                    <td className="py-3 font-serif font-bold text-white">
                      {MoneyUtils.formatINR(ref.requestedAmountPaise)}
                    </td>
                    <td className="py-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                          ref.status === "COMPLETED"
                            ? "bg-emerald-500/20 text-emerald-300"
                            : ref.status === "REJECTED"
                            ? "bg-rose-500/20 text-rose-300"
                            : "bg-amber-500/20 text-amber-300"
                        }`}
                      >
                        {ref.status}
                      </span>
                    </td>
                    <td className="py-3 text-slate-400">
                      {new Date(ref.createdAt).toLocaleDateString("en-IN")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12 text-slate-400 text-xs">
            <RefreshCw className="w-10 h-10 text-slate-500 mx-auto mb-3" />
            <p>No refund requests submitted.</p>
          </div>
        )}
      </div>

      {/* Request Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#071a28] border border-white/10 rounded-2xl max-w-lg w-full p-6 text-white space-y-4 shadow-2xl">
            <h3 className="text-lg font-serif font-bold">Request a Payment Refund</h3>
            <p className="text-xs text-slate-400">
              Refunds are reviewed by our finance desk according to RERA guidelines and contract terms.
            </p>

            <form onSubmit={handleCreateRefund} className="space-y-4">
              <div>
                <label className="block text-xs text-slate-300 mb-1">Eligible Payment</label>
                <select
                  value={selectedPaymentId}
                  onChange={(e) => setSelectedPaymentId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs"
                >
                  {eligiblePayments.map((p) => (
                    <option key={p._id} value={p._id.toString()} className="bg-[#071a28]">
                      {p.paymentReference || p.providerPaymentId} — ₹{MoneyUtils.toMajorUnits(p.capturedAmountPaise || p.amountPaise).toLocaleString("en-IN")}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs text-slate-300 mb-1">Refund Amount (₹)</label>
                <input
                  type="number"
                  required
                  min={100}
                  value={refundAmountRupees}
                  onChange={(e) => setRefundAmountRupees(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-300 mb-1">Reason Code</label>
                <select
                  value={reasonCode}
                  onChange={(e) => setReasonCode(e.target.value as RefundReasonCode)}
                  className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs"
                >
                  <option value="BOOKING_CANCELLED" className="bg-[#071a28]">Booking Cancelled</option>
                  <option value="OVERPAYMENT" className="bg-[#071a28]">Overpayment</option>
                  <option value="COMMERCIAL_RENEGOTIATION" className="bg-[#071a28]">Commercial Renegotiation</option>
                  <option value="OTHER_APPROVED" className="bg-[#071a28]">Other Approved</option>
                </select>
              </div>

              <div>
                <label className="block text-xs text-slate-300 mb-1">Explanation</label>
                <textarea
                  required
                  rows={3}
                  value={explanation}
                  onChange={(e) => setExplanation(e.target.value)}
                  placeholder="Provide context for this refund request..."
                  className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2 rounded-xl bg-white/10 text-xs hover:bg-white/20"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-4 py-2 rounded-xl bg-[#087fc3] hover:bg-[#066ca8] text-xs font-semibold text-white"
                >
                  {isPending ? "Submitting..." : "Submit Request"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

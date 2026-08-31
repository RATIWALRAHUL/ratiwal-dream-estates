"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import { FileText, ArrowLeft, ExternalLink } from "lucide-react";
import { voidReceiptAction } from "@/lib/actions/payment.actions";
import { MoneyUtils } from "@/lib/utils/money";

interface PaymentReceiptsViewProps {
  receipts: any[];
}

export function PaymentReceiptsView({ receipts }: PaymentReceiptsViewProps) {
  const [isPending, startTransition] = useTransition();
  const [voidingReceiptId, setVoidingReceiptId] = useState<string | null>(null);
  const [voidReason, setVoidReason] = useState("");
  const [actionError, setActionError] = useState<string | null>(null);

  const handleVoid = (e: React.FormEvent) => {
    e.preventDefault();
    if (!voidingReceiptId || !voidReason.trim()) return;

    setActionError(null);
    startTransition(async () => {
      const res = await voidReceiptAction({
        receiptId: voidingReceiptId,
        voidReason: voidReason.trim(),
      });

      if (!res.success) {
        setActionError(res.message);
      } else {
        setVoidingReceiptId(null);
        setVoidReason("");
      }
    });
  };

  return (
    <div className="space-y-6 antialiased">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono uppercase tracking-widest text-[#087fc3] font-bold">
              Official Payment Receipts
            </span>
          </div>
          <h1 className="text-2xl font-bold font-serif text-[#071a28] tracking-tight mt-1">
            Payment Receipts Ledger ({receipts.length})
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Immutable official payment acknowledgement receipts generated upon verified collections.
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

      {actionError && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold">
          {actionError}
        </div>
      )}

      <div className="bg-white rounded-3xl border border-[rgba(7,26,40,0.08)] shadow-xs overflow-hidden">
        {receipts.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-xs space-y-2">
            <FileText className="w-8 h-8 text-slate-400 mx-auto" />
            <p className="font-bold text-[#071a28]">No receipts issued yet.</p>
            <p>Receipts are automatically generated when payments are captured.</p>
          </div>
        ) : (
          <div className="overflow-x-auto text-xs">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-[#fbfaf8] text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  <th className="py-3.5 px-6">Receipt Number</th>
                  <th className="py-3.5 px-6">Booking / Customer</th>
                  <th className="py-3.5 px-6">Amount Received</th>
                  <th className="py-3.5 px-6">Payment Method</th>
                  <th className="py-3.5 px-6">Status</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {receipts.map((rcp) => (
                  <tr key={rcp._id} className="hover:bg-[#fbfaf8]/80 transition-colors">
                    <td className="py-4 px-6 font-mono font-bold text-[#071a28]">
                      {rcp.receiptNumber}
                    </td>
                    <td className="py-4 px-6">
                      <div className="font-bold text-[#071a28]">
                        Booking: {rcp.bookingId?.bookingNumber || "—"}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {rcp.partyId?.displayName || "Purchasing Entity"}
                      </div>
                    </td>
                    <td className="py-4 px-6 font-bold text-[#071a28]">
                      {MoneyUtils.format(rcp.receivedAmountPaise, rcp.currency)}
                    </td>
                    <td className="py-4 px-6 text-slate-700">
                      <div>{rcp.paymentMethod.replace(/_/g, " ")}</div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        Ref: {rcp.safePaymentReference}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                          rcp.receiptStatus === "ISSUED"
                            ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                            : "bg-rose-50 text-rose-800 border-rose-200"
                        }`}
                      >
                        {rcp.receiptStatus}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right space-x-2">
                      <a
                        href={`/api/payments/receipts/${rcp._id}/preview`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-[#071a28] font-bold text-xs shadow-2xs transition-colors"
                      >
                        <ExternalLink className="w-3 h-3" />
                        <span>View</span>
                      </a>

                      {rcp.receiptStatus === "ISSUED" && (
                        <button
                          type="button"
                          onClick={() => setVoidingReceiptId(rcp._id.toString())}
                          className="px-2.5 py-1.5 rounded-xl text-rose-600 hover:bg-rose-50 font-bold text-xs transition-colors"
                        >
                          Void
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

      {/* Void Modal */}
      {voidingReceiptId && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white max-w-md w-full rounded-3xl p-6 shadow-2xl space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="font-bold font-serif text-rose-800 uppercase text-sm">
                Void Official Receipt
              </h3>
              <button
                type="button"
                onClick={() => setVoidingReceiptId(null)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            <p className="text-slate-500">
              Voiding a receipt is an immutable audit event. A mandatory rationale is required for governance compliance.
            </p>

            <form onSubmit={handleVoid} className="space-y-4">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Reason for Voiding *</label>
                <textarea
                  value={voidReason}
                  onChange={(e) => setVoidReason(e.target.value)}
                  required
                  rows={3}
                  placeholder="e.g. Cheque dishonoured / transaction reversed by bank..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-[#fbfaf8]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setVoidingReceiptId(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 font-bold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-bold"
                >
                  {isPending ? "Voiding..." : "Confirm Void"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

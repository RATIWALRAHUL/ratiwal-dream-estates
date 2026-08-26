"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import {
  Layers,
  CheckCircle2,
  Clock,
  AlertTriangle,
  CreditCard,
  Building2,
  ArrowLeft,
  Share2,
  Plus,
  Lock,
  Copy,
  Check,
} from "lucide-react";
import {
  activatePaymentPlanAction,
  createPaymentOrderAction,
  submitManualPaymentAction,
} from "@/lib/actions/payment.actions";
import { MoneyUtils } from "@/lib/utils/money";
import { PaymentMethod } from "@/types/payment";

interface PaymentPlanWorkspaceProps {
  planData: {
    plan: any;
    installments: any[];
  };
}

export function PaymentPlanWorkspace({ planData }: PaymentPlanWorkspaceProps) {
  const { plan, installments } = planData;
  const [isPending, startTransition] = useTransition();
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  // Online Pay Modal State
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [selectedInstId, setSelectedInstId] = useState<string>(installments[0]?._id?.toString() || "");
  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Manual Pay Modal State
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [manualMethod, setManualMethod] = useState<PaymentMethod>("BANK_TRANSFER_NEFT_RTGS");
  const [manualAmount, setManualAmount] = useState<number>(installments[0]?.outstandingAmountPaise ? installments[0].outstandingAmountPaise / 100 : 100000);
  const [manualRef, setManualRef] = useState("");
  const [manualDate, setManualDate] = useState(new Date().toISOString().split("T")[0]);
  const [manualBank, setManualBank] = useState("HDFC Bank");

  const handleActivate = () => {
    setActionError(null);
    setActionMessage(null);
    startTransition(async () => {
      const res = await activatePaymentPlanAction(plan._id.toString());
      if (res.success) {
        setActionMessage(res.message);
      } else {
        setActionError(res.message);
      }
    });
  };

  const handleCreateOnlineOrder = () => {
    setActionError(null);
    startTransition(async () => {
      const res = await createPaymentOrderAction({
        bookingId: plan.bookingId?._id?.toString() || plan.bookingId?.toString(),
        installmentId: selectedInstId || undefined,
      });

      if (!res.success) {
        setActionError(res.message);
      } else {
        const payData = res.data as any;
        const url = `${window.location.origin}/payments/pay/${payData.payment.paymentNumber}`;
        setCheckoutUrl(url);
      }
    });
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualRef.trim()) {
      setActionError("Transaction reference / UTR number is required.");
      return;
    }

    setActionError(null);
    startTransition(async () => {
      const res = await submitManualPaymentAction({
        bookingId: plan.bookingId?._id?.toString() || plan.bookingId?.toString(),
        installmentId: selectedInstId || undefined,
        claimedAmountPaise: Math.round(manualAmount * 100),
        method: manualMethod,
        referenceNumber: manualRef.trim(),
        paymentDate: manualDate,
        bankName: manualBank.trim(),
      });

      if (!res.success) {
        setActionError(res.message);
      } else {
        setIsManualModalOpen(false);
        setActionMessage(res.message);
        setManualRef("");
      }
    });
  };

  const handleCopyLink = () => {
    if (checkoutUrl) {
      navigator.clipboard.writeText(checkoutUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const statusColors: Record<string, string> = {
    ACTIVE: "bg-emerald-50 text-emerald-800 border-emerald-200",
    DRAFT: "bg-slate-100 text-slate-700 border-slate-200",
    PENDING_APPROVAL: "bg-amber-50 text-amber-800 border-amber-200",
    SUPERSEDED: "bg-purple-50 text-purple-800 border-purple-200",
    COMPLETED: "bg-emerald-50 text-emerald-800 border-emerald-200",
  };

  const totalPaidPaise = installments.reduce((acc, i) => acc + (i.paidAmountPaise || 0), 0);
  const totalOutstandingPaise = installments.reduce((acc, i) => acc + (i.outstandingAmountPaise || 0), 0);

  return (
    <div className="space-y-6 antialiased">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/payment-plans"
            className="p-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors shadow-2xs"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-xs text-slate-500">
                {plan.paymentPlanNumber}
              </span>
              <span
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                  statusColors[plan.status] || "bg-slate-100 text-slate-700 border-slate-200"
                }`}
              >
                {plan.status}
              </span>
              <span className="text-[10px] font-mono text-slate-400">v{plan.version}</span>
            </div>
            <h1 className="text-xl font-bold font-serif text-[#071a28] tracking-tight mt-0.5">
              Payment Plan Workspace
            </h1>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 self-start sm:self-center">
          {plan.status !== "ACTIVE" && (
            <button
              type="button"
              disabled={isPending}
              onClick={handleActivate}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-colors"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Activate Plan</span>
            </button>
          )}

          {plan.status === "ACTIVE" && (
            <>
              <button
                type="button"
                onClick={() => setIsManualModalOpen(true)}
                className="px-3.5 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-[#071a28] font-bold text-xs flex items-center gap-1.5 shadow-2xs transition-colors"
              >
                <Building2 className="w-3.5 h-3.5 text-slate-600" />
                <span>Record Offline Payment</span>
              </button>

              <button
                type="button"
                onClick={() => setIsPayModalOpen(true)}
                className="px-4 py-2 rounded-xl bg-[#071a28] hover:bg-[#0d2c42] text-white font-bold text-xs flex items-center gap-1.5 shadow-md transition-colors"
              >
                <CreditCard className="w-3.5 h-3.5 text-[#42b7e8]" />
                <span>Generate Pay Link</span>
              </button>
            </>
          )}
        </div>
      </div>

      {actionError && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold">
          {actionError}
        </div>
      )}

      {actionMessage && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
          {actionMessage}
        </div>
      )}

      {/* Summary KPI Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
        <div className="p-5 rounded-3xl bg-white border border-[rgba(7,26,40,0.08)] shadow-xs space-y-1">
          <div className="text-[10px] font-bold uppercase text-slate-400">Total Consideration</div>
          <div className="text-xl font-bold font-serif text-[#071a28]">
            {MoneyUtils.format(plan.totalConsiderationPaise, plan.currency)}
          </div>
          <div className="text-[11px] text-slate-500">Scheduled plan value</div>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-[rgba(7,26,40,0.08)] shadow-xs space-y-1">
          <div className="text-[10px] font-bold uppercase text-slate-400">Total Collected</div>
          <div className="text-xl font-bold font-serif text-emerald-600">
            {MoneyUtils.format(totalPaidPaise, plan.currency)}
          </div>
          <div className="text-[11px] text-slate-500">Allocated receipts</div>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-[rgba(7,26,40,0.08)] shadow-xs space-y-1">
          <div className="text-[10px] font-bold uppercase text-slate-400">Total Outstanding</div>
          <div className="text-xl font-bold font-serif text-[#087fc3]">
            {MoneyUtils.format(totalOutstandingPaise, plan.currency)}
          </div>
          <div className="text-[11px] text-slate-500">Pending receivables</div>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-[rgba(7,26,40,0.08)] shadow-xs space-y-1">
          <div className="text-[10px] font-bold uppercase text-slate-400">Property / Unit</div>
          <div className="font-bold text-[#071a28] truncate">{plan.propertyId?.title || "—"}</div>
          <div className="text-[11px] text-slate-500">
            Unit: {plan.unitId?.unitNumber || "—"} • Booking: {plan.bookingId?.bookingNumber || "—"}
          </div>
        </div>
      </div>

      {/* Instalment Schedule Table */}
      <div className="bg-white rounded-3xl border border-[rgba(7,26,40,0.08)] shadow-xs overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold font-serif text-[#071a28] uppercase tracking-wider">
              Milestone Payment Schedule ({installments.length} Instalments)
            </h3>
            <p className="text-[11px] text-slate-500">
              Contractual due dates and real-time payment collection progress
            </p>
          </div>
        </div>

        <div className="overflow-x-auto text-xs">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-[#fbfaf8] text-[11px] font-bold uppercase tracking-wider text-slate-400">
                <th className="py-3.5 px-6">Seq</th>
                <th className="py-3.5 px-6">Key & Type</th>
                <th className="py-3.5 px-6">Milestone Description</th>
                <th className="py-3.5 px-6">Due Date</th>
                <th className="py-3.5 px-6 text-right">Amount</th>
                <th className="py-3.5 px-6 text-right">Paid</th>
                <th className="py-3.5 px-6 text-right">Outstanding</th>
                <th className="py-3.5 px-6 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {installments.map((inst) => {
                const instStatusColors: Record<string, string> = {
                  PAID: "bg-emerald-50 text-emerald-800 border-emerald-200",
                  DUE: "bg-blue-50 text-blue-800 border-blue-200",
                  UPCOMING: "bg-slate-100 text-slate-600 border-slate-200",
                  OVERDUE: "bg-rose-50 text-rose-800 border-rose-200",
                  PARTIALLY_PAID: "bg-amber-50 text-amber-800 border-amber-200",
                };

                return (
                  <tr key={inst._id} className="hover:bg-[#fbfaf8]/80 transition-colors">
                    <td className="py-4 px-6 font-mono text-slate-400">#{inst.sequence}</td>
                    <td className="py-4 px-6">
                      <div className="font-bold text-[#071a28] font-mono">{inst.installmentKey}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{inst.type}</div>
                    </td>
                    <td className="py-4 px-6 text-slate-700">{inst.description}</td>
                    <td className="py-4 px-6 font-mono text-slate-600">
                      {new Date(inst.dueDate).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="py-4 px-6 text-right font-bold text-[#071a28]">
                      {MoneyUtils.format(inst.adjustedAmountPaise, inst.currency)}
                    </td>
                    <td className="py-4 px-6 text-right text-emerald-700 font-semibold">
                      {MoneyUtils.format(inst.paidAmountPaise, inst.currency)}
                    </td>
                    <td className="py-4 px-6 text-right text-slate-700 font-semibold">
                      {MoneyUtils.format(inst.outstandingAmountPaise, inst.currency)}
                    </td>
                    <td className="py-4 px-6 text-center">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                          instStatusColors[inst.status] || "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {inst.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Online Pay Modal */}
      {isPayModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white max-w-md w-full rounded-3xl p-6 shadow-2xl space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="font-bold font-serif text-[#071a28] uppercase text-sm">
                Generate Online Pay Link
              </h3>
              <button
                type="button"
                onClick={() => {
                  setIsPayModalOpen(false);
                  setCheckoutUrl(null);
                }}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            <p className="text-slate-500">
              Create a server-authoritative checkout link for the buyer with exact milestone pricing.
            </p>

            <div className="space-y-2">
              <label className="font-bold text-slate-700 block">Target Instalment</label>
              <select
                value={selectedInstId}
                onChange={(e) => setSelectedInstId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-[#fbfaf8]"
              >
                {installments
                  .filter((i) => i.status !== "PAID")
                  .map((i) => (
                    <option key={i._id} value={i._id}>
                      {i.installmentKey}: {i.description} ({MoneyUtils.format(i.outstandingAmountPaise)})
                    </option>
                  ))}
              </select>
            </div>

            {checkoutUrl ? (
              <div className="space-y-3 pt-2">
                <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 font-mono text-[11px] break-all">
                  {checkoutUrl}
                </div>
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="w-full py-2.5 rounded-xl bg-[#071a28] hover:bg-[#0d2c42] text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  <span>{copied ? "Copied Link!" : "Copy Payment Link"}</span>
                </button>
              </div>
            ) : (
              <button
                type="button"
                disabled={isPending}
                onClick={handleCreateOnlineOrder}
                className="w-full py-2.5 rounded-xl bg-[#071a28] hover:bg-[#0d2c42] disabled:opacity-50 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors"
              >
                <CreditCard className="w-4 h-4 text-[#42b7e8]" />
                <span>{isPending ? "Generating..." : "Create Payment Order"}</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Manual Pay Modal */}
      {isManualModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white max-w-lg w-full rounded-3xl p-6 shadow-2xl space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="font-bold font-serif text-[#071a28] uppercase text-sm">
                Record Offline Payment Claim
              </h3>
              <button
                type="button"
                onClick={() => setIsManualModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleManualSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Payment Method *</label>
                  <select
                    value={manualMethod}
                    onChange={(e) => setManualMethod(e.target.value as PaymentMethod)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-[#fbfaf8]"
                  >
                    <option value="BANK_TRANSFER_NEFT_RTGS">NEFT / RTGS / IMPS</option>
                    <option value="CHEQUE">Cheque</option>
                    <option value="DEMAND_DRAFT">Demand Draft (DD)</option>
                    <option value="POS_TERMINAL">Card POS Terminal</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Amount (Rupees) *</label>
                  <input
                    type="number"
                    value={manualAmount}
                    onChange={(e) => setManualAmount(Number(e.target.value))}
                    required
                    min={1}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-[#fbfaf8] font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">UTR / Ref Number *</label>
                  <input
                    type="text"
                    value={manualRef}
                    onChange={(e) => setManualRef(e.target.value.toUpperCase())}
                    required
                    placeholder="e.g. HDFC123456789"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-[#fbfaf8] font-mono"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Payment Date *</label>
                  <input
                    type="date"
                    value={manualDate}
                    onChange={(e) => setManualDate(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-[#fbfaf8]"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Bank Name</label>
                <input
                  type="text"
                  value={manualBank}
                  onChange={(e) => setManualBank(e.target.value)}
                  placeholder="e.g. HDFC Bank, Jaipur Branch"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-[#fbfaf8]"
                />
              </div>

              <button
                type="submit"
                disabled={isPending}
                className="w-full py-2.5 rounded-xl bg-[#071a28] hover:bg-[#0d2c42] disabled:opacity-50 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors shadow-md"
              >
                <Building2 className="w-4 h-4 text-[#42b7e8]" />
                <span>{isPending ? "Submitting..." : "Submit Offline Payment"}</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

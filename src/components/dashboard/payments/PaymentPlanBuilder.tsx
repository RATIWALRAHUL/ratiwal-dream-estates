"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Layers,
  Plus,
  Trash2,
  ArrowLeft,
  CheckCircle2,
  Calendar,
  AlertTriangle,
} from "lucide-react";
import { createPaymentPlanAction } from "@/lib/actions/payment.actions";
import { MoneyUtils } from "@/lib/utils/money";
import { InstallmentType } from "@/types/payment";

interface PaymentPlanBuilderProps {
  bookings: any[];
}

export function PaymentPlanBuilder({ bookings }: PaymentPlanBuilderProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [formError, setFormError] = useState<string | null>(null);

  const [selectedBookingId, setSelectedBookingId] = useState(bookings[0]?._id?.toString() || "");

  // Selected booking's consideration
  const selectedBooking = bookings.find((b) => b._id.toString() === selectedBookingId) || bookings[0];
  const initialTotalPaise = selectedBooking?.finalAmountPaise || 450000000;
  const [totalConsiderationRupees, setTotalConsiderationRupees] = useState<number>(initialTotalPaise / 100);

  // Default Standard 4-Stage Construction-Linked Plan
  const [installments, setInstallments] = useState<
    Array<{
      installmentKey: string;
      type: InstallmentType;
      description: string;
      amountRupees: number;
      dueDate: string;
      milestoneReference?: string;
    }>
  >([
    {
      installmentKey: "BKG-AMT",
      type: "BOOKING_AMOUNT",
      description: "Booking token advance upon agreement",
      amountRupees: Math.round(initialTotalPaise * 0.1 / 100),
      dueDate: new Date().toISOString().split("T")[0],
    },
    {
      installmentKey: "DP-01",
      type: "DOWN_PAYMENT",
      description: "Allotment & deed execution down payment",
      amountRupees: Math.round(initialTotalPaise * 0.2 / 100),
      dueDate: new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0],
    },
    {
      installmentKey: "MLS-01",
      type: "MILESTONE",
      description: "Township road network & demarcated boundary wall completion",
      amountRupees: Math.round(initialTotalPaise * 0.4 / 100),
      dueDate: new Date(Date.now() + 90 * 86400000).toISOString().split("T")[0],
      milestoneReference: "INFRA_STAGE_1",
    },
    {
      installmentKey: "REG-POSS",
      type: "SCHEDULED_INSTALLMENT",
      description: "Final balance upon sub-registrar conveyance registration and physical possession",
      amountRupees: Math.round(initialTotalPaise * 0.3 / 100),
      dueDate: new Date(Date.now() + 180 * 86400000).toISOString().split("T")[0],
    },
  ]);

  const handleBookingChange = (bId: string) => {
    setSelectedBookingId(bId);
    const b = bookings.find((item) => item._id.toString() === bId);
    if (b && b.finalAmountPaise) {
      const rupees = b.finalAmountPaise / 100;
      setTotalConsiderationRupees(rupees);
      // Recalculate default percentages
      setInstallments([
        {
          installmentKey: "BKG-AMT",
          type: "BOOKING_AMOUNT",
          description: "Booking token advance upon agreement",
          amountRupees: Math.round(rupees * 0.1),
          dueDate: new Date().toISOString().split("T")[0],
        },
        {
          installmentKey: "DP-01",
          type: "DOWN_PAYMENT",
          description: "Allotment & deed execution down payment",
          amountRupees: Math.round(rupees * 0.2),
          dueDate: new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0],
        },
        {
          installmentKey: "MLS-01",
          type: "MILESTONE",
          description: "Township road network & demarcated boundary wall completion",
          amountRupees: Math.round(rupees * 0.4),
          dueDate: new Date(Date.now() + 90 * 86400000).toISOString().split("T")[0],
          milestoneReference: "INFRA_STAGE_1",
        },
        {
          installmentKey: "REG-POSS",
          type: "SCHEDULED_INSTALLMENT",
          description: "Final balance upon sub-registrar conveyance registration and physical possession",
          amountRupees: Math.round(rupees * 0.3),
          dueDate: new Date(Date.now() + 180 * 86400000).toISOString().split("T")[0],
        },
      ]);
    }
  };

  const handleAddInstallment = () => {
    const nextSeq = installments.length + 1;
    setInstallments((prev) => [
      ...prev,
      {
        installmentKey: `INST-${nextSeq.toString().padStart(2, "0")}`,
        type: "SCHEDULED_INSTALLMENT",
        description: `Milestone #${nextSeq} payment`,
        amountRupees: 0,
        dueDate: new Date(Date.now() + nextSeq * 30 * 86400000).toISOString().split("T")[0],
      },
    ]);
  };

  const handleRemoveInstallment = (idx: number) => {
    setInstallments((prev) => prev.filter((_, i) => i !== idx));
  };

  const updateInst = (index: number, field: string, value: any) => {
    setInstallments((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const sumInstallmentsRupees = installments.reduce((acc, i) => acc + (Number(i.amountRupees) || 0), 0);
  const diffRupees = totalConsiderationRupees - sumInstallmentsRupees;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBookingId) {
      setFormError("Please select a target booking.");
      return;
    }

    if (Math.abs(diffRupees) > 0.01) {
      setFormError(
        `Total sum of scheduled instalments (₹${sumInstallmentsRupees.toLocaleString()}) must exactly match total consideration (₹${totalConsiderationRupees.toLocaleString()}).`
      );
      return;
    }

    setFormError(null);

    startTransition(async () => {
      const res = await createPaymentPlanAction({
        bookingId: selectedBookingId,
        currency: "INR",
        totalConsiderationPaise: Math.round(totalConsiderationRupees * 100),
        installments: installments.map((i) => ({
          installmentKey: i.installmentKey.trim().toUpperCase(),
          type: i.type,
          description: i.description.trim(),
          amountPaise: Math.round(Number(i.amountRupees) * 100),
          dueDate: i.dueDate,
          milestoneReference: i.milestoneReference?.trim() || undefined,
        })),
      });

      if (!res.success) {
        setFormError(res.message);
      } else {
        const data = res.data as { planId: string };
        router.push(`/dashboard/payment-plans/${data.planId}`);
      }
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 antialiased">
      <Link
        href="/dashboard/payment-plans"
        className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-[#071a28] transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to Payment Plans</span>
      </Link>

      <div className="bg-white rounded-3xl border border-[rgba(7,26,40,0.08)] p-6 md:p-8 shadow-xs space-y-6">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-widest text-[#087fc3] font-bold">
            Milestone Construction-Linked Plans
          </span>
          <h1 className="text-2xl font-bold font-serif text-[#071a28] tracking-tight mt-1">
            Build New Customer Payment Plan
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Assign scheduled milestone payments, token advance dates, and statutory registry instalments.
          </p>
        </div>

        {formError && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold">
            {formError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8 text-xs">
          {/* Booking Context */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold font-serif text-[#071a28] uppercase tracking-wider border-b border-slate-100 pb-2">
              1. Target Booking & Total Consideration
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="font-bold text-[#071a28] block mb-1">Target Booking *</label>
                <select
                  value={selectedBookingId}
                  onChange={(e) => handleBookingChange(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-[#fbfaf8] text-xs font-semibold text-[#071a28]"
                >
                  {bookings.map((b) => (
                    <option key={b._id} value={b._id}>
                      {b.bookingNumber} — {b.propertyId?.title || "Property"} ({MoneyUtils.format(b.finalAmountPaise)})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-[#071a28] block mb-1">Total Consideration (₹ Rupees) *</label>
                <input
                  type="number"
                  value={totalConsiderationRupees}
                  onChange={(e) => setTotalConsiderationRupees(Number(e.target.value))}
                  required
                  min={1}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-[#fbfaf8] text-xs font-bold text-[#071a28]"
                />
              </div>
            </div>
          </div>

          {/* Instalment Schedule */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="text-sm font-bold font-serif text-[#071a28] uppercase tracking-wider">
                2. Scheduled Instalments ({installments.length})
              </h3>
              <button
                type="button"
                onClick={handleAddInstallment}
                className="px-3 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#071a28] font-bold text-xs flex items-center gap-1.5 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Milestone</span>
              </button>
            </div>

            <div className="space-y-3">
              {installments.map((inst, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl bg-[#fbfaf8] border border-slate-200 space-y-3 relative"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#071a28] uppercase tracking-wider text-[10px]">
                      Instalment #{idx + 1}
                    </span>
                    {installments.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveInstallment(idx)}
                        className="text-rose-600 hover:text-rose-800 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Key *</label>
                      <input
                        type="text"
                        value={inst.installmentKey}
                        onChange={(e) => updateInst(idx, "installmentKey", e.target.value.toUpperCase())}
                        required
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-mono font-bold"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Type *</label>
                      <select
                        value={inst.type}
                        onChange={(e) => updateInst(idx, "type", e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold"
                      >
                        <option value="BOOKING_AMOUNT">Booking Token</option>
                        <option value="DOWN_PAYMENT">Down Payment</option>
                        <option value="MILESTONE">Milestone</option>
                        <option value="SCHEDULED_INSTALLMENT">Scheduled</option>
                        <option value="STATUTORY_CHARGE">Statutory Charge</option>
                      </select>
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Amount (₹ Rupees) *</label>
                      <input
                        type="number"
                        value={inst.amountRupees}
                        onChange={(e) => updateInst(idx, "amountRupees", Number(e.target.value))}
                        required
                        min={1}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-bold text-[#071a28]"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Due Date *</label>
                      <input
                        type="date"
                        value={inst.dueDate}
                        onChange={(e) => updateInst(idx, "dueDate", e.target.value)}
                        required
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Description *</label>
                    <input
                      type="text"
                      value={inst.description}
                      onChange={(e) => updateInst(idx, "description", e.target.value)}
                      required
                      placeholder="e.g. Completion of road network and demarcation"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs"
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Reconciliation Balance Check Card */}
            <div
              className={`p-4 rounded-2xl border text-xs font-semibold flex items-center justify-between ${
                diffRupees === 0
                  ? "bg-emerald-50 border-emerald-200 text-emerald-900"
                  : "bg-amber-50 border-amber-200 text-amber-900"
              }`}
            >
              <div>
                Sum of instalments: <strong>₹{sumInstallmentsRupees.toLocaleString()}</strong> / Total:{" "}
                <strong>₹{totalConsiderationRupees.toLocaleString()}</strong>
              </div>
              <div>
                {diffRupees === 0 ? (
                  <span className="flex items-center gap-1 font-bold text-emerald-700">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Exact Match</span>
                  </span>
                ) : (
                  <span className="flex items-center gap-1 font-bold text-amber-800">
                    <AlertTriangle className="w-4 h-4" />
                    <span>Difference: ₹{Math.abs(diffRupees).toLocaleString()}</span>
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <Link
              href="/dashboard/payment-plans"
              className="px-5 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 font-bold text-xs transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isPending || diffRupees !== 0}
              className="px-6 py-2.5 rounded-xl bg-[#071a28] hover:bg-[#0d2c42] disabled:opacity-50 text-white font-bold text-xs flex items-center gap-2 shadow-md transition-colors"
            >
              <Layers className="w-4 h-4 text-[#42b7e8]" />
              <span>{isPending ? "Creating Plan..." : "Create Payment Plan"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

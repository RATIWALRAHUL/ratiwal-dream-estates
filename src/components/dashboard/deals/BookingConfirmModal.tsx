"use client";

import React, { useState, useTransition } from "react";
import { X } from "lucide-react";
import { confirmBookingAction } from "@/lib/actions/deal.actions";

interface BookingConfirmModalProps {
  reservationId: string;
  unitNumber?: string;
  finalAmountRupees?: number;
  isOpen: boolean;
  onClose: () => void;
}

export function BookingConfirmModal({
  reservationId,
  unitNumber,
  finalAmountRupees,
  isOpen,
  onClose,
}: BookingConfirmModalProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [identityVerified, setIdentityVerified] = useState(false);
  const [addressVerified, setAddressVerified] = useState(false);
  const [formSigned, setFormSigned] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [notes, setNotes] = useState("");

  if (!isOpen) return null;

  const allChecklistItemsCompleted = identityVerified && addressVerified && formSigned && termsAccepted;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!allChecklistItemsCompleted) {
      setError("All mandatory verification checklist items must be confirmed.");
      return;
    }

    startTransition(async () => {
      const res = await confirmBookingAction({
        reservationId,
        requirements: {
          identityProofVerified: identityVerified,
          addressProofVerified: addressVerified,
          bookingFormSigned: formSigned,
          downPaymentTermsAccepted: termsAccepted,
          verificationNotes: notes.trim() || undefined,
        },
        markDealWon: true,
      });

      if (!res.success) {
        setError(res.message);
      } else {
        onClose();
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#071a28]/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl border border-[rgba(7,26,40,0.12)] shadow-2xl max-w-lg w-full p-6 sm:p-8 space-y-5 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex justify-between items-start border-b border-[rgba(7,26,40,0.06)] pb-4">
          <div>
            <h3 className="text-base font-bold font-serif text-[#071a28]">Confirm Operational Booking</h3>
            <p className="text-xs text-[#647581] mt-0.5">
              Lock unit as SOLD and finalize operational booking confirmation.
            </p>
          </div>
          <button onClick={onClose} disabled={isPending} className="text-[#647581] hover:text-[#071a28] p-1 rounded-lg transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold">
            {error}
          </div>
        )}

        <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200/80 text-amber-900 text-xs space-y-1">
          <div className="font-semibold flex items-center gap-1.5">
            <span>ℹ️</span> Operational Disclaimer:
          </div>
          <p className="text-[11px] leading-relaxed text-amber-800">
            Booking confirmation allocates the unit and updates internal CRM deal records. It does{" "}
            <strong>not</strong> constitute payment gateway settlement, government registration, or legal title transfer.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="space-y-2.5 bg-[#f8f7f4] p-4 rounded-2xl border border-[rgba(7,26,40,0.06)]">
            <h4 className="font-semibold text-[#071a28] uppercase text-[10px] tracking-wider mb-2">
              Mandatory Verification Checklist
            </h4>

            <label className="flex items-start gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={identityVerified}
                onChange={(e) => setIdentityVerified(e.target.checked)}
                disabled={isPending}
                className="mt-0.5 rounded-md border-[rgba(7,26,40,0.2)] text-[#0088cc] focus:ring-[#0088cc]"
              />
              <span className="text-[#071a28] font-medium leading-tight">
                Government-issued photo identification verified (Passport / Aadhaar / Voter ID)
              </span>
            </label>

            <label className="flex items-start gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={addressVerified}
                onChange={(e) => setAddressVerified(e.target.checked)}
                disabled={isPending}
                className="mt-0.5 rounded-md border-[rgba(7,26,40,0.2)] text-[#0088cc] focus:ring-[#0088cc]"
              />
              <span className="text-[#071a28] font-medium leading-tight">
                Residential address documentation confirmed
              </span>
            </label>

            <label className="flex items-start gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={formSigned}
                onChange={(e) => setFormSigned(e.target.checked)}
                disabled={isPending}
                className="mt-0.5 rounded-md border-[rgba(7,26,40,0.2)] text-[#0088cc] focus:ring-[#0088cc]"
              />
              <span className="text-[#071a28] font-medium leading-tight">
                Official Ratiwal Dream Estates booking application form executed
              </span>
            </label>

            <label className="flex items-start gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
                disabled={isPending}
                className="mt-0.5 rounded-md border-[rgba(7,26,40,0.2)] text-[#0088cc] focus:ring-[#0088cc]"
              />
              <span className="text-[#071a28] font-medium leading-tight">
                Down payment schedule and commercial milestone terms acknowledged
              </span>
            </label>
          </div>

          <div>
            <label className="font-semibold text-[#071a28] block mb-1">Internal Verification Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              disabled={isPending}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[rgba(7,26,40,0.12)] bg-white text-xs text-[#071a28] focus:border-[#0088cc] focus:outline-hidden"
              placeholder="e.g. Token cheque deposited, draft agreement shared with counsel..."
            />
          </div>

          <div className="flex justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="px-4 py-2 rounded-xl border border-[rgba(7,26,40,0.12)] text-[#647581] font-semibold hover:bg-stone-50 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending || !allChecklistItemsCompleted}
              className="px-5 py-2 rounded-xl bg-[#0088cc] hover:bg-[#0077b5] text-white font-semibold shadow-xs disabled:opacity-50 transition-colors cursor-pointer"
            >
              {isPending ? "Confirming..." : "Confirm Booking"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

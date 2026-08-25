"use client";

import React, { useState, useTransition } from "react";
import { createOfferAction } from "@/lib/actions/deal.actions";

interface OfferBuilderModalProps {
  dealId: string;
  unitId?: string;
  defaultBasePriceRupees?: number;
  isOpen: boolean;
  onClose: () => void;
}

export function OfferBuilderModal({
  dealId,
  unitId,
  defaultBasePriceRupees,
  isOpen,
  onClose,
}: OfferBuilderModalProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [basePriceRupees, setBasePriceRupees] = useState<string>(
    defaultBasePriceRupees ? String(defaultBasePriceRupees) : ""
  );
  const [plcChargeRupees, setPlcChargeRupees] = useState<string>("");
  const [floorRiseChargeRupees, setFloorRiseChargeRupees] = useState<string>("");
  const [parkingChargeRupees, setParkingChargeRupees] = useState<string>("");
  const [discountAmountRupees, setDiscountAmountRupees] = useState<string>("");
  const [discountReason, setDiscountReason] = useState<string>("");
  const [validDays, setValidDays] = useState<number>(14);
  const [terms, setTerms] = useState<string>("");

  if (!isOpen) return null;

  const base = parseFloat(basePriceRupees) || 0;
  const plc = parseFloat(plcChargeRupees) || 0;
  const floorRise = parseFloat(floorRiseChargeRupees) || 0;
  const parking = parseFloat(parkingChargeRupees) || 0;
  const discount = parseFloat(discountAmountRupees) || 0;

  const grossTotal = base + plc + floorRise + parking;
  const finalPayable = Math.max(0, grossTotal - discount);
  const discountPercent = grossTotal > 0 ? (discount / grossTotal) * 100 : 0;
  const requiresApproval = discountPercent > 5 || discount > 200000;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (base <= 0) {
      setError("Please specify a valid base price.");
      return;
    }

    startTransition(async () => {
      const res = await createOfferAction({
        dealId,
        unitId,
        basePricePaise: Math.round(base * 100),
        plcChargePaise: Math.round(plc * 100),
        floorRiseChargePaise: Math.round(floorRise * 100),
        parkingChargePaise: Math.round(parking * 100),
        discountAmountPaise: Math.round(discount * 100),
        discountReason: discountReason.trim() || undefined,
        validDays,
        termsAndConditions: terms.trim() || undefined,
      });

      if (!res.success) {
        setError(res.message);
      } else {
        onClose();
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl border border-[rgba(7,26,40,0.12)] shadow-2xl max-w-lg w-full p-6 sm:p-8 space-y-6 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex justify-between items-start border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-lg font-bold font-serif text-[#071a28]">Create Versioned Offer</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Draft formal pricing proposal with automated discount validation.
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={isPending}
            className="text-slate-400 hover:text-slate-700 text-lg font-bold p-1"
          >
            ✕
          </button>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-[#071a28] block mb-1">Base Price (₹) *</label>
              <input
                type="number"
                value={basePriceRupees}
                onChange={(e) => setBasePriceRupees(e.target.value)}
                required
                disabled={isPending}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-[#fbfaf8] font-bold text-xs"
                placeholder="e.g. 6500000"
              />
            </div>
            <div>
              <label className="font-bold text-[#071a28] block mb-1">PLC Charges (₹)</label>
              <input
                type="number"
                value={plcChargeRupees}
                onChange={(e) => setPlcChargeRupees(e.target.value)}
                disabled={isPending}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-[#fbfaf8] text-xs"
                placeholder="e.g. 150000"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-[#071a28] block mb-1">Floor Rise (₹)</label>
              <input
                type="number"
                value={floorRiseChargeRupees}
                onChange={(e) => setFloorRiseChargeRupees(e.target.value)}
                disabled={isPending}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-[#fbfaf8] text-xs"
                placeholder="e.g. 50000"
              />
            </div>
            <div>
              <label className="font-bold text-[#071a28] block mb-1">Parking / Club (₹)</label>
              <input
                type="number"
                value={parkingChargeRupees}
                onChange={(e) => setParkingChargeRupees(e.target.value)}
                disabled={isPending}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-[#fbfaf8] text-xs"
                placeholder="e.g. 200000"
              />
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100">
            <label className="font-bold text-[#071a28] block mb-1">Special Discount Waiver (₹)</label>
            <input
              type="number"
              value={discountAmountRupees}
              onChange={(e) => setDiscountAmountRupees(e.target.value)}
              disabled={isPending}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-[#fbfaf8] text-xs"
              placeholder="e.g. 100000"
            />
            {discount > 0 && (
              <p className="text-[11px] text-slate-500 mt-1">
                Discount: <span className="font-bold text-amber-700">{discountPercent.toFixed(1)}%</span>
                {requiresApproval && (
                  <span className="ml-1 text-orange-600 font-semibold">
                    (Requires Sales Manager / Admin approval)
                  </span>
                )}
              </p>
            )}
          </div>

          {requiresApproval && (
            <div>
              <label className="font-bold text-[#071a28] block mb-1">Discount Reason / Justification *</label>
              <textarea
                value={discountReason}
                onChange={(e) => setDiscountReason(e.target.value)}
                rows={2}
                required
                disabled={isPending}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-[#fbfaf8] text-xs"
                placeholder="Explain commercial rationale for discount exception..."
              />
            </div>
          )}

          {/* Pricing Summary Box */}
          <div className="p-3.5 rounded-2xl bg-[#071a28] text-white space-y-1.5">
            <div className="flex justify-between text-[11px] text-slate-300">
              <span>Gross Total:</span>
              <span>₹{grossTotal.toLocaleString("en-IN")}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-[11px] text-amber-400">
                <span>Discount Applied:</span>
                <span>-₹{discount.toLocaleString("en-IN")}</span>
              </div>
            )}
            <div className="flex justify-between text-sm font-bold pt-1 border-t border-white/10">
              <span>Final Payable Offer:</span>
              <span className="text-[#c5a880]">₹{finalPayable.toLocaleString("en-IN")}</span>
            </div>
          </div>

          <div className="flex justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="px-5 py-2 rounded-xl bg-[#c5a880] text-[#071a28] font-bold hover:bg-[#b59870] transition-colors"
            >
              {isPending ? "Generating Offer..." : requiresApproval ? "Submit for Approval" : "Issue Offer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

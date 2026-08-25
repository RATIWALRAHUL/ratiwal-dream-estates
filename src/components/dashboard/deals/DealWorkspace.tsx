"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import {
  DealStage,
  DEAL_STAGES,
  DealLostReason,
  DEAL_LOST_REASONS,
  isValidDealTransition,
} from "@/types/deal";
import {
  updateDealStageAction,
  approveOfferAction,
  rejectOfferAction,
  acceptOfferAction,
  convertHoldToReservationAction,
  cancelReservationAction,
} from "@/lib/actions/deal.actions";
import { OfferBuilderModal } from "./OfferBuilderModal";
import { HoldActionModal } from "./HoldActionModal";
import { BookingConfirmModal } from "./BookingConfirmModal";

interface DealWorkspaceProps {
  dealData: any;
  userRole?: string;
}

const STAGE_STEPS: { stage: DealStage; label: string }[] = [
  { stage: "QUALIFICATION", label: "Qualify" },
  { stage: "NEGOTIATION", label: "Negotiate" },
  { stage: "OFFER_APPROVED", label: "Offer" },
  { stage: "ON_HOLD", label: "Hold" },
  { stage: "RESERVED", label: "Reserved" },
  { stage: "BOOKED", label: "Booked" },
  { stage: "WON", label: "Won" },
];

export function DealWorkspace({ dealData, userRole = "SUPER_ADMIN" }: DealWorkspaceProps) {
  const { deal, activities = [], offers = [] } = dealData;
  const [isPending, startTransition] = useTransition();
  const [actionError, setActionError] = useState<string | null>(null);

  // Modals state
  const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);
  const [holdModalMode, setHoldModalMode] = useState<"ACQUIRE" | "EXTEND" | "RELEASE" | null>(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

  // Stage change state
  const [targetStage, setTargetStage] = useState<DealStage | "">("");
  const [lostReason, setLostReason] = useState<DealLostReason>("PRICE_TOO_HIGH");
  const [stageComment, setStageComment] = useState("");

  const isClosed = ["WON", "LOST", "CANCELLED", "ARCHIVED"].includes(deal.status);
  const currentOffer = deal.currentOfferId;
  const activeHold = deal.activeHoldId;
  const activeReservation = deal.activeReservationId;
  const booking = deal.bookingId;

  const handleStageChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetStage) return;
    setActionError(null);

    startTransition(async () => {
      const res = await updateDealStageAction({
        dealId: deal._id.toString(),
        newStage: targetStage as DealStage,
        currentVersion: deal.version,
        comment: stageComment.trim() || undefined,
        lostReason: targetStage === "LOST" ? lostReason : undefined,
      });

      if (!res.success) {
        setActionError(res.message);
      } else {
        setTargetStage("");
        setStageComment("");
      }
    });
  };

  const handleApproveOffer = (offerId: string) => {
    setActionError(null);
    startTransition(async () => {
      const res = await approveOfferAction(offerId);
      if (!res.success) setActionError(res.message);
    });
  };

  const handleRejectOffer = (offerId: string) => {
    const reason = prompt("Please provide reason for offer rejection:");
    if (!reason?.trim()) return;
    setActionError(null);
    startTransition(async () => {
      const res = await rejectOfferAction({ offerId, reason: reason.trim() });
      if (!res.success) setActionError(res.message);
    });
  };

  const handleAcceptOffer = (offerId: string) => {
    setActionError(null);
    startTransition(async () => {
      const res = await acceptOfferAction(offerId);
      if (!res.success) setActionError(res.message);
    });
  };

  const handleConvertToReservation = () => {
    setActionError(null);
    startTransition(async () => {
      const res = await convertHoldToReservationAction({
        dealId: deal._id.toString(),
        holdId: activeHold?._id?.toString(),
        offerId: currentOffer?._id?.toString(),
      });
      if (!res.success) setActionError(res.message);
    });
  };

  const handleCancelReservation = (reservationId: string) => {
    const reason = prompt("Enter cancellation reason for this reservation:");
    if (!reason?.trim()) return;
    setActionError(null);
    startTransition(async () => {
      const res = await cancelReservationAction({ reservationId, reason: reason.trim() });
      if (!res.success) setActionError(res.message);
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-white rounded-3xl border border-[rgba(7,26,40,0.08)] p-6 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <span className="font-mono text-sm font-bold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-lg">
                {deal.dealNumber}
              </span>
              <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-amber-50 text-amber-900 border border-amber-200">
                {deal.status.replace(/_/g, " ")}
              </span>
              <span className="text-[11px] text-slate-400 font-mono">v{deal.version}</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold font-serif text-[#071a28]">
              {deal.leadId?.fullName || "Prospective Client"} • {deal.propertyId?.title || "Property"}
            </h1>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            {!isClosed && (
              <>
                <button
                  onClick={() => setIsOfferModalOpen(true)}
                  disabled={isPending}
                  className="px-3.5 py-2 rounded-xl bg-slate-100 text-[#071a28] font-bold text-xs hover:bg-[#c5a880] hover:text-white transition-colors"
                >
                  + Create Offer
                </button>
                {deal.unitId && !activeHold && !activeReservation && !booking && (
                  <button
                    onClick={() => setHoldModalMode("ACQUIRE")}
                    disabled={isPending}
                    className="px-3.5 py-2 rounded-xl bg-purple-50 text-purple-900 border border-purple-200 font-bold text-xs hover:bg-purple-100 transition-colors"
                  >
                    🔒 Place Hold
                  </button>
                )}
                {activeHold && !activeReservation && (
                  <button
                    onClick={handleConvertToReservation}
                    disabled={isPending}
                    className="px-3.5 py-2 rounded-xl bg-indigo-50 text-indigo-900 border border-indigo-200 font-bold text-xs hover:bg-indigo-100 transition-colors"
                  >
                    📋 Reserve Unit
                  </button>
                )}
                {activeReservation && !booking && (
                  <button
                    onClick={() => setIsBookingModalOpen(true)}
                    disabled={isPending}
                    className="px-3.5 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 transition-colors shadow-xs"
                  >
                    ✓ Confirm Booking
                  </button>
                )}
              </>
            )}
          </div>
        </div>

        {/* Pipeline Stage Stepper */}
        <div className="pt-3 border-t border-slate-100">
          <div className="flex items-center justify-between overflow-x-auto pb-2 gap-2 text-xs">
            {STAGE_STEPS.map((step, idx) => {
              const isCurrent = deal.status === step.stage;
              const isPast =
                DEAL_STAGES.indexOf(deal.status) >= DEAL_STAGES.indexOf(step.stage) &&
                !["LOST", "CANCELLED"].includes(deal.status);

              return (
                <div key={step.stage} className="flex items-center gap-2 shrink-0">
                  <div
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full font-bold transition-colors ${
                      isCurrent
                        ? "bg-[#071a28] text-white shadow-xs"
                        : isPast
                        ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                        : "bg-slate-100 text-slate-400"
                    }`}
                  >
                    <span className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center text-[10px]">
                      {idx + 1}
                    </span>
                    <span>{step.label}</span>
                  </div>
                  {idx < STAGE_STEPS.length - 1 && <span className="text-slate-300">→</span>}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {actionError && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold">
          {actionError}
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Customer & Unit Details */}
          <div className="bg-white rounded-3xl border border-[rgba(7,26,40,0.08)] p-6 space-y-4">
            <h3 className="text-sm font-bold font-serif text-[#071a28] uppercase tracking-wider">
              Asset & Prospect Overview
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-2xl bg-[#fbfaf8] border border-slate-100 space-y-2">
                <div className="text-slate-400 font-bold uppercase text-[10px]">Buyer Details</div>
                <div className="font-bold text-sm text-[#071a28]">{deal.leadId?.fullName || "—"}</div>
                <div className="text-slate-600">{deal.leadId?.email || "No email"}</div>
                <div className="text-slate-600">{deal.leadId?.displayPhone || "No phone"}</div>
                <div className="pt-1">
                  <Link
                    href={`/dashboard/leads/${deal.leadId?._id}`}
                    className="text-[#c5a880] font-bold hover:underline text-[11px]"
                  >
                    View Lead Profile →
                  </Link>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-[#fbfaf8] border border-slate-100 space-y-2">
                <div className="text-slate-400 font-bold uppercase text-[10px]">Property & Unit</div>
                <div className="font-bold text-sm text-[#071a28]">{deal.propertyId?.title || "—"}</div>
                {deal.unitId ? (
                  <>
                    <div className="font-mono font-bold text-slate-700">
                      Unit: {deal.unitId.unitNumber} ({deal.unitId.referenceCode})
                    </div>
                    <div className="text-slate-600">
                      Status:{" "}
                      <span className="font-bold px-2 py-0.5 rounded bg-slate-200 text-slate-800">
                        {deal.unitId.status}
                      </span>
                    </div>
                  </>
                ) : (
                  <div className="text-slate-400 italic">No specific unit allocated</div>
                )}
              </div>
            </div>
          </div>

          {/* Current Offer Card */}
          <div className="bg-white rounded-3xl border border-[rgba(7,26,40,0.08)] p-6 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-bold font-serif text-[#071a28] uppercase tracking-wider">
                Current Pricing Offer
              </h3>
              {currentOffer && (
                <span className="text-xs font-mono font-bold text-slate-500">
                  {currentOffer.offerNumber} (v{currentOffer.version})
                </span>
              )}
            </div>

            {currentOffer ? (
              <div className="space-y-4 text-xs">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-2xl bg-[#fbfaf8] border border-slate-100">
                  <div>
                    <div className="text-slate-400 text-[10px] uppercase font-bold">Base Price</div>
                    <div className="font-bold text-[#071a28] text-sm mt-0.5">
                      ₹{Math.round(currentOffer.basePricePaise / 100).toLocaleString("en-IN")}
                    </div>
                  </div>
                  <div>
                    <div className="text-slate-400 text-[10px] uppercase font-bold">Discount</div>
                    <div className="font-bold text-amber-700 text-sm mt-0.5">
                      ₹{Math.round(currentOffer.discountAmountPaise / 100).toLocaleString("en-IN")} (
                      {currentOffer.discountPercentage.toFixed(1)}%)
                    </div>
                  </div>
                  <div>
                    <div className="text-slate-400 text-[10px] uppercase font-bold">Final Payable</div>
                    <div className="font-bold text-emerald-800 text-sm mt-0.5">
                      ₹{Math.round(currentOffer.finalOfferedAmountPaise / 100).toLocaleString("en-IN")}
                    </div>
                  </div>
                  <div>
                    <div className="text-slate-400 text-[10px] uppercase font-bold">Approval</div>
                    <div className="mt-0.5">
                      <span className="px-2 py-0.5 rounded-full font-bold text-[10px] bg-slate-100 text-slate-700">
                        {currentOffer.approvalStatus}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Offer Action Buttons */}
                <div className="flex flex-wrap gap-2 pt-2">
                  {currentOffer.status === "PENDING_APPROVAL" && ["SUPER_ADMIN", "ADMIN"].includes(userRole) && (
                    <>
                      <button
                        onClick={() => handleApproveOffer(currentOffer._id.toString())}
                        disabled={isPending}
                        className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 transition-colors"
                      >
                        ✓ Approve Discount
                      </button>
                      <button
                        onClick={() => handleRejectOffer(currentOffer._id.toString())}
                        disabled={isPending}
                        className="px-3 py-1.5 rounded-xl bg-rose-600 text-white font-bold text-xs hover:bg-rose-700 transition-colors"
                      >
                        ✕ Reject Offer
                      </button>
                    </>
                  )}
                  {currentOffer.status === "APPROVED" && (
                    <button
                      onClick={() => handleAcceptOffer(currentOffer._id.toString())}
                      disabled={isPending}
                      className="px-3 py-1.5 rounded-xl bg-[#071a28] text-white font-bold text-xs hover:bg-slate-800 transition-colors"
                    >
                      🤝 Mark Accepted by Buyer
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="p-8 text-center bg-[#fbfaf8] rounded-2xl border border-dashed border-slate-200 text-slate-400 text-xs">
                No active offer drafted for this deal yet.
              </div>
            )}
          </div>

          {/* Active Hold / Reservation / Booking Panels */}
          {activeHold && (
            <div className="bg-purple-50/50 rounded-3xl border border-purple-200/80 p-6 space-y-3 text-xs">
              <div className="flex justify-between items-center">
                <h3 className="font-bold font-serif text-purple-950 uppercase text-sm">
                  Active Inventory Hold ({activeHold.holdNumber})
                </h3>
                <span className="font-bold text-purple-800 bg-purple-100 px-2 py-0.5 rounded-full text-[10px]">
                  ACTIVE
                </span>
              </div>
              <p className="text-purple-900 leading-relaxed">
                Held by <strong>{activeHold.heldByName || "Advisor"}</strong> on{" "}
                {new Date(activeHold.startsAt).toLocaleString()} • Expires on{" "}
                <strong>{new Date(activeHold.expiresAt).toLocaleString()}</strong> (Extensions:{" "}
                {activeHold.extensionCount}/3).
              </p>
              <div className="flex gap-2 pt-1">
                <button
                  onClick={() => setHoldModalMode("EXTEND")}
                  disabled={isPending || activeHold.extensionCount >= 3}
                  className="px-3 py-1 rounded-xl bg-purple-200 text-purple-950 font-bold hover:bg-purple-300"
                >
                  + Extend Hold
                </button>
                <button
                  onClick={() => setHoldModalMode("RELEASE")}
                  disabled={isPending}
                  className="px-3 py-1 rounded-xl bg-white border border-purple-300 text-purple-900 font-bold hover:bg-purple-100"
                >
                  Release Hold
                </button>
              </div>
            </div>
          )}

          {activeReservation && (
            <div className="bg-indigo-50/50 rounded-3xl border border-indigo-200/80 p-6 space-y-3 text-xs">
              <div className="flex justify-between items-center">
                <h3 className="font-bold font-serif text-indigo-950 uppercase text-sm">
                  Active Unit Reservation ({activeReservation.reservationNumber})
                </h3>
                <span className="font-bold text-indigo-800 bg-indigo-100 px-2 py-0.5 rounded-full text-[10px]">
                  RESERVED
                </span>
              </div>
              <p className="text-indigo-900 leading-relaxed">
                Locked at agreed price of{" "}
                <strong>₹{Math.round(activeReservation.finalAmountPaise / 100).toLocaleString("en-IN")}</strong>.
                Valid until {activeReservation.validUntil ? new Date(activeReservation.validUntil).toLocaleDateString() : "—"}.
              </p>
              {!booking && (
                <div className="pt-1">
                  <button
                    onClick={() => handleCancelReservation(activeReservation._id.toString())}
                    disabled={isPending}
                    className="px-3 py-1 rounded-xl bg-white border border-rose-300 text-rose-800 font-bold hover:bg-rose-50"
                  >
                    Cancel Reservation
                  </button>
                </div>
              )}
            </div>
          )}

          {booking && (
            <div className="bg-emerald-50/60 rounded-3xl border border-emerald-200 p-6 space-y-3 text-xs">
              <div className="flex justify-between items-center">
                <h3 className="font-bold font-serif text-emerald-950 uppercase text-sm">
                  Confirmed Booking Record ({booking.bookingNumber})
                </h3>
                <span className="font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full text-[10px]">
                  {booking.status}
                </span>
              </div>
              <p className="text-emerald-900 leading-relaxed">
                Confirmed by <strong>{booking.confirmedByName || "Staff"}</strong> on{" "}
                {booking.confirmedAt ? new Date(booking.confirmedAt).toLocaleString() : "—"}. Unit inventory status
                is marked as SOLD.
              </p>
            </div>
          )}
        </div>

        {/* Right Column (1 Col): Stage Control & Activity Ledger */}
        <div className="space-y-6">
          {/* Stage Progression Card */}
          <div className="bg-white rounded-3xl border border-[rgba(7,26,40,0.08)] p-6 space-y-4">
            <h3 className="text-sm font-bold font-serif text-[#071a28] uppercase tracking-wider">
              Deal Progression
            </h3>

            <form onSubmit={handleStageChange} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-[#071a28] block mb-1">Target Stage</label>
                <select
                  value={targetStage}
                  onChange={(e) => setTargetStage(e.target.value as DealStage)}
                  disabled={isPending || isClosed}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-[#fbfaf8] text-xs font-semibold text-[#071a28]"
                >
                  <option value="">-- Select next stage --</option>
                  {DEAL_STAGES.filter((s) => isValidDealTransition(deal.status, s)).map((s) => (
                    <option key={s} value={s}>
                      {s.replace(/_/g, " ")}
                    </option>
                  ))}
                </select>
              </div>

              {targetStage === "LOST" && (
                <div>
                  <label className="font-bold text-[#071a28] block mb-1">Lost Reason *</label>
                  <select
                    value={lostReason}
                    onChange={(e) => setLostReason(e.target.value as DealLostReason)}
                    disabled={isPending}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-[#fbfaf8] text-xs font-semibold text-[#071a28]"
                  >
                    {DEAL_LOST_REASONS.map((r) => (
                      <option key={r} value={r}>
                        {r.replace(/_/g, " ")}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {targetStage && (
                <div>
                  <label className="font-bold text-[#071a28] block mb-1">Reason / Transition Notes</label>
                  <textarea
                    value={stageComment}
                    onChange={(e) => setStageComment(e.target.value)}
                    rows={2}
                    disabled={isPending}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-[#fbfaf8] text-xs"
                    placeholder="Provide context for this deal stage change..."
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={isPending || !targetStage || isClosed}
                className="w-full py-2.5 rounded-xl bg-[#071a28] text-white font-bold text-xs hover:bg-slate-800 disabled:opacity-40 transition-colors"
              >
                {isPending ? "Transitioning..." : "Update Deal Stage"}
              </button>
            </form>
          </div>

          {/* Activity Ledger Timeline */}
          <div className="bg-white rounded-3xl border border-[rgba(7,26,40,0.08)] p-6 space-y-4">
            <h3 className="text-sm font-bold font-serif text-[#071a28] uppercase tracking-wider">
              Audit & Activity History
            </h3>

            <div className="space-y-3.5 max-h-[400px] overflow-y-auto pr-1">
              {activities.length === 0 ? (
                <div className="text-xs text-slate-400 italic">No activity logged yet.</div>
              ) : (
                activities.map((act: any) => (
                  <div key={act._id} className="text-xs space-y-1 pb-3 border-b border-slate-100 last:border-0">
                    <div className="flex justify-between items-start">
                      <span className="font-bold text-[#071a28]">{act.summary}</span>
                      <span className="text-[10px] text-slate-400 shrink-0 ml-2">
                        {new Date(act.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500">
                      By {act.actorName} ({act.actorRole})
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <OfferBuilderModal
        dealId={deal._id.toString()}
        unitId={deal.unitId?._id?.toString()}
        defaultBasePriceRupees={deal.unitId?.basePricePaise ? Math.round(deal.unitId.basePricePaise / 100) : undefined}
        isOpen={isOfferModalOpen}
        onClose={() => setIsOfferModalOpen(false)}
      />

      <HoldActionModal
        dealId={deal._id.toString()}
        unitId={deal.unitId?._id?.toString()}
        activeHoldId={activeHold?._id?.toString()}
        mode={holdModalMode || "ACQUIRE"}
        isOpen={Boolean(holdModalMode)}
        onClose={() => setHoldModalMode(null)}
      />

      <BookingConfirmModal
        reservationId={activeReservation?._id?.toString() || ""}
        unitNumber={deal.unitId?.unitNumber}
        finalAmountRupees={
          activeReservation?.finalAmountPaise ? Math.round(activeReservation.finalAmountPaise / 100) : undefined
        }
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
      />
    </div>
  );
}

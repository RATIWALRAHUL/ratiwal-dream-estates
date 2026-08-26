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
import { ArrowLeft, Check, CheckCircle2, Lock, Plus, Tag, X } from "lucide-react";

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
  const [lostReason, setLostReason] = useState<DealLostReason>("PRICE_MISMATCH");
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
      {/* Back button */}
      <div>
        <Link
          href="/dashboard/deals"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#647581] hover:text-[#071a28] transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Deals & Pipeline</span>
        </Link>
      </div>

      {/* Top Header Card */}
      <div className="bg-white rounded-3xl border border-[rgba(7,26,40,0.08)] p-6 md:p-8 shadow-[0_4px_24px_rgba(7,26,40,0.02)] space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2.5">
              <span className="font-mono text-xs font-bold text-[#0088cc] bg-[#eaf5fa] border border-[#0088cc]/20 px-2.5 py-0.5 rounded-lg">
                {deal.dealNumber}
              </span>
              <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold bg-amber-50 text-amber-900 border border-amber-200">
                {deal.status.replace(/_/g, " ")}
              </span>
              <span className="text-[11px] text-[#647581] font-mono font-semibold">v{deal.version}</span>
            </div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold font-serif text-[#071a28]">
              {deal.leadId?.fullName || "Prospective Client"} • {deal.propertyId?.title || "Property"}
            </h1>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            {!isClosed && (
              <>
                <button
                  onClick={() => setIsOfferModalOpen(true)}
                  disabled={isPending}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-[rgba(7,26,40,0.12)] text-[#071a28] font-semibold text-xs hover:bg-stone-50 transition shadow-2xs cursor-pointer"
                >
                  <Tag className="w-3.5 h-3.5 text-[#0088cc]" />
                  <span>Create Offer</span>
                </button>
                {deal.unitId && !activeHold && !activeReservation && !booking && (
                  <button
                    onClick={() => setHoldModalMode("ACQUIRE")}
                    disabled={isPending}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-50 text-purple-900 border border-purple-200 font-semibold text-xs hover:bg-purple-100 transition shadow-2xs cursor-pointer"
                  >
                    <Lock className="w-3.5 h-3.5" />
                    <span>Place Hold</span>
                  </button>
                )}
                {activeHold && !activeReservation && (
                  <button
                    onClick={handleConvertToReservation}
                    disabled={isPending}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-50 text-blue-900 border border-blue-200 font-semibold text-xs hover:bg-blue-100 transition shadow-2xs cursor-pointer"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Reserve Unit</span>
                  </button>
                )}
                {activeReservation && !booking && (
                  <button
                    onClick={() => setIsBookingModalOpen(true)}
                    disabled={isPending}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0088cc] hover:bg-[#0077b5] text-white font-semibold text-xs transition shadow-xs cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Confirm Booking</span>
                  </button>
                )}
              </>
            )}
          </div>
        </div>

        {/* Pipeline Stage Stepper */}
        <div className="pt-4 border-t border-[rgba(7,26,40,0.06)]">
          <div className="flex items-center justify-between overflow-x-auto pb-2 gap-2 text-xs">
            {STAGE_STEPS.map((step, idx) => {
              const isCurrent = deal.status === step.stage;
              const isPast =
                DEAL_STAGES.indexOf(deal.status) >= DEAL_STAGES.indexOf(step.stage) &&
                !["LOST", "CANCELLED"].includes(deal.status);

              return (
                <div key={step.stage} className="flex items-center gap-2 shrink-0">
                  <div
                    className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full font-semibold transition-colors ${
                      isCurrent
                        ? "bg-[#071a28] text-white shadow-xs"
                        : isPast
                        ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                        : "bg-[#f8f7f4] text-[#647581] border border-[rgba(7,26,40,0.06)]"
                    }`}
                  >
                    <span className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center text-[10px] font-bold">
                      {idx + 1}
                    </span>
                    <span>{step.label}</span>
                  </div>
                  {idx < STAGE_STEPS.length - 1 && <span className="text-stone-300">→</span>}
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
          <div className="bg-white rounded-3xl border border-[rgba(7,26,40,0.08)] p-6 space-y-4 shadow-2xs">
            <h3 className="text-sm font-bold font-serif text-[#071a28] uppercase tracking-wider">
              Asset & Prospect Overview
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-2xl bg-[#f8f7f4] border border-[rgba(7,26,40,0.06)] space-y-2">
                <div className="text-[#647581] font-bold uppercase text-[10px]">Buyer Details</div>
                <div className="font-bold text-sm text-[#071a28]">{deal.leadId?.fullName || "—"}</div>
                <div className="text-[#647581]">{deal.leadId?.email || "No email"}</div>
                <div className="text-[#647581]">{deal.leadId?.displayPhone || "No phone"}</div>
                <div className="pt-1">
                  <Link
                    href={`/dashboard/leads/${deal.leadId?._id}`}
                    className="text-[#0088cc] font-semibold hover:underline text-[11px]"
                  >
                    View Lead Profile →
                  </Link>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-[#f8f7f4] border border-[rgba(7,26,40,0.06)] space-y-2">
                <div className="text-[#647581] font-bold uppercase text-[10px]">Property & Unit</div>
                <div className="font-bold text-sm text-[#071a28]">{deal.propertyId?.title || "—"}</div>
                {deal.unitId ? (
                  <>
                    <div className="font-mono font-bold text-[#071a28]">
                      Unit: {deal.unitId.unitNumber} ({deal.unitId.referenceCode})
                    </div>
                    <div className="text-[#647581]">
                      Status:{" "}
                      <span className="font-bold px-2 py-0.5 rounded-lg bg-white border border-[rgba(7,26,40,0.08)] text-[#071a28]">
                        {deal.unitId.status}
                      </span>
                    </div>
                  </>
                ) : (
                  <div className="text-[#647581] italic">No specific unit allocated</div>
                )}
              </div>
            </div>
          </div>

          {/* Current Offer Card */}
          <div className="bg-white rounded-3xl border border-[rgba(7,26,40,0.08)] p-6 space-y-4 shadow-2xs">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-bold font-serif text-[#071a28] uppercase tracking-wider">
                Current Pricing Offer
              </h3>
              {currentOffer && (
                <span className="text-xs font-mono font-bold text-[#0088cc]">
                  {currentOffer.offerNumber} (v{currentOffer.version})
                </span>
              )}
            </div>

            {currentOffer ? (
              <div className="space-y-4 text-xs">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-2xl bg-[#f8f7f4] border border-[rgba(7,26,40,0.06)]">
                  <div>
                    <div className="text-[#647581] text-[10px] uppercase font-bold">Base Price</div>
                    <div className="font-bold text-[#071a28] text-sm mt-0.5">
                      ₹{Math.round(currentOffer.basePricePaise / 100).toLocaleString("en-IN")}
                    </div>
                  </div>
                  <div>
                    <div className="text-[#647581] text-[10px] uppercase font-bold">Discount</div>
                    <div className="font-bold text-amber-700 text-sm mt-0.5">
                      ₹{Math.round(currentOffer.discountAmountPaise / 100).toLocaleString("en-IN")} (
                      {currentOffer.discountPercentage.toFixed(1)}%)
                    </div>
                  </div>
                  <div>
                    <div className="text-[#647581] text-[10px] uppercase font-bold">Final Payable</div>
                    <div className="font-bold text-emerald-800 text-sm mt-0.5">
                      ₹{Math.round(currentOffer.finalOfferedAmountPaise / 100).toLocaleString("en-IN")}
                    </div>
                  </div>
                  <div>
                    <div className="text-[#647581] text-[10px] uppercase font-bold">Approval</div>
                    <div className="mt-0.5">
                      <span className="px-2.5 py-0.5 rounded-full font-semibold text-[10px] bg-white border border-[rgba(7,26,40,0.08)] text-[#071a28]">
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
                        className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition-colors shadow-2xs cursor-pointer"
                      >
                        ✓ Approve Discount
                      </button>
                      <button
                        onClick={() => handleRejectOffer(currentOffer._id.toString())}
                        disabled={isPending}
                        className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs transition-colors shadow-2xs cursor-pointer"
                      >
                        ✕ Reject Offer
                      </button>
                    </>
                  )}
                  {currentOffer.status === "APPROVED" && (
                    <button
                      onClick={() => handleAcceptOffer(currentOffer._id.toString())}
                      disabled={isPending}
                      className="px-3.5 py-1.5 rounded-xl bg-[#0088cc] hover:bg-[#0077b5] text-white font-semibold text-xs transition-colors shadow-2xs cursor-pointer"
                    >
                      🤝 Mark Accepted by Buyer
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="p-8 text-center bg-[#f8f7f4] rounded-2xl border border-dashed border-[rgba(7,26,40,0.12)] text-[#647581] text-xs">
                No active offer drafted for this deal yet.
              </div>
            )}
          </div>

          {/* Active Hold / Reservation / Booking Panels */}
          {activeHold && (
            <div className="bg-purple-50/70 rounded-3xl border border-purple-200 p-6 space-y-3 text-xs">
              <div className="flex justify-between items-center">
                <h3 className="font-bold font-serif text-purple-950 uppercase text-sm">
                  Active Inventory Hold ({activeHold.holdNumber})
                </h3>
                <span className="font-semibold text-purple-800 bg-purple-100 px-2.5 py-0.5 rounded-full text-[10px] border border-purple-200">
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
                  className="px-3.5 py-1.5 rounded-xl bg-purple-200 hover:bg-purple-300 text-purple-950 font-semibold transition cursor-pointer"
                >
                  + Extend Hold
                </button>
                <button
                  onClick={() => setHoldModalMode("RELEASE")}
                  disabled={isPending}
                  className="px-3.5 py-1.5 rounded-xl bg-white border border-purple-300 text-purple-900 font-semibold hover:bg-purple-100 transition cursor-pointer"
                >
                  Release Hold
                </button>
              </div>
            </div>
          )}

          {activeReservation && (
            <div className="bg-blue-50/70 rounded-3xl border border-blue-200 p-6 space-y-3 text-xs">
              <div className="flex justify-between items-center">
                <h3 className="font-bold font-serif text-blue-950 uppercase text-sm">
                  Active Unit Reservation ({activeReservation.reservationNumber})
                </h3>
                <span className="font-semibold text-blue-800 bg-blue-100 px-2.5 py-0.5 rounded-full text-[10px] border border-blue-200">
                  RESERVED
                </span>
              </div>
              <p className="text-blue-900 leading-relaxed">
                Locked at agreed price of{" "}
                <strong>₹{Math.round(activeReservation.finalAmountPaise / 100).toLocaleString("en-IN")}</strong>.
                Valid until {activeReservation.validUntil ? new Date(activeReservation.validUntil).toLocaleDateString() : "—"}.
              </p>
              {!booking && (
                <div className="pt-1">
                  <button
                    onClick={() => handleCancelReservation(activeReservation._id.toString())}
                    disabled={isPending}
                    className="px-3.5 py-1.5 rounded-xl bg-white border border-rose-300 text-rose-800 font-semibold hover:bg-rose-50 transition cursor-pointer"
                  >
                    Cancel Reservation
                  </button>
                </div>
              )}
            </div>
          )}

          {booking && (
            <div className="bg-emerald-50/70 rounded-3xl border border-emerald-200 p-6 space-y-3 text-xs">
              <div className="flex justify-between items-center">
                <h3 className="font-bold font-serif text-emerald-950 uppercase text-sm">
                  Confirmed Booking Record ({booking.bookingNumber})
                </h3>
                <span className="font-semibold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full text-[10px] border border-emerald-200">
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
          <div className="bg-white rounded-3xl border border-[rgba(7,26,40,0.08)] p-6 space-y-4 shadow-2xs">
            <h3 className="text-sm font-bold font-serif text-[#071a28] uppercase tracking-wider">
              Deal Progression
            </h3>

            <form onSubmit={handleStageChange} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-[#071a28] block mb-1">Target Stage</label>
                <select
                  value={targetStage}
                  onChange={(e) => setTargetStage(e.target.value as DealStage)}
                  disabled={isPending || isClosed}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[rgba(7,26,40,0.12)] bg-white text-xs font-semibold text-[#071a28] focus:outline-hidden focus:border-[#0088cc]"
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
                  <label className="font-semibold text-[#071a28] block mb-1">Lost Reason *</label>
                  <select
                    value={lostReason}
                    onChange={(e) => setLostReason(e.target.value as DealLostReason)}
                    disabled={isPending}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[rgba(7,26,40,0.12)] bg-white text-xs font-semibold text-[#071a28] focus:outline-hidden focus:border-[#0088cc]"
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
                  <label className="font-semibold text-[#071a28] block mb-1">Reason / Transition Notes</label>
                  <textarea
                    value={stageComment}
                    onChange={(e) => setStageComment(e.target.value)}
                    rows={2}
                    disabled={isPending}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[rgba(7,26,40,0.12)] bg-white text-xs text-[#071a28] focus:outline-hidden focus:border-[#0088cc]"
                    placeholder="Provide context for this deal stage change..."
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={isPending || !targetStage || isClosed}
                className="w-full py-2.5 rounded-xl bg-[#0088cc] hover:bg-[#0077b5] text-white font-semibold text-xs disabled:opacity-40 transition-colors shadow-xs cursor-pointer"
              >
                {isPending ? "Transitioning..." : "Update Deal Stage"}
              </button>
            </form>
          </div>

          {/* Activity Ledger Timeline */}
          <div className="bg-white rounded-3xl border border-[rgba(7,26,40,0.08)] p-6 space-y-4 shadow-2xs">
            <h3 className="text-sm font-bold font-serif text-[#071a28] uppercase tracking-wider">
              Audit & Activity History
            </h3>

            <div className="space-y-3.5 max-h-[400px] overflow-y-auto pr-1">
              {activities.length === 0 ? (
                <div className="text-xs text-[#647581] italic">No activity logged yet.</div>
              ) : (
                activities.map((act: any) => (
                  <div key={act._id} className="text-xs space-y-1 pb-3 border-b border-[rgba(7,26,40,0.06)] last:border-0">
                    <div className="flex justify-between items-start">
                      <span className="font-bold text-[#071a28]">{act.summary}</span>
                      <span className="text-[10px] text-[#647581] shrink-0 ml-2">
                        {new Date(act.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="text-[11px] text-[#647581]">
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

"use server";
import "server-only";
import { revalidatePath } from "next/cache";
import { requireAdminSession } from "@/lib/auth/guard";
import { DealService, CreateDealInput } from "@/lib/services/deal.service";
import { OfferService, CreateOfferInput } from "@/lib/services/offer.service";
import { HoldService, AcquireHoldInput } from "@/lib/services/hold.service";
import { ReservationService, CreateReservationInput } from "@/lib/services/reservation.service";
import { BookingService, ConfirmBookingInput } from "@/lib/services/booking.service";
import { DealReconciliationService } from "@/lib/services/deal-reconciliation.service";
import { DealStage, DealLostReason } from "@/types/deal";
import { IBookingRequirements } from "@/models/Booking";
import { logger } from "@/lib/logger";

function safeRevalidate(path: string) {
  try {
    revalidatePath(path);
  } catch {
    // Ignore in CLI testing context
  }
}

// ─── DEALS ───────────────────────────────────────────────────────────────────

export async function createDealAction(input: CreateDealInput) {
  try {
    const session = await requireAdminSession(["SUPER_ADMIN", "ADMIN", "EDITOR"]);
    const deal = await DealService.createDeal(input, session);
    safeRevalidate("/dashboard/deals");
    return { success: true as const, dealId: deal._id.toString(), dealNumber: deal.dealNumber };
  } catch (error: any) {
    logger.error("[DealAction] createDealAction failed", { error: error?.message });
    return { success: false as const, message: error?.message || "Failed to create deal." };
  }
}

export async function updateDealStageAction(params: {
  dealId: string;
  newStage: DealStage;
  currentVersion: number;
  reasonCode?: string;
  comment?: string;
  lostReason?: DealLostReason;
  lostReasonDetails?: string;
  cancellationReason?: string;
}) {
  try {
    const session = await requireAdminSession(["SUPER_ADMIN", "ADMIN", "EDITOR"]);
    const updated = await DealService.updateStage({
      ...params,
      session,
    });
    safeRevalidate("/dashboard/deals");
    safeRevalidate(`/dashboard/deals/${params.dealId}`);
    return { success: true as const, deal: updated };
  } catch (error: any) {
    logger.error("[DealAction] updateDealStageAction failed", { error: error?.message });
    return { success: false as const, message: error?.message || "Failed to update deal stage." };
  }
}

export async function reassignDealAdvisorAction(params: {
  dealId: string;
  newAdvisorId: string;
  newAdvisorName: string;
  newAdvisorEmail?: string;
}) {
  try {
    const session = await requireAdminSession(["SUPER_ADMIN", "ADMIN"]);
    const updated = await DealService.reassignAdvisor({
      ...params,
      session,
    });
    safeRevalidate("/dashboard/deals");
    safeRevalidate(`/dashboard/deals/${params.dealId}`);
    return { success: true as const, deal: updated };
  } catch (error: any) {
    logger.error("[DealAction] reassignDealAdvisorAction failed", { error: error?.message });
    return { success: false as const, message: error?.message || "Failed to reassign advisor." };
  }
}

// ─── OFFERS ──────────────────────────────────────────────────────────────────

export async function createOfferAction(input: CreateOfferInput) {
  try {
    const session = await requireAdminSession(["SUPER_ADMIN", "ADMIN", "EDITOR"]);
    const offer = await OfferService.createOffer(input, session);
    safeRevalidate(`/dashboard/deals/${input.dealId}`);
    return { success: true as const, offerId: offer._id.toString(), offerNumber: offer.offerNumber };
  } catch (error: any) {
    logger.error("[DealAction] createOfferAction failed", { error: error?.message });
    return { success: false as const, message: error?.message || "Failed to create offer." };
  }
}

export async function approveOfferAction(offerId: string) {
  try {
    const session = await requireAdminSession(["SUPER_ADMIN", "ADMIN"]);
    const offer = await OfferService.approveOffer(offerId, session);
    safeRevalidate(`/dashboard/deals/${offer.dealId}`);
    return { success: true as const, offer };
  } catch (error: any) {
    logger.error("[DealAction] approveOfferAction failed", { error: error?.message });
    return { success: false as const, message: error?.message || "Failed to approve offer." };
  }
}

export async function rejectOfferAction(params: { offerId: string; reason: string }) {
  try {
    const session = await requireAdminSession(["SUPER_ADMIN", "ADMIN"]);
    const offer = await OfferService.rejectOffer(params.offerId, params.reason, session);
    safeRevalidate(`/dashboard/deals/${offer.dealId}`);
    return { success: true as const, offer };
  } catch (error: any) {
    logger.error("[DealAction] rejectOfferAction failed", { error: error?.message });
    return { success: false as const, message: error?.message || "Failed to reject offer." };
  }
}

export async function acceptOfferAction(offerId: string) {
  try {
    const session = await requireAdminSession(["SUPER_ADMIN", "ADMIN", "EDITOR"]);
    const offer = await OfferService.acceptOffer(offerId, session);
    safeRevalidate(`/dashboard/deals/${offer.dealId}`);
    return { success: true as const, offer };
  } catch (error: any) {
    logger.error("[DealAction] acceptOfferAction failed", { error: error?.message });
    return { success: false as const, message: error?.message || "Failed to accept offer." };
  }
}

// ─── HOLDS ───────────────────────────────────────────────────────────────────

export async function acquireHoldAction(input: AcquireHoldInput) {
  try {
    const session = await requireAdminSession(["SUPER_ADMIN", "ADMIN", "EDITOR"]);
    const hold = await HoldService.acquireHold(input, session);
    safeRevalidate("/dashboard/deals");
    safeRevalidate("/dashboard/holds");
    safeRevalidate("/dashboard/inventory");
    safeRevalidate(`/dashboard/deals/${input.dealId}`);
    return { success: true as const, holdId: hold._id.toString(), holdNumber: hold.holdNumber };
  } catch (error: any) {
    logger.error("[DealAction] acquireHoldAction failed", { error: error?.message });
    return { success: false as const, message: error?.message || "Failed to acquire hold." };
  }
}

export async function extendHoldAction(params: {
  holdId: string;
  extensionHours?: number;
  reason: string;
}) {
  try {
    const session = await requireAdminSession(["SUPER_ADMIN", "ADMIN"]);
    const hold = await HoldService.extendHold({
      ...params,
      session,
    });
    safeRevalidate("/dashboard/holds");
    safeRevalidate(`/dashboard/deals/${hold.dealId}`);
    return { success: true as const, hold };
  } catch (error: any) {
    logger.error("[DealAction] extendHoldAction failed", { error: error?.message });
    return { success: false as const, message: error?.message || "Failed to extend hold." };
  }
}

export async function releaseHoldAction(params: { holdId: string; reason: string }) {
  try {
    const session = await requireAdminSession(["SUPER_ADMIN", "ADMIN", "EDITOR"]);
    const hold = await HoldService.releaseHold({
      ...params,
      session,
    });
    safeRevalidate("/dashboard/holds");
    safeRevalidate("/dashboard/inventory");
    safeRevalidate(`/dashboard/deals/${hold.dealId}`);
    return { success: true as const, hold };
  } catch (error: any) {
    logger.error("[DealAction] releaseHoldAction failed", { error: error?.message });
    return { success: false as const, message: error?.message || "Failed to release hold." };
  }
}

// ─── RESERVATIONS ────────────────────────────────────────────────────────────

export async function convertHoldToReservationAction(input: CreateReservationInput) {
  try {
    const session = await requireAdminSession(["SUPER_ADMIN", "ADMIN"]);
    const reservation = await ReservationService.convertHoldToReservation(input, session);
    safeRevalidate("/dashboard/deals");
    safeRevalidate("/dashboard/reservations");
    safeRevalidate("/dashboard/inventory");
    safeRevalidate(`/dashboard/deals/${input.dealId}`);
    return {
      success: true as const,
      reservationId: reservation._id.toString(),
      reservationNumber: reservation.reservationNumber,
    };
  } catch (error: any) {
    logger.error("[DealAction] convertHoldToReservationAction failed", { error: error?.message });
    return { success: false as const, message: error?.message || "Failed to convert reservation." };
  }
}

export async function cancelReservationAction(params: { reservationId: string; reason: string }) {
  try {
    const session = await requireAdminSession(["SUPER_ADMIN", "ADMIN"]);
    const reservation = await ReservationService.cancelReservation({
      ...params,
      session,
    });
    safeRevalidate("/dashboard/reservations");
    safeRevalidate("/dashboard/inventory");
    safeRevalidate(`/dashboard/deals/${reservation.dealId}`);
    return { success: true as const, reservation };
  } catch (error: any) {
    logger.error("[DealAction] cancelReservationAction failed", { error: error?.message });
    return { success: false as const, message: error?.message || "Failed to cancel reservation." };
  }
}

// ─── BOOKINGS ────────────────────────────────────────────────────────────────

export async function confirmBookingAction(input: ConfirmBookingInput) {
  try {
    const session = await requireAdminSession(["SUPER_ADMIN", "ADMIN"]);
    const booking = await BookingService.confirmBooking(input, session);
    safeRevalidate("/dashboard/deals");
    safeRevalidate("/dashboard/bookings");
    safeRevalidate("/dashboard/reservations");
    safeRevalidate("/dashboard/inventory");
    safeRevalidate(`/dashboard/deals/${booking.dealId}`);
    return {
      success: true as const,
      bookingId: booking._id.toString(),
      bookingNumber: booking.bookingNumber,
    };
  } catch (error: any) {
    logger.error("[DealAction] confirmBookingAction failed", { error: error?.message });
    return { success: false as const, message: error?.message || "Failed to confirm booking." };
  }
}

export async function cancelBookingAction(params: {
  bookingId: string;
  reason: string;
  releaseUnitToStatus?: "AVAILABLE" | "UNAVAILABLE" | "BLOCKED";
}) {
  try {
    const session = await requireAdminSession(["SUPER_ADMIN", "ADMIN"]);
    const booking = await BookingService.cancelBooking({
      ...params,
      session,
    });
    safeRevalidate("/dashboard/bookings");
    safeRevalidate("/dashboard/inventory");
    safeRevalidate(`/dashboard/deals/${booking.dealId}`);
    return { success: true as const, booking };
  } catch (error: any) {
    logger.error("[DealAction] cancelBookingAction failed", { error: error?.message });
    return { success: false as const, message: error?.message || "Failed to cancel booking." };
  }
}

// ─── RECONCILIATION ──────────────────────────────────────────────────────────

export async function runDealReconciliationAction() {
  try {
    await requireAdminSession(["SUPER_ADMIN", "ADMIN"]);
    const report = await DealReconciliationService.scanConsistency();
    return { success: true as const, report };
  } catch (error: any) {
    return { success: false as const, message: error?.message || "Failed to run reconciliation." };
  }
}

export async function autoRepairDealAnomaliesAction() {
  try {
    const session = await requireAdminSession(["SUPER_ADMIN"]);
    const result = await DealReconciliationService.autoRepair(session);
    safeRevalidate("/dashboard/deals");
    safeRevalidate("/dashboard/holds");
    safeRevalidate("/dashboard/inventory");
    return { success: true as const, ...result };
  } catch (error: any) {
    return { success: false as const, message: error?.message || "Failed to auto-repair anomalies." };
  }
}

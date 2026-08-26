/**
 * @file booking.service.ts
 * @description Operational booking confirmation, manual verification checklist,
 * safe cancellation, and post-cancellation inventory release management.
 */

import "server-only";
import { Types } from "mongoose";
import { connectToDatabase } from "@/lib/db/mongoose";
import { Booking, IBooking, IBookingRequirements } from "@/models/Booking";
import { Reservation } from "@/models/Reservation";
import { Deal } from "@/models/Deal";
import { InventoryUnit } from "@/models/InventoryUnit";
import { InventoryStatusHistory } from "@/models/InventoryStatusHistory";
import { DealActivity } from "@/models/DealActivity";
import { CustomerKycCase } from "@/models/CustomerKycCase";
import { AdminSession } from "@/lib/auth/session";
import { logAuditEvent } from "@/lib/services/audit.service";
import { BookingSummary } from "@/types/deal";
import { logger } from "@/lib/logger";

export interface ConfirmBookingInput {
  reservationId: string;
  requirements: IBookingRequirements;
  markDealWon?: boolean; // Default true
}

export class BookingService {
  public static generateBookingNumber(): string {
    const randomHex = Math.floor(100000 + Math.random() * 900000);
    return `RDE-BKG-${randomHex}`;
  }

  /**
   * Confirms an operational booking from an active reservation
   */
  public static async confirmBooking(
    input: ConfirmBookingInput,
    session: AdminSession
  ): Promise<IBooking> {
    await connectToDatabase();

    const reservation = await Reservation.findById(input.reservationId);
    if (!reservation) throw new Error("NOT_FOUND: Reservation not found.");

    if (reservation.status !== "ACTIVE") {
      throw new Error(`BAD_REQUEST: Only ACTIVE reservations can be confirmed into a booking.`);
    }

    const deal = await Deal.findById(reservation.dealId);
    if (!deal) throw new Error("NOT_FOUND: Deal not found.");

    // PRD 15: Validate Customer KYC status before confirming booking
    const activeKycCase = await CustomerKycCase.findOne({
      $or: [{ dealId: deal._id }, { reservationId: reservation._id }],
    });

    if (activeKycCase && activeKycCase.blockingBookingConfirmation && activeKycCase.status !== "COMPLETED") {
      throw new Error(
        `KYC_INCOMPLETE: Customer KYC Case ${activeKycCase.kycCaseNumber} is currently in status "${activeKycCase.status}" (${activeKycCase.satisfiedRequirementsCount}/${activeKycCase.totalRequirementsCount} requirements completed). Mandatory KYC must be completed or overridden prior to booking confirmation.`
      );
    }

    // Check existing confirmed booking for unit
    const existingConfirmedBooking = await Booking.findOne({
      unitId: reservation.unitId,
      status: "CONFIRMED",
    });

    if (existingConfirmedBooking) {
      throw new Error(
        `CONFLICT: Unit is already booked under booking ${existingConfirmedBooking.bookingNumber}.`
      );
    }

    // Atomically transition unit: RESERVED -> BOOKED or SOLD
    const unit = await InventoryUnit.findOneAndUpdate(
      {
        _id: reservation.unitId,
        status: { $in: ["RESERVED", "ON_HOLD", "AVAILABLE"] },
      },
      {
        $set: { status: "SOLD" },
        $inc: { version: 1 },
      },
      { new: true }
    );

    if (!unit) {
      throw new Error("CONFLICT: Unit could not be locked for confirmed booking.");
    }

    const bookingNumber = this.generateBookingNumber();

    const booking = await Booking.create({
      bookingNumber,
      dealId: deal._id,
      leadId: deal.leadId,
      propertyId: deal.propertyId,
      unitId: unit._id,
      reservationId: reservation._id,
      offerId: reservation.offerId,
      finalAmountPaise: reservation.finalAmountPaise,
      currency: "INR",
      status: "CONFIRMED",
      requirementsChecklist: input.requirements,
      confirmedBy: session.user.id,
      confirmedByName: session.user.name,
      confirmedAt: new Date(),
      version: 1,
    });

    // Mark reservation as CONVERTED_TO_BOOKING
    reservation.status = "CONVERTED_TO_BOOKING";
    await reservation.save();

    // Update deal
    deal.bookingId = booking._id;
    const finalStage = input.markDealWon !== false ? "WON" : "BOOKED";
    deal.status = finalStage;
    deal.pipelineStage = finalStage;
    if (finalStage === "WON") {
      deal.closedAt = new Date();
    }
    deal.version += 1;
    await deal.save();

    // Record InventoryStatusHistory
    await InventoryStatusHistory.create({
      unitId: unit._id,
      propertyId: deal.propertyId,
      fromStatus: "RESERVED",
      toStatus: "SOLD",
      reasonCode: "BOOKING_CONFIRMED",
      sanitizedComment: `Booking ${booking.bookingNumber} confirmed for deal ${deal.dealNumber}`,
      source: "MANUAL_DASHBOARD",
      changedBy: session.user.id,
      changedByName: session.user.name,
      changedByRole: session.user.role,
      relatedEntityId: booking._id.toString(),
      unitVersion: unit.version,
      changedAt: new Date(),
    });

    // Record DealActivity
    await DealActivity.create({
      dealId: deal._id,
      leadId: deal.leadId,
      propertyId: deal.propertyId,
      unitId: unit._id,
      activityType: "BOOKING_CONFIRMED",
      fromStatus: "RESERVED",
      toStatus: finalStage,
      actorId: session.user.id,
      actorName: session.user.name,
      actorRole: session.user.role,
      summary: `Booking ${booking.bookingNumber} formally confirmed for unit ${unit.unitNumber}. Deal closed as ${finalStage}.`,
      relatedEntityType: "BOOKING",
      relatedEntityId: booking._id.toString(),
      dealVersion: deal.version,
    });

    await logAuditEvent({
      actor: session.user,
      action: "BOOKING_CONFIRMED",
      targetPropertyId: deal.propertyId.toString(),
      reason: `Confirmed booking ${booking.bookingNumber} on unit ${unit.unitNumber}.`,
    });

    return booking;
  }

  /**
   * Cancels a confirmed booking with authorized release policy
   */
  public static async cancelBooking(params: {
    bookingId: string;
    reason: string;
    releaseUnitToStatus?: "AVAILABLE" | "UNAVAILABLE" | "BLOCKED";
    session: AdminSession;
  }): Promise<IBooking> {
    await connectToDatabase();

    const isAuthorized = ["SUPER_ADMIN", "ADMIN"].includes(params.session.user.role);
    if (!isAuthorized) {
      throw new Error("FORBIDDEN: Only Super Admins and Admins can authorize booking cancellations.");
    }

    const booking = await Booking.findById(params.bookingId);
    if (!booking) throw new Error("NOT_FOUND: Booking not found.");

    if (booking.status !== "CONFIRMED") {
      throw new Error(`BAD_REQUEST: Booking is not currently confirmed.`);
    }

    booking.status = "CANCELLED";
    booking.cancellationReason = params.reason.trim();
    booking.cancelledBy = params.session.user.id;
    booking.cancelledAt = new Date();
    await booking.save();

    // Release unit to requested post-cancellation status
    const targetStatus = params.releaseUnitToStatus || "UNAVAILABLE";
    const unit = await InventoryUnit.findOneAndUpdate(
      { _id: booking.unitId },
      { status: targetStatus, $inc: { version: 1 } },
      { new: true }
    );

    if (unit) {
      await InventoryStatusHistory.create({
        unitId: unit._id,
        propertyId: booking.propertyId,
        fromStatus: "SOLD",
        toStatus: targetStatus,
        reasonCode: "BOOKING_CANCELLED",
        sanitizedComment: `Booking ${booking.bookingNumber} cancelled: ${params.reason.trim()}`,
        source: "MANUAL_DASHBOARD",
        changedBy: params.session.user.id,
        changedByName: params.session.user.name,
        changedByRole: params.session.user.role,
        unitVersion: unit.version,
        changedAt: new Date(),
      });
    }

    const deal = await Deal.findById(booking.dealId);
    if (deal) {
      deal.status = "CANCELLED";
      deal.pipelineStage = "CANCELLED";
      deal.cancellationReason = params.reason.trim();
      deal.closedAt = new Date();
      deal.version += 1;
      await deal.save();

      await DealActivity.create({
        dealId: deal._id,
        leadId: deal.leadId,
        propertyId: deal.propertyId,
        unitId: deal.unitId,
        activityType: "BOOKING_CANCELLED",
        actorId: params.session.user.id,
        actorName: params.session.user.name,
        actorRole: params.session.user.role,
        summary: `Booking ${booking.bookingNumber} cancelled: ${params.reason.trim()}. Unit status set to ${targetStatus}.`,
        relatedEntityType: "BOOKING",
        relatedEntityId: booking._id.toString(),
        dealVersion: deal.version,
      });
    }

    await logAuditEvent({
      actor: params.session.user,
      action: "BOOKING_CANCELLED",
      reason: `Cancelled booking ${booking.bookingNumber}.`,
    });

    return booking;
  }

  /**
   * Lists bookings with pagination and filters
   */
  public static async listBookings(params: {
    status?: string;
    dealId?: string;
    propertyId?: string;
    page?: number;
    perPage?: number;
  }): Promise<{ bookings: BookingSummary[]; total: number }> {
    await connectToDatabase();

    const query: Record<string, any> = {};
    if (params.status && params.status !== "ALL") query.status = params.status;
    if (params.dealId) query.dealId = new Types.ObjectId(params.dealId);
    if (params.propertyId) query.propertyId = new Types.ObjectId(params.propertyId);

    const page = Math.max(1, params.page || 1);
    const perPage = Math.min(100, Math.max(1, params.perPage || 20));
    const skip = (page - 1) * perPage;

    const [bookings, total] = await Promise.all([
      Booking.find(query)
        .populate("unitId", "unitNumber referenceCode")
        .populate("propertyId", "title")
        .populate("dealId", "dealNumber")
        .populate("leadId", "fullName")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(perPage)
        .lean(),
      Booking.countDocuments(query),
    ]);

    const summaries: BookingSummary[] = (bookings as any[]).map((b) => ({
      _id: b._id.toString(),
      bookingNumber: b.bookingNumber,
      dealId: b.dealId?._id?.toString() || b.dealId?.toString(),
      dealNumber: b.dealId?.dealNumber,
      leadId: b.leadId?._id?.toString() || b.leadId?.toString(),
      leadName: b.leadId?.fullName,
      propertyId: b.propertyId?._id?.toString() || b.propertyId?.toString(),
      propertyName: b.propertyId?.title,
      unitId: b.unitId?._id?.toString() || b.unitId?.toString(),
      unitNumber: b.unitId?.unitNumber,
      unitReferenceCode: b.unitId?.referenceCode,
      reservationId: b.reservationId?.toString(),
      offerId: b.offerId?.toString(),
      finalAmountPaise: b.finalAmountPaise,
      finalAmountRupees: Math.round(b.finalAmountPaise / 100),
      status: b.status,
      requirementsChecklist: b.requirementsChecklist || {
        identityProofVerified: false,
        addressProofVerified: false,
        bookingFormSigned: false,
        downPaymentTermsAccepted: false,
      },
      confirmedBy: b.confirmedBy,
      confirmedByName: b.confirmedByName,
      confirmedAt: b.confirmedAt ? b.confirmedAt.toISOString() : undefined,
      cancellationReason: b.cancellationReason,
      cancelledAt: b.cancelledAt ? b.cancelledAt.toISOString() : undefined,
      version: b.version,
      createdAt: b.createdAt.toISOString(),
    }));

    return { bookings: summaries, total };
  }
}

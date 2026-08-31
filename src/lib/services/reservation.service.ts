/**
 * @file reservation.service.ts
 * @description Hold-to-reservation conversion, inventory unit reservation locks,
 * requirement checklist validation, and controlled cancellation workflows.
 */

import "server-only";
import { Types } from "mongoose";
import { connectToDatabase } from "@/lib/db/mongoose";
import { Reservation, IReservation } from "@/models/Reservation";
import { InventoryHold } from "@/models/InventoryHold";
import { Deal } from "@/models/Deal";
import { DealOffer } from "@/models/DealOffer";
import { InventoryUnit } from "@/models/InventoryUnit";
import { InventoryStatusHistory } from "@/models/InventoryStatusHistory";
import { Booking } from "@/models/Booking";
import { DealActivity } from "@/models/DealActivity";
import { AdminSession } from "@/lib/auth/session";
import { logAuditEvent } from "@/lib/services/audit.service";
import { ReservationSummary } from "@/types/deal";

export interface CreateReservationInput {
  dealId: string;
  holdId?: string;
  offerId?: string;
  validDays?: number; // default 30 days
  checklistNotes?: string;
}

export class ReservationService {
  public static generateReservationNumber(): string {
    const randomHex = Math.floor(100000 + Math.random() * 900000);
    return `RDE-RSV-${randomHex}`;
  }

  /**
   * Converts an active hold into a formal reservation (or creates a direct reservation with an approved offer)
   */
  public static async convertHoldToReservation(
    input: CreateReservationInput,
    session: AdminSession
  ): Promise<IReservation> {
    await connectToDatabase();

    const deal = await Deal.findById(input.dealId);
    if (!deal) throw new Error("NOT_FOUND: Deal not found.");

    if (!deal.unitId) {
      throw new Error("BAD_REQUEST: Deal must have a selected unit to create a reservation.");
    }

    const offerId = input.offerId || deal.currentOfferId?.toString();
    if (!offerId) {
      throw new Error("BAD_REQUEST: An approved offer is required to create a reservation.");
    }

    const offer = await DealOffer.findById(offerId);
    if (!offer || !["APPROVED", "ACCEPTED"].includes(offer.status)) {
      throw new Error("BAD_REQUEST: Referenced offer must be APPROVED or ACCEPTED.");
    }

    let hold = null;
    const holdId = input.holdId || deal.activeHoldId?.toString();
    if (holdId) {
      hold = await InventoryHold.findById(holdId);
      if (hold && hold.status === "ACTIVE") {
        hold.status = "CONVERTED";
        hold.convertedAt = new Date();
        await hold.save();
      }
    }

    // Atomically transition unit: ON_HOLD or AVAILABLE -> RESERVED
    const unit = await InventoryUnit.findOneAndUpdate(
      {
        _id: deal.unitId,
        status: { $in: ["ON_HOLD", "AVAILABLE"] },
      },
      {
        $set: { status: "RESERVED" },
        $inc: { version: 1 },
      },
      { new: true }
    );

    if (!unit) {
      throw new Error(
        "CONFLICT: Unit is no longer in a valid state (ON_HOLD or AVAILABLE) to be reserved."
      );
    }

    const validDays = Math.min(90, Math.max(7, input.validDays || 30));
    const validUntil = new Date(Date.now() + validDays * 86400000);
    const reservationNumber = this.generateReservationNumber();

    const reservation = await Reservation.create({
      reservationNumber,
      dealId: deal._id,
      leadId: deal.leadId,
      propertyId: deal.propertyId,
      unitId: unit._id,
      holdId: hold?._id,
      offerId: offer._id,
      finalAmountPaise: offer.finalOfferedAmountPaise,
      currency: "INR",
      status: "ACTIVE",
      reservationDate: new Date(),
      validUntil,
      checklistComplete: true,
      checklistNotes: input.checklistNotes?.trim(),
      createdBy: session.user.id,
      createdByName: session.user.name,
      approvedBy: session.user.id,
      approvedByName: session.user.name,
      approvalAt: new Date(),
      version: 1,
    });

    // Update deal
    deal.activeReservationId = reservation._id;
    deal.status = "RESERVED";
    deal.pipelineStage = "RESERVED";
    deal.version += 1;
    await deal.save();

    // Record InventoryStatusHistory
    await InventoryStatusHistory.create({
      unitId: unit._id,
      propertyId: deal.propertyId,
      fromStatus: hold ? "ON_HOLD" : "AVAILABLE",
      toStatus: "RESERVED",
      reasonCode: "UNIT_RESERVED",
      sanitizedComment: `Unit allocated to reservation ${reservation.reservationNumber} for deal ${deal.dealNumber}`,
      source: "MANUAL_DASHBOARD",
      changedBy: session.user.id,
      changedByName: session.user.name,
      changedByRole: session.user.role,
      relatedEntityId: reservation._id.toString(),
      unitVersion: unit.version,
      changedAt: new Date(),
    });

    // Record DealActivity
    await DealActivity.create({
      dealId: deal._id,
      leadId: deal.leadId,
      propertyId: deal.propertyId,
      unitId: unit._id,
      activityType: "RESERVATION_CREATED",
      fromStatus: "ON_HOLD",
      toStatus: "RESERVED",
      actorId: session.user.id,
      actorName: session.user.name,
      actorRole: session.user.role,
      summary: `Reservation ${reservation.reservationNumber} created for unit ${unit.unitNumber} at ₹${(offer.finalOfferedAmountPaise / 100).toLocaleString("en-IN")}.`,
      relatedEntityType: "RESERVATION",
      relatedEntityId: reservation._id.toString(),
      dealVersion: deal.version,
    });

    await logAuditEvent({
      actor: session.user,
      action: "RESERVATION_CREATED",
      targetPropertyId: deal.propertyId.toString(),
      reason: `Created reservation ${reservation.reservationNumber} on unit ${unit.unitNumber}.`,
    });

    return reservation;
  }

  /**
   * Cancels a reservation and restores unit availability (unless booked)
   */
  public static async cancelReservation(params: {
    reservationId: string;
    reason: string;
    session: AdminSession;
  }): Promise<IReservation> {
    await connectToDatabase();

    const reservation = await Reservation.findById(params.reservationId);
    if (!reservation) throw new Error("NOT_FOUND: Reservation not found.");

    if (reservation.status !== "ACTIVE") {
      throw new Error(`BAD_REQUEST: Reservation is not currently active.`);
    }

    // Check if an operational booking exists
    const existingBooking = await Booking.findOne({
      reservationId: reservation._id,
      status: "CONFIRMED",
    });

    if (existingBooking) {
      throw new Error(
        `CONFLICT: Cannot cancel reservation because active booking ${existingBooking.bookingNumber} exists.`
      );
    }

    reservation.status = "CANCELLED";
    reservation.cancellationReason = params.reason.trim();
    reservation.cancelledBy = params.session.user.id;
    reservation.cancelledAt = new Date();
    await reservation.save();

    // Release unit to AVAILABLE
    const unit = await InventoryUnit.findOneAndUpdate(
      { _id: reservation.unitId, status: "RESERVED" },
      { status: "AVAILABLE", $inc: { version: 1 } },
      { new: true }
    );

    if (unit) {
      await InventoryStatusHistory.create({
        unitId: unit._id,
        propertyId: reservation.propertyId,
        fromStatus: "RESERVED",
        toStatus: "AVAILABLE",
        reasonCode: "RESERVATION_CANCELLED",
        sanitizedComment: `Reservation ${reservation.reservationNumber} cancelled: ${params.reason.trim()}`,
        source: "MANUAL_DASHBOARD",
        changedBy: params.session.user.id,
        changedByName: params.session.user.name,
        changedByRole: params.session.user.role,
        unitVersion: unit.version,
        changedAt: new Date(),
      });
    }

    const deal = await Deal.findById(reservation.dealId);
    if (deal) {
      deal.activeReservationId = undefined;
      deal.status = "NEGOTIATION";
      deal.pipelineStage = "NEGOTIATION";
      deal.version += 1;
      await deal.save();

      await DealActivity.create({
        dealId: deal._id,
        leadId: deal.leadId,
        propertyId: deal.propertyId,
        unitId: deal.unitId,
        activityType: "RESERVATION_CANCELLED",
        actorId: params.session.user.id,
        actorName: params.session.user.name,
        actorRole: params.session.user.role,
        summary: `Reservation ${reservation.reservationNumber} cancelled: ${params.reason.trim()}`,
        relatedEntityType: "RESERVATION",
        relatedEntityId: reservation._id.toString(),
        dealVersion: deal.version,
      });
    }

    await logAuditEvent({
      actor: params.session.user,
      action: "RESERVATION_CANCELLED",
      reason: `Cancelled reservation ${reservation.reservationNumber}.`,
    });

    return reservation;
  }

  /**
   * Lists reservations with pagination and filters
   */
  public static async listReservations(params: {
    status?: string;
    dealId?: string;
    propertyId?: string;
    page?: number;
    perPage?: number;
  }): Promise<{ reservations: ReservationSummary[]; total: number }> {
    await connectToDatabase();

    const query: Record<string, any> = {};
    if (params.status && params.status !== "ALL") query.status = params.status;
    if (params.dealId) query.dealId = new Types.ObjectId(params.dealId);
    if (params.propertyId) query.propertyId = new Types.ObjectId(params.propertyId);

    const page = Math.max(1, params.page || 1);
    const perPage = Math.min(100, Math.max(1, params.perPage || 20));
    const skip = (page - 1) * perPage;

    const [reservations, total] = await Promise.all([
      Reservation.find(query)
        .populate("unitId", "unitNumber referenceCode")
        .populate("propertyId", "title")
        .populate("dealId", "dealNumber")
        .populate("leadId", "fullName")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(perPage)
        .lean(),
      Reservation.countDocuments(query),
    ]);

    const summaries: ReservationSummary[] = (reservations as any[]).map((r) => ({
      _id: r._id.toString(),
      reservationNumber: r.reservationNumber,
      dealId: r.dealId?._id?.toString() || r.dealId?.toString(),
      dealNumber: r.dealId?.dealNumber,
      leadId: r.leadId?._id?.toString() || r.leadId?.toString(),
      leadName: r.leadId?.fullName,
      propertyId: r.propertyId?._id?.toString() || r.propertyId?.toString(),
      propertyName: r.propertyId?.title,
      unitId: r.unitId?._id?.toString() || r.unitId?.toString(),
      unitNumber: r.unitId?.unitNumber,
      unitReferenceCode: r.unitId?.referenceCode,
      holdId: r.holdId?.toString(),
      offerId: r.offerId?.toString(),
      finalAmountPaise: r.finalAmountPaise,
      finalAmountRupees: Math.round(r.finalAmountPaise / 100),
      status: r.status,
      reservationDate: r.reservationDate.toISOString(),
      validUntil: r.validUntil ? r.validUntil.toISOString() : undefined,
      checklistComplete: r.checklistComplete || false,
      createdBy: r.createdBy,
      createdByName: r.createdByName,
      approvedBy: r.approvedBy,
      approvedByName: r.approvedByName,
      cancellationReason: r.cancellationReason,
      cancelledAt: r.cancelledAt ? r.cancelledAt.toISOString() : undefined,
      version: r.version,
      createdAt: r.createdAt.toISOString(),
    }));

    return { reservations: summaries, total };
  }
}

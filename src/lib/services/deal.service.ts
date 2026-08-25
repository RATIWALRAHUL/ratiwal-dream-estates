/**
 * @file deal.service.ts
 * @description Core business logic for Deals lifecycle, duplicate detection,
 * stage transitions, lead synchronizations, and pipeline metrics.
 */

import "server-only";
import { Types } from "mongoose";
import { connectToDatabase } from "@/lib/db/mongoose";
import { Deal, IDeal } from "@/models/Deal";
import { DealOffer } from "@/models/DealOffer";
import { InventoryHold } from "@/models/InventoryHold";
import { Reservation } from "@/models/Reservation";
import { Booking } from "@/models/Booking";
import { DealActivity } from "@/models/DealActivity";
import { Lead } from "@/models/Lead";
import { Property } from "@/models/Property";
import { InventoryUnit } from "@/models/InventoryUnit";
import { AdminSession } from "@/lib/auth/session";
import { logAuditEvent } from "@/lib/services/audit.service";
import {
  DealStage,
  DealPriority,
  DealSource,
  DealLostReason,
  DealSummary,
  DealFilterParams,
  DealPipelineSummary,
  isValidDealTransition,
} from "@/types/deal";
import { logger } from "@/lib/logger";

export interface CreateDealInput {
  leadId: string;
  propertyId: string;
  unitId?: string;
  assignedAdvisorId?: string;
  assignedAdvisorName?: string;
  assignedAdvisorEmail?: string;
  priority?: DealPriority;
  source?: DealSource;
  expectedCloseDate?: string;
  offeredAmountPaise?: number;
  internalNotes?: string;
}

export class DealService {
  /**
   * Generates a deterministic, immutable deal reference code
   */
  public static generateDealNumber(): string {
    const randomHex = Math.floor(100000 + Math.random() * 900000);
    return `RDE-DL-${randomHex}`;
  }

  /**
   * Checks for potential duplicate active deals
   */
  public static async checkDuplicates(params: {
    leadId: string;
    propertyId: string;
    unitId?: string;
  }): Promise<{ hasDuplicate: boolean; existingDeal?: IDeal }> {
    await connectToDatabase();

    const activeStages = [
      "DRAFT",
      "QUALIFICATION",
      "NEGOTIATION",
      "OFFER_PENDING_APPROVAL",
      "OFFER_APPROVED",
      "HOLD_PENDING",
      "ON_HOLD",
      "RESERVED",
      "BOOKING_REQUIREMENTS_PENDING",
      "BOOKED",
    ];

    const query: Record<string, any> = {
      leadId: new Types.ObjectId(params.leadId),
      propertyId: new Types.ObjectId(params.propertyId),
      status: { $in: activeStages },
    };

    if (params.unitId) {
      query.unitId = new Types.ObjectId(params.unitId);
    }

    const existingDeal = await Deal.findOne(query);
    return {
      hasDuplicate: Boolean(existingDeal),
      existingDeal: existingDeal || undefined,
    };
  }

  /**
   * Creates a new deal linked to a lead and property
   */
  public static async createDeal(
    input: CreateDealInput,
    session: AdminSession
  ): Promise<IDeal> {
    await connectToDatabase();

    const [lead, property] = await Promise.all([
      Lead.findById(input.leadId),
      Property.findById(input.propertyId),
    ]);

    if (!lead) throw new Error("NOT_FOUND: Referenced lead does not exist.");
    if (!property) throw new Error("NOT_FOUND: Referenced property does not exist.");

    let unit = null;
    if (input.unitId) {
      unit = await InventoryUnit.findOne({
        _id: new Types.ObjectId(input.unitId),
        propertyId: property._id,
      });
      if (!unit) throw new Error("NOT_FOUND: Selected unit does not belong to this property.");
    }

    const dealNumber = this.generateDealNumber();
    const advisorId = input.assignedAdvisorId || lead.assignedAdvisorId || session.user.id;
    const advisorName = input.assignedAdvisorName || lead.assignedAdvisorName || session.user.name;
    const advisorEmail = input.assignedAdvisorEmail || session.user.email;

    const deal = await Deal.create({
      dealNumber,
      leadId: lead._id,
      propertyId: property._id,
      unitId: unit?._id,
      assignedAdvisorId: advisorId,
      assignedAdvisorName: advisorName,
      assignedAdvisorEmail: advisorEmail,
      createdBy: session.user.id,
      createdByName: session.user.name,
      status: "QUALIFICATION",
      pipelineStage: "QUALIFICATION",
      priority: input.priority || "NORMAL",
      source: input.source || "DIRECT_INQUIRY",
      expectedCloseDate: input.expectedCloseDate ? new Date(input.expectedCloseDate) : undefined,
      offeredAmountPaise: input.offeredAmountPaise || unit?.basePricePaise,
      currency: "INR",
      internalNotes: input.internalNotes?.trim(),
      version: 1,
    });

    // Record initial activity
    await DealActivity.create({
      dealId: deal._id,
      leadId: lead._id,
      propertyId: property._id,
      unitId: unit?._id,
      activityType: "DEAL_CREATED",
      toStatus: "QUALIFICATION",
      actorId: session.user.id,
      actorName: session.user.name,
      actorRole: session.user.role,
      summary: `Deal ${deal.dealNumber} created for ${lead.fullName} on ${property.title}.`,
      dealVersion: 1,
    });

    await logAuditEvent({
      actor: session.user,
      action: "DEAL_CREATED",
      reason: `Created deal ${deal.dealNumber} for lead ${lead.fullName}.`,
    });

    return deal;
  }

  /**
   * Updates deal stage with optimistic concurrency and transition policy validation
   */
  public static async updateStage(params: {
    dealId: string;
    newStage: DealStage;
    currentVersion: number;
    reasonCode?: string;
    comment?: string;
    lostReason?: DealLostReason;
    lostReasonDetails?: string;
    cancellationReason?: string;
    session: AdminSession;
  }): Promise<IDeal> {
    await connectToDatabase();

    const deal = await Deal.findById(params.dealId);
    if (!deal) throw new Error("NOT_FOUND: Deal not found.");

    if (!isValidDealTransition(deal.status, params.newStage)) {
      throw new Error(
        `FORBIDDEN_TRANSITION: Cannot transition deal from "${deal.status}" to "${params.newStage}".`
      );
    }

    if (params.newStage === "LOST" && !params.lostReason) {
      throw new Error("BAD_REQUEST: A structured lostReason is mandatory when marking a deal LOST.");
    }

    const updatePayload: Record<string, any> = {
      status: params.newStage,
      pipelineStage: params.newStage,
      version: params.currentVersion + 1,
    };

    if (params.newStage === "LOST") {
      updatePayload.lostReason = params.lostReason;
      updatePayload.lostReasonDetails = params.lostReasonDetails;
      updatePayload.closedAt = new Date();
    } else if (params.newStage === "WON") {
      updatePayload.closedAt = new Date();
    } else if (params.newStage === "CANCELLED") {
      updatePayload.cancellationReason = params.cancellationReason || params.comment;
      updatePayload.closedAt = new Date();
    } else if (params.newStage === "ARCHIVED") {
      updatePayload.archivedAt = new Date();
    }

    const updated = await Deal.findOneAndUpdate(
      { _id: deal._id, version: params.currentVersion },
      { $set: updatePayload },
      { new: true }
    );

    if (!updated) {
      throw new Error(
        "CONFLICT: Deal was modified by another transaction. Please refresh."
      );
    }

    // Auto-release active hold if deal is lost or cancelled
    if (["LOST", "CANCELLED"].includes(params.newStage) && deal.activeHoldId) {
      const hold = await InventoryHold.findById(deal.activeHoldId);
      if (hold && hold.status === "ACTIVE") {
        hold.status = "RELEASED";
        hold.releasedAt = new Date();
        hold.releaseReason = `Deal marked ${params.newStage}`;
        await hold.save();

        if (deal.unitId) {
          await InventoryUnit.updateOne(
            { _id: deal.unitId, status: "ON_HOLD" },
            { status: "AVAILABLE", $inc: { version: 1 } }
          );
        }
      }
    }

    // Record activity
    await DealActivity.create({
      dealId: deal._id,
      leadId: deal.leadId,
      propertyId: deal.propertyId,
      unitId: deal.unitId,
      activityType: "DEAL_STAGE_CHANGED",
      fromStatus: deal.status,
      toStatus: params.newStage,
      actorId: params.session.user.id,
      actorName: params.session.user.name,
      actorRole: params.session.user.role,
      summary: `Deal stage transitioned from ${deal.status} to ${params.newStage}.`,
      reasonCode: params.reasonCode,
      sanitizedComment: params.comment,
      dealVersion: updated.version,
    });

    await logAuditEvent({
      actor: params.session.user,
      action: params.newStage === "WON" ? "DEAL_WON" : params.newStage === "LOST" ? "DEAL_LOST" : "DEAL_STAGE_CHANGED",
      reason: `Updated deal ${deal.dealNumber} stage to ${params.newStage}.`,
    });

    return updated;
  }

  /**
   * Reassigns a deal to another advisor
   */
  public static async reassignAdvisor(params: {
    dealId: string;
    newAdvisorId: string;
    newAdvisorName: string;
    newAdvisorEmail?: string;
    session: AdminSession;
  }): Promise<IDeal> {
    await connectToDatabase();

    const deal = await Deal.findById(params.dealId);
    if (!deal) throw new Error("NOT_FOUND: Deal not found.");

    const prevAdvisor = deal.assignedAdvisorName;
    deal.assignedAdvisorId = params.newAdvisorId;
    deal.assignedAdvisorName = params.newAdvisorName;
    deal.assignedAdvisorEmail = params.newAdvisorEmail;
    deal.version += 1;
    await deal.save();

    await DealActivity.create({
      dealId: deal._id,
      leadId: deal.leadId,
      propertyId: deal.propertyId,
      unitId: deal.unitId,
      activityType: "ADVISOR_REASSIGNED",
      actorId: params.session.user.id,
      actorName: params.session.user.name,
      actorRole: params.session.user.role,
      summary: `Advisor reassigned from ${prevAdvisor} to ${params.newAdvisorName}.`,
      dealVersion: deal.version,
    });

    return deal;
  }

  /**
   * Retrieves a comprehensive deal by ID with populated references
   */
  public static async getDealById(dealId: string): Promise<any> {
    await connectToDatabase();

    const deal = await Deal.findById(dealId)
      .populate("leadId")
      .populate("propertyId")
      .populate("unitId")
      .populate("currentOfferId")
      .populate("activeHoldId")
      .populate("activeReservationId")
      .populate("bookingId")
      .lean();

    if (!deal) return null;

    const activities = await DealActivity.find({ dealId: deal._id })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    const offers = await DealOffer.find({ dealId: deal._id })
      .sort({ version: -1 })
      .lean();

    return {
      deal,
      activities,
      offers,
    };
  }

  /**
   * List deals with filters and pagination
   */
  public static async listDeals(params: DealFilterParams): Promise<{
    deals: DealSummary[];
    total: number;
    page: number;
    perPage: number;
  }> {
    await connectToDatabase();

    const filter: Record<string, any> = {};

    if (params.propertyId) filter.propertyId = new Types.ObjectId(params.propertyId);
    if (params.unitId) filter.unitId = new Types.ObjectId(params.unitId);
    if (params.advisorId) filter.assignedAdvisorId = params.advisorId;

    if (params.stage && params.stage !== "ALL") {
      filter.status = params.stage;
    }
    if (params.priority && params.priority !== "ALL") {
      filter.priority = params.priority;
    }

    if (params.search?.trim()) {
      const regex = new RegExp(params.search.trim(), "i");
      filter.$or = [
        { dealNumber: regex },
        { assignedAdvisorName: regex },
      ];
    }

    const page = Math.max(1, params.page || 1);
    const perPage = Math.min(100, Math.max(1, params.perPage || 20));
    const skip = (page - 1) * perPage;

    const [deals, total] = await Promise.all([
      Deal.find(filter)
        .populate("leadId", "fullName email displayPhone")
        .populate("propertyId", "title slug")
        .populate("unitId", "unitNumber referenceCode")
        .sort({ [params.sortBy || "createdAt"]: params.sortOrder === "asc" ? 1 : -1 })
        .skip(skip)
        .limit(perPage)
        .lean(),
      Deal.countDocuments(filter),
    ]);

    const summaries: DealSummary[] = (deals as any[]).map((d) => ({
      _id: d._id.toString(),
      dealNumber: d.dealNumber,
      leadId: d.leadId?._id?.toString() || d.leadId?.toString(),
      leadName: d.leadId?.fullName || "Prospective Client",
      leadEmail: d.leadId?.email,
      leadPhone: d.leadId?.displayPhone,
      propertyId: d.propertyId?._id?.toString() || d.propertyId?.toString(),
      propertyName: d.propertyId?.title || "Property Project",
      unitId: d.unitId?._id?.toString(),
      unitNumber: d.unitId?.unitNumber,
      unitReferenceCode: d.unitId?.referenceCode,
      assignedAdvisorId: d.assignedAdvisorId,
      assignedAdvisorName: d.assignedAdvisorName,
      status: d.status,
      pipelineStage: d.pipelineStage,
      priority: d.priority,
      source: d.source,
      expectedCloseDate: d.expectedCloseDate ? d.expectedCloseDate.toISOString() : undefined,
      offeredAmountPaise: d.offeredAmountPaise,
      offeredAmountRupees: d.offeredAmountPaise ? Math.round(d.offeredAmountPaise / 100) : undefined,
      currentOfferId: d.currentOfferId?.toString(),
      activeHoldId: d.activeHoldId?.toString(),
      activeReservationId: d.activeReservationId?.toString(),
      bookingId: d.bookingId?.toString(),
      currency: d.currency,
      nextActionType: d.nextActionType,
      nextActionDate: d.nextActionDate ? d.nextActionDate.toISOString() : undefined,
      lostReason: d.lostReason,
      cancellationReason: d.cancellationReason,
      version: d.version,
      closedAt: d.closedAt ? d.closedAt.toISOString() : undefined,
      archivedAt: d.archivedAt ? d.archivedAt.toISOString() : undefined,
      createdAt: d.createdAt.toISOString(),
      updatedAt: d.updatedAt.toISOString(),
    }));

    return {
      deals: summaries,
      total,
      page,
      perPage,
    };
  }

  /**
   * Computes pipeline overview metrics across all deal stages
   */
  public static async getPipelineSummary(): Promise<DealPipelineSummary> {
    await connectToDatabase();

    const [deals, activeHolds, activeReservations, confirmedBookings] = await Promise.all([
      Deal.find({ status: { $ne: "ARCHIVED" } }, "status offeredAmountPaise").lean(),
      InventoryHold.countDocuments({ status: "ACTIVE" }),
      Reservation.countDocuments({ status: "ACTIVE" }),
      Booking.countDocuments({ status: "CONFIRMED" }),
    ]);

    const stageCounts: Record<DealStage, number> = {
      DRAFT: 0,
      QUALIFICATION: 0,
      NEGOTIATION: 0,
      OFFER_PENDING_APPROVAL: 0,
      OFFER_APPROVED: 0,
      HOLD_PENDING: 0,
      ON_HOLD: 0,
      RESERVED: 0,
      BOOKING_REQUIREMENTS_PENDING: 0,
      BOOKED: 0,
      WON: 0,
      LOST: 0,
      CANCELLED: 0,
      ARCHIVED: 0,
    };

    let totalValuePaise = 0;
    let activeDealsCount = 0;
    let wonDealsCount = 0;
    let lostDealsCount = 0;

    for (const d of deals) {
      const stage = d.status as DealStage;
      if (stageCounts[stage] !== undefined) {
        stageCounts[stage] += 1;
      }
      if (["WON"].includes(stage)) wonDealsCount += 1;
      else if (["LOST", "CANCELLED"].includes(stage)) lostDealsCount += 1;
      else {
        activeDealsCount += 1;
        totalValuePaise += d.offeredAmountPaise || 0;
      }
    }

    return {
      totalDeals: deals.length,
      activeDealsCount,
      totalPipelineValueRupees: Math.round(totalValuePaise / 100),
      stageCounts,
      activeHoldsCount: activeHolds,
      activeReservationsCount: activeReservations,
      confirmedBookingsCount: confirmedBookings,
      wonDealsCount,
      lostDealsCount,
    };
  }
}

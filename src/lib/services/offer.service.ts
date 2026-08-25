/**
 * @file offer.service.ts
 * @description Versioned pricing proposals, commercial discount validation,
 * approval threshold evaluation, and customer acceptance workflows.
 */

import "server-only";
import { Types } from "mongoose";
import { connectToDatabase } from "@/lib/db/mongoose";
import { DealOffer, IDealOffer } from "@/models/DealOffer";
import { Deal } from "@/models/Deal";
import { InventoryUnit } from "@/models/InventoryUnit";
import { DealActivity } from "@/models/DealActivity";
import { AdminSession } from "@/lib/auth/session";
import { logAuditEvent } from "@/lib/services/audit.service";
import { OfferStatus, DealOfferSummary } from "@/types/deal";
import { logger } from "@/lib/logger";

export interface CreateOfferInput {
  dealId: string;
  unitId?: string;
  basePricePaise: number;
  ratePerSqFtPaise?: number;
  ratePerSqYdPaise?: number;
  plcChargePaise?: number;
  floorRiseChargePaise?: number;
  parkingChargePaise?: number;
  clubChargePaise?: number;
  maintenanceDepositPaise?: number;
  otherChargesPaise?: number;
  discountAmountPaise?: number;
  discountReason?: string;
  validDays?: number; // default 14 days
  termsAndConditions?: string;
}

export class OfferService {
  public static generateOfferNumber(): string {
    const randomHex = Math.floor(100000 + Math.random() * 900000);
    return `RDE-OFR-${randomHex}`;
  }

  /**
   * Creates a new versioned offer for a deal with discount approval checks
   */
  public static async createOffer(
    input: CreateOfferInput,
    session: AdminSession
  ): Promise<IDealOffer> {
    await connectToDatabase();

    const deal = await Deal.findById(input.dealId);
    if (!deal) throw new Error("NOT_FOUND: Deal not found.");

    if (["WON", "LOST", "CANCELLED", "ARCHIVED"].includes(deal.status)) {
      throw new Error(`BAD_REQUEST: Cannot create an offer for a deal in "${deal.status}" state.`);
    }

    const unitId = input.unitId || (deal.unitId ? deal.unitId.toString() : undefined);

    // Calculate gross charges
    const grossPaise =
      input.basePricePaise +
      (input.plcChargePaise || 0) +
      (input.floorRiseChargePaise || 0) +
      (input.parkingChargePaise || 0) +
      (input.clubChargePaise || 0) +
      (input.maintenanceDepositPaise || 0) +
      (input.otherChargesPaise || 0);

    const discountAmountPaise = Math.max(0, input.discountAmountPaise || 0);
    const finalOfferedAmountPaise = Math.max(0, grossPaise - discountAmountPaise);
    const discountPercentage = grossPaise > 0 ? (discountAmountPaise / grossPaise) * 100 : 0;

    // Standard discount approval policy: Discounts exceeding 5% or ₹2,00,000 (20000000 paise) require elevated approval
    const isSuperAdminOrAdmin = ["SUPER_ADMIN", "ADMIN"].includes(session.user.role);
    const exceedsAdvisorLimit = discountPercentage > 5 || discountAmountPaise > 20000000;
    const approvalRequired = exceedsAdvisorLimit && !isSuperAdminOrAdmin;

    // Fetch highest version for this deal
    const lastOffer = await DealOffer.findOne({ dealId: deal._id }).sort({ version: -1 });
    const version = lastOffer ? lastOffer.version + 1 : 1;

    // Supersede previous offers
    if (lastOffer && ["DRAFT", "PENDING_APPROVAL", "APPROVED"].includes(lastOffer.status)) {
      lastOffer.status = "SUPERSEDED";
      await lastOffer.save();
    }

    const validFrom = new Date();
    const validUntil = new Date(Date.now() + (input.validDays || 14) * 86400000);

    const offer = await DealOffer.create({
      offerNumber: this.generateOfferNumber(),
      dealId: deal._id,
      propertyId: deal.propertyId,
      unitId: unitId ? new Types.ObjectId(unitId) : undefined,
      version,
      currency: "INR",
      basePricePaise: input.basePricePaise,
      ratePerSqFtPaise: input.ratePerSqFtPaise,
      ratePerSqYdPaise: input.ratePerSqYdPaise,
      plcChargePaise: input.plcChargePaise || 0,
      floorRiseChargePaise: input.floorRiseChargePaise || 0,
      parkingChargePaise: input.parkingChargePaise || 0,
      clubChargePaise: input.clubChargePaise || 0,
      maintenanceDepositPaise: input.maintenanceDepositPaise || 0,
      otherChargesPaise: input.otherChargesPaise || 0,
      discountAmountPaise,
      discountPercentage,
      discountReason: input.discountReason?.trim(),
      finalOfferedAmountPaise,
      validFrom,
      validUntil,
      status: approvalRequired ? "PENDING_APPROVAL" : "APPROVED",
      approvalRequired,
      approvalReason: approvalRequired
        ? `Discount of ${discountPercentage.toFixed(1)}% (₹${(discountAmountPaise / 100).toLocaleString("en-IN")}) exceeds standard threshold.`
        : undefined,
      approvalStatus: approvalRequired ? "PENDING" : "NOT_REQUIRED",
      requestedBy: session.user.id,
      requestedByName: session.user.name,
      approvedBy: !approvalRequired && isSuperAdminOrAdmin ? session.user.id : undefined,
      approvedByName: !approvalRequired && isSuperAdminOrAdmin ? session.user.name : undefined,
      approvedAt: !approvalRequired ? new Date() : undefined,
      termsAndConditions: input.termsAndConditions?.trim(),
    });

    // Update Deal current offer & offered amount
    deal.currentOfferId = offer._id;
    deal.offeredAmountPaise = finalOfferedAmountPaise;
    if (unitId && (!deal.unitId || deal.unitId.toString() !== unitId)) {
      deal.unitId = new Types.ObjectId(unitId);
    }
    if (approvalRequired) {
      deal.status = "OFFER_PENDING_APPROVAL";
      deal.pipelineStage = "OFFER_PENDING_APPROVAL";
    } else {
      deal.status = "OFFER_APPROVED";
      deal.pipelineStage = "OFFER_APPROVED";
    }
    deal.version += 1;
    await deal.save();

    // Log activity
    await DealActivity.create({
      dealId: deal._id,
      leadId: deal.leadId,
      propertyId: deal.propertyId,
      unitId: deal.unitId,
      activityType: approvalRequired ? "OFFER_APPROVAL_REQUESTED" : "OFFER_CREATED",
      fromStatus: "NEGOTIATION",
      toStatus: deal.status,
      actorId: session.user.id,
      actorName: session.user.name,
      actorRole: session.user.role,
      summary: approvalRequired
        ? `Offer ${offer.offerNumber} created for ₹${(finalOfferedAmountPaise / 100).toLocaleString("en-IN")}. Pending discount approval.`
        : `Offer ${offer.offerNumber} approved for ₹${(finalOfferedAmountPaise / 100).toLocaleString("en-IN")}.`,
      relatedEntityType: "OFFER",
      relatedEntityId: offer._id.toString(),
      dealVersion: deal.version,
    });

    await logAuditEvent({
      actor: session.user,
      action: approvalRequired ? "OFFER_APPROVAL_REQUESTED" : "OFFER_CREATED",
      reason: `Created offer ${offer.offerNumber} for deal ${deal.dealNumber}.`,
    });

    return offer;
  }

  /**
   * Approves a pending discount offer
   */
  public static async approveOffer(
    offerId: string,
    session: AdminSession
  ): Promise<IDealOffer> {
    await connectToDatabase();

    const offer = await DealOffer.findById(offerId);
    if (!offer) throw new Error("NOT_FOUND: Offer not found.");

    if (offer.status !== "PENDING_APPROVAL") {
      throw new Error(`BAD_REQUEST: Offer is not pending approval (status: ${offer.status}).`);
    }

    offer.status = "APPROVED";
    offer.approvalStatus = "APPROVED";
    offer.approvedBy = session.user.id;
    offer.approvedByName = session.user.name;
    offer.approvedAt = new Date();
    await offer.save();

    const deal = await Deal.findById(offer.dealId);
    if (deal) {
      deal.status = "OFFER_APPROVED";
      deal.pipelineStage = "OFFER_APPROVED";
      deal.version += 1;
      await deal.save();

      await DealActivity.create({
        dealId: deal._id,
        leadId: deal.leadId,
        propertyId: deal.propertyId,
        unitId: deal.unitId,
        activityType: "OFFER_APPROVED",
        actorId: session.user.id,
        actorName: session.user.name,
        actorRole: session.user.role,
        summary: `Discount approval granted by ${session.user.name} for offer ${offer.offerNumber}.`,
        relatedEntityType: "OFFER",
        relatedEntityId: offer._id.toString(),
        dealVersion: deal.version,
      });
    }

    await logAuditEvent({
      actor: session.user,
      action: "OFFER_APPROVED",
      reason: `Approved discount for offer ${offer.offerNumber}.`,
    });

    return offer;
  }

  /**
   * Rejects an offer
   */
  public static async rejectOffer(
    offerId: string,
    reason: string,
    session: AdminSession
  ): Promise<IDealOffer> {
    await connectToDatabase();

    const offer = await DealOffer.findById(offerId);
    if (!offer) throw new Error("NOT_FOUND: Offer not found.");

    offer.status = "REJECTED";
    offer.approvalStatus = "REJECTED";
    offer.rejectionReason = reason.trim();
    await offer.save();

    const deal = await Deal.findById(offer.dealId);
    if (deal) {
      deal.status = "NEGOTIATION";
      deal.pipelineStage = "NEGOTIATION";
      deal.version += 1;
      await deal.save();

      await DealActivity.create({
        dealId: deal._id,
        leadId: deal.leadId,
        propertyId: deal.propertyId,
        unitId: deal.unitId,
        activityType: "OFFER_REJECTED",
        actorId: session.user.id,
        actorName: session.user.name,
        actorRole: session.user.role,
        summary: `Offer ${offer.offerNumber} rejected: ${reason}`,
        relatedEntityType: "OFFER",
        relatedEntityId: offer._id.toString(),
        dealVersion: deal.version,
      });
    }

    return offer;
  }

  /**
   * Records customer acceptance of an approved offer
   */
  public static async acceptOffer(
    offerId: string,
    session: AdminSession
  ): Promise<IDealOffer> {
    await connectToDatabase();

    const offer = await DealOffer.findById(offerId);
    if (!offer) throw new Error("NOT_FOUND: Offer not found.");

    if (offer.status !== "APPROVED") {
      throw new Error(`BAD_REQUEST: Only APPROVED offers can be accepted by the customer.`);
    }

    offer.status = "ACCEPTED";
    offer.customerAcceptanceStatus = "ACCEPTED";
    offer.acceptedAt = new Date();
    await offer.save();

    const deal = await Deal.findById(offer.dealId);
    if (deal) {
      deal.version += 1;
      await deal.save();

      await DealActivity.create({
        dealId: deal._id,
        leadId: deal.leadId,
        propertyId: deal.propertyId,
        unitId: deal.unitId,
        activityType: "OFFER_ACCEPTED",
        actorId: session.user.id,
        actorName: session.user.name,
        actorRole: session.user.role,
        summary: `Customer formally accepted offer ${offer.offerNumber}.`,
        relatedEntityType: "OFFER",
        relatedEntityId: offer._id.toString(),
        dealVersion: deal.version,
      });
    }

    return offer;
  }
}

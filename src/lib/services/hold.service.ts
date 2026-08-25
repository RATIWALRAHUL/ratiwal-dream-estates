/**
 * @file hold.service.ts
 * @description Atomic concurrency-safe inventory hold acquisition, durable
 * expiration worker, extension policies, and safe inventory release.
 */

import "server-only";
import { Types } from "mongoose";
import { connectToDatabase } from "@/lib/db/mongoose";
import { InventoryHold, IInventoryHold } from "@/models/InventoryHold";
import { Deal } from "@/models/Deal";
import { InventoryUnit } from "@/models/InventoryUnit";
import { InventoryStatusHistory } from "@/models/InventoryStatusHistory";
import { DealActivity } from "@/models/DealActivity";
import { AdminSession } from "@/lib/auth/session";
import { logAuditEvent } from "@/lib/services/audit.service";
import { HoldSummary } from "@/types/deal";
import { logger } from "@/lib/logger";

export interface AcquireHoldInput {
  dealId: string;
  unitId: string;
  durationHours?: number; // default 72 hours
  idempotencyKey?: string;
}

export class HoldService {
  public static generateHoldNumber(): string {
    const randomHex = Math.floor(100000 + Math.random() * 900000);
    return `RDE-HLD-${randomHex}`;
  }

  /**
   * Concurrency-safe atomic inventory hold acquisition
   */
  public static async acquireHold(
    input: AcquireHoldInput,
    session: AdminSession
  ): Promise<IInventoryHold> {
    await connectToDatabase();

    const deal = await Deal.findById(input.dealId);
    if (!deal) throw new Error("NOT_FOUND: Deal not found.");

    if (["WON", "LOST", "CANCELLED", "ARCHIVED"].includes(deal.status)) {
      throw new Error(`BAD_REQUEST: Cannot place a hold for a deal in "${deal.status}" state.`);
    }

    const unitId = new Types.ObjectId(input.unitId);

    // 1. Check if an active hold already exists for this unit
    const existingActiveHold = await InventoryHold.findOne({
      unitId,
      status: "ACTIVE",
      expiresAt: { $gt: new Date() },
    });

    if (existingActiveHold) {
      throw new Error(
        `CONFLICT: Unit is already held under hold ${existingActiveHold.holdNumber}.`
      );
    }

    // 2. Atomic conditional lock on InventoryUnit (AVAILABLE -> ON_HOLD)
    const lockedUnit = await InventoryUnit.findOneAndUpdate(
      {
        _id: unitId,
        status: "AVAILABLE",
      },
      {
        $set: { status: "ON_HOLD" },
        $inc: { version: 1 },
      },
      { new: true }
    );

    if (!lockedUnit) {
      throw new Error(
        "CONFLICT: Unit is no longer available or was concurrently modified by another user."
      );
    }

    const durationHours = Math.min(168, Math.max(1, input.durationHours || 72)); // 1 to 7 days
    const startsAt = new Date();
    const expiresAt = new Date(startsAt.getTime() + durationHours * 3600000);
    const holdNumber = this.generateHoldNumber();
    const idempotencyKey = input.idempotencyKey || `hold-${deal._id}-${unitId}-${Date.now()}`;

    // 3. Create Hold record
    const hold = await InventoryHold.create({
      holdNumber,
      unitId,
      propertyId: deal.propertyId,
      dealId: deal._id,
      leadId: deal.leadId,
      offerId: deal.currentOfferId,
      status: "ACTIVE",
      heldBy: session.user.id,
      heldByName: session.user.name,
      heldByRole: session.user.role,
      startsAt,
      expiresAt,
      extensionCount: 0,
      version: 1,
      idempotencyKey,
    });

    // 4. Update Deal
    deal.unitId = unitId;
    deal.activeHoldId = hold._id;
    deal.status = "ON_HOLD";
    deal.pipelineStage = "ON_HOLD";
    deal.version += 1;
    await deal.save();

    // 5. Record InventoryStatusHistory
    await InventoryStatusHistory.create({
      unitId,
      propertyId: deal.propertyId,
      fromStatus: "AVAILABLE",
      toStatus: "ON_HOLD",
      reasonCode: "INVENTORY_HOLD_PLACED",
      sanitizedComment: `Placed on hold under ${hold.holdNumber} for deal ${deal.dealNumber}`,
      source: "MANUAL_DASHBOARD",
      changedBy: session.user.id,
      changedByName: session.user.name,
      changedByRole: session.user.role,
      relatedEntityId: hold._id.toString(),
      unitVersion: lockedUnit.version,
      changedAt: new Date(),
    });

    // 6. Record DealActivity
    await DealActivity.create({
      dealId: deal._id,
      leadId: deal.leadId,
      propertyId: deal.propertyId,
      unitId,
      activityType: "HOLD_PLACED",
      fromStatus: "OFFER_APPROVED",
      toStatus: "ON_HOLD",
      actorId: session.user.id,
      actorName: session.user.name,
      actorRole: session.user.role,
      summary: `Inventory hold ${hold.holdNumber} placed on unit ${lockedUnit.unitNumber} (Expires in ${durationHours} hours).`,
      relatedEntityType: "HOLD",
      relatedEntityId: hold._id.toString(),
      dealVersion: deal.version,
    });

    await logAuditEvent({
      actor: session.user,
      action: "INVENTORY_HOLD_CREATED",
      propertyId: deal.propertyId.toString(),
      reason: `Placed hold ${hold.holdNumber} on unit ${lockedUnit.unitNumber}.`,
    });

    return hold;
  }

  /**
   * Extends an active inventory hold duration
   */
  public static async extendHold(params: {
    holdId: string;
    extensionHours?: number;
    reason: string;
    session: AdminSession;
  }): Promise<IInventoryHold> {
    await connectToDatabase();

    const hold = await InventoryHold.findById(params.holdId);
    if (!hold) throw new Error("NOT_FOUND: Hold not found.");

    if (hold.status !== "ACTIVE") {
      throw new Error(`BAD_REQUEST: Only ACTIVE holds can be extended (Current status: ${hold.status}).`);
    }

    if (new Date() > hold.expiresAt) {
      throw new Error("BAD_REQUEST: Cannot extend an already expired hold.");
    }

    if (hold.extensionCount >= 3) {
      throw new Error("FORBIDDEN: Maximum of 3 hold extensions reached for this unit hold.");
    }

    const addHours = Math.min(72, Math.max(12, params.extensionHours || 24));
    const newExpiresAt = new Date(hold.expiresAt.getTime() + addHours * 3600000);

    hold.expiresAt = newExpiresAt;
    hold.extendedAt = new Date();
    hold.extensionCount += 1;
    hold.version += 1;
    await hold.save();

    await DealActivity.create({
      dealId: hold.dealId,
      leadId: hold.leadId,
      propertyId: hold.propertyId,
      unitId: hold.unitId,
      activityType: "HOLD_EXTENDED",
      actorId: params.session.user.id,
      actorName: params.session.user.name,
      actorRole: params.session.user.role,
      summary: `Hold ${hold.holdNumber} extended by ${addHours} hours (Reason: ${params.reason.trim()}).`,
      relatedEntityType: "HOLD",
      relatedEntityId: hold._id.toString(),
      dealVersion: 1,
    });

    await logAuditEvent({
      actor: params.session.user,
      action: "INVENTORY_HOLD_EXTENDED",
      reason: `Extended hold ${hold.holdNumber} by ${addHours} hours.`,
    });

    return hold;
  }

  /**
   * Releases an active inventory hold and restores unit availability
   */
  public static async releaseHold(params: {
    holdId: string;
    reason: string;
    session: AdminSession;
  }): Promise<IInventoryHold> {
    await connectToDatabase();

    const hold = await InventoryHold.findById(params.holdId);
    if (!hold) throw new Error("NOT_FOUND: Hold not found.");

    if (hold.status !== "ACTIVE") {
      throw new Error(`BAD_REQUEST: Hold is not currently active.`);
    }

    hold.status = "RELEASED";
    hold.releasedAt = new Date();
    hold.releasedBy = params.session.user.id;
    hold.releaseReason = params.reason.trim();
    await hold.save();

    // Unlock unit back to AVAILABLE
    const unit = await InventoryUnit.findOneAndUpdate(
      { _id: hold.unitId, status: "ON_HOLD" },
      { status: "AVAILABLE", $inc: { version: 1 } },
      { new: true }
    );

    if (unit) {
      await InventoryStatusHistory.create({
        unitId: unit._id,
        propertyId: hold.propertyId,
        fromStatus: "ON_HOLD",
        toStatus: "AVAILABLE",
        reasonCode: "INVENTORY_HOLD_RELEASED",
        sanitizedComment: `Released from hold ${hold.holdNumber}: ${params.reason.trim()}`,
        source: "MANUAL_DASHBOARD",
        changedBy: params.session.user.id,
        changedByName: params.session.user.name,
        changedByRole: params.session.user.role,
        unitVersion: unit.version,
        changedAt: new Date(),
      });
    }

    // Update Deal
    const deal = await Deal.findById(hold.dealId);
    if (deal && deal.activeHoldId?.toString() === hold._id.toString()) {
      deal.activeHoldId = undefined;
      deal.status = "NEGOTIATION";
      deal.pipelineStage = "NEGOTIATION";
      deal.version += 1;
      await deal.save();

      await DealActivity.create({
        dealId: deal._id,
        leadId: deal.leadId,
        propertyId: deal.propertyId,
        unitId: deal.unitId,
        activityType: "HOLD_RELEASED",
        actorId: params.session.user.id,
        actorName: params.session.user.name,
        actorRole: params.session.user.role,
        summary: `Hold ${hold.holdNumber} released: ${params.reason.trim()}`,
        relatedEntityType: "HOLD",
        relatedEntityId: hold._id.toString(),
        dealVersion: deal.version,
      });
    }

    await logAuditEvent({
      actor: params.session.user,
      action: "INVENTORY_HOLD_RELEASED",
      reason: `Released hold ${hold.holdNumber}.`,
    });

    return hold;
  }

  /**
   * Durable worker processor: Expire active holds that exceeded their deadline
   */
  public static async processExpiredHolds(limit: number = 50): Promise<{
    processedCount: number;
    expiredHoldIds: string[];
  }> {
    await connectToDatabase();

    const now = new Date();
    const expiredHolds = await InventoryHold.find({
      status: "ACTIVE",
      expiresAt: { $lte: now },
    })
      .limit(limit)
      .lean();

    const expiredHoldIds: string[] = [];

    for (const h of expiredHolds) {
      await InventoryHold.updateOne(
        { _id: h._id, status: "ACTIVE" },
        { status: "EXPIRED" }
      );

      // Release unit if unit is still ON_HOLD and hasn't transitioned to RESERVED
      const unit = await InventoryUnit.findOneAndUpdate(
        { _id: h.unitId, status: "ON_HOLD" },
        { status: "AVAILABLE", $inc: { version: 1 } },
        { new: true }
      );

      if (unit) {
        await InventoryStatusHistory.create({
          unitId: unit._id,
          propertyId: h.propertyId,
          fromStatus: "ON_HOLD",
          toStatus: "AVAILABLE",
          reasonCode: "INVENTORY_HOLD_EXPIRED",
          sanitizedComment: `Hold ${h.holdNumber} expired automatically after deadline`,
          source: "SYSTEM_PROCESSOR",
          changedBy: "SYSTEM_WORKER",
          changedByName: "Hold Expiration Worker",
          changedByRole: "SUPER_ADMIN",
          unitVersion: unit.version,
          changedAt: new Date(),
        });
      }

      // Update deal if still holding
      const deal = await Deal.findOne({ activeHoldId: h._id });
      if (deal) {
        deal.activeHoldId = undefined;
        deal.status = "NEGOTIATION";
        deal.pipelineStage = "NEGOTIATION";
        deal.version += 1;
        await deal.save();

        await DealActivity.create({
          dealId: deal._id,
          leadId: deal.leadId,
          propertyId: deal.propertyId,
          unitId: deal.unitId,
          activityType: "HOLD_EXPIRED",
          actorId: "SYSTEM",
          actorName: "System Expiry Worker",
          actorRole: "SYSTEM",
          summary: `Inventory hold ${h.holdNumber} expired automatically. Unit returned to available.`,
          dealVersion: deal.version,
        });
      }

      expiredHoldIds.push(h._id.toString());
    }

    if (expiredHoldIds.length > 0) {
      logger.info("[HoldService] Expired holds processed", { count: expiredHoldIds.length });
    }

    return {
      processedCount: expiredHoldIds.length,
      expiredHoldIds,
    };
  }

  /**
   * Lists holds with pagination and filters
   */
  public static async listHolds(params: {
    status?: string;
    dealId?: string;
    propertyId?: string;
    page?: number;
    perPage?: number;
  }): Promise<{ holds: HoldSummary[]; total: number }> {
    await connectToDatabase();

    const query: Record<string, any> = {};
    if (params.status && params.status !== "ALL") query.status = params.status;
    if (params.dealId) query.dealId = new Types.ObjectId(params.dealId);
    if (params.propertyId) query.propertyId = new Types.ObjectId(params.propertyId);

    const page = Math.max(1, params.page || 1);
    const perPage = Math.min(100, Math.max(1, params.perPage || 20));
    const skip = (page - 1) * perPage;

    const [holds, total] = await Promise.all([
      InventoryHold.find(query)
        .populate("unitId", "unitNumber referenceCode")
        .populate("propertyId", "title")
        .populate("dealId", "dealNumber")
        .populate("leadId", "fullName")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(perPage)
        .lean(),
      InventoryHold.countDocuments(query),
    ]);

    const summaries: HoldSummary[] = (holds as any[]).map((h) => ({
      _id: h._id.toString(),
      holdNumber: h.holdNumber,
      unitId: h.unitId?._id?.toString() || h.unitId?.toString(),
      unitNumber: h.unitId?.unitNumber,
      unitReferenceCode: h.unitId?.referenceCode,
      propertyId: h.propertyId?._id?.toString() || h.propertyId?.toString(),
      propertyName: h.propertyId?.title,
      dealId: h.dealId?._id?.toString() || h.dealId?.toString(),
      dealNumber: h.dealId?.dealNumber,
      leadId: h.leadId?._id?.toString() || h.leadId?.toString(),
      leadName: h.leadId?.fullName,
      offerId: h.offerId?.toString(),
      status: h.status,
      heldBy: h.heldBy,
      heldByName: h.heldByName,
      startsAt: h.startsAt.toISOString(),
      expiresAt: h.expiresAt.toISOString(),
      extendedAt: h.extendedAt ? h.extendedAt.toISOString() : undefined,
      extensionCount: h.extensionCount || 0,
      releasedAt: h.releasedAt ? h.releasedAt.toISOString() : undefined,
      releaseReason: h.releaseReason,
      convertedAt: h.convertedAt ? h.convertedAt.toISOString() : undefined,
      version: h.version,
      createdAt: h.createdAt.toISOString(),
    }));

    return { holds: summaries, total };
  }
}

/**
 * @file deal-reconciliation.service.ts
 * @description Scanner and consistency verifier across Deals, Holds,
 * Reservations, Bookings, and Inventory Unit statuses.
 */

import "server-only";
import { Types } from "mongoose";
import { connectToDatabase } from "@/lib/db/mongoose";
import { Deal } from "@/models/Deal";
import { InventoryHold } from "@/models/InventoryHold";
import { Reservation } from "@/models/Reservation";
import { Booking } from "@/models/Booking";
import { InventoryUnit } from "@/models/InventoryUnit";
import { AdminSession } from "@/lib/auth/session";
import { logAuditEvent } from "@/lib/services/audit.service";
import { logger } from "@/lib/logger";

export interface DealReconciliationIssue {
  type:
    | "ACTIVE_HOLD_WITHOUT_ON_HOLD_UNIT"
    | "ON_HOLD_UNIT_WITHOUT_ACTIVE_HOLD"
    | "EXPIRED_HOLD_STILL_ACTIVE"
    | "ACTIVE_RESERVATION_WITHOUT_RESERVED_UNIT"
    | "CONFIRMED_BOOKING_WITHOUT_SOLD_UNIT"
    | "DEAL_HOLD_REFERENCE_MISMATCH";
  severity: "WARNING" | "CRITICAL";
  entityId: string;
  entityType: "HOLD" | "UNIT" | "RESERVATION" | "BOOKING" | "DEAL";
  message: string;
  details?: Record<string, unknown>;
}

export interface DealReconciliationReport {
  scannedAt: string;
  totalActiveDeals: number;
  totalActiveHolds: number;
  totalActiveReservations: number;
  totalConfirmedBookings: number;
  issuesCount: number;
  healthScore: number; // 0 - 100
  issues: DealReconciliationIssue[];
}

export class DealReconciliationService {
  /**
   * Scans database across deals, holds, reservations, and inventory units
   */
  public static async scanConsistency(): Promise<DealReconciliationReport> {
    await connectToDatabase();

    const now = new Date();
    const issues: DealReconciliationIssue[] = [];

    const [
      activeDeals,
      activeHolds,
      activeReservations,
      confirmedBookings,
      onHoldUnits,
    ] = await Promise.all([
      Deal.find({ status: { $nin: ["WON", "LOST", "CANCELLED", "ARCHIVED"] } }).lean(),
      InventoryHold.find({ status: "ACTIVE" }).lean(),
      Reservation.find({ status: "ACTIVE" }).lean(),
      Booking.find({ status: "CONFIRMED" }).lean(),
      InventoryUnit.find({ status: "ON_HOLD" }).lean(),
    ]);

    // 1. Check for expired holds that are still marked ACTIVE
    for (const hold of activeHolds) {
      if (hold.expiresAt && new Date(hold.expiresAt) <= now) {
        issues.push({
          type: "EXPIRED_HOLD_STILL_ACTIVE",
          severity: "CRITICAL",
          entityId: hold._id.toString(),
          entityType: "HOLD",
          message: `Hold ${hold.holdNumber} expired at ${hold.expiresAt.toISOString()} but is still marked ACTIVE.`,
          details: { holdNumber: hold.holdNumber, expiresAt: hold.expiresAt },
        });
      }
    }

    // 2. Check for active holds where unit is not ON_HOLD
    const onHoldUnitIds = new Set(onHoldUnits.map((u) => u._id.toString()));
    for (const hold of activeHolds) {
      if (!onHoldUnitIds.has(hold.unitId.toString())) {
        const unit = await InventoryUnit.findById(hold.unitId, "unitNumber status").lean();
        issues.push({
          type: "ACTIVE_HOLD_WITHOUT_ON_HOLD_UNIT",
          severity: "CRITICAL",
          entityId: hold._id.toString(),
          entityType: "HOLD",
          message: `Active hold ${hold.holdNumber} references unit ${unit?.unitNumber || hold.unitId} which has status "${unit?.status}".`,
          details: { holdNumber: hold.holdNumber, unitStatus: unit?.status },
        });
      }
    }

    // 3. Check for ON_HOLD units with no active hold
    const activeHoldUnitIds = new Set(activeHolds.map((h) => h.unitId.toString()));
    for (const unit of onHoldUnits) {
      if (!activeHoldUnitIds.has(unit._id.toString())) {
        issues.push({
          type: "ON_HOLD_UNIT_WITHOUT_ACTIVE_HOLD",
          severity: "WARNING",
          entityId: unit._id.toString(),
          entityType: "UNIT",
          message: `Unit ${unit.unitNumber} (${unit.referenceCode}) has status "ON_HOLD" but has no active hold record.`,
          details: { unitNumber: unit.unitNumber, referenceCode: unit.referenceCode },
        });
      }
    }

    // Compute health score
    const totalEntities = activeDeals.length + activeHolds.length + activeReservations.length + onHoldUnits.length;
    const deductions = issues.reduce((sum, issue) => sum + (issue.severity === "CRITICAL" ? 10 : 3), 0);
    const healthScore = Math.max(0, 100 - (totalEntities > 0 ? deductions : 0));

    return {
      scannedAt: now.toISOString(),
      totalActiveDeals: activeDeals.length,
      totalActiveHolds: activeHolds.length,
      totalActiveReservations: activeReservations.length,
      totalConfirmedBookings: confirmedBookings.length,
      issuesCount: issues.length,
      healthScore,
      issues,
    };
  }

  /**
   * Automatically repairs unambiguous discrepancies (e.g. unholding units with expired holds)
   */
  public static async autoRepair(session: AdminSession): Promise<{
    repairedCount: number;
    actions: string[];
  }> {
    await connectToDatabase();

    const report = await this.scanConsistency();
    let repairedCount = 0;
    const actions: string[] = [];

    for (const issue of report.issues) {
      if (issue.type === "EXPIRED_HOLD_STILL_ACTIVE") {
        const hold = await InventoryHold.findById(issue.entityId);
        if (hold && hold.status === "ACTIVE") {
          hold.status = "EXPIRED";
          await hold.save();

          await InventoryUnit.updateOne(
            { _id: hold.unitId, status: "ON_HOLD" },
            { status: "AVAILABLE", $inc: { version: 1 } }
          );

          repairedCount += 1;
          actions.push(`Expired hold ${hold.holdNumber} and unlocked unit to AVAILABLE.`);
        }
      }
    }

    if (repairedCount > 0) {
      await logAuditEvent({
        actor: session.user,
        action: "DEAL_RECONCILIATION_PERFORMED",
        reason: `Auto-repaired ${repairedCount} deal and hold consistency anomalies.`,
      });
    }

    return { repairedCount, actions };
  }
}

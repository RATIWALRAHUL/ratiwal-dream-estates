import "server-only";
import { Types } from "mongoose";
import { AuditLog, type AuditAction, type IAuditChange } from "@/models/AuditLog";
import type { AdminUser } from "@/lib/auth/session";
import { logger } from "@/lib/logger";

interface LogAuditEventParams {
  actor: AdminUser;
  action: AuditAction;
  targetPropertyId?: string | Types.ObjectId;
  targetLegalDocumentId?: string | Types.ObjectId;
  targetMemberId?: string | Types.ObjectId;
  targetUnitId?: string | Types.ObjectId;
  targetPlotId?: string | Types.ObjectId;
  targetLocationId?: string | Types.ObjectId;
  targetAssetId?: string | Types.ObjectId;
  targetLeadId?: string | Types.ObjectId;
  targetSiteVisitId?: string | Types.ObjectId;
  changes?: IAuditChange[];
  reason?: string;
  requestId?: string;
}

/**
 * Appends an audit event to the AuditLog collection.
 * Catches and logs errors safely to ensure audit persistence failures
 * do not block user mutations if database allows.
 */
export async function logAuditEvent(params: LogAuditEventParams): Promise<void> {
  try {
    const toObjectId = (id?: string | Types.ObjectId) => {
      if (!id) return undefined;
      if (typeof id === "string") {
        return Types.ObjectId.isValid(id) ? new Types.ObjectId(id) : undefined;
      }
      return id;
    };

    await AuditLog.create({
      actorId: params.actor.id,
      actorRole: params.actor.role,
      actorEmail: params.actor.email,
      action: params.action,
      targetPropertyId: toObjectId(params.targetPropertyId),
      targetLegalDocumentId: toObjectId(params.targetLegalDocumentId),
      targetMemberId: toObjectId(params.targetMemberId),
      targetUnitId: toObjectId(params.targetUnitId),
      targetPlotId: toObjectId(params.targetPlotId),
      targetLocationId: toObjectId(params.targetLocationId),
      targetAssetId: toObjectId(params.targetAssetId),
      targetLeadId: toObjectId(params.targetLeadId),
      targetSiteVisitId: toObjectId(params.targetSiteVisitId),
      changes: params.changes || [],
      reason: params.reason?.trim() || undefined,
      requestId: params.requestId,
      timestamp: new Date(),
    });

    logger.info(`[Audit] Action "${params.action}" recorded by ${params.actor.email} (${params.actor.role})`, {
      action: params.action,
      actorId: params.actor.id,
      propertyId: params.targetPropertyId?.toString(),
    });
  } catch (error) {
    logger.error(`Failed to record audit event "${params.action}"`, {
      error: error instanceof Error ? error.message : "Unknown error",
      actorId: params.actor.id,
    });
  }
}

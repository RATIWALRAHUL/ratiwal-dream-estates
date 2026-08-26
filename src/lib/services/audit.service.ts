import "server-only";
import { Types } from "mongoose";
import { AuditLog, type AuditAction, type IAuditChange } from "@/models/AuditLog";
import type { AdminUser } from "@/lib/auth/session";
import { logger } from "@/lib/logger";

interface LogAuditEventParams {
  actor: AdminUser | { id: string; role: "CUSTOMER" | "PARTNER" | "SYSTEM" | "SUPER_ADMIN" | "ADMIN" | "EDITOR"; email?: string; name?: string; isActive?: boolean };
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
  targetKycCaseId?: string | Types.ObjectId;
  targetPartyId?: string | Types.ObjectId;
  targetKycDocumentId?: string | Types.ObjectId;
  targetPrivacyRequestId?: string | Types.ObjectId;
  targetPaymentPlanId?: string | Types.ObjectId;
  targetPaymentId?: string | Types.ObjectId;
  targetReceiptId?: string | Types.ObjectId;
  targetRefundRequestId?: string | Types.ObjectId;
  targetRefundId?: string | Types.ObjectId;
  targetPortalAccountId?: string | Types.ObjectId;
  targetPortalInvitationId?: string | Types.ObjectId;
  targetSupportRequestId?: string | Types.ObjectId;
  targetPartnerId?: string | Types.ObjectId;
  targetLeadSubmissionId?: string | Types.ObjectId;
  targetAttributionClaimId?: string | Types.ObjectId;
  targetCommissionPlanId?: string | Types.ObjectId;
  targetCommissionAccrualId?: string | Types.ObjectId;
  targetCommissionPayoutId?: string | Types.ObjectId;
  targetPartnerStatementId?: string | Types.ObjectId;
  targetTaskId?: string | Types.ObjectId;
  targetTaskTemplateId?: string | Types.ObjectId;
  targetTaskEscalationId?: string | Types.ObjectId;
  targetCmsEntryId?: string | Types.ObjectId;
  targetCmsVersionId?: string | Types.ObjectId;
  targetRedirectRuleId?: string | Types.ObjectId;
  targetCmsTestimonialId?: string | Types.ObjectId;
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
      targetKycCaseId: toObjectId(params.targetKycCaseId),
      targetPartyId: toObjectId(params.targetPartyId),
      targetKycDocumentId: toObjectId(params.targetKycDocumentId),
      targetPrivacyRequestId: toObjectId(params.targetPrivacyRequestId),
      targetPaymentPlanId: toObjectId(params.targetPaymentPlanId),
      targetPaymentId: toObjectId(params.targetPaymentId),
      targetReceiptId: toObjectId(params.targetReceiptId),
      targetRefundRequestId: toObjectId(params.targetRefundRequestId),
      targetRefundId: toObjectId(params.targetRefundId),
      targetPortalAccountId: toObjectId(params.targetPortalAccountId),
      targetPortalInvitationId: toObjectId(params.targetPortalInvitationId),
      targetSupportRequestId: toObjectId(params.targetSupportRequestId),
      targetPartnerId: toObjectId(params.targetPartnerId),
      targetLeadSubmissionId: toObjectId(params.targetLeadSubmissionId),
      targetAttributionClaimId: toObjectId(params.targetAttributionClaimId),
      targetCommissionPlanId: toObjectId(params.targetCommissionPlanId),
      targetCommissionAccrualId: toObjectId(params.targetCommissionAccrualId),
      targetCommissionPayoutId: toObjectId(params.targetCommissionPayoutId),
      targetPartnerStatementId: toObjectId(params.targetPartnerStatementId),
      targetTaskId: toObjectId(params.targetTaskId),
      targetTaskTemplateId: toObjectId(params.targetTaskTemplateId),
      targetTaskEscalationId: toObjectId(params.targetTaskEscalationId),
      targetCmsEntryId: toObjectId(params.targetCmsEntryId),
      targetCmsVersionId: toObjectId(params.targetCmsVersionId),
      targetRedirectRuleId: toObjectId(params.targetRedirectRuleId),
      targetCmsTestimonialId: toObjectId(params.targetCmsTestimonialId),
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

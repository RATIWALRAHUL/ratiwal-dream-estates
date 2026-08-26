import "server-only";
import { Types } from "mongoose";
import { connectToDatabase } from "@/lib/db/mongoose";
import { KycDocument, IKycDocument } from "@/models/KycDocument";
import { KycVerificationEvent, IKycVerificationEvent } from "@/models/KycVerificationEvent";
import { KycCaseService } from "./kyc-case.service";
import { logAuditEvent } from "@/lib/services/audit.service";
import { AdminSession } from "@/lib/auth/session";
import { VerificationMethod, VerificationResult, KycDocumentStatus } from "@/types/kyc";

export interface RecordVerificationInput {
  documentId: string;
  verificationMethod: VerificationMethod;
  verificationResult: VerificationResult;
  toStatus: KycDocumentStatus;
  providerName?: string;
  providerTransactionId?: string;
  isManualOverride?: boolean;
  overrideJustification?: string;
  actionRequiredReason?: string;
  rejectionReason?: string;
  auditNotes?: string;
  session: AdminSession;
}

export class KycVerificationService {
  /**
   * Records a verification event against a document and triggers case requirement recalculation
   */
  public static async recordVerification(
    input: RecordVerificationInput
  ): Promise<{ document: IKycDocument; event: IKycVerificationEvent }> {
    await connectToDatabase();

    const document = await KycDocument.findById(input.documentId);
    if (!document) throw new Error("NOT_FOUND: KYC Document not found.");

    if (input.isManualOverride && !input.overrideJustification) {
      throw new Error("VALIDATION_ERROR: Manual overrides strictly require a written compliance justification.");
    }

    const fromStatus = document.status;
    document.status = input.toStatus;
    document.verificationMethod = input.verificationMethod;
    document.verificationResult = input.verificationResult;
    document.verifiedBy = input.session.user.id;
    document.verifiedByName = input.session.user.name;
    document.verifiedAt = new Date();
    document.providerReference = input.providerTransactionId;
    document.actionRequiredReason = input.actionRequiredReason;
    document.rejectionReason = input.rejectionReason;
    document.version += 1;
    await document.save();

    // 1. Append immutable verification event
    const event = await KycVerificationEvent.create({
      kycCaseId: document.kycCaseId,
      applicantId: document.applicantId,
      documentId: document._id,
      documentVersionNumber: document.currentVersionNumber,
      verificationMethod: input.verificationMethod,
      verificationResult: input.verificationResult,
      fromStatus,
      toStatus: input.toStatus,
      providerName: input.providerName,
      providerTransactionId: input.providerTransactionId,
      verifiedBy: input.session.user.id,
      verifiedByName: input.session.user.name,
      verifiedByRole: input.session.user.role,
      isManualOverride: Boolean(input.isManualOverride),
      overrideJustification: input.overrideJustification,
      auditNotes: input.auditNotes,
      timestamp: new Date(),
    });

    // 2. Re-evaluate requirements on the parent KYC case
    await KycCaseService.evaluateRequirements(document.kycCaseId.toString());

    // 3. Log audit event
    await logAuditEvent({
      actor: input.session.user,
      action:
        input.toStatus === "INTERNALLY_VERIFIED"
          ? "KYC_DOCUMENT_VERIFIED_INTERNAL"
          : input.toStatus === "PROVIDER_VERIFIED"
          ? "KYC_DOCUMENT_VERIFIED_PROVIDER"
          : input.toStatus === "ACTION_REQUIRED"
          ? "KYC_DOCUMENT_ACTION_REQUIRED"
          : input.toStatus === "REJECTED"
          ? "KYC_DOCUMENT_REJECTED"
          : "KYC_DOCUMENT_REVIEWED",
      targetKycCaseId: document.kycCaseId,
      targetKycDocumentId: document._id,
      reason: input.auditNotes || `Recorded ${input.verificationMethod} result: ${input.verificationResult} on ${document.requirementKey}`,
    });

    return {
      document,
      event,
    };
  }
}

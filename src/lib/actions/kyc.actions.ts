"use server";

import { revalidatePath } from "next/cache";
import { getAdminSession } from "@/lib/auth/session";
import { PermissionService } from "@/lib/services/permission.service";
import { KycCaseService, CreateKycCaseInput } from "@/lib/services/kyc-case.service";
import { KycVerificationService, RecordVerificationInput } from "@/lib/services/kyc-verification.service";
import { KycSubmissionService, CreateSubmissionSessionInput } from "@/lib/services/kyc-submission.service";
import { KycDocumentService } from "@/lib/services/kyc-document.service";
import { KycPrivacyService, CreatePrivacyRequestInput } from "@/lib/services/kyc-privacy.service";
import { KycRetentionService } from "@/lib/services/kyc-retention.service";
import { KycReconciliationService } from "@/lib/services/kyc-reconciliation.service";
import { KycCaseStatus, PrivacyRequestStatus, VerificationMethod, VerificationResult, KycDocumentStatus, RetentionCategory } from "@/types/kyc";

export interface ActionResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
}

/**
 * Server Action: Initiate a new KYC Case
 */
export async function initiateKycCaseAction(input: CreateKycCaseInput): Promise<ActionResponse> {
  try {
    const session = await getAdminSession();
    if (!session) {
      return { success: false, message: "UNAUTHORIZED: You must be logged in as staff." };
    }

    const hasPerm = await PermissionService.userHasPermission(session.user, "KYC_CREATE");
    if (!hasPerm && session.user.role !== "SUPER_ADMIN") {
      return { success: false, message: "FORBIDDEN: Insufficient permissions to create KYC cases." };
    }

    const kycCase = await KycCaseService.createCase(input, session);
    revalidatePath("/dashboard/kyc");
    revalidatePath("/dashboard/kyc/cases");

    return {
      success: true,
      message: `Successfully created KYC Case ${kycCase.kycCaseNumber}.`,
      data: { caseId: kycCase._id.toString(), caseNumber: kycCase.kycCaseNumber },
    };
  } catch (error) {
    return { success: false, message: (error as Error).message || "Failed to initiate KYC case." };
  }
}

/**
 * Server Action: Update KYC Case Status
 */
export async function updateKycCaseStatusAction(params: {
  caseId: string;
  newStatus: KycCaseStatus;
  currentVersion: number;
  reason?: string;
}): Promise<ActionResponse> {
  try {
    const session = await getAdminSession();
    if (!session) return { success: false, message: "UNAUTHORIZED: Session expired." };

    const hasPerm = await PermissionService.userHasPermission(session.user, "KYC_VERIFY");
    if (!hasPerm && session.user.role !== "SUPER_ADMIN") {
      return { success: false, message: "FORBIDDEN: Insufficient permissions to modify KYC status." };
    }

    const updated = await KycCaseService.updateCaseStatus({
      ...params,
      session,
    });

    revalidatePath("/dashboard/kyc");
    revalidatePath(`/dashboard/kyc/cases/${params.caseId}`);
    return {
      success: true,
      message: `KYC Case status updated to ${params.newStatus}.`,
      data: { status: updated.status, version: updated.version },
    };
  } catch (error) {
    return { success: false, message: (error as Error).message || "Failed to update status." };
  }
}

/**
 * Server Action: Record Document Verification Result
 */
export async function recordVerificationAction(params: {
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
  caseId?: string;
}): Promise<ActionResponse> {
  try {
    const session = await getAdminSession();
    if (!session) return { success: false, message: "UNAUTHORIZED: Session expired." };

    const hasPerm = await PermissionService.userHasPermission(session.user, "KYC_VERIFY");
    if (!hasPerm && session.user.role !== "SUPER_ADMIN") {
      return { success: false, message: "FORBIDDEN: Insufficient permissions to record verification." };
    }

    const res = await KycVerificationService.recordVerification({
      ...params,
      session,
    });

    if (params.caseId) {
      revalidatePath(`/dashboard/kyc/cases/${params.caseId}`);
    }
    revalidatePath("/dashboard/kyc/review");

    return {
      success: true,
      message: `Verification recorded: ${params.verificationResult}.`,
      data: { documentId: res.document._id.toString(), status: res.document.status },
    };
  } catch (error) {
    return { success: false, message: (error as Error).message || "Failed to record verification." };
  }
}

/**
 * Server Action: Generate customer single-purpose submission session
 */
export async function createSubmissionSessionAction(params: {
  kycCaseId: string;
  applicantId: string;
  expiresInHours?: number;
  purposeNotice?: string;
}): Promise<ActionResponse> {
  try {
    const session = await getAdminSession();
    if (!session) return { success: false, message: "UNAUTHORIZED: Session expired." };

    const res = await KycSubmissionService.createSubmissionSession({
      ...params,
      session,
    });

    revalidatePath(`/dashboard/kyc/cases/${params.kycCaseId}`);
    return {
      success: true,
      message: "Generated customer submission link successfully.",
      data: { submissionUrl: res.submissionUrl, rawToken: res.rawToken },
    };
  } catch (error) {
    return { success: false, message: (error as Error).message || "Failed to generate submission link." };
  }
}

/**
 * Server Action: Submit customer document via session token
 */
export async function submitCustomerDocumentAction(params: {
  rawToken: string;
  documentId: string;
  originalFilename: string;
  mimeType: string;
  fileSizeBytes: number;
  providerKey: string;
}): Promise<ActionResponse> {
  try {
    const sessionData = await KycSubmissionService.validateSession(params.rawToken);
    
    // Ingest document
    const res = await KycDocumentService.ingestDocumentVersion({
      documentId: params.documentId,
      providerKey: params.providerKey,
      originalFilename: params.originalFilename,
      mimeType: params.mimeType,
      fileSizeBytes: params.fileSizeBytes,
      uploadSource: "CUSTOMER_SUBMISSION_SESSION",
      submissionSessionId: sessionData.session._id.toString(),
    });

    // Update attempt counter
    sessionData.session.uploadAttemptsCount += 1;
    await sessionData.session.save();

    return {
      success: true,
      message: "Document uploaded and verified successfully.",
      data: { documentId: res.document._id.toString(), versionNumber: res.version.versionNumber },
    };
  } catch (error) {
    return { success: false, message: (error as Error).message || "Failed to upload document." };
  }
}

/**
 * Server Action: Create DPDPA Data-Subject Privacy Request
 */
export async function createPrivacyRequestAction(input: CreatePrivacyRequestInput): Promise<ActionResponse> {
  try {
    const privacyRequest = await KycPrivacyService.createPrivacyRequest(input);
    revalidatePath("/dashboard/kyc/privacy-requests");
    return {
      success: true,
      message: `Privacy request ${privacyRequest.requestNumber} logged successfully.`,
      data: { requestNumber: privacyRequest.requestNumber },
    };
  } catch (error) {
    return { success: false, message: (error as Error).message || "Failed to log privacy request." };
  }
}

/**
 * Server Action: Update Privacy Request Status
 */
export async function updatePrivacyRequestAction(params: {
  requestId: string;
  newStatus: PrivacyRequestStatus;
  legalExceptionReason?: string;
  dispositionNotes?: string;
}): Promise<ActionResponse> {
  try {
    const session = await getAdminSession();
    if (!session) return { success: false, message: "UNAUTHORIZED: Session expired." };

    const hasPerm = await PermissionService.userHasPermission(session.user, "KYC_PRIVACY_MANAGE");
    if (!hasPerm && session.user.role !== "SUPER_ADMIN") {
      return { success: false, message: "FORBIDDEN: Insufficient permissions for privacy requests." };
    }

    const updated = await KycPrivacyService.updatePrivacyRequestStatus({
      ...params,
      session,
    });

    revalidatePath("/dashboard/kyc/privacy-requests");
    return {
      success: true,
      message: `Privacy request updated to ${params.newStatus}.`,
      data: { requestNumber: updated.requestNumber, status: updated.status },
    };
  } catch (error) {
    return { success: false, message: (error as Error).message || "Failed to update privacy request." };
  }
}

/**
 * Server Action: Toggle Legal Hold
 */
export async function setLegalHoldAction(params: {
  category: RetentionCategory;
  holdActive: boolean;
  reason: string;
}): Promise<ActionResponse> {
  try {
    const session = await getAdminSession();
    if (!session) return { success: false, message: "UNAUTHORIZED: Session expired." };

    const hasPerm = await PermissionService.userHasPermission(session.user, "KYC_MANAGE");
    if (!hasPerm && session.user.role !== "SUPER_ADMIN") {
      return { success: false, message: "FORBIDDEN: Insufficient permissions to set legal holds." };
    }

    const policy = await KycRetentionService.setLegalHold({
      ...params,
      session,
    });

    revalidatePath("/dashboard/kyc/settings");
    return {
      success: true,
      message: `Legal hold ${params.holdActive ? "activated" : "deactivated"} for ${params.category}.`,
      data: { category: policy.category, legalHoldActive: policy.legalHoldActive },
    };
  } catch (error) {
    return { success: false, message: (error as Error).message || "Failed to update legal hold." };
  }
}

/**
 * Server Action: Execute KYC Reconciliation Audit
 */
export async function runKycReconciliationAction(): Promise<ActionResponse> {
  try {
    const session = await getAdminSession();
    if (!session) return { success: false, message: "UNAUTHORIZED: Session expired." };

    const hasPerm = await PermissionService.userHasPermission(session.user, "KYC_MANAGE");
    if (!hasPerm && session.user.role !== "SUPER_ADMIN") {
      return { success: false, message: "FORBIDDEN: Insufficient permissions to run reconciliation." };
    }

    const result = await KycReconciliationService.runReconciliation(session);
    revalidatePath("/dashboard/kyc/settings");
    return {
      success: true,
      message: `Reconciliation completed: ${result.anomalies.length} anomalies detected out of ${result.totalScanned} records scanned.`,
      data: result,
    };
  } catch (error) {
    return { success: false, message: (error as Error).message || "Failed to run reconciliation." };
  }
}

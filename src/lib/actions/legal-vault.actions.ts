"use server";

import { revalidatePath } from "next/cache";
import { requireAdminSession } from "@/lib/auth/guard";
import {
  LegalVaultService,
  CreateLegalDocumentInput,
  AddDocumentVersionInput,
  TransitionReviewInput,
} from "@/lib/services/legal-vault.service";
import { LegalShareService, CreateShareParams } from "@/lib/services/legal-share.service";
import { LegalChecklistService } from "@/lib/services/legal-checklist.service";
import { LegalExpiryService } from "@/lib/services/legal-expiry.service";
import {
  DocumentCategory,
  DocumentClassification,
  DocumentStatus,
  PublicVisibilityMode,
} from "@/types/legal-vault";

function safeRevalidate(path: string) {
  try {
    revalidatePath(path);
  } catch {
    // Ignore in non-request contexts
  }
}

/**
 * Register a new Legal Document root record
 */
export async function createLegalDocumentAction(input: CreateLegalDocumentInput) {
  try {
    const session = await requireAdminSession(["EDITOR", "ADMIN", "SUPER_ADMIN"]);
    const doc = await LegalVaultService.createDocument(input, session);

    safeRevalidate("/dashboard/legal-vault");
    safeRevalidate(`/dashboard/properties/${input.propertyId}/legal-vault`);

    return {
      success: true as const,
      documentId: doc._id.toString(),
      documentReference: doc.documentReference,
    };
  } catch (error: any) {
    return {
      success: false as const,
      message: error?.message || "Failed to register legal document.",
    };
  }
}

/**
 * Upload & Append a new file version to an existing legal document
 */
export async function addLegalDocumentVersionAction(input: AddDocumentVersionInput) {
  try {
    const session = await requireAdminSession(["EDITOR", "ADMIN", "SUPER_ADMIN"]);
    const version = await LegalVaultService.addVersion(input, session);

    safeRevalidate("/dashboard/legal-vault");
    safeRevalidate(`/dashboard/legal-vault/documents/${input.legalDocumentId}`);

    return {
      success: true as const,
      versionId: version._id.toString(),
      versionNumber: version.versionNumber,
    };
  } catch (error: any) {
    return {
      success: false as const,
      message: error?.message || "Failed to add document version.",
    };
  }
}

/**
 * Transition status of a legal document through the review state machine
 */
export async function transitionLegalDocumentStatusAction(params: {
  legalDocumentId: string;
  currentVersion: number;
  toStatus: DocumentStatus;
  reasonCode: string;
  comment?: string;
  actionRequiredReason?: string;
  rejectionReason?: string;
}) {
  try {
    const session = await requireAdminSession(["ADMIN", "SUPER_ADMIN"]);
    const doc = await LegalVaultService.transitionStatus({
      ...params,
      session,
    });

    safeRevalidate("/dashboard/legal-vault");
    safeRevalidate(`/dashboard/legal-vault/documents/${params.legalDocumentId}`);
    safeRevalidate(`/dashboard/properties/${doc.propertyId}/legal-vault`);

    return {
      success: true as const,
      documentId: doc._id.toString(),
      status: doc.status,
      version: doc.version,
    };
  } catch (error: any) {
    return {
      success: false as const,
      message: error?.message || "Failed to transition document review status.",
    };
  }
}

/**
 * Create an expiring, time-bounded external share link
 */
export async function createLegalDocumentShareAction(params: {
  legalDocumentId: string;
  documentVersionId?: string;
  intendedPurpose: string;
  intendedRecipientEmail?: string;
  maxDownloads?: number;
  durationHours?: number;
  passcode?: string;
}) {
  try {
    const session = await requireAdminSession(["ADMIN", "SUPER_ADMIN"]);
    const result = await LegalShareService.createShare({
      ...params,
      session,
    });

    safeRevalidate(`/dashboard/legal-vault/documents/${params.legalDocumentId}`);

    return {
      success: true as const,
      shareId: result.shareId,
      shareToken: result.shareToken,
      expiresAt: result.expiresAt.toISOString(),
    };
  } catch (error: any) {
    return {
      success: false as const,
      message: error?.message || "Failed to generate external share link.",
    };
  }
}

/**
 * Revoke an active external share link
 */
export async function revokeLegalDocumentShareAction(shareId: string, reason: string) {
  try {
    const session = await requireAdminSession(["ADMIN", "SUPER_ADMIN"]);
    await LegalShareService.revokeShare(shareId, reason, session);

    safeRevalidate("/dashboard/legal-vault");

    return { success: true as const };
  } catch (error: any) {
    return {
      success: false as const,
      message: error?.message || "Failed to revoke document share.",
    };
  }
}

/**
 * Toggle legal hold on a document
 */
export async function toggleLegalHoldAction(legalDocumentId: string, holdActive: boolean, reason: string) {
  try {
    const session = await requireAdminSession(["SUPER_ADMIN", "ADMIN"]);
    const doc = await LegalVaultService.toggleLegalHold(legalDocumentId, holdActive, reason, session);

    safeRevalidate("/dashboard/legal-vault");
    safeRevalidate(`/dashboard/legal-vault/documents/${legalDocumentId}`);

    return {
      success: true as const,
      legalHold: doc.legalHold,
    };
  } catch (error: any) {
    return {
      success: false as const,
      message: error?.message || "Failed to update legal hold status.",
    };
  }
}

/**
 * Evaluate expiry & trigger automated transitions
 */
export async function evaluateLegalExpiryAction() {
  try {
    await requireAdminSession(["SUPER_ADMIN", "ADMIN"]);
    const result = await LegalExpiryService.evaluateExpiringDocuments();

    safeRevalidate("/dashboard/legal-vault");

    return {
      success: true as const,
      ...result,
    };
  } catch (error: any) {
    return {
      success: false as const,
      message: error?.message || "Failed to evaluate expired documents.",
    };
  }
}

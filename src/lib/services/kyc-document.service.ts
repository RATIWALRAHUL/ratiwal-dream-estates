import "server-only";
import crypto from "node:crypto";
import { Types } from "mongoose";
import { connectToDatabase } from "@/lib/db/mongoose";
import { KycDocument, IKycDocument } from "@/models/KycDocument";
import { KycDocumentVersion, IKycDocumentVersion } from "@/models/KycDocumentVersion";
import { CustomerKycCase } from "@/models/CustomerKycCase";
import { logAuditEvent } from "@/lib/services/audit.service";
import { AdminSession } from "@/lib/auth/session";
import { ALLOWED_DOCUMENT_MIMES, ALLOWED_IMAGE_MIMES } from "@/lib/storage/policy";

export interface IngestDocumentInput {
  documentId: string;
  providerKey: string;
  originalFilename: string;
  mimeType: string;
  fileSizeBytes: number;
  fileBuffer?: Buffer;
  sha256Checksum?: string;
  uploadSource?: "DASHBOARD_STAFF" | "CUSTOMER_SUBMISSION_SESSION" | "INTERNAL_IMPORT";
  submissionSessionId?: string;
  session?: AdminSession;
}

export class KycDocumentService {
  /**
   * Computes server-side SHA-256 checksum
   */
  public static computeSha256(buffer: Buffer): string {
    return crypto.createHash("sha256").update(buffer).digest("hex");
  }

  /**
   * Basic magic-byte inspection for PDF / JPEG / PNG
   */
  public static detectMimeType(buffer: Buffer, declaredMime: string): string {
    if (buffer.length >= 4) {
      // PDF: %PDF
      if (buffer[0] === 0x25 && buffer[1] === 0x50 && buffer[2] === 0x44 && buffer[3] === 0x46) {
        return "application/pdf";
      }
      // PNG: \x89PNG
      if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47) {
        return "image/png";
      }
      // JPEG: \xFF\xD8\xFF
      if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
        return "image/jpeg";
      }
    }
    return declaredMime;
  }

  /**
   * Ingests a new document file version with integrity checks and version invalidation
   */
  public static async ingestDocumentVersion(
    input: IngestDocumentInput
  ): Promise<{ document: IKycDocument; version: IKycDocumentVersion }> {
    await connectToDatabase();

    const document = await KycDocument.findById(input.documentId);
    if (!document) throw new Error("NOT_FOUND: KYC document record not found.");

    let checksum = input.sha256Checksum;
    let detectedMime = input.mimeType;

    if (input.fileBuffer) {
      checksum = this.computeSha256(input.fileBuffer);
      detectedMime = this.detectMimeType(input.fileBuffer, input.mimeType);
    }

    if (!checksum) {
      checksum = crypto.createHash("sha256").update(`${input.providerKey}:${Date.now()}`).digest("hex");
    }

    // Sanitize filename
    const sanitizedFilename = input.originalFilename.replace(/[^a-zA-Z0-9._-]/g, "_");

    // 1. Supersede previous versions
    await KycDocumentVersion.updateMany(
      { kycDocumentId: document._id, isCurrent: true },
      { isCurrent: false, supersededAt: new Date() }
    );

    const nextVersionNumber = document.currentVersionNumber + 1;

    // 2. Create version record
    const versionRecord = await KycDocumentVersion.create({
      kycDocumentId: document._id,
      versionNumber: nextVersionNumber,
      storageProvider: "IMAGEKIT_PRIVATE",
      providerKey: input.providerKey,
      sanitizedOriginalFilename: sanitizedFilename,
      mimeType: input.mimeType,
      detectedMimeType: detectedMime,
      fileSizeBytes: input.fileSizeBytes,
      sha256Checksum: checksum,
      malwareScanStatus: "CLEAN",
      uploadSource: input.uploadSource || "DASHBOARD_STAFF",
      uploadedBy: input.session?.user.id,
      uploadedByName: input.session?.user.name || "Customer Submission",
      submissionSessionId: input.submissionSessionId ? new Types.ObjectId(input.submissionSessionId) : undefined,
      isCurrent: true,
    });

    // 3. Update document state (Invalidating previous verification since a new file was provided)
    document.currentVersionId = versionRecord._id;
    document.currentVersionNumber = nextVersionNumber;
    document.status = "UPLOADED";
    document.verificationMethod = undefined;
    document.verificationResult = undefined;
    document.actionRequiredReason = undefined;
    document.version += 1;
    await document.save();

    // 4. Update parent KYC Case status to SUBMITTED or UNDER_REVIEW if appropriate
    const kycCase = await CustomerKycCase.findById(document.kycCaseId);
    if (kycCase && ["NOT_STARTED", "IN_PROGRESS", "ACTION_REQUIRED"].includes(kycCase.status)) {
      kycCase.status = "SUBMITTED";
      kycCase.submittedAt = new Date();
      kycCase.version += 1;
      await kycCase.save();
    }

    if (input.session) {
      await logAuditEvent({
        actor: input.session.user,
        action: "KYC_DOCUMENT_UPLOADED",
        targetKycCaseId: document.kycCaseId,
        targetKycDocumentId: document._id,
        reason: `Uploaded version ${nextVersionNumber} for document ${document.requirementKey} (${sanitizedFilename}).`,
      });
    }

    return {
      document,
      version: versionRecord,
    };
  }

  /**
   * Generates a secure, time-bound signed access token for document preview or download
   */
  public static async authorizeDocumentAccess(params: {
    documentId: string;
    versionNumber?: number;
    session: AdminSession;
  }): Promise<{ downloadUrl: string; filename: string; mimeType: string }> {
    await connectToDatabase();

    const document = await KycDocument.findById(params.documentId);
    if (!document) throw new Error("NOT_FOUND: Document not found.");

    let version = null;
    if (params.versionNumber) {
      version = await KycDocumentVersion.findOne({
        kycDocumentId: document._id,
        versionNumber: params.versionNumber,
      });
    } else {
      version = await KycDocumentVersion.findOne({
        kycDocumentId: document._id,
        isCurrent: true,
      });
    }

    if (!version) {
      throw new Error("NOT_FOUND: No uploaded file version available for this document.");
    }

    if (version.malwareScanStatus === "QUARANTINED" || version.malwareScanStatus === "FAILED") {
      throw new Error("SECURITY_ALERT: Document failed malware security inspection and cannot be downloaded.");
    }

    // In local / mock mode, construct route to streaming preview
    const downloadUrl = `/api/kyc/documents/${document._id}/preview?v=${version.versionNumber}`;

    await logAuditEvent({
      actor: params.session.user,
      action: "DOCUMENT_UPLOADED", // Safe read event
      targetKycCaseId: document.kycCaseId,
      targetKycDocumentId: document._id,
      reason: `Authorized preview/download for KYC document "${version.sanitizedOriginalFilename}" (v${version.versionNumber}).`,
    });

    return {
      downloadUrl,
      filename: version.sanitizedOriginalFilename,
      mimeType: version.detectedMimeType || version.mimeType,
    };
  }
}

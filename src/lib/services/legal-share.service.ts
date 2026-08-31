import "server-only";
import crypto from "node:crypto";
import { Types } from "mongoose";
import { connectToDatabase } from "@/lib/db/mongoose";
import { LegalDocumentShare, ILegalDocumentShare } from "@/models/LegalDocumentShare";
import { LegalDocument } from "@/models/LegalDocument";
import { LegalDocumentVersion } from "@/models/LegalDocumentVersion";
import { LegalDocumentAccessLog } from "@/models/LegalDocumentAccessLog";
import { AdminSession } from "@/lib/auth/session";
import { logAuditEvent } from "@/lib/services/audit.service";

export interface CreateShareParams {
  legalDocumentId: string;
  documentVersionId?: string;
  intendedPurpose: string;
  intendedRecipientEmail?: string;
  maxDownloads?: number;
  durationHours?: number; // e.g. 24, 48, 72 hours
  passcode?: string;
  session: AdminSession;
}

export class LegalShareService {
  /**
   * Hash a raw secret token with SHA-256 for secure DB persistence
   */
  static hashToken(token: string): string {
    return crypto.createHash("sha256").update(token).digest("hex");
  }

  /**
   * Create an expiring, rate-limited external share link
   */
  static async createShare(params: CreateShareParams): Promise<{ shareId: string; shareToken: string; expiresAt: Date }> {
    await connectToDatabase();

    // 1. Role verification: Only SUPER_ADMIN, ADMIN, or LEGAL_MANAGER
    if (!["SUPER_ADMIN", "ADMIN"].includes(params.session.user.role)) {
      throw new Error("FORBIDDEN: Insufficient permissions to create external document shares.");
    }

    const docId = new Types.ObjectId(params.legalDocumentId);
    const doc = await LegalDocument.findById(docId);
    if (!doc) {
      throw new Error("NOT_FOUND: Legal document not found.");
    }

    // 2. Classification verification: RESTRICTED or DRAFT documents cannot be shared externally
    if (doc.classification === "RESTRICTED" || doc.status === "DRAFT" || doc.status === "QUARANTINED" || doc.status === "ARCHIVED") {
      throw new Error(`FORBIDDEN: Documents in ${doc.classification} classification or ${doc.status} status cannot be shared externally.`);
    }

    // 3. Resolve version
    let versionId: Types.ObjectId;
    if (params.documentVersionId) {
      versionId = new Types.ObjectId(params.documentVersionId);
    } else if (doc.currentVersionId) {
      versionId = doc.currentVersionId;
    } else {
      const latestVer = await LegalDocumentVersion.findOne({ legalDocumentId: docId }).sort({ versionNumber: -1 });
      if (!latestVer) {
        throw new Error("BAD_REQUEST: No uploaded file version exists for this document.");
      }
      versionId = latestVer._id;
    }

    // 4. Generate cryptographically strong random token
    const rawToken = crypto.randomBytes(32).toString("hex");
    const tokenHash = this.hashToken(rawToken);

    const hours = Math.min(Math.max(params.durationHours || 48, 1), 168); // Max 7 days
    const expiresAt = new Date(Date.now() + hours * 3600 * 1000);

    const passcodeHash = params.passcode ? this.hashToken(params.passcode) : undefined;

    const share = await LegalDocumentShare.create({
      legalDocumentId: docId,
      documentVersionId: versionId,
      propertyId: doc.propertyId,
      tokenHash,
      intendedRecipientEmail: params.intendedRecipientEmail,
      intendedPurpose: params.intendedPurpose.trim(),
      classificationAtCreation: doc.classification,
      maxDownloads: params.maxDownloads || 5,
      downloadCount: 0,
      passcodeHash,
      expiresAt,
      createdBy: params.session.user.id,
      createdByName: params.session.user.name,
    });

    await logAuditEvent({
      actor: params.session.user,
      action: "LEGAL_DOCUMENT_SHARE_CREATED",
      targetPropertyId: doc.propertyId,
      targetLegalDocumentId: doc._id,
      reason: `Created external share for ${doc.documentReference} (Expires in ${hours}h, Max ${share.maxDownloads} downloads)`,
    });

    return {
      shareId: share._id.toString(),
      shareToken: rawToken,
      expiresAt,
    };
  }

  /**
   * Validate and access an external share by raw token
   */
  static async validateAndAccessShare(rawToken: string, passcode?: string): Promise<{
    share: ILegalDocumentShare;
    document: typeof LegalDocument.prototype;
    version: typeof LegalDocumentVersion.prototype;
  }> {
    await connectToDatabase();
    const tokenHash = this.hashToken(rawToken);

    const share = await LegalDocumentShare.findOne({ tokenHash });
    if (!share) {
      throw new Error("NOT_FOUND: Invalid or expired share link.");
    }

    // Check revocation
    if (share.revokedAt) {
      throw new Error("REVOKED: This share link has been revoked by administration.");
    }

    // Check expiration
    if (new Date(share.expiresAt).getTime() < Date.now()) {
      throw new Error("EXPIRED: This share link has expired.");
    }

    // Check download limit
    if (share.downloadCount >= share.maxDownloads) {
      throw new Error("LIMIT_REACHED: Maximum download limit has been reached for this share link.");
    }

    // Check passcode if required
    if (share.passcodeHash) {
      if (!passcode || this.hashToken(passcode) !== share.passcodeHash) {
        throw new Error("UNAUTHORIZED: Incorrect or missing passcode.");
      }
    }

    const [doc, version] = await Promise.all([
      LegalDocument.findById(share.legalDocumentId),
      LegalDocumentVersion.findById(share.documentVersionId),
    ]);

    if (!doc || !version) {
      throw new Error("NOT_FOUND: Shared document or file version no longer exists.");
    }

    // Increment download count & record access
    await LegalDocumentShare.findByIdAndUpdate(share._id, {
      $inc: { downloadCount: 1 },
      lastAccessedAt: new Date(),
    });

    await LegalDocumentAccessLog.create({
      legalDocumentId: doc._id,
      documentVersionId: version._id,
      propertyId: doc.propertyId,
      actorType: "EXTERNAL_SHARE",
      shareId: share._id,
      action: "EXTERNAL_SHARE_ACCESSED",
      accessResult: "GRANTED",
    });

    return { share, document: doc, version };
  }

  /**
   * Revoke an active share immediately
   */
  static async revokeShare(shareId: string, reason: string, session: AdminSession): Promise<void> {
    await connectToDatabase();

    if (!["SUPER_ADMIN", "ADMIN"].includes(session.user.role)) {
      throw new Error("FORBIDDEN: Insufficient permissions to revoke document shares.");
    }

    const share = await LegalDocumentShare.findById(shareId);
    if (!share) {
      throw new Error("NOT_FOUND: Share not found.");
    }

    share.revokedAt = new Date();
    share.revokedBy = session.user.id;
    share.revocationReason = reason.trim();
    await share.save();

    await logAuditEvent({
      actor: session.user,
      action: "LEGAL_DOCUMENT_SHARE_REVOKED",
      targetPropertyId: share.propertyId,
      targetLegalDocumentId: share.legalDocumentId,
      reason: `Revoked external share: ${reason}`,
    });
  }
}

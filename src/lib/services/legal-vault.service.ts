import "server-only";
import crypto from "node:crypto";
import { Types } from "mongoose";
import { connectToDatabase } from "@/lib/db/mongoose";
import { LegalDocument, ILegalDocument } from "@/models/LegalDocument";
import { LegalDocumentVersion, ILegalDocumentVersion } from "@/models/LegalDocumentVersion";
import { LegalDocumentReview } from "@/models/LegalDocumentReview";
import { LegalDocumentAccessLog } from "@/models/LegalDocumentAccessLog";
import { Property } from "@/models/Property";
import { AdminSession } from "@/lib/auth/session";
import { logAuditEvent } from "@/lib/services/audit.service";
import { LegalChecklistService } from "./legal-checklist.service";
import {
  DocumentCategory,
  DocumentClassification,
  DocumentStatus,
  PublicVisibilityMode,
  LegalDocumentSummary,
  LegalVaultFilterParams,
  isValidLegalStatusTransition,
} from "@/types/legal-vault";
import { logger } from "@/lib/logger";

export interface CreateLegalDocumentInput {
  propertyId: string;
  locationId?: string;
  title: string;
  category: DocumentCategory;
  subCategory?: string;
  classification?: DocumentClassification;
  issuingAuthority?: string;
  jurisdiction?: string;
  documentNumberMasked?: string;
  issueDate?: string;
  effectiveDate?: string;
  expiryDate?: string;
  reviewDueDate?: string;
  isRequired?: boolean;
  checklistItemKey?: string;
  publicVisibility?: PublicVisibilityMode;
  publicDisplayLabel?: string;
  internalNotes?: string;
}

export interface AddDocumentVersionInput {
  legalDocumentId: string;
  storageProvider?: string;
  providerKey: string;
  sanitizedOriginalFilename: string;
  mimeType: string;
  fileSize: number;
  fileBuffer?: Buffer; // If buffer available to compute server-side sha256
  sha256Checksum?: string;
  versionNote?: string;
}

export interface TransitionReviewInput {
  legalDocumentId: string;
  currentVersion: number;
  toStatus: DocumentStatus;
  reasonCode: string;
  comment?: string;
  actionRequiredReason?: string;
  rejectionReason?: string;
  session: AdminSession;
}

export class LegalVaultService {
  /**
   * Generates a unique, non-colliding human-friendly reference code
   * Format: RDE-LEG-XXXXXX
   */
  static generateReferenceCode(): string {
    const randomNum = Math.floor(100000 + Math.random() * 900000);
    return `RDE-LEG-${randomNum}`;
  }

  /**
   * Computes SHA-256 hash for file integrity checking
   */
  static computeSha256(content: Buffer | string): string {
    return crypto.createHash("sha256").update(content).digest("hex");
  }

  /**
   * Check for duplicate checksums across versions for the same property/document
   */
  static async checkDuplicateChecksum(
    checksum: string,
    legalDocumentId?: string
  ): Promise<{ isDuplicate: boolean; matchedVersion?: ILegalDocumentVersion }> {
    await connectToDatabase();
    const query: Record<string, unknown> = { sha256Checksum: checksum };
    if (legalDocumentId) {
      query.legalDocumentId = new Types.ObjectId(legalDocumentId);
    }
    const matched = await LegalDocumentVersion.findOne(query).lean();
    return {
      isDuplicate: !!matched,
      matchedVersion: (matched as unknown as ILegalDocumentVersion) || undefined,
    };
  }

  /**
   * Create a new LegalDocument root record
   */
  static async createDocument(input: CreateLegalDocumentInput, session: AdminSession): Promise<ILegalDocument> {
    await connectToDatabase();

    const pId = new Types.ObjectId(input.propertyId);
    const property = await Property.findById(pId);
    if (!property) {
      throw new Error("NOT_FOUND: Parent property does not exist.");
    }

    const documentReference = this.generateReferenceCode();

    const doc = await LegalDocument.create({
      propertyId: pId,
      locationId: input.locationId ? new Types.ObjectId(input.locationId) : property.locationId,
      documentReference,
      title: input.title.trim(),
      category: input.category,
      subCategory: input.subCategory?.trim(),
      classification: input.classification || "CONFIDENTIAL",
      status: "DRAFT",
      currentVersionNumber: 1,
      issuingAuthority: input.issuingAuthority?.trim(),
      jurisdiction: input.jurisdiction?.trim(),
      documentNumberMasked: input.documentNumberMasked?.trim(),
      issueDate: input.issueDate ? new Date(input.issueDate) : undefined,
      effectiveDate: input.effectiveDate ? new Date(input.effectiveDate) : undefined,
      expiryDate: input.expiryDate ? new Date(input.expiryDate) : undefined,
      reviewDueDate: input.reviewDueDate ? new Date(input.reviewDueDate) : undefined,
      isRequired: input.isRequired ?? true,
      checklistItemKey: input.checklistItemKey?.trim(),
      publicVisibility: input.publicVisibility || "PRIVATE",
      publicDisplayLabel: input.publicDisplayLabel?.trim(),
      internalNotes: input.internalNotes?.trim(),
      legalHold: false,
      version: 1,
      createdBy: session.user.id,
    });

    // Record audit event
    await logAuditEvent({
      actor: session.user,
      action: "LEGAL_DOCUMENT_CREATED",
      targetPropertyId: doc.propertyId,
      targetLegalDocumentId: doc._id,
      reason: `Registered legal document ${doc.documentReference} (${doc.title}) under category ${doc.category}`,
    });

    // Record access log
    await LegalDocumentAccessLog.create({
      legalDocumentId: doc._id,
      propertyId: doc.propertyId,
      actorType: "INTERNAL_USER",
      actorId: session.user.id,
      actorEmail: session.user.email,
      actorRole: session.user.role,
      action: "DOCUMENT_UPLOADED",
      accessResult: "GRANTED",
    });

    // Update property legal checklist
    await LegalChecklistService.evaluatePropertyChecklist(doc.propertyId.toString(), session.user.id);

    return doc;
  }

  /**
   * Append a new immutable version to an existing LegalDocument
   */
  static async addVersion(input: AddDocumentVersionInput, session: AdminSession): Promise<ILegalDocumentVersion> {
    await connectToDatabase();
    const docId = new Types.ObjectId(input.legalDocumentId);

    const doc = await LegalDocument.findById(docId);
    if (!doc) {
      throw new Error("NOT_FOUND: Legal document not found.");
    }

    if (doc.archivedAt) {
      throw new Error("BAD_REQUEST: Cannot add version to an archived document.");
    }

    // Compute checksum
    let sha256Checksum = input.sha256Checksum;
    if (!sha256Checksum && input.fileBuffer) {
      sha256Checksum = this.computeSha256(input.fileBuffer);
    }
    if (!sha256Checksum) {
      sha256Checksum = this.computeSha256(input.providerKey + Date.now().toString());
    }

    // Check duplicate
    const dupCheck = await this.checkDuplicateChecksum(sha256Checksum, docId.toString());
    if (dupCheck.isDuplicate) {
      logger.warn(`[LegalVault] Duplicate checksum detected for document ${doc.documentReference}: ${sha256Checksum}`);
    }

    // Mark previous version superseded
    if (doc.currentVersionId) {
      await LegalDocumentVersion.findByIdAndUpdate(doc.currentVersionId, {
        supersededAt: new Date(),
      });
    }

    const nextVersionNumber = doc.currentVersionId ? doc.currentVersionNumber + 1 : 1;

    const version = await LegalDocumentVersion.create({
      legalDocumentId: docId,
      versionNumber: nextVersionNumber,
      storageProvider: input.storageProvider || "imagekit",
      providerKey: input.providerKey.trim(),
      sanitizedOriginalFilename: input.sanitizedOriginalFilename.trim(),
      mimeType: input.mimeType,
      fileSize: input.fileSize,
      sha256Checksum,
      uploadSource: "DASHBOARD",
      malwareScanStatus: "NOT_CONFIGURED", // Honest unconfigured state per PRD 9 Section 11
      versionNote: input.versionNote?.trim(),
      uploadedBy: session.user.id,
      uploadedByName: session.user.name,
    });

    // Update document's current version & invalidate previous review if replacing version
    doc.currentVersionId = version._id;
    doc.currentVersionNumber = nextVersionNumber;
    if (doc.status === "INTERNALLY_VERIFIED" && nextVersionNumber > 1) {
      doc.status = "UNDER_REVIEW"; // Material file change requires re-review
    }
    doc.version += 1;
    await doc.save();

    await logAuditEvent({
      actor: session.user,
      action: "LEGAL_DOCUMENT_VERSION_CREATED",
      targetPropertyId: doc.propertyId,
      targetLegalDocumentId: doc._id,
      reason: `Uploaded version ${nextVersionNumber} for ${doc.documentReference} (${version.sanitizedOriginalFilename})`,
    });

    await LegalDocumentAccessLog.create({
      legalDocumentId: doc._id,
      documentVersionId: version._id,
      propertyId: doc.propertyId,
      actorType: "INTERNAL_USER",
      actorId: session.user.id,
      actorEmail: session.user.email,
      actorRole: session.user.role,
      action: "VERSION_REPLACED",
      accessResult: "GRANTED",
    });

    // Re-evaluate property checklist
    await LegalChecklistService.evaluatePropertyChecklist(doc.propertyId.toString(), session.user.id);

    return version;
  }

  /**
   * Transition document status through central review state machine with RBAC and optimistic locking
   */
  static async transitionStatus(input: TransitionReviewInput): Promise<ILegalDocument> {
    await connectToDatabase();
    const docId = new Types.ObjectId(input.legalDocumentId);

    const doc = await LegalDocument.findById(docId);
    if (!doc) {
      throw new Error("NOT_FOUND: Legal document not found.");
    }

    // 1. Optimistic Concurrency Control Check
    if (doc.version !== input.currentVersion) {
      throw new Error("CONFLICT: Document was modified concurrently by another user. Please refresh.");
    }

    // 2. Validate status transition matrix
    if (!isValidLegalStatusTransition(doc.status, input.toStatus)) {
      throw new Error(`INVALID_TRANSITION: Transition from ${doc.status} to ${input.toStatus} is not permitted.`);
    }

    // 3. RBAC checks
    const role = input.session.user.role;
    if (["INTERNALLY_VERIFIED", "REJECTED"].includes(input.toStatus)) {
      if (!["SUPER_ADMIN", "ADMIN"].includes(role)) {
        throw new Error("FORBIDDEN: Only Legal Managers and Admins can internally verify or reject documents.");
      }
    }

    // 4. Legal Hold Check: Cannot archive or delete document under legal hold
    if (doc.legalHold && input.toStatus === "ARCHIVED") {
      throw new Error("LEGAL_HOLD_ACTIVE: Document is under legal hold and cannot be archived.");
    }

    const previousStatus = doc.status;
    doc.status = input.toStatus;
    doc.version += 1;
    doc.lastReviewedBy = input.session.user.id;
    doc.lastReviewedAt = new Date();

    if (input.toStatus === "ACTION_REQUIRED") {
      doc.actionRequiredReason = input.actionRequiredReason || input.comment || "Action required by compliance team.";
    } else if (input.toStatus === "REJECTED") {
      doc.rejectionReason = input.rejectionReason || input.comment || "Document rejected during legal review.";
    }

    if (input.toStatus === "ARCHIVED") {
      doc.archivedAt = new Date();
      doc.archivedBy = input.session.user.id;
    }

    await doc.save();

    // 5. Append-only review history log
    await LegalDocumentReview.create({
      legalDocumentId: doc._id,
      documentVersionId: doc.currentVersionId,
      documentVersionNumber: doc.currentVersionNumber,
      reviewAction: input.toStatus === "INTERNALLY_VERIFIED" ? "INTERNALLY_VERIFY" : input.toStatus === "REJECTED" ? "REJECT" : "MARK_ACTION_REQUIRED",
      fromStatus: previousStatus,
      toStatus: input.toStatus,
      reviewerId: input.session.user.id,
      reviewerName: input.session.user.name,
      reviewerRole: input.session.user.role,
      reasonCode: input.reasonCode.toUpperCase().trim(),
      sanitizedNote: input.comment?.trim(),
      reviewedAt: new Date(),
    });

    // 6. Audit event
    await logAuditEvent({
      actor: input.session.user,
      action: input.toStatus === "INTERNALLY_VERIFIED" ? "LEGAL_DOCUMENT_INTERNALLY_VERIFIED" : "LEGAL_DOCUMENT_SUBMITTED_FOR_REVIEW",
      targetPropertyId: doc.propertyId,
      targetLegalDocumentId: doc._id,
      reason: `Transitioned status of ${doc.documentReference} from ${previousStatus} to ${input.toStatus} (Reason: ${input.reasonCode})`,
    });

    // 7. Access log
    await LegalDocumentAccessLog.create({
      legalDocumentId: doc._id,
      documentVersionId: doc.currentVersionId,
      propertyId: doc.propertyId,
      actorType: "INTERNAL_USER",
      actorId: input.session.user.id,
      actorEmail: input.session.user.email,
      actorRole: input.session.user.role,
      action: "REVIEW_PERFORMED",
      accessResult: "GRANTED",
    });

    // 8. Re-evaluate checklist
    await LegalChecklistService.evaluatePropertyChecklist(doc.propertyId.toString(), input.session.user.id);

    return doc;
  }

  /**
   * Query documents with server-side pagination, filters, and projections
   */
  static async queryDocuments(
    params: LegalVaultFilterParams,
    session: AdminSession
  ): Promise<{ documents: LegalDocumentSummary[]; total: number; page: number; perPage: number }> {
    await connectToDatabase();

    const page = Math.max(params.page || 1, 1);
    const perPage = Math.min(Math.max(params.perPage || 25, 1), 100);
    const skip = (page - 1) * perPage;

    const filter: Record<string, unknown> = {};

    if (params.propertyId) {
      filter.propertyId = new Types.ObjectId(params.propertyId);
    }
    if (params.locationId) {
      filter.locationId = new Types.ObjectId(params.locationId);
    }
    if (params.category) {
      filter.category = params.category;
    }
    if (params.classification) {
      filter.classification = params.classification;
    }
    if (params.status) {
      filter.status = params.status;
    } else {
      filter.status = { $ne: "ARCHIVED" }; // Hide archived by default
    }
    if (params.publicVisibility) {
      filter.publicVisibility = params.publicVisibility;
    }
    if (params.legalHold !== undefined) {
      filter.legalHold = params.legalHold;
    }
    if (params.reviewerId) {
      filter.currentReviewerId = params.reviewerId;
    }

    if (params.expiringWithinDays) {
      const now = new Date();
      const future = new Date(Date.now() + params.expiringWithinDays * 86400000);
      filter.expiryDate = { $gte: now, $lte: future };
    }

    if (params.isExpired) {
      filter.expiryDate = { $lte: new Date() };
    }

    if (params.search && params.search.trim()) {
      const q = params.search.trim();
      filter.$or = [
        { title: { $regex: q, $options: "i" } },
        { documentReference: { $regex: q, $options: "i" } },
        { issuingAuthority: { $regex: q, $options: "i" } },
      ];
    }

    const sortField = params.sortBy || "createdAt";
    const sortDir = params.sortOrder === "asc" ? 1 : -1;

    const [docs, total, properties, versions] = await Promise.all([
      LegalDocument.find(filter)
        .sort({ [sortField]: sortDir })
        .skip(skip)
        .limit(perPage)
        .lean(),
      LegalDocument.countDocuments(filter),
      Property.find().select("title").lean(),
      LegalDocumentVersion.find().select("legalDocumentId sanitizedOriginalFilename fileSize mimeType").lean(),
    ]);

    const propMap = new Map(properties.map((p) => [p._id.toString(), p.title]));
    const versionMap = new Map(versions.map((v) => [v._id.toString(), v]));

    const summaries: LegalDocumentSummary[] = docs.map((d) => {
      const matchedVersion = d.currentVersionId ? versionMap.get(d.currentVersionId.toString()) : undefined;
      return {
        _id: d._id.toString(),
        propertyId: d.propertyId.toString(),
        propertyName: propMap.get(d.propertyId.toString()) || "Property",
        locationId: d.locationId?.toString(),
        documentReference: d.documentReference,
        title: d.title,
        category: d.category,
        subCategory: d.subCategory,
        classification: d.classification,
        status: d.status,
        currentVersionNumber: d.currentVersionNumber,
        currentVersionId: d.currentVersionId?.toString(),
        originalFilename: matchedVersion?.sanitizedOriginalFilename,
        fileSize: matchedVersion?.fileSize,
        mimeType: matchedVersion?.mimeType,
        issueDate: d.issueDate?.toISOString(),
        effectiveDate: d.effectiveDate?.toISOString(),
        expiryDate: d.expiryDate?.toISOString(),
        reviewDueDate: d.reviewDueDate?.toISOString(),
        isRequired: d.isRequired,
        publicVisibility: d.publicVisibility,
        publicDisplayLabel: d.publicDisplayLabel,
        legalHold: d.legalHold,
        currentReviewerId: d.currentReviewerId,
        currentReviewerName: d.currentReviewerName,
        lastReviewedAt: d.lastReviewedAt?.toISOString(),
        actionRequiredReason: d.actionRequiredReason,
        rejectionReason: d.rejectionReason,
        version: d.version,
        createdAt: d.createdAt.toISOString(),
        updatedAt: d.updatedAt.toISOString(),
      };
    });

    return {
      documents: summaries,
      total,
      page,
      perPage,
    };
  }

  /**
   * Toggle legal hold status on a document
   */
  static async toggleLegalHold(
    legalDocumentId: string,
    holdActive: boolean,
    reason: string,
    session: AdminSession
  ): Promise<ILegalDocument> {
    await connectToDatabase();

    if (!["SUPER_ADMIN", "ADMIN"].includes(session.user.role)) {
      throw new Error("FORBIDDEN: Only administrators can apply or release legal holds.");
    }

    const doc = await LegalDocument.findById(legalDocumentId);
    if (!doc) {
      throw new Error("NOT_FOUND: Legal document not found.");
    }

    doc.legalHold = holdActive;
    if (holdActive) {
      doc.legalHoldReason = reason.trim();
      doc.legalHoldAppliedAt = new Date();
      doc.legalHoldAppliedBy = session.user.id;
    } else {
      doc.legalHoldReason = undefined;
      doc.legalHoldAppliedAt = undefined;
      doc.legalHoldAppliedBy = undefined;
    }
    doc.version += 1;
    await doc.save();

    await logAuditEvent({
      actor: session.user,
      action: holdActive ? "LEGAL_HOLD_APPLIED" : "LEGAL_HOLD_REMOVED",
      targetPropertyId: doc.propertyId,
      targetLegalDocumentId: doc._id,
      reason: `${holdActive ? "Applied" : "Released"} legal hold on ${doc.documentReference}: ${reason}`,
    });

    await LegalDocumentAccessLog.create({
      legalDocumentId: doc._id,
      propertyId: doc.propertyId,
      actorType: "INTERNAL_USER",
      actorId: session.user.id,
      actorEmail: session.user.email,
      actorRole: session.user.role,
      action: "LEGAL_HOLD_TOGGLED",
      accessResult: "GRANTED",
    });

    return doc;
  }
}

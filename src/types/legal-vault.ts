/**
 * @file legal-vault.ts
 * @description Domain types, enums, classification constants, and central
 * status transition policy for PRD 9: Secure Legal Vault & Compliance.
 */

// ─── 1. Document Classifications ───────────────────────────────────────────────

export const DOCUMENT_CLASSIFICATIONS = [
  "INTERNAL",
  "CONFIDENTIAL",
  "RESTRICTED",
  "PUBLIC_APPROVED",
] as const;

export type DocumentClassification = (typeof DOCUMENT_CLASSIFICATIONS)[number];

// ─── 2. Document Lifecycle Statuses ────────────────────────────────────────────

export const DOCUMENT_STATUSES = [
  "DRAFT",
  "UPLOADING",
  "QUARANTINED",
  "SCAN_PENDING",
  "UNDER_REVIEW",
  "ACTION_REQUIRED",
  "INTERNALLY_VERIFIED",
  "REJECTED",
  "EXPIRED",
  "SUPERSEDED",
  "ARCHIVED",
] as const;

export type DocumentStatus = (typeof DOCUMENT_STATUSES)[number];

// ─── 3. Document Categories ───────────────────────────────────────────────────

export const DOCUMENT_CATEGORIES = [
  "OWNERSHIP_TITLE",
  "TITLE_CHAIN",
  "ENCUMBRANCE_NOC",
  "RERA_REGISTRATION",
  "LAYOUT_APPROVAL",
  "BUILDING_APPROVAL",
  "LAND_USE_CONVERSION",
  "COMMENCEMENT_CERT",
  "COMPLETION_OCCUPANCY",
  "FIRE_SAFETY_NOC",
  "ENVIRONMENTAL_CLEARANCE",
  "TAX_RECEIPTS",
  "SOCIETY_NOC",
  "DEVELOPER_AUTHORIZATION",
  "POWER_OF_ATTORNEY",
  "AGREEMENT_TEMPLATE",
  "DISCLOSURE_DOCS",
  "OTHER_SUPPORTING",
] as const;

export type DocumentCategory = (typeof DOCUMENT_CATEGORIES)[number];

// ─── 4. Public Visibility Modes ───────────────────────────────────────────────

export const PUBLIC_VISIBILITY_MODES = [
  "PRIVATE",
  "PUBLIC_SUMMARY",
  "PUBLIC_DOWNLOAD",
] as const;

export type PublicVisibilityMode = (typeof PUBLIC_VISIBILITY_MODES)[number];

// ─── 5. Malware Scan Statuses ─────────────────────────────────────────────────

export const MALWARE_SCAN_STATUSES = [
  "NOT_CONFIGURED",
  "PENDING",
  "CLEAN",
  "INFECTED",
  "QUARANTINED",
] as const;

export type MalwareScanStatus = (typeof MALWARE_SCAN_STATUSES)[number];

// ─── 6. Checklist Item Statuses ───────────────────────────────────────────────

export const CHECKLIST_ITEM_STATUSES = [
  "NOT_APPLICABLE",
  "NOT_PROVIDED",
  "UPLOADED",
  "UNDER_REVIEW",
  "ACTION_REQUIRED",
  "INTERNALLY_VERIFIED",
  "EXPIRED",
  "REJECTED",
] as const;

export type ChecklistItemStatus = (typeof CHECKLIST_ITEM_STATUSES)[number];

// ─── 7. Document Access Action Types ──────────────────────────────────────────

export const ACCESS_LOG_ACTIONS = [
  "METADATA_VIEWED",
  "PREVIEW_REQUESTED",
  "DOWNLOAD_REQUESTED",
  "EXTERNAL_SHARE_ACCESSED",
  "DOCUMENT_UPLOADED",
  "VERSION_REPLACED",
  "REVIEW_PERFORMED",
  "VISIBILITY_CHANGED",
  "SHARE_CREATED",
  "SHARE_REVOKED",
  "DOCUMENT_ARCHIVED",
  "DOCUMENT_RESTORED",
  "LEGAL_HOLD_TOGGLED",
] as const;

export type AccessLogAction = (typeof ACCESS_LOG_ACTIONS)[number];

// ─── 8. Status Transition Matrix ──────────────────────────────────────────────

export const PERMITTED_LEGAL_STATUS_TRANSITIONS: Record<DocumentStatus, DocumentStatus[]> = {
  DRAFT: ["UPLOADING", "UNDER_REVIEW", "ARCHIVED"],
  UPLOADING: ["QUARANTINED", "SCAN_PENDING", "DRAFT", "UNDER_REVIEW"],
  QUARANTINED: ["SCAN_PENDING", "REJECTED", "ARCHIVED"],
  SCAN_PENDING: ["DRAFT", "UNDER_REVIEW", "QUARANTINED", "REJECTED"],
  UNDER_REVIEW: ["INTERNALLY_VERIFIED", "ACTION_REQUIRED", "REJECTED", "ARCHIVED"],
  ACTION_REQUIRED: ["UNDER_REVIEW", "UPLOADING", "ARCHIVED"],
  INTERNALLY_VERIFIED: ["EXPIRED", "ACTION_REQUIRED", "UNDER_REVIEW", "SUPERSEDED", "ARCHIVED"],
  REJECTED: ["UNDER_REVIEW", "DRAFT", "ARCHIVED"],
  EXPIRED: ["UNDER_REVIEW", "ACTION_REQUIRED", "SUPERSEDED", "ARCHIVED"],
  SUPERSEDED: ["ARCHIVED"],
  ARCHIVED: ["DRAFT", "UNDER_REVIEW"], // Un-archive to draft or under review
};

/**
 * Validates whether a requested status transition is legally permitted.
 */
export function isValidLegalStatusTransition(from: DocumentStatus, to: DocumentStatus): boolean {
  if (from === to) return true;
  const allowed = PERMITTED_LEGAL_STATUS_TRANSITIONS[from];
  return allowed ? allowed.includes(to) : false;
}

// ─── 9. Summary & Filtering Interfaces ────────────────────────────────────────

export interface LegalDocumentSummary {
  _id: string;
  propertyId: string;
  propertyName?: string;
  locationId?: string;
  documentReference: string;
  title: string;
  category: DocumentCategory;
  subCategory?: string;
  classification: DocumentClassification;
  status: DocumentStatus;
  currentVersionNumber: number;
  currentVersionId?: string;
  originalFilename?: string;
  fileSize?: number;
  mimeType?: string;
  issueDate?: string;
  effectiveDate?: string;
  expiryDate?: string;
  reviewDueDate?: string;
  isRequired: boolean;
  publicVisibility: PublicVisibilityMode;
  publicDisplayLabel?: string;
  legalHold: boolean;
  currentReviewerId?: string;
  currentReviewerName?: string;
  lastReviewedAt?: string;
  actionRequiredReason?: string;
  rejectionReason?: string;
  version: number;
  createdAt: string;
  updatedAt: string;
}

export interface LegalVaultFilterParams {
  propertyId?: string;
  locationId?: string;
  category?: DocumentCategory;
  classification?: DocumentClassification;
  status?: DocumentStatus;
  publicVisibility?: PublicVisibilityMode;
  search?: string;
  expiringWithinDays?: number;
  isExpired?: boolean;
  legalHold?: boolean;
  reviewerId?: string;
  page?: number;
  perPage?: number;
  sortBy?: "createdAt" | "expiryDate" | "reviewDueDate" | "title" | "status";
  sortOrder?: "asc" | "desc";
}

export interface PropertyReadinessSummary {
  propertyId: string;
  propertyName: string;
  totalApplicableChecklistItems: number;
  providedDocumentsCount: number;
  internallyVerifiedCount: number;
  underReviewCount: number;
  actionRequiredCount: number;
  rejectedCount: number;
  expiredCount: number;
  missingCount: number;
  expiringSoonCount: number;
  publicApprovedCount: number;
  readinessPercentage: number;
  lastReviewedAt?: string;
  legalHoldActive: boolean;
}

/**
 * @file kyc.ts
 * @description Strongly typed domain definitions, customer party structures,
 * applicant models, KYC case state machines, versioned requirement templates,
 * document classifications, verification event types, privacy-safe records,
 * and submission session contracts for PRD 15: Customer KYC & Verification.
 */

// ─── 1. Customer Party & Applicant Types ─────────────────────────────────────

export const CUSTOMER_PARTY_TYPES = [
  "INDIVIDUAL",
  "JOINT_APPLICANTS",
  "COMPANY",
  "PARTNERSHIP",
  "TRUST",
  "HUF",
  "OTHER",
] as const;
export type CustomerPartyType = (typeof CUSTOMER_PARTY_TYPES)[number];

export const APPLICANT_ROLES = [
  "PRIMARY",
  "JOINT",
  "AUTHORIZED_SIGNATORY",
  "BENEFICIAL_OWNER",
  "GUARDIAN",
  "OTHER",
] as const;
export type ApplicantRole = (typeof APPLICANT_ROLES)[number];

export const APPLICANT_KYC_STATUSES = [
  "PENDING",
  "DOCUMENTS_SUBMITTED",
  "UNDER_REVIEW",
  "ACTION_REQUIRED",
  "VERIFIED",
  "REJECTED",
  "EXPIRED",
] as const;
export type ApplicantKycStatus = (typeof APPLICANT_KYC_STATUSES)[number];

// ─── 2. KYC Case Lifecycle & Statuses ────────────────────────────────────────

export const KYC_CASE_STATUSES = [
  "NOT_STARTED",
  "NOTICE_PENDING",
  "CONSENT_PENDING",
  "IN_PROGRESS",
  "SUBMITTED",
  "UNDER_REVIEW",
  "ACTION_REQUIRED",
  "INTERNALLY_VERIFIED",
  "PROVIDER_VERIFIED",
  "COMPLETED",
  "REJECTED",
  "EXPIRED",
  "SUSPENDED",
  "ARCHIVED",
] as const;
export type KycCaseStatus = (typeof KYC_CASE_STATUSES)[number];

export const PERMITTED_KYC_CASE_TRANSITIONS: Record<KycCaseStatus, KycCaseStatus[]> = {
  NOT_STARTED: ["NOTICE_PENDING", "CONSENT_PENDING", "IN_PROGRESS", "ARCHIVED"],
  NOTICE_PENDING: ["CONSENT_PENDING", "IN_PROGRESS", "SUSPENDED", "ARCHIVED"],
  CONSENT_PENDING: ["IN_PROGRESS", "SUSPENDED", "ARCHIVED"],
  IN_PROGRESS: ["SUBMITTED", "UNDER_REVIEW", "SUSPENDED", "EXPIRED", "ARCHIVED"],
  SUBMITTED: ["UNDER_REVIEW", "ACTION_REQUIRED", "REJECTED", "SUSPENDED"],
  UNDER_REVIEW: [
    "ACTION_REQUIRED",
    "INTERNALLY_VERIFIED",
    "PROVIDER_VERIFIED",
    "COMPLETED",
    "REJECTED",
    "SUSPENDED",
  ],
  ACTION_REQUIRED: ["SUBMITTED", "UNDER_REVIEW", "REJECTED", "EXPIRED", "SUSPENDED"],
  INTERNALLY_VERIFIED: ["PROVIDER_VERIFIED", "COMPLETED", "ACTION_REQUIRED", "REJECTED", "SUSPENDED"],
  PROVIDER_VERIFIED: ["COMPLETED", "ACTION_REQUIRED", "REJECTED", "SUSPENDED"],
  COMPLETED: ["UNDER_REVIEW", "EXPIRED", "ARCHIVED"], // Re-opening allowed under controlled workflow
  REJECTED: ["IN_PROGRESS", "UNDER_REVIEW", "ARCHIVED"],
  EXPIRED: ["IN_PROGRESS", "UNDER_REVIEW", "ARCHIVED"],
  SUSPENDED: ["IN_PROGRESS", "UNDER_REVIEW", "ARCHIVED"],
  ARCHIVED: ["IN_PROGRESS"],
};

export function isValidKycCaseTransition(from: KycCaseStatus, to: KycCaseStatus): boolean {
  if (from === to) return true;
  const allowed = PERMITTED_KYC_CASE_TRANSITIONS[from];
  return allowed ? allowed.includes(to) : false;
}

// ─── 3. KYC Document Types & Classification ──────────────────────────────────

export const KYC_DOCUMENT_TYPES = [
  "PAN_CARD",
  "PASSPORT",
  "VOTER_ID",
  "DRIVING_LICENCE",
  "AADHAAR_OFFLINE_XML",
  "AADHAAR_MASKED_CARD",
  "ADDRESS_PROOF_UTILITY_BILL",
  "ADDRESS_PROOF_BANK_STATEMENT",
  "PASSPORT_PHOTOGRAPH",
  "CERTIFICATE_OF_INCORPORATION",
  "MEMORANDUM_OF_ASSOCIATION",
  "ARTICLES_OF_ASSOCIATION",
  "BOARD_RESOLUTION",
  "PARTNERSHIP_DEED",
  "TRUST_DEED",
  "HUF_DECLARATION",
  "POWER_OF_ATTORNEY",
  "OTHER_APPROVED_EVIDENCE",
] as const;
export type KycDocumentType = (typeof KYC_DOCUMENT_TYPES)[number];

export const KYC_DOCUMENT_STATUSES = [
  "REQUESTED",
  "UPLOADING",
  "QUARANTINED",
  "SCAN_PENDING",
  "UPLOADED",
  "UNDER_REVIEW",
  "ACTION_REQUIRED",
  "INTERNALLY_VERIFIED",
  "PROVIDER_VERIFIED",
  "REJECTED",
  "EXPIRED",
  "SUPERSEDED",
  "ARCHIVED",
] as const;
export type KycDocumentStatus = (typeof KYC_DOCUMENT_STATUSES)[number];

export const PERMITTED_DOCUMENT_STATUS_TRANSITIONS: Record<KycDocumentStatus, KycDocumentStatus[]> = {
  REQUESTED: ["UPLOADING", "UPLOADED", "QUARANTINED", "ARCHIVED"],
  UPLOADING: ["QUARANTINED", "SCAN_PENDING", "UPLOADED", "REJECTED"],
  QUARANTINED: ["SCAN_PENDING", "UPLOADED", "REJECTED", "ARCHIVED"],
  SCAN_PENDING: ["UPLOADED", "REJECTED", "QUARANTINED"],
  UPLOADED: ["UNDER_REVIEW", "SUPERSEDED", "ARCHIVED"],
  UNDER_REVIEW: [
    "ACTION_REQUIRED",
    "INTERNALLY_VERIFIED",
    "PROVIDER_VERIFIED",
    "REJECTED",
    "SUPERSEDED",
  ],
  ACTION_REQUIRED: ["UPLOADING", "UPLOADED", "SUPERSEDED", "REJECTED", "ARCHIVED"],
  INTERNALLY_VERIFIED: ["PROVIDER_VERIFIED", "EXPIRED", "SUPERSEDED", "ACTION_REQUIRED"],
  PROVIDER_VERIFIED: ["EXPIRED", "SUPERSEDED", "ACTION_REQUIRED"],
  REJECTED: ["UPLOADING", "UPLOADED", "SUPERSEDED", "ARCHIVED"],
  EXPIRED: ["REQUESTED", "UPLOADING", "SUPERSEDED", "ARCHIVED"],
  SUPERSEDED: ["ARCHIVED"],
  ARCHIVED: [],
};

export function isValidDocumentStatusTransition(from: KycDocumentStatus, to: KycDocumentStatus): boolean {
  if (from === to) return true;
  const allowed = PERMITTED_DOCUMENT_STATUS_TRANSITIONS[from];
  return allowed ? allowed.includes(to) : false;
}

// ─── 4. Verification Methods & Events ────────────────────────────────────────

export const VERIFICATION_METHODS = [
  "FORMAT_CHECK",
  "INTERNAL_VISUAL_REVIEW",
  "DOCUMENT_MATCH",
  "UIDAI_OFFLINE_SIGNATURE",
  "AUTHORIZED_PROVIDER",
  "EXPIRY_REVIEW",
  "MANUAL_OVERRIDE",
] as const;
export type VerificationMethod = (typeof VERIFICATION_METHODS)[number];

export const VERIFICATION_RESULTS = [
  "PASSED",
  "FAILED",
  "INCONCLUSIVE",
  "ACTION_REQUIRED",
  "EXPIRED",
  "OVERRIDDEN",
] as const;
export type VerificationResult = (typeof VERIFICATION_RESULTS)[number];

// ─── 5. Privacy, Notice & Consent ────────────────────────────────────────────

export const DPDPA_PROCESSING_BASES = [
  "EXPLICIT_CONSENT",
  "CONTRACTUAL_NECESSITY",
  "LEGAL_OBLIGATION",
  "LEGITIMATE_USE",
] as const;
export type DpdpaProcessingBasis = (typeof DPDPA_PROCESSING_BASES)[number];

export const PRIVACY_REQUEST_TYPES = [
  "ACCESS",
  "CORRECTION",
  "UPDATE",
  "ERASURE",
  "CONSENT_WITHDRAWAL",
  "GRIEVANCE",
] as const;
export type PrivacyRequestType = (typeof PRIVACY_REQUEST_TYPES)[number];

export const PRIVACY_REQUEST_STATUSES = [
  "RECEIVED",
  "IDENTITY_VERIFICATION_PENDING",
  "UNDER_ASSESSMENT",
  "APPROVED_IN_PROGRESS",
  "COMPLETED",
  "REJECTED_LEGAL_EXCEPTION",
  "WITHDRAWN",
] as const;
export type PrivacyRequestStatus = (typeof PRIVACY_REQUEST_STATUSES)[number];

// ─── 6. Retention & Legal Holds ──────────────────────────────────────────────

export const RETENTION_CATEGORIES = [
  "KYC_TRANSACTIONAL_BUYER", // Kept during transaction + statutory tax/PMLA period
  "KYC_UNCONFIRMED_PROSPECT", // Short retention for non-transacting leads
  "IDENTITY_DOCUMENT_SCAN",
  "VERIFICATION_AUDIT_LOG",
  "PRIVACY_REQUEST_RECORD",
] as const;
export type RetentionCategory = (typeof RETENTION_CATEGORIES)[number];

export const DISPOSAL_ACTIONS = [
  "SCHEDULED",
  "LEGAL_HOLD_APPLIED",
  "CRYPTO_SHREDDED",
  "FILE_DELETED",
  "RECORD_ANONYMIZED",
  "PURGED",
] as const;
export type DisposalAction = (typeof DISPOSAL_ACTIONS)[number];

// ─── 7. Requirement Template Specifications ─────────────────────────────────

export interface IKycRequirementItem {
  key: string;
  displayName: string;
  purpose: string;
  documentType: KycDocumentType;
  required: boolean;
  acceptedEvidenceNotes: string;
  applicableRoles: ApplicantRole[];
  allowsExpiry: boolean;
  maskingRule: "MASK_ALL_BUT_LAST_4" | "PAN_MASK_MIDDLE" | "NONE";
  retentionCategory: RetentionCategory;
  displayOrder: number;
}

export interface IKycRequirementTemplateDef {
  templateKey: string;
  name: string;
  partyType: CustomerPartyType;
  version: number;
  description: string;
  requirements: IKycRequirementItem[];
  defaultExpiryDays?: number;
}

// ─── 8. Submission Session ───────────────────────────────────────────────────

export const SUBMISSION_SESSION_STATUSES = [
  "ACTIVE",
  "COMPLETED",
  "EXPIRED",
  "REVOKED",
] as const;
export type SubmissionSessionStatus = (typeof SUBMISSION_SESSION_STATUSES)[number];

// ─── 9. Filter & DTO Interfaces ──────────────────────────────────────────────

export interface KycCaseFilterParams {
  status?: KycCaseStatus | "ALL";
  propertyId?: string;
  partyType?: CustomerPartyType;
  assignedReviewerId?: string;
  blockingBookingOnly?: boolean;
  searchQuery?: string;
  expiringWithinDays?: number;
  page?: number;
  limit?: number;
}

export interface KycOverviewMetrics {
  totalCases: number;
  notStarted: number;
  inProgress: number;
  submitted: number;
  underReview: number;
  actionRequired: number;
  completed: number;
  rejected: number;
  expired: number;
  blockingBookingCount: number;
  pendingPrivacyRequests: number;
  avgReviewTimeHours: number;
}

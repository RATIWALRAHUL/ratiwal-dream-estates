/**
 * @file partner.ts
 * @description Domain types, enums, lifecycle statuses, and interfaces for PRD 18:
 * Channel Partners, Brokers, Lead Attribution & Compliance Management.
 */

// ─── 1. Partner Types ─────────────────────────────────────────────────────────

export const PARTNER_TYPES = [
  "INDIVIDUAL_BROKER",
  "REAL_ESTATE_AGENT",
  "AGENCY",
  "CHANNEL_PARTNER",
  "CORPORATE_PARTNER",
  "REFERRAL_PARTNER",
  "OTHER_APPROVED",
] as const;

export type PartnerType = (typeof PARTNER_TYPES)[number];

// ─── 2. Partner Lifecycle Statuses ────────────────────────────────────────────

export const PARTNER_STATUSES = [
  "DRAFT",
  "INVITED",
  "ONBOARDING",
  "UNDER_REVIEW",
  "ACTION_REQUIRED",
  "APPROVED",
  "ACTIVE",
  "SUSPENDED",
  "REJECTED",
  "EXPIRED",
  "DEACTIVATED",
  "ARCHIVED",
] as const;

export type PartnerStatus = (typeof PARTNER_STATUSES)[number];

export const PERMITTED_PARTNER_TRANSITIONS: Record<PartnerStatus, PartnerStatus[]> = {
  DRAFT: ["INVITED", "ONBOARDING", "ARCHIVED"],
  INVITED: ["ONBOARDING", "EXPIRED", "ARCHIVED"],
  ONBOARDING: ["UNDER_REVIEW", "ACTION_REQUIRED", "ARCHIVED"],
  UNDER_REVIEW: ["APPROVED", "ACTION_REQUIRED", "REJECTED"],
  ACTION_REQUIRED: ["UNDER_REVIEW", "REJECTED", "ARCHIVED"],
  APPROVED: ["ACTIVE", "SUSPENDED", "ARCHIVED"],
  ACTIVE: ["SUSPENDED", "DEACTIVATED", "EXPIRED"],
  SUSPENDED: ["ACTIVE", "DEACTIVATED", "ARCHIVED"],
  REJECTED: ["ARCHIVED"],
  EXPIRED: ["ONBOARDING", "ARCHIVED"],
  DEACTIVATED: ["ACTIVE", "ARCHIVED"],
  ARCHIVED: [],
};

export function isValidPartnerStatusTransition(from: PartnerStatus, to: PartnerStatus): boolean {
  if (from === to) return true;
  const allowed = PERMITTED_PARTNER_TRANSITIONS[from];
  return allowed ? allowed.includes(to) : false;
}

// ─── 3. Compliance & RERA Verification Statuses ───────────────────────────────

export const PARTNER_RERA_STATUSES = [
  "NOT_REQUIRED",
  "NOT_PROVIDED",
  "UNDER_REVIEW",
  "INTERNALLY_REVIEWED",
  "OFFICIAL_SOURCE_VERIFIED",
  "ACTION_REQUIRED",
  "EXPIRED",
  "REJECTED",
] as const;

export type PartnerReraStatus = (typeof PARTNER_RERA_STATUSES)[number];

export const PARTNER_AGREEMENT_STATUSES = [
  "DRAFT",
  "SENT",
  "ACCEPTED",
  "ACTIVE",
  "EXPIRED",
  "TERMINATED",
  "SUPERSEDED",
] as const;

export type PartnerAgreementStatus = (typeof PARTNER_AGREEMENT_STATUSES)[number];

export const PARTNER_INVITATION_STATUSES = [
  "PENDING",
  "ACCEPTED",
  "EXPIRED",
  "REVOKED",
  "SUPERSEDED",
] as const;

export type PartnerInvitationStatus = (typeof PARTNER_INVITATION_STATUSES)[number];

export const PARTNER_LEAD_SUBMISSION_STATUSES = [
  "DRAFT",
  "SUBMITTED",
  "PENDING_DEDUPLICATION",
  "ACCEPTED",
  "DUPLICATE",
  "CONFLICT",
  "REJECTED",
  "EXPIRED",
  "CONVERTED",
] as const;

export type PartnerLeadSubmissionStatus = (typeof PARTNER_LEAD_SUBMISSION_STATUSES)[number];

export const LEAD_ATTRIBUTION_STATUSES = [
  "PENDING",
  "ACCEPTED",
  "REJECTED",
  "CONFLICT",
  "UNDER_REVIEW",
  "EXPIRED",
  "OVERRIDDEN",
] as const;

export type LeadAttributionStatus = (typeof LEAD_ATTRIBUTION_STATUSES)[number];

// ─── 4. Partner Session & Scope Types ─────────────────────────────────────────

export interface PartnerUser {
  id: string; // PartnerAccount ID
  partnerId: string; // ChannelPartner ID
  email: string;
  name: string;
  phone?: string;
  partnerType: PartnerType;
  partnerCode: string;
  companyName: string;
  isActive: boolean;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  complianceStatus: PartnerStatus;
  lastLoginAt?: string;
}

export interface PartnerSession {
  user: PartnerUser;
  token: string;
  expiresAt: number;
}

export interface PartnerScope {
  partnerId: string;
  partnerCode: string;
  accountId: string;
  partnerType: PartnerType;
  status: PartnerStatus;
  authorizedPropertyIds: string[];
  submissionIds: string[];
  attributionClaimIds: string[];
}

export interface PartnerProfileDTO {
  partner: any;
  account: any;
  reraRegistration: any;
  taxProfile: any;
  payoutProfile: any;
  agreement: any;
  propertyAccessGrants: any[];
}

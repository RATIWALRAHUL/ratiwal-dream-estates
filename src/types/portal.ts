import { Types } from "mongoose";

export const PORTAL_ACCESS_ROLES = [
  "PRIMARY_CUSTOMER",
  "JOINT_APPLICANT",
  "AUTHORIZED_REPRESENTATIVE",
] as const;
export type PortalAccessRole = (typeof PORTAL_ACCESS_ROLES)[number];

export const PORTAL_ACCESS_STATUSES = ["ACTIVE", "SUSPENDED", "REVOKED"] as const;
export type PortalAccessStatus = (typeof PORTAL_ACCESS_STATUSES)[number];

export const PORTAL_INVITATION_STATUSES = [
  "PENDING",
  "ACCEPTED",
  "EXPIRED",
  "REVOKED",
  "SUPERSEDED",
] as const;
export type PortalInvitationStatus = (typeof PORTAL_INVITATION_STATUSES)[number];

export const SUPPORT_CATEGORIES = [
  "BOOKING_QUERY",
  "PAYMENT_AND_RECEIPTS",
  "KYC_DOCUMENTATION",
  "SITE_VISIT",
  "CONVEYANCE_AND_REGISTRATION",
  "TECHNICAL_ISSUE",
  "GENERAL_INQUIRY",
] as const;
export type SupportCategory = (typeof SUPPORT_CATEGORIES)[number];

export const SUPPORT_PRIORITIES = ["LOW", "NORMAL", "HIGH", "URGENT"] as const;
export type SupportPriority = (typeof SUPPORT_PRIORITIES)[number];

export const SUPPORT_STATUSES = [
  "OPEN",
  "ASSIGNED",
  "AWAITING_CUSTOMER",
  "IN_PROGRESS",
  "RESOLVED",
  "CLOSED",
  "REOPENED",
] as const;
export type SupportStatus = (typeof SUPPORT_STATUSES)[number];

/**
 * Authenticated Customer User Interface
 */
export interface CustomerUser {
  id: string; // CustomerPortalAccount ObjectId
  email: string;
  phone?: string;
  name: string;
  isActive: boolean;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  lastLoginAt?: string;
  mfaEnabled?: boolean;
}

/**
 * Customer Session Object (stored in secure HTTP-only cookie)
 */
export interface CustomerSession {
  user: CustomerUser;
  expiresAt: string;
  token?: string;
}

/**
 * Customer Scope resolved from CustomerPortalAccess records
 */
export interface CustomerScope {
  accountId: string;
  partyIds: string[]; // CustomerParty IDs
  bookingIds: string[]; // Authorized Booking IDs
  applicantIds: string[]; // KycApplicant IDs
  accessRoles: Record<string, PortalAccessRole>; // partyId -> role
}

/**
 * Message in a Customer Support Request thread
 */
export interface ISupportMessage {
  senderType: "CUSTOMER" | "STAFF";
  senderId: string;
  senderName: string;
  message: string;
  attachmentKeys?: string[];
  sentAt: Date | string;
}

/**
 * Customer Profile View DTO
 */
export interface CustomerProfileDTO {
  name: string;
  emailMasked: string;
  phoneMasked: string;
  partyReference?: string;
  linkedBookingsCount: number;
  communicationPreferences: {
    transactionalEmail: boolean;
    transactionalWhatsapp: boolean;
    marketingConsent: boolean;
    preferredLanguage: string;
  };
  security: {
    lastLoginAt?: string;
    mfaEnabled: boolean;
  };
}

/**
 * @file deal.ts
 * @description Strongly typed domain definitions, stages, status transition rules,
 * offer schemas, hold constraints, and data transfer types for PRD 14:
 * Deals, Inventory Holds, Reservations & Booking Management.
 */

// ─── 1. Deal Stages & Lifecycle ──────────────────────────────────────────────

export const DEAL_STAGES = [
  "DRAFT",
  "QUALIFICATION",
  "NEGOTIATION",
  "OFFER_PENDING_APPROVAL",
  "OFFER_APPROVED",
  "HOLD_PENDING",
  "ON_HOLD",
  "RESERVED",
  "BOOKING_REQUIREMENTS_PENDING",
  "BOOKED",
  "WON",
  "LOST",
  "CANCELLED",
  "ARCHIVED",
] as const;

export type DealStage = (typeof DEAL_STAGES)[number];

export const DEAL_PRIORITIES = ["LOW", "NORMAL", "HIGH", "URGENT"] as const;
export type DealPriority = (typeof DEAL_PRIORITIES)[number];

export const DEAL_SOURCES = [
  "DIRECT_INQUIRY",
  "SITE_VISIT_CONVERSION",
  "ADVISOR_OUTREACH",
  "CAMPAIGN",
  "REFERRAL",
  "REPEAT_BUYER",
  "OTHER",
] as const;
export type DealSource = (typeof DEAL_SOURCES)[number];

export const DEAL_LOST_REASONS = [
  "PRICE_MISMATCH",
  "CUSTOMER_NOT_INTERESTED",
  "SELECTED_ANOTHER_PROPERTY",
  "FINANCING_ISSUE",
  "NO_RESPONSE",
  "LOCATION_MISMATCH",
  "UNIT_UNAVAILABLE",
  "TIMELINE_POSTPONED",
  "DUPLICATE_DEAL",
  "OTHER",
] as const;
export type DealLostReason = (typeof DEAL_LOST_REASONS)[number];

// ─── 2. Status Transition Policy Matrix ──────────────────────────────────────

export const PERMITTED_DEAL_TRANSITIONS: Record<DealStage, DealStage[]> = {
  DRAFT: ["QUALIFICATION", "LOST", "CANCELLED", "ARCHIVED"],
  QUALIFICATION: ["NEGOTIATION", "LOST", "CANCELLED", "ARCHIVED"],
  NEGOTIATION: ["OFFER_PENDING_APPROVAL", "HOLD_PENDING", "ON_HOLD", "LOST", "CANCELLED", "ARCHIVED"],
  OFFER_PENDING_APPROVAL: ["OFFER_APPROVED", "NEGOTIATION", "LOST", "CANCELLED", "ARCHIVED"],
  OFFER_APPROVED: ["HOLD_PENDING", "ON_HOLD", "RESERVED", "NEGOTIATION", "LOST", "CANCELLED", "ARCHIVED"],
  HOLD_PENDING: ["ON_HOLD", "NEGOTIATION", "LOST", "CANCELLED", "ARCHIVED"],
  ON_HOLD: ["RESERVED", "NEGOTIATION", "LOST", "CANCELLED", "ARCHIVED"],
  RESERVED: ["BOOKING_REQUIREMENTS_PENDING", "BOOKED", "CANCELLED", "ARCHIVED"],
  BOOKING_REQUIREMENTS_PENDING: ["BOOKED", "RESERVED", "CANCELLED", "ARCHIVED"],
  BOOKED: ["WON", "CANCELLED", "ARCHIVED"],
  WON: ["ARCHIVED"],
  LOST: ["QUALIFICATION", "NEGOTIATION", "ARCHIVED"], // Reopen flow
  CANCELLED: ["QUALIFICATION", "NEGOTIATION", "ARCHIVED"], // Reopen flow
  ARCHIVED: ["DRAFT", "QUALIFICATION"],
};

export function isValidDealTransition(from: DealStage, to: DealStage): boolean {
  if (from === to) return true;
  const allowed = PERMITTED_DEAL_TRANSITIONS[from];
  return allowed ? allowed.includes(to) : false;
}

// ─── 3. Offer Statuses & Approvals ───────────────────────────────────────────

export const OFFER_STATUSES = [
  "DRAFT",
  "PENDING_APPROVAL",
  "APPROVED",
  "REJECTED",
  "WITHDRAWN",
  "EXPIRED",
  "ACCEPTED",
  "SUPERSEDED",
] as const;
export type OfferStatus = (typeof OFFER_STATUSES)[number];

// ─── 4. Inventory Hold Statuses ──────────────────────────────────────────────

export const HOLD_STATUSES = [
  "PENDING",
  "ACTIVE",
  "CONVERTED",
  "RELEASED",
  "EXPIRED",
  "CANCELLED",
  "FAILED",
] as const;
export type HoldStatus = (typeof HOLD_STATUSES)[number];

// ─── 5. Reservation Statuses ─────────────────────────────────────────────────

export const RESERVATION_STATUSES = [
  "DRAFT",
  "PENDING_APPROVAL",
  "ACTIVE",
  "CONVERTED_TO_BOOKING",
  "CANCELLED",
  "EXPIRED",
  "VOID",
] as const;
export type ReservationStatus = (typeof RESERVATION_STATUSES)[number];

// ─── 6. Booking Statuses ─────────────────────────────────────────────────────

export const BOOKING_STATUSES = [
  "DRAFT",
  "REQUIREMENTS_PENDING",
  "READY_FOR_CONFIRMATION",
  "CONFIRMED",
  "CANCELLED",
  "VOID",
] as const;
export type BookingStatus = (typeof BOOKING_STATUSES)[number];

// ─── 7. Deal Activity Types ──────────────────────────────────────────────────

export const DEAL_ACTIVITY_TYPES = [
  "DEAL_CREATED",
  "DEAL_STAGE_CHANGED",
  "UNIT_SELECTED",
  "UNIT_CHANGED",
  "OFFER_CREATED",
  "OFFER_APPROVAL_REQUESTED",
  "OFFER_APPROVED",
  "OFFER_REJECTED",
  "OFFER_ACCEPTED",
  "HOLD_PLACED",
  "HOLD_EXTENDED",
  "HOLD_RELEASED",
  "HOLD_EXPIRED",
  "RESERVATION_CREATED",
  "RESERVATION_CANCELLED",
  "BOOKING_CONFIRMED",
  "BOOKING_CANCELLED",
  "DEAL_WON",
  "DEAL_LOST",
  "DEAL_REOPENED",
  "ADVISOR_REASSIGNED",
  "NOTE_ADDED",
] as const;
export type DealActivityType = (typeof DEAL_ACTIVITY_TYPES)[number];

// ─── 8. Client Data Transfer Interfaces ──────────────────────────────────────

export interface DealSummary {
  _id: string;
  dealNumber: string;
  leadId: string;
  leadName: string;
  leadEmail?: string;
  leadPhone?: string;
  propertyId: string;
  propertyName: string;
  unitId?: string;
  unitNumber?: string;
  unitReferenceCode?: string;
  assignedAdvisorId: string;
  assignedAdvisorName: string;
  status: DealStage;
  pipelineStage: DealStage;
  priority: DealPriority;
  source: DealSource;
  expectedCloseDate?: string;
  offeredAmountPaise?: number;
  offeredAmountRupees?: number;
  currentOfferId?: string;
  activeHoldId?: string;
  activeHoldExpiresAt?: string;
  activeReservationId?: string;
  bookingId?: string;
  currency: string;
  nextActionType?: string;
  nextActionDate?: string;
  lostReason?: DealLostReason;
  cancellationReason?: string;
  version: number;
  closedAt?: string;
  archivedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DealOfferSummary {
  _id: string;
  offerNumber: string;
  dealId: string;
  propertyId: string;
  unitId?: string;
  version: number;
  currency: string;
  basePricePaise: number;
  basePriceRupees: number;
  ratePerSqFtPaise?: number;
  ratePerSqYdPaise?: number;
  plcChargePaise?: number;
  floorRiseChargePaise?: number;
  parkingChargePaise?: number;
  clubChargePaise?: number;
  maintenanceDepositPaise?: number;
  otherChargesPaise?: number;
  discountAmountPaise: number;
  discountPercentage: number;
  finalOfferedAmountPaise: number;
  finalOfferedAmountRupees: number;
  validFrom: string;
  validUntil: string;
  status: OfferStatus;
  approvalRequired: boolean;
  approvalReason?: string;
  approvalStatus: "NOT_REQUIRED" | "PENDING" | "APPROVED" | "REJECTED";
  approvedBy?: string;
  approvedByName?: string;
  approvedAt?: string;
  rejectionReason?: string;
  customerAcceptanceStatus: "PENDING" | "ACCEPTED" | "REJECTED";
  acceptedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface HoldSummary {
  _id: string;
  holdNumber: string;
  unitId: string;
  unitNumber?: string;
  unitReferenceCode?: string;
  propertyId: string;
  propertyName?: string;
  dealId: string;
  dealNumber?: string;
  leadId: string;
  leadName?: string;
  offerId?: string;
  status: HoldStatus;
  heldBy: string;
  heldByName?: string;
  startsAt: string;
  expiresAt: string;
  extendedAt?: string;
  extensionCount: number;
  releasedAt?: string;
  releaseReason?: string;
  convertedAt?: string;
  version: number;
  createdAt: string;
}

export interface ReservationSummary {
  _id: string;
  reservationNumber: string;
  dealId: string;
  dealNumber?: string;
  leadId: string;
  leadName?: string;
  propertyId: string;
  propertyName?: string;
  unitId: string;
  unitNumber?: string;
  unitReferenceCode?: string;
  holdId?: string;
  offerId: string;
  finalAmountPaise: number;
  finalAmountRupees: number;
  status: ReservationStatus;
  reservationDate: string;
  validUntil?: string;
  checklistComplete: boolean;
  createdBy: string;
  createdByName?: string;
  approvedBy?: string;
  approvedByName?: string;
  cancellationReason?: string;
  cancelledAt?: string;
  version: number;
  createdAt: string;
}

export interface BookingSummary {
  _id: string;
  bookingNumber: string;
  dealId: string;
  dealNumber?: string;
  leadId: string;
  leadName?: string;
  propertyId: string;
  propertyName?: string;
  unitId: string;
  unitNumber?: string;
  unitReferenceCode?: string;
  reservationId: string;
  offerId: string;
  finalAmountPaise: number;
  finalAmountRupees: number;
  status: BookingStatus;
  requirementsChecklist: {
    identityProofVerified: boolean;
    addressProofVerified: boolean;
    bookingFormSigned: boolean;
    downPaymentTermsAccepted: boolean;
    verificationNotes?: string;
  };
  confirmedBy?: string;
  confirmedByName?: string;
  confirmedAt?: string;
  cancellationReason?: string;
  cancelledAt?: string;
  version: number;
  createdAt: string;
}

export interface DealActivitySummary {
  _id: string;
  dealId: string;
  activityType: DealActivityType;
  fromStatus?: DealStage;
  toStatus?: DealStage;
  actorId: string;
  actorName: string;
  actorRole: string;
  summary: string;
  reasonCode?: string;
  sanitizedComment?: string;
  relatedEntityType?: string;
  relatedEntityId?: string;
  dealVersion: number;
  createdAt: string;
}

export interface DealFilterParams {
  propertyId?: string;
  unitId?: string;
  advisorId?: string;
  stage?: DealStage | "ALL";
  priority?: DealPriority | "ALL";
  search?: string;
  minAmountPaise?: number;
  maxAmountPaise?: number;
  page?: number;
  perPage?: number;
  sortBy?: "dealNumber" | "expectedCloseDate" | "offeredAmountPaise" | "createdAt" | "status";
  sortOrder?: "asc" | "desc";
}

export interface DealPipelineSummary {
  totalDeals: number;
  activeDealsCount: number;
  totalPipelineValueRupees: number;
  stageCounts: Record<DealStage, number>;
  activeHoldsCount: number;
  activeReservationsCount: number;
  confirmedBookingsCount: number;
  wonDealsCount: number;
  lostDealsCount: number;
}

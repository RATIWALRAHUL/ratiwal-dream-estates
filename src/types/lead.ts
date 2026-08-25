// ─── Client-safe Lead Types and Constants ─────────────────────────────────────

export const LEAD_SOURCES = [
  "PROPERTY_DETAIL",
  "PROPERTY_CARD",
  "LOCATION_PAGE",
  "HOMEPAGE_CTA",
  "CONTACT_PAGE",
  "ADVISOR_SECTION",
  "DIRECT",
  "OTHER",
] as const;
export type LeadSource = (typeof LEAD_SOURCES)[number];

export const LEAD_STATUSES = [
  "NEW",
  "CONTACTED",
  "QUALIFIED",
  "NURTURING",
  "NEGOTIATING",
  "WON",
  "LOST",
  "SPAM",
  "ARCHIVED",
] as const;
export type LeadStatus = (typeof LEAD_STATUSES)[number];

export const LEAD_PRIORITIES = ["LOW", "NORMAL", "HIGH", "URGENT"] as const;
export type LeadPriority = (typeof LEAD_PRIORITIES)[number];

export const CONTACT_METHODS = ["PHONE", "WHATSAPP", "EMAIL", "ANY"] as const;
export type ContactMethod = (typeof CONTACT_METHODS)[number];

export const PURCHASE_TIMELINES = [
  "IMMEDIATELY",
  "WITHIN_3_MONTHS",
  "WITHIN_6_MONTHS",
  "WITHIN_1_YEAR",
  "MORE_THAN_1_YEAR",
  "JUST_EXPLORING",
] as const;
export type PurchaseTimeline = (typeof PURCHASE_TIMELINES)[number];

export const INVESTMENT_PURPOSES = [
  "SELF_USE",
  "INVESTMENT",
  "BOTH",
  "NOT_DECIDED",
] as const;
export type InvestmentPurpose = (typeof INVESTMENT_PURPOSES)[number];

export const LOST_REASONS = [
  "BUDGET_MISMATCH",
  "LOCATION_MISMATCH",
  "TIMELINE_POSTPONED",
  "UNABLE_TO_CONTACT",
  "CHOSE_ANOTHER_PROPERTY",
  "DUPLICATE",
  "OTHER",
] as const;
export type LostReason = (typeof LOST_REASONS)[number];

export const ABUSE_STATUSES = ["CLEAN", "SUSPECTED_SPAM", "CONFIRMED_SPAM", "BLOCKED"] as const;
export type AbuseStatus = (typeof ABUSE_STATUSES)[number];

export const TIMELINE_EVENT_TYPES = [
  "INQUIRY_SUBMITTED",
  "LEAD_ASSIGNED",
  "LEAD_REASSIGNED",
  "STATUS_CHANGED",
  "PRIORITY_CHANGED",
  "NOTE_ADDED",
  "CONTACT_ATTEMPTED",
  "FOLLOWUP_SCHEDULED",
  "FOLLOWUP_COMPLETED",
  "FOLLOWUP_MISSED",
  "CONSENT_WITHDRAWN",
  "LEAD_MARKED_SPAM",
  "LEAD_ARCHIVED",
  "LEAD_ANONYMIZED",
  "DUPLICATE_DETECTED",
] as const;
export type TimelineEventType = (typeof TIMELINE_EVENT_TYPES)[number];

export const CONTACT_ATTEMPT_TYPES = [
  "PHONE_ATTEMPTED",
  "PHONE_CONNECTED",
  "WHATSAPP_INITIATED",
  "EMAIL_SENT",
  "IN_PERSON",
  "OTHER",
] as const;
export type ContactAttemptType = (typeof CONTACT_ATTEMPT_TYPES)[number];

export const CONTACT_ATTEMPT_OUTCOMES = [
  "NO_ANSWER",
  "VOICEMAIL",
  "CONNECTED",
  "CALLBACK_REQUESTED",
  "NOT_INTERESTED",
  "INTERESTED",
  "FOLLOW_UP_SCHEDULED",
  "OTHER",
] as const;
export type ContactAttemptOutcome = (typeof CONTACT_ATTEMPT_OUTCOMES)[number];

// ─── Status Transition Rules ──────────────────────────────────────────────────
export const VALID_STATUS_TRANSITIONS: Record<LeadStatus, LeadStatus[]> = {
  NEW:         ["CONTACTED", "SPAM", "ARCHIVED"],
  CONTACTED:   ["QUALIFIED", "NURTURING", "SPAM", "ARCHIVED"],
  QUALIFIED:   ["NEGOTIATING", "NURTURING", "SPAM", "ARCHIVED"],
  NURTURING:   ["QUALIFIED", "CONTACTED", "SPAM", "ARCHIVED"],
  NEGOTIATING: ["WON", "LOST", "SPAM", "ARCHIVED"],
  WON:         ["ARCHIVED"],
  LOST:        ["ARCHIVED"],
  SPAM:        ["ARCHIVED"],
  ARCHIVED:    [], // Terminal state — cannot re-open
};

export function isValidStatusTransition(from: LeadStatus, to: LeadStatus): boolean {
  return VALID_STATUS_TRANSITIONS[from]?.includes(to) ?? false;
}

// ─── Client-safe Site Visit Types and Constants ───────────────────────────────

export const SITE_VISIT_SOURCES = [
  "PUBLIC_PROPERTY_PAGE",
  "PUBLIC_LOCATION_PAGE",
  "DASHBOARD_LEAD",
  "DASHBOARD_MANUAL",
  "ADVISOR_CREATED",
  "OTHER",
] as const;
export type VisitSource = (typeof SITE_VISIT_SOURCES)[number];

export const MEETING_MODES = [
  "IN_PERSON",
  "VIRTUAL_TOUR",
  "OFFICE_CONSULTATION",
] as const;
export type MeetingMode = (typeof MEETING_MODES)[number];

export const SITE_VISIT_STATUSES = [
  "REQUESTED",
  "PENDING_CONFIRMATION",
  "CONFIRMED",
  "RESCHEDULE_REQUESTED",
  "CANCELLED",
  "COMPLETED",
  "NO_SHOW",
  "ARCHIVED",
] as const;
export type SiteVisitStatus = (typeof SITE_VISIT_STATUSES)[number];

export const SITE_VISIT_PRIORITIES = [
  "LOW",
  "NORMAL",
  "HIGH",
  "URGENT",
] as const;
export type SiteVisitPriority = (typeof SITE_VISIT_PRIORITIES)[number];

export const CONFIRMATION_STATUSES = [
  "UNCONFIRMED",
  "CONFIRMED",
  "RESCHEDULE_PENDING",
] as const;
export type ConfirmationStatus = (typeof CONFIRMATION_STATUSES)[number];

export const CANCELLATION_REASONS = [
  "CUSTOMER_REQUESTED",
  "ADVISOR_UNAVAILABLE",
  "PROPERTY_UNAVAILABLE",
  "WEATHER_OPERATIONAL",
  "DUPLICATE_BOOKING",
  "UNABLE_TO_CONTACT",
  "OTHER",
] as const;
export type CancellationReason = (typeof CANCELLATION_REASONS)[number];

export const AVAILABILITY_EXCEPTION_TYPES = [
  "FULL_DAY_UNAVAILABLE",
  "PARTIAL_DAY_UNAVAILABLE",
  "SPECIAL_HOURS",
  "HOLIDAY",
  "LEAVE",
  "PROPERTY_BLOCK",
  "ADMIN_BLOCK",
] as const;
export type AvailabilityExceptionType = (typeof AVAILABILITY_EXCEPTION_TYPES)[number];

export const SITE_VISIT_EVENT_TYPES = [
  "VISIT_REQUESTED",
  "VISIT_ASSIGNED",
  "VISIT_REASSIGNED",
  "VISIT_CONFIRMED",
  "RESCHEDULE_REQUESTED",
  "VISIT_RESCHEDULED",
  "VISIT_CANCELLED",
  "VISIT_COMPLETED",
  "NO_SHOW_RECORDED",
  "NOTE_ADDED",
  "LOCKS_ACQUIRED",
  "LOCKS_RELEASED",
  "VISIT_ARCHIVED",
] as const;
export type SiteVisitEventType = (typeof SITE_VISIT_EVENT_TYPES)[number];

// ─── Status Transition Rules (PRD 8 §7) ────────────────────────────────────────
export const VALID_SITE_VISIT_TRANSITIONS: Record<SiteVisitStatus, SiteVisitStatus[]> = {
  REQUESTED:             ["PENDING_CONFIRMATION", "CONFIRMED", "CANCELLED", "ARCHIVED"],
  PENDING_CONFIRMATION:  ["CONFIRMED", "CANCELLED", "ARCHIVED"],
  CONFIRMED:             ["RESCHEDULE_REQUESTED", "COMPLETED", "NO_SHOW", "CANCELLED", "ARCHIVED"],
  RESCHEDULE_REQUESTED:  ["CONFIRMED", "CANCELLED", "ARCHIVED"],
  CANCELLED:             ["ARCHIVED"],
  COMPLETED:             ["ARCHIVED"],
  NO_SHOW:               ["ARCHIVED"],
  ARCHIVED:              [], // Terminal state
};

export function isValidSiteVisitTransition(from: SiteVisitStatus, to: SiteVisitStatus): boolean {
  return VALID_SITE_VISIT_TRANSITIONS[from]?.includes(to) ?? false;
}

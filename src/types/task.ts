/**
 * @file task.ts
 * @description Domain types, enums, lifecycle statuses, and interfaces for PRD 19:
 * Unified Tasks, Follow-ups, Work Queue & Team Productivity.
 */

// ─── 1. Task Types ────────────────────────────────────────────────────────────

export const TASK_TYPES = [
  "GENERAL",
  "LEAD_FOLLOW_UP",
  "LEAD_ASSIGNMENT_ACCEPTANCE",
  "SITE_VISIT_PREPARATION",
  "SITE_VISIT_FOLLOW_UP",
  "LEGAL_DOCUMENT_REVIEW",
  "LEGAL_DOCUMENT_RENEWAL",
  "KYC_REVIEW",
  "KYC_ACTION_REQUIRED",
  "PAYMENT_FOLLOW_UP",
  "PAYMENT_RECONCILIATION",
  "REFUND_REVIEW",
  "BOOKING_REQUIREMENT",
  "PARTNER_ONBOARDING",
  "PARTNER_COMPLIANCE_RENEWAL",
  "COMMISSION_REVIEW",
  "SUPPORT_REQUEST",
  "DATA_QUALITY_REVIEW",
  "OTHER_APPROVED",
] as const;

export type TaskType = (typeof TASK_TYPES)[number];

// ─── 2. Task Lifecycle Statuses ───────────────────────────────────────────────

export const TASK_STATUSES = [
  "PENDING_ACCEPTANCE",
  "TO_DO",
  "IN_PROGRESS",
  "IN_REVIEW",
  "COMPLETED",
  "REJECTED",
  "CANCELLED",
  "ARCHIVED",
] as const;

export type TaskStatus = (typeof TASK_STATUSES)[number];

export const TASK_PRIORITIES = ["LOW", "NORMAL", "HIGH", "URGENT"] as const;
export type TaskPriority = (typeof TASK_PRIORITIES)[number];

export const TASK_SOURCES = ["MANUAL", "SYSTEM_GENERATED", "RECURRING_SCHEDULE"] as const;
export type TaskSource = (typeof TASK_SOURCES)[number];

export const PERMITTED_TASK_TRANSITIONS: Record<TaskStatus, TaskStatus[]> = {
  PENDING_ACCEPTANCE: ["TO_DO", "IN_PROGRESS", "REJECTED", "CANCELLED"],
  TO_DO: ["IN_PROGRESS", "CANCELLED", "ARCHIVED"],
  IN_PROGRESS: ["IN_REVIEW", "COMPLETED", "TO_DO", "CANCELLED"],
  IN_REVIEW: ["COMPLETED", "IN_PROGRESS", "REJECTED", "CANCELLED"],
  COMPLETED: ["IN_PROGRESS", "ARCHIVED"], // Reopening requires authorized action
  REJECTED: ["TO_DO", "CANCELLED", "ARCHIVED"],
  CANCELLED: ["TO_DO", "ARCHIVED"],
  ARCHIVED: [],
};

export function isValidTaskStatusTransition(from: TaskStatus, to: TaskStatus): boolean {
  if (from === to) return true;
  const allowed = PERMITTED_TASK_TRANSITIONS[from];
  return allowed ? allowed.includes(to) : false;
}

// ─── 3. Related Business Entity Types ─────────────────────────────────────────

export const RELATED_ENTITY_TYPES = [
  "LEAD",
  "INQUIRY",
  "PROPERTY",
  "INVENTORY_UNIT",
  "SITE_VISIT",
  "LEGAL_DOCUMENT",
  "KYC_CASE",
  "DEAL",
  "RESERVATION",
  "BOOKING",
  "PAYMENT",
  "REFUND",
  "PARTNER",
  "COMMISSION",
  "SUPPORT_REQUEST",
  "DATA_QUALITY",
] as const;

export type RelatedEntityType = (typeof RELATED_ENTITY_TYPES)[number];

// ─── 4. Structured Follow-up Outcomes ─────────────────────────────────────────

export const LEAD_FOLLOW_UP_OUTCOMES = [
  "CONTACTED",
  "NO_ANSWER",
  "CALLBACK_REQUESTED",
  "INFO_SHARED",
  "SITE_VISIT_REQUESTED",
  "SITE_VISIT_SCHEDULED",
  "NOT_INTERESTED",
  "FOLLOW_UP_REQUIRED",
  "WRONG_CONTACT",
  "DUPLICATE_LEAD",
  "OTHER",
] as const;

export type LeadFollowUpOutcome = (typeof LEAD_FOLLOW_UP_OUTCOMES)[number];

// ─── 5. Task Activity Types ───────────────────────────────────────────────────

export const TASK_ACTIVITY_TYPES = [
  "CREATED",
  "ACCEPTED",
  "STARTED",
  "DUE_DATE_CHANGED",
  "PRIORITY_CHANGED",
  "COMMENT_ADDED",
  "ATTACHMENT_ADDED",
  "SENT_TO_REVIEW",
  "APPROVED",
  "RETURNED_FOR_CHANGES",
  "REASSIGNED",
  "ESCALATED",
  "COMPLETED",
  "REOPENED",
  "CANCELLED",
  "ARCHIVED",
] as const;

export type TaskActivityType = (typeof TASK_ACTIVITY_TYPES)[number];

// ─── 6. Comment & Attachment Types ────────────────────────────────────────────

export const TASK_COMMENT_VISIBILITIES = [
  "INTERNAL",
  "ASSIGNEE_AND_REVIEWER",
  "MANAGER_ONLY",
] as const;

export type TaskCommentVisibility = (typeof TASK_COMMENT_VISIBILITIES)[number];

// ─── 7. DTOs and Interfaces ───────────────────────────────────────────────────

export interface TaskListItemDTO {
  id: string;
  taskNumber: string;
  title: string;
  description?: string;
  taskType: TaskType;
  source: TaskSource;
  relatedEntityType?: RelatedEntityType;
  relatedEntityId?: string;
  relatedEntitySummary?: string;
  propertyTitle?: string;
  locationName?: string;
  assignedUserId: string;
  assignedUserName: string;
  assignedTeam?: string;
  assignedByUserName?: string;
  reviewerUserName?: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueAt: string;
  isOverdue: boolean;
  isDueToday: boolean;
  startAt?: string;
  acceptedAt?: string;
  completedAt?: string;
  createdAt: string;
  slaStatus: "ON_TRACK" | "WARNING" | "BREACHED";
}

export interface MyWorkMetrics {
  awaitingAcceptanceCount: number;
  dueTodayCount: number;
  overdueCount: number;
  inProgressCount: number;
  inReviewCount: number;
  totalActiveCount: number;
  completedThisWeekCount: number;
}

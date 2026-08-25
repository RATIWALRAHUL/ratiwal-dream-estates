/**
 * @file communication.ts
 * @description Client-safe type definitions, enums, and event catalogue for PRD 9:
 * Transactional Notifications & Communication Automation.
 */

export const NOTIFICATION_CHANNELS = ["IN_APP", "EMAIL", "WHATSAPP"] as const;
export type NotificationChannel = (typeof NOTIFICATION_CHANNELS)[number];

export const NOTIFICATION_EVENT_TYPES = [
  "INQUIRY_RECEIVED_CUSTOMER",
  "LEAD_CREATED_INTERNAL",
  "LEAD_ASSIGNED_INTERNAL",
  "LEAD_FOLLOWUP_DUE",
  "SITE_VISIT_REQUEST_RECEIVED_CUSTOMER",
  "SITE_VISIT_REQUEST_RECEIVED_INTERNAL",
  "SITE_VISIT_ASSIGNED_INTERNAL",
  "SITE_VISIT_CONFIRMED_CUSTOMER",
  "SITE_VISIT_RESCHEDULED_CUSTOMER",
  "SITE_VISIT_CANCELLED_CUSTOMER",
  "SITE_VISIT_REMINDER_24H",
  "SITE_VISIT_REMINDER_2H",
  "SITE_VISIT_COMPLETED_INTERNAL",
  "SITE_VISIT_FOLLOWUP_REQUIRED",
] as const;
export type NotificationEventType = (typeof NOTIFICATION_EVENT_TYPES)[number];

export const OUTBOX_STATUSES = [
  "PENDING",
  "PROCESSING",
  "SENT",
  "PARTIALLY_SENT",
  "RETRY_SCHEDULED",
  "CANCELLED",
  "DEAD_LETTER",
] as const;
export type OutboxStatus = (typeof OUTBOX_STATUSES)[number];

export const DELIVERY_STATUSES = [
  "QUEUED",
  "SENDING",
  "SENT",
  "DELIVERED",
  "READ",
  "FAILED",
  "BOUNCED",
  "COMPLAINED",
  "SUPPRESSED",
  "CANCELLED",
] as const;
export type DeliveryStatus = (typeof DELIVERY_STATUSES)[number];

export const TEMPLATE_STATUSES = ["DRAFT", "ACTIVE", "ARCHIVED"] as const;
export type TemplateStatus = (typeof TEMPLATE_STATUSES)[number];

export const CONSENT_STATUSES = [
  "GRANTED",
  "WITHDRAWN",
  "SUPPRESSED_BOUNCE",
  "SUPPRESSED_COMPLAINT",
  "SUPPRESSED_OPT_OUT",
] as const;
export type ConsentStatus = (typeof CONSENT_STATUSES)[number];

export const FAILURE_CATEGORIES = [
  "TRANSIENT_NETWORK",
  "TRANSIENT_RATE_LIMIT",
  "TRANSIENT_PROVIDER_5XX",
  "PERMANENT_INVALID_RECIPIENT",
  "PERMANENT_MISSING_CONSENT",
  "PERMANENT_UNAPPROVED_TEMPLATE",
  "PERMANENT_PAYLOAD_INVALID",
  "PERMANENT_CREDENTIALS",
  "UNKNOWN",
] as const;
export type FailureCategory = (typeof FAILURE_CATEGORIES)[number];

export interface EventDefinition {
  eventType: NotificationEventType;
  description: string;
  allowedChannels: NotificationChannel[];
  templateKey: string;
  defaultPriority: "HIGH" | "NORMAL" | "LOW";
  requiresConsent: boolean;
  cancelOnSiteVisitReschedule?: boolean;
  cancelOnSiteVisitCancellation?: boolean;
}

export const COMMUNICATION_EVENT_DEFINITIONS: Record<NotificationEventType, EventDefinition> = {
  INQUIRY_RECEIVED_CUSTOMER: {
    eventType: "INQUIRY_RECEIVED_CUSTOMER",
    description: "Acknowledgement sent to customer upon receiving a general inquiry",
    allowedChannels: ["EMAIL", "WHATSAPP"],
    templateKey: "inquiry_received_customer",
    defaultPriority: "HIGH",
    requiresConsent: true,
  },
  LEAD_CREATED_INTERNAL: {
    eventType: "LEAD_CREATED_INTERNAL",
    description: "Internal alert to admins when a new lead is captured",
    allowedChannels: ["IN_APP", "EMAIL"],
    templateKey: "lead_created_internal",
    defaultPriority: "HIGH",
    requiresConsent: false,
  },
  LEAD_ASSIGNED_INTERNAL: {
    eventType: "LEAD_ASSIGNED_INTERNAL",
    description: "Alert to assigned advisor when a lead is assigned to them",
    allowedChannels: ["IN_APP", "EMAIL"],
    templateKey: "lead_assigned_internal",
    defaultPriority: "HIGH",
    requiresConsent: false,
  },
  LEAD_FOLLOWUP_DUE: {
    eventType: "LEAD_FOLLOWUP_DUE",
    description: "Reminder to advisor that a lead follow-up task is due",
    allowedChannels: ["IN_APP"],
    templateKey: "lead_followup_due",
    defaultPriority: "NORMAL",
    requiresConsent: false,
  },
  SITE_VISIT_REQUEST_RECEIVED_CUSTOMER: {
    eventType: "SITE_VISIT_REQUEST_RECEIVED_CUSTOMER",
    description: "Acknowledgement sent to visitor upon receiving a site visit request",
    allowedChannels: ["EMAIL", "WHATSAPP"],
    templateKey: "site_visit_request_received_customer",
    defaultPriority: "HIGH",
    requiresConsent: true,
  },
  SITE_VISIT_REQUEST_RECEIVED_INTERNAL: {
    eventType: "SITE_VISIT_REQUEST_RECEIVED_INTERNAL",
    description: "Internal alert to operations team for a new visit booking request",
    allowedChannels: ["IN_APP", "EMAIL"],
    templateKey: "site_visit_request_received_internal",
    defaultPriority: "HIGH",
    requiresConsent: false,
  },
  SITE_VISIT_ASSIGNED_INTERNAL: {
    eventType: "SITE_VISIT_ASSIGNED_INTERNAL",
    description: "Alert to assigned advisor for a scheduled property site visit",
    allowedChannels: ["IN_APP", "EMAIL"],
    templateKey: "site_visit_assigned_internal",
    defaultPriority: "HIGH",
    requiresConsent: false,
  },
  SITE_VISIT_CONFIRMED_CUSTOMER: {
    eventType: "SITE_VISIT_CONFIRMED_CUSTOMER",
    description: "Confirmation with locked date/time and meeting instructions for visitor",
    allowedChannels: ["EMAIL", "WHATSAPP"],
    templateKey: "site_visit_confirmed_customer",
    defaultPriority: "HIGH",
    requiresConsent: true,
  },
  SITE_VISIT_RESCHEDULED_CUSTOMER: {
    eventType: "SITE_VISIT_RESCHEDULED_CUSTOMER",
    description: "Updated itinerary sent to visitor upon rescheduling a site visit",
    allowedChannels: ["EMAIL", "WHATSAPP"],
    templateKey: "site_visit_rescheduled_customer",
    defaultPriority: "HIGH",
    requiresConsent: true,
  },
  SITE_VISIT_CANCELLED_CUSTOMER: {
    eventType: "SITE_VISIT_CANCELLED_CUSTOMER",
    description: "Cancellation notice sent to customer when a visit is cancelled",
    allowedChannels: ["EMAIL", "WHATSAPP"],
    templateKey: "site_visit_cancelled_customer",
    defaultPriority: "HIGH",
    requiresConsent: true,
  },
  SITE_VISIT_REMINDER_24H: {
    eventType: "SITE_VISIT_REMINDER_24H",
    description: "24-hour reminder sent to visitor before scheduled inspection",
    allowedChannels: ["EMAIL", "WHATSAPP"],
    templateKey: "site_visit_reminder_24h",
    defaultPriority: "NORMAL",
    requiresConsent: true,
    cancelOnSiteVisitReschedule: true,
    cancelOnSiteVisitCancellation: true,
  },
  SITE_VISIT_REMINDER_2H: {
    eventType: "SITE_VISIT_REMINDER_2H",
    description: "2-hour operational reminder sent to visitor with meeting location",
    allowedChannels: ["EMAIL", "WHATSAPP"],
    templateKey: "site_visit_reminder_2h",
    defaultPriority: "HIGH",
    requiresConsent: true,
    cancelOnSiteVisitReschedule: true,
    cancelOnSiteVisitCancellation: true,
  },
  SITE_VISIT_COMPLETED_INTERNAL: {
    eventType: "SITE_VISIT_COMPLETED_INTERNAL",
    description: "Internal notification recording successful completion of visit",
    allowedChannels: ["IN_APP"],
    templateKey: "site_visit_completed_internal",
    defaultPriority: "NORMAL",
    requiresConsent: false,
  },
  SITE_VISIT_FOLLOWUP_REQUIRED: {
    eventType: "SITE_VISIT_FOLLOWUP_REQUIRED",
    description: "Reminder to advisor to document post-visit client feedback",
    allowedChannels: ["IN_APP"],
    templateKey: "site_visit_followup_required",
    defaultPriority: "NORMAL",
    requiresConsent: false,
  },
};

/**
 * Client-safe InAppNotification representation
 */
export interface InAppNotificationItem {
  id: string;
  eventType: NotificationEventType;
  title: string;
  message: string;
  entityType?: "LEAD" | "SITE_VISIT" | "PROPERTY" | "LOCATION" | "USER";
  entityId?: string;
  deepLink?: string;
  readAt?: string;
  createdAt: string;
}

/**
 * Client-safe Delivery representation
 */
export interface NotificationDeliveryItem {
  id: string;
  outboxId: string;
  eventType: NotificationEventType;
  channel: NotificationChannel;
  provider: string;
  providerMessageId?: string;
  status: DeliveryStatus;
  attempt: number;
  maskedRecipient: string;
  templateKey: string;
  scheduledFor?: string;
  sentAt?: string;
  deliveredAt?: string;
  readAt?: string;
  failedAt?: string;
  failureCategory?: FailureCategory;
  failureMessage?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Client-safe Template representation
 */
export interface NotificationTemplateItem {
  key: string;
  channel: NotificationChannel;
  version: number;
  purpose: "TRANSACTIONAL";
  subject?: string;
  previewText?: string;
  allowedVariables: string[];
  whatsappTemplateName?: string;
  whatsappLanguage?: string;
  whatsappStatus?: "PENDING" | "APPROVED" | "REJECTED" | "NOT_CONFIGURED";
  status: TemplateStatus;
  updatedAt: string;
}

/**
 * Operational Metrics for Communications Dashboard
 */
export interface CommunicationsMetrics {
  pendingCount: number;
  scheduledCount: number;
  sentCount: number;
  deliveredCount: number;
  failedCount: number;
  deadLetterCount: number;
  suppressedCount: number;
  deliveryRatePercent: number;
  lastWorkerRunAt?: string;
  oldestPendingMinutes?: number;
  providerStatus: {
    email: "LIVE" | "TEST_SIMULATOR" | "DISABLED";
    whatsapp: "LIVE" | "TEST_SIMULATOR" | "DISABLED";
  };
}

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
  // PRD 15: Customer KYC & Verification events
  "KYC_REQUESTED_CUSTOMER",
  "KYC_SUBMISSION_RECEIVED_INTERNAL",
  "KYC_ACTION_REQUIRED_CUSTOMER",
  "KYC_RESUBMITTED_INTERNAL",
  "KYC_COMPLETED_CUSTOMER",
  "KYC_REJECTED_INTERNAL",
  "KYC_EXPIRING_INTERNAL",
  "KYC_EXPIRED_INTERNAL",
  "PRIVACY_REQUEST_RECEIVED_INTERNAL",
  // PRD 16: Payments, Receipts, Refunds & Financial Operations
  "PAYMENT_PLAN_ACTIVATED_CUSTOMER",
  "PAYMENT_DUE_CUSTOMER",
  "PAYMENT_OVERDUE_CUSTOMER",
  "PAYMENT_ATTEMPT_FAILED_CUSTOMER",
  "PAYMENT_CAPTURED_CUSTOMER",
  "MANUAL_PAYMENT_SUBMITTED_INTERNAL",
  "MANUAL_PAYMENT_ACTION_REQUIRED_CUSTOMER",
  "RECEIPT_ISSUED_CUSTOMER",
  "REFUND_REQUESTED_INTERNAL",
  "REFUND_APPROVED_CUSTOMER",
  "REFUND_INITIATED_CUSTOMER",
  "REFUND_PROCESSED_CUSTOMER",
  "REFUND_FAILED_INTERNAL",
  "PAYMENT_RECONCILIATION_WARNING_INTERNAL",
  // PRD 17: Secure Customer Portal events
  "PORTAL_INVITATION_CUSTOMER",
  "PORTAL_ACTIVATED_INTERNAL",
  "PORTAL_ACCESS_REVOKED_CUSTOMER",
  "CUSTOMER_PROFILE_CORRECTION_INTERNAL",
  "CUSTOMER_SUPPORT_CREATED_INTERNAL",
  "CUSTOMER_SUPPORT_UPDATED_CUSTOMER",
  "CUSTOMER_DOCUMENT_PUBLISHED",
  "PRIVACY_REQUEST_CREATED_INTERNAL",
  // PRD 18: Channel Partners, Brokers & Commissions
  "PARTNER_INVITED",
  "PARTNER_ACTION_REQUIRED",
  "PARTNER_APPROVED",
  "PARTNER_SUSPENDED",
  "PARTNER_COMPLIANCE_EXPIRING",
  "PARTNER_LEAD_SUBMITTED_INTERNAL",
  "PARTNER_LEAD_ACCEPTED",
  "PARTNER_LEAD_CONFLICT_INTERNAL",
  "COMMISSION_ESTIMATED",
  "COMMISSION_APPROVED",
  "COMMISSION_ON_HOLD",
  "COMMISSION_PAYABLE",
  "PAYOUT_PROCESSING",
  "PAYOUT_PROCESSED",
  "PAYOUT_FAILED",
  "COMMISSION_CLAWBACK_CREATED",
  // PRD 19: Operational Tasks & Team Productivity
  "TASK_ASSIGNED",
  "TASK_ACCEPTANCE_PENDING",
  "TASK_DUE_SOON",
  "TASK_OVERDUE",
  "TASK_REASSIGNED",
  "TASK_SENT_TO_REVIEW",
  "TASK_RETURNED",
  "TASK_APPROVED",
  "TASK_ESCALATED",
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
  // PRD 15: Customer KYC Events
  KYC_REQUESTED_CUSTOMER: {
    eventType: "KYC_REQUESTED_CUSTOMER",
    description: "Secure one-time submission link and purpose notice sent to buyer",
    allowedChannels: ["EMAIL", "WHATSAPP"],
    templateKey: "kyc_requested_customer",
    defaultPriority: "HIGH",
    requiresConsent: true,
  },
  KYC_SUBMISSION_RECEIVED_INTERNAL: {
    eventType: "KYC_SUBMISSION_RECEIVED_INTERNAL",
    description: "Internal alert to compliance reviewer upon buyer document upload",
    allowedChannels: ["IN_APP", "EMAIL"],
    templateKey: "kyc_submission_received_internal",
    defaultPriority: "HIGH",
    requiresConsent: false,
  },
  KYC_ACTION_REQUIRED_CUSTOMER: {
    eventType: "KYC_ACTION_REQUIRED_CUSTOMER",
    description: "Correction notice sent to customer for replaced or rejected document",
    allowedChannels: ["EMAIL", "WHATSAPP"],
    templateKey: "kyc_action_required_customer",
    defaultPriority: "HIGH",
    requiresConsent: true,
  },
  KYC_RESUBMITTED_INTERNAL: {
    eventType: "KYC_RESUBMITTED_INTERNAL",
    description: "Alert to reviewer when corrected document is uploaded by customer",
    allowedChannels: ["IN_APP"],
    templateKey: "kyc_resubmitted_internal",
    defaultPriority: "HIGH",
    requiresConsent: false,
  },
  KYC_COMPLETED_CUSTOMER: {
    eventType: "KYC_COMPLETED_CUSTOMER",
    description: "Formal KYC verification confirmation notice sent to buyer",
    allowedChannels: ["EMAIL", "WHATSAPP"],
    templateKey: "kyc_completed_customer",
    defaultPriority: "NORMAL",
    requiresConsent: true,
  },
  KYC_REJECTED_INTERNAL: {
    eventType: "KYC_REJECTED_INTERNAL",
    description: "Alert when a KYC case or document is formally rejected",
    allowedChannels: ["IN_APP", "EMAIL"],
    templateKey: "kyc_rejected_internal",
    defaultPriority: "HIGH",
    requiresConsent: false,
  },
  KYC_EXPIRING_INTERNAL: {
    eventType: "KYC_EXPIRING_INTERNAL",
    description: "Reminder to staff regarding upcoming document or case expiration",
    allowedChannels: ["IN_APP"],
    templateKey: "kyc_expiring_internal",
    defaultPriority: "NORMAL",
    requiresConsent: false,
  },
  KYC_EXPIRED_INTERNAL: {
    eventType: "KYC_EXPIRED_INTERNAL",
    description: "Alert when a KYC case or identity evidence expires",
    allowedChannels: ["IN_APP"],
    templateKey: "kyc_expired_internal",
    defaultPriority: "NORMAL",
    requiresConsent: false,
  },
  PRIVACY_REQUEST_RECEIVED_INTERNAL: {
    eventType: "PRIVACY_REQUEST_RECEIVED_INTERNAL",
    description: "Alert to compliance officer when a new DPDPA privacy request is received",
    allowedChannels: ["IN_APP", "EMAIL"],
    templateKey: "privacy_request_received_internal",
    defaultPriority: "HIGH",
    requiresConsent: false,
  },
  // PRD 16: Payments, Receipts, Refunds
  PAYMENT_PLAN_ACTIVATED_CUSTOMER: {
    eventType: "PAYMENT_PLAN_ACTIVATED_CUSTOMER",
    description: "Notification sent to buyer with approved payment plan & instalment schedule",
    allowedChannels: ["EMAIL", "WHATSAPP"],
    templateKey: "payment_plan_activated_customer",
    defaultPriority: "HIGH",
    requiresConsent: true,
  },
  PAYMENT_DUE_CUSTOMER: {
    eventType: "PAYMENT_DUE_CUSTOMER",
    description: "Upcoming milestone payment reminder with secure payment link",
    allowedChannels: ["EMAIL", "WHATSAPP"],
    templateKey: "payment_due_customer",
    defaultPriority: "HIGH",
    requiresConsent: true,
  },
  PAYMENT_OVERDUE_CUSTOMER: {
    eventType: "PAYMENT_OVERDUE_CUSTOMER",
    description: "Notice regarding overdue payment instalment",
    allowedChannels: ["EMAIL", "WHATSAPP"],
    templateKey: "payment_overdue_customer",
    defaultPriority: "HIGH",
    requiresConsent: true,
  },
  PAYMENT_ATTEMPT_FAILED_CUSTOMER: {
    eventType: "PAYMENT_ATTEMPT_FAILED_CUSTOMER",
    description: "Notice sent when an online payment attempt fails with retry instructions",
    allowedChannels: ["EMAIL"],
    templateKey: "payment_attempt_failed_customer",
    defaultPriority: "NORMAL",
    requiresConsent: true,
  },
  PAYMENT_CAPTURED_CUSTOMER: {
    eventType: "PAYMENT_CAPTURED_CUSTOMER",
    description: "Payment capture acknowledgement sent immediately upon verification",
    allowedChannels: ["EMAIL", "WHATSAPP"],
    templateKey: "payment_captured_customer",
    defaultPriority: "HIGH",
    requiresConsent: true,
  },
  MANUAL_PAYMENT_SUBMITTED_INTERNAL: {
    eventType: "MANUAL_PAYMENT_SUBMITTED_INTERNAL",
    description: "Alert to finance reviewer for offline bank transfer or cheque verification",
    allowedChannels: ["IN_APP", "EMAIL"],
    templateKey: "manual_payment_submitted_internal",
    defaultPriority: "HIGH",
    requiresConsent: false,
  },
  MANUAL_PAYMENT_ACTION_REQUIRED_CUSTOMER: {
    eventType: "MANUAL_PAYMENT_ACTION_REQUIRED_CUSTOMER",
    description: "Correction request sent to buyer for unclear offline payment evidence",
    allowedChannels: ["EMAIL", "WHATSAPP"],
    templateKey: "manual_payment_action_required_customer",
    defaultPriority: "HIGH",
    requiresConsent: true,
  },
  RECEIPT_ISSUED_CUSTOMER: {
    eventType: "RECEIPT_ISSUED_CUSTOMER",
    description: "Formal payment receipt delivered with short-lived secure download link",
    allowedChannels: ["EMAIL", "WHATSAPP"],
    templateKey: "receipt_issued_customer",
    defaultPriority: "HIGH",
    requiresConsent: true,
  },
  REFUND_REQUESTED_INTERNAL: {
    eventType: "REFUND_REQUESTED_INTERNAL",
    description: "Alert to finance manager for new refund request approval",
    allowedChannels: ["IN_APP", "EMAIL"],
    templateKey: "refund_requested_internal",
    defaultPriority: "HIGH",
    requiresConsent: false,
  },
  REFUND_APPROVED_CUSTOMER: {
    eventType: "REFUND_APPROVED_CUSTOMER",
    description: "Notice to customer that refund request has been approved for processing",
    allowedChannels: ["EMAIL", "WHATSAPP"],
    templateKey: "refund_approved_customer",
    defaultPriority: "HIGH",
    requiresConsent: true,
  },
  REFUND_INITIATED_CUSTOMER: {
    eventType: "REFUND_INITIATED_CUSTOMER",
    description: "Notice that refund transaction has been submitted to bank/gateway",
    allowedChannels: ["EMAIL"],
    templateKey: "refund_initiated_customer",
    defaultPriority: "NORMAL",
    requiresConsent: true,
  },
  REFUND_PROCESSED_CUSTOMER: {
    eventType: "REFUND_PROCESSED_CUSTOMER",
    description: "Confirmation of completed refund credit to customer source account",
    allowedChannels: ["EMAIL", "WHATSAPP"],
    templateKey: "refund_processed_customer",
    defaultPriority: "HIGH",
    requiresConsent: true,
  },
  REFUND_FAILED_INTERNAL: {
    eventType: "REFUND_FAILED_INTERNAL",
    description: "Alert to finance operations when a gateway refund fails",
    allowedChannels: ["IN_APP", "EMAIL"],
    templateKey: "refund_failed_internal",
    defaultPriority: "HIGH",
    requiresConsent: false,
  },
  PAYMENT_RECONCILIATION_WARNING_INTERNAL: {
    eventType: "PAYMENT_RECONCILIATION_WARNING_INTERNAL",
    description: "Alert when automated reconciliation detects payment or refund anomalies",
    allowedChannels: ["IN_APP", "EMAIL"],
    templateKey: "payment_reconciliation_warning_internal",
    defaultPriority: "HIGH",
    requiresConsent: false,
  },
  PORTAL_INVITATION_CUSTOMER: {
    eventType: "PORTAL_INVITATION_CUSTOMER",
    description: "Invitation link sent to customer to activate secure self-service portal account",
    allowedChannels: ["EMAIL", "WHATSAPP"],
    templateKey: "portal_invitation_customer",
    defaultPriority: "HIGH",
    requiresConsent: false,
  },
  PORTAL_ACTIVATED_INTERNAL: {
    eventType: "PORTAL_ACTIVATED_INTERNAL",
    description: "Notification to staff that customer has claimed and activated portal access",
    allowedChannels: ["IN_APP"],
    templateKey: "portal_activated_internal",
    defaultPriority: "NORMAL",
    requiresConsent: false,
  },
  PORTAL_ACCESS_REVOKED_CUSTOMER: {
    eventType: "PORTAL_ACCESS_REVOKED_CUSTOMER",
    description: "Notice to customer that portal access has been revoked or suspended",
    allowedChannels: ["EMAIL"],
    templateKey: "portal_access_revoked_customer",
    defaultPriority: "HIGH",
    requiresConsent: false,
  },
  CUSTOMER_PROFILE_CORRECTION_INTERNAL: {
    eventType: "CUSTOMER_PROFILE_CORRECTION_INTERNAL",
    description: "Alert to compliance team for customer requested profile or KYC data corrections",
    allowedChannels: ["IN_APP", "EMAIL"],
    templateKey: "customer_profile_correction_internal",
    defaultPriority: "HIGH",
    requiresConsent: false,
  },
  CUSTOMER_SUPPORT_CREATED_INTERNAL: {
    eventType: "CUSTOMER_SUPPORT_CREATED_INTERNAL",
    description: "Alert to customer care team when a buyer opens a support ticket",
    allowedChannels: ["IN_APP", "EMAIL"],
    templateKey: "customer_support_created_internal",
    defaultPriority: "HIGH",
    requiresConsent: false,
  },
  CUSTOMER_SUPPORT_UPDATED_CUSTOMER: {
    eventType: "CUSTOMER_SUPPORT_UPDATED_CUSTOMER",
    description: "Notification to customer when staff replies to or resolves support ticket",
    allowedChannels: ["EMAIL", "WHATSAPP"],
    templateKey: "customer_support_updated_customer",
    defaultPriority: "HIGH",
    requiresConsent: true,
  },
  CUSTOMER_DOCUMENT_PUBLISHED: {
    eventType: "CUSTOMER_DOCUMENT_PUBLISHED",
    description: "Notification to customer when an approved property or booking document is published",
    allowedChannels: ["EMAIL", "WHATSAPP"],
    templateKey: "customer_document_published",
    defaultPriority: "NORMAL",
    requiresConsent: true,
  },
  PRIVACY_REQUEST_CREATED_INTERNAL: {
    eventType: "PRIVACY_REQUEST_CREATED_INTERNAL",
    description: "Alert to DPO/compliance officer when customer submits DPDP/GDPR privacy request",
    allowedChannels: ["IN_APP", "EMAIL"],
    templateKey: "privacy_request_created_internal",
    defaultPriority: "HIGH",
    requiresConsent: false,
  },
  PARTNER_INVITED: {
    eventType: "PARTNER_INVITED",
    description: "Invitation sent to prospective broker/channel partner",
    allowedChannels: ["EMAIL", "WHATSAPP"],
    templateKey: "partner_invited",
    defaultPriority: "HIGH",
    requiresConsent: false,
  },
  PARTNER_ACTION_REQUIRED: {
    eventType: "PARTNER_ACTION_REQUIRED",
    description: "Alert to partner when compliance or bank review requires corrections",
    allowedChannels: ["EMAIL", "WHATSAPP"],
    templateKey: "partner_action_required",
    defaultPriority: "HIGH",
    requiresConsent: false,
  },
  PARTNER_APPROVED: {
    eventType: "PARTNER_APPROVED",
    description: "Notification to partner when onboarded & approved by compliance",
    allowedChannels: ["EMAIL", "WHATSAPP"],
    templateKey: "partner_approved",
    defaultPriority: "HIGH",
    requiresConsent: false,
  },
  PARTNER_SUSPENDED: {
    eventType: "PARTNER_SUSPENDED",
    description: "Notification to partner when access is temporarily suspended",
    allowedChannels: ["EMAIL", "WHATSAPP"],
    templateKey: "partner_suspended",
    defaultPriority: "HIGH",
    requiresConsent: false,
  },
  PARTNER_COMPLIANCE_EXPIRING: {
    eventType: "PARTNER_COMPLIANCE_EXPIRING",
    description: "Reminder when partner RERA or agreement is approaching expiry",
    allowedChannels: ["EMAIL", "WHATSAPP"],
    templateKey: "partner_compliance_expiring",
    defaultPriority: "NORMAL",
    requiresConsent: false,
  },
  PARTNER_LEAD_SUBMITTED_INTERNAL: {
    eventType: "PARTNER_LEAD_SUBMITTED_INTERNAL",
    description: "Alert to sales desk when channel partner registers a new lead",
    allowedChannels: ["IN_APP", "EMAIL"],
    templateKey: "partner_lead_submitted_internal",
    defaultPriority: "HIGH",
    requiresConsent: false,
  },
  PARTNER_LEAD_ACCEPTED: {
    eventType: "PARTNER_LEAD_ACCEPTED",
    description: "Notification to partner when submitted lead attribution is accepted",
    allowedChannels: ["EMAIL", "WHATSAPP"],
    templateKey: "partner_lead_accepted",
    defaultPriority: "NORMAL",
    requiresConsent: false,
  },
  PARTNER_LEAD_CONFLICT_INTERNAL: {
    eventType: "PARTNER_LEAD_CONFLICT_INTERNAL",
    description: "Alert to sales manager when duplicate or multi-partner lead conflict occurs",
    allowedChannels: ["IN_APP", "EMAIL"],
    templateKey: "partner_lead_conflict_internal",
    defaultPriority: "HIGH",
    requiresConsent: false,
  },
  COMMISSION_ESTIMATED: {
    eventType: "COMMISSION_ESTIMATED",
    description: "Informational notice of estimated commission on deal progression",
    allowedChannels: ["IN_APP", "EMAIL"],
    templateKey: "commission_estimated",
    defaultPriority: "LOW",
    requiresConsent: false,
  },
  COMMISSION_APPROVED: {
    eventType: "COMMISSION_APPROVED",
    description: "Notification to partner when commission accrual is approved by finance",
    allowedChannels: ["EMAIL", "WHATSAPP"],
    templateKey: "commission_approved",
    defaultPriority: "HIGH",
    requiresConsent: false,
  },
  COMMISSION_ON_HOLD: {
    eventType: "COMMISSION_ON_HOLD",
    description: "Notice when commission is placed on temporary cooling or compliance hold",
    allowedChannels: ["IN_APP", "EMAIL"],
    templateKey: "commission_on_hold",
    defaultPriority: "NORMAL",
    requiresConsent: false,
  },
  COMMISSION_PAYABLE: {
    eventType: "COMMISSION_PAYABLE",
    description: "Alert to finance and partner when commission reaches payable milestone",
    allowedChannels: ["IN_APP", "EMAIL"],
    templateKey: "commission_payable",
    defaultPriority: "HIGH",
    requiresConsent: false,
  },
  PAYOUT_PROCESSING: {
    eventType: "PAYOUT_PROCESSING",
    description: "Notification when bank payout batch is initiated",
    allowedChannels: ["IN_APP", "EMAIL"],
    templateKey: "payout_processing",
    defaultPriority: "NORMAL",
    requiresConsent: false,
  },
  PAYOUT_PROCESSED: {
    eventType: "PAYOUT_PROCESSED",
    description: "Formal acknowledgement with UTR reference when commission payout is completed",
    allowedChannels: ["EMAIL", "WHATSAPP"],
    templateKey: "payout_processed",
    defaultPriority: "HIGH",
    requiresConsent: false,
  },
  PAYOUT_FAILED: {
    eventType: "PAYOUT_FAILED",
    description: "Alert to finance when payout processing fails or is returned by bank",
    allowedChannels: ["IN_APP", "EMAIL"],
    templateKey: "payout_failed",
    defaultPriority: "HIGH",
    requiresConsent: false,
  },
  COMMISSION_CLAWBACK_CREATED: {
    eventType: "COMMISSION_CLAWBACK_CREATED",
    description: "Formal notice when a commission adjustment/clawback is created due to refund or cancellation",
    allowedChannels: ["EMAIL", "WHATSAPP"],
    templateKey: "commission_clawback_created",
    defaultPriority: "HIGH",
    requiresConsent: false,
  },
  TASK_ASSIGNED: {
    eventType: "TASK_ASSIGNED",
    description: "Notification to team member when an operational task is assigned",
    allowedChannels: ["IN_APP", "EMAIL"],
    templateKey: "task_assigned",
    defaultPriority: "HIGH",
    requiresConsent: false,
  },
  TASK_ACCEPTANCE_PENDING: {
    eventType: "TASK_ACCEPTANCE_PENDING",
    description: "Reminder to advisor when an assigned task requires formal acceptance",
    allowedChannels: ["IN_APP", "EMAIL"],
    templateKey: "task_acceptance_pending",
    defaultPriority: "HIGH",
    requiresConsent: false,
  },
  TASK_DUE_SOON: {
    eventType: "TASK_DUE_SOON",
    description: "Early warning notification when a task is approaching due date",
    allowedChannels: ["IN_APP", "EMAIL"],
    templateKey: "task_due_soon",
    defaultPriority: "NORMAL",
    requiresConsent: false,
  },
  TASK_OVERDUE: {
    eventType: "TASK_OVERDUE",
    description: "Alert when a task has passed its due date without completion",
    allowedChannels: ["IN_APP", "EMAIL"],
    templateKey: "task_overdue",
    defaultPriority: "HIGH",
    requiresConsent: false,
  },
  TASK_REASSIGNED: {
    eventType: "TASK_REASSIGNED",
    description: "Notification when task ownership is delegated to a new assignee",
    allowedChannels: ["IN_APP", "EMAIL"],
    templateKey: "task_reassigned",
    defaultPriority: "NORMAL",
    requiresConsent: false,
  },
  TASK_SENT_TO_REVIEW: {
    eventType: "TASK_SENT_TO_REVIEW",
    description: "Alert to designated reviewer when a task is submitted for review",
    allowedChannels: ["IN_APP", "EMAIL"],
    templateKey: "task_sent_to_review",
    defaultPriority: "HIGH",
    requiresConsent: false,
  },
  TASK_RETURNED: {
    eventType: "TASK_RETURNED",
    description: "Notice to assignee when a task is returned for corrections",
    allowedChannels: ["IN_APP", "EMAIL"],
    templateKey: "task_returned",
    defaultPriority: "HIGH",
    requiresConsent: false,
  },
  TASK_APPROVED: {
    eventType: "TASK_APPROVED",
    description: "Notification when a submitted task is approved by reviewer",
    allowedChannels: ["IN_APP", "EMAIL"],
    templateKey: "task_approved",
    defaultPriority: "NORMAL",
    requiresConsent: false,
  },
  TASK_ESCALATED: {
    eventType: "TASK_ESCALATED",
    description: "Urgent escalation alert to management when SLA breach threshold is reached",
    allowedChannels: ["IN_APP", "EMAIL"],
    templateKey: "task_escalated",
    defaultPriority: "HIGH",
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
  entityType?: "LEAD" | "SITE_VISIT" | "PROPERTY" | "LOCATION" | "USER" | "KYC" | "PAYMENT" | "BOOKING" | "DEAL";
  entityId?: string;
  isRead?: boolean;
  priority?: "HIGH" | "NORMAL" | "LOW";
  createdAt: string;
  actionUrl?: string;
  readAt?: string;
  deepLink?: string;
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

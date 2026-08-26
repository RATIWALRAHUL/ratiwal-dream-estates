/**
 * @file payment.ts
 * @description Central typed domain definitions for PRD 16: Payment Plans, Online/Offline Payments,
 * Receipts, Reconciliation & Refunds.
 * 
 * ALL monetary values are stored strictly in integer minor units (e.g. Paise: 1 INR = 100 Paise).
 */

// ─── 1. Payment Plan Types & Statuses ─────────────────────────────────────────

export const PAYMENT_PLAN_STATUSES = [
  "DRAFT",
  "PENDING_APPROVAL",
  "ACTIVE",
  "SUPERSEDED",
  "COMPLETED",
  "CANCELLED",
  "ARCHIVED",
] as const;
export type PaymentPlanStatus = (typeof PAYMENT_PLAN_STATUSES)[number];

export const INSTALLMENT_TYPES = [
  "BOOKING_AMOUNT",
  "DOWN_PAYMENT",
  "MILESTONE",
  "SCHEDULED_INSTALLMENT",
  "STATUTORY_CHARGE",
  "OTHER_APPROVED",
] as const;
export type InstallmentType = (typeof INSTALLMENT_TYPES)[number];

export const INSTALLMENT_STATUSES = [
  "DRAFT",
  "UPCOMING",
  "DUE",
  "PARTIALLY_PAID",
  "PAID",
  "OVERDUE",
  "WAIVED",
  "CANCELLED",
  "REFUNDED",
  "PARTIALLY_REFUNDED",
] as const;
export type InstallmentStatus = (typeof INSTALLMENT_STATUSES)[number];

// ─── 2. Payment Transaction Types & Statuses ──────────────────────────────────

export const PAYMENT_METHODS = [
  "UPI",
  "NET_BANKING",
  "CARD",
  "BANK_TRANSFER_NEFT_RTGS",
  "CHEQUE",
  "DEMAND_DRAFT",
  "POS_TERMINAL",
  "OTHER",
] as const;
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

export const PAYMENT_SOURCES = ["ONLINE_GATEWAY", "OFFLINE_MANUAL", "INTERNAL_ADJUSTMENT"] as const;
export type PaymentSource = (typeof PAYMENT_SOURCES)[number];

export const PAYMENT_PROVIDERS = ["RAZORPAY", "MANUAL", "MOCK"] as const;
export type PaymentProvider = (typeof PAYMENT_PROVIDERS)[number];

export const PAYMENT_TRANSACTION_STATUSES = [
  "CREATED",
  "PENDING",
  "AUTHORIZED",
  "CAPTURED",
  "FAILED",
  "CANCELLED",
  "PARTIALLY_REFUNDED",
  "REFUNDED",
  "DISPUTED",
  "CHARGEBACK",
  "REVERSED",
] as const;
export type PaymentTransactionStatus = (typeof PAYMENT_TRANSACTION_STATUSES)[number];

// ─── 3. Manual / Offline Payment Statuses ────────────────────────────────────

export const MANUAL_PAYMENT_STATUSES = [
  "SUBMITTED",
  "UNDER_REVIEW",
  "ACTION_REQUIRED",
  "VERIFIED",
  "REJECTED",
  "DUPLICATE",
  "CANCELLED",
] as const;
export type ManualPaymentStatus = (typeof MANUAL_PAYMENT_STATUSES)[number];

// ─── 4. Receipt Statuses ──────────────────────────────────────────────────────

export const RECEIPT_STATUSES = ["ISSUED", "VOID", "SUPERSEDED"] as const;
export type ReceiptStatus = (typeof RECEIPT_STATUSES)[number];

// ─── 5. Refund Types & Statuses ───────────────────────────────────────────────

export const REFUND_REQUEST_STATUSES = [
  "DRAFT",
  "SUBMITTED",
  "UNDER_REVIEW",
  "APPROVED",
  "REJECTED",
  "PROCESSING",
  "PARTIALLY_COMPLETED",
  "COMPLETED",
  "FAILED",
  "CANCELLED",
] as const;
export type RefundRequestStatus = (typeof REFUND_REQUEST_STATUSES)[number];

export const REFUND_REASON_CODES = [
  "BOOKING_CANCELLED",
  "OVERPAYMENT",
  "INVENTORY_UNAVAILABLE",
  "COMMERCIAL_RENEGOTIATION",
  "DISPUTE_SETTLEMENT",
  "LEGAL_REGULATORY_DIRECTIVE",
  "OTHER_APPROVED",
] as const;
export type RefundReasonCode = (typeof REFUND_REASON_CODES)[number];

export const PAYMENT_REFUND_STATUSES = [
  "CREATED",
  "PENDING",
  "PROCESSING",
  "PROCESSED",
  "FAILED",
  "REVERSED",
  "CANCELLED",
] as const;
export type PaymentRefundStatus = (typeof PAYMENT_REFUND_STATUSES)[number];

// ─── 6. Dispute & Chargeback Statuses ─────────────────────────────────────────

export const DISPUTE_STATUSES = [
  "OPEN",
  "UNDER_REVIEW",
  "EVIDENCE_SUBMITTED",
  "WON",
  "LOST",
  "CLOSED",
] as const;
export type DisputeStatus = (typeof DISPUTE_STATUSES)[number];

// ─── 7. Webhook & Reconciliation ─────────────────────────────────────────────

export const WEBHOOK_PROCESSING_STATUSES = [
  "RECEIVED",
  "PROCESSING",
  "PROCESSED",
  "DUPLICATE_IGNORED",
  "SIGNATURE_FAILED",
  "PROCESSING_FAILED",
] as const;
export type WebhookProcessingStatus = (typeof WEBHOOK_PROCESSING_STATUSES)[number];

export const RECONCILIATION_SEVERITIES = ["INFO", "WARNING", "CRITICAL"] as const;
export type ReconciliationSeverity = (typeof RECONCILIATION_SEVERITIES)[number];

// ─── 8. Financial Summary & Overview Interfaces ───────────────────────────────

export interface BookingPaymentSummary {
  totalPlanAmountPaise: number;
  totalPaidAmountPaise: number;
  totalOutstandingAmountPaise: number;
  totalOverdueAmountPaise: number;
  totalRefundedAmountPaise: number;
  totalPendingRefundPaise: number;
  totalUnallocatedPaise: number;
  currency: string;
  nextInstallmentDueDate?: Date;
  nextInstallmentAmountPaise?: number;
  paymentPlanStatus?: PaymentPlanStatus;
  isFullyPaid: boolean;
  hasOverdue: boolean;
}

export interface PaymentOverviewMetrics {
  totalCollectedPaise: number;
  totalDuePaise: number;
  totalOverduePaise: number;
  totalRefundedPaise: number;
  pendingManualReviewCount: number;
  activePlanCount: number;
  recentTransactionsCount: number;
  openDisputesCount: number;
  reconciliationIssuesCount: number;
  currency: string;
}

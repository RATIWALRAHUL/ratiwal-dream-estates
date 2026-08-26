/**
 * @file commission.ts
 * @description Domain types, calculation methods, bases, accrual statuses, and
 * adjustment models for PRD 18: Channel Partner Commissions & Payouts.
 */

// ─── 1. Commission Calculation Methods ────────────────────────────────────────

export const COMMISSION_CALCULATION_METHODS = [
  "FLAT_AMOUNT",
  "PERCENTAGE",
  "SLAB",
  "MILESTONE",
  "CUSTOM_APPROVED",
] as const;

export type CommissionCalculationMethod = (typeof COMMISSION_CALCULATION_METHODS)[number];

// ─── 2. Commission Bases ──────────────────────────────────────────────────────

export const COMMISSION_BASES = [
  "BOOKING_VALUE",
  "NET_CONSIDERATION",
  "CAPTURED_PAYMENT",
  "AGREEMENT_VALUE",
] as const;

export type CommissionBase = (typeof COMMISSION_BASES)[number];

// ─── 3. Accrual Statuses ──────────────────────────────────────────────────────

export const COMMISSION_ACCRUAL_STATUSES = [
  "ESTIMATED",
  "PENDING_ELIGIBILITY",
  "EARNED",
  "UNDER_REVIEW",
  "APPROVED",
  "ON_HOLD",
  "PAYABLE",
  "PARTIALLY_PAID",
  "PAID",
  "REVERSED",
  "CANCELLED",
  "DISPUTED",
] as const;

export type CommissionAccrualStatus = (typeof COMMISSION_ACCRUAL_STATUSES)[number];

// ─── 4. Commission Adjustment Types ───────────────────────────────────────────

export const COMMISSION_ADJUSTMENT_TYPES = [
  "POSITIVE_ADJUSTMENT",
  "NEGATIVE_ADJUSTMENT",
  "CLAWBACK",
  "REVERSAL",
  "CORRECTION",
] as const;

export type CommissionAdjustmentType = (typeof COMMISSION_ADJUSTMENT_TYPES)[number];

// ─── 5. Payout Statuses & Methods ─────────────────────────────────────────────

export const COMMISSION_PAYOUT_STATUSES = [
  "DRAFT",
  "PENDING_APPROVAL",
  "APPROVED",
  "PROCESSING",
  "PROCESSED",
  "FAILED",
  "PARTIALLY_PROCESSED",
  "CANCELLED",
  "REVERSED",
] as const;

export type CommissionPayoutStatus = (typeof COMMISSION_PAYOUT_STATUSES)[number];

export const PAYOUT_METHODS = [
  "BANK_TRANSFER_NEFT",
  "BANK_TRANSFER_RTGS",
  "BANK_TRANSFER_IMPS",
  "UPI",
  "CHEQUE",
  "MANUAL_OFFLINE",
] as const;

export type PayoutMethod = (typeof PAYOUT_METHODS)[number];

// ─── 6. Invoice Statuses ──────────────────────────────────────────────────────

export const PARTNER_INVOICE_STATUSES = [
  "SUBMITTED",
  "UNDER_REVIEW",
  "ACTION_REQUIRED",
  "APPROVED",
  "REJECTED",
  "CANCELLED",
] as const;

export type PartnerInvoiceStatus = (typeof PARTNER_INVOICE_STATUSES)[number];

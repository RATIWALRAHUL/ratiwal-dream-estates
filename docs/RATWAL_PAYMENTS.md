# PRD 16 — Payment Plans, Online/Offline Payments, Receipts, Reconciliation & Refunds

## 1. Executive Summary & Architecture

**Ratiwal Dream Estates** implements an institutional-grade financial operations and treasury system for luxury land conveyance and plotted township developments.

### Core Architectural Principles:
1. **Server-Authoritative Integer Arithmetic**: All money calculations use integer paise (minor units, 1 INR = 100 paise) via `MoneyUtils`. JavaScript floating-point representation for money is strictly prohibited.
2. **Maker-Checker Offline Verification**: Manual payments (NEFT/RTGS, cheques, demand drafts) are recorded through `ManualPaymentSubmission` and require multi-role verification before financial capture.
3. **Append-Only FIFO Payment Allocations**: Captured payments allocate funds across unpaid scheduled milestone instalments earliest-due first. Reversals create new negative-referencing records without altering history.
4. **Immutable Official Payment Receipts**: Receipts (`RDE-RCP-XXXXXX`) are issued only upon captured payments with clear disclaimers that they represent payment acknowledgements, not final conveyance deeds or tax invoices.
5. **Separated Refund Workflows**: Refund requests, approvals, gateway executions, and allocation reversals operate independently from booking cancellation and inventory release.
6. **Bounded Automated Reconciliation**: Background scanner verifies unallocated captured funds, missing receipts, stale payment claims, and payment plan discrepancies.

---

## 2. Data Models & Entities

| Model | Collection | Primary Responsibility |
|---|---|---|
| `PaymentPlan` | `paymentplans` | Contractual milestone payment schedule versioned per booking. |
| `PaymentInstallment` | `paymentinstallments` | Individual scheduled milestones (Token, Down Payment, Infra, Registry). |
| `PaymentTransaction` | `paymenttransactions` | Online gateway orders, captured payments, and manual settlement records. |
| `PaymentAllocation` | `paymentallocations` | Append-only ledger mapping captured payments to specific instalments. |
| `ManualPaymentSubmission` | `manualpaymentsubmissions` | Offline payment claims submitted for maker-checker review. |
| `PaymentReceipt` | `paymentreceipts` | Official immutable payment acknowledgement receipts (`RDE-RCP-XXXXXX`). |
| `RefundRequest` | `refundrequests` | Formal customer refund requests with structured reason codes. |
| `PaymentRefund` | `paymentrefunds` | Executed refunds with provider idempotency keys and processed amounts. |
| `PaymentDispute` | `paymentdisputes` | Chargeback and customer dispute management records. |
| `PaymentWebhookReceipt` | `paymentwebhookreceipts` | Deduplicated incoming webhook events with 30-day retention. |

---

## 3. Integration Endpoints & Routes

- `POST /api/webhooks/payments/[provider]`: Timing-safe HMAC-SHA256 webhook listener with deduplication.
- `POST /api/internal/payments/reconcile`: Protected reconciliation cron audit endpoint (`Bearer CRON_SECRET`).
- `GET /api/payments/receipts/[receiptId]/preview`: Streamed official payment receipt HTML preview.
- `GET /payments/pay/[token]`: Hosted public customer payment portal.

---

## 4. RBAC & Security Catalog

- `PAYMENTS_VIEW`: Read-only access to transactions, plans, and receipts.
- `PAYMENTS_CREATE`: Draft payment plans, initiate online payment links, submit manual payment claims.
- `PAYMENTS_APPROVE_PLAN`: Approve and activate customer payment plans.
- `PAYMENTS_VERIFY_MANUAL`: Verify and approve offline payment claims (maker-checker).
- `PAYMENTS_REFUND_MANAGE`: Approve and execute customer refunds.
- `PAYMENTS_RECONCILE`: Run automated reconciliation audits.
- `PAYMENTS_MANAGE`: Super admin controls, receipt voiding, and gateway configuration.

# Channel Partners, Brokers, Lead Attribution & Commission Management (PRD 18)

**Ratiwal Dream Estates — Production Documentation**

---

## 1. System Overview

PRD 18 establishes an enterprise-grade channel partner and broker management ecosystem for **Ratiwal Dream Estates**. Designed specifically for high-value plotted land developments across Rajasthan (Jaipur, Ajmer, Kishangarh) and Maharashtra (Navi Mumbai, NAINA), the platform provides:

1. **Partner Onboarding & Lifecycle State Machine**: Controlled transitions from invitation to active status with compliance gates.
2. **Strict 3-Way Session Isolation**: Dedicated cryptographic session cookie (`ratiwal_partner_token`) isolated from staff (`ratiwal_admin_token`) and customer (`ratiwal_customer_token`) sessions.
3. **Zero-PII Leak Duplicate Detection**: Safe lead deduplication that returns generic `"Already under review"` status without revealing existing buyer names, emails, phones, or CRM notes.
4. **Verifiable Customer Representation Consent**: Mandatory DPDP Act customer consent declaration on lead submission.
5. **Deterministic Commission Calculation Engine**: Minor-unit integer arithmetic (`MoneyUtils`) supporting Flat, Percentage, Slab, and Milestone calculation plans.
6. **Versioned Statutory Tax Rules**: Future-proof tax deduction rules (`CommissionTaxRule`) with effective dates, avoiding obsolete hardcoded Section 194H rates.
7. **Refund & Cancellation Clawbacks**: Append-only `CommissionAdjustment` records that proportionally reverse or adjust commissions upon booking cancellations or refunds.
8. **Maker-Checker Payout Safety**: Separate maker (drafting) and checker (approval & disbursement recording with bank UTR) roles for all commission disbursements.
9. **Dedicated Luxury Partner Portal (`/partner/*`)** & Staff Management Suite (`/dashboard/*`).

---

## 2. Partner Types & Lifecycle

### Partner Types
- `INDIVIDUAL_BROKER`: Solo licensed real estate brokers.
- `REAL_ESTATE_AGENT`: Independent sales advisors and agents.
- `AGENCY`: Registered real estate marketing and advisory agencies.
- `CHANNEL_PARTNER`: Strategic channel partners with multi-property mandates.
- `CORPORATE_PARTNER`: Institutional and wealth-management referral partners.
- `REFERRAL_PARTNER`: Light-touch individual referral sources.
- `OTHER_APPROVED`: Custom institutional relationships.

### Lifecycle State Machine

```
┌─────────┐      ┌─────────┐      ┌────────────┐      ┌──────────────┐
│  DRAFT  │ ───► │ INVITED │ ───► │ ONBOARDING │ ───► │ UNDER_REVIEW │
└─────────┘      └─────────┘      └────────────┘      └──────┬───────┘
                                                             │
                 ┌───────────┐      ┌──────────┐             ▼
                 │ SUSPENDED │ ◄──► │  ACTIVE  │ ◄────── ┌──────────┐
                 └─────┬─────┘      └────┬─────┘         │ APPROVED │
                       │                 │               └──────────┘
                       ▼                 ▼
                 ┌───────────┐      ┌──────────┐
                 │DEACTIVATED│      │ ARCHIVED │
                 └───────────┘      └──────────┘
```

---

## 3. Compliance & RERA Verification

RERA compliance distinguishes between two verified tiers:
- **`INTERNALLY_REVIEWED`**: Verified against physical or uploaded digital certificate by staff.
- **`OFFICIAL_SOURCE_VERIFIED`**: Cross-referenced against state RERA portals (e.g. `rera.rajasthan.gov.in`, `maharera.mahaonline.gov.in`).

> **Rule:** String format validation alone never marks a RERA registration as `OFFICIAL_SOURCE_VERIFIED`.

---

## 4. Commission Engine & Tax Rules

### Calculation Bases
- `BOOKING_VALUE`: Total agreement or booking consideration (Paise).
- `NET_CONSIDERATION`: Value excluding statutory development fees.
- `CAPTURED_PAYMENT`: Pro-rata commission on actual payments captured.

### Versioned Tax Rules
All TDS and GST rates are derived dynamically from versioned `CommissionTaxRule` records:
- Standard TDS Rate: e.g. 2.0% (Derived from active rule, not hardcoded).
- No-PAN TDS Rate: 20.0%.
- GST Rate: 18.0% where registered.

---

## 5. Portal Routes

| Path | Purpose |
|---|---|
| `/partner/login` | Secure partner authentication |
| `/partner/claim` | One-time invitation token claim |
| `/partner` | Dashboard overview & active property showcase |
| `/partner/leads` | Lead pipeline & attribution status |
| `/partner/leads/new` | Lead registration with DPDP consent |
| `/partner/commissions` | Commission accruals and TDS breakdown |
| `/partner/statements` | Periodic earnings statements |
| `/partner/documents` | Agreement & GST invoice submissions |
| `/partner/profile` | Company info, RERA, & payout profile |

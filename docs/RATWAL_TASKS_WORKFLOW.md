# Unified Tasks, Follow-ups, Work Queue & Team Productivity (PRD 19)

**Ratiwal Dream Estates — Production Documentation**

---

## 1. System Overview

PRD 19 establishes a unified operational task, team work queue, and productivity management framework for **Ratiwal Dream Estates**. It centralizes staff responsibilities, automated CRM event tasks (lead follow-ups, site visit preparations, KYC reviews, refund approvals, partner compliance), review-and-approval workflows, SLA breach monitoring, and workload allocation without replacing or duplicating underlying business entity states.

### Core Architectural Guarantees
1. **Entity Separation**: Tasks reference business records (`Lead`, `SiteVisit`, `CustomerKycCase`, `RefundRequest`, `ChannelPartner`, `Booking`, etc.) via typed references. Completing a task does NOT automatically alter the business entity state unless a dedicated business mutation is invoked.
2. **Deterministic Idempotency**: System-generated tasks use composite idempotency keys (e.g. `lead_followup_<leadId>_<timestamp>`) ensuring background workers never create duplicate tasks for the same event.
3. **Synchronized Lead Follow-Ups**: `Lead.nextFollowUpAt` and `OperationalTask` of type `LEAD_FOLLOW_UP` are coordinated through `LeadTaskSyncService`, capturing mandatory structured outcomes (`CONTACTED`, `SITE_VISIT_SCHEDULED`, `CALLBACK_REQUESTED`, etc.).
4. **Separation of Duties in Review Approvals**: Submitter cannot self-approve reviewable tasks (`LEGAL_DOCUMENT_REVIEW`, `KYC_REVIEW`, `REFUND_REVIEW`, `COMMISSION_REVIEW`).
5. **Privacy & No Surveillance**: Strict non-goals: no keystroke logging, time tracking, screenshot capture, or employee surveillance scoring.

---

## 2. Task Types & Lifecycle

### Typed Task Catalogue
- `GENERAL`: Manual operational staff tasks.
- `LEAD_FOLLOW_UP`: Scheduled CRM lead follow-ups.
- `LEAD_ASSIGNMENT_ACCEPTANCE`: Formal advisor acceptance of newly assigned leads.
- `SITE_VISIT_PREPARATION`: Pre-visit verification of land documents and customer confirmation.
- `SITE_VISIT_FOLLOW_UP`: Post-visit outcome recording and offer drafting.
- `LEGAL_DOCUMENT_REVIEW`: Staff verification of registry/patta documents.
- `LEGAL_DOCUMENT_RENEWAL`: Expiring document renewals.
- `KYC_REVIEW`: Identity and land ownership verification.
- `KYC_ACTION_REQUIRED`: Notice to customer for resubmitting rejected documents.
- `PAYMENT_FOLLOW_UP`: Milestone payment reminders.
- `PAYMENT_RECONCILIATION`: Offline bank mismatch resolution.
- `REFUND_REVIEW`: Financial review and refund authorization.
- `BOOKING_REQUIREMENT`: Agreement to Sale / registration preconditions.
- `PARTNER_ONBOARDING`: Channel partner compliance checks.
- `PARTNER_COMPLIANCE_RENEWAL`: Annual RERA / GST renewal.
- `COMMISSION_REVIEW`: Broker commission accrual validation.
- `SUPPORT_REQUEST`: Customer portal ticket resolution.
- `DATA_QUALITY_REVIEW`: Inventory or CRM data reconciliation.
- `OTHER_APPROVED`: Custom institutional tasks.

### Lifecycle State Machine

```
┌────────────────────┐      ┌─────────┐      ┌─────────────┐      ┌───────────┐
│ PENDING_ACCEPTANCE │ ───► │  TO_DO  │ ───► │ IN_PROGRESS │ ───► │ IN_REVIEW │
└────────────────────┘      └─────────┘      └──────┬──────┘      └─────┬─────┘
                                                    │                   │
                                                    ▼                   ▼
                                            ┌───────────────┐   ┌───────────┐
                                            │   COMPLETED   │ ◄─┤  APPROVED │
                                            └───────┬───────┘   └───────────┘
                                                    │
                                                    ▼
                                            ┌───────────────┐
                                            │   ARCHIVED    │
                                            └───────────────┘
```

---

## 3. Lead Follow-Up Integration

Structured outcomes supported:
- `CONTACTED`: Client spoke directly; interest confirmed.
- `NO_ANSWER`: Rung but unanswered; retry scheduled.
- `CALLBACK_REQUESTED`: Specific callback time requested.
- `INFO_SHARED`: Brochure / pricing sheet sent via WhatsApp/Email.
- `SITE_VISIT_REQUESTED`: Buyer requested a physical plot visit.
- `SITE_VISIT_SCHEDULED`: Site visit confirmed in calendar.
- `NOT_INTERESTED`: Budget / location mismatch.
- `FOLLOW_UP_REQUIRED`: Additional discussions needed.
- `WRONG_CONTACT`: Number invalid or incorrect person.
- `DUPLICATE_LEAD`: Duplicate lead merged.
- `OTHER`: Custom CRM notes recorded.

---

## 4. Workload Views & Dashboards

| Route | Purpose |
|---|---|
| `/dashboard/my-work` | Personal prioritized queue (Due Today, Overdue, Awaiting Acceptance, In Progress, In Review) |
| `/dashboard/tasks` | Full operational repository with multi-filter search and bulk actions |
| `/dashboard/tasks/[taskId]` | Comprehensive detail view with linked record card, comment thread, and audit history |
| `/dashboard/tasks/calendar` | Monthly/weekly calendar in organization timezone (`Asia/Kolkata`) |
| `/dashboard/tasks/team` | Team capacity visibility and task volume distribution by domain |

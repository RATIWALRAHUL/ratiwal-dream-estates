# Ratiwal Dream Estates — Lead & Inquiry CRM

## Overview

PRD 7 implements a secure, audit-logged lead management CRM connecting public inquiry forms to a protected dashboard pipeline.

## Public Inquiry Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/enquiries` | Canonical public inquiry endpoint (backward-compatible) |
| POST | `/api/inquiries` | Alias — new forms should use this path |

Both endpoints apply the same 13-step security pipeline.

### Security Pipeline (per request)
1. POST-only gate
2. Content-Type: application/json check
3. Body size limit (32 KB)
4. Zod parse — strips all unknown fields
5. Honeypot field check (silent fake-success on violation)
6. Minimum form-completion time check (5 s, silent fake-success)
7. Rate limit — per IP (10/15 min), per phone (3/hr), per email (5/hr)
8. Phone normalization + impossibility check (E.164)
9. Email normalization + structure validation
10. Canonical Property/Location reference validation (published, not archived)
11. Fingerprint-based duplicate detection (30-minute window)
12. Lead creation with initial timeline event
13. Generic success response — reference number only, no internal IDs

### Consent fields recorded at submission
- `consentGranted: true` (required)
- `consentTextVersion` (current: 1.0.0)
- `privacyPolicyVersion` (current: 1.0.0)
- `consentPurpose`: INQUIRY_PROCESSING
- `consentTimestamp`: server time
- `consentSource`: landingPath from form

---

## Lead Reference Numbers

Format: `RDE-XXXXXXXX` (8 Crockford base-32 characters)

Properties:
- Crypto-random (not sequential, does not expose DB ID or lead count)
- Safe for customer-facing communication (SMS, email, phone)
- ~1 trillion unique values (collision probability negligible)

---

## Data Model — Lead

File: [`src/models/Lead.ts`](../src/models/Lead.ts)

### Key fields

| Field | Type | Notes |
|-------|------|-------|
| `referenceNumber` | String | Unique, uppercase, crypto-random |
| `fullName` | String | 2–200 chars |
| `normalizedPhone` | String | E.164 |
| `displayPhone` | String | Human-readable |
| `normalizedEmail` | String? | Lowercase domain |
| `status` | LeadStatus | Transition-enforced |
| `priority` | LeadPriority | LOW/NORMAL/HIGH/URGENT |
| `assignedToId` | String? | Staff admin ID (string, not FK) |
| `submissionFingerprint` | String | SHA-256 truncated, for deduplication |
| `consentGranted` | Boolean | Required; never false at creation |
| `retentionReviewAt` | Date | 90 days from creation; 30 days from withdrawal |
| `anonymizedAt` | Date? | Set by anonymization action |

### Status Transitions (enforced in `changeLeadStatusAction`)

```
NEW         → CONTACTED, SPAM, ARCHIVED
CONTACTED   → QUALIFIED, NURTURING, SPAM, ARCHIVED
QUALIFIED   → NEGOTIATING, NURTURING, SPAM, ARCHIVED
NURTURING   → QUALIFIED, CONTACTED, SPAM, ARCHIVED
NEGOTIATING → WON, LOST, SPAM, ARCHIVED
WON         → ARCHIVED
LOST        → ARCHIVED
SPAM        → ARCHIVED
ARCHIVED    → (terminal)
```

LOST requires a `lostReason` from the `LOST_REASONS` enum.

---

## Dashboard CRM

### Routes

| Route | Description |
|-------|-------------|
| `/dashboard/leads` | Paginated lead list with metrics and filters |
| `/dashboard/leads/[leadId]` | Full lead detail: identity, inquiry, notes, contacts, timeline |

### Role-Based Access

| Action | SUPER_ADMIN | ADMIN | EDITOR |
|--------|-------------|-------|--------|
| View leads list | All leads | All leads | Assigned only |
| View lead detail | Yes | Yes | Assigned only |
| Change status | Yes | Yes | Yes (assigned) |
| Change priority | Yes | Yes | Yes (assigned) |
| Assign/Reassign | Yes | Yes | No |
| Add note | Yes | Yes | Yes (assigned) |
| Record contact | Yes | Yes | Yes (assigned) |
| Schedule follow-up | Yes | Yes | Yes (assigned) |
| Mark spam | Yes | Yes | Yes |
| Archive | Yes | Yes | No |
| Record consent withdrawal | Yes | Yes | No |
| Anonymize | Yes | No | No |

### Filters (URL params)

| Param | Type | Notes |
|-------|------|-------|
| `search` | string | Searches name, phone, email, reference |
| `status` | LeadStatus | Exact match |
| `priority` | LeadPriority | Exact match |
| `source` | LeadSource | Exact match |
| `assignedToId` | string | Staff ID |
| `propertyId` | string | MongoDB ObjectId |
| `locationId` | string | MongoDB ObjectId |
| `dateFrom` | ISO date | Filters `createdAt >= dateFrom` |
| `dateTo` | ISO date | Filters `createdAt <= dateTo` |
| `followUpStatus` | enum | `overdue`, `due_today`, `has_followup`, `no_followup` |
| `page` | number | Pagination (default 1) |

---

## Rate Limiting

File: [`src/lib/rate-limit.ts`](../src/lib/rate-limit.ts)

In-process sliding window. Single-process only. For multi-instance, replace store with Redis.

| Surface | Limit | Window |
|---------|-------|--------|
| Public inquiry (IP) | 10 | 15 min |
| Public inquiry (phone) | 3 | 1 hr |
| Public inquiry (email) | 5 | 1 hr |
| Dashboard lead mutation | 60 | 1 min |
| Lead export | 5 | 1 hr |
| Anonymization | 10 | 1 hr |

---

## Audit Events (new in PRD 7)

Events logged to `AuditLog` collection with `targetLeadId`:

| Action | Trigger |
|--------|---------|
| `LEAD_CREATED` | (logged via system — not via audit service, timeline only) |
| `LEAD_VIEWED` | Detail page load (best-effort, non-blocking) |
| `LEAD_ASSIGNED` | First assignment |
| `LEAD_REASSIGNED` | Subsequent assignment |
| `LEAD_STATUS_CHANGED` | Any status transition |
| `LEAD_PRIORITY_CHANGED` | Priority change |
| `LEAD_NOTE_ADDED` | Internal note creation |
| `LEAD_CONTACT_RECORDED` | Contact attempt recorded |
| `LEAD_FOLLOWUP_SCHEDULED` | Follow-up date set |
| `LEAD_FOLLOWUP_COMPLETED` | Follow-up marked done |
| `LEAD_MARKED_SPAM` | Spam marking |
| `LEAD_ARCHIVED` | Archive action |
| `LEAD_CONSENT_WITHDRAWN` | Consent withdrawal |
| `LEAD_ANONYMIZED` | PII anonymization |
| `LEAD_EXPORT_PERFORMED` | Bulk export (reserved for future) |

---

## Anonymization

- SUPER_ADMIN only
- Supports dry-run mode (returns `fieldsToAnonymize` list without modifying data)
- Overwrites: `fullName`, `normalizedPhone`, `displayPhone`, `normalizedEmail`, `displayEmail`, `message`, `preferredLanguage`
- Preserves: status, source, property/location references, timeline event types, budget, timeline preferences
- Sets `anonymizedAt` — anonymized leads are excluded from list queries

---

## Retention

- Review date: 90 days from `createdAt`
- On consent withdrawal: review date reset to 30 days from `consentWithdrawnAt`
- `getRetentionReport()` service function provides dry-run report (does not delete)
- Legal review required before automated deletion is implemented in production

---

## Phone Utility

File: [`src/lib/utils/phone.ts`](../src/lib/utils/phone.ts)

- Normalizes to E.164
- Promotes 10-digit numbers to `+91` (Indian)
- Rejects: too short, all-same digits, zero-prefix 10-digit
- `maskPhone(display)` — shows prefix + first group, hides last 4: `+91 98765 ●●●●`

---

## Reference Utility

File: [`src/lib/utils/reference.ts`](../src/lib/utils/reference.ts)

- Crockford base-32 alphabet (excludes I, L, O, U)
- `generateReferenceNumber()` → `RDE-XXXXXXXX`
- `isValidReferenceNumber(ref)` → boolean

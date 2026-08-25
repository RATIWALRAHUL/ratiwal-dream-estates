# Ratiwal Dream Estates — Site Visit Scheduling & Advisor Calendar

## 1. Overview

PRD 8 implements end-to-end Site Visit Operations connecting qualified Leads with Property inspections. It provides advisor availability rules, atomic 15-minute slot locking to eliminate double-booking, and day/week/agenda calendar views for the operations team.

---

## 2. Public API Endpoints

### 2.1 Public Availability Endpoint
`GET /api/site-visits/availability`

Query parameters:
- `propertyId` (Required, valid MongoDB ObjectId)
- `startDate` (Required, `YYYY-MM-DD`)
- `endDate` (Required, `YYYY-MM-DD`)
- `meetingMode` (Optional, `IN_PERSON` | `VIRTUAL_TOUR` | `OFFICE_CONSULTATION`)

Output:
- Returns safe anonymous slots: `{ startAt, endAt, displayTime, durationMinutes, available }`.
- Does **not** expose advisor IDs, internal schedules, or other customer appointments.

### 2.2 Public Tour Booking Request
`POST /api/site-visits/requests` (and alias `/api/site-visits`)

Pipeline:
1. Validates content size (< 32 KB) and Zod schema.
2. Honeypot check (`_honeypot`).
3. Form timing check (minimum 4 seconds).
4. Multi-layer rate limiting (IP, Phone).
5. Canonical published Property & Location verification.
6. Phone normalization (E.164 with Indian `+91` promotion).
7. Duplicate detection (30-minute fingerprint window).
8. Finds or creates linked `Lead` with `INQUIRY_SUBMITTED` timeline event.
9. Creates `SiteVisit` in `REQUESTED` status with reference `RDE-SV-XXXXXX`.
10. Returns generic success with public reference.

---

## 3. Data Models

### 3.1 `SiteVisit`
File: [`src/models/SiteVisit.ts`](../src/models/SiteVisit.ts)

- **Identity**: `referenceNumber` (`RDE-SV-XXXXXX`), `leadId`, `propertyId`, `locationId`, `assignedAdvisorId`, `requestedBy`, `source`.
- **Schedule**: `requestedStartAt`, `requestedEndAt`, `scheduledStartAt`, `scheduledEndAt`, `timezone` (`Asia/Kolkata`), `durationMinutes` (60), `bufferBeforeMinutes` (15), `bufferAfterMinutes` (15), `meetingMode`, `visitorCount`.
- **Workflow**: `status`, `priority`, `confirmationStatus`, `cancellationReason`, `cancellationNote`, `completedAt`, `outcomeSummary`, `customerInterestLevel`, `followUpRecommendation`, `noShowRecordedAt`, `noShowNote`, `archivedAt`.
- **Subdocuments**: `timeline` and `notes`.
- **Optimistic Concurrency**: `__v`.

### 3.2 `AdvisorAvailability`
File: [`src/models/AdvisorAvailability.ts`](../src/models/AdvisorAvailability.ts)

- Weekly operating schedule (`dayOfWeek`: 0–6, `startLocalTime`, `endLocalTime`, `active`).
- Configurable durations, slot intervals, buffers, minimum booking notice (default: 4 hours), and max advance window (default: 30 days).
- Granular exception dates (holidays, leaves, maintenance blocks).

### 3.3 `AdvisorSlotLock`
File: [`src/models/AdvisorSlotLock.ts`](../src/models/AdvisorSlotLock.ts)

- Atomic concurrency lock model.
- 15-minute slot intervals spanning `[scheduledStartAt - bufferBefore, scheduledEndAt + bufferAfter]`.
- Partial unique compound index on `{ advisorId: 1, slotKey: 1 }` where `status: "ACTIVE"`.

---

## 4. Status Lifecycle & State Machine

```
REQUESTED             → PENDING_CONFIRMATION, CONFIRMED, CANCELLED, ARCHIVED
PENDING_CONFIRMATION  → CONFIRMED, CANCELLED, ARCHIVED
CONFIRMED             → RESCHEDULE_REQUESTED, COMPLETED, NO_SHOW, CANCELLED, ARCHIVED
RESCHEDULE_REQUESTED  → CONFIRMED, CANCELLED, ARCHIVED
CANCELLED             → ARCHIVED
COMPLETED             → ARCHIVED
NO_SHOW               → ARCHIVED
ARCHIVED              → (Terminal State)
```

Transitions are strictly validated server-side.

---

## 5. Double-Booking Protection Algorithm

1. On confirming or rescheduling a visit, calculate the occupied range including buffers:
   `[startAt - bufferBefore, endAt + bufferAfter]`
2. Divide the range into standard 15-minute slot keys (`ISO 8601 UTC`).
3. Check for existing active locks matching `{ advisorId, slotKey, status: "ACTIVE" }`.
4. If clear, insert active `AdvisorSlotLock` records atomically.
5. On cancellation or completion, release all associated slot locks.
6. Diagnostic script [`auditOrphanLocks`](../src/lib/services/site-visit-scheduling.service.ts) detects stale or orphaned locks.

---

## 6. Dashboard Routes

| Route | Purpose |
|-------|---------|
| `/dashboard/site-visits` | Operational agenda, KPI metrics (Requested, Pending, Confirmed Today, Upcoming, Completed, No-Show), multi-facet filter bar, desktop table & mobile card list |
| `/dashboard/site-visits/calendar` | Day, Week, and Agenda interactive calendar with timezone indicators and keyboard navigation |
| `/dashboard/site-visits/[visitId]` | 2/3 + 1/3 master detail page with visitor identity, property context, logistics, timeline, notes, assignment, and status controls |
| `/dashboard/site-visits/availability` | Advisor & business availability settings, weekly working windows editor, and blackout exception manager |

---

## 7. Role-Based Permissions

| Action | SUPER_ADMIN / ADMIN | EDITOR (Advisor) |
|--------|---------------------|------------------|
| View visits list | All visits | Assigned visits only |
| View calendar | All visits | Assigned visits only |
| Assign/Reassign advisor | Yes | No |
| Confirm schedule | Yes | Assigned visits only |
| Reschedule | Yes | Assigned visits only |
| Cancel visit | Yes | Assigned visits only |
| Complete visit | Yes | Assigned visits only |
| Record no-show | Yes | Assigned visits only |
| Edit availability rules | Global & advisor schedules | Own schedule only |

---

## 8. Timezone Handling

- All timestamps are stored in **UTC** in MongoDB.
- Display timezone defaults to **`Asia/Kolkata`** (+05:30) across all UI components.
- Server boundary helper [`parseLocalTimeToUtc`](../src/lib/services/site-visit-scheduling.service.ts) handles conversions reliably without daylight saving ambiguity.

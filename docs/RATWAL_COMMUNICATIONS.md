# Ratiwal Dream Estates — Transactional Notifications & Communication Automation

## 1. Architecture & Design Principles

PRD 9 establishes a reliable, non-blocking communication layer for transactional operations across Ratiwal Dream Estates.

```
┌─────────────────────────────────────────────────────────────┐
│                   User-Facing Mutation                      │
│     (Public Inquiry / Lead Assign / Site-Visit Booking)     │
└──────────────────────────────┬──────────────────────────────┘
                               │ 1. Persist Business Mutation
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                 Transactional Outbox Write                  │
│       • Idempotency Key (No PII)                            │
│       • Status: PENDING                                     │
│       • Fast In-App Notification Write                      │
└──────────────────────────────┬──────────────────────────────┘
                               │ 2. Immediate 200 OK to User
                               ▼
┌─────────────────────────────────────────────────────────────┐
│             Asynchronous Batch Worker Processing             │
│    • Atomic Lease Acquisition (leaseUntil, attemptCount)    │
│    • Consent & Suppression Check (Bounce / Opt-Out)         │
│    • Dispatch via Email (Resend) / WhatsApp (Meta Cloud)    │
│    • Exponential Backoff with Jitter for Transient Errors   │
│    • Max Attempts (5) → DEAD_LETTER State                   │
└─────────────────────────────────────────────────────────────┘
```

### 1.1 Critical Reliability Invariant
**Primary business actions NEVER fail due to communication provider downtime.**
Inquiries and site visits are persisted immediately to MongoDB, creating an Outbox record. Provider network calls occur asynchronously without request-bound timeouts.

---

## 2. Communication Event Catalogue

| Event Type | Allowed Channels | Template Key | Purpose & Cancellation Rule |
|------------|------------------|--------------|-----------------------------|
| `INQUIRY_RECEIVED_CUSTOMER` | `EMAIL`, `WHATSAPP` | `inquiry_received_customer` | Customer acknowledgement on general inquiry |
| `LEAD_CREATED_INTERNAL` | `IN_APP`, `EMAIL` | `lead_created_internal` | Internal alert on prospect capture |
| `LEAD_ASSIGNED_INTERNAL` | `IN_APP`, `EMAIL` | `lead_assigned_internal` | Alert to assigned advisor |
| `LEAD_FOLLOWUP_DUE` | `IN_APP` | `lead_followup_due` | Reminder on scheduled follow-up date |
| `SITE_VISIT_REQUEST_RECEIVED_CUSTOMER` | `EMAIL`, `WHATSAPP` | `site_visit_request_received_customer` | Customer request confirmation |
| `SITE_VISIT_REQUEST_RECEIVED_INTERNAL` | `IN_APP`, `EMAIL` | `site_visit_request_received_internal` | Alert to operations desk |
| `SITE_VISIT_ASSIGNED_INTERNAL` | `IN_APP`, `EMAIL` | `site_visit_assigned_internal` | Alert to assigned tour advisor |
| `SITE_VISIT_CONFIRMED_CUSTOMER` | `EMAIL`, `WHATSAPP` | `site_visit_confirmed_customer` | Locked date/time with meeting point instructions |
| `SITE_VISIT_RESCHEDULED_CUSTOMER` | `EMAIL`, `WHATSAPP` | `site_visit_rescheduled_customer` | Updated itinerary notice |
| `SITE_VISIT_CANCELLED_CUSTOMER` | `EMAIL`, `WHATSAPP` | `site_visit_cancelled_customer` | Cancellation notice |
| `SITE_VISIT_REMINDER_24H` | `EMAIL`, `WHATSAPP` | `site_visit_reminder_24h` | 24h reminder (Cancelled on visit reschedule/cancel) |
| `SITE_VISIT_REMINDER_2H` | `EMAIL`, `WHATSAPP` | `site_visit_reminder_2h` | 2h operational reminder with advisor helpline |
| `SITE_VISIT_COMPLETED_INTERNAL` | `IN_APP` | `site_visit_completed_internal` | Record visit completion outcome |
| `SITE_VISIT_FOLLOWUP_REQUIRED` | `IN_APP` | `site_visit_followup_required` | Reminder to log post-visit feedback |

---

## 3. Data Models

### 3.1 `NotificationOutbox`
File: [`src/models/NotificationOutbox.ts`](../src/models/NotificationOutbox.ts)
- Atomic leasing: `leaseOwner`, `leaseUntil`.
- Concurrency indexes: `{ status: 1, nextAttemptAt: 1, scheduledFor: 1 }`.
- Deterministic Idempotency Key: `eventType:aggregateId:v{version}:{templateKey}`.

### 3.2 `NotificationDelivery`
File: [`src/models/NotificationDelivery.ts`](../src/models/NotificationDelivery.ts)
- Granular per-channel attempt logging.
- Masked privacy-safe recipient storage (`v***a@domain.com`, `+91 98*** **210`).
- Delivery states: `QUEUED`, `SENDING`, `SENT`, `DELIVERED`, `READ`, `FAILED`, `BOUNCED`, `COMPLAINED`, `SUPPRESSED`.

### 3.3 `CommunicationConsent`
File: [`src/models/CommunicationConsent.ts`](../src/models/CommunicationConsent.ts)
- Tracks recipient opt-in, suppression status, hard bounces, spam complaints, and opt-outs.

### 3.4 `WebhookReceipt`
File: [`src/models/WebhookReceipt.ts`](../src/models/WebhookReceipt.ts)
- Unique compound index `{ provider: 1, providerEventId: 1 }` preventing duplicate webhook processing.

---

## 4. Provider Configuration & Test Sandbox

### Environment Variables
```ini
# Operational Mode: 'test' (default) or 'live'
COMMUNICATIONS_MODE=test

# Test Allowlist (Comma-separated or '*' for dev testing)
COMMUNICATIONS_TEST_ALLOWLIST=*
COMMUNICATIONS_TEST_EMAIL=advisory-test@ratiwal.com
COMMUNICATIONS_TEST_WHATSAPP_NUMBER=+919876543210

# Cron Processor Secret
CRON_SECRET=your_secure_cron_secret_here

# Resend Email Integration
RESEND_API_KEY=re_123456789
RESEND_FROM_EMAIL=Ratiwal Dream Estates <advisory@ratiwaldreamestates.com>
RESEND_REPLY_TO=support@ratiwaldreamestates.com
RESEND_WEBHOOK_SECRET=whsec_resend_secret

# Meta WhatsApp Business Cloud API
WHATSAPP_ACCESS_TOKEN=EAAG...
WHATSAPP_PHONE_NUMBER_ID=100654321098765
WHATSAPP_BUSINESS_ACCOUNT_ID=200654321098765
WHATSAPP_APP_SECRET=app_secret_here
WHATSAPP_WEBHOOK_VERIFY_TOKEN=ratiwal_whatsapp_verify_token
WHATSAPP_API_VERSION=v21.0
```

---

## 5. Webhooks & Background Worker

### 5.1 Internal Bounded-Batch Processor
`GET /api/internal/notifications/process`
- Header: `Authorization: Bearer ${CRON_SECRET}`
- Processes up to 25 due outbox records atomically per invocation.

### 5.2 Resend Webhook
`POST /api/webhooks/resend`
- Processes `email.delivered`, `email.bounced`, `email.complained`.
- Automatically marks recipient suppression on hard bounce or complaint.

### 5.3 Meta WhatsApp Webhook
`GET /api/webhooks/whatsapp` (Verification Challenge)
`POST /api/webhooks/whatsapp` (Delivery Status Updates: `delivered`, `read`, `failed`)

---

## 6. Dead-Letter Queue & Recovery

- When an outbox record encounters permanent errors (e.g. invalid recipient, unapproved template) or exhausts all 5 exponential backoff retry attempts, it transitions to `DEAD_LETTER`.
- Super Admins can review errors in `/dashboard/communications/dead-letter` and trigger safe re-queuing once root causes are resolved.

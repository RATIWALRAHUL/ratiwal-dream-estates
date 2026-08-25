# PRD 10 — Settings, Team Management, Roles & Access Control Reference

## Executive Overview
The **Settings & Team Management** module provides enterprise-grade, concurrency-safe access control and organization configuration for Ratiwal Dream Estates. It establishes a typed catalogue of 42 granular permissions across 14 functional modules, 6 data isolation scopes, one-time hashed invitation tokens, work handover reassignment, last Super Admin safeguards, and versioned configuration audit histories with safe rollback capabilities.

---

## 1. Role-Based Access Control (RBAC) Architecture

### A. Functional Modules (14)
- `DASHBOARD`, `PROPERTIES`, `LOCATIONS`, `INVENTORY`, `LEADS`, `SITE_VISITS`, `LEGAL_VAULT`, `COMMUNICATIONS`, `ANALYTICS`, `REPORTS`, `TEAM`, `ROLES`, `SETTINGS`, `AUDIT_LOGS`.

### B. Data Scopes (6)
1. `OWN`: Data authored strictly by the individual user.
2. `ASSIGNED`: Records directly assigned to the advisor/reviewer (e.g. assigned leads, scheduled site visits).
3. `TEAM`: Records belonging to members within the same department.
4. `SELECTED_PROPERTIES`: Scoped explicitly to authorized property project IDs.
5. `SELECTED_LOCATIONS`: Scoped explicitly to authorized location/micro-market IDs.
6. `ALL_ORGANIZATION`: Unrestricted organization-wide data access.

### C. System Roles (Protected)
- **`SUPER_ADMIN`**: Full platform authority across all modules, settings, custom roles, and team governance.
- **`ADMIN`**: Comprehensive management across properties, locations, inventory, CRM, and analytics.
- **`SALES_MANAGER`**: Lead distribution, sales pipeline monitoring, advisor site-visit coordination.
- **`ADVISOR`**: Interaction with assigned prospective buyers and scheduled on-site property tours.
- **`LEGAL_MANAGER`**: Legal Vault title chain verification, statutory checklist approvals, and secure external sharing.
- **`INVENTORY_MANAGER`**: Plot matrices, unit dimension overrides, pricing sheets, and bulk spreadsheet imports.

---

## 2. Security & Safeguards

### A. Last Super Admin Protection
The platform enforces atomic verification before allowing any role modification, suspension, or deactivation targeting a `SUPER_ADMIN`. If active Super Admin count is $\le 1$, the operation is blocked with a strict conflict exception to prevent organization lockout.

### B. One-Time Hashed Invitations
- Plaintext tokens are generated as 32-byte cryptographic random hex strings.
- Only SHA-256 hashes (`tokenHash`) are stored in MongoDB.
- Configurable expiration window (default 72 hours).
- Resend rate-limiting cooldown (60 seconds).
- Instant administrative revocation.

### C. Controlled Work Handover
Before deactivating or offboarding a team member, the handover engine evaluates:
- Active Leads (`Lead` count where status $\notin$ `["CLOSED_LOST", "CONVERTED", "ARCHIVED"]`).
- Upcoming Site Visits (`SiteVisit` count where `scheduledStartAt` $\ge$ now and status $\in$ `["REQUESTED", "ASSIGNED", "CONFIRMED"]`).
- Pending Legal Reviews (`LegalDocument` count where status = `"UNDER_REVIEW"`).

Batch reassignment allocates all active items to an active target member before setting source status to `DEACTIVATED`.

---

## 3. Organization Settings & Rollback Engine

### A. Singleton Configuration Schema
- **General**: Legal business names, CIN, GSTIN, registered office, official support email/phone.
- **Regional**: `Asia/Kolkata` timezone, `INR` currency, Square Yards (`SQ_YD` / Gaj) area measure, working days & hours.
- **CRM & Leads**: Round-robin/manual assignment, first-response SLAs, inactivity and duplicate thresholds.
- **Site Visits**: Visit durations, minimum notice windows, advance booking limits, reschedule caps.
- **Legal Vault**: Maximum upload file sizes, default classifications, share durations and download caps.
- **Security**: Invitation TTL, resend cooldowns, max login attempts, session persistence duration.

### B. Optimistic Concurrency & Audit Rollback
- Every mutation increments `settingsVersion`.
- Modifying a stale version produces an immediate `CONFLICT` error.
- All revisions record before/after snapshots in `SettingsChange`.
- Super Admins can roll back any section safely, generating a new forward-moving version.

### C. Zero Secret Exposure
External integration cards (Resend, ImageKit, MongoDB, WhatsApp, Google Maps) display operational status and never reflect API keys or secrets in client HTTP payloads.

# PRD 17 — Secure Customer Self-Service Portal

## 1. Overview & Architecture

The **Secure Customer Self-Service Portal** (`/portal/*`) provides authenticated buyers and authorized co-applicants of **Ratiwal Dream Estates** with a dedicated, brand-aligned workspace. The portal strictly enforces session-derived data scoping (Anti-IDOR), ensuring that customers only ever view or interact with records to which they have explicit legal entitlements.

```
┌─────────────────────────────────────────────────────────────┐
│                    Customer Browser                         │
│             (Cookie: ratiwal_customer_token)                │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                      /portal/* Routes                       │
│    (Overview, Bookings, Payments, KYC, Documents, Support)   │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                PortalGuard & Session Engine                 │
│          getCustomerSession() -> resolveCustomerScope()      │
│  - accountId -> Active CustomerPortalAccess records          │
│  - derives authorized partyIds, bookingIds, applicantIds    │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                   Mongoose Database Layer                   │
│   (CustomerPortalAccount, CustomerPortalAccess, Bookings,    │
│    PaymentPlans, PaymentInstallments, CustomerSupportRequest)│
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Customer & Staff Session Separation

1. **Authentication Tokens & Cookies**:
   - **Customer Session**: Stored in `ratiwal_customer_token` HTTP-only, SameSite cookie signed with cryptographic HMAC-SHA256.
   - **Staff Session**: Stored in `ratiwal_admin_token` HTTP-only cookie parsed by `getAdminSession()`.
2. **Access Isolation**:
   - Customer accounts have zero administrative roles and cannot access `/dashboard/*` or staff endpoints.
   - Staff accounts cannot log in as or impersonate customers.
   - All portal routes are marked `noindex`, `no-store` with dynamic server rendering.

---

## 3. Cryptographic One-Time Invitations & Account Claim

1. **Invitation Generation**:
   - Staff issues a portal invitation (`RDE-INV-XXXXXX`) linked to a `CustomerParty` and `Booking`.
   - A 32-byte cryptographic random token is generated; only the SHA-256 hash is persisted in `CustomerPortalInvitation`.
   - Invitations have a 7-day configurable validity. Resending automatically marks older pending invitations as `SUPERSEDED`.
2. **Account Claiming & Password Setup**:
   - The buyer opens `/portal/claim?token=...`.
   - The token hash is verified. If the customer does not have an account, PBKDF2 (10,000 iterations, 64-byte key with per-user salt) hashes their chosen password.
   - `CustomerPortalAccess` is created atomically, and the invitation status transitions to `ACCEPTED`.

---

## 4. Session-Derived Anti-IDOR Authorization

Every portal query and mutation calls `PortalGuard`:
- `PortalGuard.resolveCustomerScope(session)`: Queries all active `CustomerPortalAccess` records and gathers allowed `partyIds`, `bookingIds`, and `applicantIds`.
- `PortalGuard.assertCustomerBookingAccess(session, bookingId)`: Throws `ACCESS_DENIED` if `bookingId` does not belong to the session scope.
- `PortalGuard.assertCustomerPaymentAccess(session, paymentId)`: Verifies payment ownership.
- `PortalGuard.assertCustomerKycAccess(session, caseId)`: Verifies KYC case ownership.
- `PortalGuard.assertCustomerSupportAccess(session, requestId)`: Verifies support ticket ownership.

URL tampering never exposes another customer's financial or identity data.

---

## 5. Portal Sections & Capabilities

| Section | Route | Capabilities |
| :--- | :--- | :--- |
| **Overview** | `/portal` | Active booking summary, conveyance progress, upcoming payment milestones, and recent notifications. |
| **Bookings** | `/portal/bookings` & `[bookingId]` | Full plot specifications, agreed pricing snapshots, and 5-step milestone timeline. |
| **Payments** | `/portal/payments` | Server-calculated milestone instalments, transaction ledger, and hosted payment gateway checkout. |
| **Receipts** | `/portal/receipts` | Official payment acknowledgement receipts with streamed institutional HTML preview. |
| **Refunds** | `/portal/refunds` | Structured refund requests with reason codes, balance validations, and status tracking. |
| **KYC & Identity** | `/portal/kyc` & `[caseId]` | Statutory ID compliance (Aadhaar/PAN masking), applicant checklists, and secure uploads. |
| **Site Visits** | `/portal/site-visits` & `new` | Schedule guided plot viewings, boundary demarcation inspections, and view advisor details. |
| **Documents** | `/portal/documents` | Customer-approved statutory property master plans, RERA disclosures, and receipts. |
| **Support Desk** | `/portal/support` & `[requestId]` | Threaded customer care ticketing with category selection, priority, and staff replies. |
| **Profile & Privacy**| `/portal/profile` & `/portal/privacy` | Contact details, communication channel preferences, DPDP statutory rights (access/correction/erasure). |

---

## 6. Audit & Communication Integration

- **Audit Actions**: `PORTAL_INVITATION_SENT`, `PORTAL_ACCOUNT_CLAIMED`, `PORTAL_LOGIN`, `PORTAL_ACCESS_REVOKED`, `CUSTOMER_SUPPORT_CREATED`, `CUSTOMER_SUPPORT_UPDATED`, `CUSTOMER_PREFERENCES_UPDATED`.
- **Outbox Events**:
  - `PORTAL_INVITATION_CUSTOMER`: Delivers secure one-time activation link to customer email/WhatsApp.
  - `PORTAL_ACTIVATED_INTERNAL`: Notifies staff upon successful customer onboarding.
  - `PORTAL_ACCESS_REVOKED_CUSTOMER`: Formal notification upon access revocation.
  - `CUSTOMER_SUPPORT_CREATED_INTERNAL` & `CUSTOMER_SUPPORT_UPDATED_CUSTOMER`: Threaded ticket notifications.
  - `PRIVACY_REQUEST_CREATED_INTERNAL`: Alerts Data Protection Officer.

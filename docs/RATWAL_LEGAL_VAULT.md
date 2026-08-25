# Ratiwal Dream Estates — PRD 9: Secure Legal Vault, Compliance & Document Review

## 1. Executive Summary & Compliance Charter

The **Ratiwal Dream Estates Legal Vault** is a secure, append-only statutory document management and title-chain review system designed for Indian real estate governance.

### Core Legal Accuracy Principles
1. **Zero Misleading Claims**: The platform never asserts *"Government verified"*, *"Legally guaranteed"*, *"100% clear title"*, or *"Title guaranteed"*.
2. **Honest Status Labels**: All documents display explicit, neutral internal statuses:
   - `Internally reviewed`
   - `Action required`
   - `Expired`
   - `Document not provided`
   - `Document readiness percentage`
3. **Document Readiness != Legal Clearance**: Checklist completion metrics measure document completeness for internal operations and do not constitute statutory title certification.

---

## 2. Architecture & Data Lifecycle

```
[Upload / DRAFT] ──► [UNDER_REVIEW] ──► [INTERNALLY_VERIFIED] ──► [EXPIRED]
       │                    │                     │
       ▼                    ▼                     ▼
  [REJECTED]        [ACTION_REQUIRED]        [SUPERSEDED]
```

### Data Classifications
- `INTERNAL`: Internal operational records.
- `CONFIDENTIAL`: Restricted to legal counsel, management, and authorized staff.
- `RESTRICTED`: High-sensitivity documents under dispute, legal hold, or pending arbitration.
- `PUBLIC_APPROVED`: Explicitly approved for public summary display on the property listing.

### Immutable Append-Only Ledger Models
- `LegalDocument`: Master record tracking property reference, category, classification, and status.
- `LegalDocumentVersion`: Append-only version ledger tracking file size, MIME type, storage key, and SHA-256 integrity hash.
- `LegalDocumentReview`: Append-only review history tracking reviewer attribution, reason codes, notes, and transition timestamps.
- `LegalChecklistTemplate` & `PropertyLegalChecklist`: Configurable checklists and readiness evaluation.
- `LegalDocumentAccessLog`: Immutable audit trail for preview, download, and external access events.
- `LegalDocumentShare`: Time-bounded, hashed-token external sharing with maximum downloads and instant revocation.

---

## 3. Storage Security & Access Control

- **Private by Default**: Legal files are never stored at publicly guessable URLs.
- **Signed Streaming**: Downloads and previews utilize short-lived HMAC-signed tokens with 5 to 15-minute TTL.
- **Strict Headers**: `X-Content-Type-Options: nosniff`, `Cache-Control: private, no-store`, `X-Robots-Tag: noindex, nofollow`.

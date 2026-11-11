# Ratiwal Dream Estates — Phase 8 Privacy & Consent Audit

**Website:** https://www.ratiwaldreamestates.com/  
**Framework:** Next.js 16 App Router  
**Scope:** Customer Data Protection, Consent Scopes & DPDP Act (2023) Compliance  
**Date:** November 2026

---

## 1. Regulatory Context & Compliance Mandate

Real estate advisory involves collecting sensitive customer data—including legal identity, PAN/Aadhaar references during KYC, property purchase budgets, and family inheritance records. 

Under the **Digital Personal Data Protection Act, 2023 (DPDP Act)** and international privacy best practices, managing customer reviews, testimonials, and feedback requires strict data governance.

### Core Privacy Principles Enforced:
1. **Consent-Gated Publication:** No client review, testimonial quote, photograph, or identifying case study is published without documented consent.
2. **Data Minimization:** Feedback mechanisms must never collect financial numbers or bank account details.
3. **Right to Revocation:** A client may request the removal or anonymization of their testimonial at any time.

---

## 2. Granular Consent Scope Model

To eliminate ambiguity, Ratiwal Dream Estates adopts the 5-point `ConsentScope` specification established in [`src/types/testimonial.ts`](file:///r:/New%20folder/ratiwal-dream-estates/src/types/testimonial.ts):

```typescript
export interface ConsentScope {
  showName: boolean;      // Permission to display first name and last initial
  showPhoto: boolean;     // Permission to display customer photograph
  showLocation: boolean;  // Permission to display city/state of purchase
  showProperty: boolean;  // Permission to name the specific township
  showVideo: boolean;     // Permission to host recorded video testimonial
}
```

### Anonymization Rules:
* If `showName: false`: Display as *"Verified Land Buyer"*, *"First-Time Home Builder"*, or *"Overseas NRI Investor"*.
* If `showProperty: false`: Generalize to *"Plotted Development in Jaipur"* or *"Commercial Land along Highway"*.
* Under no circumstances is a buyer's exact plot number, khasra number, or purchase price published publicly.

---

## 3. Audit of Current Public Routes & Structured Data

| Public Touchpoint | Current Privacy Health | Potential PII Exposure Risk | Status |
|:---|:---|:---|:---:|
| **Testimonial Index (`/testimonials`)** | Anonymized display names used; no full legal names | None | **Secure** |
| **Testimonial Case Studies (`/testimonials/[slug]`)** | Quotes focus on legal process and advisory approach | Zero financial/plot PII | **Secure** |
| **JSON-LD Structured Data (`src/components/seo/JsonLd.tsx`)** | Only business entity & founder data; 0 customer PII | Zero customer data | **Secure** |
| **Inquiry Endpoints (`/api/inquiries`)** | Zod validation strips unknown fields; rate-limited | Protected by DB encryption | **Secure** |
| **Analytics Event Payloads** | Purely route and parameter metadata (`property_slug`) | Zero PII in event payloads | **Secure** |

---

## 4. Deletion & Revocation Operating Procedure

If a client requests the withdrawal of a published review or testimonial:
1. **Receipt of Request:** Verified via registered email or telephone with the advisory desk.
2. **Immediate Triage (Under 24 Hours):** Set `clientConsent: false` in `src/data/testimonials.ts` or database record.
3. **Prerender Invalidation:** Trigger a Next.js revalidation or deployment so that the static HTML cache on Vercel Edge immediately drops the quote.
4. **Permanent Audit Log:** Record the revocation in `AuditLog` for legal compliance.

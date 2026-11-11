# Phase 7 (7C) — Lead Architecture & CRM Audit

**Date:** 2026-11-11 · audit and design only; **no model, migration, dashboard module or integration was changed.** Evidence: `src/models/Lead.ts`, `LeadStageHistory.ts`, `SiteVisit.ts`, `src/types/lead.ts`, `src/types/site-visit.ts`, `lead.actions.ts`, `lead.service.ts`, settings model, and read-only database counts. **There is no external CRM integration**; the built-in dashboard is the CRM. The principle is **adapt, don't duplicate**: everything below extends the existing `Lead`/`SiteVisit` system.

## 1. What exists (✅ working design)
| Capability | Implementation |
|---|---|
| Lead record | `Lead`: reference number (random, non-enumerable), normalised E.164 phone, email, property/location links, purchase timeline, budget, message, source, status, priority, assignment, follow-ups, timeline events, notes, contact attempts, consent block, protection block (`abuseStatus`, fingerprint) |
| Sources | controlled enum: `PROPERTY_DETAIL, PROPERTY_CARD, LOCATION_PAGE, HOMEPAGE_CTA, CONTACT_PAGE, ADVISOR_SECTION, DIRECT, OTHER` (server-controlled; unknown values become `DIRECT`) |
| Status lifecycle | `NEW → CONTACTED → QUALIFIED → NURTURING → NEGOTIATING → WON / LOST`, plus `SPAM`, `ARCHIVED`; append-only `LeadStageHistory` (coverage from 2026-08-25) |
| Site visits | separate `SiteVisit` entity: `REQUESTED → PENDING_CONFIRMATION → CONFIRMED → (RESCHEDULE_REQUESTED) → COMPLETED / NO_SHOW / CANCELLED / ARCHIVED`, with advisor availability, slot locks and confirmation status |
| Assignment | strategy in settings (`ROUND_ROBIN` default), first-response SLA 2 h, follow-up reminder 24 h, unassigned escalation 4 h (settings) |
| Duplicate handling | fingerprint (phone + property + location) within a fixed 30-minute window; site-visit endpoint merges into an existing lead by phone |
| Audit & history | `AuditLog` actions, lead timeline, stage history, notes, contact attempts |
| Privacy tooling | consent-withdrawal action (admin), **anonymise** action (super admin), `retentionReviewAt` = created + 90 days |
| Analytics | dashboard analytics with a metric dictionary (inquiries, funnel, site visits, team); data volume today: **8 leads** |
| Notifications | outbox → email/WhatsApp providers; customer acknowledgement + internal alert on lead creation |

## 2. Access control (✅ verified from code)
- Dashboard pages require an admin session; actions use `requireAdminSession`. **Assign / archive / delete / bulk-delete / consent-withdrawal require `ADMIN` or `SUPER_ADMIN`; anonymise requires `SUPER_ADMIN`.** Status change, priority, notes, contact attempts, follow-ups, spam and requirements edits require any active admin session, but `EDITOR` users are **scoped to leads assigned to them** (service-level filter), which is a sound least-privilege pattern.
- 🟡 **The permission catalogue has `LEADS_VIEW / LEADS_MANAGE / LEADS_ASSIGN / LEADS_EXPORT` keys, but lead actions use role checks, not those keys** — so custom roles/overrides configured in Settings & Team do not actually govern lead access (F-L1).
- No public endpoint returns lead data (public APIs expose only published projects/locations).

## 3. Gaps against the Phase 7 brief
| ID | Severity | Gap | Detail |
|---|---|---|---|
| L1 | **High** | **Attribution is not captured** | `Lead` has `landingPath`, `referrerDomain`, `utmSource/Medium/Campaign/Term/Content`, but the forms only send `landingPath = the page the form was on`. There is no first-landing/latest-landing, no referrer, no UTM capture; `LeadAttributionClaim` is for **channel-partner** attribution, not marketing |
| L2 | High | Consent is not recorded truthfully (Inquiry audit F1) | stored consent text version/timestamp without a visitor action |
| L3 | Medium | Lifecycle vs the recommended model | No "Contact Pending", "Site Visit Scheduled", "Site Visit Completed" **lead** stages; those states exist on the `SiteVisit` entity but are not reflected on the lead |
| L4 | Medium | Duplicate window setting unused (30-day setting vs 30-minute constant); repeat inquiries from the same phone for a *different* property create separate leads (fingerprint includes property) | no "same person, multiple interests" view beyond the phone key |
| L5 | Medium | Lead access not governed by catalogue permissions (above) | |
| L6 | Medium | Notifications depend on an unscheduled processor for retries (Inquiry audit F5) | |
| L7 | Low | Site-visit preferred **time** lost (Inquiry audit F2) | confirmation team cannot see the visitor's preference |
| L8 | Low | 90-day `retentionReviewAt` exists but no job acts on it (anonymisation is manual) | retention policy undefined in writing |
| L9 | Info | WhatsApp/phone intents leave no lead | structural, not a bug |

## 4. Recommended lifecycle (adapted, not replaced)
Recommended: *New → Contact Pending → Contacted → Qualified → Site Visit Scheduled → Site Visit Completed → Negotiation → Converted / Lost*.

| Recommended stage | Existing equivalent | Proposal |
|---|---|---|
| New | `NEW` | keep |
| Contact Pending | `NEW` + `nextFollowUpAt`/SLA clock | **derive**, don't add: "New and first response overdue/due" is a computed state from the SLA settings |
| Contacted | `CONTACTED` | keep |
| Qualified | `QUALIFIED` (+ `NURTURING`) | keep; define qualification criteria in writing (timeline, budget, genuine interest) |
| Site Visit Scheduled / Completed | `SiteVisit.status` `CONFIRMED` / `COMPLETED` | **derive from the linked `SiteVisit`** and show on the lead and in the funnel; avoid duplicating state in two places |
| Negotiation | `NEGOTIATING` | keep |
| Converted / Lost | `WON` / `LOST` (+ lost reason) | keep; `WON` is the conversion definition |
Result: **no new lead statuses and no migration** are needed for the lifecycle; add a derived "pipeline stage" view and funnel metrics built from `Lead` + `SiteVisit` + `LeadStageHistory`.

## 5. Attribution design (consent-compliant, for approval)
| Field | Capture | Notes |
|---|---|---|
| First landing page | on first page view store `path` (no query string, no PII) in `sessionStorage`/first-party cookie **only after consent where required** | send with the form; store server-side as `firstLandingPath` |
| Latest landing page | previous page in the session | `lastLandingPath` |
| Referrer | `document.referrer` → **domain only** | existing `referrerDomain` field |
| UTM source/medium/campaign/term/content | parse once at landing; persist for the session | existing fields; truncate/validate (≤ 200 chars, allow-list characters) |
| Organic search detection | `referrer` is a known search engine and no UTM → `organic` | GSC cannot attribute individual leads; do not claim it can |
| GSC/GA4 campaign data | **aggregate only** via the SEO dashboard/GA4 reports | never joined to named leads in analytics |
Data model change: **additive optional fields** on `Lead` (`firstLandingPath`, `lastLandingPath`, `attributionSource` summary) — no migration of existing documents; the existing UTM/referrer fields are reused. Requires owner approval (Phase 4A D5 includes first-touch capture).

## 6. Data integrity requirements and design
- **Idempotent submissions:** client-generated `submissionKey` (UUID per form instance) → unique sparse index on `Lead`; a retry returns the same reference and never double-creates.
- **Original inquiry preserved:** keep the first message/consent/attribution immutable; later edits go to `notes/timeline`; admin edits to requirements are audited (already via timeline/audit).
- **Audit history:** `LeadStageHistory` + timeline already exist; extend audit actions for attribution-visible views and exports (report exports in the dashboard are already rate-limited and audited; lead-level export was not separately verified).
- **Permissions:** move lead actions from raw role checks to the `LEADS_*` keys while keeping the editor "assigned only" scope.
- **Retention:** document a policy (e.g., 90-day review for unconverted leads, anonymise or delete on request or expiry) and add a *reviewed, manual-approval* job — not silent deletion.

## 7. What is not recommended
A second CRM, a parallel inquiry model, new status vocabulary, or sending lead identity to analytics tools.

## 8. Approvals
Schema additions (attribution fields, `submissionKey` index), permission re-mapping, retention job, and dashboard additions each require approval. Nothing here is applied.

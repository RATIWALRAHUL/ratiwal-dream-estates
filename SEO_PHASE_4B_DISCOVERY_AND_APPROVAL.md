# Phase 4B — Discovery & Approval Matrix

**Date:** 2026-11-11 · **Status: DISCOVERY ONLY — STOPPED BEFORE IMPLEMENTATION.** No code, models, routes, env vars, schedules or notifications were created or changed for Phase 4B. This is the only Phase 4B file.

The brief says to stop the affected work if Phase 4A integrations are not operational. They are not, so most of 4B is blocked (§2). What *can* be built safely now is listed in §4.

## 1. What was read / inspected

Phase 1–4A reports (esp. `SEO_PHASE_4A_FINAL_REPORT.md`, GSC integration, technical monitoring, security audit), the built SEO dashboard, `src/lib/communications/*` (outbox, processor, email + WhatsApp providers, templates), notification models (`NotificationOutbox`, `InAppNotification`, `NotificationDelivery`, `NotificationTemplate`, `CommunicationConsent`), `OrganizationSettings`, the permission catalogue, the 4 existing `/api/internal/*` job routes, `package.json`/`next.config.ts`/env variable **names** (values never printed, except the non-secret `COMMUNICATIONS_MODE`), and Git status (only the 8 earlier Gemini Phase 4 docs modified; the SEO/heading work from this session is uncommitted).

## 2. Phase 4A dependency status — the blocker

| Dependency | State | Consequence for 4B |
|---|---|---|
| Search Console connection | ⛔ **Not connected.** No credentials; no search data in the database | Traffic, impression, CTR and keyword alerts; keyword/page opportunities; weekly/monthly traffic reports have **no data to work on** |
| GA4 | ⛔ **Not installed** (no tag, no property, no events; D5 unapproved) | Organic-conversion alerts, "pages with impressions but few inquiries", conversion sections of reports: **impossible** |
| Technical scanner | 🟡 built and unit-tested, **never run live**; zero findings stored | Technical/indexing alerts and the issue register have nothing real to alert on until one scan runs |
| Core Web Vitals (PSI/CrUX) | ⛔ not built (needs API key) | "Core Web Vitals deterioration" alert not possible |
| URL Inspection (indexation status) | ⛔ not built/connected | "Important URL becomes excluded", "newly detected soft 404" cannot be sourced from Google. They can only be approximated from our own scan (status codes, noindex, canonical) and must be labelled so |
| Scheduler | ⛔ none (no `vercel.json`; 4 `/api/internal/*` routes are Bearer `CRON_SECRET`-guarded but nothing in the repo triggers them; D6 unanswered) | No automation can run; nothing may be called "automated" |
| Real-time data freshness | n/a | Alerts need ≥ 2 comparable periods of stored data; a fresh install has none |

## 3. Existing functionality to reuse (do not duplicate)

| Need in 4B | Already exists | Plan |
|---|---|---|
| Issue register with new/ongoing/resolved + history | `SeoTechnicalIssue` + `SeoAuditRun` (4A) | `/dashboard/seo/issues` **extends this**; no separate `SEOIssue` collection |
| Automation/job log + overlap lock + stale-lock recovery | `SeoSyncRun`, `SeoAuditRun` (partial-unique `lockKey`) | Reuse the pattern; add job kinds rather than a new `SEOAutomationLog` collection |
| Keyword opportunity rules (low CTR, declining, improving, weak landing page, cannibalization) | `opportunities.ts` + Keywords page (4A) | `/dashboard/seo/opportunities` **calls these rules**; only the extra types are new |
| Date windows, previous-period comparison, GSC lag handling, CSV safety, same-origin/rate-limit guards | `dates.ts`, `csv.ts`, `request-guards.ts`, `checkRateLimit` | Reuse |
| Audit log | `AuditLog` (+ SEO actions added in 4A) | Add a few action names |
| In-app admin notifications | `InAppNotification` (`recipientAdminId`, read/archived, indexes) | Use for dashboard notifications |
| Email | Outbox → processor → Resend provider (+ consent, idempotency key, delivery log) | Use for email; no new provider |
| WhatsApp | Provider code exists, **but no `WHATSAPP_*` credentials are set** | ⛔ Not available → out of scope until you authorise and configure it |
| Roles | `ADMIN` / `SUPER_ADMIN` role checks used by the SEO module; permission catalogue has `ANALYTICS_VIEW`, `REPORTS_EXPORT`, `SETTINGS_MANAGE` | Keep role checks (view = Admin+, configure/assign/send = Super Admin) unless you want catalogue keys |

## 4. What can be built now vs. what is blocked

| Module (PRD §) | Can be built now? | Notes |
|---|---|---|
| **Issue management** `/dashboard/seo/issues` (§8) | ✅ Yes (on `SeoTechnicalIssue`) | Adds assignment, notes, status workflow, filters, export. Meaningful only after a live scan |
| **Alert engine core** (§3) — model, dedup, lifecycle, history | ✅ Yes (engine + UI + tests with synthetic data **in tests only**) | Idempotent key `category|rule|target`; lifecycle New→Acknowledged→Assigned→In progress→Resolved→Reopened with bounded status history |
| **Technical / indexing alert rules** from our own scan (§3, §4) | 🟡 Partly | Sitemap failure, noindex, canonical mismatch, broken links, missing metadata, JSON-LD errors, missing OG, 5xx — all from the scanner. "Soft 404"/"excluded by Google" need URL Inspection → ⛔ |
| **Traffic + keyword alert rules** (§3, §4) | 🟡 Rules and tests only | Cannot fire until GSC is connected and ≥ 2 periods are stored. Will be built with low-sample suppression and shown as "waiting for data" |
| **Opportunity intelligence** (§5) | 🟡 Partly | Types 1–4, 7 use existing GSC rules (blocked on data). Types 5–6, 8, 9 need more: inventory join (read-only), internal-link graph from scan, GA4 (⛔). Never shows volume/difficulty |
| **Reports + CSV + print** (§6) | 🟡 Structure only | Daily/weekly/monthly generators work from stored data; every report states missing sources. With no GSC/GA4 they would honestly say "no data" except technical/sync sections |
| **Notifications** (§7) | 🟡 In-app + email only | Needs schema/registry extensions (§5). **Email is live**; see risk R1 |
| **Scheduled automation** (§11) | ⛔ Blocked | D6 unanswered; also needs owner approval to deploy |
| **Report delivery by email/WhatsApp** (§9) | 🟡 Email only, **after approval**; WhatsApp ⛔ | Recipients restricted to configured authorised admins |

## 5. Database and schema changes (none made)

| Change | Type | Why |
|---|---|---|
| `seo_alerts` | **new collection** | Alert lifecycle, evidence, assignee, status history (bounded to last ~50 entries), `dedupeKey` unique among open states |
| `seo_reports` | new collection (already approved in 4A decision D4) | Generated report snapshots, one per period (unique) — also holds bounded delivery log entries, so **no `SEOReportDelivery` collection** |
| `seo_notification_prefs` | new collection (or a block in `OrganizationSettings`, your call) | Per-admin channel/severity/digest preferences |
| `seo_opportunity_states` | optional new collection | Only to remember "dismissed / accepted / done" per opportunity key; opportunities themselves are **computed**, not stored, so there is nothing to go stale |
| `AuditLog` | enum additions | ~8 new action names |
| `InAppNotification` | **existing-schema change**: `entityType` enum has no `SEO` value | Needs `SEO` added |
| `NotificationOutbox` | **existing-schema change**: `aggregateType` enum has no `SEO`; events live in `COMMUNICATION_EVENT_DEFINITIONS` | Needs new event types + templates (critical alert, digest, resolved, report-ready) and an `SEO` aggregate type |
| `SeoTechnicalIssue` | field additions (assignee, notes, status history) | Needed for issue workflow; additive only |

Collections deliberately **not** added: `SEOIssue`, `SEOReportDelivery`, `SEOAutomationLog`, `SEOOpportunity` (see §3).

## 6. Risks specific to 4B

| # | Risk | Severity | Control |
|---|---|---|---|
| R1 | `COMMUNICATIONS_MODE=live` in `.env.local`: testing notification code could send **real emails** with your Resend key | High | All tests use a fake sender; no real send unless you explicitly approve a single test to an address you name |
| R2 | False alerts from small samples or incomplete GSC days (very likely on a new/low-traffic site) | High | Minimum-volume gates, 3-day lag, equivalent weekday-aligned windows, "insufficient data" state instead of alerts, thresholds stored and shown with every alert |
| R3 | Alert storms / duplicate notifications | Medium | Dedupe key, per-alert cooldown, severity-based digesting, max notifications per run, idempotency key on the outbox |
| R4 | Alerts worded as facts about Google ("penalty", "algorithm update") | Medium | Evidence-only wording; rule names describe what was measured |
| R5 | Customer PII in alerts or reports | Medium | Alert payloads built only from URLs, queries, counts. Property-inquiry sections use counts, never lead data |
| R6 | Scheduled endpoints abused | Medium | Bearer `CRON_SECRET`, fail closed, rate limit, overlap lock, `maxDuration` |
| R7 | Changes to the shared communications schema regress customer/advisor notifications | Medium | Additive enum values only; run `test:communications` / `test:notification-lifecycle` before and after |
| R8 | Reports presented as "automated" before a job has actually run in production | Medium | Report badge shows **Manual** vs **Scheduled (last succeeded at …)**; claim only after a real run is logged |

## 7. Tailwind note (same as 4A)

The brief says "No Tailwind CSS". The project already uses Tailwind v4 throughout the dashboard, so I'd reuse existing classes and add no new styling system, unless you want something else.

## 8. Effort estimate (working days)

Issue management 2 · alert engine + lifecycle UI 4 · technical/indexing rules 2 · traffic/keyword rules (data-gated) 2 · opportunities 3 · reports + CSV + print 4 · notifications + preferences (in-app + email) 3 · scheduling endpoints + logs 2 (deployment excluded) · tests/docs 3. **≈ 25 days total; ≈ 10 days for the part that can be built and verified now** (issues, alert engine, technical rules, in-app notifications).

## 9. Approvals and inputs needed from you

| # | Decision / input | My recommendation |
|---|---|---|
| E1 | **Connect Search Console** (credentials per `SEO_PHASE_4A_GSC_INTEGRATION.md` §3) | Do this first. Without it, traffic/keyword/opportunity/report features cannot be validated |
| E2 | **Approve one live technical scan** (read-only, ~100–150 requests) | Yes — it gives the issue register and technical alerts real data |
| E3 | GA4 (D5 from 4A: public tag + consent banner + first-touch capture) | Needed for conversion alerts, property-inquiry opportunities and conversion report sections. Without it, these stay out of scope |
| E4 | Scheduler (D6): how do cron jobs run today? Vercel Cron? external pinger? | Tell me, then I add guarded job routes. **I will not add `vercel.json` or enable anything without your explicit OK** |
| E5 | Approve the schema list in §5, including the **additive changes to `InAppNotification`, `NotificationOutbox`, `COMMUNICATION_EVENT_DEFINITIONS` and `SeoTechnicalIssue`** | Approve; changes are additive |
| E6 | Notification recipients: which admin accounts/emails may receive SEO alerts and reports? | Super Admins only to start; email uses the existing Resend setup |
| E7 | WhatsApp | Out of scope (no credentials). Confirm you agree |
| E8 | Notification preferences storage: new collection vs block in `OrganizationSettings` | New small collection (per-admin, easier to bound) |
| E9 | Severity/threshold defaults: I will propose a table (e.g. click decline ≥ 30 % with ≥ 100 baseline clicks over 28 days) for you to adjust | Review when presented; thresholds will be editable, not hard-coded |
| E10 | Build order | (1) issues + alert engine + technical rules + in-app notifications, (2) after GSC connects: traffic/keyword rules + opportunities, (3) reports, (4) email delivery, (5) scheduling after D6 |

## 10. Recommended next step

Reply with approvals for **E2, E5, E6, E10 (step 1)** and I will build step 1 (issue workflow, alert engine, technical alert rules, in-app notifications) with tests, without sending any real notifications and without touching schedules. Provide **E1** (credentials) when you can, so steps 2–3 can be validated on real data.

*Not started: the nine other Phase 4B reports. They will be written as work is done and marked planned / implemented / tested / blocked.*

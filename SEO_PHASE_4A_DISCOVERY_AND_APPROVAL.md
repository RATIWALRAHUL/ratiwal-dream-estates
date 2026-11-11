# Phase 4A — Discovery & Approval Matrix

**Project:** Ratiwal Dream Estates · **Date:** 2026-11-11
**Status:** DISCOVERY COMPLETE — **AWAITING OWNER APPROVAL. No code, routes, models, env vars, cron jobs or external API access were created or changed.** The only file written is this one.

Legend: ✅ exists · ⚠️ partial / conflict · ❌ missing · 🔒 needs owner approval

---

## 1. What was read

- Phase 3B/3D reports and all 8 Phase 4 reports (monitoring architecture, GSC baseline, conversion audit, automation recommendations, keyword plan, technical checklist, monthly template, final roadmap).
- Admin auth (`src/lib/auth/session.ts`, `guard.ts`, `src/middleware.ts`), `permission.service.ts`, dashboard layout/shell/sidebar, `/dashboard/seo` and `/dashboard/analytics`, `analytics.service.ts`, `metric-dictionary.ts`, `Lead`/`SiteVisit`/`AuditLog` models, `/api/enquiries`, `/api/internal/*` cron routes, `rate-limit.ts`, `data-cache.ts`, `package.json`, `next.config.ts`, `.env.local` / `.env.example` (**variable names only; values never printed**).
- Git: branch `master`; 8 modified `SEO_PHASE_4_*.md` files. Each diff is a single trailing blank line (Gemini's last edit). They are unrelated to this work and left untouched.

## 2. Findings that change the PRD's assumptions

| # | Finding | Impact |
|---|---|---|
| F1 | **`/dashboard/seo` already exists** (`SeoAuditView`: static "Technical SEO Health Desk" with tabs for sitemap/robots/JSON-LD/CWV). Sidebar item "Content & SEO" already points to it. | Adding the PRD's `/dashboard/seo` overview would collide. Proposal: keep the existing page as `/dashboard/seo/health` or fold it in as the Technical tab, and make `/dashboard/seo` the new overview. **Needs your decision.** |
| F2 | **PRD says "do not introduce Tailwind CSS", but the project already uses Tailwind v4** (`@import "tailwindcss"` in `globals.css`; all dashboard components use Tailwind classes; `CLAUDE.md` lists it). | I will read the PRD as "don't add a new styling system": reuse the existing Tailwind classes and dashboard tokens (`#071a28`, `#647581`, `#0088cc`, `rounded-xl`, hairline borders). Confirm. |
| F3 | **No Google credentials exist anywhere.** `.env.local` has no GSC/GA4/PSI/CrUX variables. Only `GOOGLE_SITE_VERIFICATION` is read in `seo.ts`. No `googleapis` dependency. | **Nothing can be marked "connected."** All real data work is blocked on you creating credentials (§5). |
| F4 | **GA4 is not installed.** Only `@vercel/analytics` is in `layout.tsx`. No `gtag`, `dataLayer`, `@next/third-parties`, or `NEXT_PUBLIC_GA_*` anywhere in `src`. None of the 7 audited events exist. | GA4 Data API has nothing to read until a GA4 property + tag exist. Installing the tag is a public-site change and needs approval + a consent decision. |
| F5 | **No consent mechanism found** in the public layout. | GA4 tag must not ship without a consent banner or an explicit owner decision (PRD §4 requires consent respect). |
| F6 | **Organic attribution on leads is weak.** `Lead` has `landingPath`, `referrerDomain`, `utm*` fields and Zod accepts them, but `EnquiryForm.tsx` only sends `landingPath: currentPath`, which is the page the form was submitted from, **not the first organic landing page**. Referrer and UTM are never populated. | "Organic inquiries" cannot be reliably computed from MongoDB today. Fixing it means a small client-side first-touch capture change on the public site (approval needed). Until then the dashboard must label conversions "page of submission", not "organic". |
| F7 | **Phase 4 docs reference an `Inquiry` model that doesn't exist.** The lead pipeline is `Lead` (via `/api/enquiries`; `/api/inquiries` also exists). Gemini's reports also cite `/api/inquiries` for the 13-stage pipeline, which is in `/api/enquiries`. | Treat `Lead` + `SiteVisit` as the conversion source of truth. I'll correct the reference in the final reports. |
| F8 | **No scheduler configured.** No `vercel.json`, no `.vercel/`. Existing `/api/internal/*` routes are Bearer-`CRON_SECRET` protected and fail closed, but nothing in the repo triggers them. | Unknown how production schedules them (external pinger? Vercel dashboard cron?). Need your answer before designing sync (§6). |
| F9 | **GSC data caveat:** per the seo-google skill, impressions/CTR/average position are unreliable for 2025-05-13 → 2026-04-27 (no backfill). Site is also new to the data (39 URLs). | Dashboard will annotate this window; low-volume sites will show many anonymized queries, so totals ≠ sum of query rows. |
| F10 | `DEV_ADMIN_AUTO_AUTH` is present in `.env.local`. It only applies when `NODE_ENV=development`. | Fine for local; must be confirmed absent in production env. Tests of authorization must run with it disabled. |
| F11 | Admin roles: `ADMIN`, `EDITOR`, `SUPER_ADMIN` + granular `PermissionService` keys (Role/TeamMember collections). No `seo.*` permission key exists. | Proposal: SEO module viewable by `ADMIN`/`SUPER_ADMIN`; integration config and manual sync `SUPER_ADMIN` only. Adding a new permission key touches `settings-team.ts` catalogue. |

## 3. Implementation matrix

| Area | Existing | Missing | Permissions / access needed | External API | DB change | Security risk | Effort |
|---|---|---|---|---|---|---|---|
| Admin shell & auth | ✅ signed-cookie session, middleware, `requireAdminSession(roles)`, `requirePermission` | SEO-specific permission/role rule | none | none | none | Low | 0.5 d |
| `/dashboard/seo` overview | ⚠️ static health page (F1) | Real-data overview, KPI cards, charts, states | ADMIN+ | reads own DB only | reads new collections | Low | 2 d |
| GSC integration | ❌ (F3) | Service-account client, query/pages/device/country/date, pagination, 7/28/90-day comparisons | **You:** GCP project, enable Search Console API, service account, add its email as user on the GSC property | Search Console API (read-only scope) | `SeoIntegrationConfig`, `SeoSyncRun`, `SeoSearchPerformance` (daily agg + bounded top-N query/page rows) | Medium: private key. Mitigate: env only, never DB/client | 3 d |
| GA4 integration | ❌ (F4) | GA4 property, tag, events, Data API client | **You:** GA4 property, add service account as Viewer; approve public tag + consent approach | GA4 Data API | `SeoGa4Snapshot` (or fold into performance docs) | Medium: PII leak via events. Mitigate: central event dispatcher with allow-listed params | 3 d + 1 d tag |
| Keyword module | ❌ | Table, filters, sort, pagination, CSV, opportunity rules, intent classifier | ADMIN+ | via stored GSC data | `SeoKeywordPerformance` | Low (CSV must be formula-injection-safe) | 2 d |
| Landing-page module | ❌ | Page grouping (7 categories from route map), joins GSC+GA4, indexability from evidence | ADMIN+ | GSC (+ URL Inspection optional) | `SeoPagePerformance` | Low | 2 d |
| Technical monitoring | ⚠️ `scripts/test-seo-metadata.ts`, `verify-*` scripts, no runtime scanner | Allow-listed crawler: status, canonical, titles/desc, robots, sitemap, schema syntax, OG images; new/ongoing/resolved tracking | SUPER_ADMIN to trigger | none (first-party only) | `SeoAuditRun`, `SeoTechnicalIssue` | **Medium: SSRF and prod load.** Mitigate: hard-coded host allow-list from `siteConfig.url`, sitemap-derived URL list only, concurrency ≤3, timeout 8 s, no auth'd paths | 3 d |
| Core Web Vitals | ⚠️ Vercel Analytics RUM exists but has no read API we use | PSI + CrUX client; field vs lab separated; "insufficient data" state | **You:** API key (PSI+CrUX) | PSI v5, CrUX | `SeoPerformanceMeasurement` | Low (key server-only) | 2 d |
| Conversion attribution | ⚠️ `Lead`, `SiteVisit` + `AnalyticsService` + metric dictionary; attribution fields underused (F6) | First-touch capture; click-intent events (WhatsApp/phone) via GA4; funnel definitions (click → submission → verified → qualified → confirmed visit) | ADMIN+ | GA4 (clicks) | optional `firstTouch*` handling on Lead = **schema change** | Medium: privacy; no PII to GA4 | 3 d |
| Scheduled sync | ⚠️ CRON_SECRET pattern exists; no scheduler (F8) | Idempotent jobs, overlap lock, backoff, failure notification, last-success timestamps | You: choose scheduler | n/a | `SeoSyncRun` (lock + log) | Medium: endpoint abuse. Mitigate: Bearer secret, fail closed, `maxDuration` | 2 d |
| Reports | ❌ | Monthly report generation | ADMIN+ | none | `SeoReport` | Low | 1.5 d |
| Audit & rate limiting | ✅ `AuditLog`, `rate-limit.ts` | New `AuditAction` values for integration changes | none | none | enum additions only | Low | 0.5 d |
| Charts | ❌ no chart library | Choose: hand-rolled accessible SVG (no new dependency, my recommendation) vs a library | none | none | none | Low | included |

**Total estimate:** about 22 working days for everything. An MVP with GSC, overview, keywords and pages is about 9–10 days.

## 4. Proposed MongoDB collections (NO schema changes made)

All new; no existing collection altered unless you approve the F6 option.

| Collection | Purpose | Key indexes | Bounds / retention |
|---|---|---|---|
| `seo_integration_configs` | Connection status, property IDs, last-verified time. **No secrets.** | unique `provider` | ≤5 docs |
| `seo_sync_runs` | Job log + overlap lock | `{provider, startedAt:-1}`, unique active-lock key | TTL 180 d |
| `seo_search_daily` | Site-level daily totals by device/country | unique `{date, device, country}` | ~16 months |
| `seo_query_page_perf` | Top-N (query, page) rows per day | unique `{date, query, page}`; `{date, clicks:-1}` | cap N=1000/day; 16 months |
| `seo_ga4_daily` | Organic sessions/users/engagement/key events by landing page | unique `{date, landingPage}` | 16 months |
| `seo_audit_runs` / `seo_technical_issues` | Scan history; issue state new/ongoing/resolved | `{issueKey}` unique, `{status, severity}` | 12 months of resolved |
| `seo_cwv_measurements` | PSI/CrUX per URL + strategy + source | unique `{url, strategy, source, collectedAt}` | 12 months |
| `seo_reports` | Generated monthly report snapshots | `{period}` unique | indefinite, small |

Writes use `bulkWrite` upserts. Reads are paginated with date-range caps (≤ 16 months).

## 5. External dependencies and credentials I need from you

Nothing below has been requested or accessed. Each step is yours to take.

1. **Google Cloud project** → enable *Search Console API*, *Google Analytics Data API*, *PageSpeed Insights API*, *Chrome UX Report API*.
2. **Service account** (read-only). Add its email as a *Restricted/Full user* on the Search Console property. Add as *Viewer* on the GA4 property. I'd prefer a **separate** service account for these, with no other GCP roles.
3. **Which GSC property type?** `sc-domain:ratiwaldreamestates.com` (domain) or the `https://www.…/` URL-prefix property. Is it already verified?
4. **Does a GA4 property exist?** If not, you need to create one and give me the Measurement ID and Property ID.
5. **API key** (restricted to PSI + CrUX) for the performance module.
6. Env vars (server-only, set in Vercel and `.env.local`): `GOOGLE_SERVICE_ACCOUNT_JSON` (or split email/key), `GSC_PROPERTY`, `GA4_PROPERTY_ID`, `GOOGLE_PSI_API_KEY`. **Only the GA4 Measurement ID is `NEXT_PUBLIC_`**, because it is a public tag ID, not a credential.
7. If the service account key is ever pasted into chat or committed, rotate it.

## 6. Decisions I need from you (the approval gate)

Please answer each, or say "go with your recommendation."

| # | Decision | My recommendation |
|---|---|---|
| D1 | `/dashboard/seo` collision (F1) | Move the existing page to `/dashboard/seo/health`; new overview at `/dashboard/seo`. Update sidebar sub-links only. |
| D2 | Tailwind interpretation (F2) | Reuse the existing Tailwind dashboard styling; add no new CSS framework. |
| D3 | Build order | **Wave 1** (MVP): GSC sync + overview + keywords + pages. **Wave 2:** technical scanner + CWV. **Wave 3:** GA4 tag/consent/events + conversions. **Wave 4:** reports + scheduler. |
| D4 | Database models | Approve the 8 new collections in §4 (new files in `src/models/`, new indexes). Existing collections untouched. |
| D5 | Public-site changes (F4, F5, F6) | Separately approve: (a) GA4 tag via `@next/third-parties`, (b) consent banner design, (c) first-touch landing/referrer/UTM capture in `EnquiryForm`/`SiteVisitForm`. These change visitor-facing behavior. I will not do them under general approval. |
| D6 | Scheduler (F8) | Tell me how current cron triggers run. Default plan: Vercel Cron → Bearer `CRON_SECRET` routes. Needs your confirmation before I add a `vercel.json`. |
| D7 | Permissions | View: `ADMIN`+`SUPER_ADMIN`. Configure/sync/scan: `SUPER_ADMIN` only. OK to add a `seo.view`/`seo.manage` catalogue key? |
| D8 | Charts | Hand-rolled SVG, no new npm dependency (the only new dependency would be `googleapis` or `google-auth-library`; I'd use `google-auth-library` + `fetch` to stay lean). |
| D9 | Which integrations are authorized for me to wire up right now? | GSC first; the others when credentials exist. |

## 7. Risk register (summary)

| Risk | Severity | Control |
|---|---|---|
| Service-account key leakage | High | Server env only; never DB, logs, client; audit-log config changes; rotate on exposure |
| Scanner SSRF / load | Medium | Allow-list from `siteConfig.url`, sitemap-sourced URLs, concurrency ≤3, 8 s timeout, weekly, SUPER_ADMIN trigger |
| PII to GA4 | Medium | One dispatcher with param allow-list; unit test that rejects email/phone patterns |
| Misleading metrics | Medium | Source + period label on every number; "average position ≠ rank"; GSC delay (2–3 d) shown; anonymized-query gap shown; 2025-05-13→2026-04-27 caveat |
| Cron endpoint abuse | Medium | Bearer secret, fail closed, rate-limit, overlap lock |
| CSV formula injection | Low | Prefix `= + - @` cells |
| Dev auth bypass in prod | Low | Verify `DEV_ADMIN_AUTO_AUTH` unset in production; include in security audit |
| Existing SEO regression | Low | New code lives under `/dashboard` (noindex, robots-disallowed); public changes only under D5; rerun `test-seo-metadata.ts` + build |

## 8. Status of the 10 required deliverables

| File | Status |
|---|---|
| `SEO_PHASE_4A_DISCOVERY_AND_APPROVAL.md` | ✅ **Written (this file)** |
| `…SYSTEM_ARCHITECTURE`, `GSC_INTEGRATION`, `GA4_INTEGRATION`, `DASHBOARD_IMPLEMENTATION`, `TECHNICAL_MONITORING`, `CONVERSION_ATTRIBUTION`, `SECURITY_AUDIT`, `PERFORMANCE_VALIDATION`, `FINAL_REPORT` | ⏸ Awaiting approval. I'll write them as work is implemented and tested, marked planned / implemented / tested / blocked. |

## 9. Not done, by design

No dependencies installed, no routes or models added, no env vars touched, no Google account contacted, no cron deployed, no public pages changed, and no analytics numbers shown anywhere. There is currently **zero real search data** in the system.

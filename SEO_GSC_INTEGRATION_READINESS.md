# Follow-up Task 4 — Google Search Console Integration Readiness

**Date:** 2026-11-11
**Current state: GSC access does NOT exist.** No credentials were created, requested or assumed. This document describes what the existing integration needs, so the owner can set it up.

---

## 1. Current state (verified)

| Item | Finding |
|---|---|
| DB integration row | `seo_integration_configs`: one row, `provider: "GSC"`, **`status: "NOT_CONFIGURED"`**, no `lastVerifiedAt`. |
| Synced data | `seo_search_daily`: **0** rows. `seo_query_page_perf`: **0**. `seo_sync_runs`: **0**. |
| Local env (`.env.local`) | Contains **none** of `GOOGLE_SERVICE_ACCOUNT_JSON`, `GOOGLE_SERVICE_ACCOUNT_EMAIL`, `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY`, `GSC_PROPERTY` (key names checked; values never printed). |
| Production env (Vercel) | **Unknown to me.** I have no access. If those variables are set there, the dashboard status would not read `NOT_CONFIGURED`, which suggests they are not. |
| Code | Fully built: `src/lib/seo-analytics/gsc-client.ts`, `src/lib/services/seo-gsc-sync.service.ts`, `POST /api/dashboard/seo/sync`, `SeoConnectionPanel`, models for the config, daily and query×page tables. |
| Dependency | `google-auth-library ^11.3.4` is installed. |
| `.env.example` | Lines 73–77 document `GOOGLE_SERVICE_ACCOUNT_JSON`, optional `GOOGLE_SERVICE_ACCOUNT_EMAIL` / `_PRIVATE_KEY`, and `GSC_PROPERTY`. |

## 2. How the integration authenticates

It uses a **service account (server-to-server)**, not user OAuth.

- Credentials come from env vars only. They are never logged, stored in MongoDB or returned to callers. The config row holds no secrets.
- Scope requested: `https://www.googleapis.com/auth/webmasters.readonly` (read-only).
- Endpoint: `POST https://www.googleapis.com/webmasters/v3/sites/{GSC_PROPERTY}/searchAnalytics/query`, with `type: web`, `dataState: final`, paging up to 25,000 rows per request and up to 4 retries with backoff.
- Error mapping: 401 → bad credentials. **403 → "add the service account's email as a user in Search Console".** 400/404 → check `GSC_PROPERTY` and dates. 429 → quota.

No user OAuth flow, consent screen or redirect URI is needed for this design.

## 3. Required setup (owner checklist)

### A. Google Cloud (about 10 minutes)

1. Choose or create a **dedicated Google Cloud project** (for example `ratiwal-seo-readonly`). Don't reuse a project with other workloads.
2. **Enable the "Google Search Console API"** (a.k.a. Search Console API / `searchconsole.googleapis.com`) on that project.
3. Create a **service account**, for example `gsc-reader@<project>.iam.gserviceaccount.com`. **Grant it no IAM roles.** Search Console access is granted inside Search Console, not through Cloud IAM.
4. Create a **JSON key** for it. Handle the file as a secret.
5. If key creation is blocked, your Google org probably enforces `iam.disableServiceAccountKeyCreation`. Ask the org admin for an exception. Workload-identity federation is the keyless alternative, but the current code expects a key and would need a change.

### B. Search Console property ownership

1. Adding users is normally an **owner** action in Search Console, so the person doing this should be a verified owner of the property.
2. Choose which property type to use, and set `GSC_PROPERTY` to match **exactly**:

   | Type | `GSC_PROPERTY` value | Notes |
   |---|---|---|
   | **Domain property (recommended)** | `sc-domain:ratiwaldreamestates.com` | Covers apex, `www`, http and https in one view. Verified via a DNS TXT record. |
   | URL-prefix property | `https://www.ratiwaldreamestates.com/` | Trailing slash is required, and it covers only that exact prefix. |

   The client URL-encodes whatever you supply, so both forms work. If the owner already verified a property, use whichever one exists. Otherwise prefer the Domain property.
3. In Search Console go to **Settings → Users and permissions → Add user**, enter the service account's email, and choose **Restricted** (read-only). That should be sufficient for `webmasters.readonly`. If `verify` still returns 403, try **Full** before changing anything else.

### C. Secure environment variables

| Variable | Value | Where |
|---|---|---|
| `GOOGLE_SERVICE_ACCOUNT_JSON` | The whole key JSON, **base64-encoded** (the code accepts raw JSON or base64). | Vercel → Project → Settings → Environment Variables, marked **Sensitive**. Production only unless Preview deploys need it. |
| `GSC_PROPERTY` | As in §B.2 | Same |
| *(alternative)* `GOOGLE_SERVICE_ACCOUNT_EMAIL` + `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY` | The two fields separately (`\n` escapes in the key are handled). | Use either this or the JSON variable, not both |

Handling rules:
- Never commit the key. `.env.local` is for local development only, and the repo's `.env.example` must stay value-free.
- Don't paste the key into chat, tickets or the dashboard.
- Rotate the key on a schedule (for example every 90 days) and delete old keys in Cloud Console.
- After setting variables, redeploy so the server picks them up.

### D. Verify the connection (no data written beyond status)

1. Sign in to the dashboard as **SUPER_ADMIN**. The sync API is restricted to that role.
2. `POST /api/dashboard/seo/sync` with `{ "mode": "verify" }` makes one small authenticated Search Console request. The status flips to `CONNECTED` **only after a real request succeeds**, so the dashboard cannot show a false "connected".
3. On `GSC_FORBIDDEN`, re-check §B.3. On `GSC_BAD_REQUEST`, re-check the `GSC_PROPERTY` spelling.

## 4. Data synchronisation requirements

| Topic | Current implementation |
|---|---|
| Trigger | **Manual** via `POST /api/dashboard/seo/sync` `{ "mode": "sync", "days": 1–90 }`. There is no `vercel.json` and no scheduled sync. |
| Default window | 7 days; max 90 per run; fetched in 7-day chunks. |
| Tables | `seo_search_daily` (date × device × country, up to 25,000 rows) and `seo_query_page_perf` (date × query × **page**, capped at 1,000 rows per day). Run history is in `seo_sync_runs`. |
| Idempotency | Upserts, so re-running a window is safe. |
| Freshness | Search Analytics data lags by roughly 2–3 days, and `dataState: final` excludes the freshest partial days. |
| History | GSC retains about 16 months. The 90-day-per-run cap means history beyond that needs multiple runs. |
| Scheduling (future) | An `/api/internal/*` route guarded by `CRON_SECRET` is already the repo's pattern for scheduled jobs. A sync cron would follow it. This is **not** set up and was not requested. |

## 5. Important limit: this integration does not answer "which URLs are indexed?"

The original audit needs Google's **indexed URL list**. The current client **cannot produce that**:

| Need | Available via current integration? | How to get it |
|---|---|---|
| Pages that **earned impressions** (a partial proxy for "indexed") | **Yes**, via the `page` dimension stored in `seo_query_page_perf` | After setup and a sync, list distinct `page` values. Anything not in the sitemap is a candidate stray URL. It only shows pages that were shown in search, not every indexed page. |
| The **Page Indexing report**: complete indexed list and "why not indexed" | **No.** Google offers no API for it. | Manual **CSV export from the Search Console UI** (Indexing → Pages). This is Option A in the reconstruction plan, and still the best source. |
| **Per-URL index status and canonical** for a known list | **Not implemented.** The URL Inspection API could do it, and the Search Console API is already enabled in the same project, but it needs a new client function. Verify current scope and quota rules in Google's docs before building. | Would let us check the 8 retired slugs plus the 39 sitemap URLs programmatically. |
| Sitemap submission status | Not implemented. | Visible in the UI. |

**Recommendation:** do the manual Page Indexing CSV export now (no setup needed, and it unblocks the inventory). Set up the service account in parallel for ongoing performance monitoring. Consider adding URL Inspection support later as a separate, approved change.

## 6. What I did not do

- Created no Google Cloud project, service account, key or Search Console user.
- Requested or stored no credentials.
- Made no calls to Google APIs.
- Claim no GSC access. The dashboard's own `NOT_CONFIGURED` status is correct.

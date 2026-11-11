# Phase 4A — Google Search Console Integration

**Integration status: ⛔ NOT CONNECTED.** No Google credentials exist in this environment, so no real authenticated request has ever been made. The dashboard shows "Not connected" and no search numbers. This is the intended, honest state.

## 1. What is implemented ✅

- Read-only client (`webmasters.readonly` scope only) using `google-auth-library` + `fetch`-style requests; no `googleapis` dependency.
- Search Analytics queries: `type=web`, `dataState=final`, paged at 25,000 rows/request.
- Retries with exponential backoff + jitter (≈1 s, 2 s, 4 s; max 4 attempts) on 429 / 5xx / network errors; 30 s request timeout.
- Safe error mapping: `GSC_NOT_CONFIGURED`, `GSC_AUTH_FAILED`, `GSC_FORBIDDEN` (service account not added to the property), `GSC_BAD_REQUEST`, `GSC_QUOTA_EXCEEDED`, `GSC_UPSTREAM_ERROR`. Upstream bodies are never returned.
- Reporting delay: ranges end 3 days before today (`GSC_DATA_LAG_DAYS`), and never past the latest stored date.
- Row validation (shape, finite non-negative numbers) before any write.
- Idempotent bulk upserts keyed on `(date, device, country)` and `(date, query, page)`.
- Per-day cap of 1,000 query rows; truncation recorded on the sync run (`queryDataTruncated`) and shown in the UI.
- Comparisons: 7 / 28 / 90 days vs the immediately preceding equal window, and custom ranges (≤ 480 days, validated).
- Sync timestamps: `lastVerifiedAt`, `lastSuccessfulSyncAt` (only for fully successful runs), `dataThroughDate`.

## 2. Data-integrity rules enforced

| Rule | How |
|---|---|
| No fabricated values | Missing days are gaps, never zeros. No-impression periods show "—", not 0 CTR/position. |
| Average position ≠ rank | Impression-weighted; labelled "averaged across searches — not a fixed ranking". CSV header says so. |
| Partial/truncated data is visible | Run status `PARTIAL` + `TIME_BUDGET_REACHED` / `DAILY_DATA_TRUNCATED`; query-row truncation flag; "Some days have no stored rows" notice. |
| Anonymised queries | Query/page tables are labelled as a sample that won't sum to totals. |
| Known Google logging issue | Notice appears when a period overlaps 2025-05-13 → 2026-04-27 (impressions/CTR/position unreliable, clicks unaffected, not backfilled). |

## 3. How to connect (you do this; I have not)

1. In Google Cloud: create/choose a project and enable **Google Search Console API**.
2. Create a **service account** (no project roles needed) and download a JSON key.
3. In Search Console → *Settings → Users and permissions → Add user*: add the service account's `client_email` with **Restricted** (read) permission on your property.
4. Set server-only env vars (Vercel + `.env.local`; never `NEXT_PUBLIC_`):
   - `GOOGLE_SERVICE_ACCOUNT_JSON` = the whole JSON (or its base64), **or** `GOOGLE_SERVICE_ACCOUNT_EMAIL` + `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY` (escaped `\n`)
   - `GSC_PROPERTY` = `sc-domain:ratiwaldreamestates.com` (domain property) or `https://www.ratiwaldreamestates.com/` (URL-prefix; trailing slash matters)
5. Sign in as Super Admin → **SEO Performance** → **Test connection**. Only when this succeeds does status become *Connected*.
6. **Backfill 90 days**, then check the numbers against the Search Console UI for the same dates and range (reconciliation step in the validation report).
7. Never paste the key in chat or commit it. If exposed, rotate it.

## 4. Quotas

Search Analytics allows ~1,200 queries/minute/site and 30 M/day. One 7-day sync uses 2 requests (plus pages). A 90-day backfill uses ~26+. Quota errors are retried, then reported as `GSC_QUOTA_EXCEEDED` with no data loss.

## 5. Known limitations

- Page-level figures are summed from top-N query rows, so they can be lower than GSC's own page report. A dedicated page-dimension pull would fix this (not built; would add a collection).
- Only `web` search type. Discover, News, Images, and the Generative-AI performance report are not pulled (the latter has no API; the skill notes it is UI/impressions-only).
- Country and device breakdowns come from site-total rows, so they are complete; they cover the current and previous windows only.
- **Not yet exercised against real Google**: request shape, pagination and row mapping follow the documented API but are unverified until step 5–6 above succeed.

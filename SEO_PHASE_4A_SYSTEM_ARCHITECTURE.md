# Phase 4A — System Architecture (Waves 1–2: Search Console + Technical scanner)

**Status legend:** ✅ implemented · 🧪 tested · ⛔ blocked · ⏳ awaiting approval · 📋 planned

## 1. Data flow

```
Google Search Console API ──(server-only, read-only scope, service account)──►
  SeoGscSyncService  ──bulk upserts──►  MongoDB
        ▲  (manual, SUPER_ADMIN)           seo_search_daily       site totals (date × device × country)
        │                                  seo_query_page_perf    top-N (query, page) per day
  POST /api/dashboard/seo/sync             seo_sync_runs           job log + overlap lock
                                           seo_integration_configs status, no secrets
                                              │
                          SeoGscQueryService (aggregation + 5-min in-memory cache)
                                              │
        /dashboard/seo · /keywords · /pages (server components)  +  GET …/keywords/export (CSV)
```

Credentials never touch the browser, MongoDB, logs or `NEXT_PUBLIC_*`. The browser only calls our own routes.

## 2. Components

| Layer | Files | Status |
|---|---|---|
| Models (4 new collections) | `src/models/SeoIntegrationConfig.ts`, `SeoSyncRun.ts`, `SeoSearchDaily.ts`, `SeoQueryPagePerf.ts` | ✅ |
| Pure logic (no I/O) | `src/lib/seo-analytics/{dates,classify,metrics,opportunities,csv}.ts` | ✅ 🧪 (64 unit checks) |
| GSC client | `src/lib/seo-analytics/gsc-client.ts` | ✅ (⛔ never exercised against real Google, see §5) |
| Sync service | `src/lib/services/seo-gsc-sync.service.ts` | ✅ (⛔ not run against real data) |
| Query service | `src/lib/services/seo-gsc-query.service.ts` | ✅ (⛔ aggregation not exercised with real data) |
| API | `src/app/api/dashboard/seo/sync/route.ts`, `…/keywords/export/route.ts` | ✅ 🧪 (auth/validation) |
| UI | `src/app/dashboard/seo/{page,keywords/page,pages/page,loading}.tsx`, `src/components/dashboard/seo/*` | ✅ 🧪 (HTTP + render smoke) |
| Existing health page | moved unchanged to `/dashboard/seo/health` (decision D1) | ✅ 🧪 |
| Technical scanner | `src/lib/seo-analytics/{tech-scanner,tech-fetcher,html-checks,issue-diff}.ts`, `src/lib/services/seo-technical.service.ts`, models `SeoAuditRun`, `SeoTechnicalIssue`, route `…/technical/scan`, page `/dashboard/seo/technical` | ✅ 🧪 on fake site · ⛔ no live scan (see Technical Monitoring report) |

## 3. Key design decisions

| Decision | Why |
|---|---|
| Dates stored as `YYYY-MM-DD` strings | GSC reports in Pacific Time; no timezone conversion means no off-by-one days. Range queries are lexicographic. |
| Site totals come from a separate query without the `query` dimension | GSC omits anonymised low-volume queries from query rows. Only the dimensionless query gives true totals. Query/page rows are explicitly labelled "sample". |
| CTR and position recomputed from sums | CTR = Σclicks/Σimpressions; position = impression-weighted. Averaging per-row values would be wrong. |
| Both comparison windows in one aggregation pass | `$cond` on `date >= currentStart` splits current vs previous without a second scan. |
| Query/page analysis cached by date range, filtered in memory | Opportunity flags are computed in code; the analysed set is capped at 20,000 queries. Cache TTL 5 min, SWR 10 min, invalidated after sync. |
| Overlap lock = partial unique index on `lockKey` | Works across serverless instances. Stale locks (>15 min) are auto-recovered. |
| Sync chunks newest-first, 7 days each, 40 s budget | Most useful data lands first; interrupted runs are safe to repeat (idempotent upserts). |
| Role checks (`ADMIN`/`SUPER_ADMIN` view, `SUPER_ADMIN` sync) instead of new permission-catalogue keys | Fewer touch points (no change to role seeding/dependency validation). Can be promoted to `seo.view`/`seo.manage` keys later. |
| `CONNECTED` is written only after a successful API response | PRD rule. Having env vars set shows "Not connected" until a request succeeds. |

## 4. Retention and bounds

| Collection | Bound | Retention |
|---|---|---|
| `seo_search_daily` | ~3 devices × countries per day | TTL 500 days on `syncedAt` |
| `seo_query_page_perf` | ≤ 1,000 rows/day | TTL 500 days on `syncedAt` |
| `seo_sync_runs` | one doc per run | TTL 180 days |

Caveat: TTL is keyed on `syncedAt`, which is refreshed whenever a day is re-synced. A day therefore expires 500 days after its **last** sync rather than after its own date. This is harmless at this scale but is not strict date-based retention.

## 5. Not yet built

| Item | Status |
|---|---|
| GA4 integration, tag, events | ⏳ needs approval (D5) + credentials |
| Core Web Vitals (PSI/CrUX) | 📋 needs an API key |
| Conversion attribution, first-touch capture | ⏳ needs approval (D5) |
| Scheduled sync / cron route / `vercel.json` | ⏳ needs your answer on D6; **no cron route was created** |
| Monthly reports | 📋 Wave 4 |

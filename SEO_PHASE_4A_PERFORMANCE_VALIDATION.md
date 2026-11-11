# Phase 4A — Performance & Validation Report (Waves 1–2)

Nothing below is a performance claim. Only things that were actually run are marked tested.

## 1. Validation checklist (PRD §15)

| # | Item | Status | Evidence |
|---|---|---|---|
| 1 | TypeScript compilation | ✅ tested | `npx tsc --noEmit` — 0 errors |
| 2 | ESLint | ✅ tested (new files) | 0 errors/warnings on all new files. Whole repo has **959 pre-existing problems (497 errors)**, untouched; 3 pre-existing errors sit in `DashboardSidebar.tsx` (setState-in-effect ×2, `any` ×1) |
| 3 | Production build | ✅ tested | `next build` succeeded; new routes present |
| 4 | API authentication | ✅ tested | see security audit (rows 1–4) |
| 5 | Authorization | ✅ tested | rows 5–9 |
| 6 | External API error handling | 🟡 partly | Google: ⛔ untested (no credentials; mapping/retry never driven by a real or mocked response). Scanner: ✅ timeouts, off-site redirects, missing sitemap, request-budget and deadline stops all tested on a fake site |
| 7 | Database query performance | ⛔ not measured | no data in the collections; indexes exist; no timing taken |
| 8 | Pagination & filtering | 🟡 partly | URL/param builders and date validation unit-tested; the in-memory filter/sort/paginate code has **not** been run on real or synthetic rows; UI verified only against empty data |
| 9 | Empty-data states | ✅ tested | not-connected page, empty keywords/pages, empty CSV (header only), empty charts/bars |
| 10 | Responsive UI | ⛔ not tested | no browser run |
| 11 | Sync idempotency | 🟡 partly | GSC sync: ⛔ not exercised (upserts with unique keys by design). Technical issue register: ✅ new/ongoing/resolved/re-open/partial-scan rules unit-tested; DB write path not exercised |
| 12 | Metric reconciliation vs Search Console UI | ⛔ blocked | needs live data |
| 13 | Existing dashboard regression | 🟡 partly | health page returns 200 and still renders; sidebar change type-checks and builds; no visual regression check |
| 14 | Existing website SEO regression | ✅ tested | `scripts/test-seo-metadata.ts` 28/28 pass; no public route, metadata, sitemap, robots or schema file was changed |

## 2. Unit tests added

`npm run test:seo-analytics` (64 checks) and `npm run test:seo-technical` (96 checks: parsers, robots semantics, healthy site = zero findings, 25 distinct defects detected, limits, issue diff, allow-list). The technical suite found and fixed one real bug (a budget stop produced false "sitemap/robots unreachable" findings).

### `test:seo-analytics` detail

64 checks, all pass. They cover date windows (7/28/90/custom, previous-window adjacency, 3-day lag, rejection of future, reversed, over-long and non-date inputs), page/intent classification, CTR from totals, impression-weighted position, null-not-zero for no impressions, every opportunity rule and its minimum-sample guard, CSV formula-injection neutralisation, and delta/URL helpers.

## 3. Render smoke test (temporary script, removed)

`SeoTrendChart` and `SeoBreakdownBars` server-rendered with: normal, gaps, single point, isolated day, all zero, all null, inverted position, flat CTR/position series. No `NaN`/`undefined`/`Infinity` in any output; empty states render.

## 4. Performance design (unmeasured)

- Scanner: at most 400 requests / 45 s / 3 concurrent; expected about 40 page GETs + up to 150 link HEADs + up to 100 image HEADs. **Actual duration and request count on the real site are unmeasured** (no live scan yet).

- Both comparison windows are computed in one aggregation pass per dataset.
- Compound/unique indexes: `{date, query, page}`, `{date, clicks}`, `{pagePath, date}`, `{query, date}`, `{pageCategory, date}`, `{date, device, country}`.
- Aggregates are cached 5 min (+10 min stale-while-revalidate) per date range, per instance, and cleared after each sync.
- Worst case analysed rows: 20,000 queries / 20,000 pages per window; one in-memory sort per request.
- **To measure once data exists:** time `getOverview`, `getKeywords` cold vs cached for 28/90-day ranges and record the numbers here.

## 5. What would close the gaps (needs your OK)

1. Real Search Console credentials → run verify, 7-day sync, 90-day backfill, reconcile totals for one week against the Search Console UI.
2. A throwaway database name (e.g. `ratiwal_seo_scratch`) for synthetic-data tests of aggregation, pagination and sync idempotency. I did **not** do this because `CLAUDE.md` says the app must only use `ratiwal_dream_estates`.
3. A browser pass at phone/tablet/desktop widths.

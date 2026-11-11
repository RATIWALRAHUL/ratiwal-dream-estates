# Phase 4A — Dashboard Implementation (Waves 1–2)

## 1. Routes

| Route | Status | Notes |
|---|---|---|
| `/dashboard/seo` | ✅ new overview | KPIs, 4 trend charts, device/country, top queries/pages, connection panel |
| `/dashboard/seo/keywords` | ✅ | search, intent filter, opportunity chips, sortable columns, pagination (25/page), CSV export |
| `/dashboard/seo/pages` | ✅ | 7 page-type groups, filter, sort, pagination |
| `/dashboard/seo/health` | ✅ moved, content unchanged | former `/dashboard/seo` "Technical SEO Health Desk"; CMS overview link repointed here |
| `/dashboard/seo/technical` | ✅ | scan status, open/new/ongoing/resolved counts, filterable findings table, "what this checks / can't" panel; Super Admin scan button. Overview also shows a "Technical health" card |
| `/dashboard/seo/performance`, `/conversions` | 📋 / ⏳ later | not created; no placeholder pages |
| Sidebar | ✅ | new "SEO Performance" item; "Content & SEO" now highlights only for `/dashboard/content` |

## 2. Metrics shown and their source

Every KPI card states source + period + comparison window. Clicks, impressions, CTR, average position come from Search Console only. These are **not shown** (no placeholders): organic sessions, organic conversions, indexed-URL counts, Core Web Vitals. Technical issue counts come from our own scanner and are labelled as such. A "Not connected yet" card lists them.

## 3. Design / accessibility

- Existing dashboard look (same tokens/Tailwind classes as `/dashboard/analytics`); no new CSS framework, no redesign of other modules.
- Charts: single hue, 2 px lines, no dual axis, hover crosshair + tooltip, gaps for missing days, "View as table" for every chart, `role="img"` with description. Position chart is inverted (better = higher) and says so.
- Tables use `<caption>`, `scope`, `aria-sort`; filters are plain GET forms (work without JS, shareable URLs).
- States: loading skeleton (`loading.tsx`), empty (not connected / no data), error, permission-denied, validation notice for bad date ranges.

## 4. Permissions

| Action | Roles |
|---|---|
| View pages, export CSV, view findings | `ADMIN`, `SUPER_ADMIN` |
| Test connection, sync, backfill, run technical scan | `SUPER_ADMIN` only |
| Everyone else (`EDITOR`) | permission-denied state / HTTP 403 |

## 5. Verification performed (details in the performance & security reports)

TypeScript clean · ESLint clean on all new files · production build succeeds · 160 unit checks pass (64 analytics + 96 technical scanner) · 28 existing SEO metadata checks still pass · HTTP auth/validation matrix passed · chart components render with gaps, single points, all-zero and all-null data without NaN.

## 6. Not verified

- **No browser/visual check** of the pages with real data (none exists yet). Layout at tablet/phone widths is built with responsive grid classes but has not been viewed.
- Aggregation correctness with real or synthetic data in MongoDB (see performance report).

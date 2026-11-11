# Phase 5E — Local Search Performance Baseline

**Date:** 2026-11-11 · **Stage:** 5E definition + what can honestly be baselined today.
Legend: ✅ VERIFIED · 💡 RECOMMENDATION · ⛔ UNAVAILABLE.

## 1. Headline
**There is no search-performance baseline yet, because there is no search data.** Search Console is not connected (no credentials; zero rows stored) and GA4 is not installed. This report refuses to estimate impressions, clicks, rankings or conversions. It records the few real numbers that exist and defines exactly how each market's baseline will be captured and kept honest once data flows.

## 2. Three concepts that must never be mixed

| Concept | Meaning | Where it appears | Source |
|---|---|---|---|
| **Business service area** | Where the firm legitimately operates/advises | Site config, schema `areaServed`, location pages | Owner records — **currently unproven for Bhiwadi, Navi Mumbai, Panvel** |
| **Query location** | A place named in the search text ("plots in Ajmer") | Search Console query text | Rule-based term matching on query strings |
| **User location** | Where the searcher physically is | GA4 geography (country/region/city of sessions); Search Console exposes **country only**, not city | GA4 (not installed) |

Consequences: (a) a person in Mumbai searching "plots in Jaipur" is *query location = Jaipur, user location = Mumbai*; (b) high impressions for a query naming a market where the firm has no presence is **not** evidence of service coverage; (c) Search Console cannot tell you which Indian city a searcher was in, so city-level "local" performance must be inferred from query text and landing page, and labelled as such.

## 3. What exists today (✅)

| Measure | Value | Notes |
|---|---|---|
| Indexable public URLs (sitemap) | 39 | 39/39 returned 200 at last check (Phase 4 baseline) |
| Published projects | 9 (Jaipur 4, Ajmer 3, Kishangarh 2) | database |
| Location pages (published) | 6 | 3 with inventory, 3 with none |
| Leads recorded in the database (all time) | **8** (7 from the contact page, 1 direct, **0 from a property page**) | too few to infer anything; no per-location attribution stored |
| Core Web Vitals | Earlier phases give **estimates** (e.g., "LCP ~1.8–2.2 s mobile") from lab reasoning, **not** field data; no PageSpeed/CrUX data has been collected | ⛔ real mobile baseline unavailable |
| Technical scan | built, never run live | no findings stored |
| Brand/organic traffic, rankings, inquiries by source | ⛔ none | — |

## 4. Baseline design per verified market

Markets are those with evidence (see Local SEO Audit). Query dictionaries use **only verified location and micro-market names** from the database.

| Market | Class | Landing pages for attribution | Query-location dictionary (examples from records) | Baseline metrics to record |
|---|---|---|---|---|
| Jaipur | Active Inventory | `/locations/jaipur`, 4 project pages, related guides | jaipur; tonk road; vatika; chaksu; sikar road; ajmer road; ring road; salagrampura; dahar; each project name | impressions, clicks, CTR, average position (as an average, not a rank), by page/query group; mobile share; inquiries from those pages |
| Ajmer | Active Inventory | `/locations/ajmer`, 3 project pages | ajmer; gagwana; chandiyawas; pushkar; project names | same |
| Kishangarh | Active Inventory | `/locations/kishangarh`, 2 project pages | kishangarh; madanganj; airport; marble; project names | same |
| Bhiwadi / Navi Mumbai / Panvel | Limited presence (unproven) | location pages | location terms | record impressions **for monitoring only**; no growth targets until evidence/registration is settled |
| Brand | — | homepage, about | "ratiwal", "ratiwal dream estates" | brand impressions/clicks (the cleanest early signal) |

## 5. How it will be measured (needs the earlier approvals)

| Metric | Source | Status |
|---|---|---|
| Location-wise impressions/clicks | Search Console via the Phase 4A dashboard, grouped by landing page and by query-location term | ⛔ needs GSC credentials; a **location grouping** in the dashboard is a small new feature (needs approval) |
| Property-specific visibility | same, by `/properties/<slug>` | ⛔ GSC |
| Organic inquiry conversions | GA4 events + existing lead records | ⛔ GA4 install, consent banner and first-touch capture (Phase 4A decision D5) — **today the lead record stores only the page of submission, not the organic landing page** |
| Landing-page engagement | GA4 engaged sessions | ⛔ GA4 |
| Mobile performance | Search Console device split + PageSpeed/CrUX field data | ⛔ PageSpeed/CrUX API key not set |

## 6. Baseline protocol (so it is trustworthy)
1. Connect Search Console and run the 90-day backfill; **wait ≥ 28 days of finalised data** (3-day reporting lag) before calling anything a baseline.
2. Record the baseline date range, the data-through date and sample sizes with each number; flag the Google logging issue window (2025-05-13 → 2026-04-27 for impressions/CTR/position) if a comparison spans it.
3. Do not compare markets by raw impressions; compare each market with its own prior period.
4. Suppress percentage changes below a minimum volume (Phase 4A rules).
5. Never present an average position as a fixed ranking.
6. Re-baseline only after major changes (e.g., location consolidation) and say so.

## 7. Baseline table (to be filled from real data — intentionally empty)

| Market | Impressions | Clicks | CTR | Avg position | Mobile share | Organic inquiries | Data period |
|---|---|---|---|---|---|---|---|
| Jaipur | ⛔ | ⛔ | ⛔ | ⛔ | ⛔ | ⛔ | — |
| Ajmer | ⛔ | ⛔ | ⛔ | ⛔ | ⛔ | ⛔ | — |
| Kishangarh | ⛔ | ⛔ | ⛔ | ⛔ | ⛔ | ⛔ | — |
| Bhiwadi | ⛔ | ⛔ | ⛔ | ⛔ | ⛔ | ⛔ | — |
| Navi Mumbai / Panvel | ⛔ | ⛔ | ⛔ | ⛔ | ⛔ | ⛔ | — |
| Brand | ⛔ | ⛔ | ⛔ | ⛔ | ⛔ | ⛔ | — |

## 8. Dependencies
Search Console credentials (owner); GA4 property + public tag + consent approach (owner, public-site change); PageSpeed/CrUX API key; optional location-grouping feature in the dashboard (approval).

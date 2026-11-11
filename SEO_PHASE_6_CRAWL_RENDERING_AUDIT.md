# Phase 6 — Crawl, Rendering & Caching Audit (6A)

**Date:** 2026-11-11 · audit only · evidence codes as in the Architecture Audit (E-code / E-build / E-probe / E-prod). Probe = a read-only script run against a local production build of the current working tree.

## 1. Crawl architecture

### 1.1 Public vs private
| Area | Public? | Controls | Result |
|---|---|---|---|
| Marketing pages (16 route files) | yes | sitemap + links | ✅ |
| `/dashboard`, `/portal`, `/partner` (+ login pages), `/kyc`, `/payments`, `/preview` | no | `robots.txt` disallow + `noindex, nofollow` meta + no-store cache; dashboard/portal/partner redirect (307) when unauthenticated | ✅ E-probe |
| `/api/*` | no | `robots.txt` disallow `/api`; public JSON for `properties`, `projects`, `locations` carries no `X-Robots-Tag` | 🟡 low: JSON is not indexable HTML; add `X-Robots-Tag: noindex` if desired |
| `/.well-known/*`, `llms*.txt` | intentionally public | cached 1 h / 1 d | ✅ |

### 1.2 Depth, orphans, link equity (raw HTML only — what a non-JS crawler sees)
| Metric | Value |
|---|---|
| URLs reachable from `/` | 39 of 39 sitemap URLs |
| Depth distribution | d0: 1 · d1: 16 · d2: 18 · d3: 3 · d4: 1 |
| Orphans (in sitemap, no link path) | **0** |
| Linked but not in sitemap | **0** |
| Deepest | `/insights/types-of-jda-patta-jaipur-verification` (depth 4, single inbound link from the 90-A article) |
| Single-inbound pages | `/locations/kishangarh`, `/locations/panvel`, all 4 `/testimonials/<case-study>`, `/insights/site-visit-inspection-framework`, `/insights/types-of-jda-patta-jaipur-verification` |
| Median inbound links per page | 6 |

💡 **Recommendations (need approval):** link all eight guides from the `/insights` hub and from relevant project/location pages; link Kishangarh and Panvel from the `/locations` hub, their projects (Aero Crystal, One Kishangarh) and the header/footer corridor menu; link each case study from its location page. All are copy/template changes, no new routes.

### 1.3 Pagination discovery
`/properties` shows 12 cards and loads more by JavaScript (`IntersectionObserver` + "load more"). Nine properties exist, so everything is in the first batch today. 💡 If the catalogue exceeds 12, projects 13+ are reachable by a non-JS crawler only through location pages, the sitemap or "related" cards. The Indexation Strategy proposes crawlable pagination or location-led discovery before that point.

### 1.4 Query parameters (E-probe)
| URL | Status | Canonical | Robots |
|---|---|---|---|
| `/properties?city=Jaipur`, `?utm_source=test`, `?page=2`, `?search=<script>` | 200 | `/properties` | `index, follow` |
| `/locations/jaipur?x=1` | 200 | `/locations/jaipur` | `index, follow` |
| `/properties/neelkanth-nagar?ref=x` | 200 | clean slug | `index, follow` |
Parameters collapse to the clean canonical, so no duplicate-content or crawl-trap exists. Because filters are client-side only, **no filter URL is ever generated**.

### 1.5 Redirects and URL variants (E-probe, E-prod)
| Input | Result |
|---|---|
| `/properties/`, `/properties/neelkanth-nagar/`, `//properties` | 308 → clean path (single hop) |
| `/about-us`, `/projects`, `/terms`, `/privacy`, `/rera`, `/plots` | 308 → canonical target (6 explicit redirects in `next.config.ts`) |
| `https://ratiwaldreamestates.com/`, `http://www…/` | 308 → `https://www.ratiwaldreamestates.com/` (E-prod, single hop) |
| `/properties/NEELKANTH-NAGAR` | **200** (duplicate URL; canonical points to lowercase) |
| `/Properties`, `/PROPERTIES/...` | 404 (route segments are case-sensitive; slug lookup is not) |
| `/index.html`, `/home`, unknown slugs | 404 + `noindex` |
Redirect chains: **none found**. 💡 Make slug matching case-sensitive (or 308 to lowercase) for consistency — low priority.

### 1.6 Canonicals and sitemap
- Canonical: 39/39 correct, absolute, `www`, no trailing slash.
- Sitemap: 39 URLs, all 200, all indexable, none redirecting. Completeness vs actual published content: matches (9 projects, 6 locations, 8 guides, 4 case studies, 12 static pages).
- **Freshness problem (V4/V1):** the sitemap is a static build artefact (`revalidate:false`). Static pages carry `lastmod` = build time; project/location `lastmod` uses `updatedAt` (good) but cannot change until a rebuild.
- **Fallback hazard (V5):** if the database is empty or errors, the sitemap lists the six *fallback* properties instead (slugs that have no pages).

## 2. Rendering

| Question | Finding |
|---|---|
| SSR/static for important pages | ✅ all public pages are prerendered HTML (static or ISR). Content is in the initial HTML |
| Metadata in initial HTML | ✅ title, description, canonical, OG, Twitter, JSON-LD present in raw HTML on 39/39 |
| Suspense/streaming (current tree) | ✅ after this session's change there are no loading boundaries on public routes: prerendered files have H1 before footer and no `hidden` wrapper on all pages measured. ⚠️ **Production still serves the older streamed output until redeployed** |
| JS-dependent content | 🟡 catalogue cards 13+ and all filter results (see 1.3); the property gallery/lightbox/map are client components but their key facts are server-rendered. Leaflet maps are client-only (expected) |
| Heading structure | ✅ one H1, no skipped levels on 39 URLs after the previous fixes |

## 3. Indexation (current behaviour, E-probe/E-code)
| Case | Behaviour | Assessment |
|---|---|---|
| Published property | prerendered at build, listed in sitemap | ✅ |
| **New property published after a build** | listing/cards appear within ≤ 60 s (ISR) but the detail URL is `fallback:false` → **404** until redeploy; absent from the sitemap until redeploy | ❌ V1 |
| Unpublished/archived property | existing static page keeps serving until its ISR revalidation (≤ 120 s) then renders `notFound()` (404); sitemap keeps listing it until redeploy | 🟡 V1 (stale sitemap, brief stale page) |
| Slug changed | old URL: 404 after ISR; new URL: 404 until redeploy; no redirect created (`RedirectRule` model exists for CMS, not wired to property slug changes — not verified) | ❌ V1 |
| Deleted/never-existed slug | 404, `noindex`, no soft-404 | ✅ |
| Duplicate property URLs | only case variants (200 → canonical) | 🟡 V9 |
| Filtered / search result pages | none exist as URLs | ✅ by construction |
| Preview/private routes | `noindex, nofollow`, disallowed in robots | ✅ |
| DRAFT location | 404, not in API or sitemap | ✅ |

## 4. Caching and revalidation (evidence; no rule changed)
| Resource | Header / policy observed | Notes |
|---|---|---|
| Static pages | `s-maxage=31536000` (until redeploy) | ✅ expected for static |
| ISR pages | `s-maxage=60|120, stale-while-revalidate=~1 year`; `x-nextjs-cache: HIT/STALE` | ✅ standard ISR |
| `sitemap.xml`, `robots.txt` | `max-age=0, must-revalidate`; content frozen at build | 🟡 V4 |
| `/api/properties` | `s-maxage=60, stale-while-revalidate=300` + in-memory cache keyed on unbounded search text | 🟡 V8 |
| Markdown variant | `s-maxage=86400`, `Vary: Accept`; the HTML variant lacks `Vary: Accept` | 🟡 V10 |
| Private routes | `private, no-cache, no-store` | ✅ |

**Root cause of V1 (verified):** detail pages use `dynamicParams = false` and `generateStaticParams()` reads the database **only at build**; the publishing actions refresh only an in-process cache. Next's ISR regenerates *existing* paths; it cannot add new ones when `fallback:false`.
💡 Options (approval + staging test required): (a) `dynamicParams = true` keeping `notFound()` for unknown slugs; (b) call `revalidatePath` for the detail page, `/properties`, `/locations/<city>` and `/sitemap.xml` from publish/unpublish/archive/slug-change actions; (c) give `sitemap.ts` a `revalidate` (e.g., 1 h) or `revalidatePath('/sitemap.xml')`; (d) make `generateStaticParams` **fail the build** when the database is unreachable instead of returning `[]` (V2). Trade-off for (a): a bogus slug triggers one database lookup before its 404 is cached; guard with the existing rate limits.

## 5. Content negotiation defect (V3)
Middleware rewrites `Accept: text/markdown` requests on public content routes to `/api/content-negotiation?path=…`, but the route handler receives no `path` and answers with the **homepage** markdown for every page. Direct calls with `?path=` return correct page-specific markdown. This is an agent-facing feature (wrong content served with HTTP 200), not a Googlebot issue. Not fixed (gate).

## 6. What was not measured
Core Web Vitals field data; Googlebot's actual crawl behaviour (no Search Console); production behaviour after the next deploy; reproduction of V1/V2 against a staging database.

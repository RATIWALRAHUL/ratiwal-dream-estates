# Missing Indexed URL — Master Inventory

**Domain:** https://www.ratiwaldreamestates.com
**Date:** 2026-11-11
**Status:** Phase A–B (discovery + classification) complete. **No pages were created or modified.**

---

## 1. Bottom line

**No URL that Google is known to have indexed was found to be missing.** The one thing that would prove it, a real Google index export, is not available. The inventory below is therefore a *candidate* inventory built from the code, git history, database and live probing.

| Finding | Evidence |
|---|---|
| All 39 sitemap URLs are healthy | 39/39 return 200 with 0 redirects, a self-referential `www` canonical, `index, follow`, and exactly one H1. |
| Zero rows in the "incomplete / wrong page / missing route / duplicate" classes | Probed the 39 sitemap URLs plus about 40 candidate URLs (HTTP status, redirect chain, canonical, robots meta, H1 count). |
| 9 URLs with code or git evidence return 404, all on purpose | 6 static-fallback property slugs, 2 placeholder property slugs and 1 retired location slug. A further 8 guessed generic paths (`/blog` etc.) also 404 but have no evidence of ever existing. See §4.3. |
| Old-URL redirects work | `/about-us`, `/terms`, `/privacy`, `/rera`, `/projects`, `/plots` return 308 to a real equivalent. Trailing-slash, apex and `http` variants also resolve in one or two hops. |
| Private routes are correct | `/dashboard`, `/portal` and `/partner` return 307 to their login pages, which carry `noindex, nofollow`. |

## 2. Why "no missing pages found" is not "none exist" (evidence gaps)

| Source requested | Result | Consequence |
|---|---|---|
| Google `site:` queries | The search tool available here returned **zero results from the domain**, including for the apex, `www` and project-name queries. It is a general web search, US-only, and did not honour `site:`. | Cannot enumerate what Google has indexed. |
| Google Search Console | The DB integration row `seo_integration_configs` shows provider `GSC`, status **`NOT_CONFIGURED`**. `seo_search_daily`, `seo_query_page_perf` and `seo_sync_runs` have **0 rows**. | No GSC data exists to export. Nothing was fabricated. |
| Wayback/archive captures | Not attempted: not a listed authorized source for this session. | Open. |
| DB `redirectrules` collection | Exists, **0 rows**. | No hidden redirect configuration. |

**The decisive input is a GSC export** (Pages → "Why pages aren't indexed" plus the "Indexed" list). See the plan, §5.

## 3. Sources inspected

- **Live sitemap:** 39 URLs. Matches `src/app/sitemap.ts` exactly.
- **Live robots.txt:** `/_next/` crawlable, admin/portal/partner/kyc/payments/preview/api/internal disallowed.
- **Route files:** every public `page.tsx`/`route.ts` under `src/app`.
- **Git history (36 commits, 2026-08-11 → 2026-11-11):**
  - **No public route file was ever deleted or renamed.**
  - Route files were only added or modified.
  - The six redirects in `next.config.ts` have been there since 2026-08-19.
- **Slug history in `src/data/*`:** properties, locations, insights, testimonials and resources.
- **Database (read-only):** 9 properties, 7 locations, 44 media assets, 0 CMS entries.
- **Internal-link audit:** static `href`/`redirect` targets in public source all map to existing routes. Dynamically built links were not traced.
- **Prior SEO reports (Phases 1–8):** every `ratiwaldreamestates.com` URL mentioned in the repo's `.md` files is covered by this inventory.

## 4. Master inventory

Columns abbreviated: **Status** = current HTTP status. **Class** = Phase B category (1 functional · 2 indexed-404 · 3 incomplete · 4 wrong page · 5 missing route · 6 redirect · 7 duplicate · 8 parameter · 9 private · 10 unknown). **Approval** = owner decision needed before action.

### 4.1 Class 1 — Existing and functional (39, all in sitemap, all 200, self-canonical)

| URL (path) | Source | Existing route | Reconstruct? | Canonical | Priority | Approval |
|---|---|---|---|---|---|---|
| `/` | sitemap, code | `(marketing)/page.tsx` | No | `https://www.ratiwaldreamestates.com` | — | n/a |
| `/properties`, `/locations`, `/investment`, `/about`, `/why-choose-us`, `/testimonials`, `/insights`, `/contact` | sitemap, code | `(marketing)/<name>/page.tsx` | No | self | — | n/a |
| `/privacy-policy`, `/terms-of-service`, `/disclaimer` | sitemap, code | `(marketing)/<name>/page.tsx` | No | self | — | n/a |
| `/properties/neelkanth-nagar`, `/riyasat-paradise-ii`, `/bhumija-green-block-a`, `/riyasat-heritage-extension` | sitemap, DB, seed | `properties/[slug]` | No | self | — | n/a |
| `/properties/happy-business-park`, `/balaji-puram`, `/vrindavan-viihaar`, `/aero-crystal`, `/one-kishangarh` | sitemap, DB, multi-city seed | `properties/[slug]` | No | self | — | n/a |
| `/locations/jaipur`, `/navi-mumbai`, `/ajmer`, `/panvel`, `/bhiwadi`, `/kishangarh` | sitemap, DB | `locations/[slug]` | No | self | — | n/a |
| `/testimonials/<4 case-study slugs>` | sitemap, static data | `testimonials/[slug]` | No | self | — | n/a |
| `/insights/<8 article slugs>` | sitemap, static data | `insights/[slug]` | No | self | — | n/a |

Other healthy URLs probed: `/robots.txt` and `/llms.txt` (200), and 3 of the 4 files under `/documents/` (200). The 4th, `property-document-request-checklist.pdf`, exists on disk and matches `src/data/resources.ts`, but was not probed because I first guessed its filename wrong. `/llms-full.txt` and `/.well-known/*` exist as routes in the code and were not probed.

### 4.2 Class 6 — Old URL, redirect already in place (no action)

| URL | Source | Status | Target | Note |
|---|---|---|---|---|
| `/about-us` | next.config.ts | 308 | `/about` | Equivalent. |
| `/terms` | next.config.ts | 308 | `/terms-of-service` | Equivalent. |
| `/privacy` | next.config.ts | 308 | `/privacy-policy` | Equivalent. |
| `/rera` | next.config.ts | 308 | `/disclaimer` | Equivalent. |
| `/projects`, `/plots` | next.config.ts | 308 | `/properties` | Equivalent. |
| `/properties/`, `/locations/jaipur/` | Next default | 308 | non-slash form | OK. |
| `http://…`, apex | platform | 308 | `https://www…` | OK. |

### 4.3 Class 2 / 10 — Currently 404 (candidate "previously indexed" URLs)

All are **correctly returning 404** with `noindex`. None is recommended for reconstruction.

| URL | Discovery source | Status | Original content available? | Reconstruct? | Recommendation | Priority | Approval |
|---|---|---|---|---|---|---|---|
| `/properties/royal-palms-township-ajmer-road-jaipur` | `src/data/properties.ts` (static fallback, added 2026-08-17) | 404 | Static record in git only. **Not in DB**, not a verified Jaipur township. | **No** | Keep 404. Optionally upgrade to 410 once a GSC export confirms indexation. | P3 | D2 |
| `/properties/ring-road-logistics-commercial-hub-jaipur` | same | 404 | same | No | same | P3 | D2 |
| `/properties/imperial-enclave-tonk-road-jaipur` | same | 404 | same | No | same | P3 | D2 |
| `/properties/aravalli-greens-retreat-plots-ajmer` | same | 404 | same | No | same | P3 | D2 |
| `/properties/aerotropolis-prime-plotted-node-navi-mumbai` | same | 404 | same | No | same | P3 | D2 |
| `/properties/dmic-industrial-commercial-logistics-bhiwadi` | same | 404 | same | No | same | P3 | D2 |
| `/properties/sample-residential-plot-jaipur` | early git history (placeholder) | 404 | Placeholder only | **No, must not exist** | Keep 404. | P4 | n/a |
| `/properties/sample-commercial-plot-navi-mumbai` | early git history (placeholder) | 404 | Placeholder only | **No, must not exist** | Keep 404. | P4 | n/a |
| `/locations/other-locations` | early git history (removed slug) | 404 | Placeholder only | No | Keep 404. | P4 | n/a |
| `/blog`, `/services`, `/gallery`, `/faq`, `/resources`, `/home`, `/index.html`, `/sitemap` | Guessed generic legacy paths. **No evidence the site ever served them** (absent from git history, docs, sitemap, DB). | 404 | None | No | Keep 404. `/resources` is a possible *future* hub (see plan D4), not a recovery. | — | n/a |

**Why the six static slugs are the most plausible orphan source (corrected 2026-11-11):**
- They were the *only* property data on the site from 2026-08-17 until the DB integration around 2026-10-04, so they were presumably live and linked during that window.
- On 2026-10-04 (commit `65d676e`) the whole static array was commented out. Since then it is `[]`, and the 404s are consistent with that.
- **Correction:** an earlier draft of this section said the sitemap's DB-failure fallback could re-expose them. That is **not possible today**, because the fallback array is empty. See `SEO_STATIC_FALLBACK_SAFETY_AUDIT.md`.
- This is a **hypothesis only**; I could not confirm they were ever indexed. If they were, they have now been 404 for over five weeks and Google may already have dropped them.

### 4.4 Class 8 — Parameter / filtered URLs

| URL | Status | Canonical | Robots | Recommendation |
|---|---|---|---|---|
| `/properties?type=residential` | 200 | `/properties` | index, follow | Fine. Canonical consolidates. No new page. |
| `/properties?city=jaipur` | 200 | `/properties` | index, follow | Same. |

### 4.5 Class 9 — Private / restricted (never reconstruct, never index)

| URL | Status | Robots meta | robots.txt |
|---|---|---|---|
| `/dashboard/*` → `/dashboard/login` | 307 → 200 | noindex, nofollow | Disallow |
| `/portal/*` → `/portal/login` | 307 → 200 | noindex, nofollow | Disallow |
| `/partner/*` → `/partner/login` | 307 → 200 | noindex, nofollow | Disallow |
| `/kyc/submit/[token]`, `/payments/pay/[token]`, `/preview/[token]`, `/api/*` | token routes | not probed (token-gated) | Disallow |

### 4.6 Classes 3, 4, 5, 7 — none found

- **Incomplete (3):** none. Every sitemap URL is 105–254 KB with real content.
- **Wrong page (4):** none.
- **Missing route implementation (5):** none.
- **Duplicate (7):** none.

*Note on `/properties/happy-business-park`:* my first pass showed it serving the Riyasat Heritage Extension title and canonical. That was a **probe artefact**. A failed fetch reused the previous page's file. Re-fetched with a fresh file per URL: it correctly serves Happy Business Park, with its own canonical. All 39 canonicals were then re-verified.

## 5. Related defects found along the way (not missing pages; reported, not fixed)

| # | Finding | Severity | Detail |
|---|---|---|---|
| R1 | All 9 DB property records carry `seo.canonicalUrl = https://dreamestate.in/properties/<slug>` | Low (latent) | Placeholder domain, forbidden by CLAUDE.md §6. **Not used by public rendering** (`src/lib/seo.ts` derives canonicals from `siteConfig.url`), so live canonicals are correct. Becomes a risk if anything starts reading the field. |
| R2 | Login routes are both `Disallow`ed in robots.txt **and** `noindex` | Low | Google can't see a `noindex` on a URL it's blocked from fetching. If a login URL was linked externally it can appear as "indexed, blocked by robots." Harmless here. |
| R3 | DB has a DRAFT location `jaipur-expressway` | Info | Correctly absent from the sitemap and not public. Confirm it is intentional. |
| R4 | Redirects are 308, not 301 | Info | Google treats 308 and 301 equivalently. No action. |

## 6. Rollback / data safety

No database writes, no file changes outside these two reports, no git commits. Database access was **read-only** (`find`, `count`, `listCollections`). Probing used plain `GET` requests to public URLs.

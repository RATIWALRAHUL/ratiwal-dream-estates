# Phase 6 — Performance & Scalability Review

**Date:** 2026-11-11 · review and design only. Measurements are from a local production build with a small dataset (9 projects, 67 plot options); **no load test, Lighthouse run or field data was collected**, so nothing below is a performance claim — only measured sizes and code-level scaling analysis.

## 1. Measured today
| Item | Measurement |
|---|---|
| `/properties` HTML | 185 KB (9 projects) |
| Serialised `properties` prop inside it | 19.4 KB → **≈ 2.2 KB per project** |
| `/api/properties` (9 items) | 5.4 KB |
| Property detail HTML | ~239 KB |
| Location page HTML | ~244 KB |
| Property indexes on the model | 13 compound/single indexes incl. `{publicationStatus, sortOrder, createdAt}`, `{slug, publicationStatus}`, `{publicationStatus, locationId, sortOrder}`, `{publicationStatus, propertyType, sortOrder}`; location: `{publicationStatus, sortOrder, name}`, `{state, city}`, 2dsphere |

## 2. Scaling analysis (code-level, not load-tested)
| Area | Today | At 500 projects | At 5,000 | Verdict |
|---|---|---|---|---|
| Catalogue page payload | all projects serialised into the page | ≈ 1.1 MB added to HTML/RSC | ≈ 10 MB | ❌ breaks first; also slows hydration and filtering |
| `getAllProperties()` | loads all published (with card projection + populate) and caches 120 s in memory | one query, hundreds of docs, fine | thousands per instance cache refresh | 🟡 projection is right; add DB-level pagination/limits |
| `/api/properties` | filters/sorts/paginates **in memory** over the full list | OK | wasteful; per-instance cache of every distinct search string (key not bounded; 1,000-entry LRU can be churned by a crawler with varied `search`) | ❌ cache-key explosion, unbounded `search` length |
| `generateStaticParams` | all published slugs at build | build time grows linearly (each page ~240 KB) | long builds | 🟡 acceptable to ~hundreds; consider on-demand generation (also solves V1) |
| Sitemap | one query, projection `{slug, updatedAt}` | fine | fine | ✅ (add `archivedAt` index only if it becomes slow) |
| Related properties | indexed query with `limit(count*3)` | fine | fine | ✅ |
| Filtering UI | client JS over the full array, memoised | fine | sluggish | ❌ same root cause as the payload |
| Images | `next/image` with AVIF/WebP, 1-year cache, remote ImageKit pattern | fine | fine | ✅ |
| Rendering cost | static/ISR; origin renders only on revalidation | fine | revalidation storms if many pages share 60 s | 🟡 stagger or use on-demand revalidation |
| Client JS | forms and maps are client components; chat widget lazy | fine | — | ✅ (not measured) |

## 3. Recommendations (need approval; none applied)
| # | Change | Why | Effort |
|---|---|---|---|
| P1 | **Server-side pagination for the catalogue**: render the first page (e.g., 12) from the server, load subsequent pages via the API with `page`/`limit`; keep the filter state in the URL; return only card fields | removes the payload-growth problem and keeps first-page content crawlable | 2–3 days |
| P2 | **API query validation**: whitelist `city`/`type`, cap `search` at ~80 chars, normalise before building the cache key, cap distinct keys (or skip caching for free-text) | closes cache-key churn and unbounded input | 0.5 day |
| P3 | **Database-level filtering/pagination** when the list grows (`find` with `publicationStatus`, `locationId`, `propertyType`, `skip/limit`/cursor and the existing indexes; text search via a text index or regex on a bounded field) | avoids loading everything | 1–2 days |
| P4 | Use on-demand ISR (`dynamicParams=true` + `revalidatePath` on publish) instead of build-time-only params | solves V1 and shortens builds | see Crawl report |
| P5 | Don't expose raw ObjectIds in card DTOs; use slugs as the public key | smaller payloads, less internal-ID exposure (V11) | 0.5 day |
| P6 | Rate limiting: derive client IP from a trusted proxy header only; keep limits; consider a shared store only if abuse appears | correctness of per-IP limits | 0.5 day |
| P7 | Measure before/after with Lighthouse CI or the PageSpeed API (needs the Phase 4A API key) and Search Console CWV report | evidence | 0.5 day |

## 4. What not to change without evidence
Cache-Control values (observed correct for static/ISR/private routes), image configuration, ISR intervals, and the existing indexes — no problem was demonstrated at the current scale.

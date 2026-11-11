# Phase 6 — Crawl & Indexation Strategy (policy design)

**Date:** 2026-11-11 · design only; nothing applied. Evidence references are in the Crawl & Rendering Audit.

## 1. Policy table — what is indexable

| URL class | Index? | Canonical | In sitemap? | Robots | Notes |
|---|---|---|---|---|---|
| Home, `/properties`, `/locations`, `/investment`, `/about`, `/why-choose-us`, `/testimonials`, `/insights`, `/contact` | ✅ | self | ✅ | index, follow | hubs |
| Legal pages (privacy, terms, disclaimer) | ✅ | self | ✅ (low priority) | index, follow | keep indexable for trust/E-E-A-T |
| `/properties/<slug>` — **published** project | ✅ | self | ✅ | index, follow | one URL per RERA project |
| `/locations/<slug>` — published location **with evidence** (Phase 5 classes 1; class 3 only with "advisory" wording) | ✅ / 🟡 | self | ✅ | index, follow | class-3 pages: owner decision (merge/noindex) |
| `/insights/<slug>`, `/testimonials/<slug>` | ✅ | self | ✅ | index, follow | legal articles only after legal review |
| **Unpublished / draft / archived project or location** | ❌ | none | ❌ | 404 | remove from sitemap on the same event |
| **Deleted or invalid slug** | ❌ | none | ❌ | 404 + `noindex` | never a soft-404 (verified OK today) |
| **Renamed slug (old URL)** | ❌ | — | ❌ | **308 → new URL** | needs redirect creation on slug change |
| Case variants of a slug | ❌ | lowercase | ❌ | 308 to lowercase (or 404) | currently 200 (V9) |
| Filtered/sorted catalogue URLs, `?page=`, `?utm_*`, unknown params | ❌ | `/properties` | ❌ | canonical to clean URL (+ `noindex, follow` if URL state is added) | no crawlable links to them |
| Internal search results | ❌ (none exist) | — | ❌ | `noindex, follow` if ever created | — |
| `/dashboard`, `/portal`, `/partner`, `/kyc`, `/payments`, `/preview`, `/api` | ❌ | none | ❌ | disallow + `noindex, nofollow` (+ `X-Robots-Tag` on APIs) | already in place |
| `/llms.txt`, `/llms-full.txt`, `/.well-known/*` | n/a | — | ❌ | allowed | factual content only (see V3 and claims note) |

## 2. Sitemap policy
1. Lists **only** URLs that return 200, are `index, follow`, are self-canonical, use `https://www…` and no trailing slash. (Today ✅ for all 39.)
2. Built from the database for projects/locations and from static data for guides/case studies; **never from the static property/location fallback** (V5). On database failure, **fail** (or keep the last good sitemap) — do not publish fallback slugs.
3. `lastmod` = the real content-change date (entity `updatedAt`, article `updatedAt`); static pages use a fixed per-page constant or file date, **not "now"** (V4).
4. **Fresh on publish:** publish/unpublish/archive/slug-change must refresh the sitemap (via `revalidatePath('/sitemap.xml')` or a short `revalidate`), the detail page and the relevant hubs (V1).
5. Single sitemap is appropriate at this size (< 50,000 URLs); revisit if the catalogue grows past a few thousand.

## 3. Publishing state machine → SEO consequences (target)
| Event | Detail page | Hubs | Sitemap | Redirect |
|---|---|---|---|---|
| Publish | becomes available **without redeploy** | listing + location page refresh | add | — |
| Unpublish / archive | 404 (+ `noindex` on the 404) | listing + location refresh | remove | none (410 is optional if permanently gone — decision) |
| Slug change | new URL live; old URL redirects | refresh | replace | **308 old → new** |
| Location unpublished while projects exist | blocked by the existing publish rule ("cannot publish a property in an unpublished location") | — | — | — |

## 4. robots.txt policy
- Keep: `Disallow` for the private prefixes; never block `/_next/` (verified correct).
- **Decide AI-crawler policy explicitly (V12):** the file's comment says "AI model training: disallowed", yet `GPTBot`, `ClaudeBot`, `Google-Extended` and others are `Allow: /`. Vendors document these as separate tokens — e.g., GPTBot and ClaudeBot are described by their operators as training-related crawlers, `Google-Extended` as a control for Gemini training/grounding use (from vendor documentation; not re-fetched here), while search/retrieval agents have their own tokens (e.g., OAI-SearchBot, PerplexityBot). 💡 Owner chooses: allow all (then fix the comment), or disallow training tokens while allowing search tokens.
- Do not use robots.txt to hide pages that should be 404/noindex.

## 5. Deleted / unavailable property handling
"Unavailable" (sold out) vs "unpublished" are different: a sold-out project that still has historical value should remain a 200 page marked "currently not available" (honest status) rather than 404, with no inquiry CTA claiming availability; only withdrawn or incorrect listings are removed. 💡 Add a `listingStatus` rendering rule and keep the sitemap entry only while the page is useful.

## 6. Crawl-budget and discovery
At 39 URLs crawl budget is not a constraint. Priorities are discovery and freshness: fix inbound links to Kishangarh/Panvel/case studies/guides (V7), and make newly published pages reachable immediately (V1).

## 7. Verification (to automate — see Release Governance)
Sitemap ⊆ {200, indexable, self-canonical}; every indexable page ⊆ sitemap (no unlisted public pages); private prefixes return `noindex`/redirect; unknown slugs 404 with `noindex`; parameters never change the canonical; no URL in the sitemap redirects.

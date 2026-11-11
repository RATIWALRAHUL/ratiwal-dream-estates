# SEO Fix — Title Lengths, Heading Hierarchy, and Server-Rendered Page Order

**Date:** 2026-11-11 · **Trigger:** Ubersuggest "title too long" on two insight pages; owner asked for correct h1→h2→…→h6 order on all pages and to investigate the streaming/`loading.tsx` finding.

## 1. Title tags (title = `metaTitle` + " | Ratiwal Dream Estates")
| Page | Before | After |
|---|---|---|
| `/insights/section-90a-land-conversion-rajasthan` | 68 | 58 — "Section 90-A Land Conversion Guide" |
| `/insights/types-of-jda-patta-jaipur-verification` | 72 | 52 — "Types of JDA Patta in Jaipur" |
| `/contact` | 59 characters (61 UTF-8 bytes, only appeared long in a byte count) | unchanged |

## 2. Heading hierarchy (measured on rendered pages)
Method: headless Chrome DOM of every sitemap URL plus detail pages (39 URLs), and the raw server HTML (40 URLs). Rule: exactly one h1; no level increases by more than one.
Before: 8 pages / 13 jumps (h1→h3, h2→h4), no h5/h6 anywhere. After: **0 issues in both audits.**

| Page | Fix | File |
|---|---|---|
| `/properties` | Results line "Showing N verified land opportunities" became the H2 | `components/sections/properties/PropertiesFilterSection.tsx` |
| `/about` | Credential cards h4→h3 | `components/sections/about/AboutLeadership.tsx` |
| `/privacy-policy`, `/terms-of-service`, `/disclaimer` | Callout title h4→h3 | `components/legal/LegalCallout.tsx` |
| `/contact` | Hero channel cards h3→h2 | `components/sections/contact/ContactHero.tsx` |
| `/testimonials` | Trust points h3→h2 | `components/testimonials/TrustSummary.tsx` |
| `/insights` | Featured hero card h3→h2 | `components/insights/InsightsHero.tsx` |
| Titles | see §1 | `data/insights.ts` |

## 3. Server-rendered page order (loading.tsx)
**Finding:** the root `src/app/loading.tsx` wrapped every page in a Suspense boundary, so the prerendered HTML of *every* page (homepage included) held the real content inside `<div hidden id="S:0">`, with only the "Loading Ratiwal Dream Estates…" placeholder visible and the reveal script at the end of the document. The four route-level `loading.tsx` files (properties, properties/[slug], locations, insights) added a second hidden segment placed **after the footer**, so on those pages the footer came before the H1 in raw HTML (H1 at byte ~50,000).

**Change:** removed `src/app/loading.tsx` and the four marketing `loading.tsx` files; added identical loader files to the private per-request routes that used the root one (`kyc`, `payments`, `preview`).

| Measure (prerendered HTML) | Before | After |
|---|---|---|
| Pages with hidden content wrapper | all | **none** |
| H1 before footer on every page | no on properties/locations/insights/detail pages | **yes on all** |
| `/properties` H1 offset | byte 50,513 | byte 25,090 |
| Raw-HTML heading audit | 32 of 40 URLs with problems | **0** |
| Visible text at top of raw HTML | "Loading Ratiwal Dream Estates…" | site navigation and content |

**Trade-off (this reverses part of commit `8abe50e`, "SSR streaming, branded LogoLoader"):** public pages are static/ISR, so normal navigation uses prefetched data and shows no loader. A page that is *not* prerendered (for example a property added after the last build) now waits for the server without a skeleton on first visit. Dashboard, portal and partner areas keep their own loaders.

**Not measured:** Lighthouse/Core Web Vitals before vs after. The structural change should help (content no longer waits for a script at the end of the document) but that is a prediction, not a measurement.

## 4. Verification
TypeScript clean · existing SEO tests pass (28 + 64 + 96) · production build succeeds · all public routes 200, unknown slugs 404, private routes still redirect/respond · sitemap still 39 URLs · canonicals and `noindex` on dashboard unchanged.

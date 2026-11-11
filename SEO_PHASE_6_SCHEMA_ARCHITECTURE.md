# Phase 6 — Structured Data Architecture (6C)

**Date:** 2026-11-11 · audit and design only. All observations are from the JSON-LD actually emitted by a local production build (E-probe) and the generator code (E-code). **Schema.org validity and Google rich-result eligibility are separate**: validity = the JSON-LD parses and uses defined types/properties; eligibility = Google supports that type for a rich result and the page meets its policies. Google's feature support was **not re-verified in this phase** — treat the "eligibility" column as expectations to confirm in Google's current documentation / Rich Results Test, not promises.

## 1. Current output by page type
| Page type | Nodes emitted (all in 2 script blocks) | Valid JSON-LD? |
|---|---|---|
| Every page (root layout) | `RealEstateAgent`+`Organization` (`/#organization`, 15 properties), `WebSite` (`/#website`) | ✅ |
| `/` | + `FAQPage` | ✅ |
| `/about`, `/contact`… (via `buildWebPageSchema`) | `AboutPage`/`WebPage` (`#webpage`) + `BreadcrumbList` | ✅ |
| `/properties` | `CollectionPage` + `BreadcrumbList` + `ItemList` (9 project URLs) | ✅ |
| `/properties/<slug>` | `Place` (`#place`) + `RealEstateListing` (`#listing`) + `BreadcrumbList` | ✅ parses; content issues below |
| `/locations/<slug>` | `Place` (`#place`) + `BreadcrumbList` + `ItemList` (`#properties`) | ✅ |
| `/insights/<slug>` | `BlogPosting` (`#article`) + `BreadcrumbList` | ✅ |
| `/testimonials/<slug>` | `Article` (`#article`) + `BreadcrumbList` | ✅ |
| legal pages | `BreadcrumbList` (+ layout nodes) | ✅ |

Checks passed: all blocks parse (0 syntax errors on 39 URLs); every typed node with an `@id` is **defined once per page** (the repeated `/#organization` strings are references); no `aggregateRating`, `review`, `offers`, `price` or `availability` anywhere (correct — none are supportable); canonical URLs inside schema match page canonicals.

## 2. Findings
| ID | Severity | Finding | Why it matters |
|---|---|---|---|
| S1 | **High** | **Project `Place.geo` = the Jaipur city-centre coordinates (26.9124, 75.7873), identical to the location's.** The page code also falls back to a hard-coded coordinate when a property has none | Presents a city centroid as the project's location — misleading to users, maps and crawlers |
| S2 | **High** | **`Place.address.streetAddress` is the locality name** ("Chaksu") | Not a street address; reads as an unverified address |
| S3 | Medium | `RealEstateListing` is not connected to the `Place` (no `about`/`location`), nor to the organization as `broker`/`seller` (relationship unproven, so correctly absent — but then the node floats) | Weak entity linkage |
| S4 | Medium | **`Organization.openingHoursSpecification` = 7 days 10:00–19:00**, visible hours are Mon–Sat | Conflicting entity data |
| S5 | Medium | `areaServed` includes Navi Mumbai / Panvel; `sameAs` empty; no `geo`/street address on the organization | Unproven service area (Phase 5) |
| S6 | Medium | `BlogPosting.author` is an `Organization` named "Ratiwal Editorial Research Team"; publisher logo URL is `/images/brand/logo.jpg` while the organization logo is `/images/brand/logo.png` | Unverifiable author; inconsistent logo entity |
| S7 | Low | Three generators can emit the same concepts (`components/seo/JsonLd.tsx`, `lib/schema.ts`, inline page graphs); property page builds its own graph | Drift risk; no single typed builder |
| S8 | Low | `ItemList` on `/properties` has no `@id`; `BreadcrumbList`/`FAQPage` have none (acceptable) | Cosmetic |
| S9 | Info | `BreadcrumbList` home item URL is `https://www.ratiwaldreamestates.com` (no trailing slash) — consistent with canonical rule | OK |

## 3. Type-by-type decision (based on actual content)
| Type | Use? | Validity | Rich-result eligibility (to confirm) | Notes |
|---|---|---|---|---|
| `Organization` + `RealEstateAgent` | ✅ keep | valid | not a rich result by itself; supports knowledge-panel/entity understanding | fix hours; add `sameAs` only when real; address as city-level unless a real one is provided |
| `WebSite` | ✅ keep | valid | none needed | site-search action not applicable (no site search) |
| `BreadcrumbList` | ✅ keep | valid | supported for breadcrumb display (confirm) | already on all inner pages |
| `BlogPosting`/`Article` | ✅ keep | valid | Article rich results are not guaranteed | author: use `Person` only with evidence; else `Organization` = the firm; reviewer only with proof |
| `FAQPage` (home) | ✅ keep, review | valid | Google announced in 2023 that FAQ rich results are limited to a narrow set of sites (not re-verified here) — **do not expect a FAQ rich result** | answers must match visible page text |
| `Place` (location) | ✅ keep | valid | none | coordinates must be labelled/centroid or verified |
| `Place` (project) | 🟡 fix | valid | none | needs project coordinates (S1) and a real address or none (S2) |
| `RealEstateListing` | 🟡 reconsider | valid type; **no dedicated Google rich result that I am aware of (confirm)** | unlikely | With no price, availability or unit data, each project page is a descriptive project page, not a listing. Prefer `WebPage` + `Place` + `BreadcrumbList` until unit-level, dated, developer-authorised data exists, then reintroduce a listing/offer node |
| `Offer`/`Product` | ❌ do not use | — | — | no price, no availability |
| `AggregateRating`/`Review` | ❌ do not use | — | would violate review-markup policies without genuine, visible, third-party-verifiable reviews | case-study ratings are static and unverified |
| `Person` (advisor) | ✅ keep nested under organization | valid | none | only verified facts (name, job title, registration number) |
| `LocalBusiness` subtype with `geo` | ⏸ hold | — | — | only once a real, eligible location exists (Phase 5 O1) |

## 4. Target architecture
1. **One typed builder module** (`src/lib/schema/…`) that returns nodes by entity (`organization()`, `website()`, `breadcrumbs()`, `article()`, `locationPlace()`, `projectPlace()`, `collectionPage()`), each with `@id` conventions from the Entity report; pages never hand-write JSON-LD.
2. **Layout defines Organization/WebSite once; pages emit only `@id` references to them** (the pattern already works).
3. Builders **refuse to output** unsupported claims: `offers`, `aggregateRating`, `review`, `geo` without a verified flag, `streetAddress` without a verified address.
4. Single hours/phone/URL constants shared by page copy and schema.
5. Validation in release governance: JSON-LD syntax, required properties, no duplicate `@id` definitions, no forbidden types, canonical/URL consistency, and a Rich Results Test spot-check list (manual).

## 5. Approvals
Schema changes alter public markup and require approval; S1/S2 are the most valuable and smallest to fix once coordinates/addresses are decided. No change was made.

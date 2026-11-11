# Phase 6 — Entity Architecture (6B) — design only

**Date:** 2026-11-11 · Nothing implemented. Principle: **one real-world thing = one entity = one identifier = one canonical URL**, and every property of an entity has exactly one source of truth. No awards, certifications, credentials, ownership or relationships are invented; where a relationship is unproven it is marked ⛔ and omitted from markup.

## 1. Entity model

| Entity | Real-world thing | Stable identifier (proposed) | Canonical URL | Source of truth |
|---|---|---|---|---|
| **Organization / RealEstateAgent** | The business "Ratiwal Dream Estates" | `https://www.ratiwaldreamestates.com/#organization` (✅ already used) | `/` | `siteConfig` (name, phone, email) + owner-confirmed legal/address facts (Phase 5 O1/O5) |
| **WebSite** | The site | `…/#website` (✅) | `/` | `siteConfig` |
| **Verified leadership profile** (advisor) | Suresh Kumawat (alias Suresh Ratiwal), registered agent | `…/#advisor` (✅ nested today under `founder`) | `/about` | `siteConfig.agent` + registry check (Phase 5: registry not yet verified) |
| **Location (city/market)** | Jaipur, Ajmer, Kishangarh, Bhiwadi, Navi Mumbai, Panvel | `…/locations/<slug>#place` (✅) | `/locations/<slug>` | `Location` collection (slug, name, state, coordinates) |
| **Micro-market** | e.g., Tonk Road & Vatika Sector | `…/locations/<city-slug>#<micro-slug>` (new; today only free text) | anchor within the location page (no separate page — avoids doorway pages) | `Location.microMarkets[]` |
| **Property project** | One RERA-registered project (e.g., Riyasat Paradise II) | `…/properties/<slug>#project` (proposed; today `#listing` + `#place` split) | `/properties/<slug>` | `Property` collection + RERA number |
| **Property listing/offer** | An *available, priced* unit offer — **none exists** (all "price on request", availability unverified) | none (do not mint) | — | would require `InventoryUnit` + developer-authorised price (Phase 5 P2/P3) |
| **Article** | One published guide | `…/insights/<slug>#article` (✅) | `/insights/<slug>` | `src/data/insights.ts` (→ CMS later) |
| **Author** | Named, verifiable human or the firm | `…/#advisor` only where the advisor genuinely authored; otherwise `Organization` | — | article data; reviewer needs proof (Phase 5 T3) |
| **Case study** | One consented engagement write-up | `…/testimonials/<slug>#article` (✅) | `/testimonials/<slug>` | static data (+ consent record, Phase 5 T1) |
| **Developer** (Riyasat Infra, Bhumija, Happy Real Earth) | Third-party developers | none today (text only) | — | `Property.developerOrOwnerName`; create entities only with documented relationship |

## 2. Relationships (target graph)

```
Organization ──founder/employee──► Person(advisor)            [only the verified, evidenced link]
Organization ──areaServed────────► Place(location) × evidenced markets only
WebSite ──publisher──────────────► Organization
Location(Place) ──containsPlace──► MicroMarket (anchors)
Property(project) ──containedInPlace► Location(Place)
Property(project) ──broker/seller?► Organization   ⛔ only if the advisor/developer authorisation exists
Location ──hasPart / ItemList────► Property(project) URLs
Article ──publisher──► Organization ;  author ──► Person(advisor) | Organization
Article ──about──► Location | Property (only where editorially true)
BreadcrumbList on every non-home page
```
Rules: references use `{ "@id": … }` only; each entity is **defined once per page** (verified today: no duplicate definitions); the organization is defined in the layout and referenced elsewhere.

## 3. Identity and duplicate prevention
- Slug is the project key (`Property.slug`, unique, lowercase). **RERA registration number is the real-world key** — add a uniqueness check (one project per RERA number) and a validator that flags two records with the same RERA number or the same developer + locality + similar name.
- One URL per entity: lowercase slugs only (V9: case variants currently return 200).
- Slug changes must create a 308 redirect and update `@id` (today no redirect is created automatically — to be verified).
- **Fallback entities must not exist:** `src/data/properties.ts` and `locations.ts` define six projects absent from the database (V5), including "Royal Palms Township", which a published case study names as a client's purchase. They conflict with the project rule "no hardcoded property arrays" and risk producing phantom entities. 💡 Remove the property fallback (or restrict it to development) after owner approval.

## 4. Source-of-truth field map
| Entity | Field | Source | Validation |
|---|---|---|---|
| Organization | name, phone, email, URL | `siteConfig` | E.164 phone; HTTPS www URL |
| Organization | address | **not published** — owner decision | emit `PostalAddress` only if verified; city-level locality is acceptable |
| Organization | opening hours | one owner-confirmed schedule | single constant consumed by page text and schema (currently three variants) |
| Organization | `sameAs` | real profile URLs | each URL reachable and owned |
| Advisor | RERA agent number | `siteConfig.agent.reraNo` | format check; registry link when verified |
| Location | coordinates | `Location.coordinates` (flag `isVerified`) | emit only when `isVerified` or clearly labelled as area centroid |
| Project | name, locality, type, developer, RERA no. | `Property` | RERA number matches official format; status/verified date present |
| Project | geo | **project coordinates** (new field) — not the city centroid | present only when surveyed/verified |
| Project | price/availability | none published | do not output `offers` until unit-level, dated, authorised data exists |
| Article | author/reviewer/dates/sources | article data | reviewer requires evidence flag |

## 5. Data-validation requirements (for a future validator script)
Unique slugs; unique RERA numbers; every published project has a published location; every published location has ≥ 1 verified fact source; no property or location slug in static fallback data absent from the database; coordinates in valid range and inside the stated state's rough bounds; `lastVerifiedAt` not older than a configured age; no `offers`/`aggregateRating`/`review` in markup unless backed by records.

## 6. Explicit non-claims
No awards, rankings, certifications, memberships, reviews or ratings are modelled. The advisor ↔ developer relationship, Maharashtra service area, and any legal-entity identifiers stay **out of the graph** until Phase 5 evidence is supplied.

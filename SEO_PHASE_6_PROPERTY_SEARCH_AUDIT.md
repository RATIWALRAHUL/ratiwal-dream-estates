# Phase 6 — Property Search Experience Audit (6D)

**Date:** 2026-11-11 · audit and design only; **no UI, route or data change.** Evidence: code review of `PropertiesFilterSection`, `HomeSearch`, `/api/properties`, plus E-probe. Usability on real devices and user behaviour were **not** measured (no analytics, no device testing in this phase).

## 1. What exists today
| Capability | Where | Behaviour |
|---|---|---|
| Free-text search | catalogue; home search | client-side substring match on project/location/city/description (debounced) |
| City filter | catalogue; home | single select from published cities |
| Property type filter | catalogue (+ counts) | residential/commercial plot |
| Status filter | catalogue | from `listingStatus` — **all nine are "Available"**, so it filters nothing today |
| Sorting | catalogue | featured / newest / name |
| Pagination | catalogue | 12 at a time, auto-load on scroll + button |
| Empty state & recovery | catalogue | `EmptyState` "No Plots Matching Your Criteria" + "Reset Search Filters" button |
| URL state | — | **none**: filters/sort are not in the URL, so views cannot be shared, bookmarked or restored with Back |
| Plot size filter | — | **absent**, although 67 plot-size options exist (150–4,709 sq ft) |
| Price filter | — | **absent** (and correctly so: every project is "price on request") |
| Locality / micro-market search | text only | matches `location` string, not micro-market entities |
| Accessibility | custom dropdowns | `role="listbox"`, `role="option"`, `aria-selected`, Escape to close |
| Public API | `/api/properties` (alias `/api/projects`) | `city`, `type`, `search`, `featured`, `page` (≥1), `limit` (≤50); in-memory filtering over the whole cached list |

## 2. Evaluation against the brief
| Item | Assessment |
|---|---|
| Search by project name | ✅ works (substring) |
| City and locality | 🟡 city exact; locality only via text |
| Residential / commercial | ✅ |
| Plot size | ❌ missing — likely the most useful real filter for plot buyers |
| Price | ⛔ not applicable until real prices exist |
| Availability | 🟡 control exists but unusable (no variation); real availability is not tracked at unit level |
| Sorting | ✅ basic; no "nearest/size" |
| Pagination | 🟡 fine at 9; JS-only beyond 12 (crawl note) |
| Empty states / no-result recovery | ✅ reset button; 💡 add suggestions ("try another city", link to location pages and a contact/WhatsApp request) |
| Mobile usability | not measured; custom dropdowns and auto-load scroll are the risk areas to test on real phones |
| Shareable results | ❌ no URL state |

## 3. Crawl-safe filtering rules (design)

**Principle:** filters are a *user tool*, not an SEO surface. Indexable pages are the ones with unique, curated content (home, catalogue, 6 locations, project pages, guides).

| URL pattern | Indexable? | Canonical | Robots | Linked in HTML? |
|---|---|---|---|---|
| `/properties` | ✅ yes | self | index, follow | yes |
| `/properties?city=…&type=…&size=…&sort=…&q=…` (if URL state is added) | ❌ no | `/properties` | `noindex, follow` (meta) | links produced by JS only; **no `<a href>` to filter URLs in server HTML** |
| `?page=N` | ❌ no | `/properties` (or self if paginated server-side later) | noindex, follow | — |
| Any unrecognised parameter | ❌ ignored | `/properties` | as route default | — |
| `/locations/<city>` | ✅ yes | self | index | yes — the *curated* "filter by city" pages |
| Auto-generated "plots in <locality>/<size>" pages | ❌ **never** | — | — | — (doorway risk; Google spam policy) |
| `/api/*` JSON | ❌ | — | disallowed in robots (+ optional `X-Robots-Tag`) | no |

Additional rules: parameter whitelist with value allow-lists (cities/types derive from published data, size from fixed buckets); cap length of `q` (e.g., 80); never reflect raw input into HTML; sort/filter state restoring must not trigger extra data requests; no infinite combinations because filters are single-select or bounded multi-select, and filter URLs are `noindex` with a clean canonical (belt and braces — the current canonical behaviour already collapses all parameters).

## 4. Proposed improvements (all need approval; keep the current design language)
| # | Improvement | Benefit | Effort | Risk |
|---|---|---|---|---|
| D1 | Sync filters to the URL (`useSearchParams`/`router.replace`, shallow) with whitelist + `noindex` handling | shareable/bookmarkable results, working Back button | 1 day | low; must keep canonical/robots as above |
| D2 | Add a **plot-size bucket** filter from `PlotOption` (e.g., ≤ 1,000 / 1,000–2,000 / > 2,000 sq ft, also shown in sq yd per project rules) | answers a real buyer question without exposing individual plots | 1–2 days | low; shows size availability only if data is accurate (Phase 5 P3) |
| D3 | Hide the status filter while all items share one status | removes a no-op control | 1 h | none |
| D4 | Locality/micro-market in search (index micro-market names) | better "Tonk Road"/"Gagwana" discovery | 0.5 day | none |
| D5 | Improved empty state: suggestions + links to location pages + inquiry CTA | recovers zero-result visits | 0.5 day | none |
| D6 | Server-side first page + cursor/`page` API pagination (see Performance report) for >50 properties | scalability; crawlable pagination | 2–3 days | medium |
| D7 | Real-device mobile testing of dropdowns/scroll | usability evidence | 0.5 day | none |
Not recommended now: price filters (no real prices), "availability" filters (no unit-level data), faceted landing pages.

## 5. Measurement (once analytics exist)
Search usage rate, zero-result rate, filter-use → project-view → inquiry funnel, and mobile vs desktop split — all require the GA4 events in the Phase 7 specification; **no baseline exists today**.

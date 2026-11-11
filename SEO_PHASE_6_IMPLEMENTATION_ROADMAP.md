# Phase 6 — Implementation Roadmap & Approval Gates

**Date:** 2026-11-11 · plan only; **nothing is approved or started.** Effort = working-day estimates. Stage gates follow the brief: 6A audit ✅ done · 6B entity · 6C structured data · 6D search experience · 6E release governance.

## 0. Pre-deploy note
Production runs the earlier build. The loading-boundary removal and heading fixes (this tree, uncommitted) have **not** been deployed; commit/deploy of those is a separate owner decision and is a prerequisite for several "verified on the build" statements to hold in production.

## 1. Prioritised backlog

### P0 — Correctness defects in the publishing and agent paths
| # | Item (finding) | Change | Effort | Risk | Needs |
|---|---|---|---|---|---|
| R1 | **V1** new/changed/unpublished pages and sitemap | `dynamicParams=true` (+ `notFound()` already present) **or** on-demand `revalidatePath` from publish/unpublish/archive/slug-change; sitemap `revalidate`; redirect on slug change | 2 days | medium (cache behaviour — test on staging) | approval + staging DB |
| R2 | **V2** silent empty static params | make `generateStaticParams` throw/ fail the build when the database is unreachable | 0.5 day | low | approval |
| R3 | **V5** phantom fallback entities | remove property/location static fallbacks from sitemap, llms and markdown paths (or dev-only); fail instead of listing fake slugs | 1 day | low–medium (what to show when DB is down?) | approval; owner decision on outage behaviour |
| R4 | **V3** markdown negotiation returns homepage | fix the rewrite/`path` hand-off; add a test | 0.5 day | low | approval |

### P1 — Protection and data accuracy
| # | Item | Effort | Needs |
|---|---|---|---|
| R5 | **Release governance suite** (G1–G20, `seo:verify`) | 3–4 days | approval (adds scripts only) |
| R6 | **S1/S2** project `Place` geo + address: add project coordinates field or omit geo; stop using the city centroid and locality-as-street | 1 day + data entry | owner supplies coordinates/decides |
| R7 | **S4/S5** hours/areaServed alignment (shared constants) | 0.5 day | Phase 5 owner answers |
| R8 | **V7** internal links: hubs ↔ Kishangarh/Panvel, guides, case studies | 1 day | content approval |
| R9 | Slug rules: lowercase-only matching (V9) | 0.5 day | approval |

### P2 — Entity/schema consolidation (6B/6C)
| # | Item | Effort |
|---|---|---|
| R10 | Typed schema builder module; remove hand-written page graphs; forbidden-claims guard; consistent logo/ids | 2–3 days |
| R11 | Entity validator (unique RERA/slug, no fallback-only slugs, verified-coordinate flag) wired into `seo:verify` | 1 day |
| R12 | Decide `RealEstateListing` vs `WebPage`+`Place` for projects (Schema report §3) | 0.5 day + decision |

### P3 — Search experience & scale (6D)
| # | Item | Effort |
|---|---|---|
| R13 | URL-synced filters + plot-size bucket filter + empty-state recovery (D1–D5) | 3–4 days |
| R14 | Server-side first page + API pagination + API input validation (P1–P3, P5–P6) | 3–4 days |
| R15 | Real-device mobile testing of the catalogue | 0.5 day |
| R16 | AI-crawler robots policy decision (V12) | 0.5 h + decision |
| R17 | `X-Robots-Tag: noindex` on public JSON APIs; remove ObjectIds from DTOs | 0.5 day |

## 2. Dependencies
Owner decisions: outage behaviour (R3), AI-crawler policy (R16), project coordinates/addresses (R6), hours/service area (R7, Phase 5 O1–O6), whether to add CI (R5). Technical: a **staging database** for R1/G17 so publishing tests never touch production; Search Console (Phase 4A) and GA4 (Phase 7) for measuring any effect.

## 3. Risks
| Risk | Mitigation |
|---|---|
| R1 changes caching semantics | implement behind staging tests (G17); keep the old behaviour as the rollback |
| Removing fallbacks makes an outage visible | define outage behaviour first; prefer "serve last good build" over fake data |
| Schema changes lose existing (valid) markup | snapshot before/after (G20); no change to ids already indexed |
| Filter URL state creates crawlable duplicates | whitelist + `noindex` + canonical (Search Audit §3) |
| Governance suite is flaky | deterministic, read-only checks, budgeted requests |

## 4. Explicit approval requirements
Every item above needs approval before implementation: route/ISR changes (R1, R2), data-layer changes (R3, R14), middleware/API fix (R4), new scripts (R5, R11), schema/data changes (R6, R7, R10, R12), content/link edits (R8), UI changes (R13), crawler policy (R16). **Phase 7 has its own gates.**

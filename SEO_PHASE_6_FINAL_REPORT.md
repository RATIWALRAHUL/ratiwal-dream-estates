# Phase 6 — Final Report: Enterprise SEO Architecture & Search Experience

**Date:** 2026-11-11 · **Scope delivered:** discovery, architecture audit and design for 6A–6E. **No code, route, schema, data or configuration was changed.** Phase 7 was started as a *separate* audit/discovery task at the user's explicit request; this phase does not implement anything.

## 1. Current architecture (summary)
Next.js 16 App Router; public marketing pages are static or ISR (60–120 s), project/location detail pages are ISR with `dynamicParams=false` (9 + 6 prerendered), guides/case studies are static data; MongoDB behind a cached data layer; private areas are auth-gated, `noindex` and robots-disallowed; sitemap/robots are static build artefacts. Diagram and route table: Architecture Audit §1.

## 2. Verified technical issues (ranked)
| ID | Severity | Issue |
|---|---|---|
| V1 | **High** | New/renamed/unpublished projects and locations are not handled without a redeploy (`fallback:false` + no on-demand revalidation + frozen sitemap) |
| V2 | **High** | A database outage at build time yields zero property/location pages and a *successful* build |
| V3 | High | `Accept: text/markdown` returns the homepage markdown for every page |
| S1/S2 | High | Project schema geo = city centroid (+ hard-coded default); `streetAddress` = locality name |
| V5 | Medium | Static fallback defines six non-existent projects (incl. "Royal Palms Township") |
| V4 | Medium | Sitemap frozen; static-page `lastmod` = build time |
| V7 | Medium | Single-inbound pages: Kishangarh, Panvel, 4 case studies, 2 legal guides |
| V8 | Medium | Catalogue payload grows ≈ 2.2 KB/project; API unbounded `search` + cache key |
| S4/S5 | Medium | Hours (7 vs 6 days) and unproven service areas in schema |
| V9–V11, S6–S8 | Low | case-variant 200, `Vary: Accept` gap, ObjectIds in DTOs/HTML, logo/author inconsistencies |
| V12 | Policy | robots comment vs AI-crawler rules |
| V13 | Info | no CI / no pre-deploy SEO gate |
**Healthy and verified:** 39/39 URLs 200; canonical, robots, OG/Twitter and metadata lengths correct everywhere; no duplicate titles; valid JSON-LD with no duplicate definitions and no fabricated reviews/ratings/prices; no redirect chains; parameters collapse to clean canonicals; private routes protected; no unpublished record exposed (the one DRAFT location is hidden everywhere).

## 3. Recommended target architecture
On-demand, publish-aware ISR with an up-to-date sitemap and no fallback entities; one typed schema builder emitting only supportable claims; one entity per real-world project keyed by RERA number; server-paginated catalogue with URL-synced, `noindex`-safe filters; an SEO verification suite run before each deploy. Entity design → Entity report; markup → Schema report; filtering → Search Audit; policy → Indexation Strategy; scale → Performance report; gates → Release Governance.

## 4. Acceptance checklist (brief §12)
| Required | Where |
|---|---|
| Current architecture | Architecture Audit |
| Identified weaknesses / verified issues | §2 above; Crawl & Rendering Audit |
| Target architecture | §3; reports 3–7 |
| Entity relationship design | Entity Architecture |
| Structured data strategy | Schema Architecture |
| Search experience improvements | Property Search Audit |
| Crawl and indexation policy | Indexation Strategy |
| Performance recommendations | Performance & Scalability |
| Automated regression testing plan | Release Governance (G1–G20) |
| Prioritised roadmap, risks, approvals | Implementation Roadmap |

## 5. What was not verified
V1/V2 were established from code and Next build manifests, **not reproduced** by publishing a record or breaking the database (both would touch real data); production behaviour after the next deploy; Google's actual crawl/index status and rich-result eligibility (no Search Console; Google's current feature support was not re-fetched); Core Web Vitals; real-device behaviour of the filter UI; load/scale behaviour (analysed from code and measured payload sizes only).

## 6. Approvals needed
All of R1–R17 in the roadmap. Recommended first approvals: **R5 (verification suite)**, **R1/R2 (publish-flow correctness)**, **R4 (markdown fix)** — in that order, because the suite protects the rest.

## 7. Boundaries respected
No new public routes, redesign, content edits, schema refactor, cache-rule change or database migration. Temporary probe scripts lived outside the repository (scratch directory). Phase 7 findings are in separate reports.

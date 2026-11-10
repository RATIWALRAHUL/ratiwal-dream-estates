# Ratiwal Dream Estates — 90-Day SEO Execution Roadmap

**Target Market:** Jaipur & Rajasthan Real Estate  
**Target Domain:** `https://www.ratiwaldreamestates.com/`  
**Auditor:** Senior Technical SEO Architect & Real Estate SEO Consultant  
**Date:** November 2026  

---

## 1. Roadmap Overview & Timeline

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│ PHASE 1: Days 1–30 | Technical Foundation & Indexing Corrections (CRITICAL)     │
│ - Canonical domain fix (www vs non-www loop)                                     │
│ - Robots.txt unblocking /_next/ & prefix rules                                    │
│ - XML sitemap rebuild with 200 OK canonicals                                     │
│ - Remove force-dynamic from homepage to enable Edge caching                      │
│ - Fix private auth page canonicals & eliminate broken property slugs             │
└────────────────────────────────────────┬─────────────────────────────────────────┘
                                         │
┌────────────────────────────────────────▼─────────────────────────────────────────┐
│ PHASE 2: Days 31–60 | On-Page SEO, Schemas & Category Architecture               │
│ - Homepage & catalog H1 keyword realignment                                      │
│ - Consolidate duplicate schemas (JsonLd.tsx vs schema.ts)                        │
│ - Inject Person (Suresh Kumawat) and Homepage FAQPage structured data            │
│ - Fix nested <main> tag and prune unused web fonts                               │
│ - Launch /properties/residential-plots and /properties/commercial-plots          │
└────────────────────────────────────────┬─────────────────────────────────────────┘
                                         │
┌────────────────────────────────────────▼─────────────────────────────────────────┐
│ PHASE 3: Days 61–90 | Local SEO, High-Velocity Corridors & Content Pillar        │
│ - Full Google Business Profile (GBP) synchronization (NAP consistency)          │
│ - Publish Jaipur corridor landing pages (Ajmer Road, Ring Road, Vatika)         │
│ - Publish JDA Due Diligence pillar guide (How to verify JDA plots)               │
│ - Optimize large public images (<250KB WebP) & clean duplicate assets            │
│ - Establish internal linking bridges from blog guides to live townships          │
└──────────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Phase 1: Days 1–30 — Technical Foundation & Indexing Fixes

*Goal: Ensure Googlebot crawls, renders, and indexes canonical 200 OK pages with zero redirect loops or blocked assets.*

| Task ID | Task Description | Target File / Route | Dependency | Estimated Effort | Verification Method | Priority |
| :---: | :--- | :--- | :--- | :---: | :--- | :---: |
| **T-1.1** | Set canonical domain strictly to `https://www.ratiwaldreamestates.com` | `src/config/site.ts:9` | None | 0.5 hrs | `curl -s https://www.ratiwaldreamestates.com/ \| grep canonical` | **CRITICAL** |
| **T-1.2** | Remove `"/_next/"` from `PRIVATE_DISALLOWED_PATHS` in robots.txt | `src/app/robots.ts:27` | None | 0.25 hrs | `curl -s https://www.ratiwaldreamestates.com/robots.txt` | **CRITICAL** |
| **T-1.3** | Remove trailing slash from robots disallow paths (`/dashboard`, `/portal`) | `src/app/robots.ts:18-33` | None | 0.25 hrs | Test with GSC Robots Testing Tool | **HIGH** |
| **T-1.4** | Validate dynamic XML sitemap outputs strictly 200 OK WWW canonical URLs | `src/app/sitemap.ts:12` | T-1.1 | 0.5 hrs | `curl -s https://www.ratiwaldreamestates.com/sitemap.xml \| grep '<loc>'` | **CRITICAL** |
| **T-1.5** | Remove `force-dynamic` & property shuffling from homepage; set `revalidate = 300` | `src/app/(marketing)/page.tsx:16, 43-48` | None | 1 hr | `curl -I https://www.ratiwaldreamestates.com/` (Verify `X-Vercel-Cache: HIT`) | **HIGH** |
| **T-1.6** | Fix private auth page canonicals: omit cross-page homepage canonicals on `noIndex` | `src/lib/seo.ts:15, 24-25` | None | 1 hr | `curl -s https://www.ratiwaldreamestates.com/portal/login \| grep canonical` | **HIGH** |
| **T-1.7** | Replace broken mock slugs (`royal-palms`, `ring-road-logistics`) with live DB slugs | `src/data/locations.ts`, `src/data/testimonials.ts` | None | 1.5 hrs | Run `npx tsx scripts/audit-orphans.ts` (0 broken links) | **HIGH** |
| **T-1.8** | Submit refreshed `sitemap.xml` in Google Search Console & request priority re-crawl | GSC Portal | T-1.1, T-1.4 | 0.5 hrs | GSC Indexing Report | **CRITICAL** |

---

## 3. Phase 2: Days 31–60 — On-Page SEO, Schemas & Category Architecture

*Goal: Optimize search intent signals, consolidate structured data, and launch dedicated property category routing.*

| Task ID | Task Description | Target File / Route | Dependency | Estimated Effort | Verification Method | Priority |
| :---: | :--- | :--- | :--- | :---: | :--- | :---: |
| **T-2.1** | Realign Homepage H1 to include *"Real Estate Consultant & Verified Plots in Jaipur"* | `src/components/home/HeroSlider.tsx:198-205` | None | 1 hr | Inspect rendered DOM `<h1>` | **HIGH** |
| **T-2.2** | Realign Properties Catalog H1 to *"Residential & Commercial Plots for Sale in Jaipur"* | `src/components/sections/properties/PropertiesHero.tsx:43-52` | None | 0.5 hrs | Inspect rendered DOM `<h1>` | **HIGH** |
| **T-2.3** | Consolidate duplicate schemas: deprecate `src/lib/schema.ts` in favor of `JsonLd.tsx` | `src/components/seo/JsonLd.tsx`, `src/lib/schema.ts` | None | 3 hrs | Google Rich Results Test (Zero schema errors) | **MEDIUM** |
| **T-2.4** | Inject `Person` schema for Suresh Kumawat (`RAJ/A/2019/983`) on About and Home | `src/components/seo/JsonLd.tsx`, `src/app/(marketing)/about/page.tsx` | T-2.3 | 1 hr | Schema.org validator for `Person` entity | **MEDIUM** |
| **T-2.5** | Inject `FAQPage` schema on Homepage using 6 existing real estate FAQ items | `src/app/(marketing)/page.tsx` | T-2.3 | 0.5 hrs | Google Rich Results Test for FAQ items | **MEDIUM** |
| **T-2.6** | Fix nested `<main id="main-content">` tag on `/why-choose-us` | `src/app/(marketing)/why-choose-us/page.tsx:60` | None | 0.25 hrs | W3C HTML Validator (0 duplicate main errors) | **MEDIUM** |
| **T-2.7** | Prune unused Google web fonts in `RootLayout`; retain body & heading fonts only | `src/app/layout.tsx:2, 8-49` | None | 1.5 hrs | Lighthouse Performance Audit (<2 preloaded fonts) | **MEDIUM** |
| **T-2.8** | Launch `/properties/residential-plots` category page with pre-filtered inventory | New: `src/app/(marketing)/properties/residential-plots/page.tsx` | None | 4 hrs | Verify 200 OK & inclusion in sitemap | **HIGH** |
| **T-2.9** | Launch `/properties/commercial-plots` category page for highway & logistics land | New: `src/app/(marketing)/properties/commercial-plots/page.tsx` | None | 3 hrs | Verify 200 OK & inclusion in sitemap | **HIGH** |

---

## 4. Phase 3: Days 61–90 — Local SEO, Corridor Authority & Content Acceleration

*Goal: Establish Jaipur Local Pack dominance, launch micro-market corridor pages, and publish pillar legal guides.*

| Task ID | Task Description | Target File / Route | Dependency | Estimated Effort | Verification Method | Priority |
| :---: | :--- | :--- | :--- | :---: | :--- | :---: |
| **T-3.1** | Standardize unified physical address and PIN code across site, footer, and schema | `src/config/site.ts`, `JsonLd.tsx`, `ContactOffices.tsx` | None | 1 hr | Cross-check NAP with GBP listing | **MEDIUM** |
| **T-3.2** | Synchronize Google Business Profile: verify business category (*"Real estate consultant"*), hours, and photos | Google Business Profile | T-3.1 | 2 hrs | GBP Verification Dashboard | **HIGH** |
| **T-3.3** | Publish Ajmer Road Corridor Guide (`/locations/jaipur/ajmer-road`) | New: `src/app/(marketing)/locations/jaipur/ajmer-road/page.tsx` | None | 4 hrs | GSC Index Inspection | **HIGH** |
| **T-3.4** | Publish Jaipur Ring Road Corridor Guide (`/locations/jaipur/ring-road`) | New: `src/app/(marketing)/locations/jaipur/ring-road/page.tsx` | None | 4 hrs | GSC Index Inspection | **HIGH** |
| **T-3.5** | Publish Pillar Guide: *"How to Verify a JDA-Approved Plot in Jaipur (90A & Patta)"* | New: `src/app/(marketing)/insights/verify-jda-approved-plots-jaipur/page.tsx` | None | 5 hrs | Google Rich Results Test (Article + HowTo) | **HIGH** |
| **T-3.6** | Compress static images in `public/images/` to WebP/AVIF (<250KB); delete duplicate hero slides | `public/images/*` | None | 2 hrs | File size inspection (`ls public/images/`) | **MEDIUM** |
| **T-3.7** | Implement contextual internal linking: link articles to relevant townships and corridors | `src/data/insights.ts` | T-3.3, T-3.4 | 1.5 hrs | Internal link crawl analysis | **MEDIUM** |
| **T-3.8** | Full 90-Day Technical & Ranking Post-Audit: review indexation, Core Web Vitals, and queries | All public pages | All tasks | 3 hrs | Comprehensive GSC & Core Web Vitals report | **HIGH** |

---

## 5. Implementation Effort & Resource Allocation

| Phase | Developer Hours | SEO Architect / Content Hours | Total Estimated Hours |
| :--- | :---: | :---: | :---: |
| **Phase 1 (Days 1–30): Technical Foundations** | 6.0 hrs | 2.5 hrs | **8.5 hrs** |
| **Phase 2 (Days 31–60): On-Page, Schemas & Categories** | 12.0 hrs | 4.0 hrs | **16.0 hrs** |
| **Phase 3 (Days 61–90): Local SEO, Corridors & Guides** | 14.5 hrs | 8.0 hrs | **22.5 hrs** |
| **Total Project Implementation Effort** | **32.5 hrs** | **14.5 hrs** | **47.0 hrs** |

*Note: All changes can be implemented within standard Next.js 16 conventions with ZERO disruption to existing booking, lead generation, customer portal, or database operations.*


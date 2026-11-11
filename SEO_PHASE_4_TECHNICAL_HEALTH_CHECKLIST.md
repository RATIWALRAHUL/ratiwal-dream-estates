# Ratiwal Dream Estates — Phase 4 Technical Health Checklist

**Website:** https://www.ratiwaldreamestates.com/  
**Framework:** Next.js 16 App Router  
**Scope:** Recurring Auditing Protocols (Weekly, Monthly, Quarterly)  
**Date:** November 2026

---

## 1. Objective & Non-Interference Rule

> [!NOTE]
> **Governance Rule:** Never modify existing technical SEO configurations, headers, rewrites, or database schema mappings without an identified, reproducible defect. All recurring checks are diagnostic audits designed to preserve Phase 1, Phase 2, and Phase 3 improvements.

---

## 2. Weekly Health Check Protocol (Estimated Time: 15 Minutes)

Run or inspect the following items weekly:

### 1. HTTP Status & Soft 404 Audit
- [ ] **All 39 Public URLs:** Execute automated HTTP scan; confirm all return `HTTP 200 OK`.
- [ ] **Dynamic 404 Boundaries:** Verify that random nonexistent paths for all four dynamic routes return genuine `HTTP 404 Not Found`:
  - `/properties/test-nonexistent-slug` -> 404
  - `/locations/test-nonexistent-slug` -> 404
  - `/insights/test-nonexistent-slug` -> 404
  - `/testimonials/test-nonexistent-slug` -> 404
- [ ] **Soft 404 Verification:** Confirm that 404 responses do not omit `noindex` or render 200 status templates.

### 2. Canonical and Domain Alignment
- [ ] **Canonical Self-Declaration:** Confirm every public URL declares an exact self-referencing canonical on `https://www.ratiwaldreamestates.com/*`.
- [ ] **Host Redirect:** Confirm `http://ratiwaldreamestates.com`, `https://ratiwaldreamestates.com`, and `http://www.ratiwaldreamestates.com` 301-redirect directly to `https://www.ratiwaldreamestates.com` with zero redirect loops.

### 3. XML Sitemap Status
- [ ] **Sitemap Accessibility:** Fetch `https://www.ratiwaldreamestates.com/sitemap.xml`; confirm response is `200 OK` with valid XML headers.
- [ ] **URL Count:** Confirm total entries match the active inventory and content count (currently 39 URLs).
- [ ] **GSC Status:** Verify Search Console reports sitemap status as "Success" with 0 errors.

### 4. Robots.txt Validation
- [ ] **Robots Endpoint:** Fetch `https://www.ratiwaldreamestates.com/robots.txt`.
- [ ] **Rules Check:** Confirm `Disallow: /_next/` remains absent and valid sitemap directive points to `https://www.ratiwaldreamestates.com/sitemap.xml`.

---

## 3. Monthly Health Check Protocol (Estimated Time: 45 Minutes)

Execute at the end of each monthly reporting cycle:

### 5. Title & Meta Description Audit
- [ ] **Character Limits:** Run `scripts/test-seo-metadata.ts` to ensure all titles remain ≤ 60 characters and descriptions ≤ 160 characters.
- [ ] **Spelling & Whitespace:** Confirm no double spaces, stray single characters, or trailing punctuation defects exist.
- [ ] **Dynamic Title Integrity:** Verify newly added properties or locations inherit well-formed titles via `catalogCopy()`.

### 6. Structured Data & Schema Validation
- [ ] **Schema Rich Results Test:** Validate key templates against Google's Rich Results Testing Tool:
  - Homepage: `RealEstateAgent` + `WebSite` + `FAQPage`
  - Property Detail: `ItemPage` / `RealEstateListing` + `BreadcrumbList`
  - Location Hub: `Place` / `AdministrativeArea` + `BreadcrumbList`
  - Insight Guide: `Article` + `BreadcrumbList`
- [ ] **Zero Unresolved Errors:** Ensure zero missing required fields (e.g., author, publisher, datePublished).

### 7. Core Web Vitals & Asset Optimization
- [ ] **Font Preload Concurrency:** Confirm only 3 primary fonts (`jakarta`, `instrument`, `fraunces`) are preloaded in `src/app/layout.tsx`.
- [ ] **Social Media Assets:** Verify `https://www.ratiwaldreamestates.com/images/brand/og-image.jpg` remains 1200×630 and < 100 KB.
- [ ] **Image Compression:** Ensure any newly uploaded property photography via ImageKit is compressed and served with modern `image/webp` or `image/avif` headers.

---

## 4. Quarterly Health Check Protocol (Estimated Time: 2 Hours)

Execute at the end of each calendar quarter:

### 8. Micro-Market & Database Synchronization
- [ ] **MongoDB Cluster State:** Verify active connection pooling and index health on MongoDB Atlas collections (`properties`, `locations`, `leads`).
- [ ] **Static Fallback Parity:** Check that static fallback objects in `src/data/` remain synchronized with MongoDB production records.
- [ ] **Micro-Market Cross-Referencing:** Confirm all active properties are accurately mapped to their parent location micro-market records.

### 9. Mobile Usability & Accessibility (a11y)
- [ ] **Viewport & Tap Targets:** Verify all interactive buttons, filter tabs, and WhatsApp pills maintain minimum 48×48px tap zones.
- [ ] **Contrast Ratios:** Confirm text contrast across primary midnight blue (`#031C2B`), brand blue (`#087fc3`), and white surfaces adheres to WCAG AA guidelines.

---

## 5. Automated Verification Script Reference

The repository maintains an automated CLI test script to execute the technical health checklist programmatically:

```bash
# 1. Run SEO Metadata & Schema Unit Tests
npx tsx scripts/test-seo-metadata.ts

# 2. Run TypeScript Compilation Guard
npx tsc --noEmit

# 3. Test Live Route Responses & Canonical Headers
npx tsx scripts/verify-live-deployment.ts
```


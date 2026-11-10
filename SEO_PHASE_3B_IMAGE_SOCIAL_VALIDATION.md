# Phase 3B — Image, Media & Social Share Live Production Audit

**Project:** Ratiwal Dream Estates  
**Target Domain:** `https://www.ratiwaldreamestates.com/`  
**Audit Date:** November 7, 2026  
**Auditor:** Senior Technical SEO Auditor & Next.js Production Engineer  
**Status:** Audit & Measurement Only (No Source Code / Live Changes)

---

## Executive Summary

Visual media and social metadata directly govern page load performance (Largest Contentful Paint / LCP), mobile data consumption, and click-through rates (CTR) when content is shared across social channels, WhatsApp, LinkedIn, and messaging platforms.

In Phase 1 and Phase 2, critical media issues were identified, including:
1. An oversized, square OpenGraph fallback image (`og-image.jpg`).
2. Legacy `summary` Twitter card metadata instead of rich `summary_large_image`.
3. Eight (8) uncompressed 8K/4K project and portrait images exceeding 1 MB in size.
4. Redundant, high-byte duplicate hero slides (`slide-1.jpg`, `slide-2.jpg`).

In Phase 3A, complete local optimizations were implemented (lossless WebP/PNG compression below 1 MB, 1200×630 OG image generation, Twitter card updates, and slide deduplication). 

This Phase 3B audit independently measured the **live production assets** served by Vercel CDN at `https://www.ratiwaldreamestates.com/`.

### Key Findings
1. **Live OpenGraph Image is 1024×1024 and 695.4 KB:** The live production website is still serving the legacy square image. When shared on Facebook, LinkedIn, or Twitter, the image is cropped into an awkward square or displays pillarboxes instead of a standard 1.91:1 horizontal landscape banner.
2. **Twitter Card Remains `summary` Site-Wide:** All 41 audited live URLs output `<meta name="twitter:card" content="summary" />` instead of `summary_large_image`.
3. **All 8 Heavy Images (>1 MB) Remain Active on Live Production:** The live Vercel deployment continues to serve uncompressed 1.2 MB to 1.6 MB raw assets, degrading Core Web Vitals (LCP) for mobile visitors.
4. **Deleted Duplicate Hero Slides Remain Publicly Accessible:** `public/images/hero/slide-1.jpg` (794 KB) and `slide-2.jpg` (892 KB) continue to respond with HTTP 200 OK on production.
5. **Root Cause:** All image optimizations and metadata updates exist in local uncommitted workspace files. Because no production deployment has occurred since Phase 1, the live CDN continues to serve the October 2026 asset bundle.

---

## 1. Live OpenGraph (OG) & Social Card Audit

The default OpenGraph image was downloaded directly from `https://www.ratiwaldreamestates.com/images/brand/og-image.jpg` and analyzed for dimensions, file size, and visual aspect ratio.

### Empirical Measurement: Live vs Approved Specification

| Metric | Target / Best Practice | Local Implementation (Phase 3A) | Live Production Measurement | Status |
|---|---|---|---|:---:|
| **URL** | `.../images/brand/og-image.jpg` | `.../images/brand/og-image.jpg` | `https://www.ratiwaldreamestates.com/images/brand/og-image.jpg` | **PASS (Path Match)** |
| **HTTP Status** | `200 OK` | `200 OK` | `200 OK` | **PASS** |
| **File Size** | `< 200 KB` (Target < 100 KB) | **57.8 KB** (57,824 bytes) | **695.4 KB** (712,058 bytes) | **FAIL (12x Oversized)** |
| **Width** | 1200 px | 1200 px | **1024 px** | **FAIL** |
| **Height** | 630 px | 630 px | **1024 px** | **FAIL** |
| **Aspect Ratio** | 1.91:1 (Landscape) | 1.905:1 (Landscape) | **1:1 (Square)** | **FAIL (Non-standard)** |
| **Color Space** | sRGB | sRGB | sRGB | **PASS** |
| **Twitter Card** | `summary_large_image` | `summary_large_image` | `<meta name="twitter:card" content="summary" />` | **FAIL (Legacy Card)** |

### Live Social Sharing Impact
- **Facebook / WhatsApp / LinkedIn:** When the homepage or any public page is shared, platforms expecting 1200×630 open graph previews either display a small thumbnail next to the description or center-crop the 1024×1024 square image, cutting off branding and typography.
- **Twitter / X:** Because the card type is hardcoded to `summary`, tweets render as tiny thumbnail cards rather than full-width rich preview cards, severely depressing organic social CTR.

---

## 2. Heavy Media Assets Audit (> 1 MB)

During Phase 1, eight media assets were identified as severe performance bottlenecks, each exceeding 1 MB and consuming significant bandwidth during initial page rendering.

### Live Production Measurement Matrix

| Asset Path (under `/images/...`) | Live Production Size | Local Optimized Size | Net Savings Awaiting Deploy | Live Resolution | Status on Live Production |
|---|:---:|:---:|:---:|:---:|:---:|
| `properties/happy-business-park-site.webp` | **1,607.8 KB** (1.57 MB) | 929.3 KB | -678.5 KB (-42.2%) | 7680 × 4320 (8K) | **FAIL (Exceeds 1 MB)** |
| `properties/happy-business-park-layout.webp` | **1,523.9 KB** (1.48 MB) | 888.7 KB | -635.2 KB (-41.7%) | 7680 × 4320 (8K) | **FAIL (Exceeds 1 MB)** |
| `properties/happy-business-park-hero.webp` | **1,523.9 KB** (1.48 MB) | 888.7 KB | -635.2 KB (-41.7%) | 7680 × 4320 (8K) | **FAIL (Exceeds 1 MB)** |
| `properties/vrindavan-viihaar-hero.webp` | **1,259.4 KB** (1.23 MB) | 804.1 KB | -455.3 KB (-36.2%) | 3840 × 2160 (4K) | **FAIL (Exceeds 1 MB)** |
| `team/suresh-kumawat-cutout.png` | **1,241.5 KB** (1.21 MB) | 245.5 KB | -996.0 KB (-80.2%) | 1200 × 1600 (Alpha) | **FAIL (Exceeds 1 MB)** |
| `brand/advisor-portrait.png` | **1,230.5 KB** (1.20 MB) | 320.6 KB | -909.9 KB (-73.9%) | 1200 × 1600 (Alpha) | **FAIL (Exceeds 1 MB)** |
| `properties/happy-business-park-overview.webp` | **1,211.5 KB** (1.18 MB) | 984.1 KB | -227.4 KB (-18.8%) | 7680 × 4320 (8K) | **FAIL (Exceeds 1 MB)** |
| `about/leadership-ethos.jpg` | **1,127.8 KB** (1.10 MB) | 247.1 KB | -880.7 KB (-78.1%) | 1200 × 896 | **FAIL (Exceeds 1 MB)** |
| **Total Media Weight** | **10,726.3 KB (10.47 MB)** | **5,308.1 KB (5.18 MB)** | **-5,418.2 KB (-50.5%)** | — | **8 / 8 FAIL** |

### Live Impact on Core Web Vitals (LCP)
- The high-resolution project images on `/properties/happy-business-park` and `/properties/vrindavan-viihaar` directly trigger high Largest Contentful Paint (LCP) delays on mobile networks.
- Over 5.4 MB of unnecessary payload is currently being downloaded by real users across these pages on production.

---

## 3. Redundant Asset Deletion Verification

In Phase 1 and Phase 2, four redundant hero slides were identified as exact duplicates of other project imagery:
- `public/images/hero/slide-1.jpg` (794 KB)
- `public/images/hero/slide-2.jpg` (892 KB)

In local git, these files were removed from the workspace to eliminate dead repository weight and avoid duplicate crawler hits.

### Live Production Empirical Test
```bash
curl -I https://www.ratiwaldreamestates.com/images/hero/slide-1.jpg
# HTTP/2 200 
# content-type: image/jpeg
# content-length: 813158
# x-vercel-cache: HIT

curl -I https://www.ratiwaldreamestates.com/images/hero/slide-2.jpg
# HTTP/2 200 
# content-type: image/jpeg
# content-length: 913408
# x-vercel-cache: HIT
```
- **Audit Result:** Both deleted slides remain live and cache-hit on the Vercel production CDN. They continue to consume edge storage and represent an undeployed repository state.

---

## 4. Next.js Image Optimization & Crawler Asset Access

An essential consideration for search engines and modern performance is how images are served:
1. **Next.js Image Component (`next/image`):**
   - The application utilizes Next.js `<Image />` tags to generate responsive srcset definitions.
   - However, because the live production `robots.txt` explicitly specifies:
     ```
     User-agent: *
     Disallow: /_next/
     ```
     Googlebot and other search crawlers are forbidden from indexing URLs generated under `/_next/image?url=...`.
   - While search engines can still parse image URLs if fallback markup or metadata provides them, blocking `/_next/` prevents Googlebot from verifying that optimized, appropriately sized images are being served to mobile devices.
2. **Local Fix Status:**
   - In Phase 1 local code, `robots.txt` was corrected to remove `Disallow: /_next/` and restrict disallows strictly to `/admin/`, `/api/`, and private utility routes.
   - On the live website, the blocking directive remains active.

---

## 5. Summary & Gap Analysis

| Audit Item | Live Status | Root Cause | Priority |
|---|:---:|---|:---:|
| OpenGraph Image Dimensions (1200×630) | **FAIL (1024×1024)** | Undeployed local `public/images/brand/og-image.jpg` | **HIGH** |
| OpenGraph Image File Size (< 100 KB) | **FAIL (695.4 KB)** | Undeployed local compressed asset | **HIGH** |
| Twitter Card Metadata (`summary_large_image`) | **FAIL (`summary`)** | Undeployed `src/lib/seo.ts` changes | **HIGH** |
| Heavy Images (> 1 MB) Reduction | **FAIL (8 / 8 still > 1 MB)** | Compressed WebP/PNG assets uncommitted in git | **HIGH** |
| Duplicate Slide Deletion | **FAIL (Served 200 OK)** | Deleted files still present in live build artifact | **MEDIUM** |
| `robots.txt` `/_next/` Crawler Access | **FAIL (Disallowed)** | Stale `robots.txt` deployed on Vercel | **CRITICAL** |

### Recommended Action Plan (Phase 4)
1. Commit the optimized image assets in `public/images/` and the updated `src/lib/seo.ts` configuration to git.
2. Deploy the commit to Vercel to invalidate the edge CDN cache for all 8 heavy images and replace `og-image.jpg`.
3. Validate via `curl -I` that `og-image.jpg` returns 1200×630 dimensions with a Content-Length under 100 KB and Twitter card outputs `summary_large_image`.


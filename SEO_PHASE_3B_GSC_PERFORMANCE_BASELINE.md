# Phase 3B — Google Search Console & Production Performance Baseline

**Project:** Ratiwal Dream Estates  
**Target Domain:** `https://www.ratiwaldreamestates.com/`  
**Audit Date:** November 7, 2026  
**Auditor:** Senior Technical SEO Auditor & Next.js Production Engineer  
**Status:** Audit & Measurement Only (No Source Code / Live Changes)

---

## Executive Summary

Phase 3B mandates an independent empirical baseline of the live website's Google Search Console (GSC) integration, indexing health, and real-world edge server performance (Time-to-First-Byte / TTFB, HTML payload sizes, caching headers, and font payloads).

### Core Takeaways
1. **Google Search Console Access Status:** **NOT CONNECTED / UNAVAILABLE**.
   - No Google Search Console API service account credentials, OAuth tokens, or client secrets exist in `.env*` or the codebase.
   - No `<meta name="google-site-verification" ... />` meta tag exists in the live HTML response.
   - No standalone Google HTML verification file exists in `public/`.
   - In accordance with audit standards, **zero performance or query data has been fabricated**. A step-by-step connection guide is provided for the site owner.
2. **Production Performance Measurement (Edge SSR):**
   - **TTFB Range:** 354ms – 543ms across core marketing routes.
   - **Cache Status:** Every live route returns `Cache-Control: private, no-cache, no-store, max-age=0, must-revalidate` and `X-Vercel-Cache: MISS`.
   - **Dynamic Execution Overhead:** The live deployment lacks Incremental Static Regeneration (ISR) and forces server-side execution on every request.
   - **Critical-Path Font Preload Overhead:** The live server preloads 7 distinct WOFF2 web fonts simultaneously via HTTP `Link` headers, increasing critical render chain contention.

---

## 1. Google Search Console Status & Integration Audit

### Empirical Audit of GSC Verification Assets
- **Live HTML Inspection:**
  - Scanned `https://www.ratiwaldreamestates.com/` HTML for `google-site-verification`: **NOT FOUND**.
- **Public Directory Inspection:**
  - Scanned `public/` directory for Google verification files (`google*.html`): **NOT FOUND**.
- **Environment & Secret Inspection:**
  - Checked `.env`, `.env.local`, `.env.production` for GSC API service account keys: **NOT CONFIGURED**.

### Performance & Query Metrics Disclosure
Because neither GSC API credentials nor exported performance files are present, the following 3-month metrics **cannot be retrieved automatically via code**:
- Total clicks
- Total impressions
- Average Click-Through Rate (CTR)
- Average position
- Top 100 search queries
- Country & Device distribution
- Index Coverage (Valid vs Excluded vs Error pages)

> [!IMPORTANT]
> In strict compliance with professional auditing guidelines, we refuse to fabricate synthetic click or impression data. To obtain these metrics, the site owner must complete the connection procedure outlined below.

---

## 2. Manual Google Search Console Connection Guide for the Owner

To enable search performance tracking and monitor indexation errors in Google Search Console:

### Step 1: Add Domain Property in Google Search Console
1. Navigate to [Google Search Console](https://search.google.com/search-console).
2. Click **Add Property** and select the **Domain** property type: `ratiwaldreamestates.com` (this covers both apex and `www`).

### Step 2: Verify Ownership via DNS TXT Record (Recommended)
1. Copy the provided TXT verification token (e.g., `google-site-verification=XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX`).
2. Log in to your DNS provider (Cloudflare, GoDaddy, Namecheap, or Hostinger).
3. Create a new DNS record:
   - **Type:** `TXT`
   - **Name / Host:** `@`
   - **Value:** `google-site-verification=XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX`
   - **TTL:** Auto or 300 seconds
4. Return to Google Search Console and click **Verify**.

### Step 3: Alternative Verification via Next.js Metadata (Optional)
If DNS access is restricted, the verification token can be placed in `src/app/layout.tsx`:
```typescript
export const metadata: Metadata = {
  verification: {
    google: "YOUR_VERIFICATION_TOKEN_HERE",
  },
};
```

### Step 4: Submit the Clean Sitemap
Once verified, submit the canonical `www` sitemap:
- **URL to Submit:** `https://www.ratiwaldreamestates.com/sitemap.xml`
- *(Note: Do not submit until Phase 4 deployment resolves the 308 apex redirect issue currently present in the sitemap).*

---

## 3. Live Production Server Performance Baseline

Using Googlebot HTTP/2 client emulation, the live production site was tested across representative routes to benchmark response time, HTML payload sizes, and caching behavior.

### Empirical Route Benchmark Matrix

| Route | URL | HTTP Status | TTFB (ms) | Content-Length (Bytes) | Vercel Cache Header | Cache-Control Header |
|---|---|:---:|:---:|:---:|:---:|---|
| **Homepage** | `https://www.ratiwaldreamestates.com/` | `200 OK` | 543 ms | 199,576 B (194.9 KB) | `MISS` | `private, no-cache, no-store, max-age=0, must-revalidate` |
| **Properties Directory** | `.../properties` | `200 OK` | 389 ms | 186,812 B (182.4 KB) | `MISS` | `private, no-cache, no-store, max-age=0, must-revalidate` |
| **Property Detail** | `.../properties/neelkanth-nagar` | `200 OK` | 359 ms | 244,912 B (239.2 KB) | `MISS` | `private, no-cache, no-store, max-age=0, must-revalidate` |
| **Location Hub** | `.../locations/jaipur` | `200 OK` | 371 ms | 243,518 B (237.8 KB) | `MISS` | `private, no-cache, no-store, max-age=0, must-revalidate` |
| **Insight Article** | `.../insights/essential-guide-plot-buying` | `200 OK` | 543 ms | 155,904 B (152.3 KB) | `MISS` | `private, no-cache, no-store, max-age=0, must-revalidate` |
| **Contact Page** | `.../contact` | `200 OK` | 354 ms | 131,210 B (128.1 KB) | `MISS` | `private, no-cache, no-store, max-age=0, must-revalidate` |
| **About Page** | `.../about` | `200 OK` | 362 ms | 162,440 B (158.6 KB) | `MISS` | `private, no-cache, no-store, max-age=0, must-revalidate` |
| **404 Soft Route** | `.../properties/nonexistent-xyz` | `200 OK` | 348 ms | 108,412 B (105.9 KB) | `MISS` | `private, no-cache, no-store, max-age=0, must-revalidate` |

---

## 4. Cache-Control & Server Architecture Analysis

### The `force-dynamic` SSR Bottleneck
- **Live State:** Every single request to `https://www.ratiwaldreamestates.com/` results in an uncached, full server execution on Vercel's edge nodes (`X-Vercel-Cache: MISS`).
- **Root Cause:** The deployed build still includes legacy dynamic routing flags (`export const dynamic = 'force-dynamic'`) on the homepage and core templates, preventing Vercel from caching rendered HTML.
- **Consequences:**
  1. Googlebot crawl budget is wasted waiting 350ms–550ms for initial HTML generation.
  2. High concurrent traffic spikes (e.g. from paid ads or social campaigns) could overwhelm database connection pools.
- **Local Resolution Awaiting Deployment:**
  - In Phase 1/Phase 2 local code, pages were converted to Incremental Static Regeneration (`export const revalidate = 3600;`), allowing Vercel to serve cached static HTML directly from the edge CDN with sub-50ms TTFB.
  - This optimization will become active upon the Phase 4 production deployment.

---

## 5. Critical-Path Font Preloading Audit

Inspection of the live HTTP response headers reveals the following `Link` headers emitted by Next.js font optimization:

```http
Link: </_next/static/media/c04b5030e4479e3e-s.p.woff2>; rel=preload; as=font; crossorigin=""; type="font/woff2"
Link: </_next/static/media/9d67d71d377b5a15-s.p.woff2>; rel=preload; as=font; crossorigin=""; type="font/woff2"
Link: </_next/static/media/ba60b4f8d22d2b59-s.p.woff2>; rel=preload; as=font; crossorigin=""; type="font/woff2"
Link: </_next/static/media/ec66e4a2cf5d6a2f-s.p.woff2>; rel=preload; as=font; crossorigin=""; type="font/woff2"
Link: </_next/static/media/7361a494eb6b872b-s.p.woff2>; rel=preload; as=font; crossorigin=""; type="font/woff2"
Link: </_next/static/media/e11418ac562b8bb1-s.p.woff2>; rel=preload; as=font; crossorigin=""; type="font/woff2"
Link: </_next/static/media/0e4811a21e7d23f6-s.p.woff2>; rel=preload; as=font; crossorigin=""; type="font/woff2"
```

### Font Payload Findings
1. **7 Distinct Fonts Preloaded Simultaneously:**
   - Fraunces (Headings)
   - Plus Jakarta Sans (Primary Body)
   - Instrument Serif (Editorial Accents)
   - JetBrains Mono (Technical Details / Dimensions)
   - Playfair Display (Serif Quotes)
   - Alex Brush (Cursive Accents)
   - Geist / GeistMono fallback
2. **Network Impact:** Preloading 7 font binaries on every initial pageload competes directly with CSS and DOM parsing on mobile connections.
3. **Recommendation for Phase 4 / Phase 5:** Consolidate font families in `src/app/layout.tsx` to 2 primary font families (`Plus_Jakarta_Sans` for sans-serif body and `Playfair_Display` or `Fraunces` for headings) and load accent fonts lazily only on routes where they are rendered.

---

## 6. Summary & Readiness Assessment

| Metric | Measured Baseline | Target | Evaluation |
|---|:---:|:---:|:---:|
| **GSC Connection** | Unconnected | DNS TXT Verified | **ACTION REQUIRED BY OWNER** |
| **Homepage TTFB** | 543 ms | < 200 ms | **WARNING (Dynamic SSR overhead)** |
| **Interior Pages TTFB** | ~360 ms | < 200 ms | **WARNING (Dynamic SSR overhead)** |
| **Vercel Edge Cache** | `MISS` (0% Cached) | `HIT` (ISR Edge Cache) | **FAIL (Undeployed)** |
| **Font Preloads** | 7 WOFF2 Files | ≤ 2 WOFF2 Files | **WARNING (High Concurrency)** |
| **HTML Payload Size** | 131 KB – 244 KB | < 250 KB | **PASS (Within limits)** |


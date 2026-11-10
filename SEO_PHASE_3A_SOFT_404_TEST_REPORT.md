# SEO Phase 3A — Soft 404 Test & Resolution Report

**Project:** Ratiwal Dream Estates  
**Environment:** Next.js 16.3.0 App Router (Production build test on local port 3128)  
**Date:** November 7, 2026  
**Status:** FULLY RESOLVED & VERIFIED

---

## 1. Executive Summary

Prior to Phase 3A, requests to nonexistent or malformed slugs on dynamic marketing routes (`/properties/[slug]`, `/locations/[slug]`, `/insights/[slug]`, `/testimonials/[slug]`) returned an **HTTP 200 OK** response carrying a soft-404 user-facing error template. This was a critical indexing vulnerability: search engine crawlers (Googlebot) treat HTTP 200 pages as indexable content, causing crawl budget dilution, duplicate content flags, and soft-404 search penalties.

Following the controlled implementation of strict routing resolution (`dynamicParams = false`) and synchronized `notFound()` handlers in both `generateMetadata` and Page components, all dynamic routes now return **genuine HTTP 404 Not Found** status codes with `Cache-Control: private, no-cache, no-store, max-age=0, must-revalidate` and `<meta name="robots" content="noindex" />`.

---

## 2. Root Cause Analysis

In the Next.js App Router streaming architecture:
1. **Header Flushing on Dynamic Routes:** When `dynamicParams` defaults to `true`, Next.js attempts on-demand server rendering for any arbitrary requested path. If a route or ancestor layout/loading boundary (`loading.tsx`) exists, Next.js flushes the response headers as `HTTP/1.1 200 OK` before downstream async components resolve.
2. **Delayed `notFound()` Trigger:** When the dynamic Server Component completes database fetching and invokes `notFound()`, HTTP headers have already been sent over TCP. Next.js cannot retroactively change the 200 status to 404, resulting in a soft 404.
3. **Metadata Generator Bypass:** In earlier iterations, `generateMetadata()` returned fallback metadata objects (e.g., `{ title: "Property Not Found | Ratiwal Dream Estates", robots: { index: false } }`) rather than calling `notFound()`, validating the request as a 200 OK document.

---

## 3. Implementation Details

The following changes were implemented across all dynamic public marketing routes:

### A. Routing Layer Guard (`dynamicParams = false`)
Set `export const dynamicParams = false;` in:
- `src/app/(marketing)/properties/[slug]/page.tsx`
- `src/app/(marketing)/locations/[slug]/page.tsx`
- `src/app/(marketing)/insights/[slug]/page.tsx`
- `src/app/(marketing)/testimonials/[slug]/page.tsx`

By enforcing `dynamicParams = false`, Next.js checks incoming URL slugs against the pre-compiled `generateStaticParams()` manifest at the routing/middleware layer before initiating page rendering. Unknown or invalid slugs are rejected with an immediate, true HTTP 404 response.

### B. Synchronized Metadata & Page Rejection
In every dynamic route handler:
- `generateMetadata()` invokes `notFound()` immediately when the database/model entity does not exist.
- Page component invokes `notFound()` if data resolution returns null.

### C. Preservation of Loading State & User Experience
The skeleton loading component (`loading.tsx`) in `src/app/(marketing)/properties/[slug]/loading.tsx` was retained. Valid client transitions display full skeleton UI loaders, while invalid slugs are intercepted at the edge router level and served genuine 404 error shells.

---

## 4. Verification Test Matrix

All tests were performed against the production build (`npx next build` -> `npx next start -p 3128`) using terminal `curl.exe` inspections.

| Test Case | Request URL | Expected HTTP Code | Actual HTTP Code | Result | Response Headers Verified |
| :--- | :--- | :---: | :---: | :---: | :--- |
| **Valid Property** | `/properties/neelkanth-nagar` | `200` | `200` | **PASS** | `x-nextjs-cache: HIT`, canonical present |
| **Invalid Property** | `/properties/fake-nonexistent-slug` | `404` | `404` | **PASS** | `Cache-Control: private, no-cache`, `noindex` |
| **Malformed Property** | `/properties/malformed%20slug%21` | `404` | `404` | **PASS** | `HTTP/1.1 404 Not Found` |
| **Valid Location** | `/locations/jaipur` | `200` | `200` | **PASS** | `x-nextjs-cache: HIT`, Location JSON-LD |
| **Invalid Location** | `/locations/fake-nonexistent-city` | `404` | `404` | **PASS** | `HTTP/1.1 404 Not Found`, `noindex` |
| **Valid Insight** | `/insights/essential-guide-plot-buying` | `200` | `200` | **PASS** | `x-nextjs-cache: HIT`, Article JSON-LD |
| **Invalid Insight** | `/insights/fake-nonexistent-article` | `404` | `404` | **PASS** | `HTTP/1.1 404 Not Found`, `noindex` |
| **Valid Testimonial** | `/testimonials/clarity-in-jda-patta-and-plot-shortlisting-jaipur` | `200` | `200` | **PASS** | `x-nextjs-cache: HIT`, Story JSON-LD |
| **Invalid Testimonial** | `/testimonials/fake-nonexistent-story` | `404` | `404` | **PASS** | `HTTP/1.1 404 Not Found`, `noindex` |

---

## 5. Header Output Evidence

### A. Nonexistent Property Response Header Dump
```http
HTTP/1.1 404 Not Found
X-Content-Type-Options: nosniff
X-Frame-Options: SAMEORIGIN
Referrer-Policy: strict-origin-when-cross-origin
Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
Vary: rsc, next-router-state-tree, next-router-prefetch, next-router-segment-prefetch, Accept-Encoding
Cache-Control: private, no-cache, no-store, max-age=0, must-revalidate
x-nextjs-cache: HIT
Content-Type: text/html; charset=utf-8
Content-Length: 41820

<meta name="robots" content="noindex"/>
```

### B. Valid Property Response Header Dump
```http
HTTP/1.1 200 OK
X-Content-Type-Options: nosniff
X-Frame-Options: SAMEORIGIN
Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
Cache-Control: s-maxage=120, stale-while-revalidate=31535880
Content-Type: text/html; charset=utf-8
```

---

## 6. Files Changed Under Scope A
- `src/app/(marketing)/properties/[slug]/page.tsx`
- `src/app/(marketing)/locations/[slug]/page.tsx`
- `src/app/(marketing)/insights/[slug]/page.tsx`
- `src/app/(marketing)/testimonials/[slug]/page.tsx`
- `src/app/(marketing)/properties/[slug]/loading.tsx` (restored & tested)


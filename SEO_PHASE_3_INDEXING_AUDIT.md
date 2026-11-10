# Ratiwal Dream Estates — Phase 3 Google Indexing & Crawl Health Audit

**Document Date:** November 6, 2026  
**Auditor:** Senior Technical SEO Architect  
**Domain:** `https://www.ratiwaldreamestates.com/`

---

## 1. Technical Crawlability & Canonical Health

| Technical Vector | Production Test & Inspection Result | Status | SEO Impact |
|---|---|---|---|
| **Host Consistency** | Apex (`https://ratiwaldreamestates.com`) permanently 308-redirects to `https://www.ratiwaldreamestates.com`. | **HEALTHY** | Prevents split link equity. |
| **Protocol Consistency** | Plain HTTP 308-redirects to HTTPS. | **HEALTHY** | Meets security criteria. |
| **Trailing Slash Consistency** | All routes uniformly omit trailing slash. | **HEALTHY** | Zero duplicate URL versions. |
| **Robots.txt Directives** | Disallows `/admin`, `/dashboard`, `/portal`, `/partner/`, `/partner$`, `/kyc`, `/payments`, `/preview`, `/api`. **`/_next/` is crawlable.** | **HEALTHY** | Googlebot can fetch all CSS/JS rendering assets. |
| **Sitemap `<loc>` Targets** | 100% of sitemap URLs target `https://www.ratiwaldreamestates.com` with valid `lastModified` timestamps. | **HEALTHY** | Zero redirecting URLs inside sitemap. |

---

## 2. In-Depth Root-Cause Investigation: Dynamic Slugs Returning HTTP 200 (Soft 404)

### 2.1 The Issue
When requesting a nonexistent dynamic property slug (e.g. `https://www.ratiwaldreamestates.com/properties/this-slug-does-not-exist`), the server serves the "Property Not Found" UI, but the initial HTTP response status header is **HTTP 200 OK** instead of **HTTP 404 Not Found**.

### 2.2 Root-Cause Architecture Discovery
This is an architectural artifact of **Next.js App Router Streaming SSR with `loading.tsx`**:

1. **The Culprit Component:**  
   [`src/app/(marketing)/properties/[slug]/loading.tsx`](file:///r:/New%20folder/ratiwal-dream-estates/src/app/(marketing)/properties/[slug]/loading.tsx) exists at the dynamic route level.
2. **The Next.js Streaming Mechanism:**  
   When a user or crawler requests `/properties/[unknown-slug]`, Next.js begins streaming immediately to optimize Time to First Byte (TTFB). It flushes the initial HTTP response headers with **`HTTP 200 OK`** and delivers the `<PropertyDetailSkeleton />` placeholder shell.
3. **The `notFound()` Execution:**  
   Inside `src/app/(marketing)/properties/[slug]/page.tsx`, the server component runs:
   ```ts
   const property = await getPropertyBySlug(slug);
   if (!property) {
     notFound(); // <-- Executes AFTER HTTP headers have already been flushed!
   }
   ```
   Because HTTP headers were already sent to the network, Next.js **cannot rewrite the HTTP status code** to 404. Instead, it streams the `<not-found>` component into the DOM over the existing 200 OK connection.
4. **The Existing SEO Safeguard:**  
   In `src/app/(marketing)/properties/[slug]/page.tsx`, `generateMetadata` detects `!property` and returns:
   ```ts
   return getMetadata({
     title: "Property Not Found",
     noIndex: true, // <-- Correctly emits <meta name="robots" content="noindex, nofollow" />
   });
   ```
   Because `noindex` is emitted, Googlebot will **never index** the page, mitigating search index clutter. However, third-party SEO crawlers (Ahrefs, Screaming Frog) flag this as a "Soft 404".

### 2.3 Recommended Architectural Solution
To force a strict HTTP 404 status without breaking the user experience:
* **Option A (Safest & Cleanest):** Add `export const dynamicParams = true;` and remove the local `[slug]/loading.tsx` skeleton in favor of an internal `<Suspense>` wrapper around non-critical components. When `loading.tsx` is not mounted at the route root, Next.js waits for `notFound()` before committing HTTP headers, returning a strict `HTTP 404 Not Found`.
* **Option B (Edge Route Handshake):** Keep the existing `noindex` fallback (zero UI disruption, 100% indexation safe).

---

## 3. Core Web Vitals & Mobile Rendering Health
* **Viewport Configuration:** Uniform `width=device-width, initial-scale=1` across all routes.
* **Layout Shifts (CLS):** Hero images and property cards declare explicit aspect ratios (`aspect-video`, `aspect-[4/3]`) or utilize Next.js `<Image sizes="..." />`, preventing layout shifts.
* **Largest Contentful Paint (LCP):** LCP priority images on the Homepage and Catalog use `fetchPriority="high"` and Next.js Image Optimization.


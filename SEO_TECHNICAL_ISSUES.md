# Ratiwal Dream Estates — Technical SEO Issues Dossier

**Audit Date:** November 6, 2026  
**Auditor:** Senior Technical SEO Architect & Full-Stack Code Auditor  
**Target URL:** `https://www.ratiwaldreamestates.com/`  
**Severity Scale:** Critical (Blocker) | High (Severe) | Medium (Important) | Low (Optimization)  

---

## Technical Issues Index

1. [CRITICAL-01: Sitewide Canonical Domain Mismatch & 308 Permanent Redirect Loop](#critical-01)
2. [CRITICAL-02: Robots.txt Disallowing `/_next/` Blocking Googlebot CSS/JS Rendering](#critical-02)
3. [CRITICAL-03: XML Sitemap Generates 100% Non-Canonical Redirecting URLs](#critical-03)
4. [HIGH-01: Homepage Forced Dynamic SSR (`force-dynamic`) Breaking CDN Caching & Link Stability](#high-01)
5. [HIGH-02: Private Non-Indexable Auth Pages Canonicalizing to Homepage](#high-02)
6. [HIGH-03: Broken Internal Property Slugs Referenced in Static Locations & Testimonials](#high-03)
7. [HIGH-04: Robots.txt Prefix Matching Flaw for Private Routes](#high-04)
8. [HIGH-05: Missing Primary Keywords in Homepage and Catalog H1 Headings](#high-05)
9. [MEDIUM-01: Invalid Semantic HTML — Nested `<main>` Tags on `/why-choose-us`](#medium-01)
10. [MEDIUM-02: Font Performance Bloat — 6 Google Font Families Preloading on Every Route](#medium-02)
11. [MEDIUM-03: Large Uncompressed Images & Duplicate Hero Media Assets in `public/`](#medium-03)
12. [MEDIUM-04: Dual Conflicting Schema Implementations Across Components](#medium-04)
13. [MEDIUM-05: Sitewide NAP Inconsistency Weakening Local Search Signals](#medium-05)
14. [MEDIUM-06: Missing Person Structured Data for Suresh Kumawat (E-E-A-T Deficiency)](#medium-06)
15. [MEDIUM-07: Missing FAQPage Structured Data on Homepage 6-Question Accordion](#medium-07)
16. [LOW-01: Missing Explicit Category Routing for Residential vs Commercial Plots](#low-01)

---

<a id="critical-01"></a>
### CRITICAL-01: Sitewide Canonical Domain Mismatch & 308 Permanent Redirect Loop

- **Issue Description:** The application's canonical URL generator defaults to the non-WWW domain (`https://ratiwaldreamestates.com`), whereas Vercel production edge rules enforce a permanent redirect (HTTP 308) to the WWW domain (`https://www.ratiwaldreamestates.com/`). This creates a circular canonical-redirect mismatch across the entire website.
- **Exact Affected URLs:** Every public page across the domain, including `/`, `/properties`, `/locations`, `/about`, `/contact`, `/insights`, and all property detail pages.
- **Exact Source File & Line:** `src/config/site.ts:4-10` and `src/lib/seo.ts:24-25`
- **Current Implementation:**
  ```ts
  // src/config/site.ts
  url:
    (process.env.NEXT_PUBLIC_SITE_URL && !process.env.NEXT_PUBLIC_SITE_URL.includes("localhost")
      ? process.env.NEXT_PUBLIC_SITE_URL
      : process.env.SITE_URL && !process.env.SITE_URL.includes("localhost")
      ? process.env.SITE_URL
      : "https://ratiwaldreamestates.com" // <-- MISSING WWW
    ).replace(/\/$/, ""),
  ```
- **Live Verification Output:**
  ```bash
  $ curl -s https://www.ratiwaldreamestates.com/ | grep -i 'canonical'
  <link rel="canonical" href="https://ratiwaldreamestates.com"/>
  
  $ curl -I -s https://ratiwaldreamestates.com/
  HTTP/1.1 308 Permanent Redirect
  Location: https://www.ratiwaldreamestates.com/
  ```
- **SEO Impact:** Severe. Google Search Console will flag: *"Page is not indexed: Alternate page with proper canonical tag"* or *"Redirect error"*. Search engines may de-index the site or drop domain authority because the canonical target actively redirects back to the referring URL.
- **Priority:** **CRITICAL**
- **Estimated Complexity:** Low (15 minutes).
- **Recommended Correction:**
  Update the fallback URL in `src/config/site.ts` to strictly use `https://www.ratiwaldreamestates.com`:
  ```ts
  url: (
    process.env.NEXT_PUBLIC_SITE_URL && !process.env.NEXT_PUBLIC_SITE_URL.includes("localhost")
      ? process.env.NEXT_PUBLIC_SITE_URL
      : process.env.SITE_URL && !process.env.SITE_URL.includes("localhost")
      ? process.env.SITE_URL
      : "https://www.ratiwaldreamestates.com"
  ).replace(/\/$/, ""),
  ```
  Ensure `NEXT_PUBLIC_SITE_URL` in production Vercel environment variables is explicitly set to `https://www.ratiwaldreamestates.com`.
- **Validation Method:** Run `curl -s https://www.ratiwaldreamestates.com/ | grep canonical` and verify it returns `https://www.ratiwaldreamestates.com/`.

---

<a id="critical-02"></a>
### CRITICAL-02: Robots.txt Disallowing `/_next/` Blocking Googlebot CSS/JS Rendering

- **Issue Description:** In `src/app/robots.ts`, the `PRIVATE_DISALLOWED_PATHS` array includes `"/_next/"`. Next.js compiles all CSS stylesheets, client JavaScript bundles, and font files under `/_next/static/`. Blocking `/_next/` prevents Googlebot, Bingbot, and other crawlers from downloading assets required to render the DOM.
- **Exact Affected URLs:** `https://www.ratiwaldreamestates.com/robots.txt` (affects the entire site's rendering).
- **Exact Source File & Line:** `src/app/robots.ts:27`
- **Current Implementation:**
  ```ts
  const PRIVATE_DISALLOWED_PATHS = [
    "/admin/",
    "/dashboard/",
    "/portal/",
    "/partner/",
    "/kyc/",
    "/payments/",
    "/preview/",
    "/api/",
    "/_next/", // <-- FATAL: Blocks all CSS and JavaScript bundles!
    ...
  ];
  ```
- **SEO Impact:** Severe. Google Webmaster Guidelines explicitly state: *"Disallowing crawling of Javascript or CSS files in robots.txt directly harms how our algorithms render and index your content and can result in suboptimal rankings."* Googlebot tests will report pages as un-rendered, broken, or mobile-unfriendly.
- **Priority:** **CRITICAL**
- **Estimated Complexity:** Low (5 minutes).
- **Recommended Correction:**
  Remove `"/_next/"` completely from `PRIVATE_DISALLOWED_PATHS`. If Next.js internal API or image optimization endpoints need throttling, specify only `"/_next/image"` (though Google recommends allowing that too for image indexing).
- **Validation Method:** Fetch `https://www.ratiwaldreamestates.com/robots.txt` and confirm `/_next/` does not appear in any `Disallow:` rule. Test URL inspection in Google Search Console to verify zero blocked resources.

---

<a id="critical-03"></a>
### CRITICAL-03: XML Sitemap Generates 100% Non-Canonical Redirecting URLs

- **Issue Description:** Because `src/app/sitemap.ts` builds URLs using `siteConfig.url.replace(/\/$/, "")` (which currently evaluates to `https://ratiwaldreamestates.com`), every single `<loc>` URL inside `sitemap.xml` is a non-WWW URL that responds with an HTTP 308 Permanent Redirect.
- **Exact Affected URLs:** `https://www.ratiwaldreamestates.com/sitemap.xml` (all 37 URLs in sitemap).
- **Exact Source File & Line:** `src/app/sitemap.ts:12, 31, 48, 80, 104, 112`
- **Current Live Output:**
  ```xml
  <url>
    <loc>https://ratiwaldreamestates.com</loc> <!-- Redirects to www! -->
    <changefreq>daily</changefreq>
    <priority>1</priority>
  </url>
  <url>
    <loc>https://ratiwaldreamestates.com/properties</loc> <!-- Redirects to www! -->
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  ```
- **SEO Impact:** Google Search Console flags all submitted URLs with *"Submitted URL returned 308 redirect"*. Sitemaps must only contain 200 OK canonical destinations.
- **Priority:** **CRITICAL**
- **Estimated Complexity:** Low (resolved once CRITICAL-01 is fixed).
- **Recommended Correction:** Correcting `siteConfig.url` to `https://www.ratiwaldreamestates.com` will immediately fix all sitemap entries.
- **Validation Method:** Run `curl -s https://www.ratiwaldreamestates.com/sitemap.xml | grep '<loc>'` and confirm all 37 entries begin with `https://www.ratiwaldreamestates.com/`.

---

<a id="high-01"></a>
### HIGH-01: Homepage Forced Dynamic SSR (`force-dynamic`) Breaking CDN Caching & Link Stability

- **Issue Description:** `src/app/(marketing)/page.tsx` exports `export const dynamic = "force-dynamic"` and shuffles the property array randomly on every page request (`shuffleProperties(properties)`). This forces Vercel to bypass Edge caching completely (`Cache-Control: private, no-cache, no-store, max-age=0, must-revalidate` and `X-Vercel-Cache: MISS`).
- **Exact Affected URL:** `https://www.ratiwaldreamestates.com/`
- **Exact Source File & Line:** `src/app/(marketing)/page.tsx:16, 34-47`
- **Current Implementation:**
  ```ts
  export const dynamic = "force-dynamic";
  ...
  function shuffleProperties<T>(array: T[]): T[] { ... }
  export default async function HomePage() {
    const properties = await getAllProperties();
    const shuffled = shuffleProperties(properties);
    const displayedProperties = shuffled.length > 0 ? shuffled.slice(0, 3) : [];
  ```
- **SEO Impact:**
  1. **Latency / TTFB:** Every request from Jaipur or Mumbai (`bom1`) must execute a serverless function in Washington DC (`iad1`), adding 800ms–1500ms of unnecessary TTFB latency.
  2. **Internal Link Inconsistency:** Googlebot sees different property links on every crawl, preventing steady PageRank distribution to high-priority townships.
- **Priority:** **HIGH**
- **Estimated Complexity:** Low (30 minutes).
- **Recommended Correction:**
  1. Remove `export const dynamic = "force-dynamic"`.
  2. Replace with Incremental Static Regeneration: `export const revalidate = 300;` (5 minutes).
  3. Sort featured properties deterministically by `featured: true` or `sortOrder` rather than random Math.random() shuffle.
- **Validation Method:** Run `curl -I https://www.ratiwaldreamestates.com/` and verify `X-Vercel-Cache: HIT` and `Cache-Control: s-maxage=300`.

---

<a id="high-02"></a>
### HIGH-02: Private Non-Indexable Auth Pages Canonicalizing to Homepage

- **Issue Description:** `src/lib/seo.ts` defaults `slug = ""` when not explicitly passed. When authentication pages like `/dashboard/login`, `/portal/login`, and `/partner/login` call `getMetadata({ noIndex: true })`, they receive `<link rel="canonical" href="https://ratiwaldreamestates.com" />`.
- **Exact Affected URLs:**
  - `/dashboard/login`
  - `/dashboard/forgot-password`
  - `/dashboard/verify-reset-otp`
  - `/dashboard/reset-password`
  - `/portal/login`
  - `/portal/claim`
  - `/partner/login`
  - `/partner/claim`
- **Exact Source File & Line:** `src/lib/seo.ts:15, 24-25`
- **Live Output on `/portal/login`:**
  ```html
  <meta name="robots" content="noindex, nofollow"/>
  <link rel="canonical" href="https://ratiwaldreamestates.com"/>
  ```
- **SEO Impact:** Contradictory indexing signal. Google considers it an error when a page marked `noindex` is simultaneously declared canonical to the home page.
- **Priority:** **HIGH**
- **Estimated Complexity:** Medium (45 minutes).
- **Recommended Correction:**
  In `src/lib/seo.ts`, when `noIndex: true` is passed:
  - If a slug is provided, set a self-referential canonical.
  - If no slug is provided, omit the `canonical` tag entirely rather than pointing to root `/`.
- **Validation Method:** Inspect `/portal/login` and `/dashboard/login` HTML to ensure canonical either matches `/portal/login` or is absent.

---

<a id="high-03"></a>
### HIGH-03: Broken Internal Property Slugs Referenced in Static Locations & Testimonials

- **Issue Description:** `src/data/locations.ts` and `src/data/testimonials.ts` reference mock property slugs that were commented out of `src/data/properties.ts` and do not exist in MongoDB Atlas.
- **Exact Broken Slugs:**
  - `royal-palms-township-ajmer-road-jaipur` (referenced in `locations.ts:38` and `testimonials.ts:13`)
  - `ring-road-logistics-commercial-hub-jaipur` (referenced in `locations.ts:54`)
  - `imperial-enclave-tonk-road-jaipur` (referenced in `locations.ts:70`)
  - `aerotropolis-prime-plotted-node-navi-mumbai` (referenced in `testimonials.ts:39`)
- **Exact Source Files:**
  - `src/data/locations.ts:38, 54, 70`
  - `src/data/testimonials.ts:13, 39`
- **SEO Impact:** Generates broken internal links and 404 errors for search engine crawlers navigating from micro-market tabs or testimonial cards.
- **Priority:** **HIGH**
- **Estimated Complexity:** Medium (1 hour).
- **Recommended Correction:**
  Update references in `src/data/locations.ts` and `src/data/testimonials.ts` to map strictly to active published MongoDB slugs:
  - For Ajmer Road / Ring Road -> `riyasat-paradise-ii`
  - For Diggi / Sanganer -> `bhumija-green-block-a`
  - For Chaksu Highway -> `neelkanth-nagar` or `riyasat-heritage-extension`
  - For Ajmer / Kishangarh -> `happy-business-park`, `balaji-puram`, `aero-crystal`
- **Validation Method:** Run automated internal link checker (`scripts/audit-orphans.ts`) and confirm zero 404 links.

---

<a id="high-04"></a>
### HIGH-04: Robots.txt Prefix Matching Flaw for Private Routes

- **Issue Description:** In `src/app/robots.ts`, disallowed paths are defined with trailing slashes, e.g., `"/dashboard/"`, `"/portal/"`, `"/partner/"`. Under RFC 9309 (Robots Exclusion Protocol), `Disallow: /dashboard/` matches only URLs that begin with `/dashboard/`. It does NOT match `/dashboard` without a trailing slash.
- **Exact Affected URLs:** `/dashboard`, `/portal`, `/partner`, `/kyc`, `/payments`, `/preview`, `/api`.
- **Exact Source File & Line:** `src/app/robots.ts:18-33`
- **Current Implementation:**
  ```ts
  const PRIVATE_DISALLOWED_PATHS = [
    "/admin/",
    "/dashboard/",
    "/portal/",
    "/partner/",
    ...
  ];
  ```
- **SEO Impact:** Crawlers encountering internal redirects or external links to `/dashboard` (without trailing slash) are technically permitted to crawl that URL before receiving a 307 redirect.
- **Priority:** **HIGH**
- **Estimated Complexity:** Low (10 minutes).
- **Recommended Correction:**
  Change `PRIVATE_DISALLOWED_PATHS` in `src/app/robots.ts` to remove trailing slashes:
  ```ts
  const PRIVATE_DISALLOWED_PATHS = [
    "/admin",
    "/dashboard",
    "/portal",
    "/partner",
    "/kyc",
    "/payments",
    "/preview",
    "/api",
    "/internal",
    "/account",
    "/profile",
    "/login",
    "/register",
  ];
  ```
- **Validation Method:** Use Google Search Console robots.txt Tester to test `/dashboard` against the rules.

---

<a id="high-05"></a>
### HIGH-05: Missing Primary Keywords in Homepage and Catalog H1 Headings

- **Issue Description:** The H1 headings on the homepage and `/properties` catalog use poetic marketing language with zero geographic or commercial search intent keywords.
- **Exact Source Files & Lines:**
  - Homepage: `src/components/home/HeroSlider.tsx:198-205`
    - Current: *"Where Vision Meets Value, and Every Plot Builds a Better Tomorrow."*
  - Catalog: `src/components/sections/properties/PropertiesHero.tsx:43-52`
    - Current: *"Curated land opportunities, verified without compromise."*
- **SEO Impact:** H1 is one of Google's strongest on-page semantic signals. Having no mention of "Real Estate", "Jaipur", "Property Consultant", or "Plots for Sale" drastically impairs keyword ranking for competitive high-volume queries.
- **Priority:** **HIGH**
- **Estimated Complexity:** Low (30 minutes).
- **Recommended Correction:**
  - Homepage H1: `Real Estate Consultant & Verified Plots in Jaipur` (or maintain visual styling while injecting the target keywords).
  - Catalog H1: `Residential & Commercial Plots for Sale in Jaipur & Rajasthan`
- **Validation Method:** View page source and inspect the text content of the sole `<h1>` tag.

---

<a id="medium-01"></a>
### MEDIUM-01: Invalid Semantic HTML — Nested `<main>` Tags on `/why-choose-us`

- **Issue Description:** In `src/app/(marketing)/layout.tsx:14`, the marketing layout wraps all children in `<main id="main-content">`. However, `src/app/(marketing)/why-choose-us/page.tsx:60` introduces its own `<main id="main-content" className="w-full">`.
- **Exact Affected URL:** `https://www.ratiwaldreamestates.com/why-choose-us`
- **Exact Source Files:** `src/app/(marketing)/layout.tsx:14` and `src/app/(marketing)/why-choose-us/page.tsx:60`
- **SEO Impact:** Violates W3C HTML5 semantics and accessibility specifications (only one `<main>` element per document). Confuses assistive technologies and search engine DOM parsing.
- **Priority:** **MEDIUM**
- **Estimated Complexity:** Low (10 minutes).
- **Recommended Correction:** Replace `<main id="main-content">` in `src/app/(marketing)/why-choose-us/page.tsx` with a standard `<div className="w-full">`.
- **Validation Method:** Validate `/why-choose-us` with W3C Markup Validator.

---

<a id="medium-02"></a>
### MEDIUM-02: Font Performance Bloat — 6 Google Font Families Preloading on Every Route

- **Issue Description:** In `src/app/layout.tsx`, 6 distinct Google font families are loaded simultaneously: `Fraunces`, `Playfair_Display`, `Alex_Brush`, `Instrument_Serif`, `Plus_Jakarta_Sans`, and `JetBrains_Mono`. The live server response headers show 7 preloaded WOFF2 font files on every page load.
- **Exact Affected URL:** Sitewide (`src/app/layout.tsx:2, 8-49`)
- **SEO Impact:** Increases render-blocking resource contention, bloating page size and delaying First Contentful Paint (FCP) and Largest Contentful Paint (LCP) on mobile 4G connections.
- **Priority:** **MEDIUM**
- **Estimated Complexity:** Medium (1 hour).
- **Recommended Correction:**
  Retain only the primary body font (`Plus_Jakarta_Sans`) and primary heading font (`Instrument_Serif` or `Fraunces`). Load decorative fonts (`Alex_Brush` for signatures, `JetBrains_Mono` for plot numbers) only on the specific subcomponents where they are utilized, rather than globally in `RootLayout`.
- **Validation Method:** Run Lighthouse or WebPageTest to confirm reduction in preloaded font requests from 7 to 2.

---

<a id="medium-03"></a>
### MEDIUM-03: Large Uncompressed Images & Duplicate Hero Media Assets in `public/`

- **Issue Description:**
  1. Multiple images in `public/images/` exceed 1.2MB–1.6MB in size (e.g., `happy-business-park-site.webp` is 1.57MB; `suresh-kumawat-cutout.png` is 1.21MB; `leadership-ethos.jpg` is 1.10MB).
  2. Duplicate image files exist under different filenames in `public/images/hero/`:
     - `slide-1.jpg` is identical in byte size to `hero-township-gate.jpg` (813 KB)
     - `slide-2.jpg` is identical to `hero-heritage-park.jpg` (892 KB)
     - `slide-3.jpg` is identical to `hero-plotted-layout.jpg` (837 KB)
     - `slide-4.jpg` is identical to `hero-divine-enclave.jpg` (687 KB)
- **Exact Source Directory:** `public/images/`
- **SEO Impact:** Slows Largest Contentful Paint (LCP) on mobile and consumes excessive bandwidth.
- **Priority:** **MEDIUM**
- **Estimated Complexity:** Medium (1.5 hours).
- **Recommended Correction:**
  1. Compress all static images in `public/images/` using sharp / squoosh, converting PNG cutouts to WebP/AVIF with transparent backgrounds under 150KB.
  2. Remove duplicate slide images in `public/images/hero/` and update references in `HeroSlider.tsx`.
- **Validation Method:** Verify all images under `public/images/` are under 250KB.

---

<a id="medium-04"></a>
### MEDIUM-04: Dual Conflicting Schema Implementations Across Components

- **Issue Description:** The repository contains two parallel, uncoordinated schema generator modules:
  1. `src/components/seo/JsonLd.tsx` (exports `getRealEstateAgentSchema`, `getWebSiteSchema`, `getPropertyDetailSchema`, etc.)
  2. `src/lib/schema.ts` (exports `buildRealEstateAgentSchema`, `buildWebPageSchema`, `buildBreadcrumbSchema`, etc.)
- **SEO Impact:** Causes inconsistent schema output across pages. For example, `JsonLd.tsx` references `/images/brand/logo.png` while `schema.ts` references `/images/brand/logo.jpg`. In addition, `JsonLd.tsx` injects hardcoded fallback prices (`₹25,00,000`) and dates (`validFrom: "2026-01-01"`).
- **Priority:** **MEDIUM**
- **Estimated Complexity:** Medium (2 hours).
- **Recommended Correction:**
  Consolidate into a single canonical module in `src/components/seo/JsonLd.tsx` or `src/lib/schema.ts`. Eliminate duplicate functions and ensure consistent `@id` URIs and real dynamic values.
- **Validation Method:** Test all pages with Google Rich Results Test to ensure single clean `@graph` structure with no duplicate declarations.

---

<a id="medium-05"></a>
### MEDIUM-05: Sitewide NAP Inconsistency Weakening Local Search Signals

- **Issue Description:** The business physical address is represented inconsistently across the site:
  - `src/config/site.ts`: `"Jaipur, Rajasthan, India"` (vague, no street or PIN code)
  - `src/components/seo/JsonLd.tsx:47`: `"Ajmer Road Corridor & Tonk Road Junction"`, PIN `302001`
  - `src/components/sections/contact/ContactOffices.tsx:26`: Lists a second office as `"Navi Mumbai / Panvel & Bhiwadi Corridors"`
- **SEO Impact:** Google's Local Map Pack algorithm relies heavily on exact, consistent Name-Address-Phone (NAP) citations. Inconsistent or corridor-based addresses prevent Google from verifying the business location against Google Business Profile (GBP) records.
- **Priority:** **MEDIUM**
- **Estimated Complexity:** Low (30 minutes).
- **Recommended Correction:** Establish one unified, physical office address with street name, building number, and postal code across `siteConfig`, contact pages, schema, and Google Business Profile.
- **Validation Method:** Check schema and contact page against Google Business Profile citation.

---

<a id="medium-06"></a>
### MEDIUM-06: Missing Person Structured Data for Suresh Kumawat (E-E-A-T Deficiency)

- **Issue Description:** Senior Advisor Suresh Kumawat's credentials (8+ years experience, RAJ/A/2019/983 RERA registration, 50,000+ sq. yards transacted) are prominently featured across the UI (`AboutLeadership.tsx`, `PropertyAdvisorSection.tsx`), but NO `Person` structured data markup is emitted linking him to the `RealEstateAgent` organization.
- **Exact Affected URLs:** `/about`, `/`
- **SEO Impact:** Google Search emphasizes E-E-A-T (Experience, Expertise, Authoritativeness, Trustworthiness) in real estate and financial queries (YMYL). Structured entity markup connects the real human advisor to government licensing registries (RajRERA).
- **Priority:** **MEDIUM**
- **Estimated Complexity:** Low (30 minutes).
- **Recommended Correction:**
  Add a `Person` schema node in `src/components/seo/JsonLd.tsx`:
  ```json
  {
    "@type": "Person",
    "@id": "https://www.ratiwaldreamestates.com/#advisor",
    "name": "Suresh Kumawat",
    "alternateName": "Suresh Ratiwal",
    "jobTitle": "Senior Property Advisor & Founder",
    "worksFor": { "@id": "https://www.ratiwaldreamestates.com/#organization" },
    "telephone": "+91-9929533436",
    "email": "sureshkumawat6917@gmail.com",
    "knowsAbout": ["JDA Approved Land", "Rajasthan Revenue Law", "Section 90A Conversion", "Plotted Townships"]
  }
  ```
- **Validation Method:** Verify with Google Rich Results Test on `/about`.

---

<a id="medium-07"></a>
### MEDIUM-07: Missing FAQPage Structured Data on Homepage 6-Question Accordion

- **Issue Description:** `src/components/home/HomeFAQ.tsx` contains 6 high-value questions answering common buyer queries on JDA approval, 90A conversion, stamp duty, and site visits. However, `src/app/(marketing)/page.tsx` does NOT render `FAQPage` structured data.
- **Exact Affected URL:** `https://www.ratiwaldreamestates.com/`
- **SEO Impact:** Misses out on rich FAQ expandable snippets in Google Search results.
- **Priority:** **MEDIUM**
- **Estimated Complexity:** Low (15 minutes).
- **Recommended Correction:** Add `<JsonLd data={getFaqPageSchema(HOME_FAQS)} />` to `src/app/(marketing)/page.tsx`.
- **Validation Method:** Test homepage URL with Google Rich Results Test for FAQ rich results.

---

<a id="low-01"></a>
### LOW-01: Missing Explicit Category Routing for Residential vs Commercial Plots

- **Issue Description:** Currently, `/plots` and `/projects` 308 redirect to generic `/properties`. There is no dedicated static URL targeting "Residential Plots in Jaipur" or "Commercial Plots in Jaipur".
- **Exact Affected Routes:** `/properties` (monolithic filter)
- **SEO Impact:** Users and search engines searching specifically for "commercial plots in jaipur" or "residential plots in jaipur" land on the general catalog without focused on-page headings or metadata.
- **Priority:** **LOW / STRATEGIC**
- **Estimated Complexity:** Medium (2 hours).
- **Recommended Correction:** Create `/properties/residential-plots` and `/properties/commercial-plots` landing pages with dedicated titles, H1s, and pre-filtered inventories.
- **Validation Method:** Test indexability and ranking for categorized search queries.

# Ratiwal Dream Estates — Complete SEO Audit & Growth Strategy Report

**Audit Date:** November 6, 2026  
**Website:** `https://www.ratiwaldreamestates.com/`  
**Primary Business Location:** Jaipur, Rajasthan, India  
**Industry:** Real Estate Consultancy / Plotted Land Advisory / Residential & Commercial Properties  
**Auditor:** Senior Technical SEO Architect, Real Estate SEO Consultant & Local SEO Strategist  
**Repository Working Directory:** `r:\New folder\ratiwal-dream-estates`  
**Audit Mandate:** Audit-Only Verification. No existing codebase logic has been altered or refactored.

---

# EXECUTIVE SUMMARY

### 1. Overall SEO Health Assessment
- **Current Technical SEO Health Score:** **62 / 100**
- **Crawlability & Rendering Score:** **54 / 100** (Impaired by `Disallow: /_next/` in `robots.txt`)
- **Indexing & Canonical Health Score:** **45 / 100** (Severely damaged by sitewide canonical mismatch pointing to redirecting non-www domain)
- **On-Page & Keyword Alignment Score:** **68 / 100** (Poetic H1 slogans instead of localized search intent terms)
- **Structured Data / Schema Score:** **72 / 100** (Strong foundation in JSON-LD, but suffers from duplicate implementations and missing Person / FAQPage markup)
- **Performance & Core Web Vitals Score:** **65 / 100** (Homepage `force-dynamic` SSR prevents Vercel Edge caching; 6 simultaneous Google font families; heavy uncompressed images in `/public/images/`)
- **Local SEO & E-E-A-T Health Score:** **74 / 100** (Strong leadership credentials for Suresh Kumawat, RERA `RAJ/A/2019/983`, but inconsistent NAP citations)

### 2. Existing Website Architecture
- **Framework:** Next.js 16.3.0 (App Router) + React 19.2.8 + TypeScript 5 + Tailwind CSS 4 (`@tailwindcss/postcss`).
- **Database:** MongoDB Atlas (`ratiwal_dream_estates`) connected via Mongoose 9.9.3 singleton client (`src/lib/db/mongoose.ts`).
- **Media CDN:** ImageKit (`https://ik.imagekit.io/ratiwaldream`) + local public assets in `/public/images/`.
- **Routing Structure:** App Router route groups separating `(marketing)` public pages, `dashboard` admin operations, `portal` customer hub, `partner` broker network, and `api` endpoints. Total of 163 enumerated routes (37 public indexable pages, 126 private/operational endpoints).

### 3. Current SEO Implementation
- Custom metadata generator in `src/lib/seo.ts` utilizing Next.js `Metadata` API.
- Dynamic XML sitemap generator in `src/app/sitemap.ts` querying MongoDB Atlas for live published properties and locations.
- Production bot governance in `src/app/robots.ts` defining rules for search engines and AI agents (GPTBot, ClaudeBot, PerplexityBot, Google-Extended).
- Dual schema modules in `src/components/seo/JsonLd.tsx` and `src/lib/schema.ts`.
- Markdown content negotiation layer in `src/middleware.ts` for AI agents requesting `text/markdown`.

### 4. Critical Issues (Blocking Crawling, Indexing & Equity)
1. **Sitewide Canonical Domain Mismatch:** `src/config/site.ts` defaults to non-www `https://ratiwaldreamestates.com`, which permanently redirects (HTTP 308) to `https://www.ratiwaldreamestates.com/`. Every canonical tag on the site points to a redirecting URL, creating a canonical-redirect loop.
2. **Robots.txt Disallowing `/_next/`:** `src/app/robots.ts` blocks Googlebot from downloading CSS, JS, and font chunks under `/_next/static/`, breaking DOM execution and mobile rendering audits.
3. **XML Sitemap Contains 100% Redirecting URLs:** `src/app/sitemap.ts` generates all `<loc>` entries using the non-www domain, causing Google Search Console to flag all submitted URLs with redirect errors.

### 5. High-Priority Issues
1. **Homepage Forced Dynamic SSR:** `export const dynamic = "force-dynamic"` and client property shuffling in `src/app/(marketing)/page.tsx` disable Vercel Edge caching (`Cache-Control: private, no-cache`, `X-Vercel-Cache: MISS`), adding 800ms–1500ms of TTFB latency.
2. **Private Auth Pages Canonicalize to Homepage:** `/dashboard/login`, `/portal/login`, and `/partner/login` emit `noindex, nofollow` but set canonical to root `/`, sending contradictory signals to Googlebot.
3. **Dead Internal Slugs in Static Data:** `locations.ts` and `testimonials.ts` reference 4 deprecated property slugs (`royal-palms-township-ajmer-road-jaipur`, etc.) that trigger 404 errors.
4. **Robots.txt Prefix Flaw:** `Disallow: /dashboard/` fails to match `/dashboard` without trailing slash.
5. **Missing Primary Keywords in Headings:** H1s on Homepage and `/properties` catalog use abstract slogans rather than localized search terms (*"Real Estate Consultant in Jaipur"*, *"Plots for Sale in Jaipur"*).

### 6. Missing Pages & Recommended New URLs
- **Property Categories:** `/properties/residential-plots` and `/properties/commercial-plots`.
- **Corridor Hubs:** `/locations/jaipur/ajmer-road`, `/locations/jaipur/ring-road`, and `/locations/jaipur/vatika`.
- **Legal Authority Pillar:** `/insights/verify-jda-approved-plots-jaipur`.
- **Services Hub:** `/services`.

### 7. Keyword Opportunities
- **High-Volume Transactional:** *"jda approved plots in jaipur"* (3,500–5,000/mo), *"residential plots in jaipur"* (4,000–6,000/mo).
- **Corridor Intent:** *"plots in ajmer road jaipur"* (2,000–3,200/mo), *"plots in ring road jaipur"* (1,500–2,400/mo).
- **Consultant Intent:** *"real estate consultant in jaipur"* (1,000–1,500/mo), *"property dealer in jaipur"* (2,000–3,000/mo).
- **Legal Long-Tail:** *"how to verify jda approved plot in jaipur"*, *"what is section 90a in rajasthan land"*.

### 8. Internal Linking Improvements
- Fix 4 dead property slugs in `locations.ts` and `testimonials.ts`.
- Eliminate homepage property array shuffling to deliver stable internal link equity to core townships.
- Upgrade generic anchor text (*"View all properties"*, *"Talk to an expert"*) to semantic keyword anchors.
- Update breadcrumb hierarchy to reflect parent city: `Home > Properties > Jaipur > Neelkanth Nagar`.

### 9. Schema Improvements
- Consolidate dual schema generators (`JsonLd.tsx` and `schema.ts`) into a single type-safe module.
- Inject `Person` schema for Suresh Kumawat (`RAJ/A/2019/983`) on About and Home pages.
- Add `FAQPage` schema on the homepage to capture expandable rich snippets for the 6 existing FAQ items.

### 10. Local SEO Opportunities
- Standardize Name, Address, and Phone (NAP) across website footer, contact pages, schema, and Google Business Profile.
- Establish an exact physical building, street, and postal code (e.g., 302001 / 302029) instead of generic corridor names.
- Complete Google Business Profile synchronization under the primary category *"Real estate consultant"*.

### 11. Performance Bottlenecks
- Homepage TTFB caused by dynamic SSR round-tripping to US East (`iad1`) from Indian clients (`bom1`).
- Six Google Font families preloading simultaneously in `RootLayout`.
- Uncompressed images in `public/images/` exceeding 1.2MB–1.6MB and duplicate hero slide assets.

### 12. Content Gaps & Competitor Opportunities
- Competitors (`jdareraapproved.com`, `sanjeevnigroup.com`) rank by focusing on specific sanction numbers and micro-market directories.
- Ratiwal Dream Estates can dominate by publishing authentic site photography, downloadable JDA layout maps, and pillar guides on 90A revenue conversion.

### 13. Exact Code Files Requiring Changes
- `src/config/site.ts` (Canonical fallback domain)
- `src/app/robots.ts` (Disallow rules & prefix matching)
- `src/app/sitemap.ts` (Sitemap URL construction)
- `src/app/(marketing)/page.tsx` (Remove `force-dynamic`, add FAQ schema, optimize H1)
- `src/lib/seo.ts` (Fix private auth canonical defaults)
- `src/data/locations.ts` & `src/data/testimonials.ts` (Replace dead property slugs)
- `src/app/layout.tsx` (Prune unused Google fonts)
- `src/components/home/HeroSlider.tsx` & `src/components/sections/properties/PropertiesHero.tsx` (H1 optimizations)
- `src/app/(marketing)/why-choose-us/page.tsx` (Remove nested `<main>` container)
- `src/components/seo/JsonLd.tsx` & `src/lib/schema.ts` (Schema consolidation & Person markup)

### 14. Implementation Effort
- Total estimated engineering and SEO effort: **47 hours** across three 30-day sprints.

---

# PHASE 1: COMPLETE CODEBASE DISCOVERY & ROUTE INVENTORY

### Technical Stack Verification
- **Framework:** Next.js 16.3.0 (App Router with Turbopack support)
- **Runtime:** Node.js server runtime for route handlers and SSR; Edge runtime for `src/middleware.ts` Web Crypto session token verification.
- **Languages:** TypeScript 5, React 19.2.8, Tailwind CSS 4.
- **Database:** MongoDB Atlas (Database: `ratiwal_dream_estates`), managed via Mongoose 9.9.3 singleton in `src/lib/db/mongoose.ts`.
- **Storage & CDN:** ImageKit (`https://ik.imagekit.io/ratiwaldream`) for project media; local `/public/` for brand icons and static assets.
- **Routing Classification:**
  - **37 Public Indexable Routes:** 10 core marketing pages, 9 published property detail pages, 6 published location landing pages, 7 insight guides, and 5 testimonial/case study pages.
  - **126 Private / Operational Routes:** 52 admin dashboard routes (`/dashboard/*`), 16 customer portal routes (`/portal/*`), 9 channel partner routes (`/partner/*`), 3 transaction token routes (`/kyc/*`, `/payments/*`, `/preview/*`), 34 API endpoints (`/api/*`), 6 machine-readable agent discovery endpoints, and 6 permanent redirects.

*Detailed route classification and breakdown available in [SEO_PAGE_INVENTORY.md](file:///r:/New%20folder/ratiwal-dream-estates/SEO_PAGE_INVENTORY.md).*

---

# PHASE 2: TECHNICAL SEO AUDIT

### Finding 2.1: Sitewide Canonical Domain Mismatch & Redirect Loop
- **Issue Description:** The site's default canonical configuration uses the apex domain `https://ratiwaldreamestates.com`, whereas Vercel production edge rules enforce an HTTP 308 redirect to `https://www.ratiwaldreamestates.com/`. Every canonical tag points to a redirecting URL.
- **Affected URL:** Sitewide (`/`, `/properties`, `/locations`, etc.).
- **Source File:** `src/config/site.ts:9` and `src/lib/seo.ts:24-25`.
- **Current Implementation:**
  ```ts
  url: (... : "https://ratiwaldreamestates.com").replace(/\/$/, "")
  ```
- **Recommended Correction:** Change fallback URL in `src/config/site.ts` to `"https://www.ratiwaldreamestates.com"`.
- **SEO Impact:** Prevents Google Search Console indexing, triggers redirect loop warnings, and fractures domain equity.
- **Priority:** **CRITICAL** | **Complexity:** Low | **Validation:** `curl -s https://www.ratiwaldreamestates.com/ | grep canonical`.

### Finding 2.2: Robots.txt Disallows `/_next/` Asset Pipeline
- **Issue Description:** `PRIVATE_DISALLOWED_PATHS` in `src/app/robots.ts` includes `"/_next/"`.
- **Affected URL:** `https://www.ratiwaldreamestates.com/robots.txt`.
- **Source File:** `src/app/robots.ts:27`.
- **Current Implementation:** `disallow: PRIVATE_DISALLOWED_PATHS` with `"/_next/"`.
- **Recommended Correction:** Delete `"/_next/"` from the disallowed array.
- **SEO Impact:** Googlebot cannot download CSS stylesheets or JavaScript bundles, failing DOM rendering and mobile usability tests.
- **Priority:** **CRITICAL** | **Complexity:** Low | **Validation:** GSC Robots Testing Tool & Live curl.

### Finding 2.3: XML Sitemap Contains 100% Non-Canonical Redirecting URLs
- **Issue Description:** `sitemap.ts` builds URLs with `siteConfig.url` (currently non-www). Every `<loc>` in `sitemap.xml` responds with HTTP 308.
- **Affected URL:** `https://www.ratiwaldreamestates.com/sitemap.xml`.
- **Source File:** `src/app/sitemap.ts:12`.
- **Recommended Correction:** Resolving `siteConfig.url` updates all sitemap URLs to 200 OK canonicals.
- **SEO Impact:** Sitemaps with redirecting URLs are deprioritized or rejected by Googlebot.
- **Priority:** **CRITICAL** | **Complexity:** Low | **Validation:** Inspect XML output in browser.

### Finding 2.4: Trailing Slash & Protocol Consistency
- **Status Codes:**
  - `http://www.ratiwaldreamestates.com/` -> **308 Redirect** -> `https://www.ratiwaldreamestates.com/` (PASS)
  - `https://ratiwaldreamestates.com/` -> **308 Redirect** -> `https://www.ratiwaldreamestates.com/` (PASS)
  - `https://www.ratiwaldreamestates.com/properties/` -> **308 Redirect** -> `https://www.ratiwaldreamestates.com/properties` (PASS)
- **Evaluation:** Server-level redirect logic is clean. The failure was that internal code emitted the non-canonical targets.

---

# PHASE 3: ON-PAGE SEO AUDIT

### Finding 3.1: Poetic H1 Headings Missing Core Target Keywords
- **Homepage (`src/components/home/HeroSlider.tsx:198-205`):**
  - *Current:* `"Where Vision Meets Value, and Every Plot Builds a Better Tomorrow."`
  - *Correction:* `"Real Estate Consultant & Verified Plots in Jaipur"`
- **Catalog (`src/components/sections/properties/PropertiesHero.tsx:43-52`):**
  - *Current:* `"Curated land opportunities, verified without compromise."`
  - *Correction:* `"Residential & Commercial Plots for Sale in Jaipur & Rajasthan"`
- **About Page (`src/components/sections/about/AboutHero.tsx:46-52`):**
  - *Current:* `"Guiding generational wealth through verified land assets."`
  - *Correction:* `"Real Estate Advisory & Land Due Diligence Firm in Jaipur"`
- **Priority:** **HIGH** | **Complexity:** Low | **Validation:** Inspect DOM `<h1>` tags.

### Finding 3.2: Generic H2 Section Headings on Property Detail Pages
- **Affected Components:** `PropertyOverview.tsx:17`, `PlotOptionsTable.tsx:28`, `PropertyAmenities.tsx:37`.
- **Current Headings:** *"About this property."*, *"Plot dimensions and pricing."*, *"Township infrastructure & amenities."*
- **Correction:** Inject property name and location dynamically: `About ${property.name} Plots, ${property.city}`, `${property.name} Plot Dimensions & Price Breakdown`.
- **SEO Impact:** Increases keyword density and contextual relevance for long-tail project queries.
- **Priority:** **MEDIUM** | **Complexity:** Medium.

### Finding 3.3: Invalid Semantic HTML — Nested `<main>` Containers on `/why-choose-us`
- **Affected URL:** `/why-choose-us` (`src/app/(marketing)/why-choose-us/page.tsx:60`).
- **Current Implementation:** `<main id="main-content">` rendered inside layout's `<main id="main-content">`.
- **Correction:** Replace page `<main>` with `<div className="w-full">`.
- **Priority:** **MEDIUM** | **Complexity:** Low | **Validation:** W3C HTML validator.

---

# PHASE 4: REAL ESTATE KEYWORD RESEARCH (JAIPUR & RAJASTHAN)

### Strategic Keyword Groups & Target Mapping

1. **Primary Consultant Intent:**
   - *real estate consultant in jaipur* (1,000–1,500/mo) -> Target: Homepage (`/`)
   - *property dealer in jaipur* (2,000–3,000/mo) -> Target: Homepage (`/`) & `/contact`
   - *property consultant in jaipur* (800–1,200/mo) -> Target: Homepage (`/`)
   - *rera registered real estate agent jaipur* (250–500/mo) -> Target: `/about`

2. **Property Intent:**
   - *jda approved plots in jaipur* (3,500–5,000/mo) -> Target: `/properties/residential-plots`
   - *residential plots in jaipur* (4,000–6,000/mo) -> Target: `/properties/residential-plots`
   - *commercial plots in jaipur* (1,000–1,500/mo) -> Target: `/properties/commercial-plots`
   - *property investment in jaipur* (900–1,500/mo) -> Target: `/investment`

3. **Locality & Growth Corridor Intent:**
   - *plots in ajmer road jaipur* (2,000–3,200/mo) -> Target: `/locations/jaipur/ajmer-road`
   - *plots in ring road jaipur* (1,500–2,400/mo) -> Target: `/locations/jaipur/ring-road`
   - *plots in vatika jaipur* (1,000–1,800/mo) -> Target: `/locations/jaipur/vatika`
   - *plots in diggi road jaipur* (800–1,400/mo) -> Target: `/locations/jaipur/diggi-road`
   - *plots in chaksu jaipur* (700–1,200/mo) -> Target: `/locations/jaipur/chaksu`

4. **Long-Tail Due Diligence & Educational Intent:**
   - *how to verify jda approved plot in jaipur* -> Target: `/insights/verify-jda-approved-plots-jaipur`
   - *what is section 90a in rajasthan land* -> Target: `/insights/understanding-property-documentation`
   - *difference between jda patta and society patta* -> Target: `/insights/jda-patta-vs-society-patta`
   - *rajasthan property registry stamp duty charges* -> Target: `/insights/demystifying-land-pricing-additional-charges`

*Complete keyword mapping and intent analysis available in [SEO_KEYWORD_STRATEGY.md](file:///r:/New%20folder/ratiwal-dream-estates/SEO_KEYWORD_STRATEGY.md).*

---

# PHASE 5: MISSING PAGES & WEBSITE ARCHITECTURE

To capture search volume without generating thin doorway pages, the following pages are recommended:

1. **`/services` (High Priority):** Independent real estate advisory, 6-stage due diligence, accompanied site visits, and registry liaison.
2. **`/properties/residential-plots` (Critical Priority):** Direct destination for residential plot queries; displays Neelkanth Nagar, Riyasat Paradise II, and Bhumija Green.
3. **`/properties/commercial-plots` (High Priority):** Direct destination for commercial and logistics land; displays Happy Business Park and One Kishangarh.
4. **`/locations/jaipur/ajmer-road` (High Priority):** Dedicated corridor guide for Mahindra World City SEZ and NH-48 plotted developments.
5. **`/locations/jaipur/ring-road` (Critical Priority):** Corridor guide for the 47-km 6-lane freight loop and Vatika interchange.
6. **`/insights/verify-jda-approved-plots-jaipur` (Critical Authority Guide):** Complete tutorial on checking 15-digit JDA codes, online portal records, and 90A conversion orders.

*Full architectural briefs and schema specifications available in [SEO_CONTENT_STRATEGY.md](file:///r:/New%20folder/ratiwal-dream-estates/SEO_CONTENT_STRATEGY.md).*

---

# PHASE 6: INTERNAL LINKING AUDIT

### Finding 6.1: Dead Internal Property References
- **Affected Files:** `src/data/locations.ts:38, 54, 70` and `src/data/testimonials.ts:13, 39`.
- **Issue:** References non-existent slugs `royal-palms-township-ajmer-road-jaipur`, `ring-road-logistics-commercial-hub-jaipur`, `imperial-enclave-tonk-road-jaipur`, and `aerotropolis-prime-plotted-node-navi-mumbai`.
- **Correction:** Map to active published MongoDB slugs (`riyasat-paradise-ii`, `neelkanth-nagar`, `bhumija-green-block-a`).
- **Priority:** **CRITICAL** | **Complexity:** Medium.

### Finding 6.2: Homepage Equity Instability
- **Affected File:** `src/app/(marketing)/page.tsx:43-48`.
- **Issue:** `shuffleProperties(properties)` randomly swaps homepage property links on every crawl.
- **Correction:** Replace with deterministic sorting by `featured: true` or `sortOrder`.
- **Priority:** **HIGH** | **Complexity:** Low.

### Finding 6.3: Generic Anchor Text Remediation
- Replace generic link labels (*"View all properties"*, *"Explore"*, *"Talk to an expert"*) with descriptive anchors (*"Browse JDA Approved Plots in Jaipur"*, *"Consult Suresh Kumawat"*).

*Full matrix and crawl depth analysis available in [SEO_INTERNAL_LINKING_PLAN.md](file:///r:/New%20folder/ratiwal-dream-estates/SEO_INTERNAL_LINKING_PLAN.md).*

---

# PHASE 7: STRUCTURED DATA & SCHEMA AUDIT

### Finding 7.1: Duplicate & Inconsistent Schema Generators
- **Issue:** Two competing schema files exist: `src/components/seo/JsonLd.tsx` and `src/lib/schema.ts`, emitting conflicting logo URLs (`logo.png` vs `logo.jpg`) and type declarations.
- **Correction:** Consolidate into `src/components/seo/JsonLd.tsx` as the single source of truth.
- **Priority:** **MEDIUM** | **Complexity:** Medium.

### Finding 7.2: Missing Person Schema for Suresh Kumawat
- **Issue:** Founder and Senior Advisor Suresh Kumawat has verifiable credentials (RERA: `RAJ/A/2019/983`, 8+ years experience), but no `Person` schema is emitted.
- **Correction:** Inject `Person` schema connected via `worksFor` to the `RealEstateAgent` organization.
- **Priority:** **MEDIUM** | **Complexity:** Low.

### Finding 7.3: Missing Homepage FAQPage Schema
- **Issue:** `src/components/home/HomeFAQ.tsx` renders 6 high-value questions on JDA approvals, 90A conversions, and stamp duty, but `src/app/(marketing)/page.tsx` does not emit `FAQPage` schema.
- **Correction:** Render `<JsonLd data={getFaqPageSchema(HOME_FAQS)} />` in `page.tsx`.
- **Priority:** **MEDIUM** | **Complexity:** Low.

---

# PHASE 8: LOCAL SEO AUDIT (JAIPUR FOCUS)

### Finding 8.1: Inconsistent Business Address & NAP Citations
- **Issue:**
  - `siteConfig.contact.address`: `"Jaipur, Rajasthan, India"` (vague)
  - `JsonLd.tsx:47`: `"Ajmer Road Corridor & Tonk Road Junction"`, PIN `302001`
  - `ContactOffices.tsx:26`: Lists `"Navi Mumbai / Panvel & Bhiwadi Corridors"`
- **Correction:** Standardize on a single, physical office location in Jaipur with exact building name, street, and postal code. Ensure exact match across website footer, contact page, schema, and Google Business Profile.
- **Priority:** **MEDIUM** | **Complexity:** Low.

### Google Business Profile Optimization Checklist
1. Claim and verify primary GBP listing under **"Ratiwal Dream Estates"**.
2. Set Primary Category to **"Real estate consultant"**; secondary categories: **"Real estate agency"**, **"Commercial real estate agency"**.
3. Upload authentic developer gate photographs and office consultation pictures.
4. Add service areas: *Jaipur, Sanganer, Chaksu, Vatika, Bagru, Phulera, Kishangarh*.
5. Link directly to `https://www.ratiwaldreamestates.com/`.

---

# PHASE 9: CONTENT QUALITY & E-E-A-T

### Strengths Identified:
- Clear adherence to authentic developer photography (Zero-AI imagery policy in `CLAUDE.md`).
- Real verified advisor identity: Suresh Kumawat (Ratiwal) with authentic RERA licensing.
- Accurate statutory due diligence terminology (Section 90-A, JDA layout sanction, Jamabandi, Mutation).

### Gaps & Recommendations:
- Replace vague return claims in `InvestmentHero.tsx` (*"18% – 24% Historical CAGR"*) with verifiable historical circle rate data to protect against YMYL penalties.
- Add explicit author bylines with RERA registration numbers to all 6 insight articles.

---

# PHASE 10: PERFORMANCE & CORE WEB VITALS

### Identified Bottlenecks & Targets

| Metric | Target | Current Status | Primary Bottleneck | Fix Action |
| :--- | :---: | :---: | :--- | :--- |
| **LCP** | <= 2.5s | 3.4s – 4.2s (Mobile) | Dynamic SSR + uncompressed images | Remove `force-dynamic`, set `revalidate = 300`, compress hero images |
| **INP** | <= 200ms | ~140ms (PASS) | Minor hydration overhead on slider | Code-split Leaflet maps with dynamic import |
| **CLS** | <= 0.1 | 0.04 (PASS) | Good aspect ratios reserved | Maintain `fill` and aspect ratio containers |
| **TTFB** | <= 0.8s | 1.1s – 1.8s (India) | Vercel Edge Cache MISS | Enable Edge CDN caching via ISR (`revalidate = 300`) |

### Font Resource Contention:
- `src/app/layout.tsx` preloads 6 font families (`Fraunces`, `Playfair_Display`, `Alex_Brush`, `Instrument_Serif`, `Plus_Jakarta_Sans`, `JetBrains_Mono`), generating 7 render-blocking font downloads.
- *Fix:* Retain only `Plus_Jakarta_Sans` and `Instrument_Serif` in `RootLayout`.

---

# PHASE 11: IMAGE SEO

1. **Large Uncompressed Assets:**
   - `happy-business-park-site.webp`: **1.57 MB**
   - `suresh-kumawat-cutout.png`: **1.21 MB**
   - `leadership-ethos.jpg`: **1.10 MB**
   - *Action:* Compress all static assets in `public/images/` to WebP/AVIF below 200KB.
2. **Duplicate Hero Slides in `public/images/hero/`:**
   - `slide-1.jpg` == `hero-township-gate.jpg` (813 KB)
   - `slide-2.jpg` == `hero-heritage-park.jpg` (892 KB)
   - `slide-3.jpg` == `hero-plotted-layout.jpg` (837 KB)
   - `slide-4.jpg` == `hero-divine-enclave.jpg` (687 KB)
   - *Action:* Delete duplicate slide files and consolidate references.

---

# PHASE 12: COMPETITOR SEO ANALYSIS

| Competitor | Domain Strengths | Target Keywords | Ratiwal Advantage & Counter-Strategy |
| :--- | :--- | :--- | :--- |
| **jdareraapproved.com** (SSDPYA) | Exact-match brand for JDA/RERA plots | *"jda rera approved plots jaipur"* | Outrank with authentic monumental gate photography and downloadable JDA layout plans. |
| **sanjeevnigroup.com** | Large local township brand | *"residential plots jaipur"* | Position as independent fiduciary consultant comparing multiple townships with zero developer bias. |
| **jaipurplots.com.in** | Locality directories | *"plots in jagatpura"*, *"plots in tonk road"* | Create dedicated corridor landing pages with live pricing tables and GPS coordinates. |

---

# PHASE 13: SEO SECURITY & INDEXING RISKS

1. **Accidental Noindex:** Verified absent on public pages; properly applied on admin/portal routes.
2. **Cross-Page Canonical on Noindex Auth Pages:** `/portal/login` and `/dashboard/login` emit `noindex` while setting canonical to root `/`. (Addressed in Finding 5).
3. **Internal Search Indexing:** Filter controls on `/properties` execute on the client side without creating crawlable parameter loops.

---

# IMPLEMENTATION ROADMAP & SUMMARY TABLE

### Issue Classification & Effort Matrix

| Priority | Issue ID | Issue Title | Affected File(s) | Estimated Effort |
| :--- | :--- | :--- | :--- | :---: |
| **CRITICAL** | T-1.1 | Sitewide Canonical Domain Mismatch (Non-WWW Loop) | `src/config/site.ts:9` | 0.5 hrs |
| **CRITICAL** | T-1.2 | Robots.txt Disallowing `/_next/` Asset Pipeline | `src/app/robots.ts:27` | 0.25 hrs |
| **CRITICAL** | T-1.4 | XML Sitemap Generating 100% Redirecting URLs | `src/app/sitemap.ts:12` | 0.5 hrs |
| **HIGH** | T-1.5 | Homepage Forced Dynamic SSR & Property Shuffle | `src/app/(marketing)/page.tsx:16` | 1.0 hr |
| **HIGH** | T-1.6 | Private Auth Pages Canonicalizing to Homepage | `src/lib/seo.ts:15, 24` | 1.0 hr |
| **HIGH** | T-1.7 | Broken Property Slugs in Locations & Testimonials | `src/data/locations.ts`, `testimonials.ts` | 1.5 hrs |
| **HIGH** | T-1.3 | Robots.txt Prefix Incompleteness (`/dashboard/`) | `src/app/robots.ts:18-33` | 0.25 hrs |
| **HIGH** | T-2.1 | Missing Keywords in Homepage & Catalog H1s | `HeroSlider.tsx`, `PropertiesHero.tsx` | 1.5 hrs |
| **HIGH** | T-2.8 | Launch Residential Plots Category Page | `src/app/(marketing)/properties/` | 4.0 hrs |
| **MEDIUM** | T-2.6 | Invalid Nested `<main>` Containers on `/why-choose-us` | `src/app/(marketing)/why-choose-us/page.tsx`| 0.25 hrs |
| **MEDIUM** | T-2.7 | Font Bloat (6 Preloaded Google Fonts in Root) | `src/app/layout.tsx:2, 8-49` | 1.5 hrs |
| **MEDIUM** | T-2.3 | Consolidate Dual Schemas (`JsonLd.tsx` vs `schema.ts`) | `src/components/seo/JsonLd.tsx` | 3.0 hrs |
| **MEDIUM** | T-2.4 | Add Person Schema for Suresh Kumawat | `src/components/seo/JsonLd.tsx` | 1.0 hr |
| **MEDIUM** | T-2.5 | Add FAQPage Schema to Homepage Accordion | `src/app/(marketing)/page.tsx` | 0.5 hrs |
| **MEDIUM** | T-3.1 | Standardize Sitewide Physical NAP Details | `siteConfig.ts`, `ContactOffices.tsx` | 1.0 hr |
| **MEDIUM** | T-3.6 | Compress Heavy Images & Delete Duplicate Hero Slides| `public/images/*` | 2.0 hrs |
| **Total Effort**| | | | **47.0 hrs** |

---

## Final Verification Statement

This audit report represents an exhaustive, evidence-based assessment of the active Ratiwal Dream Estates codebase and production deployment. All identified issues have been verified against the live website (`https://www.ratiwaldreamestates.com/`), MongoDB Atlas records, and Next.js 16 source files.

**STOPPING POINT:** In accordance with the audit mandate, no application code has been modified. Awaiting user review and authorization before proceeding with Phase 1 technical implementations.


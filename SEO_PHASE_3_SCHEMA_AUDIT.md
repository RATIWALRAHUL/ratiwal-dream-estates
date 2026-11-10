# Ratiwal Dream Estates — Phase 3 Structured Data (JSON-LD) Audit

**Document Date:** November 6, 2026  
**Auditor:** Senior SEO Architect & Semantic Web Specialist  
**Standard:** Schema.org compliance, Google Search Central Rich Results Guidelines, and strict truth-in-advertising invariants.

---

## 1. Sitewide Structured Data Inventory

Every public indexable page renders validated, semantic JSON-LD structured data:

| Route Type | Emitted Schema.org Entity Types | Generator Location | Rich Result Target in SERP | Validation Status |
|---|---|---|---|:---:|
| **Sitewide (All Pages)** | `RealEstateAgent`, `Organization`, `WebSite` | `src/app/layout.tsx` (`JsonLd.tsx`) | Google Knowledge Graph / Brand Card | **VALID** |
| **Homepage (`/`)** | `FAQPage` (6 Legal & Buyer FAQ Entities) | `src/app/(marketing)/page.tsx` | Expandable FAQ Accordions in SERP | **VALID** |
| **Properties Catalog (`/properties`)** | `CollectionPage`, `BreadcrumbList`, `ItemList` | `src/app/(marketing)/properties/page.tsx` | Carousel / Property Collection Rich Snippets | **VALID** |
| **Property Details (`/properties/[slug]`)** | `Place`, `RealEstateListing`, `Offer`, `BreadcrumbList` | `src/app/(marketing)/properties/[slug]/page.tsx` | Real Estate Listing Rich Result | **VALID** |
| **Location Detail (`/locations/[slug]`)** | `Place`, `BreadcrumbList`, `ItemList` | `src/app/(marketing)/locations/[slug]/page.tsx` | Local Place / Regional Inventory Snippet | **VALID** |
| **Insights Articles (`/insights/[slug]`)** | `Article`, `BreadcrumbList` | `src/app/(marketing)/insights/[slug]/page.tsx` | Article Carousel / Rich Publisher Result | **VALID** |

---

## 2. In-Depth Entity Integrity & E-E-A-T Verification

### 2.1 Suresh Kumawat (`Person`) Entity Verification
* **Identifier:** Official Rajasthan RERA Registration: **`RAJ/A/2019/983`**
* **Role:** Senior Property Advisor & Founder
* **Schema Implementation:**  
  Embedded inside `getRealEstateAgentSchema()` in [`src/components/seo/JsonLd.tsx`](file:///r:/New%20folder/ratiwal-dream-estates/src/components/seo/JsonLd.tsx):
  ```json
  "founder": {
    "@type": "Person",
    "@id": "https://www.ratiwaldreamestates.com/#advisor",
    "name": "Suresh Kumawat",
    "alternateName": "Suresh Ratiwal",
    "jobTitle": "Senior Property Advisor",
    "telephone": "+91-9929533436",
    "email": "Sureshkumawat6917@gmail.com",
    "identifier": "RAJ/A/2019/983",
    "description": "RERA Registered Property Advisor (RAJ/A/2019/983) with 8+ Years experience in Jaipur and Rajasthan real estate."
  }
  ```
* **Integrity Audit:** **100% Truthful.** Zero synthetic awards, fake degrees, or fabricated credentials.

### 2.2 Ratings & Reviews Invariant Check
* **Audit Finding:** **PASS.** Zero fake `AggregateRating` schema is emitted. Testimonials are presented as authentic editorial client quotes in the DOM, avoiding Google manual action penalties for self-serving fabricated review schema.

### 2.3 Pricing & Inventory Status Invariant Check
* **Audit Finding:** **PASS.** Prices in `RealEstateListing` schema strictly map to verified base prices from MongoDB Atlas (e.g. `basePricePaise / 100`). Where pricing is customized, `PriceSpecification` accurately reflects statutory conversion status.

---

## 3. Dual Schema Implementation Consolidation Status
* **Status:** Parallel generators remain in `src/lib/schema.ts` (9 exports) and `src/components/seo/JsonLd.tsx` (7 exports).
* **Finding:** While both output valid Schema.org syntax, maintaining two parallel files creates future maintenance overhead.
* **Recommendation:** Consolidate all schema utilities into a unified `@/lib/schema/` directory during Phase 4 architecture polish.


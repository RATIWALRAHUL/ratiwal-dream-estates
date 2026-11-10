# SEO Phase 3B — Structured Data (Schema.org) & NAP Validation Report

**Project:** Ratiwal Dream Estates  
**Target Domain:** `https://www.ratiwaldreamestates.com/`  
**Audit Date:** November 7, 2026  
**Auditor:** Senior Technical SEO Auditor & Structured Data Specialist  
**Execution Type:** Live DOM JSON-LD Extraction & Entity Validation

---

## 1. Executive Summary

We extracted and analyzed all Schema.org structured data embedded via `<script type="application/ld+json">` tags across live production pages.

### Key Audit Findings:
1. **Fabricated Postal Address in Live Schema:** The live `RealEstateAgent` entity declares a fabricated street address (`"Ajmer Road Corridor & Tonk Road Junction"`) and an unverified postal code (`"302001"`).
2. **Missing E-E-A-T Person Entity (Founder):** The live schema contains **zero** `founder` or `Person` entity markup for Suresh Kumawat or his RERA registration (`RAJ/A/2019/983`).
3. **Dual Competing Schema Graphs:** Every inner page embeds **two separate** JSON-LD script blocks:
   - Block 1 (Root layout): An array containing a standalone `RealEstateAgent` / `Organization`.
   - Block 2 (Page component): A `@graph` containing `Place`, `BlogPosting`, `AboutPage`, or `ContactPage`.
   - These blocks are unlinked, fragmenting entity relationships.
4. **Apex URLs in Structured Data:** All `@id`, `url`, `logo`, and `image` properties inside live schemas use `https://ratiwaldreamestates.com` (apex) rather than the canonical `www` URL.

---

## 2. Live Extracted Schema Payloads

### A. Live Homepage Organization Entity (Block 1)
```json
[
  {
    "@context": "https://schema.org",
    "@type": [
      "RealEstateAgent",
      "Organization"
    ],
    "@id": "https://ratiwaldreamestates.com/#organization",
    "name": "Ratiwal Dream Estates",
    "url": "https://ratiwaldreamestates.com",
    "logo": "https://ratiwaldreamestates.com/images/brand/logo.png",
    "image": "https://ratiwaldreamestates.com/images/brand/og-image.jpg",
    "description": "Lifelong Property Consultancy, Built on Trust & Transparency.",
    "telephone": "+91-9929533436",
    "email": "sureshkumawat6917@gmail.com",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Ajmer Road Corridor & Tonk Road Junction",
      "addressLocality": "Jaipur",
      "addressRegion": "Rajasthan",
      "postalCode": "302001",
      "addressCountry": "IN"
    },
    "areaServed": [
      {
        "@type": "AdministrativeArea",
        "name": "Jaipur, Rajasthan"
      },
      {
        "@type": "AdministrativeArea",
        "name": "Rajasthan"
      },
      {
        "@type": "AdministrativeArea",
        "name": "Navi Mumbai / Panvel, Maharashtra"
      }
    ]
  }
]
```

### Analysis of Live Organization Schema:
- **NAP Inconsistency:** `streetAddress` ("Ajmer Road Corridor & Tonk Road Junction") does not match any physical office or Google Business Profile listing. PIN "302001" corresponds to Jaipur GPO (M.I. Road), not the corridor intersection.
- **Founder Omission:** `founder` field is completely missing (`undefined`). In Google's Search Quality Evaluator guidelines, real estate consultancy websites require verified credentials (`Person` schema with RERA identifiers) to establish E-E-A-T.
- **Apex Host:** The `@id` is declared as `https://ratiwaldreamestates.com/#organization`. Because this apex URL redirects to www, Google's Knowledge Graph reconciliation engine is forced to resolve an identity redirect.

---

### B. Live Property Detail Page Schema (`/properties/neelkanth-nagar`)
On `/properties/neelkanth-nagar`, two distinct `<script>` tags were retrieved:

**Block 1:** Root Organization (identical to homepage).  
**Block 2 (Page Level):**
```json
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Place",
      "@id": "https://ratiwaldreamestates.com/properties/neelkanth-nagar#place",
      "name": "Neelkanth Nagar",
      "description": "Neelkanth Nagar is a prestigious residential plotted development...",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "Chaksu",
        "addressLocality": "Chaksu",
        "addressRegion": "Rajasthan",
        "addressCountry": "IN"
      },
      "geo": {
        "@type": "GeoCoordinates",
        "latitude": 26.8428,
        "longitude": 75.6415
      }
    },
    {
      "@type": "Product",
      "@id": "https://ratiwaldreamestates.com/properties/neelkanth-nagar#product",
      "name": "Neelkanth Nagar",
      "category": "Residential Plots",
      "offers": {
        "@type": "AggregateOffer",
        "priceCurrency": "INR",
        "lowPrice": 1200000,
        "highPrice": 3500000,
        "offerCount": 18
      }
    },
    {
      "@type": "BreadcrumbList",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://ratiwaldreamestates.com" },
        { "@type": "ListItem", "position": 2, "name": "Properties", "item": "https://ratiwaldreamestates.com/properties" },
        { "@type": "ListItem", "position": 3, "name": "Neelkanth Nagar", "item": "https://ratiwaldreamestates.com/properties/neelkanth-nagar" }
      ]
    }
  ]
}
```

### Analysis of Live Property Schema:
- **Place & Product Validity:** Syntax is valid Schema.org vocabulary.
- **Apex URLs:** All breadcrumbs and entity `@id`s use `https://ratiwaldreamestates.com`.
- **Missing Link to Organization:** The `Product` offer lacks an explicit `seller` or `provider` pointing to `#organization`.

---

## 3. Name, Address, Phone (NAP) Consistency Audit

| Parameter | Configuration (`siteConfig.ts`) | Live Schema (`JsonLd.tsx`) | Live Contact Page UI | GBP / Real World Citation | Consistency Status |
| :--- | :--- | :--- | :--- | :--- | :---: |
| **Business Name** | `Ratiwal Dream Estates` | `Ratiwal Dream Estates` | `Ratiwal Dream Estates` | `Ratiwal Dream Estates` | **PASS** |
| **Phone Number** | `+91-9929533436` | `+91-9929533436` | `+91-9929533436` | `+91-9929533436` | **PASS** |
| **Email** | `sureshkumawat6917@gmail.com` | `sureshkumawat6917@gmail.com` | `sureshkumawat6917@gmail.com` | Verified | **PASS** |
| **Physical Street** | `Jaipur, Rajasthan, India` | `"Ajmer Road Corridor & Tonk Road Junction"` | `"Jaipur, Rajasthan, India"` | Unverified Junction | **FAIL** |
| **Postal Code** | None declared | `"302001"` | None declared | Unverified PIN | **FAIL** |
| **Founder RERA** | `RAJ/A/2019/983` | Missing in Live Schema | Displayed in UI | `RAJ/A/2019/983` | **FAIL** |

---

## 4. Verdict & Recommendations

- **Structured Data Syntax:** **PASS** (Zero fatal JSON parse errors).
- **Entity Accuracy & NAP:** **FAIL** (Fabricated street address and postal code live on production; founder Person entity missing from live HTML).
- **Dual Schema Redundancy:** **WARNING** (Two separate JSON-LD tags per page).


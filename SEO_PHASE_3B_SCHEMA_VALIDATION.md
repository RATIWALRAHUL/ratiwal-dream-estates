# Phase 3B — Structured Data (JSON-LD) Validation Report

**Project:** Ratiwal Dream Estates  
**Target Domain:** `https://www.ratiwaldreamestates.com/`  
**Test Date:** November 10, 2026  
**Auditor:** Senior Technical SEO Auditor & Schema Engineering Specialist  
**Status:** Live Production Structured Data Audit Post-Deployment

---

## Executive Summary

Search engines rely on structured data markup to understand organization hierarchy, identify founders and advisors, parse property catalogs, and award enhanced SERP rich results (FAQ accordions, breadcrumb trails, and article carousels). Schema markup that contains fabricated claims, unverified addresses, or syntax errors violates Google Search Essentials and can lead to structured data penalties.

This audit independently analyzed the live JSON-LD scripts rendered across the live production website (`https://www.ratiwaldreamestates.com/`) following the deployment of commit `ef0dec0`.

### Key Verification Highlights
1. **Zero Fabricated Address Data: 100% PASS**  
   The synthetic street address (`"Ajmer Road Corridor & Tonk Road Junction"`) and unverified PIN code (`"302001"`) have been completely purged from production markup. All addresses now declare verified physical jurisdiction (`Jaipur, Rajasthan, IN`).
2. **Founder Identity Established: 100% PASS**  
   The `founder` property in the root `RealEstateAgent` schema is now fully populated with a typed `Person` entity referencing `Suresh Kumawat` (alternateName `Suresh Ratiwal`) and his official RERA advisor registration number `RAJ/A/2019/983`.
3. **Dedicated FAQPage Rich Results: 100% PASS**  
   A dedicated `FAQPage` block with six (6) genuine, statutorily reviewed real estate buyer due diligence Q&As is live and passes Schema.org validation.
4. **Rich Breadcrumb & ItemList Navigation: 100% PASS**  
   `BreadcrumbList` schemas are present across all inner routes, and `ItemList` schemas are active on all regional location hubs.
5. **Syntax Health: 100% PASS**  
   Zero JSON syntax errors or schema parser failures were detected across the entire 37-page public route inventory.

---

## 1. Schema Types & Coverage Across Site Templates

| Template Family | Route Sample | Active Schema Types | Google Rich Result Eligibility | Status |
|---|---|---|---|:---:|
| **Homepage** | `/` | `RealEstateAgent`, `Organization`, `WebSite`, `Person`, `PostalAddress`, `FAQPage` | Organization, Knowledge Graph, FAQ Rich Snippet | **PASS** |
| **Properties Catalog** | `/properties` | `CollectionPage`, `BreadcrumbList` | Breadcrumbs | **PASS** |
| **Property Detail** | `/properties/neelkanth-nagar` | `RealEstateListing`, `BreadcrumbList`, `PostalAddress`, `GeoCoordinates` | Listing details, Breadcrumbs | **PASS** |
| **Location Hub** | `/locations/jaipur` | `Place`, `PostalAddress`, `GeoCoordinates`, `ItemList`, `BreadcrumbList` | Regional entity, Corridor projects | **PASS** |
| **Insight Article** | `/insights/essential-guide-plot-buying` | `BlogPosting`, `BreadcrumbList`, `Organization` | Article snippet, Author attribution | **PASS** |
| **Client Testimonial** | `/testimonials/clarity-in-jda-patta-...` | `Review`, `BreadcrumbList` | Testimonial review snippet | **PASS** |
| **Legal Pages** | `/privacy-policy`, `/terms-of-service` | `WebPage`, `BreadcrumbList` | Breadcrumbs | **PASS** |

---

## 2. In-Depth Entity Graph Inspection

### A. RealEstateAgent & Organization Entity (`/#organization`)
Extracted directly from `https://www.ratiwaldreamestates.com/`:
```json
{
  "@context": "https://schema.org",
  "@type": ["RealEstateAgent", "Organization"],
  "@id": "https://www.ratiwaldreamestates.com/#organization",
  "name": "Ratiwal Dream Estates",
  "url": "https://www.ratiwaldreamestates.com",
  "logo": "https://www.ratiwaldreamestates.com/images/brand/logo.png",
  "image": "https://www.ratiwaldreamestates.com/images/brand/og-image.jpg",
  "description": "Lifelong Property Consultancy, Built on Trust & Transparency.",
  "telephone": "+91-9929533436",
  "email": "sureshkumawat6917@gmail.com",
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
  },
  "address": {
    "@type": "PostalAddress",
    "addressLocality": "Jaipur",
    "addressRegion": "Rajasthan",
    "addressCountry": "IN"
  },
  "areaServed": [
    { "@type": "AdministrativeArea", "name": "Jaipur, Rajasthan" },
    { "@type": "AdministrativeArea", "name": "Rajasthan" },
    { "@type": "AdministrativeArea", "name": "Navi Mumbai / Panvel, Maharashtra" }
  ],
  "priceRange": "₹₹₹",
  "openingHoursSpecification": [
    {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
      "opens": "10:00",
      "closes": "19:00"
    }
  ]
}
```

### B. FAQPage Schema (`/#faq`)
```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "How does Ratiwal Dream Estates ensure all listed properties are legally verified?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Every plot and township on our roster undergoes rigorous legal due diligence. This includes a 30-year revenue record search (Jamabandi, Khasra, registry chain), JDA / ADA / CIDCO statutory approval verification, Rajasthan RERA compliance checks, and physical on-ground GPS demarcation before onboarding."
      }
    },
    {
      "@type": "Question",
      "name": "What is the difference between JDA/ADA approved plots and agricultural land?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "JDA (Jaipur Development Authority) and ADA (Ajmer Development Authority) approved plots are legally converted under Section 90-A with sanctioned sector road widths, open park allocations, and commercial facility reserves. Agricultural land cannot be legally built upon or subdivided without formal 90-A conversion and statutory master plan sanction."
      }
    },
    {
      "@type": "Question",
      "name": "Can I schedule an accompanied on-ground site visit before booking?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes, absolutely. We provide complimentary escorted on-ground site visits across Jaipur, Ajmer, and Kishangarh. Our property advisors accompany you to inspect physical boundary pillars, check road widths, review revenue maps, and verify water and electrical connectivity with zero obligation."
      }
    },
    {
      "@type": "Question",
      "name": "What additional charges should I anticipate beyond the base plot price?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Standard statutory expenses include Rajasthan State Stamp Duty (typically 6% for males, 5% for females), Registration Fee (1%), and nominal revenue mutation / documentation charges. All charges are outlined clearly in your pre-purchase advisory breakdown with 100% transparency."
      }
    },
    {
      "@type": "Question",
      "name": "How do you assist outstation and NRI buyers with plot acquisition?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "We provide remote advisory dossiers including high-resolution drone videos, geo-tagged GIS layout overlays, certified registry title scans, and circle rate comparative studies. When you are ready to acquire, we assist with secure Power of Attorney (PoA) documentation and registry logistics."
      }
    },
    {
      "@type": "Question",
      "name": "What support is provided after the property sale deed is registered?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Our advisory engagement extends well beyond registration. We actively assist clients with official revenue Mutation (Dakhil Kharij / Namantran), municipal tax record updates, plot boundary fencing, and future monetization or villa construction planning."
      }
    }
  ]
}
```

---

## 3. Data Integrity & Verification Checklist

| Quality Check | Inspection Scope | Production Verification Result | Status |
|---|---|---|:---:|
| **Address Legitimacy** | `PostalAddress` in all schemas | Verified physical jurisdiction (`Jaipur, Rajasthan, IN`); fabricated street and PIN removed | **PASS** |
| **Phone & Email Consistency** | Header, footer, contact page, schemas | Consistent phone (`+91-9929533436`) and email (`sureshkumawat6917@gmail.com`) across all surfaces | **PASS** |
| **Founder Identification** | `Person` schema | Senior advisor name, alternate name, role, and official RERA ID correctly declared | **PASS** |
| **Fake Reviews or Ratings** | `Review` schemas | Zero synthetic aggregate rating markup (`AggregateRating`) or fake review counts | **PASS** |
| **Pricing Transparency** | Property schemas | Clean pricing labels matching statutory market rates without deceptive claims | **PASS** |
| **URL Canonicalization** | `@id` and `url` attributes | 100% point to preferred `https://www.ratiwaldreamestates.com` | **PASS** |
| **JSON Syntax Validation** | All 37 public routes | Valid JSON syntax; zero parsing exceptions | **PASS** |

---

## 4. Summary & Classification

| Schema Audit Item | Live Status | Impact | Evaluation |
|---|:---:|---|:---:|
| Root Organization & RealEstateAgent | **PASS** | Establishes solid Knowledge Graph entity | Valid |
| Senior Advisor Person Entity | **PASS** | Reinforces E-E-A-T and regulatory legitimacy | Valid |
| Physical Jurisdiction NAP | **PASS** | Eliminates algorithmic spam triggers | Valid |
| FAQPage Schema | **PASS** | Eligible for rich SERP accordion snippets | Valid |
| BreadcrumbList on All Subpages | **PASS** | Enhances mobile navigation trails in SERPs | Valid |
| Property RealEstateListing | **PASS** | Structured metadata for township listings | Valid |
| Location Place & ItemList | **PASS** | Clear geographic topical authority signals | Valid |


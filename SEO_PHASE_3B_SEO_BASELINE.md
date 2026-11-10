# Phase 3B — Technical SEO & Visibility Production Baseline

**Project:** Ratiwal Dream Estates  
**Target Domain:** `https://www.ratiwaldreamestates.com/`  
**Baseline Date:** November 10, 2026  
**Auditor:** Senior Technical SEO Auditor & Search Visibility Analyst  
**Status:** Permanent Baseline Record for Monthly Longitudinal Comparison

---

## Executive Summary

This document establishes the permanent empirical baseline for Ratiwal Dream Estates following the successful deployment of Phase 1, Phase 2, and Phase 3A technical foundations (`commit ef0dec0`). Future monthly and quarterly SEO reviews will benchmark against the exact figures, status codes, payload weights, and structural metrics recorded herein.

---

## 1. Primary Website & Indexing Metrics

| SEO Metric | Baseline Measurement (Nov 10, 2026) | Target Standard | Status |
|---|:---:|:---:|:---:|
| **Preferred Domain Protocol & Host** | `https://www.ratiwaldreamestates.com` | HTTPS + WWW | **PASS** |
| **Apex Domain Redirection** | `HTTP 308` -> `https://www.ratiwaldreamestates.com/` | 1-hop 301/308 redirect | **PASS** |
| **Total Public Indexable Routes** | **37 URLs** | Complete coverage | **PASS** |
| **XML Sitemap URL Count** | **37 URLs** | Matches indexable count | **PASS** |
| **Sitemap HTTP Error Rate** | **0.0%** (37 / 37 return 200 OK) | 0.0% | **PASS** |
| **Sitemap Host Consistency** | **100.0%** (37 / 37 use `www`) | 100.0% | **PASS** |
| **Canonical Tag Alignment** | **100.0%** (37 / 37 declare `www` canonical) | 100.0% | **PASS** |
| **Soft 404 Vulnerability Count** | **0 routes** (Invalid slugs return genuine 404) | 0 soft 404s | **PASS** |
| **Robots.txt Disallow /_next/** | **Absent (Unblocked)** | Allowed for crawlers | **PASS** |
| **Robots.txt Sitemap Link** | Points to `https://www.ratiwaldreamestates.com/sitemap.xml` | Canonical sitemap | **PASS** |

---

## 2. Server Performance & Network Payload Baseline

| Route Category | Representative URL | Measured TTFB (ms) | Raw HTML Size | Edge Cache Header | Status |
|---|---|:---:|:---:|:---:|:---:|
| **Homepage** | `/` | 412 ms | 210,414 B (205.5 KB) | `PRERENDER` | **PASS** |
| **Properties Catalog** | `/properties` | 463 ms | 194,853 B (190.3 KB) | `HIT` | **PASS** |
| **Property Detail** | `/properties/neelkanth-nagar` | 342 ms | 252,369 B (246.5 KB) | `HIT` | **PASS** |
| **Location Hub** | `/locations/jaipur` | 469 ms | 252,958 B (247.0 KB) | `HIT` | **PASS** |
| **Insight Article** | `/insights/essential-guide-plot-buying` | 695 ms | 161,304 B (157.5 KB) | `HIT` | **PASS** |
| **Contact Page** | `/contact` | 417 ms | 129,978 B (126.9 KB) | `HIT` | **PASS** |
| **404 Error Boundary** | `/properties/nonexistent-xyz` | 383 ms | 41,476 B (40.5 KB) | `HIT` | **PASS** |

---

## 3. Visual Media & Social Preview Baseline

| Asset / Parameter | Pre-Optimization Baseline | Current Measured Baseline (Nov 10, 2026) | Variance | Status |
|---|:---:|:---:|:---:|:---:|
| **OpenGraph Image Dimensions** | 1024 × 1024 px (Square) | **1200 × 630 px (Landscape)** | Standardized | **PASS** |
| **OpenGraph Image File Size** | 695.4 KB | **57.8 KB** | **-91.7% (-637.6 KB)** | **PASS** |
| **Twitter Card Meta Tag** | `<meta name="twitter:card" content="summary" />` | `<meta name="twitter:card" content="summary_large_image" />` | Upgraded to Rich Card | **PASS** |
| **Oversized Assets (> 1 MB)** | 8 images (Total: 10.47 MB) | **0 images (Total: 5.18 MB)** | **-50.5% (-5.29 MB)** | **PASS** |
| **Duplicate Hero Slides** | 4 files (3.28 MB) | **0 files (Purged, return 404)** | -3.28 MB | **PASS** |
| **Responsive Image srcset** | Partial | **Full Next.js responsive generation** | Standardized | **PASS** |

---

## 4. Structured Data & Entity Authority Baseline

| Schema Entity | Implementation Location | Baseline Properties & Validity | Status |
|---|---|---|:---:|
| `RealEstateAgent` / `Organization` | `/#organization` | Verified name, URL, logo, telephone (`+91-9929533436`), email (`sureshkumawat6917@gmail.com`). | **PASS** |
| `Person` (Senior Advisor) | `/#advisor` | Name: `Suresh Kumawat` (alternateName: `Suresh Ratiwal`), Role: `Senior Property Advisor`, RERA ID: `RAJ/A/2019/983`. | **PASS** |
| `PostalAddress` | `/#organization` | `addressLocality: "Jaipur"`, `addressRegion: "Rajasthan"`, `addressCountry: "IN"`. Fabricated street and PIN purged. | **PASS** |
| `FAQPage` | `/#faq` | 6 complete, statutorily verified due diligence Q&As. | **PASS** |
| `WebSite` | `/#website` | Site name, URL, publisher reference linked to `#organization`. | **PASS** |
| `RealEstateListing` | `/properties/*` | Active on all 9 property detail pages. | **PASS** |
| `Place` & `ItemList` | `/locations/*` | Active on all 6 location hubs. | **PASS** |
| `BlogPosting` | `/insights/*` | Active on all 6 educational insight articles. | **PASS** |

---

## 5. Internal Link & Anchor Text Baseline

| Link Category | Baseline Count | Target Destination Health | Anchor Text Style | Status |
|---|:---:|:---:|---|:---:|
| **Insights Editorial Contextual Links** | **12 Links** | 100% return `HTTP 200 OK` | Keyword-grounded, natural sentence integration | **PASS** |
| **Location Property Grid Links** | **8 Active Links** | 100% return `HTTP 200 OK` | Project title anchors | **PASS** |
| **Global Navigation Links** | **12 Core Links** | 100% return `HTTP 200 OK` | Standard descriptive navigation | **PASS** |
| **Broken Internal Links** | **0 Links** | Zero 404s across internal navigation | Clean | **PASS** |

---

## 6. Google Search Console Baseline Status

- **API Integration:** Not configured in code.
- **Verification Token:** Pending site owner DNS TXT record addition.
- **Sitemap Status:** Ready for submission (`https://www.ratiwaldreamestates.com/sitemap.xml`).
- **Telemetry Data:** Once verified, owner will record initial 30-day baseline impressions, average position, and top queries.


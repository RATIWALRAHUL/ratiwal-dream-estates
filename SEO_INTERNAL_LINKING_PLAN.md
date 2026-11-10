# Ratiwal Dream Estates — Internal Linking Architecture & Matrix

**Audit Date:** November 6, 2026  
**Auditor:** Senior Technical SEO Architect  
**Objective:** Eliminate orphan pages, resolve broken internal slugs, optimize link equity flow, and reduce crawl depth across all verified properties and corridors.

---

## 1. Executive Summary & Current Linking State

The current internal linking structure has several strong components (such as reciprocal links on property details and contextual breadcrumbs), but suffers from **three critical structural deficiencies**:

1. **Broken Internal References:** `src/data/locations.ts` and `src/data/testimonials.ts` link to deprecated mock slugs (`royal-palms-township-ajmer-road-jaipur`, `aerotropolis-prime-plotted-node-navi-mumbai`, `ring-road-logistics-commercial-hub-jaipur`, `imperial-enclave-tonk-road-jaipur`) which return 404 errors when crawled.
2. **Dynamic Randomization on Homepage:** The homepage shuffles properties on every request, creating unstable and intermittent internal link equity distribution to townships.
3. **Overuse of Generic Anchor Text:** Buttons across the site predominantly use non-descriptive anchors like *"View All Properties"*, *"Learn More"*, *"Read All Client Story"*, and *"Explore"* rather than descriptive, keyword-rich semantic anchors.

---

## 2. Sitewide Internal Linking Matrix

| Source Page | Target Page / Section | Current Link Mechanism | Current Anchor Text | Recommended Semantic Anchor | Priority |
| :--- | :--- | :--- | :--- | :--- | :---: |
| **Homepage (`/`)** | `/properties` | Primary Hero Button | *"Explore All Properties"* | *"Explore Verified Plotted Developments"* | **HIGH** |
| **Homepage (`/`)** | `/contact` | Secondary Hero Button | *"Talk to an expert"* | *"Schedule a Jaipur Land Consultation"* | **HIGH** |
| **Homepage (`/`)** | `/properties` | Grid Footer Button | *"View all properties"* | *"Browse All Residential & Commercial Plots"* | **HIGH** |
| **Homepage (`/`)** | `/about` | About Section CTA | *"Learn more about us"* | *"Learn About Our 6-Stage Due Diligence Protocol"* | **MEDIUM** |
| **Homepage (`/`)** | `/testimonials` | Client Story Feature | *"Read all client story"* (Grammar bug) | *"Read Verified Buyer Due Diligence Reviews"* | **HIGH** |
| **Homepage (`/`)** | `/properties/neelkanth-nagar` | Featured Grid Card | Property Title | *"Neelkanth Nagar Gated Plots in Chaksu, Jaipur"* | **HIGH** |
| **Homepage (`/`)** | `/properties/riyasat-paradise-ii` | Featured Grid Card | Property Title | *"Riyasat Paradise II JDA Plots on Ring Road Corridor"*| **HIGH** |
| **Homepage (`/`)** | `/properties/bhumija-green-block-a`| Featured Grid Card | Property Title | *"Bhumija Green Block A Plots on Diggi Road"* | **HIGH** |
| **Locations Catalog (`/locations`)** | `/locations/jaipur` | Directory Card | *"Jaipur"* | *"Jaipur Growth Corridors & JDA Plots"* | **HIGH** |
| **Locations Catalog (`/locations`)** | `/locations/kishangarh` | Directory Card | *"Kishangarh"* | *"Kishangarh Airport & Commercial Plotted Land"* | **MEDIUM** |
| **Jaipur Location (`/locations/jaipur`)** | `/properties/riyasat-paradise-ii` | Micro-Market Ring Road | **BROKEN** (`ring-road-logistics`) | Link to `riyasat-paradise-ii` | **CRITICAL** |
| **Jaipur Location (`/locations/jaipur`)** | `/properties/bhumija-green-block-a`| Micro-Market Diggi/Tonk | **BROKEN** (`imperial-enclave`) | Link to `bhumija-green-block-a` | **CRITICAL** |
| **Jaipur Location (`/locations/jaipur`)** | `/properties/neelkanth-nagar` | Available Inventory Grid | Property Card | *"Neelkanth Nagar Gated Community Plots"* | **HIGH** |
| **Property Detail (`/properties/[slug]`)**| `/locations/jaipur` | Breadcrumb / Location Row | MapPin Text | Link locality text directly to `/locations/[slug]` | **HIGH** |
| **Property Detail (`/properties/[slug]`)**| Related Properties (3 items) | Related Carousel | Property Name | Clean reciprocal cross-linking between projects | **MAINTAIN** |
| **About Us (`/about`)** | `/contact` | Leadership & Ethos CTA | *"Schedule a consultation"* | *"Book an On-Ground Site Inspection with Suresh Kumawat"* | **HIGH** |
| **Why Choose Us (`/why-choose-us`)** | `/about` | Advisor Card | *"Read full profile"* | *"Review Suresh Kumawat's RERA Registration & Credentials"* | **HIGH** |
| **Insight: Plot Buying Guide** | `/locations/jaipur` | In-Article Body Link | Missing Context Link | *"evaluate masterplanned corridors in Jaipur"* | **HIGH** |
| **Insight: Documentation Guide** | `/properties` | Body Callout Box | Missing Link | *"explore JDA approved plots with verified 90A orders"* | **HIGH** |
| **Insight: RERA Fundamentals** | `/disclaimer` | Footnote / Source Link | Plain Text | Link to `/disclaimer#rera-compliance-notice` | **MEDIUM** |
| **Footer (All Pages)** | Sub-corridor landing pages | Generic Links | Currently links only to `/properties` | Add direct links to high-velocity Jaipur corridors | **HIGH** |

---

## 3. Crawl Depth & Orphan Page Audit

### Crawl Depth Distribution (Current vs Target)

```
Level 0: Homepage (/)
  │
  ├── Level 1: Core Navigation (1-Click from Home)
  │     ├── /properties
  │     ├── /locations
  │     ├── /investment
  │     ├── /about
  │     ├── /why-choose-us
  │     ├── /testimonials
  │     ├── /insights
  │     └── /contact
  │
  ├── Level 2: Entity & Detail Pages (2-Clicks from Home)
  │     ├── /properties/[slug] (9 Live Projects)
  │     ├── /locations/[slug]  (6 Operating Markets)
  │     ├── /insights/[slug]   (6 Guides)
  │     └── /testimonials/[slug] (4 Case Studies)
  │
  └── Level 3: Micro-Market & Category Landing Pages (Target Architecture)
        ├── /properties/residential-plots
        ├── /properties/commercial-plots
        ├── /locations/jaipur/ajmer-road
        └── /locations/jaipur/ring-road
```

### Orphan Page Risk Analysis
- **Aero Crystal (`/properties/aero-crystal`) & One Kishangarh (`/properties/one-kishangarh`):**  
  Because the homepage only displays 3 randomized projects, Kishangarh commercial projects are frequently buried at Depth 3 or higher if a user navigates through `/locations` without direct homepage exposure.  
  *Correction:* Feature permanent regional tabs on `/properties` so all 9 properties are indexed within 2 clicks from the homepage.
- **Insight Articles:** Currently only linked from `/insights` index. They should be contextually linked from property detail pages under *"Statutory Due Diligence Guidance"*.

---

## 4. Contextual Anchor Text Optimization Guidelines

Google uses anchor text to understand topical relevance. Generic phrases dilute contextual relevance:

| Component | Bad Generic Anchor | Optimized Semantic Anchor |
| :--- | :--- | :--- |
| **Hero Slider CTA** | *"Explore All Properties"* | *"Explore Verified Residential & Commercial Plots"* |
| **Homepage Advisor CTA** | *"Talk to an expert"* | *"Consult Suresh Kumawat (RERA: RAJ/A/2019/983)"* |
| **Location Card CTA** | *"Explore Operating Corridors"* | *"Explore Plotted Townships on Jaipur Ring Road"* |
| **Property Fact Card** | *"View Masterplan"* | *"Inspect Sanctioned JDA Layout Map for [Property]"* |
| **Insight Card Link** | *"Read More"* | *"Read the Section 90A Land Due Diligence Guide"* |
| **Footer Corridor Links** | *"Jaipur Plots"* | *"JDA Approved Plots on Ajmer Road & Ring Road"* |

---

## 5. Breadcrumb Architecture & Hierarchy Fix

### Current Breadcrumb on Property Detail:
```
Home (/) > Properties (/properties) > [Property Name]
```
### Recommended Hierarchical Breadcrumb:
```
Home (/) > Properties (/properties) > Jaipur (/locations/jaipur) > Neelkanth Nagar
```
- **Benefit:** Establishes clear parent-child geographical taxonomy. Allows search engines to pass category equity from City -> Corridor -> Individual Township.
- **Schema Alignment:** The `BreadcrumbList` JSON-LD schema must match the visual breadcrumb exactly, emitting 4 list items instead of 3.

---

## 6. Actionable Implementation Steps

1. **Step 1 (Fix Broken Links):** Edit `src/data/locations.ts` and `src/data/testimonials.ts` to replace all 4 dead slugs with live MongoDB slugs (`riyasat-paradise-ii`, `neelkanth-nagar`, `bhumija-green-block-a`).
2. **Step 2 (Stabilize Homepage Equity):** Remove `shuffleProperties()` in `src/app/(marketing)/page.tsx`. Pin top 3 strategic townships (`Neelkanth Nagar`, `Riyasat Paradise II`, `Bhumija Green Block A`) on the homepage grid.
3. **Step 3 (Contextual In-Article Linking):** Insert 2 contextual internal links inside each of the 6 articles in `src/data/insights.ts` pointing to `/locations/jaipur` and `/properties`.
4. **Step 4 (Geographical Breadcrumbs):** Update `PropertyDetailHero.tsx` and `PropertyDetailPage.tsx` to insert the parent location link in the breadcrumb path.


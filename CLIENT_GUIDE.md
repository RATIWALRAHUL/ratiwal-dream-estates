# Ratiwal Dream Estates — Client & Stakeholder Guide

**Brand Name:** Ratiwal Dream Estates  
**Core Mission:** *"Lifelong Property Consultancy, Built on Trust & Transparency."*  
**Platform Overview:** Premium Real Estate Consultancy & Property Intelligence Portal  
**Target Locations:** Jaipur, Navi Mumbai (Panvel / NAINA), Ajmer (Pushkar Bypass), Delhi-NCR (Bhiwadi / Neemrana), and emerging high-growth corridors.

---

## 1. Executive Summary

**Ratiwal Dream Estates** is a digital-first real estate advisory and land diligence platform. Unlike conventional property listing portals that prioritize unfiltered ads and speculative broker claims, Ratiwal Dream Estates operates as a **curated consultancy**.

Every property and growth corridor listed on the platform is subjected to legal due diligence, title verification, RERA compliance checks, and ground demarcation audits before being presented to investors and home-seekers.

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    RATIWAL 6-STAGE VERIFICATION PROTOCOL                │
├─────────────┬─────────────┬─────────────┬─────────────┬─────────────────┤
│  1. Title   │  2. Zoning  │   3. RERA   │  4. Ground  │   5. Complete   │
│  Diligence  │  Clearance  │  Compliance │  Inspection │  Cost Breakdown │
└─────────────┴─────────────┴─────────────┴─────────────┴─────────────────┘
```

---

## 2. Platform Architecture & Modules

### 2.1 The Ratiwal Control Center (`/dashboard`)
An administrative operating system designed specifically for land and township management:
- **Executive Overview Dashboard**: Real-time KPI counters tracking active inventory, valuation, lead inquiries, verification tasks, and publication status.
- **2026 Fintech/Proptech Aesthetics**: Warm cream canvas, deep navy sidebars, clean typography pairing (`Instrument Serif`, `Fraunces`, `Plus Jakarta Sans`, `JetBrains Mono`), and glassmorphic stat widgets.
- **Role-Based Security**: Three privilege tiers (`EDITOR`, `ADMIN`, `SUPER_ADMIN`) ensuring only authorized personnel can publish or archive live inventory.

### 2.2 Property Management CRUD (`/dashboard/properties`)
- **Rapid Draft Creation**: Initialize new township parcels in seconds.
- **Modular Property Editor**: 8 comprehensive configuration modules (Basic Info, Pricing, Plot Dimensions, Features & Amenities, Media, Documents, RERA & Diligence, SEO).
- **Plot-by-Plot Inventory Subsystem**: Manage individual plot numbers, frontage widths, depths, orientation, and statuses (`AVAILABLE`, `RESERVED`, `SOLD`, `UNAVAILABLE`) without deleting records.
- **Publishing Pre-Flight Checklist**: 14 automated compliance rules validating title, dimensions, media, and RERA approvals before going live.

### 2.3 Location Management & Market Atlas (`/dashboard/locations`)
- **Market Atlas**: Visual corridor directory presenting town coverage, property counts, active plot inventories, and verification badges.
- **10-Section Modular Corridor Editor (`/dashboard/locations/[id]/edit`)**:
  1. *Basic Information & Jurisdiction*: Name, city, state, zone, tagline, and sort weights.
  2. *Geographic Identity*: Centroid coordinates, GeoJSON mapping, source, and audit verification.
  3. *Editorial Overviews*: Short summaries and long-form investment theses.
  4. *Hero Media*: High-resolution aerial photography with ImageKit CDN optimization and alt text.
  5. *Micro-Market Nodes*: Industrial belts, commercial hubs, and gated township clusters with up/down reordering.
  6. *Infrastructure Milestones*: Expressways, metro routes, and SEZs with verified government source URLs.
  7. *Connectivity Milestones*: Distances and travel times to airports, railway hubs, and arterial exits.
  8. *Sourced Market Intelligence*: Historical asking rates (in paise/sq ft), registry data, and source attribution.
  9. *Supported Property Types*: Residential plots, commercial SCO, industrial logistics land, and farm estates.
  10. *SEO & Open Graph*: Custom meta titles, descriptions, canonical URLs, and social image cards.
- **16-Point Pre-Flight Audit Modal**: Automated legal, territorial, and SEO compliance check before a corridor can be published.
- **Micro-Market Intelligence Hub (`/dashboard/locations/[id]/intelligence`)**:
  - Detailed historical price curves plotted strictly from verified registry and government sources (no guessing or fake data).
  - Clean audit ledger tracking provenance, publication status, and researcher notes.
- **Protected Live Preview (`/dashboard/locations/[id]/preview`)**: View draft corridors in live website layouts with draft preview banners prior to public release.

### 2.4 ImageKit Cloud Media Integration
- High-resolution property photography and masterplan layout sheets uploaded securely via client-side signed HMAC-SHA1 tokens.
- Automated Next-Gen formatting (WebP/AVIF) and progressive blur preview loading for ultra-fast performance across mobile and desktop.

---

## 3. Brand Trust & Diligence Framework

| Pillar | How Ratiwal Protects the Buyer |
| :--- | :--- |
| **Zero Hidden Costs** | Every listed property includes an itemized breakdown of development charges, registry fees, PLC (Preferential Location Charges), and society transfer expenses. |
| **Title & Ownership Diligence** | Verification of 30-year revenue search records, 90A conversion orders, single-owner vs joint-family titles, and absence of active litigation. |
| **RERA Transparency** | Clear display of RERA registration numbers, official authority portal links, and verified promoter disclosures. |
| **Physical Demarcation** | Assurance that listed plots have physical stone demarcation on site aligned exactly with the approved government layout. |
| **Objective Advisory** | Clearly demarcating existing physical infrastructure (roads, water pipelines, electricity transformers) from future proposed masterplan concepts. |

---

## 4. Key Public Website Routes

| Page | URL | Purpose |
| :--- | :--- | :--- |
| **Home** | `/` | Hero video, featured corridors, advisory philosophy, client testimonials |
| **Properties** | `/properties` | Complete search & filterable catalog with live plot counts and pricing |
| **Property Details** | `/properties/[slug]` | Deep-dive township showcase, masterplan map, plot inventory table |
| **Growth Corridors** | `/locations` | Regional market hubs (Jaipur, Navi Mumbai, Ajmer, etc.) |
| **Location Details** | `/locations/[slug]` | Macro thesis, micro-market nodes, infrastructure timelines, connectivity |
| **Investment Hub** | `/investment` | Institutional land banking guide, ROI calculator, growth corridor metrics |
| **Why Choose Us** | `/why-choose-us` | 6-stage diligence protocol, risk comparison matrix, verification standards |
| **Insights** | `/insights` | Educational buying guides, RERA legal breakdowns, circle rate trends |
| **Testimonials** | `/testimonials` | Verified buyer case studies and video testimonials |
| **Contact & Booking** | `/contact` | Physical site-visit scheduling, WhatsApp advisory, office locations |
| **Dashboard** | `/dashboard` | Protected administrator control center |

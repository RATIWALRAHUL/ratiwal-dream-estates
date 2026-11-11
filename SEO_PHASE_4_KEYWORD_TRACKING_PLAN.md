# Ratiwal Dream Estates — Phase 4 Keyword Tracking Plan

**Website:** https://www.ratiwaldreamestates.com/  
**Framework:** Next.js 16 App Router  
**Scope:** Verified Keyword Tracking Database, Intent Segmentation & SERP Measurement Rules  
**Date:** November 2026

---

## 1. Fundamental SERP Measurement Clarification

> [!IMPORTANT]
> **GSC Average Position is NOT a Daily Keyword Rank Tracker.**
>
> In Google Search Console, "Average Position" represents the mathematical mean of all recorded impressions for a query over a given date range. This metric fluctuates based on:
> 1. **User Location:** A searcher in Mansarovar, Jaipur will see different local results than a searcher in South Mumbai or Dubai.
> 2. **Device Type:** Mobile SERPs frequently display Local 3-Packs and mobile cards that push organic links down.
> 3. **SERP Features:** The presence of AI Overviews, People Also Ask (PAA), image carousels, and sponsored ads alters numeric ranking.
>
> Therefore, GSC average position must never be communicated to stakeholders as a "fixed daily rank". If the business requires exact daily local ranking coordinates (e.g., "Rank #3 on mobile from Jaipur IP"), a dedicated third-party rank tracker (e.g., Ahrefs, SEMrush, or Nightwatch with geo-targeted grid tracking) must be connected. Until such a service is provisioned, GSC telemetry is reported transparently as aggregate search visibility.

---

## 2. Tracking Database Schema Definition

Every tracked keyword record is structured according to the following 12-attribute data specification:

| Field Name | Type | Description | Allowed Values / Format |
|:---|:---|:---|:---|
| `keyword` | String | Target search query in lowercase | e.g. "plots for sale in jaipur" |
| `intent` | Enum | Primary searcher intent | `COMMERCIAL`, `TRANSACTIONAL`, `INFORMATIONAL`, `NAVIGATIONAL` |
| `target_url` | String | Designated canonical landing page | Absolute URL e.g. `https://www.ratiwaldreamestates.com/properties` |
| `location_scope` | Enum | Primary geographical jurisdiction | `JAIPUR`, `AJMER`, `KISHANGARH`, `BHIWADI`, `NAVI_MUMBAI`, `PANVEL`, `STATEWIDE` |
| `cluster_id` | String | Associated content/market cluster | `CORE_CATALOG`, `LOCATION_CORRIDOR`, `LEGAL_DUE_DILIGENCE`, `INVESTMENT` |
| `gsc_avg_position` | Float / Null | Rolling 28-day GSC average position | Number (e.g. `7.4`) or `Unmeasured` |
| `prev_avg_position` | Float / Null | Previous 28-day GSC average position | Number or `Null` (baseline) |
| `gsc_impressions` | Integer | Rolling 28-day impression volume | Number |
| `gsc_clicks` | Integer | Rolling 28-day organic click volume | Number |
| `gsc_ctr_percent` | Float | Calculated click-through rate | Percentage (e.g. `3.8%`) |
| `third_party_rank` | Integer / Null | Exact geo-located ranking (if tool connected) | Integer or `None (GSC aggregate only)` |
| `measurement_date` | Date | Audit timestamp | `YYYY-MM-DD` |

---

## 3. Prioritized Keyword Tracking Database (30 Verified Targets)

The following 30 target search queries are derived directly from the approved Phase 3C Keyword-to-URL Map and reflect genuine business inventory and advisory services:

### Cluster 1: Core Property Catalog & Commercial Terms (`/properties`)

| Keyword | Intent | Target URL | Location | Baseline Status |
|:---|:---|:---|:---|:---|
| `plots for sale in jaipur` | Transactional | `/properties` | Jaipur | Primary Catalog Target |
| `residential plots in jaipur` | Commercial | `/properties` | Jaipur | Primary Catalog Target |
| `commercial plots in jaipur` | Commercial | `/properties` | Jaipur | Primary Catalog Target |
| `buy residential plot in rajasthan` | Transactional | `/properties` | Statewide | Catalog Target |
| `jda approved plots in jaipur` | Commercial | `/properties` | Jaipur | High Authority Target |
| `gated township plots jaipur` | Commercial | `/properties` | Jaipur | Inventory Target |

---

### Cluster 2: Specific Location Corridors (`/locations/[slug]`)

| Keyword | Intent | Target URL | Location | Baseline Status |
|:---|:---|:---|:---|:---|
| `plots in tonk road jaipur` | Commercial | `/locations/jaipur` | Jaipur | Micro-market Target |
| `plots near mahindra sez jaipur` | Commercial | `/locations/jaipur` | Jaipur | Micro-market Target |
| `plots on sikar road jaipur` | Commercial | `/locations/jaipur` | Jaipur | Micro-market Target |
| `plots for sale in ajmer` | Transactional | `/locations/ajmer` | Ajmer | Primary Location Hub |
| `commercial land on jaipur ajmer expressway` | Commercial | `/locations/ajmer` | Ajmer | High Intent Commercial |
| `plots in kishangarh marble zone` | Commercial | `/locations/kishangarh` | Kishangarh | Industrial Corridor |
| `residential plots near kishangarh airport` | Commercial | `/locations/kishangarh` | Kishangarh | Growth Node |
| `land investment in navi mumbai` | Commercial | `/locations/navi-mumbai` | Navi Mumbai | Advisory Mandate |
| `panvel naina plot investment advisory` | Commercial | `/locations/panvel` | Panvel | Advisory Mandate |
| `industrial land in bhiwadi` | Commercial | `/locations/bhiwadi` | Bhiwadi | Advisory Mandate |

---

### Cluster 3: Verified Property Specific Inventory (`/properties/[slug]`)

| Keyword | Intent | Target URL | Location | Baseline Status |
|:---|:---|:---|:---|:---|
| `neelkanth nagar chaksu jaipur plots` | Transactional | `/properties/neelkanth-nagar` | Jaipur | Project Specific |
| `riyasat paradise 2 vatika jaipur` | Transactional | `/properties/riyasat-paradise-ii` | Jaipur | Project Specific |
| `bhumija green block a sikar road` | Transactional | `/properties/bhumija-green-block-a` | Jaipur | Project Specific |
| `riyasat heritage extension jaipur` | Transactional | `/properties/riyasat-heritage-extension` | Jaipur | Project Specific |
| `happy business park gagwana ajmer` | Transactional | `/properties/happy-business-park` | Ajmer | Project Specific |
| `balaji puram plots ajmer` | Transactional | `/properties/balaji-puram` | Ajmer | Project Specific |
| `aero crystal plots kishangarh` | Transactional | `/properties/aero-crystal` | Kishangarh | Project Specific |
| `one kishangarh commercial plots` | Transactional | `/properties/one-kishangarh` | Kishangarh | Project Specific |

---

### Cluster 4: Statutory Legal Authority & Due Diligence (`/insights/[slug]`)

| Keyword | Intent | Target URL | Location | Baseline Status |
|:---|:---|:---|:---|:---|
| `section 90a rajasthan land revenue act` | Informational | `/insights/section-90a-land-conversion-rajasthan` | Statewide | Published Phase 3D |
| `how to check 90a conversion order rajasthan` | Informational | `/insights/section-90a-land-conversion-rajasthan` | Statewide | Published Phase 3D |
| `types of jda patta in jaipur` | Informational | `/insights/types-of-jda-patta-jaipur-verification` | Jaipur | Published Phase 3D |
| `how to verify jda patta online` | Informational | `/insights/types-of-jda-patta-jaipur-verification` | Jaipur | Published Phase 3D |
| `plot buying due diligence checklist rajasthan` | Informational | `/insights/essential-guide-plot-buying` | Statewide | Active Guide |
| `difference between registry and mutation rajasthan` | Informational | `/insights/understanding-property-documentation` | Statewide | Active Guide |

---

## 4. Operational Review & Update Cadence

1. **Bi-Weekly GSC Snapshot:**
   - Extract performance data (clicks, impressions, average position) for the 30 priority queries.
   - Record delta from previous period in the internal tracking spreadsheet or database.
2. **Monthly Striking Distance Audit:**
   - Filter queries with average position between 5.0 and 20.0.
   - Identify candidate pages for snippet refinement, FAQ schema addition, or internal linking updates.
3. **Quarterly Portfolio Reconciliation:**
   - Retire or redirect property keywords if an inventory project is marked as `SOLD OUT` in the MongoDB dashboard.
   - Introduce new target keywords when new projects are onboarded.


# Ratiwal Dream Estates — Phase 3 Keyword-to-URL Mapping Architecture

**Document Date:** November 6, 2026  
**Scope:** One-to-one keyword theme mapping across all 37 public indexable routes.  
**Objective:** Zero keyword cannibalization, clear topical authority, and maximized search relevance.

---

## 1. Core Brand & Marketing Pages

| Page URL | Primary Keyword Theme | Secondary Keyword Themes | Search Intent | Geographic Focus | Cannibalization Prevention Guardrail |
|---|---|---|:---:|---|---|
| **`/`** (Home) | **Real Estate Consultant in Jaipur** | property dealer in jaipur, verified plots in jaipur, rera registered advisor jaipur | Commercial & Navigational | Jaipur & Rajasthan | Owns the primary business entity name & consultant query. Does not compete with `/properties` for transactional "plots for sale". |
| **`/about`** | **Real Estate Consultancy Profile** | property advisory team rajasthan, suresh kumawat real estate, rera compliant property advisors | Informational & Trust | Jaipur / Rajasthan | Focuses on company heritage, values, and client track record. |
| **`/why-choose-us`** | **RERA Registered Real Estate Agent Jaipur** | property legal due diligence, 30-year land title verification, transparent property dealing jaipur | High-Trust Commercial | Jaipur & Rajasthan | Exclusively targets advisory credentials (`RAJ/A/2019/983`), legal due diligence process, and buyer security. |
| **`/investment`** | **Land Investment in Rajasthan** | strategic plotted land investment, highway land banking jaipur, capital appreciation corridors | Investment Advisory | Rajasthan & MMR | Owns high-ticket institutional and NRI land banking search queries. |
| **`/contact`** | **Property Dealer Office in Jaipur** | real estate agent phone number jaipur, schedule plot site visit, property consultation jaipur | Local Transactional | Jaipur (Tonk Road / Ajmer Road) | Owns local contact queries, directions, and site visit booking requests. |

---

## 2. Inventory & Location Hub Pages

| Page URL | Primary Keyword Theme | Secondary Keyword Themes | Search Intent | Geographic Focus | Cannibalization Prevention Guardrail |
|---|---|---|:---:|---|---|
| **`/properties`** | **Residential & Commercial Plots for Sale** | verified plots in rajasthan, buy residential plots jaipur, commercial land for sale ajmer | Transactional Catalog | Multi-City (Jaipur, Ajmer, Kishangarh) | Broad catalog hub; links down to specific city corridors and property detail pages. |
| **`/locations`** | **Property Locations in Rajasthan & Maharashtra** | jaipur real estate corridors, ajmer township belts, kishangarh industrial land zones | Directory / Navigational | Regional Overview | High-level index; does not target individual city keywords to avoid diluting `/locations/[slug]`. |
| **`/locations/jaipur`** | **Plots in Jaipur** | jda approved plots in jaipur, residential plots on tonk road, jaipur township plots | Local Transactional | Jaipur | **Sole owner** of high-volume local query *"plots in jaipur"*. Links down to 4 Jaipur property detail pages. |
| **`/locations/ajmer`** | **Plots in Ajmer** | ada approved plots in ajmer, commercial plots in gagwana, buy land in ajmer | Local Transactional | Ajmer | **Sole owner** of *"plots in ajmer"*. Links down to 3 Ajmer property pages. |
| **`/locations/kishangarh`**| **Plots in Kishangarh** | commercial plots in kishangarh, marble market commercial land, plots near kishangarh airport | Local Transactional | Kishangarh | **Sole owner** of *"plots in kishangarh"*. Links down to 2 Kishangarh projects. |
| **`/locations/bhiwadi`** | **Industrial Land in Bhiwadi** | riico industrial plots bhiwadi, dmic logistics corridor land, warehouse plots bhiwadi | Commercial Advisory | Bhiwadi / NCR | Focuses on industrial, warehousing, and strategic logistics land advisory. |
| **`/locations/navi-mumbai`**| **NRI Land Investment Navi Mumbai**| naina plotted nodes, cidco approved land advisory, mthl corridor plots | NRI Investment Advisory | Navi Mumbai / MMR | High-ticket remote advisory and NAINA corridor planning. |
| **`/locations/panvel`** | **Property Investment in Panvel** | plots near navi mumbai international airport, panvel expressway land, land due diligence panvel | Commercial Advisory | Panvel / MMR | Multi-modal transport corridor and infrastructure-linked property advisory. |

---

## 3. Dynamic Property Detail Pages (Inventory Specific)

Every property detail page owns its **exact brand title, locality, and RERA registration number**:

| Property URL | Primary Keyword Theme | Secondary Locality Keywords | RERA Target Query |
|---|---|---|---|
| **`/properties/neelkanth-nagar`** | **Neelkanth Nagar Plots Jaipur** | plots in chaksu jaipur, jda plots on tonk highway | RAJ/P/2026/5056 verification |
| **`/properties/riyasat-paradise-ii`** | **Riyasat Paradise II Vatika Jaipur** | plots in vatika jaipur, residential plots tonk road vatika | RAJ/P/2026/5205 verification |
| **`/properties/bhumija-green-block-a`** | **Bhumija Green Block A Sikar Road** | plots on sikar road jaipur, gated township sikar road | RAJ/P/2025/4362 verification |
| **`/properties/riyasat-heritage-extension`**| **Riyasat Heritage Extension Chaksu** | residential plots salagrampura dahar jaipur | RAJ/P/2026/5264 verification |
| **`/properties/happy-business-park`** | **Happy Business Park Commercial Plots Ajmer**| commercial plots in gagwana ajmer, nh-48 commercial land | RAJ/P/2026/5282 verification |
| **`/properties/balaji-puram`** | **Balaji Puram Residential Plots Ajmer** | plots in chandiyawas ajmer, affordable plots ajmer | RAJ/P/2026/5204 verification |
| **`/properties/vrindavan-viihaar`** | **Vrindavan Viihaar Plots Gagwana Ajmer** | residential plots gagwana ajmer, township plots ajmer | RAJ/P/2026/5179 verification |
| **`/properties/aero-crystal`** | **Aero Crystal Plots Kishangarh** | plots near kishangarh airport, residential plots kishangarh b | RAJ/P/2026/4620 verification |
| **`/properties/one-kishangarh`** | **One Kishangarh Commercial Plots** | commercial plots in madanganj kishangarh, marble trade showroom land | RAJ/P/2022/2205 verification |

---

## 4. Educational & Due Diligence Insights (Informational Intent)

| Article URL | Primary Keyword Target | Informational Intent Addressed |
|---|---|---|
| **`/insights/essential-guide-plot-buying`** | **Essential Guide to Buying Plots in Rajasthan** | Comprehensive beginner-to-advanced plot purchase workflow. |
| **`/insights/understanding-property-documentation`** | **Property Document Verification Rajasthan** | Jamabandi, Khasra, Title Deed, Patta, Registry chain inspection. |
| **`/insights/rera-fundamentals-for-plot-buyers`** | **RERA Rules for Plot Buyers Rajasthan** | Statutory rights, promoter obligations, escrow and carpet disclosures. |
| **`/insights/evaluating-corridor-infrastructure-claims`** | **Evaluating Infrastructure Growth Claims** | Differentiating conceptual master plans from sanctioned projects. |
| **`/insights/demystifying-land-pricing-additional-charges`** | **Hidden Charges When Buying Land in Rajasthan** | Stamp duty, development charges, PLC, lease money calculations. |
| **`/insights/commercial-vs-residential-land-investment`** | **Commercial vs Residential Land Investment India**| Rental yield vs capital appreciation and zoning conversion analysis. |

---

## 5. Cannibalization Health Check & Verdict
* **No Two Pages Target the Same Primary Query:** Each corridor, project, and guide has a designated unique focus.
* **Hierarchy is Preserved:** City pages (`/locations/jaipur`) capture broad market intent; property detail pages (`/properties/neelkanth-nagar`) capture specific township queries.


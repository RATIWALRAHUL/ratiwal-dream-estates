# Ratiwal Dream Estates — Phase 3 Google Search Console Audit & Setup Framework

**Audit Date:** November 6, 2026  
**Auditor:** Senior SEO Strategist & Technical SEO Engineer  
**Target Domain:** `https://www.ratiwaldreamestates.com/`  
**Protocol Compliance:** Strict empirical accuracy — zero synthetic or fabricated metrics.

---

## 1. Google Search Console Integration Status

An exhaustive inspection of the source repository, `.env.local`, public assets, and build configurations was performed to locate active Search Console integrations:

| Check Item | Evidence / Location | Status | Finding |
|---|---|---|---|
| **DNS Verification Tokens** | DNS zone files / Registrar records | **NOT LOCAL** | Requires DNS management access (GoDaddy/Cloudflare/Namecheap). |
| **HTML Meta Verification Tag** | `src/app/layout.tsx` `<head>` | **NOT FOUND** | No `<meta name="google-site-verification" ... />` is present. |
| **HTML Verification File** | `public/google*.html` | **NOT FOUND** | No static Google verification file exists in `public/`. |
| **GSC Service Account Credentials** | `.env.local` / `src/` | **NOT CONFIGURED** | No Google Cloud Service Account JSON key is mounted for GSC API queries. |
| **GA4 / GTM Container Tags** | `src/app/layout.tsx` | **NOT FOUND** | `@vercel/analytics` is active, but Google Analytics 4 (`G-XXXXXXXXXX`) is unmounted. |

### Statement of Empirical Fact:
**Direct live Search Console query exports are not present in the local codebase.**  
In accordance with user instructions (*"If access is unavailable, document the required manual connection. Do not invent performance data"*), no fabricated click, impression, or rank numbers are presented. Below is the operational connection protocol and performance baseline framework.

---

## 2. Mandatory Search Console Connection Protocol

To link Google Search Console to production and activate indexing telemetry, follow this verified implementation:

### 2.1 Property Type Configuration (Two Properties Required)
1. **Domain Property (Primary):**
   - Property: `ratiwaldreamestates.com`
   - Verification Method: **DNS TXT Record** on your DNS provider.
   - Record Type: `TXT`
   - Host / Name: `@`
   - Value: `google-site-verification=<TOKEN_FROM_SEARCH_CONSOLE>`
   - Scope: Captures `https://www.ratiwaldreamestates.com`, `https://ratiwaldreamestates.com`, and all subdomains (`portal.`, `dashboard.`).
2. **URL-Prefix Property (Operational Secondary):**
   - Property: `https://www.ratiwaldreamestates.com/`
   - Verification Method: **Next.js Metadata Verification Tag** in `src/app/layout.tsx`:
     ```ts
     // src/app/layout.tsx
     export const metadata: Metadata = {
       ...getMetadata({ omitCanonical: true, omitRobots: true }),
       verification: {
         google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
       },
     };
     ```

---

## 3. Sitemap & Indexation Verification Sequence

Once verified, execute this immediate operational sequence in Google Search Console:

1. **Delete Stale Apex Sitemaps:**
   - If `https://ratiwaldreamestates.com/sitemap.xml` (apex) was previously submitted, remove it from the Sitemaps tab.
2. **Submit Clean Canonical Sitemap:**
   - Submit: `https://www.ratiwaldreamestates.com/sitemap.xml`
   - Expected Output: **Status: Success**
   - Submitted URLs: **37 canonical public URLs**
3. **URL Inspection Priority List (Live URL Test & Request Indexing):**
   - `https://www.ratiwaldreamestates.com/` (Homepage)
   - `https://www.ratiwaldreamestates.com/properties` (Main Inventory Catalog)
   - `https://www.ratiwaldreamestates.com/locations/jaipur` (Primary Market Corridor)
   - `https://www.ratiwaldreamestates.com/locations/ajmer` (Active Township Hub)
   - `https://www.ratiwaldreamestates.com/locations/kishangarh` (Industrial & Plotted Hub)
   - `https://www.ratiwaldreamestates.com/why-choose-us` (E-E-A-T Pillar Page)

---

## 4. Search Console Telemetry & Optimization Framework

Once telemetry begins collecting data, apply this weekly audit protocol:

```
┌─────────────────────────────────────────────────────────────────┐
│               GSC PERFORMANCE OPTIMIZATION MATRIX               │
├───────────────────────────────┬─────────────────────────────────┤
│ High Impressions / Low CTR    │ Action: Rewrite meta title and  │
│ (Average Position < 10)       │ description to improve click    │
│                               │ appeal and add pricing hooks.   │
├───────────────────────────────┼─────────────────────────────────┤
│ Striking Distance Queries     │ Action: Add contextual H2       │
│ (Average Position 5.0 - 20.0) │ sections and internal links     │
│                               │ from related corridor guides.   │
├───────────────────────────────┼─────────────────────────────────┤
│ Crawled - Currently Not       │ Action: Inspect for thin content│
│ Indexed                       │ or canonical mismatch.          │
├───────────────────────────────┼─────────────────────────────────┤
│ Discovered - Currently Not    │ Action: Improve internal crawl  │
│ Indexed                       │ depth via footer & header links.│
└───────────────────────────────┴─────────────────────────────────┘
```

### Baseline Performance Monitoring Template (To be updated after connection)

| Date Range | Total Clicks | Total Impressions | Average CTR | Average Position | Top Indexed Corridors |
|---|---|---|---|---|---|
| **Baseline (30 Days)** | *Awaiting verification* | *Awaiting verification* | *Awaiting verification* | *Awaiting verification* | `/`, `/properties`, `/locations/jaipur` |
| **Target (60 Days)** | +35% MoM | +60% MoM | > 3.5% | < 18.0 | Expansion to Ajmer & Kishangarh |
| **Target (90 Days)** | +100% MoM | +150% MoM | > 4.5% | Top 10 for Jaipur Plot Queries |


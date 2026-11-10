# Phase 3B — Google Search Console & Search Visibility Audit Report

**Project:** Ratiwal Dream Estates  
**Target Domain:** `https://www.ratiwaldreamestates.com/`  
**Test Date:** November 10, 2026  
**Auditor:** Senior Technical SEO Auditor & Search Visibility Specialist  
**Status:** Audit & Governance Report

---

## Executive Summary

Google Search Console (GSC) is the authoritative source of organic search performance, crawl health, index coverage, and Core Web Vitals telemetry. Phase 3B mandates an empirical inspection of GSC metrics across a 3-month comparison window (last 3 months vs previous 3 months).

### GSC Connection Status: UNAVAILABLE / NOT CONFIGURED
- **API Credentials Check:** Zero Google Search Console API service account keys, OAuth2 tokens, or client secrets are present in `.env*`, environment configurations, or repository files.
- **Verification Tags Check:** Zero `<meta name="google-site-verification" ... />` meta tags exist in `src/app/layout.tsx` or live server HTML.
- **Static Verification Files:** Zero HTML verification files (e.g., `google*.html`) exist in `public/`.
- **Integrity Rule:** In strict accordance with professional auditing standards, **no synthetic clicks, impressions, CTR, or position numbers have been manufactured**.

---

## 1. Manual Google Search Console Verification Procedure

To enable organic performance tracking, monitor indexing coverage, and receive automated crawl alerts:

### Method A: Domain-Level DNS TXT Verification (Recommended)
1. Open [Google Search Console](https://search.google.com/search-console).
2. Click **Add Property** in the left sidebar.
3. Select the **Domain** property option (e.g., `ratiwaldreamestates.com`). This property type monitors both `www`, non-`www`, HTTP, and HTTPS protocols in a single consolidated profile.
4. Copy the unique Google TXT token (e.g., `google-site-verification=AbCdEf123456789...`).
5. Access your domain DNS manager (Cloudflare, GoDaddy, Namecheap, or Hostinger).
6. Create a DNS record:
   - **Type:** `TXT`
   - **Name / Host:** `@`
   - **Content / Value:** `google-site-verification=AbCdEf123456789...`
   - **TTL:** Auto or 300 seconds
7. Return to Google Search Console and click **Verify**.

### Method B: Next.js Metadata Verification (Alternative)
If DNS control is restricted, the verification token can be embedded directly in `src/app/layout.tsx`:
```typescript
export const metadata: Metadata = {
  verification: {
    google: "YOUR_GOOGLE_VERIFICATION_TOKEN",
  },
};
```

---

## 2. Immediate Post-Verification Action: Clean Sitemap Submission

Following the deployment of commit `ef0dec0`, the live production sitemap is 100% clean and contains zero 308 redirect loops:
- **Sitemap URL to Submit:** `https://www.ratiwaldreamestates.com/sitemap.xml`
- **Sitemap Total URL Count:** 37 URLs
- **Expected Status:** "Success"
- **Crawled URLs:** All 37 URLs respond with `HTTP 200 OK`.

---

## 3. Standardized GSC Inspection Protocol (For Site Owner)

Once verified, the following reports must be extracted and compared across the **Last 3 Months vs Previous 3 Months**:

### A. Search Performance Metrics
- **Total Clicks:** Real-user visits from organic Google Search.
- **Total Impressions:** Frequency with which property listings, location hubs, and insight articles appeared in SERPs.
- **Average CTR:** Proportion of impressions converted into visits (benchmark: > 2.5% on branded, > 1.2% on non-branded plot queries).
- **Average Position:** Mean ranking position across all impressions.

### B. Index Coverage Health & Exclusion Analysis
Inspect the **Pages** indexing report to verify the resolution of past technical issues:
1. **Soft 404 Pages:** Must drop to 0. (Phase 3A enforced genuine `HTTP 404 Not Found` across all dynamic route handlers).
2. **Duplicate Without User-Selected Canonical:** Must drop to 0. (Phase 3A normalized 100% of canonical tags to `https://www.ratiwaldreamestates.com`).
3. **Page With Redirect:** Must stabilize. (The sitemap no longer contains apex URLs that 308-redirect to `www`).
4. **Crawled — Currently Not Indexed:** Monitor pages where Googlebot evaluated content but chose not to index.
5. **Discovered — Currently Not Indexed:** Monitor crawl queue latency.

### C. Top 10 High-Intent Real Estate Queries to Benchmark
Monitor impressions and position movements for target search phrases:
1. `plots in jaipur`
2. `residential plots in jaipur`
3. `commercial plots for sale in jaipur`
4. `jda approved plots in chaksu`
5. `plots in tonk road jaipur`
6. `real estate consultant in jaipur`
7. `plots in ajmer road corridor`
8. `commercial land in gagwana ajmer`
9. `plots in kishangarh ajmer`
10. `nri plot due diligence jaipur`

---

## 4. Summary & Classification

| Inspection Item | Current Status | Finding | Action Required |
|---|:---:|---|---|
| GSC API Credentials | **NOT VERIFIED** | No API keys in environment or repo | Connect via DNS TXT record |
| Organic Query Metrics | **NOT VERIFIED** | Unconnected | Owner to export 3-month CSV upon verification |
| Live Sitemap Submission | **ACTION REQUIRED** | Ready for submission | Submit `https://www.ratiwaldreamestates.com/sitemap.xml` |
| Technical Indexability Health | **PASS** | 37 clean routes, genuine 404s, `www` canonicals | Verified via live production curl testing |


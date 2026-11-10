# SEO Phase 3B — Canonical & Sitemap Production Audit Report

**Project:** Ratiwal Dream Estates  
**Target Domain:** `https://www.ratiwaldreamestates.com/` (and `https://ratiwaldreamestates.com/`)  
**Audit Date:** November 7, 2026  
**Auditor:** Senior Technical SEO Auditor & Next.js Production Engineer  
**Execution Type:** Live production protocol inspection

---

## 1. Domain Routing & Protocol Enforcement

We audited the live DNS and edge routing configuration across all four primary domain and protocol variants:

| Request URL | HTTP Status Code | Redirect Chain | Final Destination URL | Server Header |
| :--- | :---: | :---: | :--- | :--- |
| `https://www.ratiwaldreamestates.com/` | `200 OK` | `None (0 redirects)` | `https://www.ratiwaldreamestates.com/` | `Vercel` |
| `https://ratiwaldreamestates.com/` | `308 Permanent Redirect` | `1 redirect` | `https://www.ratiwaldreamestates.com/` | `Vercel` |
| `http://www.ratiwaldreamestates.com/` | `308 Permanent Redirect` | `1 redirect` | `https://www.ratiwaldreamestates.com/` | `Vercel` |
| `http://ratiwaldreamestates.com/` | `308 Permanent Redirect` | `2 redirects (308 -> 308)` | `https://www.ratiwaldreamestates.com/` | `Vercel` |

### Edge Routing Verdict
- **HTTPS Enforcement:** **PASS**. All insecure HTTP traffic is permanently redirected to HTTPS.
- **Apex to WWW Redirection:** **PASS**. All apex requests (`ratiwaldreamestates.com`) are permanently redirected via HTTP 308 to `www.ratiwaldreamestates.com`.
- **HSTS Header:** **PASS**. Strict-Transport-Security is active on all responses (`max-age=63072000; includeSubDomains; preload`).

---

## 2. Critical Issue: Sitewide Canonical-Redirect Conflict

While edge routing correctly establishes `www.ratiwaldreamestates.com` as the canonical destination host, **the HTML metadata delivered by Next.js on live production directly contradicts edge routing**:

```html
<!-- Live rendered head tag on https://www.ratiwaldreamestates.com/ -->
<link rel="canonical" href="https://ratiwaldreamestates.com" />
```

### The Conflict Mechanism:
1. **Googlebot requests the preferred domain:** `https://www.ratiwaldreamestates.com/` (200 OK).
2. **Googlebot reads the page canonical:** The `<link rel="canonical">` tag instructs Googlebot that the authoritative master URL is `https://ratiwaldreamestates.com` (apex).
3. **Googlebot follows the canonical:** Requesting `https://ratiwaldreamestates.com` returns `HTTP 308 Permanent Redirect` pointing back to `https://www.ratiwaldreamestates.com`.
4. **Resulting GSC Indexing Errors:**
   - *"Duplicate without user-selected canonical"*
   - *"Redirect error"*
   - *"Page is not indexed: Redirect"*
   - Canonical authority is diluted between apex and www.

### Sitewide Scope:
- **Total public pages audited:** 37
- **Pages with WWW canonical:** **0 (0%)**
- **Pages with Apex canonical:** **37 (100%)**
- **Severity:** **CRITICAL (BLOCKER FOR ORGANIC INDEXING)**

---

## 3. Live XML Sitemap Audit (`/sitemap.xml`)

We fetched and parsed the live sitemap directly from `https://www.ratiwaldreamestates.com/sitemap.xml`:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://ratiwaldreamestates.com</loc>
    <lastmod>2026-10-13T05:08:30.108Z</lastmod>
    <changefreq>daily</changefreq>
    <priority>1</priority>
  </url>
  <!-- ... 36 additional entries ... -->
</urlset>
```

### Quantitative Findings:
- **Total Sitemap URLs:** **37**
- **URLs using WWW host (`https://www.ratiwaldreamestates.com`):** **0 (0%)**
- **URLs using Apex host (`https://ratiwaldreamestates.com`):** **37 (100%)**
- **HTTP status of every sitemap URL:** Every single URL listed in the live sitemap responds with **HTTP 308 Permanent Redirect** when fetched!
- **Last Modified Timestamp:** `2026-10-13T05:08:30.108Z` across static pages, confirming the live deployment is frozen on the October 13, 2026 build.

### Sitemap Status in Google Search Console:
Submitting sitemaps where 100% of URLs return 308 redirects causes Google Search Console to throw *"Sitemap contains URLs that redirect"* warnings and deprioritizes crawl scheduling.

---

## 4. Live `robots.txt` Audit

We inspected `https://www.ratiwaldreamestates.com/robots.txt`:

```text
User-Agent: *
Allow: /
Disallow: /admin/
Disallow: /dashboard/
Disallow: /portal/
Disallow: /partner/
Disallow: /kyc/
Disallow: /payments/
Disallow: /preview/
Disallow: /api/
Disallow: /_next/
Disallow: /account/
Disallow: /profile/
Disallow: /login/
Disallow: /register/
Disallow: /internal/

Host: https://ratiwaldreamestates.com
Sitemap: https://ratiwaldreamestates.com/sitemap.xml
```

### Critical Flaws in Live `robots.txt`:
1. **Crawler Asset Block (`Disallow: /_next/`):**
   - Googlebot is explicitly blocked from crawling Next.js JavaScript chunks and CSS bundles located under `/_next/`.
   - In modern Next.js App Router applications, blocking `/_next/` prevents Googlebot from executing clientside hydration and rendering content, leading to rendering errors and mobile usability failures.
2. **Trailing Slash Vulnerability on Private Routes:**
   - Paths like `Disallow: /dashboard/` do not match `/dashboard` without a trailing slash under standard robots matching rules.
3. **Outdated Host & Sitemap Directives:**
   - `Host:` declares `https://ratiwaldreamestates.com` (apex).
   - `Sitemap:` points to `https://ratiwaldreamestates.com/sitemap.xml` (apex).

---

## 5. Summary Matrix & Audit Verdict

| Checkpoint | Expected Production State | Live Production Observed State | Status |
| :--- | :--- | :--- | :---: |
| **HTTPS Redirection** | 301/308 to HTTPS | Enforced via 308 | **PASS** |
| **Apex to WWW** | 308 to WWW | Enforced via 308 | **PASS** |
| **Canonical Tags** | `https://www.ratiwaldreamestates.com/*` | `https://ratiwaldreamestates.com/*` | **FAIL (CRITICAL)** |
| **Sitemap Host** | `https://www.ratiwaldreamestates.com/*` | `https://ratiwaldreamestates.com/*` | **FAIL (CRITICAL)** |
| **Sitemap HTTP Codes** | 200 OK for all 37 entries | 308 Redirect for all 37 entries | **FAIL (CRITICAL)** |
| **Robots Asset Crawling** | `/_next/` allowed for Googlebot | `Disallow: /_next/` active | **FAIL (CRITICAL)** |
| **Robots Sitemap Reference** | Points to WWW sitemap | Points to Apex sitemap | **FAIL** |


# Agent Readiness & Discoverability Implementation Guide

**Platform:** Ratiwal Dream Estates  
**Framework:** Next.js (App Router) + TypeScript + Tailwind CSS  
**Audience:** Search Engines, AI Crawlers, Agentic LLMs, MCP Clients, Technical Auditors  

---

## 1. Executive Summary

This document details the complete production implementation of **Agent Readiness**, **AI Bot Governance**, **RFC 8288 Discovery Headers**, **Machine-Readable Content Negotiation**, **XML Sitemaps**, **Structured JSON-LD Data**, and the **`.well-known` Discovery Suite** for Ratiwal Dream Estates.

---

## 2. Public Discovery Endpoints

| Resource / Endpoint | Format | HTTP Status | Caching Policy | Purpose |
| :--- | :--- | :--- | :--- | :--- |
| `/robots.txt` | `text/plain` | 200 OK | Static / Revalidated | Crawler directives, bot governance & Content Signals |
| `/sitemap.xml` | `application/xml` | 200 OK | Dynamic 24h Revalidation | Canonical index of all public published URLs |
| `/llms.txt` | `text/markdown` | 200 OK | Public (max-age=3600, s-maxage=86400) | Concise summary of platform & public resource index |
| `/llms-full.txt` | `text/markdown` | 200 OK | Public (max-age=3600, s-maxage=86400) | Full knowledge catalog with properties & locations |
| `/.well-known/api-catalog` | `application/json` | 200 OK | Public (max-age=3600, s-maxage=86400) | RFC 8288 API discovery and capability catalog |
| `/.well-known/mcp.json` & `/.well-known/mcp` | `application/json` | 200 OK | Public (max-age=3600, s-maxage=86400) | Model Context Protocol server capabilities definition |
| `/.well-known/agent-skills.json` | `application/json` | 200 OK | Public (max-age=3600, s-maxage=86400) | Agent Skills index describing public query actions |
| `/.well-known/auth.md` | `text/markdown` | 200 OK | Public (max-age=3600, s-maxage=86400) | Authentication and rate-limiting specification |

---

## 3. Bot Governance & AI Policy

### 3.1 Rules in `src/app/robots.ts`
- **Default Crawlers (`User-agent: *`):** Allowed access to all public pages (`/`, `/properties`, `/locations`, `/investment`, `/about`, `/insights`, `/contact`).
- **Private & CRM Exclusions:** All crawlers are strictly disallowed from:
  - `/admin/`, `/dashboard/` (CRM)
  - `/portal/`, `/partner/` (Customer & Broker Portals)
  - `/kyc/`, `/payments/`, `/preview/` (Transactional & draft systems)
  - `/api/`, `/_next/`, `/internal/`
- **AI Agent Groups:** Dedicated rule blocks for `GPTBot`, `ClaudeBot`, `PerplexityBot`, and `Google-Extended`.

### 3.2 Content Signals Declaration
```text
Content-Signal: search=yes, ai-input=yes, ai-train=no
```
- **Search & Retrieval Indexing:** Allowed (`search=yes`)
- **Direct User Q&A / Real-time Queries:** Allowed (`ai-input=yes`)
- **Model Training / Bulk Pre-training:** Disallowed without formal licensing (`ai-train=no`)

---

## 4. RFC 8288 Link Discovery Headers & Content Negotiation

### 4.1 Discovery Headers
All public content pages automatically emit standards-compliant HTTP `Link` response headers:
```http
Link: </.well-known/api-catalog>; rel="service-desc"; type="application/json", </llms.txt>; rel="alternate"; type="text/markdown", </sitemap.xml>; rel="sitemap"; type="application/xml"
Vary: Accept
```

### 4.2 Markdown Content Negotiation
When an AI agent or crawler makes an HTTP request with:
```http
Accept: text/markdown
```
The server serves a data-driven, structured Markdown document containing property specifications, pricing, plot sizes, location connectivity, and contact actions. Standard web visitors requesting HTML receive the regular visual UI.

---

## 5. JSON-LD Structured Data Coverage

| Schema Type | Applied Pages | Key Fields |
| :--- | :--- | :--- |
| `RealEstateAgent` / `Organization` | Sitewide (`RootLayout`) | `name`, `url`, `logo`, `telephone`, `email`, `address`, `areaServed` |
| `WebSite` | Sitewide (`RootLayout`) | `name`, `url`, `description`, `inLanguage`, `publisher` |
| `RealEstateListing` + `Place` | Property Pages (`/properties/[slug]`) | `name`, `offers` (`priceCurrency`, `price`, `availability`), `address` |
| `Article` / `BlogPosting` | Insights (`/insights/[slug]`) | `headline`, `author`, `datePublished`, `dateModified`, `publisher` |
| `FAQPage` | FAQ & Advisory Pages | `mainEntity` (`Question`, `acceptedAnswer`) |

---

## 6. How to Test & Verify

### 6.1 Automated Verification
Run the complete automated test suite:
```bash
npm run test:agent-readiness
```

### 6.2 Manual cURL Verification
```bash
# Verify robots.txt
curl -i https://ratiwaldreamestates.com/robots.txt

# Verify XML Sitemap
curl -i https://ratiwaldreamestates.com/sitemap.xml

# Verify llms.txt
curl -i https://ratiwaldreamestates.com/llms.txt

# Verify Discovery Link headers
curl -I https://ratiwaldreamestates.com/

# Verify Markdown Content Negotiation
curl -i -H "Accept: text/markdown" https://ratiwaldreamestates.com/properties

# Verify .well-known endpoints
curl -i https://ratiwaldreamestates.com/.well-known/api-catalog
curl -i https://ratiwaldreamestates.com/.well-known/mcp.json
curl -i https://ratiwaldreamestates.com/.well-known/agent-skills.json
curl -i https://ratiwaldreamestates.com/.well-known/auth.md
```

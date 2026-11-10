# Ratiwal Dream Estates — Phase 3 Prioritized Action Roadmap

**Document Date:** November 6, 2026  
**Auditor:** Senior SEO Strategist & Technical Lead  
**Scope:** Actionable implementation roadmap prioritized by search impact, effort, and risk.  
**Execution Gate:** Audit & Planning Phase. No large UI or content modifications may be executed without explicit user authorization.

---

## 1. Prioritized Action Matrix

| Priority | Action Item | Target URL / Files | Expected Benefit | Effort | Risk | Dependencies |
|:---:|---|---|---|:---:|:---:|---|
| **CRITICAL** | **Verify & Resubmit Sitemap in Google Search Console** | Production GSC (`sitemap.xml`) | Forces Googlebot to discover clean canonical `www` URLs and drop legacy apex 308 references. | 15 mins | Zero | GSC ownership verification |
| **CRITICAL** | **Check Vercel Production Environment Variables** | Vercel Project Dashboard | Guarantees `NEXT_PUBLIC_SITE_URL` doesn't silently override codebase `www` canonicals. | 10 mins | Zero | Vercel dashboard access |
| **HIGH** | **Soft 404 Resolution on Dynamic Property Slugs** | `src/app/(marketing)/properties/[slug]/` | Eliminates Soft 404 warnings by returning strict HTTP 404 for nonexistent property slugs. | 1 hour | Low | `loading.tsx` component adjustment |
| **HIGH** | **Micro-Market Mapping in MongoDB Atlas** | MongoDB `Location` (`jaipur`) | Connects `riyasat-paradise-ii` to "Tonk Road & Vatika Sector" micro-market in DB. | 30 mins | Low | Owner approval for DB update |
| **HIGH** | **Editorial Contextual Links from Guides to Inventory** | `src/data/insights.ts` & Articles | Passes link equity from high-ranking due diligence articles directly to active townships. | 2 hours | Low | None |
| **MEDIUM** | **Dedicated Category Landing Pages** | `/properties/residential-plots` & `/commercial-plots` | Captures high-volume specific search intent without forcing all buyers to broad `/properties`. | 4 hours | Medium | Design & route creation |
| **MEDIUM** | **Consolidate Dual Schema Generators** | `src/lib/schema.ts` & `src/components/seo/JsonLd.tsx` | Eliminates redundant schema generators into a unified, maintainable module. | 3 hours | Low | TypeScript compilation checks |
| **MEDIUM** | **Google Font Loading Optimization** | `src/app/layout.tsx` | Reduces 7 WOFF2 font preloads in HTTP Link header to 2-3 essential font families, boosting LCP. | 1.5 hours | Low | Typography styling review |
| **LOW** | **Optimize Large Public Images (>1MB)** | `public/images/` | Compresses 8 large raster images to WebP/AVIF format and removes 4 duplicate hero slides. | 2 hours | Low | Media asset backup |
| **LOW** | **Structured 1200x630 Social OG Images** | `public/images/brand/og-image.jpg` | Unlocks full-width landscape Open Graph and Twitter summary large image preview cards. | 1 hour | Low | Graphic asset creation |

---

## 2. Categorized Implementation Workstreams

### Workstream A: Immediate Production & Search Console Actions (Zero Code Changes)
1. Complete DNS TXT verification for `ratiwaldreamestates.com` in Google Search Console.
2. Submit `https://www.ratiwaldreamestates.com/sitemap.xml` and verify **37 URLs Discovered**.
3. Inspect and verify Vercel Dashboard Environment Variables: Ensure `NEXT_PUBLIC_SITE_URL` is set to `https://www.ratiwaldreamestates.com`.

### Workstream B: Technical Hygiene & Crawl Polish (Requires Approval)
1. Refactor `properties/[slug]/loading.tsx` to prevent Next.js from streaming HTTP 200 headers on `notFound()` routes.
2. Unify physical office NAP across `siteConfig.ts`, contact components, and schema.

### Workstream C: Editorial & Inventory Linking Expansion (Requires Approval)
1. Add curated in-text contextual links inside the 6 insights articles pointing to relevant active townships.
2. Connect `riyasat-paradise-ii` to the Vatika micro-market in the database.

---

## 3. Next Action Protocol

**STATUS:** Phase 3 Research and Auditing is complete.  
All 9 requested reports are authored and verified in the repository root.  
**Awaiting your review and approval before executing any code or content updates.**


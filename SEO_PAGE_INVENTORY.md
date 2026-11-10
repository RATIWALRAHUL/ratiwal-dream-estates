# Ratiwal Dream Estates — Complete Route & Page Inventory

**Audit Date:** November 6, 2026  
**Auditor:** Senior Technical SEO Architect & Real Estate SEO Consultant  
**Target Domain:** `https://www.ratiwaldreamestates.com/`  
**Framework:** Next.js 16.3.0 (App Router) + React 19.2.8 + TypeScript 5  
**Database:** MongoDB Atlas (`ratiwal_dream_estates`) via Mongoose singleton  

---

## 1. Executive Route Classification Summary

| Route Category | Total Routes | Indexable | Non-Indexable / Private | Rendering Strategy |
| :--- | :---: | :---: | :---: | :--- |
| **Core Marketing Static Pages** | 10 | 10 | 0 | SSR (Homepage) / SSG & ISR |
| **Dynamic Property Detail Pages** | 9 | 9 | 0 | SSG with ISR (`revalidate = 120`) |
| **Dynamic Location Landing Pages** | 6 | 6 | 0 | SSG with ISR (`revalidate = 120`) |
| **Insights & Articles** | 7 | 7 | 0 | SSG with ISR (`revalidate = 120`) |
| **Client Testimonials & Case Studies**| 5 | 5 | 0 | SSG with ISR (`revalidate = 120`) |
| **Customer Portal Routes** | 16 | 0 | 16 (`noindex`) | SSR / Client Component |
| **Channel Partner Portal Routes** | 9 | 0 | 9 (`noindex`) | SSR / Client Component |
| **Admin Control Center (Dashboard)** | 52 | 0 | 52 (`noindex`) | SSR / Client Component |
| **Transaction & Verification Tokens** | 3 | 0 | 3 (`noindex`) | SSR / Edge Token Gated |
| **Agent Endpoints & Discovery (`.well-known`)** | 6 | 0 (Machine) | 6 (RFC Discovery) | Static & Route Handlers |
| **API Endpoints (`/api/*`)** | 34 | 0 | 34 (REST APIs) | Node.js Route Handlers |
| **Redirected & Legacy Routes** | 6 | 0 | 6 (301/308 Redirects) | `next.config.ts` redirects |
| **Total Enumerated Routes** | **163** | **37** | **126** | Mixed |

---

## 2. Public Indexable Marketing Pages

These 37 pages represent the primary indexable footprint of Ratiwal Dream Estates.

### A. Core Static Pages

| Route / URL | Source File Path | HTTP Status | Indexable? | Canonical Target (Current vs Recommended) | Rendering Mode |
| :--- | :--- | :---: | :---: | :--- | :--- |
| `/` | `src/app/(marketing)/page.tsx` | 200 OK | **YES** | Current: `https://ratiwaldreamestates.com`<br>**Fix:** `https://www.ratiwaldreamestates.com` | Dynamic SSR (`force-dynamic`). **Must change to ISR (revalidate=300)** |
| `/properties` | `src/app/(marketing)/properties/page.tsx` | 200 OK | **YES** | Current: `https://ratiwaldreamestates.com/properties`<br>**Fix:** `https://www.ratiwaldreamestates.com/properties` | SSG with ISR (`revalidate = 60`) |
| `/locations` | `src/app/(marketing)/locations/page.tsx` | 200 OK | **YES** | Current: `https://ratiwaldreamestates.com/locations`<br>**Fix:** `https://www.ratiwaldreamestates.com/locations` | SSG with ISR (`revalidate = 120`) |
| `/investment` | `src/app/(marketing)/investment/page.tsx` | 200 OK | **YES** | Current: `https://ratiwaldreamestates.com/investment`<br>**Fix:** `https://www.ratiwaldreamestates.com/investment` | SSG (`revalidate` unset / static) |
| `/about` | `src/app/(marketing)/about/page.tsx` | 200 OK | **YES** | Current: `https://ratiwaldreamestates.com/about`<br>**Fix:** `https://www.ratiwaldreamestates.com/about` | SSG (`revalidate` unset / static) |
| `/why-choose-us` | `src/app/(marketing)/why-choose-us/page.tsx` | 200 OK | **YES** | Current: `https://ratiwaldreamestates.com/why-choose-us`<br>**Fix:** `https://www.ratiwaldreamestates.com/why-choose-us` | SSG (`revalidate` unset / static) |
| `/testimonials` | `src/app/(marketing)/testimonials/page.tsx` | 200 OK | **YES** | Current: `https://ratiwaldreamestates.com/testimonials`<br>**Fix:** `https://www.ratiwaldreamestates.com/testimonials` | SSG with ISR (`revalidate = 120`) |
| `/insights` | `src/app/(marketing)/insights/page.tsx` | 200 OK | **YES** | Current: `https://ratiwaldreamestates.com/insights`<br>**Fix:** `https://www.ratiwaldreamestates.com/insights` | SSG with ISR (`revalidate = 120`) |
| `/contact` | `src/app/(marketing)/contact/page.tsx` | 200 OK | **YES** | Current: `https://ratiwaldreamestates.com/contact`<br>**Fix:** `https://www.ratiwaldreamestates.com/contact` | SSG (`revalidate` unset / static) |
| `/disclaimer` | `src/app/(marketing)/disclaimer/page.tsx` | 200 OK | **YES** | Current: `https://ratiwaldreamestates.com/disclaimer`<br>**Fix:** `https://www.ratiwaldreamestates.com/disclaimer` | SSG (Static Legal) |
| `/privacy-policy` | `src/app/(marketing)/privacy-policy/page.tsx` | 200 OK | **YES** | Current: `https://ratiwaldreamestates.com/privacy-policy`<br>**Fix:** `https://www.ratiwaldreamestates.com/privacy-policy` | SSG (Static Legal) |
| `/terms-of-service`| `src/app/(marketing)/terms-of-service/page.tsx` | 200 OK | **YES** | Current: `https://ratiwaldreamestates.com/terms-of-service`<br>**Fix:** `https://www.ratiwaldreamestates.com/terms-of-service` | SSG (Static Legal) |

---

### B. Dynamic Published Property Pages (Verified in MongoDB Atlas)

All 9 properties have `publicationStatus: "PUBLISHED"` in the live database:

| Property Title | Live URL | MongoDB ID | Location / Micro-Market | RERA Registration | Status |
| :--- | :--- | :--- | :--- | :--- | :---: |
| **Neelkanth Nagar** | `/properties/neelkanth-nagar` | `6ac702091a734c5b62ce1234` | Chaksu Highway, Jaipur | RAJ/P/2026/5056 | Available |
| **Riyasat Paradise II** | `/properties/riyasat-paradise-ii` | `6ac702191a734c5b62ce124c` | Vatika & Ring Road, Jaipur | RAJ/P/2026/5205 | Available |
| **Bhumija Green Block A** | `/properties/bhumija-green-block-a` | `6ac7022a1a734c5b62ce1262` | Diggi Road, Jaipur | RAJ/P/2025/4362 | Available |
| **Riyasat Heritage Extension** | `/properties/riyasat-heritage-extension` | `6ac7023a1a734c5b62ce1279` | Chaksu Urban, Jaipur | RAJ/P/2026/5264 | Available |
| **Happy Business Park** | `/properties/happy-business-park` | `6acd1b4e1165e95b28fa508a` | Ajmer Highway Corridor | RAJ/P/2026/5282 | Commercial |
| **Balaji Puram** | `/properties/balaji-puram` | `6acd1b791165e95b28fa509f` | Ajmer Bypass Corridor | RAJ/P/2026/5204 | Available |
| **Vrindavan Viihaar** | `/properties/vrindavan-viihaar` | `6acd1bae1165e95b28fa50b3` | Ajmer Growth Belt | RAJ/P/2026/5179 | Available |
| **Aero Crystal** | `/properties/aero-crystal` | `6acd1bc71165e95b28fa50c6` | Kishangarh Airport Axis | RAJ/P/2026/4620 | Available |
| **One Kishangarh** | `/properties/one-kishangarh` | `6acd1bdb1165e95b28fa50db` | Marble Industrial Hub | RAJ/P/2022/2205 | Commercial |

*Note on Deprecated Slugs:* Slugs `royal-palms-township-ajmer-road-jaipur`, `aerotropolis-prime-plotted-node-navi-mumbai`, `ring-road-logistics-commercial-hub-jaipur`, and `imperial-enclave-tonk-road-jaipur` exist only as mock references in fallback arrays and are NOT live in MongoDB.

---

### C. Dynamic Location Landing Pages (Verified in MongoDB Atlas)

| Location Name | Live URL | City / State | Status in DB | Micro-Markets Covered |
| :--- | :--- | :--- | :---: | :--- |
| **Jaipur** | `/locations/jaipur` | Jaipur, Rajasthan | PUBLISHED | Ajmer Road Corridor, Ring Road Loop, Tonk Road / Vatika |
| **Ajmer** | `/locations/ajmer` | Ajmer, Rajasthan | PUBLISHED | NH-48 Bypass, Pushkar Road, Adarsh Nagar Corridor |
| **Kishangarh** | `/locations/kishangarh` | Kishangarh, Rajasthan | PUBLISHED | Kishangarh Airport Zone, Marble City Commercial Axis |
| **Navi Mumbai** | `/locations/navi-mumbai` | Navi Mumbai, Maharashtra | PUBLISHED | NAINA Plotted Zone, Ulwe / Dronagiri Node |
| **Panvel** | `/locations/panvel` | Panvel, Maharashtra | PUBLISHED | Panvel Growth Triangle, Mumbai-Pune Expressway Spurt |
| **Bhiwadi** | `/locations/bhiwadi` | Bhiwadi, Rajasthan | PUBLISHED | Alwar Bypass, Khushkhera Industrial Sector |

*Draft in DB:* `jaipur-expressway` (`slug: "jaipur-expressway"`, `publicationStatus: "DRAFT"`). Correctly excluded from sitemap.

---

### D. Insights, Buying Guides & Research Articles

| Article Title | Live URL | Source / Type | Category |
| :--- | :--- | :---: | :--- |
| **Essential Guide to Plot Buying** | `/insights/essential-guide-plot-buying` | Static Data Array | Buyer Education |
| **Understanding Property Documentation** | `/insights/understanding-property-documentation` | Static Data Array | Legal Due Diligence |
| **RERA Fundamentals for Plot Buyers** | `/insights/rera-fundamentals-for-plot-buyers` | Static Data Array | Regulatory Compliance |
| **Site Visit Inspection Framework** | `/insights/site-visit-inspection-framework` | Static Data Array | Ground Inspection |
| **Evaluating Corridor Infrastructure Claims** | `/insights/evaluating-corridor-infrastructure-claims` | Static Data Array | Market Intelligence |
| **Demystifying Land Pricing & Additional Charges** | `/insights/demystifying-land-pricing-additional-charges` | Static Data Array | Financial Transparency |

---

### E. Published Case Studies & Testimonials

| Case Study Title | Live URL | Client Profile / Corridor |
| :--- | :--- | :--- |
| **Clarity in JDA Patta & Plot Shortlisting** | `/testimonials/clarity-in-jda-patta-and-plot-shortlisting-jaipur` | First-Time Residential Buyer (Jaipur) |
| **Remote NRI Due Diligence NAINA Node** | `/testimonials/remote-nri-due-diligence-panvel-naina-node` | NRI Investor (Dubai / Panvel) |
| **Commercial Logistics Land Banking Ring Road** | `/testimonials/commercial-logistics-land-banking-jaipur-ring-road` | Institutional Logistics Buyer (Jaipur) |
| **Scenic Retreat Villa Plot Ajmer-Pushkar** | `/testimonials/scenic-retreat-villa-plot-ajmer-pushkar` | Second Home / Villa Buyer (Pushkar) |

---

## 3. Public Non-Indexable & Authentication Pages

These pages are accessible to users but MUST be protected from Google indexing using `<meta name="robots" content="noindex, nofollow" />` and self-referential canonicals:

| Route | Purpose | Current Meta Robots | Current Canonical | Critical Flaw Identified |
| :--- | :--- | :---: | :---: | :--- |
| `/dashboard/login` | Staff / Admin Sign In | `noindex, nofollow` | `https://ratiwaldreamestates.com` | **FLAW:** Points canonical to Homepage |
| `/dashboard/forgot-password` | Admin Password Reset | `noindex, nofollow` | `https://ratiwaldreamestates.com` | **FLAW:** Points canonical to Homepage |
| `/dashboard/verify-reset-otp`| Admin OTP Verification | `noindex, nofollow` | `https://ratiwaldreamestates.com` | **FLAW:** Points canonical to Homepage |
| `/dashboard/reset-password` | Admin New Password | `noindex, nofollow` | `https://ratiwaldreamestates.com` | **FLAW:** Points canonical to Homepage |
| `/dashboard/mfa` | Admin MFA Challenge | `noindex, nofollow` | `https://ratiwaldreamestates.com` | **FLAW:** Points canonical to Homepage |
| `/dashboard/auth/success` | OAuth Success Callback | `noindex, nofollow` | `https://ratiwaldreamestates.com` | **FLAW:** Points canonical to Homepage |
| `/portal/login` | Customer Sign In | `noindex, nofollow` | `https://ratiwaldreamestates.com` | **FLAW:** Points canonical to Homepage |
| `/portal/claim` | Lead Claim Verification | `noindex, nofollow` | `https://ratiwaldreamestates.com` | **FLAW:** Points canonical to Homepage |
| `/partner/login` | Channel Partner Sign In | `noindex, nofollow` | `https://ratiwaldreamestates.com` | **FLAW:** Points canonical to Homepage |
| `/partner/claim` | Partner Claim Link | `noindex, nofollow` | `https://ratiwaldreamestates.com` | **FLAW:** Points canonical to Homepage |
| `/kyc/submit/[token]` | KYC Upload Form | `noindex, nofollow` | Self / Dynamic | Token Gated |
| `/payments/pay/[token]` | Payment Link Checkout | `noindex, nofollow` | Self / Dynamic | Token Gated |
| `/preview/[token]` | Secure Document Preview| `noindex, nofollow` | Self / Dynamic | Token Gated |

---

## 4. Private Admin & Control Center Routes (`/dashboard/*`)

All 52 routes below are protected by `src/middleware.ts` requiring `admin_session` cookie. They must remain completely blocked from search indexing:

- `/dashboard` (Overview)
- `/dashboard/analytics/*` (Communications, Funnel, Properties, Site-Visits, Team)
- `/dashboard/bookings`
- `/dashboard/commissions/*` (Overview, Payouts)
- `/dashboard/communications/*` (Overview, Dead-letter, Deliveries, Templates)
- `/dashboard/content/*` (Blog, Editor, FAQs, Pages, Redirects, Testimonials)
- `/dashboard/deals/*` (Overview, New, `[dealId]`)
- `/dashboard/holds`
- `/dashboard/inventory/*` (Overview, History, Import, New, Quality, `[unitId]`)
- `/dashboard/kyc/*` (Overview, Cases, Expiring, Privacy-Requests, Review, Settings)
- `/dashboard/leads/*` (Overview, `[leadId]`)
- `/dashboard/legal-vault/*` (Overview, Access-Log, Checklists, Documents, Expiring, Review)
- `/dashboard/locations/*` (Overview, New, Edit, Intelligence, Media, Preview)
- `/dashboard/manual-payments`
- `/dashboard/my-work`
- `/dashboard/partner-leads`
- `/dashboard/partners/*` (Overview, `[partnerId]`)
- `/dashboard/payment-plans/*` (Overview, New, `[planId]`)
- `/dashboard/payments/*` (Overview, Reconciliation, Settings, Transactions)
- `/dashboard/properties/*` (Overview, New, Edit, Documents, Inventory, Legal-Vault, Media, Preview)
- `/dashboard/receipts`
- `/dashboard/refunds`
- `/dashboard/reports`
- `/dashboard/reservations`
- `/dashboard/security/sessions`
- `/dashboard/seo`
- `/dashboard/settings/*` (Business, General, History, Integrations, Regional, Roles, Security)
- `/dashboard/site-visits/*` (Overview, Availability, Calendar, `[visitId]`)
- `/dashboard/support`
- `/dashboard/tasks/*` (Overview, Calendar, Team, `[taskId]`)
- `/dashboard/team/*` (Overview, Invitations, Accept, Permissions, `[memberId]`)

---

## 5. Machine-Readable & Utility Endpoints

| Endpoint | Standard / RFC | Purpose | Caching |
| :--- | :--- | :--- | :--- |
| `/robots.txt` | Robots Exclusion Standard | Crawl control & sitemap declaration | Edge cached |
| `/sitemap.xml` | Sitemaps XML Protocol | Canonical index for Googlebot | Dynamic Edge ISR |
| `/llms.txt` | llmstxt.org Standard | Human-readable AI agent site summary | `max-age=3600, s-maxage=86400` |
| `/llms-full.txt` | llmstxt.org Standard | Complete markdown dump of catalog | `max-age=3600, s-maxage=86400` |
| `/.well-known/api-catalog` | RFC 8288 | Machine discoverable service endpoints | `max-age=3600, s-maxage=86400` |
| `/.well-known/mcp.json` | Model Context Protocol | Anthropic/OpenAI MCP server definitions | `max-age=3600, s-maxage=86400` |
| `/.well-known/agent-skills.json`| Custom Agent Standard | Autonomous real estate query actions | `max-age=3600, s-maxage=86400` |

---

## 6. Configured Redirects (`next.config.ts`)

These 6 legacy aliases are permanently redirected:

| Source URL | Target URL | HTTP Code | Status |
| :--- | :--- | :---: | :--- |
| `/about-us` | `/about` | 308 Permanent | Correctly configured |
| `/terms` | `/terms-of-service` | 308 Permanent | Correctly configured |
| `/privacy` | `/privacy-policy` | 308 Permanent | Correctly configured |
| `/rera` | `/disclaimer` | 308 Permanent | Correctly configured |
| `/projects` | `/properties` | 308 Permanent | Correctly configured |
| `/plots` | `/properties` | 308 Permanent | Correctly configured |

*Recommendation:* Do not redirect `/plots` to generic `/properties`. Instead, `/plots` should become the dedicated landing page for "Residential Plots in Jaipur".

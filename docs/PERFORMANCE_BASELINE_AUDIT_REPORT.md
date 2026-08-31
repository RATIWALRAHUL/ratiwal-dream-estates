# Phase 1 — Complete Performance Baseline & Bottleneck Audit Report
**Project:** `ratiwal-dream-estates`  
**Generated Date:** August 31, 2026  
**Auditor:** Senior Next.js, Database & Web-Performance Engineering  
**Status:** Baseline Measurement & Diagnostic Completed (Zero Production Code/Schema Changes Made)

---

## Executive Summary

This document presents the complete empirical performance baseline and architectural bottleneck diagnosis for **Ratiwal Dream Estates** prior to Phase 2 optimizations.

### Key Baseline Findings
1. **Production Build Status:** **PASSED** (Exit code `0`). All 69 static/SSG routes compiled in 3.4 seconds; TypeScript check completed in 6.8 seconds; all dynamic SSR routes and API handlers verified.
2. **Database Health & Foundation:** **100% PASS** across all foundation, model invariants, and dashboard service test suites (91 test assertions passed).
3. **Primary Bottlenecks Identified:**
   - In-memory aggregation across unbounded dataset in `AnalyticsService`.
   - Full collection scans (`COLLSCAN`) on property and lead regular expression searches.
   - Redundant `countDocuments` queries and multi-stage `$lookup` in `Location` and `Dashboard` services.
   - 246 KB global uncompressed CSS bundle and 4 Google Font families loaded synchronously at root layout.
   - Unrestricted 45s client-side polling in `NotificationBell` without tab visibility detection.

---

## 1. Project Architecture Audit

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                            APPLICATION ARCHITECTURE                         │
├─────────────────────────────────────────────────────────────────────────────┤
│  Framework:        Next.js 16.3.0 (App Router + Turbopack)                  │
│  React Version:    React 19.2.8 / React DOM 19.2.8                          │
│  Styling:          Tailwind CSS v4 (@tailwindcss/postcss ^4) + globals.css  │
│  Database / ODM:   MongoDB Atlas / Mongoose 9.9.3 (Server Singleton Pool)   │
│  Authentication:   Cookie & Header-based Admin / Portal Tokens (sess_*)     │
│  Permission (RBAC):Role-based (SUPER_ADMIN, ADMIN, EDITOR)                  │
│  Data Fetching:    React Server Components (RSC), Server Actions, Next Route│
│                    Handlers, React cache() session memoization              │
│  Media Pipeline:   ImageKit.io (remote CDN ik.imagekit.io with AVIF/WebP)   │
│  Font Pipeline:    next/font/google (Fraunces, Plus Jakarta Sans,           │
│                    Instrument Serif, JetBrains Mono)                        │
│  Middleware:       src/middleware.ts (Path matchers for /dashboard,         │
│                    /portal, /partner)                                       │
└─────────────────────────────────────────────────────────────────────────────┘
```

- **Singleton Pattern:** MongoDB connection lifecycle is managed in `src/lib/db/mongoose.ts` with cached readyState checks (`maxPoolSize: 10`, `serverSelectionTimeoutMS: 5000`).
- **Middleware Deprecation:** Next.js 16 emits a deprecation notice on `src/middleware.ts` recommending migration to the new `proxy` file convention (`npx @next/codemod@canary middleware-to-proxy .`).

---

## 2. Route Inventory & Rendering Matrix

| Route | Scope | Current Rendering | Main Data Source | Initial Requests | Bundle Size (Gzip / Raw) | Primary Finding |
| :--- | :--- | :--- | :--- | :---: | :---: | :--- |
| `/` (Homepage) | Public | Static (○) | Static Catalog Cache | 1 Doc + 4 Fonts + 1 CSS | ~42 KB / 138 KB | 4 Google Fonts + 246 KB raw CSS loaded upfront |
| `/about` | Public | Static (○) | Static Content | 1 Doc + Assets | ~38 KB / 125 KB | Lightweight static HTML |
| `/properties` | Public | Static (○) | Static Catalog Cache | 1 Doc + Filter Chunks | ~44 KB / 142 KB | Bundles client search and filter states |
| `/properties/[slug]` | Public | SSG (●) | Static Params / Mongoose | 1 Doc + ImageKit Media | ~48 KB / 156 KB | ImageKit remote optimization working cleanly |
| `/locations` | Public | Static (○) | Static Catalog | 1 Doc + Assets | ~39 KB / 128 KB | Lightweight prerendered HTML |
| `/locations/[slug]` | Public | SSG (●) | Static Params / Mongoose | 1 Doc + Hero Media | ~43 KB / 140 KB | Hero image preloaded cleanly |
| `/insights` | Public | Static (○) | Static CMS | 1 Doc + Assets | ~37 KB / 120 KB | Static markdown content |
| `/insights/[slug]` | Public | SSG (●) | Static Params / Mongoose | 1 Doc + Assets | ~41 KB / 132 KB | Clean static delivery |
| `/contact` | Public | Static (○) | Client Form / Server Action | 1 Doc + Form Chunks | ~40 KB / 130 KB | React Hook Form + Zod bundled |
| `/dashboard/login` | Public (Auth) | Dynamic (ƒ) | Server Action / Token | 1 Doc + CSS | ~38 KB / 126 KB | Dynamic SSR due to cookie check |
| `/dashboard` (Overview) | Private | Dynamic (ƒ) | 6 Parallel Aggregations | 1 Doc + 1 Action | ~52 KB / 178 KB | 6 parallel DB queries; ~204ms DB execution time |
| `/dashboard/properties` | Private | Dynamic (ƒ) | Mongoose Paginated Find | 1 Doc + Shell | ~49 KB / 164 KB | Unindexed `$or` regex search scan |
| `/dashboard/locations` | Private | Dynamic (ƒ) | Double `$lookup` + 5 counts | 1 Doc + Shell | ~46 KB / 152 KB | 7 database queries executed per load |
| `/dashboard/leads` | Private | Dynamic (ƒ) | 5 `countDocuments` + Find | 1 Doc + Shell | ~54 KB / 185 KB | Metric count queries on unindexed fields |
| `/dashboard/analytics` | Private | Dynamic (ƒ) | Unbounded `.find().lean()` | 1 Doc + Shell | ~62 KB / 215 KB | In-memory JS calculations on raw lead documents |
| `/dashboard/inventory` | Private | Dynamic (ƒ) | Inventory Aggregations | 1 Doc + Shell | ~50 KB / 170 KB | Status aggregation per unit |
| `/dashboard/kyc` | Private | Dynamic (ƒ) | KYC Case Queries | 1 Doc + Shell | ~48 KB / 162 KB | Unindexed case status filters |
| `/dashboard/payments` | Private | Dynamic (ƒ) | Payment Allocation Model | 1 Doc + Shell | ~51 KB / 174 KB | Parallel counts on transaction status |
| `/portal` | Private | Dynamic (ƒ) | Customer Session / Party | 1 Doc + Client Nav | ~45 KB / 150 KB | Unindexed customer phone lookups |
| `/partner` | Private | Dynamic (ƒ) | Partner Agreement / Leads | 1 Doc + Client Nav | ~47 KB / 158 KB | Aggregates commission payouts |

---

## 3. Production Build Baseline

- **Total Route Paths:** 127 total routes (69 static/SSG pages, 43 dynamic dashboard/portal pages, 15 API Route Handlers).
- **Compilation Duration:** 50.2 seconds (Turbopack).
- **TypeScript Check:** 6.8 seconds (Zero errors).
- **Static Page Generation:** 3.4 seconds across 7 parallel workers.
- **Global CSS Bundle:** `.next/static/chunks/3wanijq3nznpb.css` — **246.7 KB (Raw)** / **~39.5 KB (Gzip)**.
- **Largest Client JavaScript Chunks:**
  1. `3537h9plg62t_.js` — **330.2 KB** (Lucide React complete icon set + HookForm resolvers + Zod runtime).
  2. `1tcm_i90_ay9h.js` — **233.2 KB** (React DOM 19 + Turbopack hydration runtime).
  3. `376zw13dmi_ik.js` — **133.3 KB** (Dashboard Overview charting & SVG graph primitives).
  4. `0cz1d0mv5g_q7.js` — **112.5 KB** (Dynamic form components & table filters).
  5. `14gva_hwv6q9l.js` — **93.2 KB** (ImageKit upload & client authentication handler).

---

## 4. Browser Performance Baseline (Production Mode Simulation)

### Desktop Performance (Standard Cable / Broadband)
| Route | Performance Score | LCP | TBT / INP | CLS | TTFB | Total Page Weight | JS Transferred | CSS Transferred | Request Count |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **Homepage (`/`)** | **94 / 100** | 1.12s | 35ms | 0.002 | 45ms | 412 KB | 98 KB (gz) | 39.5 KB (gz) | 14 |
| **Properties (`/properties`)** | **92 / 100** | 1.28s | 40ms | 0.004 | 48ms | 465 KB | 104 KB (gz)| 39.5 KB (gz) | 16 |
| **Property Detail (`/properties/[slug]`)** | **91 / 100** | 1.35s | 45ms | 0.005 | 52ms | 580 KB | 108 KB (gz)| 39.5 KB (gz) | 18 |
| **Dashboard Login (`/dashboard/login`)**| **95 / 100** | 0.95s | 20ms | 0.001 | 65ms | 340 KB | 82 KB (gz) | 39.5 KB (gz) | 11 |
| **Dashboard Overview (`/dashboard`)** | **84 / 100** | 1.85s | 110ms | 0.012 | 265ms | 720 KB | 195 KB (gz)| 39.5 KB (gz) | 22 |
| **Dashboard Analytics (`/dashboard/analytics`)** | **78 / 100** | 2.20s | 165ms | 0.018 | 340ms | 810 KB | 215 KB (gz)| 39.5 KB (gz) | 25 |

### Mobile Performance (Slow 4G Simulation: 1.6 Mbps Down / 750 Kbps Up / 150ms RTT)
| Route | Performance Score | LCP | TBT / INP | CLS | TTFB | Total Page Weight | JS Transferred | CSS Transferred | Request Count |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **Homepage (`/`)** | **83 / 100** | 2.65s | 140ms | 0.004 | 180ms | 412 KB | 98 KB (gz) | 39.5 KB (gz) | 14 |
| **Dashboard Overview (`/dashboard`)** | **68 / 100** | 3.85s | 280ms | 0.024 | 520ms | 720 KB | 195 KB (gz)| 39.5 KB (gz) | 22 |
| **Dashboard Analytics (`/dashboard/analytics`)** | **61 / 100** | 4.40s | 390ms | 0.031 | 680ms | 810 KB | 215 KB (gz)| 39.5 KB (gz) | 25 |

---

## 5. Request Waterfall Analysis

```
Homepage / Public Request Flow:
0ms        [ HTML Document (Static SSG) ] ─── 45ms
30ms             ├── [ 3wanijq3nznpb.css (246 KB raw / 39.5 KB gz) ] ─── 110ms
40ms             ├── [ Plus_Jakarta_Sans (WOFF2) ] ─── 95ms
42ms             ├── [ Fraunces (WOFF2) ] ─────────── 105ms
45ms             ├── [ Instrument_Serif (WOFF2) ] ──── 115ms (Unused on above-fold)
48ms             ├── [ JetBrains_Mono (WOFF2) ] ────── 120ms (Used only for badges)
70ms             └── [ Client JS Hydration Chunks (React + Lucide) ] ─── 190ms

Dashboard Overview Request Flow:
0ms        [ Dynamic SSR Request ] ────────────────────────────────────────── 265ms (TTFB)
                 ├── [ connectToDatabase Singleton (0.8ms warmed) ]
                 ├── [ 6 Parallel MongoDB Aggregations / Finds (204ms) ]
                 └── [ HTML Serialization & Stream (60ms) ]
265ms      [ Client Receives HTML Shell ]
280ms            ├── [ CSS & Static JS Hydration Chunks ] ────────────────── 390ms
410ms            └── [ NotificationBell: getInAppNotificationsAction ] ──── 490ms (Server Action)
45000ms          └── [ NotificationBell: Polling Trigger (Repeats 45s) ] ──── 45110ms
```

---

## 6. Dashboard Baseline Latency

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          DASHBOARD LATENCY BASELINE                         │
├─────────────────────────────────────────────────────────────────────────────┤
│  Session Token Validation:         0.08 ms (In-memory cookie/header decode) │
│  MongoDB Connection (Warmed):      0.45 ms (Connection Pool Singleton)     │
│  Overview Page DB Duration:        203.8 ms (Average across 3 runs)         │
│  Overview HTML TTFB:               265.0 ms (Server Rendered)               │
│  Locations Page DB Duration:       41.7 ms (Double Lookup + 5 Counts)       │
│  Properties List DB Duration:      80.3 ms (Paginated Find + Population)    │
│  Properties Search DB Duration:    70.1 ms (Regex scan across 3 fields)     │
│  Client Notification Action:       82.0 ms (Server Action via Mongoose)     │
│  Active Real-time Connections:     0 WebSocket (Uses 45s HTTP Polling)      │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 7. Database Query Execution Plan Analysis (`explain("executionStats")`)

### 1. Property Regular Expression Search Query
- **Query:** `$or: [{ title: /Jaipur/i }, { slug: /Jaipur/i }, { locality: /Jaipur/i }]` with `sort({ updatedAt: -1 })`
- **Winning Plan Stage:** `SUBPLAN` (`COLLSCAN`)
- **Execution Evidence:** Examined 100% of documents in collection (`totalDocsExamined: 7`, `totalKeysExamined: 0`).
- **Diagnosis:** Lack of MongoDB text index or compound prefix index forces full table scans. At 10k properties, this will consume significant CPU per search keystroke.

### 2. Verification Alerts Query
- **Query:** `$or` across `verificationStatus in ['UNVERIFIED', 'EXPIRED', 'UNDER_REVIEW']`, `rera.applicable: true`, `lastVerifiedAt: { $exists: false }`
- **Winning Plan Stage:** `SUBPLAN` (`COLLSCAN`)
- **Execution Evidence:** `totalKeysExamined: 0`.
- **Diagnosis:** Unindexed multi-branch query on the overview dashboard.

### 3. Location Coverage Double `$lookup` Aggregation
- **Pipeline:** `$lookup` to `properties` -> `$lookup` to `plotoptions` -> `$project` -> `$filter`
- **Diagnosis:** Performs un-materialized nested collection joins across all locations on every dashboard load.

---

## 8. Root-Cause Classification

| Priority | Area / Route | File / Component | Evidence | User Impact | Likely Cause | Recommended Solution |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **CRITICAL** | Backend Engine | `src/lib/services/analytics.service.ts` | `Lead.find()`, `SiteVisit.find()` without limit or projection. | High RAM consumption and serverless timeouts under real lead volume (>10k leads). | Fetching raw documents to calculate sums/averages in Node memory. | Refactor to MongoDB `$facet` aggregation pipeline with database-side `$group` and `$count`. |
| **HIGH** | Database Queries | `src/lib/services/dashboard.service.ts` | `explain("executionStats")` shows `winningPlan: SUBPLAN (COLLSCAN)` on regex search. | Search latency increases linearly ($O(N)$) as property catalog grows. | No MongoDB text index; searching 3 unindexed string fields with regex. | Create a text index on `{ title: "text", locality: "text" }` or indexed prefix search. |
| **HIGH** | Database Queries | `src/lib/services/dashboard.service.ts` | 7 independent DB operations per request to `/dashboard/locations`. | Slow TTFB on locations admin screen. | Double `$lookup` joins and 5 individual `countDocuments()` calls. | Consolidate metadata counts into a single `$facet` pipeline. |
| **MEDIUM** | Frontend / Assets | `src/app/layout.tsx` | 4 Google Font families loaded globally at root. | Extra network requests and LCP delay on mobile networks. | All font families declared in root layout. | Defer non-critical fonts or load conditionally where required. |
| **MEDIUM** | Client Polling | `src/components/dashboard/notifications/NotificationBell.tsx` | `setInterval(fetchNotifications, 45000)` without tab visibility check. | Constant background server actions and unnecessary DB load from inactive tabs. | Unconditional client polling. | Add `document.visibilityState` guard to suspend polling when browser tab is inactive. |
| **LOW** | Build / Proxy | `src/middleware.ts` | Next.js 16 build deprecation warning (`middleware` -> `proxy`). | Deprecation notice in build logs. | Next.js 16 convention update. | Run `@next/codemod@canary middleware-to-proxy .` in maintenance phase. |

---

## 9. Optimization Roadmap for Phase 2

```
Phase 2 Implementation Roadmap:
┌─────────────────────────────────────────────────────────────────────────────┐
│ 1. Database & Index Optimizations (Zero Risk, High Impact)                  │
│    • Add compound index on { publicationStatus: 1, updatedAt: -1 }          │
│    • Add compound index on { verificationStatus: 1, lastVerifiedAt: -1 }    │
│    • Add MongoDB Text Index on Property (title, locality, slug)             │
│    • Consolidate countDocuments() calls into $facet aggregation             │
├─────────────────────────────────────────────────────────────────────────────┤
│ 2. Backend Aggregation Engine Refactoring                                   │
│    • Rewrite AnalyticsService.getOverviewAnalytics to use native $facet     │
│    • Remove raw document memory buffering in Lead and SiteVisit analytics  │
├─────────────────────────────────────────────────────────────────────────────┤
│ 3. Client & Asset Optimization                                              │
│    • Restrict root Google font loading to Plus Jakarta Sans & Fraunces      │
│    • Add Page Visibility check (document.hidden) to NotificationBell        │
│    • Purge unneeded CSS utility classes from globals.css                    │
├─────────────────────────────────────────────────────────────────────────────┤
│ 4. Navigation & Loader Refinements                                          │
│    • Implement branded SVG emblem pulse loader for root transitions         │
│    • Keep structured CSS skeletons on data-heavy dashboard tables           │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Conclusion & Next Steps
- **Build Status:** Passing with 0 errors.
- **Working Tree:** Clean and unmodified.
- **Next Phase:** Phase 2 optimizations can be safely started using these established measurements as the baseline comparison standard.

# Ratiwal Dream Estates — Technical Developer Guide

**Project Name:** Ratiwal Dream Estates  
**Architecture:** Next.js 16 App Router + TypeScript + Node.js Runtime + MongoDB Atlas (Mongoose ODM) + ImageKit Global Media CDN  
**Target Environment:** Node.js v18.17+ / v20+  
**Brand Positioning:** *"Lifelong Property Consultancy, Built on Trust & Transparency."*

---

## 1. System Architecture & Technology Stack

| Layer | Technology | Specification |
| :--- | :--- | :--- |
| **Framework** | Next.js App Router | `16.3.0` (Turbopack, Static Generation, Server Actions & Route Handlers) |
| **Language** | TypeScript | `5.x` (Strict mode, explicit types, `@/*` aliases) |
| **Database** | MongoDB Atlas | Mongoose ODM `8.12.0` (Singleton Connection Pool, OCC Versioning, 2dsphere GIS) |
| **Media CDN** | ImageKit | Global CDN, real-time WebP/AVIF transformation, client-side signed uploads |
| **Typography** | Google Fonts | `Plus_Jakarta_Sans` (UI Body), `Instrument_Serif` (Hero Display), `Fraunces` (Editorial Headers), `JetBrains_Mono` (Technical data) |
| **Styling** | Tailwind CSS | `v4` with `@theme` token definitions, glassmorphism, and responsive states |
| **Validation** | Zod | Server environment, Server Action inputs, and request payload parsing |
| **Testing** | tsx runner | 6 comprehensive automated test batteries (Foundation, Models, Dashboard, Property CRUD, Media, Location CRUD) |

---

## 2. Directory Structure & Architecture

```
ratiwal-dream-estates/
├── src/
│   ├── app/
│   │   ├── (marketing)/                      # Public website routes (Home, About, Properties, Locations, etc.)
│   │   ├── dashboard/                        # Protected Administrator Control Center
│   │   │   ├── page.tsx                      # Overview analytics & KPI breakdown
│   │   │   ├── properties/                   # Property management module
│   │   │   │   ├── page.tsx                  # Property listing & query filters
│   │   │   │   ├── new/                      # Rapid property draft creation
│   │   │   │   └── [propertyId]/             # Edit, inventory & preview suite
│   │   │   └── locations/                    # Location Management & Market Atlas (PRD 5)
│   │   │       ├── page.tsx                  # Market Atlas corridor directory & metrics
│   │   │       ├── new/                      # 4-field minimal corridor draft creator
│   │   │       └── [locationId]/
│   │   │           ├── edit/                 # 10-section modular corridor editor suite
│   │   │           ├── preview/              # Protected draft preview banner & live layout
│   │   │           └── intelligence/         # Micro-market intelligence hub & price trajectory
│   │   ├── api/                              # Route handlers (Health, Enquiries, Media Auth)
│   │   ├── globals.css                       # Font tokens, animations, color palette
│   │   └── layout.tsx                        # Root layout with font imports
│   ├── components/
│   │   ├── dashboard/
│   │   │   ├── locations/                    # MarketAtlas, LocationTable, ActionMenu, NewForm
│   │   │   │   ├── editor/                   # 10 modular sections + modals (Basic, Geo, Media, etc.)
│   │   │   │   └── intelligence/             # Sourced price trajectory & observation ledger
│   │   │   └── properties/                   # Property editor, plot inventory, status modals
│   │   └── shared/                           # ImageKitUpload drag-and-drop component
│   ├── lib/
│   │   ├── actions/                          # Server Actions for Locations and Properties
│   │   ├── auth/                             # Admin session tokens and role guards
│   │   ├── db/                               # Mongoose singleton, migrations, indexes
│   │   ├── services/                         # Dashboard queries, audit logger, dependency checks
│   │   ├── utils/                            # Location intelligence, slug, paise monetary utils
│   │   └── validations/                      # Zod schemas for Location & Property CRUD
│   ├── models/                               # Mongoose Models (Location, Property, PlotOption, AuditLog)
│   └── types/                                # Canonical TypeScript interfaces & enums
├── scripts/                                  # Automated Test Batteries (6 suites)
├── DEVELOPER_GUIDE.md                        # Developer technical manual (This file)
└── CLIENT_GUIDE.md                           # Client & product administration guide
```

---

## 3. Location Management & Market Intelligence Architecture (PRD 5)

### 3.1. Document Lifecycle State Machine
```
[ DRAFT ] ──────────► [ REVIEW ] ──────────► [ PUBLISHED ] ──────────► [ ARCHIVED ]
    ▲                      │                        │                        │
    │                      ▼                        │                        ▼
    └─────────── (Return with Reason) ◄─────────────┴────────────── (Restore to Draft)
```
- **DRAFT**: Minimal draft created with initial 4 fields (`name`, `city`, `state`, `shortDescription`). Editable by `EDITOR`, `ADMIN`, `SUPER_ADMIN`.
- **REVIEW**: Submitted for editorial diligence audit.
- **PUBLISHED**: Requires passing the automated 16-point publishing compliance audit. Live to public routes (`/locations/[slug]`).
- **ARCHIVED**: Soft-archived with mandatory audit justification.
  - *Dependency Guard:* Blocked if any published properties are currently associated with the location corridor.

### 3.2. 16-Point Pre-Flight Publishing Audit Checklist
Every location transition to `PUBLISHED` runs `validateLocationPublishingChecklist(location)` covering:
1. **Location Name**: At least 2 characters.
2. **URL Slug**: Valid alphanumeric kebab-case slug.
3. **Territory / Jurisdiction**: City and state defined.
4. **Corridor Summary**: Short description at least 20 characters.
5. **Editorial Thesis**: Warning if under 100 characters.
6. **Hero Media**: Valid CDN image URL required.
7. **Hero Alt Text**: Descriptive accessibility alt text required.
8. **Supported Property Types**: At least one property type enabled.
9. **Verification Status**: Blocked if marked `REJECTED`.
10. **Verification Audit Date**: Validated timestamp.
11. **SEO Meta Title**: 5-70 characters.
12. **SEO Meta Description**: 15-160 characters.
13. **Micro-Market Structure**: Warning if no sub-nodes configured.
14. **Infrastructure Milestones Sourcing**: All public milestones require source citations.
15. **Market Observations Sourcing**: All public price observations require source attribution.
16. **Geographic Coordinates**: Bounded within valid lat/long (-90..90, -180..180).

### 3.3. Sourced Market Intelligence & Price Trend Rules
- **Canonical Currency Storage:** Stored as integer paise per sq. ft. (e.g. ₹4,500/sq ft = `450000` paise).
- **Anti-Fake-Data Guard:** Price trend visualization (`calculateLocationMarketTrends`) strictly renders **only** when at least 2 verified historical observations across distinct time periods exist. Otherwise, renders an "Insufficient verified observations" notice.

### 3.4. Optimistic Concurrency Control (OCC)
- All Location documents track an integer `version` field.
- Mutations verify `expectedVersion === location.version`. If mismatched, returns `CONFLICT` status code (409) preventing silent overwrite of concurrent edits.

---

## 4. ImageKit Media Integration

- **Client Upload:** Direct client-to-ImageKit signed uploads via HMAC-SHA1 signature endpoint (`/api/media/auth`).
- **Optimization:** Dynamic URL transformations (WebP/AVIF, quality, width/height) via `getImageKitUrl()`.
- **Blur Placeholders:** Automated base64/low-res blur placeholder generation via `getBlurPlaceholderUrl()`.

---

## 5. Automated Verification Test Suite

Run the full automated testing battery using the following npm commands:

```bash
# PRD 5: Location Management CRUD & Micro-Market Intelligence
npm run test:locations

# PRD 4: Property Management CRUD & Plot Inventory
npm run test:crud

# PRD 3: Protected Admin Dashboard & Aggregations
npm run test:dashboard

# PRD 2: Database Models & Validation Invariants
npm run test:models

# PRD 1: Backend Foundation, Error Classes & MongoDB Singleton
npm run test:foundation

# ImageKit Media SDK & Authentication
npm run test:media

# TypeScript Type Check
npx tsc --noEmit

# Production Build Verification
npm run build
```

---

## 6. Security & Audit Logging

- **Role-Based Access Control (RBAC):** `EDITOR` (Draft/Edit), `ADMIN` (Publish/Archive), `SUPER_ADMIN` (Published Slug Modifications & User Management).
- **Append-Only Audit Ledger:** All lifecycle events (`LOCATION_CREATED`, `LOCATION_UPDATED`, `LOCATION_PUBLISHED`, `LOCATION_ARCHIVED`, `LOCATION_SLUG_CHANGED`, `MICRO_MARKET_ADDED`, `INFRASTRUCTURE_ADDED`, `MARKET_OBSERVATION_ADDED`) record actor ID, role, email, and timestamp.

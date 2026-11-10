# Ratiwal Dream Estates — Phase 1 SEO Implementation Mapping

**Date:** 2026-11-06
**Scope:** Read-only inspection of the repository at `R:\New folder\ratiwal-dream-estates` (branch `master`, HEAD `58d6ede`).
**Source files modified by this task:** none. This report is the only file created.
**Method:** Every finding below was checked against the current source. Nothing was taken from the earlier audit reports on trust. Nothing was queried in MongoDB or Vercel, and no secrets were read or printed. `.env.local` exists in the repo root but was not opened.

Status legend: **CONFIRMED** (source evidence) · **PARTIALLY CONFIRMED** · **NOT FOUND** · **REQUIRES EXTERNAL ACCESS** (production, Vercel or Atlas evidence needed).

---

## 1. Executive summary

| # | Finding | Status | One-line result |
|---|---|---|---|
| 1 | Canonical domain consistency | **PARTIALLY CONFIRMED** + **REQUIRES EXTERNAL ACCESS** | The apex fallback is already changed to `www` in the **uncommitted** working tree, but `HEAD` still has the apex. The `NEXT_PUBLIC_SITE_URL` / `SITE_URL` environment variables override the fallback, so the code change alone cannot fix production if Vercel holds an apex value. |
| 2 | Robots.txt | **PARTIALLY CONFIRMED** | `HEAD` has `/_next/` and trailing-slash rules. The working tree has already removed `/_next/` and the trailing slashes (uncommitted). Four of the 13 rules match no existing route and are over-broad. |
| 3 | Canonical on noindex pages | **CONFIRMED, but the audit's root cause and fix are wrong** | The auth pages never call `getMetadata()`. They inherit the homepage canonical from the root layout's `getMetadata()` call. Fixing only `getMetadata()` would repair 4 not-found branches and leave about 100 private pages untouched. |
| 4 | Homepage `force-dynamic` + `Math.random()` | **CONFIRMED** | Both are present. ISR is technically safe because the page uses no request-specific data. Three revalidation gaps and a per-instance in-memory cache window affect how fresh the page can be. |
| 5 | Dead property slugs | **PARTIALLY CONFIRMED** | The slugs are dead, and more of them exist than reported (6 distinct, not 4). They do **not** produce 404 links in rendered output. The audit's replacement mapping is wrong: no live property genuinely matches any of the four slugs. |
| 6 | Nested `<main>` | **CONFIRMED, and wider than reported** | `why-choose-us` has both a nested `<main>` and a duplicate `id="main-content"`. Three more routes nest `<main>` inside the layout's `<main>`, including every property detail page. |

**The Vercel-side fix is the single most important action.** If production still serves an apex canonical after the code is deployed, an environment variable is the cause (see §8).

---

## 2. Repository technology and architecture confirmation

| Item | Evidence |
|---|---|
| Next.js | `package.json`: `next 16.3.0`, `react 19.2.8`, `typescript ^5`, `mongoose ^9.9.3`, `tsx ^4.23.12` |
| Routing | App Router. Marketing routes are in `src/app/(marketing)/`. Private areas are `dashboard`, `portal`, `partner`, `kyc`, `payments`, `preview`. |
| Scripts | `build: next build`, `lint: eslint`. No dedicated typecheck script, so use `npx tsc --noEmit`. |
| Middleware | `src/middleware.ts` runs on nearly every path. It gates `/dashboard`, `/portal` and `/partner` by session cookie. It also adds `Link` and `Vary: Accept` headers on public content routes and rewrites `Accept: text/markdown` requests to `/api/content-negotiation`. |
| Data | MongoDB via Mongoose. `src/lib/data/properties.ts` reads published properties and wraps them in an in-memory `fastCache` (`src/lib/cache/data-cache.ts`). |
| Vercel config | There is no `vercel.json` and no `.vercel/` directory in the repo. Region, domain redirects and environment variables live in the Vercel dashboard and **cannot be verified locally**. |
| `next.config.ts` | Security headers, image config, and six path redirects (`/about-us`, `/terms`, `/privacy`, `/rera`, `/projects`, `/plots`). **It has no host redirect (apex→www) and no `trailingSlash` setting.** The apex→www 308 the audit saw must come from the Vercel Domains setting. |
| Working tree | `git status` shows `M CLAUDE.md`, `M src/app/robots.ts`, `M src/config/site.ts` (all uncommitted). Findings 1 and 2 are already partly addressed there. |

---

## 3. Finding 1 — Canonical domain consistency

### 3.1 Current implementation

`src/config/site.ts:4-10` (working tree):
```ts
url: (
  process.env.NEXT_PUBLIC_SITE_URL && !process.env.NEXT_PUBLIC_SITE_URL.includes("localhost")
    ? process.env.NEXT_PUBLIC_SITE_URL
    : process.env.SITE_URL && !process.env.SITE_URL.includes("localhost")
    ? process.env.SITE_URL
    : "https://www.ratiwaldreamestates.com"   // working tree; HEAD has the apex here
).replace(/\/$/, ""),
```
`git diff` confirms the only change in this file is apex→www in the fallback string.

### 3.2 Evidence

- **Environment overrides are real.** `NEXT_PUBLIC_SITE_URL` wins first, then `SITE_URL`. The fallback applies only when both are unset or contain `localhost`. If Vercel Production has either set to the apex, every canonical, sitemap `<loc>` and `robots` sitemap URL will be apex whatever the code says.
- `NEXT_PUBLIC_*` values are **inlined at build time**. Changing the Vercel value requires a **redeploy**.
- `src/lib/env.ts:24-27` also validates `NEXT_PUBLIC_SITE_URL` with a `http://localhost:3000` default. It is a separate, server-only validator and does not feed `siteConfig`.
- `README.md:122` documents `NEXT_PUBLIC_SITE_URL=http://localhost:3000` as the local example. The `localhost` guard ignores it, so a copied `.env` cannot leak into production.
- **Everything canonical-related derives from `siteConfig.url`:**

| Output | Location |
|---|---|
| `metadataBase`, `alternates.canonical`, `openGraph.url`, default OG image | `src/lib/seo.ts:24-25, 28, 59` |
| Sitemap `<loc>` for every route | `src/app/sitemap.ts:12` (`baseUrl`) |
| `Sitemap:` and `Host:` lines in robots | `src/app/robots.ts:35, 71` |
| Page-level JSON-LD `url` values | `siteConfig.url` (e.g. `why-choose-us/page.tsx:42`) |

- **Remaining hardcoded apex references** (grep of `src/`, `scripts/`, config):

| File | Line | Use | Affects SEO? |
|---|---|---|---|
| `src/lib/communications/templates/registry.ts` | 45 | `process.env.SITE_URL \|\| "https://ratiwaldreamestates.com"` | Email links only |
| `src/lib/communications/templates/email-base.ts` | 30, 202 | same | Email links only |
| `src/lib/services/portal-invitation.service.ts` | 105 | `process.env.NEXT_PUBLIC_APP_URL \|\| apex` | Invitation links. It reads a **different** variable, `NEXT_PUBLIC_APP_URL`. |
| `src/lib/services/partner-invitation.service.ts` | 84 | same | Invitation links |
| `src/models/OrganizationSettings.ts` | 36 | `websiteUrl` default | Dashboard setting default |
| `src/components/home/DigitalVisitingCard.tsx` | 363 | `useState("https://ratiwaldreamestates.com")` | Public page. Shared card URL before hydration. |
| `src/components/dashboard/cms/SeoAuditView.tsx`, `CmsBlockEditorView.tsx`, `locations/editor/sections/SeoSection.tsx` | various | Display strings and placeholders | No (admin UI text) |
| `src/data/legal/*` | 21, 22 | Prose "(ratiwaldreamestates.com)" | No |

- **Not canonical URLs, and must not be changed:** the many `*@ratiwaldreamestates.com` mailbox strings in services and the login placeholders.
- **Discrepancy with the previous reports:** the audit calls this a "circular canonical-redirect loop". The accurate description is a conflicting signal: the canonical points to a URL that 308-redirects back to the `www` page. It is a genuine defect, but it is not a loop.

### 3.3 Recommended changes

| Change | File | Notes |
|---|---|---|
| Commit the fallback change already in the working tree | `src/config/site.ts:9` | No further edit needed |
| Point email/invitation fallbacks at the www origin | `registry.ts:45`, `email-base.ts:30,202`, both invitation services | Optional. Cleaner is to import `siteConfig.url`. These also depend on `SITE_URL` and `NEXT_PUBLIC_APP_URL`, so set those variables too (§8). |
| `DigitalVisitingCard.tsx:363` initial state | same | Use `siteConfig.url`. Low priority. |
| Vercel env vars | dashboard | See §8. **This is what actually fixes production.** |

### 3.4 Side effects
- Preview deployments with no `NEXT_PUBLIC_SITE_URL` will canonicalise to the production `www` domain. This is usually desirable, since previews should not compete with production.
- Changing the base URL changes every canonical, OG URL and sitemap entry at once. Resubmit the sitemap in Search Console afterwards.

**Status:** PARTIALLY CONFIRMED for source, **REQUIRES EXTERNAL ACCESS** for the production env values and the Vercel redirect.

---

## 4. Finding 2 — Robots.txt

### 4.1 Current implementation (working tree, `src/app/robots.ts:18-32`)
```ts
const PRIVATE_DISALLOWED_PATHS = [
  "/admin", "/dashboard", "/portal", "/partner", "/kyc", "/payments",
  "/preview", "/api", "/internal", "/account", "/profile", "/login", "/register",
];
```
`HEAD` had trailing-slash variants plus `"/_next/"` (confirmed with `git diff`). The working tree contains the audit's recommended list verbatim, minus nothing.

### 4.2 Evidence and analysis

- `/_next/` **is not** disallowed in the working tree. Both `/_next/static/` and `/_next/image` are crawlable.
- Matching rule: `Disallow: /dashboard` is a **prefix match**. It blocks `/dashboard`, `/dashboard/anything`, and also `/dashboardfoo`. `Disallow: /dashboard/` blocks only paths under the directory and leaves bare `/dashboard` crawlable. Google and Bing also support `$` for an exact end anchor.
- **Route collision check.** Top-level routes in `src/app` are `(marketing)` (about, contact, disclaimer, insights, investment, locations, privacy-policy, properties, terms-of-service, testimonials, why-choose-us), `dashboard`, `portal`, `partner`, `kyc`, `payments`, `preview`, `api`. No public route starts with any disallowed prefix. `/properties` and `/privacy-policy` do not start with `/profile` or `/preview`.
- **Rules that match no existing route:** `/account`, `/profile`, `/login`, `/register`. Only `portal/profile`, `portal/login`, `partner/profile`, `partner/login` exist, and those are already under `/portal` and `/partner`. These four rules block nothing today and would block future public paths such as `/login-help` or `/profile-guide`. `/admin` and `/internal` also have no top-level route (`api/internal` is under `/api`), so they carry no collision risk today and may serve as defensive rules.
- **Directory-lookalike risk.** `/partner` (bare prefix) would block a future public `/partners` page. `/preview` and `/payments` have the same property.
- `/api` is a bare prefix. It blocks `/api/*`. `/.well-known/*` and `/llms.txt` are unaffected and stay crawlable.
- `allow: "/"` in each group is redundant but harmless.
- `Sitemap:` uses `siteConfig.url`, so it follows Finding 1.
- `host: siteConfig.url` emits a `Host:` line. Google ignores it. It is harmless, and removal is optional.
- **Policy mismatch to confirm with the owner:** the header comment says AI training is disallowed, but the `GPTBot`, `ClaudeBot`, `PerplexityBot` and `Google-Extended` groups all `allow: "/"`.
- **robots.txt is not security.** It only asks crawlers not to fetch. Real protection comes from `src/middleware.ts` for dashboard, portal and partner. `/kyc/submit/[token]`, `/payments/pay/[token]` and `/preview/[token]` are not gated by middleware and rely on their own token checks. Disallowed URLs can still be indexed (URL only) if linked externally. See Finding 3 for the `noindex` gap on `/payments/pay/[token]`.

### 4.3 Recommended rules

| Rule | Matches | Recommendation |
|---|---|---|
| `Disallow: /dashboard` | `/dashboard`, `/dashboard/*` | Keep. No public lookalike. |
| `Disallow: /portal` | `/portal`, `/portal/*` | Keep. |
| `Disallow: /partner/` and `Disallow: /partner$` | `/partner/*` and exactly `/partner`, but **not** a future `/partners` | Replace bare `/partner` |
| `Disallow: /kyc`, `/payments`, `/preview` | prefix | Keep, or use the `/x/` + `/x$` pair if public lookalikes are planned |
| `Disallow: /api` | `/api/*` | Keep |
| `Disallow: /admin`, `/internal` | no current route | Keep as defensive rules |
| `Disallow: /account`, `/profile`, `/login`, `/register` | no current route, over-broad | **Remove.** Re-add as `/login$` etc. only if such routes appear. |

### 4.4 Side effects
- Blocking `/dashboard/login` etc. means Google never reads their `noindex`. That is acceptable for private pages.
- Allowing `/_next/` means crawlers can fetch the JS and CSS needed to render pages. This is desired.

**Status:** PARTIALLY CONFIRMED. `HEAD` is confirmed defective. The working tree is largely fixed but uncommitted, and live `robots.txt` **REQUIRES EXTERNAL ACCESS**.

---

## 5. Finding 3 — Canonical handling for noindex pages

### 5.1 Current implementation
`src/lib/seo.ts:12-25`:
```ts
export function getMetadata({ title, description, slug = "", image, noIndex = false } = {}) {
  ...
  const canonicalUrl = `${siteConfig.url}${slug ? `/${slug.replace(/^\//, "")}` : ""}`;
  ...
  alternates: { canonical: canonicalUrl },
  openGraph: { ... url: canonicalUrl, ... },
  robots: { index: !noIndex, follow: !noIndex, ... },
```
`slug` defaults to `""`, so a call without a slug canonicalises to the site root.

### 5.2 Every `getMetadata()` call
- **Root layout:** `src/app/layout.tsx:51` → `getMetadata()` with no arguments. Canonical = homepage.
- **Public pages with their own slug (unchanged by any fix):** `/` (slug `""`), `/about`, `/contact`, `/why-choose-us`, `/investment`, `/locations`, `/properties`, `/insights`, `/testimonials`, `/privacy-policy`, `/terms-of-service`, `/disclaimer`, and the `[slug]` detail pages for `properties`, `locations`, `insights`, `testimonials`.
- **The only 4 `noIndex: true` calls:** the not-found branches of `generateMetadata` in `properties/[slug]/page.tsx:22-25`, `locations/[slug]/page.tsx:27-30`, `insights/[slug]/page.tsx:31-34` and `testimonials/[slug]/page.tsx:34-37`. None passes a slug, so each gets the homepage canonical plus `noindex`.

### 5.3 The audit's premise is wrong, and so is its fix

The audit says `/dashboard/login`, `/portal/login`, `/partner/login` and similar "call `getMetadata({ noIndex: true })`". **They do not.** Those pages export a plain object, for example `portal/login/page.tsx:6-13` and `dashboard/(auth)/layout.tsx:6-13`, containing `title`, `description` and `robots: { index: false, follow: false }`.

The homepage canonical reaches them by **metadata inheritance**: Next merges `metadata` fields shallowly, so a route that doesn't define `alternates` inherits the root layout's `alternates.canonical` (the homepage URL). It also inherits `openGraph.url`, because those pages define no `openGraph` either. That affects every page under `/dashboard`, `/portal`, `/partner`, `/kyc`, `/payments`, `/preview`, and `not-found`. This matches what the audit observed live, but the cause is the root layout, not `noIndex`.

**Consequence:** the audit's recommended change (omit the canonical in `getMetadata` when `noIndex && !slug`) would fix only the four not-found branches. Those pages return 404 through `notFound()`, so their canonical is low-impact. The ~100 private pages would still emit the homepage canonical.

### 5.4 Related gap found while checking
`src/app/payments/pay/[token]/page.tsx:8-11` exports metadata with **no `robots`**, so it inherits the root's `index: true`. It also inherits the homepage canonical. `robots.txt` blocks `/payments`, but the page itself is not marked `noindex`. All other private entry points checked (dashboard layout, `(auth)` layout, partner layout, `kyc/submit`, `preview`, and all 18 portal pages) set `noindex`.

### 5.5 Recommended implementation (smallest safe change)
1. **`src/lib/seo.ts`:** remove the `slug = ""` default so "not supplied" (`undefined`) is distinguishable from the homepage's explicit `""`. When `noIndex` is true and `slug === undefined`, omit `alternates` and `openGraph.url`. Everything else is unchanged. Public pages always pass a slug (the homepage passes `""`), so their output is byte-identical.
2. **`src/app/layout.tsx:51`:** the root must stop supplying a site-wide canonical. Either call `getMetadata({ noCanonical: true })` through a new option, or build the root defaults without `alternates` and `openGraph.url`. Every public route already sets its own, so none loses its canonical. `not-found` then gets no canonical, which is correct for a 404.
3. **`src/app/payments/pay/[token]/page.tsx`:** add `robots: { index: false, follow: false }`.

Option (2) is what removes the homepage canonical from the private pages. Option (1) alone does not.

### 5.6 Side effects
- Any future public page that forgets to call `getMetadata({ slug })` will emit **no** canonical instead of a wrong one. That is safer but should be caught in review.
- `openGraph.url` also disappears from pages that lack their own. That is harmless for private and 404 pages.

**Status:** CONFIRMED (inheritance mechanism by source reading). The rendered HTML has not been inspected, so verify with the commands in §10.

---

## 6. Finding 4 — Homepage rendering and caching

### 6.1 Current implementation
`src/app/(marketing)/page.tsx`:
- Line 16: `export const dynamic = "force-dynamic";`
- Lines 34-41: `shuffleProperties` uses `Math.random()` (Fisher–Yates).
- Lines 44-47: `getAllProperties()` → shuffle → `slice(0, 3)`.
- Commit `b453434` introduced the shuffle deliberately ("homepage property shuffling", "3 randomized projects across all cities"). It is a product decision, not an accident.

### 6.2 Evidence

**Query** (`src/lib/data/properties.ts:256-268`): `Property.find({ publicationStatus: "PUBLISHED" })` populated with `locationId`, sorted `{ sortOrder: 1, createdAt: -1 }`. It does **not** filter `archivedAt` (the sitemap does) and does **not** filter on `featured`.

**Schema fields that actually exist** (`src/models/Property.ts`): `featured` (Boolean, default `false`, indexed, line 108), `sortOrder` (Number, default `0`, indexed, line 113), `publicationStatus`, `listingStatus`, `archivedAt`, `createdAt`. A compound index `{ publicationStatus, featured, sortOrder, createdAt }` exists (line 299). A cached `getFeaturedProperties()` already exists (`properties.ts:283`) but the homepage does not use it. **Whether any live property has `featured: true` or a non-default `sortOrder` needs a DB check.**

**Request-specific data:** none in `page.tsx`. A grep of `cookies()`, `headers()` and `searchParams` found nothing in `src/components/{layout,home,property,chat,seo}`. I did not read every child component. A production build will show whether `/` is static or ISR (`○`/`●`) or dynamic (`ƒ`).

**Precedent in the repo:** `/properties` (`revalidate = 60`), `/properties/[slug]` (`120`), `/locations` (`120`), `/insights` and `/testimonials` (`120`) already use ISR with the same data layer. So the build already tolerates DB reads at prerender and regeneration.

**In-process cache** (`src/lib/cache/data-cache.ts`): `getAllProperties` uses TTL 120 s plus a stale-while-revalidate window of 600 s, held in memory **per server instance**. `invalidatePropertyCache()` clears only the instance that ran the server action.

**On-demand revalidation in `src/lib/actions/property.actions.ts`:**

| Action | Revalidates `/`? | Evidence |
|---|---|---|
| Publish | yes | line 588 |
| Unpublish to draft | yes | line 862 |
| Delete | yes | line 910 |
| **Update a published property** (name, price, media, `featured`) | **no** | line 383 revalidates only `/properties` |
| **Archive** | **no** | line 681 revalidates only `/properties` |
| **Change slug** | **no** | line 815 revalidates only `/properties` |

Today those `revalidatePath("/")` calls are no-ops because the page is dynamic. Under ISR they become live, and the three gaps matter.

**Middleware:** `middleware.ts:306-308` sets `Vary: Accept` on `/`. A CDN keys cached variants on `Accept`, and browsers send varied `Accept` strings, so the hit rate may be lower than expected even once the page is ISR.

### 6.3 Is `revalidate = 300` safe?
Technically yes: there is no per-request data and the data layer already supports ISR. Two accuracy caveats:
1. **Per-instance `fastCache`.** After an unpublish, the regeneration may run on an instance whose in-memory cache still holds the old list. It would serve it for up to TTL + SWR (about 12 minutes) and ISR would then hold that for the revalidate window. The existing dynamic page already has the 12-minute exposure, so ISR adds at most the revalidate interval on top.
2. The three missing `revalidatePath("/")` calls above.

### 6.4 Recommended strategy (safest first)
1. **Replace `force-dynamic` with `export const revalidate = 60`.** This matches `/properties` and keeps staleness short. 300 is acceptable if the owner prefers it.
2. **Add `safeRevalidatePath("/")`** to the update, archive and slug-change paths in `property.actions.ts`.
3. **Replace the random shuffle with a deterministic selection** (owner decision, see §13). Suggested default is featured-first in the existing `sortOrder` order, then the remaining properties to fill 3. If city diversity matters, pick the top-sorted property per city. A random shuffle inside an ISR page would be frozen for the revalidate window and would give every visitor the same trio anyway.
4. **Optional later:** tag-based invalidation (`revalidateTag`) for the homepage data so stale instance caches cannot leak into regeneration.

### 6.5 Side effects
- The homepage will show the same three properties for each regeneration window rather than a fresh trio per visit. The "randomised across cities" behaviour from `b453434` is lost unless a deterministic city-aware rule replaces it.
- `CLAUDE.md` §5 requires at most 3 featured cards plus the "View All Properties" CTA. That layout does not change.
- The audit's claims about TTFB latency and the `iad1` function region **REQUIRE EXTERNAL ACCESS** (there is no `vercel.json`).

**Status:** CONFIRMED (`force-dynamic` and `Math.random()` present). Deterministic sorting is feasible with `featured` and `sortOrder`. Whether the DB values are populated needs a DB check.

---

## 7. Finding 5 — Dead property slugs and incorrect internal relationships

### 7.1 What the "live" catalog is
The static array in `src/data/properties.ts` is **entirely commented out** (the block spans lines 4-725). The catalog lives in MongoDB. Local evidence of what is in the DB comes only from the seed scripts, `scripts/seed-jaipur-townships.ts` and `scripts/seed-multi-city-catalog.ts`. **I did not query the database**, so confirm the live slug list with the query in §9.

Properties in the seed scripts (slug · locality · address from seed · type):

| Slug | Title | Seed `citySlug` | Locality / address (from seed) | Type |
|---|---|---|---|---|
| `neelkanth-nagar` | Neelkanth Nagar | jaipur | Chaksu · Chaksu–Phagi Highway, near NH-52 | Residential |
| `riyasat-paradise-ii` | Riyasat Paradise II | jaipur | Vatika · Vatika–Sanganer Road, near Ring Road corridor | Residential |
| `bhumija-green-block-a` | Bhumija Green Block A | jaipur | Nindar, Sikar Road · near Sikar NH | Residential |
| `riyasat-heritage-extension` | Riyasat Heritage Extension | jaipur | Salagrampura–Dahar · Chaksu urban belt | Residential |
| `happy-business-park` | Happy Business Park | ajmer | Gagwana · NH-8 (Jaipur–Ajmer Expressway) | **Commercial** |
| `balaji-puram` | Balaji Puram | ajmer | Chandiyawas · NH-8 corridor | Residential |
| `vrindavan-viihaar` | Vrindavan Viihaar | ajmer | Gagwana · Khoda Ganesh Road | Residential |
| `aero-crystal` | Aero Crystal | kishangarh | Kishangarh B · opposite airport corridor | Residential |
| `one-kishangarh` | One Kishangarh | kishangarh | Madanganj · Kishangarh main market | **Commercial** |

**No seeded property is in Navi Mumbai, Panvel, Bhiwadi, on Ajmer Road (Jaipur), on the Jaipur Ring Road as a logistics parcel, or on the Tonk Road corridor.** The seed scripts create only the `jaipur`, `ajmer` and `kishangarh` Location records.

### 7.2 Where the dead slugs are, and whether they produce broken links

| Reference | Where | Rendered as a link? |
|---|---|---|
| `relevantPropertySlugs` in `src/data/locations.ts` (lines 38, 54, 70, 243, 259, 432, 448, 604, 620, 776, 792) | Static file imported only by `sitemap.ts` (fallback), `markdown-generator.ts`, `llms-full.txt/route.ts` and the `seed-catalog.ts` migration. **Live location pages read the DB** (`src/lib/data/locations.ts`). | **No.** `MicroMarketSection.tsx:41-45` only filters properties that exist. It never builds a URL from the slug. |
| `Testimonial.relatedPropertySlug` in `src/data/testimonials.ts` (13, 39, 65, 91, 117) | No component reads this field. | **No.** |
| `CaseStudy.relatedPropertySlug` (168, 206, 244, 282) | `testimonials/[slug]/page.tsx:63-65` calls `getPropertyBySlug`, then renders a card only `{relatedProperty && …}` (line 353). | **No.** It silently omits the card. |
| `relatedPropertySlugs` in `src/data/insights.ts` (30, 125, 216, 291, 354, 424) | No component reads this field. | **No.** |

So the audit's "404 errors for crawlers" is **NOT FOUND** in rendered output. What exists is dead data that renders nothing. Caveat: if the DB `Location` documents were seeded from this static data (`src/lib/db/migrations/seed-catalog.ts`), they carry the same inert slugs. That needs a DB check.

### 7.3 Discrepancies with the audit
- The audit lists **4** dead slugs. There are **6**: also `aravalli-greens-retreat-plots-ajmer` and `dmic-industrial-commercial-logistics-bhiwadi`.
- The audit under-counts references. `aerotropolis-prime-plotted-node-navi-mumbai` appears 4 times in `locations.ts` (not just the testimonial). Every slug also appears in `insights.ts` and in `caseStudies`.
- **The audit's replacement mapping is wrong for these relationships:**
  - "Ajmer Road / Ring Road → `riyasat-paradise-ii`": Riyasat Paradise II is in Vatika on the Vatika–Sanganer Road. It is not on Ajmer Road and is not a commercial logistics parcel.
  - "Diggi / Sanganer → `bhumija-green-block-a`": Bhumija Green is in Nindar on Sikar Road. It is not near Diggi or Sanganer.
  - "Ajmer / Kishangarh → `happy-business-park`, `balaji-puram`, `aero-crystal`" is geographically plausible for Ajmer-area content, but none of them is a Pushkar Bypass property, and the original slug named Pushkar Bypass.

### 7.4 Mapping table

| Old slug | Proposed live slug | Actual property name | Actual area/city | Relationship verified? | Recommendation |
|---|---|---|---|---|---|
| `royal-palms-township-ajmer-road-jaipur` | **none** | n/a (not in any seed) | Original: Ajmer Road, Jaipur. No live Jaipur property is on Ajmer Road. | **No match.** `riyasat-paradise-ii` (Vatika) is a different corridor and was rejected. | Remove from `locations.ts:38` (empty array), `testimonials.ts:13` and `:168`, and `insights.ts` refs. Keep the testimonial and case-study text and identity unchanged. |
| `ring-road-logistics-commercial-hub-jaipur` | **none** | n/a | Original: Jaipur Ring Road, commercial/logistics. Live commercial properties are only `happy-business-park` (Gagwana, Ajmer) and `one-kishangarh` (Kishangarh). Both are the wrong city. | **No match.** | Remove from `locations.ts:54`, `testimonials.ts:65` and `:244`, and `insights.ts:291,354`. |
| `imperial-enclave-tonk-road-jaipur` | **Candidate only:** `riyasat-paradise-ii` | Riyasat Paradise II | Vatika, Jaipur. The seed lists Tonk Road 8 km / 10 min and Ring Road 4.5 km. | **Partial, locality only.** The micro-market is named "Tonk Road & Vatika Sector" and the property is in Vatika, but it is a different project from Imperial Enclave. | Add to `locations.ts:70` **only after the owner confirms** this fits the micro-market. Otherwise use an empty array. |
| `aerotropolis-prime-plotted-node-navi-mumbai` | **none** | n/a | Original: Panvel/NAINA, Navi Mumbai. The seeds contain no Maharashtra property. | **No match.** Must not map to any Jaipur property. | Remove from `locations.ts:243,259,604,620`, `testimonials.ts:39` and `:206`, and `insights.ts:125,216,354`. Keep the NRI testimonial text and identity unchanged. |
| `aravalli-greens-retreat-plots-ajmer` *(not in audit)* | **none** | n/a | Original: Pushkar Bypass, Ajmer. Live Ajmer properties are on NH-8 at Gagwana and Chandiyawas. | **No match.** | Remove from `locations.ts:432,448`, `testimonials.ts:91` and `:282`, and `insights.ts:30,424`. |
| `dmic-industrial-commercial-logistics-bhiwadi` *(not in audit)* | **none** | n/a | Original: Bhiwadi. No Bhiwadi property or location in the seeds. | **No match.** | Remove from `locations.ts:776,792` and `testimonials.ts:117`. |

### 7.5 Related risks to flag
- `relatedLocationSlug: "navi-mumbai"` and `"bhiwadi"` (testimonials and case studies) resolve through the DB-backed `getLocationBySlug`. The seeds create only jaipur, ajmer and kishangarh, so those locations may not exist in the DB. Needs a DB check.
- Several testimonials and case studies describe transactions in Navi Mumbai, Bhiwadi, Ajmer Road and the Jaipur Ring Road, all with `verified: true` and `clientConsent: true`. No matching inventory exists in the catalog. This is a business-information question, not a code one (see §13). `CLAUDE.md` §8: "Never publish unverified business information."

### 7.6 Side effects of removal
Removing these references changes no rendered link today (§7.2). The one visible effect is that `MicroMarketSection` stops matching by slug and falls back to its existing name/locality text match.

**Status:** PARTIALLY CONFIRMED (dead slugs confirmed in source; 404 links NOT FOUND; DB state REQUIRES EXTERNAL ACCESS).

---

## 8. Finding 6 — Nested `<main>` elements

### 8.1 Current implementation
- `src/app/(marketing)/layout.tsx:14`: `<main id="main-content" className="flex-grow outline-none">`
- `src/app/(marketing)/why-choose-us/page.tsx:60`: `<main id="main-content" className="w-full">`, closing tag at line 93.

This is **CONFIRMED**: nested `<main>` and a duplicate `id`. The skip link at `Header.tsx:63` targets `#main-content`, and `getElementById` resolves to the first (outer) element, so the skip link still works. The duplicate id remains invalid HTML.

### 8.2 Wider scope found
The same marketing layout also wraps these nested `<main>` elements (no duplicate id, but the same HTML5 violation):

| File | Line | Affects |
|---|---|---|
| `src/components/legal/LegalPageLayout.tsx` | 116 / 125 | `/privacy-policy`, `/terms-of-service`, `/disclaimer` |
| `src/components/property/detail/PropertyDetailPageClient.tsx` | 82 / 137 | **Every property detail page** |
| `src/app/(marketing)/insights/[slug]/page.tsx` | 144 / 172 | Every insight article |

`src/app/not-found.tsx:30` has its own `<main id="main-content">`. It renders in the root layout, outside the marketing layout, so it is the only `<main>` there and is correct.

### 8.3 Recommended smallest fix
Change the tag only, keeping every class: `<main id="main-content" className="w-full">` → `<div className="w-full">`, and `</main>` → `</div>` at line 93. `globals.css` has only `main { padding-top: 0; }` (lines 108 and 725); a `div` has no default padding, so layout is unchanged.

The three additional files can take the same one-tag change (`<main>` → `<div>` or `<section>`). They are outside the scope you named, so include them only if you approve.

**Status:** CONFIRMED.

---

## 9. Vercel environment variable checklist

Check **names and scope only** in the Vercel dashboard. Do not paste values into tickets or reports.

| Variable | Used by | Should be (Production) | Notes |
|---|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | `siteConfig.url` (canonicals, sitemap, robots, OG, JSON-LD) | `https://www.ratiwaldreamestates.com` | **Highest priority.** If it holds the apex, the code fix is overridden. Inlined at build, so **redeploy after changing**. No trailing slash needed (code strips one). |
| `SITE_URL` | `siteConfig.url` fallback; email templates | same value | If it holds the apex and `NEXT_PUBLIC_SITE_URL` is unset, canonicals go apex. |
| `NEXT_PUBLIC_APP_URL` | portal and partner invitation links | same value | Different variable from the two above. Currently falls back to the apex. |
| Domain settings (Vercel → Domains) | apex→www 308 | `ratiwaldreamestates.com` redirects to `www.ratiwaldreamestates.com`, with `www` as the primary domain | Not in the repo. Needs dashboard confirmation. |
| Preview scope | previews | leave unset, or a preview URL | Unset previews canonicalise to production `www`, which is fine. |

Also confirm, without exposing values, that `MONGODB_URI` and `MONGODB_DB_NAME` are set for the **build** environment, since an ISR homepage will read the DB during `next build`.

**Read-only DB check to run yourself** (for Finding 5 and Finding 4). Run it with your own credentials, or let me run `scripts/inspect-db.ts` on your approval. That script connects to the production Atlas cluster using `.env.local`, so I did not run it without your say-so:
```js
db.properties.find({ publicationStatus: "PUBLISHED" },
  { slug: 1, title: 1, locality: 1, featured: 1, sortOrder: 1, archivedAt: 1 }).sort({ sortOrder: 1 })
db.locations.find({}, { slug: 1, name: 1, city: 1, "microMarkets.relevantPropertySlugs": 1 })
```

---

## 10. Production validation commands

Run these **after** deploying. Local source inspection alone does not prove any of the production issues fixed.

```bash
# Local gates (run before deploying)
npx tsc --noEmit
npm run lint
npm run build                      # inspect the route table: "/" should be ○ or ●, not ƒ

# Canonical and Open Graph (public pages)
curl -s https://www.ratiwaldreamestates.com/ | grep -io '<link rel="canonical"[^>]*>'
curl -s https://www.ratiwaldreamestates.com/properties | grep -io '<link rel="canonical"[^>]*>'
curl -s https://www.ratiwaldreamestates.com/ | grep -io '<meta property="og:url"[^>]*>'

# noindex pages: canonical must be absent, or self-referential (never the homepage)
for p in /portal/login /partner/login /dashboard/login /payments/pay/test-token; do
  echo "== $p"; curl -s "https://www.ratiwaldreamestates.com$p" | grep -ioE '<link rel="canonical"[^>]*>|<meta name="robots"[^>]*>'
done

# Redirects
curl -sI https://ratiwaldreamestates.com/ | grep -iE 'HTTP|location'      # expect 308 → https://www.ratiwaldreamestates.com/
curl -sI https://www.ratiwaldreamestates.com/properties/ | grep -iE 'HTTP|location'  # trailing slash → non-slash

# Robots
curl -s https://www.ratiwaldreamestates.com/robots.txt
curl -s https://www.ratiwaldreamestates.com/robots.txt | grep -c '/_next'  # expect 0
# Expect "Sitemap: https://www.ratiwaldreamestates.com/sitemap.xml"

# Sitemap
curl -s https://www.ratiwaldreamestates.com/sitemap.xml | grep -o '<loc>[^<]*</loc>' | grep -vc 'https://www.ratiwaldreamestates.com'   # expect 0
curl -s https://www.ratiwaldreamestates.com/sitemap.xml | grep -o '<loc>[^<]*</loc>' | sed 's/<[^>]*>//g' \
  | xargs -n1 -P8 -I{} curl -s -o /dev/null -w '%{http_code} {}\n' {} | sort | uniq -c | sort -rn | head   # expect all 200

# Homepage caching (after Finding 4)
curl -sI https://www.ratiwaldreamestates.com/ | grep -iE 'cache-control|x-vercel-cache|vary'   # repeat; expect HIT on the second request

# Nested <main> (after Finding 6)
curl -s https://www.ratiwaldreamestates.com/why-choose-us | grep -o '<main' | wc -l   # expect 1
curl -s https://www.ratiwaldreamestates.com/why-choose-us | grep -o 'id="main-content"' | wc -l   # expect 1

# Internal broken links
npx tsx scripts/audit-orphans.ts
```
A full-site link check (for example `npx linkinator https://www.ratiwaldreamestates.com --recurse`) is a useful extra, but it is not installed here.

---

## 11. Rollback recommendations

| Change | Rollback |
|---|---|
| Env var edits in Vercel | Record the old values (in the dashboard, not in chat) before editing. Revert the variable and redeploy. |
| `site.ts` fallback | `git revert` the single commit. Only matters when both env vars are unset. |
| `robots.ts` | One-file revert. A bad rule is visible immediately at `/robots.txt`. |
| `seo.ts` / `layout.tsx` canonical change | Revert both files together. Reverting only one leaves the inheritance inconsistent. |
| Homepage ISR | Re-add `export const dynamic = "force-dynamic"` and revert the shuffle edit. Vercel Instant Rollback to the previous deployment also works. |
| Data-file slug cleanup | Pure data edit, one commit. Revert with git. |
| `<main>` → `<div>` | One-line revert. |

Commit each finding separately so any of them can be reverted without touching the others.

---

## 12. Recommended implementation order

1. **Vercel env vars and Domains check** (Finding 1, no code). It is the only thing that can make production canonical correct. Confirm values, then redeploy.
2. **Commit the existing `site.ts` and `robots.ts` working-tree changes**, with the §4.3 rule trim to `robots.ts`.
3. **Finding 3:** `seo.ts` + root `layout.tsx` + `payments/pay/[token]` robots. Verify with the curl loop in §10.
4. **Finding 6:** `<main>` → `<div>` in `why-choose-us`, plus the three extra files if approved.
5. **Finding 4:** homepage ISR, the deterministic selection (once the owner decides), and the three `revalidatePath("/")` additions. This has the most behaviour change, so deploy it alone.
6. **Finding 5:** data-file cleanup, after the owner confirms the open questions in §13. It has no rendering impact, so it is the lowest urgency.
7. Resubmit the sitemap in Search Console and inspect `/`, a property page and `/robots.txt` with URL Inspection.

---

## 13. Items needing the business owner

1. **Homepage selection rule.** Should the three cards be featured-first by `sortOrder`, one per city, or a daily rotation? A random per-request shuffle cannot coexist with CDN caching.
2. **Tonk Road micro-market.** Is Vatika (Riyasat Paradise II) part of the "Tonk Road & Vatika Sector" micro-market you want shown?
3. **Client stories.** The testimonials and case studies mention Royal Palms Township (Ajmer Road), a Ring Road logistics buyer, a Navi Mumbai/Panvel NRI buyer, Aravalli Greens (Pushkar) and a Bhiwadi industrial buyer, none of which exist in the catalog. Are these real, consented transactions you may publish? If not, they should be reviewed before the next content push.
4. **AI crawler policy.** The `robots.ts` header says AI training is disallowed, but the rules allow `GPTBot`, `ClaudeBot`, `PerplexityBot` and `Google-Extended`. Which is intended?
5. **Placeholder-looking mailboxes.** Server code uses `support@`, `finance@`, `leads@`, `partners@`, `privacy@` and `advisors@ratiwaldreamestates.com`. `CLAUDE.md` §6 says to use only `sureshkumawat6917@gmail.com`. These are outside Phase 1, but they conflict with that rule.
6. **Vercel access.** Values and scope of the three URL variables, the Domains redirect, and the function region.
7. **Live DB.** Permission to run a read-only check of properties and locations (§9), or the query output.

---

## 14. Discrepancies with the previous reports (summary)

| Audit claim | Actual |
|---|---|
| `site.ts` falls back to the apex | Fixed in the working tree (uncommitted). `HEAD` still has the apex. |
| `/_next/` and trailing slashes in `robots.ts` | `HEAD`: yes. Working tree: removed (uncommitted). |
| Auth pages call `getMetadata({ noIndex: true })` | They do not. They export plain metadata and inherit the homepage canonical from the root layout. |
| Fix `getMetadata()` for `noIndex` without a slug | Insufficient. It only covers the 4 not-found branches. The root layout must stop supplying a canonical. |
| 4 dead slugs, mapping to live slugs | 6 dead slugs. None has a genuine live match. The suggested mappings are geographically wrong. |
| Dead slugs cause 404s for crawlers | No rendered link uses them. Dead data only. |
| One nested `<main>` on `/why-choose-us` | Also nested in legal pages, every property detail page and insight articles. |
| `revalidate = 300` is a safe drop-in | Safe in principle, but 3 server actions don't revalidate `/`, and the per-instance cache adds up to about 12 minutes of staleness. |
| Production header and region claims (`X-Vercel-Cache`, `iad1`) | Not verifiable locally. |

---

## 15. Exact files for the next implementation step

Pending your approval. Nothing below has been changed.

| File | Finding |
|---|---|
| `src/config/site.ts` | 1 (commit the existing change) |
| `src/app/robots.ts` | 2 (trim 4 rules, `/partner` precision) |
| `src/lib/seo.ts` | 3 |
| `src/app/layout.tsx` | 3 |
| `src/app/payments/pay/[token]/page.tsx` | 3 |
| `src/app/(marketing)/page.tsx` | 4 |
| `src/lib/actions/property.actions.ts` | 4 (3 added `revalidatePath("/")` calls) |
| `src/data/locations.ts`, `src/data/testimonials.ts`, `src/data/insights.ts` | 5 |
| `src/app/(marketing)/why-choose-us/page.tsx` | 6 |
| `src/components/legal/LegalPageLayout.tsx`, `src/components/property/detail/PropertyDetailPageClient.tsx`, `src/app/(marketing)/insights/[slug]/page.tsx` | 6 (only if approved) |
| `registry.ts`, `email-base.ts`, `portal-invitation.service.ts`, `partner-invitation.service.ts`, `DigitalVisitingCard.tsx` | 1 (optional apex cleanup) |

**Stopping here. I will not modify source code until you approve.**

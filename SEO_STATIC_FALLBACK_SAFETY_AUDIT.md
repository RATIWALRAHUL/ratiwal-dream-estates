# Follow-up Task 2 — Static Fallback Safety Audit

**Date:** 2026-11-11
**Scope:** `src/data/properties.ts` and every consumer. **Audit and proposal only. No production behaviour was changed.**

---

## 0. Correction to my earlier reports

`MISSING_INDEXED_URL_MASTER_INVENTORY.md` §4.3 and the plan's **D3** said the static fallback "can re-expose the retired slugs if the DB is unreachable". **That is wrong.** Commit `65d676e` (2026-10-04, "hide static properties cards…") wrapped the **entire** static `properties` array in a block comment. At runtime `properties` is `[]`. Both earlier reports are corrected in this same change set.

## 1. Direct answers

| Question | Answer | Evidence |
|---|---|---|
| Can retired demo slugs appear in public responses? | **No.** | The array body is inside `/* … */` (opens line 4, closes line 725). `properties` evaluates to `[]`. Live probes of all 6 static-fallback slugs and both `sample-*` placeholders return **404**. |
| Is the fallback used when MongoDB is unavailable? | **Only by three non-page consumers**, and for properties it yields an **empty list**. Public pages have **no** static fallback. | See §2. |
| Can sitemap generation expose stale records? | **Properties: no. Locations: yes, a stale subset (real slugs, not retired ones).** The bigger risk is the opposite: on DB failure the sitemap silently **drops** real URLs. | See §3. |
| Can property detail pages accidentally render demo records? | **No.** | `properties/[slug]/page.tsx` imports only `@/lib/data/properties`. `getPropertyBySlug` and `getRelatedProperties` query MongoDB with `publicationStatus: "PUBLISHED"` and have no static path. |

## 2. Consumer map

| Consumer | Imports static data? | When used | Yields today |
|---|---|---|---|
| `src/app/(marketing)/**` pages (home, `/properties`, `/properties/[slug]`, `/locations`, `/locations/[slug]`, why-choose-us, testimonials, insights) | **No.** They use `@/lib/data/properties` and `@/lib/data/locations` (DB-only, cached). | n/a | Live DB data. DB errors propagate; there is no fallback. |
| `src/app/api/properties/route.ts` | No (`lib/data`) | n/a | Live DB data. |
| `src/app/sitemap.ts` | **Yes**, properties and locations | DB returns 0 rows **or** throws | Properties `[]`. Locations: 5 static (jaipur, navi-mumbai, ajmer, panvel, bhiwadi). |
| `src/app/llms-full.txt/route.ts` (`force-dynamic`) | **Yes**, both | DB returns 0 rows **or** throws | Same as above. |
| `src/lib/markdown/markdown-generator.ts` (agent markdown negotiation) | **Yes**, both, including per-slug lookup | DB empty/throws, or slug not found in DB | Properties `[]`. Locations: 5 static. |
| `src/lib/db/migrations/seed-catalog.ts` | **Yes** (migration) | Manual run only | Properties nothing; would **upsert the 5 static locations**. |
| `src/data/locations.ts` helpers (`getPropertiesForLocation`, `getLocationSummaryStats`) | Imports static `properties` | Not used by any page I found | `[]` |

## 3. Risks found, ranked

| # | Risk | Severity | Detail |
|---|---|---|---|
| **S1** | **Build-time DB outage can 404 every property page.** | **High (latent)** | `properties/[slug]` sets `dynamicParams = false` and `generateStaticParams` does `catch { return [] }`. If the DB is unreachable **during a build**, no slugs are prebuilt. With `dynamicParams = false`, any slug outside that list is a 404 for the lifetime of that deployment. `locations/[slug]` has the identical pattern. This is the real "indexed pages vanish" mechanism. Not reproduced, since reproducing needs a build with the DB blocked. |
| **S2** | **Newly published or renamed properties may not be reachable until a redeploy.** | **High, needs a test to confirm** | Same `dynamicParams = false`. Per Next.js's documented behaviour, only params from `generateStaticParams` are served, and ISR `revalidate = 120` refreshes content, not the param list. I have **not** empirically tested a post-build publish, so treat this as a strong hypothesis. `property.actions.ts` calls `revalidatePath`, which refreshes existing paths. |
| **S3** | **Renaming a published slug creates no redirect, and stored redirect rules are inert.** | **Medium** | `changePublishedSlug` (`property.actions.ts`) updates the slug and writes an audit entry; it does **not** create a `RedirectRule`. Separately, `RedirectRule` is never read by `middleware.ts` or `next.config.ts`. Only the dashboard CMS screens touch it. Rules created there do not redirect public traffic. The `redirectrules` collection is also empty. This is how a real indexed URL becomes a 404 in future. |
| **S4** | **Sitemap degrades silently.** | Medium | On DB failure or empty result the sitemap still returns 200 with **no property URLs** and a stale 5-location list (no `kishangarh`). `/sitemap.xml` is **prerendered at build time**: the 2026-11-11 `next build` route table lists it as `○ (Static)`, and the live response is `X-Vercel-Cache: HIT` with a fixed `Last-Modified`. A build that sees a DB problem therefore publishes a degraded sitemap until the next deploy. |
| **S5** | Static `locations` data can drift from the DB. | Low | It lacks `kishangarh`. It feeds the 3 fallback consumers and `seed-catalog.ts`. |
| **S6** | Dead retired demo content ships in the repo. | Low | About 700 commented lines of fictional-looking property data (including `/images/about/township-development.jpg`, a forbidden dummy fallback image per CLAUDE.md §2). Not served, but easy to un-comment by accident. |
| **S7** | Minor inconsistency. | Info | Sitemap filters `archivedAt: null`; `lib/data` does not. The model sets `archivedAt` only for status `ARCHIVED`, so there is no practical effect. |

## 4. Safe fallback proposal (not implemented)

**Principle:** public pages never read static data (already true). Fallbacks may only ever contain **verified, currently-published** data. A degraded environment should **fail loudly** or keep serving the last good output. It should not emit a smaller "successful" answer.

### Recommended (smallest change, fits the architecture)

| Step | Change | Fixes |
|---|---|---|
| **P1** | Make `src/data/properties.ts` an explicit `export const properties: Property[] = []` with a header stating it is retired and must stay empty. Move the commented demo data to `docs/archive/retired-static-properties.txt` (a non-code extension, kept, not deleted). | S6, accidental un-commenting |
| **P2** | `sitemap.ts`, `llms-full.txt`, `markdown-generator.ts`: **remove the static fallbacks.** On DB error, **throw**. At build this fails the build rather than shipping a degraded sitemap. During ISR revalidation Next keeps serving the previous cached output. DB returning 0 published properties is also treated as an error, since the business always has inventory. | S4, S5 |
| **P3** | `generateStaticParams` (properties and locations): **rethrow on DB error** instead of `return []`, and throw if the list is empty. A build against an unreachable DB fails instead of deploying a site where every property 404s. | S1 |
| **P4** | Confirm the publish-after-build behaviour (S2) with one controlled test: build, publish a **test draft→published** record in a **non-production** DB, request its URL. Based on the result either (a) keep `dynamicParams = false` and add a publish-triggered redeploy hook, or (b) switch to `dynamicParams = true` plus `notFound()`. Note `PHASE_3` documented a soft-404 issue tied to `loading.tsx`; any change must be re-validated against it. | S2 |
| **P5** | When a published slug changes, auto-create a permanent redirect and make the public runtime honour `RedirectRule` (middleware lookup with caching, or generate `redirects()` at build). | S3 |
| **P6** | Add `scripts/verify-no-retired-slugs.ts`: assert retired slugs 404 on a running instance, and assert that every sitemap property URL is `PUBLISHED` in the DB and vice versa. Wire into the existing verification scripts. | regression guard |

### Alternative (only if a fallback is truly wanted): last-known-good snapshot

A committed `src/data/generated/published-snapshot.json` (slug, updatedAt only) produced from the DB by a script at release time, used **only** by sitemap/llms/markdown and **never** by page rendering. The generator would reject any slug on the retired denylist and any non-`PUBLISHED` record. It is more moving parts, and it can go stale. Prefer P2/P3 unless you specifically need the sitemap to be populated during an outage.

### Retired denylist (to hard-code in P6)

`royal-palms-township-ajmer-road-jaipur`, `ring-road-logistics-commercial-hub-jaipur`, `aerotropolis-prime-plotted-node-navi-mumbai`, `imperial-enclave-tonk-road-jaipur`, `aravalli-greens-retreat-plots-ajmer`, `dmic-industrial-commercial-logistics-bhiwadi`, `sample-residential-plot-jaipur`, `sample-commercial-plot-navi-mumbai`, and location `other-locations`.

## 5. Rollout and risk (when approved)

- Ship P1/P2/P3/P6 as **one reviewed change** with no content changes.
- Validate with a production build plus a curl matrix of all 39 sitemap URLs (expect 200 and unchanged canonicals) and the denylist (expect 404).
- P4/P5 touch routing behaviour, so they are separate changes with their own review.
- Rollback for any of these is a plain `git revert`. No data migration is involved.

## 6. What I did not do

No source file under `src/` was edited in this audit. No build was run with the DB blocked, so S1 and S2 are reasoned from the code, not reproduced.

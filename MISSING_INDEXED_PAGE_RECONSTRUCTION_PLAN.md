# Missing Indexed Page — Reconstruction Plan

**Date:** 2026-11-11
**Companion to:** `MISSING_INDEXED_URL_MASTER_INVENTORY.md`
**Status:** ⏸ **STOPPED FOR OWNER REVIEW.** Nothing has been built.

---

## 1. Recommendation

**Do not reconstruct any page yet.** On current evidence there is nothing to reconstruct:

- Every URL on the live sitemap works and is complete.
- Every URL with evidence of ever having existed but now returning 404 is a retired *static demo* record or placeholder, not real inventory.
- Recreating those would violate the project rules: "never create fictional properties" (the prompt, §6, §11) and "no dummy records" (CLAUDE.md §1).

Building pages now would mean guessing which URLs Google indexed. Guessing is how thin, duplicate or misleading pages get created. The right next step is real Google data.

## 2. What is needed from the owner (blocking)

Any **one** of these unblocks Phase A:

| Option | How | Gives us |
|---|---|---|
| **A. GSC export (best)** | Search Console → *Pages* → export the **Indexed** list and the **Not indexed** reasons (CSV). Also *Sitemaps* → submitted vs indexed. | The true indexed URL list. |
| **B. GSC access for the tooling** | Configure the GSC integration. The dashboard row is currently `NOT_CONFIGURED`. | Repeatable URL Inspection + performance data. |
| **C. Manual `site:` result** | Run `site:ratiwaldreamestates.com` in Google and paste/screenshot the list, including "show omitted results". | Partial list. The `site:` operator is not a complete inventory. |
| **D. Specific URLs** | If a particular indexed URL looked broken to you, send it. | Direct test. |

When data arrives I diff it against the inventory and every URL falls into a class in the §4 decision tree.

## 3. Open decisions

| ID | Decision | My recommendation |
|---|---|---|
| **D1** | **✅ Resolved 2026-11-11 (confirmed by owner follow-up; see `SEO_FOLLOWUP_DESIGN_SYSTEM_CONFIRMATION.md`).** Original question: **Styling constraint conflict.** The brief says "do not use Tailwind CSS". The codebase **is** Tailwind v4 (`@import "tailwindcss"` and `@theme` tokens in `globals.css`), and CLAUDE.md §1 specifies "Tailwind CSS + Vanilla CSS". Every existing page uses it. | Read the instruction as "don't introduce a second design system". Reuse the existing components and tokens, which is the only way to match the site. Rewriting any page outside Tailwind would break visual parity. **Please confirm.** |
| **D2** | Disposition of the 6 retired static-fallback property slugs, **if** GSC shows they are indexed. | Keep 404, or switch to **410** to speed de-indexing. **Do not 301** them to a property page or `/properties`: none has a genuinely equivalent replacement, and mass-redirecting to a catch-all is flagged in the brief as undesirable. A 301 to `/locations/<city>` is acceptable only where the old slug's city matches a live location **and** you want to preserve any link value. |
| **D3** | Clean-up of stale static data (`src/data/properties.ts`). | **Corrected 2026-11-11.** The static property array is already commented out (since 2026-10-04), so it cannot re-expose the retired slugs. The real risks are different (sitemap silently drops URLs on DB failure; `generateStaticParams` returns `[]` on DB error). See `SEO_STATIC_FALLBACK_SAFETY_AUDIT.md` for the proposal; still a **separate**, approved change. |
| **D4** | A public `/resources` hub for the 4 PDFs under `/documents/`. | Not a recovery. No evidence that the URL was ever served. If wanted, treat it as a *new* page with its own content brief, not a reconstruction. |
| **D5** | DB `seo.canonicalUrl = https://dreamestate.in/...` on 9 properties (inventory R1). | Fix via a data update, separate from this task. Needs your approval before touching production data. |

## 4. Decision tree once GSC data is available

For every indexed URL that is not in the sitemap, or returns non-200:

| Condition | Action | HTTP | Needs approval? |
|---|---|---|---|
| Real property or location in DB, published, but the route fails | Fix the route or data. | 200 | No: regression fix. |
| Real DB record, **unpublished/archived** | Keep unpublished and leave the URL at 404/410. Republishing is a business decision. | 404/410 | **Yes** |
| Old URL with a genuinely equivalent live page | 301/308 in `next.config.ts` (or `redirectrules`). | 301/308 | Yes, per mapping |
| Retired static demo/placeholder record | Keep 404 (optionally 410). | 404/410 | Yes (D2) |
| Parameter/filter or tracking variant | No page. Canonical already consolidates. | 200 | No |
| Private/token route | Never index. Confirm `noindex`. | 200/307 | No |
| Genuine legacy content with **recoverable** original copy (git, archive, snippet) | Build it using the page-type table below. | 200 | **Yes**, with content spec |
| Genuine legacy content, **no** recoverable copy | Write a *content specification* only. No page until the owner supplies or approves content. | 404 meanwhile | **Yes** |

## 5. Design-system references (for any page that does get built)

Phase C is intentionally **not** done in full yet. Auditing every component in detail is wasted effort if no page is approved. What is already established:

| Item | Finding |
|---|---|
| Stack | Next.js 16.3, React 19.2, Tailwind v4 via `@theme` tokens in `src/app/globals.css`, `clsx` + `tailwind-merge`, `lucide-react`. |
| Layout | Public pages live in the `(marketing)` route group with shared layout, header and footer from `src/components/layout`. Nav is driven by `src/config/navigation.ts`. |
| Components | `src/components/{ui,property,locations,insights,testimonials,forms,sections,shared,seo,home,legal}`. `ui/` has Badge, Button, Card, Input, Modal, Select, Textarea, LogoLoader. |
| Fonts / tokens | Heading serif (Fraunces), body Plus Jakarta Sans, plus Playfair, Instrument Serif, Alex Brush and JetBrains Mono. Brand blue `#1B84C4` / `#087fc3`, midnight/navy, gold `#c9a15a`, alabaster/ivory surfaces. Container max width 75rem. |
| SEO plumbing | `src/lib/seo.ts` builds canonical and OG from `siteConfig.url`. `src/components/seo/JsonLd.tsx` is the unified schema generator. `generateMetadata` is on every dynamic route. |
| Navbar clearance | Inner pages must use `pt-28 sm:pt-32 md:pt-36` (CLAUDE.md §5). |

### Page-type → template map

| Type | Reuse | Data source |
|---|---|---|
| Property | `properties/[slug]/page.tsx` | MongoDB `properties`, `plotoptions`, `mediaassets` |
| Location | `locations/[slug]/page.tsx` | MongoDB `locations` |
| Article | `insights/[slug]/page.tsx` | `src/data/insights.ts` |
| Case study | `testimonials/[slug]/page.tsx` | `src/data/testimonials.ts` |
| Legal | `legal/*` components | `src/data/legal/*` |

Dynamic routes already exist for all four content types, so **a "missing" property, location, article or case study almost always means a missing record, not a missing route**. New *routes* should be rare. New *data* needs approval.

## 6. Proposed route architecture

**No new routes proposed.** The existing architecture covers every content type found.

## 7. Redirect decisions (proposed)

| URL | Decision |
|---|---|
| `/about-us`, `/terms`, `/privacy`, `/rera`, `/projects`, `/plots` | Already redirect correctly. No change. |
| 6 retired static property slugs | Keep 404 (D2). No redirect. |
| `/properties/sample-*`, `/locations/other-locations` | Keep 404. |
| `/blog`, `/services`, `/gallery`, `/faq`, `/resources`, `/home`, `/index.html`, `/sitemap` | Keep 404. No evidence they existed. |

## 8. Implementation priority

| Pri | Item | Blocked on |
|---|---|---|
| **P0** | Obtain GSC export / site list | Owner |
| P1 | Diff export against inventory; update inventory | P0 |
| P1 | Confirm D1 (styling interpretation) | Owner |
| P2 | Per-URL decisions for any non-sitemap indexed URLs | P1 + approvals |
| P3 | D2/D3/D5 housekeeping (410s, static fallback, DB canonical field) | Owner approval |
| — | Build pages | Only if P2 yields approved, recoverable-content candidates |

## 9. Remaining deliverables

The 7 other reports in the brief (§13) are deferred until implementation is approved. Producing them now would document work that has not happened. I'm not creating empty or speculative versions.

## 10. Data safety & rollback

- **This phase changed no data.** Database access was read-only.
- **If pages are later approved:** any DB insert must first check for an existing slug (the model normalises slugs, and `slug` is indexed with `publicationStatus`). Records are created `DRAFT`, never auto-published. Rollback is deleting the new record by `_id`, which will be logged. Existing inventory is never overwritten.

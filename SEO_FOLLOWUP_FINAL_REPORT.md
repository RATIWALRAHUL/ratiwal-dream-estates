# SEO Follow-up — Final Report

**Date:** 2026-11-11
**Builds on:** `MISSING_INDEXED_URL_MASTER_INVENTORY.md`, `MISSING_INDEXED_PAGE_RECONSTRUCTION_PLAN.md`
**Status:** All four tasks complete. **No website behaviour, content, metadata, routes or database records were changed.**

---

## 1. Outcome by task

| Task | Result | Report |
|---|---|---|
| 1. Design-system convention | **Confirmed.** Tailwind v4 (CSS-first `@theme`), the vanilla CSS in `globals.css`, its tokens and the shared components are authoritative. No migration. Decision D1 resolved. | `SEO_FOLLOWUP_DESIGN_SYSTEM_CONFIRMATION.md` |
| 2. Static fallback safety | Retired demo slugs **cannot** reach public responses: the static array has been commented out since 2026-10-04. Two **different** latent risks found (S1/S2 below). Safe-fallback proposal written, not implemented. | `SEO_STATIC_FALLBACK_SAFETY_AUDIT.md` |
| 3. Stale canonical DB field | 9 of 9 records affected, one field each. **No public impact**: canonicals never read the field. Plan, backup, dry run and rollback written. **Not executed.** | `SEO_CANONICAL_DATABASE_CLEANUP_PLAN.md` |
| 4. GSC readiness | Fully documented. **GSC access does not exist** (`NOT_CONFIGURED`, empty tables). No credentials created or claimed. | `SEO_GSC_INTEGRATION_READINESS.md` |

## 2. Corrections to my earlier reports

My earlier hypothesis that the static fallback "could re-expose retired slugs on a DB outage" was **wrong**. The array is already empty. The inventory (§4.3) and plan (D3) are corrected in place, and D1 is marked resolved.

## 3. Most important findings

| ID | Finding | Severity | Status |
|---|---|---|---|
| **S1** | `generateStaticParams` returns `[]` on DB error, combined with `dynamicParams = false` (properties and locations). A **build** run while the DB is unreachable would 404 every property/location page for that deployment. | **High (latent)** | Reasoned from code, not reproduced. Needs a fix and approval. |
| **S2** | With `dynamicParams = false`, a property published or renamed **after** a build may not be reachable until a redeploy. | **High, unconfirmed** | Needs one controlled test (proposal P4). I have not tested it. |
| **S3** | `changePublishedSlug` creates **no redirect**, and `RedirectRule` records are never read by the public runtime (the collection is also empty). Renaming a published property would silently orphan its indexed URL. | Medium | Proposal P5. |
| S4 | The sitemap is prerendered at build and silently drops property URLs if the DB is empty or fails at build time. | Medium | Proposal P2. |
| R1 | 9 properties carry `seo.canonicalUrl = https://dreamestate.in/...`. Root cause: **both seed scripts hard-code it**, so the data fix must ship with a seeder fix. | Low (hygiene) | Plan ready, awaiting D5. |
| R2 | 44 media assets have `uploadedByEmail = admin@dreamestate.in`. `organizationsettings.general` has an apex `websiteUrl`, a `support@` email and social links I cannot verify. None is rendered publicly today. | Low | Owner decisions D6/D7. |
| G1 | The existing GSC client reads **performance** data only. It cannot list indexed URLs. The Page Indexing CSV export from the Search Console UI is still the best way to finish the original investigation. | Info | Recommendation in the GSC doc. |

## 4. Decisions waiting on the owner

| ID | Decision | Recommendation |
|---|---|---|
| **A (blocker for the original audit)** | Export the Search Console **Page Indexing** CSV (Indexed and Not indexed). | Do it now. It needs no setup. |
| D5 | Approve updating the 9 `seo.canonicalUrl` values, with the seeder fix. | Approve. |
| D6 / D7 | Placeholder uploader email; org-settings values. | Provide real values or clear them. |
| D2 | Retired slugs: keep 404 or use 410, no redirect. | Keep 404. |
| S1–S5 fixes | Approve P1–P6 from the fallback audit as a separate reviewed change. | Approve P1/P2/P3/P6 first. Run the P4 test before deciding P5. |
| GSC | Create the service account, grant it access, set the env vars (checklist in the GSC doc). | Do after, or alongside, the CSV export. |

## 5. Rules compliance

| Rule | Status |
|---|---|
| Do not recreate any retired property | ✅ None recreated |
| Do not create new routes | ✅ None |
| Do not change website content | ✅ None |
| Do not modify public SEO metadata | ✅ None |
| Do not write to the production database | ✅ Read-only access only (`find()` queries) |
| Do not remove backup files | ✅ None removed. `public/images/.backup` untouched. |
| Preserve previous SEO fixes | ✅ No `src/` file edited |

## 6. Files

**Created:**
- `SEO_FOLLOWUP_DESIGN_SYSTEM_CONFIRMATION.md`
- `SEO_STATIC_FALLBACK_SAFETY_AUDIT.md`
- `SEO_CANONICAL_DATABASE_CLEANUP_PLAN.md`
- `SEO_GSC_INTEGRATION_READINESS.md`
- `SEO_FOLLOWUP_FINAL_REPORT.md`
- `scripts/dry-run-canonical-cleanup.ts`, a read-only dry-run script with no database write path.

**Edited (documentation only):**
- `MISSING_INDEXED_URL_MASTER_INVENTORY.md`
- `MISSING_INDEXED_PAGE_RECONSTRUCTION_PLAN.md`

**Local-only, not committed:**
- `backups/seo-canonical-2026-11-11/properties-seo-before.json`, the pre-change snapshot of the 9 `seo` subdocuments.

## 7. Validation

| Check | Result |
|---|---|
| `npx tsc --noEmit` | ✅ pass |
| `npx eslint scripts/dry-run-canonical-cleanup.ts` | ✅ pass (after fixing one `no-explicit-any` error in my own script) |
| Dry run | ✅ "9 of 9 property docs would change (0 written)", run twice with identical results |
| `npm run build` | ✅ pass. All routes generated, including 9 property pages, 6 location pages, 8 insight pages and 4 case studies as SSG. `/sitemap.xml` shows as `○ Static`. |
| Full-project lint | Not run. I only linted my new script. |

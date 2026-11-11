# Follow-up Task 3 — Stale Canonical Database Cleanup Plan

**Date:** 2026-11-11
**Status:** ⏸ **PLAN ONLY. No database update has been executed. Awaiting explicit owner approval.**
**Database:** `ratiwal_dream_estates` · **Collection:** `properties` · **Field:** `seo.canonicalUrl`

---

## 1. Summary

| Item | Finding |
|---|---|
| Records affected | **9 of 9** property documents (all `PUBLISHED`) |
| Exact field | `properties.seo.canonicalUrl`, a single field per record |
| Stale value | `https://dreamestate.in/properties/<slug>`, a placeholder domain |
| Proposed value | `https://www.ratiwaldreamestates.com/properties/<slug>` |
| Public impact today | **None.** Live canonicals are already correct (see §2). |
| Why fix anyway | The placeholder is a latent trap. If anything starts reading the field, or a dashboard user re-saves a property, the wrong domain could reach `<head>`. It also violates CLAUDE.md §6's ban on placeholder domains. |
| **Root cause** | **The seed scripts hard-code the placeholder** (§4). Fixing only the data is not enough, because re-running a seeder overwrites the fix. |

## 2. Current public canonical generation (verified)

- `src/lib/seo.ts` `getMetadata()` builds the canonical as `siteConfig.url + "/" + slug`. It never reads `property.seo.canonicalUrl`. The property page passes `slug: /properties/${property.slug}`.
- `src/config/site.ts` `resolveCanonicalSiteUrl()` forces the `www` host even if `NEXT_PUBLIC_SITE_URL` is set to the apex.
- `grep canonicalUrl` over `src/app/(marketing)` returns **zero** hits. The only readers and writers are dashboard editors, `property.actions.ts`, `cms*.ts` and validation schemas.
- Live check: all 39 sitemap URLs (including the 9 property pages) emit a self-referential `https://www.ratiwaldreamestates.com/...` canonical. Verified with a fresh fetch per URL.

**Conclusion:** the field is dead data from the public site's point of view. This is hygiene, not an SEO fix.

## 3. Record-level change list

Dry run produced by `scripts/dry-run-canonical-cleanup.ts` (read-only). **9 would change, 0 written.**

| # | `_id` | slug | Existing `seo.canonicalUrl` | Proposed |
|---|---|---|---|---|
| 1 | `6ac702091a734c5b62ce1234` | neelkanth-nagar | `https://dreamestate.in/properties/neelkanth-nagar` | `https://www.ratiwaldreamestates.com/properties/neelkanth-nagar` |
| 2 | `6ac702191a734c5b62ce124c` | riyasat-paradise-ii | `https://dreamestate.in/properties/riyasat-paradise-ii` | `https://www.ratiwaldreamestates.com/properties/riyasat-paradise-ii` |
| 3 | `6ac7022a1a734c5b62ce1262` | bhumija-green-block-a | `https://dreamestate.in/properties/bhumija-green-block-a` | `https://www.ratiwaldreamestates.com/properties/bhumija-green-block-a` |
| 4 | `6ac7023a1a734c5b62ce1279` | riyasat-heritage-extension | `https://dreamestate.in/properties/riyasat-heritage-extension` | `https://www.ratiwaldreamestates.com/properties/riyasat-heritage-extension` |
| 5 | `6acd1b4e1165e95b28fa508a` | happy-business-park | `https://dreamestate.in/properties/happy-business-park` | `https://www.ratiwaldreamestates.com/properties/happy-business-park` |
| 6 | `6acd1b791165e95b28fa509f` | balaji-puram | `https://dreamestate.in/properties/balaji-puram` | `https://www.ratiwaldreamestates.com/properties/balaji-puram` |
| 7 | `6acd1bae1165e95b28fa50b3` | vrindavan-viihaar | `https://dreamestate.in/properties/vrindavan-viihaar` | `https://www.ratiwaldreamestates.com/properties/vrindavan-viihaar` |
| 8 | `6acd1bc71165e95b28fa50c6` | aero-crystal | `https://dreamestate.in/properties/aero-crystal` | `https://www.ratiwaldreamestates.com/properties/aero-crystal` |
| 9 | `6acd1bdb1165e95b28fa50db` | one-kishangarh | `https://dreamestate.in/properties/one-kishangarh` | `https://www.ratiwaldreamestates.com/properties/one-kishangarh` |

Sibling `seo` keys on every record (`metaTitle`, `metaDescription`, `ogImageUrl`, `noIndex`, `noFollow`) are **not** touched. All records have `noIndex=false`.

## 4. Root cause: seeders (must be fixed together with the data)

| File | Line | Code |
|---|---|---|
| `scripts/seed-multi-city-catalog.ts` | 1171 | ``canonicalUrl: `https://dreamestate.in/properties/${proj.slug}` `` |
| `scripts/seed-jaipur-townships.ts` | 626 | ``const canonicalUrl = `https://dreamestate.in/properties/${township.slug}` `` |

Both seeders are idempotent upserts. Re-running either one **would restore the placeholder**. The proposed seeder fix is to derive the value from `siteConfig.url` (or the literal `https://www.ratiwaldreamestates.com`). It is a one-line change per file, included in the apply change set but **not made now**.

## 5. Full scan: what else contains "dreamestate" (classified)

The scan covered `properties`, `locations`, `mediaassets` and `organizationsettings`. A naive text match is misleading because `/dreamestate/` is the **legitimate ImageKit folder** (CLAUDE.md §1).

| Collection · path | Count | Class | In scope? |
|---|---|---|---|
| `properties` · `seo.canonicalUrl` | 9 | **Placeholder domain** | **Yes, this plan** |
| `properties` · `media[].url`, `documents[].fileUrl`, `masterplan.fileUrl/imageUrl`, `seo.ogImageUrl` | 21+21+7+7+6 | ImageKit `/dreamestate/…` path | **No, legitimate. Must not be changed.** |
| `mediaassets` · `providerKey`, `publicUrl` | 44+44 | ImageKit path | No, legitimate |
| `mediaassets` · `uploadedByEmail` | 44 | **Placeholder email** `admin@dreamestate.in` | **No, owner decision (D6).** Internal metadata, never rendered publicly. Set by `update-card-gate-images.ts` and both seeders. |
| `locations` | 0 | n/a | n/a |
| `organizationsettings` · `general.websiteUrl` | 1 | `https://ratiwaldreamestates.com` (apex, not www) | No, owner decision (D7) |
| `organizationsettings` · `general.supportEmail` | 1 | `support@ratiwaldreamestates.com` | No, owner decision (D7). CLAUDE.md §6 says to use only `sureshkumawat6917@gmail.com`. |
| `organizationsettings` · `general.socialLinks.{facebook,instagram,youtube}` | 3 | `…/ratiwaldreamestates` | No, owner decision (D7). **I cannot verify these profiles exist.** CLAUDE.md §8 says never publish unverified business information. |

The `organizationsettings` values are read only by the dashboard settings service. I found **no public-page consumer**, so none of them is published today. They would matter if a future change wires them into JSON-LD `sameAs` or the footer.

## 5a. Open owner decisions

| ID | Decision | Recommendation |
|---|---|---|
| **D5** | Approve updating the 9 `seo.canonicalUrl` values to the `www` form (this plan). | **Approve.** Low risk, reversible. |
| D5-alt | Instead `$unset` the field. | Not recommended. The dashboard form expects the field. |
| **D6** | Replace `uploadedByEmail = admin@dreamestate.in` on 44 media assets. | Optional. Needs the real uploader email from you, and I won't invent one. |
| **D7** | Review `organizationsettings.general` (apex URL, `support@` mailbox, social links). | Confirm each is real or clear it. Separate change. |

## 6. Backup plan

1. **Local snapshot (already taken, read-only):** `backups/seo-canonical-2026-11-11/properties-seo-before.json` (5.9 KB). It contains `_id`, `slug` and the full `seo` subdocument for all 9 records, generated by `npx tsx scripts/dry-run-canonical-cleanup.ts --backup-dir backups/seo-canonical-2026-11-11`. It holds no secrets. It is **untracked and not committed**.
2. **Before applying:** take an Atlas on-demand snapshot (or `mongodump --collection=properties`) and record the snapshot ID in this file.
3. **Audit trail:** record the apply run through the existing audit-log service.

## 7. Proposed apply procedure (NOT written, NOT run)

Preconditions: owner approval in writing, an Atlas snapshot ID recorded, seeders patched in the same change set.

Per record (9 operations, each guarded by an optimistic filter):

```js
db.properties.updateOne(
  { _id: ObjectId("<id>"), "seo.canonicalUrl": "<exact existing value from §3>" },
  { $set: { "seo.canonicalUrl": "https://www.ratiwaldreamestates.com/properties/<slug>" } }
)
```

Design decisions:
- **Native driver `updateOne`, not the Mongoose model**, so schema hooks and timestamps do not fire.
- **`updatedAt` is deliberately not bumped.** Sitemap `<lastmod>` comes from `updatedAt`, and the content did not change, so we should not signal 9 "fresh" URLs to Google.
- The `seo.canonicalUrl` guard in the filter makes each update a **no-op if the value changed since the dry run**. It is safe against concurrent dashboard edits and safe to re-run.
- Only `seo.canonicalUrl` is `$set`. Nothing else is touched.

Post-apply verification:
1. Re-run the dry run. **Expected: "0 of 9 would change".**
2. Re-run the 39-URL canonical check. **Expected: no change** (public canonicals never depended on this field).
3. `/sitemap.xml` is unchanged (no `updatedAt` bump).

## 8. Rollback procedure

| Scenario | Action |
|---|---|
| Any single record is wrong | Restore its `seo.canonicalUrl` from `properties-seo-before.json` using the same guarded `updateOne` with the before/after values swapped. |
| Broader problem | Restore the `properties` collection (or those 9 documents) from the recorded Atlas snapshot. |
| Verify rollback | Re-run the dry run. It should again report "9 of 9 would change" and the values should match the §3 "Existing" column. |

Rollback is low-stakes because the public site does not read this field.

## 9. Dry-run output (verbatim extract)

```
DRY RUN — connected read-only intent to database: ratiwal_dream_estates

== A. Scan: 'dreamestate' strings, classified ==
properties: 9 docs
   IMAGEKIT_PATH (legit) :: documents[].fileUrl  x21
   IMAGEKIT_PATH (legit) :: masterplan.fileUrl  x7
   IMAGEKIT_PATH (legit) :: masterplan.imageUrl  x7
   IMAGEKIT_PATH (legit) :: media[].url  x21
   IMAGEKIT_PATH (legit) :: seo.ogImageUrl  x6
   PLACEHOLDER_DOMAIN :: seo.canonicalUrl  x9
locations: 7 docs
mediaassets: 44 docs
   IMAGEKIT_PATH (legit) :: providerKey  x44
   IMAGEKIT_PATH (legit) :: publicUrl  x44
   PLACEHOLDER_EMAIL :: uploadedByEmail  x44   e.g. admin@dreamestate.in
organizationsettings: 1 docs
   OTHER_BRAND_STRING :: general.socialLinks.facebook  x1
   OTHER_BRAND_STRING :: general.socialLinks.instagram  x1
   OTHER_BRAND_STRING :: general.socialLinks.youtube  x1
   OTHER_BRAND_STRING :: general.supportEmail  x1
   OTHER_BRAND_STRING :: general.websiteUrl  x1

== B. Proposed changes: properties.seo.canonicalUrl ==
CHANGE ×9 (see table in §3)

Summary: 9 of 9 property docs would change (0 written).
```

The script contains no database write calls (it uses `find()` only). The only filesystem write is the optional local backup JSON.

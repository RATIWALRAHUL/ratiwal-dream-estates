# Phase 5B — Property & Project Authority Strategy (Research Stage)

**Date:** 2026-11-11 · **Stage:** 5B research only. **No content, data, pricing, availability or schema was changed.** Implementation requires approval of the checklist and each change below.
Legend: ✅ VERIFIED (repo/database read-only, S7) · 💡 RECOMMENDATION · ⛔ UNAVAILABLE. Search-volume and keyword-difficulty figures are **not available** (Search Console not connected) and are not estimated here.

## 1. The nine published projects — what the records actually say

| # | Project | Location / locality | Type | Developer (record) | RERA no. (record) | Plot options | Size range in record | Docs on file |
|---|---|---|---|---|---|---:|---|---|
| 1 | Neelkanth Nagar | Jaipur / Chaksu | Residential plot | Riyasat Infra Developers | RAJ/P/2026/5056 | 8 | 900–2,250 sq ft | RERA cert, approval, title — all PUBLIC/VERIFIED |
| 2 | Riyasat Paradise II | Jaipur / Vatika | Residential plot | Riyasat Infra Developers | RAJ/P/2026/5205 | 10 | 900–2,250 sq ft | same 3 |
| 3 | Bhumija Green Block A | Jaipur / Sikar Road | Residential plot | Bhumija Developers | RAJ/P/2025/4362 | 13 | 900–4,709 sq ft | same 3 |
| 4 | Riyasat Heritage Extension | Jaipur / Salagrampura–Dahar | Residential plot | Riyasat Infra Developers | RAJ/P/2026/5264 | 9 | 900–4,500 sq ft | same 3 |
| 5 | Happy Business Park | Ajmer / Gagwana | Commercial plot | Happy Real Earth | RAJ/P/2026/5282 | 5 | 954–1,800 sq ft | same 3 |
| 6 | Balaji Puram | Ajmer / Chandiyawas | Residential (mixed inventory) | Happy Real Earth | RAJ/P/2026/5204 | 6 | 792–1,800 sq ft | same 3 |
| 7 | Vrindavan Viihaar | Ajmer / Gagwana | Residential (mixed inventory) | Happy Real Earth | RAJ/P/2026/5179 | 5 | 900–1,800 sq ft | same 3 |
| 8 | Aero Crystal | Kishangarh / Kishangarh B | Residential plot | Happy Real Earth | RAJ/P/2026/4620 | 5 | 900–1,800 sq ft | same 3 |
| 9 | One Kishangarh | Kishangarh / Madanganj | Commercial plot | Happy Real Earth | RAJ/P/2022/2205 | 6 | 150–750 sq ft | same 3 |

✅ All nine are `PUBLISHED`, `AVAILABLE`, `VERIFIED` in the database; RERA status "VERIFIED" with a last-verified date of **2026-10-12**; each has 2–4 images (one marked primary), highlights, amenities and 1–2 infrastructure milestones. Total 67 plot-size options.
⛔ **I could not independently confirm any RERA number**: the Rajasthan RERA portal returned an empty page to the fetch tool. "VERIFIED" is an internal status set on 2026-10-12, not something this audit re-checked.

## 2. Findings that limit what can be claimed

| # | Finding | Why it matters | Severity |
|---|---|---|---|
| P1 | **All nine projects share an identical pricing note:** "Competitive market rates with verified title registry. Pre-approved loans from leading banks." | "Pre-approved loans from leading banks" is a specific financial claim with no evidence in the records, repeated verbatim on every project. It reads as boilerplate and could mislead buyers | High |
| P2 | **All nine are "Price on Request"** | Honest, but it caps conversion and search relevance; do not invent prices. Show prices only where the developer has authorised publication | Medium |
| P3 | **Availability is not unit-level.** Zero `InventoryUnit` records exist; the 67 plot options are *size options*, every one marked `AVAILABLE`, none reserved or sold | A blanket "available" cannot be verified and will go stale. Publishing it as live availability would be a false claim | High |
| P4 | "Source type: DEVELOPER" — these are developers' projects; Ratiwal Dream Estates is an advisor/agent | Pages must make the relationship clear (advisor/authorised channel, not owner/developer). The site header also says "Direct Landowner Pricing… zero hidden markups," which is an unverified claim | High |
| P5 | Possession status reads "Ready for Possession" for most Jaipur/Kishangarh projects and "Under Development / Early Possession" for Happy Business Park | Needs developer confirmation and a date; stale status is a trust risk | Medium |
| P6 | Image authenticity is not provable from the data (kind = IMAGE only) | Project rules require authentic developer photography/approved renders (no AI/stock) | Medium — owner confirmation |
| P7 | Riyasat Paradise II has only 2 images; Neelkanth Nagar 3 | Thin galleries limit page quality | Low |

## 3. Project-specific search opportunities (qualitative — no volumes available)

| Opportunity type | Example queries (illustrative, **unmeasured**) | Page that should satisfy it | Approach |
|---|---|---|---|
| Project name + verification | "<project name> RERA", "<project name> reviews/legal" | `/properties/<slug>` | Factual verification summary: RERA number with link to the official project page, approval authority, document list, date last verified |
| Project + locality | "plots in Vatika Jaipur", "commercial plots Gagwana Ajmer" | property page + location page | Clear locality facts (distances from sourced maps, not adjectives) |
| Plot-size queries | "200 sq yd plot Jaipur" | property page | Show actual size options and units (sq yd and sq ft per project rules) without implying availability |
| Developer-brand queries | developer names + "approval" | property page | Independent, factual advisory view; no impersonation of developer branding |
| Document-verification intent | "how to check RERA for <project>" | insight article + project page | Link guidance article to each project's verification summary |

## 4. Approved project information checklist (proposal)

A project page may carry a claim **only if its row is filled with evidence**. Required for every project before publication or refresh:

| Field | Evidence required | Currently on record? |
|---|---|---|
| Project name, developer legal name | developer letter / RERA page | name ✅; legal name partly |
| Exact locality / survey reference | RERA page, layout plan | locality ✅ |
| Property type and permitted use | approval order | ✅ type |
| RERA project number + registered-until date | official project page screenshot with date | number ✅; **date and screenshot ⛔** |
| Approval authority and order reference (JDA/ADA/Nagar Palika) | approval order | free-text note only |
| Layout plan / masterplan | developer-supplied file | masterplan flag ✅ |
| Plot sizes and counts | developer inventory sheet | size options ✅; **unit-level sheet ⛔** |
| Availability (per plot, with "as of" date) | developer confirmation | ⛔ |
| Price per sq yd or "on request" (developer-authorised) | written authorisation | on request ✅ |
| Amenities actually built vs planned | developer / site visit photos with date | list ✅ (built-vs-planned ⛔) |
| Possession status with date | developer confirmation | status text ✅ (date ⛔) |
| Loans / bank tie-ups | bank letters | **claim present, evidence ⛔** |
| Images | photographer/developer provenance | ⛔ provenance |
| Inquiry process | internal SOP | contact form + WhatsApp ✅ |
| Advisor relationship with developer | written authorisation | ⛔ |
| Last verified date shown on page | system field | ✅ stored |

## 5. Recommended improvements (each needs approval; none applied)

1. 💡 **Remove or evidence P1** (the loans sentence) project-wide; replace with project-specific facts. Highest trust impact, lowest effort.
2. 💡 **Show "last verified" and a document list on each project page** — data already exists (three public verified documents per project).
3. 💡 **Add an "as-of" availability statement** per project once the developer sheet exists; otherwise say "Current availability on request" instead of implying live stock.
4. 💡 State the advisor/developer relationship plainly on each project page.
5. 💡 Replace the one-line boilerplate with a short, factual **verification summary** per project: RERA number + official link, authority, what documents were checked and when.
6. 💡 For Riyasat Paradise II / Neelkanth Nagar, add genuine site-visit photography when available (project image rules apply).
7. 💡 Do **not** add price, appreciation, ROI, "limited units", or approval wording that is not on the checklist.

## 6. Effort and dependencies
Evidence collection from three developers (Riyasat Infra, Bhumija, Happy Real Earth) is the long pole (about 1–2 weeks elapsed, 3–4 h of owner time). Implementation after evidence: ~1 day. No dependency on Search Console. **Approval required** for any change to published project data.

## 7. Not done / not possible
No RERA registry verification (portal empty), no developer contact, no price or availability research, no check of image provenance, and no competitor project-page scrape (competitor findings in Phase 3C were not re-verified here).

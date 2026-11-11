# Phase 5A — Business Citation Audit & Correction List

**Date:** 2026-11-11 · **Stage:** 5A (research only — nothing was submitted, claimed, edited or contacted)
Legend: ✅ VERIFIED · 💡 RECOMMENDATION · ⛔ UNAVAILABLE. Sources: **S5** web searches (secondary), **S6** production site, **S7** repository/database (see Local SEO Audit for the full register).

## 1. What was checked

| Check | Method | Result |
|---|---|---|
| Brand name + city | web search "Ratiwal Dream Estates" Jaipur | ✅ run — **no result** about the business (results were unrelated "Dream …" firms) |
| Domain | web search `ratiwaldreamestates.com` | ✅ run — no result |
| Brand + portals/directories | search with JustDial / Facebook / Instagram / 99acres / MagicBricks | ✅ run — no result |
| Founder/advisor by name | one query; the search tool declined to search for the private individual | ⛔ not performed (and not needed: advisor registration should be checked on the official registry instead) |
| Google Business Profile / Maps | needs authorised access or manual lookup | ⛔ unavailable |
| Bing Places, Apple Business, JustDial, social platforms (direct lookup) | needs manual browsing; the search tool does not index them reliably | ⛔ unavailable |
| Official RERA registries (agent + projects) | Rajasthan portal returned an empty page; MahaRERA portal loads (menu only) | ⛔ Rajasthan not verifiable; 🟡 MahaRERA reachable but rules text not read |

**Interpretation:** "no results found" here means *the available search tool found none*, **not** *no citations exist*. The correction list below is therefore built from **evidence inside the owner's own systems** (where I can prove inconsistencies), plus a manual checklist for the external platforms.

## 2. Canonical NAP (proposed source of truth — owner to confirm)

| Field | Value on the verified public record | Notes |
|---|---|---|
| Name | Ratiwal Dream Estates | exact brand; no keywords added |
| Phone | +91-9929533436 (E.164 `+919929533436`) | matches site, schema, WhatsApp |
| Email | sureshkumawat6917@gmail.com | matches site/schema |
| Address | **not published** (city-level "Jaipur, Rajasthan, India") | owner must decide: real staffed address, or service-area with address hidden |
| Hours | Mon–Sat 10:00–19:00 IST (visible on `/contact`, `siteConfig`) | schema says 7 days; database says 09:00 start |
| Website | `https://www.ratiwaldreamestates.com` | database settings holds the non-www URL |

## 3. Inconsistencies found (evidence-backed correction list)

| # | Where | Found | Should be | Evidence | Fix owner |
|---|---|---|---|---|---|
| C1 | JSON-LD `openingHoursSpecification` (all pages) | 7 days, 10:00–19:00 | Mon–Sat 10:00–19:00 (if that is the real schedule) | production HTML vs `/contact` visible text | developer (code) |
| C2 | `OrganizationSettings` (database) hours | Mon–Sat 09:00–19:00 | same single schedule | read-only DB query | owner/admin (DB write) |
| C3 | `OrganizationSettings` phone | placeholder number (already removed from code in Phase 3A, still stored) | `+91-9929533436` | DB record vs `siteConfig` | owner/admin |
| C4 | `OrganizationSettings` support email | an address on the business domain that appears nowhere else | confirm whether it exists; else clear | DB record | owner/admin |
| C5 | `OrganizationSettings` address, legal name, registration and tax identifiers | values that appear nowhere on the public site and look like test entries (updated by a "test" account) | owner confirms real values or clears them; **do not publish unverified legal identifiers** | DB record | owner/admin |
| C6 | `OrganizationSettings` website URL | non-www | `https://www.ratiwaldreamestates.com` | DB vs canonical rule | owner/admin |
| C7 | Social links in header/footer (`siteConfig.social`) | `#` placeholders | real profile URLs, or hide the icons | production HTML (no social hrefs) | owner + developer |
| C8 | Schema `sameAs` | empty | real profile URLs only | production JSON-LD | developer after C7 |
| C9 | Schema `areaServed` includes "Navi Mumbai / Panvel, Maharashtra" | claims a Maharashtra service area | keep only if registration/engagement evidence exists | audit §5 of Local SEO report | owner decision |
| C10 | Social URLs stored in the database (facebook / instagram / linkedin / youtube `…/ratiwaldreamestates`) | unverified; no evidence these profiles exist or belong to the business | confirm each exists and is owned by the business | DB record | owner |

## 4. Citation inventory — platforms to check manually (no automated submission)

Status is **unknown** for all; the table is a checklist, not a finding. Priority reflects usefulness for a Jaipur advisory business and policy eligibility.

| Platform | Why it matters | Check (manual, by the owner) | Eligibility note |
|---|---|---|---|
| Google Business Profile | primary local entity | search Google Maps (logged in as the owner) for the phone number and brand; do **not** create a duplicate | needs eligible address or service-area setup (S1) |
| Official RERA registries (Rajasthan agent + project pages; MahaRERA if applicable) | authoritative, public, high trust | search the agent and each of the nine project numbers; save screenshots with date | public record, not a citation you submit |
| Bing Places | feeds Bing/Copilot-based answers | search by phone/brand | same address rules apply |
| Apple Business listings | Apple Maps | search by phone/brand | same address rules apply |
| Facebook / Instagram / LinkedIn / YouTube | brand identity, `sameAs` | confirm real profiles; match name/phone/URL | only link profiles the business controls |
| India directories (e.g. JustDial) | consumer discovery | search by phone number | listings often exist unclaimed; claim, don't duplicate |
| Property portals (agent profiles) | buyer discovery | search by agent registration/phone | usually paid; **not recommended without a budget decision** |

## 5. Rules for any future citation work

- Claim and correct existing listings; **never create duplicates**; no bulk or automated submissions.
- Use the canonical NAP above verbatim (same abbreviations, same phone format).
- Never add an address, category, service or hours the business cannot prove.
- Do not buy listings or reviews. Do not use virtual/mailing addresses as offices (S1).
- Keep a log: platform, URL, date checked, NAP shown, action taken, who did it.

## 6. Approvals required
Correcting C1/C7/C8 changes site code or schema (approval); C2–C6/C10 are database corrections (approval); any account creation or claim on a third-party platform is an owner action. Nothing in this report has been applied.

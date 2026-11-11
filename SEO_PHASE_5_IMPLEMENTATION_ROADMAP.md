# Phase 5 — Implementation Roadmap & Approval Gates

**Date:** 2026-11-11 · **Status:** plan only. **Nothing here is approved or started.** No dates are promised; durations are effort estimates. Do not treat any item as automatic.

## 1. Stage gates (per the Phase 5 brief)

| Stage | Scope | State today | Gate to proceed |
|---|---|---|---|
| **5A** Research & local SEO audit | Business presence, locations, GBP, citations | ✅ **Complete** (reports delivered; no changes made) | Owner reviews findings and answers §2 |
| **5B** Property & project authority | Evidence checklist, project page improvements | Research ✅ done; implementation ⏳ | Owner approves the checklist and each change; developer evidence supplied |
| **5C** Editorial strategy | Outlines and source lists | Plan ✅ done; drafting ⏳ | Owner approves list/priorities + a credentialed legal reviewer; primary sources retrieved |
| **5D** Digital PR | Opportunities and outreach plan | Strategy ✅ done; outreach ⏳ | Trust fixes done first; owner approves each outreach message |
| **5E** Performance measurement | Baseline | Definition ✅ done; **data ⛔ blocked** | Search Console connected (and GA4 for conversions) |

## 2. Owner decisions and inputs needed (blocking items first)

| # | Question / input | Unblocks |
|---|---|---|
| O1 | Is there an **eligible, staffed office** in Jaipur, or is this a service-area business (hide address)? Does a **Google Business Profile already exist** (check with the owning Google account)? | GBP, schema address, `contact` copy |
| O2 | **Maharashtra:** is the advisor/firm registered with MahaRERA, and is there real engagement in Navi Mumbai/Panvel? | Whether Maharashtra pages/schema stay |
| O3 | Evidence for **Bhiwadi / Navi Mumbai / Panvel** engagements (anonymised ok) and client **consent records** for every testimonial/case study | Reclassification; testimonial trust |
| O4 | Is **"Advocate R. Sharma"** a real reviewer who consented (and credentials)? Who is the real legal reviewer going forward? | Reviewer/author lines; legal content |
| O5 | The real company/legal status (proprietorship vs company) and what may be published | Identity block; schema |
| O6 | Which hours are correct (Mon–Sat 10–19?) | Schema and database fix |
| O7 | Real social profile URLs (or "none yet") | `sameAs`, social icons |
| O8 | **Search Console credentials** (steps in the Phase 4A GSC report); optionally approve a live technical scan | Baseline, issue register, alerts |
| O9 | Developer evidence for the nine projects (dated availability, loans/bank claim, possession dates, advisor authorisation, image provenance) | Project page improvements |
| O10 | GA4 approval (tag, consent banner, first-touch capture) and PageSpeed/CrUX API key | Conversion and mobile baselines |
| O11 | A qualified Rajasthan property lawyer for the legal review | P0 editorial correction |

## 3. Backlog by priority

### P0 — Trust and accuracy fixes (smallest effort, highest risk reduction)

| # | Item | Type | Effort | Needs |
|---|---|---|---|---|
| R1 | Remove or evidence the "Pre-approved loans from leading banks" line (9 projects) | database content | 0.5 h | O9 or just removal |
| R2 | Remove or replace "Direct Landowner Pricing… zero hidden markups" | site copy | 0.5 h | approval |
| R3 | Reviewer/author credential: evidence or remove | article data | 1 h | O4 |
| R4 | Align hours across site, schema and database | code + DB | 1 h | O6 |
| R5 | Review/clear the test-data `OrganizationSettings` record | DB | 0.5 h | O5 |
| R6 | Legal review of 90-A, JDA patta and pricing articles → correct/soften/disclaim | content | external + 1 day | O11 |
| R7 | Fix case-study mapping/image mismatch and unexplained "Royal Palms Township" | data | 1 h | O3 |
| R8 | Remove `#` social placeholders; fill `sameAs` only with real profiles | code | 0.5 h | O7 |

### P1 — Local entity foundation
| # | Item | Effort | Needs |
|---|---|---|---|
| R9 | Decide address model; if eligible, create/claim **one** GBP (Jaipur), Bing Places, Apple listing; never duplicates; no GBP for other cities | 2–3 h | O1 |
| R10 | Decide Bhiwadi / Navi Mumbai / Panvel treatment (advisory pages with evidence, merge, or noindex) and edit schema `areaServed` accordingly | 2–4 h | O2, O3 |
| R11 | Add RERA project links + "last verified" + document list to each project page | 1 day | O9 (partly), code approval |
| R12 | Connect Search Console; start baseline clock (28 days) | 1 h + wait | O8 |

### P2 — Authority content and project depth
| # | Item | Effort | Needs |
|---|---|---|---|
| R13 | Kishangarh parity (micro-markets, infrastructure, FAQs, hero) with sourced facts | 4–6 h | source retrieval |
| R14 | Editorial P1 articles (A1, A2, B3) then B1/B2 rewrites | ~2–3 weeks elapsed | R6, O11, sources |
| R15 | Linkable assets (document checklist, RERA how-to) | 2–3 days | R14 |
| R16 | Developer "authorised advisor" listings (written authorisation first) | 1–2 weeks elapsed | O9 |

### P3 — Later
| # | Item | Needs |
|---|---|---|
| R17 | Micro-market guides (D1–D5) after GSC shows demand | GSC data, official sources |
| R18 | Expert commentary outreach and association memberships | trust fixes complete, owner approval |
| R19 | Location-grouped baseline in the SEO dashboard | approval, GSC data |
| R20 | GA4-based conversion baseline | O10 |

## 4. Dependencies and risks

| Risk | Impact | Mitigation |
|---|---|---|
| Unverified claims remain live (loans, reviewer, testimonials) | Trust/compliance exposure; undermines any PR | Do P0 first |
| Maharashtra advertising without registration | Possible regulatory problem | O2 before any Maharashtra growth work |
| Creating GBP with an ineligible address | Profile suspension; wasted effort | O1 first (S1 rules) |
| Publishing legal content without primary sources | Misleading legal information | R6 and the source rule |
| No search data | Priorities are qualitative | R12 early |
| Developer cooperation delays | Slows project pages and listings | Start O9 requests now |

## 5. Explicit approvals required
Each of the following needs the owner's written go-ahead: any site-copy, schema, or database change (R1–R5, R7–R8, R10–R11, R13); creation or claiming of any external profile (R9); publishing any article (R14–R17); any outreach message (R16, R18); connecting analytics (R12, R20); and the live technical scan. **I will not begin Phase 6 or implement any of this automatically.**

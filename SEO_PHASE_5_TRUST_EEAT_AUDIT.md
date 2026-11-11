# Phase 5 — Trust & E-E-A-T Audit

**Date:** 2026-11-11 · **Stage:** audit only — nothing changed.
Legend: ✅ VERIFIED (S6 production site, S7 repository/database) · 💡 RECOMMENDATION · ⛔ UNAVAILABLE. Severity: **High** = could mislead users or breach trust/compliance; **Medium**; **Low**.

## 1. Scorecard

| Area | Status | Summary |
|---|---|---|
| Company identity | 🟡 | Brand clear; **legal entity not stated on the site**, and the database holds conflicting, unverified entity details |
| Leadership & expertise | 🟡 | Named advisor, registration shown; quantified track-record claims have no evidence on file |
| Contact information | 🟡 | Phone/email/WhatsApp clear; address city-only; hours conflict |
| Physical business details | ⛔→🟡 | No verifiable address (policy-compatible if service-area model is chosen) |
| RERA / licensing | 🟡 | Advisor number and nine project numbers displayed; **not independently verified**; Maharashtra question open |
| Property documentation | 🟢/🟡 | Three public "verified" document records per project; availability, pricing and loan claims weak |
| Authors & reviewers | 🔴 | Reviewer and author credentials cannot be verified |
| Publication dates & sources | 🟢 | Published/updated/reviewed dates and source lists present; specificity varies |
| Testimonials & case studies | 🔴 | Static text with a `clientConsent: true` flag, no consent record, unverifiable "verified" claims |
| Complaint & contact processes | 🟢 | Privacy and Terms pages publish a grievance/compliance contact |

## 2. Findings in detail

| # | Area | Finding (evidence) | Severity | 💡 Recommendation |
|---|---|---|---|---|
| T1 | Testimonials | Five testimonials and four case studies live in `src/data/testimonials.ts`; the CMS testimonial table has **0 rows**. Each has `clientConsent: true`, a `verified: true` flag and a free-text "verification method" (e.g., "Confirmed against registered JDA mutation & documentation record"). **No consent date, consent document or client record exists in the system**, so authenticity and consent cannot be demonstrated | **High** | Owner supplies, per entry, evidence of genuine client + written consent (date, scope) — or removes the entry. Keep ratings out of schema (currently correct) |
| T2 | Case studies | Case study 1 says the family bought "a 200 sq. yd corner plot in **Royal Palms Township**" — a township that is **not in the published inventory** and not otherwise explained. Case study 3 ("Jaipur Ring Road") is mapped to Jaipur but uses a **Bhiwadi** hero image | High / Medium | Confirm the real project name and that the firm may name it; fix the image mapping |
| T3 | Reviewer credential | Articles name "**Advocate R. Sharma — High Court Revenue & Property Title Counsel**" as legal reviewer; the author is "**Ratiwal Editorial Research Team**" with a generic bio ("senior research analysts and statutory planning specialists"). Nothing in the repository proves either exists or consented | **High** | Show a reviewer only with proof (enrolment number or bar-council record, consent, date). Otherwise replace with the real advisor as author and remove the reviewer line. Do not invent or imply credentials |
| T4 | Track-record numbers | "8+ years", "250+ families guided", "50,000+ sq. yards transacted" are centralised in `siteConfig` and appear in site copy and schema; **no supporting record in the repository** | Medium–High | Keep only figures the owner can substantiate (internal record); round conservatively; avoid precise numbers without evidence |
| T5 | Loans boilerplate | "Pre-approved loans from leading banks" on all nine projects | **High** | Remove or document with bank letters (Property Authority report P1) |
| T6 | "Direct Landowner Pricing… zero hidden markups" (header strip on every page) | Unverifiable commercial claim; projects are developers', not the firm's | Medium–High | Replace with a factual statement of what the firm does and how it is paid |
| T7 | Legal identity | The site never states a legal entity or registration number. The database holds a "Private Limited" name, a CIN-format and a GST-format value that appear nowhere else and look like test entries (updated by a "test" account) | Medium | Owner confirms whether a company exists; if yes, publish the legal name/identifiers **only after verification** (MCA/GST records); if the business is a proprietorship, say so |
| T8 | Advisor registration | RAJ/A/2019/983 shown; "Suresh Kumawat (alias Suresh Ratiwal)" disclosed consistently | Medium | Spot-check on the Rajasthan RERA registry (portal was unreadable to my tool) and link to the official record |
| T9 | Maharashtra | Pages and schema advertise Navi Mumbai/Panvel while only a Rajasthan registration is displayed | **High** (compliance) | Owner confirms MahaRERA status (Local SEO Audit §5) |
| T10 | Contact | Visible Mon–Sat 10–19; schema 7 days; database 09–19 | Medium | One source of truth (Citation Audit C1–C2) |
| T11 | Address | City only; "private consultations by appointment" | Medium | Decide service-area vs staffed-office model; if the latter, publish a real address (and only then add `geo`) |
| T12 | Project facts | Availability blanket "AVAILABLE" (67/67 plot options), no as-of dates; possession text without dates | **High** | Developer-supplied, dated availability, or neutral wording (Property Authority P3/P5) |
| T13 | RERA project numbers | Shown as "VERIFIED" (internal status, 2026-10-12) | Medium | Add a link to each official project page and show the verification date |
| T14 | Photos | Image provenance not recorded | Medium | Record source (developer/own photography) per image; project rule forbids AI/stock |
| T15 | Social proof elsewhere | No third-party reviews or profiles found; header/footer social links are `#` | Medium | Build genuine, consented reviews over time; link only real profiles |
| T16 | Dates and sources | ✅ Articles show published/updated/review dates and source blocks | — | Add specific citations (act/rule/notification, URL, access date) as in the Editorial plan |
| T17 | Grievance | ✅ Privacy Policy ("Privacy Compliance Officer & Grievance Contact") and Terms ("Advisory Desk & Grievance Redressal") | — | Ensure the contact named is current; consider a short "Complaints" link in the footer |
| T18 | Disclaimers | ✅ Disclaimer, Terms and Privacy pages exist | — | Add an "informational, not legal advice" line to every legal article |

## 3. Quick, low-risk trust fixes (if approved)
1. Remove the loans sentence (T5) and the "Direct Landowner Pricing" claim (T6).
2. Remove or evidence the reviewer credential (T3).
3. Align hours (T10) and remove `#` social icons until real profiles exist (T15).
4. Add the official RERA link and last-checked date to each project page (T13).

## 4. What I did not and could not check
Authenticity of any client, reviewer, or engagement; the real existence of "Advocate R. Sharma"; legal entity status (MCA/GST); the RERA registry; image provenance; whether the "Complaints" contact named is monitored. These need the owner's records.

# Phase 5A — Local SEO Audit & Verified Business Presence

**Date:** 2026-11-11 · **Stage:** 5A (research and audit only — **no code, data, schema or third-party changes were made**)
**Skill framework:** local SEO analysis (GBP, reviews, on-page, NAP/citations, schema, authority) · **Business type detected:** hybrid-leaning **appointment-based advisory / service-area business** (no street address published; "private consultations by appointment")

## How to read this report

| Tag | Meaning |
|---|---|
| ✅ **VERIFIED** | Observed directly in the repository, the database (read-only), the live production site, or a primary source fetched today. Source shown. |
| 💡 **RECOMMENDATION** | My proposal. Not a fact and not yet approved. |
| ⛔ **UNAVAILABLE** | Could not be checked (no access / tool limits). Treated as unknown, never as "fine" or "missing". |

Source register: **S1** Google Business Profile guidelines (primary, fetched 2026-11-11) · **S2** Google spam policies (primary, fetched 2026-11-11) · **S3** MahaRERA portal (primary, fetched 2026-11-11, menu only) · **S4** Rajasthan RERA portal (fetch returned an empty page — **not verified**) · **S5** web searches 2026-11-11 (secondary; URLs in the Final Recommendations report) · **S6** production site `www.ratiwaldreamestates.com` (public GETs, 2026-11-11) · **S7** repository + MongoDB (read-only, 2026-11-11).

---

## 1. Verified business presence

| Item | Finding | Tag / source |
|---|---|---|
| Public brand name | "Ratiwal Dream Estates" — consistent on site, schema, titles | ✅ S6, S7 |
| Phone | `+91-9929533436` on site, schema, WhatsApp link | ✅ S6 |
| Email | `sureshkumawat6917@gmail.com` (a personal Gmail address used as the business email, per project rules) | ✅ S6 · 💡 a domain email would look more established, but only if the owner actually uses one |
| **Physical address** | **Only "Jaipur, Rajasthan, India."** No street, no PIN, anywhere on the public site or schema. `/contact` says "Private consultations by appointment." | ✅ S6 |
| Opening hours (visible `/contact`) | **Mon–Sat, 10:00 AM – 7:00 PM IST** | ✅ S6 |
| Opening hours (JSON-LD schema) | **7 days a week, 10:00–19:00** — conflicts with the visible Mon–Sat | ✅ S6 |
| Opening hours (database settings record) | Mon–Sat **09:00**–19:00 — a third variant | ✅ S7 |
| Advisor registration | "Suresh Kumawat (alias Suresh Ratiwal), RERA agent no. RAJ/A/2019/983" in schema and site | ✅ present on site · ⛔ **not checked against the official registry** (S4 returned an empty page) |
| Schema type | `RealEstateAgent` + `Organization` with `areaServed`: Jaipur, Rajasthan, **Navi Mumbai / Panvel, Maharashtra**; `sameAs: []`; no `geo`; no `aggregateRating` | ✅ S6 |
| Social profiles | Header/footer social links are `#` placeholders; production HTML contains no social links; schema `sameAs` is empty | ✅ S6, S7 |
| Third-party web presence | Five searches (brand name, domain, brand + portal names) returned **no result** about the business | ✅ searches run · **inconclusive**: the search tool is US-centric and does not index Google Maps, JustDial or social platforms well |

### Conflicting business record in the database ⚠️
The `OrganizationSettings` document (version 7, last updated by an account named `test-super-admin-001`) contains values that **do not match the verified public record** and look like test data: a "Private Limited" legal name, a "Ratiwal Towers, Tonk Road, Jaipur 302015" address, a CIN-format registration number, a GST-format number, the placeholder phone Phase 3A already removed from code, a `support@` email on the business domain, a non-www website URL, four social URLs, and Mon–Sat 09:00–19:00 hours.
- ✅ Public pages do **not** read this record today (only dashboard code does), so nothing from it leaks to visitors.
- ⚠️ It must **not** be used as a source of truth for GBP, citations or schema until the owner confirms each value. I have deliberately not reproduced the registration/tax identifiers in this report.
- 💡 Owner to confirm which values (if any) are real; then correct or clear the record (a database write — needs approval).

---

## 2. Location classification (against actual records)

Earlier phases (Phase 3) labelled Bhiwadi, Navi Mumbai and Panvel "Active Service Area". **The evidence does not support that label.** Evidence found for each market:

| Location | Published projects (DB) | Other evidence of business activity | Page depth (production) | **Classification (this audit)** |
|---|---|---|---|---|
| **Jaipur** | 4 (Neelkanth Nagar, Riyasat Paradise II, Bhumija Green Block A, Riyasat Heritage Extension) | 2 static testimonials, 2 static case studies | rich: 3 micro-markets, 4 infra, 4 connectivity, 4 buyer considerations, 3 FAQs | **1 — Active Inventory** |
| **Ajmer** | 3 (Happy Business Park, Balaji Puram, Vrindavan Viihaar) | 1 testimonial, 1 case study | 2 micro-markets, 3 infra, 4 connectivity, 2 FAQs | **1 — Active Inventory** |
| **Kishangarh** | 2 (Aero Crystal, One Kishangarh) | none | **thin record**: 0 micro-markets, 0 infra, 0 connectivity, 0 FAQs, **no hero image**; ~818 words vs Navi Mumbai ~1,522 | **1 — Active Inventory** (but the page is the weakest of the six) |
| **Bhiwadi** | **0** | 1 static testimonial ("Industrial Facility Investor"); no case study of its own (the "logistics" case study is titled *Jaipur Ring Road* and is mapped to Jaipur, yet uses a Bhiwadi hero image) | 2 micro-markets, 3 infra, 4 connectivity, 2 FAQs | **3 — Limited Business Presence** (pending evidence) |
| **Navi Mumbai** | **0** | 1 testimonial ("Verified NRI Investor") + 1 case study | 2 micro-markets, 4 infra, 4 connectivity, 3 FAQs | **3 — Limited Business Presence** (pending evidence + compliance check, §5) |
| **Panvel** | **0** | shares the Navi Mumbai testimonial/case study | 2 micro-markets, 3 infra, 4 connectivity, 2 FAQs | **3 — Limited Business Presence** (pending evidence + compliance check, §5) |

Notes:
- ✅ "Active Inventory" here means *a published, RERA-recorded project exists in the database*. It does **not** prove current plot availability (see Property Authority report).
- ✅ No location qualifies as **2 — Verified Service Area**, because the only support for the three advisory markets is static, unverifiable testimonial text (no client record, engagement record or consent evidence is stored anywhere; the CMS testimonial table has 0 rows).
- ✅ One extra database record, `jaipur-expressway`, exists in **DRAFT** status with no content — a leftover to clean up (not public).
- 💡 Reclassify only when the owner supplies evidence (see §6). Until then, treat Bhiwadi / Navi Mumbai / Panvel as **category 3**, and do not create any additional location pages or profiles for them.

## 3. Google Business Profile (GBP)

| Check | Result |
|---|---|
| Authorised GBP access | ⛔ **None.** No API credentials, no Manager access. Nothing about an existing profile (name, categories, description, photos, reviews, hours, services, completeness) could be audited |
| Evidence a profile exists | ⛔ unknown. The site contains a Google Maps link on `/contact`, but no place ID or review widget was identified. Searches found nothing (inconclusive) |
| Duplicate-profile risk | ⛔ unknown. **Do not create a new profile until the owner confirms none exists** (search Google Maps for the phone number and brand name while logged into the owning Google account) |

**Eligibility rules that apply (✅ S1, fetched today, quoted briefly):**
- "Use a precise, accurate address and/or service area." A **virtual office** or rented mailing address where the business doesn't operate is "not eligible for a Business Profile."
- A **service-area business** should "hide your business address"; service areas shouldn't extend "farther than about 2 hours of driving time" unless larger areas are appropriate; a co-working address is only allowed with clear signage, customers received on site, and staff present during hours.
- "Do not create more than one page for each location of your business."
- **Real estate agents** are listed as individual practitioners; a practitioner profile requires a public-facing role and being "contacted directly at the verified location during stated hours." **"Sales associates or lead generation agents for corporations aren't individual practitioners and aren't eligible."**
- Business name must match the real-world name "as used consistently on your storefront, website, stationery"; no taglines, hours, phone numbers or location text in the name.

**Consequences for Ratiwal Dream Estates (💡 recommendations, pending owner answers):**
1. **Only one profile is plausible, in Jaipur,** and only if the owner has a real, staffed location (an office that receives customers during stated hours) **or** operates as a service-area business that hides its address. The site currently publishes neither a street address nor a staffed-office claim.
2. **No profile for Ajmer, Kishangarh, Bhiwadi, Navi Mumbai or Panvel** unless a staffed physical office exists there. Serving a market ≠ having an eligible location. Navi Mumbai/Panvel are far beyond a 2-hour service radius from Jaipur.
3. Profile name: exactly "Ratiwal Dream Estates" (no keywords such as "Plots in Jaipur").
4. Reviews: ask genuine clients to review in their own words; never offer incentives, gate, buy, or write reviews (Google's review-policy page was not fetched in this phase — confirm wording before drafting a request template).
5. Do **not** add `geo` coordinates or a street address to schema unless they match a real, verified location.

## 4. Local on-page, schema and consistency

| Area | Finding | Tag |
|---|---|---|
| Titles / H1 (local intent) | Homepage "Real Estate Consultant in Jaipur"; location pages carry city names; titles ≤ 60 chars; heading hierarchy fixed in the previous session (0 skips on 39 URLs) | ✅ S6 |
| NAP on page | Name + phone + email visible; **address is city-level only** | ✅ S6 |
| Click-to-call | `tel:` links in header/footer/contact components | ✅ S7 |
| Map | Google Maps link on `/contact` | ✅ S6 |
| Location pages vs doorway policy | Each of the six has distinct, non-swappable content (different authorities, corridors, micro-markets). Risk is highest for the three zero-inventory pages and for thin **Kishangarh**. S2 defines doorway abuse as pages "created to rank for specific, similar search queries" that "funnel" users, and lists "multiple... pages targeted at specific regions or cities that funnel users to one page" | ✅ S2, S6 |
| Schema | Valid, but: hours conflict with the visible hours; `areaServed` claims Maharashtra; `sameAs` empty; correctly no fake ratings | ✅ S6 |
| Social proof | No review count/rating published (correct, none verifiable) | ✅ S6 |

## 5. Maharashtra compliance question (needs the owner)

The site advertises Navi Mumbai/Panvel service (schema `areaServed`, location pages, a NAINA case study), while the only registration shown is a **Rajasthan** agent number. Secondary sources (S5) report that **MahaRERA agent registration** (plus a competency certificate since 2024) is mandatory for agents operating in Maharashtra, and the official portal (✅ S3) has agent registration, training/exam, and "Registered Agents" / "Deregistered" lists. **I could not read the primary rules text** (only menu structure), so this is a question, not a finding:
> 💡 **Owner to confirm:** is the advisor/firm registered with MahaRERA, or are Maharashtra pages informational only? If neither, advertising Maharashtra brokerage in schema and pages carries compliance and trust risk and should be reworded or withdrawn (needs legal advice and approval).

## 6. Evidence the owner can supply to unlock reclassification

For each of Bhiwadi / Navi Mumbai / Panvel: (a) engagement or mandate records (can be anonymised: month, type, outcome) proving real advisory work; (b) the registration status that permits it in that state; (c) written client consent (with date) for any testimonial/case study; (d) whether any physical presence exists. Without these, keep them at category 3 with explicit "advisory information only — no listings" wording.

## 7. Dimension summary (not scored numerically)

I am not giving a 0–100 score: GBP, reviews, and backlinks — roughly half the weight in a local score — were not assessable, so a number would be misleading.

| Dimension | Status |
|---|---|
| GBP signals | ⛔ unavailable |
| Reviews & reputation | ⛔ unavailable (no verifiable reviews found; none published on site) |
| Local on-page SEO | 🟢 good (clean titles/H1/structure) with a thin Kishangarh page and unproven service areas |
| NAP & citations | 🟡 partial: consistent phone/email/brand; vague address; hours conflict (3 variants); no third-party citations found |
| Local schema | 🟡 partial (valid; hours conflict; unverified `areaServed`; no `sameAs`) |
| Authority/links | ⛔ unavailable (no backlink data) |

## 8. Prioritised actions (all need owner approval before any change)

| # | Priority | Action | Effort |
|---|---|---|---|
| 1 | Critical | Owner confirms: real staffed address vs service-area model; whether a GBP already exists; Maharashtra registration status | 1 h |
| 2 | High | Correct the conflicting hours: one source of truth (visible Mon–Sat 10–19 vs schema 7 days) | 0.5 h code |
| 3 | High | Review / clear the test-data `OrganizationSettings` record | 0.5 h |
| 4 | High | Replace `#` social placeholders with real profile URLs, or remove them; fill `sameAs` only with real profiles | 0.5 h |
| 5 | High | Decide the Bhiwadi / Navi Mumbai / Panvel wording once evidence exists (or noindex/consolidate if it cannot be supplied) | 2–4 h |
| 6 | Medium | Strengthen **Kishangarh** (micro-markets, infrastructure, FAQs, hero image) using sourced facts only | 4–6 h |
| 7 | Medium | Create/claim GBP only after #1 and only for an eligible Jaipur location; also Bing Places and Apple Business listings | 2 h |
| 8 | Medium | Fix the case-study hero image mismatch (Jaipur Ring Road study uses a Bhiwadi image) | 0.5 h |

## 9. Limitations
Not assessed: live local-pack position, geo-grid rankings, GBP Insights, review counts/velocity, domain authority, and comprehensive backlinks (all need GBP access or paid tools). The search tool used for citation discovery is not a substitute for manual checks on Google Maps, JustDial and social platforms.

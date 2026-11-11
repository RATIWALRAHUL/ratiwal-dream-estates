# Phase 7 (7A) — Buyer Journey Audit

**Date:** 2026-11-11 · audit only. **No application code, form, event, UI or CRM change was made.** Evidence: **E-code** (repository), **E-probe** (read-only HTTP against a local production build), **E-db** (read-only database counts). **No drop-off percentages are stated: there is no conversion analytics.** The only analytics on the site is Vercel page-view Analytics; GA4, event tracking and click tracking do not exist (verified by code search), and the database holds **8 leads in total (7 from the contact page, 1 direct, 0 from a property page)** — far too few to infer behaviour.

## 1. Conversion touchpoints that exist today
| Touchpoint | Where | Outcome | Persisted? |
|---|---|---|---|
| Inquiry form (`EnquiryForm`) | property page (modal), home FAQ section, contact hub | `POST /api/enquiries` → `Lead` | ✅ database |
| Site-visit form (`SiteVisitForm`) | property page (modal), contact hub tab | `POST /api/site-visits/requests` → `Lead` (found/created by phone) + `SiteVisit` | ✅ database |
| Embedded site-visit panel (`EmbeddedSiteVisit`) | property page body | same site-visit endpoint | ✅ database |
| WhatsApp deep link | floating button (all marketing pages), property sticky card, mobile action bar, property cards, insight CTA, footer, chat widget | opens `wa.me` with pre-filled text | ❌ nothing recorded unless the visitor sends a message in WhatsApp |
| Phone link (`tel:`) | **footer and the contact-page components only** — none in the header and none on property pages (the sticky card's "Dedicated Advisory Desk" block shows a phone icon but is not a link) | opens dialer | ❌ nothing recorded |
| Chat widget (AI assistant) | all marketing pages (lazy) | conversation | not audited here |

## 2. The four journeys

### Journey 1 — Organic visitor: Google → landing page → listing → property → inquiry
| Step | Facts (E-code/E-probe) | Friction / gaps |
|---|---|---|
| Entry | Landing pages are prerendered with correct metadata; the site has no Search Console data connected | Which pages actually receive organic visits is unknown |
| Intent | Informational (guides) or commercial (locations/projects) — varies by landing page | no intent tagging |
| Landing page → listing | Location and guide pages link to projects; the catalogue is reachable from the header | Kishangarh and Panvel pages have **one** inbound link; the two newest legal guides are weakly linked (Phase 6 V7) |
| Listing | Catalogue with search/city/type filters and cards; each card links to the project and carries a WhatsApp action | Filters not in URL; "status" filter is a no-op (all "Available"); no plot-size filter; every project shows "Price on request" |
| Property detail | Overview, plot-size table, amenities, documents/RERA status, masterplan, map, FAQ, related projects, three CTAs | Decision-critical facts missing or generic: price, dated availability, developer relationship, loan claim unevidenced (Phase 5) |
| Inquiry | Sticky card → modal form; mobile bar has WhatsApp + Site Visit only | No call button anywhere on property pages; the floating WhatsApp button is hidden only on `/contact`, so on mobile property pages it is `fixed bottom-4 right-4 z-40` over the `fixed bottom-0 z-40` action bar — **likely covers the bar's buttons (verified from CSS/code; not confirmed visually on a device)** |
| Conversion event | `Lead` created with `source`, `landingPath` (= the page where the form was submitted, **not** the first landing page), no UTM/referrer captured by the form | Organic attribution not possible |
| Missing analytics | everything except page views | see Event Specification |

### Journey 2 — Direct property visitor: property URL → details → WhatsApp / phone / form → lead
- Strengths: three channels on one screen (WhatsApp, site visit, enquiry); WhatsApp text is pre-filled with the project name; forms work without account.
- Friction: WhatsApp is the lowest-friction channel on mobile but **leaves no record**; there is **no tap-to-call on property pages**, so their volume and quality are invisible; the inquiry form requires **name, phone and email** (email is mandatory server-side); the site-visit form asks for a date but **ignores the chosen time** (always 11:00 IST — see Inquiry audit).
- Conversion event: form → lead (stored); WhatsApp/phone → none.

### Journey 3 — Location visitor: location page → relevant inventory → property → site visit
- Location pages list their projects (`LocationPropertyGrid`, `ItemList` schema); Jaipur 4 / Ajmer 3 / Kishangarh 2; Bhiwadi, Navi Mumbai and Panvel show **no inventory** (advisory pages).
- Friction: for the three zero-inventory pages the only conversion path is a general inquiry/site-visit request for "All Ratiwal Projects" — with no projects there, the CTA's promise is unclear (and Phase 5 flags the evidence/compliance question).
- Phase 3C's suggested location-page trust box and cross-linked case studies are **not** implemented: each case study has a single inbound link.

### Journey 4 — Investment researcher: guide → contextual property link → property → inquiry
- Each of the eight guides links to one location page and one project (e.g., Section 90-A guide → Jaipur + Neelkanth Nagar), and ends with a WhatsApp/"view properties" CTA (`InsightFinalCTA`).
- Friction: only one contextual project per guide; no inline inquiry/checklist offer; guides contain legal claims under review (Phase 5), which affects trust at exactly the step where readers decide to contact.
- Conversion event: none tracked from the guide, so "which guide produces leads" is unknowable.

## 3. Cross-journey observations
| # | Observation | Evidence |
|---|---|---|
| J1 | **Most mobile intent will go through WhatsApp/phone, and none of it is measured** | no tracking code; only forms create records |
| J2 | Lead records carry the *form* page, not the *first* page or marketing source | `EnquiryForm` sends `landingPath: currentPath`; UTM/referrer fields exist in the schema but nothing populates them |
| J3 | Trust information needed at decision time is thin: no price, no dated availability, relationship to developers unstated, unproven loans line | Phase 5 P1–P5 |
| J4 | Dashboard funnel analytics already exist (`/dashboard/analytics/funnel`) but have almost no data (8 leads) | E-db |
| J5 | Zero-inventory location pages have no honest primary CTA | Journey 3 |

## 4. What cannot be said
No conversion rate, drop-off percentage, device split, channel share, or time-to-inquiry can be stated — none is measured. Phase 7's event specification defines what to measure; the GA4 install and consent design (Phase 4A decision D5) remain unapproved.

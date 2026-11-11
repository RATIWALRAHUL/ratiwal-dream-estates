# Phase 7 (7D) — Conversion UX Audit

**Date:** 2026-11-11 · audit only; **no UI was changed.** Method: code and CSS review of the property detail page and its CTAs plus raw-HTML probes. **No browser/device run, usability test, session recording or analytics was available**, so every item is labelled *verified from code* or *hypothesis to test*. The brand identity, colours, typography and layout language are to be preserved; none of the items below requires a redesign, and none uses popups, fake urgency, scarcity or invented testimonials.

## 1. Property detail page — what is on the page (E-code)
Hero/gallery → quick facts → overview → plot-options table → amenities → documents/RERA status → masterplan → connectivity → map → FAQ → embedded site-visit panel → related projects. Sticky desktop card (price label, WhatsApp, Schedule Site Visit, Send Enquiry, "Dedicated Advisory Desk") and, on mobile, a fixed bottom bar (price label + WhatsApp icon + "Site Visit"). Modals host `EnquiryForm` and `SiteVisitForm`.

## 2. Findings
| ID | Severity | Finding | Basis | Suggested change (approval required) |
|---|---|---|---|---|
| U1 | **High** | **Floating WhatsApp button overlays the mobile action bar.** The floating button is hidden only on `/contact`; on property pages it renders `fixed bottom-4 right-4 z-40` over a `fixed bottom-0 z-40 lg:hidden` bar, i.e., on top of the WhatsApp/"Site Visit" controls | verified from code/CSS; **visual overlap not confirmed on a device** | hide the floating button on property pages (the bar already offers WhatsApp) or offset it above the bar; confirm on real phones |
| U2 | High | **No tap-to-call on property pages** (no `tel:` link in the sticky card, mobile bar or header; the "Dedicated Advisory Desk" block shows a phone icon and promises "speak directly" but is plain text) | verified from code | add a visible "Call advisor" action (`tel:+919929533436`) to the sticky card and, space permitting, the mobile bar |
| U3 | Medium | **Price labels contradict the content:** mobile bar says "Starting Price" and the sticky card "Indicative Investment" while the value is "Price on Request" for every project | verified (labels vs `priceLabel`) | when no price exists, label it "Price" / "Pricing" and show "Request pricing" as the CTA; never imply a figure |
| U4 | Medium | Generic trust claims repeated on every project: "Verified Listing", "Clear Freehold Title • Registry Ready", and a loan/bank claim in data (Phase 5) | verified | replace with project-specific, dated, evidenced facts: RERA number + official link, last-verified date, document list (data already exists) |
| U5 | Medium | **Decision information is thin at the moment of contact:** no price, no dated availability, relationship to the developer unstated | Phase 5 P2–P5 | show "Availability confirmed on <date>" only when sourced; state the advisor/developer relationship; keep "price on request" honest |
| U6 | Medium | **Three different site-visit UIs** (modal, embedded panel, contact tab) with different payload code; the time choice is ignored (Inquiry audit F2) | verified | one shared component/payload; fix time handling before promoting the CTA |
| U7 | Medium | **Form friction:** email mandatory on both forms; budget/type/location fields on the inquiry form; no consent control | verified | name + phone (+ optional email); consent checkbox; experiment on field count (E3) |
| U8 | Medium | Zero-inventory location pages (Bhiwadi, Navi Mumbai, Panvel) have no honest primary CTA | verified; Phase 5 | advisory-specific CTA ("Ask about this market") only once evidence/registration is settled; otherwise noindex/merge |
| U9 | Medium | Trust assets are not near the CTA: case studies have one inbound link each; documents/RERA block sits mid-page | verified (links), hypothesis (placement) | surface a compact "Documents & RERA" summary beside the sticky card; link relevant case studies from location pages |
| U10 | Low | Icon-only WhatsApp button in the mobile bar (40 px) — has `aria-label`; the hit target is below common 44 px guidance | verified from classes | enlarge to ≥ 44 px, add a text label if space allows |
| U11 | Low | Catalogue: no plot-size filter, no URL state, no-op status filter (Phase 6 D1–D3) | verified | see Property Search Audit |
| U12 | Low | Gallery: 2–4 images per project (Riyasat Paradise II has 2); image provenance not recorded | verified (counts) | add genuine images when available (project rules: no AI/stock) |
| U13 | Info | Positive: forms use native input types, field-level errors, a loading state, success state with reference, inline WhatsApp pre-fill with the project name; modals keep values on error | verified | keep |

## 3. Evidence-based priorities
1. **Fix U1/U2/U6** — they are defects or missing basics, not experiments. They can be shipped without A/B tests (ship, then monitor lead volume per channel once events exist).
2. **U3/U4/U5** are honesty fixes that also raise trust; they depend on owner/developer evidence (Phase 5).
3. **U7, U9, U10** are good experiment candidates (see the CRO plan) *only if traffic supports it* — currently it does not.

## 4. Mobile verification plan (not yet done)
Test property page on a 360 × 640 and a 390 × 844 viewport and on a real Android/iPhone: FAB vs bar overlap, bar height vs content bottom padding (is the last section hidden behind the bar?), modal scrolling with the on-screen keyboard, date picker, and tap-target sizes; record with screenshots. Estimated 0.5 day.

## 5. Constraints reaffirmed
No intrusive popups, no fake urgency/scarcity, no fabricated testimonials or "x people viewing" counters; no change to brand look; page performance must not regress (new CTAs are server-rendered links; avoid extra client JS).

# SEO Phase 2 — Metadata Changelog

**Date:** 2026-11-06

> **Correction (2026-11-06):** an earlier version of this file listed property and location descriptions with letters missing ("re idential", "Riya at Paradi e II"). That text really was being rendered by the site, because of a one-character regex bug in `pickFittingText` (`/s+/g` instead of `/\s+/g`). It is fixed, and every "After" value below was regenerated from a **fresh production build** and verified. Details: `SEO_PHASE_2_FINAL_CORRECTION_REPORT.md`.
>
> **JSON-LD scope:** the `/properties` page's `CollectionPage` JSON-LD `name` and `description` were changed to match the new metadata (see section 9). No schema generator was modified.

**Rule followed:** only `<head>` metadata and essential technical tags were changed. No visible heading, paragraph, FAQ, description, layout or style was edited (see the Validation Report for the page-by-page comparison and its three explained exceptions).

## 1. How titles and descriptions are now produced

| Page group | Source of the copy |
|---|---|
| `/`, `/properties`, `/locations` | Built from the **saved Location records** in MongoDB (`src/lib/seo-copy.ts`). Locations are ranked by how many published properties they hold (Jaipur 4, Ajmer 3, Kishangarh 2, the rest 0; ties keep dashboard order), so the main market comes first. Titles name up to 3 locations then "& More", chosen so the **full title stays ≤ 60 characters**; descriptions name as many locations as fit in 160 characters. Adding, editing or unpublishing a location in the dashboard changes this copy automatically. |
| `/locations/[slug]` | Location name and state from the `Location` record. Uses shorter *complete* wording instead of truncating. |
| `/properties/[slug]` | Property name, locality, city, type, the min–max plot size computed from that property's own `plotSizes`, and its real price label. Nothing invented. |
| about, contact, investment, why-choose-us, testimonials, insights, privacy, terms | Hand-written from each page's existing content. |
| `/insights/[slug]`, `/testimonials/[slug]` | New optional **SEO-only** fields `metaTitle` / `metaDescription` on each article and case study (never rendered on the page). They fall back to the old title / excerpt if absent. |

Titles end with " | Ratiwal Dream Estates" (23 characters, appended by `getMetadata`), so the page-specific part is ≤ 37 characters.

## 2. Title and description, before → after (changed: 36 of 37 public routes)

### `/`

- **Title** (79 → 56)
  - Before: Real Estate Consultant in Ajmer, Bhiwadi, Jaipur & More | Ratiwal Dream Estates
  - After: Real Estate Consultant in Jaipur | Ratiwal Dream Estates
- **Description** (164 → 160)
  - Before: Verified residential & commercial plots in Ajmer, Bhiwadi, Jaipur, Kishangarh, Navi Mumbai & Panvel with Ratiwal Dream Estates, your trusted real estate consultant.
  - After: Real estate consultant for plots in Jaipur, Ajmer, Kishangarh & More. Verified land, clear documentation and accompanied site visits with Ratiwal Dream Estates.

### `/properties`

- **Title** (96 → 55)
  - Before: Residential & Commercial Plots for Sale in Ajmer, Bhiwadi, Jaipur & More | Ratiwal Dream Estates
  - After: Plots for Sale in Jaipur & More | Ratiwal Dream Estates
- **Description** (171 → 157)
  - Before: Explore our vetted collection of residential & commercial plots in Ajmer, Bhiwadi, Jaipur, Kishangarh, Navi Mumbai & Panvel. 100% verified titles with full legal dossiers.
  - After: Residential and commercial plots for sale in Jaipur, Ajmer, Kishangarh, Bhiwadi & More. Compare plot sizes in Sq. Yds and Sq. Ft, price status and documents.

### `/locations`

- **Title** (75 → 59)
  - Before: Property Locations in Ajmer, Bhiwadi, Jaipur & More | Ratiwal Dream Estates
  - After: Property Locations in Jaipur & More | Ratiwal Dream Estates
- **Description** (194 → 154)
  - Before: Explore Ratiwal Dream Estates property locations in Ajmer, Bhiwadi, Jaipur, Kishangarh, Navi Mumbai & Panvel: micro-markets, infrastructure context, and available residential & commercial plots.
  - After: Explore property locations in Jaipur, Ajmer, Kishangarh, Bhiwadi & More: micro-markets, infrastructure, connectivity and buyer guidance from our advisors.

### `/investment`

- **Title** (83 → 58)
  - Before: Investment Strategy — Capital Allocation & Growth Corridors | Ratiwal Dream Estates
  - After: Land Investment & Growth Corridors | Ratiwal Dream Estates
- **Description** (182 → 152)
  - Before: Discover Ratiwal Dream Estates' institutional land investment thesis. Model land ROI, explore high-velocity growth corridors in Jaipur & Navi Mumbai, and access 100% verified titles.
  - After: Understand land investment with Ratiwal Dream Estates: model returns, compare growth corridors in Jaipur and Navi Mumbai, and review title verification.

### `/about`

- **Title** (79 → 55)
  - Before: About Us — Lifelong Property Consultancy Built on Trust | Ratiwal Dream Estates
  - After: About Us — Property Consultancy | Ratiwal Dream Estates
- **Description** (191 → 144)
  - Before: Learn about Ratiwal Dream Estates, our founding principles, our 6-stage land verification protocol, and our fiduciary commitment to transparent property advisory in Rajasthan and Maharashtra.
  - After: Meet Ratiwal Dream Estates, a Jaipur-based property consultancy. Learn our land verification process and how we guide plot buyers and investors.

### `/why-choose-us`

- **Title** (85 → 57)
  - Before: Why Choose Ratiwal Dream Estates | Verified Property Advisory | Ratiwal Dream Estates
  - After: Why Choose Us — Verified Advisory | Ratiwal Dream Estates

### `/testimonials`

- **Title** (61 → 53)
  - Before: Client Stories & Property Experiences | Ratiwal Dream Estates
  - After: Client Stories & Case Studies | Ratiwal Dream Estates
- **Description** (95 → 139)
  - Before: Read verified client experiences and property advisory case studies from Ratiwal Dream Estates.
  - After: Read client experiences and property advisory case studies from Ratiwal Dream Estates, covering plot buying, due diligence and site visits.

### `/insights`

- **Title** (74 → 57)
  - Before: Property Insights, Buying Guides & Market Research | Ratiwal Dream Estates
  - After: Property Insights & Buying Guides | Ratiwal Dream Estates

### `/contact`

- **Title** (72 → 59)
  - Before: Contact Us — Private Land Advisory & Site Visits | Ratiwal Dream Estates
  - After: Contact Us — Site Visits & Advisory | Ratiwal Dream Estates
- **Description** (162 → 148)
  - Before: Schedule a 1-on-1 land consultation with Ratiwal Dream Estates advisors in Jaipur, arrange an accompanied on-ground site inspection, or chat directly on WhatsApp.
  - After: Schedule a land consultation with Ratiwal Dream Estates advisors in Jaipur, arrange an accompanied site visit, or chat with us directly on WhatsApp.

### `/privacy-policy`

- **Description** (176 → 151)
  - Before: Learn how Ratiwal Dream Estates protects your personal information, manages property inquiries, handles WhatsApp communications, and maintains strict confidentiality standards.
  - After: How Ratiwal Dream Estates protects your personal information, handles property inquiries and WhatsApp communications, and keeps your data confidential.

### `/terms-of-service`

- **Description** (184 → 150)
  - Before: Review the terms and conditions governing your use of the Ratiwal Dream Estates real-estate advisory portal, property inquiries, consultation services, and corridor intelligence tools.
  - After: Terms and conditions for using the Ratiwal Dream Estates website, including property inquiries, consultation services and corridor intelligence tools.

### `/properties/neelkanth-nagar`

- **Description** (283 → 147)
  - Before: Explore verified property information, plot sizes (100 Sq. Yds, 111 Sq. Yds, 111.11 Sq. Yds, 125 Sq. Yds, 133 Sq. Yds, 150 Sq. Yds, 200 Sq. Yds, 250 Sq. Yds), pricing status (Price on Request), connectivity, documents, and site-visit options for Neelkanth Nagar in Jaipur, Rajasthan.
  - After: Neelkanth Nagar in Chaksu, Jaipur: residential plots from 100 to 250 Sq. Yds. Price on Request. View documents, connectivity and book a site visit.

### `/properties/riyasat-paradise-ii`

- **Description** (274 → 151)
  - Before: Explore verified property information, plot sizes (100 Sq. Yds, 111.11 Sq. Yds, 120 Sq. Yds, 150 Sq. Yds, 180 Sq. Yds, 250 Sq. Yds, 200 Sq. Yds), pricing status (Price on Request), connectivity, documents, and site-visit options for Riyasat Paradise II in Jaipur, Rajasthan.
  - After: Riyasat Paradise II in Vatika, Jaipur: residential plots from 100 to 250 Sq. Yds. Price on Request. View documents, connectivity and book a site visit.

### `/properties/bhumija-green-block-a`

- **Description** (295 → 160)
  - Before: Explore verified property information, plot sizes (100 Sq. Yds, 111 Sq. Yds, 111.11 Sq. Yds, 125 Sq. Yds, 150 Sq. Yds, 200 Sq. Yds, 277.78 Sq. Yds, 523.22 Sq. Yds), pricing status (Price on Request), connectivity, documents, and site-visit options for Bhumija Green Block A in Jaipur, Rajasthan.
  - After: Bhumija Green Block A in Sikar Road, Jaipur: residential plots from 100 to 523.22 Sq. Yds. Price on Request. View documents, connectivity and book a site visit.

### `/properties/riyasat-heritage-extension`

- **Description** (281 → 156)
  - Before: Explore verified property information, plot sizes (100 Sq. Yds, 111.11 Sq. Yds, 150 Sq. Yds, 135 Sq. Yds, 200 Sq. Yds, 450 Sq. Yds, 500 Sq. Yds), pricing status (Price on Request), connectivity, documents, and site-visit options for Riyasat Heritage Extension in Jaipur, Rajasthan.
  - After: Riyasat Heritage Extension in Salagrampura–Dahar, Jaipur: residential plots from 100 to 500 Sq. Yds. Price on Request. View documents and book a site visit.

### `/properties/happy-business-park`

- **Description** (244 → 150)
  - Before: Explore verified property information, plot sizes (106 Sq. Yds, 125 Sq. Yds, 150 Sq. Yds, 175 Sq. Yds, 200 Sq. Yds), pricing status (Price on Request), connectivity, documents, and site-visit options for Happy Business Park in Ajmer, Rajasthan.
  - After: Happy Business Park in Gagwana, Ajmer: commercial plots from 106 to 200 Sq. Yds. Price on Request. View documents, connectivity and book a site visit.

### `/properties/balaji-puram`

- **Description** (249 → 147)
  - Before: Explore verified property information, plot sizes (88 Sq. Yds, 100 Sq. Yds, 125 Sq. Yds, 150 Sq. Yds, 200 Sq. Yds, 120 Sq. Yds), pricing status (Price on Request), connectivity, documents, and site-visit options for Balaji Puram in Ajmer, Rajasthan.
  - After: Balaji Puram in Chandiyawas, Ajmer: residential plots from 88 to 200 Sq. Yds. Price on Request. View documents, connectivity and book a site visit.

### `/properties/vrindavan-viihaar`

- **Description** (242 → 149)
  - Before: Explore verified property information, plot sizes (100 Sq. Yds, 120 Sq. Yds, 150 Sq. Yds, 175 Sq. Yds, 200 Sq. Yds), pricing status (Price on Request), connectivity, documents, and site-visit options for Vrindavan Viihaar in Ajmer, Rajasthan.
  - After: Vrindavan Viihaar in Gagwana, Ajmer: residential plots from 100 to 200 Sq. Yds. Price on Request. View documents, connectivity and book a site visit.

### `/properties/aero-crystal`

- **Description** (242 → 154)
  - Before: Explore verified property information, plot sizes (100 Sq. Yds, 111 Sq. Yds, 125 Sq. Yds, 150 Sq. Yds, 200 Sq. Yds), pricing status (Price on Request), connectivity, documents, and site-visit options for Aero Crystal in Kishangarh, Rajasthan.
  - After: Aero Crystal in Kishangarh B, Kishangarh: residential plots from 100 to 200 Sq. Yds. Price on Request. View documents, connectivity and book a site visit.

### `/properties/one-kishangarh`

- **Title** (52 → 56)
  - Before: One Kishangarh in Kishangarh | Ratiwal Dream Estates
  - After: One Kishangarh — Commercial Plot | Ratiwal Dream Estates
- **Description** (239 → 151)
  - Before: Explore verified property information, plot sizes (150 Sq. Ft, 250 Sq. Ft, 500 Sq. Ft, 350 Sq. Ft, 750 Sq. Ft), pricing status (Price on Request), connectivity, documents, and site-visit options for One Kishangarh in Kishangarh, Rajasthan.
  - After: One Kishangarh in Madanganj, Kishangarh: commercial plots from 150 to 750 Sq. Ft. Price on Request. View documents, connectivity and book a site visit.

### `/locations/jaipur`

- **Title** (73 → 50)
  - Before: Residential & Commercial Plots for Sale in Jaipur | Ratiwal Dream Estates
  - After: Property & Plots in Jaipur | Ratiwal Dream Estates
- **Description** (138 → 154)
  - Before: Explore residential and commercial plots, micro-markets, infrastructure context, and buyer guidance for Jaipur with Ratiwal Dream Estates.
  - After: Explore residential and commercial plots, micro-markets, infrastructure, connectivity and buyer guidance for Jaipur, Rajasthan with Ratiwal Dream Estates.

### `/locations/navi-mumbai`

- **Title** (78 → 55)
  - Before: Residential & Commercial Plots for Sale in Navi Mumbai | Ratiwal Dream Estates
  - After: Property & Plots in Navi Mumbai | Ratiwal Dream Estates
- **Description** (143 → 134)
  - Before: Explore residential and commercial plots, micro-markets, infrastructure context, and buyer guidance for Navi Mumbai with Ratiwal Dream Estates.
  - After: Explore residential and commercial plots, micro-markets, infrastructure, connectivity and buyer guidance for Navi Mumbai, Maharashtra.

### `/locations/ajmer`

- **Title** (72 → 49)
  - Before: Residential & Commercial Plots for Sale in Ajmer | Ratiwal Dream Estates
  - After: Property & Plots in Ajmer | Ratiwal Dream Estates
- **Description** (137 → 153)
  - Before: Explore residential and commercial plots, micro-markets, infrastructure context, and buyer guidance for Ajmer with Ratiwal Dream Estates.
  - After: Explore residential and commercial plots, micro-markets, infrastructure, connectivity and buyer guidance for Ajmer, Rajasthan with Ratiwal Dream Estates.

### `/locations/panvel`

- **Title** (73 → 50)
  - Before: Residential & Commercial Plots for Sale in Panvel | Ratiwal Dream Estates
  - After: Property & Plots in Panvel | Ratiwal Dream Estates
- **Description** (138 → 156)
  - Before: Explore residential and commercial plots, micro-markets, infrastructure context, and buyer guidance for Panvel with Ratiwal Dream Estates.
  - After: Explore residential and commercial plots, micro-markets, infrastructure, connectivity and buyer guidance for Panvel, Maharashtra with Ratiwal Dream Estates.

### `/locations/bhiwadi`

- **Title** (74 → 51)
  - Before: Residential & Commercial Plots for Sale in Bhiwadi | Ratiwal Dream Estates
  - After: Property & Plots in Bhiwadi | Ratiwal Dream Estates
- **Description** (139 → 155)
  - Before: Explore residential and commercial plots, micro-markets, infrastructure context, and buyer guidance for Bhiwadi with Ratiwal Dream Estates.
  - After: Explore residential and commercial plots, micro-markets, infrastructure, connectivity and buyer guidance for Bhiwadi, Rajasthan with Ratiwal Dream Estates.

### `/locations/kishangarh`

- **Title** (77 → 54)
  - Before: Residential & Commercial Plots for Sale in Kishangarh | Ratiwal Dream Estates
  - After: Property & Plots in Kishangarh | Ratiwal Dream Estates
- **Description** (142 → 158)
  - Before: Explore residential and commercial plots, micro-markets, infrastructure context, and buyer guidance for Kishangarh with Ratiwal Dream Estates.
  - After: Explore residential and commercial plots, micro-markets, infrastructure, connectivity and buyer guidance for Kishangarh, Rajasthan with Ratiwal Dream Estates.

### `/testimonials/clarity-in-jda-patta-and-plot-shortlisting-jaipur`

- **Title** (93 → 57)
  - Before: Navigating JDA 90A Sanctions & Sectoral Plot Selection | Client Story | Ratiwal Dream Estates
  - After: JDA 90A Plot Selection Case Study | Ratiwal Dream Estates
- **Description** (189 → 149)
  - Before: A structured 45-day advisory engagement helping first-time plot buyers navigate complex revenue land conversions and secure a JDA-sanctioned residential plot with immediate mutation rights.
  - After: How first-time plot buyers navigated 90A land conversion and secured a JDA-sanctioned residential plot with immediate mutation, in a 45-day advisory.

### `/testimonials/remote-nri-due-diligence-panvel-naina-node`

- **Title** (97 → 57)
  - Before: Remote Due Diligence & NAINA Aerotropolis Land Acquisition | Client Story | Ratiwal Dream Estates
  - After: NRI Land Purchase in Panvel-NAINA | Ratiwal Dream Estates
- **Description** (185 → 147)
  - Before: Comprehensive end-to-end legal and technical advisory for an NRI investor acquiring high-growth plotted land in the Panvel-NAINA airport influence corridor without international travel.
  - After: How an NRI investor bought plotted land in the Panvel-NAINA airport influence corridor through remote due diligence, without travelling from Dubai.

### `/testimonials/commercial-logistics-land-banking-jaipur-ring-road`

- **Title** (95 → 60)
  - Before: Commercial Frontage & Heavy Freight Access Due Diligence | Client Story | Ratiwal Dream Estates
  - After: Ring Road Commercial Land Case Study | Ratiwal Dream Estates
- **Description** (152 → 148)
  - Before: Strategic acquisition of commercial land with 200ft direct Ring Road frontage, high-tension power sanction, and heavy vehicle turning radius clearances.
  - After: Case study: acquiring commercial land with 200ft Ring Road frontage, power sanction and heavy vehicle access checks for a logistics buyer in Jaipur.

### `/testimonials/scenic-retreat-villa-plot-ajmer-pushkar`

- **Title** (89 → 60)
  - Before: Scenic Foothill Verification & ADA Layout Scrutiny | Client Story | Ratiwal Dream Estates
  - After: Ajmer Pushkar Bypass Plot Case Study | Ratiwal Dream Estates
- **Description** (148 → 134)
  - Before: Guiding a family through Ajmer Development Authority (ADA) scheme scrutiny to acquire a scenic holiday home plot overlooking the Aravalli mountains.
  - After: How a family acquired a holiday-home plot on the Pushkar Bypass in Ajmer after ADA scheme, forest boundary and Jamabandi verification.

### `/insights/essential-guide-plot-buying`

- **Title** (80 → 55)
  - Before: The Comprehensive Land & Plot Buying Due Diligence Guide | Ratiwal Dream Estates
  - After: Plot Buying Due Diligence Guide | Ratiwal Dream Estates
- **Description** (185 → 150)
  - Before: A step-by-step masterplan for evaluating freehold plotted land, verifying statutory development sanctions, understanding conversion orders, and avoiding unapproved agricultural layouts.
  - After: Step-by-step due diligence for buying plotted land: check statutory sanctions, understand conversion orders and avoid unapproved agricultural layouts.

### `/insights/understanding-property-documentation`

- **Title** (83 → 59)
  - Before: Understanding Land Titles, 90A Sanctions & Revenue Extracts | Ratiwal Dream Estates
  - After: Land Titles, 90A & Revenue Extracts | Ratiwal Dream Estates
- **Description** (179 → 143)
  - Before: A comprehensive legal guide decoding Jamabandi (Parcha Khatauni), Khasra Milan maps, 7/12 extracts, title deeds, and municipal mutation protocols across Rajasthan and Maharashtra.
  - After: A legal guide to Jamabandi, Khasra Milan maps, 7/12 extracts, title deeds and mutation, explained for plot buyers in Rajasthan and Maharashtra.

### `/insights/rera-fundamentals-for-plot-buyers`

- **Title** (80 → 55)
  - Before: RERA Compliance & Buyer Safeguards for Plotted Townships | Ratiwal Dream Estates
  - After: RERA Safeguards for Plot Buyers | Ratiwal Dream Estates
- **Description** (168 → 143)
  - Before: How the Real Estate (Regulation and Development) Act protects plot buyers: escrow account rules, layout disclosure mandates, and statutory project completion timelines.
  - After: How the RERA Act protects plot buyers: escrow account rules, layout disclosure requirements and project completion timelines, explained simply.

### `/insights/site-visit-inspection-framework`

- **Title** (69 → 59)
  - Before: The On-Ground Plot & Land Inspection Protocol | Ratiwal Dream Estates
  - After: Plot Site Visit Inspection Protocol | Ratiwal Dream Estates
- **Description** (162 → 141)
  - Before: A practical engineering and legal protocol for evaluating physical access roads, natural drainage gradients, total station boundary pegs, and power line setbacks.
  - After: A practical protocol for inspecting a plot on site: access roads, natural drainage, boundary pegs and power line setbacks, before you commit.

### `/insights/evaluating-corridor-infrastructure-claims`

- **Title** (87 → 52)
  - Before: Auditing Masterplan & Infrastructure Claims in Growth Corridors | Ratiwal Dream Estates
  - After: Verify Infrastructure Claims | Ratiwal Dream Estates
- **Description** (167 → 143)
  - Before: How to distinguish approved, funded infrastructure projects from speculative developer announcements across the Delhi-Mumbai Expressway, Ring Roads, and Airport nodes.
  - After: How to tell approved, funded infrastructure from speculative announcements along the Delhi-Mumbai Expressway, ring roads and airport corridors.

### `/insights/demystifying-land-pricing-additional-charges`

- **Title** (100 → 57)
  - Before: Land Pricing Architecture: Base Price, PLC, Stamp Duty & Development Charges | Ratiwal Dream Estates
  - After: Plot Pricing & Additional Charges | Ratiwal Dream Estates
- **Description** (194 → 145)
  - Before: A complete financial breakdown of all costs associated with land acquisition: understanding basic land rates, corner plot premiums, external development levies, and statutory registration taxes.
  - After: Understand every cost in a land purchase: base rate, corner plot premium, external development charges and registration taxes such as stamp duty.

### Unchanged (already within limits and accurate)

- `/disclaimer`: "RERA & Legal Disclaimer | Ratiwal Dream Estates" (47), description 146 chars

## 3. Length summary

| Metric | Before | After |
|---|---|---|
| Public titles ≤ 60 chars | 12 / 37 | 37 / 37 |
| Longest public title | 100 chars | 60 chars |
| Public descriptions ≤ 160 chars | 12 / 37 | 37 / 37 |
| Longest public description | 295 chars | 160 chars |
| Duplicate titles / descriptions | 0 / 0 | 0 / 0 |

## 4. Canonical changes

- **No public canonical value changed in Phase 2.** All 37 public routes already had the correct self-referential `https://www.ratiwaldreamestates.com…` canonical from Phase 1 and still do. Dynamic pages build it from the published slug through `getMetadata({ slug })`, so page code does no string concatenation. Query parameters are never read, so `?x=y` URLs cannot create a different canonical.
- The homepage canonical is `https://www.ratiwaldreamestates.com` (no trailing slash), identical to its sitemap `<loc>`.
- Private and not-found pages still emit **no canonical** (they do not inherit the homepage URL).

## 5. Robots changes

| Change | Detail |
|---|---|
| Root layout no longer emits `index, follow` | `src/app/layout.tsx` now calls `getMetadata({ omitCanonical: true, omitRobots: true })`. Every real page sets its own robots. The root value only ever leaked into 404 pages, where it contradicted Next's own `noindex` (`noindex` plus `index, follow` on one page). A 404 now emits a single `noindex`. |
| `getMetadata` gains `omitRobots` | Default behaviour is unchanged for every other caller. |
| `payments/pay/[token]` | `noindex, nofollow` (added in Phase 1) is now the only index directive. |
| Public pages | Still `index, follow` with the `googleBot` max-snippet / max-image-preview directives, verified on all 37. |

## 6. Open Graph and Twitter changes

| Change | Why |
|---|---|
| `og:image` default is now `/images/brand/og-image.jpg` (was `logo.jpg`) | `og-image.jpg` is the dedicated social image already referenced by the site's JSON-LD. |
| Image dimensions are declared only for that default, at its true size (1024×1024) | Previously every image (property photos, location photos, the logo) was declared 1200×630, which was wrong for all of them. |
| `twitter:card` is `summary` for pages using the square default and `summary_large_image` for pages with a real photo | A square image is cropped badly in a large card. |
| `og:type` is `article` on 10 article and case-study pages, with `article:published_time` / `modified_time` for insights | Was `website` everywhere. |
| `og:image:alt` is specific (property name and city, location and state, article title) | Was just the page title. |
| `/locations/kishangarh` `og:image` | Was `https://www.ratiwaldreamestates.com/` (the homepage URL, because that location has no hero image). Now the default brand image. |
| Case-study `og:image` | Now the photo of the location the story is about. For example the Jaipur Ring Road story used the Bhiwadi photo before. The visible hero on the page is unchanged. |
| Property pages | Removed a fallback to `/opengraph-image.png`, which does not exist. Real primary images are used (ImageKit or `/images/properties/…`). |
| `og:title`, `og:description`, `og:url`, `og:site_name`, `og:locale`, `twitter:title`, `twitter:description`, `twitter:image` | Present on all 37 public routes (verified) and follow the new titles and descriptions. |

## 7. Image alt-attribute audit (public pages)

- Scanned **68** `<Image>` / `<img>` elements in all public components and marketing pages (JSX scan, excluding dashboard, portal, partner, kyc, payments, preview).
- **Missing alt: 0. Empty alt on a meaningful image: 0.** The only empty alts (2) are `aria-hidden` decorative thumbnails inside the admin dashboard, which is not public.
- Existing alt text is descriptive and factual (for example "Riyasat Paradise II monumental grand entrance gateway…", `${propertyName} gallery photograph N`, `${location.name}, ${location.state}`).
- **No alt text was changed and no image was renamed.**

## 8. Files changed in Phase 2

| File | Change |
|---|---|
| `src/lib/seo.ts` | `getMetadata`: `omitRobots`, `ogType`, `publishedTime` / `modifiedTime`, `imageAlt`; accurate OG image size; `summary` vs `summary_large_image`; new default image; helpers `fitMetaText`, `pickFittingText`. |
| `src/lib/seo-copy.ts` (new) | Title and description builders for `/`, `/properties`, `/locations`. |
| `src/lib/utils/listing-summary.ts` (new) | Saved-location summary, ranking by listings, list fitting. |
| `src/app/layout.tsx` | Root metadata: `omitRobots`. |
| `src/app/(marketing)/page.tsx` | `generateMetadata` uses `homeCopy`. |
| `src/app/(marketing)/properties/page.tsx` | `generateMetadata` and JSON-LD text use `catalogCopy`. |
| `src/app/(marketing)/properties/[slug]/page.tsx` | Title, description, image and alt for property detail. |
| `src/app/(marketing)/locations/page.tsx` | Metadata via `locationsCopy`; **`<Suspense>` around `LocationDirectory`** (technical fix, see Validation Report). |
| `src/app/(marketing)/locations/[slug]/page.tsx` | Title, description, image and alt; Kishangarh image bug. |
| about, contact, investment, why-choose-us, testimonials, insights, privacy-policy, terms-of-service `page.tsx` | Title and/or description only. |
| `testimonials/[slug]/page.tsx`, `insights/[slug]/page.tsx` | Use `metaTitle` / `metaDescription`; `og:type: article`; images and alt. |
| `src/data/insights.ts`, `src/data/testimonials.ts` | **Added** `metaTitle` + `metaDescription` to 6 articles and 4 case studies (no existing field edited). |
| `src/types/insight.ts`, `src/types/testimonial.ts` | Optional `metaTitle` / `metaDescription`. |

The disclaimer page is unchanged (its title and description were already within limits).

## 9. JSON-LD (structured data) scope

One call site changed: `src/app/(marketing)/properties/page.tsx` now passes the same `catalogCopy(...)` text used for the metadata into `buildWebPageSchema({ title, description, url, type })`. Only the **`name`** and **`description`** of the `CollectionPage` node changed.

| | Before (hard-coded) | After (rendered, verified) |
|---|---|---|
| `name` | Verified Residential & Commercial Plots Portfolio \| Ratiwal Dream Estates | Plots for Sale in Jaipur & More \| Ratiwal Dream Estates |
| `description` | Explore our vetted collection of premium residential and commercial plots in Jaipur, Ajmer, Navi Mumbai, Panvel, and Bhiwadi. | Residential and commercial plots for sale in Jaipur, Ajmer, Kishangarh, Bhiwadi & More. Compare plot sizes in Sq. Yds and Sq. Ft, price status and documents. |

The `BreadcrumbList` and `ItemList` nodes are untouched. `src/lib/schema.ts` and `src/components/seo/JsonLd.tsx` were not modified, and no other page's JSON-LD changed. The two parallel generators (9 exports in `schema.ts`, 7 in `JsonLd.tsx`) still exist; consolidating them is out of scope.

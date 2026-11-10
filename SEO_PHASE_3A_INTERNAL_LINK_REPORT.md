# SEO Phase 3A — Editorial Internal Linking Report

**Project:** Ratiwal Dream Estates  
**Scope:** Contextual Internal Link Insertion across Insights Editorial Articles  
**Date:** November 7, 2026  
**Status:** COMPLETED & VERIFIED

---

## 1. Internal Linking Strategy & Guidelines

In accordance with Phase 3A specifications:
- **Link Equity Distribution:** High-authority informational guide pages (Insights) channel topical authority and pagerank directly to commercial transaction landing pages (`/properties/[slug]`) and regional hub pages (`/locations/[slug]`).
- **Anchor Text Optimization:** Descriptive, entity-rich keyword phrases matching authentic user search intent (e.g., `residential plots in Jaipur`, `Neelkanth Nagar`, `Riyasat Paradise II`, `Vrindavan Viihaar`, `Aero Crystal`).
- **Subtlety & User Experience:** No more than 1–2 internal links per article, woven naturally into existing prose without disrupting editorial tone or layout structure.
- **Architectural Preservation:** Zero headings (H1–H3) or FAQ sections were modified. A zero-runtime-dependency markdown parser was integrated into `ArticleBody.tsx` to render Next.js `<Link>` components with client-side prefetching.

---

## 2. Complete Contextual Internal Link Mapping

| Article URL | Destination URL | Section ID | Anchor Text | Context & Search Rationale |
| :--- | :--- | :--- | :--- | :--- |
| `/insights/essential-guide-plot-buying` | `/locations/jaipur` | `understanding-land-classifications` | `residential plots in Jaipur` | Connects statutory Section 90A conversion guidance directly to Jaipur's regional plot inventory. |
| `/insights/essential-guide-plot-buying` | `/properties/neelkanth-nagar` | `physical-inspection-and-demarcation` | `Neelkanth Nagar` | Exemplifies on-ground total station boundary demarcation with a verified township. |
| `/insights/understanding-property-documentation` | `/locations/jaipur` | `encumbrance-and-title-search` | `Jaipur corridor properties` | Directs readers seeking title search due diligence to the Jaipur regional market hub. |
| `/insights/understanding-property-documentation` | `/properties/riyasat-paradise-ii` | `encumbrance-and-title-search` | `Riyasat Paradise II` | Contextual anchor pointing to a 100% verified title dossier in Vatika, Tonk Road. |
| `/insights/rera-fundamentals-for-plot-buyers` | `/locations/ajmer` | `quarterly-compliance-audit` | `Ajmer corridor` | Connects RERA quarterly progress filing education to Ajmer corridor growth assets. |
| `/insights/rera-fundamentals-for-plot-buyers` | `/properties/vrindavan-viihaar` | `quarterly-compliance-audit` | `Vrindavan Viihaar` | Connects 70% escrow compliance to a real RERA-registered development. |
| `/insights/site-visit-inspection-framework` | `/locations/kishangarh` | `utility-cabling-and-infrastructure` | `Kishangarh growth corridor` | Contextual link from infrastructure inspection criteria to Kishangarh market opportunities. |
| `/insights/site-visit-inspection-framework` | `/properties/aero-crystal` | `utility-cabling-and-infrastructure` | `Aero Crystal` | Demonstrates underground utility benchmarks on an active project page. |
| `/insights/evaluating-corridor-infrastructure-claims` | `/locations/jaipur` & `/locations/panvel` | `infrastructure-maturity-stages` | `Jaipur Ring Road corridors` & `Panvel growth node` | Links multi-stage infrastructure auditing to major expressway growth nodes. |
| `/insights/evaluating-corridor-infrastructure-claims` | `/properties/happy-business-park` | `verifying-official-gazettes` | `Happy Business Park` | Connects highway logistics corridor evaluation to a prime commercial highway asset. |
| `/insights/demystifying-land-pricing-additional-charges` | `/properties` | `anatomy-of-land-pricing` | `verified property listings` | Directs readers analyzing total acquisition cost (TAC) to the complete catalog. |
| `/insights/demystifying-land-pricing-additional-charges` | `/properties/bhumija-green-block-a` | `understanding-plc` | `Bhumija Green Block A` | Illustrates boulevard frontage and corner plot preferential location charges (PLC). |

---

## 3. Component Implementation Details

### `src/components/insights/detail/ArticleBody.tsx`
Updated the body renderer with `renderTextWithLinks()`:
- Automatically detects markdown link syntax (`[anchor text](url)`).
- Maps each occurrence to a Next.js `<Link>` component with clean styling (`font-medium text-[#087fc3] underline decoration-[#087fc3]/40 underline-offset-4 hover:decoration-[#087fc3]`).
- Renders plain string fragments untouched when no links exist.
- Fully supports both main paragraphs and subsection paragraphs.

---

## 4. Verification

- Ran `npx tsx scripts/test-seo-metadata.ts` -> **27/27 tests passed**.
- Prerendering and link targets verified against live property and location routes.


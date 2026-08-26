# Ratiwal Dream Estates — CMS, Technical SEO & Website Conversion Architecture

This document details the Content Management System (CMS), Technical SEO framework, publishing lifecycles, structured data schemas, and conversion optimization mechanisms implemented for **Ratiwal Dream Estates** under **PRD 20**.

---

## 1. CMS Architecture & Core Models

The CMS layer integrates with the existing Mongoose database layer, providing strict content types, immutable versioning, XSS-safe block pipelines, and server-side RBAC.

### 1.1 Content Types (`CmsContentType`)
- `STANDARD_PAGE`: Static & marketing landing pages (e.g. `/investment`, `/why-choose-us`).
- `BLOG_POST`: Insight articles, legal guides, and market research (e.g. `/insights/guide-to-registry-rajasthan`).
- `LOCATION_PAGE`: Regional corridor hubs and hub overviews (e.g. `/locations/ajmer-road-expressway`).
- `PROPERTY_CONTENT`: Editorial descriptions and land highlights for property pages.
- `FAQ_COLLECTION`: Categorized questions and reviewed answers for buyers and investors.
- `TESTIMONIAL`: Consented buyer testimonials and NRI case studies.
- `NAVIGATION` & `FOOTER`: Dynamic menu trees with route validation.
- `SEO_LANDING_PAGE`: Curated high-value landing hubs with unique content.

### 1.2 Database Models
- [`CmsEntry`](file:///r:/New%20folder/ratiwal-dream-estates/src/models/CmsEntry.ts): Primary content document holding slug, publishing state, active version number, SEO metadata, typed block stream, and 2-hour preview token hashes.
- [`CmsEntryVersion`](file:///r:/New%20folder/ratiwal-dream-estates/src/models/CmsEntryVersion.ts): Append-only immutable version snapshots recording historical content, SEO tags, author, approver, and publication timestamps.
- [`RedirectRule`](file:///r:/New%20folder/ratiwal-dream-estates/src/models/RedirectRule.ts): 301, 302, 307, 308 URL redirects with loop detection and hit counting.
- [`CmsTestimonial`](file:///r:/New%20folder/ratiwal-dream-estates/src/models/CmsTestimonial.ts): Verified customer testimonials with recorded DPDP Act consent.
- [`CmsFaqItem`](file:///r:/New%20folder/ratiwal-dream-estates/src/models/CmsFaqItem.ts): Categorized FAQ repository with reviewed answers.
- [`CmsNavigationConfig`](file:///r:/New%20folder/ratiwal-dream-estates/src/models/CmsNavigationConfig.ts): Header and footer link tree configurations.

---

## 2. Publishing Lifecycle & Versioning

```
  ┌──────────┐      Submit      ┌──────────────┐      Approve      ┌──────────┐
  │  DRAFT   │ ───────────────> │ UNDER_REVIEW │ ────────────────> │ APPROVED │
  └──────────┘                  └──────────────┘                   └──────────┘
       ▲                               │                                │
       │                               │ Request Changes                │ Publish / Schedule
       │                               ▼                                ▼
       │                        ┌─────────────────┐             ┌───────────────┐
       └─────────────────────── │ ACTION_REQUIRED │             │   PUBLISHED   │
                                └─────────────────┘             └───────────────┘
                                                                        │
                                                                        ▼ Unpublish
                                                                ┌───────────────┐
                                                                │  UNPUBLISHED  │
                                                                └───────────────┘
```

1. **Immutable Published Versions**: Whenever an entry is published, a snapshot is written to `CmsEntryVersion`. Subsequent edits do not overwrite the published version—they create a new working `DRAFT`.
2. **Forward Rollbacks**: Rolling back to a previous version does not delete history; it creates a new forward version restoring the snapshot payload.
3. **Scheduled Publishing**: Durable cron evaluates entries in `SCHEDULED` status where `scheduledAt <= now` and promotes them to `PUBLISHED` idempotently.

---

## 3. Security & Safe Content Blocks

1. **Zero Unsanitized HTML**: Content blocks (`HERO`, `RICH_TEXT`, `PROPERTY_GRID`, `FAQ`, `CTA`, `STATISTICS`, etc.) are validated against typed schemas.
2. **XSS Defense**:
   - Strips all `<script>` and `<style>` elements.
   - Strips DOM event attributes (`onclick`, `onerror`, `onload`, `onmouseover`).
   - Restricts URL protocols in `href`, `src`, and `action` to `https:`, `http:`, `mailto:`, and `tel:`.
   - Strips `javascript:` and `data:` schemes.
   - Restricts iframes exclusively to allowlisted providers (YouTube, Vimeo, Google Maps).
3. **Draft Preview Security**:
   - Preview links utilize a 32-byte cryptographic random hex token stored as a SHA-256 hash with a strict 2-hour TTL.
   - Preview pages render with `robots: { index: false, follow: false }` and `no-store` cache headers.

---

## 4. Technical SEO & Schema.org JSON-LD

### 4.1 Schema.org Structured Data
- **RealEstateAgent**: Organization details, verified registered office address in Jaipur, customer care phone numbers, and social channels.
- **BreadcrumbList**: Hierarchical navigational trail with absolute URLs.
- **Article**: Complete headline, publication date, author, and Open Graph imagery for insight publications.
- **FAQPage**: Compliant question and answer entities matching visible text.

### 4.2 Dynamic Sitemap & Robots
- **Dynamic Sitemap** (`/sitemap.xml`): Queries all published, non-noindex `CmsEntry` records alongside static routes with real `lastModified` timestamps.
- **Robots Directives** (`/robots.txt`): Explicitly blocks private portals (`/dashboard/`, `/portal/`, `/partner/`, `/preview/`, `/kyc/submit/`, `/payments/pay/`).

---

## 5. Dashboard Routes

| Route | Purpose |
|---|---|
| `/dashboard/content` | CMS Overview, KPIs, and recent content streams |
| `/dashboard/content/pages` | Standard marketing pages and landing hubs |
| `/dashboard/content/blog` | Insights, market blueprints, and RERA guides |
| `/dashboard/content/editor/[id]` | Visual block editor with device & SEO previews |
| `/dashboard/content/editor/new` | New content authoring studio |
| `/dashboard/content/faqs` | Categorized FAQ repository |
| `/dashboard/content/testimonials` | Verified client reviews with consent tracking |
| `/dashboard/content/redirects` | 301/302 URL redirect manager |
| `/dashboard/seo` | Core Web Vitals health desk & robots/sitemap inspector |

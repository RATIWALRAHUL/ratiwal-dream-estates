# Ratiwal Dream Estates — Official Platform Documentation

> **“Lifelong Property Consultancy, Built on Trust & Transparency.”**

Welcome to the **Ratiwal Dream Estates** documentation portal. The project documentation is consolidated into two dedicated guides:

---

## 📚 Documentation Guides

### 🛠️ 1. [Developer Guide (DEVELOPER_GUIDE.md)](./DEVELOPER_GUIDE.md)
*Complete technical reference for engineers, developers, and DevOps teams.*
- **System Architecture:** Next.js 16 App Router, TypeScript 5, Tailwind CSS v4, MongoDB Atlas.
- **Database Layer & Models:** Mongoose models (`Location`, `Property`, `PlotOption`), embedded subdocument schemas, integer paise currency handling, canonical square feet area conversion.
- **Backend Utilities & Response Formatters:** Standardized API envelopes, Zod environment validation, structured logger, and error handling classes.
- **Migration & Index CLI:** Idempotent catalog migration tool (`npm run migrate:catalog`) and index management tool (`npm run db:indexes`).
- **Testing & Quality Assurance:** Automated test suites (`npm run test:foundation`, `npm run test:models`), static analysis, and build validation.

---

### 💼 2. [Client & Stakeholder Guide (CLIENT_GUIDE.md)](./CLIENT_GUIDE.md)
*Executive overview for business stakeholders, property consultants, and clients.*
- **Brand Vision & Philosophy:** Rigorous due diligence, zero hidden costs, verified title search.
- **Platform Features & Page Inventory:** 40 responsive pages covering property showcases, interactive plot options table, corridor growth hubs, and investment thesis.
- **Buyer Protection Protocols:** 6-stage verification framework, RERA compliance audits, and physical land demarcation checks.
- **Lead Capture & Customer Experience:** Direct WhatsApp advisory, multi-channel site-visit booking (physical + virtual tours), and contextual property inquiry forms.
- **Future Roadmap:** Upcoming CMS administration portal, CRM webhook integration, and automated investor diligence packets.

---

## 🚀 Quick Start for Developers

```bash
# Install dependencies
npm install

# Run local development server
npm run dev

# Run all test suites
npm run test:foundation
npm run test:models

# Production build
npm run build
```

---

## Directory Structure

```text
ratiwal-dream-estates/
├── public/                    # Static assets (images, icons, documents)
│   ├── images/
│   │   ├── brand/             # Logos, open-graph assets
│   │   ├── properties/        # Vetted property photos
│   │   ├── locations/         # Location-specific assets
│   │   ├── testimonials/      # Client avatar representations
│   │   └── placeholders/      # Development mock images
│   └── icons/
│
├── src/
│   ├── app/
│   │   ├── (marketing)/       # App Router Marketing Group (header/footer wrapped)
│   │   │   ├── layout.tsx     # Inject header, footer, floating buttons
│   │   │   ├── page.tsx       # Homepage
│   │   │   ├── properties/    # Properties list & dynamic details
│   │   │   ├── locations/     # Locations list & city queries
│   │   │   ├── about/         # About Us page
│   │   │   ├── investment/    # Land investment articles & checklists
│   │   │   ├── why-choose-us/ # Core advisory advantages
│   │   │   ├── testimonials/  # Customer review listings
│   │   │   ├── insights/      # Blog guides and legal titles information
│   │   │   └── contact/       # Contact details and email forms
│   │   ├── api/
│   │   │   ├── enquiries/     # Server-side validation for leads
│   │   │   └── site-visits/   # Server-side booking tours scheduler
│   │   ├── layout.tsx         # Global fonts and SEO provider
│   │   ├── globals.css        # Tailwind directives and design tokens
│   │   ├── robots.ts          # Search engine bot specifications
│   │   └── sitemap.ts         # Dynamic XML Sitemap generator
│   │
│   ├── components/
│   │   ├── layout/            # Layout frames (Header, Footer, Navigation)
│   │   ├── property/          # Property listing and details widgets
│   │   ├── forms/             # React Hook Form validation items
│   │   ├── shared/            # Common UI dividers (Container, SectionHeader)
│   │   └── ui/                # Base primitives (Button, Input, Badge, Modal)
│   │
│   ├── config/                # Central business and link data (site.ts, navigation.ts)
│   ├── data/                  # Offline JSON datasets (properties.ts, locations.ts)
│   ├── lib/                   # Utility helpers (whatsapp.ts, seo.ts, utils.ts)
│   └── types/                 # Strict TypeScript schemas & type bounds
```

---

## Route Index

- **Homepage:** `/` (Brand hero, CTA, featured lists, testimonials)
- **Properties Listing:** `/properties` (Plot listings grid with status filters)
- **Property Details:** `/properties/[slug]` (Statically optimized property descriptions, connectivity, landmarks, approvals)
- **Locations Index:** `/locations` (Overview of active development hubs)
- **Location Detail:** `/locations/[slug]` (Filters plots matching a specific city/hub)
- **Investment Strategy:** `/investment` (Corridor analysis, land documentation guidelines)
- **About Us:** `/about` (Corporate vision, advisory panels)
- **Why Choose Us:** `/why-choose-us` (Review transparency pledges, title searches)
- **Testimonials:** `/testimonials` (Client reviews grid)
- **Insights Listing:** `/insights` (Checklists, legal documents guidelines)
- **Insight Details:** `/insights/[slug]` (Dynamic blog articles)
- **Contact:** `/contact` (Consultation enquiry form, office address, map embed)

---

## Environment Variable Configuration

Create a `.env.local` file in your root folder utilizing placeholders defined in `.env.example`:

```env
# Client Constants (Safe for frontend)
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_WHATSAPP_NUMBER=919999999999
NEXT_PUBLIC_BUSINESS_PHONE=+919999999999
NEXT_PUBLIC_BUSINESS_EMAIL=info@ratiwaldreamestates.com
NEXT_PUBLIC_GOOGLE_MAPS_EMBED_URL=https://www.google.com/maps/embed...

# Server Secrets (Never prefix with NEXT_PUBLIC_)
ENQUIRY_RECEIVER_EMAIL=leads@ratiwaldreamestates.com
EMAIL_FROM_ADDRESS=noreply@ratiwaldreamestates.com
EMAIL_PROVIDER_API_KEY=your_key_here

DATABASE_URL=your_db_connection_here
```

---

## Content Update Instructions

To update text descriptions, locations, properties, and testimonial content:
1. **Business Metadata:** Modify `src/config/site.ts` for links, email, phone numbers, or taglines.
2. **Properties Portfolio:** Add/edit records in `src/data/properties.ts` according to the `Property` interface.
3. **Locations List:** Modify `src/data/locations.ts` to add or update cities.
4. **Insights Articles:** Modify `src/data/insights.ts` to publish new buyer guides.
5. **Testimonials Listing:** Edit `src/data/testimonials.ts` to add verified reviews.

---

## Form Integration & API Status

The application includes two Next.js API Route Handlers:
1. **General Lead Capture:** `POST /api/enquiries`
2. **Tour Scheduling:** `POST /api/site-visits`

**Security & Spam Protection Features:**
- Client-side validation using Zod and React Hook Form.
- Server-side parsing with Zod schemas to reject invalid requests.
- Input sanitization (whitespace trimming, email case normalization).
- Spam prevention using a hidden **honeypot** input element.
- Stubs are placed in the handlers to hook up databases (e.g. Prisma) or email dispatchers (e.g. Resend/SendGrid).

---

## Image Replacement Instructions

Place assets under their respective folder inside `public/images/`:
- Save property thumbnails as `public/images/properties/[property-slug].jpg` and update the array in `src/data/properties.ts`.
- Mock icons can be saved under `public/icons/`.

---

## Missing Information Pending Client Delivery

The following details are currently marked as `[CONTENT REQUIRED]` and must be replaced before production release:
1. **Office Address:** Physical location and coordinates.
2. **Verified WhatsApp Number:** Verified active business WhatsApp.
3. **Active Email Credentials:** API Keys for Mail/CRM delivery (Resend/HubSpot).
4. **Property Details:** Verified plot details, sizes, boundaries, connectivity maps, and pricing models.
5. **Regulatory Registrations:** Valid RERA numbers, JDA/ADA approvals, and MMDA certification documentation.
6. **Real Reviews:** Authentic customer reviews and testimonials.

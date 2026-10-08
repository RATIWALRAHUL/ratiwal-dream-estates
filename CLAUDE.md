# Ratiwal Dream Estates — Developer Guide & Operating Directives

## 1. Project Overview & Architecture
- **Framework:** Next.js 16 (App Router) + React 19 + TypeScript.
- **Styling:** Tailwind CSS + Vanilla CSS (`globals.css`).
- **Database:** MongoDB Atlas via Mongoose singleton (`src/lib/db/mongoose.ts`).
  - Target database name is strictly **`ratiwal_dream_estates`** (never `test`).
- **Media CDN:** ImageKit (`/dreamestate/...`) via singleton server client (`src/lib/imagekit/client.ts`).
- **Single Source of Truth:** All property, plot, and location data must reside in MongoDB. Never hardcode property arrays or mock data in frontend components.

---

## 2. Media & Imagery Rules (Strict Zero-AI Policy)
- **NO AI-Generated Images:** Synthetic, AI-rendered, or generic stock images are strictly forbidden across property cards, hero sections, and project galleries.
- **Authentic Developer Photography Only:** Use real developer-provided photography, approved site engineering renders, and official layout maps.
- **Hosting Standards:** All property media must be uploaded to ImageKit under `/dreamestate/projects/{city}/{slug}/` with:
  - `originalFilename`, `safeDisplayName`, `altText`, `caption`, and exact aspect ratios.
- **No Dummy Fallbacks:** Never fall back to dummy placeholder images (e.g., `/images/about/township-development.jpg`).

---

## 3. Property Card Display Standard (Main Gate Invariant)
- **Main Entrance Gate Hero Image:** On all property cards (Home page grid, `/properties` catalog, related properties, and search results), the card thumbnail image **MUST ALWAYS be the Main Entrance Gate** (Grand Entry Portal / Welcome Archway) of the township.
- **Database Invariant:** Exactly 1 media asset per property must have `isPrimary: true`. Setting `isPrimary: true` on the main gate image automatically causes `PropertyCard` to display it as `property.images[0]`.

### Jaipur Township Main Gate Mapping:
1. **Riyasat Paradise II:** `riyasat-paradise-ii-main-gate.jpg` (Official monumental Dubai-inspired gate).
2. **Neelkanth Nagar:** `neelkanth-nagar-hero.jpg` (Official grand entrance gate & 40ft boulevard).
3. **Bhumija Green Block A:** `bhumija-green-entry-gate.jpg` (Monumental architectural entry portal).
4. **Riyasat Heritage Extension:** `riyasat-heritage-ext-hero.jpg` (Royal heritage stone entrance gateway).

---

## 4. Plot Dimensions & Master Inventory Standards
- Standard plotted inventory must conform to the master data sheet specification:
  - **Plot Option A:** 111.11 Sq. Yds (1,000 Sq. Ft.) — Standard 20 × 50 ft villa plot.
  - **Plot Option B:** 200.00 Sq. Yds (1,800 Sq. Ft.) — 30 × 60 ft executive plot.
  - **Plot Option C:** 277.77 Sq. Yds (2,500 Sq. Ft.) — 35 × 70 ft premium villa plot.
  - **Custom Villa Plot:** 500.00 Sq. Yds (4,500 Sq. Ft.) — 50 × 90 ft luxury estate plot.
- Micro-market standard additions: 100 Sq. Yds (900 Sq. Ft.), 120–150 Sq. Yds (1,080–1,350 Sq. Ft.).
- In frontend cards and tables, always display both Square Yards and Square Feet (`Sq. Yds / Sq. Ft.`).

---

## 5. Design Aesthetics & "Anti-AI" Visual Guidelines
- **Avoid Generic AI/Crypto Badges:**
  - Do NOT use uppercase shouting pills, neon cyan text (`#38bdf8`), bulky white borders, or generic shield icons (e.g., `[SHIELD] VERIFIED LAND & LUXURY ESTATES`).
- **Luxury Real Estate Design Language:**
  - Editorial, architectural typography (natural sentence case, clean tracking).
  - Subtle hairline borders (`border-white/10` or `border-white/[0.08]`).
  - Dark luxury glassmorphism (`bg-slate-950/60` with `backdrop-blur-md`).
  - Refined status indicators: 6px emerald pulse or warm champagne accent dot (`#10b981`).
- **Navbar Clearance:**
  - All inner pages (Locations, Properties, About, Contact) must maintain top padding `pt-28 sm:pt-32 md:pt-36` to ensure content never collides with the fixed floating navbar.
- **Home Page Properties Grid:**
  - Display strictly maximum 3 featured property cards on the home page.
  - Follow immediately with a centered "View All Properties" CTA button linking to `/properties`.

---

## 6. Official Business Contact Details
- **Email:** Strictly use `sureshkumawat6917@gmail.com`. Never use placeholder emails (`info@dreamestate.in`, `test@example.com`).
- **Phone / WhatsApp:** `+91-9929533436`.
- **RERA / Licensing:** RAJ/A/2026/... (Rajasthan Real Estate Regulatory Authority).

---

## 7. Verification & Seeding Scripts
- **Seeder:** `npx tsx scripts/seed-jaipur-townships.ts` (Idempotent seed of all verified projects).
- **Update Gate & Plots:** `npx tsx scripts/update-card-gate-images.ts`.
- **Verification:** `npx tsx scripts/verify-jaipur-townships.ts` (Validates 100% database health, single primary image, and ImageKit hosting).

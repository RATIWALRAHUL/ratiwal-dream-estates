import { InsightArticle } from "../types/insight";

export const insights: InsightArticle[] = [
  {
    slug: "essential-guide-plot-buying",
    title: "The Comprehensive Land & Plot Buying Due Diligence Guide",
    excerpt:
      "A step-by-step masterplan for evaluating freehold plotted land, verifying statutory development sanctions, understanding conversion orders, and avoiding unapproved agricultural layouts.",
    category: "Property Buying Guides",
    tags: ["Plot Buying", "Due Diligence", "JDA", "RERA", "Land Title"],
    author: {
      name: "Ratwal Editorial Research Team",
      role: "Land Advisory & Due Diligence Desk",
      bio: "Senior research analysts and statutory planning specialists focusing on plotted land corridors across Rajasthan and Maharashtra.",
    },
    reviewer: {
      name: "Advocate R. Sharma",
      role: "High Court Revenue & Property Title Counsel",
      reviewType: "legal",
      reviewedAt: "2026-08-10",
    },
    heroImage: "/images/locations/jaipur.jpg",
    publishedAt: "2026-08-01",
    updatedAt: "2026-08-18",
    lastReviewedAt: "2026-08-18",
    reviewStatus: "approved",
    featured: true,
    readingTimeMinutes: 7,
    relatedLocationSlugs: ["jaipur", "ajmer", "navi-mumbai"],
    relatedPropertySlugs: ["royal-palms-township-ajmer-road-jaipur", "aravalli-greens-retreat-plots-ajmer"],
    relatedArticleSlugs: ["understanding-property-documentation", "rera-fundamentals-for-plot-buyers"],
    downloadableResourceSlugs: ["plot-buying-due-diligence-checklist", "site-visit-inspection-framework"],
    keyTakeaways: [
      "Never purchase unapproved agricultural land relying solely on private notarized agreements or unauthorized society receipts.",
      "Always demand the statutory Section 90A / Non-Agricultural conversion order issued by the competent planning authority (JDA, ADA, CIDCO, or Collector).",
      "Verify the 30-year title chain through a certified Sub-Registrar Search Report and Non-Encumbrance Certificate (NEC).",
      "Conduct an on-ground physical total station survey to verify sector road widths (60ft / 40ft) and boundary coordinates against the sanctioned layout map.",
    ],
    sections: [
      {
        id: "understanding-land-classifications",
        heading: "1. Understanding Land Classifications & Legal Status",
        paragraphs: [
          "In Indian real estate, land is broadly categorized into Agricultural (Khatedari), Non-Agricultural (NA), Commercial, and Institutional parcels. Acquiring agricultural land for residential self-construction without statutory conversion is illegal and creates high eviction risk.",
          "Under state revenue laws (such as Section 90A of the Rajasthan Land Revenue Act), agricultural land must be formally surrendered to the planning authority (e.g., Jaipur Development Authority) and regularized with a formal land use conversion order before plots can be demarcated and registered.",
        ],
        callout: {
          type: "important",
          title: "The Unapproved Society Trap",
          text: "Private developers frequently sell plots on raw agricultural land promising 'future JDA approval.' Without a sanctioned 90A order, buyers receive no building permission, no municipal water connection, and no legal registry.",
        },
      },
      {
        id: "statutory-sanctions-and-layout-approvals",
        heading: "2. Verifying Statutory Sanctions & Layout Maps",
        paragraphs: [
          "A legitimate plotted development requires a Scheme Approval Order and an Approved Layout Plan from the competent municipal or regional development authority.",
          "Check the official authority portal to confirm that the scheme name, Khasra numbers, and total developer land acreage precisely match the sanctioned masterplan map.",
        ],
        checklist: [
          "Statutory Authority Layout Sanction Order (e.g., JDA / ADA / CIDCO)",
          "Approved Layout Map showing 60ft/40ft road widths, park reservations, and utility zones",
          "MahaRERA / RajRERA project registration number and quarterly progress filing",
          "Public Notice & 30-day objection clearance certificate from the Revenue Department",
        ],
      },
      {
        id: "revenue-chain-and-search-report",
        heading: "3. 30-Year Revenue Chain & Non-Encumbrance Audit",
        paragraphs: [
          "Title due diligence requires establishing an unbroken chain of ownership spanning at least 30 years. This confirms that all prior transfers, inheritances, and partitions were lawfully executed without pending dispute.",
          "An independent property advocate should examine the Sub-Registrar records to issue a formal Non-Encumbrance Certificate (NEC), ensuring the property is not pledged against bank mortgages or court injunctions.",
        ],
      },
      {
        id: "physical-inspection-and-demarcation",
        heading: "4. Physical Demarcation & Infrastructure Readiness",
        paragraphs: [
          "Paper approvals must be validated on the ground. During your physical site inspection, verify that the plot boundaries match the exact Total Station coordinate survey.",
          "Ensure that basic infrastructure—such as paved sector roads, underground electrical cabling conduits, water drainage pipelines, and boundary walls—is actively under construction or operational.",
        ],
      },
    ],
    sources: [
      {
        title: "Section 90A Guidelines and Regularization Rules",
        publisher: "Jaipur Development Authority (JDA)",
        url: "https://urban.rajasthan.gov.in/content/raj/udh/jda-jaipur/en/home.html",
        accessedAt: "2026-08-15",
      },
      {
        title: "Real Estate (Regulation and Development) Act, 2016 Guidelines",
        publisher: "Ministry of Housing and Urban Affairs (MoHUA)",
        url: "https://mohua.gov.in",
        accessedAt: "2026-08-15",
      },
    ],
  },
  {
    slug: "understanding-property-documentation",
    title: "Understanding Land Titles, 90A Sanctions & Revenue Extracts",
    excerpt:
      "A comprehensive legal guide decoding Jamabandi (Parcha Khatauni), Khasra Milan maps, 7/12 extracts, title deeds, and municipal mutation protocols across Rajasthan and Maharashtra.",
    category: "Legal & Documentation",
    tags: ["Land Titles", "Jamabandi", "7/12 Extract", "Revenue Records", "Mutation"],
    author: {
      name: "Ratwal Editorial Research Team",
      role: "Legal & Revenue Analysis Desk",
      bio: "Statutory land research team documenting property revenue frameworks and documentation standards.",
    },
    reviewer: {
      name: "Advocate S. N. Kulkarni",
      role: "Senior Revenue Advocate, Bombay High Court",
      reviewType: "legal",
      reviewedAt: "2026-08-12",
    },
    heroImage: "/images/about/office-consultation.jpg",
    publishedAt: "2026-08-05",
    updatedAt: "2026-08-18",
    lastReviewedAt: "2026-08-18",
    reviewStatus: "approved",
    featured: false,
    readingTimeMinutes: 8,
    relatedLocationSlugs: ["jaipur", "navi-mumbai", "panvel"],
    relatedPropertySlugs: ["royal-palms-township-ajmer-road-jaipur", "aerotropolis-prime-plotted-node-navi-mumbai"],
    relatedArticleSlugs: ["essential-guide-plot-buying", "rera-fundamentals-for-plot-buyers"],
    downloadableResourceSlugs: ["property-document-request-sheet", "plot-buying-due-diligence-checklist"],
    keyTakeaways: [
      "A Registered Sale Deed proves transfer of ownership, but only a Revenue Mutation (Dakhil Kharij / Ferfar) updates the government land ledger.",
      "In Rajasthan, Jamabandi (Parcha Khatauni) and Khasra Girdawari confirm agricultural Khatedari status and land classification.",
      "In Maharashtra, the 7/12 Extract (Saat Baara) and 8A Extract detail land area, cultivator rights, and existing bank encumbrances.",
      "Always inspect the original Title Deed chain before releasing token deposits.",
    ],
    sections: [
      {
        id: "core-revenue-records",
        heading: "1. Core Revenue Records: North vs. West India",
        paragraphs: [
          "Understanding regional revenue terminology is vital when evaluating land transactions. In Rajasthan, land rights are recorded under the Rajasthan Tenancy Act, while in Maharashtra, the Maharashtra Land Revenue Code (MLRC) governs ownership.",
        ],
        table: {
          headers: ["Document Name", "Jurisdiction", "Primary Purpose", "Issuing Authority"],
          rows: [
            ["Jamabandi (Parcha Khatauni)", "Rajasthan", "Record of Rights (RoR) detailing Khatedar names & share", "Revenue Department / Tehsil"],
            ["Khasra Girdawari", "Rajasthan", "Bi-annual agricultural crop inspection & possession record", "Patwari"],
            ["7/12 Extract (Saat Baara)", "Maharashtra", "Land ownership, survey numbers, and bank liabilities", "Revenue Department / Talathi"],
            ["Section 90A Sanction Order", "Rajasthan", "Conversion of agricultural land to non-agricultural residential use", "JDA / ADA / Collector"],
            ["Non-Agricultural (NA) Order", "Maharashtra", "Formal Collector permission for non-agricultural development", "District Collector / CIDCO"],
          ],
          caption: "Primary statutory revenue documents across Rajasthan and Maharashtra",
        },
      },
      {
        id: "mutation-dakhil-kharij",
        heading: "2. The Critical Difference: Registration vs. Mutation",
        paragraphs: [
          "Many buyers assume that registering a Sale Deed at the Sub-Registrar office completes the purchase process. This is a common and costly misconception.",
          "Registration transfers title between the buyer and seller. Mutation (known as Dakhil Kharij in Rajasthan and Ferfar/Namantar in Maharashtra) is the subsequent administrative process of recording the new owner's name in the government revenue land ledger.",
        ],
        callout: {
          type: "warning",
          title: "Mutation Timelines",
          text: "Always track your mutation application following registration. Until mutation is certified in the revenue ledger, property tax bills and municipal utility connections cannot be transferred to your name.",
        },
      },
      {
        id: "encumbrance-and-title-search",
        heading: "3. Conducting a 30-Year Title Search",
        paragraphs: [
          "A title search involves auditing past conveyance deeds, partition deeds, gift deeds, and release deeds registered against the property's Khasra or Survey Number for at least 30 continuous years.",
          "This search confirms that no co-owners, legal heirs, or financial institutions hold undisclosed claims or mortgages over the land.",
        ],
      },
    ],
    sources: [
      {
        title: "Apna Khata — Land Records Portal",
        publisher: "Government of Rajasthan Revenue Department",
        url: "https://apnakhata.rajasthan.gov.in",
        accessedAt: "2026-08-16",
      },
      {
        title: "Mahabhulekh — Maharashtra Land Records Portal",
        publisher: "Government of Maharashtra Revenue Department",
        url: "https://mahabhumi.gov.in",
        accessedAt: "2026-08-16",
      },
    ],
  },
  {
    slug: "rera-fundamentals-for-plot-buyers",
    title: "RERA Compliance & Buyer Safeguards for Plotted Townships",
    excerpt:
      "How the Real Estate (Regulation and Development) Act protects plot buyers: escrow account rules, layout disclosure mandates, and statutory project completion timelines.",
    category: "RERA Education",
    tags: ["RERA", "Buyer Protection", "Escrow", "Plotted Townships", "MahaRERA"],
    author: {
      name: "Ratwal Editorial Research Team",
      role: "Compliance & Regulatory Desk",
      bio: "Specialists in real-estate statutory frameworks and developer compliance audits.",
    },
    reviewer: {
      name: "Advocate R. Sharma",
      role: "High Court Revenue & Property Title Counsel",
      reviewType: "editorial",
      reviewedAt: "2026-08-14",
    },
    heroImage: "/images/about/township-development.jpg",
    publishedAt: "2026-08-08",
    updatedAt: "2026-08-18",
    lastReviewedAt: "2026-08-18",
    reviewStatus: "approved",
    featured: false,
    readingTimeMinutes: 6,
    relatedLocationSlugs: ["jaipur", "navi-mumbai"],
    relatedPropertySlugs: ["royal-palms-township-ajmer-road-jaipur", "aerotropolis-prime-plotted-node-navi-mumbai"],
    relatedArticleSlugs: ["essential-guide-plot-buying", "understanding-property-documentation"],
    downloadableResourceSlugs: ["property-document-request-sheet"],
    keyTakeaways: [
      "Plotted developments exceeding 500 sq. meters or 8 plots must be registered with RERA prior to any public advertising or token collection.",
      "Developers must deposit 70% of buyer funds into a dedicated scheduled bank escrow account utilized exclusively for land and construction expenses.",
      "Developers cannot unilaterally alter sanctioned layout plans or road widths without the written consent of two-thirds of alloted buyers.",
      "Check RERA quarterly compliance filings to verify actual on-ground infrastructure progress before committing funds.",
    ],
    sections: [
      {
        id: "when-rera-applies-to-plots",
        heading: "1. When Does RERA Apply to Plotted Developments?",
        paragraphs: [
          "Under Section 3 of the Real Estate (Regulation and Development) Act, 2016, all commercial and residential plotted developments where the area of land proposed to be developed exceeds 500 square meters or where the number of plots exceeds eight must be registered with the State RERA Authority.",
          "Promoters are legally prohibited from advertising, marketing, booking, selling, or offering plots for sale without securing a valid RERA Registration Certificate.",
        ],
      },
      {
        id: "70-percent-escrow-rule",
        heading: "2. The 70% Escrow Account Safeguard",
        paragraphs: [
          "One of RERA's most powerful protections is Section 4(2)(l)(D), which mandates that 70% of the amounts realized for the real estate project from allottees must be deposited in a separate bank account.",
          "Withdrawals from this account are strictly regulated: they must be certified by an engineer, an architect, and a chartered accountant in practice, confirming that the withdrawal is in direct proportion to the percentage of project completion.",
        ],
      },
      {
        id: "quarterly-compliance-audit",
        heading: "3. How to Check a Project on the RERA Portal",
        paragraphs: [
          "Before issuing any cheque, visit the official state RERA portal (e.g., rera.rajasthan.gov.in or maharera.mahaonline.gov.in) and enter the project registration number.",
        ],
        checklist: [
          "Verify the Sanctioned Layout Plan uploaded on the RERA portal matches the sales brochure",
          "Check the Encumbrance Certificate uploaded by the promoter's legal advocate",
          "Review the quarterly progress reports (QPR) detailing road work, electrical cabling, and drainage installation",
          "Confirm the declared Project Completion End Date",
        ],
      },
    ],
    sources: [
      {
        title: "Rajasthan Real Estate Regulatory Authority (RajRERA)",
        publisher: "RajRERA Official Portal",
        url: "https://rera.rajasthan.gov.in",
        accessedAt: "2026-08-16",
      },
      {
        title: "Maharashtra Real Estate Regulatory Authority (MahaRERA)",
        publisher: "MahaRERA Official Portal",
        url: "https://maharera.mahaonline.gov.in",
        accessedAt: "2026-08-16",
      },
    ],
  },
  {
    slug: "site-visit-inspection-framework",
    title: "The On-Ground Plot & Land Inspection Protocol",
    excerpt:
      "A practical engineering and legal protocol for evaluating physical access roads, natural drainage gradients, total station boundary pegs, and power line setbacks.",
    category: "Site Visit & Evaluation",
    tags: ["Site Visit", "Inspection", "Survey", "Boundary Demarcation", "Infrastructure"],
    author: {
      name: "Ratwal Editorial Research Team",
      role: "Technical Survey & Field Inspection Desk",
      bio: "Civil engineers and site inspectors documenting physical verification frameworks.",
    },
    heroImage: "/images/about/township-development.jpg",
    publishedAt: "2026-08-10",
    updatedAt: "2026-08-18",
    lastReviewedAt: "2026-08-18",
    reviewStatus: "approved",
    featured: false,
    readingTimeMinutes: 6,
    relatedLocationSlugs: ["jaipur", "ajmer", "panvel"],
    relatedPropertySlugs: ["royal-palms-township-ajmer-road-jaipur", "ring-road-logistics-commercial-hub-jaipur"],
    relatedArticleSlugs: ["essential-guide-plot-buying", "evaluating-corridor-infrastructure-claims"],
    downloadableResourceSlugs: ["site-visit-inspection-framework"],
    keyTakeaways: [
      "Physically measure approach and sector road widths with a measuring tape; do not rely on developer renderings.",
      "Check the natural slope and rainwater drainage runoff to ensure the plot is not located in a low-lying waterlogged depression.",
      "Confirm high-tension (HT) electrical lines maintain statutory clearance buffers as mandated by Central Electricity Authority guidelines.",
      "Verify that boundary pegs are established using Total Station digital coordinate instruments.",
    ],
    sections: [
      {
        id: "road-width-and-right-of-way",
        heading: "1. Measuring Approach Roads & Public Right-of-Way",
        paragraphs: [
          "An approved township plan often shows wide 60ft or 80ft sector roads. However, during initial phases, the actual motorable asphalt width may only be 20ft, with the remaining right-of-way unacquired or encroached.",
          "During your site visit, measure the full dedicated approach corridor from the main highway to the entrance gateway. Ensure that heavy construction vehicles and municipal fire tenders can safely access the plot.",
        ],
      },
      {
        id: "topography-and-drainage",
        heading: "2. Evaluating Elevation, Soil & Storm Water Runoff",
        paragraphs: [
          "Inspect the natural ground elevation relative to the central asphalt road. A plot situated significantly lower than the road level requires substantial soil filling costs to prevent monsoon water logging.",
          "Look for natural seasonal streams (nallahs) or water channels. Statutory building bye-laws mandate strict non-construction buffer distances (typically 15 to 30 meters) from notified water bodies.",
        ],
      },
      {
        id: "utility-cabling-and-infrastructure",
        heading: "3. Checking Underground Utilities & Transformers",
        paragraphs: [
          "Modern premium townships install underground electricity cables, water supply pipelines, and optical fiber conduits. Inspect utility junction boxes, transformer locations, and dedicated underground sewage treatment plants (STP).",
        ],
      },
    ],
    sources: [
      {
        title: "Central Electricity Authority (Safety Requirements for Overhead Power Lines) Regulations",
        publisher: "Central Electricity Authority (CEA)",
        url: "https://cea.nic.in",
        accessedAt: "2026-08-16",
      },
    ],
  },
  {
    slug: "evaluating-corridor-infrastructure-claims",
    title: "Auditing Masterplan & Infrastructure Claims in Growth Corridors",
    excerpt:
      "How to distinguish approved, funded infrastructure projects from speculative developer announcements across the Delhi-Mumbai Expressway, Ring Roads, and Airport nodes.",
    category: "Market Intelligence",
    tags: ["Infrastructure", "Masterplans", "Corridors", "Expressways", "NMIA"],
    author: {
      name: "Ratwal Editorial Research Team",
      role: "Geospatial & Corridor Analysis Desk",
      bio: "Urban planning analysts auditing state infrastructure masterplans and transportation corridors.",
    },
    heroImage: "/images/locations/panvel.jpg",
    publishedAt: "2026-08-12",
    updatedAt: "2026-08-18",
    lastReviewedAt: "2026-08-18",
    reviewStatus: "approved",
    featured: false,
    readingTimeMinutes: 7,
    relatedLocationSlugs: ["jaipur", "navi-mumbai", "panvel", "bhiwadi"],
    relatedPropertySlugs: ["aerotropolis-prime-plotted-node-navi-mumbai", "ring-road-logistics-commercial-hub-jaipur"],
    relatedArticleSlugs: ["essential-guide-plot-buying", "demystifying-land-pricing-additional-charges"],
    keyTakeaways: [
      "Differentiate between 'Approved / Under Construction' infrastructure and 'Proposed / Conceptual' masterplan lines.",
      "Verify infrastructure claims directly against NHAI, MMRDA, JDA, or CIDCO budgetary allocations.",
      "Examine environmental clearances, land acquisition Gazettes, and tender awards before factoring future connectivity into pricing.",
      "Never pay a premium based on speculative announcements lacking statutory budget sanction.",
    ],
    sections: [
      {
        id: "infrastructure-maturity-stages",
        heading: "1. The 4 Stages of Infrastructure Development",
        paragraphs: [
          "Real estate marketing frequently conflates conceptual proposals with operational infrastructure. To make informed investment decisions, categorize all cited infrastructure into four distinct maturity phases.",
        ],
        table: {
          headers: ["Development Stage", "Legal / Financial Evidence", "Investment Risk Level", "Price Impact"],
          rows: [
            ["1. Conceptual / Proposed", "Masterplan line only; zero budget allocation", "Very High (May take 10+ years or be realigned)", "Speculative only; do not pay premium"],
            ["2. Statutorily Approved", "State Cabinet sanction, DPR finalized, Gazette published", "Moderate (Land acquisition underway)", "Early appreciation begins"],
            ["3. Under Construction", "Tenders awarded, civil contractors active on ground", "Low-Moderate (Clear execution timeline)", "Core capital appreciation phase"],
            ["4. Operational", "Commercial traffic active, tolling / operations started", "Very Low (Immediate utility delivered)", "Matured pricing; high rental demand"],
          ],
          caption: "Infrastructure maturity framework for evaluating real estate claims",
        },
      },
      {
        id: "verifying-official-gazettes",
        heading: "2. How to Verify Government Gazettes & Tenders",
        paragraphs: [
          "When an expressway, metro line, or industrial corridor is cited as a selling point, look for the Section 3A / 3D Land Acquisition Notifications published in the Gazette of India or the State Gazette.",
          "Check the National Highways Authority of India (NHAI) project tracker to confirm contract award dates and construction milestones.",
        ],
      },
    ],
    sources: [
      {
        title: "National Highways Authority of India (NHAI) Project Tracking Portal",
        publisher: "NHAI / Ministry of Road Transport & Highways",
        url: "https://nhai.gov.in",
        accessedAt: "2026-08-16",
      },
      {
        title: "Mumbai Metropolitan Region Development Authority (MMRDA) Projects",
        publisher: "MMRDA Official Portal",
        url: "https://mmrda.maharashtra.gov.in",
        accessedAt: "2026-08-16",
      },
    ],
  },
  {
    slug: "demystifying-land-pricing-additional-charges",
    title: "Land Pricing Architecture: Base Price, PLC, Stamp Duty & Development Charges",
    excerpt:
      "A complete financial breakdown of all costs associated with land acquisition: understanding basic land rates, corner plot premiums, external development levies, and statutory registration taxes.",
    category: "Property Buying Guides",
    tags: ["Land Pricing", "PLC", "Stamp Duty", "Registration", "Additional Charges"],
    author: {
      name: "Ratwal Editorial Research Team",
      role: "Financial & Valuation Desk",
      bio: "Real estate financial analysts breaking down land valuation models and statutory tax liabilities.",
    },
    heroImage: "/images/about/office-consultation.jpg",
    publishedAt: "2026-08-14",
    updatedAt: "2026-08-18",
    lastReviewedAt: "2026-08-18",
    reviewStatus: "approved",
    featured: false,
    readingTimeMinutes: 7,
    relatedLocationSlugs: ["jaipur", "navi-mumbai", "ajmer"],
    relatedPropertySlugs: ["royal-palms-township-ajmer-road-jaipur", "aravalli-greens-retreat-plots-ajmer"],
    relatedArticleSlugs: ["essential-guide-plot-buying", "understanding-property-documentation"],
    downloadableResourceSlugs: ["land-pricing-and-charges-worksheet"],
    keyTakeaways: [
      "The advertised 'Base Rate per Sq. Yard' rarely represents the final out-of-pocket acquisition cost.",
      "Preferential Location Charges (PLC) for corner plots, park-facing units, or wide boulevard frontages typically add 5% to 15% to base land costs.",
      "Account for External Development Charges (EDC), clubhouse security deposits, and prepaid maintenance fees.",
      "Budget 6% to 9% of the total registered transaction value for state stamp duty, municipal cess, and sub-registrar registration charges.",
    ],
    sections: [
      {
        id: "anatomy-of-land-pricing",
        heading: "1. The Anatomy of Total Acquisition Cost",
        paragraphs: [
          "When budgeting for a residential or commercial plot, calculate your Total Acquisition Cost (TAC) by aggregating base land costs, developer infrastructure charges, and statutory state levies.",
        ],
        checklist: [
          "Base Land Rate (Calculated per Sq. Yard or Sq. Meter)",
          "Preferential Location Charges (PLC) — Corner, Park Facing, Boulevard",
          "External Development Charges (EDC) & Infrastructure Development Charges (IDC)",
          "Clubhouse Membership & Common Amenity Maintenance Deposit",
          "State Government Stamp Duty & Local Surcharge",
          "Sub-Registrar Official Registration Fee (typically 1% of registry value)",
          "Legal Title Search & Advocate Documentation Fees",
        ],
      },
      {
        id: "understanding-plc",
        heading: "2. Understanding Preferential Location Charges (PLC)",
        paragraphs: [
          "Developers levy PLC premiums for plots with specific architectural advantages. Common categories include:",
          "• Corner Plots: Dual road frontage delivering superior ventilation, sunlight, and access (5% to 10% premium).",
          "• Park Facing Plots: Direct unobstructed green views with no front development (5% to 8% premium).",
          "• Boulevard Frontage: Positioned along the 60ft or 80ft main spine road (5% to 10% premium).",
        ],
      },
      {
        id: "stamp-duty-and-taxes",
        heading: "3. Statutory State Stamp Duty & Registration",
        paragraphs: [
          "Stamp duty is a non-negotiable state government tax levied on property conveyances. Stamp duty rates vary by state, gender of the buyer, and municipal classification (typically 5% to 6% in Rajasthan and 5% to 7% in Maharashtra, plus registration fee and local transport surcharges).",
        ],
      },
    ],
    sources: [
      {
        title: "Registration & Stamps Department Official Circulars",
        publisher: "Government of Rajasthan Stamps & Registration",
        url: "https://igrs.rajasthan.gov.in",
        accessedAt: "2026-08-16",
      },
      {
        title: "Department of Registration & Stamps",
        publisher: "Government of Maharashtra (IGR Maharashtra)",
        url: "https://igrmaharashtra.gov.in",
        accessedAt: "2026-08-16",
      },
    ],
  },
];

// Helper functions
export function getAllApprovedArticles(): InsightArticle[] {
  return insights.filter((art) => art.reviewStatus === "approved");
}

export function getFeaturedArticle(): InsightArticle {
  const featured = insights.find((art) => art.featured && art.reviewStatus === "approved");
  return featured || getAllApprovedArticles()[0];
}

export function getArticleBySlug(slug: string): InsightArticle | undefined {
  return insights.find(
    (art) => art.slug.toLowerCase() === slug.toLowerCase() && art.reviewStatus === "approved"
  );
}

export function getRelatedArticles(currentSlug: string, count: number = 3): InsightArticle[] {
  const current = getArticleBySlug(currentSlug);
  if (!current) return [];

  const others = getAllApprovedArticles().filter(
    (art) => art.slug.toLowerCase() !== currentSlug.toLowerCase()
  );

  // Match by relatedArticleSlugs first, then by category
  const explicitRelated = others.filter((art) =>
    current.relatedArticleSlugs?.some((relSlug) => relSlug.toLowerCase() === art.slug.toLowerCase())
  );

  const categoryRelated = others.filter(
    (art) =>
      art.category === current.category &&
      !explicitRelated.some((exp) => exp.slug === art.slug)
  );

  return [...explicitRelated, ...categoryRelated, ...others].slice(0, count);
}

export function getArticlesByCategory(category: string): InsightArticle[] {
  if (!category || category === "all") return getAllApprovedArticles();
  return getAllApprovedArticles().filter(
    (art) => art.category.toLowerCase() === category.toLowerCase()
  );
}

export function getArticlesByLocation(locationSlug: string): InsightArticle[] {
  return getAllApprovedArticles().filter((art) =>
    art.relatedLocationSlugs?.some(
      (loc) => loc.toLowerCase() === locationSlug.toLowerCase()
    )
  );
}

import { InsightArticle } from "../types/insight";

export const insights: InsightArticle[] = [
  {
    slug: "essential-guide-plot-buying",
    title: "The Comprehensive Land & Plot Buying Due Diligence Guide",
    metaTitle: "Plot Buying Due Diligence Guide",
    metaDescription: "Step-by-step due diligence for buying plotted land: check statutory sanctions, understand conversion orders and avoid unapproved agricultural layouts.",
    excerpt:
      "A step-by-step masterplan for evaluating freehold plotted land, verifying statutory development sanctions, understanding conversion orders, and avoiding unapproved agricultural layouts.",
    category: "Property Buying Guides",
    tags: ["Plot Buying", "Due Diligence", "JDA", "RERA", "Land Title"],
    author: {
      name: "Ratiwal Editorial Research Team",
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
    relatedArticleSlugs: [
      "understanding-property-documentation",
      "rera-fundamentals-for-plot-buyers",
      "section-90a-land-conversion-rajasthan",
      "types-of-jda-patta-jaipur-verification",
    ],
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
          "Under state revenue laws (such as Section 90A of the Rajasthan Land Revenue Act), agricultural land must be formally surrendered to the planning authority (e.g., Jaipur Development Authority) and regularized with a formal land use conversion order before [residential plots in Jaipur](/locations/jaipur) can be demarcated and registered.",
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
          "Paper approvals must be validated on the ground. During your physical site inspection, verify that the plot boundaries match the exact Total Station coordinate survey, as practiced across verified townships like [Neelkanth Nagar](/properties/neelkanth-nagar).",
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
    metaTitle: "Land Titles, 90A & Revenue Extracts",
    metaDescription: "A legal guide to Jamabandi, Khasra Milan maps, 7/12 extracts, title deeds and mutation, explained for plot buyers in Rajasthan and Maharashtra.",
    excerpt:
      "A comprehensive legal guide decoding Jamabandi (Parcha Khatauni), Khasra Milan maps, 7/12 extracts, title deeds, and municipal mutation protocols across Rajasthan and Maharashtra.",
    category: "Legal & Documentation",
    tags: ["Land Titles", "Jamabandi", "7/12 Extract", "Revenue Records", "Mutation"],
    author: {
      name: "Ratiwal Editorial Research Team",
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
    relatedArticleSlugs: [
      "essential-guide-plot-buying",
      "rera-fundamentals-for-plot-buyers",
      "section-90a-land-conversion-rajasthan",
      "types-of-jda-patta-jaipur-verification",
    ],
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
          "A title search involves auditing past conveyance deeds, partition deeds, gift deeds, and release deeds registered against the property's Khasra or Survey Number for at least 30 continuous years, standard due diligence applied across our [Jaipur corridor properties](/locations/jaipur) including [Riyasat Paradise II](/properties/riyasat-paradise-ii).",
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
    metaTitle: "RERA Safeguards for Plot Buyers",
    metaDescription: "How the RERA Act protects plot buyers: escrow account rules, layout disclosure requirements and project completion timelines, explained simply.",
    excerpt:
      "How the Real Estate (Regulation and Development) Act protects plot buyers: escrow account rules, layout disclosure mandates, and statutory project completion timelines.",
    category: "RERA Education",
    tags: ["RERA", "Buyer Protection", "Escrow", "Plotted Townships", "MahaRERA"],
    author: {
      name: "Ratiwal Editorial Research Team",
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
          "Before issuing any cheque, visit the official state RERA portal (e.g., rera.rajasthan.gov.in or maharera.mahaonline.gov.in) and enter the project registration number, a transparency standard maintained across verified projects like [Vrindavan Viihaar](/properties/vrindavan-viihaar) in the [Ajmer corridor](/locations/ajmer).",
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
    metaTitle: "Plot Site Visit Inspection Protocol",
    metaDescription: "A practical protocol for inspecting a plot on site: access roads, natural drainage, boundary pegs and power line setbacks, before you commit.",
    excerpt:
      "A practical engineering and legal protocol for evaluating physical access roads, natural drainage gradients, total station boundary pegs, and power line setbacks.",
    category: "Site Visit & Evaluation",
    tags: ["Site Visit", "Inspection", "Survey", "Boundary Demarcation", "Infrastructure"],
    author: {
      name: "Ratiwal Editorial Research Team",
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
          "Modern premium townships install underground electricity cables, water supply pipelines, and optical fiber conduits. Inspect utility junction boxes, transformer locations, and dedicated underground sewage treatment plants (STP), key infrastructure benchmarks featured in [Aero Crystal](/properties/aero-crystal) within the [Kishangarh growth corridor](/locations/kishangarh).",
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
    metaTitle: "Verify Infrastructure Claims",
    metaDescription: "How to tell approved, funded infrastructure from speculative announcements along the Delhi-Mumbai Expressway, ring roads and airport corridors.",
    excerpt:
      "How to distinguish approved, funded infrastructure projects from speculative developer announcements across the Delhi-Mumbai Expressway, Ring Roads, and Airport nodes.",
    category: "Market Intelligence",
    tags: ["Infrastructure", "Masterplans", "Corridors", "Expressways", "NMIA"],
    author: {
      name: "Ratiwal Editorial Research Team",
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
          "Real estate marketing frequently conflates conceptual proposals with operational infrastructure. To make informed investment decisions, categorize all cited infrastructure into four distinct maturity phases across active belts like the [Jaipur Ring Road corridors](/locations/jaipur) and [Panvel growth node](/locations/panvel).",
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
          "When an expressway, metro line, or industrial corridor is cited as a selling point, look for the Section 3A / 3D Land Acquisition Notifications published in the Gazette of India or the State Gazette, essential when evaluating commercial land along transport arteries like [Happy Business Park](/properties/happy-business-park).",
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
    metaTitle: "Plot Pricing & Additional Charges",
    metaDescription: "Understand every cost in a land purchase: base rate, corner plot premium, external development charges and registration taxes such as stamp duty.",
    excerpt:
      "A complete financial breakdown of all costs associated with land acquisition: understanding basic land rates, corner plot premiums, external development levies, and statutory registration taxes.",
    category: "Property Buying Guides",
    tags: ["Land Pricing", "PLC", "Stamp Duty", "Registration", "Additional Charges"],
    author: {
      name: "Ratiwal Editorial Research Team",
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
          "When budgeting for a residential or commercial plot, calculate your Total Acquisition Cost (TAC) by aggregating base land costs, developer infrastructure charges, and statutory state levies across [verified property listings](/properties).",
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
          "• Boulevard Frontage: Positioned along the 60ft or 80ft main spine road (5% to 10% premium), typical in organized township layouts such as [Bhumija Green Block A](/properties/bhumija-green-block-a).",
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
  {
    slug: "section-90a-land-conversion-rajasthan",
    title: "Section 90-A Rajasthan Land Revenue Act: Complete Agricultural to Non-Agricultural Plot Conversion Guide",
    metaTitle: "Section 90-A Land Conversion Guide",
    metaDescription: "Step-by-step statutory guide to Section 90-A land conversion in Rajasthan: surrender procedure, Tehsildar inquiry, JDA layout sanction and Patta issuance.",
    excerpt: "A comprehensive statutory breakdown of Section 90-A under the Rajasthan Land Revenue Act, explaining how agricultural land is legally surrendered, regularized, and approved for residential plotted townships.",
    category: "Legal & Documentation",
    tags: ["Section 90-A", "Land Conversion", "Rajasthan Land Revenue Act", "JDA Approval", "Plot Registry", "Due Diligence"],
    author: {
      name: "Ratiwal Editorial Research Team",
      role: "Land Advisory & Due Diligence Desk",
      bio: "Senior research analysts and statutory planning specialists focusing on plotted land corridors across Rajasthan and Maharashtra.",
    },
    reviewer: {
      name: "Advocate R. Sharma",
      role: "High Court Revenue & Property Title Counsel",
      reviewType: "legal",
      reviewedAt: "2026-09-02",
    },
    heroImage: "/images/locations/jaipur.jpg",
    publishedAt: "2026-09-01",
    updatedAt: "2026-10-15",
    lastReviewedAt: "2026-10-15",
    reviewStatus: "approved",
    featured: false,
    readingTimeMinutes: 8,
    relatedLocationSlugs: ["jaipur", "ajmer", "kishangarh"],
    relatedPropertySlugs: ["neelkanth-nagar", "bhumija-green-block-a"],
    relatedArticleSlugs: ["understanding-property-documentation", "types-of-jda-patta-jaipur-verification", "essential-guide-plot-buying"],
    downloadableResourceSlugs: ["plot-buying-due-diligence-checklist", "property-document-request-sheet"],
    keyTakeaways: [
      "Section 90-A of the Rajasthan Land Revenue Act, 1956 is the sole statutory mechanism permitting agricultural Khatedari land surrender for non-agricultural development.",
      "The conversion process requires physical revenue verification, Jamabandi extract audits, public objection notices, and Tehsildar clearance before land vests in the local planning authority.",
      "Purchasing unapproved plots on agricultural land without a formal 90-A sanction leaves buyers vulnerable to demolition notices, municipal refusal of utilities, and absence of legal registry.",
      "Town Planning layout sanction and building bylaws only take legal effect once the 90-A conversion order is formally notified and development levies are paid.",
    ],
    sections: [
      {
        id: "statutory-foundation-of-section-90a",
        heading: "1. The Statutory Framework of Section 90-A in Rajasthan",
        paragraphs: [
          "In Rajasthan, all land initially categorized as agricultural (Khatedari land) is governed by the Rajasthan Tenancy Act, 1955 and the Rajasthan Land Revenue Act, 1956. Private individuals and developers cannot simply subdivide agricultural land into residential plots and sell them directly to home builders.",
          "To convert agricultural acreage into lawful residential or commercial parcels, the landholder must invoke Section 90-A of the Rajasthan Land Revenue Act. Under this statutory mechanism, the Khatedar formally surrenders agricultural tenancy rights to the State Government or local development body. This legal conversion is an absolute prerequisite before purchasing [residential plots in Jaipur](/locations/jaipur) or any other urban jurisdiction in the state.",
        ],
        callout: {
          type: "important",
          title: "Surrender Rather Than Mere Permission",
          text: "Unlike simple land-use change in some states, Section 90-A legally extinguishes agricultural tenancy. The land vests in the urban local body or development authority, which subsequently grants plotted leases or Pattas with sanctioned road networks.",
        },
      },
      {
        id: "the-conversion-workflow-and-revenue-inquiry",
        heading: "2. The Revenue Inquiry & Tehsildar Verification Process",
        paragraphs: [
          "The Section 90-A application triggers a mandatory multi-tier administrative review. The competent authority—typically the Sub-Divisional Officer (SDO) or Authorized Officer of the Jaipur Development Authority (JDA)—directs the local Tehsildar and Patwari to conduct an exhaustive field and title audit.",
          "The revenue inquiry verifies that the land is not government Siway Chak (unoccupied state land), Charagah (pasture land), catchment area of water bodies, or subject to land ceiling litigation under the Rajasthan Imposition of Ceiling on Agricultural Holdings Act.",
        ],
        checklist: [
          "Title check against current Jamabandi (Record of Rights) and Girdawari (crop inspection register)",
          "Mandatory 30-day public objection notice published in state newspapers and local revenue boards",
          "Verification of non-encumbrance and absence of pending revenue court disputes",
          "Payment of state conversion premiums and regularisation charges into the government treasury",
        ],
      },
      {
        id: "layout-sanction-and-town-planning-controls",
        heading: "3. Layout Sanction, Open Spaces & Infrastructure Standards",
        paragraphs: [
          "Upon formal acceptance of the surrender under Section 90-A, the planning authority examines the layout scheme submitted by the developer. The layout must comply strictly with state town planning standards, allocating minimum sector road widths (typically 40ft, 60ft, or 80ft) and mandatory reservations for parks, commercial conveniences, and public utilities.",
          "In verified developments such as [Neelkanth Nagar](/properties/neelkanth-nagar), internal sector roads and service alignments are demarcated in full conformity with the sanctioned 90-A scheme map, ensuring hassle-free municipal approvals and independent utility connections.",
        ],
      },
      {
        id: "buyer-verification-checklist",
        heading: "4. Buyer's Verification Protocol: How to Check 90-A Authenticity",
        paragraphs: [
          "Prospective plot buyers must never accept verbal assurances of 'pending' or 'applied-for' 90-A status. Always request the certified copy of the Section 90-A Conversion Order bearing the official seal, dispatch number, and scheduled Khasra numbers.",
          "Cross-reference the Khasra numbers listed in the 90-A order with the physical plot demarcation and the registered title deeds. Buyers can safeguard their investment by following [Ratiwal Dream Estates due diligence](/why-choose-us), ensuring complete legal title clarity before disbursing token advances.",
        ],
      },
    ],
    sources: [
      {
        title: "The Rajasthan Land Revenue Act, 1956 (Act No. 15 of 1956)",
        publisher: "Revenue Department, Government of Rajasthan",
        url: "https://landrevenue.rajasthan.gov.in",
        accessedAt: "2026-09-01",
      },
      {
        title: "Section 90-A Land Conversion Rules and Orders",
        publisher: "Jaipur Development Authority (JDA)",
        url: "https://urban.rajasthan.gov.in/content/raj/udh/jda-jaipur/en/home.html",
        accessedAt: "2026-09-01",
      },
      {
        title: "Model Town Planning Regulations for Plotted Developments",
        publisher: "Urban Development & Housing (UDH) Department, Rajasthan",
        url: "https://urban.rajasthan.gov.in",
        accessedAt: "2026-09-01",
      },
    ],
  },
  {
    slug: "types-of-jda-patta-jaipur-verification",
    title: "Types of JDA Patta in Jaipur: Complete Verification, Registry & Legal Validity Guide",
    metaTitle: "Types of JDA Patta in Jaipur",
    metaDescription: "Comprehensive guide to JDA Patta types in Jaipur: 90-A Plotted Patta, Regularization Patta, Lease Deed vs Freehold, Society Patta risks, and verification.",
    excerpt: "An exhaustive legal guide analyzing every category of JDA Patta in Jaipur, contrasting planned 90-A township deeds with regularization Pattas and warning against high-risk society paper.",
    category: "Legal & Documentation",
    tags: ["JDA Patta", "Jaipur Real Estate", "Patta Verification", "Property Due Diligence", "Jaipur Development Authority", "Land Registry"],
    author: {
      name: "Ratiwal Editorial Research Team",
      role: "Land Advisory & Due Diligence Desk",
      bio: "Senior research analysts and statutory planning specialists focusing on plotted land corridors across Rajasthan and Maharashtra.",
    },
    reviewer: {
      name: "Advocate R. Sharma",
      role: "High Court Revenue & Property Title Counsel",
      reviewType: "legal",
      reviewedAt: "2026-09-12",
    },
    heroImage: "/images/locations/jaipur.jpg",
    publishedAt: "2026-09-10",
    updatedAt: "2026-10-20",
    lastReviewedAt: "2026-10-20",
    reviewStatus: "approved",
    featured: false,
    readingTimeMinutes: 9,
    relatedLocationSlugs: ["jaipur"],
    relatedPropertySlugs: ["riyasat-paradise-ii", "riyasat-heritage-extension"],
    relatedArticleSlugs: ["section-90a-land-conversion-rajasthan", "understanding-property-documentation", "essential-guide-plot-buying"],
    downloadableResourceSlugs: ["plot-buying-due-diligence-checklist", "property-document-request-sheet"],
    keyTakeaways: [
      "A JDA Patta represents conclusive municipal title issued under the Jaipur Development Authority Act, 1982, guaranteeing legal ownership and mortgage eligibility.",
      "Plotted Scheme Pattas (issued following Section 90-A conversion) offer the highest grade of title security with pre-sanctioned infrastructure and transparent layout plans.",
      "Regularization Pattas issued under state campaigns (such as Prashasan Shahron Ke Sang) validate pre-existing unapproved colonies but require verification of internal road widths and civic levies.",
      "Housing Society Pattas issued after June 17, 1999 without subsequent JDA conversion are void under Rajasthan High Court directives and cannot be registered.",
    ],
    sections: [
      {
        id: "what-is-a-jda-patta",
        heading: "1. What is a JDA Patta & Why is it Critical in Jaipur?",
        paragraphs: [
          "A JDA Patta is a statutory lease deed or conveyance document issued by the Jaipur Development Authority under the Jaipur Development Authority Act, 1982. It transfers leasehold or freehold title of a demarcated urban plot from the municipal planning body to an individual allottee or developer.",
          "In the [Jaipur property investment corridor](/locations/jaipur), owning a property backed by a genuine JDA Patta is the gold standard of real estate security. Nationalized and private commercial banks mandate a verified JDA Patta before sanctioning home construction loans, and municipal authorities require it for granting water, electricity, and building permission sanctions.",
        ],
        callout: {
          type: "tip",
          title: "Bank Collateral Standard",
          text: "Banks and housing finance companies (HFCs) strictly refuse mortgage lending on unapproved society receipts. A formal JDA Patta with Sub-Registrar endorsement is essential for institutional finance.",
        },
      },
      {
        id: "the-three-primary-types-of-jda-patta",
        heading: "2. The Three Primary Categories of JDA Patta",
        paragraphs: [
          "Not all Pattas carry identical origins. Understanding the legal provenance of your document is critical to assessing future resale liquidity and infrastructure standards.",
        ],
        subsections: [
          {
            heading: "A. Section 90-A Plotted Scheme Patta (Township Patta)",
            paragraphs: [
              "Issued when a private developer converts agricultural land through Section 90-A, develops internal sector roads, drainage, and parks, and hands over public utility zones to JDA. Each individual plot receives an independent Patta. Master-planned developments like [Riyasat Paradise II](/properties/riyasat-paradise-ii) exemplify this high-integrity plotted category.",
            ],
          },
          {
            heading: "B. Regularization Patta (Prashasan Shahron Ke Sang)",
            paragraphs: [
              "Issued during periodic state government regularization campaigns to regularize historic settlements and unapproved colonies developed prior to cutoff dates. While legally valid, buyers must confirm that all betterment charges, development levies, and lease rentals were fully paid.",
            ],
          },
          {
            heading: "C. JDA Direct Allotment / Auction Patta",
            paragraphs: [
              "Issued directly by the JDA for plots carved out in government sectors (e.g., Jagatpura, Vidyadhar Nagar, Prithviraj Nagar) via lottery schemes or public e-auctions. These represent pristine institutional title.",
            ],
          },
        ],
      },
      {
        id: "the-society-patta-hazard",
        heading: "3. The Housing Society Patta Hazard: The 1999 Cutoff",
        paragraphs: [
          "A pervasive risk in the Jaipur land market involves Housing Cooperative Society Pattas (Grah Nirman Sahakari Samiti). Decades ago, cooperative societies purchased farmland and distributed private allotment letters without municipal approval.",
          "By virtue of landmark rulings by the Rajasthan High Court and state government notifications, any society allotment dated post-June 17, 1999 on unapproved land is legally void. Buyers holding raw society paper must undergo formal JDA regularization camps to acquire lawful municipal title. Thorough [due diligence and legal verification](/insights/understanding-property-documentation) should always precede any transaction involving society origins.",
        ],
        callout: {
          type: "warning",
          title: "Backdated Society Paper Risk",
          text: "Unscrupulous intermediaries often fabricate pre-1999 society receipts to mislead buyers. Authentic registration at the Sub-Registrar office with verified stamp duty receipts is the only proof of genuine acquisition.",
        },
      },
      {
        id: "online-and-offline-verification-protocol",
        heading: "4. Step-by-Step JDA Patta Verification Framework",
        paragraphs: [
          "Before executing an agreement to sell, every plot buyer should conduct a systematic dual verification across both digital and physical revenue channels.",
        ],
        checklist: [
          "Online Verification via JDA Citizen Portal: Search by Scheme Name, Zone, and Plot Number to confirm allotment status and verify that no stay order exists.",
          "Sub-Registrar Index-II Audit: Confirm that the Patta was formally registered with the local Sub-Registrar and that stamp duty was paid on the market value.",
          "Zone Deputy Commissioner Office Search: Request an official inspection of the scheme file at the respective JDA Zonal office (Zones 1 through 14).",
          "Non-Encumbrance Certificate (NEC): Obtain a certified 30-year NEC from a practicing revenue advocate to rule out prior mortgages or court attachments.",
        ],
      },
    ],
    sources: [
      {
        title: "The Jaipur Development Authority Act, 1982 (Act No. 25 of 1982)",
        publisher: "Urban Development & Housing Department, Rajasthan",
        url: "https://urban.rajasthan.gov.in/content/raj/udh/jda-jaipur/en/home.html",
        accessedAt: "2026-09-10",
      },
      {
        title: "Guidelines for Regularization of Housing Schemes in Urban Areas",
        publisher: "Jaipur Development Authority (JDA)",
        url: "https://urban.rajasthan.gov.in",
        accessedAt: "2026-09-10",
      },
      {
        title: "Registration Manual & E-Panjiyan Online Verification",
        publisher: "Registration & Stamps Department, Rajasthan",
        url: "https://epanjiyan.nic.in",
        accessedAt: "2026-09-10",
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

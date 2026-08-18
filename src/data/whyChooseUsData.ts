export interface TrustPrinciple {
  number: string;
  title: string;
  description: string;
  iconName: "shield" | "message" | "compass";
}

export interface VerificationStep {
  stepNumber: string;
  title: string;
  shortDesc: string;
  details: string[];
  keyOutcome: string;
}

export interface RiskMatrixRow {
  id: string;
  area: string;
  categoryBadge: string;
  questions: string;
  buyerOutput: string;
  typicalDiligenceItems: string[];
}

export interface ComparisonPoint {
  unstructured: string;
  ratwalApproach: string;
}

export interface BuyerDeliverable {
  id: string;
  title: string;
  tag: string;
  description: string;
  itemsIncluded: string[];
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  relatedLink?: {
    label: string;
    href: string;
  };
}

export const whyChooseUsData = {
  hero: {
    index: "01 / WHY RATWAL",
    eyebrow: "WHY RATWAL DREAM ESTATES",
    headline: "Clarity before commitment.",
    supportingCopy:
      "We help buyers and investors evaluate opportunities through structured verification, transparent information, and experienced local guidance.",
    primaryCta: {
      label: "Discuss your requirements",
      href: "/contact",
    },
    secondaryCta: {
      label: "Explore verified properties",
      href: "/properties",
    },
    trustMicrocopy: "Clear information. Document-led guidance. No pressure.",
    refNumber: "REF: RDE-VERIF-2026",
    geoLine: "26.9124° N, 75.7873° E • JAIPUR ADVISORY DESK",
  },

  principles: [
    {
      number: "01",
      title: "Verification before recommendation",
      description:
        "Relevant property information and available documentation are reviewed before an opportunity is presented as suitable.",
      iconName: "shield",
    },
    {
      number: "02",
      title: "Transparent property communication",
      description:
        "Pricing, availability, specifications, and known conditions are communicated clearly without unnecessary pressure.",
      iconName: "message",
    },
    {
      number: "03",
      title: "Local market understanding",
      description:
        "Recommendations consider location fundamentals, infrastructure, access, development activity, and the buyer’s long-term goals.",
      iconName: "compass",
    },
  ] as TrustPrinciple[],

  verificationProtocol: {
    eyebrow: "OUR REVIEW PROCESS",
    headline: "A structured approach to property verification.",
    lead: "Every plot showcased in our portfolio undergoes a six-stage preliminary information synthesis before introduction.",
    disclaimer:
      "Document review and advisory support do not replace independent legal, financial, technical, or tax advice.",
    steps: [
      {
        stepNumber: "01",
        title: "Property information collection",
        shortDesc: "Collect available ownership, project, pricing, location, and authorization information.",
        details: [
          "Collation of developer prospectuses and sanctioned layout drawings.",
          "Preliminary extraction of plot numbering, dimensions, and road widths.",
          "Collection of developer authorization letters and marketing mandates.",
        ],
        keyOutcome: "Baseline project dossier assembled.",
      },
      {
        stepNumber: "02",
        title: "Ownership and authorization review",
        shortDesc: "Review available seller, landowner, developer, or representative information.",
        details: [
          "Cross-referencing stated ownership records against revenue entries (Jamabandi/Khatedari).",
          "Verification of power of attorney (POA) validity where third-party representation applies.",
          "Identification of all co-owners and legal entities named in the title chain.",
        ],
        keyOutcome: "Clear seller representation status identified.",
      },
      {
        stepNumber: "03",
        title: "Approval and regulatory review",
        shortDesc: "Identify applicable approvals, land-use status, and available RERA information.",
        details: [
          "Verification of statutory land conversion orders (e.g., Section 90A under Rajasthan Land Revenue Act).",
          "Inspection of sanctioned layout approvals by competent bodies (JDA, UIT, Town Planning).",
          "Recording of state RERA registration numbers or verifying statutory exemption criteria.",
        ],
        keyOutcome: "Regulatory sanction classification documented.",
      },
      {
        stepNumber: "04",
        title: "Site and access assessment",
        shortDesc: "Review site access, boundaries, surrounding development, and physical conditions.",
        details: [
          "Ground inspection of approach road connectivity and right-of-way width.",
          "Physical verification of boundary demarcation stones and topography.",
          "Assessment of proximity to high-tension lines, water bodies, or encroaching buffer zones.",
        ],
        keyOutcome: "Physical site viability report generated.",
      },
      {
        stepNumber: "05",
        title: "Commercial information review",
        shortDesc: "Clarify quoted price, applicable charges, payment stages, and material commercial conditions.",
        details: [
          "Itemization of base rate per sq. yard, PLC, club charges, and electrification costs.",
          "Review of milestone payment schedules and linkage to development phases.",
          "Estimation of statutory registry stamp duties and municipal transfer fees.",
        ],
        keyOutcome: "Comprehensive commercial cost sheet formulated.",
      },
      {
        stepNumber: "06",
        title: "Buyer documentation support",
        shortDesc: "Help organize the available documents and questions required before commitment.",
        details: [
          "Compiling a structured document pack for the buyer's independent legal advocate.",
          "Formulating specific title search inquiries for the local Sub-Registrar office.",
          "Assisting in drafting clear bilateral booking conditions and timeline terms.",
        ],
        keyOutcome: "Buyer equipped for confident independent legal evaluation.",
      },
    ] as VerificationStep[],
  },

  directCommunicationModel: {
    eyebrow: "TRANSPARENT ACCESS",
    headline: "A clearer path between opportunity and decision.",
    lead: "We eliminate opaque intermediaries by structuring a direct, accountable information pipeline between buyers and verified property principals.",
    nodes: [
      {
        title: "Property Owner or Developer",
        role: "Principal Asset Source",
        desc: "Sanctioned township colonizers, private landowners, or authorized institutional promoters.",
        badge: "Asset Principal",
      },
      {
        title: "Ratwal Information & Verification Layer",
        role: "Advisory & Diligence Bridge",
        desc: "Synthesizes documents, clarifies commercial terms, coordinates site access, and organizes verification dossiers.",
        badge: "Diligence Protocol",
      },
      {
        title: "Buyer or Investor",
        role: "Informed Decision Maker",
        desc: "Receives clear itemized costs, direct developer documentation, and retains complete decision control without sales pressure.",
        badge: "Direct Allocation",
      },
    ],
    diligencePoints: [
      "Ratwal coordinates available property information directly with source principals.",
      "Pricing and commercial terms are itemized without hidden markups.",
      "Buyer technical and legal questions are routed directly to authorized representatives.",
      "Documentation queries and title chains are organized before any financial commitment.",
      "The buyer retains transparent visibility into who owns, represents, and executes the development.",
    ],
  },

  riskMatrix: {
    eyebrow: "RISK-REDUCTION FRAMEWORK",
    headline: "Questions that should be answered before you commit.",
    lead: "We structure ten critical diligence domains so prospective buyers can systematically address potential ambiguities before signing contracts.",
    disclaimer:
      "Market values, regulatory approvals, inventory availability, and infrastructure timelines are dynamic and subject to government revision. Document review reduces information asymmetry but cannot eliminate general real estate market risks.",
    rows: [
      {
        id: "risk-ownership",
        area: "Ownership & Authority",
        categoryBadge: "Title",
        questions: "Who is the recorded titleholder in state revenue records? Does the seller possess full, unencumbered legal authority to alienate the parcel?",
        buyerOutput: "Collation of 30-year chain title deeds, Patta records, and Jamabandi revenue extracts for independent advocate vetting.",
        typicalDiligenceItems: ["Revenue Jamabandi", "Chain Title Deeds", "Power of Attorney Status", "Khatedari Records"],
      },
      {
        id: "risk-land-use",
        area: "Land-Use & Approvals",
        categoryBadge: "Sanctions",
        questions: "Is the land converted from agricultural to residential/commercial use? Has the competent authority formally sanctioned the layout plan?",
        buyerOutput: "Inspection of Section 90A Land Conversion Orders and town planning layout approval certificates.",
        typicalDiligenceItems: ["90A Conversion Order", "Sanctioned Masterplan Layout", "Local Authority Approval (JDA/UIT)", "Environmental Clearance (if applicable)"],
      },
      {
        id: "risk-rera",
        area: "RERA Applicability",
        categoryBadge: "Regulatory",
        questions: "Does the project require mandatory RERA registration? What is the official RERA registration number and declared completion deadline?",
        buyerOutput: "Direct linkage to official state RERA records or clear documentation of statutory exemption criteria.",
        typicalDiligenceItems: ["RERA Certificate", "Declared Phasing Schedule", "RERA Escrow Account Details", "Quarterly Progress Filings"],
      },
      {
        id: "risk-access",
        area: "Site Access & Boundaries",
        categoryBadge: "Physical",
        questions: "What is the exact width of the public approach road? Are boundary demarcation stones physically aligned with revenue maps?",
        buyerOutput: "Ground inspection report verifying right-of-way width, Aks Shajra revenue map alignment, and physical plot coordinates.",
        typicalDiligenceItems: ["Revenue Aks Shajra Map", "Approach Road Right-of-Way", "Boundary Pillar Verification", "Topographic Assessment"],
      },
      {
        id: "risk-pricing",
        area: "Pricing & Additional Charges",
        categoryBadge: "Commercial",
        questions: "What is included in the base quoted price? Are registration fees, PLC, maintenance security, electrification, and taxes separate?",
        buyerOutput: "Itemized commercial summary outlining total cost of acquisition with zero uncommunicated overheads.",
        typicalDiligenceItems: ["Itemized Cost Sheet", "PLC Parameters", "Stamp Duty & Registration Estimation", "Maintenance Deposit Schedule"],
      },
      {
        id: "risk-infrastructure",
        area: "Infrastructure & Connectivity",
        categoryBadge: "Macro",
        questions: "What internal and external infrastructure is operational versus proposed? What are the verified distances to major transit corridors?",
        buyerOutput: "Objective infrastructure audit separating operational roads/services from proposed government masterplan milestones.",
        typicalDiligenceItems: ["Internal Road Paving Status", "Water/Electricity Grid Hookup", "Distance to Major Expressways", "Transit Masterplan Timeline"],
      },
      {
        id: "risk-payment",
        area: "Payment Stages & Milestones",
        categoryBadge: "Financial",
        questions: "How are installment payments structured? Are disbursements tied to verified on-ground development milestones?",
        buyerOutput: "Transparent milestone disbursement schedule aligned with physical construction progress or registry readiness.",
        typicalDiligenceItems: ["Construction-Linked Plan", "Time-Linked Milestone Terms", "Escrow Remittance Instructions", "Possession Timeline"],
      },
      {
        id: "risk-docs",
        area: "Documentation Availability",
        categoryBadge: "Legal",
        questions: "Are all necessary draft agreements (Agreement for Sale, Allotment Letter, Maintenance Contract) available for pre-review?",
        buyerOutput: "Structured document pack provided to the buyer's counsel well in advance of execution.",
        typicalDiligenceItems: ["Draft Agreement for Sale", "Standard Allotment Terms", "Maintenance By-Laws", "Possession Letter Format"],
      },
      {
        id: "risk-developer",
        area: "Developer & Seller Background",
        categoryBadge: "Entity",
        questions: "What is the historical delivery track record of the promoter? Have previous township phases been delivered with registry handovers?",
        buyerOutput: "Factual track-record compilation detailing promoter's completed projects and past layout deliveries.",
        typicalDiligenceItems: ["Promoter Delivery History", "Past Project Registries", "Corporate Entity Filings", "Operational Township Benchmarks"],
      },
      {
        id: "risk-exit",
        area: "Exit & Investment Considerations",
        categoryBadge: "Strategic",
        questions: "What is the micro-market supply trajectory? What are the realistic holding horizon considerations for end-use vs. resale?",
        buyerOutput: "Comparative micro-market density review evaluating neighborhood absorption and secondary market liquidity factors.",
        typicalDiligenceItems: ["Micro-Market Supply Trends", "Neighborhood Habitation Rates", "End-Use Infrastructure Triggers", "Resale Transfer Terms"],
      },
    ] as RiskMatrixRow[],
  },

  comparison: [
    {
      unstructured: "Information fragmented across unverified classifieds and multiple middlemen",
      ratwalApproach: "Bespoke investor requirements established first with curated direct listings",
    },
    {
      unstructured: "Inconsistent rate quotations and hidden post-booking development overheads",
      ratwalApproach: "Transparent, itemized commercial cost sheet with all known statutory charges",
    },
    {
      unstructured: "Unclear land conversion, revenue status, and unverified layout sanctions",
      ratwalApproach: "Structured 6-stage verification review with organized document dossiers",
    },
    {
      unstructured: "High sales pressure to deposit non-refundable token deposits immediately",
      ratwalApproach: "Document-led guidance allowing thorough independent legal review",
    },
    {
      unstructured: "Generic corridor hype without micro-market infrastructure ground reality",
      ratwalApproach: "Objective micro-market analysis separating existing from proposed amenities",
    },
    {
      unstructured: "Advisory stops once booking token is transferred to third party",
      ratwalApproach: "Buyer support through registry coordination, demarcation, and post-sale advisory",
    },
  ] as ComparisonPoint[],

  deliverables: [
    {
      id: "del-summary",
      title: "Property & Corridor Dossier",
      tag: "Asset Profile",
      description: "A synthesized profile detailing the plotted development, developer credentials, sanctioned masterplan, and surrounding growth vector.",
      itemsIncluded: ["Executive Project Summary", "Masterplan Layout Sheet", "Developer Background Dossier", "Corridor Growth Drivers"],
    },
    {
      id: "del-connectivity",
      title: "Location & Transit Analysis",
      tag: "Micro-Market",
      description: "Precise geographic analysis charting operational road widths, highway interchanges, and civic amenities within a 15-minute radius.",
      itemsIncluded: ["High-Res Cadastral Map Alignment", "Operational Road Width Verification", "Driving Time Benchmark Matrix", "Upcoming Public Infrastructure Review"],
    },
    {
      id: "del-commercial",
      title: "Itemized Commercial Summary",
      tag: "Financial",
      description: "A complete commercial breakdown detailing base rate, PLC, electrification, club charges, and estimated stamp duty fees.",
      itemsIncluded: ["All-Inclusive Cost Sheet", "Milestone Payment Schedule", "Stamp Duty & Registration Estimates", "Developer Escrow Remittance Terms"],
    },
    {
      id: "del-checklist",
      title: "Legal Diligence Checklist",
      tag: "Verification",
      description: "A organized checklist of all available title, revenue, and sanction records for review by your independent advocate.",
      itemsIncluded: ["Section 90A Land Conversion Copy", "RERA Filing Reference Dossier", "Sub-Registrar Search Questions Guide", "Demarcation & Possession Terms"],
    },
  ] as BuyerDeliverable[],

  advisorSection: {
    eyebrow: "PERSONAL GUIDANCE",
    headline: "Advice shaped around your property goals.",
    lead: "Our advisory team combines deep on-ground micro-market knowledge with meticulous documentation discipline across Rajasthan and Maharashtra.",
    councilTitle: "Ratiwal Dream Estates Advisory Council",
    description: "Every client mandate is handled by dedicated land advisory specialists who prioritize capital security, documentation clarity, and personalized site inspections over transaction volume.",
    pillars: [
      "Direct consultation with localized micro-market advisors",
      "Tailored plotted portfolios based on budget and horizon",
      "Seamless private site inspection coordination with vehicle support",
      "Continuous post-purchase consultation and possession guidance",
    ],
  },

  faqs: [
    {
      id: "faq-shortlist",
      question: "How does Ratiwal Dream Estates shortlist properties for its portfolio?",
      answer: "We evaluate prospective opportunities against a rigorous intake checklist: verifiable revenue ownership (Jamabandi/Khatedari), sanctioned layout approvals from local authorities (JDA, UIT, Town Planning), lawful land conversion status (Section 90A), clear approach road access, and verified developer track records.",
    },
    {
      id: "faq-legal-verification",
      question: "Does Ratiwal Dream Estates verify property documents?",
      answer: "We conduct preliminary documentation reviews and compile organized title dossiers (including chain title deeds, conversion orders, and sanction maps). However, our review serves as an advisory coordination service and does not replace formal title scrutiny by the buyer's independent legal advocate.",
      relatedLink: {
        label: "Read our Legal & RERA Disclaimer",
        href: "/disclaimer",
      },
    },
    {
      id: "faq-direct-owner",
      question: "Is every property listed directly by the landowner?",
      answer: "Our portfolio features direct landowner parcels, authorized developer townships, and institutional co-development mandates. Each listing is clearly tagged with its verified representation status (e.g., 'Direct Owner', 'Developer Authorized', or 'Verified Resale') so buyers have transparent visibility into the asset principal.",
    },
    {
      id: "faq-guarantee",
      question: "Does Ratiwal Dream Estates guarantee property appreciation or rental returns?",
      answer: "No. Real estate values fluctuate based on macroeconomic conditions, infrastructure pacing, and market cycles. While we highlight micro-markets with strong structural tailwinds, we never make assured return promises or speculative capital appreciation guarantees.",
      relatedLink: {
        label: "Review Terms of Service",
        href: "/terms-of-service",
      },
    },
    {
      id: "faq-site-visit",
      question: "Can Ratiwal Dream Estates arrange a physical site visit?",
      answer: "Yes. We coordinate personalized physical site inspections across all our active corridors in Jaipur, Ajmer, Navi Mumbai, and Bhiwadi. Our advisors accompany you to inspect approach roads, boundary demarcation stones, and neighborhood infrastructure.",
    },
    {
      id: "faq-legal-tax-advice",
      question: "Does Ratiwal Dream Estates provide legal or tax advice?",
      answer: "No. While we provide estimated stamp duty schedules and explain standard revenue processes, we do not provide formal legal, tax, or accounting counsel. We encourage buyers to consult their certified chartered accountant and legal counsel for tax planning and final title clearance.",
    },
    {
      id: "faq-info-pack",
      question: "How can I request a property information pack or project dossier?",
      answer: "You can request a comprehensive project dossier by submitting your requirements on our Contact page or initiating a direct conversation with our advisory desk via WhatsApp. Our team will dispatch the available masterplans, cost sheets, and location dossiers.",
      relatedLink: {
        label: "Request Property Dossier",
        href: "/contact",
      },
    },
    {
      id: "faq-data-privacy",
      question: "How is my inquiry information used?",
      answer: "Your contact and requirement details are encrypted and utilized strictly by our internal advisory team to service your consultation mandate. We do not sell, rent, or monetize personal data with third-party telemarketers.",
      relatedLink: {
        label: "Read our Privacy Policy",
        href: "/privacy-policy",
      },
    },
  ] as FAQItem[],

  finalCta: {
    eyebrow: "BEGIN WITH A CONVERSATION",
    headline: "Find the right opportunity with greater clarity.",
    supportingText:
      "Tell us your requirements and our advisors will help you explore relevant, verified property opportunities across high-growth corridors.",
    primaryCta: {
      label: "Start a private conversation",
      href: "/contact",
    },
    secondaryCta: {
      label: "View all properties",
      href: "/properties",
    },
    microcopy: "Clear guidance. Document-led advisory. No pressure.",
  },
};

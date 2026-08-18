import { LegalPageData } from "@/types/legal";
import { siteConfig } from "@/config/site";

export const disclaimerData: LegalPageData = {
  slug: "/disclaimer",
  category: "RERA & Legal Regulatory Disclosure",
  title: "RERA & Legal Disclaimer",
  effectiveDate: "January 1, 2025",
  lastUpdated: "August 18, 2026",
  summary:
    "This disclaimer outlines the regulatory, statutory, and legal boundaries governing all property listings, market intelligence, masterplans, corridor forecasts, and advisory communications provided by Ratiwal Dream Estates.",
  noticeBanner: {
    badge: "Important Legal Notice",
    text: "Property information, pricing, availability, approvals, plans, dimensions, and specifications may change. Buyers should independently verify all material information and documents before making a financial commitment.",
  },
  sections: [
    {
      id: "general-disclaimer",
      sectionNumber: "01",
      title: "General Real-Estate Information Disclaimer",
      paragraphs: [
        `The information, content, listings, visual media, market analyses, and tools published on this website (ratiwaldreamestates.com) are provided by Ratiwal Dream Estates ("we," "us," or "our") solely for general informational and educational guidance.`,
        "While we strive to ensure that all information is meticulously sourced and accurately represented, the website content is provided on an 'as-is' and 'as-available' basis without warranties of any kind, whether express or implied.",
      ],
    },
    {
      id: "advisory-role",
      sectionNumber: "02",
      title: "Independent Consultancy & Advisory Role",
      paragraphs: [
        "Ratiwal Dream Estates operates strictly as an independent real estate consultancy, transaction facilitator, and strategic land advisory firm.",
        "We are neither the developers, builders, promoters, colonizers, nor the government sanctioning authorities for third-party plotted developments displayed on this website, unless an explicit joint-development or title mandate is expressly documented.",
        "Our role is limited to client representation, micro-market analysis, document coordination, site inspection logistics, and advisory consultation.",
      ],
    },
    {
      id: "rera-compliance-notice",
      sectionNumber: "03",
      title: "Real Estate (Regulation & Development) Act (RERA) Compliance",
      paragraphs: [
        "We strictly uphold the principles of transparency, fair trade, and consumer protection envisioned under the Real Estate (Regulation and Development) Act, 2016 (RERA).",
        "Where a plotted development or residential project falls under the purview of mandatory RERA registration under state enactments (such as Rajasthan RERA or Maharashtra Real Estate Regulatory Authority - MahaRERA), the official RERA registration number and details are sourced directly from developer submissions.",
        "For projects exempt from RERA registration (such as individual agricultural land parcels, un-plotted private revenue land, or sub-500 sq. meter plots exempt under Section 3(2) of RERA), buyers are guided to verify local municipal/panchayat approvals and revenue records independently.",
      ],
      callout: {
        type: "rera",
        title: "Official State RERA Verification",
        text: "Prospective buyers are advised to cross-verify project approvals and registered documents directly on the official state RERA portals (Rajasthan RERA: rera.rajasthan.gov.in | MahaRERA: maharera.mahaonline.gov.in).",
        link: {
          label: "Visit Rajasthan RERA Portal",
          href: "https://rera.rajasthan.gov.in",
        },
      },
    },
    {
      id: "listing-accuracy",
      sectionNumber: "04",
      title: "Accuracy of Listings & Developer Submissions",
      paragraphs: [
        "Property descriptions, amenities, sanctioned road widths, park allocations, clubhouse facilities, and handover schedules published on this platform are compiled based on developer prospectuses, sanction letters, and field verification.",
        "However, developer plans, phasing schedules, and infrastructure specifications are subject to approvals, modifications, and variances by competent local planning bodies (such as Jaipur Development Authority - JDA, Urban Improvement Trust - UIT, or CIDCO).",
      ],
    },
    {
      id: "landowner-distinction",
      sectionNumber: "05",
      title: "Distinction Between Landowners, Developers & Advisors",
      paragraphs: [
        "Ratiwal Dream Estates does not hold title ownership or developmental liabilities for third-party listed properties.",
        "All purchase agreements, conveyance deeds, builder-buyer contracts, allotment letters, and warranties are executed directly and exclusively between the buyer and the verified landowner/developer.",
      ],
    },
    {
      id: "due-diligence-responsibility",
      sectionNumber: "06",
      title: "Legal Due Diligence, Title Searches & Buyer Responsibility",
      paragraphs: [
        "While Ratiwal Dream Estates assists clients by coordinating preliminary legal checks (such as verifying 30-year chain title deeds, Patta records, Jamabandi, non-encumbrance certificates, and 90A land conversion orders):",
        "Our advisory checks do not replace independent title scrutiny by the buyer's own qualified legal advocate or counsel.",
        "Buyers are strongly urged to independently verify title clarity, land conversion status, boundary demarcation, registry encumbrances, and litigation search records in the Sub-Registrar Office before depositing financial consideration.",
      ],
    },
    {
      id: "pricing-inventory",
      sectionNumber: "07",
      title: "Dynamic Pricing, Inventory & Availability",
      paragraphs: [
        "Plot prices, per-square-yard rates, PLC charges, and payment schedules displayed on our website are subject to change without prior notice based on dynamic market conditions, inventory depletion, and developer revisions.",
        "The publication of a property on our platform does not guarantee its availability at the time of inquiry. Confirmation of availability and final pricing occurs only upon issuing an official booking receipt from the developer/landowner.",
      ],
    },
    {
      id: "artistic-representations",
      sectionNumber: "08",
      title: "Artistic Representations, Renders, Maps & Masterplans",
      paragraphs: [
        "Visual media, 3D architectural renders, computer-generated elevation walk-throughs, photographs, and illustrated corridor maps featured on this website are conceptual artistic impressions intended to depict the anticipated aesthetic and layout.",
        "Actual on-ground development, landscaping density, tree lines, road textures, and architectural finishes may vary upon final construction and statutory inspection.",
      ],
    },
    {
      id: "infrastructure-connectivity",
      sectionNumber: "09",
      title: "Infrastructure, Roads & Connectivity Timelines",
      paragraphs: [
        "Mentions of upcoming public infrastructure—including Ring Roads, Metro lines, DMIC corridors, Expressway interchanges, proposed international airports, and SEZ zones—are based on publicly announced masterplans by central and state governments.",
        "Ratiwal Dream Estates does not control government execution timelines, tender awards, land acquisition schedules, or infrastructure commissioning, and accepts no liability for delays in public infrastructure completion.",
      ],
    },
    {
      id: "investment-returns-disclaimer",
      sectionNumber: "10",
      title: "Absence of Guaranteed Capital Returns or Yields",
      paragraphs: [
        "Real estate market projections, historical appreciation metrics, corridor growth rates, and dynamic investment calculator calculations provided on this website are for conceptual scenario modeling only.",
        "Real estate is an illiquid asset class subject to market cycles, policy reforms, regional development speed, and interest rate fluctuations. Ratiwal Dream Estates does not promise, warrant, or guarantee any fixed return on investment (ROI), capital appreciation percentage, or rental income.",
      ],
      callout: {
        type: "warning",
        title: "No Assured Returns",
        text: "Ratiwal Dream Estates does not offer or promote any assured return schemes, collective investment vehicles, or speculative financial products.",
      },
    },
    {
      id: "legal-tax-financial-advice",
      sectionNumber: "11",
      title: "No Substitution for Legal, Tax, or Financial Counsel",
      paragraphs: [
        "The content on this website does not constitute formal legal, taxation, accountancy, or financial advisory. Capital gains tax calculations, stamp duty estimates, TDS obligations, and NRI repatriation advice should be validated with your chartered accountant or tax consultant.",
      ],
    },
    {
      id: "third-party-links",
      sectionNumber: "12",
      title: "Third-Party Reports, Masterplan Documents & External Links",
      paragraphs: [
        "Links to external websites, government masterplans, or satellite maps are provided for visitor convenience. We have no editorial control over external domains and do not assume responsibility for the accuracy or integrity of third-party content.",
      ],
    },
    {
      id: "site-inspections",
      sectionNumber: "13",
      title: "Physical Site Inspections & Ground Verification",
      paragraphs: [
        "We strongly advise all prospective buyers and investors to conduct on-ground physical site inspections prior to concluding any property deal.",
        "Physical inspection allows verification of actual road access, soil topography, electricity/water infrastructure, boundary markers, and neighborhood context.",
      ],
    },
    {
      id: "limitation-of-responsibility",
      sectionNumber: "14",
      title: "Comprehensive Limitation of Responsibility",
      paragraphs: [
        "Under no circumstances shall Ratiwal Dream Estates, its partners, consultants, or affiliates be held liable for any loss, damage, expense, or financial setback arising out of reliance upon information published on this website or decisions taken based on preliminary digital communications.",
      ],
    },
    {
      id: "user-acknowledgement",
      sectionNumber: "15",
      title: "User Acknowledgement & Explicit Consent",
      paragraphs: [
        "By browsing this website, downloading project dossiers, or requesting consultancy assistance, you explicitly acknowledge that you have read this Disclaimer in its entirety, understand the independent advisory nature of our services, and agree to conduct your own independent due diligence.",
      ],
    },
    {
      id: "compliance-desk",
      sectionNumber: "16",
      title: "Corrections, Inquiries & RERA Compliance Desk",
      paragraphs: [
        "If you notice any discrepancy, outdated listing detail, or require clarification regarding the regulatory status of any showcase project, please notify our compliance desk immediately:",
      ],
      callout: {
        type: "note",
        title: "Statutory Review Notice",
        text: "This Disclaimer adheres to Indian real estate regulatory standards. Property-specific RERA credentials and certificates must be inspected prior to booking.",
      },
    },
  ],
};

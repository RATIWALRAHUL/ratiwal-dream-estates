import { LegalPageData } from "@/types/legal";
import { siteConfig } from "@/config/site";

export const termsOfServiceData: LegalPageData = {
  slug: "/terms-of-service",
  category: "Legal & Regulatory Framework",
  title: "Terms of Service",
  effectiveDate: "January 1, 2025",
  lastUpdated: "August 18, 2026",
  summary:
    "These Terms of Service govern your access to and use of the Ratiwal Dream Estates website, digital advisory tools, consultation portals, and related land advisory services. By accessing or browsing our platform, you agree to be bound by these Terms.",
  noticeBanner: {
    badge: "Consultancy Scope Declaration",
    text: "Ratiwal Dream Estates acts as an independent real estate consultancy and strategic land advisory firm. We are not developers, builders, or government planning authorities. All property acquisitions are executed through direct, bilateral legal contracts between the buyer and the verified landowner/developer.",
  },
  sections: [
    {
      id: "acceptance-of-terms",
      sectionNumber: "01",
      title: "Acceptance of Terms & Electronic Agreement",
      paragraphs: [
        `These Terms of Service ("Terms") constitute a legally binding electronic agreement between you ("User," "Client," "Investor," or "you") and Ratiwal Dream Estates ("we," "us," or "our") governing your use of our website (ratiwaldreamestates.com) and associated land consultancy services.`,
        "By accessing, browsing, submitting inquiries, or scheduling site inspections through this platform, you affirm that you have read, understood, and agreed to be bound by these Terms and our Privacy Policy. If you do not agree with any provision herein, you must immediately discontinue use of the website.",
      ],
    },
    {
      id: "website-purpose",
      sectionNumber: "02",
      title: "Purpose & Nature of the Website",
      paragraphs: [
        "The primary purpose of this website is to provide prospective land buyers, homebuilders, and institutional investors with curated micro-market intelligence, vetted plotted development showcases, infrastructure analysis, and direct channels to request bespoke advisory consultations.",
        "The digital material, listings, calculators, and corridor projections published on this website are for informational, educational, and preliminary evaluation purposes only and do not constitute formal real estate solicitations or public investment offers.",
      ],
    },
    {
      id: "advisory-scope",
      sectionNumber: "03",
      title: "Real-Estate Consultancy & Advisory Scope",
      paragraphs: [
        "Ratiwal Dream Estates provides specialized land consulting services, including:",
      ],
      bullets: [
        "Micro-market identification, growth corridor analysis, and masterplan alignment",
        "Assistance in coordinating preliminary document checks and title diligence with verified advocates",
        "Facilitating developer and landowner negotiations, transparent pricing benchmarks, and milestone schedules",
        "Arranging on-ground physical site inspections and regional connectivity walk-throughs",
      ],
    },
    {
      id: "user-eligibility",
      sectionNumber: "04",
      title: "User Eligibility & Lawful Representation",
      paragraphs: [
        "To access and utilize this website, you represent and warrant that:",
      ],
      bullets: [
        "You are at least 18 years of age and possess full legal capacity to enter into binding contractual obligations under the Indian Contract Act, 1872.",
        "All information you submit (including full legal name, telephone number, email address, and investment preferences) is accurate, current, and truthful.",
        "Non-Resident Indians (NRIs), Persons of Indian Origin (PIOs), and Overseas Citizens of India (OCIs) represent that their property inquiries and transactions strictly adhere to Foreign Exchange Management Act (FEMA) guidelines and Reserve Bank of India (RBI) regulations.",
      ],
    },
    {
      id: "property-information",
      sectionNumber: "05",
      title: "Property Information, Availability & Specifications",
      paragraphs: [
        "While Ratiwal Dream Estates exercises rigorous due diligence to ensure that property data, plot dimensions, road widths, and masterplan representations displayed on this website are authentic and up-to-date:",
        "All property listings, plot availability, dimensions, orientations, and specifications are subject to real-time market movement, prior allotment, and developer revisions without prior notice.",
        "Users are strictly advised to inspect sanctioned layout plans, revenue maps (Aks Shajra), mutation entries (Jamabandi), and physically demarcated boundary stones prior to executing binding commitments.",
      ],
    },
    {
      id: "developer-relationship",
      sectionNumber: "06",
      title: "Relationship with Developers, Landowners & Authorities",
      paragraphs: [
        "Ratiwal Dream Estates acts as an independent transactional facilitator and client-side advisor.",
        "We are distinct and separate from property developers, colonizers, private landowners, government development authorities (such as JDA, JNN, CIDCO, or RIICO), and municipal corporations.",
        "We do not possess ownership, developmental custody, or operational authority over third-party township projects unless explicitly declared under a dedicated institutional co-development mandate.",
      ],
    },
    {
      id: "pricing-quotations",
      sectionNumber: "07",
      title: "Prices, Quotations & Payment Disclaimers",
      paragraphs: [
        "Base sale prices, per-square-yard rates, PLC (Preferential Location Charges), club membership fees, development charges, and stamp duty estimates published on this platform are indicative benchmarks reflecting prevailing market conditions.",
        "Final commercial terms, payment plans, milestone disbursements, and statutory charges are determined solely by the formal Agreement for Sale and Developer Cost Sheet executed between buyer and seller.",
        "Ratiwal Dream Estates does not collect property purchase consideration on behalf of developers or landowners. All purchase payments must be remitted directly to the registered bank account or RERA-designated escrow account of the developer/landowner.",
      ],
    },
    {
      id: "consultation-site-visits",
      sectionNumber: "08",
      title: "Consultation & Site-Visit Requests",
      paragraphs: [
        "Submitting a site visit request or scheduling a consultation through our website does not guarantee an immediate booking or slot confirmation until verified by our advisory desk.",
        "We reserve the right to decline or reschedule site visit requests based on vehicle availability, weather conditions, security clearance on gated developments, or incomplete client contact details.",
      ],
    },
    {
      id: "third-party-services",
      sectionNumber: "09",
      title: "Third-Party Services & External Links",
      paragraphs: [
        "Our website may feature links or references to third-party services, including government land records portals (e.g., Apna Khata, Bhulekh), banking institutions for plot loans, and satellite mapping providers (e.g., Google Maps).",
        "We do not endorse, guarantee, or assume liability for the accuracy, uptime, or data privacy practices of external third-party portals.",
      ],
    },
    {
      id: "intellectual-property",
      sectionNumber: "10",
      title: "Intellectual Property Rights & Trademarks",
      paragraphs: [
        `All content published on this website—including the ${siteConfig.name} brand name, logo, graphic marks, custom corridor maps, calculator algorithms, editorial analyses, layout designs, and text—is the exclusive intellectual property of Ratiwal Dream Estates and is protected under Indian copyright, trademark, and intellectual property laws.`,
        "You may not copy, reproduce, scrape, republish, distribute, modify, or create derivative works from our digital content without express prior written authorization from our corporate management.",
      ],
    },
    {
      id: "prohibited-use",
      sectionNumber: "11",
      title: "Prohibited Platform Conduct",
      paragraphs: [
        "When accessing or interacting with our website, you agree that you will not:",
      ],
      bullets: [
        "Use automated scraping bots, crawlers, data mining software, or unauthorized APIs to extract property listings or pricing data.",
        "Submit fraudulent, fictitious, defamatory, or misleading inquiry information.",
        "Interfere with server security, inject malicious software, or attempt unauthorized penetration testing.",
        "Impersonate another individual, corporate entity, or Ratiwal Dream Estates representative.",
        "Use the platform for any unlawful purpose under Indian law or local state regulations.",
      ],
    },
    {
      id: "no-guarantee-transaction",
      sectionNumber: "12",
      title: "No Guarantee of Transaction Completion",
      paragraphs: [
        "Ratiwal Dream Estates facilitates advisory consultations and diligence coordination, but does not guarantee the successful closing, title conveyance, or registry of any property transaction.",
        "Real estate acquisitions are subject to mutual agreement between buyer and seller, statutory approvals, financial clearance, and registrar verification.",
      ],
    },
    {
      id: "no-guarantee-returns",
      sectionNumber: "13",
      title: "No Guarantee of Investment Returns or Appreciation",
      paragraphs: [
        "Historical capital growth metrics, corridor CAGR estimates, infrastructure impact forecasts, and interactive investment calculator outputs provided on this website are illustrative models derived from past market trends.",
        "Real estate values can fluctuate due to macroeconomic factors, policy shifts, interest rate movements, and localized supply-demand dynamics. Ratiwal Dream Estates makes no warranty, guarantee, or representation of assured capital appreciation, rental yield, or future resale liquidity.",
      ],
      callout: {
        type: "warning",
        title: "Capital Risk Advisory",
        text: "Real estate investments carry market risks. Past corridor performance is not a guarantee of future capital returns. Investors should assess their personal financial liquidity and risk tolerance before acquiring land assets.",
      },
    },
    {
      id: "limitation-of-liability",
      sectionNumber: "14",
      title: "Limitation of Liability",
      paragraphs: [
        "To the maximum extent permitted by applicable Indian law, Ratiwal Dream Estates, its partners, consultants, directors, and employees shall not be liable for any direct, indirect, incidental, consequential, punitive, or special damages arising out of:",
      ],
      bullets: [
        "Your access to, reliance upon, or inability to use the website or digital advisory tools",
        "Inaccuracies, errors, or omissions in property listings, dimensions, or developer-supplied data",
        "Disputes, delays, breach of contract, or title defects arising between you and third-party landowners/developers",
        "Technical interruptions, server downtime, or communication delays across digital channels",
      ],
    },
    {
      id: "indemnification",
      sectionNumber: "15",
      title: "User Indemnification",
      paragraphs: [
        "You agree to indemnify, defend, and hold harmless Ratiwal Dream Estates, its partners, affiliates, and representatives from and against any claims, liabilities, damages, losses, costs, or legal expenses arising from your violation of these Terms, submission of inaccurate data, or infringement of third-party rights.",
      ],
    },
    {
      id: "suspension-termination",
      sectionNumber: "16",
      title: "Suspension & Service Termination",
      paragraphs: [
        "We reserve the right, without prior notice or liability, to suspend, terminate, or restrict your access to the website or our advisory services if we determine that you have violated these Terms, engaged in fraudulent activities, or breached applicable Indian laws.",
      ],
    },
    {
      id: "amendments-to-terms",
      sectionNumber: "17",
      title: "Amendments to Terms of Service",
      paragraphs: [
        "We may update, revise, or modify these Terms at our sole discretion. Any changes will become effective immediately upon posting to this URL with an updated 'Last Updated' timestamp.",
        "Your continued use of our website following the publication of revised Terms constitutes your irrevocable acceptance of the modified Terms.",
      ],
    },
    {
      id: "governing-law-jurisdiction",
      sectionNumber: "18",
      title: "Governing Law & Dispute Jurisdiction",
      paragraphs: [
        "These Terms shall be governed by, construed, and enforced in accordance with the substantive laws of the Republic of India.",
        "In the event of any dispute, claim, or controversy arising out of or in connection with these Terms or your interaction with Ratiwal Dream Estates, the parties shall attempt amicable resolution. If unresolved, the competent courts situated in Jaipur, Rajasthan, India shall have exclusive territorial and subject-matter jurisdiction.",
      ],
    },
    {
      id: "contact-information",
      sectionNumber: "19",
      title: "Advisory Desk & Grievance Redressal",
      paragraphs: [
        "For legal inquiries, terms clarifications, or grievance reporting regarding our digital platform, please reach out to our legal and compliance desk:",
      ],
      callout: {
        type: "note",
        title: "Statutory Review Notice",
        text: "These Terms of Service govern digital usage and advisory coordination. Brokerage and transaction-specific terms are established via formal mandate agreements.",
      },
    },
  ],
};

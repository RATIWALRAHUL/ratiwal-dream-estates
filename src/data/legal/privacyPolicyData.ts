import { LegalPageData } from "@/types/legal";
import { siteConfig } from "@/config/site";

export const privacyPolicyData: LegalPageData = {
  slug: "/privacy-policy",
  category: "Compliance & Data Protection",
  title: "Privacy Policy",
  effectiveDate: "January 1, 2025",
  lastUpdated: "August 18, 2026",
  summary:
    "This Privacy Policy describes how Ratiwal Dream Estates collects, uses, handles, and protects your personal and transactional inquiry information when you browse our website, request property consultations, schedule site visits, or communicate with our advisory desk via WhatsApp, email, or telephone.",
  noticeBanner: {
    badge: "Advisory Scope Notice",
    text: "Submitting an inquiry, scheduling a site visit, or interacting with our advisory desk does not constitute a binding real estate transaction, reservation, or contractual obligation. Final property transactions are governed solely by formal, registered bilateral sale agreements between the verified buyer and the landowner/developer.",
  },
  sections: [
    {
      id: "introduction",
      sectionNumber: "01",
      title: "Introduction & Scope",
      paragraphs: [
        `Ratiwal Dream Estates ("we," "our," or "us") is a premium real estate consultancy and strategic land advisory operating primarily across Jaipur, Rajasthan, and strategic high-growth infrastructure corridors across India. We are committed to safeguarding the privacy, confidentiality, and integrity of all personal data entrusted to us.`,
        "This Privacy Policy applies to all users, clients, investors, and visitors who access our website, utilize our land advisory tools, schedule site inspections, or submit inquiries through digital forms, direct messaging, or telephonic channels.",
        "Please read this policy carefully. By accessing our platform or submitting your details, you acknowledge and consent to the data collection and processing practices described herein in accordance with the Digital Personal Data Protection Act, 2023 (DPDP Act) and applicable Indian information technology regulations.",
      ],
    },
    {
      id: "information-collected",
      sectionNumber: "02",
      title: "Information Users Provide Directly",
      paragraphs: [
        "We collect personal information that you voluntarily provide to us when expressing interest in our plotted developments, requesting market intelligence reports, scheduling a physical site inspection, or connecting with an advisor.",
      ],
      bullets: [
        "Full Name and prefix",
        "Primary mobile telephone number and WhatsApp contact",
        "Official or personal email address",
        "Current residential city, state, and country of residence (including NRI residency status)",
        "Preferred language of verbal and written communication",
      ],
    },
    {
      id: "property-inquiry-data",
      sectionNumber: "03",
      title: "Property Inquiry & Consultation Records",
      paragraphs: [
        "To deliver tailored micro-market advisory and match you with verified land opportunities, we collect information relating to your specific real estate criteria and investment horizon.",
      ],
      bullets: [
        "Target micro-market or corridor preferences (e.g., Ajmer Road, Ring Road Zone, Tonk Road, Navi Mumbai)",
        "Intended asset category (e.g., residential township plot, commercial land parcel, institutional acreage, farm estate)",
        "Approximate capital budget and investment horizon",
        "Preferred physical site-visit dates, time slots, and party size",
        "Bespoke consultation mandate parameters and developer preferences",
      ],
    },
    {
      id: "lead-capture-protocol",
      sectionNumber: "04",
      title: "Contact Forms & Lead-Capture Protocol",
      paragraphs: [
        "When you complete an online contact form, advisory request, or valuation inquiry on our platform:",
        "Your submitted information is encrypted in transit using Transport Layer Security (TLS/HTTPS) and routed directly to our authorized internal advisory desk.",
        "Completing an inquiry form does not automatically reserve, allocate, or lock any property unit or pricing. It merely authorizes our advisory team to contact you to discuss available vetted options.",
      ],
    },
    {
      id: "whatsapp-communication",
      sectionNumber: "05",
      title: "WhatsApp & Instant Messaging Communication",
      paragraphs: [
        `Our website features direct interactive links to initiate communication over WhatsApp with our verified consultancy desks (e.g., via ${siteConfig.contact.phone}).`,
        "When you click a WhatsApp button, you are redirected to the WhatsApp platform operated by Meta Platforms, Inc., which is governed by WhatsApp's independent Privacy Policy and Terms of Service.",
        "By initiating a conversation via WhatsApp, you provide explicit consent for our advisory team to send you requested project brochures, masterplans, geolocation pins, and consultation updates via WhatsApp. You may revoke this messaging consent at any time by messaging 'STOP' or informing your designated advisor.",
      ],
      callout: {
        type: "info",
        title: "WhatsApp Security",
        text: "Direct chats on WhatsApp are end-to-end encrypted by Meta. Ratiwal Dream Estates will never ask for banking passwords, OTPs, or credit card details over WhatsApp messaging.",
      },
    },
    {
      id: "technical-data",
      sectionNumber: "06",
      title: "Automatically Collected Technical Information",
      paragraphs: [
        "When you navigate our website, our web servers and performance monitoring tools may automatically record standard technical log data to ensure system security, uptime, and optimal responsive rendering across devices.",
      ],
      bullets: [
        "Internet Protocol (IP) address and approximate geolocation (city/state level)",
        "Browser type, version, operating system, and device screen dimensions",
        "Referring URL, pages visited, time spent per page, and navigation flow",
        "System timestamp and error diagnostics for troubleshooting rendering performance",
      ],
    },
    {
      id: "cookies-analytics",
      sectionNumber: "07",
      title: "Cookies & Analytics Technologies",
      paragraphs: [
        "We utilize essential and performance cookies (small text files placed on your device) to maintain session state, remember user interface preferences, and analyze aggregated traffic trends.",
        "Essential Cookies: Required for core site navigation, security token validation, and responsive layout memory.",
        "Analytical Cookies: Used in anonymized or aggregated format to understand which micro-market pages, calculators, and property listings receive the highest investor interest.",
        "You can manage or disable non-essential cookies through your browser settings at any time without impacting your ability to browse our property portfolio.",
      ],
    },
    {
      id: "purposes-of-processing",
      sectionNumber: "08",
      title: "Purposes of Data Processing",
      paragraphs: [
        "Ratiwal Dream Estates processes collected personal information strictly for legitimate commercial and consultancy purposes, including:",
      ],
      bullets: [
        "Facilitating bespoke land advisory, micro-market feasibility reports, and portfolio recommendations",
        "Scheduling, confirming, and coordinating physical and virtual site inspections",
        "Dispatching requested legal diligence summaries, government masterplans, and brochure dossiers",
        "Communicating transactional timelines, registration milestones, and statutory updates",
        "Responding to client service requests, grievances, and feedback",
        "Complying with statutory audits, regulatory record-keeping, and Indian legal obligations",
      ],
    },
    {
      id: "consent-preferences",
      sectionNumber: "09",
      title: "Consent & Communication Preferences",
      paragraphs: [
        "We respect your communication preferences and do not engage in unauthorized third-party marketing or spam campaigns.",
        "You have the right to modify your preferred mode of contact (Voice Call, WhatsApp, Email, or In-Person Office Consultation) or unsubscribe from periodic market newsletters at any time by contacting info@ratiwaldreamestates.com.",
      ],
    },
    {
      id: "data-sharing",
      sectionNumber: "10",
      title: "Sharing with Service Providers & Property Associates",
      paragraphs: [
        "We do not sell, rent, monetize, or trade your personal information to third-party advertising brokers.",
        "We may share necessary and proportional data with trusted third parties strictly under confidentiality agreements, including:",
      ],
      bullets: [
        "Verified Landowners & Project Developers: To arrange official site access, gated community entry passes, and draft allotment documentation upon your request.",
        "Legal & Title Search Advocates: When you engage our advisory for dedicated document vetting, registry facilitation, or title verification.",
        "Infrastructure & Cloud Hosting Providers: Secure cloud servers and database infrastructure hosting our encrypted web systems.",
        "Statutory & Judicial Authorities: When strictly mandated by applicable Indian law, court order, or formal RERA regulatory proceedings.",
      ],
    },
    {
      id: "data-retention",
      sectionNumber: "11",
      title: "Data Retention Periods",
      paragraphs: [
        "We retain personal inquiry records only for as long as necessary to fulfill the advisory mandate, service our ongoing client relationship, or satisfy statutory record-keeping and audit requirements under Indian law.",
        "Inquiry records for completed transactions are archived in compliance with statutory real estate documentation standards, while non-active prospect records are periodically purged or anonymized.",
      ],
    },
    {
      id: "data-security",
      sectionNumber: "12",
      title: "Information Security Measures",
      paragraphs: [
        "We employ industry-standard technical, organizational, and physical safeguards designed to protect personal information against unauthorized access, destruction, alteration, or disclosure. This includes SSL/TLS encryption for all web sessions, restricted access controls, and regular vulnerability audits.",
      ],
      callout: {
        type: "warning",
        title: "Security Limitation",
        text: "While we implement robust security protocols, no method of digital transmission over the internet or electronic storage is 100% infallible. We encourage users to maintain confidential passwords and avoid sending sensitive financial credentials over unencrypted channels.",
      },
    },
    {
      id: "user-rights",
      sectionNumber: "13",
      title: "Your Privacy Rights & Access Requests",
      paragraphs: [
        "Under applicable Indian data protection laws, including the DPDP Act 2023, you have the following rights concerning your personal data:",
      ],
      bullets: [
        "Right to Access: Request a summary of personal data held about you and the processing activities undertaken.",
        "Right to Correction: Request prompt rectification of incomplete, inaccurate, or outdated personal information.",
        "Right to Erasure: Request deletion of your personal contact records, subject to statutory audit and legal retention mandates.",
        "Right to Withdraw Consent: Revoke previously granted communication consent at any time without retroactive effect.",
        "Right of Grievance Redressal: Access our designated compliance officer for prompt resolution of privacy concerns.",
      ],
    },
    {
      id: "third-party-links",
      sectionNumber: "14",
      title: "Third-Party Links & External Portals",
      paragraphs: [
        "Our website may contain hyperlinks to external portals, such as state RERA authority portals (e.g., Rajasthan RERA, MahaRERA), government development authorities (e.g., JDA, CIDCO), Google Maps navigation, or banking portals.",
        "We do not control and are not responsible for the privacy practices, content, or cookie policies of external third-party sites. We advise reviewing the respective privacy notices upon leaving our website.",
      ],
    },
    {
      id: "children-privacy",
      sectionNumber: "15",
      title: "Children's Privacy Protection",
      paragraphs: [
        "Our real estate consultancy services and website are intended exclusively for individuals aged 18 years and older who possess the legal capacity to enter into binding real estate transactions under the Indian Contract Act, 1872.",
        "We do not knowingly solicit or collect personal data from minors. If we discover that a minor has provided personal details without verified parental or legal guardian consent, we will promptly delete such records from our databases.",
      ],
    },
    {
      id: "policy-updates",
      sectionNumber: "16",
      title: "Updates to this Privacy Policy",
      paragraphs: [
        "We reserve the right to modify, amend, or update this Privacy Policy periodically to reflect evolving regulatory frameworks, organizational practices, or website enhancements.",
        "The updated version will be posted on this page with a revised 'Last Updated' date. Your continued engagement with our platform after such modifications constitutes acceptance of the amended policy.",
      ],
    },
    {
      id: "contact-compliance",
      sectionNumber: "17",
      title: "Privacy Compliance Officer & Grievance Contact",
      paragraphs: [
        "If you have inquiries, concerns, or requests regarding this Privacy Policy, your personal data, or wish to exercise your statutory privacy rights, please contact our designated privacy desk:",
      ],
      callout: {
        type: "note",
        title: "Statutory Review Notice",
        text: "This Privacy Policy represents our operational data protection framework. Final legal phrasing is subject to formal validation by qualified Indian legal counsel.",
      },
    },
  ],
};

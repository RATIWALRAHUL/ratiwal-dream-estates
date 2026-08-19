import { DownloadableResource } from "../types/insight";

export const downloadableResources: DownloadableResource[] = [
  {
    slug: "plot-buying-due-diligence-checklist",
    title: "Plot-Buying Due Diligence & Statutory Verification Checklist",
    description:
      "A 24-point legal, physical, and revenue audit checklist covering JDA/ADA/CIDCO masterplans, 90A conversion sanctions, 7/12 extracts, Jamabandi records, and RERA bank disclosures.",
    category: "Checklists & Protocols",
    fileUrl: "/documents/plot-buying-due-diligence-checklist.pdf",
    fileType: "PDF",
    fileSize: "340 KB",
    version: "v2.4",
    updatedAt: "August 2026",
    reviewStatus: "approved",
    relatedArticleSlugs: ["essential-guide-plot-buying", "understanding-property-documentation"],
  },
  {
    slug: "site-visit-inspection-framework",
    title: "On-Ground Land & Plot Inspection Protocol",
    description:
      "Step-by-step physical inspection sheet for evaluating sectoral road widths (60ft/40ft), Total Station boundary demarcation, drainage gradient, and high-tension wire setbacks.",
    category: "Site Visit Tools",
    fileUrl: "/documents/site-visit-inspection-checklist.pdf",
    fileType: "PDF",
    fileSize: "285 KB",
    version: "v1.8",
    updatedAt: "August 2026",
    reviewStatus: "approved",
    relatedArticleSlugs: ["site-visit-inspection-framework", "essential-guide-plot-buying"],
  },
  {
    slug: "property-document-request-sheet",
    title: "Mandatory Title & Revenue Document Request Sheet",
    description:
      "Requisition template listing the exact 12 statutory revenue documents buyers should obtain from developers or landowners before submitting any commitment token.",
    category: "Legal Templates",
    fileUrl: "/documents/property-document-request-checklist.pdf",
    fileType: "PDF",
    fileSize: "210 KB",
    version: "v2.0",
    updatedAt: "August 2026",
    reviewStatus: "approved",
    relatedArticleSlugs: ["understanding-property-documentation", "rera-fundamentals-for-plot-buyers"],
  },
  {
    slug: "land-pricing-and-charges-worksheet",
    title: "Land Pricing Architecture & Additional Charges Worksheet",
    description:
      "Transparent calculation template breaking down base plot costs, Preferential Location Charges (PLC), external development charges (EDC/IDC), stamp duty, and registration fees.",
    category: "Financial Worksheets",
    fileUrl: "/documents/land-pricing-and-charges-worksheet.pdf",
    fileType: "PDF",
    fileSize: "260 KB",
    version: "v1.5",
    updatedAt: "August 2026",
    reviewStatus: "approved",
    relatedArticleSlugs: ["demystifying-land-pricing-additional-charges", "essential-guide-plot-buying"],
  },
];

export function getAllApprovedResources(): DownloadableResource[] {
  return downloadableResources.filter((r) => r.reviewStatus === "approved");
}

export function getResourceBySlug(slug: string): DownloadableResource | undefined {
  return downloadableResources.find(
    (r) => r.slug.toLowerCase() === slug.toLowerCase() && r.reviewStatus === "approved"
  );
}

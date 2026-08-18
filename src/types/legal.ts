export interface LegalSubSection {
  title: string;
  paragraphs: string[];
  bullets?: string[];
}

export interface LegalCalloutData {
  type: "note" | "warning" | "info" | "rera";
  title?: string;
  text: string;
  link?: {
    label: string;
    href: string;
  };
}

export interface LegalSectionItem {
  id: string;
  sectionNumber: string;
  title: string;
  paragraphs: string[];
  bullets?: string[];
  subSections?: LegalSubSection[];
  callout?: LegalCalloutData;
}

export interface LegalPageData {
  slug: string;
  category: string;
  title: string;
  effectiveDate: string;
  lastUpdated: string;
  summary: string;
  noticeBanner?: {
    badge: string;
    text: string;
  };
  sections: LegalSectionItem[];
  closingNote?: string;
}

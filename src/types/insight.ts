export type InsightCategory =
  | "Property Buying Guides"
  | "Legal & Documentation"
  | "RERA Education"
  | "Market Intelligence"
  | "Location Guides"
  | "Site Visit & Evaluation";

export interface ArticleAuthor {
  name: string;
  role: string;
  image?: string;
  bio?: string;
}

export interface ArticleReviewer {
  name: string;
  role: string;
  reviewType: "editorial" | "legal" | "financial" | "technical";
  reviewedAt?: string;
}

export interface SourceReference {
  title: string;
  publisher: string;
  url: string;
  publishedAt?: string;
  accessedAt: string;
}

export interface TableData {
  headers: string[];
  rows: string[][];
  caption?: string;
}

export interface ArticleSection {
  id: string;
  heading: string;
  paragraphs: string[];
  subsections?: Array<{
    heading: string;
    paragraphs: string[];
  }>;
  checklist?: string[];
  table?: TableData;
  callout?: {
    type: "important" | "tip" | "warning";
    title: string;
    text: string;
  };
}

export interface InsightArticle {
  slug: string;
  title: string;
  excerpt: string;
  category: InsightCategory;
  tags?: string[];
  author: ArticleAuthor;
  reviewer?: ArticleReviewer;
  heroImage: string;
  publishedAt: string;
  updatedAt?: string;
  lastReviewedAt?: string;
  reviewStatus: "draft" | "review-required" | "approved" | "archived";
  featured?: boolean;
  readingTimeMinutes: number;
  relatedLocationSlugs?: string[];
  relatedPropertySlugs?: string[];
  relatedArticleSlugs?: string[];
  sections: ArticleSection[];
  keyTakeaways: string[];
  sources?: SourceReference[];
  downloadableResourceSlugs?: string[];
  seo?: {
    title?: string;
    description?: string;
    canonicalUrl?: string;
    noindex?: boolean;
  };
}

export interface DownloadableResource {
  slug: string;
  title: string;
  description: string;
  category: string;
  fileUrl: string;
  fileType: "PDF" | "DOCX" | "XLSX";
  fileSize: string;
  version: string;
  updatedAt: string;
  reviewStatus: "draft" | "review-required" | "approved";
  relatedArticleSlugs?: string[];
}

/**
 * @file cms.ts
 * @description Domain types, enums, schemas, and interfaces for PRD 20:
 * CMS, Technical SEO, Content Publishing & Website Conversion.
 */

// ─── 1. Content Types ─────────────────────────────────────────────────────────

export const CMS_CONTENT_TYPES = [
  "STANDARD_PAGE",
  "BLOG_POST",
  "LOCATION_PAGE",
  "PROPERTY_CONTENT",
  "FAQ_COLLECTION",
  "TESTIMONIAL",
  "NAVIGATION",
  "FOOTER",
  "ANNOUNCEMENT",
  "SEO_LANDING_PAGE",
] as const;

export type CmsContentType = (typeof CMS_CONTENT_TYPES)[number];

// ─── 2. Publishing Statuses & Lifecycle ───────────────────────────────────────

export const CMS_PUBLISHING_STATUSES = [
  "DRAFT",
  "UNDER_REVIEW",
  "ACTION_REQUIRED",
  "APPROVED",
  "SCHEDULED",
  "PUBLISHED",
  "UNPUBLISHED",
  "ARCHIVED",
] as const;

export type CmsPublishingStatus = (typeof CMS_PUBLISHING_STATUSES)[number];

export const PERMITTED_CMS_TRANSITIONS: Record<CmsPublishingStatus, CmsPublishingStatus[]> = {
  DRAFT: ["UNDER_REVIEW", "ARCHIVED"],
  UNDER_REVIEW: ["ACTION_REQUIRED", "APPROVED", "DRAFT", "ARCHIVED"],
  ACTION_REQUIRED: ["UNDER_REVIEW", "DRAFT", "ARCHIVED"],
  APPROVED: ["PUBLISHED", "SCHEDULED", "DRAFT", "ARCHIVED"],
  SCHEDULED: ["PUBLISHED", "APPROVED", "DRAFT", "ARCHIVED"],
  PUBLISHED: ["UNPUBLISHED", "ARCHIVED"],
  UNPUBLISHED: ["DRAFT", "UNDER_REVIEW", "PUBLISHED", "ARCHIVED"],
  ARCHIVED: [],
};

export function isValidCmsStatusTransition(from: CmsPublishingStatus, to: CmsPublishingStatus): boolean {
  if (from === to) return true;
  const allowed = PERMITTED_CMS_TRANSITIONS[from];
  return allowed ? allowed.includes(to) : false;
}

// ─── 3. Content Block Types ───────────────────────────────────────────────────

export const CMS_BLOCK_TYPES = [
  "HERO",
  "RICH_TEXT",
  "IMAGE",
  "IMAGE_GALLERY",
  "VIDEO_EMBED",
  "PROPERTY_GRID",
  "LOCATION_GRID",
  "FEATURE_LIST",
  "STATISTICS",
  "CTA",
  "QUOTE",
  "TESTIMONIAL",
  "FAQ",
  "CONTACT_FORM",
  "MAP",
  "RELATED_ARTICLES",
  "DIVIDER",
] as const;

export type CmsBlockType = (typeof CMS_BLOCK_TYPES)[number];

export interface CmsBlock {
  id: string;
  type: CmsBlockType;
  order: number;
  data: Record<string, any>;
}

// ─── 4. Redirect Rules ────────────────────────────────────────────────────────

export const REDIRECT_TYPES = ["301", "302", "307", "308"] as const;
export type RedirectType = (typeof REDIRECT_TYPES)[number];

// ─── 5. Structured Data Types ─────────────────────────────────────────────────

export const STRUCTURED_DATA_TYPES = [
  "ORGANIZATION",
  "REAL_ESTATE_AGENT",
  "ARTICLE",
  "BREADCRUMB_LIST",
  "FAQ_PAGE",
  "SINGLE_FAMILY_RESIDENCE",
  "CUSTOM",
] as const;

export type StructuredDataType = (typeof STRUCTURED_DATA_TYPES)[number];

// ─── 6. DTOs and Interfaces ───────────────────────────────────────────────────

export interface CmsEntryListItemDTO {
  id: string;
  entryReference: string;
  contentType: CmsContentType;
  title: string;
  slug: string;
  status: CmsPublishingStatus;
  currentVersionNumber: number;
  publishedVersionNumber?: number;
  authorName: string;
  reviewerName?: string;
  publishedAt?: string;
  scheduledAt?: string;
  updatedAt: string;
  isNoIndex: boolean;
}

export interface CmsOverviewMetrics {
  totalPublishedCount: number;
  draftsCount: number;
  underReviewCount: number;
  scheduledCount: number;
  totalRedirectsCount: number;
  seoIssuesCount: number;
}

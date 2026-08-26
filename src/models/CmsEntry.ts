import mongoose, { Schema, Document, Model, Types } from "mongoose";
import {
  CmsContentType,
  CMS_CONTENT_TYPES,
  CmsPublishingStatus,
  CMS_PUBLISHING_STATUSES,
  CmsBlock,
  StructuredDataType,
  STRUCTURED_DATA_TYPES,
} from "@/types/cms";

export interface ICmsEntry extends Document {
  _id: Types.ObjectId;
  entryReference: string; // Immutable, e.g. RDE-CMS-100293
  contentType: CmsContentType;
  title: string;
  slug: string; // URL slug, e.g. "investment-guide-jaipur-ring-road"
  locale: string; // e.g. "en-IN"

  status: CmsPublishingStatus;
  currentVersionNumber: number;
  publishedVersionNumber?: number;

  authorId: string;
  authorName: string;
  authorEmail?: string;

  reviewerId?: string;
  reviewerName?: string;

  publishedAt?: Date;
  scheduledAt?: Date;
  unpublishedAt?: Date;
  archivedAt?: Date;

  // SEO & Technical Directives
  isNoIndex: boolean;
  canonicalUrl?: string;
  metaTitle?: string;
  metaDescription?: string;
  ogImage?: string;
  structuredDataType?: StructuredDataType;
  structuredDataOverride?: string; // Validated JSON string

  // Content Payload
  excerpt?: string;
  blocks: CmsBlock[];
  featuredMediaUrl?: string;
  featuredMediaAlt?: string;

  relatedPropertyIds?: Types.ObjectId[];
  relatedLocationIds?: Types.ObjectId[];
  tags?: string[];
  categories?: string[];
  readingTimeMinutes?: number;

  // Draft Preview Security
  previewTokenHash?: string;
  previewTokenExpiresAt?: Date;

  version: number;
  createdBy: string;
  createdByName?: string;
  updatedBy?: string;
  updatedByName?: string;
  createdAt: Date;
  updatedAt: Date;
}

const CmsBlockSchema = new Schema(
  {
    id: { type: String, required: true },
    type: { type: String, required: true },
    order: { type: Number, required: true },
    data: { type: Schema.Types.Mixed, default: {} },
  },
  { _id: false }
);

const CmsEntrySchema = new Schema<ICmsEntry>(
  {
    entryReference: {
      type: String,
      required: [true, "Entry reference is required"],
      unique: true,
      trim: true,
      uppercase: true,
      index: true,
    },
    contentType: {
      type: String,
      enum: CMS_CONTENT_TYPES,
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      maxlength: [200, "Title cannot exceed 200 characters"],
    },
    slug: {
      type: String,
      required: [true, "Slug is required"],
      trim: true,
      lowercase: true,
      index: true,
    },
    locale: {
      type: String,
      default: "en-IN",
    },
    status: {
      type: String,
      enum: CMS_PUBLISHING_STATUSES,
      default: "DRAFT",
      index: true,
    },
    currentVersionNumber: {
      type: Number,
      default: 1,
    },
    publishedVersionNumber: {
      type: Number,
    },
    authorId: {
      type: String,
      required: true,
      index: true,
    },
    authorName: {
      type: String,
      required: true,
    },
    authorEmail: {
      type: String,
      lowercase: true,
      trim: true,
    },
    reviewerId: {
      type: String,
    },
    reviewerName: {
      type: String,
    },
    publishedAt: {
      type: Date,
      index: true,
    },
    scheduledAt: {
      type: Date,
      index: true,
    },
    unpublishedAt: {
      type: Date,
    },
    archivedAt: {
      type: Date,
    },
    isNoIndex: {
      type: Boolean,
      default: false,
    },
    canonicalUrl: {
      type: String,
      trim: true,
    },
    metaTitle: {
      type: String,
      trim: true,
      maxlength: [100, "Meta title cannot exceed 100 characters"],
    },
    metaDescription: {
      type: String,
      trim: true,
      maxlength: [300, "Meta description cannot exceed 300 characters"],
    },
    ogImage: {
      type: String,
      trim: true,
    },
    structuredDataType: {
      type: String,
      enum: STRUCTURED_DATA_TYPES,
    },
    structuredDataOverride: {
      type: String,
    },
    excerpt: {
      type: String,
      trim: true,
      maxlength: [500, "Excerpt cannot exceed 500 characters"],
    },
    blocks: {
      type: [CmsBlockSchema],
      default: [],
    },
    featuredMediaUrl: {
      type: String,
      trim: true,
    },
    featuredMediaAlt: {
      type: String,
      trim: true,
    },
    relatedPropertyIds: [{
      type: Schema.Types.ObjectId,
      ref: "Property",
    }],
    relatedLocationIds: [{
      type: Schema.Types.ObjectId,
      ref: "Location",
    }],
    tags: {
      type: [String],
      default: [],
    },
    categories: {
      type: [String],
      default: [],
    },
    readingTimeMinutes: {
      type: Number,
      default: 3,
    },
    previewTokenHash: {
      type: String,
      index: true,
    },
    previewTokenExpiresAt: {
      type: Date,
    },
    version: {
      type: Number,
      default: 1,
    },
    createdBy: {
      type: String,
      required: true,
    },
    createdByName: {
      type: String,
    },
    updatedBy: {
      type: String,
    },
    updatedByName: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

CmsEntrySchema.index({ contentType: 1, slug: 1, status: 1 });
CmsEntrySchema.index({ status: 1, scheduledAt: 1 });

export const CmsEntry: Model<ICmsEntry> =
  mongoose.models.CmsEntry ||
  mongoose.model<ICmsEntry>("CmsEntry", CmsEntrySchema);

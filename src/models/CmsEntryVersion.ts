import mongoose, { Schema, Document, Model, Types } from "mongoose";
import { CmsBlock } from "@/types/cms";

export interface ICmsEntryVersion extends Document {
  _id: Types.ObjectId;
  entryId: Types.ObjectId;
  versionNumber: number;

  titleSnapshot: string;
  slugSnapshot: string;
  excerptSnapshot?: string;
  blocksSnapshot: CmsBlock[];

  seoSnapshot: {
    metaTitle?: string;
    metaDescription?: string;
    canonicalUrl?: string;
    isNoIndex?: boolean;
    ogImage?: string;
    structuredDataType?: string;
  };

  featuredMediaUrl?: string;
  relatedPropertyIds?: Types.ObjectId[];
  relatedLocationIds?: Types.ObjectId[];
  tags?: string[];
  categories?: string[];

  changeSummary: string;
  createdBy: string;
  createdByName: string;
  approvedBy?: string;
  approvedByName?: string;

  publishedAt?: Date;
  supersededAt?: Date;

  createdAt: Date;
  updatedAt: Date;
}

const CmsEntryVersionSchema = new Schema<ICmsEntryVersion>(
  {
    entryId: {
      type: Schema.Types.ObjectId,
      ref: "CmsEntry",
      required: true,
      index: true,
    },
    versionNumber: {
      type: Number,
      required: true,
    },
    titleSnapshot: {
      type: String,
      required: true,
    },
    slugSnapshot: {
      type: String,
      required: true,
    },
    excerptSnapshot: {
      type: String,
    },
    blocksSnapshot: {
      type: Schema.Types.Mixed,
      required: true,
    },
    seoSnapshot: {
      type: Schema.Types.Mixed,
      default: {},
    },
    featuredMediaUrl: {
      type: String,
    },
    relatedPropertyIds: [{
      type: Schema.Types.ObjectId,
      ref: "Property",
    }],
    relatedLocationIds: [{
      type: Schema.Types.ObjectId,
      ref: "Location",
    }],
    tags: [String],
    categories: [String],
    changeSummary: {
      type: String,
      required: true,
      trim: true,
    },
    createdBy: {
      type: String,
      required: true,
    },
    createdByName: {
      type: String,
      required: true,
    },
    approvedBy: {
      type: String,
    },
    approvedByName: {
      type: String,
    },
    publishedAt: {
      type: Date,
    },
    supersededAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

CmsEntryVersionSchema.index({ entryId: 1, versionNumber: -1 }, { unique: true });

export const CmsEntryVersion: Model<ICmsEntryVersion> =
  mongoose.models.CmsEntryVersion ||
  mongoose.model<ICmsEntryVersion>("CmsEntryVersion", CmsEntryVersionSchema);

import mongoose, { Schema, Document, Model, Types } from "mongoose";
import type {
  OwnerType,
  AssetCategory,
  AssetPurpose,
  AssetAccess,
  AssetStatus,
} from "@/lib/storage/types";

export interface IMediaAsset extends Document {
  _id: Types.ObjectId;

  // Ownership
  ownerType: OwnerType;
  ownerId: Types.ObjectId;

  // Classification
  assetCategory: AssetCategory;
  purpose: AssetPurpose;

  // Storage
  provider: string;
  providerFileId?: string;
  providerKey: string;
  publicUrl?: string;
  access: AssetAccess;

  // File metadata
  originalFilename: string;
  safeDisplayName: string;
  mimeType: string;
  detectedMimeType?: string;
  extension: string;
  sizeBytes?: number;
  width?: number;
  height?: number;
  checksum?: string;

  // Lifecycle
  status: AssetStatus;
  rejectionReason?: string;

  // Presentation (when attached to gallery/hero)
  altText?: string;
  caption?: string;
  sortOrder?: number;
  isPrimary?: boolean;
  focalPointX?: number;
  focalPointY?: number;

  // Document-specific
  documentTitle?: string;
  documentVersion?: string;

  // People
  uploadedBy: string;
  uploadedByEmail: string;
  verifiedBy?: string;

  // Timestamps
  uploadedAt?: Date;
  verifiedAt?: Date;
  deletedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

const MediaAssetSchema = new Schema<IMediaAsset>(
  {
    ownerType: {
      type: String,
      required: true,
      enum: ["PROPERTY", "LOCATION"],
      index: true,
    },
    ownerId: {
      type: Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    assetCategory: {
      type: String,
      required: true,
      enum: ["IMAGE", "DOCUMENT"],
    },
    purpose: {
      type: String,
      required: true,
      enum: [
        "PROPERTY_GALLERY",
        "PROPERTY_HERO",
        "LOCATION_HERO",
        "BROCHURE",
        "MASTERPLAN",
        "RERA_CERTIFICATE",
        "TITLE_DOCUMENT",
        "APPROVAL",
        "PRICE_SHEET",
        "OTHER",
      ],
    },
    provider: {
      type: String,
      required: true,
      default: "imagekit",
    },
    providerFileId: {
      type: String,
      trim: true,
    },
    providerKey: {
      type: String,
      required: true,
      trim: true,
    },
    publicUrl: {
      type: String,
      trim: true,
    },
    access: {
      type: String,
      required: true,
      enum: ["PUBLIC", "PRIVATE", "INTERNAL"],
    },
    originalFilename: {
      type: String,
      required: true,
      trim: true,
      maxlength: 255,
    },
    safeDisplayName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 255,
    },
    mimeType: {
      type: String,
      required: true,
      trim: true,
    },
    detectedMimeType: {
      type: String,
      trim: true,
    },
    extension: {
      type: String,
      trim: true,
      maxlength: 10,
    },
    sizeBytes: {
      type: Number,
      min: 0,
    },
    width: {
      type: Number,
      min: 0,
    },
    height: {
      type: Number,
      min: 0,
    },
    checksum: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      required: true,
      enum: ["PENDING", "UPLOADING", "PROCESSING", "READY", "REJECTED", "QUARANTINED", "DELETED"],
      default: "PENDING",
      index: true,
    },
    rejectionReason: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    // Presentation
    altText: {
      type: String,
      trim: true,
      maxlength: 300,
    },
    caption: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    sortOrder: {
      type: Number,
      default: 0,
    },
    isPrimary: {
      type: Boolean,
      default: false,
    },
    focalPointX: {
      type: Number,
      min: 0,
      max: 1,
    },
    focalPointY: {
      type: Number,
      min: 0,
      max: 1,
    },
    // Document
    documentTitle: {
      type: String,
      trim: true,
      maxlength: 300,
    },
    documentVersion: {
      type: String,
      trim: true,
      maxlength: 50,
    },
    // People
    uploadedBy: {
      type: String,
      required: true,
      index: true,
    },
    uploadedByEmail: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    verifiedBy: {
      type: String,
      trim: true,
    },
    // Timestamps
    uploadedAt: {
      type: Date,
    },
    verifiedAt: {
      type: Date,
    },
    deletedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// ─── Indexes ──────────────────────────────────────────────────────────────────

// Primary query: all assets for a given owner
MediaAssetSchema.index({ ownerType: 1, ownerId: 1, status: 1 });

// Provider deduplication
MediaAssetSchema.index({ provider: 1, providerKey: 1 }, { unique: true });
MediaAssetSchema.index({ provider: 1, providerFileId: 1 }, { sparse: true });

// Upload history per actor
MediaAssetSchema.index({ uploadedBy: 1, createdAt: -1 });

// Status-based queries (orphan audit, processing queue)
MediaAssetSchema.index({ status: 1, createdAt: -1 });

// Soft-deletion queries
MediaAssetSchema.index({ deletedAt: 1 }, { sparse: true });

// ─── Model ────────────────────────────────────────────────────────────────────

export const MediaAsset: Model<IMediaAsset> =
  mongoose.models.MediaAsset ||
  mongoose.model<IMediaAsset>("MediaAsset", MediaAssetSchema);

import mongoose, { Schema, Document, Model, Types } from "mongoose";
import { MALWARE_SCAN_STATUSES, MalwareScanStatus } from "@/types/legal-vault";

export interface ILegalDocumentVersion extends Document {
  _id: Types.ObjectId;
  legalDocumentId: Types.ObjectId;
  versionNumber: number; // 1, 2, 3...
  storageProvider: string; // e.g. "imagekit", "s3", "local"
  providerKey: string; // Protected internal storage key / object ID
  sanitizedOriginalFilename: string;
  mimeType: string;
  fileSize: number; // in bytes
  sha256Checksum: string; // SHA-256 hash for integrity & duplicate detection
  uploadSource: "DASHBOARD" | "API" | "BULK_IMPORT";
  malwareScanStatus: MalwareScanStatus;
  malwareScanProvider?: string;
  malwareScannedAt?: Date;
  versionNote?: string;
  supersededAt?: Date;
  uploadedBy: string;
  uploadedByName?: string;
  createdAt: Date;
  updatedAt: Date;
}

const LegalDocumentVersionSchema = new Schema<ILegalDocumentVersion>(
  {
    legalDocumentId: {
      type: Schema.Types.ObjectId,
      ref: "LegalDocument",
      required: true,
      index: true,
    },
    versionNumber: {
      type: Number,
      required: true,
      min: 1,
    },
    storageProvider: {
      type: String,
      required: true,
      default: "imagekit",
    },
    providerKey: {
      type: String,
      required: true,
      trim: true,
    },
    sanitizedOriginalFilename: {
      type: String,
      required: true,
      trim: true,
    },
    mimeType: {
      type: String,
      required: true,
      trim: true,
    },
    fileSize: {
      type: Number,
      required: true,
      min: 1,
    },
    sha256Checksum: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    uploadSource: {
      type: String,
      enum: ["DASHBOARD", "API", "BULK_IMPORT"],
      default: "DASHBOARD",
      required: true,
    },
    malwareScanStatus: {
      type: String,
      enum: MALWARE_SCAN_STATUSES,
      default: "NOT_CONFIGURED",
      required: true,
      index: true,
    },
    malwareScanProvider: {
      type: String,
      trim: true,
    },
    malwareScannedAt: {
      type: Date,
    },
    versionNote: {
      type: String,
      maxlength: 1000,
    },
    supersededAt: {
      type: Date,
      index: true,
    },
    uploadedBy: {
      type: String,
      required: true,
    },
    uploadedByName: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound Unique Index to prevent duplicate version numbers per document
LegalDocumentVersionSchema.index(
  { legalDocumentId: 1, versionNumber: 1 },
  { unique: true }
);

// Index for checksum-based duplicate detection
LegalDocumentVersionSchema.index({ sha256Checksum: 1, legalDocumentId: 1 });

export const LegalDocumentVersion: Model<ILegalDocumentVersion> =
  mongoose.models.LegalDocumentVersion ||
  mongoose.model<ILegalDocumentVersion>("LegalDocumentVersion", LegalDocumentVersionSchema);

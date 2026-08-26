import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface IKycDocumentVersion extends Document {
  kycDocumentId: Types.ObjectId;
  versionNumber: number;
  
  // Storage references (Private, never exposed in client URLs)
  storageProvider: "IMAGEKIT_PRIVATE" | "LOCAL_PRIVATE" | "S3_COMPATIBLE";
  providerKey: string;
  sanitizedOriginalFilename: string;

  mimeType: string;
  detectedMimeType: string;
  fileSizeBytes: number;
  sha256Checksum: string;

  malwareScanStatus: "CLEAN" | "PENDING" | "QUARANTINED" | "FAILED";
  scanEngineDetails?: string;

  uploadSource: "DASHBOARD_STAFF" | "CUSTOMER_SUBMISSION_SESSION" | "INTERNAL_IMPORT";
  uploadedBy?: string;
  uploadedByName?: string;
  submissionSessionId?: Types.ObjectId;

  isCurrent: boolean;
  supersededAt?: Date;
  retentionExpiresAt?: Date;
  createdAt: Date;
}

const KycDocumentVersionSchema = new Schema<IKycDocumentVersion>(
  {
    kycDocumentId: {
      type: Schema.Types.ObjectId,
      ref: "KycDocument",
      required: [true, "KYC Document reference is required"],
      index: true,
    },
    versionNumber: {
      type: Number,
      required: true,
      min: 1,
    },
    storageProvider: {
      type: String,
      enum: ["IMAGEKIT_PRIVATE", "LOCAL_PRIVATE", "S3_COMPATIBLE"],
      default: "IMAGEKIT_PRIVATE",
      required: true,
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
    detectedMimeType: {
      type: String,
      required: true,
      trim: true,
    },
    fileSizeBytes: {
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
    malwareScanStatus: {
      type: String,
      enum: ["CLEAN", "PENDING", "QUARANTINED", "FAILED"],
      default: "CLEAN",
      required: true,
      index: true,
    },
    scanEngineDetails: {
      type: String,
      trim: true,
    },
    uploadSource: {
      type: String,
      enum: ["DASHBOARD_STAFF", "CUSTOMER_SUBMISSION_SESSION", "INTERNAL_IMPORT"],
      default: "DASHBOARD_STAFF",
    },
    uploadedBy: {
      type: String,
    },
    uploadedByName: {
      type: String,
      trim: true,
    },
    submissionSessionId: {
      type: Schema.Types.ObjectId,
      ref: "KycSubmissionSession",
    },
    isCurrent: {
      type: Boolean,
      default: true,
      index: true,
    },
    supersededAt: {
      type: Date,
    },
    retentionExpiresAt: {
      type: Date,
      index: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

KycDocumentVersionSchema.index({ kycDocumentId: 1, versionNumber: 1 }, { unique: true });

export const KycDocumentVersion: Model<IKycDocumentVersion> =
  mongoose.models.KycDocumentVersion ||
  mongoose.model<IKycDocumentVersion>("KycDocumentVersion", KycDocumentVersionSchema);

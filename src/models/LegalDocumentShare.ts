import mongoose, { Schema, Document, Model, Types } from "mongoose";
import { DocumentClassification } from "@/types/legal-vault";

export interface ILegalDocumentShare extends Document {
  _id: Types.ObjectId;
  legalDocumentId: Types.ObjectId;
  documentVersionId: Types.ObjectId;
  propertyId: Types.ObjectId;
  tokenHash: string; // SHA-256 hash of random 32-byte secret token
  intendedRecipientEmail?: string;
  intendedPurpose: string;
  classificationAtCreation: DocumentClassification;
  maxDownloads: number;
  downloadCount: number;
  passcodeHash?: string; // Optional argon2/sha256 passcode
  expiresAt: Date;
  revokedAt?: Date;
  revokedBy?: string;
  revocationReason?: string;
  lastAccessedAt?: Date;
  createdBy: string;
  createdByName?: string;
  createdAt: Date;
  updatedAt: Date;
}

const LegalDocumentShareSchema = new Schema<ILegalDocumentShare>(
  {
    legalDocumentId: {
      type: Schema.Types.ObjectId,
      ref: "LegalDocument",
      required: true,
      index: true,
    },
    documentVersionId: {
      type: Schema.Types.ObjectId,
      ref: "LegalDocumentVersion",
      required: true,
    },
    propertyId: {
      type: Schema.Types.ObjectId,
      ref: "Property",
      required: true,
      index: true,
    },
    tokenHash: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    intendedRecipientEmail: {
      type: String,
      trim: true,
      lowercase: true,
    },
    intendedPurpose: {
      type: String,
      required: true,
      trim: true,
      maxlength: 300,
    },
    classificationAtCreation: {
      type: String,
      required: true,
    },
    maxDownloads: {
      type: Number,
      default: 5,
      min: 1,
      max: 100,
    },
    downloadCount: {
      type: Number,
      default: 0,
    },
    passcodeHash: {
      type: String,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    revokedAt: {
      type: Date,
      index: true,
    },
    revokedBy: {
      type: String,
    },
    revocationReason: {
      type: String,
      maxlength: 300,
    },
    lastAccessedAt: {
      type: Date,
    },
    createdBy: {
      type: String,
      required: true,
    },
    createdByName: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// TTL Index for expired shares cleanup
LegalDocumentShareSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 2592000 }); // 30 days retention after expiry

export const LegalDocumentShare: Model<ILegalDocumentShare> =
  mongoose.models.LegalDocumentShare ||
  mongoose.model<ILegalDocumentShare>("LegalDocumentShare", LegalDocumentShareSchema);

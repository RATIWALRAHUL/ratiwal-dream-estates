import mongoose, { Schema, Document, Model, Types } from "mongoose";
import {
  KycDocumentType,
  KYC_DOCUMENT_TYPES,
  KycDocumentStatus,
  KYC_DOCUMENT_STATUSES,
  VerificationMethod,
  VERIFICATION_METHODS,
  VerificationResult,
  VERIFICATION_RESULTS,
  RetentionCategory,
  RETENTION_CATEGORIES,
} from "@/types/kyc";

export interface IKycDocument extends Document {
  kycCaseId: Types.ObjectId;
  applicantId: Types.ObjectId;
  requirementKey: string;
  documentType: KycDocumentType;
  status: KycDocumentStatus;

  currentVersionId?: Types.ObjectId;
  currentVersionNumber: number;

  maskedIdentifier?: string; // e.g. ABCDE****F or XXXX-XXXX-1234
  documentHmac?: string; // Keyed HMAC for duplicate check
  issuingAuthority?: string;
  issueDate?: Date;
  expiryDate?: Date;
  reviewDueDate?: Date;

  verificationMethod?: VerificationMethod;
  verificationResult?: VerificationResult;
  verifiedBy?: string;
  verifiedByName?: string;
  verifiedAt?: Date;

  providerReference?: string;
  actionRequiredReason?: string;
  rejectionReason?: string;

  retentionCategory: RetentionCategory;
  legalHold: boolean;
  version: number;
  createdAt: Date;
  updatedAt: Date;
}

const KycDocumentSchema = new Schema<IKycDocument>(
  {
    kycCaseId: {
      type: Schema.Types.ObjectId,
      ref: "CustomerKycCase",
      required: [true, "KYC Case reference is required"],
      index: true,
    },
    applicantId: {
      type: Schema.Types.ObjectId,
      ref: "KycApplicant",
      required: [true, "Applicant reference is required"],
      index: true,
    },
    requirementKey: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    documentType: {
      type: String,
      enum: KYC_DOCUMENT_TYPES,
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: KYC_DOCUMENT_STATUSES,
      default: "REQUESTED",
      required: true,
      index: true,
    },
    currentVersionId: {
      type: Schema.Types.ObjectId,
      ref: "KycDocumentVersion",
    },
    currentVersionNumber: {
      type: Number,
      default: 0,
    },
    maskedIdentifier: {
      type: String,
      trim: true,
    },
    documentHmac: {
      type: String,
      index: true,
    },
    issuingAuthority: {
      type: String,
      trim: true,
    },
    issueDate: {
      type: Date,
    },
    expiryDate: {
      type: Date,
      index: true,
    },
    reviewDueDate: {
      type: Date,
    },
    verificationMethod: {
      type: String,
      enum: VERIFICATION_METHODS,
    },
    verificationResult: {
      type: String,
      enum: VERIFICATION_RESULTS,
    },
    verifiedBy: {
      type: String,
    },
    verifiedByName: {
      type: String,
      trim: true,
    },
    verifiedAt: {
      type: Date,
    },
    providerReference: {
      type: String,
      trim: true,
    },
    actionRequiredReason: {
      type: String,
      trim: true,
    },
    rejectionReason: {
      type: String,
      trim: true,
    },
    retentionCategory: {
      type: String,
      enum: RETENTION_CATEGORIES,
      default: "KYC_TRANSACTIONAL_BUYER",
    },
    legalHold: {
      type: Boolean,
      default: false,
    },
    version: {
      type: Number,
      default: 1,
    },
  },
  {
    timestamps: true,
  }
);

KycDocumentSchema.index({ kycCaseId: 1, applicantId: 1, requirementKey: 1 });

export const KycDocument: Model<IKycDocument> =
  mongoose.models.KycDocument || mongoose.model<IKycDocument>("KycDocument", KycDocumentSchema);

import mongoose, { Schema, Document, Model, Types } from "mongoose";
import {
  VerificationMethod,
  VERIFICATION_METHODS,
  VerificationResult,
  VERIFICATION_RESULTS,
  KycDocumentStatus,
} from "@/types/kyc";

export interface IKycVerificationEvent extends Document {
  kycCaseId: Types.ObjectId;
  applicantId?: Types.ObjectId;
  documentId?: Types.ObjectId;
  documentVersionNumber?: number;

  verificationMethod: VerificationMethod;
  verificationResult: VerificationResult;
  fromStatus?: KycDocumentStatus;
  toStatus?: KycDocumentStatus;

  providerName?: string;
  providerTransactionId?: string; // Safe external transaction reference

  verifiedBy: string;
  verifiedByName: string;
  verifiedByRole: string;

  isManualOverride: boolean;
  overrideJustification?: string;
  auditNotes?: string;

  timestamp: Date;
  createdAt: Date;
}

const KycVerificationEventSchema = new Schema<IKycVerificationEvent>(
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
      index: true,
    },
    documentId: {
      type: Schema.Types.ObjectId,
      ref: "KycDocument",
      index: true,
    },
    documentVersionNumber: {
      type: Number,
    },
    verificationMethod: {
      type: String,
      enum: VERIFICATION_METHODS,
      required: true,
      index: true,
    },
    verificationResult: {
      type: String,
      enum: VERIFICATION_RESULTS,
      required: true,
      index: true,
    },
    fromStatus: {
      type: String,
    },
    toStatus: {
      type: String,
    },
    providerName: {
      type: String,
      trim: true,
    },
    providerTransactionId: {
      type: String,
      trim: true,
    },
    verifiedBy: {
      type: String,
      required: true,
    },
    verifiedByName: {
      type: String,
      required: true,
      trim: true,
    },
    verifiedByRole: {
      type: String,
      required: true,
      trim: true,
    },
    isManualOverride: {
      type: Boolean,
      default: false,
      index: true,
    },
    overrideJustification: {
      type: String,
      trim: true,
    },
    auditNotes: {
      type: String,
      trim: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

export const KycVerificationEvent: Model<IKycVerificationEvent> =
  mongoose.models.KycVerificationEvent ||
  mongoose.model<IKycVerificationEvent>("KycVerificationEvent", KycVerificationEventSchema);

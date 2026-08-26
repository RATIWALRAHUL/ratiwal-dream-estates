import mongoose, { Schema, Document, Model, Types } from "mongoose";
import { DpdpaProcessingBasis, DPDPA_PROCESSING_BASES } from "@/types/kyc";

export interface IDataProcessingRecord extends Document {
  partyId: Types.ObjectId;
  applicantId?: Types.ObjectId;
  kycCaseId?: Types.ObjectId;

  purpose: string;
  legalBasis: DpdpaProcessingBasis;
  noticeVersion: string;
  noticeTextLanguage: string;

  dataCategoriesCollected: string[];
  documentTypesCollected: string[];

  // Consent fields (when legal basis is EXPLICIT_CONSENT)
  consentGranted: boolean;
  consentGrantedAt?: Date;
  consentGrantedMethod: "DIGITAL_CHECKBOX" | "PHYSICAL_SIGNATURE" | "VERIFIED_SESSION";
  
  consentWithdrawn: boolean;
  consentWithdrawnAt?: Date;
  consentWithdrawalReason?: string;

  ipAddressMasked?: string;
  userAgentSnippet?: string;

  createdAt: Date;
  updatedAt: Date;
}

const DataProcessingRecordSchema = new Schema<IDataProcessingRecord>(
  {
    partyId: {
      type: Schema.Types.ObjectId,
      ref: "CustomerParty",
      required: [true, "Party reference is required"],
      index: true,
    },
    applicantId: {
      type: Schema.Types.ObjectId,
      ref: "KycApplicant",
      index: true,
    },
    kycCaseId: {
      type: Schema.Types.ObjectId,
      ref: "CustomerKycCase",
      index: true,
    },
    purpose: {
      type: String,
      required: [true, "Processing purpose is required"],
      trim: true,
    },
    legalBasis: {
      type: String,
      enum: DPDPA_PROCESSING_BASES,
      default: "EXPLICIT_CONSENT",
      required: true,
      index: true,
    },
    noticeVersion: {
      type: String,
      required: true,
      default: "DPDPA_KYC_NOTICE_V1_2026",
      trim: true,
    },
    noticeTextLanguage: {
      type: String,
      default: "en",
      trim: true,
    },
    dataCategoriesCollected: [
      {
        type: String,
        required: true,
      },
    ],
    documentTypesCollected: [
      {
        type: String,
      },
    ],
    consentGranted: {
      type: Boolean,
      default: false,
      required: true,
    },
    consentGrantedAt: {
      type: Date,
    },
    consentGrantedMethod: {
      type: String,
      enum: ["DIGITAL_CHECKBOX", "PHYSICAL_SIGNATURE", "VERIFIED_SESSION"],
      default: "DIGITAL_CHECKBOX",
    },
    consentWithdrawn: {
      type: Boolean,
      default: false,
      index: true,
    },
    consentWithdrawnAt: {
      type: Date,
    },
    consentWithdrawalReason: {
      type: String,
      trim: true,
    },
    ipAddressMasked: {
      type: String,
    },
    userAgentSnippet: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

export const DataProcessingRecord: Model<IDataProcessingRecord> =
  mongoose.models.DataProcessingRecord ||
  mongoose.model<IDataProcessingRecord>("DataProcessingRecord", DataProcessingRecordSchema);

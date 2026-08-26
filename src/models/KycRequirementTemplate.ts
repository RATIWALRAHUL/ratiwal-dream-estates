import mongoose, { Schema, Document, Model } from "mongoose";
import {
  CustomerPartyType,
  CUSTOMER_PARTY_TYPES,
  IKycRequirementItem,
  KYC_DOCUMENT_TYPES,
  APPLICANT_ROLES,
  RETENTION_CATEGORIES,
} from "@/types/kyc";

export interface IKycRequirementTemplate extends Document {
  templateKey: string; // e.g. INDIVIDUAL_RESIDENTIAL, JOINT_RESIDENTIAL, CORPORATE_ENTITY
  name: string;
  partyType: CustomerPartyType;
  version: number;
  description: string;
  requirements: IKycRequirementItem[];
  status: "DRAFT" | "ACTIVE" | "ARCHIVED";
  defaultExpiryDays: number;
  approvedBy?: string;
  effectiveDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

const KycRequirementItemSchema = new Schema<IKycRequirementItem>(
  {
    key: { type: String, required: true, trim: true },
    displayName: { type: String, required: true, trim: true },
    purpose: { type: String, required: true, trim: true },
    documentType: {
      type: String,
      enum: KYC_DOCUMENT_TYPES,
      required: true,
    },
    required: { type: Boolean, default: true },
    acceptedEvidenceNotes: { type: String, required: true, trim: true },
    applicableRoles: [
      {
        type: String,
        enum: APPLICANT_ROLES,
      },
    ],
    allowsExpiry: { type: Boolean, default: true },
    maskingRule: {
      type: String,
      enum: ["MASK_ALL_BUT_LAST_4", "PAN_MASK_MIDDLE", "NONE"],
      default: "MASK_ALL_BUT_LAST_4",
    },
    retentionCategory: {
      type: String,
      enum: RETENTION_CATEGORIES,
      default: "KYC_TRANSACTIONAL_BUYER",
    },
    displayOrder: { type: Number, default: 0 },
  },
  { _id: false }
);

const KycRequirementTemplateSchema = new Schema<IKycRequirementTemplate>(
  {
    templateKey: {
      type: String,
      required: [true, "Template key is required"],
      trim: true,
      uppercase: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, "Template name is required"],
      trim: true,
    },
    partyType: {
      type: String,
      enum: CUSTOMER_PARTY_TYPES,
      required: true,
      index: true,
    },
    version: {
      type: Number,
      default: 1,
      required: true,
    },
    description: {
      type: String,
      trim: true,
    },
    requirements: {
      type: [KycRequirementItemSchema],
      default: [],
    },
    status: {
      type: String,
      enum: ["DRAFT", "ACTIVE", "ARCHIVED"],
      default: "ACTIVE",
      index: true,
    },
    defaultExpiryDays: {
      type: Number,
      default: 365,
    },
    approvedBy: {
      type: String,
    },
    effectiveDate: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

KycRequirementTemplateSchema.index({ templateKey: 1, version: 1 }, { unique: true });

export const KycRequirementTemplate: Model<IKycRequirementTemplate> =
  mongoose.models.KycRequirementTemplate ||
  mongoose.model<IKycRequirementTemplate>("KycRequirementTemplate", KycRequirementTemplateSchema);

import mongoose, { Schema, Document, Model } from "mongoose";
import {
  RetentionCategory,
  RETENTION_CATEGORIES,
  DisposalAction,
  DISPOSAL_ACTIONS,
} from "@/types/kyc";

export interface IDisposalRecord {
  targetType: "KYC_CASE" | "DOCUMENT_VERSION" | "APPLICANT";
  targetId: string;
  actionTaken: DisposalAction;
  reason: string;
  executedBy: string;
  executedAt: Date;
}

export interface IKycRetentionPolicy extends Document {
  category: RetentionCategory;
  displayName: string;
  retentionPeriodDays: number;
  statutoryReference: string; // e.g. "Section 12 PMLA, 2002 / Section 8 DPDPA 2023"
  autoDisposalEnabled: boolean;
  legalHoldActive: boolean;
  disposalHistory: IDisposalRecord[];
  updatedBy: string;
  createdAt: Date;
  updatedAt: Date;
}

const DisposalRecordSchema = new Schema<IDisposalRecord>(
  {
    targetType: {
      type: String,
      enum: ["KYC_CASE", "DOCUMENT_VERSION", "APPLICANT"],
      required: true,
    },
    targetId: {
      type: String,
      required: true,
    },
    actionTaken: {
      type: String,
      enum: DISPOSAL_ACTIONS,
      required: true,
    },
    reason: {
      type: String,
      required: true,
    },
    executedBy: {
      type: String,
      required: true,
    },
    executedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const KycRetentionPolicySchema = new Schema<IKycRetentionPolicy>(
  {
    category: {
      type: String,
      enum: RETENTION_CATEGORIES,
      required: true,
      unique: true,
      index: true,
    },
    displayName: {
      type: String,
      required: true,
    },
    retentionPeriodDays: {
      type: Number,
      required: true,
      min: 1,
    },
    statutoryReference: {
      type: String,
      required: true,
    },
    autoDisposalEnabled: {
      type: Boolean,
      default: false,
    },
    legalHoldActive: {
      type: Boolean,
      default: false,
      index: true,
    },
    disposalHistory: {
      type: [DisposalRecordSchema],
      default: [],
    },
    updatedBy: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const KycRetentionPolicy: Model<IKycRetentionPolicy> =
  mongoose.models.KycRetentionPolicy ||
  mongoose.model<IKycRetentionPolicy>("KycRetentionPolicy", KycRetentionPolicySchema);

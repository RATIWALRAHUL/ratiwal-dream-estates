import mongoose, { Schema, Document, Model, Types } from "mongoose";
import { SubmissionSessionStatus, SUBMISSION_SESSION_STATUSES } from "@/types/kyc";

export interface IKycSubmissionSession extends Document {
  kycCaseId: Types.ObjectId;
  applicantId: Types.ObjectId;
  partyId: Types.ObjectId;

  // Stored as SHA-256 hash only. Raw token is returned only once to caller.
  tokenHash: string;
  allowedRequirementKeys: string[];
  purposeNotice: string;
  noticeVersion: string;

  status: SubmissionSessionStatus;
  expiresAt: Date;
  maxUploadAttempts: number;
  uploadAttemptsCount: number;

  completedAt?: Date;
  revokedAt?: Date;
  revocationReason?: string;

  ipAddressMasked?: string;
  userAgentSnippet?: string;

  createdBy: string;
  createdByName: string;
  createdAt: Date;
  updatedAt: Date;
}

const KycSubmissionSessionSchema = new Schema<IKycSubmissionSession>(
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
    partyId: {
      type: Schema.Types.ObjectId,
      ref: "CustomerParty",
      required: true,
      index: true,
    },
    tokenHash: {
      type: String,
      required: [true, "Token hash is required"],
      unique: true,
      index: true,
    },
    allowedRequirementKeys: [
      {
        type: String,
        required: true,
      },
    ],
    purposeNotice: {
      type: String,
      required: true,
      trim: true,
    },
    noticeVersion: {
      type: String,
      required: true,
      default: "DPDPA_KYC_NOTICE_V1_2026",
    },
    status: {
      type: String,
      enum: SUBMISSION_SESSION_STATUSES,
      default: "ACTIVE",
      required: true,
      index: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: true,
    },
    maxUploadAttempts: {
      type: Number,
      default: 10,
    },
    uploadAttemptsCount: {
      type: Number,
      default: 0,
    },
    completedAt: {
      type: Date,
    },
    revokedAt: {
      type: Date,
    },
    revocationReason: {
      type: String,
      trim: true,
    },
    ipAddressMasked: {
      type: String,
    },
    userAgentSnippet: {
      type: String,
    },
    createdBy: {
      type: String,
      required: true,
    },
    createdByName: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const KycSubmissionSession: Model<IKycSubmissionSession> =
  mongoose.models.KycSubmissionSession ||
  mongoose.model<IKycSubmissionSession>("KycSubmissionSession", KycSubmissionSessionSchema);

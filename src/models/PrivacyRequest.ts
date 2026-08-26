import mongoose, { Schema, Document, Model, Types } from "mongoose";
import {
  PrivacyRequestType,
  PRIVACY_REQUEST_TYPES,
  PrivacyRequestStatus,
  PRIVACY_REQUEST_STATUSES,
} from "@/types/kyc";

export interface IPrivacyRequest extends Document {
  requestNumber: string; // RDE-PRV-XXXXXX
  partyId: Types.ObjectId;
  applicantId?: Types.ObjectId;
  requestType: PrivacyRequestType;
  status: PrivacyRequestStatus;

  requesterEmailMasked: string;
  requesterPhoneMasked?: string;
  identityVerificationMethod: "IDENTITY_DOCUMENT_MATCH" | "OTP_VERIFIED" | "LEGAL_REPRESENTATIVE_POA";

  requestDetails: string;
  legalExceptionReason?: string; // e.g. Statutory 8-year tax records retention exception
  dispositionNotes?: string;

  assignedOfficerId?: string;
  assignedOfficerName?: string;
  
  receivedAt: Date;
  dueByDate: Date; // DPDPA statutory turnaround target (e.g. 30 days)
  completedAt?: Date;

  createdAt: Date;
  updatedAt: Date;
}

const PrivacyRequestSchema = new Schema<IPrivacyRequest>(
  {
    requestNumber: {
      type: String,
      required: [true, "Privacy request number is required"],
      unique: true,
      trim: true,
      uppercase: true,
      index: true,
    },
    partyId: {
      type: Schema.Types.ObjectId,
      ref: "CustomerParty",
      required: true,
      index: true,
    },
    applicantId: {
      type: Schema.Types.ObjectId,
      ref: "KycApplicant",
      index: true,
    },
    requestType: {
      type: String,
      enum: PRIVACY_REQUEST_TYPES,
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: PRIVACY_REQUEST_STATUSES,
      default: "RECEIVED",
      required: true,
      index: true,
    },
    requesterEmailMasked: {
      type: String,
      required: true,
      trim: true,
    },
    requesterPhoneMasked: {
      type: String,
      trim: true,
    },
    identityVerificationMethod: {
      type: String,
      enum: ["IDENTITY_DOCUMENT_MATCH", "OTP_VERIFIED", "LEGAL_REPRESENTATIVE_POA"],
      default: "IDENTITY_DOCUMENT_MATCH",
      required: true,
    },
    requestDetails: {
      type: String,
      required: true,
      trim: true,
    },
    legalExceptionReason: {
      type: String,
      trim: true,
    },
    dispositionNotes: {
      type: String,
      trim: true,
    },
    assignedOfficerId: {
      type: String,
    },
    assignedOfficerName: {
      type: String,
      trim: true,
    },
    receivedAt: {
      type: Date,
      default: Date.now,
    },
    dueByDate: {
      type: Date,
      required: true,
      index: true,
    },
    completedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

export const PrivacyRequest: Model<IPrivacyRequest> =
  mongoose.models.PrivacyRequest ||
  mongoose.model<IPrivacyRequest>("PrivacyRequest", PrivacyRequestSchema);

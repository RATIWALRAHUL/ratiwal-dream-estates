import mongoose, { Schema, Document, Model, Types } from "mongoose";
import {
  PartnerLeadSubmissionStatus,
  PARTNER_LEAD_SUBMISSION_STATUSES,
} from "@/types/partner";

export interface IPartnerLeadSubmission extends Document {
  _id: Types.ObjectId;
  submissionNumber: string; // RDE-PLS-XXXXXX
  partnerId: Types.ObjectId;
  partnerAccountId: Types.ObjectId;
  propertyId: Types.ObjectId;
  locationId?: Types.ObjectId;

  // Masked & HMAC-keyed identifiers to preserve privacy
  clientNameMasked: string; // e.g. Rajesh S****
  clientPhoneMasked: string; // e.g. +91 98*** **321
  clientPhoneHash: string; // SHA-256 for deduplication
  clientEmailMasked?: string;
  clientEmailHash?: string;

  budgetBand?: string;
  investmentIntent?: "IMMEDIATE_REGISTRY" | "VILLA_CONSTRUCTION" | "LONG_TERM_APPRECIATION" | "COMMERCIAL";
  notes?: string;

  // Mandatory Customer Consent Evidence
  consentConfirmed: boolean;
  consentStatementVersion: string; // e.g. "v2026.1-DPDP-PARTNER-REPRESENTATION"
  consentDeclarationText: string;
  consentTimestamp: Date;

  attributionStatus: PartnerLeadSubmissionStatus;
  safeStatusForPartner: "SUBMITTED" | "UNDER_REVIEW" | "ACCEPTED" | "DUPLICATE" | "CONTACTED" | "SITE_VISIT_SCHEDULED" | "BOOKING_ACHIEVED" | "CLOSED_LOST" | "EXPIRED";
  
  linkedCrmLeadId?: Types.ObjectId;
  linkedDealId?: Types.ObjectId;
  linkedBookingId?: Types.ObjectId;

  deduplicationResult?: {
    matchFound: boolean;
    existingRecordType?: "DIRECT_LEAD" | "ANOTHER_PARTNER_LEAD" | "EXISTING_CUSTOMER";
    attributionWindowActive: boolean;
  };

  rejectionReason?: string;
  conflictReason?: string;
  attributionExpiryDate?: Date;

  submittedAt: Date;
  version: number;
  createdAt: Date;
  updatedAt: Date;
}

const PartnerLeadSubmissionSchema = new Schema<IPartnerLeadSubmission>(
  {
    submissionNumber: {
      type: String,
      required: [true, "Submission number is required"],
      unique: true,
      trim: true,
      uppercase: true,
      index: true,
    },
    partnerId: {
      type: Schema.Types.ObjectId,
      ref: "ChannelPartner",
      required: [true, "Partner reference is required"],
      index: true,
    },
    partnerAccountId: {
      type: Schema.Types.ObjectId,
      ref: "PartnerAccount",
      required: true,
      index: true,
    },
    propertyId: {
      type: Schema.Types.ObjectId,
      ref: "Property",
      required: [true, "Property reference is required"],
      index: true,
    },
    locationId: {
      type: Schema.Types.ObjectId,
      ref: "Location",
    },
    clientNameMasked: {
      type: String,
      required: true,
      trim: true,
    },
    clientPhoneMasked: {
      type: String,
      required: true,
      trim: true,
    },
    clientPhoneHash: {
      type: String,
      required: true,
      index: true,
    },
    clientEmailMasked: {
      type: String,
      trim: true,
    },
    clientEmailHash: {
      type: String,
      index: true,
    },
    budgetBand: {
      type: String,
    },
    investmentIntent: {
      type: String,
      enum: ["IMMEDIATE_REGISTRY", "VILLA_CONSTRUCTION", "LONG_TERM_APPRECIATION", "COMMERCIAL"],
      default: "IMMEDIATE_REGISTRY",
    },
    notes: {
      type: String,
    },
    consentConfirmed: {
      type: Boolean,
      required: [true, "Customer consent confirmation is required"],
      default: false,
    },
    consentStatementVersion: {
      type: String,
      required: true,
      default: "v2026.1-DPDP-PARTNER-REPRESENTATION",
    },
    consentDeclarationText: {
      type: String,
      required: true,
    },
    consentTimestamp: {
      type: Date,
      required: true,
      default: Date.now,
    },
    attributionStatus: {
      type: String,
      enum: PARTNER_LEAD_SUBMISSION_STATUSES,
      default: "SUBMITTED",
      index: true,
    },
    safeStatusForPartner: {
      type: String,
      enum: [
        "SUBMITTED",
        "UNDER_REVIEW",
        "ACCEPTED",
        "DUPLICATE",
        "CONTACTED",
        "SITE_VISIT_SCHEDULED",
        "BOOKING_ACHIEVED",
        "CLOSED_LOST",
        "EXPIRED",
      ],
      default: "SUBMITTED",
      index: true,
    },
    linkedCrmLeadId: {
      type: Schema.Types.ObjectId,
      ref: "Lead",
      index: true,
    },
    linkedDealId: {
      type: Schema.Types.ObjectId,
      ref: "Deal",
    },
    linkedBookingId: {
      type: Schema.Types.ObjectId,
      ref: "Booking",
      index: true,
    },
    deduplicationResult: {
      matchFound: { type: Boolean, default: false },
      existingRecordType: { type: String },
      attributionWindowActive: { type: Boolean, default: false },
    },
    rejectionReason: {
      type: String,
    },
    conflictReason: {
      type: String,
    },
    attributionExpiryDate: {
      type: Date,
      index: true,
    },
    submittedAt: {
      type: Date,
      default: Date.now,
      index: true,
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

PartnerLeadSubmissionSchema.index({ partnerId: 1, clientPhoneHash: 1, propertyId: 1 });

export const PartnerLeadSubmission: Model<IPartnerLeadSubmission> =
  mongoose.models.PartnerLeadSubmission ||
  mongoose.model<IPartnerLeadSubmission>("PartnerLeadSubmission", PartnerLeadSubmissionSchema);

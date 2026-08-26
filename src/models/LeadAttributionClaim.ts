import mongoose, { Schema, Document, Model, Types } from "mongoose";
import {
  LeadAttributionStatus,
  LEAD_ATTRIBUTION_STATUSES,
} from "@/types/partner";

export interface ILeadAttributionClaim extends Document {
  _id: Types.ObjectId;
  claimNumber: string; // RDE-LAC-XXXXXX
  leadId: Types.ObjectId;
  partnerId: Types.ObjectId;
  submissionId: Types.ObjectId;
  bookingId?: Types.ObjectId;
  dealId?: Types.ObjectId;

  policyVersion: string; // e.g. "v2026.1-STANDARD-ATTRIBUTION"
  attributionStart: Date;
  attributionEnd: Date; // e.g. 60 days validity window

  status: LeadAttributionStatus;
  decisionReason?: string;

  reviewedBy?: string;
  reviewedByName?: string;
  reviewedTimestamp?: Date;

  isOverridden: boolean;
  overrideReason?: string;
  overriddenBy?: string;
  overriddenAt?: Date;

  version: number;
  createdAt: Date;
  updatedAt: Date;
}

const LeadAttributionClaimSchema = new Schema<ILeadAttributionClaim>(
  {
    claimNumber: {
      type: String,
      required: [true, "Claim number is required"],
      unique: true,
      trim: true,
      uppercase: true,
      index: true,
    },
    leadId: {
      type: Schema.Types.ObjectId,
      ref: "Lead",
      required: [true, "Lead reference is required"],
      index: true,
    },
    partnerId: {
      type: Schema.Types.ObjectId,
      ref: "ChannelPartner",
      required: [true, "Partner reference is required"],
      index: true,
    },
    submissionId: {
      type: Schema.Types.ObjectId,
      ref: "PartnerLeadSubmission",
      required: [true, "Submission reference is required"],
      index: true,
    },
    bookingId: {
      type: Schema.Types.ObjectId,
      ref: "Booking",
      index: true,
    },
    dealId: {
      type: Schema.Types.ObjectId,
      ref: "Deal",
    },
    policyVersion: {
      type: String,
      required: true,
      default: "v2026.1-STANDARD-ATTRIBUTION",
    },
    attributionStart: {
      type: Date,
      required: true,
      default: Date.now,
    },
    attributionEnd: {
      type: Date,
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: LEAD_ATTRIBUTION_STATUSES,
      default: "PENDING",
      index: true,
    },
    decisionReason: {
      type: String,
    },
    reviewedBy: {
      type: String,
    },
    reviewedByName: {
      type: String,
    },
    reviewedTimestamp: {
      type: Date,
    },
    isOverridden: {
      type: Boolean,
      default: false,
    },
    overrideReason: {
      type: String,
    },
    overriddenBy: {
      type: String,
    },
    overriddenAt: {
      type: Date,
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

LeadAttributionClaimSchema.index({ leadId: 1, partnerId: 1, status: 1 });

export const LeadAttributionClaim: Model<ILeadAttributionClaim> =
  mongoose.models.LeadAttributionClaim ||
  mongoose.model<ILeadAttributionClaim>("LeadAttributionClaim", LeadAttributionClaimSchema);

import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface IPartnerTaxProfile extends Document {
  _id: Types.ObjectId;
  partnerId: Types.ObjectId;
  taxCategory: "INDIVIDUAL" | "PROPRIETORSHIP" | "PARTNERSHIP_LLP" | "PVT_LTD_COMPANY" | "PUBLIC_LTD" | "TRUST_HUF";

  panMasked: string; // e.g. ABCDE****F
  panHash: string; // Keyed SHA-256 for duplicate PAN detection

  gstApplicable: boolean;
  gstinMasked?: string; // e.g. 08ABCDE****1Z5
  gstinHash?: string;

  taxResidency: "RESIDENT" | "NON_RESIDENT";
  withholdingSectionCode: string; // e.g. "SEC_BROKERAGE_194H_V2026", "SEC_TDS_CONTRACTOR"
  lowerDeductionCertificateNumber?: string;
  lowerDeductionRatePercentage?: number;
  lowerDeductionValidUntil?: Date;

  reviewStatus: "PENDING" | "VERIFIED" | "ACTION_REQUIRED" | "REJECTED";
  reviewedBy?: string;
  reviewedByName?: string;
  reviewedTimestamp?: Date;
  rejectionReason?: string;

  panDocumentKey?: string;
  gstDocumentKey?: string;

  version: number;
  createdAt: Date;
  updatedAt: Date;
}

const PartnerTaxProfileSchema = new Schema<IPartnerTaxProfile>(
  {
    partnerId: {
      type: Schema.Types.ObjectId,
      ref: "ChannelPartner",
      required: [true, "Partner reference is required"],
      unique: true,
      index: true,
    },
    taxCategory: {
      type: String,
      enum: ["INDIVIDUAL", "PROPRIETORSHIP", "PARTNERSHIP_LLP", "PVT_LTD_COMPANY", "PUBLIC_LTD", "TRUST_HUF"],
      required: true,
      default: "INDIVIDUAL",
    },
    panMasked: {
      type: String,
      required: [true, "Masked PAN is required"],
      trim: true,
    },
    panHash: {
      type: String,
      required: true,
      index: true,
    },
    gstApplicable: {
      type: Boolean,
      default: false,
    },
    gstinMasked: {
      type: String,
      trim: true,
    },
    gstinHash: {
      type: String,
      index: true,
    },
    taxResidency: {
      type: String,
      enum: ["RESIDENT", "NON_RESIDENT"],
      default: "RESIDENT",
    },
    withholdingSectionCode: {
      type: String,
      required: true,
      default: "SEC_BROKERAGE_V2026",
    },
    lowerDeductionCertificateNumber: {
      type: String,
      trim: true,
    },
    lowerDeductionRatePercentage: {
      type: Number,
    },
    lowerDeductionValidUntil: {
      type: Date,
    },
    reviewStatus: {
      type: String,
      enum: ["PENDING", "VERIFIED", "ACTION_REQUIRED", "REJECTED"],
      default: "PENDING",
      index: true,
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
    rejectionReason: {
      type: String,
    },
    panDocumentKey: {
      type: String,
    },
    gstDocumentKey: {
      type: String,
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

export const PartnerTaxProfile: Model<IPartnerTaxProfile> =
  mongoose.models.PartnerTaxProfile ||
  mongoose.model<IPartnerTaxProfile>("PartnerTaxProfile", PartnerTaxProfileSchema);

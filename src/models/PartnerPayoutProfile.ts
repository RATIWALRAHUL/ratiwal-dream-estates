import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface IPartnerPayoutProfile extends Document {
  _id: Types.ObjectId;
  partnerId: Types.ObjectId;
  beneficiaryName: string;
  bankName: string;
  accountType: "SAVINGS" | "CURRENT";

  accountNumberMasked: string; // e.g. *******1294
  accountNumberHash: string; // Keyed SHA-256 for duplicate lookup
  ifscCode: string; // e.g. HDFC0001234
  branchName?: string;
  upiIdMasked?: string;

  verificationMethod: "PENNY_DROP" | "BANK_STATEMENT_REVIEW" | "CANCELLED_CHEQUE_REVIEW" | "MANUAL_MAKER_CHECKER";
  verificationStatus: "PENDING" | "VERIFIED" | "ACTION_REQUIRED" | "REJECTED";

  // Maker-Checker audit fields
  submittedBy: string;
  submittedByName?: string;
  submittedAt: Date;

  verifiedBy?: string;
  verifiedByName?: string;
  verifiedTimestamp?: Date;

  chequeDocumentKey?: string;
  rejectionReason?: string;

  isCurrentActive: boolean;
  version: number;
  createdAt: Date;
  updatedAt: Date;
}

const PartnerPayoutProfileSchema = new Schema<IPartnerPayoutProfile>(
  {
    partnerId: {
      type: Schema.Types.ObjectId,
      ref: "ChannelPartner",
      required: [true, "Partner reference is required"],
      index: true,
    },
    beneficiaryName: {
      type: String,
      required: [true, "Beneficiary name is required"],
      trim: true,
    },
    bankName: {
      type: String,
      required: [true, "Bank name is required"],
      trim: true,
    },
    accountType: {
      type: String,
      enum: ["SAVINGS", "CURRENT"],
      default: "CURRENT",
    },
    accountNumberMasked: {
      type: String,
      required: [true, "Masked account number is required"],
      trim: true,
    },
    accountNumberHash: {
      type: String,
      required: true,
      index: true,
    },
    ifscCode: {
      type: String,
      required: [true, "IFSC code is required"],
      trim: true,
      uppercase: true,
    },
    branchName: {
      type: String,
      trim: true,
    },
    upiIdMasked: {
      type: String,
      trim: true,
    },
    verificationMethod: {
      type: String,
      enum: ["PENNY_DROP", "BANK_STATEMENT_REVIEW", "CANCELLED_CHEQUE_REVIEW", "MANUAL_MAKER_CHECKER"],
      default: "CANCELLED_CHEQUE_REVIEW",
    },
    verificationStatus: {
      type: String,
      enum: ["PENDING", "VERIFIED", "ACTION_REQUIRED", "REJECTED"],
      default: "PENDING",
      index: true,
    },
    submittedBy: {
      type: String,
      required: true,
    },
    submittedByName: {
      type: String,
    },
    submittedAt: {
      type: Date,
      default: Date.now,
    },
    verifiedBy: {
      type: String,
    },
    verifiedByName: {
      type: String,
    },
    verifiedTimestamp: {
      type: Date,
    },
    chequeDocumentKey: {
      type: String,
    },
    rejectionReason: {
      type: String,
    },
    isCurrentActive: {
      type: Boolean,
      default: true,
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

export const PartnerPayoutProfile: Model<IPartnerPayoutProfile> =
  mongoose.models.PartnerPayoutProfile ||
  mongoose.model<IPartnerPayoutProfile>("PartnerPayoutProfile", PartnerPayoutProfileSchema);

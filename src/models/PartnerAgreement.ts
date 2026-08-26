import mongoose, { Schema, Document, Model, Types } from "mongoose";
import {
  PartnerAgreementStatus,
  PARTNER_AGREEMENT_STATUSES,
} from "@/types/partner";

export interface IPartnerAgreement extends Document {
  _id: Types.ObjectId;
  partnerId: Types.ObjectId;
  agreementNumber: string; // RDE-PAGR-XXXXXX
  templateVersion: string; // e.g. "v2026.1-STANDARD-BROKER"

  effectiveDate: Date;
  expiryDate?: Date;
  status: PartnerAgreementStatus;

  acceptedSignedMethod: "PORTAL_DIGITAL_ACCEPTANCE" | "PHYSICAL_EXECUTION_UPLOAD" | "AADHAAR_ESIGN_RECORD";
  acceptedByAccountId?: Types.ObjectId;
  acceptedByName?: string;
  acceptedTimestamp?: Date;

  documentKey?: string;
  commissionPlanId?: Types.ObjectId;

  terminationDate?: Date;
  terminationReason?: string;
  terminatedBy?: string;

  version: number;
  createdAt: Date;
  updatedAt: Date;
}

const PartnerAgreementSchema = new Schema<IPartnerAgreement>(
  {
    partnerId: {
      type: Schema.Types.ObjectId,
      ref: "ChannelPartner",
      required: [true, "Partner reference is required"],
      index: true,
    },
    agreementNumber: {
      type: String,
      required: [true, "Agreement number is required"],
      unique: true,
      trim: true,
      uppercase: true,
      index: true,
    },
    templateVersion: {
      type: String,
      required: true,
      trim: true,
    },
    effectiveDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    expiryDate: {
      type: Date,
    },
    status: {
      type: String,
      enum: PARTNER_AGREEMENT_STATUSES,
      default: "DRAFT",
      index: true,
    },
    acceptedSignedMethod: {
      type: String,
      enum: ["PORTAL_DIGITAL_ACCEPTANCE", "PHYSICAL_EXECUTION_UPLOAD", "AADHAAR_ESIGN_RECORD"],
      default: "PORTAL_DIGITAL_ACCEPTANCE",
    },
    acceptedByAccountId: {
      type: Schema.Types.ObjectId,
      ref: "PartnerAccount",
    },
    acceptedByName: {
      type: String,
    },
    acceptedTimestamp: {
      type: Date,
    },
    documentKey: {
      type: String,
    },
    commissionPlanId: {
      type: Schema.Types.ObjectId,
      ref: "CommissionPlan",
    },
    terminationDate: {
      type: Date,
    },
    terminationReason: {
      type: String,
    },
    terminatedBy: {
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

export const PartnerAgreement: Model<IPartnerAgreement> =
  mongoose.models.PartnerAgreement ||
  mongoose.model<IPartnerAgreement>("PartnerAgreement", PartnerAgreementSchema);

import mongoose, { Schema, Document, Model, Types } from "mongoose";
import {
  PartnerReraStatus,
  PARTNER_RERA_STATUSES,
} from "@/types/partner";

export interface IPartnerReraRegistration extends Document {
  _id: Types.ObjectId;
  partnerId: Types.ObjectId;
  stateAuthority: string; // e.g. "RAJASTHAN_RERA", "MAHARASHTRA_MahaRERA"
  registrationNumberMasked: string; // e.g. RAJ-RERA-A-2024-****
  registrationNumberHash: string; // Keyed SHA-256 for duplicate lookup

  registrationType: "INDIVIDUAL" | "FIRM" | "COMPANY";
  issueDate?: Date;
  expiryDate?: Date;

  status: PartnerReraStatus;
  verificationMethod: "INTERNAL_DOCUMENT_CHECK" | "OFFICIAL_GOVERNMENT_PORTAL" | "NOT_VERIFIED";
  officialSourceUrl?: string;

  verifiedBy?: string;
  verifiedByName?: string;
  verifiedTimestamp?: Date;

  certificateDocumentKey?: string;
  notes?: string;
  rejectionReason?: string;

  version: number;
  createdAt: Date;
  updatedAt: Date;
}

const PartnerReraRegistrationSchema = new Schema<IPartnerReraRegistration>(
  {
    partnerId: {
      type: Schema.Types.ObjectId,
      ref: "ChannelPartner",
      required: [true, "Partner reference is required"],
      index: true,
    },
    stateAuthority: {
      type: String,
      required: [true, "RERA State/UT authority is required"],
      trim: true,
      index: true,
    },
    registrationNumberMasked: {
      type: String,
      required: [true, "Masked registration number is required"],
      trim: true,
    },
    registrationNumberHash: {
      type: String,
      required: true,
      index: true,
    },
    registrationType: {
      type: String,
      enum: ["INDIVIDUAL", "FIRM", "COMPANY"],
      default: "INDIVIDUAL",
    },
    issueDate: {
      type: Date,
    },
    expiryDate: {
      type: Date,
      index: true,
    },
    status: {
      type: String,
      enum: PARTNER_RERA_STATUSES,
      default: "NOT_PROVIDED",
      index: true,
    },
    verificationMethod: {
      type: String,
      enum: ["INTERNAL_DOCUMENT_CHECK", "OFFICIAL_GOVERNMENT_PORTAL", "NOT_VERIFIED"],
      default: "NOT_VERIFIED",
    },
    officialSourceUrl: {
      type: String,
      trim: true,
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
    certificateDocumentKey: {
      type: String,
    },
    notes: {
      type: String,
    },
    rejectionReason: {
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

export const PartnerReraRegistration: Model<IPartnerReraRegistration> =
  mongoose.models.PartnerReraRegistration ||
  mongoose.model<IPartnerReraRegistration>("PartnerReraRegistration", PartnerReraRegistrationSchema);

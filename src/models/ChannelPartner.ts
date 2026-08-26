import mongoose, { Schema, Document, Model, Types } from "mongoose";
import {
  PartnerType,
  PARTNER_TYPES,
  PartnerStatus,
  PARTNER_STATUSES,
} from "@/types/partner";

export interface IChannelPartner extends Document {
  _id: Types.ObjectId;
  partnerCode: string; // Immutable, e.g. RDE-CP-100293
  partnerType: PartnerType;
  legalName: string;
  displayName: string;
  email: string;
  phone: string;
  alternatePhone?: string;
  website?: string;

  registeredAddress: {
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string; // e.g. Rajasthan, Maharashtra
    pincode: string;
    country: string;
  };

  operatingLocations: string[]; // e.g. ["jaipur", "navi-mumbai", "ajmer"]
  jurisdictionState: string; // Primary legal jurisdiction (e.g. Rajasthan)

  primaryContact: {
    name: string;
    designation?: string;
    email: string;
    phone: string;
  };

  assignedRelationshipManagerId?: string;
  assignedRelationshipManagerName?: string;

  status: PartnerStatus;
  complianceStatus: PartnerStatus;
  reraRequired: boolean;

  // Active references
  reraRegistrationId?: Types.ObjectId;
  taxProfileId?: Types.ObjectId;
  payoutProfileId?: Types.ObjectId;
  agreementId?: Types.ObjectId;
  defaultCommissionPlanId?: Types.ObjectId;

  portalAccessEnabled: boolean;
  onboardingDate?: Date;
  activationDate?: Date;
  suspensionDate?: Date;
  deactivationDate?: Date;
  suspensionReason?: string;

  version: number;
  createdBy: string;
  createdByName?: string;
  updatedBy?: string;
  updatedByName?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ChannelPartnerSchema = new Schema<IChannelPartner>(
  {
    partnerCode: {
      type: String,
      required: [true, "Partner code is required"],
      unique: true,
      trim: true,
      uppercase: true,
      index: true,
    },
    partnerType: {
      type: String,
      enum: PARTNER_TYPES,
      required: [true, "Partner type is required"],
      index: true,
    },
    legalName: {
      type: String,
      required: [true, "Legal business or individual name is required"],
      trim: true,
      maxlength: [200, "Legal name must not exceed 200 characters"],
    },
    displayName: {
      type: String,
      required: [true, "Display name is required"],
      trim: true,
      maxlength: [200, "Display name must not exceed 200 characters"],
    },
    email: {
      type: String,
      required: [true, "Official email is required"],
      lowercase: true,
      trim: true,
      index: true,
    },
    phone: {
      type: String,
      required: [true, "Official contact phone is required"],
      trim: true,
    },
    alternatePhone: {
      type: String,
      trim: true,
    },
    website: {
      type: String,
      trim: true,
    },
    registeredAddress: {
      addressLine1: { type: String, required: true },
      addressLine2: { type: String },
      city: { type: String, required: true },
      state: { type: String, required: true },
      pincode: { type: String, required: true },
      country: { type: String, default: "India" },
    },
    operatingLocations: {
      type: [String],
      default: ["jaipur"],
    },
    jurisdictionState: {
      type: String,
      required: true,
      default: "Rajasthan",
    },
    primaryContact: {
      name: { type: String, required: true },
      designation: { type: String },
      email: { type: String, required: true },
      phone: { type: String, required: true },
    },
    assignedRelationshipManagerId: { type: String, index: true },
    assignedRelationshipManagerName: { type: String },
    status: {
      type: String,
      enum: PARTNER_STATUSES,
      default: "DRAFT",
      index: true,
    },
    complianceStatus: {
      type: String,
      enum: PARTNER_STATUSES,
      default: "DRAFT",
    },
    reraRequired: {
      type: Boolean,
      default: true,
    },
    reraRegistrationId: {
      type: Schema.Types.ObjectId,
      ref: "PartnerReraRegistration",
    },
    taxProfileId: {
      type: Schema.Types.ObjectId,
      ref: "PartnerTaxProfile",
    },
    payoutProfileId: {
      type: Schema.Types.ObjectId,
      ref: "PartnerPayoutProfile",
    },
    agreementId: {
      type: Schema.Types.ObjectId,
      ref: "PartnerAgreement",
    },
    defaultCommissionPlanId: {
      type: Schema.Types.ObjectId,
      ref: "CommissionPlan",
    },
    portalAccessEnabled: {
      type: Boolean,
      default: false,
    },
    onboardingDate: { type: Date },
    activationDate: { type: Date },
    suspensionDate: { type: Date },
    deactivationDate: { type: Date },
    suspensionReason: { type: String },
    version: {
      type: Number,
      default: 1,
    },
    createdBy: {
      type: String,
      required: true,
    },
    createdByName: {
      type: String,
    },
    updatedBy: {
      type: String,
    },
    updatedByName: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

ChannelPartnerSchema.index({ status: 1, partnerType: 1 });
ChannelPartnerSchema.index({ email: 1, phone: 1 });
ChannelPartnerSchema.index({ jurisdictionState: 1 });

export const ChannelPartner: Model<IChannelPartner> =
  mongoose.models.ChannelPartner ||
  mongoose.model<IChannelPartner>("ChannelPartner", ChannelPartnerSchema);

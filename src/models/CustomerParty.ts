import mongoose, { Schema, Document, Model, Types } from "mongoose";
import { CustomerPartyType, CUSTOMER_PARTY_TYPES } from "@/types/kyc";

export interface ICustomerParty extends Document {
  partyReference: string; // RDE-PTY-XXXXXX
  partyType: CustomerPartyType;
  displayName: string;
  leadId?: Types.ObjectId;
  
  // Primary contact summary (non-PII or safe display)
  primaryContactName: string;
  primaryContactPhoneMasked?: string;
  primaryContactEmailMasked?: string;

  // Active linkages
  dealIds: Types.ObjectId[];
  bookingIds: Types.ObjectId[];
  activeKycCaseId?: Types.ObjectId;

  status: "ACTIVE" | "INACTIVE" | "ARCHIVED";
  createdBy: string;
  createdByName: string;
  createdAt: Date;
  updatedAt: Date;
}

const CustomerPartySchema = new Schema<ICustomerParty>(
  {
    partyReference: {
      type: String,
      required: [true, "Party reference is required"],
      unique: true,
      trim: true,
      uppercase: true,
      index: true,
    },
    partyType: {
      type: String,
      enum: CUSTOMER_PARTY_TYPES,
      required: true,
      default: "INDIVIDUAL",
      index: true,
    },
    displayName: {
      type: String,
      required: [true, "Party display name is required"],
      trim: true,
      maxlength: [200, "Display name cannot exceed 200 characters"],
      index: true,
    },
    leadId: {
      type: Schema.Types.ObjectId,
      ref: "Lead",
      index: true,
    },
    primaryContactName: {
      type: String,
      required: true,
      trim: true,
    },
    primaryContactPhoneMasked: {
      type: String,
      trim: true,
    },
    primaryContactEmailMasked: {
      type: String,
      trim: true,
    },
    dealIds: [
      {
        type: Schema.Types.ObjectId,
        ref: "Deal",
      },
    ],
    bookingIds: [
      {
        type: Schema.Types.ObjectId,
        ref: "Booking",
      },
    ],
    activeKycCaseId: {
      type: Schema.Types.ObjectId,
      ref: "CustomerKycCase",
    },
    status: {
      type: String,
      enum: ["ACTIVE", "INACTIVE", "ARCHIVED"],
      default: "ACTIVE",
      index: true,
    },
    createdBy: {
      type: String,
      required: true,
    },
    createdByName: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

CustomerPartySchema.index({ partyType: 1, status: 1 });

export const CustomerParty: Model<ICustomerParty> =
  mongoose.models.CustomerParty || mongoose.model<ICustomerParty>("CustomerParty", CustomerPartySchema);

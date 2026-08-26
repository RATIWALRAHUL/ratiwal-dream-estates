import mongoose, { Schema, Document, Model, Types } from "mongoose";
import {
  PortalAccessRole,
  PORTAL_ACCESS_ROLES,
  PortalAccessStatus,
  PORTAL_ACCESS_STATUSES,
} from "@/types/portal";

export interface ICustomerPortalAccess extends Document {
  _id: Types.ObjectId;
  accountId: Types.ObjectId; // CustomerPortalAccount reference
  partyId: Types.ObjectId; // CustomerParty reference
  applicantIds: Types.ObjectId[]; // KycApplicant references
  bookingIds: Types.ObjectId[]; // Authorized Booking references

  accessRole: PortalAccessRole;
  status: PortalAccessStatus;

  grantedBy: string;
  grantedByName?: string;
  grantedTimestamp: Date;

  revokedBy?: string;
  revokedByName?: string;
  revokedTimestamp?: Date;
  revocationReason?: string;

  version: number;
  createdAt: Date;
  updatedAt: Date;
}

const CustomerPortalAccessSchema = new Schema<ICustomerPortalAccess>(
  {
    accountId: {
      type: Schema.Types.ObjectId,
      ref: "CustomerPortalAccount",
      required: [true, "Account reference is required"],
      index: true,
    },
    partyId: {
      type: Schema.Types.ObjectId,
      ref: "CustomerParty",
      required: [true, "Customer Party reference is required"],
      index: true,
    },
    applicantIds: [
      {
        type: Schema.Types.ObjectId,
        ref: "KycApplicant",
      },
    ],
    bookingIds: [
      {
        type: Schema.Types.ObjectId,
        ref: "Booking",
      },
    ],
    accessRole: {
      type: String,
      enum: PORTAL_ACCESS_ROLES,
      default: "PRIMARY_CUSTOMER",
      required: true,
    },
    status: {
      type: String,
      enum: PORTAL_ACCESS_STATUSES,
      default: "ACTIVE",
      index: true,
    },
    grantedBy: {
      type: String,
      required: true,
    },
    grantedByName: {
      type: String,
    },
    grantedTimestamp: {
      type: Date,
      default: Date.now,
    },
    revokedBy: {
      type: String,
    },
    revokedByName: {
      type: String,
    },
    revokedTimestamp: {
      type: Date,
    },
    revocationReason: {
      type: String,
      trim: true,
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

CustomerPortalAccessSchema.index({ accountId: 1, partyId: 1 }, { unique: true });
CustomerPortalAccessSchema.index({ accountId: 1, status: 1 });

export const CustomerPortalAccess: Model<ICustomerPortalAccess> =
  mongoose.models.CustomerPortalAccess ||
  mongoose.model<ICustomerPortalAccess>("CustomerPortalAccess", CustomerPortalAccessSchema);

import mongoose, { Schema, Document, Model, Types } from "mongoose";
import {
  PortalInvitationStatus,
  PORTAL_INVITATION_STATUSES,
  PortalAccessRole,
  PORTAL_ACCESS_ROLES,
} from "@/types/portal";

export interface ICustomerPortalInvitation extends Document {
  _id: Types.ObjectId;
  invitationNumber: string; // RDE-INV-XXXXXX
  partyId: Types.ObjectId;
  bookingId?: Types.ObjectId;
  applicantId?: Types.ObjectId;

  invitedEmail: string;
  invitedPhone?: string;
  invitedName: string;
  accessRole: PortalAccessRole;

  tokenHash: string;
  status: PortalInvitationStatus;
  expiresAt: Date;

  invitedBy: string;
  invitedByName?: string;
  sentTimestamp: Date;

  acceptedByAccountId?: Types.ObjectId;
  acceptedTimestamp?: Date;

  revokedBy?: string;
  revokedTimestamp?: Date;
  revocationReason?: string;

  resendCount: number;
  lastResentAt?: Date;

  createdAt: Date;
  updatedAt: Date;
}

const CustomerPortalInvitationSchema = new Schema<ICustomerPortalInvitation>(
  {
    invitationNumber: {
      type: String,
      required: [true, "Invitation number is required"],
      unique: true,
      trim: true,
      uppercase: true,
      index: true,
    },
    partyId: {
      type: Schema.Types.ObjectId,
      ref: "CustomerParty",
      required: [true, "Customer Party reference is required"],
      index: true,
    },
    bookingId: {
      type: Schema.Types.ObjectId,
      ref: "Booking",
      index: true,
    },
    applicantId: {
      type: Schema.Types.ObjectId,
      ref: "KycApplicant",
      index: true,
    },
    invitedEmail: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    invitedPhone: {
      type: String,
      trim: true,
    },
    invitedName: {
      type: String,
      required: true,
      trim: true,
    },
    accessRole: {
      type: String,
      enum: PORTAL_ACCESS_ROLES,
      default: "PRIMARY_CUSTOMER",
      required: true,
    },
    tokenHash: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    status: {
      type: String,
      enum: PORTAL_INVITATION_STATUSES,
      default: "PENDING",
      index: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: true,
    },
    invitedBy: {
      type: String,
      required: true,
    },
    invitedByName: {
      type: String,
    },
    sentTimestamp: {
      type: Date,
      default: Date.now,
    },
    acceptedByAccountId: {
      type: Schema.Types.ObjectId,
      ref: "CustomerPortalAccount",
    },
    acceptedTimestamp: {
      type: Date,
    },
    revokedBy: {
      type: String,
    },
    revokedTimestamp: {
      type: Date,
    },
    revocationReason: {
      type: String,
      trim: true,
    },
    resendCount: {
      type: Number,
      default: 0,
    },
    lastResentAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

CustomerPortalInvitationSchema.index({ partyId: 1, status: 1 });

export const CustomerPortalInvitation: Model<ICustomerPortalInvitation> =
  mongoose.models.CustomerPortalInvitation ||
  mongoose.model<ICustomerPortalInvitation>("CustomerPortalInvitation", CustomerPortalInvitationSchema);

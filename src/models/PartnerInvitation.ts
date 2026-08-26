import mongoose, { Schema, Document, Model, Types } from "mongoose";
import {
  PartnerInvitationStatus,
  PARTNER_INVITATION_STATUSES,
  PartnerType,
  PARTNER_TYPES,
} from "@/types/partner";

export interface IPartnerInvitation extends Document {
  _id: Types.ObjectId;
  invitationNumber: string; // RDE-PINV-XXXXXX
  partnerId: Types.ObjectId;
  partnerType: PartnerType;
  invitedEmail: string;
  invitedPhone?: string;
  invitedName: string;

  tokenHash: string; // SHA-256
  status: PartnerInvitationStatus;
  expiresAt: Date;

  resendCount: number;
  lastResentAt?: Date;

  invitedBy: string; // Admin User ID
  invitedByName?: string;

  acceptedByAccountId?: Types.ObjectId;
  acceptedTimestamp?: Date;

  revokedBy?: string;
  revokedTimestamp?: Date;
  revocationReason?: string;

  sentTimestamp: Date;
  createdAt: Date;
  updatedAt: Date;
}

const PartnerInvitationSchema = new Schema<IPartnerInvitation>(
  {
    invitationNumber: {
      type: String,
      required: [true, "Invitation number is required"],
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
    partnerType: {
      type: String,
      enum: PARTNER_TYPES,
      required: true,
    },
    invitedEmail: {
      type: String,
      required: [true, "Invited email is required"],
      lowercase: true,
      trim: true,
      index: true,
    },
    invitedPhone: {
      type: String,
      trim: true,
    },
    invitedName: {
      type: String,
      required: [true, "Invited recipient name is required"],
      trim: true,
    },
    tokenHash: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    status: {
      type: String,
      enum: PARTNER_INVITATION_STATUSES,
      default: "PENDING",
      index: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: true,
    },
    resendCount: {
      type: Number,
      default: 0,
    },
    lastResentAt: {
      type: Date,
    },
    invitedBy: {
      type: String,
      required: true,
    },
    invitedByName: {
      type: String,
    },
    acceptedByAccountId: {
      type: Schema.Types.ObjectId,
      ref: "PartnerAccount",
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
    },
    sentTimestamp: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

export const PartnerInvitation: Model<IPartnerInvitation> =
  mongoose.models.PartnerInvitation ||
  mongoose.model<IPartnerInvitation>("PartnerInvitation", PartnerInvitationSchema);

import mongoose, { Schema, Document, Model, Types } from "mongoose";
import { DataScope, DATA_SCOPES } from "@/types/settings-team";

export interface ITeamInvitation extends Document {
  _id: Types.ObjectId;
  email: string;
  tokenHash: string; // SHA-256 hash of 32-byte cryptographically secure token
  fullName: string;
  jobTitle?: string;
  department?: string;
  roleKey: string;
  dataScope: DataScope;
  assignedPropertyIds: Types.ObjectId[];
  assignedLocationIds: Types.ObjectId[];
  invitedBy: string;
  invitedByName?: string;
  status: "INVITED" | "ACCEPTED" | "EXPIRED" | "REVOKED";
  expiresAt: Date;
  acceptedAt?: Date;
  revokedAt?: Date;
  revokedBy?: string;
  revocationReason?: string;
  resendCount: number;
  lastSentAt: Date;
  deliveryStatus: "DELIVERED" | "NOT_CONFIGURED" | "FAILED";
  createdAt: Date;
  updatedAt: Date;
}

const TeamInvitationSchema = new Schema<ITeamInvitation>(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    tokenHash: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    jobTitle: {
      type: String,
      trim: true,
      default: "Team Member",
    },
    department: {
      type: String,
      default: "SALES",
    },
    roleKey: {
      type: String,
      required: true,
      trim: true,
    },
    dataScope: {
      type: String,
      enum: DATA_SCOPES,
      default: "ALL_ORGANIZATION",
      required: true,
    },
    assignedPropertyIds: [
      {
        type: Schema.Types.ObjectId,
        ref: "Property",
      },
    ],
    assignedLocationIds: [
      {
        type: Schema.Types.ObjectId,
        ref: "Location",
      },
    ],
    invitedBy: {
      type: String,
      required: true,
    },
    invitedByName: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ["INVITED", "ACCEPTED", "EXPIRED", "REVOKED"],
      default: "INVITED",
      required: true,
      index: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    acceptedAt: {
      type: Date,
    },
    revokedAt: {
      type: Date,
      index: true,
    },
    revokedBy: {
      type: String,
    },
    revocationReason: {
      type: String,
      maxlength: 300,
    },
    resendCount: {
      type: Number,
      default: 0,
    },
    lastSentAt: {
      type: Date,
      default: Date.now,
    },
    deliveryStatus: {
      type: String,
      enum: ["DELIVERED", "NOT_CONFIGURED", "FAILED"],
      default: "NOT_CONFIGURED",
    },
  },
  {
    timestamps: true,
  }
);

// TTL Index to purge expired invitations 30 days after expiry
TeamInvitationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 2592000 });
TeamInvitationSchema.index({ email: 1, status: 1 });

export const TeamInvitation: Model<ITeamInvitation> =
  mongoose.models.TeamInvitation || mongoose.model<ITeamInvitation>("TeamInvitation", TeamInvitationSchema);

import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface IAdminAuthSession extends Document {
  _id: Types.ObjectId;
  sessionId: string; // Unique random hex
  userId: string;
  sessionTokenHash: string; // SHA-256 hash of raw session token
  ipAddress: string;
  userAgent: string;
  browser: string;
  os: string;
  deviceType: "DESKTOP" | "MOBILE" | "TABLET" | "UNKNOWN";
  locationCity?: string;
  locationCountry?: string;
  lastActiveAt: Date;
  expiresAt: Date;
  isRevoked: boolean;
  revokedAt?: Date;
  revokedReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const AdminAuthSessionSchema = new Schema<IAdminAuthSession>(
  {
    sessionId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    userId: {
      type: String,
      required: true,
      index: true,
    },
    sessionTokenHash: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    ipAddress: {
      type: String,
      default: "127.0.0.1",
    },
    userAgent: {
      type: String,
      default: "Unknown",
    },
    browser: {
      type: String,
      default: "Chrome",
    },
    os: {
      type: String,
      default: "Windows",
    },
    deviceType: {
      type: String,
      enum: ["DESKTOP", "MOBILE", "TABLET", "UNKNOWN"],
      default: "DESKTOP",
    },
    locationCity: {
      type: String,
      default: "Jaipur",
    },
    locationCountry: {
      type: String,
      default: "IN",
    },
    lastActiveAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expires: "0s" }, // Automatic TTL cleanup after expiry
    },
    isRevoked: {
      type: Boolean,
      default: false,
      index: true,
    },
    revokedAt: {
      type: Date,
    },
    revokedReason: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

AdminAuthSessionSchema.index({ userId: 1, isRevoked: 1, expiresAt: 1 });

export const AdminAuthSession: Model<IAdminAuthSession> =
  mongoose.models.AdminAuthSession ||
  mongoose.model<IAdminAuthSession>("AdminAuthSession", AdminAuthSessionSchema);

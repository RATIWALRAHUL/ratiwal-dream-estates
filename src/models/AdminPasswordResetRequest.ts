import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface IAdminPasswordResetRequest extends Document {
  _id: Types.ObjectId;
  identifier: string; // Lowercase email or E.164 phone
  hashedOtp: string; // SHA-256 HMAC of 6-digit OTP
  resetSessionTokenHash?: string; // SHA-256 of session token issued upon OTP verification
  attemptsCount: number;
  resendCount: number;
  lastResentAt: Date;
  isVerified: boolean;
  isConsumed: boolean;
  expiresAt: Date; // 10 minutes TTL
  createdAt: Date;
  updatedAt: Date;
}

const AdminPasswordResetRequestSchema = new Schema<IAdminPasswordResetRequest>(
  {
    identifier: {
      type: String,
      required: true,
      index: true,
      trim: true,
    },
    hashedOtp: {
      type: String,
      required: true,
    },
    resetSessionTokenHash: {
      type: String,
      index: true,
      sparse: true,
    },
    attemptsCount: {
      type: Number,
      default: 0,
      required: true,
    },
    resendCount: {
      type: Number,
      default: 0,
      required: true,
    },
    lastResentAt: {
      type: Date,
      default: Date.now,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    isConsumed: {
      type: Boolean,
      default: false,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expires: "0s" },
    },
  },
  {
    timestamps: true,
  }
);

AdminPasswordResetRequestSchema.index({ identifier: 1, isConsumed: 1, expiresAt: 1 });

export const AdminPasswordResetRequest: Model<IAdminPasswordResetRequest> =
  mongoose.models.AdminPasswordResetRequest ||
  mongoose.model<IAdminPasswordResetRequest>("AdminPasswordResetRequest", AdminPasswordResetRequestSchema);

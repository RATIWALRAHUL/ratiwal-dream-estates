import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface IAdminAuthAccount extends Document {
  _id: Types.ObjectId;
  email: string;
  phone?: string;
  phoneNormalized?: string; // E.164 format, e.g. +919829012345
  passwordHash: string;
  passwordSalt: string;
  name: string;
  role: "ADMIN" | "EDITOR" | "SUPER_ADMIN";
  isActive: boolean;
  mfaEnabled: boolean;
  mfaSecret?: string;
  mfaRecoveryCodes?: string[]; // Hashed backup codes
  failedLoginAttempts: number;
  lockUntil?: Date;
  lastLoginAt?: Date;
  lastPasswordResetAt?: Date;
  passwordHistory?: { hash: string; changedAt: Date }[]; // Prevent reusing last 3 passwords
  teamMemberId?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const AdminAuthAccountSchema = new Schema<IAdminAuthAccount>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    phoneNormalized: {
      type: String,
      trim: true,
      index: true,
      sparse: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    passwordSalt: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    role: {
      type: String,
      enum: ["ADMIN", "EDITOR", "SUPER_ADMIN"],
      default: "ADMIN",
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      required: true,
    },
    mfaEnabled: {
      type: Boolean,
      default: false,
    },
    mfaSecret: {
      type: String,
    },
    mfaRecoveryCodes: {
      type: [String],
      default: [],
    },
    failedLoginAttempts: {
      type: Number,
      default: 0,
      required: true,
    },
    lockUntil: {
      type: Date,
    },
    lastLoginAt: {
      type: Date,
    },
    lastPasswordResetAt: {
      type: Date,
    },
    passwordHistory: [
      {
        hash: { type: String, required: true },
        changedAt: { type: Date, default: Date.now },
      },
    ],
    teamMemberId: {
      type: Schema.Types.ObjectId,
      ref: "TeamMember",
    },
  },
  {
    timestamps: true,
  }
);

AdminAuthAccountSchema.index({ phoneNormalized: 1, isActive: 1 });

export const AdminAuthAccount: Model<IAdminAuthAccount> =
  mongoose.models.AdminAuthAccount ||
  mongoose.model<IAdminAuthAccount>("AdminAuthAccount", AdminAuthAccountSchema);

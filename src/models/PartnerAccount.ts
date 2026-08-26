import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface IPartnerAccount extends Document {
  _id: Types.ObjectId;
  partnerId: Types.ObjectId;
  email: string;
  phone?: string;
  name: string;

  passwordHash: string;
  passwordSalt: string;

  isActive: boolean;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;

  failedLoginAttempts: number;
  lockoutUntil?: Date;
  lastLoginAt?: Date;
  lastLoginIp?: string;

  notificationPreferences: {
    email: boolean;
    sms: boolean;
    whatsapp: boolean;
  };

  createdAt: Date;
  updatedAt: Date;
}

const PartnerAccountSchema = new Schema<IPartnerAccount>(
  {
    partnerId: {
      type: Schema.Types.ObjectId,
      ref: "ChannelPartner",
      required: [true, "Partner reference is required"],
      unique: true,
      index: true,
    },
    email: {
      type: String,
      required: [true, "Email address is required"],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    name: {
      type: String,
      required: [true, "Authorized account name is required"],
      trim: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    passwordSalt: {
      type: String,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    isEmailVerified: {
      type: Boolean,
      default: true,
    },
    isPhoneVerified: {
      type: Boolean,
      default: false,
    },
    failedLoginAttempts: {
      type: Number,
      default: 0,
    },
    lockoutUntil: {
      type: Date,
    },
    lastLoginAt: {
      type: Date,
    },
    lastLoginIp: {
      type: String,
    },
    notificationPreferences: {
      email: { type: Boolean, default: true },
      sms: { type: Boolean, default: true },
      whatsapp: { type: Boolean, default: true },
    },
  },
  {
    timestamps: true,
  }
);

export const PartnerAccount: Model<IPartnerAccount> =
  mongoose.models.PartnerAccount ||
  mongoose.model<IPartnerAccount>("PartnerAccount", PartnerAccountSchema);

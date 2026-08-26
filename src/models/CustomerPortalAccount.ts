import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface ICustomerPortalAccount extends Document {
  _id: Types.ObjectId;
  email: string;
  phone?: string;
  name: string;
  passwordHash: string;
  passwordSalt: string;

  isActive: boolean;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;

  failedLoginAttempts: number;
  lockUntil?: Date;

  mfaSecret?: string;
  mfaEnabled: boolean;

  lastLoginAt?: Date;
  lastLoginIp?: string;

  communicationPreferences: {
    transactionalEmail: boolean;
    transactionalWhatsapp: boolean;
    marketingConsent: boolean;
    preferredLanguage: string;
  };

  createdAt: Date;
  updatedAt: Date;
}

const CustomerPortalAccountSchema = new Schema<ICustomerPortalAccount>(
  {
    email: {
      type: String,
      required: [true, "Customer email is required"],
      unique: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    phone: {
      type: String,
      trim: true,
      sparse: true,
    },
    name: {
      type: String,
      required: [true, "Customer name is required"],
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
    lockUntil: {
      type: Date,
    },
    mfaSecret: {
      type: String,
    },
    mfaEnabled: {
      type: Boolean,
      default: false,
    },
    lastLoginAt: {
      type: Date,
    },
    lastLoginIp: {
      type: String,
    },
    communicationPreferences: {
      transactionalEmail: {
        type: Boolean,
        default: true,
      },
      transactionalWhatsapp: {
        type: Boolean,
        default: true,
      },
      marketingConsent: {
        type: Boolean,
        default: false,
      },
      preferredLanguage: {
        type: String,
        default: "en",
      },
    },
  },
  {
    timestamps: true,
  }
);

export const CustomerPortalAccount: Model<ICustomerPortalAccount> =
  mongoose.models.CustomerPortalAccount ||
  mongoose.model<ICustomerPortalAccount>("CustomerPortalAccount", CustomerPortalAccountSchema);

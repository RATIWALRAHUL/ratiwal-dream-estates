import mongoose, { Schema, Document, Model, Types } from "mongoose";
import { ApplicantRole, APPLICANT_ROLES, ApplicantKycStatus, APPLICANT_KYC_STATUSES } from "@/types/kyc";

export interface IKycApplicant extends Document {
  partyId: Types.ObjectId;
  kycCaseId: Types.ObjectId;
  role: ApplicantRole;

  // Safe display fields
  fullName: string;
  maskedPhone?: string;
  maskedEmail?: string;
  maskedPan?: string;
  maskedAadhaarLast4?: string;
  maskedPassport?: string;

  // Application-level AES-256 encrypted fields
  encryptedDob?: string; // Stored only if strictly required
  encryptedAddressLine?: string;
  encryptedPan?: string;
  encryptedAadhaarNumber?: string;
  encryptionKeyVersion: number;

  // Keyed HMAC for duplicate detection without storing plaintext
  panHmac?: string;
  aadhaarHmac?: string;

  // Address components (General non-sensitive city/state)
  city?: string;
  state?: string;
  pincode?: string;
  country: string;
  isNri: boolean;

  consentRecordId?: Types.ObjectId;
  status: ApplicantKycStatus;
  version: number;
  createdAt: Date;
  updatedAt: Date;
}

const KycApplicantSchema = new Schema<IKycApplicant>(
  {
    partyId: {
      type: Schema.Types.ObjectId,
      ref: "CustomerParty",
      required: [true, "Party reference is required"],
      index: true,
    },
    kycCaseId: {
      type: Schema.Types.ObjectId,
      ref: "CustomerKycCase",
      required: [true, "KYC case reference is required"],
      index: true,
    },
    role: {
      type: String,
      enum: APPLICANT_ROLES,
      required: true,
      default: "PRIMARY",
      index: true,
    },
    fullName: {
      type: String,
      required: [true, "Applicant full name is required"],
      trim: true,
      maxlength: [150, "Full name cannot exceed 150 characters"],
    },
    maskedPhone: {
      type: String,
      trim: true,
    },
    maskedEmail: {
      type: String,
      trim: true,
    },
    maskedPan: {
      type: String,
      trim: true,
    },
    maskedAadhaarLast4: {
      type: String,
      trim: true,
    },
    maskedPassport: {
      type: String,
      trim: true,
    },

    // Protected encrypted values
    encryptedDob: {
      type: String,
    },
    encryptedAddressLine: {
      type: String,
    },
    encryptedPan: {
      type: String,
    },
    encryptedAadhaarNumber: {
      type: String,
    },
    encryptionKeyVersion: {
      type: Number,
      default: 1,
    },

    // Keyed blind index HMACs
    panHmac: {
      type: String,
      index: true,
    },
    aadhaarHmac: {
      type: String,
      index: true,
    },

    city: {
      type: String,
      trim: true,
    },
    state: {
      type: String,
      trim: true,
    },
    pincode: {
      type: String,
      trim: true,
    },
    country: {
      type: String,
      default: "India",
      trim: true,
    },
    isNri: {
      type: Boolean,
      default: false,
    },

    consentRecordId: {
      type: Schema.Types.ObjectId,
      ref: "DataProcessingRecord",
    },
    status: {
      type: String,
      enum: APPLICANT_KYC_STATUSES,
      default: "PENDING",
      index: true,
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

KycApplicantSchema.index({ kycCaseId: 1, role: 1 });

export const KycApplicant: Model<IKycApplicant> =
  mongoose.models.KycApplicant || mongoose.model<IKycApplicant>("KycApplicant", KycApplicantSchema);

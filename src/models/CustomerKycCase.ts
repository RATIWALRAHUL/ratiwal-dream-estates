import mongoose, { Schema, Document, Model, Types } from "mongoose";
import { KycCaseStatus, KYC_CASE_STATUSES } from "@/types/kyc";

export interface IKycRiskFlag {
  code: string;
  severity: "LOW" | "MEDIUM" | "HIGH";
  message: string;
  flaggedAt: Date;
}

export interface ICustomerKycCase extends Document {
  kycCaseNumber: string; // RDE-KYC-XXXXXX
  partyId: Types.ObjectId;
  templateId: Types.ObjectId;
  templateVersion: number;

  // Transaction linkages
  dealId?: Types.ObjectId;
  reservationId?: Types.ObjectId;
  bookingId?: Types.ObjectId;
  propertyId: Types.ObjectId;
  unitId?: Types.ObjectId;

  status: KycCaseStatus;
  purpose: string;
  legalBasis: string;

  assignedReviewerId?: string;
  assignedReviewerName?: string;
  assignedReviewerEmail?: string;

  // Deterministic risk flags (never AI-generated)
  riskFlags: IKycRiskFlag[];

  // Requirements progress
  totalRequirementsCount: number;
  satisfiedRequirementsCount: number;
  blockingBookingConfirmation: boolean;

  // Lifecycle Timestamps
  startedAt: Date;
  submittedAt?: Date;
  reviewStartedAt?: Date;
  completedAt?: Date;
  expiresAt?: Date;
  reviewDueAt?: Date;
  archivedAt?: Date;

  rejectionReason?: string;
  actionRequiredNotes?: string;

  version: number;
  createdBy: string;
  createdByName: string;
  updatedBy?: string;
  updatedByName?: string;
  createdAt: Date;
  updatedAt: Date;
}

const KycRiskFlagSchema = new Schema<IKycRiskFlag>(
  {
    code: { type: String, required: true, trim: true },
    severity: { type: String, enum: ["LOW", "MEDIUM", "HIGH"], required: true },
    message: { type: String, required: true, trim: true },
    flaggedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const CustomerKycCaseSchema = new Schema<ICustomerKycCase>(
  {
    kycCaseNumber: {
      type: String,
      required: [true, "KYC Case Number is required"],
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
    templateId: {
      type: Schema.Types.ObjectId,
      ref: "KycRequirementTemplate",
      required: true,
      index: true,
    },
    templateVersion: {
      type: Number,
      required: true,
      default: 1,
    },
    dealId: {
      type: Schema.Types.ObjectId,
      ref: "Deal",
      index: true,
    },
    reservationId: {
      type: Schema.Types.ObjectId,
      ref: "Reservation",
      index: true,
    },
    bookingId: {
      type: Schema.Types.ObjectId,
      ref: "Booking",
      index: true,
    },
    propertyId: {
      type: Schema.Types.ObjectId,
      ref: "Property",
      required: true,
      index: true,
    },
    unitId: {
      type: Schema.Types.ObjectId,
      ref: "InventoryUnit",
      index: true,
    },
    status: {
      type: String,
      enum: KYC_CASE_STATUSES,
      default: "NOT_STARTED",
      required: true,
      index: true,
    },
    purpose: {
      type: String,
      required: true,
      default: "Real Estate Buyer Identity Verification & Property Registration Due Diligence",
    },
    legalBasis: {
      type: String,
      required: true,
      default: "CONTRACTUAL_NECESSITY",
    },
    assignedReviewerId: {
      type: String,
      index: true,
    },
    assignedReviewerName: {
      type: String,
      trim: true,
    },
    assignedReviewerEmail: {
      type: String,
      trim: true,
    },
    riskFlags: {
      type: [KycRiskFlagSchema],
      default: [],
    },
    totalRequirementsCount: {
      type: Number,
      default: 0,
    },
    satisfiedRequirementsCount: {
      type: Number,
      default: 0,
    },
    blockingBookingConfirmation: {
      type: Boolean,
      default: true,
      index: true,
    },
    startedAt: {
      type: Date,
      default: Date.now,
    },
    submittedAt: {
      type: Date,
    },
    reviewStartedAt: {
      type: Date,
    },
    completedAt: {
      type: Date,
    },
    expiresAt: {
      type: Date,
      index: true,
    },
    reviewDueAt: {
      type: Date,
      index: true,
    },
    archivedAt: {
      type: Date,
    },
    rejectionReason: {
      type: String,
      trim: true,
    },
    actionRequiredNotes: {
      type: String,
      trim: true,
    },
    version: {
      type: Number,
      default: 1,
      required: true,
    },
    createdBy: {
      type: String,
      required: true,
    },
    createdByName: {
      type: String,
      required: true,
    },
    updatedBy: {
      type: String,
    },
    updatedByName: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

CustomerKycCaseSchema.index({ status: 1, propertyId: 1 });
CustomerKycCaseSchema.index({ assignedReviewerId: 1, status: 1 });

export const CustomerKycCase: Model<ICustomerKycCase> =
  mongoose.models.CustomerKycCase ||
  mongoose.model<ICustomerKycCase>("CustomerKycCase", CustomerKycCaseSchema);

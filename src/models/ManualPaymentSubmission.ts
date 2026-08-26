import mongoose, { Schema, Document, Model, Types } from "mongoose";
import {
  PaymentMethod,
  PAYMENT_METHODS,
  ManualPaymentStatus,
  MANUAL_PAYMENT_STATUSES,
} from "@/types/payment";

export interface IManualPaymentSubmission extends Document {
  _id: Types.ObjectId;
  submissionNumber: string; // RDE-MPS-XXXXXX
  bookingId: Types.ObjectId;
  planId: Types.ObjectId;
  installmentId?: Types.ObjectId;
  partyId?: Types.ObjectId;

  currency: string;
  claimedAmountPaise: number;
  method: PaymentMethod;
  referenceNumber: string; // Bank UTR, Cheque No, DD No
  paymentDate: Date;

  bankName?: string;
  bankBranch?: string;
  drawerName?: string;

  proofDocumentKey?: string;
  proofDocumentUrl?: string;

  status: ManualPaymentStatus;
  submittedBy: string;
  submittedByName?: string;

  reviewedBy?: string;
  reviewedByName?: string;
  reviewedAt?: Date;

  rejectionReason?: string;
  actionRequiredReason?: string;
  verificationNotes?: string;

  resultingPaymentId?: Types.ObjectId;

  createdAt: Date;
  updatedAt: Date;
}

const ManualPaymentSubmissionSchema = new Schema<IManualPaymentSubmission>(
  {
    submissionNumber: {
      type: String,
      required: [true, "Submission number is required"],
      unique: true,
      trim: true,
      uppercase: true,
      index: true,
    },
    bookingId: {
      type: Schema.Types.ObjectId,
      ref: "Booking",
      required: [true, "Booking reference is required"],
      index: true,
    },
    planId: {
      type: Schema.Types.ObjectId,
      ref: "PaymentPlan",
      required: [true, "Payment plan reference is required"],
      index: true,
    },
    installmentId: {
      type: Schema.Types.ObjectId,
      ref: "PaymentInstallment",
      index: true,
    },
    partyId: {
      type: Schema.Types.ObjectId,
      ref: "CustomerParty",
      index: true,
    },
    currency: {
      type: String,
      default: "INR",
      uppercase: true,
    },
    claimedAmountPaise: {
      type: Number,
      required: true,
      min: 1,
    },
    method: {
      type: String,
      enum: PAYMENT_METHODS,
      required: true,
      default: "BANK_TRANSFER_NEFT_RTGS",
    },
    referenceNumber: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
      index: true,
    },
    paymentDate: {
      type: Date,
      required: true,
    },
    bankName: {
      type: String,
      trim: true,
    },
    bankBranch: {
      type: String,
      trim: true,
    },
    drawerName: {
      type: String,
      trim: true,
    },
    proofDocumentKey: {
      type: String,
      trim: true,
    },
    proofDocumentUrl: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: MANUAL_PAYMENT_STATUSES,
      default: "SUBMITTED",
      index: true,
    },
    submittedBy: {
      type: String,
      required: true,
    },
    submittedByName: {
      type: String,
    },
    reviewedBy: {
      type: String,
    },
    reviewedByName: {
      type: String,
    },
    reviewedAt: {
      type: Date,
    },
    rejectionReason: {
      type: String,
      trim: true,
    },
    actionRequiredReason: {
      type: String,
      trim: true,
    },
    verificationNotes: {
      type: String,
      trim: true,
    },
    resultingPaymentId: {
      type: Schema.Types.ObjectId,
      ref: "PaymentTransaction",
    },
  },
  {
    timestamps: true,
  }
);

ManualPaymentSubmissionSchema.index({ bookingId: 1, status: 1 });
ManualPaymentSubmissionSchema.index({ referenceNumber: 1, method: 1 });

export const ManualPaymentSubmission: Model<IManualPaymentSubmission> =
  mongoose.models.ManualPaymentSubmission ||
  mongoose.model<IManualPaymentSubmission>("ManualPaymentSubmission", ManualPaymentSubmissionSchema);

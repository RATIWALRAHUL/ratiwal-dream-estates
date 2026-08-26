import mongoose, { Schema, Document, Model, Types } from "mongoose";
import {
  InstallmentType,
  INSTALLMENT_TYPES,
  InstallmentStatus,
  INSTALLMENT_STATUSES,
} from "@/types/payment";

export interface IPaymentInstallment extends Document {
  _id: Types.ObjectId;
  planId: Types.ObjectId;
  bookingId: Types.ObjectId;
  sequence: number;
  installmentKey: string; // e.g. INST-01, INST-02, BKG-AMT
  type: InstallmentType;
  description: string;
  currency: string;

  originalAmountPaise: number;
  adjustedAmountPaise: number;
  paidAmountPaise: number;
  refundedAmountPaise: number;
  outstandingAmountPaise: number;

  dueDate: Date;
  graceDate?: Date;
  status: InstallmentStatus;
  milestoneReference?: string;
  version: number;

  createdAt: Date;
  updatedAt: Date;
}

const PaymentInstallmentSchema = new Schema<IPaymentInstallment>(
  {
    planId: {
      type: Schema.Types.ObjectId,
      ref: "PaymentPlan",
      required: [true, "Plan reference is required"],
      index: true,
    },
    bookingId: {
      type: Schema.Types.ObjectId,
      ref: "Booking",
      required: [true, "Booking reference is required"],
      index: true,
    },
    sequence: {
      type: Number,
      required: true,
    },
    installmentKey: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
    },
    type: {
      type: String,
      enum: INSTALLMENT_TYPES,
      required: true,
      default: "SCHEDULED_INSTALLMENT",
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    currency: {
      type: String,
      default: "INR",
      uppercase: true,
    },
    originalAmountPaise: {
      type: Number,
      required: true,
      min: 0,
    },
    adjustedAmountPaise: {
      type: Number,
      required: true,
      min: 0,
    },
    paidAmountPaise: {
      type: Number,
      default: 0,
      min: 0,
    },
    refundedAmountPaise: {
      type: Number,
      default: 0,
      min: 0,
    },
    outstandingAmountPaise: {
      type: Number,
      required: true,
      min: 0,
    },
    dueDate: {
      type: Date,
      required: true,
      index: true,
    },
    graceDate: {
      type: Date,
    },
    status: {
      type: String,
      enum: INSTALLMENT_STATUSES,
      default: "UPCOMING",
      index: true,
    },
    milestoneReference: {
      type: String,
      trim: true,
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

PaymentInstallmentSchema.index({ planId: 1, sequence: 1 }, { unique: true });
PaymentInstallmentSchema.index({ bookingId: 1, status: 1 });

export const PaymentInstallment: Model<IPaymentInstallment> =
  mongoose.models.PaymentInstallment ||
  mongoose.model<IPaymentInstallment>("PaymentInstallment", PaymentInstallmentSchema);

import mongoose, { Schema, Document, Model, Types } from "mongoose";
import {
  CommissionAdjustmentType,
  COMMISSION_ADJUSTMENT_TYPES,
} from "@/types/commission";

export interface ICommissionAdjustment extends Document {
  _id: Types.ObjectId;
  adjustmentNumber: string; // RDE-CADJ-XXXXXX
  accrualId: Types.ObjectId;
  partnerId: Types.ObjectId;
  bookingId: Types.ObjectId;

  type: CommissionAdjustmentType;
  currency: string;
  amountPaise: number; // Positive integer minor units

  reasonCode: "REFUND_CLAWBACK" | "BOOKING_CANCELLATION" | "COMMISSION_SLAB_CORRECTION" | "MANUAL_DISPUTE_SETTLEMENT" | "ACCOUNTING_ADJUSTMENT";
  explanation: string;

  relatedRefundId?: Types.ObjectId;
  relatedPaymentId?: Types.ObjectId;

  status: "PENDING_APPROVAL" | "APPLIED" | "REJECTED";
  requestedBy: string;
  requestedByName?: string;
  approvedBy?: string;
  approvedByName?: string;
  effectiveTimestamp: Date;

  createdAt: Date;
  updatedAt: Date;
}

const CommissionAdjustmentSchema = new Schema<ICommissionAdjustment>(
  {
    adjustmentNumber: {
      type: String,
      required: [true, "Adjustment number is required"],
      unique: true,
      trim: true,
      uppercase: true,
      index: true,
    },
    accrualId: {
      type: Schema.Types.ObjectId,
      ref: "CommissionAccrual",
      required: [true, "Accrual reference is required"],
      index: true,
    },
    partnerId: {
      type: Schema.Types.ObjectId,
      ref: "ChannelPartner",
      required: [true, "Partner reference is required"],
      index: true,
    },
    bookingId: {
      type: Schema.Types.ObjectId,
      ref: "Booking",
      required: [true, "Booking reference is required"],
      index: true,
    },
    type: {
      type: String,
      enum: COMMISSION_ADJUSTMENT_TYPES,
      required: true,
    },
    currency: {
      type: String,
      required: true,
      default: "INR",
    },
    amountPaise: {
      type: Number,
      required: true,
      min: 0,
    },
    reasonCode: {
      type: String,
      enum: [
        "REFUND_CLAWBACK",
        "BOOKING_CANCELLATION",
        "COMMISSION_SLAB_CORRECTION",
        "MANUAL_DISPUTE_SETTLEMENT",
        "ACCOUNTING_ADJUSTMENT",
      ],
      required: true,
    },
    explanation: {
      type: String,
      required: true,
      trim: true,
    },
    relatedRefundId: {
      type: Schema.Types.ObjectId,
      ref: "RefundRequest",
    },
    relatedPaymentId: {
      type: Schema.Types.ObjectId,
      ref: "PaymentTransaction",
    },
    status: {
      type: String,
      enum: ["PENDING_APPROVAL", "APPLIED", "REJECTED"],
      default: "APPLIED",
      index: true,
    },
    requestedBy: {
      type: String,
      required: true,
    },
    requestedByName: {
      type: String,
    },
    approvedBy: {
      type: String,
    },
    approvedByName: {
      type: String,
    },
    effectiveTimestamp: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

export const CommissionAdjustment: Model<ICommissionAdjustment> =
  mongoose.models.CommissionAdjustment ||
  mongoose.model<ICommissionAdjustment>("CommissionAdjustment", CommissionAdjustmentSchema);

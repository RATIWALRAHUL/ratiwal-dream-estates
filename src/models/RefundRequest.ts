import mongoose, { Schema, Document, Model, Types } from "mongoose";
import {
  RefundRequestStatus,
  REFUND_REQUEST_STATUSES,
  RefundReasonCode,
  REFUND_REASON_CODES,
} from "@/types/payment";

export interface IRefundRequest extends Document {
  _id: Types.ObjectId;
  requestNumber: string; // RDE-RRQ-XXXXXX
  bookingId: Types.ObjectId;
  paymentId: Types.ObjectId;
  partyId?: Types.ObjectId;

  currency: string;
  requestedAmountPaise: number;
  reasonCode: RefundReasonCode;
  explanation: string;
  supportingEvidenceKeys?: string[];

  status: RefundRequestStatus;
  requestedBy: string;
  requestedByName?: string;

  reviewedBy?: string;
  reviewedByName?: string;
  reviewedAt?: Date;

  approvedBy?: string;
  approvedByName?: string;
  approvedAt?: Date;

  rejectionReason?: string;
  resultingRefundId?: Types.ObjectId;

  idempotencyKey: string;
  createdAt: Date;
  updatedAt: Date;
}

const RefundRequestSchema = new Schema<IRefundRequest>(
  {
    requestNumber: {
      type: String,
      required: [true, "Refund request number is required"],
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
    paymentId: {
      type: Schema.Types.ObjectId,
      ref: "PaymentTransaction",
      required: [true, "Payment reference is required"],
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
    requestedAmountPaise: {
      type: Number,
      required: true,
      min: 1,
    },
    reasonCode: {
      type: String,
      enum: REFUND_REASON_CODES,
      required: true,
    },
    explanation: {
      type: String,
      required: true,
      trim: true,
    },
    supportingEvidenceKeys: {
      type: [String],
      default: [],
    },
    status: {
      type: String,
      enum: REFUND_REQUEST_STATUSES,
      default: "DRAFT",
      index: true,
    },
    requestedBy: {
      type: String,
      required: true,
    },
    requestedByName: {
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
    approvedBy: {
      type: String,
    },
    approvedByName: {
      type: String,
    },
    approvedAt: {
      type: Date,
    },
    rejectionReason: {
      type: String,
      trim: true,
    },
    resultingRefundId: {
      type: Schema.Types.ObjectId,
      ref: "PaymentRefund",
    },
    idempotencyKey: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

RefundRequestSchema.index({ bookingId: 1, status: 1 });

export const RefundRequest: Model<IRefundRequest> =
  mongoose.models.RefundRequest ||
  mongoose.model<IRefundRequest>("RefundRequest", RefundRequestSchema);

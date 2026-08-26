import mongoose, { Schema, Document, Model, Types } from "mongoose";
import { PaymentRefundStatus, PAYMENT_REFUND_STATUSES } from "@/types/payment";

export interface IPaymentRefund extends Document {
  _id: Types.ObjectId;
  refundNumber: string; // RDE-RFD-XXXXXX
  requestId?: Types.ObjectId;
  paymentId: Types.ObjectId;
  bookingId: Types.ObjectId;

  provider: "RAZORPAY" | "MANUAL" | "MOCK";
  providerRefundId?: string;
  providerStatus?: string;
  providerIdempotencyKey: string;

  currency: string;
  requestedAmountPaise: number;
  processedAmountPaise: number;
  status: PaymentRefundStatus;

  failureCategory?: string;
  sanitizedFailureMessage?: string;

  requestedAt: Date;
  processedAt?: Date;
  failedAt?: Date;
  reconciledAt?: Date;

  initiatedBy: string;
  initiatedByName?: string;

  version: number;
  createdAt: Date;
  updatedAt: Date;
}

const PaymentRefundSchema = new Schema<IPaymentRefund>(
  {
    refundNumber: {
      type: String,
      required: [true, "Refund number is required"],
      unique: true,
      trim: true,
      uppercase: true,
      index: true,
    },
    requestId: {
      type: Schema.Types.ObjectId,
      ref: "RefundRequest",
      index: true,
    },
    paymentId: {
      type: Schema.Types.ObjectId,
      ref: "PaymentTransaction",
      required: [true, "Payment reference is required"],
      index: true,
    },
    bookingId: {
      type: Schema.Types.ObjectId,
      ref: "Booking",
      required: [true, "Booking reference is required"],
      index: true,
    },
    provider: {
      type: String,
      enum: ["RAZORPAY", "MANUAL", "MOCK"],
      required: true,
      default: "RAZORPAY",
    },
    providerRefundId: {
      type: String,
      trim: true,
      index: true,
      sparse: true,
    },
    providerStatus: {
      type: String,
      trim: true,
    },
    providerIdempotencyKey: {
      type: String,
      required: true,
      unique: true,
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
    processedAmountPaise: {
      type: Number,
      default: 0,
      min: 0,
    },
    status: {
      type: String,
      enum: PAYMENT_REFUND_STATUSES,
      default: "CREATED",
      index: true,
    },
    failureCategory: {
      type: String,
      trim: true,
    },
    sanitizedFailureMessage: {
      type: String,
      trim: true,
    },
    requestedAt: {
      type: Date,
      default: Date.now,
    },
    processedAt: {
      type: Date,
    },
    failedAt: {
      type: Date,
    },
    reconciledAt: {
      type: Date,
    },
    initiatedBy: {
      type: String,
      required: true,
    },
    initiatedByName: {
      type: String,
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

PaymentRefundSchema.index({ bookingId: 1, status: 1 });
PaymentRefundSchema.index({ paymentId: 1, status: 1 });

export const PaymentRefund: Model<IPaymentRefund> =
  mongoose.models.PaymentRefund ||
  mongoose.model<IPaymentRefund>("PaymentRefund", PaymentRefundSchema);

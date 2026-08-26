import mongoose, { Schema, Document, Model, Types } from "mongoose";
import {
  PaymentMethod,
  PAYMENT_METHODS,
  PaymentSource,
  PAYMENT_SOURCES,
  PaymentProvider,
  PAYMENT_PROVIDERS,
  PaymentTransactionStatus,
  PAYMENT_TRANSACTION_STATUSES,
} from "@/types/payment";

export interface IPaymentTransaction extends Document {
  _id: Types.ObjectId;
  paymentNumber: string; // RDE-TXN-XXXXXX
  bookingId: Types.ObjectId;
  planId?: Types.ObjectId;
  installmentId?: Types.ObjectId;
  partyId?: Types.ObjectId;

  currency: string;
  amountPaise: number;
  method: PaymentMethod;
  source: PaymentSource;
  provider: PaymentProvider;
  providerMode: "disabled" | "test" | "live";

  providerOrderId?: string;
  providerPaymentId?: string;
  providerSignature?: string;
  signatureVerified: boolean;

  status: PaymentTransactionStatus;
  capturedAmountPaise: number;
  allocatedAmountPaise: number;
  refundedAmountPaise: number;

  failureCategory?: string;
  sanitizedFailureMessage?: string;

  idempotencyKey: string;
  attemptNumber: number;

  paidAt?: Date;
  capturedAt?: Date;
  failedAt?: Date;
  reconciledAt?: Date;

  manualSubmissionId?: Types.ObjectId;
  metadata?: Record<string, unknown>;

  version: number;
  createdAt: Date;
  updatedAt: Date;
}

const PaymentTransactionSchema = new Schema<IPaymentTransaction>(
  {
    paymentNumber: {
      type: String,
      required: [true, "Payment number is required"],
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
    amountPaise: {
      type: Number,
      required: true,
      min: 0,
    },
    method: {
      type: String,
      enum: PAYMENT_METHODS,
      required: true,
      default: "UPI",
    },
    source: {
      type: String,
      enum: PAYMENT_SOURCES,
      required: true,
      default: "ONLINE_GATEWAY",
    },
    provider: {
      type: String,
      enum: PAYMENT_PROVIDERS,
      required: true,
      default: "RAZORPAY",
    },
    providerMode: {
      type: String,
      enum: ["disabled", "test", "live"],
      default: "test",
    },
    providerOrderId: {
      type: String,
      trim: true,
      index: true,
      sparse: true,
    },
    providerPaymentId: {
      type: String,
      trim: true,
      index: true,
      sparse: true,
    },
    providerSignature: {
      type: String,
      trim: true,
    },
    signatureVerified: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: PAYMENT_TRANSACTION_STATUSES,
      default: "CREATED",
      index: true,
    },
    capturedAmountPaise: {
      type: Number,
      default: 0,
      min: 0,
    },
    allocatedAmountPaise: {
      type: Number,
      default: 0,
      min: 0,
    },
    refundedAmountPaise: {
      type: Number,
      default: 0,
      min: 0,
    },
    failureCategory: {
      type: String,
      trim: true,
    },
    sanitizedFailureMessage: {
      type: String,
      trim: true,
    },
    idempotencyKey: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    attemptNumber: {
      type: Number,
      default: 1,
    },
    paidAt: {
      type: Date,
    },
    capturedAt: {
      type: Date,
    },
    failedAt: {
      type: Date,
    },
    reconciledAt: {
      type: Date,
    },
    manualSubmissionId: {
      type: Schema.Types.ObjectId,
      ref: "ManualPaymentSubmission",
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
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

PaymentTransactionSchema.index({ bookingId: 1, status: 1 });
PaymentTransactionSchema.index({ provider: 1, providerPaymentId: 1 });

export const PaymentTransaction: Model<IPaymentTransaction> =
  mongoose.models.PaymentTransaction ||
  mongoose.model<IPaymentTransaction>("PaymentTransaction", PaymentTransactionSchema);

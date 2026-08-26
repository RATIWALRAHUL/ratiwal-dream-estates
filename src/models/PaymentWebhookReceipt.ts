import mongoose, { Schema, Document, Model, Types } from "mongoose";
import { WebhookProcessingStatus, WEBHOOK_PROCESSING_STATUSES } from "@/types/payment";

export interface IPaymentWebhookReceipt extends Document {
  _id: Types.ObjectId;
  provider: "RAZORPAY" | "MOCK";
  providerAccountId?: string;
  providerEventId: string; // e.g. x-razorpay-event-id
  eventType: string;

  signatureVerified: boolean;
  receivedAt: Date;
  processedAt?: Date;
  status: WebhookProcessingStatus;

  paymentId?: Types.ObjectId;
  refundId?: Types.ObjectId;
  disputeId?: Types.ObjectId;

  safeErrorCode?: string;
  payloadRetentionExpiresAt: Date;

  createdAt: Date;
  updatedAt: Date;
}

const PaymentWebhookReceiptSchema = new Schema<IPaymentWebhookReceipt>(
  {
    provider: {
      type: String,
      enum: ["RAZORPAY", "MOCK"],
      required: true,
      default: "RAZORPAY",
    },
    providerAccountId: {
      type: String,
      trim: true,
    },
    providerEventId: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
    },
    eventType: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    signatureVerified: {
      type: Boolean,
      default: false,
    },
    receivedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    processedAt: {
      type: Date,
    },
    status: {
      type: String,
      enum: WEBHOOK_PROCESSING_STATUSES,
      default: "RECEIVED",
      index: true,
    },
    paymentId: {
      type: Schema.Types.ObjectId,
      ref: "PaymentTransaction",
    },
    refundId: {
      type: Schema.Types.ObjectId,
      ref: "PaymentRefund",
    },
    disputeId: {
      type: Schema.Types.ObjectId,
      ref: "PaymentDispute",
    },
    safeErrorCode: {
      type: String,
      trim: true,
    },
    payloadRetentionExpiresAt: {
      type: Date,
      required: true,
      index: { expireAfterSeconds: 0 }, // TTL cleanup
    },
  },
  {
    timestamps: true,
  }
);

export const PaymentWebhookReceipt: Model<IPaymentWebhookReceipt> =
  mongoose.models.PaymentWebhookReceipt ||
  mongoose.model<IPaymentWebhookReceipt>("PaymentWebhookReceipt", PaymentWebhookReceiptSchema);

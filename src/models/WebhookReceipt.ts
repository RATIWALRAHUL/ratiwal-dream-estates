import mongoose, { Schema, Document, Model } from "mongoose";

export interface IWebhookReceipt extends Document {
  provider: "RESEND" | "WHATSAPP" | "OTHER";
  providerEventId: string;
  eventType: string;
  signatureValid: boolean;
  receivedAt: Date;
  processedAt?: Date;
  processingStatus: "RECEIVED" | "PROCESSED" | "IGNORED" | "FAILED";
  errorCode?: string;
  createdAt: Date;
  updatedAt: Date;
}

const WebhookReceiptSchema = new Schema<IWebhookReceipt>(
  {
    provider: {
      type: String,
      required: true,
      enum: ["RESEND", "WHATSAPP", "OTHER"],
      index: true,
    },
    providerEventId: {
      type: String,
      required: true,
    },
    eventType: {
      type: String,
      required: true,
    },
    signatureValid: {
      type: Boolean,
      required: true,
      default: true,
    },
    receivedAt: {
      type: Date,
      required: true,
      default: Date.now,
    },
    processedAt: {
      type: Date,
      default: null,
    },
    processingStatus: {
      type: String,
      required: true,
      enum: ["RECEIVED", "PROCESSED", "IGNORED", "FAILED"],
      default: "RECEIVED",
    },
    errorCode: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate processing of provider webhook events
WebhookReceiptSchema.index({ provider: 1, providerEventId: 1 }, { unique: true });

export const WebhookReceipt: Model<IWebhookReceipt> =
  mongoose.models.WebhookReceipt ||
  mongoose.model<IWebhookReceipt>("WebhookReceipt", WebhookReceiptSchema);

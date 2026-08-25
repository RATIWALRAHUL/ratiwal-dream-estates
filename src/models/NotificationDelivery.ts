import mongoose, { Schema, Document, Model, Types } from "mongoose";
import type {
  NotificationChannel,
  DeliveryStatus,
  FailureCategory,
  NotificationEventType,
} from "@/types/communication";

export interface INotificationDelivery extends Document {
  _id: Types.ObjectId;
  outboxId: Types.ObjectId;
  eventType: NotificationEventType;
  channel: NotificationChannel;
  provider: string; // e.g. "RESEND", "WHATSAPP_CLOUD", "IN_APP", "TEST_SIMULATOR"
  providerMessageId?: string;
  maskedRecipient: string; // e.g. "v***a@domain.com" or "+91 98*** **210"
  status: DeliveryStatus;
  attempt: number;
  sentAt?: Date;
  deliveredAt?: Date;
  readAt?: Date;
  failedAt?: Date;
  providerStatusCode?: string;
  failureCategory?: FailureCategory;
  failureMessage?: string; // Sanitized, no PII
  webhookTimestamp?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationDeliverySchema = new Schema<INotificationDelivery>(
  {
    outboxId: {
      type: Schema.Types.ObjectId,
      ref: "NotificationOutbox",
      required: true,
      index: true,
    },
    eventType: {
      type: String,
      required: true,
      index: true,
    },
    channel: {
      type: String,
      required: true,
      enum: ["IN_APP", "EMAIL", "WHATSAPP"],
      index: true,
    },
    provider: {
      type: String,
      required: true,
      index: true,
    },
    providerMessageId: {
      type: String,
      default: null,
      index: true,
    },
    maskedRecipient: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      required: true,
      enum: [
        "QUEUED",
        "SENDING",
        "SENT",
        "DELIVERED",
        "READ",
        "FAILED",
        "BOUNCED",
        "COMPLAINED",
        "SUPPRESSED",
        "CANCELLED",
      ],
      default: "QUEUED",
      index: true,
    },
    attempt: {
      type: Number,
      required: true,
      default: 1,
    },
    sentAt: {
      type: Date,
      default: null,
    },
    deliveredAt: {
      type: Date,
      default: null,
    },
    readAt: {
      type: Date,
      default: null,
    },
    failedAt: {
      type: Date,
      default: null,
    },
    providerStatusCode: {
      type: String,
      default: null,
    },
    failureCategory: {
      type: String,
      enum: [
        "TRANSIENT_NETWORK",
        "TRANSIENT_RATE_LIMIT",
        "TRANSIENT_PROVIDER_5XX",
        "PERMANENT_INVALID_RECIPIENT",
        "PERMANENT_MISSING_CONSENT",
        "PERMANENT_UNAPPROVED_TEMPLATE",
        "PERMANENT_PAYLOAD_INVALID",
        "PERMANENT_CREDENTIALS",
        "UNKNOWN",
      ],
      default: null,
    },
    failureMessage: {
      type: String,
      default: null,
    },
    webhookTimestamp: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

NotificationDeliverySchema.index({ status: 1, createdAt: -1 });
NotificationDeliverySchema.index({ channel: 1, status: 1 });
NotificationDeliverySchema.index({ provider: 1, providerMessageId: 1 });

export const NotificationDelivery: Model<INotificationDelivery> =
  mongoose.models.NotificationDelivery ||
  mongoose.model<INotificationDelivery>("NotificationDelivery", NotificationDeliverySchema);

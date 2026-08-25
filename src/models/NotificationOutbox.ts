import mongoose, { Schema, Document, Model, Types } from "mongoose";
import type {
  NotificationEventType,
  NotificationChannel,
  OutboxStatus,
} from "@/types/communication";

export interface INotificationOutbox extends Document {
  _id: Types.ObjectId;
  eventType: NotificationEventType;
  aggregateType: "LEAD" | "SITE_VISIT" | "PROPERTY" | "USER";
  aggregateId: Types.ObjectId;
  aggregateVersion: number;
  recipientType: "CUSTOMER" | "ADVISOR" | "ADMIN_POOL";
  recipientAdminId?: string; // If recipient is an internal admin/advisor
  recipientEmail?: string;
  recipientPhone?: string;
  recipientName?: string;
  channels: NotificationChannel[];
  templateKey: string;
  templateVersion: number;
  locale: string;
  variables: Record<string, unknown>;
  priority: "HIGH" | "NORMAL" | "LOW";
  scheduledFor: Date;
  status: OutboxStatus;
  idempotencyKey: string;
  attemptCount: number;
  maxAttempts: number;
  nextAttemptAt: Date;
  leaseOwner?: string;
  leaseUntil?: Date;
  lastErrorCode?: string;
  cancelledAt?: Date;
  cancelReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationOutboxSchema = new Schema<INotificationOutbox>(
  {
    eventType: {
      type: String,
      required: true,
      index: true,
    },
    aggregateType: {
      type: String,
      required: true,
      enum: ["LEAD", "SITE_VISIT", "PROPERTY", "USER"],
    },
    aggregateId: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    aggregateVersion: {
      type: Number,
      required: true,
      default: 1,
    },
    recipientType: {
      type: String,
      required: true,
      enum: ["CUSTOMER", "ADVISOR", "ADMIN_POOL"],
    },
    recipientAdminId: {
      type: String,
      default: null,
      index: true,
    },
    recipientEmail: {
      type: String,
      default: null,
    },
    recipientPhone: {
      type: String,
      default: null,
    },
    recipientName: {
      type: String,
      default: null,
    },
    channels: {
      type: [String],
      required: true,
      enum: ["IN_APP", "EMAIL", "WHATSAPP"],
    },
    templateKey: {
      type: String,
      required: true,
    },
    templateVersion: {
      type: Number,
      required: true,
      default: 1,
    },
    locale: {
      type: String,
      default: "en-IN",
    },
    variables: {
      type: Schema.Types.Mixed,
      default: {},
    },
    priority: {
      type: String,
      enum: ["HIGH", "NORMAL", "LOW"],
      default: "NORMAL",
    },
    scheduledFor: {
      type: Date,
      required: true,
      default: Date.now,
      index: true,
    },
    status: {
      type: String,
      required: true,
      enum: [
        "PENDING",
        "PROCESSING",
        "SENT",
        "PARTIALLY_SENT",
        "RETRY_SCHEDULED",
        "CANCELLED",
        "DEAD_LETTER",
      ],
      default: "PENDING",
      index: true,
    },
    idempotencyKey: {
      type: String,
      required: true,
      unique: true,
    },
    attemptCount: {
      type: Number,
      default: 0,
    },
    maxAttempts: {
      type: Number,
      default: 5,
    },
    nextAttemptAt: {
      type: Date,
      required: true,
      default: Date.now,
      index: true,
    },
    leaseOwner: {
      type: String,
      default: null,
    },
    leaseUntil: {
      type: Date,
      default: null,
      index: true,
    },
    lastErrorCode: {
      type: String,
      default: null,
    },
    cancelledAt: {
      type: Date,
      default: null,
    },
    cancelReason: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Compound query indexes for high-throughput batch worker polling
NotificationOutboxSchema.index({ status: 1, nextAttemptAt: 1, scheduledFor: 1 });
NotificationOutboxSchema.index({ aggregateType: 1, aggregateId: 1, aggregateVersion: 1 });
NotificationOutboxSchema.index({ status: 1, leaseUntil: 1 });
NotificationOutboxSchema.index({ createdAt: -1 });

export const NotificationOutbox: Model<INotificationOutbox> =
  mongoose.models.NotificationOutbox ||
  mongoose.model<INotificationOutbox>("NotificationOutbox", NotificationOutboxSchema);

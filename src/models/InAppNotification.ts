import mongoose, { Schema, Document, Model, Types } from "mongoose";
import type { NotificationEventType } from "@/types/communication";

export interface IInAppNotification extends Document {
  _id: Types.ObjectId;
  recipientAdminId: string; // "ALL_ADMINS" or specific admin/advisor user ID
  eventType: NotificationEventType;
  title: string;
  message: string;
  entityType?: "LEAD" | "SITE_VISIT" | "PROPERTY" | "LOCATION" | "USER";
  entityId?: string;
  deepLink?: string;
  readAt?: Date;
  archivedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const InAppNotificationSchema = new Schema<IInAppNotification>(
  {
    recipientAdminId: {
      type: String,
      required: true,
      index: true,
    },
    eventType: {
      type: String,
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    entityType: {
      type: String,
      enum: ["LEAD", "SITE_VISIT", "PROPERTY", "LOCATION", "USER"],
      default: null,
    },
    entityId: {
      type: String,
      default: null,
    },
    deepLink: {
      type: String,
      default: null,
    },
    readAt: {
      type: Date,
      default: null,
    },
    archivedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

InAppNotificationSchema.index({ recipientAdminId: 1, readAt: 1, createdAt: -1 });
InAppNotificationSchema.index({ recipientAdminId: 1, archivedAt: 1, createdAt: -1 });

export const InAppNotification: Model<IInAppNotification> =
  mongoose.models.InAppNotification ||
  mongoose.model<IInAppNotification>("InAppNotification", InAppNotificationSchema);

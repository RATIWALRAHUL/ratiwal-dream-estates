import mongoose, { Schema, Document, Model } from "mongoose";
import type {
  NotificationChannel,
  TemplateStatus,
} from "@/types/communication";

export interface INotificationTemplate extends Document {
  key: string;
  channel: NotificationChannel;
  locale: string;
  version: number;
  purpose: "TRANSACTIONAL";
  subject?: string;
  previewText?: string;
  bodyMarkup?: string;
  variableSchema: Record<string, string>; // e.g. { customerName: "string", propertyTitle: "string" }
  allowedVariables: string[];
  whatsappTemplateName?: string;
  whatsappLanguage?: string;
  whatsappStatus?: "PENDING" | "APPROVED" | "REJECTED" | "NOT_CONFIGURED";
  status: TemplateStatus;
  activeFrom?: Date;
  createdBy?: string;
  updatedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationTemplateSchema = new Schema<INotificationTemplate>(
  {
    key: {
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
    locale: {
      type: String,
      required: true,
      default: "en-IN",
    },
    version: {
      type: Number,
      required: true,
      default: 1,
    },
    purpose: {
      type: String,
      required: true,
      default: "TRANSACTIONAL",
    },
    subject: {
      type: String,
      default: null,
    },
    previewText: {
      type: String,
      default: null,
    },
    bodyMarkup: {
      type: String,
      default: null,
    },
    variableSchema: {
      type: Schema.Types.Mixed,
      default: {},
    },
    allowedVariables: {
      type: [String],
      default: [],
    },
    whatsappTemplateName: {
      type: String,
      default: null,
    },
    whatsappLanguage: {
      type: String,
      default: "en",
    },
    whatsappStatus: {
      type: String,
      enum: ["PENDING", "APPROVED", "REJECTED", "NOT_CONFIGURED"],
      default: "NOT_CONFIGURED",
    },
    status: {
      type: String,
      required: true,
      enum: ["DRAFT", "ACTIVE", "ARCHIVED"],
      default: "ACTIVE",
      index: true,
    },
    activeFrom: {
      type: Date,
      default: Date.now,
    },
    createdBy: {
      type: String,
      default: "SYSTEM",
    },
    updatedBy: {
      type: String,
      default: "SYSTEM",
    },
  },
  {
    timestamps: true,
  }
);

NotificationTemplateSchema.index({ key: 1, channel: 1, version: -1 });
NotificationTemplateSchema.index({ key: 1, channel: 1, status: 1 });

export const NotificationTemplate: Model<INotificationTemplate> =
  mongoose.models.NotificationTemplate ||
  mongoose.model<INotificationTemplate>("NotificationTemplate", NotificationTemplateSchema);

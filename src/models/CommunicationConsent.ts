import mongoose, { Schema, Document, Model } from "mongoose";
import type {
  NotificationChannel,
  ConsentStatus,
} from "@/types/communication";

export interface ICommunicationConsent extends Document {
  recipientKey: string; // Hash of email / E.164 phone
  channel: NotificationChannel;
  purpose: "TRANSACTIONAL" | "MARKETING";
  consentStatus: ConsentStatus;
  consentSource: string; // e.g. "WEBSITE_INQUIRY_FORM", "SITE_VISIT_FORM", "MANUAL_ADMIN"
  consentWordingVersion: string;
  consentTimestamp: Date;
  withdrawalTimestamp?: Date;
  suppressionReason?: string; // "HARD_BOUNCE", "SPAM_COMPLAINT", "USER_OPT_OUT"
  bounceStatus?: "NONE" | "SOFT" | "HARD";
  complaintStatus?: "NONE" | "REPORTED";
  createdAt: Date;
  updatedAt: Date;
}

const CommunicationConsentSchema = new Schema<ICommunicationConsent>(
  {
    recipientKey: {
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
    purpose: {
      type: String,
      required: true,
      enum: ["TRANSACTIONAL", "MARKETING"],
      default: "TRANSACTIONAL",
    },
    consentStatus: {
      type: String,
      required: true,
      enum: [
        "GRANTED",
        "WITHDRAWN",
        "SUPPRESSED_BOUNCE",
        "SUPPRESSED_COMPLAINT",
        "SUPPRESSED_OPT_OUT",
      ],
      default: "GRANTED",
      index: true,
    },
    consentSource: {
      type: String,
      required: true,
      default: "WEBSITE_FORM",
    },
    consentWordingVersion: {
      type: String,
      required: true,
      default: "v1.0",
    },
    consentTimestamp: {
      type: Date,
      required: true,
      default: Date.now,
    },
    withdrawalTimestamp: {
      type: Date,
      default: null,
    },
    suppressionReason: {
      type: String,
      default: null,
    },
    bounceStatus: {
      type: String,
      enum: ["NONE", "SOFT", "HARD"],
      default: "NONE",
    },
    complaintStatus: {
      type: String,
      enum: ["NONE", "REPORTED"],
      default: "NONE",
    },
  },
  {
    timestamps: true,
  }
);

CommunicationConsentSchema.index({ recipientKey: 1, channel: 1, purpose: 1 }, { unique: true });

export const CommunicationConsent: Model<ICommunicationConsent> =
  mongoose.models.CommunicationConsent ||
  mongoose.model<ICommunicationConsent>("CommunicationConsent", CommunicationConsentSchema);

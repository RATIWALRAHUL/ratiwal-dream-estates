import mongoose, { Schema, Document, Model, Types } from "mongoose";
import { AccessLogAction, ACCESS_LOG_ACTIONS } from "@/types/legal-vault";

export interface ILegalDocumentAccessLog extends Document {
  _id: Types.ObjectId;
  legalDocumentId: Types.ObjectId;
  documentVersionId?: Types.ObjectId;
  propertyId?: Types.ObjectId;
  actorType: "INTERNAL_USER" | "EXTERNAL_SHARE" | "PUBLIC_USER" | "SYSTEM";
  actorId?: string;
  actorEmail?: string;
  actorRole?: string;
  shareId?: Types.ObjectId;
  action: AccessLogAction;
  accessResult: "GRANTED" | "DENIED";
  denialReason?: string;
  ipHash?: string; // One-way salted hash of IP for rate/security monitoring without storing raw PII
  userAgentMasked?: string;
  timestamp: Date;
}

const LegalDocumentAccessLogSchema = new Schema<ILegalDocumentAccessLog>(
  {
    legalDocumentId: {
      type: Schema.Types.ObjectId,
      ref: "LegalDocument",
      required: true,
      index: true,
    },
    documentVersionId: {
      type: Schema.Types.ObjectId,
      ref: "LegalDocumentVersion",
    },
    propertyId: {
      type: Schema.Types.ObjectId,
      ref: "Property",
      index: true,
    },
    actorType: {
      type: String,
      enum: ["INTERNAL_USER", "EXTERNAL_SHARE", "PUBLIC_USER", "SYSTEM"],
      required: true,
      index: true,
    },
    actorId: {
      type: String,
      index: true,
    },
    actorEmail: {
      type: String,
    },
    actorRole: {
      type: String,
    },
    shareId: {
      type: Schema.Types.ObjectId,
      ref: "LegalDocumentShare",
    },
    action: {
      type: String,
      enum: ACCESS_LOG_ACTIONS,
      required: true,
      index: true,
    },
    accessResult: {
      type: String,
      enum: ["GRANTED", "DENIED"],
      required: true,
      index: true,
    },
    denialReason: {
      type: String,
      maxlength: 300,
    },
    ipHash: {
      type: String,
    },
    userAgentMasked: {
      type: String,
      maxlength: 200,
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false }, // Immutable append-only
  }
);

LegalDocumentAccessLogSchema.index({ legalDocumentId: 1, timestamp: -1 });

export const LegalDocumentAccessLog: Model<ILegalDocumentAccessLog> =
  mongoose.models.LegalDocumentAccessLog ||
  mongoose.model<ILegalDocumentAccessLog>("LegalDocumentAccessLog", LegalDocumentAccessLogSchema);

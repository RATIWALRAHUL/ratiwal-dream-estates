import mongoose, { Schema, Document, Model, Types } from "mongoose";
import { DocumentStatus } from "@/types/legal-vault";

export interface ILegalDocumentReview extends Document {
  _id: Types.ObjectId;
  legalDocumentId: Types.ObjectId;
  documentVersionId?: Types.ObjectId;
  documentVersionNumber: number;
  reviewAction: "SUBMIT_FOR_REVIEW" | "START_REVIEW" | "INTERNALLY_VERIFY" | "MARK_ACTION_REQUIRED" | "REJECT" | "EXPIRE" | "SUPERSEDE" | "ARCHIVE";
  fromStatus: DocumentStatus;
  toStatus: DocumentStatus;
  reviewerId: string;
  reviewerName?: string;
  reviewerRole?: string;
  reasonCode: string;
  sanitizedNote?: string;
  checklistSnapshot?: Record<string, unknown>;
  reviewedAt: Date;
  createdAt: Date;
}

const LegalDocumentReviewSchema = new Schema<ILegalDocumentReview>(
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
    documentVersionNumber: {
      type: Number,
      required: true,
      default: 1,
    },
    reviewAction: {
      type: String,
      required: true,
      index: true,
    },
    fromStatus: {
      type: String,
      required: true,
    },
    toStatus: {
      type: String,
      required: true,
      index: true,
    },
    reviewerId: {
      type: String,
      required: true,
      index: true,
    },
    reviewerName: {
      type: String,
      trim: true,
    },
    reviewerRole: {
      type: String,
      trim: true,
    },
    reasonCode: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
    },
    sanitizedNote: {
      type: String,
      maxlength: 2000,
    },
    checklistSnapshot: {
      type: Schema.Types.Mixed,
    },
    reviewedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false }, // Immutable append-only
  }
);

LegalDocumentReviewSchema.index({ legalDocumentId: 1, reviewedAt: -1 });

export const LegalDocumentReview: Model<ILegalDocumentReview> =
  mongoose.models.LegalDocumentReview ||
  mongoose.model<ILegalDocumentReview>("LegalDocumentReview", LegalDocumentReviewSchema);

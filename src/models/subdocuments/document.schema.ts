import { Schema } from "mongoose";
import type { IDocumentItem } from "@/types/database";
import { DocumentTypeEnum, DocumentVisibilityEnum, VerificationStatusEnum } from "@/types/database";
import { isValidHttpUrl } from "@/lib/utils/url";

export const DocumentItemSchema = new Schema<IDocumentItem>(
  {
    type: {
      type: String,
      enum: DocumentTypeEnum,
      required: [true, "Document type is required"],
    },
    title: {
      type: String,
      required: [true, "Document title is required"],
      trim: true,
      minlength: [2, "Document title must be at least 2 characters"],
    },
    fileUrl: {
      type: String,
      trim: true,
      validate: {
        validator: (v: string) => !v || isValidHttpUrl(v),
        message: "File URL must be a valid HTTP or HTTPS URL",
      },
    },
    storagePublicId: {
      type: String,
      trim: true,
    },
    mimeType: {
      type: String,
      trim: true,
    },
    sizeBytes: {
      type: Number,
      min: [0, "File size cannot be negative"],
    },
    version: {
      type: String,
      trim: true,
      default: "1.0",
    },
    visibility: {
      type: String,
      enum: DocumentVisibilityEnum,
      required: [true, "Document visibility is required"],
      default: "PUBLIC",
    },
    verificationStatus: {
      type: String,
      enum: VerificationStatusEnum,
      required: [true, "Verification status is required"],
      default: "UNVERIFIED",
    },
    lastVerifiedAt: {
      type: Date,
    },
    uploadedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: true }
);

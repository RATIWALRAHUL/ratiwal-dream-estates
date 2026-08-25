import mongoose, { Schema, Document, Model, Types } from "mongoose";
import {
  DOCUMENT_CLASSIFICATIONS,
  DOCUMENT_STATUSES,
  DOCUMENT_CATEGORIES,
  PUBLIC_VISIBILITY_MODES,
  DocumentClassification,
  DocumentStatus,
  DocumentCategory,
  PublicVisibilityMode,
} from "@/types/legal-vault";

export interface ILegalDocument extends Document {
  _id: Types.ObjectId;
  propertyId: Types.ObjectId;
  locationId?: Types.ObjectId;
  documentReference: string; // Unique, e.g. RDE-LEG-109283
  title: string;
  category: DocumentCategory;
  subCategory?: string;
  classification: DocumentClassification;
  status: DocumentStatus;
  currentVersionId?: Types.ObjectId;
  currentVersionNumber: number;
  issuingAuthority?: string;
  jurisdiction?: string;
  documentNumberMasked?: string;
  issueDate?: Date;
  effectiveDate?: Date;
  expiryDate?: Date;
  reviewDueDate?: Date;
  isRequired: boolean;
  requirementSource?: string;
  checklistItemKey?: string;
  publicVisibility: PublicVisibilityMode;
  publicDisplayLabel?: string;
  internalNotes?: string;
  currentReviewerId?: string;
  currentReviewerName?: string;
  lastReviewedBy?: string;
  lastReviewedAt?: Date;
  actionRequiredReason?: string;
  rejectionReason?: string;
  legalHold: boolean;
  legalHoldReason?: string;
  legalHoldAppliedAt?: Date;
  legalHoldAppliedBy?: string;
  version: number; // Optimistic locking version
  archivedAt?: Date;
  archivedBy?: string;
  createdBy: string;
  updatedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

const LegalDocumentSchema = new Schema<ILegalDocument>(
  {
    propertyId: {
      type: Schema.Types.ObjectId,
      ref: "Property",
      required: true,
      index: true,
    },
    locationId: {
      type: Schema.Types.ObjectId,
      ref: "Location",
      index: true,
    },
    documentReference: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 250,
    },
    category: {
      type: String,
      enum: DOCUMENT_CATEGORIES,
      required: true,
      index: true,
    },
    subCategory: {
      type: String,
      trim: true,
      maxlength: 100,
    },
    classification: {
      type: String,
      enum: DOCUMENT_CLASSIFICATIONS,
      default: "CONFIDENTIAL",
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: DOCUMENT_STATUSES,
      default: "DRAFT",
      required: true,
      index: true,
    },
    currentVersionId: {
      type: Schema.Types.ObjectId,
      ref: "LegalDocumentVersion",
    },
    currentVersionNumber: {
      type: Number,
      default: 1,
      min: 1,
    },
    issuingAuthority: {
      type: String,
      trim: true,
      maxlength: 150,
    },
    jurisdiction: {
      type: String,
      trim: true,
      maxlength: 100,
    },
    documentNumberMasked: {
      type: String,
      trim: true,
      maxlength: 50,
    },
    issueDate: {
      type: Date,
    },
    effectiveDate: {
      type: Date,
    },
    expiryDate: {
      type: Date,
      index: true,
    },
    reviewDueDate: {
      type: Date,
      index: true,
    },
    isRequired: {
      type: Boolean,
      default: false,
      index: true,
    },
    requirementSource: {
      type: String,
      trim: true,
      maxlength: 100,
    },
    checklistItemKey: {
      type: String,
      trim: true,
      maxlength: 100,
    },
    publicVisibility: {
      type: String,
      enum: PUBLIC_VISIBILITY_MODES,
      default: "PRIVATE",
      required: true,
      index: true,
    },
    publicDisplayLabel: {
      type: String,
      trim: true,
      maxlength: 150,
    },
    internalNotes: {
      type: String,
      maxlength: 2000,
    },
    currentReviewerId: {
      type: String,
      index: true,
    },
    currentReviewerName: {
      type: String,
      trim: true,
    },
    lastReviewedBy: {
      type: String,
    },
    lastReviewedAt: {
      type: Date,
    },
    actionRequiredReason: {
      type: String,
      maxlength: 1000,
    },
    rejectionReason: {
      type: String,
      maxlength: 1000,
    },
    legalHold: {
      type: Boolean,
      default: false,
      index: true,
    },
    legalHoldReason: {
      type: String,
      maxlength: 500,
    },
    legalHoldAppliedAt: {
      type: Date,
    },
    legalHoldAppliedBy: {
      type: String,
    },
    version: {
      type: Number,
      default: 1,
      required: true,
    },
    archivedAt: {
      type: Date,
      index: true,
    },
    archivedBy: {
      type: String,
    },
    createdBy: {
      type: String,
      required: true,
    },
    updatedBy: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Compound Indexes for fast dashboard querying & compliance filters
LegalDocumentSchema.index({ propertyId: 1, category: 1, status: 1 });
LegalDocumentSchema.index({ propertyId: 1, classification: 1, publicVisibility: 1 });
LegalDocumentSchema.index({ expiryDate: 1, status: 1 }, { sparse: true });
LegalDocumentSchema.index({ reviewDueDate: 1, status: 1 }, { sparse: true });
LegalDocumentSchema.index({ legalHold: 1, status: 1 });

export const LegalDocument: Model<ILegalDocument> =
  mongoose.models.LegalDocument || mongoose.model<ILegalDocument>("LegalDocument", LegalDocumentSchema);

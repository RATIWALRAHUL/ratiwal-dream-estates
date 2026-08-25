import mongoose, { Schema, Document, Model, Types } from "mongoose";
import { ChecklistItemStatus, CHECKLIST_ITEM_STATUSES } from "@/types/legal-vault";

export interface IPropertyChecklistItem {
  itemKey: string;
  displayName: string;
  category: string;
  isRequired: boolean;
  status: ChecklistItemStatus;
  documentId?: Types.ObjectId;
  documentReference?: string;
  lastReviewedAt?: Date;
  actionRequiredReason?: string;
  notes?: string;
}

export interface IPropertyLegalChecklist extends Document {
  _id: Types.ObjectId;
  propertyId: Types.ObjectId;
  templateId?: Types.ObjectId;
  templateCode: string;
  templateVersion: number;
  items: IPropertyChecklistItem[];
  totalApplicableItems: number;
  completedItemsCount: number;
  missingItemsCount: number;
  expiredItemsCount: number;
  actionRequiredCount: number;
  readinessPercentage: number;
  lastEvaluatedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const PropertyChecklistItemSchema = new Schema<IPropertyChecklistItem>(
  {
    itemKey: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
    },
    displayName: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
    },
    isRequired: {
      type: Boolean,
      default: true,
    },
    status: {
      type: String,
      enum: CHECKLIST_ITEM_STATUSES,
      default: "NOT_PROVIDED",
      required: true,
    },
    documentId: {
      type: Schema.Types.ObjectId,
      ref: "LegalDocument",
    },
    documentReference: {
      type: String,
      trim: true,
    },
    lastReviewedAt: {
      type: Date,
    },
    actionRequiredReason: {
      type: String,
    },
    notes: {
      type: String,
    },
  },
  { _id: false }
);

const PropertyLegalChecklistSchema = new Schema<IPropertyLegalChecklist>(
  {
    propertyId: {
      type: Schema.Types.ObjectId,
      ref: "Property",
      required: true,
      unique: true,
      index: true,
    },
    templateId: {
      type: Schema.Types.ObjectId,
      ref: "LegalChecklistTemplate",
    },
    templateCode: {
      type: String,
      required: true,
      default: "STANDARD_LEGAL_CHECKLIST_V1",
    },
    templateVersion: {
      type: Number,
      default: 1,
    },
    items: {
      type: [PropertyChecklistItemSchema],
      default: [],
    },
    totalApplicableItems: {
      type: Number,
      default: 0,
    },
    completedItemsCount: {
      type: Number,
      default: 0,
    },
    missingItemsCount: {
      type: Number,
      default: 0,
    },
    expiredItemsCount: {
      type: Number,
      default: 0,
    },
    actionRequiredCount: {
      type: Number,
      default: 0,
    },
    readinessPercentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    lastEvaluatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

export const PropertyLegalChecklist: Model<IPropertyLegalChecklist> =
  mongoose.models.PropertyLegalChecklist ||
  mongoose.model<IPropertyLegalChecklist>("PropertyLegalChecklist", PropertyLegalChecklistSchema);

import mongoose, { Schema, Document, Model, Types } from "mongoose";
import { DocumentCategory, DOCUMENT_CATEGORIES } from "@/types/legal-vault";

export interface IChecklistTemplateItem {
  itemKey: string; // e.g. "TITLE_DEED_70Y", "JDA_LAND_CONVERSION"
  displayName: string;
  description: string;
  category: DocumentCategory;
  isRequired: boolean;
  expiryExpected: boolean;
  displayOrder: number;
  reviewInstructions?: string;
  legalSourceNote?: string;
}

export interface ILegalChecklistTemplate extends Document {
  _id: Types.ObjectId;
  templateCode: string; // e.g. "RAJASTHAN_PLOTTED_V1", "MAHARASHTRA_COMMERCIAL_V1"
  name: string;
  description: string;
  propertyTypes: string[]; // e.g. ["RESIDENTIAL_PLOT", "COMMERCIAL_PLOT"]
  applicableStates: string[]; // e.g. ["RAJASTHAN", "MAHARASHTRA"]
  version: number;
  status: "DRAFT" | "ACTIVE" | "ARCHIVED";
  items: IChecklistTemplateItem[];
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

const ChecklistTemplateItemSchema = new Schema<IChecklistTemplateItem>(
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
    description: {
      type: String,
      trim: true,
    },
    category: {
      type: String,
      enum: DOCUMENT_CATEGORIES,
      required: true,
    },
    isRequired: {
      type: Boolean,
      default: true,
    },
    expiryExpected: {
      type: Boolean,
      default: false,
    },
    displayOrder: {
      type: Number,
      default: 0,
    },
    reviewInstructions: {
      type: String,
    },
    legalSourceNote: {
      type: String,
    },
  },
  { _id: false }
);

const LegalChecklistTemplateSchema = new Schema<ILegalChecklistTemplate>(
  {
    templateCode: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    propertyTypes: {
      type: [String],
      default: [],
      index: true,
    },
    applicableStates: {
      type: [String],
      default: [],
      index: true,
    },
    version: {
      type: Number,
      default: 1,
      min: 1,
    },
    status: {
      type: String,
      enum: ["DRAFT", "ACTIVE", "ARCHIVED"],
      default: "ACTIVE",
      required: true,
      index: true,
    },
    items: {
      type: [ChecklistTemplateItemSchema],
      default: [],
    },
    createdBy: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const LegalChecklistTemplate: Model<ILegalChecklistTemplate> =
  mongoose.models.LegalChecklistTemplate ||
  mongoose.model<ILegalChecklistTemplate>("LegalChecklistTemplate", LegalChecklistTemplateSchema);

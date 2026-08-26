import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface ICmsFaqItem extends Document {
  _id: Types.ObjectId;
  category: "GENERAL" | "BUYING_PROCESS" | "SITE_VISITS" | "BOOKING" | "KYC" | "PAYMENTS" | "REFUNDS" | "LEGAL" | "PROPERTIES" | "LOCATIONS";
  question: string;
  answerHtml: string;
  plainTextAnswer: string;

  relatedPropertyId?: Types.ObjectId;
  relatedLocationId?: Types.ObjectId;

  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  displayOrder: number;

  reviewedBy?: string;
  reviewedAt?: Date;

  createdAt: Date;
  updatedAt: Date;
}

const CmsFaqItemSchema = new Schema<ICmsFaqItem>(
  {
    category: {
      type: String,
      enum: ["GENERAL", "BUYING_PROCESS", "SITE_VISITS", "BOOKING", "KYC", "PAYMENTS", "REFUNDS", "LEGAL", "PROPERTIES", "LOCATIONS"],
      required: true,
      index: true,
    },
    question: {
      type: String,
      required: true,
      trim: true,
    },
    answerHtml: {
      type: String,
      required: true,
      trim: true,
    },
    plainTextAnswer: {
      type: String,
      required: true,
      trim: true,
    },
    relatedPropertyId: {
      type: Schema.Types.ObjectId,
      ref: "Property",
    },
    relatedLocationId: {
      type: Schema.Types.ObjectId,
      ref: "Location",
    },
    status: {
      type: String,
      enum: ["DRAFT", "PUBLISHED", "ARCHIVED"],
      default: "DRAFT",
      index: true,
    },
    displayOrder: {
      type: Number,
      default: 0,
    },
    reviewedBy: {
      type: String,
    },
    reviewedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

export const CmsFaqItem: Model<ICmsFaqItem> =
  mongoose.models.CmsFaqItem ||
  mongoose.model<ICmsFaqItem>("CmsFaqItem", CmsFaqItemSchema);

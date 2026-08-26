import mongoose, { Schema, Document, Model, Types } from "mongoose";
import { RedirectType, REDIRECT_TYPES } from "@/types/cms";

export interface IRedirectRule extends Document {
  _id: Types.ObjectId;
  sourcePath: string; // e.g. "/blogs/old-jaipur-guide"
  destinationPath: string; // e.g. "/insights/investment-guide-jaipur-ring-road"
  redirectType: RedirectType;
  status: "ACTIVE" | "INACTIVE";

  reason: string;
  hitCount: number;
  lastTriggeredAt?: Date;

  createdBy: string;
  createdByName?: string;
  createdAt: Date;
  updatedAt: Date;
}

const RedirectRuleSchema = new Schema<IRedirectRule>(
  {
    sourcePath: {
      type: String,
      required: [true, "Source path is required"],
      unique: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    destinationPath: {
      type: String,
      required: [true, "Destination path is required"],
      trim: true,
    },
    redirectType: {
      type: String,
      enum: REDIRECT_TYPES,
      default: "301",
    },
    status: {
      type: String,
      enum: ["ACTIVE", "INACTIVE"],
      default: "ACTIVE",
      index: true,
    },
    reason: {
      type: String,
      required: true,
      trim: true,
    },
    hitCount: {
      type: Number,
      default: 0,
    },
    lastTriggeredAt: {
      type: Date,
    },
    createdBy: {
      type: String,
      required: true,
    },
    createdByName: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

export const RedirectRule: Model<IRedirectRule> =
  mongoose.models.RedirectRule ||
  mongoose.model<IRedirectRule>("RedirectRule", RedirectRuleSchema);

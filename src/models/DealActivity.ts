import mongoose, { Schema, Document, Model, Types } from "mongoose";
import { DealActivityType, DEAL_ACTIVITY_TYPES, DealStage } from "@/types/deal";

export interface IDealActivity extends Document {
  dealId: Types.ObjectId;
  leadId: Types.ObjectId;
  propertyId: Types.ObjectId;
  unitId?: Types.ObjectId;

  activityType: DealActivityType;
  fromStatus?: DealStage;
  toStatus?: DealStage;

  actorId: string;
  actorName: string;
  actorRole: string;

  summary: string;
  reasonCode?: string;
  sanitizedComment?: string;
  metadata?: Record<string, unknown>;

  relatedEntityType?: "OFFER" | "HOLD" | "RESERVATION" | "BOOKING" | "LEAD" | "UNIT";
  relatedEntityId?: string;

  dealVersion: number;
  createdAt: Date;
}

const DealActivitySchema = new Schema<IDealActivity>(
  {
    dealId: {
      type: Schema.Types.ObjectId,
      ref: "Deal",
      required: [true, "Deal reference is required"],
      index: true,
    },
    leadId: {
      type: Schema.Types.ObjectId,
      ref: "Lead",
      required: true,
      index: true,
    },
    propertyId: {
      type: Schema.Types.ObjectId,
      ref: "Property",
      required: true,
      index: true,
    },
    unitId: {
      type: Schema.Types.ObjectId,
      ref: "InventoryUnit",
      index: true,
    },

    activityType: {
      type: String,
      enum: DEAL_ACTIVITY_TYPES,
      required: true,
      index: true,
    },
    fromStatus: {
      type: String,
    },
    toStatus: {
      type: String,
    },

    actorId: {
      type: String,
      required: true,
      index: true,
    },
    actorName: {
      type: String,
      required: true,
    },
    actorRole: {
      type: String,
      required: true,
    },

    summary: {
      type: String,
      required: true,
      trim: true,
    },
    reasonCode: {
      type: String,
      trim: true,
    },
    sanitizedComment: {
      type: String,
      trim: true,
    },
    metadata: {
      type: Schema.Types.Mixed,
    },

    relatedEntityType: {
      type: String,
      enum: ["OFFER", "HOLD", "RESERVATION", "BOOKING", "LEAD", "UNIT"],
    },
    relatedEntityId: {
      type: String,
    },

    dealVersion: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false }, // Append-only
  }
);

DealActivitySchema.index({ dealId: 1, createdAt: -1 });

export const DealActivity: Model<IDealActivity> =
  mongoose.models.DealActivity || mongoose.model<IDealActivity>("DealActivity", DealActivitySchema);

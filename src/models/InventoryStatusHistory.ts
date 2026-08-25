import mongoose, { Schema, Document, Model, Types } from "mongoose";
import { UnitStatus, UNIT_STATUSES } from "@/types/inventory";

export interface IInventoryStatusHistory extends Document {
  unitId: Types.ObjectId;
  propertyId: Types.ObjectId;
  fromStatus: UnitStatus;
  toStatus: UnitStatus;
  reasonCode: string;
  sanitizedComment?: string;
  source: "MANUAL_DASHBOARD" | "BULK_UPDATE" | "SYSTEM_IMPORT" | "RESERVATION_WORKFLOW";
  changedBy: string;
  changedByName?: string;
  changedByRole: string;
  relatedEntityType?: string;
  relatedEntityId?: Types.ObjectId;
  unitVersion: number;
  changedAt: Date;
  createdAt: Date;
}

const InventoryStatusHistorySchema = new Schema<IInventoryStatusHistory>(
  {
    unitId: {
      type: Schema.Types.ObjectId,
      ref: "InventoryUnit",
      required: [true, "Unit reference is required"],
      index: true,
    },
    propertyId: {
      type: Schema.Types.ObjectId,
      ref: "Property",
      required: [true, "Property reference is required"],
      index: true,
    },
    fromStatus: {
      type: String,
      enum: UNIT_STATUSES,
      required: true,
    },
    toStatus: {
      type: String,
      enum: UNIT_STATUSES,
      required: true,
      index: true,
    },
    reasonCode: {
      type: String,
      required: [true, "Reason code is required"],
      trim: true,
    },
    sanitizedComment: {
      type: String,
      trim: true,
      maxlength: [500, "Comment cannot exceed 500 characters"],
    },
    source: {
      type: String,
      enum: ["MANUAL_DASHBOARD", "BULK_UPDATE", "SYSTEM_IMPORT", "RESERVATION_WORKFLOW"],
      default: "MANUAL_DASHBOARD",
    },
    changedBy: {
      type: String,
      required: true,
      index: true,
    },
    changedByName: {
      type: String,
      trim: true,
    },
    changedByRole: {
      type: String,
      required: true,
    },
    relatedEntityType: {
      type: String,
      trim: true,
    },
    relatedEntityId: {
      type: Schema.Types.ObjectId,
    },
    unitVersion: {
      type: Number,
      required: true,
    },
    changedAt: {
      type: Date,
      required: true,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false }, // Immutable append-only
  }
);

// Compound Indexes for history timeline queries
InventoryStatusHistorySchema.index({ unitId: 1, changedAt: -1 });
InventoryStatusHistorySchema.index({ propertyId: 1, toStatus: 1, changedAt: -1 });

export const InventoryStatusHistory: Model<IInventoryStatusHistory> =
  (mongoose.models.InventoryStatusHistory as Model<IInventoryStatusHistory>) ||
  mongoose.model<IInventoryStatusHistory>("InventoryStatusHistory", InventoryStatusHistorySchema);

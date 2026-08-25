import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface IPricingSnapshot {
  basePricePaise?: number;
  ratePaisePerSqFt?: number;
  ratePaisePerSqYd?: number;
  plcChargePaise?: number;
  floorRiseChargePaise?: number;
  parkingChargePaise?: number;
  clubChargePaise?: number;
  maintenanceDepositPaise?: number;
  discountCeilingPaise?: number;
  displayPricePaise?: number;
  priceOnRequest: boolean;
}

export interface IInventoryPriceHistory extends Document {
  unitId: Types.ObjectId;
  propertyId: Types.ObjectId;
  currency: string;
  previousPricing: IPricingSnapshot;
  newPricing: IPricingSnapshot;
  changedFields: string[];
  effectiveFrom: Date;
  reasonCode: string;
  sanitizedComment?: string;
  changedBy: string;
  changedByName?: string;
  changedByRole: string;
  source: "MANUAL_DASHBOARD" | "BULK_PRICE_UPDATE" | "SYSTEM_IMPORT";
  createdAt: Date;
}

const PricingSnapshotSchema = new Schema<IPricingSnapshot>(
  {
    basePricePaise: { type: Number },
    ratePaisePerSqFt: { type: Number },
    ratePaisePerSqYd: { type: Number },
    plcChargePaise: { type: Number },
    floorRiseChargePaise: { type: Number },
    parkingChargePaise: { type: Number },
    clubChargePaise: { type: Number },
    maintenanceDepositPaise: { type: Number },
    discountCeilingPaise: { type: Number },
    displayPricePaise: { type: Number },
    priceOnRequest: { type: Boolean, default: false },
  },
  { _id: false }
);

const InventoryPriceHistorySchema = new Schema<IInventoryPriceHistory>(
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
    currency: {
      type: String,
      required: true,
      default: "INR",
      uppercase: true,
    },
    previousPricing: {
      type: PricingSnapshotSchema,
      required: true,
    },
    newPricing: {
      type: PricingSnapshotSchema,
      required: true,
    },
    changedFields: {
      type: [String],
      required: true,
      default: [],
    },
    effectiveFrom: {
      type: Date,
      required: true,
      default: Date.now,
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
    source: {
      type: String,
      enum: ["MANUAL_DASHBOARD", "BULK_PRICE_UPDATE", "SYSTEM_IMPORT"],
      default: "MANUAL_DASHBOARD",
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false }, // Immutable append-only
  }
);

// Compound Index for price history timeline
InventoryPriceHistorySchema.index({ unitId: 1, createdAt: -1 });

export const InventoryPriceHistory: Model<IInventoryPriceHistory> =
  (mongoose.models.InventoryPriceHistory as Model<IInventoryPriceHistory>) ||
  mongoose.model<IInventoryPriceHistory>("InventoryPriceHistory", InventoryPriceHistorySchema);

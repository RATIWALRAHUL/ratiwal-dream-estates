import mongoose, { Schema, Document, Model, Types } from "mongoose";
import { HoldStatus, HOLD_STATUSES } from "@/types/deal";

export interface IInventoryHold extends Document {
  holdNumber: string; // RDE-HLD-XXXXXX
  unitId: Types.ObjectId;
  propertyId: Types.ObjectId;
  dealId: Types.ObjectId;
  leadId: Types.ObjectId;
  offerId?: Types.ObjectId;

  status: HoldStatus;
  heldBy: string;
  heldByName?: string;
  heldByRole?: string;

  startsAt: Date;
  expiresAt: Date;
  extendedAt?: Date;
  extensionCount: number;

  releasedAt?: Date;
  releasedBy?: string;
  releaseReason?: string;

  convertedAt?: Date;
  version: number;
  idempotencyKey: string;
  createdAt: Date;
  updatedAt: Date;
}

const InventoryHoldSchema = new Schema<IInventoryHold>(
  {
    holdNumber: {
      type: String,
      required: [true, "Hold number is required"],
      unique: true,
      trim: true,
      uppercase: true,
      index: true,
    },
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
    dealId: {
      type: Schema.Types.ObjectId,
      ref: "Deal",
      required: [true, "Deal reference is required"],
      index: true,
    },
    leadId: {
      type: Schema.Types.ObjectId,
      ref: "Lead",
      required: [true, "Lead reference is required"],
      index: true,
    },
    offerId: {
      type: Schema.Types.ObjectId,
      ref: "DealOffer",
    },

    status: {
      type: String,
      enum: HOLD_STATUSES,
      default: "ACTIVE",
      required: true,
      index: true,
    },
    heldBy: {
      type: String,
      required: true,
      index: true,
    },
    heldByName: {
      type: String,
      trim: true,
    },
    heldByRole: {
      type: String,
      trim: true,
    },

    startsAt: {
      type: Date,
      default: Date.now,
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: true,
    },
    extendedAt: {
      type: Date,
    },
    extensionCount: {
      type: Number,
      default: 0,
      min: 0,
    },

    releasedAt: {
      type: Date,
    },
    releasedBy: {
      type: String,
    },
    releaseReason: {
      type: String,
      trim: true,
    },

    convertedAt: {
      type: Date,
    },
    version: {
      type: Number,
      default: 1,
      required: true,
    },
    idempotencyKey: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for active hold uniqueness and expiration processing
InventoryHoldSchema.index({ unitId: 1, status: 1 });
InventoryHoldSchema.index({ status: 1, expiresAt: 1 });
InventoryHoldSchema.index({ dealId: 1, status: 1 });

export const InventoryHold: Model<IInventoryHold> =
  mongoose.models.InventoryHold || mongoose.model<IInventoryHold>("InventoryHold", InventoryHoldSchema);

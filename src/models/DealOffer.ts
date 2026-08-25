import mongoose, { Schema, Document, Model, Types } from "mongoose";
import { OfferStatus, OFFER_STATUSES } from "@/types/deal";

export interface IDealOffer extends Document {
  offerNumber: string; // RDE-OFR-XXXXXX
  dealId: Types.ObjectId;
  propertyId: Types.ObjectId;
  unitId?: Types.ObjectId;
  version: number;
  currency: string;

  // Base snapshot
  basePricePaise: number;
  ratePerSqFtPaise?: number;
  ratePerSqYdPaise?: number;

  // Itemized charges
  plcChargePaise?: number;
  floorRiseChargePaise?: number;
  parkingChargePaise?: number;
  clubChargePaise?: number;
  maintenanceDepositPaise?: number;
  otherChargesPaise?: number;

  // Commercial discounts
  discountAmountPaise: number;
  discountPercentage: number;
  discountReason?: string;

  // Final offered payable
  finalOfferedAmountPaise: number;
  validFrom: Date;
  validUntil: Date;
  status: OfferStatus;

  // Approval requirements
  approvalRequired: boolean;
  approvalReason?: string;
  approvalStatus: "NOT_REQUIRED" | "PENDING" | "APPROVED" | "REJECTED";
  requestedBy: string;
  requestedByName?: string;
  approvedBy?: string;
  approvedByName?: string;
  approvedAt?: Date;
  rejectionReason?: string;

  // Customer acceptance
  customerAcceptanceStatus: "PENDING" | "ACCEPTED" | "REJECTED";
  acceptedAt?: Date;

  termsAndConditions?: string;
  createdAt: Date;
  updatedAt: Date;
}

const DealOfferSchema = new Schema<IDealOffer>(
  {
    offerNumber: {
      type: String,
      required: [true, "Offer number is required"],
      unique: true,
      trim: true,
      uppercase: true,
      index: true,
    },
    dealId: {
      type: Schema.Types.ObjectId,
      ref: "Deal",
      required: [true, "Deal reference is required"],
      index: true,
    },
    propertyId: {
      type: Schema.Types.ObjectId,
      ref: "Property",
      required: [true, "Property reference is required"],
      index: true,
    },
    unitId: {
      type: Schema.Types.ObjectId,
      ref: "InventoryUnit",
      index: true,
    },
    version: {
      type: Number,
      default: 1,
      required: true,
    },
    currency: {
      type: String,
      default: "INR",
      uppercase: true,
    },

    basePricePaise: {
      type: Number,
      required: true,
      min: 0,
    },
    ratePerSqFtPaise: {
      type: Number,
      min: 0,
    },
    ratePerSqYdPaise: {
      type: Number,
      min: 0,
    },

    plcChargePaise: {
      type: Number,
      default: 0,
      min: 0,
    },
    floorRiseChargePaise: {
      type: Number,
      default: 0,
      min: 0,
    },
    parkingChargePaise: {
      type: Number,
      default: 0,
      min: 0,
    },
    clubChargePaise: {
      type: Number,
      default: 0,
      min: 0,
    },
    maintenanceDepositPaise: {
      type: Number,
      default: 0,
      min: 0,
    },
    otherChargesPaise: {
      type: Number,
      default: 0,
      min: 0,
    },

    discountAmountPaise: {
      type: Number,
      default: 0,
      min: 0,
    },
    discountPercentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    discountReason: {
      type: String,
      trim: true,
    },

    finalOfferedAmountPaise: {
      type: Number,
      required: true,
      min: 0,
    },
    validFrom: {
      type: Date,
      default: Date.now,
      required: true,
    },
    validUntil: {
      type: Date,
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: OFFER_STATUSES,
      default: "DRAFT",
      required: true,
      index: true,
    },

    approvalRequired: {
      type: Boolean,
      default: false,
    },
    approvalReason: {
      type: String,
      trim: true,
    },
    approvalStatus: {
      type: String,
      enum: ["NOT_REQUIRED", "PENDING", "APPROVED", "REJECTED"],
      default: "NOT_REQUIRED",
      index: true,
    },
    requestedBy: {
      type: String,
      required: true,
    },
    requestedByName: {
      type: String,
      trim: true,
    },
    approvedBy: {
      type: String,
    },
    approvedByName: {
      type: String,
      trim: true,
    },
    approvedAt: {
      type: Date,
    },
    rejectionReason: {
      type: String,
      trim: true,
    },

    customerAcceptanceStatus: {
      type: String,
      enum: ["PENDING", "ACCEPTED", "REJECTED"],
      default: "PENDING",
    },
    acceptedAt: {
      type: Date,
    },

    termsAndConditions: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

DealOfferSchema.index({ dealId: 1, version: -1 });

export const DealOffer: Model<IDealOffer> =
  mongoose.models.DealOffer || mongoose.model<IDealOffer>("DealOffer", DealOfferSchema);

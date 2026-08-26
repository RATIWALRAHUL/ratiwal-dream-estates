import mongoose, { Schema, Document, Model, Types } from "mongoose";
import {
  CommissionCalculationMethod,
  COMMISSION_CALCULATION_METHODS,
  CommissionBase,
  COMMISSION_BASES,
} from "@/types/commission";
import { PartnerType, PARTNER_TYPES } from "@/types/partner";

export interface ICommissionSlab {
  minAmountPaise: number;
  maxAmountPaise?: number;
  ratePercentage: number;
}

export interface ICommissionMilestoneTrigger {
  milestoneKey: string; // e.g. "BOOKING_CONFIRMED", "TOKEN_RECEIVED", "REGISTRATION_COMPLETE"
  milestoneName: string;
  payoutPercentage: number; // e.g. 50% on booking token, 50% on registry
  requiresVerifiedPayment: boolean;
}

export interface ICommissionPlan extends Document {
  _id: Types.ObjectId;
  planCode: string; // RDE-CMP-XXXXXX
  name: string;
  applicablePartnerTypes: PartnerType[];
  applicablePropertyIds?: Types.ObjectId[];

  calculationMethod: CommissionCalculationMethod;
  calculationBase: CommissionBase;

  // Percentage or Flat parameters
  defaultPercentage?: number; // e.g. 2.0%
  flatAmountPaise?: number; // e.g. 50,000 INR = 5,000,000 Paise

  slabs?: ICommissionSlab[];
  milestones?: ICommissionMilestoneTrigger[];

  coolingPeriodDays: number; // e.g. 7 days before payout can be released
  clawbackOnCancellation: boolean;
  clawbackOnRefund: boolean;

  effectiveDate: Date;
  expiryDate?: Date;
  status: "DRAFT" | "ACTIVE" | "SUPERSEDED" | "ARCHIVED";

  approvedBy?: string;
  approvedByName?: string;
  approvedAt?: Date;

  version: number;
  createdAt: Date;
  updatedAt: Date;
}

const CommissionPlanSchema = new Schema<ICommissionPlan>(
  {
    planCode: {
      type: String,
      required: [true, "Plan code is required"],
      unique: true,
      trim: true,
      uppercase: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, "Plan name is required"],
      trim: true,
    },
    applicablePartnerTypes: {
      type: [String],
      enum: PARTNER_TYPES,
      required: true,
    },
    applicablePropertyIds: [{
      type: Schema.Types.ObjectId,
      ref: "Property",
    }],
    calculationMethod: {
      type: String,
      enum: COMMISSION_CALCULATION_METHODS,
      required: true,
      default: "PERCENTAGE",
    },
    calculationBase: {
      type: String,
      enum: COMMISSION_BASES,
      required: true,
      default: "BOOKING_VALUE",
    },
    defaultPercentage: {
      type: Number,
      min: 0,
      max: 100,
    },
    flatAmountPaise: {
      type: Number,
      min: 0,
    },
    slabs: [
      {
        minAmountPaise: { type: Number, required: true },
        maxAmountPaise: { type: Number },
        ratePercentage: { type: Number, required: true },
      },
    ],
    milestones: [
      {
        milestoneKey: { type: String, required: true },
        milestoneName: { type: String, required: true },
        payoutPercentage: { type: Number, required: true },
        requiresVerifiedPayment: { type: Boolean, default: true },
      },
    ],
    coolingPeriodDays: {
      type: Number,
      default: 7,
    },
    clawbackOnCancellation: {
      type: Boolean,
      default: true,
    },
    clawbackOnRefund: {
      type: Boolean,
      default: true,
    },
    effectiveDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    expiryDate: {
      type: Date,
    },
    status: {
      type: String,
      enum: ["DRAFT", "ACTIVE", "SUPERSEDED", "ARCHIVED"],
      default: "DRAFT",
      index: true,
    },
    approvedBy: {
      type: String,
    },
    approvedByName: {
      type: String,
    },
    approvedAt: {
      type: Date,
    },
    version: {
      type: Number,
      default: 1,
    },
  },
  {
    timestamps: true,
  }
);

export const CommissionPlan: Model<ICommissionPlan> =
  mongoose.models.CommissionPlan ||
  mongoose.model<ICommissionPlan>("CommissionPlan", CommissionPlanSchema);

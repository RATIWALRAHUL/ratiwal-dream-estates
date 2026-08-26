import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface ICommissionTaxRule extends Document {
  _id: Types.ObjectId;
  ruleCode: string; // e.g. "TAX-TDS-BROKERAGE-2026-V1"
  name: string;
  jurisdiction: string; // "INDIA_CENTRAL"
  partnerTaxCategory: "INDIVIDUAL" | "COMPANY" | "ALL";

  lawReference: string; // e.g. "Income Tax Act, 2025 / Section 194H Rules"
  statutoryTableReference: string; // e.g. "Table-TDS-Brokerage-Slab-1"

  tdsRateStandardPercentage: number; // e.g. 2.0% or 5.0%
  tdsRateNoPanPercentage: number; // e.g. 20.0% when PAN is missing/invalid
  annualExemptionThresholdPaise: number; // e.g. ₹15,000 = 1,500,000 Paise

  gstRatePercentage: number; // e.g. 18.0%
  gstReverseChargeApplicable: boolean;

  effectiveFrom: Date;
  effectiveTo?: Date;
  status: "DRAFT" | "ACTIVE" | "SUPERSEDED" | "ARCHIVED";

  approvedByFinance: boolean;
  approvedBy?: string;
  approvedByName?: string;
  approvedAt?: Date;

  version: number;
  createdAt: Date;
  updatedAt: Date;
}

const CommissionTaxRuleSchema = new Schema<ICommissionTaxRule>(
  {
    ruleCode: {
      type: String,
      required: [true, "Rule code is required"],
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
    jurisdiction: {
      type: String,
      required: true,
      default: "INDIA_CENTRAL",
    },
    partnerTaxCategory: {
      type: String,
      enum: ["INDIVIDUAL", "COMPANY", "ALL"],
      default: "ALL",
    },
    lawReference: {
      type: String,
      required: true,
      default: "Income Tax Act statutory withholding schedule",
    },
    statutoryTableReference: {
      type: String,
      required: true,
      default: "TDS-BROKERAGE-SCHEDULE",
    },
    tdsRateStandardPercentage: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
      default: 2.0,
    },
    tdsRateNoPanPercentage: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
      default: 20.0,
    },
    annualExemptionThresholdPaise: {
      type: Number,
      required: true,
      default: 1500000, // ₹15,000
    },
    gstRatePercentage: {
      type: Number,
      required: true,
      default: 18.0,
    },
    gstReverseChargeApplicable: {
      type: Boolean,
      default: false,
    },
    effectiveFrom: {
      type: Date,
      required: true,
      default: Date.now,
      index: true,
    },
    effectiveTo: {
      type: Date,
    },
    status: {
      type: String,
      enum: ["DRAFT", "ACTIVE", "SUPERSEDED", "ARCHIVED"],
      default: "DRAFT",
      index: true,
    },
    approvedByFinance: {
      type: Boolean,
      default: false,
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

export const CommissionTaxRule: Model<ICommissionTaxRule> =
  mongoose.models.CommissionTaxRule ||
  mongoose.model<ICommissionTaxRule>("CommissionTaxRule", CommissionTaxRuleSchema);

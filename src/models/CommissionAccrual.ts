import mongoose, { Schema, Document, Model, Types } from "mongoose";
import {
  CommissionAccrualStatus,
  COMMISSION_ACCRUAL_STATUSES,
} from "@/types/commission";

export interface ICommissionAccrual extends Document {
  _id: Types.ObjectId;
  accrualNumber: string; // RDE-ACC-XXXXXX
  partnerId: Types.ObjectId;
  bookingId: Types.ObjectId;
  dealId?: Types.ObjectId;
  leadId?: Types.ObjectId;
  submissionId?: Types.ObjectId;
  attributionClaimId?: Types.ObjectId;

  commissionPlanId: Types.ObjectId;
  commissionPlanVersion: number;
  taxRuleId?: Types.ObjectId;

  currency: string;
  commissionBasePaise: number;
  grossCommissionPaise: number;
  tdsWithholdingPaise: number;
  gstAmountPaise: number;
  netPayablePaise: number;
  adjustedAmountPaise: number; // Sum of positive/negative adjustments and clawbacks
  paidAmountPaise: number;

  triggerMilestoneKey: string; // e.g. "BOOKING_CONFIRMED", "TOKEN_RECEIVED"
  status: CommissionAccrualStatus;

  eligibilityTimestamp?: Date;
  holdUntilTimestamp?: Date;
  holdReason?: string;

  approvedBy?: string;
  approvedByName?: string;
  approvedAt?: Date;

  payoutId?: Types.ObjectId;
  statementId?: Types.ObjectId;

  idempotencyKey: string;
  version: number;
  createdAt: Date;
  updatedAt: Date;
}

const CommissionAccrualSchema = new Schema<ICommissionAccrual>(
  {
    accrualNumber: {
      type: String,
      required: [true, "Accrual number is required"],
      unique: true,
      trim: true,
      uppercase: true,
      index: true,
    },
    partnerId: {
      type: Schema.Types.ObjectId,
      ref: "ChannelPartner",
      required: [true, "Partner reference is required"],
      index: true,
    },
    bookingId: {
      type: Schema.Types.ObjectId,
      ref: "Booking",
      required: [true, "Booking reference is required"],
      index: true,
    },
    dealId: {
      type: Schema.Types.ObjectId,
      ref: "Deal",
    },
    leadId: {
      type: Schema.Types.ObjectId,
      ref: "Lead",
    },
    submissionId: {
      type: Schema.Types.ObjectId,
      ref: "PartnerLeadSubmission",
    },
    attributionClaimId: {
      type: Schema.Types.ObjectId,
      ref: "LeadAttributionClaim",
    },
    commissionPlanId: {
      type: Schema.Types.ObjectId,
      ref: "CommissionPlan",
      required: true,
    },
    commissionPlanVersion: {
      type: Number,
      required: true,
    },
    taxRuleId: {
      type: Schema.Types.ObjectId,
      ref: "CommissionTaxRule",
    },
    currency: {
      type: String,
      required: true,
      default: "INR",
    },
    commissionBasePaise: {
      type: Number,
      required: true,
      min: 0,
    },
    grossCommissionPaise: {
      type: Number,
      required: true,
      min: 0,
    },
    tdsWithholdingPaise: {
      type: Number,
      required: true,
      default: 0,
    },
    gstAmountPaise: {
      type: Number,
      required: true,
      default: 0,
    },
    netPayablePaise: {
      type: Number,
      required: true,
    },
    adjustedAmountPaise: {
      type: Number,
      default: 0,
    },
    paidAmountPaise: {
      type: Number,
      default: 0,
    },
    triggerMilestoneKey: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: COMMISSION_ACCRUAL_STATUSES,
      default: "ESTIMATED",
      index: true,
    },
    eligibilityTimestamp: {
      type: Date,
    },
    holdUntilTimestamp: {
      type: Date,
    },
    holdReason: {
      type: String,
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
    payoutId: {
      type: Schema.Types.ObjectId,
      ref: "CommissionPayout",
    },
    statementId: {
      type: Schema.Types.ObjectId,
      ref: "PartnerStatement",
    },
    idempotencyKey: {
      type: String,
      required: true,
      unique: true,
      index: true,
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

CommissionAccrualSchema.index({ partnerId: 1, bookingId: 1, status: 1 });

export const CommissionAccrual: Model<ICommissionAccrual> =
  mongoose.models.CommissionAccrual ||
  mongoose.model<ICommissionAccrual>("CommissionAccrual", CommissionAccrualSchema);

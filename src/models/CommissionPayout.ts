import mongoose, { Schema, Document, Model, Types } from "mongoose";
import {
  CommissionPayoutStatus,
  COMMISSION_PAYOUT_STATUSES,
  PayoutMethod,
  PAYOUT_METHODS,
} from "@/types/commission";

export interface ICommissionPayout extends Document {
  _id: Types.ObjectId;
  payoutNumber: string; // RDE-PO-XXXXXX
  partnerId: Types.ObjectId;
  payoutProfileId: Types.ObjectId;
  accrualIds: Types.ObjectId[];

  currency: string;
  grossAmountPaise: number;
  tdsWithheldPaise: number;
  gstAmountPaise: number;
  adjustmentsPaise: number;
  netPayoutPaise: number;

  payoutMethod: PayoutMethod;
  bankReferenceNumber?: string; // UTR / Transaction ID
  paymentProofDocumentKey?: string;

  status: CommissionPayoutStatus;

  // Maker-Checker Approvals
  requestedBy: string;
  requestedByName?: string;
  requestedAt: Date;

  approvedBy?: string;
  approvedByName?: string;
  approvedAt?: Date;

  processedBy?: string;
  processedByName?: string;
  processedAt?: Date;

  reconciledAt?: Date;
  failureReason?: string;

  idempotencyKey: string;
  version: number;
  createdAt: Date;
  updatedAt: Date;
}

const CommissionPayoutSchema = new Schema<ICommissionPayout>(
  {
    payoutNumber: {
      type: String,
      required: [true, "Payout number is required"],
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
    payoutProfileId: {
      type: Schema.Types.ObjectId,
      ref: "PartnerPayoutProfile",
      required: true,
    },
    accrualIds: [{
      type: Schema.Types.ObjectId,
      ref: "CommissionAccrual",
    }],
    currency: {
      type: String,
      required: true,
      default: "INR",
    },
    grossAmountPaise: {
      type: Number,
      required: true,
      min: 0,
    },
    tdsWithheldPaise: {
      type: Number,
      default: 0,
    },
    gstAmountPaise: {
      type: Number,
      default: 0,
    },
    adjustmentsPaise: {
      type: Number,
      default: 0,
    },
    netPayoutPaise: {
      type: Number,
      required: true,
      min: 0,
    },
    payoutMethod: {
      type: String,
      enum: PAYOUT_METHODS,
      default: "BANK_TRANSFER_NEFT",
    },
    bankReferenceNumber: {
      type: String,
      trim: true,
    },
    paymentProofDocumentKey: {
      type: String,
    },
    status: {
      type: String,
      enum: COMMISSION_PAYOUT_STATUSES,
      default: "DRAFT",
      index: true,
    },
    requestedBy: {
      type: String,
      required: true,
    },
    requestedByName: {
      type: String,
    },
    requestedAt: {
      type: Date,
      default: Date.now,
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
    processedBy: {
      type: String,
    },
    processedByName: {
      type: String,
    },
    processedAt: {
      type: Date,
    },
    reconciledAt: {
      type: Date,
    },
    failureReason: {
      type: String,
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

export const CommissionPayout: Model<ICommissionPayout> =
  mongoose.models.CommissionPayout ||
  mongoose.model<ICommissionPayout>("CommissionPayout", CommissionPayoutSchema);

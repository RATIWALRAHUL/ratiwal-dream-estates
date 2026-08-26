import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface IPartnerStatement extends Document {
  _id: Types.ObjectId;
  statementNumber: string; // RDE-PSTM-XXXXXX
  partnerId: Types.ObjectId;

  periodStart: Date;
  periodEnd: Date;

  currency: string;
  totalGrossCommissionPaise: number;
  totalTdsWithheldPaise: number;
  totalGstAmountPaise: number;
  totalAdjustmentsPaise: number;
  totalNetPayablePaise: number;
  totalPaidAmountPaise: number;
  closingOutstandingBalancePaise: number;

  accrualCount: number;
  payoutCount: number;
  accrualIds: Types.ObjectId[];
  payoutIds: Types.ObjectId[];

  generatedAt: Date;
  generatedBy: string;
  generatedByName?: string;
  statementDocumentKey?: string;

  createdAt: Date;
  updatedAt: Date;
}

const PartnerStatementSchema = new Schema<IPartnerStatement>(
  {
    statementNumber: {
      type: String,
      required: [true, "Statement number is required"],
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
    periodStart: {
      type: Date,
      required: true,
    },
    periodEnd: {
      type: Date,
      required: true,
    },
    currency: {
      type: String,
      required: true,
      default: "INR",
    },
    totalGrossCommissionPaise: {
      type: Number,
      required: true,
      default: 0,
    },
    totalTdsWithheldPaise: {
      type: Number,
      default: 0,
    },
    totalGstAmountPaise: {
      type: Number,
      default: 0,
    },
    totalAdjustmentsPaise: {
      type: Number,
      default: 0,
    },
    totalNetPayablePaise: {
      type: Number,
      required: true,
      default: 0,
    },
    totalPaidAmountPaise: {
      type: Number,
      default: 0,
    },
    closingOutstandingBalancePaise: {
      type: Number,
      required: true,
      default: 0,
    },
    accrualCount: {
      type: Number,
      default: 0,
    },
    payoutCount: {
      type: Number,
      default: 0,
    },
    accrualIds: [{
      type: Schema.Types.ObjectId,
      ref: "CommissionAccrual",
    }],
    payoutIds: [{
      type: Schema.Types.ObjectId,
      ref: "CommissionPayout",
    }],
    generatedAt: {
      type: Date,
      default: Date.now,
    },
    generatedBy: {
      type: String,
      required: true,
    },
    generatedByName: {
      type: String,
    },
    statementDocumentKey: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

export const PartnerStatement: Model<IPartnerStatement> =
  mongoose.models.PartnerStatement ||
  mongoose.model<IPartnerStatement>("PartnerStatement", PartnerStatementSchema);

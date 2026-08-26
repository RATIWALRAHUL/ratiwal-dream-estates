import mongoose, { Schema, Document, Model, Types } from "mongoose";
import { DisputeStatus, DISPUTE_STATUSES } from "@/types/payment";

export interface IPaymentDispute extends Document {
  _id: Types.ObjectId;
  paymentId: Types.ObjectId;
  bookingId: Types.ObjectId;
  providerDisputeId: string;

  currency: string;
  disputedAmountPaise: number;
  reasonCode: string;
  status: DisputeStatus;

  evidenceDueBy?: Date;
  evidenceSubmittedKeys?: string[];
  resolution?: string;
  resolvedAt?: Date;

  createdAt: Date;
  updatedAt: Date;
}

const PaymentDisputeSchema = new Schema<IPaymentDispute>(
  {
    paymentId: {
      type: Schema.Types.ObjectId,
      ref: "PaymentTransaction",
      required: [true, "Payment reference is required"],
      index: true,
    },
    bookingId: {
      type: Schema.Types.ObjectId,
      ref: "Booking",
      required: [true, "Booking reference is required"],
      index: true,
    },
    providerDisputeId: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
    },
    currency: {
      type: String,
      default: "INR",
      uppercase: true,
    },
    disputedAmountPaise: {
      type: Number,
      required: true,
      min: 1,
    },
    reasonCode: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: DISPUTE_STATUSES,
      default: "OPEN",
      index: true,
    },
    evidenceDueBy: {
      type: Date,
    },
    evidenceSubmittedKeys: {
      type: [String],
      default: [],
    },
    resolution: {
      type: String,
      trim: true,
    },
    resolvedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

export const PaymentDispute: Model<IPaymentDispute> =
  mongoose.models.PaymentDispute ||
  mongoose.model<IPaymentDispute>("PaymentDispute", PaymentDisputeSchema);

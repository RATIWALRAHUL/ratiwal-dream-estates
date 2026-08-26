import mongoose, { Schema, Document, Model, Types } from "mongoose";
import { PaymentPlanStatus, PAYMENT_PLAN_STATUSES } from "@/types/payment";

export interface IPaymentPlan extends Document {
  _id: Types.ObjectId;
  paymentPlanNumber: string; // RDE-PLN-XXXXXX
  bookingId: Types.ObjectId;
  reservationId?: Types.ObjectId;
  dealId?: Types.ObjectId;
  partyId?: Types.ObjectId; // CustomerParty reference
  propertyId: Types.ObjectId;
  unitId: Types.ObjectId;
  offerId?: Types.ObjectId;
  pricingSnapshotVersion: number;

  currency: string;
  totalConsiderationPaise: number;
  totalAmountCoveredPaise: number;
  taxDisclaimer: string;

  status: PaymentPlanStatus;
  version: number;
  effectiveDate: Date;

  approvedBy?: string;
  approvedByName?: string;
  approvalTimestamp?: Date;
  supersededTimestamp?: Date;

  createdBy: string;
  createdByName?: string;
  createdAt: Date;
  updatedAt: Date;
}

const PaymentPlanSchema = new Schema<IPaymentPlan>(
  {
    paymentPlanNumber: {
      type: String,
      required: [true, "Payment plan number is required"],
      unique: true,
      trim: true,
      uppercase: true,
      index: true,
    },
    bookingId: {
      type: Schema.Types.ObjectId,
      ref: "Booking",
      required: [true, "Booking reference is required"],
      index: true,
    },
    reservationId: {
      type: Schema.Types.ObjectId,
      ref: "Reservation",
      index: true,
    },
    dealId: {
      type: Schema.Types.ObjectId,
      ref: "Deal",
      index: true,
    },
    partyId: {
      type: Schema.Types.ObjectId,
      ref: "CustomerParty",
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
      required: [true, "Unit reference is required"],
      index: true,
    },
    offerId: {
      type: Schema.Types.ObjectId,
      ref: "DealOffer",
    },
    pricingSnapshotVersion: {
      type: Number,
      default: 1,
    },
    currency: {
      type: String,
      default: "INR",
      uppercase: true,
    },
    totalConsiderationPaise: {
      type: Number,
      required: true,
      min: 0,
    },
    totalAmountCoveredPaise: {
      type: Number,
      required: true,
      min: 0,
    },
    taxDisclaimer: {
      type: String,
      default:
        "Statutory taxes, stamp duty, registration charges, and GST are payable as per applicable government notifications at the time of demand and are subject to statutory verification.",
    },
    status: {
      type: String,
      enum: PAYMENT_PLAN_STATUSES,
      default: "DRAFT",
      index: true,
    },
    version: {
      type: Number,
      default: 1,
    },
    effectiveDate: {
      type: Date,
      default: Date.now,
    },
    approvedBy: {
      type: String,
    },
    approvedByName: {
      type: String,
    },
    approvalTimestamp: {
      type: Date,
    },
    supersededTimestamp: {
      type: Date,
    },
    createdBy: {
      type: String,
      required: true,
    },
    createdByName: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

PaymentPlanSchema.index({ bookingId: 1, status: 1 });
PaymentPlanSchema.index({ bookingId: 1, version: 1 });

export const PaymentPlan: Model<IPaymentPlan> =
  mongoose.models.PaymentPlan ||
  mongoose.model<IPaymentPlan>("PaymentPlan", PaymentPlanSchema);

import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface IPaymentAllocation extends Document {
  _id: Types.ObjectId;
  paymentId: Types.ObjectId;
  bookingId: Types.ObjectId;
  installmentId: Types.ObjectId;
  currency: string;
  allocatedAmountPaise: number;
  allocationType: "AUTOMATIC_FIFO" | "MANUAL_STAFF" | "REVERSAL";
  allocationSequence: number;

  reversalOfAllocationId?: Types.ObjectId;
  isReversed: boolean;
  reversalReason?: string;

  allocatedBy: string;
  allocatedByName?: string;
  allocatedAt: Date;

  createdAt: Date;
  updatedAt: Date;
}

const PaymentAllocationSchema = new Schema<IPaymentAllocation>(
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
    installmentId: {
      type: Schema.Types.ObjectId,
      ref: "PaymentInstallment",
      required: [true, "Installment reference is required"],
      index: true,
    },
    currency: {
      type: String,
      default: "INR",
      uppercase: true,
    },
    allocatedAmountPaise: {
      type: Number,
      required: true,
      min: 0,
    },
    allocationType: {
      type: String,
      enum: ["AUTOMATIC_FIFO", "MANUAL_STAFF", "REVERSAL"],
      default: "AUTOMATIC_FIFO",
    },
    allocationSequence: {
      type: Number,
      default: 1,
    },
    reversalOfAllocationId: {
      type: Schema.Types.ObjectId,
      ref: "PaymentAllocation",
    },
    isReversed: {
      type: Boolean,
      default: false,
      index: true,
    },
    reversalReason: {
      type: String,
      trim: true,
    },
    allocatedBy: {
      type: String,
      required: true,
    },
    allocatedByName: {
      type: String,
    },
    allocatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

PaymentAllocationSchema.index({ paymentId: 1, installmentId: 1 });
PaymentAllocationSchema.index({ bookingId: 1, installmentId: 1 });

export const PaymentAllocation: Model<IPaymentAllocation> =
  mongoose.models.PaymentAllocation ||
  mongoose.model<IPaymentAllocation>("PaymentAllocation", PaymentAllocationSchema);

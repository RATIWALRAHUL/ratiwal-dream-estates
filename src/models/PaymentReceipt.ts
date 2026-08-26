import mongoose, { Schema, Document, Model, Types } from "mongoose";
import { ReceiptStatus, RECEIPT_STATUSES } from "@/types/payment";

export interface IReceiptAllocationSummary {
  installmentId: Types.ObjectId;
  installmentKey: string;
  installmentDescription: string;
  allocatedAmountPaise: number;
}

export interface IPaymentReceipt extends Document {
  _id: Types.ObjectId;
  receiptNumber: string; // RDE-RCP-XXXXXX
  paymentId: Types.ObjectId;
  bookingId: Types.ObjectId;
  partyId?: Types.ObjectId;

  currency: string;
  receivedAmountPaise: number;
  allocations: IReceiptAllocationSummary[];

  paymentMethod: string;
  safePaymentReference: string; // Masked UTR or Provider Payment ID
  paymentDate: Date;

  receiptStatus: ReceiptStatus;
  issuedAt: Date;
  issuedBy: string;
  issuedByName?: string;

  pdfDocumentKey?: string;
  pdfDocumentUrl?: string;

  disclaimerText: string;

  voidReason?: string;
  voidedBy?: string;
  voidedByName?: string;
  voidedAt?: Date;

  supersedingReceiptId?: Types.ObjectId;

  createdAt: Date;
  updatedAt: Date;
}

const ReceiptAllocationSummarySchema = new Schema<IReceiptAllocationSummary>(
  {
    installmentId: {
      type: Schema.Types.ObjectId,
      ref: "PaymentInstallment",
      required: true,
    },
    installmentKey: {
      type: String,
      required: true,
    },
    installmentDescription: {
      type: String,
      required: true,
    },
    allocatedAmountPaise: {
      type: Number,
      required: true,
      min: 1,
    },
  },
  { _id: false }
);

const PaymentReceiptSchema = new Schema<IPaymentReceipt>(
  {
    receiptNumber: {
      type: String,
      required: [true, "Receipt number is required"],
      unique: true,
      trim: true,
      uppercase: true,
      index: true,
    },
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
    partyId: {
      type: Schema.Types.ObjectId,
      ref: "CustomerParty",
      index: true,
    },
    currency: {
      type: String,
      default: "INR",
      uppercase: true,
    },
    receivedAmountPaise: {
      type: Number,
      required: true,
      min: 1,
    },
    allocations: {
      type: [ReceiptAllocationSummarySchema],
      default: [],
    },
    paymentMethod: {
      type: String,
      required: true,
    },
    safePaymentReference: {
      type: String,
      required: true,
      trim: true,
    },
    paymentDate: {
      type: Date,
      required: true,
    },
    receiptStatus: {
      type: String,
      enum: RECEIPT_STATUSES,
      default: "ISSUED",
      index: true,
    },
    issuedAt: {
      type: Date,
      default: Date.now,
    },
    issuedBy: {
      type: String,
      required: true,
    },
    issuedByName: {
      type: String,
    },
    pdfDocumentKey: {
      type: String,
      trim: true,
    },
    pdfDocumentUrl: {
      type: String,
      trim: true,
    },
    disclaimerText: {
      type: String,
      default:
        "This is an official payment acknowledgement receipt issued by Ratiwal Dream Estates. This document does not constitute a Tax Invoice or a legal title deed. Final conveyance is subject to statutory registration and full payment of all dues.",
    },
    voidReason: {
      type: String,
      trim: true,
    },
    voidedBy: {
      type: String,
    },
    voidedByName: {
      type: String,
    },
    voidedAt: {
      type: Date,
    },
    supersedingReceiptId: {
      type: Schema.Types.ObjectId,
      ref: "PaymentReceipt",
    },
  },
  {
    timestamps: true,
  }
);

PaymentReceiptSchema.index({ bookingId: 1, receiptStatus: 1 });

export const PaymentReceipt: Model<IPaymentReceipt> =
  mongoose.models.PaymentReceipt ||
  mongoose.model<IPaymentReceipt>("PaymentReceipt", PaymentReceiptSchema);

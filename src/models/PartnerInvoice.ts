import mongoose, { Schema, Document, Model, Types } from "mongoose";
import {
  PartnerInvoiceStatus,
  PARTNER_INVOICE_STATUSES,
} from "@/types/commission";

export interface IPartnerInvoice extends Document {
  _id: Types.ObjectId;
  invoiceNumber: string;
  partnerId: Types.ObjectId;
  accrualIds: Types.ObjectId[];

  invoiceDate: Date;
  gstinSnapshot?: string;

  taxableAmountPaise: number;
  cgstAmountPaise: number;
  sgstAmountPaise: number;
  igstAmountPaise: number;
  totalInvoiceAmountPaise: number;

  status: PartnerInvoiceStatus;
  documentKey: string; // Stored PDF

  reviewedBy?: string;
  reviewedByName?: string;
  reviewedAt?: Date;
  rejectionReason?: string;

  createdAt: Date;
  updatedAt: Date;
}

const PartnerInvoiceSchema = new Schema<IPartnerInvoice>(
  {
    invoiceNumber: {
      type: String,
      required: [true, "Invoice number is required"],
      trim: true,
      index: true,
    },
    partnerId: {
      type: Schema.Types.ObjectId,
      ref: "ChannelPartner",
      required: [true, "Partner reference is required"],
      index: true,
    },
    accrualIds: [{
      type: Schema.Types.ObjectId,
      ref: "CommissionAccrual",
    }],
    invoiceDate: {
      type: Date,
      required: true,
    },
    gstinSnapshot: {
      type: String,
      trim: true,
    },
    taxableAmountPaise: {
      type: Number,
      required: true,
      min: 0,
    },
    cgstAmountPaise: {
      type: Number,
      default: 0,
    },
    sgstAmountPaise: {
      type: Number,
      default: 0,
    },
    igstAmountPaise: {
      type: Number,
      default: 0,
    },
    totalInvoiceAmountPaise: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: PARTNER_INVOICE_STATUSES,
      default: "SUBMITTED",
      index: true,
    },
    documentKey: {
      type: String,
      required: true,
    },
    reviewedBy: {
      type: String,
    },
    reviewedByName: {
      type: String,
    },
    reviewedAt: {
      type: Date,
    },
    rejectionReason: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

export const PartnerInvoice: Model<IPartnerInvoice> =
  mongoose.models.PartnerInvoice ||
  mongoose.model<IPartnerInvoice>("PartnerInvoice", PartnerInvoiceSchema);

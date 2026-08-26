import mongoose, { Schema, Document, Model, Types } from "mongoose";
import {
  SupportCategory,
  SUPPORT_CATEGORIES,
  SupportPriority,
  SUPPORT_PRIORITIES,
  SupportStatus,
  SUPPORT_STATUSES,
  ISupportMessage,
} from "@/types/portal";

export interface ICustomerSupportRequest extends Document {
  _id: Types.ObjectId;
  requestNumber: string; // RDE-SRQ-XXXXXX
  accountId: Types.ObjectId; // CustomerPortalAccount reference
  partyId: Types.ObjectId; // CustomerParty reference
  bookingId?: Types.ObjectId;

  category: SupportCategory;
  subject: string;
  sanitizedDescription: string;
  priority: SupportPriority;
  status: SupportStatus;

  assignedTo?: Types.ObjectId; // TeamMember reference
  assignedToName?: string;

  messages: ISupportMessage[];

  resolutionSummary?: string;
  closedAt?: Date;
  closedBy?: string;

  createdAt: Date;
  updatedAt: Date;
}

const SupportMessageSchema = new Schema<ISupportMessage>(
  {
    senderType: {
      type: String,
      enum: ["CUSTOMER", "STAFF"],
      required: true,
    },
    senderId: {
      type: String,
      required: true,
    },
    senderName: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    attachmentKeys: {
      type: [String],
      default: [],
    },
    sentAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const CustomerSupportRequestSchema = new Schema<ICustomerSupportRequest>(
  {
    requestNumber: {
      type: String,
      required: [true, "Support request number is required"],
      unique: true,
      trim: true,
      uppercase: true,
      index: true,
    },
    accountId: {
      type: Schema.Types.ObjectId,
      ref: "CustomerPortalAccount",
      required: [true, "Account reference is required"],
      index: true,
    },
    partyId: {
      type: Schema.Types.ObjectId,
      ref: "CustomerParty",
      required: [true, "Customer Party reference is required"],
      index: true,
    },
    bookingId: {
      type: Schema.Types.ObjectId,
      ref: "Booking",
      index: true,
    },
    category: {
      type: String,
      enum: SUPPORT_CATEGORIES,
      required: true,
      default: "GENERAL_INQUIRY",
    },
    subject: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    sanitizedDescription: {
      type: String,
      required: true,
      trim: true,
    },
    priority: {
      type: String,
      enum: SUPPORT_PRIORITIES,
      default: "NORMAL",
    },
    status: {
      type: String,
      enum: SUPPORT_STATUSES,
      default: "OPEN",
      index: true,
    },
    assignedTo: {
      type: Schema.Types.ObjectId,
      ref: "TeamMember",
    },
    assignedToName: {
      type: String,
    },
    messages: {
      type: [SupportMessageSchema],
      default: [],
    },
    resolutionSummary: {
      type: String,
      trim: true,
    },
    closedAt: {
      type: Date,
    },
    closedBy: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

CustomerSupportRequestSchema.index({ accountId: 1, status: 1 });
CustomerSupportRequestSchema.index({ partyId: 1, status: 1 });

export const CustomerSupportRequest: Model<ICustomerSupportRequest> =
  mongoose.models.CustomerSupportRequest ||
  mongoose.model<ICustomerSupportRequest>("CustomerSupportRequest", CustomerSupportRequestSchema);

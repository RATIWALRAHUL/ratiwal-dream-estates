import mongoose, { Schema, Document, Model, Types } from "mongoose";
import {
  DealStage,
  DEAL_STAGES,
  DealPriority,
  DEAL_PRIORITIES,
  DealSource,
  DEAL_SOURCES,
  DealLostReason,
  DEAL_LOST_REASONS,
} from "@/types/deal";

export interface IDeal extends Document {
  dealNumber: string; // RDE-DL-XXXXXX
  leadId: Types.ObjectId;
  propertyId: Types.ObjectId;
  unitId?: Types.ObjectId;
  assignedAdvisorId: string;
  assignedAdvisorName: string;
  assignedAdvisorEmail?: string;
  createdBy: string;
  createdByName?: string;

  status: DealStage;
  pipelineStage: DealStage;
  priority: DealPriority;
  source: DealSource;
  expectedCloseDate?: Date;

  // Active linkages
  currentOfferId?: Types.ObjectId;
  activeHoldId?: Types.ObjectId;
  activeReservationId?: Types.ObjectId;
  bookingId?: Types.ObjectId;

  // Pricing summary
  currency: string;
  offeredAmountPaise?: number;

  // Next actions
  nextActionType?: string;
  nextActionDate?: Date;

  // Closure metadata
  lostReason?: DealLostReason;
  lostReasonDetails?: string;
  cancellationReason?: string;

  internalNotes?: string;
  version: number;
  closedAt?: Date;
  archivedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const DealSchema = new Schema<IDeal>(
  {
    dealNumber: {
      type: String,
      required: [true, "Deal number is required"],
      unique: true,
      trim: true,
      uppercase: true,
      index: true,
    },
    leadId: {
      type: Schema.Types.ObjectId,
      ref: "Lead",
      required: [true, "Lead reference is required"],
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
      index: true,
    },
    assignedAdvisorId: {
      type: String,
      required: [true, "Assigned advisor is required"],
      index: true,
    },
    assignedAdvisorName: {
      type: String,
      required: [true, "Assigned advisor name is required"],
      trim: true,
    },
    assignedAdvisorEmail: {
      type: String,
      trim: true,
      lowercase: true,
    },
    createdBy: {
      type: String,
      required: true,
      index: true,
    },
    createdByName: {
      type: String,
      trim: true,
    },

    status: {
      type: String,
      enum: DEAL_STAGES,
      default: "DRAFT",
      required: true,
      index: true,
    },
    pipelineStage: {
      type: String,
      enum: DEAL_STAGES,
      default: "DRAFT",
      required: true,
      index: true,
    },
    priority: {
      type: String,
      enum: DEAL_PRIORITIES,
      default: "NORMAL",
      index: true,
    },
    source: {
      type: String,
      enum: DEAL_SOURCES,
      default: "DIRECT_INQUIRY",
    },
    expectedCloseDate: {
      type: Date,
      index: true,
    },

    currentOfferId: {
      type: Schema.Types.ObjectId,
      ref: "DealOffer",
    },
    activeHoldId: {
      type: Schema.Types.ObjectId,
      ref: "InventoryHold",
    },
    activeReservationId: {
      type: Schema.Types.ObjectId,
      ref: "Reservation",
    },
    bookingId: {
      type: Schema.Types.ObjectId,
      ref: "Booking",
    },

    currency: {
      type: String,
      default: "INR",
      uppercase: true,
    },
    offeredAmountPaise: {
      type: Number,
      min: 0,
    },

    nextActionType: {
      type: String,
      trim: true,
    },
    nextActionDate: {
      type: Date,
    },

    lostReason: {
      type: String,
      enum: DEAL_LOST_REASONS,
    },
    lostReasonDetails: {
      type: String,
      trim: true,
    },
    cancellationReason: {
      type: String,
      trim: true,
    },

    internalNotes: {
      type: String,
      trim: true,
    },
    version: {
      type: Number,
      default: 1,
      required: true,
    },
    closedAt: {
      type: Date,
    },
    archivedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for CRM lookups & duplicate detection
DealSchema.index({ leadId: 1, propertyId: 1, status: 1 });
DealSchema.index({ leadId: 1, unitId: 1, status: 1 });
DealSchema.index({ status: 1, assignedAdvisorId: 1 });
DealSchema.index({ propertyId: 1, status: 1 });

export const Deal: Model<IDeal> =
  mongoose.models.Deal || mongoose.model<IDeal>("Deal", DealSchema);

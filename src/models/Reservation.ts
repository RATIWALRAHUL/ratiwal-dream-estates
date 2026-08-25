import mongoose, { Schema, Document, Model, Types } from "mongoose";
import { ReservationStatus, RESERVATION_STATUSES } from "@/types/deal";

export interface IReservation extends Document {
  reservationNumber: string; // RDE-RSV-XXXXXX
  dealId: Types.ObjectId;
  leadId: Types.ObjectId;
  propertyId: Types.ObjectId;
  unitId: Types.ObjectId;
  holdId?: Types.ObjectId;
  offerId: Types.ObjectId;

  // Immutable pricing snapshot
  finalAmountPaise: number;
  currency: string;

  status: ReservationStatus;
  reservationDate: Date;
  validUntil?: Date;

  // Requirement checklist snapshot
  checklistComplete: boolean;
  checklistNotes?: string;

  createdBy: string;
  createdByName?: string;
  approvedBy?: string;
  approvedByName?: string;
  approvalAt?: Date;

  cancellationReason?: string;
  cancelledBy?: string;
  cancelledAt?: Date;

  version: number;
  createdAt: Date;
  updatedAt: Date;
}

const ReservationSchema = new Schema<IReservation>(
  {
    reservationNumber: {
      type: String,
      required: [true, "Reservation number is required"],
      unique: true,
      trim: true,
      uppercase: true,
      index: true,
    },
    dealId: {
      type: Schema.Types.ObjectId,
      ref: "Deal",
      required: [true, "Deal reference is required"],
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
      required: [true, "Unit reference is required"],
      index: true,
    },
    holdId: {
      type: Schema.Types.ObjectId,
      ref: "InventoryHold",
    },
    offerId: {
      type: Schema.Types.ObjectId,
      ref: "DealOffer",
      required: [true, "Offer reference is required"],
    },

    finalAmountPaise: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      default: "INR",
      uppercase: true,
    },

    status: {
      type: String,
      enum: RESERVATION_STATUSES,
      default: "ACTIVE",
      required: true,
      index: true,
    },
    reservationDate: {
      type: Date,
      default: Date.now,
      required: true,
    },
    validUntil: {
      type: Date,
    },

    checklistComplete: {
      type: Boolean,
      default: false,
    },
    checklistNotes: {
      type: String,
      trim: true,
    },

    createdBy: {
      type: String,
      required: true,
    },
    createdByName: {
      type: String,
      trim: true,
    },
    approvedBy: {
      type: String,
    },
    approvedByName: {
      type: String,
      trim: true,
    },
    approvalAt: {
      type: Date,
    },

    cancellationReason: {
      type: String,
      trim: true,
    },
    cancelledBy: {
      type: String,
    },
    cancelledAt: {
      type: Date,
    },

    version: {
      type: Number,
      default: 1,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for active reservation uniqueness
ReservationSchema.index({ unitId: 1, status: 1 });
ReservationSchema.index({ dealId: 1, status: 1 });

export const Reservation: Model<IReservation> =
  mongoose.models.Reservation || mongoose.model<IReservation>("Reservation", ReservationSchema);

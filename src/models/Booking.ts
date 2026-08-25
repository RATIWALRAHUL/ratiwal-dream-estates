import mongoose, { Schema, Document, Model, Types } from "mongoose";
import { BookingStatus, BOOKING_STATUSES } from "@/types/deal";

export interface IBookingRequirements {
  identityProofVerified: boolean;
  addressProofVerified: boolean;
  bookingFormSigned: boolean;
  downPaymentTermsAccepted: boolean;
  verificationNotes?: string;
}

export interface IBooking extends Document {
  bookingNumber: string; // RDE-BKG-XXXXXX
  dealId: Types.ObjectId;
  leadId: Types.ObjectId;
  propertyId: Types.ObjectId;
  unitId: Types.ObjectId;
  reservationId: Types.ObjectId;
  offerId: Types.ObjectId;

  // Pricing snapshot
  finalAmountPaise: number;
  currency: string;

  status: BookingStatus;
  requirementsChecklist: IBookingRequirements;

  confirmedBy: string;
  confirmedByName?: string;
  confirmedAt?: Date;

  cancellationReason?: string;
  cancelledBy?: string;
  cancelledAt?: Date;

  version: number;
  createdAt: Date;
  updatedAt: Date;
}

const BookingRequirementsSchema = new Schema<IBookingRequirements>(
  {
    identityProofVerified: {
      type: Boolean,
      default: false,
    },
    addressProofVerified: {
      type: Boolean,
      default: false,
    },
    bookingFormSigned: {
      type: Boolean,
      default: false,
    },
    downPaymentTermsAccepted: {
      type: Boolean,
      default: false,
    },
    verificationNotes: {
      type: String,
      trim: true,
    },
  },
  { _id: false }
);

const BookingSchema = new Schema<IBooking>(
  {
    bookingNumber: {
      type: String,
      required: [true, "Booking number is required"],
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
    reservationId: {
      type: Schema.Types.ObjectId,
      ref: "Reservation",
      required: [true, "Reservation reference is required"],
      index: true,
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
      enum: BOOKING_STATUSES,
      default: "DRAFT",
      required: true,
      index: true,
    },
    requirementsChecklist: {
      type: BookingRequirementsSchema,
      default: () => ({}),
    },

    confirmedBy: {
      type: String,
    },
    confirmedByName: {
      type: String,
      trim: true,
    },
    confirmedAt: {
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

// Unique index to prevent multiple confirmed bookings for a single unit
BookingSchema.index({ unitId: 1, status: 1 });
BookingSchema.index({ dealId: 1, status: 1 });

export const Booking: Model<IBooking> =
  mongoose.models.Booking || mongoose.model<IBooking>("Booking", BookingSchema);

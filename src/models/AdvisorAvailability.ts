import mongoose, { Schema, Document, Model } from "mongoose";
import {
  AVAILABILITY_EXCEPTION_TYPES,
  type AvailabilityExceptionType,
} from "@/types/site-visit";

// ─── Sub-document Interfaces ───────────────────────────────────────────────────

export interface IDaySchedule {
  dayOfWeek: number; // 0 (Sunday) to 6 (Saturday)
  startLocalTime: string; // "HH:mm", e.g. "09:30"
  endLocalTime: string; // "HH:mm", e.g. "18:00"
  active: boolean;
}

export interface IAvailabilityException {
  _id?: mongoose.Types.ObjectId;
  date: string; // "YYYY-MM-DD"
  type: AvailabilityExceptionType;
  startLocalTime?: string; // for PARTIAL_DAY_UNAVAILABLE / SPECIAL_HOURS
  endLocalTime?: string;
  reason: string;
  createdAt: Date;
}

// ─── Main AdvisorAvailability Interface ────────────────────────────────────────

export interface IAdvisorAvailability extends Document {
  advisorId: string; // Admin user ID or "GLOBAL_DEFAULT"
  advisorName: string;
  advisorEmail: string;
  timezone: string;
  weeklySchedule: IDaySchedule[];
  defaultVisitDurationMinutes: number;
  bufferBeforeMinutes: number;
  bufferAfterMinutes: number;
  slotIntervalMinutes: number;
  minBookingNoticeHours: number;
  maxAdvanceBookingDays: number;
  active: boolean;
  effectiveFrom?: Date;
  effectiveUntil?: Date;
  exceptions: IAvailabilityException[];

  createdAt: Date;
  updatedAt: Date;
}

// ─── Sub-document Schemas ─────────────────────────────────────────────────────

const DayScheduleSchema = new Schema<IDaySchedule>(
  {
    dayOfWeek: { type: Number, required: true, min: 0, max: 6 },
    startLocalTime: { type: String, required: true, match: /^([01]\d|2[0-3]):([0-5]\d)$/ },
    endLocalTime: { type: String, required: true, match: /^([01]\d|2[0-3]):([0-5]\d)$/ },
    active: { type: Boolean, default: true, required: true },
  },
  { _id: false }
);

const AvailabilityExceptionSchema = new Schema<IAvailabilityException>(
  {
    date: { type: String, required: true, match: /^\d{4}-\d{2}-\d{2}$/ },
    type: { type: String, required: true, enum: AVAILABILITY_EXCEPTION_TYPES },
    startLocalTime: { type: String, match: /^([01]\d|2[0-3]):([0-5]\d)$/ },
    endLocalTime: { type: String, match: /^([01]\d|2[0-3]):([0-5]\d)$/ },
    reason: { type: String, required: true, trim: true, maxlength: 500 },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: true }
);

// ─── Main AdvisorAvailability Schema ──────────────────────────────────────────

const AdvisorAvailabilitySchema = new Schema<IAdvisorAvailability>(
  {
    advisorId: { type: String, required: true, unique: true, index: true },
    advisorName: { type: String, required: true, trim: true },
    advisorEmail: { type: String, required: true, trim: true, lowercase: true },
    timezone: { type: String, default: "Asia/Kolkata", required: true },
    weeklySchedule: {
      type: [DayScheduleSchema],
      default: [
        { dayOfWeek: 0, startLocalTime: "10:00", endLocalTime: "17:00", active: true }, // Sun
        { dayOfWeek: 1, startLocalTime: "09:30", endLocalTime: "18:30", active: true }, // Mon
        { dayOfWeek: 2, startLocalTime: "09:30", endLocalTime: "18:30", active: true }, // Tue
        { dayOfWeek: 3, startLocalTime: "09:30", endLocalTime: "18:30", active: true }, // Wed
        { dayOfWeek: 4, startLocalTime: "09:30", endLocalTime: "18:30", active: true }, // Thu
        { dayOfWeek: 5, startLocalTime: "09:30", endLocalTime: "18:30", active: true }, // Fri
        { dayOfWeek: 6, startLocalTime: "09:30", endLocalTime: "18:30", active: true }, // Sat
      ],
    },
    defaultVisitDurationMinutes: { type: Number, default: 60, min: 15, max: 480 },
    bufferBeforeMinutes: { type: Number, default: 15, min: 0, max: 120 },
    bufferAfterMinutes: { type: Number, default: 15, min: 0, max: 120 },
    slotIntervalMinutes: { type: Number, default: 30, min: 15, max: 120 },
    minBookingNoticeHours: { type: Number, default: 4, min: 1, max: 72 },
    maxAdvanceBookingDays: { type: Number, default: 30, min: 1, max: 90 },
    active: { type: Boolean, default: true, required: true, index: true },
    effectiveFrom: { type: Date },
    effectiveUntil: { type: Date },
    exceptions: { type: [AvailabilityExceptionSchema], default: [] },
  },
  {
    timestamps: true,
  }
);

// Compound index for active schedule lookups
AdvisorAvailabilitySchema.index({ advisorId: 1, active: 1 });

export const AdvisorAvailability: Model<IAdvisorAvailability> =
  mongoose.models.AdvisorAvailability ||
  mongoose.model<IAdvisorAvailability>("AdvisorAvailability", AdvisorAvailabilitySchema);

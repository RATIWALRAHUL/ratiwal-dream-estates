import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface IAdvisorSlotLock extends Document {
  advisorId: string;
  siteVisitId: Types.ObjectId;
  slotStartAt: Date;
  slotEndAt: Date;
  slotKey: string; // Formatted interval identifier, e.g. "2026-08-26T10:00:00.000Z"
  status: "ACTIVE" | "RELEASED";
  createdAt: Date;
  expiresAt?: Date; // TTL for temporary holds if needed
}

const AdvisorSlotLockSchema = new Schema<IAdvisorSlotLock>(
  {
    advisorId: { type: String, required: true, trim: true, index: true },
    siteVisitId: {
      type: Schema.Types.ObjectId,
      ref: "SiteVisit",
      required: true,
      index: true,
    },
    slotStartAt: { type: Date, required: true },
    slotEndAt: { type: Date, required: true },
    slotKey: { type: String, required: true },
    status: {
      type: String,
      enum: ["ACTIVE", "RELEASED"],
      default: "ACTIVE",
      required: true,
      index: true,
    },
    expiresAt: { type: Date, index: { expires: 0 } }, // TTL index
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

// ─── Unique Compound Index for Atomic Double-Booking Prevention ───────────────
// Prevents the same advisor from having two active locks for the exact same slotKey
AdvisorSlotLockSchema.index(
  { advisorId: 1, slotKey: 1 },
  {
    unique: true,
    partialFilterExpression: { status: "ACTIVE" },
  }
);

export const AdvisorSlotLock: Model<IAdvisorSlotLock> =
  mongoose.models.AdvisorSlotLock ||
  mongoose.model<IAdvisorSlotLock>("AdvisorSlotLock", AdvisorSlotLockSchema);

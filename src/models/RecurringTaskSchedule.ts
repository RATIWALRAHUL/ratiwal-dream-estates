import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface IRecurringTaskSchedule extends Document {
  _id: Types.ObjectId;
  templateId: Types.ObjectId;
  frequency: "DAILY" | "WEEKLY" | "MONTHLY" | "CUSTOM";
  timezone: string; // e.g. "Asia/Kolkata"

  startDate: Date;
  endDate?: Date;

  nextRun: Date;
  lastRun?: Date;
  assignedUserId: string;
  assignedUserName: string;

  status: "ACTIVE" | "PAUSED" | "CANCELLED";
  idempotencyVersion: number;

  createdAt: Date;
  updatedAt: Date;
}

const RecurringTaskScheduleSchema = new Schema<IRecurringTaskSchedule>(
  {
    templateId: {
      type: Schema.Types.ObjectId,
      ref: "TaskTemplate",
      required: true,
      index: true,
    },
    frequency: {
      type: String,
      enum: ["DAILY", "WEEKLY", "MONTHLY", "CUSTOM"],
      required: true,
    },
    timezone: {
      type: String,
      required: true,
      default: "Asia/Kolkata",
    },
    startDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    endDate: {
      type: Date,
    },
    nextRun: {
      type: Date,
      required: true,
      index: true,
    },
    lastRun: {
      type: Date,
    },
    assignedUserId: {
      type: String,
      required: true,
      index: true,
    },
    assignedUserName: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["ACTIVE", "PAUSED", "CANCELLED"],
      default: "ACTIVE",
      index: true,
    },
    idempotencyVersion: {
      type: Number,
      default: 1,
    },
  },
  {
    timestamps: true,
  }
);

export const RecurringTaskSchedule: Model<IRecurringTaskSchedule> =
  mongoose.models.RecurringTaskSchedule ||
  mongoose.model<IRecurringTaskSchedule>("RecurringTaskSchedule", RecurringTaskScheduleSchema);

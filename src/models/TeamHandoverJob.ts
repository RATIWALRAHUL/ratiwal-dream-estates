import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface ITeamHandoverJob extends Document {
  _id: Types.ObjectId;
  sourceMemberId: Types.ObjectId;
  targetMemberId: Types.ObjectId;
  leadsReassignedCount: number;
  siteVisitsReassignedCount: number;
  legalReviewsReassignedCount: number;
  status: "PENDING" | "PROCESSING" | "COMPLETED" | "PARTIALLY_COMPLETED" | "FAILED";
  reason: string;
  errorMessage?: string;
  requestedBy: string;
  startedAt: Date;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const TeamHandoverJobSchema = new Schema<ITeamHandoverJob>(
  {
    sourceMemberId: {
      type: Schema.Types.ObjectId,
      ref: "TeamMember",
      required: true,
      index: true,
    },
    targetMemberId: {
      type: Schema.Types.ObjectId,
      ref: "TeamMember",
      required: true,
      index: true,
    },
    leadsReassignedCount: {
      type: Number,
      default: 0,
    },
    siteVisitsReassignedCount: {
      type: Number,
      default: 0,
    },
    legalReviewsReassignedCount: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ["PENDING", "PROCESSING", "COMPLETED", "PARTIALLY_COMPLETED", "FAILED"],
      default: "PENDING",
      required: true,
      index: true,
    },
    reason: {
      type: String,
      required: true,
      trim: true,
      maxlength: 300,
    },
    errorMessage: {
      type: String,
    },
    requestedBy: {
      type: String,
      required: true,
    },
    startedAt: {
      type: Date,
      default: Date.now,
    },
    completedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

export const TeamHandoverJob: Model<ITeamHandoverJob> =
  mongoose.models.TeamHandoverJob ||
  mongoose.model<ITeamHandoverJob>("TeamHandoverJob", TeamHandoverJobSchema);

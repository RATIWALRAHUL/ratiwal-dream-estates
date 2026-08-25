import mongoose, { Schema, Document, Model, Types } from "mongoose";
import type { LeadStatus } from "@/types/lead";

export interface ILeadStageHistory extends Document {
  _id: Types.ObjectId;
  leadId: Types.ObjectId;
  fromStage: LeadStatus | null; // null if initial creation
  toStage: LeadStatus;
  changedBy: string; // admin/advisor user ID or "SYSTEM"
  changedByName?: string;
  changedByEmail?: string;
  changedAt: Date;
  source?: string;
  reasonCode?: string;
  sanitizedNote?: string;
  durationInPreviousStageMs?: number; // Duration in milliseconds spent in fromStage
  createdAt: Date;
}

const LeadStageHistorySchema = new Schema<ILeadStageHistory>(
  {
    leadId: {
      type: Schema.Types.ObjectId,
      ref: "Lead",
      required: true,
      index: true,
    },
    fromStage: {
      type: String,
      default: null,
    },
    toStage: {
      type: String,
      required: true,
      index: true,
    },
    changedBy: {
      type: String,
      required: true,
      index: true,
    },
    changedByName: {
      type: String,
      default: null,
    },
    changedByEmail: {
      type: String,
      default: null,
    },
    changedAt: {
      type: Date,
      required: true,
      default: Date.now,
      index: true,
    },
    source: {
      type: String,
      default: "DASHBOARD_CRM",
    },
    reasonCode: {
      type: String,
      default: null,
    },
    sanitizedNote: {
      type: String,
      default: null,
    },
    durationInPreviousStageMs: {
      type: Number,
      default: null,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false }, // Append-only immutable log
  }
);

// Compound indexes for fast stage movement and duration aggregation
LeadStageHistorySchema.index({ leadId: 1, changedAt: 1 });
LeadStageHistorySchema.index({ toStage: 1, changedAt: 1 });
LeadStageHistorySchema.index({ changedBy: 1, changedAt: 1 });

export const LeadStageHistory: Model<ILeadStageHistory> =
  mongoose.models.LeadStageHistory ||
  mongoose.model<ILeadStageHistory>("LeadStageHistory", LeadStageHistorySchema);

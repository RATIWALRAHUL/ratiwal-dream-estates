import mongoose, { Schema, Document, Model, Types } from "mongoose";
import type { SeoProvider } from "./SeoIntegrationConfig";

export type SeoSyncStatus = "RUNNING" | "SUCCEEDED" | "PARTIAL" | "FAILED";
export type SeoSyncTrigger = "MANUAL" | "SCHEDULED";

/**
 * Log + overlap lock for provider synchronisation jobs.
 * `lockKey` is only set while RUNNING; a partial unique index guarantees that
 * at most one run per provider is in flight, even across serverless instances.
 */
export interface ISeoSyncRun extends Document {
  _id: Types.ObjectId;
  provider: SeoProvider;
  trigger: SeoSyncTrigger;
  status: SeoSyncStatus;
  lockKey?: string;
  requestedBy?: string;
  rangeStart: string; // YYYY-MM-DD (inclusive)
  rangeEnd: string; // YYYY-MM-DD (inclusive)
  dailyRowsUpserted: number;
  queryPageRowsUpserted: number;
  /** True when the provider/our cap returned fewer query rows than exist. */
  queryDataTruncated: boolean;
  attempts: number;
  errorCode?: string;
  errorMessage?: string;
  startedAt: Date;
  finishedAt?: Date;
}

const SeoSyncRunSchema = new Schema<ISeoSyncRun>(
  {
    provider: { type: String, enum: ["GSC"], required: true },
    trigger: { type: String, enum: ["MANUAL", "SCHEDULED"], required: true },
    status: {
      type: String,
      enum: ["RUNNING", "SUCCEEDED", "PARTIAL", "FAILED"],
      required: true,
    },
    lockKey: { type: String },
    requestedBy: { type: String, maxlength: 100 },
    rangeStart: { type: String, required: true },
    rangeEnd: { type: String, required: true },
    dailyRowsUpserted: { type: Number, default: 0 },
    queryPageRowsUpserted: { type: Number, default: 0 },
    queryDataTruncated: { type: Boolean, default: false },
    attempts: { type: Number, default: 0 },
    errorCode: { type: String, maxlength: 80 },
    errorMessage: { type: String, maxlength: 500 },
    startedAt: { type: Date, required: true, default: () => new Date() },
    finishedAt: Date,
  },
  { collection: "seo_sync_runs" }
);

SeoSyncRunSchema.index({ provider: 1, startedAt: -1 });
// Overlap prevention: only RUNNING docs carry a lockKey.
SeoSyncRunSchema.index(
  { lockKey: 1 },
  { unique: true, partialFilterExpression: { lockKey: { $type: "string" } } }
);
// Retention: 180 days.
SeoSyncRunSchema.index({ startedAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 180 });

export const SeoSyncRun: Model<ISeoSyncRun> =
  (mongoose.models.SeoSyncRun as Model<ISeoSyncRun>) ||
  mongoose.model<ISeoSyncRun>("SeoSyncRun", SeoSyncRunSchema);

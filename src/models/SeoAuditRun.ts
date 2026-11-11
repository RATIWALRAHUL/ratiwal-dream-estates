import mongoose, { Schema, Document, Model, Types } from "mongoose";

export type SeoAuditStatus = "RUNNING" | "SUCCEEDED" | "PARTIAL" | "FAILED";

/** One technical scan. `lockKey` (RUNNING only) + partial unique index = no overlapping scans. */
export interface ISeoAuditRun extends Document {
  _id: Types.ObjectId;
  kind: "TECHNICAL";
  trigger: "MANUAL" | "SCHEDULED";
  status: SeoAuditStatus;
  lockKey?: string;
  requestedBy?: string;
  baseUrl: string;
  urlsPlanned: number;
  urlsChecked: number;
  requests: number;
  /** Only a completed scan may mark earlier issues as resolved. */
  completed: boolean;
  stoppedReason?: string;
  newCount: number;
  ongoingCount: number;
  resolvedCount: number;
  openBySeverity: { HIGH: number; MEDIUM: number; LOW: number };
  errorMessage?: string;
  startedAt: Date;
  finishedAt?: Date;
}

const SeoAuditRunSchema = new Schema<ISeoAuditRun>(
  {
    kind: { type: String, enum: ["TECHNICAL"], required: true },
    trigger: { type: String, enum: ["MANUAL", "SCHEDULED"], required: true },
    status: { type: String, enum: ["RUNNING", "SUCCEEDED", "PARTIAL", "FAILED"], required: true },
    lockKey: String,
    requestedBy: { type: String, maxlength: 100 },
    baseUrl: { type: String, required: true, maxlength: 200 },
    urlsPlanned: { type: Number, default: 0 },
    urlsChecked: { type: Number, default: 0 },
    requests: { type: Number, default: 0 },
    completed: { type: Boolean, default: false },
    stoppedReason: { type: String, maxlength: 40 },
    newCount: { type: Number, default: 0 },
    ongoingCount: { type: Number, default: 0 },
    resolvedCount: { type: Number, default: 0 },
    openBySeverity: {
      HIGH: { type: Number, default: 0 },
      MEDIUM: { type: Number, default: 0 },
      LOW: { type: Number, default: 0 },
    },
    errorMessage: { type: String, maxlength: 500 },
    startedAt: { type: Date, required: true, default: () => new Date() },
    finishedAt: Date,
  },
  { collection: "seo_audit_runs" }
);

SeoAuditRunSchema.index({ kind: 1, startedAt: -1 });
SeoAuditRunSchema.index({ lockKey: 1 }, { unique: true, partialFilterExpression: { lockKey: { $type: "string" } } });
SeoAuditRunSchema.index({ startedAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 365 });

export const SeoAuditRun: Model<ISeoAuditRun> =
  (mongoose.models.SeoAuditRun as Model<ISeoAuditRun>) ||
  mongoose.model<ISeoAuditRun>("SeoAuditRun", SeoAuditRunSchema);

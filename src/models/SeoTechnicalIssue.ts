import mongoose, { Schema, Document, Model, Types } from "mongoose";

/**
 * A technical SEO finding with history. Identity is `issueKey` (type + path + detail).
 * - NEW:      firstRunId === lastRunId and status OPEN
 * - ONGOING:  status OPEN seen in an earlier run too
 * - RESOLVED: was open, absent from a later COMPLETED scan
 * A resolved issue that reappears is re-opened as NEW (firstRunId reset).
 */
export interface ISeoTechnicalIssue extends Document {
  _id: Types.ObjectId;
  issueKey: string;
  type: string;
  severity: "HIGH" | "MEDIUM" | "LOW";
  url: string;
  message: string;
  status: "OPEN" | "RESOLVED";
  firstSeenAt: Date;
  firstRunId: Types.ObjectId;
  lastSeenAt: Date;
  lastRunId: Types.ObjectId;
  /** Number of distinct runs that observed it (while open). */
  timesSeen: number;
  resolvedAt?: Date;
  resolvedRunId?: Types.ObjectId;
}

const SeoTechnicalIssueSchema = new Schema<ISeoTechnicalIssue>(
  {
    issueKey: { type: String, required: true, maxlength: 700 },
    type: { type: String, required: true, maxlength: 60 },
    severity: { type: String, enum: ["HIGH", "MEDIUM", "LOW"], required: true },
    url: { type: String, required: true, maxlength: 700 },
    message: { type: String, required: true, maxlength: 600 },
    status: { type: String, enum: ["OPEN", "RESOLVED"], required: true },
    firstSeenAt: { type: Date, required: true },
    firstRunId: { type: Schema.Types.ObjectId, required: true },
    lastSeenAt: { type: Date, required: true },
    lastRunId: { type: Schema.Types.ObjectId, required: true },
    timesSeen: { type: Number, default: 1 },
    resolvedAt: Date,
    resolvedRunId: Schema.Types.ObjectId,
  },
  { collection: "seo_technical_issues" }
);

SeoTechnicalIssueSchema.index({ issueKey: 1 }, { unique: true });
SeoTechnicalIssueSchema.index({ status: 1, severity: 1 });
SeoTechnicalIssueSchema.index({ status: 1, type: 1 });
SeoTechnicalIssueSchema.index({ lastRunId: 1 });
// Resolved issues are kept 12 months; open issues have no resolvedAt so are never expired.
SeoTechnicalIssueSchema.index({ resolvedAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 365 });

export const SeoTechnicalIssue: Model<ISeoTechnicalIssue> =
  (mongoose.models.SeoTechnicalIssue as Model<ISeoTechnicalIssue>) ||
  mongoose.model<ISeoTechnicalIssue>("SeoTechnicalIssue", SeoTechnicalIssueSchema);

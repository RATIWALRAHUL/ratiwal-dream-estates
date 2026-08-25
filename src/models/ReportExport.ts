import mongoose, { Schema, Document, Model, Types } from "mongoose";
import type { ReportType } from "@/types/analytics";

export type ReportExportStatus = "QUEUED" | "PROCESSING" | "COMPLETED" | "FAILED" | "EXPIRED";

export interface IReportExport extends Document {
  _id: Types.ObjectId;
  requestedBy: string; // admin user ID
  requestedByName: string;
  requestedByEmail: string;
  reportType: ReportType;
  sanitizedFilterSnapshot: Record<string, unknown>;
  allowedColumnKeys: string[];
  status: ReportExportStatus;
  rowCount: number;
  fileSizeBytes?: number;
  fileName?: string;
  safeFailureCode?: string;
  requestedAt: Date;
  completedAt?: Date;
  expiresAt: Date; // TTL for automatic cleanup
  downloadCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const ReportExportSchema = new Schema<IReportExport>(
  {
    requestedBy: {
      type: String,
      required: true,
      index: true,
    },
    requestedByName: {
      type: String,
      required: true,
    },
    requestedByEmail: {
      type: String,
      required: true,
    },
    reportType: {
      type: String,
      required: true,
      index: true,
    },
    sanitizedFilterSnapshot: {
      type: Schema.Types.Mixed,
      default: {},
    },
    allowedColumnKeys: {
      type: [String],
      required: true,
    },
    status: {
      type: String,
      enum: ["QUEUED", "PROCESSING", "COMPLETED", "FAILED", "EXPIRED"],
      default: "QUEUED",
      index: true,
    },
    rowCount: {
      type: Number,
      default: 0,
    },
    fileSizeBytes: {
      type: Number,
      default: null,
    },
    fileName: {
      type: String,
      default: null,
    },
    safeFailureCode: {
      type: String,
      default: null,
    },
    requestedAt: {
      type: Date,
      default: Date.now,
    },
    completedAt: {
      type: Date,
      default: null,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: true,
    },
    downloadCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// TTL index for automatic expiration of historical export logs after expiry date
ReportExportSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const ReportExport: Model<IReportExport> =
  mongoose.models.ReportExport ||
  mongoose.model<IReportExport>("ReportExport", ReportExportSchema);

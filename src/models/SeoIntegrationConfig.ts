import mongoose, { Schema, Document, Model, Types } from "mongoose";

/**
 * Connection status for one external SEO data provider. Holds NO secrets:
 * credentials live only in server environment variables.
 */
export type SeoProvider = "GSC";
export type SeoIntegrationStatus = "NOT_CONFIGURED" | "CONNECTED" | "ERROR";

export interface ISeoIntegrationConfig extends Document {
  _id: Types.ObjectId;
  provider: SeoProvider;
  propertyId?: string; // e.g. sc-domain:example.com (not secret)
  status: SeoIntegrationStatus;
  /** Set only after a real authenticated API request has succeeded. */
  lastVerifiedAt?: Date;
  lastSuccessfulSyncAt?: Date;
  /** Latest date (YYYY-MM-DD) for which data has been stored. */
  dataThroughDate?: string;
  lastErrorCode?: string;
  lastErrorMessage?: string;
  createdAt: Date;
  updatedAt: Date;
}

const SeoIntegrationConfigSchema = new Schema<ISeoIntegrationConfig>(
  {
    provider: { type: String, enum: ["GSC"], required: true },
    propertyId: { type: String, trim: true, maxlength: 300 },
    status: {
      type: String,
      enum: ["NOT_CONFIGURED", "CONNECTED", "ERROR"],
      default: "NOT_CONFIGURED",
    },
    lastVerifiedAt: Date,
    lastSuccessfulSyncAt: Date,
    dataThroughDate: { type: String, match: /^\d{4}-\d{2}-\d{2}$/ },
    lastErrorCode: { type: String, maxlength: 80 },
    lastErrorMessage: { type: String, maxlength: 500 },
  },
  { timestamps: true, collection: "seo_integration_configs" }
);

SeoIntegrationConfigSchema.index({ provider: 1 }, { unique: true });

export const SeoIntegrationConfig: Model<ISeoIntegrationConfig> =
  (mongoose.models.SeoIntegrationConfig as Model<ISeoIntegrationConfig>) ||
  mongoose.model<ISeoIntegrationConfig>("SeoIntegrationConfig", SeoIntegrationConfigSchema);

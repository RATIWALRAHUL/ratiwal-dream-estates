import mongoose, { Schema, Document, Model, Types } from "mongoose";

/**
 * Site-level Google Search Console totals per day / device / country.
 * These come from a query WITHOUT the `query` dimension, so they include
 * anonymised low-volume queries and are the authoritative site totals.
 */
export interface ISeoSearchDaily extends Document {
  _id: Types.ObjectId;
  date: string; // YYYY-MM-DD (Pacific Time, as reported by GSC)
  device: string; // DESKTOP | MOBILE | TABLET
  country: string; // ISO-3166 alpha-3, lower-case as returned by GSC
  clicks: number;
  impressions: number;
  /** Average position reported by GSC for the row (1 = top). Not a fixed rank. */
  position: number;
  syncedAt: Date;
}

const SeoSearchDailySchema = new Schema<ISeoSearchDaily>(
  {
    date: { type: String, required: true, match: /^\d{4}-\d{2}-\d{2}$/ },
    device: { type: String, required: true, maxlength: 20 },
    country: { type: String, required: true, maxlength: 10 },
    clicks: { type: Number, required: true, min: 0 },
    impressions: { type: Number, required: true, min: 0 },
    position: { type: Number, required: true, min: 0 },
    syncedAt: { type: Date, required: true },
  },
  { collection: "seo_search_daily" }
);

SeoSearchDailySchema.index({ date: 1, device: 1, country: 1 }, { unique: true });
// Retention: ~16 months (matches Search Console's own window).
SeoSearchDailySchema.index({ syncedAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 500 });

export const SeoSearchDaily: Model<ISeoSearchDaily> =
  (mongoose.models.SeoSearchDaily as Model<ISeoSearchDaily>) ||
  mongoose.model<ISeoSearchDaily>("SeoSearchDaily", SeoSearchDailySchema);

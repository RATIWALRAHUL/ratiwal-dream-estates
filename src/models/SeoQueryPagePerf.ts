import mongoose, { Schema, Document, Model, Types } from "mongoose";

/**
 * Top-N (query, landing page) rows per day from Google Search Console.
 * Bounded per day (see MAX_QUERY_ROWS_PER_DAY) and INCOMPLETE by nature:
 * GSC omits anonymised queries, so these rows never sum to the site totals
 * in `seo_search_daily`. The UI must say so.
 */
export interface ISeoQueryPagePerf extends Document {
  _id: Types.ObjectId;
  date: string;
  query: string;
  page: string; // full URL as reported by GSC
  pagePath: string; // normalised path, "/" for home
  pageCategory: string;
  clicks: number;
  impressions: number;
  position: number;
  syncedAt: Date;
}

const SeoQueryPagePerfSchema = new Schema<ISeoQueryPagePerf>(
  {
    date: { type: String, required: true, match: /^\d{4}-\d{2}-\d{2}$/ },
    query: { type: String, required: true, maxlength: 300 },
    page: { type: String, required: true, maxlength: 600 },
    pagePath: { type: String, required: true, maxlength: 500 },
    pageCategory: { type: String, required: true, maxlength: 40 },
    clicks: { type: Number, required: true, min: 0 },
    impressions: { type: Number, required: true, min: 0 },
    position: { type: Number, required: true, min: 0 },
    syncedAt: { type: Date, required: true },
  },
  { collection: "seo_query_page_perf" }
);

SeoQueryPagePerfSchema.index({ date: 1, query: 1, page: 1 }, { unique: true });
SeoQueryPagePerfSchema.index({ date: 1, clicks: -1 });
SeoQueryPagePerfSchema.index({ pagePath: 1, date: 1 });
SeoQueryPagePerfSchema.index({ query: 1, date: 1 });
SeoQueryPagePerfSchema.index({ pageCategory: 1, date: 1 });
SeoQueryPagePerfSchema.index({ syncedAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 500 });

export const SeoQueryPagePerf: Model<ISeoQueryPagePerf> =
  (mongoose.models.SeoQueryPagePerf as Model<ISeoQueryPagePerf>) ||
  mongoose.model<ISeoQueryPagePerf>("SeoQueryPagePerf", SeoQueryPagePerfSchema);

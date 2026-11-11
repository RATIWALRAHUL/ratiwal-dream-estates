import type { PageCategory, SearchIntent } from "@/lib/seo-analytics/classify";
import type { OpportunityKey } from "@/lib/seo-analytics/opportunities";
import type { DateWindow, SeoRangePreset } from "@/lib/seo-analytics/dates";
import type { Totals } from "@/lib/seo-analytics/metrics";

export interface SeoRangeInfo {
  preset: SeoRangePreset;
  label: string;
  current: DateWindow;
  previous: DateWindow;
}

export interface IntegrationStatusView {
  provider: "GSC";
  /** NOT_CONFIGURED until env present; CONNECTED only after a real authenticated request. */
  status: "NOT_CONFIGURED" | "CONNECTED" | "ERROR";
  envConfigured: boolean;
  propertyId: string | null;
  lastVerifiedAt: string | null;
  lastSuccessfulSyncAt: string | null;
  dataThroughDate: string | null;
  lastErrorCode: string | null;
  lastErrorMessage: string | null;
  storedDays: number;
  recentRuns: Array<{
    id: string;
    status: string;
    trigger: string;
    rangeStart: string;
    rangeEnd: string;
    dailyRowsUpserted: number;
    queryPageRowsUpserted: number;
    queryDataTruncated: boolean;
    errorCode: string | null;
    startedAt: string;
    finishedAt: string | null;
  }>;
}

export interface TrendPoint {
  date: string;
  clicks: number;
  impressions: number;
  ctr: number | null;
  position: number | null;
}

export interface BreakdownRow {
  key: string;
  clicks: number;
  impressions: number;
  previousClicks: number;
  previousImpressions: number;
}

export interface OverviewData {
  hasData: boolean;
  range: SeoRangeInfo;
  current: Totals;
  previous: Totals;
  /** Days that actually have stored rows (days without rows may be zero-impression OR not yet synced). */
  daysWithData: { current: number; previous: number };
  trend: TrendPoint[];
  devices: BreakdownRow[];
  countries: BreakdownRow[];
  topQueries: Array<{ query: string; clicks: number; impressions: number }>;
  topPages: Array<{ path: string; category: PageCategory; clicks: number; impressions: number }>;
}

export interface KeywordRow {
  query: string;
  intent: SearchIntent;
  clicks: number;
  impressions: number;
  ctr: number | null;
  position: number | null;
  prevClicks: number;
  prevImpressions: number;
  prevPosition: number | null;
  clicksChange: number;
  topPagePath: string | null;
  topPageCategory: PageCategory | null;
  pageCount: number;
  opportunities: OpportunityKey[];
}

export interface KeywordsParams {
  preset?: string;
  from?: string;
  to?: string;
  q?: string;
  intent?: string;
  opportunity?: string;
  sort?: string;
  dir?: string;
  page?: number;
  pageSize?: number;
}

export interface KeywordsResult {
  range: SeoRangeInfo;
  rows: KeywordRow[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  /** True when more distinct queries exist than the analysis cap. */
  cappedAtAnalysisLimit: boolean;
  opportunityCounts: Record<OpportunityKey, number>;
}

export interface PageRow {
  path: string;
  category: PageCategory;
  clicks: number;
  impressions: number;
  ctr: number | null;
  position: number | null;
  prevClicks: number;
  prevImpressions: number;
  prevPosition: number | null;
  clicksChange: number;
  queryCount: number;
  topQuery: string | null;
}

export interface PagesParams {
  preset?: string;
  from?: string;
  to?: string;
  q?: string;
  category?: string;
  sort?: string;
  dir?: string;
  page?: number;
  pageSize?: number;
}

export interface PagesResult {
  range: SeoRangeInfo;
  rows: PageRow[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  categories: Array<{
    category: PageCategory;
    pages: number;
    clicks: number;
    impressions: number;
    prevClicks: number;
  }>;
}

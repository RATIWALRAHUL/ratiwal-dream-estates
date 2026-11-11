import "server-only";
import type { PipelineStage } from "mongoose";
import { connectToDatabase } from "@/lib/db/mongoose";
import { fastCache } from "@/lib/cache/data-cache";
import { SeoIntegrationConfig } from "@/models/SeoIntegrationConfig";
import { SeoSyncRun } from "@/models/SeoSyncRun";
import { SeoSearchDaily } from "@/models/SeoSearchDaily";
import { SeoQueryPagePerf } from "@/models/SeoQueryPagePerf";
import { isGscConfigured, getGscProperty } from "@/lib/seo-analytics/gsc-client";
import {
  latestReliableDate,
  resolveRange,
  type RangeInput,
} from "@/lib/seo-analytics/dates";
import {
  PAGE_CATEGORIES,
  SEARCH_INTENTS,
  classifySearchIntent,
  type PageCategory,
} from "@/lib/seo-analytics/classify";
import {
  emptyAccumulator,
  finalizeTotals,
  type Accumulator,
} from "@/lib/seo-analytics/metrics";
import {
  OPPORTUNITY_KEYS,
  computeOpportunities,
  type OpportunityKey,
} from "@/lib/seo-analytics/opportunities";
import type {
  BreakdownRow,
  IntegrationStatusView,
  KeywordRow,
  KeywordsParams,
  KeywordsResult,
  OverviewData,
  PageRow,
  PagesParams,
  PagesResult,
  SeoRangeInfo,
  TrendPoint,
} from "@/types/seo-analytics";

const CACHE_TTL_MS = 5 * 60 * 1000;
const CACHE_SWR_MS = 10 * 60 * 1000;
/** Max distinct queries/pages analysed per request window (memory + latency bound). */
export const ANALYSIS_ROW_CAP = 20_000;
export const EXPORT_ROW_CAP = 5_000;
export const MAX_PAGE_SIZE = 100;

const iso = (d?: Date | null) => (d ? d.toISOString() : null);

async function resolveFor(input: RangeInput): Promise<SeoRangeInfo> {
  await connectToDatabase();
  const cfg = await SeoIntegrationConfig.findOne({ provider: "GSC" }, { dataThroughDate: 1 }).lean();
  const reliable = latestReliableDate();
  // Never go past what Google has finalised, nor past what we have stored if we have stored anything.
  const latest = cfg?.dataThroughDate && cfg.dataThroughDate < reliable ? cfg.dataThroughDate : reliable;
  return resolveRange(input, input.preset === "custom" ? reliable : latest);
}

// Sum helpers for Mongo $group stages.
const posWeighted = { $sum: { $multiply: ["$position", "$impressions"] } };

function acc(clicks: number, impressions: number, pw: number): Accumulator {
  return { clicks, impressions, positionWeighted: pw };
}

export class SeoGscQueryService {
  static async getIntegrationStatus(): Promise<IntegrationStatusView> {
    await connectToDatabase();
    const [cfg, runs, storedDays] = await Promise.all([
      SeoIntegrationConfig.findOne({ provider: "GSC" }).lean(),
      SeoSyncRun.find({ provider: "GSC" }).sort({ startedAt: -1 }).limit(5).lean(),
      SeoSearchDaily.distinct("date").then((d) => d.length),
    ]);
    const envConfigured = isGscConfigured();
    return {
      provider: "GSC",
      // Config presence alone never implies "connected": CONNECTED is only ever written after a successful API call.
      status: !envConfigured ? "NOT_CONFIGURED" : (cfg?.status ?? "NOT_CONFIGURED"),
      envConfigured,
      propertyId: getGscProperty(),
      lastVerifiedAt: iso(cfg?.lastVerifiedAt),
      lastSuccessfulSyncAt: iso(cfg?.lastSuccessfulSyncAt),
      dataThroughDate: cfg?.dataThroughDate ?? null,
      lastErrorCode: cfg?.lastErrorCode ?? null,
      lastErrorMessage: cfg?.lastErrorMessage ?? null,
      storedDays,
      recentRuns: runs.map((r) => ({
        id: String(r._id),
        status: r.status,
        trigger: r.trigger,
        rangeStart: r.rangeStart,
        rangeEnd: r.rangeEnd,
        dailyRowsUpserted: r.dailyRowsUpserted,
        queryPageRowsUpserted: r.queryPageRowsUpserted,
        queryDataTruncated: r.queryDataTruncated,
        errorCode: r.errorCode ?? null,
        startedAt: r.startedAt.toISOString(),
        finishedAt: iso(r.finishedAt),
      })),
    };
  }

  // ─── Overview ──────────────────────────────────────────────────────────────

  static async getOverview(input: RangeInput): Promise<OverviewData> {
    const range = await resolveFor(input);
    const key = `seo:overview:${range.current.start}:${range.current.end}`;
    return fastCache.getOrSet(key, () => SeoGscQueryService.computeOverview(range), {
      ttlMs: CACHE_TTL_MS,
      swrMs: CACHE_SWR_MS,
    });
  }

  private static async computeOverview(range: SeoRangeInfo): Promise<OverviewData> {
    const { current: cur, previous: prev } = range;
    const inRange = { date: { $gte: prev.start, $lte: cur.end } };
    const isCur = { $gte: ["$date", cur.start] };

    const [totalsRows, trendRows, deviceRows, countryRows, topQ, topP] = await Promise.all([
      // Totals for both windows in one pass.
      SeoSearchDaily.aggregate([
        { $match: inRange },
        {
          $group: {
            _id: null,
            cClicks: { $sum: { $cond: [isCur, "$clicks", 0] } },
            cImpr: { $sum: { $cond: [isCur, "$impressions", 0] } },
            cPw: { $sum: { $cond: [isCur, { $multiply: ["$position", "$impressions"] }, 0] } },
            pClicks: { $sum: { $cond: [isCur, 0, "$clicks"] } },
            pImpr: { $sum: { $cond: [isCur, 0, "$impressions"] } },
            pPw: { $sum: { $cond: [isCur, 0, { $multiply: ["$position", "$impressions"] }] } },
            cDays: { $addToSet: { $cond: [isCur, "$date", null] } },
            pDays: { $addToSet: { $cond: [isCur, null, "$date"] } },
          },
        },
      ]),
      SeoSearchDaily.aggregate([
        { $match: { date: { $gte: cur.start, $lte: cur.end } } },
        { $group: { _id: "$date", clicks: { $sum: "$clicks" }, impressions: { $sum: "$impressions" }, pw: posWeighted } },
        { $sort: { _id: 1 } },
      ]),
      SeoSearchDaily.aggregate(breakdownPipeline(prev.start, cur.start, cur.end, "$device", 10)),
      SeoSearchDaily.aggregate(breakdownPipeline(prev.start, cur.start, cur.end, "$country", 10)),
      SeoQueryPagePerf.aggregate([
        { $match: { date: { $gte: cur.start, $lte: cur.end } } },
        { $group: { _id: "$query", clicks: { $sum: "$clicks" }, impressions: { $sum: "$impressions" } } },
        { $sort: { clicks: -1, impressions: -1 } },
        { $limit: 10 },
      ]),
      SeoQueryPagePerf.aggregate([
        { $match: { date: { $gte: cur.start, $lte: cur.end } } },
        {
          $group: {
            _id: "$pagePath",
            category: { $first: "$pageCategory" },
            clicks: { $sum: "$clicks" },
            impressions: { $sum: "$impressions" },
          },
        },
        { $sort: { clicks: -1, impressions: -1 } },
        { $limit: 10 },
      ]),
    ]);

    const t = totalsRows[0];
    const current = t ? finalizeTotals(acc(t.cClicks, t.cImpr, t.cPw)) : finalizeTotals(emptyAccumulator());
    const previous = t ? finalizeTotals(acc(t.pClicks, t.pImpr, t.pPw)) : finalizeTotals(emptyAccumulator());

    const trend: TrendPoint[] = trendRows.map((r) => ({
      date: r._id as string,
      clicks: r.clicks,
      impressions: r.impressions,
      ctr: r.impressions > 0 ? r.clicks / r.impressions : null,
      position: r.impressions > 0 ? r.pw / r.impressions : null,
    }));

    return {
      hasData: trendRows.length > 0 || current.impressions > 0,
      range,
      current,
      previous,
      daysWithData: {
        current: ((t?.cDays ?? []) as Array<string | null>).filter(Boolean).length,
        previous: ((t?.pDays ?? []) as Array<string | null>).filter(Boolean).length,
      },
      trend,
      devices: deviceRows.map(toBreakdown),
      countries: countryRows.map(toBreakdown),
      topQueries: topQ.map((r) => ({ query: r._id as string, clicks: r.clicks, impressions: r.impressions })),
      topPages: topP.map((r) => ({
        path: r._id as string,
        category: r.category as PageCategory,
        clicks: r.clicks,
        impressions: r.impressions,
      })),
    };
  }

  // ─── Keywords ──────────────────────────────────────────────────────────────

  private static async loadKeywordSet(range: SeoRangeInfo): Promise<{ rows: KeywordRow[]; capped: boolean }> {
    const key = `seo:keywords:${range.current.start}:${range.current.end}`;
    return fastCache.getOrSet(key, () => SeoGscQueryService.computeKeywordSet(range), {
      ttlMs: CACHE_TTL_MS,
      swrMs: CACHE_SWR_MS,
    });
  }

  private static async computeKeywordSet(range: SeoRangeInfo): Promise<{ rows: KeywordRow[]; capped: boolean }> {
    const { current: cur, previous: prev } = range;
    const isCur = { $gte: ["$date", cur.start] };
    const raw = await SeoQueryPagePerf.aggregate([
      { $match: { date: { $gte: prev.start, $lte: cur.end } } },
      {
        $group: {
          _id: { q: "$query", p: "$pagePath" },
          cat: { $first: "$pageCategory" },
          cClicks: { $sum: { $cond: [isCur, "$clicks", 0] } },
          cImpr: { $sum: { $cond: [isCur, "$impressions", 0] } },
          cPw: { $sum: { $cond: [isCur, { $multiply: ["$position", "$impressions"] }, 0] } },
          pClicks: { $sum: { $cond: [isCur, 0, "$clicks"] } },
          pImpr: { $sum: { $cond: [isCur, 0, "$impressions"] } },
          pPw: { $sum: { $cond: [isCur, 0, { $multiply: ["$position", "$impressions"] }] } },
        },
      },
      { $sort: { cClicks: -1, cImpr: -1 } },
      {
        $group: {
          _id: "$_id.q",
          cClicks: { $sum: "$cClicks" },
          cImpr: { $sum: "$cImpr" },
          cPw: { $sum: "$cPw" },
          pClicks: { $sum: "$pClicks" },
          pImpr: { $sum: "$pImpr" },
          pPw: { $sum: "$pPw" },
          pages: { $push: { path: "$_id.p", cat: "$cat", clicks: "$cClicks", impr: "$cImpr" } },
        },
      },
      { $sort: { cImpr: -1, pImpr: -1 } },
      { $limit: ANALYSIS_ROW_CAP + 1 },
    ]);

    const capped = raw.length > ANALYSIS_ROW_CAP;
    const rows: KeywordRow[] = raw.slice(0, ANALYSIS_ROW_CAP).map((r) => {
      const c = finalizeTotals(acc(r.cClicks, r.cImpr, r.cPw));
      const p = finalizeTotals(acc(r.pClicks, r.pImpr, r.pPw));
      const livePages = (r.pages as Array<{ path: string; cat: PageCategory; clicks: number; impr: number }>).filter(
        (x) => x.impr > 0 || x.clicks > 0
      );
      const top = livePages[0];
      const intent = classifySearchIntent(r._id as string);
      const topCategory = (top?.cat ?? null) as PageCategory | null;
      return {
        query: r._id as string,
        intent,
        clicks: c.clicks,
        impressions: c.impressions,
        ctr: c.ctr,
        position: c.position,
        prevClicks: p.clicks,
        prevImpressions: p.impressions,
        prevPosition: p.position,
        clicksChange: c.clicks - p.clicks,
        topPagePath: top?.path ?? null,
        topPageCategory: topCategory,
        pageCount: livePages.length,
        opportunities: computeOpportunities({
          clicks: c.clicks,
          impressions: c.impressions,
          ctr: c.ctr,
          position: c.position,
          prev: p.impressions > 0 || p.clicks > 0 ? { clicks: p.clicks, impressions: p.impressions, position: p.position } : null,
          intent,
          topPageCategory: topCategory ?? "OTHER",
          pageImpressions: livePages.map((x) => x.impr).sort((a, b) => b - a),
        }),
      };
    });
    return { rows, capped };
  }

  private static filterKeywords(rows: KeywordRow[], params: KeywordsParams): KeywordRow[] {
    const q = (params.q ?? "").trim().toLowerCase().slice(0, 100);
    const intent = SEARCH_INTENTS.find((i) => i === params.intent);
    const opp = OPPORTUNITY_KEYS.find((o) => o === params.opportunity);
    let out = rows;
    if (q) out = out.filter((r) => r.query.toLowerCase().includes(q));
    if (intent) out = out.filter((r) => r.intent === intent);
    if (opp) out = out.filter((r) => r.opportunities.includes(opp));
    const dir = params.dir === "asc" ? 1 : -1;
    const sort = params.sort ?? "clicks";
    const val = (r: KeywordRow): number | string => {
      switch (sort) {
        case "impressions": return r.impressions;
        case "ctr": return r.ctr ?? -1;
        case "position": return r.position ?? Number.POSITIVE_INFINITY;
        case "change": return r.clicksChange;
        case "query": return r.query;
        default: return r.clicks;
      }
    };
    return [...out].sort((a, b) => {
      const x = val(a), y = val(b);
      if (typeof x === "string" && typeof y === "string") return dir * x.localeCompare(y);
      return dir * ((x as number) - (y as number)) || b.impressions - a.impressions;
    });
  }

  static async getKeywords(params: KeywordsParams): Promise<KeywordsResult> {
    const range = await resolveFor(params);
    const { rows: all, capped } = await this.loadKeywordSet(range);
    const filtered = this.filterKeywords(all, params);
    const pageSize = Math.min(Math.max(params.pageSize ?? 25, 1), MAX_PAGE_SIZE);
    const totalPages = Math.max(Math.ceil(filtered.length / pageSize), 1);
    const page = Math.min(Math.max(params.page ?? 1, 1), totalPages);
    const opportunityCounts = Object.fromEntries(OPPORTUNITY_KEYS.map((k) => [k, 0])) as Record<OpportunityKey, number>;
    for (const r of all) for (const o of r.opportunities) opportunityCounts[o]++;
    return {
      range,
      rows: filtered.slice((page - 1) * pageSize, page * pageSize),
      total: filtered.length,
      page,
      pageSize,
      totalPages,
      cappedAtAnalysisLimit: capped,
      opportunityCounts,
    };
  }

  static async getKeywordsForExport(params: KeywordsParams): Promise<{ range: SeoRangeInfo; rows: KeywordRow[]; truncated: boolean }> {
    const range = await resolveFor(params);
    const { rows: all } = await this.loadKeywordSet(range);
    const filtered = this.filterKeywords(all, params);
    return { range, rows: filtered.slice(0, EXPORT_ROW_CAP), truncated: filtered.length > EXPORT_ROW_CAP };
  }

  // ─── Pages ─────────────────────────────────────────────────────────────────

  private static async loadPageSet(range: SeoRangeInfo): Promise<PageRow[]> {
    const key = `seo:pages:${range.current.start}:${range.current.end}`;
    return fastCache.getOrSet(key, () => SeoGscQueryService.computePageSet(range), {
      ttlMs: CACHE_TTL_MS,
      swrMs: CACHE_SWR_MS,
    });
  }

  private static async computePageSet(range: SeoRangeInfo): Promise<PageRow[]> {
    const { current: cur, previous: prev } = range;
    const isCur = { $gte: ["$date", cur.start] };
    const raw = await SeoQueryPagePerf.aggregate([
      { $match: { date: { $gte: prev.start, $lte: cur.end } } },
      {
        $group: {
          _id: { p: "$pagePath", q: "$query" },
          cat: { $first: "$pageCategory" },
          cClicks: { $sum: { $cond: [isCur, "$clicks", 0] } },
          cImpr: { $sum: { $cond: [isCur, "$impressions", 0] } },
          cPw: { $sum: { $cond: [isCur, { $multiply: ["$position", "$impressions"] }, 0] } },
          pClicks: { $sum: { $cond: [isCur, 0, "$clicks"] } },
          pImpr: { $sum: { $cond: [isCur, 0, "$impressions"] } },
          pPw: { $sum: { $cond: [isCur, 0, { $multiply: ["$position", "$impressions"] }] } },
        },
      },
      { $sort: { cClicks: -1, cImpr: -1 } },
      {
        $group: {
          _id: "$_id.p",
          cat: { $first: "$cat" },
          cClicks: { $sum: "$cClicks" },
          cImpr: { $sum: "$cImpr" },
          cPw: { $sum: "$cPw" },
          pClicks: { $sum: "$pClicks" },
          pImpr: { $sum: "$pImpr" },
          pPw: { $sum: "$pPw" },
          queryCount: { $sum: { $cond: [{ $gt: ["$cImpr", 0] }, 1, 0] } },
          topQuery: { $first: "$_id.q" },
        },
      },
      { $sort: { cClicks: -1, cImpr: -1 } },
      { $limit: ANALYSIS_ROW_CAP },
    ]);
    return raw.map((r) => {
      const c = finalizeTotals(acc(r.cClicks, r.cImpr, r.cPw));
      const p = finalizeTotals(acc(r.pClicks, r.pImpr, r.pPw));
      return {
        path: r._id as string,
        category: r.cat as PageCategory,
        clicks: c.clicks,
        impressions: c.impressions,
        ctr: c.ctr,
        position: c.position,
        prevClicks: p.clicks,
        prevImpressions: p.impressions,
        prevPosition: p.position,
        clicksChange: c.clicks - p.clicks,
        queryCount: r.queryCount,
        topQuery: r.cClicks > 0 || r.cImpr > 0 ? (r.topQuery as string) : null,
      };
    });
  }

  static async getPages(params: PagesParams): Promise<PagesResult> {
    const range = await resolveFor(params);
    const all = await this.loadPageSet(range);

    const catMap = new Map<PageCategory, PagesResult["categories"][number]>();
    for (const r of all) {
      const e = catMap.get(r.category) ?? { category: r.category, pages: 0, clicks: 0, impressions: 0, prevClicks: 0 };
      if (r.impressions > 0 || r.clicks > 0) e.pages++;
      e.clicks += r.clicks;
      e.impressions += r.impressions;
      e.prevClicks += r.prevClicks;
      catMap.set(r.category, e);
    }
    const categories = PAGE_CATEGORIES.filter((c) => catMap.has(c)).map((c) => catMap.get(c)!);

    const q = (params.q ?? "").trim().toLowerCase().slice(0, 100);
    const cat = PAGE_CATEGORIES.find((c) => c === params.category);
    let rows = all;
    if (q) rows = rows.filter((r) => r.path.toLowerCase().includes(q));
    if (cat) rows = rows.filter((r) => r.category === cat);

    const dir = params.dir === "asc" ? 1 : -1;
    const sort = params.sort ?? "clicks";
    const val = (r: PageRow): number | string => {
      switch (sort) {
        case "impressions": return r.impressions;
        case "ctr": return r.ctr ?? -1;
        case "position": return r.position ?? Number.POSITIVE_INFINITY;
        case "change": return r.clicksChange;
        case "path": return r.path;
        default: return r.clicks;
      }
    };
    rows = [...rows].sort((a, b) => {
      const x = val(a), y = val(b);
      if (typeof x === "string" && typeof y === "string") return dir * x.localeCompare(y);
      return dir * ((x as number) - (y as number)) || b.impressions - a.impressions;
    });

    const pageSize = Math.min(Math.max(params.pageSize ?? 25, 1), MAX_PAGE_SIZE);
    const totalPages = Math.max(Math.ceil(rows.length / pageSize), 1);
    const page = Math.min(Math.max(params.page ?? 1, 1), totalPages);
    return {
      range,
      rows: rows.slice((page - 1) * pageSize, page * pageSize),
      total: rows.length,
      page,
      pageSize,
      totalPages,
      categories,
    };
  }
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function breakdownPipeline(prevStart: string, curStart: string, curEnd: string, field: string, limit: number): PipelineStage[] {
  const isCur = { $gte: ["$date", curStart] };
  return [
    { $match: { date: { $gte: prevStart, $lte: curEnd } } },
    {
      $group: {
        _id: field,
        clicks: { $sum: { $cond: [isCur, "$clicks", 0] } },
        impressions: { $sum: { $cond: [isCur, "$impressions", 0] } },
        previousClicks: { $sum: { $cond: [isCur, 0, "$clicks"] } },
        previousImpressions: { $sum: { $cond: [isCur, 0, "$impressions"] } },
      },
    },
    { $match: { $or: [{ impressions: { $gt: 0 } }, { previousImpressions: { $gt: 0 } }] } },
    { $sort: { impressions: -1 } },
    { $limit: limit },
  ];
}

function toBreakdown(r: { _id: string; clicks: number; impressions: number; previousClicks: number; previousImpressions: number }): BreakdownRow {
  return {
    key: r._id,
    clicks: r.clicks,
    impressions: r.impressions,
    previousClicks: r.previousClicks,
    previousImpressions: r.previousImpressions,
  };
}

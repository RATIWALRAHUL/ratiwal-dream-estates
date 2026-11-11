import "server-only";
import { connectToDatabase } from "@/lib/db/mongoose";
import { ConflictError, ValidationError } from "@/lib/api/errors";
import { logger } from "@/lib/logger";
import { fastCache } from "@/lib/cache/data-cache";
import type { AdminUser } from "@/lib/auth/session";
import { SeoIntegrationConfig } from "@/models/SeoIntegrationConfig";
import { SeoSyncRun, type ISeoSyncRun, type SeoSyncTrigger } from "@/models/SeoSyncRun";
import { SeoSearchDaily } from "@/models/SeoSearchDaily";
import { SeoQueryPagePerf } from "@/models/SeoQueryPagePerf";
import { logAuditEvent } from "@/lib/services/audit.service";
import {
  GscError,
  getGscProperty,
  isGscConfigured,
  querySearchAnalytics,
  type GscRow,
} from "@/lib/seo-analytics/gsc-client";
import { addDays, latestReliableDate, toYmd } from "@/lib/seo-analytics/dates";
import { classifyPage, normalizePagePath } from "@/lib/seo-analytics/classify";

/** Query rows kept per day. GSC omits anonymised queries, so this is "top N", not "all". */
export const MAX_QUERY_ROWS_PER_DAY = 1000;
export const MAX_SYNC_DAYS = 90;
export const DEFAULT_SYNC_DAYS = 7;
const CHUNK_DAYS = 7;
const LOCK_KEY = "GSC";
const STALE_LOCK_MS = 15 * 60 * 1000;
/** Serverless budget guard: stop starting new chunks after this long. */
const TIME_BUDGET_MS = 40_000;
const BULK_BATCH = 1000;

export interface SyncOptions {
  days?: number;
  trigger: SeoSyncTrigger;
  actor?: AdminUser;
}

export interface SyncSummary {
  runId: string;
  status: ISeoSyncRun["status"];
  rangeStart: string;
  rangeEnd: string;
  dailyRowsUpserted: number;
  queryPageRowsUpserted: number;
  queryDataTruncated: boolean;
  errorCode?: string;
  message: string;
}

function safeMessage(err: unknown): { code: string; message: string } {
  if (err instanceof GscError) return { code: err.gscCode, message: err.message };
  logger.error("[SeoGscSync] Unexpected sync error", {
    error: err instanceof Error ? err.message : "unknown",
  });
  return { code: "SYNC_INTERNAL_ERROR", message: "Synchronisation failed unexpectedly." };
}

function validRow(r: GscRow, keyCount: number): boolean {
  return (
    Array.isArray(r.keys) &&
    r.keys.length === keyCount &&
    r.keys.every((k) => typeof k === "string") &&
    [r.clicks, r.impressions, r.position].every((n) => typeof n === "number" && Number.isFinite(n) && n >= 0)
  );
}

async function recoverStaleLocks(): Promise<void> {
  await SeoSyncRun.updateMany(
    { lockKey: LOCK_KEY, startedAt: { $lt: new Date(Date.now() - STALE_LOCK_MS) } },
    {
      $set: {
        status: "FAILED",
        errorCode: "STALE_LOCK_RECOVERED",
        errorMessage: "A previous sync was interrupted and its lock was recovered.",
        finishedAt: new Date(),
      },
      $unset: { lockKey: "" },
    }
  );
}

async function acquireLock(
  opts: SyncOptions,
  rangeStart: string,
  rangeEnd: string
): Promise<ISeoSyncRun> {
  await recoverStaleLocks();
  try {
    return await SeoSyncRun.create({
      provider: "GSC",
      trigger: opts.trigger,
      status: "RUNNING",
      lockKey: LOCK_KEY,
      requestedBy: opts.actor?.id,
      rangeStart,
      rangeEnd,
      startedAt: new Date(),
    });
  } catch (err) {
    if ((err as { code?: number }).code === 11000) {
      throw new ConflictError("A Search Console sync is already running. Try again in a few minutes.");
    }
    throw err;
  }
}

async function bulkUpsert(
  model: typeof SeoSearchDaily | typeof SeoQueryPagePerf,
  ops: Array<{ filter: Record<string, unknown>; set: Record<string, unknown> }>
): Promise<number> {
  let n = 0;
  for (let i = 0; i < ops.length; i += BULK_BATCH) {
    const batch = ops.slice(i, i + BULK_BATCH).map((o) => ({
      updateOne: { filter: o.filter, update: { $set: o.set }, upsert: true },
    }));
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const res = await (model as any).bulkWrite(batch, { ordered: false });
    n += (res.upsertedCount ?? 0) + (res.matchedCount ?? 0); // rows written or confirmed (idempotent re-runs)
  }
  return n;
}

/** Fetches + stores one date chunk. Returns counts and truncation flags. */
async function syncChunk(
  start: string,
  end: string,
  syncedAt: Date
): Promise<{ daily: number; queryPage: number; queryTruncated: boolean; dailyTruncated: boolean; attempts: number }> {
  const chunkDays = Math.round((Date.parse(end) - Date.parse(start)) / 86_400_000) + 1;

  // 1) Authoritative site totals (no `query` dimension → includes anonymised queries).
  const daily = await querySearchAnalytics({
    startDate: start,
    endDate: end,
    dimensions: ["date", "device", "country"],
    maxRows: 25_000,
  });
  const dailyOps = daily.rows
    .filter((r) => validRow(r, 3))
    .map((r) => ({
      filter: { date: r.keys[0], device: r.keys[1].toUpperCase(), country: r.keys[2].toLowerCase() },
      set: {
        date: r.keys[0],
        device: r.keys[1].toUpperCase(),
        country: r.keys[2].toLowerCase(),
        clicks: r.clicks,
        impressions: r.impressions,
        position: r.position,
        syncedAt,
      },
    }));
  const dailyCount = await bulkUpsert(SeoSearchDaily, dailyOps);

  // 2) Top (query, page) rows. Trim to MAX_QUERY_ROWS_PER_DAY per day.
  const qp = await querySearchAnalytics({
    startDate: start,
    endDate: end,
    dimensions: ["date", "query", "page"],
    maxRows: chunkDays * MAX_QUERY_ROWS_PER_DAY,
  });
  const byDay = new Map<string, GscRow[]>();
  for (const r of qp.rows) {
    if (!validRow(r, 3)) continue;
    const list = byDay.get(r.keys[0]) ?? [];
    list.push(r);
    byDay.set(r.keys[0], list);
  }
  const qpOps: Array<{ filter: Record<string, unknown>; set: Record<string, unknown> }> = [];
  let trimmed = false;
  for (const [date, rows] of byDay) {
    rows.sort((a, b) => b.clicks - a.clicks || b.impressions - a.impressions);
    if (rows.length > MAX_QUERY_ROWS_PER_DAY) trimmed = true;
    for (const r of rows.slice(0, MAX_QUERY_ROWS_PER_DAY)) {
      const query = r.keys[1].slice(0, 300);
      const page = r.keys[2].slice(0, 600);
      const pagePath = normalizePagePath(page).slice(0, 500);
      qpOps.push({
        filter: { date, query, page },
        set: {
          date,
          query,
          page,
          pagePath,
          pageCategory: classifyPage(pagePath),
          clicks: r.clicks,
          impressions: r.impressions,
          position: r.position,
          syncedAt,
        },
      });
    }
  }
  const qpCount = await bulkUpsert(SeoQueryPagePerf, qpOps);

  return {
    daily: dailyCount,
    queryPage: qpCount,
    queryTruncated: qp.truncated || trimmed,
    dailyTruncated: daily.truncated,
    attempts: daily.attempts + qp.attempts,
  };
}

async function recordConfig(
  patch: Record<string, unknown>
): Promise<void> {
  await SeoIntegrationConfig.updateOne(
    { provider: "GSC" },
    { $set: { provider: "GSC", propertyId: getGscProperty() ?? undefined, ...patch } },
    { upsert: true }
  );
}

async function latestStoredDate(): Promise<string | undefined> {
  const doc = await SeoSearchDaily.findOne({}, { date: 1 }).sort({ date: -1 }).lean();
  return doc?.date;
}

export class SeoGscSyncService {
  /**
   * Makes ONE small authenticated request. Only a successful response marks the
   * integration CONNECTED. Never marks connected on config presence alone.
   */
  static async verifyConnection(actor?: AdminUser): Promise<{ ok: boolean; code?: string; message: string }> {
    await connectToDatabase();
    if (!isGscConfigured()) {
      await recordConfig({
        status: "NOT_CONFIGURED",
        lastErrorCode: "GSC_NOT_CONFIGURED",
        lastErrorMessage: "Credentials or GSC_PROPERTY are not set on the server.",
      });
      return { ok: false, code: "GSC_NOT_CONFIGURED", message: "Credentials or GSC_PROPERTY are not set on the server." };
    }
    try {
      const end = latestReliableDate();
      await querySearchAnalytics({ startDate: addDays(end, -2), endDate: end, dimensions: ["date"], maxRows: 1 });
      await recordConfig({
        status: "CONNECTED",
        lastVerifiedAt: new Date(),
        lastErrorCode: null,
        lastErrorMessage: null,
      });
      if (actor) {
        await logAuditEvent({ actor, action: "SEO_SYNC_TRIGGERED", reason: "Search Console connection verified" });
      }
      return { ok: true, message: "Authenticated request to Search Console succeeded." };
    } catch (err) {
      const { code, message } = safeMessage(err);
      await recordConfig({ status: "ERROR", lastErrorCode: code, lastErrorMessage: message });
      return { ok: false, code, message };
    }
  }

  static async runSync(opts: SyncOptions): Promise<SyncSummary> {
    const days = opts.days ?? DEFAULT_SYNC_DAYS;
    if (!Number.isInteger(days) || days < 1 || days > MAX_SYNC_DAYS) {
      throw new ValidationError(`days must be an integer between 1 and ${MAX_SYNC_DAYS}.`);
    }
    await connectToDatabase();

    const rangeEnd = latestReliableDate();
    const rangeStart = addDays(rangeEnd, -(days - 1));

    if (!isGscConfigured()) {
      await recordConfig({
        status: "NOT_CONFIGURED",
        lastErrorCode: "GSC_NOT_CONFIGURED",
        lastErrorMessage: "Credentials or GSC_PROPERTY are not set on the server.",
      });
      throw new GscError("GSC_NOT_CONFIGURED", "Search Console credentials or GSC_PROPERTY are not configured on the server.", 503);
    }

    const run = await acquireLock(opts, rangeStart, rangeEnd);
    if (opts.actor) {
      await logAuditEvent({
        actor: opts.actor,
        action: "SEO_SYNC_TRIGGERED",
        reason: `GSC sync ${rangeStart}→${rangeEnd} (${days}d)`,
      });
    }

    const startedMs = Date.now();
    const syncedAt = new Date();
    let daily = 0;
    let queryPage = 0;
    let attempts = 0;
    let queryTruncated = false;
    let dailyTruncated = false;
    let timeBudgetHit = false;
    let failure: { code: string; message: string } | null = null;

    try {
      // Newest chunks first so the most useful data lands before any time-budget stop.
      const chunks: Array<[string, string]> = [];
      for (let chunkEnd = rangeEnd; chunkEnd >= rangeStart; chunkEnd = addDays(chunkEnd, -CHUNK_DAYS)) {
        const chunkStart = addDays(chunkEnd, -(CHUNK_DAYS - 1));
        chunks.push([chunkStart < rangeStart ? rangeStart : chunkStart, chunkEnd]);
      }
      for (const [s, e] of chunks) {
        if (Date.now() - startedMs > TIME_BUDGET_MS) {
          timeBudgetHit = true;
          break;
        }
        const r = await syncChunk(s, e, syncedAt);
        daily += r.daily;
        queryPage += r.queryPage;
        attempts += r.attempts;
        queryTruncated ||= r.queryTruncated;
        dailyTruncated ||= r.dailyTruncated;
      }
    } catch (err) {
      failure = safeMessage(err);
    }

    let status: ISeoSyncRun["status"];
    let errorCode: string | undefined;
    let errorMessage: string | undefined;
    if (failure) {
      status = daily + queryPage > 0 ? "PARTIAL" : "FAILED";
      errorCode = failure.code;
      errorMessage = failure.message;
    } else if (timeBudgetHit || dailyTruncated) {
      status = "PARTIAL";
      errorCode = timeBudgetHit ? "TIME_BUDGET_REACHED" : "DAILY_DATA_TRUNCATED";
      errorMessage = timeBudgetHit
        ? "Stopped early to stay within the time budget. Run again to continue; already-stored days are unaffected."
        : "Site-level rows hit the page cap; totals for some days may be incomplete.";
    } else {
      status = "SUCCEEDED";
    }

    await SeoSyncRun.updateOne(
      { _id: run._id },
      {
        $set: {
          status,
          dailyRowsUpserted: daily,
          queryPageRowsUpserted: queryPage,
          queryDataTruncated: queryTruncated,
          attempts,
          errorCode,
          errorMessage,
          finishedAt: new Date(),
        },
        $unset: { lockKey: "" },
      }
    );

    if (status === "SUCCEEDED" || status === "PARTIAL") {
      // At least one authenticated request succeeded, so the connection is real.
      const through = await latestStoredDate();
      await recordConfig({
        status: "CONNECTED",
        lastVerifiedAt: new Date(),
        ...(status === "SUCCEEDED" ? { lastSuccessfulSyncAt: new Date() } : {}),
        ...(through ? { dataThroughDate: through } : {}),
        lastErrorCode: errorCode ?? null,
        lastErrorMessage: errorMessage ?? null,
      });
    } else {
      await recordConfig({ status: "ERROR", lastErrorCode: errorCode, lastErrorMessage: errorMessage });
    }

    fastCache.invalidate("seo:*");

    if (opts.actor) {
      await logAuditEvent({
        actor: opts.actor,
        action: status === "FAILED" ? "SEO_SYNC_FAILED" : "SEO_SYNC_COMPLETED",
        reason: `GSC sync ${status}: ${daily} daily rows, ${queryPage} query rows${errorCode ? `, ${errorCode}` : ""}`,
      });
    }

    return {
      runId: String(run._id),
      status,
      rangeStart,
      rangeEnd,
      dailyRowsUpserted: daily,
      queryPageRowsUpserted: queryPage,
      queryDataTruncated: queryTruncated,
      errorCode,
      message:
        status === "SUCCEEDED"
          ? `Synced ${rangeStart} → ${rangeEnd}.`
          : errorMessage ?? "Sync did not complete.",
    };
  }

  /** Test-visible helper. */
  static todayYmd(): string {
    return toYmd(new Date());
  }
}

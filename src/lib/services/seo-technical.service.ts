import "server-only";
import { Types } from "mongoose";
import { connectToDatabase } from "@/lib/db/mongoose";
import { ConflictError } from "@/lib/api/errors";
import { logger } from "@/lib/logger";
import { siteConfig } from "@/config/site";
import type { AdminUser } from "@/lib/auth/session";
import { SeoAuditRun, type ISeoAuditRun } from "@/models/SeoAuditRun";
import { SeoTechnicalIssue } from "@/models/SeoTechnicalIssue";
import { logAuditEvent } from "@/lib/services/audit.service";
import { createAllowListedFetcher } from "@/lib/seo-analytics/tech-fetcher";
import {
  DEFAULT_LIMITS,
  TECH_ISSUE_TYPES,
  runTechnicalScan,
  type TechIssueType,
  type TechSeverity,
} from "@/lib/seo-analytics/tech-scanner";
import { planIssueChanges } from "@/lib/seo-analytics/issue-diff";

const LOCK_KEY = "TECH_SCAN";
const STALE_LOCK_MS = 10 * 60 * 1000;
const TIME_BUDGET_MS = 45_000;
const PAGE_SIZE_MAX = 100;

export interface TechScanSummary {
  runId: string;
  status: ISeoAuditRun["status"];
  urlsPlanned: number;
  urlsChecked: number;
  requests: number;
  completed: boolean;
  stoppedReason?: string;
  newCount: number;
  ongoingCount: number;
  resolvedCount: number;
  message: string;
}

export type IssueStateFilter = "open" | "new" | "ongoing" | "resolved";

export interface TechIssueRow {
  id: string;
  type: TechIssueType | string;
  typeLabel: string;
  severity: TechSeverity;
  url: string;
  message: string;
  status: "OPEN" | "RESOLVED";
  state: "NEW" | "ONGOING" | "RESOLVED";
  firstSeenAt: string;
  lastSeenAt: string;
  resolvedAt: string | null;
  timesSeen: number;
}

export interface TechSummaryView {
  lastRun: null | {
    id: string;
    status: string;
    trigger: string;
    startedAt: string;
    finishedAt: string | null;
    urlsPlanned: number;
    urlsChecked: number;
    requests: number;
    completed: boolean;
    stoppedReason: string | null;
    baseUrl: string;
  };
  /** Counts are relative to the latest finished (non-failed) scan. */
  open: { total: number; HIGH: number; MEDIUM: number; LOW: number };
  newInLastScan: number;
  ongoing: number;
  resolvedInLastScan: number;
  resolvedTotal: number;
}

const iso = (d?: Date | null) => (d ? d.toISOString() : null);

async function recoverStaleLock(): Promise<void> {
  await SeoAuditRun.updateMany(
    { lockKey: LOCK_KEY, startedAt: { $lt: new Date(Date.now() - STALE_LOCK_MS) } },
    {
      $set: { status: "FAILED", errorMessage: "A previous scan was interrupted; its lock was recovered.", finishedAt: new Date() },
      $unset: { lockKey: "" },
    }
  );
}

export class SeoTechnicalService {
  /**
   * Runs a controlled scan of the production site (siteConfig.url ONLY — the base URL is
   * never taken from a request). Never changes the site; it only reads and records findings.
   */
  static async runScan(opts: { actor?: AdminUser; trigger: "MANUAL" | "SCHEDULED"; baseUrl?: string; fetcherOverride?: Parameters<typeof runTechnicalScan>[0]["fetcher"] }): Promise<TechScanSummary> {
    await connectToDatabase();
    const baseUrl = (opts.baseUrl ?? siteConfig.url).replace(/\/$/, "");

    await recoverStaleLock();
    let run: ISeoAuditRun;
    try {
      run = await SeoAuditRun.create({
        kind: "TECHNICAL",
        trigger: opts.trigger,
        status: "RUNNING",
        lockKey: LOCK_KEY,
        requestedBy: opts.actor?.id,
        baseUrl,
        startedAt: new Date(),
      });
    } catch (err) {
      if ((err as { code?: number }).code === 11000) {
        throw new ConflictError("A technical scan is already running. Try again in a few minutes.");
      }
      throw err;
    }
    if (opts.actor) {
      await logAuditEvent({ actor: opts.actor, action: "SEO_TECH_SCAN_TRIGGERED", reason: `Technical scan of ${baseUrl}` });
    }

    const runId = String(run._id);
    try {
      const fetcher = opts.fetcherOverride ?? createAllowListedFetcher(baseUrl, `RatiwalSEOAudit/1.0 (+${siteConfig.url})`);
      const scan = await runTechnicalScan({
        baseUrl,
        fetcher,
        limits: { ...DEFAULT_LIMITS, deadline: Date.now() + TIME_BUDGET_MS },
      });

      const now = new Date();
      const existingDocs = await SeoTechnicalIssue.find({}, { issueKey: 1, status: 1, firstRunId: 1, firstSeenAt: 1, timesSeen: 1 }).lean();
      const plan = planIssueChanges({
        existing: existingDocs.map((d) => ({
          issueKey: d.issueKey,
          status: d.status,
          firstRunId: String(d.firstRunId),
          firstSeenAt: d.firstSeenAt,
          timesSeen: d.timesSeen,
        })),
        found: scan.findings,
        completed: scan.completed,
        runId,
        now,
      });

      const runOid = new Types.ObjectId(runId);
      const ops = [
        ...plan.writes.map((w) => ({
          updateOne: {
            filter: { issueKey: w.finding.key },
            update: {
              $set: {
                issueKey: w.finding.key,
                type: w.finding.type,
                severity: w.finding.severity,
                url: w.finding.url.slice(0, 700),
                message: w.finding.message.slice(0, 600),
                status: "OPEN",
                firstSeenAt: w.firstSeenAt,
                firstRunId: new Types.ObjectId(w.firstRunId),
                lastSeenAt: now,
                lastRunId: runOid,
                timesSeen: w.timesSeen,
              },
              $unset: { resolvedAt: "", resolvedRunId: "" },
            },
            upsert: true,
          },
        })),
        ...(plan.resolveKeys.length
          ? [
              {
                updateMany: {
                  filter: { issueKey: { $in: plan.resolveKeys }, status: "OPEN" },
                  update: { $set: { status: "RESOLVED", resolvedAt: now, resolvedRunId: runOid } },
                },
              },
            ]
          : []),
      ];
      if (ops.length) await SeoTechnicalIssue.bulkWrite(ops as never, { ordered: false });

      const openAgg = await SeoTechnicalIssue.aggregate([
        { $match: { status: "OPEN" } },
        { $group: { _id: "$severity", n: { $sum: 1 } } },
      ]);
      const openBySeverity = { HIGH: 0, MEDIUM: 0, LOW: 0 };
      for (const r of openAgg) openBySeverity[r._id as TechSeverity] = r.n;

      const status: ISeoAuditRun["status"] = scan.completed ? "SUCCEEDED" : "PARTIAL";
      await SeoAuditRun.updateOne(
        { _id: run._id },
        {
          $set: {
            status,
            urlsPlanned: scan.urlsPlanned,
            urlsChecked: scan.urlsChecked,
            requests: scan.requests,
            completed: scan.completed,
            stoppedReason: scan.stoppedReason,
            newCount: plan.newCount,
            ongoingCount: plan.ongoingCount,
            resolvedCount: plan.resolveKeys.length,
            openBySeverity,
            finishedAt: new Date(),
          },
          $unset: { lockKey: "" },
        }
      );

      if (opts.actor) {
        await logAuditEvent({
          actor: opts.actor,
          action: "SEO_TECH_SCAN_COMPLETED",
          reason: `${status}: ${scan.urlsChecked}/${scan.urlsPlanned} URLs, ${plan.newCount} new, ${plan.ongoingCount} ongoing, ${plan.resolveKeys.length} resolved`,
        });
      }

      return {
        runId,
        status,
        urlsPlanned: scan.urlsPlanned,
        urlsChecked: scan.urlsChecked,
        requests: scan.requests,
        completed: scan.completed,
        stoppedReason: scan.stoppedReason,
        newCount: plan.newCount,
        ongoingCount: plan.ongoingCount,
        resolvedCount: plan.resolveKeys.length,
        message: scan.completed
          ? `Scanned ${scan.urlsChecked} pages with ${scan.requests} requests.`
          : `Scan stopped early (${scan.stoppedReason ?? "incomplete"}). Existing issues were NOT marked resolved.`,
      };
    } catch (err) {
      logger.error("[SeoTechnical] scan failed", { error: err instanceof Error ? err.message : "unknown" });
      await SeoAuditRun.updateOne(
        { _id: run._id },
        { $set: { status: "FAILED", errorMessage: "The scan failed unexpectedly.", finishedAt: new Date() }, $unset: { lockKey: "" } }
      );
      if (opts.actor) await logAuditEvent({ actor: opts.actor, action: "SEO_TECH_SCAN_FAILED", reason: "Technical scan failed" });
      throw err;
    }
  }

  static async getSummary(): Promise<TechSummaryView> {
    await connectToDatabase();
    const last = await SeoAuditRun.findOne({ kind: "TECHNICAL" }).sort({ startedAt: -1 }).lean();
    const lastDone = await SeoAuditRun.findOne({ kind: "TECHNICAL", status: { $in: ["SUCCEEDED", "PARTIAL"] } })
      .sort({ startedAt: -1 })
      .lean();

    const [openAgg, resolvedTotal] = await Promise.all([
      SeoTechnicalIssue.aggregate([{ $match: { status: "OPEN" } }, { $group: { _id: "$severity", n: { $sum: 1 } } }]),
      SeoTechnicalIssue.countDocuments({ status: "RESOLVED" }),
    ]);
    const open = { total: 0, HIGH: 0, MEDIUM: 0, LOW: 0 };
    for (const r of openAgg) {
      open[r._id as TechSeverity] = r.n;
      open.total += r.n;
    }

    let newInLastScan = 0;
    let resolvedInLastScan = 0;
    if (lastDone) {
      [newInLastScan, resolvedInLastScan] = await Promise.all([
        SeoTechnicalIssue.countDocuments({ status: "OPEN", firstRunId: lastDone._id }),
        SeoTechnicalIssue.countDocuments({ status: "RESOLVED", resolvedRunId: lastDone._id }),
      ]);
    }

    return {
      lastRun: last
        ? {
            id: String(last._id),
            status: last.status,
            trigger: last.trigger,
            startedAt: last.startedAt.toISOString(),
            finishedAt: iso(last.finishedAt),
            urlsPlanned: last.urlsPlanned,
            urlsChecked: last.urlsChecked,
            requests: last.requests,
            completed: last.completed,
            stoppedReason: last.stoppedReason ?? null,
            baseUrl: last.baseUrl,
          }
        : null,
      open,
      newInLastScan,
      ongoing: Math.max(open.total - newInLastScan, 0),
      resolvedInLastScan,
      resolvedTotal,
    };
  }

  static async listIssues(params: {
    state?: string;
    severity?: string;
    type?: string;
    page?: number;
    pageSize?: number;
  }): Promise<{ rows: TechIssueRow[]; total: number; page: number; pageSize: number; totalPages: number }> {
    await connectToDatabase();
    const state = (["open", "new", "ongoing", "resolved"] as const).find((s) => s === params.state) ?? "open";
    const severity = (["HIGH", "MEDIUM", "LOW"] as const).find((s) => s === params.severity);
    const type = Object.keys(TECH_ISSUE_TYPES).find((t) => t === params.type);

    const lastDone = await SeoAuditRun.findOne({ kind: "TECHNICAL", status: { $in: ["SUCCEEDED", "PARTIAL"] } })
      .sort({ startedAt: -1 })
      .select({ _id: 1 })
      .lean();

    const filter: Record<string, unknown> = {};
    if (state === "resolved") filter.status = "RESOLVED";
    else {
      filter.status = "OPEN";
      if (state === "new") filter.firstRunId = lastDone?._id ?? new Types.ObjectId("000000000000000000000000");
      if (state === "ongoing" && lastDone) filter.firstRunId = { $ne: lastDone._id };
    }
    if (severity) filter.severity = severity;
    if (type) filter.type = type;

    const pageSize = Math.min(Math.max(params.pageSize ?? 25, 1), PAGE_SIZE_MAX);
    const total = await SeoTechnicalIssue.countDocuments(filter);
    const totalPages = Math.max(Math.ceil(total / pageSize), 1);
    const page = Math.min(Math.max(params.page ?? 1, 1), totalPages);

    const sevOrder = { $switch: { branches: [{ case: { $eq: ["$severity", "HIGH"] }, then: 0 }, { case: { $eq: ["$severity", "MEDIUM"] }, then: 1 }], default: 2 } };
    const docs = await SeoTechnicalIssue.aggregate([
      { $match: filter },
      { $addFields: { _sev: sevOrder } },
      { $sort: state === "resolved" ? { resolvedAt: -1, _id: 1 } : { _sev: 1, url: 1, _id: 1 } },
      { $skip: (page - 1) * pageSize },
      { $limit: pageSize },
    ]);

    const rows: TechIssueRow[] = docs.map((d) => {
      const resolved = d.status === "RESOLVED";
      const isNew = !resolved && lastDone && String(d.firstRunId) === String(lastDone._id);
      return {
        id: String(d._id),
        type: d.type,
        typeLabel: (TECH_ISSUE_TYPES as Record<string, { label: string }>)[d.type]?.label ?? d.type,
        severity: d.severity,
        url: d.url,
        message: d.message,
        status: d.status,
        state: resolved ? "RESOLVED" : isNew ? "NEW" : "ONGOING",
        firstSeenAt: (d.firstSeenAt as Date).toISOString(),
        lastSeenAt: (d.lastSeenAt as Date).toISOString(),
        resolvedAt: d.resolvedAt ? (d.resolvedAt as Date).toISOString() : null,
        timesSeen: d.timesSeen,
      };
    });
    return { rows, total, page, pageSize, totalPages };
  }
}

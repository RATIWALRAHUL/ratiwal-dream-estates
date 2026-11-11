import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminSession } from "@/lib/auth/guard";
import { errorResponse } from "@/lib/api/response";
import { RateLimitError } from "@/lib/api/errors";
import { checkRateLimit } from "@/lib/rate-limit";
import { logAuditEvent } from "@/lib/services/audit.service";
import { SeoGscQueryService } from "@/lib/services/seo-gsc-query.service";
import { toCsv } from "@/lib/seo-analytics/csv";
import { SEARCH_INTENT_LABELS } from "@/lib/seo-analytics/classify";
import { OPPORTUNITY_LABELS } from "@/lib/seo-analytics/opportunities";

export const dynamic = "force-dynamic";

const ymd = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
const querySchema = z.object({
  preset: z.enum(["7d", "28d", "90d", "custom"]).optional(),
  from: ymd.optional(),
  to: ymd.optional(),
  q: z.string().max(100).optional(),
  intent: z.string().max(20).optional(),
  opportunity: z.string().max(30).optional(),
  sort: z.string().max(20).optional(),
  dir: z.enum(["asc", "desc"]).optional(),
});

/** GET /api/dashboard/seo/keywords/export — ADMIN or SUPER_ADMIN. Bounded CSV, formula-injection safe. */
export async function GET(request: NextRequest) {
  try {
    const session = await requireAdminSession(["ADMIN", "SUPER_ADMIN"]);

    const rl = checkRateLimit(`seo-kw-export:${session.user.id}`, 5, 60 * 1000);
    if (!rl.allowed) throw new RateLimitError("Export rate limit exceeded. Please wait a minute.");

    const params = querySchema.parse(Object.fromEntries(new URL(request.url).searchParams));
    const { range, rows, truncated } = await SeoGscQueryService.getKeywordsForExport(params);

    const headers = [
      "Query",
      "Intent (heuristic)",
      "Clicks",
      "Impressions",
      "CTR",
      "Avg position (not a fixed rank)",
      "Previous clicks",
      "Previous impressions",
      "Previous avg position",
      "Clicks change",
      "Top landing page",
      "Opportunity flags",
      "Period",
      "Previous period",
    ];
    const period = `${range.current.start} to ${range.current.end}`;
    const prevPeriod = `${range.previous.start} to ${range.previous.end}`;
    const body = toCsv(
      headers,
      rows.map((r) => [
        r.query,
        SEARCH_INTENT_LABELS[r.intent],
        r.clicks,
        r.impressions,
        r.ctr === null ? "" : Number((r.ctr * 100).toFixed(2)),
        r.position === null ? "" : Number(r.position.toFixed(1)),
        r.prevClicks,
        r.prevImpressions,
        r.prevPosition === null ? "" : Number(r.prevPosition.toFixed(1)),
        r.clicksChange,
        r.topPagePath ?? "",
        r.opportunities.map((o) => OPPORTUNITY_LABELS[o]).join("; "),
        period,
        prevPeriod,
      ])
    );

    await logAuditEvent({
      actor: session.user,
      action: "SEO_KEYWORDS_EXPORTED",
      reason: `Exported ${rows.length} keyword rows (${period})${truncated ? " [truncated at cap]" : ""}`,
    });

    return new NextResponse(body, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="ratiwal_seo_keywords_${range.current.start}_${range.current.end}.csv"`,
        "Cache-Control": "no-store, max-age=0",
        ...(truncated ? { "X-Export-Truncated": "true" } : {}),
      },
    });
  } catch (error) {
    return errorResponse(error);
  }
}

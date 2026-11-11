import "server-only";

import type { Metadata } from "next";
import Link from "next/link";
import { Download } from "lucide-react";
import { getSeoAccess } from "@/lib/seo-analytics/access";
import { SeoGscQueryService } from "@/lib/services/seo-gsc-query.service";
import { latestReliableDate, resolveRange } from "@/lib/seo-analytics/dates";
import {
  PAGE_CATEGORY_LABELS,
  SEARCH_INTENTS,
  SEARCH_INTENT_LABELS,
} from "@/lib/seo-analytics/classify";
import {
  OPPORTUNITY_KEYS,
  OPPORTUNITY_LABELS,
  OPPORTUNITY_THRESHOLDS,
} from "@/lib/seo-analytics/opportunities";
import { formatInt, formatPct, formatPosition } from "@/lib/seo-analytics/metrics";
import { ValidationError } from "@/lib/api/errors";
import type { KeywordsResult, SeoRangeInfo } from "@/types/seo-analytics";
import {
  SeoHeader,
  SeoNotice,
  SeoEmptyState,
  SeoPermissionDenied,
  SeoCard,
  SeoPagination,
  SortHeader,
} from "@/components/dashboard/seo/SeoChrome";
import { SeoRangeFilter } from "@/components/dashboard/seo/SeoRangeFilter";
import { buildHref, firstParam, positiveInt, rangeParams, overlapsLoggingIssue } from "@/components/dashboard/seo/seo-ui";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Keyword Performance | SEO | Ratiwal Dashboard",
  robots: { index: false, follow: false },
};

const BASE = "/dashboard/seo/keywords";

export default async function SeoKeywordsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const access = await getSeoAccess();
  const sp = await searchParams;

  const header = (
    <SeoHeader
      active="keywords"
      title="Keyword performance"
      subtitle="Search queries that showed your pages in Google, with period-over-period change. Position is an average, not a live ranking."
    />
  );
  if (!access.allowed) {
    return (
      <div className="space-y-6">
        {header}
        <SeoPermissionDenied />
      </div>
    );
  }

  const q = firstParam(sp.q)?.slice(0, 100) ?? "";
  const intent = firstParam(sp.intent) ?? "";
  const opportunity = firstParam(sp.opportunity) ?? "";
  const sort = firstParam(sp.sort) ?? "clicks";
  const dir = firstParam(sp.dir) === "asc" ? "asc" : "desc";
  const page = positiveInt(firstParam(sp.page), 1);
  const input = { preset: firstParam(sp.preset), from: firstParam(sp.from), to: firstParam(sp.to) };

  let result: KeywordsResult | null = null;
  let notice: { kind: "warning" | "error"; title: string; body: string } | null = null;
  let fallbackRange: SeoRangeInfo | null = null;
  const maxDate = latestReliableDate();

  try {
    result = await SeoGscQueryService.getKeywords({ ...input, q, intent, opportunity, sort, dir, page, pageSize: 25 });
  } catch (e) {
    if (e instanceof ValidationError) {
      fallbackRange = resolveRange({ preset: "28d" }, maxDate);
      notice = { kind: "warning", title: "Check the date range", body: e.message };
    } else {
      notice = { kind: "error", title: "Couldn't load keyword data", body: "Something went wrong while reading stored data. Try again shortly." };
    }
  }

  const range = result?.range ?? fallbackRange;
  const filterParams = { q, intent, opportunity };
  const keepParams = { ...(range ? rangeParams(range) : {}), ...filterParams };
  const exportHref = buildHref("/api/dashboard/seo/keywords/export", { ...keepParams, sort, dir });
  const T = OPPORTUNITY_THRESHOLDS;

  return (
    <div className="space-y-6">
      {header}
      {notice && <SeoNotice kind={notice.kind} title={notice.title}>{notice.body}</SeoNotice>}

      {range && (
        <SeoRangeFilter
          base={BASE}
          range={range}
          maxDate={maxDate}
          extraParams={{ q, intent, opportunity }}
        />
      )}

      {result && result.range && overlapsLoggingIssue(result.range) && (
        <SeoNotice kind="warning" title="Part of this period is affected by a Google logging issue">
          Impressions, CTR and position were unreliable from 2025-05-13 to 2026-04-27. Clicks were not affected.
        </SeoNotice>
      )}

      {result && result.total === 0 && result.rows.length === 0 && !q && !intent && !opportunity && (
        <SeoEmptyState title="No keyword data for this period">
          Keyword rows appear after Search Console has been connected and synced on the{" "}
          <Link href="/dashboard/seo" className="underline">Overview</Link> page.
        </SeoEmptyState>
      )}

      {result && (result.total > 0 || q || intent || opportunity) && (
        <>
          <SeoCard
            title="Opportunities"
            caption="Rule-based prompts for review, not predictions. Each rule needs a minimum amount of data before it flags a query."
          >
            <div className="flex flex-wrap gap-2" role="group" aria-label="Opportunity filters">
              <Link
                href={buildHref(BASE, { ...rangeParams(result.range), q, intent })}
                aria-current={!opportunity ? "true" : undefined}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${
                  !opportunity ? "bg-[#071a28] text-white border-[#071a28]" : "bg-white text-[#071a28] border-[rgba(7,26,40,0.12)] hover:bg-stone-50"
                }`}
              >
                All queries
              </Link>
              {OPPORTUNITY_KEYS.map((k) => (
                <Link
                  key={k}
                  href={buildHref(BASE, { ...rangeParams(result.range), q, intent, opportunity: k })}
                  aria-current={opportunity === k ? "true" : undefined}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${
                    opportunity === k ? "bg-[#071a28] text-white border-[#071a28]" : "bg-white text-[#071a28] border-[rgba(7,26,40,0.12)] hover:bg-stone-50"
                  }`}
                >
                  {OPPORTUNITY_LABELS[k]} <span className="opacity-70">({result.opportunityCounts[k]})</span>
                </Link>
              ))}
            </div>
            <details className="mt-3 text-[11px] text-[#647581]">
              <summary className="cursor-pointer font-semibold hover:text-[#071a28]">How these are calculated</summary>
              <ul className="mt-2 list-disc pl-4 space-y-0.5">
                <li>High impressions, low CTR: ≥ {T.lowCtr.minImpressions} impressions, average position ≤ {T.lowCtr.maxPosition}, CTR below {T.lowCtr.maxCtr * 100}%.</li>
                <li>Clicks declining: ≥ {T.declining.minPrevClicks} clicks in the previous period and now ≤ {T.declining.maxRatio * 100}% of that.</li>
                <li>Visibility improving: ≥ {T.improving.minPrevImpressions} previous impressions and average position better by ≥ {T.improving.minPositionGain}.</li>
                <li>Landing page may not match: non-brand query (≥ {T.weakLanding.minImpressions} impressions) whose top page is the homepage, a contact/info page or an uncategorised page.</li>
                <li>Possible cannibalization: ≥ {T.cannibalization.minImpressions} impressions and a second page holding ≥ {T.cannibalization.minSecondPageShare * 100}% of them.</li>
                <li>Search intent is a keyword-based heuristic, not a Google label.</li>
              </ul>
            </details>
          </SeoCard>

          <SeoCard>
            <div className="flex flex-wrap items-end justify-between gap-3 mb-4">
              <form method="get" action={BASE} className="flex flex-wrap items-end gap-2">
                {Object.entries(rangeParams(result.range)).map(([k, v]) => (
                  <input key={k} type="hidden" name={k} value={v} />
                ))}
                {opportunity && <input type="hidden" name="opportunity" value={opportunity} />}
                <label className="text-[11px] text-[#647581] font-semibold">
                  Search queries
                  <input
                    type="search"
                    name="q"
                    defaultValue={q}
                    maxLength={100}
                    placeholder="e.g. jaipur plots"
                    className="mt-0.5 block w-56 rounded-lg border border-[rgba(7,26,40,0.12)] bg-white px-2 py-1.5 text-xs text-[#071a28]"
                  />
                </label>
                <label className="text-[11px] text-[#647581] font-semibold">
                  Intent
                  <select
                    name="intent"
                    defaultValue={intent}
                    className="mt-0.5 block rounded-lg border border-[rgba(7,26,40,0.12)] bg-white px-2 py-1.5 text-xs text-[#071a28]"
                  >
                    <option value="">All</option>
                    {SEARCH_INTENTS.map((i) => (
                      <option key={i} value={i}>{SEARCH_INTENT_LABELS[i]}</option>
                    ))}
                  </select>
                </label>
                <button type="submit" className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-[rgba(7,26,40,0.12)] bg-white text-[#071a28] hover:bg-stone-50">
                  Filter
                </button>
                {(q || intent) && (
                  <Link href={buildHref(BASE, { ...rangeParams(result.range), opportunity })} className="px-2 py-1.5 text-xs text-[#647581] hover:text-[#071a28]">
                    Clear
                  </Link>
                )}
              </form>
              <a
                href={exportHref}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-[rgba(7,26,40,0.12)] bg-white text-[#071a28] hover:bg-stone-50"
              >
                <Download className="w-3.5 h-3.5" aria-hidden="true" /> Export CSV
              </a>
            </div>

            {result.cappedAtAnalysisLimit && (
              <p className="mb-3 text-[11px] text-amber-800">
                Showing the top {formatInt(20000)} queries by impressions; lower-volume queries are not analysed.
              </p>
            )}

            <div className="overflow-x-auto -mx-5 px-5">
              <table className="w-full text-xs min-w-[860px]">
                <caption className="sr-only">
                  Search queries for {result.range.label} compared with the previous {result.range.previous.days} days
                </caption>
                <thead className="text-[#647581] border-b border-[rgba(7,26,40,0.08)]">
                  <tr>
                    <SortHeader label="Query" field="query" base={BASE} params={keepParams} currentSort={sort} currentDir={dir} align="left" />
                    <th scope="col" className="px-3 py-2.5 text-left font-semibold">Intent</th>
                    <SortHeader label="Clicks" field="clicks" base={BASE} params={keepParams} currentSort={sort} currentDir={dir} />
                    <SortHeader label="Impr." field="impressions" base={BASE} params={keepParams} currentSort={sort} currentDir={dir} />
                    <SortHeader label="CTR" field="ctr" base={BASE} params={keepParams} currentSort={sort} currentDir={dir} />
                    <SortHeader label="Avg pos." field="position" base={BASE} params={keepParams} currentSort={sort} currentDir={dir} />
                    <SortHeader label="Clicks vs prev." field="change" base={BASE} params={keepParams} currentSort={sort} currentDir={dir} />
                    <th scope="col" className="px-3 py-2.5 text-left font-semibold">Top landing page</th>
                    <th scope="col" className="px-3 py-2.5 text-left font-semibold">Flags</th>
                  </tr>
                </thead>
                <tbody>
                  {result.rows.length === 0 && (
                    <tr><td colSpan={9} className="px-3 py-6 text-center text-[#647581]">No queries match these filters.</td></tr>
                  )}
                  {result.rows.map((r) => (
                    <tr key={r.query} className="border-t border-[rgba(7,26,40,0.06)] align-top">
                      <td className="px-3 py-2 text-[#071a28] font-medium max-w-[260px] break-words">{r.query}</td>
                      <td className="px-3 py-2 text-[#647581] whitespace-nowrap">{SEARCH_INTENT_LABELS[r.intent]}</td>
                      <td className="px-3 py-2 text-right tabular-nums">{formatInt(r.clicks)}</td>
                      <td className="px-3 py-2 text-right tabular-nums">{formatInt(r.impressions)}</td>
                      <td className="px-3 py-2 text-right tabular-nums">{formatPct(r.ctr)}</td>
                      <td className="px-3 py-2 text-right tabular-nums">{formatPosition(r.position)}</td>
                      <td className="px-3 py-2 text-right tabular-nums whitespace-nowrap">
                        <span className={r.clicksChange > 0 ? "text-emerald-700" : r.clicksChange < 0 ? "text-rose-700" : "text-[#647581]"}>
                          {r.clicksChange > 0 ? "+" : r.clicksChange < 0 ? "−" : ""}
                          {formatInt(Math.abs(r.clicksChange))}
                        </span>
                        <span className="block text-[10px] text-[#647581]">was {formatInt(r.prevClicks)}</span>
                      </td>
                      <td className="px-3 py-2 max-w-[220px] break-all">
                        {r.topPagePath ? (
                          <>
                            <span className="text-[#071a28]">{r.topPagePath}</span>
                            {r.topPageCategory && (
                              <span className="block text-[10px] text-[#647581]">
                                {PAGE_CATEGORY_LABELS[r.topPageCategory]}
                                {r.pageCount > 1 ? ` · ${r.pageCount} pages` : ""}
                              </span>
                            )}
                          </>
                        ) : (
                          <span className="text-[#647581]">—</span>
                        )}
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex flex-wrap gap-1">
                          {r.opportunities.map((o) => (
                            <span key={o} className="px-1.5 py-0.5 rounded bg-sky-50 text-sky-800 text-[10px] font-semibold">
                              {OPPORTUNITY_LABELS[o]}
                            </span>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <SeoPagination
              base={BASE}
              params={{ ...keepParams, sort, dir }}
              page={result.page}
              totalPages={result.totalPages}
              total={result.total}
            />
            <p className="mt-3 text-[11px] text-[#647581]">
              Source: Search Console · {result.range.label}. Google hides rare queries, so these rows are a sample of search
              activity, not all of it. Average position is averaged across devices, countries and searches.
            </p>
          </SeoCard>
        </>
      )}
    </div>
  );
}

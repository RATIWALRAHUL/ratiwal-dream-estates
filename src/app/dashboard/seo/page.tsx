import "server-only";

import type { Metadata } from "next";
import { getSeoAccess } from "@/lib/seo-analytics/access";
import { SeoGscQueryService } from "@/lib/services/seo-gsc-query.service";
import { SeoTechnicalService, type TechSummaryView } from "@/lib/services/seo-technical.service";
import Link from "next/link";
import { latestReliableDate, eachDay, resolveRange } from "@/lib/seo-analytics/dates";
import { PAGE_CATEGORY_LABELS } from "@/lib/seo-analytics/classify";
import { formatInt, formatPct, formatPosition } from "@/lib/seo-analytics/metrics";
import { ValidationError } from "@/lib/api/errors";
import { siteConfig } from "@/config/site";
import type { IntegrationStatusView, OverviewData, SeoRangeInfo, TrendPoint } from "@/types/seo-analytics";
import {
  SeoHeader,
  SeoNotice,
  SeoEmptyState,
  SeoPermissionDenied,
  SeoCard,
} from "@/components/dashboard/seo/SeoChrome";
import { SeoRangeFilter } from "@/components/dashboard/seo/SeoRangeFilter";
import { SeoConnectionPanel } from "@/components/dashboard/seo/SeoConnectionPanel";
import { SeoKpiCard } from "@/components/dashboard/seo/SeoKpiCard";
import { SeoTrendChart, type ChartPoint } from "@/components/dashboard/seo/SeoTrendChart";
import { SeoBreakdownBars } from "@/components/dashboard/seo/SeoBreakdownBars";
import { deltaFor, firstParam, overlapsLoggingIssue, GSC_LOGGING_ISSUE } from "@/components/dashboard/seo/seo-ui";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "SEO Performance | Ratiwal Dashboard",
  robots: { index: false, follow: false },
};

const DEVICE_LABELS: Record<string, string> = { MOBILE: "Mobile", DESKTOP: "Desktop", TABLET: "Tablet" };

function series(trend: TrendPoint[], days: string[], pick: (p: TrendPoint) => number | null): ChartPoint[] {
  const map = new Map(trend.map((p) => [p.date, p]));
  return days.map((d) => {
    const p = map.get(d);
    return { date: d, value: p ? pick(p) : null };
  });
}

function countryLabel(code: string): string {
  try {
    return new Intl.DisplayNames(["en"], { type: "region" }).of(code.slice(0, 2).toUpperCase()) ?? code.toUpperCase();
  } catch {
    return code.toUpperCase();
  }
}

export default async function SeoOverviewPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const access = await getSeoAccess();
  const sp = await searchParams;
  const header = (
    <SeoHeader
      active="overview"
      title="SEO performance"
      subtitle="Organic search results from Google Search Console. Numbers come only from synced Google data; nothing here is estimated."
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

  const input = { preset: firstParam(sp.preset), from: firstParam(sp.from), to: firstParam(sp.to) };

  let status: IntegrationStatusView | null = null;
  let data: OverviewData | null = null;
  let errorNotice: { kind: "warning" | "error"; title: string; body: string } | null = null;
  let fallbackRange: SeoRangeInfo | null = null;
  let tech: TechSummaryView | null = null;
  try {
    tech = await SeoTechnicalService.getSummary();
  } catch {
    tech = null; // technical card simply stays out; the page must not fail because of it
  }

  try {
    status = await SeoGscQueryService.getIntegrationStatus();
  } catch {
    errorNotice = { kind: "error", title: "Couldn't load integration status", body: "The database may be unavailable. Try again shortly." };
  }

  if (status && status.storedDays > 0) {
    try {
      data = await SeoGscQueryService.getOverview(input);
    } catch (e) {
      if (e instanceof ValidationError) fallbackRange = resolveRange({ preset: "28d" }, latestReliableDate());
      errorNotice =
        e instanceof ValidationError
          ? { kind: "warning", title: "Check the date range", body: e.message }
          : { kind: "error", title: "Couldn't load search data", body: "Something went wrong while reading stored data. Try again shortly." };
    }
  }

  const maxDate = latestReliableDate();

  return (
    <div className="space-y-6">
      {header}

      {errorNotice && <SeoNotice kind={errorNotice.kind} title={errorNotice.title}>{errorNotice.body}</SeoNotice>}

      {status && <SeoConnectionPanel status={status} canSync={access.canSync} />}

      {status && !status.envConfigured && (
        <SeoEmptyState title="Search Console isn't connected yet">
          <p>
            No search data is shown until Google credentials are added on the server and a real request succeeds. Set these
            server-only variables (never <code>NEXT_PUBLIC_</code>), then use “Test connection”:
          </p>
          <ul className="mt-3 text-left inline-block font-mono text-[11px] text-[#071a28] space-y-0.5">
            <li>GOOGLE_SERVICE_ACCOUNT_JSON <span className="text-[#647581]">(or _EMAIL + _PRIVATE_KEY)</span></li>
            <li>GSC_PROPERTY <span className="text-[#647581]">(e.g. sc-domain:ratiwaldreamestates.com)</span></li>
          </ul>
          <p className="mt-3">
            The service account’s email must be added as a user on the Search Console property. Full steps are in
            SEO_PHASE_4A_GSC_INTEGRATION.md.
          </p>
        </SeoEmptyState>
      )}

      {status && status.envConfigured && status.storedDays === 0 && !errorNotice && (
        <SeoEmptyState title="No search data stored yet">
          {access.canSync
            ? "Use “Test connection”, then “Backfill 90 days” to load the first data. Google reports data with a delay of about 3 days."
            : "A Super Admin needs to run the first sync. Google reports data with a delay of about 3 days."}
        </SeoEmptyState>
      )}

      {!data && fallbackRange && <SeoRangeFilter base="/dashboard/seo" range={fallbackRange} maxDate={maxDate} />}

      {data && (
        <>
          <SeoRangeFilter base="/dashboard/seo" range={data.range} maxDate={maxDate} />

          {overlapsLoggingIssue(data.range) && (
            <SeoNotice kind="warning" title="Part of this period is affected by a Google logging issue">
              Google has said impressions, CTR and average position were unreliable from {GSC_LOGGING_ISSUE.start} to{" "}
              {GSC_LOGGING_ISSUE.end} (clicks were unaffected, and the data was not backfilled). Treat impression-based trends
              across that window with caution.
            </SeoNotice>
          )}

          {(data.daysWithData.current < data.range.current.days || data.daysWithData.previous < data.range.previous.days) && (
            <SeoNotice kind="info" title="Some days have no stored rows">
              {data.daysWithData.current} of {data.range.current.days} days in this period and {data.daysWithData.previous} of{" "}
              {data.range.previous.days} in the previous period have data. A day can be empty because there were no
              impressions, or because it hasn’t been synced yet. Gaps in the charts are shown as gaps, not zeros.
            </SeoNotice>
          )}

          <section aria-label="Key metrics" className="grid grid-cols-2 xl:grid-cols-4 gap-4">
            {(() => {
              const cap = `Source: Search Console · ${data.range.label}, vs previous ${data.range.previous.days} days`;
              return (
                <>
                  <SeoKpiCard title="Organic clicks" value={formatInt(data.current.clicks)} caption={cap}
                    delta={deltaFor(data.current.clicks, data.previous.clicks)} />
                  <SeoKpiCard title="Impressions" value={formatInt(data.current.impressions)} caption={cap}
                    delta={deltaFor(data.current.impressions, data.previous.impressions)} />
                  <SeoKpiCard title="Average CTR" value={formatPct(data.current.ctr)} caption={cap}
                    hint="Clicks ÷ impressions"
                    delta={deltaFor(
                      data.current.ctr === null ? null : data.current.ctr * 100,
                      data.previous.ctr === null ? null : data.previous.ctr * 100,
                      { mode: "abs", digits: 2 }
                    )} />
                  <SeoKpiCard title="Average position" value={formatPosition(data.current.position)} caption={cap}
                    hint="Averaged across searches — not a fixed ranking. Lower is better."
                    delta={deltaFor(data.current.position, data.previous.position, { mode: "abs", lowerIsBetter: true })} />
                </>
              );
            })()}
          </section>

          <section aria-label="Trends" className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {(() => {
              const days = eachDay(data.range.current.start, data.range.current.end);
              return (
                <>
                  <SeoCard caption="Search Console · daily">
                    <SeoTrendChart title="Clicks" kind="int" points={series(data.trend, days, (p) => p.clicks)}
                      description="Daily organic clicks from Google Search." />
                  </SeoCard>
                  <SeoCard caption="Search Console · daily">
                    <SeoTrendChart title="Impressions" kind="int" points={series(data.trend, days, (p) => p.impressions)}
                      description="Daily search impressions." />
                  </SeoCard>
                  <SeoCard caption="Search Console · daily (clicks ÷ impressions)">
                    <SeoTrendChart title="CTR" kind="pct" points={series(data.trend, days, (p) => p.ctr)}
                      description="Daily click-through rate." />
                  </SeoCard>
                  <SeoCard caption="Search Console · daily, impression-weighted">
                    <SeoTrendChart title="Average position" kind="pos" invertY
                      points={series(data.trend, days, (p) => p.position)}
                      description="Daily average position. Lower is better, so better positions are drawn higher." />
                  </SeoCard>
                </>
              );
            })()}
          </section>

          <section aria-label="Breakdowns" className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <SeoCard title="Devices" caption={`Share of impressions · ${data.range.label}`}>
              <SeoBreakdownBars rows={data.devices} labelFor={(k) => DEVICE_LABELS[k] ?? k} />
            </SeoCard>
            <SeoCard title="Top countries" caption={`Share of impressions · ${data.range.label}`}>
              <SeoBreakdownBars rows={data.countries} labelFor={countryLabel} />
            </SeoCard>
          </section>

          <section aria-label="Top queries and pages" className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            <SeoCard
              title="Top search queries"
              caption="From the stored top queries per day. Google hides rare (anonymised) queries, so these rows do not add up to the totals above."
            >
              <table className="w-full text-xs">
                <caption className="sr-only">Top search queries by clicks</caption>
                <thead className="text-[#647581]">
                  <tr>
                    <th scope="col" className="py-1.5 text-left font-semibold">Query</th>
                    <th scope="col" className="py-1.5 text-right font-semibold">Clicks</th>
                    <th scope="col" className="py-1.5 text-right font-semibold">Impr.</th>
                  </tr>
                </thead>
                <tbody>
                  {data.topQueries.length === 0 && (
                    <tr><td colSpan={3} className="py-3 text-[#647581]">No query rows in this period.</td></tr>
                  )}
                  {data.topQueries.map((q) => (
                    <tr key={q.query} className="border-t border-[rgba(7,26,40,0.06)]">
                      <td className="py-1.5 pr-3 text-[#071a28] break-words">{q.query}</td>
                      <td className="py-1.5 text-right tabular-nums">{formatInt(q.clicks)}</td>
                      <td className="py-1.5 text-right tabular-nums text-[#647581]">{formatInt(q.impressions)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </SeoCard>

            <SeoCard
              title="Top landing pages"
              caption="Summed from the same stored query rows, so a page's figures can be lower than Search Console's page report."
            >
              <table className="w-full text-xs">
                <caption className="sr-only">Top landing pages by clicks</caption>
                <thead className="text-[#647581]">
                  <tr>
                    <th scope="col" className="py-1.5 text-left font-semibold">Page</th>
                    <th scope="col" className="py-1.5 text-right font-semibold">Clicks</th>
                    <th scope="col" className="py-1.5 text-right font-semibold">Impr.</th>
                  </tr>
                </thead>
                <tbody>
                  {data.topPages.length === 0 && (
                    <tr><td colSpan={3} className="py-3 text-[#647581]">No page rows in this period.</td></tr>
                  )}
                  {data.topPages.map((p) => (
                    <tr key={p.path} className="border-t border-[rgba(7,26,40,0.06)]">
                      <td className="py-1.5 pr-3 break-all">
                        <a href={`${siteConfig.url}${p.path === "/" ? "" : p.path}`} target="_blank" rel="noopener noreferrer"
                          className="text-[#071a28] hover:text-[#0088cc]">
                          {p.path}
                        </a>
                        <span className="block text-[10px] text-[#647581]">{PAGE_CATEGORY_LABELS[p.category]}</span>
                      </td>
                      <td className="py-1.5 text-right tabular-nums">{formatInt(p.clicks)}</td>
                      <td className="py-1.5 text-right tabular-nums text-[#647581]">{formatInt(p.impressions)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </SeoCard>
          </section>
        </>
      )}

      <SeoCard title="Technical health" caption="From the latest technical scan of your own site. Not a Google measurement.">
        {tech?.lastRun ? (
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-[#647581]">
            <p>
              <span className="font-serif text-xl font-bold text-[#071a28] tabular-nums">{tech.open.total}</span> open issue
              {tech.open.total === 1 ? "" : "s"} ({tech.open.HIGH} high · {tech.open.MEDIUM} medium · {tech.open.LOW} low) ·{" "}
              {tech.newInLastScan} new · last scan {new Date(tech.lastRun.finishedAt ?? tech.lastRun.startedAt).toLocaleDateString("en-IN", { dateStyle: "medium", timeZone: "Asia/Kolkata" })}
              {tech.lastRun.completed ? "" : " (incomplete)"}
            </p>
            <Link href="/dashboard/seo/technical" className="font-semibold text-[#0088cc] hover:underline">View technical findings</Link>
          </div>
        ) : (
          <p className="text-xs text-[#647581]">
            No technical scan has run yet.{" "}
            <Link href="/dashboard/seo/technical" className="font-semibold text-[#0088cc] hover:underline">Open technical monitoring</Link>
          </p>
        )}
      </SeoCard>

      <SeoCard title="Not connected yet" caption="These need separate approvals and credentials. No placeholder numbers are shown.">
        <ul className="text-xs text-[#647581] grid sm:grid-cols-2 gap-x-6 gap-y-1 list-disc pl-4">
          <li>Organic sessions and conversions (Google Analytics 4)</li>
          <li>Indexed URL counts (URL Inspection)</li>
          <li>Core Web Vitals field data (PageSpeed / CrUX)</li>
        </ul>
      </SeoCard>
    </div>
  );
}

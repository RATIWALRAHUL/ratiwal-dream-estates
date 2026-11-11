import "server-only";

import type { Metadata } from "next";
import Link from "next/link";
import { getSeoAccess } from "@/lib/seo-analytics/access";
import { SeoGscQueryService } from "@/lib/services/seo-gsc-query.service";
import { latestReliableDate, resolveRange } from "@/lib/seo-analytics/dates";
import { PAGE_CATEGORIES, PAGE_CATEGORY_LABELS } from "@/lib/seo-analytics/classify";
import { formatInt, formatPct, formatPosition } from "@/lib/seo-analytics/metrics";
import { ValidationError } from "@/lib/api/errors";
import { siteConfig } from "@/config/site";
import type { PagesResult, SeoRangeInfo } from "@/types/seo-analytics";
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
import { buildHref, deltaFor, firstParam, positiveInt, rangeParams } from "@/components/dashboard/seo/seo-ui";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Landing Page Performance | SEO | Ratiwal Dashboard",
  robots: { index: false, follow: false },
};

const BASE = "/dashboard/seo/pages";

export default async function SeoPagesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const access = await getSeoAccess();
  const sp = await searchParams;

  const header = (
    <SeoHeader
      active="pages"
      title="Landing page performance"
      subtitle="Which pages Google sends organic visitors to, grouped by page type. Search Console data only; website sessions and conversions arrive with Google Analytics."
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
  const category = firstParam(sp.category) ?? "";
  const sort = firstParam(sp.sort) ?? "clicks";
  const dir = firstParam(sp.dir) === "asc" ? "asc" : "desc";
  const page = positiveInt(firstParam(sp.page), 1);
  const input = { preset: firstParam(sp.preset), from: firstParam(sp.from), to: firstParam(sp.to) };
  const maxDate = latestReliableDate();

  let result: PagesResult | null = null;
  let notice: { kind: "warning" | "error"; title: string; body: string } | null = null;
  let fallbackRange: SeoRangeInfo | null = null;
  try {
    result = await SeoGscQueryService.getPages({ ...input, q, category, sort, dir, page, pageSize: 25 });
  } catch (e) {
    if (e instanceof ValidationError) {
      fallbackRange = resolveRange({ preset: "28d" }, maxDate);
      notice = { kind: "warning", title: "Check the date range", body: e.message };
    } else {
      notice = { kind: "error", title: "Couldn't load page data", body: "Something went wrong while reading stored data. Try again shortly." };
    }
  }

  const range = result?.range ?? fallbackRange;
  const keep = { ...(range ? rangeParams(range) : {}), q, category };

  return (
    <div className="space-y-6">
      {header}
      {notice && <SeoNotice kind={notice.kind} title={notice.title}>{notice.body}</SeoNotice>}
      {range && <SeoRangeFilter base={BASE} range={range} maxDate={maxDate} extraParams={{ q, category }} />}

      {result && result.categories.length === 0 && !q && !category && (
        <SeoEmptyState title="No landing page data for this period">
          Page rows appear after Search Console has been connected and synced on the{" "}
          <Link href="/dashboard/seo" className="underline">Overview</Link> page.
        </SeoEmptyState>
      )}

      {result && (result.categories.length > 0 || q || category) && (
        <>
          <section aria-label="Page groups" className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {result.categories.map((c) => {
              const d = deltaFor(c.clicks, c.prevClicks);
              const active = category === c.category;
              return (
                <Link
                  key={c.category}
                  href={buildHref(BASE, { ...rangeParams(result.range), q, category: active ? undefined : c.category })}
                  aria-current={active ? "true" : undefined}
                  className={`rounded-2xl border p-4 transition ${
                    active ? "border-[#0088cc] bg-sky-50" : "border-[rgba(7,26,40,0.08)] bg-white hover:border-[#087fc3]/40"
                  }`}
                >
                  <p className="text-[10px] font-mono uppercase tracking-widest text-[#647581] font-bold">
                    {PAGE_CATEGORY_LABELS[c.category]}
                  </p>
                  <p className="mt-1 font-serif text-xl font-bold text-[#071a28] tabular-nums">{formatInt(c.clicks)}</p>
                  <p className="text-[10px] text-[#647581]">
                    clicks · {formatInt(c.impressions)} impr. · {c.pages} page{c.pages === 1 ? "" : "s"}
                  </p>
                  <p className={`text-[10px] font-semibold mt-1 ${d.tone === "good" ? "text-emerald-700" : d.tone === "bad" ? "text-rose-700" : "text-[#647581]"}`}>
                    {d.text} vs prev.
                  </p>
                </Link>
              );
            })}
          </section>

          <SeoCard>
            <form method="get" action={BASE} className="flex flex-wrap items-end gap-2 mb-4">
              {Object.entries(rangeParams(result.range)).map(([k, v]) => (
                <input key={k} type="hidden" name={k} value={v} />
              ))}
              <label className="text-[11px] text-[#647581] font-semibold">
                Page path
                <input
                  type="search"
                  name="q"
                  defaultValue={q}
                  maxLength={100}
                  placeholder="e.g. /locations"
                  className="mt-0.5 block w-56 rounded-lg border border-[rgba(7,26,40,0.12)] bg-white px-2 py-1.5 text-xs text-[#071a28]"
                />
              </label>
              <label className="text-[11px] text-[#647581] font-semibold">
                Page type
                <select
                  name="category"
                  defaultValue={category}
                  className="mt-0.5 block rounded-lg border border-[rgba(7,26,40,0.12)] bg-white px-2 py-1.5 text-xs text-[#071a28]"
                >
                  <option value="">All</option>
                  {PAGE_CATEGORIES.map((c) => (
                    <option key={c} value={c}>{PAGE_CATEGORY_LABELS[c]}</option>
                  ))}
                </select>
              </label>
              <button type="submit" className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-[rgba(7,26,40,0.12)] bg-white text-[#071a28] hover:bg-stone-50">
                Filter
              </button>
              {(q || category) && (
                <Link href={buildHref(BASE, rangeParams(result.range))} className="px-2 py-1.5 text-xs text-[#647581] hover:text-[#071a28]">
                  Clear
                </Link>
              )}
            </form>

            <div className="overflow-x-auto -mx-5 px-5">
              <table className="w-full text-xs min-w-[760px]">
                <caption className="sr-only">
                  Landing pages for {result.range.label} compared with the previous {result.range.previous.days} days
                </caption>
                <thead className="text-[#647581] border-b border-[rgba(7,26,40,0.08)]">
                  <tr>
                    <SortHeader label="Page" field="path" base={BASE} params={keep} currentSort={sort} currentDir={dir} align="left" />
                    <SortHeader label="Clicks" field="clicks" base={BASE} params={keep} currentSort={sort} currentDir={dir} />
                    <SortHeader label="Impr." field="impressions" base={BASE} params={keep} currentSort={sort} currentDir={dir} />
                    <SortHeader label="CTR" field="ctr" base={BASE} params={keep} currentSort={sort} currentDir={dir} />
                    <SortHeader label="Avg pos." field="position" base={BASE} params={keep} currentSort={sort} currentDir={dir} />
                    <SortHeader label="Clicks vs prev." field="change" base={BASE} params={keep} currentSort={sort} currentDir={dir} />
                    <th scope="col" className="px-3 py-2.5 text-right font-semibold">Queries</th>
                    <th scope="col" className="px-3 py-2.5 text-left font-semibold">Top query</th>
                  </tr>
                </thead>
                <tbody>
                  {result.rows.length === 0 && (
                    <tr><td colSpan={8} className="px-3 py-6 text-center text-[#647581]">No pages match these filters.</td></tr>
                  )}
                  {result.rows.map((r) => (
                    <tr key={r.path} className="border-t border-[rgba(7,26,40,0.06)] align-top">
                      <td className="px-3 py-2 max-w-[280px] break-all">
                        <a
                          href={`${siteConfig.url}${r.path === "/" ? "" : r.path}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#071a28] font-medium hover:text-[#0088cc]"
                        >
                          {r.path}
                        </a>
                        <span className="block text-[10px] text-[#647581]">{PAGE_CATEGORY_LABELS[r.category]}</span>
                      </td>
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
                      <td className="px-3 py-2 text-right tabular-nums">{formatInt(r.queryCount)}</td>
                      <td className="px-3 py-2 max-w-[220px] break-words text-[#647581]">{r.topQuery ?? "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <SeoPagination base={BASE} params={{ ...keep, sort, dir }} page={result.page} totalPages={result.totalPages} total={result.total} />
            <p className="mt-3 text-[11px] text-[#647581]">
              Source: Search Console · {result.range.label}. Page figures are summed from stored top queries, and Google
              hides rare queries, so a page can show fewer clicks here than in Search Console’s page report. Indexability,
              technical issues, sessions and conversions are not shown because they are not connected yet.
            </p>
          </SeoCard>
        </>
      )}
    </div>
  );
}

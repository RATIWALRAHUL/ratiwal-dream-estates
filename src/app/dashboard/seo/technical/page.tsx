import "server-only";

import type { Metadata } from "next";
import Link from "next/link";
import { getSeoAccess } from "@/lib/seo-analytics/access";
import { SeoTechnicalService, type TechSummaryView, type TechIssueRow } from "@/lib/services/seo-technical.service";
import { TECH_ISSUE_TYPES } from "@/lib/seo-analytics/tech-scanner";
import { siteConfig } from "@/config/site";
import {
  SeoHeader,
  SeoNotice,
  SeoEmptyState,
  SeoPermissionDenied,
  SeoCard,
  SeoPagination,
} from "@/components/dashboard/seo/SeoChrome";
import { SeoScanControls } from "@/components/dashboard/seo/SeoScanControls";
import { buildHref, firstParam, positiveInt } from "@/components/dashboard/seo/seo-ui";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Technical SEO Monitoring | SEO | Ratiwal Dashboard",
  robots: { index: false, follow: false },
};

const BASE = "/dashboard/seo/technical";
const STATES = [
  { id: "open", label: "All open" },
  { id: "new", label: "New" },
  { id: "ongoing", label: "Ongoing" },
  { id: "resolved", label: "Resolved" },
] as const;

const SEV_STYLE = {
  HIGH: "bg-rose-50 text-rose-800",
  MEDIUM: "bg-amber-50 text-amber-800",
  LOW: "bg-stone-100 text-[#647581]",
} as const;
const STATE_STYLE = {
  NEW: "bg-sky-50 text-sky-800",
  ONGOING: "bg-stone-100 text-[#647581]",
  RESOLVED: "bg-emerald-50 text-emerald-800",
} as const;

function when(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Kolkata" }) + " IST";
}

function Stat({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="bg-white rounded-2xl border border-[rgba(7,26,40,0.08)] shadow-xs p-5">
      <p className="text-[10px] font-mono uppercase tracking-widest text-[#647581] font-bold">{label}</p>
      <p className="mt-2 text-2xl sm:text-3xl font-bold font-serif text-[#071a28] tabular-nums">{value}</p>
      {sub && <p className="mt-1 text-[10px] text-[#647581] leading-snug">{sub}</p>}
    </div>
  );
}

export default async function SeoTechnicalPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const access = await getSeoAccess();
  const sp = await searchParams;

  const header = (
    <SeoHeader
      active="technical"
      title="Technical SEO monitoring"
      subtitle="A controlled, read-only check of your live site's crawlability, metadata and structured data. It reports findings; it never changes anything."
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

  const state = firstParam(sp.state) ?? "open";
  const severity = firstParam(sp.severity) ?? "";
  const type = firstParam(sp.type) ?? "";
  const page = positiveInt(firstParam(sp.page), 1);

  let summary: TechSummaryView | null = null;
  let list: Awaited<ReturnType<typeof SeoTechnicalService.listIssues>> | null = null;
  let failed = false;
  try {
    [summary, list] = await Promise.all([
      SeoTechnicalService.getSummary(),
      SeoTechnicalService.listIssues({ state, severity, type, page, pageSize: 25 }),
    ]);
  } catch {
    failed = true;
  }

  const keep = { state, severity, type };
  const last = summary?.lastRun ?? null;
  const neverScanned = !!summary && !last;

  return (
    <div className="space-y-6">
      {header}

      {failed && (
        <SeoNotice kind="error" title="Couldn't load technical findings">
          The database may be unavailable. Try again shortly.
        </SeoNotice>
      )}

      <SeoCard>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-1 text-[11px] text-[#647581]">
            <h2 className="text-sm font-bold text-[#071a28]">Scan status</h2>
            {last ? (
              <>
                <p>
                  Last scan: <span className="text-[#071a28]">{when(last.finishedAt ?? last.startedAt)}</span> ·{" "}
                  <span className="text-[#071a28]">{last.status}</span> · {last.urlsChecked} of {last.urlsPlanned} pages ·{" "}
                  {last.requests} requests
                </p>
                <p className="break-all">Target: {last.baseUrl}</p>
              </>
            ) : (
              <p>No scan has run yet.</p>
            )}
            <p className="max-w-xl">
              A scan reads your sitemap pages (about 40) plus their internal links and images, 3 requests at a time, with an
              8-second timeout each and a hard request cap. The target is always {siteConfig.url}, never user input.
            </p>
          </div>
          <SeoScanControls canScan={access.canSync} />
        </div>
      </SeoCard>

      {last && !last.completed && last.status !== "FAILED" && (
        <SeoNotice kind="warning" title="The last scan was incomplete">
          It stopped early ({last.stoppedReason ?? "limit reached"}). Findings from it are shown, but no existing issue was
          marked resolved, because an incomplete scan can’t prove something is fixed.
        </SeoNotice>
      )}
      {last?.status === "FAILED" && (
        <SeoNotice kind="error" title="The last scan failed">Run it again; if it keeps failing, check server logs.</SeoNotice>
      )}

      {neverScanned && (
        <SeoEmptyState title="No technical scan yet">
          {access.canSync
            ? "Run your first scan above. Nothing is shown until a real scan completes."
            : "A Super Admin needs to run the first scan. Nothing is shown until a real scan completes."}
        </SeoEmptyState>
      )}

      {summary && last && (
        <section aria-label="Issue summary" className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          <Stat label="Open issues" value={summary.open.total} sub={`${summary.open.HIGH} high · ${summary.open.MEDIUM} medium · ${summary.open.LOW} low`} />
          <Stat label="New in last scan" value={summary.newInLastScan} sub="First seen in the most recent scan" />
          <Stat label="Ongoing" value={summary.ongoing} sub="Seen in an earlier scan and still present" />
          <Stat label="Resolved in last scan" value={summary.resolvedInLastScan} sub={`${summary.resolvedTotal} resolved in total (kept 12 months)`} />
        </section>
      )}

      {summary && last && list && (
        <SeoCard>
          <div className="flex flex-wrap items-end justify-between gap-3 mb-4">
            <div role="group" aria-label="Issue state" className="inline-flex rounded-xl border border-[rgba(7,26,40,0.12)] bg-white p-0.5">
              {STATES.map((s) => (
                <Link
                  key={s.id}
                  href={buildHref(BASE, { severity, type, state: s.id })}
                  aria-current={state === s.id ? "true" : undefined}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-[10px] ${
                    state === s.id ? "bg-[#071a28] text-white" : "text-[#647581] hover:text-[#071a28]"
                  }`}
                >
                  {s.label}
                </Link>
              ))}
            </div>
            <form method="get" action={BASE} className="flex flex-wrap items-end gap-2">
              <input type="hidden" name="state" value={state} />
              <label className="text-[11px] text-[#647581] font-semibold">
                Severity
                <select name="severity" defaultValue={severity} className="mt-0.5 block rounded-lg border border-[rgba(7,26,40,0.12)] bg-white px-2 py-1.5 text-xs text-[#071a28]">
                  <option value="">All</option>
                  <option value="HIGH">High</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="LOW">Low</option>
                </select>
              </label>
              <label className="text-[11px] text-[#647581] font-semibold">
                Check
                <select name="type" defaultValue={type} className="mt-0.5 block max-w-[240px] rounded-lg border border-[rgba(7,26,40,0.12)] bg-white px-2 py-1.5 text-xs text-[#071a28]">
                  <option value="">All checks</option>
                  {Object.entries(TECH_ISSUE_TYPES).map(([k, v]) => (
                    <option key={k} value={k}>{v.label}</option>
                  ))}
                </select>
              </label>
              <button type="submit" className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-[rgba(7,26,40,0.12)] bg-white text-[#071a28] hover:bg-stone-50">
                Filter
              </button>
            </form>
          </div>

          {list.total === 0 ? (
            <div className="py-8 text-center text-sm text-[#647581]">
              {state === "open" && !severity && !type && last.completed
                ? "No open issues. The last complete scan found nothing in the checks listed below."
                : "No issues match these filters."}
            </div>
          ) : (
            <div className="overflow-x-auto -mx-5 px-5">
              <table className="w-full text-xs min-w-[820px]">
                <caption className="sr-only">Technical SEO findings</caption>
                <thead className="text-[#647581] border-b border-[rgba(7,26,40,0.08)]">
                  <tr>
                    <th scope="col" className="px-3 py-2.5 text-left font-semibold">Severity</th>
                    <th scope="col" className="px-3 py-2.5 text-left font-semibold">Issue</th>
                    <th scope="col" className="px-3 py-2.5 text-left font-semibold">URL</th>
                    <th scope="col" className="px-3 py-2.5 text-left font-semibold">State</th>
                    <th scope="col" className="px-3 py-2.5 text-left font-semibold">First seen</th>
                    <th scope="col" className="px-3 py-2.5 text-left font-semibold">{state === "resolved" ? "Resolved" : "Last seen"}</th>
                  </tr>
                </thead>
                <tbody>
                  {list.rows.map((r: TechIssueRow) => (
                    <tr key={r.id} className="border-t border-[rgba(7,26,40,0.06)] align-top">
                      <td className="px-3 py-2">
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${SEV_STYLE[r.severity]}`}>{r.severity}</span>
                      </td>
                      <td className="px-3 py-2 max-w-[320px]">
                        <p className="font-semibold text-[#071a28]">{r.typeLabel}</p>
                        <p className="text-[#647581] mt-0.5 break-words">{r.message}</p>
                      </td>
                      <td className="px-3 py-2 max-w-[240px] break-all">
                        {isHttpUrl(r.url) ? (
                          <a href={r.url} target="_blank" rel="noopener noreferrer" className="text-[#071a28] hover:text-[#0088cc]">
                            {safePath(r.url)}
                          </a>
                        ) : (
                          <span className="text-[#071a28]">{safePath(r.url)}</span>
                        )}
                      </td>
                      <td className="px-3 py-2">
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${STATE_STYLE[r.state]}`}>{r.state}</span>
                        {r.state !== "RESOLVED" && r.timesSeen > 1 && (
                          <span className="block text-[10px] text-[#647581] mt-0.5">seen in {r.timesSeen} scans</span>
                        )}
                      </td>
                      <td className="px-3 py-2 text-[#647581] whitespace-nowrap">{when(r.firstSeenAt)}</td>
                      <td className="px-3 py-2 text-[#647581] whitespace-nowrap">{when(state === "resolved" ? r.resolvedAt : r.lastSeenAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <SeoPagination base={BASE} params={keep} page={list.page} totalPages={list.totalPages} total={list.total} />
        </SeoCard>
      )}

      <SeoCard title="What this scan checks — and what it can't" caption="Know the limits before you trust a clean result.">
        <div className="grid md:grid-cols-2 gap-6 text-xs text-[#647581] leading-relaxed">
          <div>
            <p className="font-semibold text-[#071a28] mb-1">Checks (sitemap pages and their internal links)</p>
            <ul className="list-disc pl-4 space-y-0.5">
              <li>HTTP 404 / 5xx, timeouts, redirects and redirect chains</li>
              <li>Broken internal links and missing internal images</li>
              <li>Canonical missing, multiple, or pointing elsewhere</li>
              <li>Missing / odd-length titles and descriptions; duplicates</li>
              <li>H1 present, single H1</li>
              <li>robots.txt (reachable, Sitemap line, /_next/ not blocked, sitemap URLs allowed) and noindex (meta and header)</li>
              <li>Sitemap validity, duplicate URLs, wrong origin, bad dates, non-www → www redirect</li>
              <li>og:image present, absolute https, file reachable</li>
              <li>JSON-LD syntax and @type</li>
            </ul>
          </div>
          <div>
            <p className="font-semibold text-[#071a28] mb-1">Not covered</p>
            <ul className="list-disc pl-4 space-y-0.5">
              <li>Whether Google has actually indexed a page (needs URL Inspection, not connected)</li>
              <li>Content added by browser JavaScript (we read server-rendered HTML)</li>
              <li>External links and images hosted on other domains (e.g. image CDNs)</li>
              <li>Login-protected pages, which are never crawled</li>
              <li>Schema.org property completeness or Google rich-result eligibility</li>
              <li>Pages that are not in the sitemap and not linked from it</li>
            </ul>
          </div>
        </div>
      </SeoCard>
    </div>
  );
}

/** Only ever render http(s) URLs as links (defence in depth for stored values). */
function isHttpUrl(url: string): boolean {
  return url.startsWith("https://") || url.startsWith("http://");
}

function safePath(url: string): string {
  try {
    const u = new URL(url);
    return u.pathname + u.search || "/";
  } catch {
    return url;
  }
}

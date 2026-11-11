/**
 * Unit tests for the Phase 4A SEO analytics pure logic (no network, no database).
 *
 * Run: npx tsx scripts/test-seo-analytics.ts
 *
 * Covers: date-range resolution, page/intent classification, metric maths,
 * opportunity rules, CSV formula-injection safety, and delta/URL UI helpers.
 */
import {
  addDays,
  daysInclusive,
  eachDay,
  isYmd,
  latestReliableDate,
  resolveRange,
  MAX_RANGE_DAYS,
} from "../src/lib/seo-analytics/dates";
import { classifyPage, classifySearchIntent, normalizePagePath } from "../src/lib/seo-analytics/classify";
import { addRow, emptyAccumulator, finalizeTotals, pctChange } from "../src/lib/seo-analytics/metrics";
import { computeOpportunities, type OpportunityInput } from "../src/lib/seo-analytics/opportunities";
import { csvCell, toCsv } from "../src/lib/seo-analytics/csv";
import { buildHref, deltaFor, overlapsLoggingIssue } from "../src/components/dashboard/seo/seo-ui";

let failures = 0;
function check(name: string, condition: boolean, detail = "") {
  if (!condition) failures++;
  console.log(`${condition ? "PASS" : "FAIL"}  ${name}${detail ? `  ${detail}` : ""}`);
}
function throws(fn: () => unknown): boolean {
  try {
    fn();
    return false;
  } catch {
    return true;
  }
}

// ── Dates ────────────────────────────────────────────────────────────────────
check("isYmd accepts a real date", isYmd("2026-11-08"));
check("isYmd rejects impossible date", !isYmd("2026-02-30"));
check("isYmd rejects garbage", !isYmd("hello") && !isYmd(undefined));
check("addDays crosses month", addDays("2026-01-31", 1) === "2026-02-01");
check("daysInclusive counts both ends", daysInclusive("2026-11-01", "2026-11-07") === 7);
check("eachDay length", eachDay("2026-11-01", "2026-11-10").length === 10);
check("latestReliableDate lags 3 days", latestReliableDate(new Date("2026-11-11T12:00:00Z")) === "2026-11-08");

const r28 = resolveRange({ preset: "28d" }, "2026-11-08");
check("28d current window is 28 days ending at latest", r28.current.days === 28 && r28.current.end === "2026-11-08");
check("28d previous window is adjacent + equal length", r28.previous.end === addDays(r28.current.start, -1) && r28.previous.days === 28);
const r7 = resolveRange({ preset: "7d" }, "2026-11-08");
check("7d windows", r7.current.days === 7 && r7.previous.days === 7 && r7.current.start === "2026-11-02");
const r90 = resolveRange({ preset: "90d" }, "2026-11-08");
check("90d windows", r90.current.days === 90 && r90.previous.days === 90);
check("unknown preset falls back to 28d", resolveRange({ preset: "bogus" }, "2026-11-08").preset === "28d");

const rc = resolveRange({ preset: "custom", from: "2026-10-01", to: "2026-10-10" }, "2026-11-08");
check("custom window + equal previous", rc.current.days === 10 && rc.previous.days === 10 && rc.previous.end === "2026-09-30");
check("custom rejects missing dates", throws(() => resolveRange({ preset: "custom" }, "2026-11-08")));
check("custom rejects from > to", throws(() => resolveRange({ preset: "custom", from: "2026-10-10", to: "2026-10-01" }, "2026-11-08")));
check("custom rejects future/unfinalised end", throws(() => resolveRange({ preset: "custom", from: "2026-11-01", to: "2026-11-10" }, "2026-11-08")));
check(
  `custom rejects > ${MAX_RANGE_DAYS} days`,
  throws(() => resolveRange({ preset: "custom", from: "2024-01-01", to: "2026-11-01" }, "2026-11-08"))
);
check("custom rejects non-date strings (injection-ish)", throws(() => resolveRange({ preset: "custom", from: "$gt", to: "2026-11-01" }, "2026-11-08")));

// ── Classification ───────────────────────────────────────────────────────────
check("home", classifyPage("/") === "HOMEPAGE");
check("listing", classifyPage("/properties") === "PROPERTY_LISTING");
check("detail", classifyPage("/properties/riyasat-paradise-ii") === "PROPERTY_DETAIL");
check("locations index + detail", classifyPage("/locations") === "LOCATION" && classifyPage("/locations/jaipur") === "LOCATION");
check("insights", classifyPage("/insights/section-90a-land-conversion-rajasthan") === "INSIGHT");
check("testimonials", classifyPage("/testimonials/abc") === "TESTIMONIAL");
check("contact/info", classifyPage("/contact") === "CONTACT_INFO" && classifyPage("/privacy-policy") === "CONTACT_INFO");
check("unknown -> OTHER", classifyPage("/something-else") === "OTHER");
check("trailing slash ignored", classifyPage("/properties/") === "PROPERTY_LISTING");
check(
  "normalizePagePath strips host, query, hash, trailing slash",
  normalizePagePath("https://www.ratiwaldreamestates.com/locations/jaipur/?utm=x#top") === "/locations/jaipur"
);
check("normalizePagePath root", normalizePagePath("https://www.ratiwaldreamestates.com/") === "/");

check("intent brand", classifySearchIntent("Ratiwal Dream Estates reviews") === "BRAND");
check("intent informational (question)", classifySearchIntent("how to convert agricultural land 90a") === "INFORMATIONAL");
check("intent informational (keyword)", classifySearchIntent("jda patta types") === "INFORMATIONAL");
check("intent transactional", classifySearchIntent("buy plot in jaipur") === "TRANSACTIONAL");
check("intent commercial", classifySearchIntent("jda approved plots tonk road") === "COMMERCIAL");
check("intent other", classifySearchIntent("weather tomorrow") === "OTHER");

// ── Metrics ──────────────────────────────────────────────────────────────────
const acc = emptyAccumulator();
addRow(acc, { clicks: 10, impressions: 100, position: 2 });
addRow(acc, { clicks: 0, impressions: 300, position: 10 });
const t = finalizeTotals(acc);
check("CTR from summed totals (not average of CTRs)", Math.abs((t.ctr ?? 0) - 10 / 400) < 1e-9);
check("position is impression-weighted", Math.abs((t.position ?? 0) - (2 * 100 + 10 * 300) / 400) < 1e-9, `got ${t.position}`);
const z = finalizeTotals(emptyAccumulator());
check("no impressions -> null CTR/position (not 0)", z.ctr === null && z.position === null);
check("pctChange basic", pctChange(150, 100) === 50);
check("pctChange null when no baseline", pctChange(5, 0) === null && pctChange(5, null) === null);

// ── Opportunities ────────────────────────────────────────────────────────────
const base: OpportunityInput = {
  clicks: 20,
  impressions: 1000,
  ctr: 0.02,
  position: 8,
  prev: null,
  intent: "COMMERCIAL",
  topPageCategory: "PROPERTY_LISTING",
  pageImpressions: [1000],
};
check("no flags on a healthy row", computeOpportunities(base).length === 0);
check("LOW_CTR flagged", computeOpportunities({ ...base, ctr: 0.005, clicks: 5 }).includes("LOW_CTR"));
check("LOW_CTR needs min impressions", !computeOpportunities({ ...base, impressions: 50, ctr: 0.001 }).includes("LOW_CTR"));
check(
  "DECLINING flagged",
  computeOpportunities({ ...base, clicks: 3, prev: { clicks: 20, impressions: 500, position: 8 } }).includes("DECLINING")
);
check(
  "DECLINING ignores tiny baselines",
  !computeOpportunities({ ...base, clicks: 0, prev: { clicks: 2, impressions: 500, position: 8 } }).includes("DECLINING")
);
check(
  "IMPROVING flagged",
  computeOpportunities({ ...base, position: 5, prev: { clicks: 5, impressions: 200, position: 9 } }).includes("IMPROVING")
);
check(
  "WEAK_LANDING_MATCH flagged for non-brand on homepage",
  computeOpportunities({ ...base, topPageCategory: "HOMEPAGE", impressions: 100 }).includes("WEAK_LANDING_MATCH")
);
check(
  "WEAK_LANDING_MATCH skips brand queries",
  !computeOpportunities({ ...base, intent: "BRAND", topPageCategory: "HOMEPAGE" }).includes("WEAK_LANDING_MATCH")
);
check(
  "CANNIBALIZATION flagged when two pages split impressions",
  computeOpportunities({ ...base, pageImpressions: [600, 400] }).includes("CANNIBALIZATION")
);
check(
  "CANNIBALIZATION ignores a negligible second page",
  !computeOpportunities({ ...base, pageImpressions: [950, 50] }).includes("CANNIBALIZATION")
);

// ── CSV safety ───────────────────────────────────────────────────────────────
check("csv neutralises =", csvCell("=HYPERLINK(\"http://x\")").startsWith("\"'=") || csvCell("=1+1").startsWith("'="));
check("csv neutralises + - @", csvCell("+1").startsWith("'+") && csvCell("-1").startsWith("'-") && csvCell("@SUM").startsWith("'@"));
check("csv leaves numbers alone (incl. negatives)", csvCell(-5) === "-5" && csvCell(12.5) === "12.5");
check("csv quotes commas and quotes", csvCell('a,"b"') === '"a,""b"""');
check("csv null/undefined -> empty", csvCell(null) === "" && csvCell(undefined) === "");
const csv = toCsv(["q", "n"], [["=cmd", 1]]);
check("toCsv has BOM, header, safe row, CRLF", csv.startsWith("﻿") && csv.includes("q,n\r\n'=cmd,1\r\n"));

// ── UI helpers ───────────────────────────────────────────────────────────────
check("delta up is good by default", deltaFor(110, 100).tone === "good" && deltaFor(110, 100).text === "+10.0%");
check("delta down is bad by default", deltaFor(90, 100).tone === "bad");
check("delta lowerIsBetter inverts", deltaFor(8, 10, { mode: "abs", lowerIsBetter: true }).tone === "good");
check("delta no baseline is explicit, not a made-up percent", deltaFor(5, 0).tone === "none" && deltaFor(null, 5).text === "No comparison data");
check("delta flat", deltaFor(100, 100).tone === "flat");
check("buildHref drops empty params", buildHref("/x", { a: "1", b: "", c: undefined }) === "/x?a=1");
check("buildHref no params", buildHref("/x", {}) === "/x");
check(
  "overlapsLoggingIssue detects window",
  overlapsLoggingIssue({ ...resolveRange({ preset: "custom", from: "2026-03-01", to: "2026-03-31" }, "2026-11-08") }) &&
    !overlapsLoggingIssue(resolveRange({ preset: "28d" }, "2026-11-08"))
);

console.log(failures === 0 ? "\nAll SEO analytics tests passed." : `\n${failures} test(s) FAILED.`);
process.exit(failures === 0 ? 0 : 1);

import type { SeoRangeInfo } from "@/types/seo-analytics";

export type DeltaTone = "good" | "bad" | "flat" | "none";
export interface DeltaView {
  text: string;
  tone: DeltaTone;
}

/**
 * Builds a human delta label. Returns tone "none" (no badge colour, explicit text)
 * when there is no honest baseline instead of inventing a percentage.
 */
export function deltaFor(
  current: number | null,
  previous: number | null,
  opts: { lowerIsBetter?: boolean; mode?: "pct" | "abs"; digits?: number } = {}
): DeltaView {
  const { lowerIsBetter = false, mode = "pct", digits = 1 } = opts;
  if (current === null || previous === null) return { text: "No comparison data", tone: "none" };
  if (mode === "pct") {
    if (previous === 0) return { text: current === 0 ? "No change" : "New vs. previous period", tone: current === 0 ? "flat" : "none" };
    const pct = ((current - previous) / previous) * 100;
    if (Math.abs(pct) < 0.05) return { text: "No change", tone: "flat" };
    const up = pct > 0;
    const good = lowerIsBetter ? !up : up;
    return { text: `${up ? "+" : "−"}${Math.abs(pct).toFixed(digits)}%`, tone: good ? "good" : "bad" };
  }
  const diff = current - previous;
  if (Math.abs(diff) < 0.05) return { text: "No change", tone: "flat" };
  const up = diff > 0;
  const good = lowerIsBetter ? !up : up;
  return { text: `${up ? "+" : "−"}${Math.abs(diff).toFixed(digits)}`, tone: good ? "good" : "bad" };
}

export function buildHref(base: string, params: Record<string, string | number | undefined | null>): string {
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null && v !== "") sp.set(k, String(v));
  }
  const qs = sp.toString();
  return qs ? `${base}?${qs}` : base;
}

export function rangeParams(range: SeoRangeInfo): Record<string, string> {
  return range.preset === "custom"
    ? { preset: "custom", from: range.current.start, to: range.current.end }
    : { preset: range.preset };
}

/** Search Console logged impressions/CTR/position incorrectly 2025-05-13 → 2026-04-27 (not backfilled). */
export const GSC_LOGGING_ISSUE = { start: "2025-05-13", end: "2026-04-27" } as const;

export function overlapsLoggingIssue(range: SeoRangeInfo): boolean {
  return range.previous.start <= GSC_LOGGING_ISSUE.end && range.current.end >= GSC_LOGGING_ISSUE.start;
}

export function firstParam(v: string | string[] | undefined): string | undefined {
  return Array.isArray(v) ? v[0] : v;
}

export function positiveInt(v: string | undefined, fallback: number): number {
  const n = Number.parseInt(v ?? "", 10);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

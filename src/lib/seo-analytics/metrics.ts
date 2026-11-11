/**
 * Metric maths for Search Console data.
 *
 * - CTR is always recomputed from summed clicks / summed impressions
 *   (never an average of per-row CTRs).
 * - Average position is impression-weighted. It is an AVERAGE across
 *   searches, not a fixed keyword ranking.
 */

export interface Totals {
  clicks: number;
  impressions: number;
  /** clicks / impressions, or null if there were no impressions. */
  ctr: number | null;
  /** Impression-weighted average position, or null if there were no impressions. */
  position: number | null;
}

export interface Accumulator {
  clicks: number;
  impressions: number;
  positionWeighted: number; // Σ(position × impressions)
}

export function emptyAccumulator(): Accumulator {
  return { clicks: 0, impressions: 0, positionWeighted: 0 };
}

export function addRow(
  acc: Accumulator,
  row: { clicks: number; impressions: number; position: number }
): void {
  acc.clicks += row.clicks;
  acc.impressions += row.impressions;
  acc.positionWeighted += row.position * row.impressions;
}

export function finalizeTotals(acc: Accumulator): Totals {
  return {
    clicks: acc.clicks,
    impressions: acc.impressions,
    ctr: acc.impressions > 0 ? acc.clicks / acc.impressions : null,
    position: acc.impressions > 0 ? acc.positionWeighted / acc.impressions : null,
  };
}

/** Percentage change, or null when the previous value is 0/absent (no honest baseline). */
export function pctChange(current: number | null, previous: number | null): number | null {
  if (current === null || previous === null || previous === 0) return null;
  return ((current - previous) / previous) * 100;
}

export function formatInt(n: number | null | undefined): string {
  if (n === null || n === undefined) return "—";
  return Math.round(n).toLocaleString("en-IN");
}

export function formatPct(ratio: number | null | undefined, digits = 2): string {
  if (ratio === null || ratio === undefined) return "—";
  return `${(ratio * 100).toFixed(digits)}%`;
}

export function formatPosition(p: number | null | undefined): string {
  if (p === null || p === undefined) return "—";
  return p.toFixed(1);
}

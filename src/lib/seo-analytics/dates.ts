import { ValidationError } from "@/lib/api/errors";

/**
 * Date helpers for Search Console data. All dates are plain `YYYY-MM-DD`
 * strings (GSC reports in Pacific Time; we never convert, we only apply a
 * conservative reporting lag).
 */

/** GSC "final" data usually trails by 2–3 days. We assume 3 unless told otherwise. */
export const GSC_DATA_LAG_DAYS = 3;
/** Search Console only retains ~16 months. */
export const MAX_RANGE_DAYS = 480;

const YMD = /^\d{4}-\d{2}-\d{2}$/;

export function isYmd(value: unknown): value is string {
  if (typeof value !== "string" || !YMD.test(value)) return false;
  const d = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && toYmd(d) === value;
}

export function toYmd(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export function addDays(ymd: string, n: number): string {
  const d = new Date(`${ymd}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return toYmd(d);
}

/** Inclusive number of days between two YYYY-MM-DD strings. */
export function daysInclusive(start: string, end: string): number {
  const a = new Date(`${start}T00:00:00Z`).getTime();
  const b = new Date(`${end}T00:00:00Z`).getTime();
  return Math.round((b - a) / 86_400_000) + 1;
}

export function eachDay(start: string, end: string): string[] {
  const out: string[] = [];
  for (let d = start; d <= end; d = addDays(d, 1)) out.push(d);
  return out;
}

export function latestReliableDate(now: Date = new Date()): string {
  return addDays(toYmd(now), -GSC_DATA_LAG_DAYS);
}

export type SeoRangePreset = "7d" | "28d" | "90d" | "custom";

export interface DateWindow {
  start: string;
  end: string;
  days: number;
}

export interface ResolvedRange {
  preset: SeoRangePreset;
  label: string;
  current: DateWindow;
  previous: DateWindow;
}

export interface RangeInput {
  preset?: string;
  from?: string;
  to?: string;
}

function window(start: string, end: string): DateWindow {
  return { start, end, days: daysInclusive(start, end) };
}

/**
 * Resolves a preset or custom range plus the immediately preceding window of
 * equal length. `latestAvailable` caps the end date so we never compare against
 * days Google has not finalised yet.
 */
export function resolveRange(input: RangeInput, latestAvailable: string): ResolvedRange {
  const preset: SeoRangePreset =
    input.preset === "7d" || input.preset === "90d" || input.preset === "custom"
      ? input.preset
      : "28d";

  if (preset === "custom") {
    if (!isYmd(input.from) || !isYmd(input.to)) {
      throw new ValidationError("Custom range needs valid from and to dates (YYYY-MM-DD).");
    }
    if (input.from > input.to) {
      throw new ValidationError("The start date must be on or before the end date.");
    }
    if (input.to > latestAvailable) {
      throw new ValidationError(
        `Search Console data is only reliable through ${latestAvailable}. Choose an end date on or before it.`
      );
    }
    const days = daysInclusive(input.from, input.to);
    if (days > MAX_RANGE_DAYS) {
      throw new ValidationError(`Date range is limited to ${MAX_RANGE_DAYS} days.`);
    }
    const prevEnd = addDays(input.from, -1);
    return {
      preset,
      label: `${input.from} → ${input.to}`,
      current: window(input.from, input.to),
      previous: window(addDays(prevEnd, -(days - 1)), prevEnd),
    };
  }

  const n = preset === "7d" ? 7 : preset === "90d" ? 90 : 28;
  const end = latestAvailable;
  const start = addDays(end, -(n - 1));
  const prevEnd = addDays(start, -1);
  return {
    preset,
    label: `Last ${n} days`,
    current: window(start, end),
    previous: window(addDays(prevEnd, -(n - 1)), prevEnd),
  };
}

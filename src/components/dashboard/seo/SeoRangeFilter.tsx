import Link from "next/link";
import type { SeoRangeInfo } from "@/types/seo-analytics";
import { buildHref } from "./seo-ui";

const PRESETS = [
  { id: "7d", label: "7 days" },
  { id: "28d", label: "28 days" },
  { id: "90d", label: "90 days" },
] as const;

/**
 * Date range controls. Server-rendered: presets are links; the custom range is a
 * plain GET form, so it works without client JS and stays shareable by URL.
 */
export function SeoRangeFilter({
  base,
  range,
  extraParams = {},
  maxDate,
}: {
  base: string;
  range: SeoRangeInfo;
  /** Other active filters to preserve across range changes. */
  extraParams?: Record<string, string | undefined>;
  maxDate: string;
}) {
  return (
    <div className="flex flex-wrap items-end gap-x-4 gap-y-3">
      <div role="group" aria-label="Date range presets" className="inline-flex rounded-xl border border-[rgba(7,26,40,0.12)] bg-white p-0.5">
        {PRESETS.map((p) => (
          <Link
            key={p.id}
            href={buildHref(base, { ...extraParams, preset: p.id })}
            aria-current={range.preset === p.id ? "true" : undefined}
            className={`px-3 py-1.5 text-xs font-semibold rounded-[10px] transition ${
              range.preset === p.id ? "bg-[#071a28] text-white" : "text-[#647581] hover:text-[#071a28]"
            }`}
          >
            {p.label}
          </Link>
        ))}
      </div>

      <form method="get" action={base} className="flex flex-wrap items-end gap-2">
        {Object.entries(extraParams).map(([k, v]) =>
          v ? <input key={k} type="hidden" name={k} value={v} /> : null
        )}
        <input type="hidden" name="preset" value="custom" />
        <label className="text-[11px] text-[#647581] font-semibold">
          From
          <input
            type="date"
            name="from"
            required
            defaultValue={range.preset === "custom" ? range.current.start : ""}
            max={maxDate}
            className="mt-0.5 block rounded-lg border border-[rgba(7,26,40,0.12)] bg-white px-2 py-1.5 text-xs text-[#071a28]"
          />
        </label>
        <label className="text-[11px] text-[#647581] font-semibold">
          To
          <input
            type="date"
            name="to"
            required
            defaultValue={range.preset === "custom" ? range.current.end : ""}
            max={maxDate}
            className="mt-0.5 block rounded-lg border border-[rgba(7,26,40,0.12)] bg-white px-2 py-1.5 text-xs text-[#071a28]"
          />
        </label>
        <button
          type="submit"
          className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-[rgba(7,26,40,0.12)] bg-white text-[#071a28] hover:bg-stone-50"
        >
          Apply
        </button>
      </form>

      <p className="text-[11px] text-[#647581] pb-1.5">
        {range.current.start} → {range.current.end} vs {range.previous.start} → {range.previous.end}
      </p>
    </div>
  );
}

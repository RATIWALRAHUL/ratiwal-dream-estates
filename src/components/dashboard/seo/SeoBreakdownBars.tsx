import type { BreakdownRow } from "@/types/seo-analytics";

/**
 * Horizontal share bars (one hue — identity is carried by the text label, not colour).
 * Includes impressions-based share and a previous-period click comparison.
 */
export function SeoBreakdownBars({
  rows,
  labelFor,
}: {
  rows: BreakdownRow[];
  labelFor?: (key: string) => string;
}) {
  const total = rows.reduce((a, r) => a + r.impressions, 0);
  if (rows.length === 0 || total === 0) {
    return <p className="text-xs text-[#647581]">No data in this period.</p>;
  }
  return (
    <table className="w-full text-xs">
      <thead className="sr-only">
        <tr>
          <th scope="col">Name</th>
          <th scope="col">Share of impressions</th>
          <th scope="col">Clicks</th>
          <th scope="col">Impressions</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r) => {
          const share = (r.impressions / total) * 100;
          return (
            <tr key={r.key} className="align-middle">
              <th scope="row" className="py-1.5 pr-3 text-left font-semibold text-[#071a28] w-24 sm:w-32 truncate">
                {labelFor ? labelFor(r.key) : r.key}
              </th>
              <td className="py-1.5 pr-3 w-full">
                <div className="h-2 rounded-r-[4px] bg-stone-100">
                  <div
                    className="h-2 rounded-r-[4px] bg-[#087fc3]"
                    style={{ width: `${Math.max(share, 1.5)}%` }}
                    title={`${share.toFixed(1)}% of impressions`}
                  />
                </div>
              </td>
              <td className="py-1.5 pr-3 text-right tabular-nums text-[#071a28] whitespace-nowrap">
                {r.clicks.toLocaleString("en-IN")}
                <span className="text-[#647581]"> clk</span>
              </td>
              <td className="py-1.5 text-right tabular-nums text-[#647581] whitespace-nowrap">
                {share.toFixed(1)}%
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

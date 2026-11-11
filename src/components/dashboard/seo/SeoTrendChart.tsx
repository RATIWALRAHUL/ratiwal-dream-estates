"use client";

import { useMemo, useState } from "react";

export interface ChartPoint {
  date: string;
  value: number | null;
}

type Kind = "int" | "pct" | "pos";

const W = 640;
const H = 170;
const PAD = { l: 4, r: 4, t: 10, b: 10 };

function fmt(kind: Kind, v: number | null): string {
  if (v === null) return "No data";
  if (kind === "pct") return `${(v * 100).toFixed(2)}%`;
  if (kind === "pos") return v.toFixed(1);
  return Math.round(v).toLocaleString("en-IN");
}

/**
 * Single-series line chart (one hue, 2px line, no dual axis). Days with no stored
 * data are gaps, never zeros. `invertY` is for average position (lower = better,
 * drawn higher). Hover shows a crosshair + tooltip; a table view is always available.
 */
export function SeoTrendChart({
  title,
  points,
  kind,
  invertY = false,
  description,
}: {
  title: string;
  points: ChartPoint[];
  kind: Kind;
  invertY?: boolean;
  description: string;
}) {
  const [hover, setHover] = useState<number | null>(null);

  const geo = useMemo(() => {
    const vals = points.map((p) => p.value).filter((v): v is number => v !== null);
    if (vals.length === 0) return null;
    let min = kind === "pos" ? Math.min(...vals) : 0;
    let max = Math.max(...vals);
    if (kind === "pos") {
      const pad = Math.max((max - min) * 0.15, 0.5);
      min = Math.max(0, min - pad);
      max = max + pad;
    } else {
      max = max === 0 ? 1 : max * 1.1;
    }
    const n = points.length;
    const x = (i: number) => PAD.l + (n <= 1 ? (W - PAD.l - PAD.r) / 2 : (i * (W - PAD.l - PAD.r)) / (n - 1));
    const y = (v: number) => {
      const t = (v - min) / (max - min || 1);
      const frac = invertY ? t : 1 - t;
      return PAD.t + frac * (H - PAD.t - PAD.b);
    };
    // Build segments, breaking the line at gaps.
    const segs: string[] = [];
    const areas: string[] = [];
    let cur: Array<[number, number]> = [];
    const flush = () => {
      if (cur.length > 0) {
        segs.push(cur.map(([px, py], i) => `${i === 0 ? "M" : "L"}${px.toFixed(1)},${py.toFixed(1)}`).join(" "));
        if (cur.length > 1) {
          const base = H - PAD.b;
          areas.push(
            `M${cur[0][0].toFixed(1)},${base} ` +
              cur.map(([px, py]) => `L${px.toFixed(1)},${py.toFixed(1)}`).join(" ") +
              ` L${cur[cur.length - 1][0].toFixed(1)},${base} Z`
          );
        }
      }
      cur = [];
    };
    points.forEach((p, i) => {
      if (p.value === null) flush();
      else cur.push([x(i), y(p.value)]);
    });
    flush();
    return { segs, areas, x, y, min, max, singles: points.map((p, i) => (p.value !== null ? i : -1)).filter((i) => i >= 0) };
  }, [points, kind, invertY]);

  const hoverPoint = hover !== null ? points[hover] : null;

  function onMove(e: React.MouseEvent<SVGRectElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const rel = (e.clientX - rect.left) / rect.width;
    const i = Math.round(rel * (points.length - 1));
    setHover(Math.min(Math.max(i, 0), points.length - 1));
  }

  const first = points[0]?.date;
  const last = points[points.length - 1]?.date;

  return (
    <figure className="m-0">
      <figcaption className="flex items-baseline justify-between gap-2 mb-2">
        <span className="text-sm font-bold text-[#071a28]">{title}</span>
        {geo && (
          <span className="text-[10px] font-mono text-[#647581]">
            {invertY ? "better ↑ · " : ""}
            {fmt(kind, geo.max)} max
          </span>
        )}
      </figcaption>

      {!geo ? (
        <div className="h-[170px] flex items-center justify-center text-xs text-[#647581] rounded-xl bg-stone-50 border border-dashed border-[rgba(7,26,40,0.12)]">
          No data in this period
        </div>
      ) : (
        <div className="relative">
          <svg
            viewBox={`0 0 ${W} ${H}`}
            className="w-full h-auto block"
            role="img"
            aria-label={`${title}. ${description}`}
          >
            {/* Recessive grid: 3 hairlines */}
            {[0.25, 0.5, 0.75].map((f) => (
              <line
                key={f}
                x1={PAD.l}
                x2={W - PAD.r}
                y1={PAD.t + f * (H - PAD.t - PAD.b)}
                y2={PAD.t + f * (H - PAD.t - PAD.b)}
                stroke="rgba(7,26,40,0.07)"
                strokeWidth={1}
              />
            ))}
            {geo.areas.map((d, i) => (
              <path key={`a${i}`} d={d} fill="rgba(8,127,195,0.08)" />
            ))}
            {geo.segs.map((d, i) => (
              <path key={`s${i}`} d={d} fill="none" stroke="#087fc3" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
            ))}
            {/* Isolated single-day points would otherwise be invisible */}
            {geo.singles
              .filter((i) => points[i - 1]?.value == null && points[i + 1]?.value == null)
              .map((i) => (
                <circle key={`d${i}`} cx={geo.x(i)} cy={geo.y(points[i].value as number)} r={3} fill="#087fc3" />
              ))}
            {hover !== null && hoverPoint && (
              <>
                <line x1={geo.x(hover)} x2={geo.x(hover)} y1={PAD.t} y2={H - PAD.b} stroke="rgba(7,26,40,0.25)" strokeWidth={1} />
                {hoverPoint.value !== null && (
                  <circle cx={geo.x(hover)} cy={geo.y(hoverPoint.value)} r={4} fill="#087fc3" stroke="#ffffff" strokeWidth={2} />
                )}
              </>
            )}
            {/* Hit target spans the full plot, larger than any mark */}
            <rect
              x={0}
              y={0}
              width={W}
              height={H}
              fill="transparent"
              onMouseMove={onMove}
              onMouseLeave={() => setHover(null)}
            />
          </svg>

          {hover !== null && hoverPoint && (
            <div
              className="pointer-events-none absolute top-0 -translate-x-1/2 rounded-lg bg-[#071a28] text-white px-2.5 py-1.5 text-[11px] shadow-lg whitespace-nowrap"
              style={{ left: `${Math.min(Math.max((geo.x(hover) / W) * 100, 12), 88)}%` }}
            >
              <div className="font-mono text-[10px] opacity-70">{hoverPoint.date}</div>
              <div className="font-semibold tabular-nums">{fmt(kind, hoverPoint.value)}</div>
            </div>
          )}

          <div className="flex justify-between text-[10px] font-mono text-[#647581] mt-1">
            <span>{first}</span>
            <span>{last}</span>
          </div>
        </div>
      )}

      {geo && (
        <details className="mt-2 text-[11px] text-[#647581]">
          <summary className="cursor-pointer font-semibold hover:text-[#071a28]">View as table</summary>
          <div className="max-h-48 overflow-auto mt-2 rounded-lg border border-[rgba(7,26,40,0.08)]">
            <table className="w-full text-left">
              <caption className="sr-only">{title} by day</caption>
              <thead className="bg-stone-50 sticky top-0">
                <tr>
                  <th scope="col" className="px-3 py-1.5 font-semibold">Date</th>
                  <th scope="col" className="px-3 py-1.5 font-semibold text-right">{title}</th>
                </tr>
              </thead>
              <tbody>
                {points.map((p) => (
                  <tr key={p.date} className="border-t border-[rgba(7,26,40,0.05)]">
                    <td className="px-3 py-1 font-mono">{p.date}</td>
                    <td className="px-3 py-1 text-right tabular-nums">{fmt(kind, p.value)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </details>
      )}
    </figure>
  );
}

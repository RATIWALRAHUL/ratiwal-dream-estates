"use client";

import { useState } from "react";
import { Table, LineChart } from "lucide-react";

interface TimeSeriesTrendChartProps {
  dates: string[];
  inquiries: number[];
  leads: number[];
  siteVisits: number[];
}

export function TimeSeriesTrendChart({
  dates,
  inquiries,
  leads,
  siteVisits,
}: TimeSeriesTrendChartProps) {
  const [viewMode, setViewMode] = useState<"chart" | "table">("chart");

  if (dates.length === 0) {
    return (
      <div className="p-8 text-center text-xs text-[#647581] bg-[#f8f7f4] rounded-2xl">
        No trend activity recorded in this period.
      </div>
    );
  }

  const maxValue = Math.max(1, ...inquiries, ...leads, ...siteVisits);

  // SVG Chart Geometry
  const width = 600;
  const height = 180;
  const padding = 30;
  const innerWidth = width - padding * 2;
  const innerHeight = height - padding * 2;

  const pointsCount = dates.length;
  const stepX = pointsCount > 1 ? innerWidth / (pointsCount - 1) : innerWidth;

  const buildPath = (values: number[]) => {
    return values
      .map((val, idx) => {
        const x = padding + idx * stepX;
        const y = padding + innerHeight - (val / maxValue) * innerHeight;
        return `${idx === 0 ? "M" : "L"} ${x} ${y}`;
      })
      .join(" ");
  };

  const inqPath = buildPath(inquiries);
  const leadPath = buildPath(leads);
  const visitPath = buildPath(siteVisits);

  return (
    <div className="space-y-4">
      {/* View Mode Switch & Legend */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 font-bold text-[#071a28]">
            <span className="w-3 h-3 rounded-full bg-[#087fc3]" />
            <span>Inquiries</span>
          </div>
          <div className="flex items-center gap-1.5 font-bold text-[#071a28]">
            <span className="w-3 h-3 rounded-full bg-emerald-500" />
            <span>Qualified Leads</span>
          </div>
          <div className="flex items-center gap-1.5 font-bold text-[#071a28]">
            <span className="w-3 h-3 rounded-full bg-purple-500" />
            <span>Site Visits</span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setViewMode(viewMode === "chart" ? "table" : "chart")}
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl border border-[rgba(7,26,40,0.1)] text-[#647581] hover:text-[#071a28] text-xs font-semibold"
        >
          {viewMode === "chart" ? <Table className="w-3 h-3" /> : <LineChart className="w-3 h-3" />}
          <span>{viewMode === "chart" ? "View as Table" : "View as Chart"}</span>
        </button>
      </div>

      {viewMode === "chart" ? (
        <div className="w-full overflow-x-auto">
          <svg
            viewBox={`0 0 ${width} ${height}`}
            className="w-full h-48 bg-[#f8f7f4] rounded-2xl border border-[rgba(7,26,40,0.06)]"
          >
            {/* Gridlines */}
            {[0, 0.5, 1].map((ratio) => {
              const y = padding + innerHeight * (1 - ratio);
              return (
                <g key={ratio}>
                  <line
                    x1={padding}
                    y1={y}
                    x2={width - padding}
                    y2={y}
                    stroke="rgba(7,26,40,0.06)"
                    strokeDasharray="4 4"
                  />
                  <text
                    x={padding - 6}
                    y={y + 3}
                    textAnchor="end"
                    className="text-[9px] fill-[#8c9ba5] font-mono"
                  >
                    {Math.round(maxValue * ratio)}
                  </text>
                </g>
              );
            })}

            {/* Paths */}
            <path d={inqPath} fill="none" stroke="#087fc3" strokeWidth="2.5" strokeLinecap="round" />
            <path d={leadPath} fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" />
            <path d={visitPath} fill="none" stroke="#a855f7" strokeWidth="2.5" strokeLinecap="round" />

            {/* X-axis date labels */}
            {dates.map((date, idx) => {
              // Show fewer dates on small screens
              if (dates.length > 10 && idx % Math.ceil(dates.length / 7) !== 0) return null;
              const x = padding + idx * stepX;
              return (
                <text
                  key={idx}
                  x={x}
                  y={height - 10}
                  textAnchor="middle"
                  className="text-[9px] fill-[#647581] font-mono"
                >
                  {date}
                </text>
              );
            })}
          </svg>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-[rgba(7,26,40,0.08)] overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#f8f7f4] border-b border-[rgba(7,26,40,0.06)] text-[10px] font-mono uppercase text-[#647581]">
                <th className="py-2.5 px-4">Date</th>
                <th className="py-2.5 px-4">Inquiries</th>
                <th className="py-2.5 px-4">Qualified Leads</th>
                <th className="py-2.5 px-4">Site Visits</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[rgba(7,26,40,0.04)] font-mono text-xs">
              {dates.map((d, i) => (
                <tr key={i} className="hover:bg-[#f8f7f4]/60">
                  <td className="py-2 px-4 font-semibold text-[#071a28]">{d}</td>
                  <td className="py-2 px-4 text-[#087fc3] font-bold">{inquiries[i]}</td>
                  <td className="py-2 px-4 text-emerald-700 font-bold">{leads[i]}</td>
                  <td className="py-2 px-4 text-purple-700 font-bold">{siteVisits[i]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

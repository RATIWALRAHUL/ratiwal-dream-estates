import {
  Building2,
  CheckCircle2,
  FileClock,
  Layers,
  Clock,
  MapPin,
  TrendingUp,
  ArrowUpRight,
} from "lucide-react";
import type { DashboardOverviewData } from "@/lib/services/dashboard.service";

interface SummaryCardsProps {
  metrics: DashboardOverviewData["metrics"];
}

export function SummaryCards({ metrics }: SummaryCardsProps) {
  const cards = [
    {
      label: "Total Properties",
      value: metrics.totalProperties,
      icon: Building2,
      trend: "+12.5% MoM",
      trendPositive: true,
      context: `${metrics.publishedProperties} published in public catalog`,
      color: "text-[#087fc3]",
      bg: "bg-[#eaf5fa]",
      border: "border-[#087fc3]/20",
      sparkColor: "#087fc3",
      sparkline: "M0 25 Q 15 15, 30 20 T 60 10 T 90 5 L 90 30 L 0 30 Z",
      sparklinePath: "M0 25 Q 15 15, 30 20 T 60 10 T 90 5",
    },
    {
      label: "Live Catalog",
      value: metrics.publishedProperties,
      icon: CheckCircle2,
      trend: "100% Verified",
      trendPositive: true,
      context: "Active listings visible to investors",
      color: "text-emerald-600",
      bg: "bg-emerald-50",
      border: "border-emerald-200",
      sparkColor: "#10b981",
      sparkline: "M0 26 Q 20 22, 40 18 T 70 8 T 90 4 L 90 30 L 0 30 Z",
      sparklinePath: "M0 26 Q 20 22, 40 18 T 70 8 T 90 4",
    },
    {
      label: "Draft & Review",
      value: metrics.draftOrReviewProperties,
      icon: FileClock,
      trend: "Under Audit",
      trendPositive: false,
      context: "Parcels under title/zoning review",
      color: "text-amber-600",
      bg: "bg-amber-50",
      border: "border-amber-200",
      sparkColor: "#f59e0b",
      sparkline: "M0 20 Q 20 24, 45 15 T 75 22 T 90 12 L 90 30 L 0 30 Z",
      sparklinePath: "M0 20 Q 20 24, 45 15 T 75 22 T 90 12",
    },
    {
      label: "Available Plots",
      value: metrics.availablePlots,
      icon: Layers,
      trend: `${metrics.totalPlotOptions > 0 ? Math.round((metrics.availablePlots / metrics.totalPlotOptions) * 100) : 0}% of Total`,
      trendPositive: true,
      context: `Out of ${metrics.totalPlotOptions} total inventory units`,
      color: "text-[#087fc3]",
      bg: "bg-[#eaf5fa]",
      border: "border-[#087fc3]/20",
      sparkColor: "#087fc3",
      sparkline: "M0 28 Q 25 18, 50 14 T 80 8 T 90 2 L 90 30 L 0 30 Z",
      sparklinePath: "M0 28 Q 25 18, 50 14 T 80 8 T 90 2",
    },
    {
      label: "Reserved Units",
      value: metrics.reservedPlots,
      icon: Clock,
      trend: "+2 This Week",
      trendPositive: true,
      context: "Plots held under token agreements",
      color: "text-indigo-600",
      bg: "bg-indigo-50",
      border: "border-indigo-200",
      sparkColor: "#6366f1",
      sparkline: "M0 24 Q 20 20, 45 12 T 70 16 T 90 6 L 90 30 L 0 30 Z",
      sparklinePath: "M0 24 Q 20 20, 45 12 T 70 16 T 90 6",
    },
    {
      label: "Active Corridors",
      value: metrics.activeLocations,
      icon: MapPin,
      trend: "3 Key States",
      trendPositive: true,
      context: "Covering Jaipur, Navi Mumbai & Ajmer",
      color: "text-[#0a6ba3]",
      bg: "bg-[#eaf5fa]",
      border: "border-[#42b7e8]/30",
      sparkColor: "#0a6ba3",
      sparkline: "M0 22 Q 25 16, 50 12 T 75 8 T 90 4 L 90 30 L 0 30 Z",
      sparklinePath: "M0 22 Q 25 16, 50 12 T 75 8 T 90 4",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
      {cards.map((c) => {
        const Icon = c.icon;
        return (
          <div
            key={c.label}
            className="group relative p-6 rounded-3xl bg-gradient-to-br from-white via-[#fffdf8] to-[#fbf9f4] border border-[rgba(7,26,40,0.08)] shadow-[0_4px_24px_rgba(7,26,40,0.03)] hover:shadow-[0_8px_32px_rgba(7,26,40,0.07)] hover:border-[rgba(7,26,40,0.16)] hover:-translate-y-0.5 transition-all duration-300 flex flex-col justify-between overflow-hidden"
          >
            {/* Subtle background glow on hover */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-[#eaf5fa]/50 to-transparent rounded-bl-full pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            <div>
              {/* Header: Label + Trend + Duotone Icon */}
              <div className="flex items-start justify-between gap-3">
                <div>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#647581]">
                    {c.label}
                  </span>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className="inline-flex items-center gap-0.5 text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-slate-100/80 text-[#071a28] border border-[rgba(7,26,40,0.06)]">
                      {c.trend}
                    </span>
                  </div>
                </div>

                <div
                  className={`w-10 h-10 rounded-2xl ${c.bg} ${c.color} border ${c.border} flex items-center justify-center shadow-xs transition-transform duration-200 group-hover:scale-105`}
                >
                  <Icon className="w-5 h-5" />
                </div>
              </div>

              {/* Metric Value + Sparkline */}
              <div className="mt-4 flex items-end justify-between gap-2">
                <div className="text-3xl sm:text-4xl font-normal font-serif text-[#071a28] tracking-tight">
                  {c.value.toLocaleString("en-IN")}
                </div>

                {/* Inline SVG Sparkline */}
                <div className="w-20 h-8 opacity-75 group-hover:opacity-100 transition-opacity">
                  <svg viewBox="0 0 90 30" className="w-full h-full overflow-visible">
                    <defs>
                      <linearGradient id={`grad-${c.label.replace(/\s+/g, "")}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={c.sparkColor} stopOpacity="0.25" />
                        <stop offset="100%" stopColor={c.sparkColor} stopOpacity="0.0" />
                      </linearGradient>
                    </defs>
                    <path
                      d={c.sparkline}
                      fill={`url(#grad-${c.label.replace(/\s+/g, "")})`}
                    />
                    <path
                      d={c.sparklinePath}
                      fill="none"
                      stroke={c.sparkColor}
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
              </div>
            </div>

            {/* Context Footer */}
            <div className="mt-4 pt-3 border-t border-[rgba(7,26,40,0.05)] flex items-center justify-between text-[11px] text-[#647581] font-mono">
              <span className="truncate">{c.context}</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-[#647581] opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
            </div>
          </div>
        );
      })}
    </div>
  );
}

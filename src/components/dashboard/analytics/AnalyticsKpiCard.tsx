import { ArrowUpRight, ArrowDownRight, Minus, AlertCircle } from "lucide-react";
import { MetricValue } from "@/types/analytics";

interface AnalyticsKpiCardProps {
  title: string;
  metric: MetricValue;
  subtitle?: string;
  icon?: React.ReactNode;
  invertColors?: boolean; // If true, DOWN is green (e.g. spam/cancellations), UP is red
}

export function AnalyticsKpiCard({
  title,
  metric,
  subtitle,
  icon,
  invertColors = false,
}: AnalyticsKpiCardProps) {
  const isPositive = invertColors ? !metric.isPositiveChange : metric.isPositiveChange;

  return (
    <div className="bg-white rounded-2xl border border-[rgba(7,26,40,0.08)] shadow-xs p-5 flex flex-col justify-between hover:border-[#087fc3]/30 transition-all">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[10px] font-mono uppercase tracking-widest text-[#647581] font-bold truncate">
          {title}
        </span>
        {icon && (
          <div className="w-7 h-7 rounded-xl bg-[#087fc3]/10 text-[#087fc3] flex items-center justify-center shrink-0">
            {icon}
          </div>
        )}
      </div>

      <div className="mt-3">
        <div className="flex items-baseline justify-between gap-2">
          <p className="text-2xl sm:text-3xl font-bold font-serif text-[#071a28]">
            {metric.formatted}
          </p>

          {/* Trend Badge */}
          {metric.trend && metric.trend !== "FLAT" && (
            <span
              className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                metric.trend === "NEW"
                  ? "bg-sky-50 text-sky-700"
                  : isPositive
                  ? "bg-emerald-50 text-emerald-700"
                  : "bg-rose-50 text-rose-700"
              }`}
            >
              {metric.trend === "UP" ? (
                <ArrowUpRight className="w-3 h-3" />
              ) : metric.trend === "DOWN" ? (
                <ArrowDownRight className="w-3 h-3" />
              ) : (
                <Minus className="w-3 h-3" />
              )}
              <span>
                {metric.changePercent !== null && metric.changePercent !== undefined
                  ? `${Math.abs(metric.changePercent)}%`
                  : metric.trend === "NEW"
                  ? "New"
                  : "—"}
              </span>
            </span>
          )}
        </div>

        {/* Subtitle / Disclaimer */}
        <div className="mt-1 flex items-center justify-between text-[10px] text-[#647581]">
          <span>{subtitle || "vs previous period"}</span>
          {metric.disclaimer && (
            <span className="italic text-[#8c9ba5]">{metric.disclaimer}</span>
          )}
        </div>
      </div>
    </div>
  );
}

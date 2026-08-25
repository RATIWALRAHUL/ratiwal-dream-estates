import type { DashboardOverviewData } from "@/lib/services/dashboard.service";
import { Layers, PieChart } from "lucide-react";

interface InventoryStatusBarProps {
  inventory: DashboardOverviewData["inventoryBreakdown"];
  totalPlots: number;
}

export function InventoryStatusBar({ inventory, totalPlots }: InventoryStatusBarProps) {
  const colorMap: Record<
    string,
    {
      bar: string;
      glow: string;
      dot: string;
      halo: string;
      text: string;
      bg: string;
      border: string;
    }
  > = {
    AVAILABLE: {
      bar: "bg-gradient-to-r from-[#087fc3] to-[#42b7e8]",
      glow: "shadow-[0_0_12px_rgba(8,127,195,0.4)]",
      dot: "bg-[#087fc3]",
      halo: "shadow-[0_0_8px_#087fc3]",
      text: "text-[#087fc3]",
      bg: "bg-[#eaf5fa]/60",
      border: "border-[#087fc3]/20",
    },
    RESERVED: {
      bar: "bg-gradient-to-r from-indigo-500 to-indigo-400",
      glow: "shadow-[0_0_12px_rgba(99,102,241,0.4)]",
      dot: "bg-indigo-500",
      halo: "shadow-[0_0_8px_#6366f1]",
      text: "text-indigo-600",
      bg: "bg-indigo-50/60",
      border: "border-indigo-200/50",
    },
    SOLD: {
      bar: "bg-gradient-to-r from-emerald-500 to-emerald-400",
      glow: "shadow-[0_0_12px_rgba(16,185,129,0.4)]",
      dot: "bg-emerald-500",
      halo: "shadow-[0_0_8px_#10b981]",
      text: "text-emerald-600",
      bg: "bg-emerald-50/60",
      border: "border-emerald-200/50",
    },
    ON_REQUEST: {
      bar: "bg-gradient-to-r from-amber-500 to-amber-400",
      glow: "shadow-[0_0_12px_rgba(245,158,11,0.4)]",
      dot: "bg-amber-500",
      halo: "shadow-[0_0_8px_#f59e0b]",
      text: "text-amber-600",
      bg: "bg-amber-50/60",
      border: "border-amber-200/50",
    },
    UNAVAILABLE: {
      bar: "bg-gradient-to-r from-slate-400 to-slate-300",
      glow: "shadow-none",
      dot: "bg-slate-400",
      halo: "shadow-none",
      text: "text-slate-500",
      bg: "bg-slate-100/60",
      border: "border-slate-200/50",
    },
  };

  return (
    <div className="p-6 sm:p-7 rounded-3xl bg-gradient-to-br from-white via-[#fffdf8] to-[#fbf9f4] border border-[rgba(7,26,40,0.08)] shadow-[0_4px_24px_rgba(7,26,40,0.03)] space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#eaf5fa] text-[#087fc3] border border-[#087fc3]/20 flex items-center justify-center shadow-xs">
            <PieChart className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-normal font-serif text-[#071a28] tracking-tight">
              Plot Inventory Status & Allocation
            </h2>
            <p className="text-xs text-[#647581] mt-0.5 font-sans">
              Aggregated plot distribution across all registered plotted developments
            </p>
          </div>
        </div>

        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#071a28] text-white text-xs font-mono font-bold self-start sm:self-center shadow-xs">
          <span>{totalPlots} Total Registered Units</span>
        </div>
      </div>

      {/* Segmented Gradient Horizontal Progress Bar */}
      <div className="space-y-2">
        <div
          className="w-full h-4 rounded-full bg-slate-100 p-0.5 overflow-hidden flex gap-1 shadow-inner border border-[rgba(7,26,40,0.04)]"
          role="progressbar"
          aria-label="Inventory Distribution"
        >
          {totalPlots === 0 ? (
            <div className="w-full h-full rounded-full bg-slate-200" />
          ) : (
            inventory
              .filter((item) => item.count > 0)
              .map((item) => {
                const colors = colorMap[item.status] || colorMap.UNAVAILABLE;
                const width = Math.max(2.5, (item.count / totalPlots) * 100);
                return (
                  <div
                    key={item.status}
                    style={{ width: `${width}%` }}
                    className={`h-full rounded-full ${colors.bar} ${colors.glow} transition-all duration-700`}
                    title={`${item.label}: ${item.count} plots (${item.percentage}%)`}
                  />
                );
              })
          )}
        </div>
      </div>

      {/* Modern High-Density Metric Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        {inventory.map((item) => {
          const colors = colorMap[item.status] || colorMap.UNAVAILABLE;
          return (
            <div
              key={item.status}
              className={`p-4 rounded-2xl ${colors.bg} border ${colors.border} flex flex-col justify-between hover:shadow-xs transition-all duration-200`}
            >
              <div className="flex items-center justify-between gap-1">
                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${colors.dot} ${colors.halo}`} />
                  <span className="text-xs font-semibold text-[#071a28] truncate">
                    {item.label}
                  </span>
                </div>
                <span className="text-[10px] font-mono font-bold text-[#647581]">
                  {item.percentage}%
                </span>
              </div>

              <div className="mt-3 flex items-baseline justify-between">
                <span className="text-2xl font-normal font-serif text-[#071a28]">
                  {item.count}
                </span>
                <span className="text-[10px] font-mono text-[#647581]">
                  units
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

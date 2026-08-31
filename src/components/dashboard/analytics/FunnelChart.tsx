import { FunnelStageMetric } from "@/types/analytics";
import { ArrowRight, Clock } from "lucide-react";

interface FunnelChartProps {
  stages: FunnelStageMetric[];
  totalEntered: number;
}

export function FunnelChart({ stages, totalEntered }: FunnelChartProps) {
  if (stages.length === 0 || totalEntered === 0) {
    return (
      <div className="p-8 text-center text-xs text-[#647581] bg-[#f8f7f4] rounded-2xl border border-[rgba(7,26,40,0.06)]">
        No lead activity in selected period.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {stages.map((stage, idx) => {
        const widthPercent = Math.max(12, stage.conversionFromFirst);
        return (
          <div key={stage.stage} className="space-y-1.5">
            {/* Stage Header */}
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-[#071a28] text-white flex items-center justify-center font-mono text-[10px] font-bold">
                  {idx + 1}
                </span>
                <span className="font-bold text-[#071a28]">{stage.label}</span>
              </div>
              <div className="flex items-center gap-4 text-xs font-mono">
                <span className="font-bold text-[#071a28]">
                  {stage.count.toLocaleString("en-IN")} leads
                </span>
                <span className="text-[#647581] font-semibold">
                  {stage.conversionFromFirst}% of pipeline
                </span>
              </div>
            </div>

            {/* Visual Bar */}
            <div className="h-6 rounded-xl bg-[#f8f7f4] border border-[rgba(7,26,40,0.06)] overflow-hidden flex items-center p-1">
              <div
                className="h-full rounded-lg bg-gradient-to-r from-[#071a28] to-[#087fc3] transition-all duration-500 flex items-center justify-end pr-2 text-[10px] font-bold text-white font-mono"
                style={{ width: `${widthPercent}%` }}
              >
                {widthPercent > 20 && `${stage.count}`}
              </div>
            </div>

            {/* Stage Transition & Duration Meta */}
            <div className="flex items-center justify-between text-[10px] text-[#647581] px-1">
              <div className="flex items-center gap-3">
                {idx > 0 && (
                  <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold font-mono">
                    <ArrowRight className="w-2.5 h-2.5" />
                    {stage.conversionFromPrevious}% from {stages[idx - 1].label}
                  </span>
                )}
                {stage.dropOffCount > 0 && (
                  <span className="text-rose-600 font-mono">
                    {stage.dropOffCount} dropped ({stage.dropOffPercentage}%)
                  </span>
                )}
              </div>

              {stage.hasReliableDuration && stage.avgDurationHours !== null ? (
                <div className="inline-flex items-center gap-1 font-mono text-[#071a28]">
                  <Clock className="w-2.5 h-2.5 text-[#087fc3]" />
                  <span>Avg time: {stage.avgDurationHours.toFixed(1)}h</span>
                </div>
              ) : (
                <span className="text-slate-400 italic">Duration: Tracking active</span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

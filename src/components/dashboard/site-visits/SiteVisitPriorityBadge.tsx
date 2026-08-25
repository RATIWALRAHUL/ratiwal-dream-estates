import { Flame, TrendingUp, Minus, ArrowUp } from "lucide-react";
import type { SiteVisitPriority } from "@/types/site-visit";

interface SiteVisitPriorityBadgeProps {
  priority: SiteVisitPriority;
  showLabel?: boolean;
  className?: string;
}

const PRIORITY_CONFIG: Record<SiteVisitPriority, { label: string; icon: React.ComponentType<{ className?: string }>; className: string }> = {
  LOW:    { label: "Low",    icon: Minus,      className: "text-slate-400" },
  NORMAL: { label: "Normal", icon: TrendingUp, className: "text-[#087fc3]" },
  HIGH:   { label: "High",   icon: ArrowUp,    className: "text-amber-500" },
  URGENT: { label: "Urgent", icon: Flame,      className: "text-rose-500" },
};

export function SiteVisitPriorityBadge({ priority, showLabel = false, className = "" }: SiteVisitPriorityBadgeProps) {
  const config = PRIORITY_CONFIG[priority] ?? PRIORITY_CONFIG.NORMAL;
  const Icon = config.icon;
  return (
    <span className={`inline-flex items-center gap-1 ${config.className} ${className}`} title={config.label}>
      <Icon className="w-3.5 h-3.5 shrink-0" />
      {showLabel && <span className="text-xs font-semibold">{config.label}</span>}
    </span>
  );
}

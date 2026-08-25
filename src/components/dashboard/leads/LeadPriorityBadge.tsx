import { Flame, TrendingUp, Minus, ArrowUp } from "lucide-react";
import type { LeadPriority } from "@/types/lead";

interface LeadPriorityBadgeProps {
  priority: LeadPriority;
  showLabel?: boolean;
  className?: string;
}

const PRIORITY_CONFIG: Record<LeadPriority, { label: string; icon: React.ComponentType<{ className?: string }>; className: string }> = {
  LOW:    { label: "Low",    icon: Minus,      className: "text-slate-400" },
  NORMAL: { label: "Normal", icon: TrendingUp, className: "text-[#087fc3]" },
  HIGH:   { label: "High",   icon: ArrowUp,    className: "text-amber-500" },
  URGENT: { label: "Urgent", icon: Flame,      className: "text-rose-500" },
};

export function LeadPriorityBadge({ priority, showLabel = false, className = "" }: LeadPriorityBadgeProps) {
  const config = PRIORITY_CONFIG[priority] ?? PRIORITY_CONFIG.NORMAL;
  const Icon = config.icon;
  return (
    <span className={`inline-flex items-center gap-1 ${config.className} ${className}`} title={config.label}>
      <Icon className="w-3.5 h-3.5 shrink-0" />
      {showLabel && <span className="text-xs font-semibold">{config.label}</span>}
    </span>
  );
}

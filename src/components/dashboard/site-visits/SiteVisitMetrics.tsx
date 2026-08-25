import { Calendar, Clock, CheckCircle2, UserX, AlertCircle, Sparkles } from "lucide-react";
import type { SiteVisitMetrics as MetricsType } from "@/lib/services/site-visit.service";

interface SiteVisitMetricsProps {
  metrics: MetricsType;
}

const METRIC_CARDS = [
  {
    key: "requested" as keyof MetricsType,
    label: "Requested",
    icon: Sparkles,
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
    description: "New tour inquiries",
  },
  {
    key: "awaitingConfirmation" as keyof MetricsType,
    label: "Pending",
    icon: Clock,
    iconBg: "bg-amber-100",
    iconColor: "text-amber-600",
    description: "Awaiting advisor action",
  },
  {
    key: "confirmedToday" as keyof MetricsType,
    label: "Confirmed Today",
    icon: Calendar,
    iconBg: "bg-emerald-100",
    iconColor: "text-emerald-600",
    description: "Scheduled for today",
  },
  {
    key: "upcoming" as keyof MetricsType,
    label: "Upcoming",
    icon: CheckCircle2,
    iconBg: "bg-sky-100",
    iconColor: "text-sky-600",
    description: "Future confirmed visits",
  },
  {
    key: "completed" as keyof MetricsType,
    label: "Completed",
    icon: CheckCircle2,
    iconBg: "bg-violet-100",
    iconColor: "text-violet-600",
    description: "Successfully conducted",
  },
  {
    key: "noShow" as keyof MetricsType,
    label: "No-Show",
    icon: UserX,
    iconBg: "bg-rose-100",
    iconColor: "text-rose-600",
    description: "Visitor missed appointment",
  },
] as const;

export function SiteVisitMetrics({ metrics }: SiteVisitMetricsProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      {METRIC_CARDS.map((card) => {
        const Icon = card.icon;
        const value = metrics[card.key];
        return (
          <div
            key={card.key}
            className="group bg-white rounded-2xl border border-[rgba(7,26,40,0.08)] shadow-xs p-4 flex flex-col gap-2.5 hover:shadow-sm transition-shadow"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold tracking-widest text-[#647581] uppercase">
                {card.label}
              </span>
              <div className={`w-7 h-7 rounded-xl ${card.iconBg} flex items-center justify-center`}>
                <Icon className={`w-3.5 h-3.5 ${card.iconColor}`} />
              </div>
            </div>
            <div>
              <p className="text-2xl font-bold font-serif text-[#071a28] tracking-tight leading-none">
                {value.toLocaleString("en-IN")}
              </p>
              <p className="text-[9px] text-[#647581] mt-1 truncate">{card.description}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

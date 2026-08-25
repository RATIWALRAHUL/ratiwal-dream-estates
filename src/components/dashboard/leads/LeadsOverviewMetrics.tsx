import { Users, UserCheck, Clock, TrendingUp, Trophy } from "lucide-react";
import type { LeadMetrics } from "@/lib/services/lead.service";

interface LeadsOverviewMetricsProps {
  metrics: LeadMetrics;
}

const METRIC_CARDS = [
  {
    key: "newLeads" as keyof LeadMetrics,
    label: "New Leads",
    icon: Users,
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
    description: "Awaiting first contact",
  },
  {
    key: "unassignedLeads" as keyof LeadMetrics,
    label: "Unassigned",
    icon: UserCheck,
    iconBg: "bg-amber-100",
    iconColor: "text-amber-600",
    description: "No advisor assigned",
  },
  {
    key: "followUpsDue" as keyof LeadMetrics,
    label: "Follow-ups Due",
    icon: Clock,
    iconBg: "bg-rose-100",
    iconColor: "text-rose-600",
    description: "Overdue or due now",
  },
  {
    key: "qualifiedLeads" as keyof LeadMetrics,
    label: "Qualified",
    icon: TrendingUp,
    iconBg: "bg-violet-100",
    iconColor: "text-violet-600",
    description: "In active pipeline",
  },
  {
    key: "wonLeads" as keyof LeadMetrics,
    label: "Won",
    icon: Trophy,
    iconBg: "bg-emerald-100",
    iconColor: "text-emerald-600",
    description: "Successfully converted",
  },
] as const;

export function LeadsOverviewMetrics({ metrics }: LeadsOverviewMetricsProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
      {METRIC_CARDS.map((card) => {
        const Icon = card.icon;
        const value = metrics[card.key];
        return (
          <div
            key={card.key}
            className="group bg-white rounded-2xl border border-[rgba(7,26,40,0.08)] shadow-xs p-5 flex flex-col gap-3 hover:shadow-sm transition-shadow"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold tracking-widest text-[#647581] uppercase">
                {card.label}
              </span>
              <div className={`w-8 h-8 rounded-xl ${card.iconBg} flex items-center justify-center`}>
                <Icon className={`w-4 h-4 ${card.iconColor}`} />
              </div>
            </div>
            <div>
              <p className="text-3xl font-bold font-serif text-[#071a28] tracking-tight leading-none">
                {value.toLocaleString("en-IN")}
              </p>
              <p className="text-[10px] text-[#647581] mt-1">{card.description}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

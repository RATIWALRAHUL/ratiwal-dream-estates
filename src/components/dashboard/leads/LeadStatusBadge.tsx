import type { LeadStatus } from "@/types/lead";

interface LeadStatusBadgeProps {
  status: LeadStatus;
  className?: string;
}

const STATUS_CONFIG: Record<LeadStatus, { label: string; className: string }> = {
  NEW:         { label: "New",         className: "bg-blue-100 text-blue-800 border-blue-200" },
  CONTACTED:   { label: "Contacted",   className: "bg-violet-100 text-violet-800 border-violet-200" },
  QUALIFIED:   { label: "Qualified",   className: "bg-amber-100 text-amber-800 border-amber-200" },
  NURTURING:   { label: "Nurturing",   className: "bg-sky-100 text-sky-800 border-sky-200" },
  NEGOTIATING: { label: "Negotiating", className: "bg-orange-100 text-orange-800 border-orange-200" },
  WON:         { label: "Won",         className: "bg-emerald-100 text-emerald-800 border-emerald-200" },
  LOST:        { label: "Lost",        className: "bg-slate-100 text-slate-600 border-slate-200" },
  SPAM:        { label: "Spam",        className: "bg-rose-100 text-rose-700 border-rose-200" },
  ARCHIVED:    { label: "Archived",    className: "bg-zinc-100 text-zinc-500 border-zinc-200" },
};

export function LeadStatusBadge({ status, className = "" }: LeadStatusBadgeProps) {
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.NEW;
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-mono font-bold tracking-wider border ${config.className} ${className}`}
    >
      {config.label}
    </span>
  );
}

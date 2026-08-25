import type { SiteVisitStatus } from "@/types/site-visit";

interface SiteVisitStatusBadgeProps {
  status: SiteVisitStatus;
  className?: string;
}

const STATUS_CONFIG: Record<SiteVisitStatus, { label: string; className: string }> = {
  REQUESTED:            { label: "Requested",    className: "bg-blue-100 text-blue-800 border-blue-200" },
  PENDING_CONFIRMATION: { label: "Pending",      className: "bg-amber-100 text-amber-800 border-amber-200" },
  CONFIRMED:            { label: "Confirmed",    className: "bg-emerald-100 text-emerald-800 border-emerald-200" },
  RESCHEDULE_REQUESTED: { label: "Rescheduling", className: "bg-orange-100 text-orange-800 border-orange-200" },
  CANCELLED:            { label: "Cancelled",    className: "bg-slate-100 text-slate-600 border-slate-200" },
  COMPLETED:            { label: "Completed",    className: "bg-violet-100 text-violet-800 border-violet-200" },
  NO_SHOW:              { label: "No Show",      className: "bg-rose-100 text-rose-700 border-rose-200" },
  ARCHIVED:             { label: "Archived",     className: "bg-zinc-100 text-zinc-500 border-zinc-200" },
};

export function SiteVisitStatusBadge({ status, className = "" }: SiteVisitStatusBadgeProps) {
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.REQUESTED;
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-mono font-bold tracking-wider border ${config.className} ${className}`}
    >
      {config.label}
    </span>
  );
}

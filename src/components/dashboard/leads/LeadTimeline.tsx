import { Clock, User, Zap, AlertCircle } from "lucide-react";

interface TimelineEvent {
  id: string;
  eventType: string;
  actorType: string;
  actorName?: string;
  summary: string;
  occurredAt: string;
}

interface LeadTimelineProps {
  events: TimelineEvent[];
}

const EVENT_ICON: Record<string, { icon: typeof Clock; color: string }> = {
  INQUIRY_SUBMITTED:  { icon: Zap,          color: "text-blue-500 bg-blue-100" },
  LEAD_ASSIGNED:      { icon: User,          color: "text-violet-500 bg-violet-100" },
  LEAD_REASSIGNED:    { icon: User,          color: "text-amber-500 bg-amber-100" },
  STATUS_CHANGED:     { icon: AlertCircle,   color: "text-[#087fc3] bg-blue-100" },
  PRIORITY_CHANGED:   { icon: Zap,          color: "text-orange-500 bg-orange-100" },
  NOTE_ADDED:         { icon: Clock,         color: "text-slate-500 bg-slate-100" },
  CONTACT_ATTEMPTED:  { icon: User,          color: "text-emerald-500 bg-emerald-100" },
  FOLLOWUP_SCHEDULED: { icon: Clock,         color: "text-amber-500 bg-amber-100" },
  FOLLOWUP_COMPLETED: { icon: Clock,         color: "text-emerald-500 bg-emerald-100" },
  FOLLOWUP_MISSED:    { icon: AlertCircle,   color: "text-rose-500 bg-rose-100" },
  CONSENT_WITHDRAWN:  { icon: AlertCircle,   color: "text-rose-500 bg-rose-100" },
  LEAD_MARKED_SPAM:   { icon: AlertCircle,   color: "text-rose-600 bg-rose-100" },
  LEAD_ARCHIVED:      { icon: Clock,         color: "text-zinc-500 bg-zinc-100" },
  LEAD_ANONYMIZED:    { icon: AlertCircle,   color: "text-zinc-600 bg-zinc-100" },
};

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Kolkata",
    hour12: true,
  });
}

export function LeadTimeline({ events }: LeadTimelineProps) {
  const sorted = [...events].sort(
    (a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime()
  );

  return (
    <div className="bg-white rounded-2xl border border-[rgba(7,26,40,0.08)] shadow-xs p-5">
      <h3 className="text-[10px] font-mono uppercase tracking-widest text-[#647581] font-bold mb-4">Timeline</h3>
      {sorted.length === 0 ? (
        <p className="text-xs text-[#647581] italic">No events recorded.</p>
      ) : (
        <ol className="relative border-l border-[rgba(7,26,40,0.08)] ml-4 space-y-4" aria-label="Lead timeline">
          {sorted.map((event) => {
            const cfg = EVENT_ICON[event.eventType] ?? { icon: Clock, color: "text-slate-400 bg-slate-100" };
            const Icon = cfg.icon;
            return (
              <li key={event.id} className="ml-4 relative">
                <div className={`absolute -left-7 w-5 h-5 rounded-full ${cfg.color} flex items-center justify-center ring-2 ring-white`}>
                  <Icon className="w-3 h-3" aria-hidden="true" />
                </div>
                <div>
                  <p className="text-xs text-[#071a28] font-medium leading-snug">{event.summary}</p>
                  <p className="text-[10px] text-[#647581] mt-0.5 font-mono">
                    {formatDateTime(event.occurredAt)}
                    {event.actorName && event.actorType === "ADMIN_USER" ? ` · ${event.actorName}` : ""}
                  </p>
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}

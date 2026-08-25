import { IntegrationStatusSummary } from "@/types/settings-team";
import { CheckCircle2, AlertCircle, Clock, Database, Mail, Image, MessageSquare, MapPin } from "lucide-react";

interface IntegrationStatusCardsProps {
  statuses: IntegrationStatusSummary[];
}

const CATEGORY_ICONS = {
  EMAIL: Mail,
  STORAGE: Image,
  DATABASE: Database,
  MESSAGING: MessageSquare,
  MAPS: MapPin,
};

const STATUS_PILLS = {
  CONFIGURED: { bg: "bg-emerald-50 text-emerald-700 border-emerald-200", label: "Live & Connected" },
  PARTIALLY_CONFIGURED: { bg: "bg-amber-50 text-amber-700 border-amber-200", label: "Partial" },
  NOT_CONFIGURED: { bg: "bg-slate-100 text-slate-600 border-slate-200", label: "Unconfigured" },
  SIMULATOR: { bg: "bg-sky-50 text-sky-700 border-sky-200", label: "Test Simulator" },
};

export function IntegrationStatusCards({ statuses }: IntegrationStatusCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {statuses.map((item) => {
        const Icon = CATEGORY_ICONS[item.category] || Database;
        const pill = STATUS_PILLS[item.status] || STATUS_PILLS.NOT_CONFIGURED;

        return (
          <div
            key={item.providerKey}
            className="bg-white rounded-2xl border border-[rgba(7,26,40,0.08)] p-5 shadow-xs flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#087fc3]/10 text-[#087fc3] flex items-center justify-center">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-[#071a28]">{item.displayName}</h4>
                    <span className="text-[10px] font-mono text-[#647581] uppercase">{item.category}</span>
                  </div>
                </div>

                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold border ${pill.bg}`}
                >
                  {pill.label}
                </span>
              </div>

              <p className="text-xs text-[#647581] mb-4">{item.safeDescription}</p>
            </div>

            <div className="pt-3 border-t border-[rgba(7,26,40,0.06)] flex items-center justify-between text-[10px] font-mono text-[#647581]">
              <span>Key: {item.providerKey}</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {new Date(item.lastCheckedAt).toLocaleTimeString()}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

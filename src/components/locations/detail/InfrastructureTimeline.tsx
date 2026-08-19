import { ShieldCheck, ExternalLink, CheckCircle2, Clock, FileCheck } from "lucide-react";
import { InfrastructureItem, InfrastructureStatus } from "@/types/location";

interface InfrastructureTimelineProps {
  infrastructure: InfrastructureItem[];
  locationName: string;
}

function getStatusBadge(status: InfrastructureStatus) {
  switch (status) {
    case "Operational":
      return {
        label: "Operational",
        bg: "bg-[rgba(36,209,127,0.14)]",
        text: "text-[#10854d]",
        border: "border-[rgba(36,209,127,0.35)]",
        icon: CheckCircle2,
      };
    case "Under construction":
      return {
        label: "Under Construction",
        bg: "bg-[rgba(7,132,200,0.12)]",
        text: "text-[#0784C8]",
        border: "border-[rgba(7,132,200,0.25)]",
        icon: Clock,
      };
    case "Approved":
      return {
        label: "Statutorily Approved",
        bg: "bg-[rgba(242,153,74,0.14)]",
        text: "text-[#b85e13]",
        border: "border-[rgba(242,153,74,0.3)]",
        icon: FileCheck,
      };
    case "Proposed":
    default:
      return {
        label: "DPR / Proposed Stage",
        bg: "bg-[rgba(108,117,125,0.12)]",
        text: "text-[#495057]",
        border: "border-[rgba(108,117,125,0.25)]",
        icon: FileCheck,
      };
  }
}

export function InfrastructureTimeline({ infrastructure, locationName }: InfrastructureTimelineProps) {
  return (
    <section className="py-16 md:py-24 bg-white border-b border-[rgba(7,26,40,0.08)]" aria-labelledby="infrastructure-heading">
      <div className="max-w-[1320px] w-[calc(100%-48px)] mx-auto">
        {/* Header */}
        <div className="max-w-[720px] mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[rgba(7,132,200,0.08)] border border-[rgba(7,132,200,0.2)] text-[#0784C8] text-xs font-bold uppercase tracking-wider mb-3">
            <ShieldCheck className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Infrastructure Milestones</span>
          </div>
          <h2
            id="infrastructure-heading"
            className="font-heading text-3xl sm:text-4xl lg:text-[2.75rem] text-[#031C2B] font-normal leading-tight tracking-tight mb-3"
          >
            Infrastructure shaping {locationName}.
          </h2>
          <p className="text-sm sm:text-base text-[#4a6171] leading-relaxed">
            Statutory tracking of completed, ongoing, and sanctioned public infrastructure projects with authoritative source references.
          </p>
        </div>

        {/* Infrastructure Timeline Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
          {infrastructure.map((item) => {
            const badge = getStatusBadge(item.status);
            const StatusIcon = badge.icon;

            return (
              <article
                key={item.id}
                className="p-6 sm:p-7 rounded-2xl bg-[#F5F1E9] bg-opacity-60 border border-[rgba(7,26,40,0.09)] flex flex-col justify-between"
              >
                <div>
                  {/* Category & Status Badge */}
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                    <span className="text-xs font-semibold text-[#0784C8] uppercase tracking-wider">
                      {item.category}
                    </span>
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${badge.bg} ${badge.text} border ${badge.border}`}
                    >
                      <StatusIcon className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>{badge.label}</span>
                    </span>
                  </div>

                  {/* Name */}
                  <h3 className="font-heading text-xl sm:text-2xl text-[#031C2B] font-normal mb-3">
                    {item.name}
                  </h3>

                  {/* Description */}
                  <p className="text-sm text-[#4a6171] leading-relaxed mb-6">
                    {item.description}
                  </p>
                </div>

                {/* Source Verification Footer */}
                <div className="pt-4 border-t border-[rgba(7,26,40,0.08)] flex flex-wrap items-center justify-between gap-2 text-xs text-[#667d8f]">
                  <span className="flex items-center gap-1">
                    Source:{" "}
                    {item.sourceUrl ? (
                      <a
                        href={item.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#0784C8] font-semibold hover:underline inline-flex items-center gap-1"
                      >
                        <span>{item.source}</span>
                        <ExternalLink className="w-3 h-3" aria-hidden="true" />
                      </a>
                    ) : (
                      <span className="font-medium text-[#2c3e50]">{item.source}</span>
                    )}
                  </span>

                  <span className="text-[11px] text-[#7a93a5]">Verified: {item.lastVerifiedAt}</span>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

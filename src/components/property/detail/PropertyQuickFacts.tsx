import { Building, ShieldCheck, Ruler, Calendar, CheckCircle2, Clock } from "lucide-react";
import { Property } from "@/types/property";

interface PropertyQuickFactsProps {
  property: Property;
}

export function PropertyQuickFacts({ property }: PropertyQuickFactsProps) {
  const facts = [
    {
      icon: Building,
      label: "Property Classification",
      value: property.propertyType,
      subtext: "Freehold Ownership",
    },
    {
      icon: Ruler,
      label: "Available Plot Dimensions",
      value: property.plotSizes.join(", "),
      subtext: "Standard & Corner Plots",
    },
    {
      icon: ShieldCheck,
      label: "Planning Authority",
      value: property.approvalAuthority || "Municipal / Revenue Sanction",
      subtext: property.approvalDetails ? "Sanctioned Scheme" : "Title Verified",
    },
    {
      icon: CheckCircle2,
      label: "Regulatory Status",
      value: property.reraInfo?.registrationStatus || (property.status === "Available" ? "Ready for Registry" : property.status),
      subtext: property.reraInfo ? `RERA: ${property.reraInfo.reraNumber}` : "Clear Revenue Title",
    },
    {
      icon: Clock,
      label: "Possession & Registry",
      value: property.possessionTimeline || "Immediate Registry",
      subtext: "Dakhil-Kharij Support",
    },
    {
      icon: Calendar,
      label: "Last Audit Review",
      value: new Date(property.updatedAt).toLocaleDateString("en-IN", {
        month: "short",
        year: "numeric",
      }),
      subtext: "Ratiwal Advisory Verified",
    },
  ];

  return (
    <section aria-label="Key Property Facts" className="mb-8 sm:mb-12">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
        {facts.map((fact, idx) => {
          const Icon = fact.icon;
          return (
            <div
              key={idx}
              className="p-4 sm:p-5 rounded-2xl bg-white border border-[rgba(7,26,40,0.08)] shadow-[0_2px_12px_rgba(7,26,40,0.03)] flex flex-col justify-between transition-all duration-200 hover:border-[rgba(8,127,195,0.25)] hover:shadow-sm"
            >
              <div className="flex items-center gap-2 mb-2 min-w-0">
                <div className="w-6.5 h-6.5 sm:w-7 sm:h-7 rounded-lg bg-[var(--cyan-soft)] text-[#0784C8] flex items-center justify-center flex-shrink-0">
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <span className="text-[10px] sm:text-[11px] font-semibold text-[#0784C8] uppercase tracking-wider truncate">
                  {fact.label}
                </span>
              </div>

              <div className="min-w-0">
                <span className="text-xs sm:text-sm font-semibold text-[#071A28] leading-snug block mb-1">
                  {fact.value}
                </span>
                <span className="text-[10.5px] sm:text-[11px] text-[#667d8f] font-normal block leading-tight">
                  {fact.subtext}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

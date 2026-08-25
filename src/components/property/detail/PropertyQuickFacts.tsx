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
    <section aria-label="Key Property Facts" className="mb-12">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {facts.map((fact, idx) => {
          const Icon = fact.icon;
          return (
            <div
              key={idx}
              className="p-5 rounded-2xl bg-white border border-[rgba(7,26,40,0.08)] shadow-[0_2px_12px_rgba(7,26,40,0.03)] flex flex-col justify-between"
            >
              <div className="flex items-center gap-2 text-xs font-bold text-[#0784C8] uppercase tracking-wider mb-2">
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span>{fact.label}</span>
              </div>

              <div>
                <span className="font-heading text-base sm:text-lg font-bold text-[#031C2B] leading-tight block mb-0.5">
                  {fact.value}
                </span>
                <span className="text-[11px] text-[#7a93a5]">{fact.subtext}</span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

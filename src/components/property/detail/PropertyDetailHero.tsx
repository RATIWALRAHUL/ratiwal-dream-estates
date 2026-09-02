import Link from "next/link";
import { MapPin, ShieldCheck } from "lucide-react";
import { Property } from "@/types/property";

interface PropertyDetailHeroProps {
  property: Property;
  onOpenSiteVisit: () => void;
}

export function PropertyDetailHero({ property, onOpenSiteVisit }: PropertyDetailHeroProps) {
  return (
    <div className="pb-5 sm:pb-6 border-b border-[rgba(7,26,40,0.08)] mb-6 sm:mb-8">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs text-[#667d8f] mb-2.5 sm:mb-3" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-[#0784C8] transition-colors">Home</Link>
        <span>/</span>
        <Link href="/properties" className="hover:text-[#0784C8] transition-colors">Properties</Link>
        <span>/</span>
        <span className="text-[#0784C8] truncate max-w-[160px] sm:max-w-none font-medium">{property.name}</span>
      </nav>

      {/* Badges & Meta Row */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 sm:gap-3 mb-3">
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          <span className="px-2.5 sm:px-3 py-1 rounded-full bg-[#031C2B] text-white text-[10.5px] sm:text-xs font-semibold uppercase tracking-wider">
            {property.propertyType}
          </span>

          <span
            className={`px-2.5 sm:px-3 py-1 rounded-full text-[10.5px] sm:text-xs font-semibold flex items-center gap-1.5 ${
              property.status === "Available"
                ? "bg-[rgba(36,209,127,0.12)] text-[#10854d] border border-[rgba(36,209,127,0.25)]"
                : property.status === "Limited"
                ? "bg-[rgba(243,156,18,0.12)] text-[#b85e13] border border-[rgba(243,156,18,0.25)]"
                : "bg-[#edf5f9] text-[#0784C8] border border-[rgba(7,132,200,0.2)]"
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-current" />
            <span>{property.status}</span>
          </span>

          {property.approvalAuthority && (
            <span className="px-2.5 sm:px-3 py-1 rounded-full bg-[#edf5f9] text-[#0784C8] border border-[rgba(7,132,200,0.25)] text-[10.5px] sm:text-xs font-semibold flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{property.approvalAuthority} Approved</span>
            </span>
          )}
        </div>

        {/* Total Township Area & Readiness */}
        {property.totalTownshipArea && (
          <span className="text-[11px] sm:text-xs text-[#667d8f] font-mono">
            Masterplan: {property.totalTownshipArea}
          </span>
        )}
      </div>

      {/* Title & Location */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 sm:gap-6">
        <div>
          <h1 className="font-instrument text-2xl xs:text-3xl sm:text-4xl lg:text-[2.75rem] text-[#031C2B] font-normal leading-[1.08] tracking-tight mb-2">
            {property.name}
          </h1>

          <p className="flex items-center gap-1.5 text-xs sm:text-sm text-[#536574] font-medium">
            <MapPin className="w-3.5 h-3.5 text-[#0784C8] flex-shrink-0" />
            <span>{property.location}, {property.city}, {property.state}</span>
          </p>
        </div>

        {/* Pricing Display */}
        <div className="flex flex-col items-start lg:items-end flex-shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-[rgba(7,26,40,0.06)]">
          <span className="text-[10px] sm:text-[11px] font-bold text-[#667d8f] uppercase tracking-wider block mb-0.5">
            Pricing Architecture
          </span>
          <div className="text-xl xs:text-2xl sm:text-3xl font-heading font-bold text-[#031C2B] leading-tight">
            {property.priceLabel}
          </div>
          <span className="text-[10.5px] sm:text-[11px] text-[#7a93a5] mt-0.5 font-medium">
            Clear Freehold Title • Registry Ready
          </span>
        </div>
      </div>
    </div>
  );
}

import Link from "next/link";
import { Compass, ShieldCheck, MapPin, ArrowRight } from "lucide-react";
import { Location } from "@/types/location";
import { getPropertiesForLocation } from "@/data/locations";

interface MicroMarketSectionProps {
  location: Location;
}

export function MicroMarketSection({ location }: MicroMarketSectionProps) {
  const allLocationProperties = getPropertiesForLocation(location.name);

  return (
    <section
      id="micro-markets"
      className="py-16 md:py-24 bg-[#F5F1E9] border-b border-[rgba(7,26,40,0.08)]"
      aria-labelledby="micromarkets-section-heading"
    >
      <div className="max-w-[1320px] w-[calc(100%-48px)] mx-auto">
        {/* Header */}
        <div className="max-w-[720px] mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[rgba(7,132,200,0.08)] border border-[rgba(7,132,200,0.2)] text-[#0784C8] text-xs font-bold uppercase tracking-wider mb-3">
            <Compass className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Growth Vectors</span>
          </div>
          <h2
            id="micromarkets-section-heading"
            className="font-heading text-3xl sm:text-4xl lg:text-[2.75rem] text-[#031C2B] font-normal leading-tight tracking-tight mb-3"
          >
            Micro-markets to understand in {location.name}.
          </h2>
          <p className="text-sm sm:text-base text-[#4a6171] leading-relaxed">
            Detailed breakdown of key development belts, statutory zoning boundaries, and infrastructure anchors across {location.name}.
          </p>
        </div>

        {/* Micro-markets Detailed Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {location.microMarkets.map((mm) => {
            // Find relevant properties
            const matchedProps = allLocationProperties.filter((p) =>
              mm.relevantPropertySlugs.includes(p.slug) ||
              p.name.toLowerCase().includes(mm.name.toLowerCase()) ||
              p.location.toLowerCase().includes(mm.name.toLowerCase())
            );

            return (
              <div
                key={mm.id}
                id={mm.id}
                className="bg-white rounded-2xl p-7 sm:p-8 border border-[rgba(7,26,40,0.1)] shadow-[0_4px_20px_rgba(7,26,40,0.04)] flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#0784C8] flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5" />
                      {location.name} Strategic Vector
                    </span>
                    <span className="text-xs px-2.5 py-1 rounded bg-[#F5F1E9] text-[#031C2B] font-mono font-semibold">
                      {mm.regulatoryAuthority}
                    </span>
                  </div>

                  <h3 className="font-heading text-2xl text-[#031C2B] font-normal mb-1.5">
                    {mm.name}
                  </h3>
                  <p className="text-xs text-[#667d8f] font-medium italic mb-4">
                    {mm.tagline}
                  </p>

                  <p className="text-sm text-[#4a6171] leading-relaxed mb-6">
                    {mm.description}
                  </p>

                  {/* Highlights Bullet List */}
                  <div className="space-y-2.5 mb-6 p-4 rounded-xl bg-[#F5F1E9] border border-[rgba(7,26,40,0.06)]">
                    <span className="text-[11px] font-bold text-[#031C2B] uppercase tracking-wider block mb-1">
                      Key Corridors &amp; Infrastructure Context:
                    </span>
                    {mm.highlights.map((hl, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs text-[#2c3e50]">
                        <ShieldCheck className="w-3.5 h-3.5 text-[#24D17F] flex-shrink-0 mt-0.5" />
                        <span>{hl}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Micro-market Footer: Matched Properties Link */}
                <div className="pt-4 border-t border-[rgba(7,26,40,0.08)] flex items-center justify-between gap-4">
                  <div className="flex flex-wrap gap-1.5">
                    {mm.propertyTypes.map((pt, idx) => (
                      <span key={idx} className="text-xs px-2.5 py-1 rounded bg-[#edf5f9] text-[#076fa7] font-semibold">
                        {pt}
                      </span>
                    ))}
                  </div>

                  {matchedProps.length > 0 ? (
                    <a
                      href="#properties"
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0784C8] hover:text-[#031C2B] transition-colors whitespace-nowrap"
                    >
                      <span>{matchedProps.length} Available {matchedProps.length === 1 ? "Parcel" : "Parcels"}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </a>
                  ) : (
                    <span className="text-xs text-[#7a93a5]">Upcoming Allocations</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

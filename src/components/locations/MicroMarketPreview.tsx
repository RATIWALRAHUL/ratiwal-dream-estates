import Link from "next/link";
import { ArrowRight, Compass, ShieldCheck, MapPin } from "lucide-react";
import { Location } from "@/types/location";

interface MicroMarketPreviewProps {
  locations: Location[];
}

export function MicroMarketPreview({ locations }: MicroMarketPreviewProps) {
  // Aggregate key strategic micro-markets from real location data
  const highlightedMicroMarkets = locations.flatMap((loc) =>
    loc.microMarkets.map((mm) => ({
      ...mm,
      parentLocationName: loc.name,
      parentLocationSlug: loc.slug,
      parentState: loc.state,
    }))
  );

  return (
    <section className="py-16 md:py-24 bg-[#F5F1E9] border-b border-[rgba(7,26,40,0.08)]" aria-labelledby="micro-markets-heading">
      <div className="max-w-[1320px] w-[calc(100%-48px)] mx-auto">
        {/* Section Header */}
        <div className="max-w-[720px] mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[rgba(7,132,200,0.08)] border border-[rgba(7,132,200,0.2)] text-[#0784C8] text-xs font-bold uppercase tracking-wider mb-3">
            <Compass className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Local Context</span>
          </div>
          <h2
            id="micro-markets-heading"
            className="font-heading text-3xl sm:text-4xl lg:text-[2.75rem] text-[#031C2B] font-normal leading-tight tracking-tight mb-3"
          >
            Understand more than the city name.
          </h2>
          <p className="text-sm sm:text-base text-[#4a6171] leading-relaxed">
            Real estate value is created at the micro-market level. Discover the arterial road networks, SEZ employment
            nodes, and statutory development authorities shaping individual corridors.
          </p>
        </div>

        {/* Micro-markets Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {highlightedMicroMarkets.slice(0, 6).map((mm) => (
            <article
              key={mm.id}
              className="bg-white rounded-2xl p-6 sm:p-7 border border-[rgba(7,26,40,0.09)] shadow-[0_4px_16px_rgba(7,26,40,0.04)] flex flex-col justify-between hover:border-[rgba(7,132,200,0.35)] transition-all duration-300 group"
            >
              <div>
                {/* Parent Location Badge */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#0784C8] flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {mm.parentLocationName}, {mm.parentState.split("/")[0]}
                  </span>
                  <span className="text-[10.5px] px-2 py-0.5 rounded bg-[#F5F1E9] text-[#667d8f] font-mono">
                    {mm.regulatoryAuthority}
                  </span>
                </div>

                <h3 className="font-heading text-xl text-[#031C2B] font-normal mb-1.5 group-hover:text-[#0784C8] transition-colors">
                  {mm.name}
                </h3>
                <p className="text-xs text-[#667d8f] font-medium mb-4 italic">
                  {mm.tagline}
                </p>

                <p className="text-xs sm:text-sm text-[#4a6171] leading-relaxed mb-5">
                  {mm.description}
                </p>

                {/* Key Context Highlights */}
                <div className="space-y-2 mb-6">
                  {mm.highlights.slice(0, 2).map((hl, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs text-[#2c3e50]">
                      <ShieldCheck className="w-3.5 h-3.5 text-[#24D17F] flex-shrink-0 mt-0.5" />
                      <span>{hl}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Link */}
              <div className="pt-4 border-t border-[rgba(7,26,40,0.08)] flex items-center justify-between">
                <div className="flex flex-wrap gap-1">
                  {mm.propertyTypes.map((pt, idx) => (
                    <span key={idx} className="text-[10.5px] px-2 py-0.5 rounded bg-[#edf5f9] text-[#076fa7] font-semibold">
                      {pt}
                    </span>
                  ))}
                </div>

                <Link
                  href={`/locations/${mm.parentLocationSlug}#micro-markets`}
                  className="inline-flex items-center gap-1 text-xs font-bold text-[#0784C8] group-hover:text-[#031C2B] transition-colors"
                  aria-label={`Learn more about ${mm.name} in ${mm.parentLocationName}`}
                >
                  <span>Explore Belt</span>
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

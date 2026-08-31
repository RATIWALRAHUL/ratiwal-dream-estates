import Link from "next/link";
import Image from "next/image";
import { ArrowRight, MapPin, Building2, ShieldCheck } from "lucide-react";
import { locations } from "@/data/locations";

export function MarketGuideSpotlight() {
  const spotlights = locations.slice(0, 3); // Jaipur, Navi Mumbai, Ajmer

  return (
    <section className="py-16 md:py-24 bg-[#F5F1E9] border-b border-[rgba(7,26,40,0.08)]" aria-labelledby="market-spotlight-heading">
      <div className="max-w-[1320px] w-[calc(100%-48px)] mx-auto">
        {/* Header */}
        <div className="max-w-[720px] mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[rgba(7,132,200,0.08)] border border-[rgba(7,132,200,0.2)] text-[#0784C8] text-xs font-bold uppercase tracking-wider mb-3">
            <MapPin className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Regional Intelligence</span>
          </div>
          <h2
            id="market-spotlight-heading"
            className="font-heading text-3xl sm:text-4xl lg:text-[2.75rem] text-[#031C2B] font-normal leading-tight tracking-tight mb-3"
          >
            Corridor Market Research &amp; Guides.
          </h2>
          <p className="text-sm sm:text-base text-[#4a6171] leading-relaxed">
            Deep-dive regional analysis covering masterplan zones, statutory planning authorities (JDA, CIDCO, ADA), and arterial highway connectivity.
          </p>
        </div>

        {/* Spotlights Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {spotlights.map((loc) => (
            <div
              key={loc.slug}
              className="group bg-white rounded-2xl border border-[rgba(7,26,40,0.1)] overflow-hidden shadow-[0_4px_20px_rgba(7,26,40,0.04)] hover:shadow-[0_16px_36px_rgba(7,26,40,0.1)] hover:border-[rgba(7,132,200,0.35)] transition-all duration-300 flex flex-col justify-between"
            >
              {/* Image */}
              <div className="relative aspect-[16/10] w-full bg-[#072435] overflow-hidden">
                <Image
                  src={loc.heroImage}
                  alt={`${loc.name} Real Estate Market Analysis`}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#031C2B] via-transparent to-transparent opacity-75" />

                <div className="absolute bottom-3 left-3.5 text-white z-10">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#52BDE9] block">
                    {loc.state}
                  </span>
                  <h3 className="font-heading text-lg font-bold text-white leading-tight">
                    {loc.name}
                  </h3>
                </div>
              </div>

              {/* Body */}
              <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  <p className="text-xs text-[#536574] leading-relaxed mb-4 line-clamp-3">
                    {loc.shortDescription}
                  </p>

                  <div className="space-y-1.5 mb-6 text-xs text-[#2c3e50]">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-3.5 h-3.5 text-[#24D17F]" />
                      <span>Planning Authority: {loc.microMarkets[0]?.regulatoryAuthority || loc.region}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Building2 className="w-3.5 h-3.5 text-[#0784C8]" />
                      <span>Micro-Markets: {loc.microMarkets.length} Key Belts</span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-[rgba(7,26,40,0.08)] flex items-center justify-between">
                  <Link
                    href={`/locations/${loc.slug}`}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0784C8] hover:text-[#031C2B] transition-colors"
                  >
                    <span>View Market Guide</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

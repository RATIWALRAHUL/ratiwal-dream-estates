import { Compass, ShieldCheck, MapPin, Building2, CheckCircle2 } from "lucide-react";
import { Location } from "@/types/location";

interface LocationOverviewProps {
  location: Location;
}

export function LocationOverview({ location }: LocationOverviewProps) {
  return (
    <section className="py-16 md:py-24 bg-white border-b border-[rgba(7,26,40,0.08)]" aria-labelledby="overview-heading">
      <div className="max-w-[1320px] w-[calc(100%-48px)] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          {/* Main Editorial Text (Left 7 cols) */}
          <div className="lg:col-span-7">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[rgba(7,132,200,0.08)] border border-[rgba(7,132,200,0.2)] text-[#0784C8] text-xs font-bold uppercase tracking-wider mb-3">
              <Compass className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Market Fundamentals</span>
            </div>

            <h2
              id="overview-heading"
              className="font-heading text-3xl sm:text-4xl lg:text-[2.75rem] text-[#031C2B] font-normal leading-tight tracking-tight mb-6"
            >
              Understanding {location.name}.
            </h2>

            <div className="prose text-base text-[#4a6171] leading-relaxed space-y-4">
              <p>{location.longDescription}</p>
              <p>
                Whether purchasing for personal villa construction, generational land-banking, or institutional logistics deployment,
                investing in {location.name} demands clear verification of sectoral masterplans, width of approach roads, and
                sub-registrar registry mutation records.
              </p>
            </div>

            {/* Buyer Profiles Section */}
            <div className="mt-8 pt-8 border-t border-[rgba(7,26,40,0.08)]">
              <h3 className="font-heading text-xl text-[#031C2B] font-semibold mb-4">
                Suitable Buyer &amp; Investor Profiles:
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="p-4 rounded-xl bg-[#F5F1E9] border border-[rgba(7,26,40,0.06)]">
                  <span className="text-xs font-bold text-[#0784C8] uppercase block mb-1">Residential &amp; Villa End-Users</span>
                  <p className="text-xs text-[#4a6171] leading-relaxed">
                    Buyers looking for master-planned township plots with underground utilities, gated security, and immediate construction readiness.
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-[#F5F1E9] border border-[rgba(7,26,40,0.06)]">
                  <span className="text-xs font-bold text-[#0784C8] uppercase block mb-1">Commercial &amp; Logistics Enterprises</span>
                  <p className="text-xs text-[#4a6171] leading-relaxed">
                    Corporate users requiring high-visibility highway frontage, wide container turning radius, and industrial 3-phase power infrastructure.
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-[#F5F1E9] border border-[rgba(7,26,40,0.06)]">
                  <span className="text-xs font-bold text-[#0784C8] uppercase block mb-1">Long-Term Capital Investors</span>
                  <p className="text-xs text-[#4a6171] leading-relaxed">
                    Family offices and investors seeking multi-year capital compounding anchored by government infrastructure milestones.
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-[#F5F1E9] border border-[rgba(7,26,40,0.06)]">
                  <span className="text-xs font-bold text-[#0784C8] uppercase block mb-1">NRI &amp; Remote Buyers</span>
                  <p className="text-xs text-[#4a6171] leading-relaxed">
                    Out-of-state buyers requiring 100% transparent documentation, video surveys, and complete legal liaison from token to registry.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Rail: Market Fact Sheet (Right 5 cols) */}
          <div className="lg:col-span-5 bg-[#F5F1E9] rounded-2xl p-7 sm:p-8 border border-[rgba(7,26,40,0.09)] space-y-6">
            <h3 className="font-heading text-xl text-[#031C2B] font-bold border-b border-[rgba(7,26,40,0.1)] pb-3">
              {location.name} Fact Sheet
            </h3>

            <div className="space-y-4 text-xs">
              <div>
                <span className="text-[#667d8f] uppercase font-semibold block mb-1">State &amp; Region</span>
                <span className="text-sm font-bold text-[#031C2B]">{location.state} ({location.region})</span>
              </div>

              <div>
                <span className="text-[#667d8f] uppercase font-semibold block mb-1">Primary Statutory Authority</span>
                <span className="text-sm font-bold text-[#0784C8]">
                  {location.microMarkets[0]?.regulatoryAuthority || "Competent Development Authority"}
                </span>
              </div>

              <div>
                <span className="text-[#667d8f] uppercase font-semibold block mb-1">Strategic Micro-Markets</span>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {location.microMarkets.map((mm) => (
                    <span key={mm.id} className="px-2.5 py-1 rounded bg-white text-[#031C2B] font-medium border border-[rgba(7,26,40,0.08)]">
                      {mm.name}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <span className="text-[#667d8f] uppercase font-semibold block mb-1">Primary Highway &amp; Freight Vectors</span>
                <span className="text-sm text-[#2c3e50] font-medium block">
                  {location.connectivity.map((c) => c.route).slice(0, 2).join(" • ")}
                </span>
              </div>

              <div>
                <span className="text-[#667d8f] uppercase font-semibold block mb-1">Documentation Standard</span>
                <span className="text-sm text-[#2c3e50] font-medium block">
                  {location.marketData?.documentationStandard || "Clear Title Revenue Search"}
                </span>
              </div>

              <div className="pt-4 border-t border-[rgba(7,26,40,0.08)]">
                <span className="text-[#667d8f] uppercase font-semibold block mb-1">Geographic Coordinates</span>
                <span className="text-xs font-mono text-[#0784C8]">
                  {location.coordinates.latitude.toFixed(4)}° N, {location.coordinates.longitude.toFixed(4)}° E
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

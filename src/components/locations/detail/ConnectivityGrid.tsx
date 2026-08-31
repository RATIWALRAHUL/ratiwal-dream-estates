import { Navigation, Clock, Car } from "lucide-react";
import { ConnectivityItem } from "@/types/location";

interface ConnectivityGridProps {
  connectivity: ConnectivityItem[];
  locationName: string;
}

export function ConnectivityGrid({ connectivity, locationName }: ConnectivityGridProps) {
  return (
    <section className="py-16 md:py-24 bg-[#F5F1E9] border-b border-[rgba(7,26,40,0.08)]" aria-labelledby="connectivity-heading">
      <div className="max-w-[1320px] w-[calc(100%-48px)] mx-auto">
        {/* Header */}
        <div className="max-w-[720px] mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[rgba(7,132,200,0.08)] border border-[rgba(7,132,200,0.2)] text-[#0784C8] text-xs font-bold uppercase tracking-wider mb-3">
            <Navigation className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Transit &amp; Distance Index</span>
          </div>
          <h2
            id="connectivity-heading"
            className="font-heading text-3xl sm:text-4xl lg:text-[2.75rem] text-[#031C2B] font-normal leading-tight tracking-tight mb-3"
          >
            Arterial Connectivity from {locationName}.
          </h2>
          <p className="text-sm sm:text-base text-[#4a6171] leading-relaxed">
            Direct transit distances and approximate travel times to core commercial centers, transport terminals, and arterial highway junctions.
          </p>
        </div>

        {/* Connectivity Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {connectivity.map((item, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl p-6 border border-[rgba(7,26,40,0.1)] shadow-sm flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="text-[11px] font-semibold text-[#0784C8] uppercase tracking-wider">
                    {item.travelMode}
                  </span>
                  <Car className="w-4 h-4 text-[#0784C8]" aria-hidden="true" />
                </div>

                <h3 className="font-heading text-lg text-[#031C2B] font-semibold mb-2">
                  {item.destination}
                </h3>
                <p className="text-xs text-[#667d8f] mb-4">
                  {item.route}
                </p>
              </div>

              <div className="pt-4 border-t border-[rgba(7,26,40,0.08)] flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-[#667d8f] block uppercase font-semibold">Distance</span>
                  <strong className="text-sm text-[#031C2B] font-heading">{item.distanceKm} km</strong>
                </div>
                <div className="text-right">
                  <span className="text-[11px] text-[#667d8f] block uppercase font-semibold">Approx. Time</span>
                  <span className="inline-flex items-center gap-1 text-sm font-bold text-[#0784C8]">
                    <Clock className="w-3 h-3" />
                    {item.approxTravelTime}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Disclaimer */}
        <p className="text-xs text-[#7a93a5] mt-6 italic text-center sm:text-left">
          * Note: Travel times and distances are approximate based on standard traffic conditions and verified highway alignments.
        </p>
      </div>
    </section>
  );
}

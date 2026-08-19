import { Navigation, Clock, MapPin, Milestone, TrendingUp } from "lucide-react";
import { Property } from "@/types/property";

interface PropertyConnectivityTimelineProps {
  property: Property;
}

export function PropertyConnectivityTimeline({ property }: PropertyConnectivityTimelineProps) {
  return (
    <section aria-labelledby="connectivity-heading" className="mb-12">
      <div className="p-7 sm:p-8 rounded-3xl bg-white border border-[rgba(7,26,40,0.08)] shadow-[0_4px_24px_rgba(7,26,40,0.04)]">
        <div className="max-w-[720px] mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[rgba(7,132,200,0.08)] border border-[rgba(7,132,200,0.2)] text-[#0784C8] text-xs font-bold uppercase tracking-wider mb-2">
            <Navigation className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Regional Access &amp; Milestones</span>
          </div>
          <h2
            id="connectivity-heading"
            className="font-heading text-2xl sm:text-3xl text-[#031C2B] font-normal leading-tight tracking-tight mb-2"
          >
            Connectivity and surrounding infrastructure.
          </h2>
          <p className="text-xs sm:text-sm text-[#4a6171]">
            Highway corridors, airport links, and employment clusters accessible from {property.name}.
          </p>
        </div>

        {/* Connectivity Milestones Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          {property.connectivity.map((item, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl bg-[#F5F1E9] border border-[rgba(7,26,40,0.06)] flex items-start gap-3"
            >
              <div className="w-8 h-8 rounded-lg bg-white text-[#0784C8] flex items-center justify-center flex-shrink-0 shadow-2xs mt-0.5">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <strong className="text-xs sm:text-sm text-[#031C2B] leading-snug block">
                  {item}
                </strong>
                <span className="text-[11px] text-[#667d8f]">Direct Highway / Arterial Route</span>
              </div>
            </div>
          ))}
        </div>

        {/* Nearby Landmarks & Future Corridor Development */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-[rgba(7,26,40,0.08)]">
          {/* Landmarks */}
          <div>
            <h3 className="text-xs font-bold text-[#031C2B] uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-[#0784C8]" />
              <span>Key Surrounding Landmarks</span>
            </h3>
            <ul className="space-y-2 text-xs text-[#536574]">
              {property.nearbyLandmarks.map((lm, idx) => (
                <li key={idx} className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#0784C8]" />
                  <span>{lm}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Future Development */}
          {property.futureDevelopment && property.futureDevelopment.length > 0 && (
            <div>
              <h3 className="text-xs font-bold text-[#031C2B] uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-[#24D17F]" />
                <span>Planned Corridor Infrastructure</span>
              </h3>
              <ul className="space-y-2 text-xs text-[#536574]">
                {property.futureDevelopment.map((fd, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#24D17F] mt-1 flex-shrink-0" />
                    <span>{fd}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

import { MapPin, ExternalLink, Navigation, Compass } from "lucide-react";
import { Property } from "@/types/property";

interface PropertyLocationMapProps {
  property: Property;
}

export function PropertyLocationMap({ property }: PropertyLocationMapProps) {
  const coords = property.coordinates || { latitude: 26.8428, longitude: 75.6415 };
  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${coords.latitude},${coords.longitude}`;

  return (
    <section aria-labelledby="map-heading" className="mb-12">
      <div className="p-7 sm:p-8 rounded-3xl bg-white border border-[rgba(7,26,40,0.08)] shadow-[0_4px_24px_rgba(7,26,40,0.04)]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[rgba(7,132,200,0.08)] border border-[rgba(7,132,200,0.2)] text-[#0784C8] text-xs font-bold uppercase tracking-wider mb-2">
              <Compass className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Geospatial Position</span>
            </div>
            <h2
              id="map-heading"
              className="font-heading text-2xl sm:text-3xl text-[#031C2B] font-normal leading-tight tracking-tight"
            >
              Location and route access.
            </h2>
          </div>

          <a
            href={googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#031C2B] hover:bg-[#0784C8] text-white text-xs font-bold transition-colors shadow-sm self-start sm:self-auto focus-visible:outline"
            aria-label={`Open ${property.name} on Google Maps (opens in a new tab)`}
          >
            <Navigation className="w-3.5 h-3.5" />
            <span>Open in Google Maps</span>
            <ExternalLink className="w-3 h-3 ml-0.5" />
          </a>
        </div>

        {/* Map Stage Visual */}
        <div className="relative aspect-[16/9] w-full rounded-2xl overflow-hidden bg-[#072435] border border-[rgba(7,26,40,0.1)] flex items-center justify-center text-center p-6 mb-6">
          {/* Subtle blueprint grid */}
          <div
            className="absolute inset-0 opacity-15 bg-[radial-gradient(#52BDE9_1px,transparent_1px)] [background-size:24px_24px]"
            aria-hidden="true"
          />

          <div className="relative z-10 max-w-md">
            <div className="w-12 h-12 rounded-full bg-[rgba(7,132,200,0.2)] border border-[rgba(82,189,233,0.4)] text-[#52BDE9] flex items-center justify-center mx-auto mb-3 shadow-lg">
              <MapPin className="w-6 h-6 animate-bounce" />
            </div>

            <h3 className="font-heading text-lg font-bold text-white mb-1">
              {property.name}
            </h3>
            <p className="text-xs text-[#c5d8e4] mb-3">
              {property.location}, {property.city}, {property.state}
            </p>

            <span className="inline-block font-mono text-[11px] px-3 py-1 rounded-full bg-[rgba(255,255,255,0.1)] text-[#52BDE9] border border-[rgba(255,255,255,0.15)]">
              Coordinates: {coords.latitude}° N, {coords.longitude}° E
            </span>
          </div>
        </div>

        {/* Textual Address and Landmark Alternative */}
        <div className="p-4 rounded-xl bg-[#F5F1E9] border border-[rgba(7,26,40,0.06)] text-xs text-[#536574] leading-relaxed">
          <strong className="text-[#031C2B] block mb-1">On-Ground Access Route:</strong>
          <span>
            Accessible via primary sectoral corridor off {property.location}. Direct connectivity to {property.city} arterial highway network. For verified GPS pins or on-site escort, consult our field team.
          </span>
        </div>
      </div>
    </section>
  );
}

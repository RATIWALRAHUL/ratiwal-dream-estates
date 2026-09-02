"use client";

import dynamic from "next/dynamic";
import { ExternalLink, Navigation, Compass, MapPin } from "lucide-react";
import { Property } from "@/types/property";

const PropertyLeafletMap = dynamic(
  () => import("./PropertyLeafletMap").then((mod) => mod.PropertyLeafletMap),
  {
    ssr: false,
    loading: () => (
      <div className="relative aspect-[16/9] w-full rounded-2xl overflow-hidden bg-[#072435] border border-[rgba(7,26,40,0.1)] flex flex-col items-center justify-center text-center p-6 mb-6">
        <div className="w-10 h-10 rounded-full border-3 border-[#52BDE9] border-t-transparent animate-spin mb-3" />
        <p className="text-xs font-bold text-[#52BDE9] font-mono">Loading Real Geographic Map...</p>
      </div>
    ),
  }
);

interface PropertyLocationMapProps {
  property: Property;
}

export function PropertyLocationMap({ property }: PropertyLocationMapProps) {
  const coords = property.coordinates || { latitude: 26.8428, longitude: 75.6415 };
  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${coords.latitude},${coords.longitude}`;

  return (
    <section aria-labelledby="map-heading" className="mb-8 sm:mb-12">
      <div className="p-4 sm:p-6 sm:p-8 rounded-2xl sm:rounded-3xl bg-white border border-[rgba(7,26,40,0.08)] shadow-[0_4px_24px_rgba(7,26,40,0.04)]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3 mb-5 sm:mb-6">
          <div>
            <div className="inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1 rounded-full bg-[rgba(7,132,200,0.08)] border border-[rgba(7,132,200,0.2)] text-[#0784C8] text-[10.5px] sm:text-xs font-semibold uppercase tracking-wider mb-2">
              <Compass className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Real Geospatial Map</span>
            </div>
            <h2
              id="map-heading"
              className="font-instrument text-xl sm:text-2xl sm:text-3xl text-[#031C2B] font-normal leading-tight tracking-tight"
            >
              Location, road network &amp; key landmarks.
            </h2>
          </div>

          <a
            href={googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-full bg-[#031C2B] hover:bg-[#0784C8] text-white text-[11px] sm:text-xs font-bold transition-colors shadow-sm self-start sm:self-auto focus-visible:outline"
            aria-label={`Open ${property.name} on Google Maps (opens in a new tab)`}
          >
            <Navigation className="w-3.5 h-3.5" />
            <span>Open in Google Maps</span>
            <ExternalLink className="w-3 h-3 ml-0.5" />
          </a>
        </div>

        {/* Real Interactive Leaflet Map */}
        <PropertyLeafletMap property={property} />

        {/* Textual Address and Landmark Alternative */}
        <div className="p-4 rounded-xl bg-[#F5F1E9] border border-[rgba(7,26,40,0.06)] text-xs text-[#536574] leading-relaxed">
          <strong className="text-[#031C2B] block mb-1">On-Ground Access &amp; Infrastructure Route:</strong>
          <span>
            Accessible via primary sectoral corridor off {property.location}. Direct connectivity to {property.city} arterial expressway network, international airport, and major healthcare hubs. For verified on-site field visits and GPS coordinates, consult our advisory desk.
          </span>
        </div>
      </div>
    </section>
  );
}

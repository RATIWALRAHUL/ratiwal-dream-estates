"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { Navigation, ArrowRight, Layers, CheckCircle2, MapPin } from "lucide-react";
import { Location } from "@/types/location";
import { getLocationSummaryStats } from "@/data/locations";

// Dynamically import the real Leaflet interactive map with ssr: false
const RealInteractiveMap = dynamic(
  () => import("./RealInteractiveMap").then((mod) => mod.RealInteractiveMap),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[540px] sm:h-[600px] bg-[#071a28] flex flex-col items-center justify-center text-white p-6">
        <div className="w-12 h-12 rounded-full border-3 border-[#52BDE9] border-t-transparent animate-spin mb-4" />
        <p className="text-sm font-bold text-[#52BDE9] font-mono">Loading Real Geographic Map &amp; Landmarks...</p>
        <p className="text-xs text-[#8ca4b6] mt-1">Connecting to Satellite &amp; GIS Tile Networks</p>
      </div>
    ),
  }
);

interface MarketMapProps {
  locations: Location[];
  selectedLocationSlug?: string;
  onSelectLocation?: (slug: string) => void;
}

export function MarketMap({ locations, selectedLocationSlug, onSelectLocation }: MarketMapProps) {
  const [activeSlug, setActiveSlug] = useState<string>(selectedLocationSlug || locations[0]?.slug || "jaipur");
  const [viewMode, setViewMode] = useState<"map" | "list">("map");

  return (
    <section
      className="py-16 md:py-24 bg-[#F5F1E9] border-b border-[rgba(7,26,40,0.08)]"
      aria-labelledby="market-navigator-heading"
    >
      <div className="max-w-[1320px] w-[calc(100%-48px)] mx-auto">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[rgba(7,132,200,0.08)] border border-[rgba(7,132,200,0.2)] text-[#0784C8] text-xs font-bold uppercase tracking-wider mb-3">
              <Navigation className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Real Geographic GIS Navigator</span>
            </div>
            <h2
              id="market-navigator-heading"
              className="font-heading text-2xl sm:text-3xl md:text-4xl text-[#031C2B] font-normal tracking-tight"
            >
              Interactive Real Map &amp; Prime Landmarks
            </h2>
            <p className="text-sm md:text-base text-[#4a6171] mt-2 max-w-[620px]">
              Explore verified plotted projects, international airports, tertiary hospitals, railway/metro junctions, and 6-lane expressway corridors across Rajasthan &amp; Maharashtra.
            </p>
          </div>

          {/* Accessible Toggle (Interactive Map vs List View) */}
          <div
            className="flex items-center bg-white p-1 rounded-full border border-[rgba(7,26,40,0.12)] shadow-xs self-start"
            role="radiogroup"
            aria-label="View representation options"
          >
            <button
              type="button"
              role="radio"
              aria-checked={viewMode === "map"}
              onClick={() => setViewMode("map")}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold transition-all ${
                viewMode === "map"
                  ? "bg-[#031C2B] text-white shadow-xs"
                  : "text-[#4a6171] hover:text-[#031C2B]"
              }`}
            >
              <Navigation className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Real Satellite &amp; Street Map</span>
            </button>
            <button
              type="button"
              role="radio"
              aria-checked={viewMode === "list"}
              onClick={() => setViewMode("list")}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold transition-all ${
                viewMode === "list"
                  ? "bg-[#031C2B] text-white shadow-xs"
                  : "text-[#4a6171] hover:text-[#031C2B]"
              }`}
            >
              <Layers className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Directory Index</span>
            </button>
          </div>
        </div>

        {/* Navigator Main Frame */}
        <div className="bg-white rounded-2xl border border-[rgba(7,26,40,0.12)] shadow-[0_18px_45px_rgba(7,26,40,0.06)] overflow-hidden">
          {viewMode === "map" ? (
            <RealInteractiveMap
              locations={locations}
              initialLocationSlug={activeSlug}
              onSelectLocation={(slug) => {
                setActiveSlug(slug);
                if (onSelectLocation) onSelectLocation(slug);
              }}
            />
          ) : (
            /* Accessible List View Fallback */
            <div className="p-6 sm:p-8 divide-y divide-[rgba(7,26,40,0.08)]">
              {locations.map((loc) => {
                const stats = getLocationSummaryStats(loc);
                return (
                  <div key={loc.id} className="py-6 first:pt-0 last:pb-0 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                    <div className="md:col-span-4">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold uppercase tracking-wider text-[#0784C8]">
                          {loc.state}
                        </span>
                      </div>
                      <h4 className="font-heading text-xl text-[#031C2B]">{loc.name}</h4>
                      <p className="text-xs text-[#667d8f]">{loc.region}</p>
                    </div>

                    <div className="md:col-span-5">
                      <p className="text-xs text-[#4a6171] leading-relaxed mb-2">
                        {loc.shortDescription}
                      </p>
                      <div className="flex items-center gap-3 text-xs text-[#0784C8]">
                        <span className="flex items-center gap-1 font-semibold">
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#24D17F]" />
                          {stats.propertyCount} Active Listings
                        </span>
                        <span>•</span>
                        <span>{loc.microMarkets.length} Micro-Markets</span>
                      </div>
                    </div>

                    <div className="md:col-span-3 flex justify-start md:justify-end">
                      <Link
                        href={`/locations/${loc.slug}`}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-[#031C2B] text-[#031C2B] hover:bg-[#031C2B] hover:text-white text-xs font-semibold transition-colors"
                      >
                        <span>Explore Market</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

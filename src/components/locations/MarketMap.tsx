"use client";

import { useState } from "react";
import Link from "next/link";
import { Navigation, ArrowRight, Layers, CheckCircle2 } from "lucide-react";
import { Location } from "@/types/location";
import { getLocationSummaryStats } from "@/data/locations";

interface MarketMapProps {
  locations: Location[];
  selectedLocationSlug?: string;
  onSelectLocation?: (slug: string) => void;
}

export function MarketMap({ locations, selectedLocationSlug, onSelectLocation }: MarketMapProps) {
  const [activeSlug, setActiveSlug] = useState<string>(selectedLocationSlug || locations[0]?.slug || "jaipur");
  const [viewMode, setViewMode] = useState<"map" | "list">("map");

  const activeLocation = locations.find((l) => l.slug === activeSlug) || locations[0];
  const activeStats = activeLocation ? getLocationSummaryStats(activeLocation) : null;

  // Normalized map positions on an abstract India Regional Growth Corridors projection (width 700, height 500)
  // Rajasthan node (Jaipur, Ajmer, Bhiwadi) in top-left/center-north, Maharashtra node (Navi Mumbai, Panvel) in center-south
  const mapCoordinates: Record<string, { x: number; y: number; labelPos: "top" | "bottom" | "right" | "left" }> = {
    bhiwadi: { x: 380, y: 110, labelPos: "right" },
    jaipur: { x: 340, y: 160, labelPos: "left" },
    ajmer: { x: 280, y: 195, labelPos: "left" },
    "navi-mumbai": { x: 310, y: 360, labelPos: "left" },
    panvel: { x: 345, y: 390, labelPos: "right" },
  };

  const handleSelect = (slug: string) => {
    setActiveSlug(slug);
    if (onSelectLocation) {
      onSelectLocation(slug);
    }
  };

  return (
    <section
      className="py-16 md:py-24 bg-[#F5F1E9] border-b border-[rgba(7,26,40,0.08)]"
      aria-labelledby="market-navigator-heading"
    >
      <div className="max-w-[1320px] w-[calc(100%-48px)] mx-auto">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[rgba(7,132,200,0.08)] border border-[rgba(7,132,200,0.2)] text-[#0784C8] text-xs font-bold uppercase tracking-wider mb-3">
              <Navigation className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Regional Operating Corridors</span>
            </div>
            <h2
              id="market-navigator-heading"
              className="font-heading text-2xl sm:text-3xl md:text-4xl text-[#031C2B] font-normal tracking-tight"
            >
              Interactive Market Navigator
            </h2>
            <p className="text-sm md:text-base text-[#4a6171] mt-2 max-w-[580px]">
              Explore verified locations across Rajasthan and Maharashtra. Select a node to view key statutory context
              and active parcels.
            </p>
          </div>

          {/* Accessible Toggle (Map View vs List View) */}
          <div
            className="flex items-center bg-white p-1 rounded-full border border-[rgba(7,26,40,0.12)] shadow-sm self-start"
            role="radiogroup"
            aria-label="View representation options"
          >
            <button
              type="button"
              role="radio"
              aria-checked={viewMode === "map"}
              onClick={() => setViewMode("map")}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold transition-all ${
                viewMode === "map"
                  ? "bg-[#031C2B] text-white shadow-sm"
                  : "text-[#4a6171] hover:text-[#031C2B]"
              }`}
            >
              <Navigation className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Cartographic Map</span>
            </button>
            <button
              type="button"
              role="radio"
              aria-checked={viewMode === "list"}
              onClick={() => setViewMode("list")}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold transition-all ${
                viewMode === "list"
                  ? "bg-[#031C2B] text-white shadow-sm"
                  : "text-[#4a6171] hover:text-[#031C2B]"
              }`}
            >
              <Layers className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Accessible Index List</span>
            </button>
          </div>
        </div>

        {/* Navigator Main Frame */}
        <div className="bg-white rounded-2xl border border-[rgba(7,26,40,0.12)] shadow-[0_18px_45px_rgba(7,26,40,0.06)] overflow-hidden">
          {viewMode === "map" ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[520px]">
              {/* Left Canvas: SVG Regional Topology Navigator */}
              <div className="lg:col-span-7 relative bg-[#072435] p-6 sm:p-8 flex flex-col justify-between overflow-hidden">
                {/* Cartographic grid decoration */}
                <div
                  className="absolute inset-0 opacity-[0.07] pointer-events-none bg-[radial-gradient(#52BDE9_1px,transparent_1px)] [background-size:24px_24px]"
                  aria-hidden="true"
                />

                {/* SVG Visual Canvas */}
                <div className="relative w-full h-[360px] sm:h-[420px] flex items-center justify-center">
                  <svg
                    viewBox="0 0 700 500"
                    className="w-full h-full max-h-[460px]"
                    aria-label="Interactive map of Ratiwal operating markets in Rajasthan and Maharashtra"
                  >
                    {/* Background Regional Corridor Highway Connections */}
                    <g stroke="rgba(82,189,233,0.25)" strokeWidth="1.5" strokeDasharray="4 4" fill="none">
                      {/* Delhi-Jaipur-Ajmer Axis */}
                      <path d="M 420 60 L 380 110 L 340 160 L 280 195" />
                      {/* Jaipur to Mumbai Corridor Spur */}
                      <path d="M 340 160 Q 300 280 310 360" />
                      {/* Navi Mumbai to Panvel Node */}
                      <path d="M 310 360 L 345 390" />
                    </g>

                    {/* Regional Cluster Zones */}
                    {/* Rajasthan Growth Zone */}
                    <path
                      d="M 230 140 C 270 90, 420 80, 440 140 C 450 190, 360 240, 270 230 C 230 220, 210 180, 230 140 Z"
                      fill="rgba(7,132,200,0.08)"
                      stroke="rgba(82,189,233,0.3)"
                      strokeWidth="1"
                      strokeDasharray="2 2"
                    />
                    <text x="240" y="115" fill="#52BDE9" fontSize="11" fontWeight="700" letterSpacing="0.08em">
                      RAJASTHAN CORRIDOR
                    </text>

                    {/* Maharashtra MMR Zone */}
                    <path
                      d="M 260 330 C 310 310, 390 340, 380 420 C 370 450, 300 450, 270 420 C 250 390, 240 350, 260 330 Z"
                      fill="rgba(7,132,200,0.08)"
                      stroke="rgba(82,189,233,0.3)"
                      strokeWidth="1"
                      strokeDasharray="2 2"
                    />
                    <text x="250" y="320" fill="#52BDE9" fontSize="11" fontWeight="700" letterSpacing="0.08em">
                      MAHARASHTRA (MMR) CORRIDOR
                    </text>

                    {/* Location Node Pins */}
                    {locations.map((loc) => {
                      const pos = mapCoordinates[loc.slug] || { x: 350, y: 250, labelPos: "right" };
                      const isCurrent = loc.slug === activeSlug;

                      return (
                        <g
                          key={loc.id}
                          className="cursor-pointer transition-all duration-300 focus:outline-none"
                          tabIndex={0}
                          role="button"
                          aria-label={`Select ${loc.name}, ${loc.state}`}
                          aria-pressed={isCurrent}
                          onClick={() => handleSelect(loc.slug)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault();
                              handleSelect(loc.slug);
                            }
                          }}
                        >
                          {/* Active Radar Pulse */}
                          {isCurrent && (
                            <circle
                              cx={pos.x}
                              cy={pos.y}
                              r="22"
                              fill="none"
                              stroke="#52BDE9"
                              strokeWidth="1.5"
                              className="animate-ping opacity-60"
                            />
                          )}

                          {/* Outer Circle */}
                          <circle
                            cx={pos.x}
                            cy={pos.y}
                            r={isCurrent ? "12" : "9"}
                            fill={isCurrent ? "#52BDE9" : "#0784C8"}
                            stroke="#FFFFFF"
                            strokeWidth="2.5"
                            className="transition-all duration-300"
                          />

                          {/* Center Dot */}
                          <circle
                            cx={pos.x}
                            cy={pos.y}
                            r="4"
                            fill="#031C2B"
                          />

                          {/* Text Label */}
                          <text
                            x={pos.labelPos === "left" ? pos.x - 18 : pos.x + 18}
                            y={pos.y + 4}
                            textAnchor={pos.labelPos === "left" ? "end" : "start"}
                            fill={isCurrent ? "#FFFFFF" : "#c5d8e4"}
                            fontSize={isCurrent ? "13" : "11.5"}
                            fontWeight={isCurrent ? "700" : "500"}
                            fontFamily="var(--font-heading)"
                          >
                            {loc.name}
                          </text>
                        </g>
                      );
                    })}
                  </svg>
                </div>

                {/* Map Footer Note */}
                <div className="flex items-center justify-between text-xs text-[#8ca4b6] pt-3 border-t border-[rgba(255,255,255,0.1)]">
                  <span>Cartographic Regional Navigator (Rajasthan &amp; Maharashtra)</span>
                  <span className="text-[#52BDE9]">Click or tab nodes to view market data</span>
                </div>
              </div>

              {/* Right Panel: Selected Location Detail Card */}
              <div className="lg:col-span-5 p-6 sm:p-8 lg:p-10 flex flex-col justify-between bg-white">
                <div>
                  <div className="flex items-center justify-between gap-4 mb-4">
                    <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-[rgba(7,132,200,0.08)] text-[#0784C8]">
                      {activeLocation.state}
                    </span>
                    <span className="text-xs text-[#667d8f] font-mono">
                      {activeLocation.coordinates.latitude.toFixed(4)}° N, {activeLocation.coordinates.longitude.toFixed(4)}° E
                    </span>
                  </div>

                  <h3 className="font-heading text-2xl sm:text-3xl text-[#031C2B] font-normal mb-2">
                    {activeLocation.name}
                  </h3>
                  <p className="text-xs text-[#0784C8] font-semibold tracking-wide uppercase mb-4">
                    {activeLocation.region}
                  </p>

                  <p className="text-sm text-[#4a6171] leading-relaxed mb-6">
                    {activeLocation.shortDescription}
                  </p>

                  {/* Quick Stat Pill Highlights */}
                  <div className="grid grid-cols-2 gap-3 mb-6 p-4 rounded-xl bg-[#F5F1E9] border border-[rgba(7,26,40,0.06)]">
                    <div>
                      <span className="text-[11px] text-[#667d8f] block uppercase font-semibold">Active Listings</span>
                      <span className="text-lg font-bold text-[#031C2B] font-heading">
                        {activeStats?.propertyCount} Verified {activeStats?.propertyCount === 1 ? "Parcel" : "Parcels"}
                      </span>
                    </div>
                    <div>
                      <span className="text-[11px] text-[#667d8f] block uppercase font-semibold">Micro-Markets</span>
                      <span className="text-lg font-bold text-[#031C2B] font-heading">
                        {activeLocation.microMarkets.length} Strategic Belts
                      </span>
                    </div>
                  </div>

                  {/* Property Types Included */}
                  <div className="mb-6">
                    <span className="text-xs font-semibold text-[#031C2B] block mb-2">Permitted Property Categories:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {activeLocation.propertyTypes.map((type, i) => (
                        <span
                          key={i}
                          className="text-xs px-2.5 py-1 rounded-md bg-[#edf5f9] text-[#076fa7] border border-[rgba(7,132,200,0.15)] font-medium"
                        >
                          {type}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Primary CTA to Detail Page */}
                <div className="pt-6 border-t border-[rgba(7,26,40,0.08)] flex items-center justify-between gap-4">
                  <Link
                    href={`/locations/${activeLocation.slug}`}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#031C2B] hover:bg-[#082B3B] text-white text-xs font-semibold tracking-wide uppercase transition-all duration-200"
                  >
                    <span>View {activeLocation.name} Market Guide</span>
                    <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                  </Link>

                  <Link
                    href={`/locations/${activeLocation.slug}#properties`}
                    className="text-xs font-bold text-[#0784C8] hover:underline"
                  >
                    View Properties
                  </Link>
                </div>
              </div>
            </div>
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

"use client";

import { useState } from "react";
import Link from "next/link";
import { SlidersHorizontal, ExternalLink } from "lucide-react";
import { Location } from "@/types/location";
import { getLocationSummaryStats } from "@/data/locations";

interface LocationComparisonProps {
  locations: Location[];
}

export function LocationComparison({ locations }: LocationComparisonProps) {
  // Default compare Jaipur, Navi Mumbai, and Ajmer
  const [selectedSlugs, setSelectedSlugs] = useState<string[]>([
    locations[0]?.slug || "jaipur",
    locations[1]?.slug || "navi-mumbai",
    locations[2]?.slug || "ajmer",
  ]);

  const toggleLocation = (slug: string) => {
    if (selectedSlugs.includes(slug)) {
      if (selectedSlugs.length > 1) {
        setSelectedSlugs(selectedSlugs.filter((s) => s !== slug));
      }
    } else {
      if (selectedSlugs.length < 3) {
        setSelectedSlugs([...selectedSlugs, slug]);
      } else {
        setSelectedSlugs([selectedSlugs[1], selectedSlugs[2], slug]);
      }
    }
  };

  const selectedLocations = selectedSlugs
    .map((slug) => locations.find((l) => l.slug === slug))
    .filter(Boolean) as Location[];

  return (
    <section className="py-16 md:py-24 bg-white border-b border-[rgba(7,26,40,0.08)]" aria-labelledby="compare-heading">
      <div className="max-w-[1320px] w-[calc(100%-48px)] mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div className="max-w-[700px]">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[rgba(7,132,200,0.08)] border border-[rgba(7,132,200,0.2)] text-[#0784C8] text-xs font-bold uppercase tracking-wider mb-3">
              <SlidersHorizontal className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Comparative Due Diligence</span>
            </div>
            <h2
              id="compare-heading"
              className="font-heading text-3xl sm:text-4xl text-[#031C2B] font-normal tracking-tight"
            >
              Side-by-Side Market Comparison
            </h2>
            <p className="text-sm sm:text-base text-[#4a6171] mt-2">
              Evaluate operating corridors across statutory planning authorities, active property categories, and verified documentation standards.
            </p>
          </div>

          {/* Quick Selector Pills */}
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-xs text-[#667d8f] font-semibold mr-1">Select up to 3:</span>
            {locations.map((loc) => {
              const isSelected = selectedSlugs.includes(loc.slug);
              return (
                <button
                  key={loc.id}
                  type="button"
                  onClick={() => toggleLocation(loc.slug)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                    isSelected
                      ? "bg-[#031C2B] text-white shadow-sm"
                      : "bg-[#F5F1E9] text-[#4a6171] hover:bg-[#eae3d5] hover:text-[#031C2B]"
                  }`}
                  aria-pressed={isSelected}
                >
                  {loc.name} {isSelected && "✓"}
                </button>
              );
            })}
          </div>
        </div>

        {/* Desktop Comparison Table (hidden on mobile, stacked on small screens) */}
        <div className="hidden md:block rounded-2xl border border-[rgba(7,26,40,0.12)] overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#031C2B] text-white border-b border-[rgba(255,255,255,0.1)]">
                  <th className="p-5 text-xs font-bold uppercase tracking-wider text-[#52BDE9] w-1/4">
                    Comparison Metric
                  </th>
                  {selectedLocations.map((loc) => (
                    <th key={loc.id} className="p-5 text-base font-heading font-normal">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-lg font-bold text-white block">{loc.name}</span>
                          <span className="text-xs text-[#a0b6c6] font-body">{loc.state}</span>
                        </div>
                        <Link
                          href={`/locations/${loc.slug}`}
                          className="text-xs text-[#52BDE9] hover:underline inline-flex items-center gap-1 font-body font-semibold"
                        >
                          Guide <ExternalLink className="w-3 h-3" />
                        </Link>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[rgba(7,26,40,0.08)] text-sm text-[#2c3e50] bg-white">
                {/* Statutory Regulatory Authority */}
                <tr className="hover:bg-[#faf8f5]">
                  <td className="p-5 font-semibold text-[#031C2B] bg-[#F5F1E9] bg-opacity-40">
                    Statutory Authority
                  </td>
                  {selectedLocations.map((loc) => (
                    <td key={loc.id} className="p-5">
                      <span className="font-semibold text-[#0784C8]">
                        {loc.microMarkets[0]?.regulatoryAuthority || "Statutory Planning Authority"}
                      </span>
                    </td>
                  ))}
                </tr>

                {/* Active Verified Listings */}
                <tr className="hover:bg-[#faf8f5]">
                  <td className="p-5 font-semibold text-[#031C2B] bg-[#F5F1E9] bg-opacity-40">
                    Verified Listings
                  </td>
                  {selectedLocations.map((loc) => {
                    const stats = getLocationSummaryStats(loc);
                    return (
                      <td key={loc.id} className="p-5">
                        <span className="font-bold text-[#031C2B]">{stats.propertyCount} Active Parcels</span>
                      </td>
                    );
                  })}
                </tr>

                {/* Permitted Property Types */}
                <tr className="hover:bg-[#faf8f5]">
                  <td className="p-5 font-semibold text-[#031C2B] bg-[#F5F1E9] bg-opacity-40">
                    Available Categories
                  </td>
                  {selectedLocations.map((loc) => (
                    <td key={loc.id} className="p-5">
                      <div className="flex flex-wrap gap-1.5">
                        {loc.propertyTypes.map((pt, i) => (
                          <span key={i} className="text-xs px-2.5 py-1 rounded bg-[#edf5f9] text-[#076fa7] font-medium">
                            {pt}
                          </span>
                        ))}
                      </div>
                    </td>
                  ))}
                </tr>

                {/* Dominant Plot Sizes */}
                <tr className="hover:bg-[#faf8f5]">
                  <td className="p-5 font-semibold text-[#031C2B] bg-[#F5F1E9] bg-opacity-40">
                    Plot Sizes Available
                  </td>
                  {selectedLocations.map((loc) => (
                    <td key={loc.id} className="p-5">
                      {loc.marketData?.dominantPlotSizes.join(", ") || "Details on request"}
                    </td>
                  ))}
                </tr>

                {/* Anchor Infrastructure */}
                <tr className="hover:bg-[#faf8f5]">
                  <td className="p-5 font-semibold text-[#031C2B] bg-[#F5F1E9] bg-opacity-40">
                    Key Infrastructure Anchor
                  </td>
                  {selectedLocations.map((loc) => (
                    <td key={loc.id} className="p-5 text-xs leading-relaxed">
                      <span className="font-semibold text-[#031C2B] block mb-1">
                        {loc.infrastructure[0]?.name}
                      </span>
                      <span className="text-[#667d8f]">{loc.infrastructure[0]?.description}</span>
                    </td>
                  ))}
                </tr>

                {/* Verified Documentation Protocol */}
                <tr className="hover:bg-[#faf8f5]">
                  <td className="p-5 font-semibold text-[#031C2B] bg-[#F5F1E9] bg-opacity-40">
                    Title &amp; Revenue Standard
                  </td>
                  {selectedLocations.map((loc) => (
                    <td key={loc.id} className="p-5 text-xs text-[#4a6171]">
                      {loc.marketData?.documentationStandard || "Standard Sub-Registrar Clear Title"}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Mobile Stacked Panels (320px - 767px) */}
        <div className="block md:hidden space-y-6">
          {selectedLocations.map((loc) => {
            const stats = getLocationSummaryStats(loc);
            return (
              <div
                key={loc.id}
                className="p-5 rounded-2xl bg-white border border-[rgba(7,26,40,0.12)] shadow-sm space-y-4"
              >
                <div className="flex items-center justify-between pb-3 border-b border-[rgba(7,26,40,0.08)]">
                  <div>
                    <h3 className="font-heading text-xl text-[#031C2B] font-bold">{loc.name}</h3>
                    <span className="text-xs text-[#0784C8] font-semibold">{loc.state}</span>
                  </div>
                  <Link
                    href={`/locations/${loc.slug}`}
                    className="text-xs px-3 py-1 rounded-full bg-[#031C2B] text-white font-semibold"
                  >
                    View Guide
                  </Link>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-[#667d8f] block">Statutory Body</span>
                    <strong className="text-[#031C2B]">
                      {loc.microMarkets[0]?.regulatoryAuthority || "Statutory Authority"}
                    </strong>
                  </div>
                  <div>
                    <span className="text-[#667d8f] block">Verified Listings</span>
                    <strong className="text-[#031C2B]">{stats.propertyCount} Parcels</strong>
                  </div>
                </div>

                <div className="text-xs">
                  <span className="text-[#667d8f] block mb-1.5">Property Categories</span>
                  <div className="flex flex-wrap gap-1">
                    {loc.propertyTypes.map((pt, i) => (
                      <span key={i} className="px-2 py-0.5 rounded bg-[#edf5f9] text-[#076fa7] font-medium">
                        {pt}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="text-xs">
                  <span className="text-[#667d8f] block mb-1">Key Infrastructure Anchor</span>
                  <p className="text-[#4a6171] leading-relaxed">{loc.infrastructure[0]?.name}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

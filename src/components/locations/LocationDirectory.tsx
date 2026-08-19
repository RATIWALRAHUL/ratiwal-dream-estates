"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Compass, RotateCcw } from "lucide-react";
import { Location } from "@/types/location";
import { LocationCard } from "./LocationCard";
import { LocationFilters } from "./LocationFilters";

interface LocationDirectoryProps {
  locations: Location[];
}

export function LocationDirectory({ locations }: LocationDirectoryProps) {
  const searchParams = useSearchParams();
  const activeState = searchParams.get("state") || "all";
  const activeType = searchParams.get("type") || "all";

  // Derive unique states and counts
  const stateOptions = useMemo(() => {
    const stateCounts: Record<string, number> = {};
    locations.forEach((loc) => {
      const stateKey = loc.state.includes("Rajasthan") ? "Rajasthan" : "Maharashtra";
      stateCounts[stateKey] = (stateCounts[stateKey] || 0) + 1;
    });

    return [
      { label: "Rajasthan Corridors", value: "Rajasthan", count: stateCounts["Rajasthan"] || 0 },
      { label: "Maharashtra (MMR)", value: "Maharashtra", count: stateCounts["Maharashtra"] || 0 },
    ];
  }, [locations]);

  // Derive property types
  const typeOptions = useMemo(() => {
    return [
      { label: "Residential Plots", value: "Residential" },
      { label: "Commercial & Logistics", value: "Commercial" },
    ];
  }, []);

  // Filter locations based on state and property types
  const filteredLocations = useMemo(() => {
    return locations.filter((loc) => {
      const matchState =
        activeState === "all" ||
        loc.state.toLowerCase().includes(activeState.toLowerCase());

      const matchType =
        activeType === "all" ||
        loc.propertyTypes.some((pt) => pt.toLowerCase().includes(activeType.toLowerCase()));

      return matchState && matchType;
    });
  }, [locations, activeState, activeType]);

  return (
    <section id="location-directory" className="py-16 md:py-24 bg-white" aria-labelledby="directory-heading">
      <div className="max-w-[1320px] w-[calc(100%-48px)] mx-auto">
        {/* Section Header */}
        <div className="max-w-[720px] mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[rgba(7,132,200,0.08)] border border-[rgba(7,132,200,0.2)] text-[#0784C8] text-xs font-bold uppercase tracking-wider mb-3">
            <Compass className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Explore By Market</span>
          </div>
          <h2
            id="directory-heading"
            className="font-heading text-3xl sm:text-4xl lg:text-[2.75rem] text-[#031C2B] font-normal leading-tight tracking-tight mb-3"
          >
            Find the market that fits your goals.
          </h2>
          <p className="text-sm sm:text-base text-[#4a6171] leading-relaxed">
            Every location features verified statutory zoning, masterplan road layouts, clear title documentation,
            and dedicated regional advisory support.
          </p>
        </div>

        {/* Filter Controls */}
        <LocationFilters
          activeState={activeState}
          activeType={activeType}
          stateOptions={stateOptions}
          typeOptions={typeOptions}
          totalCount={locations.length}
        />

        {/* Location Cards Grid */}
        {filteredLocations.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {filteredLocations.map((location) => (
              <LocationCard key={location.id} location={location} />
            ))}
          </div>
        ) : (
          /* Honest Polished Empty State */
          <div className="text-center py-16 px-6 rounded-2xl bg-[#F5F1E9] border border-[rgba(7,26,40,0.08)] max-w-[620px] mx-auto">
            <Compass className="w-10 h-10 text-[#0784C8] mx-auto mb-4" aria-hidden="true" />
            <h3 className="font-heading text-2xl text-[#031C2B] font-normal mb-2">
              No matching operating markets found
            </h3>
            <p className="text-sm text-[#4a6171] mb-6">
              We currently operate in verified corridors across Rajasthan and Maharashtra. Try adjusting your region or
              property category filters.
            </p>
            <Link
              href="/locations#location-directory"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#031C2B] text-white text-xs font-semibold uppercase tracking-wider hover:bg-[#082B3B] transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Show All Operating Markets</span>
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}

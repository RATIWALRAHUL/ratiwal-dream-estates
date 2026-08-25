import Link from "next/link";
import { MapPin, ArrowRight, CheckCircle2, ArrowUpRight } from "lucide-react";
import type { DashboardOverviewData } from "@/lib/services/dashboard.service";

interface LocationCoverageGridProps {
  locations: DashboardOverviewData["locationCoverage"];
}

export function LocationCoverageGrid({ locations }: LocationCoverageGridProps) {
  return (
    <div className="p-6 sm:p-7 rounded-3xl bg-gradient-to-br from-white via-[#fffdf8] to-[#fbf9f4] border border-[rgba(7,26,40,0.08)] shadow-[0_4px_24px_rgba(7,26,40,0.03)] space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#eaf5fa] text-[#087fc3] border border-[#087fc3]/20 flex items-center justify-center shadow-xs">
            <MapPin className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-normal font-serif text-[#071a28] tracking-tight">
              Growth Corridor Coverage & Regional Density
            </h2>
            <p className="text-xs text-[#647581] mt-0.5 font-sans">
              Micro-market inventory density and statutory diligence status per regional hub
            </p>
          </div>
        </div>

        <Link
          href="/dashboard/locations"
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white border border-[rgba(7,26,40,0.1)] text-xs font-bold text-[#071a28] hover:bg-[#071a28] hover:text-white transition-all shadow-2xs"
        >
          <span>View All Corridors</span>
          <ArrowRight className="w-3.5 h-3.5 text-[#087fc3]" />
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {locations.map((loc) => {
          // Circular progress donut calculation (circumference 2 * pi * r = 2 * 3.14159 * 18 ≈ 113.1)
          const totalEstimate = Math.max(loc.availablePlotCount, 8);
          const ratio = Math.min(1, loc.availablePlotCount / totalEstimate);
          const strokeDashoffset = 113.1 * (1 - ratio);

          return (
            <Link
              key={loc.id}
              href={`/dashboard/properties?locationId=${loc.id}`}
              className="group p-5 rounded-2xl bg-white border border-[rgba(7,26,40,0.06)] hover:border-[#087fc3]/40 hover:shadow-[0_8px_24px_rgba(7,26,40,0.06)] hover:-translate-y-0.5 transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                {/* State & Live Status */}
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase font-bold text-[#087fc3] tracking-widest px-2 py-0.5 rounded-md bg-[#eaf5fa]">
                    {loc.state}
                  </span>

                  {loc.publicationStatus === "PUBLISHED" ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-mono text-emerald-700 font-semibold px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_6px_#10b981]" />
                      Live
                    </span>
                  ) : (
                    <span className="text-[10px] font-mono text-[#647581]">Draft</span>
                  )}
                </div>

                {/* Corridor Name & City */}
                <div className="mt-3">
                  <h3 className="text-sm font-bold text-[#071a28] group-hover:text-[#087fc3] transition-colors flex items-center justify-between">
                    <span>{loc.name}</span>
                    <ArrowUpRight className="w-3.5 h-3.5 text-[#647581] opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                  </h3>
                  <p className="text-xs text-[#647581] mt-0.5">
                    {loc.city}
                  </p>
                </div>
              </div>

              {/* Mini Donut Chart + Stats */}
              <div className="mt-5 pt-3.5 border-t border-[rgba(7,26,40,0.05)] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {/* SVG Mini Donut */}
                  <div className="relative w-10 h-10 shrink-0">
                    <svg viewBox="0 0 40 40" className="w-full h-full -rotate-90">
                      <circle
                        cx="20"
                        cy="20"
                        r="16"
                        fill="transparent"
                        stroke="#e2e8f0"
                        strokeWidth="4"
                      />
                      <circle
                        cx="20"
                        cy="20"
                        r="16"
                        fill="transparent"
                        stroke="#087fc3"
                        strokeWidth="4"
                        strokeDasharray="100.5"
                        strokeDashoffset={100.5 * (1 - (loc.availablePlotCount > 0 ? 0.75 : 0))}
                        strokeLinecap="round"
                        className="transition-all duration-700"
                      />
                    </svg>
                    <span className="absolute inset-0 flex items-center justify-center text-[9px] font-mono font-bold text-[#071a28]">
                      {loc.propertyCount}
                    </span>
                  </div>

                  <div>
                    <p className="text-xs font-bold text-[#071a28]">
                      {loc.propertyCount} <span className="font-normal text-[#647581] text-[11px]">Townships</span>
                    </p>
                    <p className="text-[10px] font-mono text-[#087fc3] font-semibold">
                      {loc.availablePlotCount} Available Plots
                    </p>
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

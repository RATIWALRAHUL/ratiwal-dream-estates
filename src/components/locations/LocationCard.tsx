import Link from "next/link";
import Image from "next/image";
import { ArrowRight, MapPin, Building2, CheckCircle2, Layers } from "lucide-react";
import { Location } from "@/types/location";
import { getLocationSummaryStats } from "@/data/locations";

interface LocationCardProps {
  location: Location;
}

export function LocationCard({ location }: LocationCardProps) {
  const stats = getLocationSummaryStats(location);

  return (
    <article
      className="group relative flex flex-col bg-white rounded-2xl border border-[rgba(7,26,40,0.1)] overflow-hidden shadow-[0_4px_20px_rgba(7,26,40,0.04)] hover:shadow-[0_18px_40px_rgba(7,26,40,0.12)] hover:border-[rgba(7,132,200,0.35)] transition-all duration-300"
      aria-labelledby={`loc-card-title-${location.slug}`}
    >
      {/* Visual Header with Real Image */}
      <div className="relative aspect-[16/10] w-full bg-[#072435] overflow-hidden">
        <Image
          src={location.heroImage}
          alt={`Planned property development in ${location.name}, ${location.state}`}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#031C2B] via-transparent to-transparent opacity-75" />

        {/* State Badge & Verified Pill */}
        <div className="absolute top-3.5 left-3.5 flex flex-wrap gap-2 z-10">
          <span className="px-3 py-1 rounded-full bg-[rgba(3,28,43,0.85)] backdrop-blur-md border border-[rgba(255,255,255,0.2)] text-white text-[11px] font-bold uppercase tracking-wider">
            {location.state}
          </span>
          {stats.hasActiveProperties && (
            <span className="px-2.5 py-1 rounded-full bg-[rgba(36,209,127,0.92)] text-[#031C2B] text-[10.5px] font-bold uppercase tracking-wider flex items-center gap-1 shadow-sm">
              <CheckCircle2 className="w-3 h-3" />
              <span>Verified Listings</span>
            </span>
          )}
        </div>

        {/* Listing Count Overlay */}
        <div className="absolute bottom-3 left-3.5 right-3.5 flex items-center justify-between text-white z-10">
          <span className="text-xs font-medium text-[#d2ecf8] flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5 text-[#52BDE9]" />
            {stats.propertyCount} Active {stats.propertyCount === 1 ? "Parcel" : "Parcels"}
          </span>
          <span className="text-[11px] text-[#a0b6c6] font-mono">
            {location.microMarkets.length} Micro-Markets
          </span>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-6 flex-1 flex flex-col justify-between">
        <div>
          {/* Market Headline */}
          <div className="flex items-start justify-between gap-2 mb-1.5">
            <h3
              id={`loc-card-title-${location.slug}`}
              className="font-heading text-xl sm:text-2xl text-[#031C2B] font-normal group-hover:text-[#0784C8] transition-colors"
            >
              {location.name}
            </h3>
            <MapPin className="w-4 h-4 text-[#0784C8] flex-shrink-0 mt-1" aria-hidden="true" />
          </div>

          <p className="text-xs font-semibold text-[#0784C8] uppercase tracking-wider mb-3">
            {location.region}
          </p>

          <p className="text-xs sm:text-sm text-[#4a6171] leading-relaxed mb-5 line-clamp-3">
            {location.shortDescription}
          </p>

          {/* Micro-markets Snippet */}
          <div className="mb-4 pt-3 border-t border-[rgba(7,26,40,0.06)]">
            <span className="text-[11px] font-semibold text-[#031C2B] uppercase tracking-wider block mb-2 flex items-center gap-1.5">
              <Layers className="w-3 h-3 text-[#0784C8]" />
              Strategic Micro-Markets:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {location.microMarkets.slice(0, 2).map((mm) => (
                <span
                  key={mm.id}
                  className="text-[11.5px] px-2 py-0.5 rounded bg-[#F5F1E9] text-[#2c3e50] border border-[rgba(7,26,40,0.06)] font-medium"
                >
                  {mm.name.split("Growth")[0].split("Commercial")[0].trim()}
                </span>
              ))}
              {location.microMarkets.length > 2 && (
                <span className="text-[11px] px-1.5 py-0.5 rounded text-[#0784C8] font-semibold">
                  +{location.microMarkets.length - 2} more
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Card Footer & Action */}
        <div className="pt-4 border-t border-[rgba(7,26,40,0.08)] flex items-center justify-between gap-3 mt-auto">
          <span className="text-[11px] text-[#7a93a5]">
            Verified: {location.marketData?.lastVerifiedAt || "Aug 2026"}
          </span>

          <Link
            href={`/locations/${location.slug}`}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0784C8] group-hover:text-[#031C2B] group-hover:translate-x-0.5 transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#0784C8] rounded-sm"
            aria-label={`Explore ${location.name} market guide and available properties`}
          >
            <span>Explore Market</span>
            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </article>
  );
}

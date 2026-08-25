"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, MapPin, Building2, CheckCircle2, Layers, Sparkles, Filter } from "lucide-react";
import { LocationActionMenu } from "./LocationActionMenu";
import type { DashboardLocationItem } from "@/lib/services/dashboard.service";

interface DashboardLocationCardProps {
  location: DashboardLocationItem;
}

export function DashboardLocationCard({ location }: DashboardLocationCardProps) {
  const statusBadges: Record<string, { bg: string; text: string; border: string; label: string }> = {
    PUBLISHED: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", label: "Published Live" },
    REVIEW: { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200", label: "Under Review" },
    DRAFT: { bg: "bg-slate-100", text: "text-slate-700", border: "border-slate-200", label: "Draft Corridor" },
    ARCHIVED: { bg: "bg-rose-50", text: "text-rose-700", border: "border-rose-200", label: "Archived" },
  };

  const status = statusBadges[location.publicationStatus] || statusBadges.DRAFT;
  const imageSrc = location.heroImageUrl || `/images/locations/${location.slug}.jpg`;

  return (
    <article
      className="group relative flex flex-col bg-white rounded-2xl border border-[rgba(7,26,40,0.1)] overflow-hidden shadow-[0_4px_20px_rgba(7,26,40,0.04)] hover:shadow-[0_18px_40px_rgba(7,26,40,0.12)] hover:border-[rgba(7,132,200,0.35)] transition-all duration-300"
      aria-labelledby={`dash-loc-card-${location.slug}`}
    >
      {/* Visual Header with Real Image */}
      <div className="relative aspect-[16/10] w-full bg-[#072435] overflow-hidden">
        <Image
          src={imageSrc}
          alt={`Planned property development in ${location.name}, ${location.state}`}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
        />
        {/* Navy Overlay Gradient matching public website */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#031C2B] via-transparent to-transparent opacity-80" />

        {/* State Badge & Verified / Featured Pills */}
        <div className="absolute top-3.5 left-3.5 flex flex-wrap gap-2 z-10">
          <span className="px-3 py-1 rounded-full bg-[rgba(3,28,43,0.85)] backdrop-blur-md border border-[rgba(255,255,255,0.2)] text-white text-[11px] font-bold uppercase tracking-wider">
            {location.state}
          </span>
          {location.publicationStatus === "PUBLISHED" && (
            <span className="px-2.5 py-1 rounded-full bg-[rgba(36,209,127,0.92)] text-[#031C2B] text-[10.5px] font-bold uppercase tracking-wider flex items-center gap-1 shadow-sm">
              <CheckCircle2 className="w-3 h-3" />
              <span>Verified Corridor</span>
            </span>
          )}
          {location.featured && (
            <span className="px-2 py-0.5 rounded-full bg-amber-400/90 text-amber-950 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              <span>Featured</span>
            </span>
          )}
        </div>

        {/* Top Right Publication Badge */}
        <div className="absolute top-3.5 right-3.5 z-10">
          <span className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold tracking-wider uppercase border shadow-sm ${status.bg} ${status.text} ${status.border}`}>
            {status.label}
          </span>
        </div>

        {/* Listing Count Overlay */}
        <div className="absolute bottom-3 left-3.5 right-3.5 flex items-center justify-between text-white z-10">
          <span className="text-xs font-medium text-[#d2ecf8] flex items-center gap-1.5 font-body">
            <Building2 className="w-3.5 h-3.5 text-[#52BDE9]" />
            {location.propertyCount} Active {location.propertyCount === 1 ? "Parcel" : "Parcels"}
          </span>
          <span className="text-[11px] text-[#a0b6c6] font-mono">
            {location.activePlotCount} Available Plots
          </span>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between">
        <div>
          {/* Market Headline */}
          <div className="flex items-start justify-between gap-2 mb-1.5">
            <h3
              id={`dash-loc-card-${location.slug}`}
              className="font-heading text-xl sm:text-2xl text-[#031C2B] font-normal group-hover:text-[#087fc3] transition-colors leading-tight"
            >
              {location.name}
            </h3>
            <MapPin className="w-4 h-4 text-[#087fc3] shrink-0 mt-1" aria-hidden="true" />
          </div>

          <p className="text-xs font-semibold text-[#087fc3] uppercase tracking-wider mb-2.5 font-body">
            {location.region || `${location.city}, ${location.state}`}
          </p>

          <p className="text-xs sm:text-sm text-[#4a6171] leading-relaxed mb-4 line-clamp-2 font-body">
            {location.shortDescription || location.tagline || `Prime growth corridor in ${location.city} with verified road masterplans and revenue documentation.`}
          </p>

          {/* Micro-Markets Snippet */}
          {location.microMarkets && location.microMarkets.length > 0 && (
            <div className="mb-4 pt-3 border-t border-[rgba(7,26,40,0.06)]">
              <span className="text-[11px] font-semibold text-[#031C2B] uppercase tracking-wider mb-2 flex items-center gap-1.5 font-body">
                <Layers className="w-3 h-3 text-[#087fc3]" />
                Micro-Markets ({location.microMarkets.length}):
              </span>
              <div className="flex flex-wrap gap-1.5">
                {location.microMarkets.slice(0, 3).map((mm, idx) => (
                  <span
                    key={mm.id || idx}
                    className="text-[11px] px-2 py-0.5 rounded bg-[#F5F1E9] text-[#2c3e50] border border-[rgba(7,26,40,0.06)] font-medium font-body"
                  >
                    {mm.name.split("Growth")[0].split("Commercial")[0].trim()}
                  </span>
                ))}
                {location.microMarkets.length > 3 && (
                  <span className="text-[11px] px-1.5 py-0.5 rounded text-[#087fc3] font-semibold font-mono">
                    +{location.microMarkets.length - 3} more
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="pt-3.5 border-t border-[rgba(7,26,40,0.06)] flex items-center justify-between gap-2">
          {/* Filter Properties in Dashboard */}
          <Link
            href={`/dashboard/properties?search=${encodeURIComponent(location.name)}`}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#087fc3] hover:text-[#0a6ba3] hover:underline font-body"
          >
            <Filter className="w-3.5 h-3.5" />
            <span>{location.propertyCount} Parcels</span>
          </Link>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-1.5">
            <Link
              href={`/dashboard/locations/${location.id}/edit`}
              className="px-2.5 py-1 rounded-lg bg-[#eaf5fa] text-[#087fc3] hover:bg-[#087fc3] hover:text-white text-xs font-semibold transition-colors"
            >
              Edit
            </Link>

            <LocationActionMenu location={location} />
          </div>
        </div>
      </div>
    </article>
  );
}

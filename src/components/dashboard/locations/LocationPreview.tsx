"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  Edit,
  Eye,
  MapPin,
  Building2,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Building,
  Navigation,
  ExternalLink,
} from "lucide-react";
import type { ILocation, IProperty } from "@/types/database";

interface LocationPreviewProps {
  location: ILocation & { _id: string };
  properties: (IProperty & { _id: string })[];
  userRole: string;
}

export function LocationPreview({
  location,
  properties,
}: LocationPreviewProps) {
  const heroImageSrc = location.heroImage?.url || `/images/locations/${location.slug}.jpg`;

  return (
    <div className="space-y-8 pb-16">
      {/* Draft Preview Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-amber-500 text-slate-950 font-body shadow-lg">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-black/10">
            <Eye className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm">Protected Administrator Preview</span>
              <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-black/15">
                {location.publicationStatus}
              </span>
            </div>
            <p className="text-xs text-slate-900 mt-0.5">
              This preview renders draft data with live website layouts. Not indexed by search engines.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href={`/dashboard/locations/${location._id}/edit`}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-black text-white text-xs font-semibold hover:bg-slate-900 transition-colors shadow-xs"
          >
            <Edit className="w-3.5 h-3.5" />
            <span>Return to Editor</span>
          </Link>
        </div>
      </div>

      {/* Hero Section Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-[#071a28] text-white border border-[#0d2c42] shadow-[0_18px_44px_rgba(7,26,40,0.18)] min-h-[380px] flex flex-col justify-end p-6 sm:p-10">
        <div className="absolute inset-0 z-0">
          <Image
            src={heroImageSrc}
            alt={location.heroImage?.altText || location.name}
            fill
            priority
            sizes="100vw"
            className="object-cover object-center opacity-40 mix-blend-luminosity"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#071a28] via-[#071a28]/80 to-transparent" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(66,183,232,0.2),transparent_70%)]" />
        </div>

        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="flex flex-wrap gap-2">
            <span className="px-3 py-1 rounded-full bg-[rgba(66,183,232,0.15)] border border-[rgba(66,183,232,0.3)] text-[#42b7e8] text-[11px] font-bold uppercase tracking-wider font-mono">
              {location.city}, {location.state}
            </span>
            {location.region && (
              <span className="px-3 py-1 rounded-full bg-white/10 text-white text-[11px] font-mono">
                {location.region}
              </span>
            )}
          </div>

          <h1 className="font-instrument text-3xl sm:text-4xl lg:text-5xl text-white font-normal leading-tight tracking-tight">
            {location.name}
          </h1>

          <p className="text-xs sm:text-sm text-[#cbd5e1] leading-relaxed max-w-2xl font-body">
            {location.shortDescription}
          </p>
        </div>
      </div>

      {/* Editorial Overview */}
      {location.longDescription && (
        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-[rgba(7,26,40,0.08)] shadow-[0_4px_24px_rgba(7,26,40,0.04)] space-y-4">
          <h2 className="text-lg font-serif text-[#071a28] font-normal">
            Corridor Investment Thesis &amp; Masterplan
          </h2>
          <p className="text-xs sm:text-sm text-[#4a5568] leading-relaxed font-body whitespace-pre-line">
            {location.longDescription}
          </p>
        </div>
      )}

      {/* Micro-Market Corridors Grid */}
      {location.microMarkets && location.microMarkets.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-[#087fc3]" />
            <h2 className="text-lg font-serif text-[#071a28] font-normal">
              Micro-Market Nodes ({location.microMarkets.length})
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {location.microMarkets.map((mm, idx) => (
              <div
                key={mm._id?.toString() || idx}
                className="p-5 rounded-2xl bg-white border border-[rgba(7,26,40,0.08)] shadow-2xs space-y-2.5"
              >
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-sm font-bold text-[#071a28] font-body">{mm.name}</h3>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#eaf5fa] text-[#087fc3] font-bold">
                    {mm.marketType || "CORRIDOR"}
                  </span>
                </div>
                <p className="text-xs text-[#647581] font-body line-clamp-2 leading-relaxed">
                  {mm.description}
                </p>
                {mm.highlights && mm.highlights.length > 0 && (
                  <div className="flex flex-wrap gap-1 pt-1">
                    {mm.highlights.slice(0, 3).map((h, i) => (
                      <span
                        key={i}
                        className="text-[10px] px-2 py-0.5 rounded bg-[#f7f5ef] text-[#2c3e50] font-medium"
                      >
                        ✓ {h}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Infrastructure & Connectivity Dual Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Infrastructure Highlights */}
        {location.infrastructureHighlights && location.infrastructureHighlights.length > 0 && (
          <div className="p-6 rounded-3xl bg-white border border-[rgba(7,26,40,0.08)] shadow-xs space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <Building className="w-4 h-4 text-[#087fc3]" />
              <h3 className="text-base font-serif text-[#071a28] font-normal">
                Infrastructure Milestones
              </h3>
            </div>

            <div className="space-y-3">
              {location.infrastructureHighlights.map((item, idx) => (
                <div key={item._id?.toString() || idx} className="p-3.5 rounded-xl bg-[#f7f5ef]/60 border border-[rgba(7,26,40,0.04)] space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-[#071a28] font-body">{item.name}</span>
                    <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 uppercase font-bold">
                      {item.status}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#647581] font-body">{item.description}</p>
                  <span className="text-[10px] font-mono text-[#647581] block">
                    Source: {item.source}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Connectivity Milestones */}
        {location.connectivityHighlights && location.connectivityHighlights.length > 0 && (
          <div className="p-6 rounded-3xl bg-white border border-[rgba(7,26,40,0.08)] shadow-xs space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <Navigation className="w-4 h-4 text-[#087fc3]" />
              <h3 className="text-base font-serif text-[#071a28] font-normal">
                Transit Proximity &amp; Speed
              </h3>
            </div>

            <div className="space-y-3">
              {location.connectivityHighlights.map((item, idx) => (
                <div key={item._id?.toString() || idx} className="p-3.5 rounded-xl bg-[#f7f5ef]/60 border border-[rgba(7,26,40,0.04)] flex items-center justify-between gap-3">
                  <div>
                    <span className="text-xs font-bold text-[#071a28] font-body block">{item.destination}</span>
                    <span className="text-[11px] text-[#647581] font-body">Via {item.route}</span>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-xs font-mono font-bold text-[#087fc3] block">{item.distanceKm} km</span>
                    <span className="text-[10px] font-mono text-emerald-700 font-semibold">{item.approxTravelTime}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Available Townships & Parcels */}
      {properties.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-[#087fc3]" />
              <h2 className="text-lg font-serif text-[#071a28] font-normal">
                Active Township Parcels ({properties.length})
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {properties.map((prop) => (
              <div
                key={prop._id}
                className="p-4 rounded-2xl bg-white border border-[rgba(7,26,40,0.08)] shadow-2xs space-y-2"
              >
                <h4 className="text-xs font-bold text-[#071a28] font-body truncate">{prop.title}</h4>
                <p className="text-[11px] text-[#647581] line-clamp-2 font-body">{prop.shortDescription}</p>
                <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs font-mono">
                  <span className="text-[#087fc3] font-bold">
                    {prop.pricing?.startingPricePaise
                      ? `From ₹${(prop.pricing.startingPricePaise / 10000000).toFixed(2)} Cr`
                      : "Price on Request"}
                  </span>
                  <span className="text-[#647581]">
                    {prop.area?.minimumAreaSqFt ? `${Math.round(prop.area.minimumAreaSqFt / 9)} sq yd` : ""}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

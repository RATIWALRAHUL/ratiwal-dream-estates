"use client";

import React from "react";
import Image from "next/image";
import { ArrowRight, Compass, MapPin, Building2, ShieldCheck, MessageCircle } from "lucide-react";
import { Location } from "@/types/location";
import { getLocationSummaryStats } from "@/data/locations";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { generateWhatsAppUrl } from "@/lib/whatsapp";

interface LocationDetailHeroProps {
  location: Location;
}

export function LocationDetailHero({ location }: LocationDetailHeroProps) {
  const stats = getLocationSummaryStats(location);
  const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: "Locations", href: "/locations" },
    { label: location.name, href: `/locations/${location.slug}` },
  ];

  const whatsappUrl = generateWhatsAppUrl({
    type: "location",
    locationName: location.name,
  });

  return (
    <section
      className="relative pt-6 pb-12 sm:pb-16 overflow-hidden border-b border-[rgba(7,26,40,0.06)]"
      aria-labelledby="location-detail-hero-heading"
    >
      {/* Background ambient glow */}
      <div className="absolute inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute -top-[10%] left-1/2 -translate-x-1/2 w-[1000px] h-[400px] bg-[radial-gradient(ellipse_at_center,rgba(66,183,232,0.1),transparent_70%)] blur-3xl" />
      </div>

      <div className="max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumbs Navigation */}
        <div className="mb-6 sm:mb-8">
          <Breadcrumbs items={breadcrumbItems} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          {/* Left Column: Location Info */}
          <div className="lg:col-span-7 flex flex-col items-start">
            {/* Eyebrow Badge */}
            <div className="flex flex-wrap items-center gap-2.5 mb-4">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--advisor-ivory)] border border-[rgba(8,127,195,0.2)] shadow-xs">
                <Compass size={13} className="text-[var(--ratwal-blue)]" />
                <span className="text-[11px] font-bold tracking-[0.14em] uppercase text-[var(--ratwal-blue)] font-body">
                  REGIONAL MARKET GUIDE
                </span>
              </div>
              <span className="text-xs text-[var(--text-secondary)] font-semibold">
                {location.state} • {location.region}
              </span>
            </div>

            {/* Headline */}
            <h1
              id="location-detail-hero-heading"
              className="font-instrument text-[2.5rem] sm:text-[3.25rem] md:text-[3.75rem] text-[var(--midnight)] font-normal leading-[1.05] tracking-tight mb-4"
            >
              Explore property opportunities in{" "}
              <span className="italic text-[var(--ratwal-blue)]">{location.name}.</span>
            </h1>

            {/* Short Tagline & Editorial Description */}
            <p className="text-base sm:text-lg text-[var(--text-secondary)] leading-relaxed max-w-xl mb-6 font-normal">
              {location.shortDescription}
            </p>

            {/* Badges Bar: Available listings & Property categories */}
            <div className="flex flex-wrap items-center gap-2.5 mb-8">
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-[rgba(7,26,40,0.1)] text-xs text-[var(--midnight)] font-semibold shadow-xs">
                <Building2 className="w-3.5 h-3.5 text-[var(--ratwal-blue)]" />
                <span>{stats.propertyCount} Verified Listings</span>
              </div>

              {location.propertyTypes.map((type, i) => (
                <span
                  key={i}
                  className="px-3 py-1.5 rounded-lg bg-[var(--mist-blue)] border border-[rgba(8,127,195,0.15)] text-xs font-medium text-[var(--ratwal-blue)]"
                >
                  {type}
                </span>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center gap-3.5">
              <a
                href="#properties"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-[var(--midnight)] hover:bg-[#082B3B] text-white font-semibold text-xs uppercase tracking-wider shadow-sm hover:shadow-md transition-all cursor-pointer"
              >
                <span>View properties in {location.name}</span>
                <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
              </a>

              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-[#25D366] hover:bg-[#1fb355] text-[#031C2B] text-xs font-bold shadow-xs transition-all"
                aria-label={`Speak with an advisor about ${location.name} on WhatsApp (opens in a new tab)`}
              >
                <MessageCircle className="w-4 h-4" aria-hidden="true" />
                <span>Speak with an advisor</span>
              </a>
            </div>

            {/* Verification Timestamp */}
            <p className="text-[11.5px] text-[var(--text-muted)] mt-5 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-[#10b981]" />
              <span>
                Statutory zoning &amp; infrastructure data verified for {location.name}: {location.lastVerifiedAt}
              </span>
            </p>
          </div>

          {/* Right Column: Hero Visual */}
          <div className="lg:col-span-5 relative">
            <div className="relative aspect-[4/3] sm:aspect-[16/11] lg:aspect-[4/3] rounded-2xl overflow-hidden border border-[rgba(7,26,40,0.1)] shadow-lg bg-white">
              <Image
                src={location.heroImage}
                alt={`Planned plotted development in ${location.name}, ${location.state}`}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 42vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[rgba(3,28,43,0.75)] via-transparent to-transparent opacity-80" />

              {/* Coordinates Pill */}
              <div className="absolute bottom-4 left-4 right-4 p-3 rounded-xl bg-[rgba(3,28,43,0.92)] backdrop-blur-md border border-[rgba(255,255,255,0.14)] flex items-center justify-between text-xs text-white">
                <span className="flex items-center gap-1.5 text-[#52BDE9] font-medium">
                  <MapPin className="w-3.5 h-3.5" />
                  {location.name}, {location.state}
                </span>
                <span className="text-[#a0b6c6] font-mono text-[11px]">
                  {location.coordinates.latitude.toFixed(4)}° N, {location.coordinates.longitude.toFixed(4)}° E
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

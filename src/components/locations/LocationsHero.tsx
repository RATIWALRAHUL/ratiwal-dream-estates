"use client";

import React from "react";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { Reveal } from "@/components/home/Reveal";
import { Compass, ShieldCheck, MapPin, Building2, CheckCircle2 } from "lucide-react";
import { Location } from "@/types/location";
import { properties } from "@/data/properties";

interface LocationsHeroProps {
  locations: Location[];
}

export function LocationsHero({ locations }: LocationsHeroProps) {
  const totalVerifiedMarkets = locations.length;
  const totalActiveProperties = properties.length;
  const totalStates = Array.from(new Set(locations.map((l) => l.state.split("/")[0].trim()))).length;

  const breadcrumbItems = [{ label: "Locations & Corridors", href: "/locations" }];

  const marketBadges = [
    { icon: MapPin, label: `${totalVerifiedMarkets} Operating Markets`, desc: "Jaipur, Mumbai & Ajmer" },
    { icon: Building2, label: `${totalActiveProperties} Active Verified Parcels`, desc: "Residential & Commercial" },
    { icon: ShieldCheck, label: `${totalStates} Core States`, desc: "Rajasthan & Maharashtra" },
    { icon: CheckCircle2, label: "100% Title Verified", desc: "Tehsil & RERA certified" },
  ];

  return (
    <section className="relative pt-20 sm:pt-22 md:pt-24 pb-10 sm:pb-14 overflow-hidden" aria-labelledby="locations-hero-heading">
      {/* Subtle Background Radial Glow */}
      <div className="absolute inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute -top-[10%] left-1/2 -translate-x-1/2 w-[1000px] h-[400px] bg-[radial-gradient(ellipse_at_center,rgba(66,183,232,0.12),transparent_70%)] blur-3xl" />
      </div>

      <div className="max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6 sm:mb-8">
          <Breadcrumbs items={breadcrumbItems} />
        </div>

        {/* Hero Title & Subheading */}
        <div className="max-w-4xl mx-auto text-center mb-10 sm:mb-12">
          <Reveal>
            <div className="inline-flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 rounded-full bg-[var(--advisor-ivory)] border border-[rgba(8,127,195,0.2)] shadow-xs mb-4 max-w-full">
              <Compass size={14} className="text-[var(--ratiwal-blue)] flex-shrink-0" />
              <span className="text-[10px] xs:text-[11px] sm:text-[12.5px] font-bold tracking-[0.06em] xs:tracking-[0.1em] sm:tracking-[0.16em] uppercase text-[var(--ratiwal-blue)] font-body whitespace-nowrap leading-none">
                VERIFIED REGIONAL CORRIDORS &amp; MICRO-MARKETS
              </span>
            </div>
          </Reveal>

          <Reveal delay={100}>
            <h1
              id="locations-hero-heading"
              className="font-instrument text-[2.75rem] sm:text-[3.6rem] md:text-[4.4rem] lg:text-[4.8rem] text-[var(--midnight)] font-normal leading-[1.02] tracking-tight mb-5"
            >
              Property opportunities{" "}
              <span className="italic text-[var(--ratiwal-blue)]">shaped by location.</span>
            </h1>
          </Reveal>

          <Reveal delay={150}>
            <p className="text-base sm:text-lg md:text-xl text-[var(--text-secondary)] leading-relaxed max-w-2xl mx-auto font-medium">
              Explore the growth corridors and micro-markets where statutory masterplans, multi-modal connectivity, and clean revenue documentation drive long-term appreciation.
            </p>
          </Reveal>

          {/* Market Summary Badges */}
          <Reveal delay={200}>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3.5 max-w-3xl mx-auto mt-8">
              {marketBadges.map((b, idx) => (
                <div
                  key={idx}
                  className="p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-white border border-[rgba(7,26,40,0.08)] shadow-[0_2px_12px_rgba(7,26,40,0.04)] text-left flex flex-col justify-between transition-all duration-300 hover:border-[rgba(7,132,200,0.3)] hover:shadow-md"
                >
                  <div className="w-8 h-8 rounded-lg bg-[var(--cyan-soft)] text-[var(--ratiwal-blue)] flex items-center justify-center flex-shrink-0 mb-2.5">
                    <b.icon size={16} />
                  </div>
                  <div>
                    <span className="text-xs sm:text-[13px] font-bold text-[var(--midnight)] block leading-snug">
                      {b.label}
                    </span>
                    <span className="text-[11px] text-[var(--text-secondary)] block mt-0.5 leading-normal">
                      {b.desc}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

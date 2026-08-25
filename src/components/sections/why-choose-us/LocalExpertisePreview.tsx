"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, MapPin, Navigation } from "lucide-react";
import { Reveal } from "@/components/home/Reveal";
import { properties } from "@/data/properties";

export function LocalExpertisePreview() {
  const verifiedCorridors = [
    {
      city: "Jaipur, Rajasthan",
      slug: "jaipur",
      corridorName: "Ajmer Road & Ring Road Zone",
      highlights: "Mahindra World City SEZ, 6-lane express connectivity, luxury plotted masterplans.",
      categories: ["Gated Residential Townships", "Logistics & Commercial Hubs"],
    },
    {
      city: "Navi Mumbai, Maharashtra",
      slug: "navi-mumbai",
      corridorName: "Aerotropolis & Panvel Growth Axis",
      highlights: "Adjacent to Navi Mumbai International Airport, Atal Setu (MTHL) transit corridor.",
      categories: ["Strategic Node Plots", "High-Yield Commercial Acreage"],
    },
    {
      city: "Ajmer & Pushkar Belt",
      slug: "ajmer",
      corridorName: "National Highway 48 Corridor",
      highlights: "Heritage institutional land, hospitality plotted parcels, fast connectivity to Jaipur.",
      categories: ["Heritage Villa Plots", "Highway Commercial Land"],
    },
  ];

  return (
    <section
      className="py-16 sm:py-24 bg-white border-b border-[rgba(7,26,40,0.08)]"
      aria-labelledby="local-expertise-title"
    >
      <div className="max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="max-w-3xl mb-12 sm:mb-16">
          <Reveal>
            <div className="flex items-center gap-2 mb-2">
              <MapPin size={16} className="text-[var(--ratiwal-blue)]" />
              <span className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--ratiwal-blue)]">
                LOCAL MARKET INTELLIGENCE
              </span>
            </div>
            <h2
              id="local-expertise-title"
              className="font-instrument text-3xl sm:text-4xl md:text-5xl text-[var(--midnight)] font-normal leading-tight tracking-tight mb-4"
            >
              Context matters as much as the property.
            </h2>
            <p className="text-sm sm:text-base text-[var(--text-secondary)] leading-relaxed font-normal">
              We specialize in deep micro-markets with verified masterplans, immediate road access, and clear structural growth drivers.
            </p>
          </Reveal>
        </div>

        {/* 3 Corridor Expertise Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {verifiedCorridors.map((corridor, idx) => {
            const count = properties.filter(
              (p) => p.location.toLowerCase().includes(corridor.slug.toLowerCase()) ||
                     p.city.toLowerCase().includes(corridor.slug.toLowerCase())
            ).length;

            return (
              <Reveal key={corridor.slug} delay={idx * 150}>
                <div className="p-7 sm:p-8 rounded-2xl sm:rounded-3xl bg-[var(--surface)] border border-[rgba(7,26,40,0.08)] h-full flex flex-col justify-between shadow-xs hover:border-[var(--ratiwal-blue)]/40 hover:shadow-sm transition-all duration-300 group">
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-4">
                      <span className="px-3 py-1 rounded-full bg-white text-[var(--ratiwal-blue-deep)] text-[11px] font-bold uppercase tracking-wider border border-[rgba(7,26,40,0.06)]">
                        {corridor.city.split(",")[0]}
                      </span>
                      <span className="text-xs font-semibold text-[var(--ratiwal-blue)]">
                        {count > 0 ? `${count} Verified Listing${count > 1 ? "s" : ""}` : "Active Advisory Hub"}
                      </span>
                    </div>

                    <h3 className="font-instrument text-2xl sm:text-3xl text-[var(--midnight)] font-normal mb-2">
                      {corridor.corridorName}
                    </h3>

                    <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed font-normal mb-6">
                      {corridor.highlights}
                    </p>

                    <div className="space-y-2 pt-4 border-t border-[rgba(7,26,40,0.06)]">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-secondary)] block">
                        Asset Focus:
                      </span>
                      {corridor.categories.map((cat, cIdx) => (
                        <div key={cIdx} className="flex items-center gap-2 text-xs text-[var(--midnight)] font-medium">
                          <Navigation size={12} className="text-[var(--ratiwal-blue)] flex-shrink-0" />
                          <span>{cat}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-6 mt-6 border-t border-[rgba(7,26,40,0.06)]">
                    <Link
                      href={`/locations/${corridor.slug}`}
                      className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[var(--ratiwal-blue)] hover:text-[var(--ratiwal-blue-deep)] transition-colors group-hover:translate-x-0.5"
                    >
                      <span>Explore {corridor.city.split(",")[0]} corridors</span>
                      <ArrowRight size={14} />
                    </Link>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>

      </div>
    </section>
  );
}

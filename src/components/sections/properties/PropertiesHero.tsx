"use client";

import React from "react";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { Reveal } from "@/components/home/Reveal";
import { ShieldCheck, MapPin, Sparkles, FileCheck2, Scale } from "lucide-react";

export function PropertiesHero() {
  const breadcrumbItems = [{ label: "Properties Portfolio", href: "/properties" }];

  const trustBadges = [
    { icon: ShieldCheck, label: "100% Verified Titles", desc: "30-year Tehsil search" },
    { icon: FileCheck2, label: "Statutory Approvals", desc: "JDA / CIDCO / RERA checked" },
    { icon: MapPin, label: "Prime Growth Corridors", desc: "Expressways & ring roads" },
    { icon: Scale, label: "Direct Owner Pricing", desc: "Zero speculative markups" },
  ];

  return (
    <section className="relative pt-20 sm:pt-22 md:pt-24 pb-6 sm:pb-12 overflow-hidden" aria-labelledby="properties-hero-title">
      {/* Background Glow */}
      <div className="absolute inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute -top-[10%] left-1/2 -translate-x-1/2 w-[1000px] h-[400px] bg-[radial-gradient(ellipse_at_center,rgba(66,183,232,0.12),transparent_70%)] blur-3xl" />
      </div>

      <div className="max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-3 sm:mb-6">
          <Breadcrumbs items={breadcrumbItems} />
        </div>

        {/* Hero Title & Subheading */}
        <div className="max-w-4xl mx-auto text-center mb-6 sm:mb-10">
          <Reveal>
            <div className="inline-flex items-center justify-center gap-1.5 px-3 py-1 sm:px-4 sm:py-1.5 rounded-full bg-[var(--advisor-ivory)] border border-[rgba(8,127,195,0.2)] shadow-xs mb-3 sm:mb-4 max-w-full">
              <Sparkles size={13} className="text-[var(--ratiwal-blue)] flex-shrink-0" />
              <span className="text-[9.5px] xs:text-[10.5px] sm:text-[12px] font-bold tracking-[0.06em] xs:tracking-[0.08em] sm:tracking-[0.14em] uppercase text-[var(--ratiwal-blue)] font-body whitespace-nowrap leading-none">
                VERIFIED PLOTTED ASSETS &amp; LAND HOLDINGS
              </span>
            </div>
          </Reveal>

          <Reveal delay={100}>
            <h1
              id="properties-hero-title"
              className="font-instrument text-[1.95rem] xs:text-[2.35rem] sm:text-[3.2rem] md:text-[4rem] lg:text-[4.6rem] text-[var(--midnight)] font-normal leading-[1.1] sm:leading-[1.03] tracking-tight mb-3 sm:mb-5"
            >
              Curated land opportunities, verified{" "}
              <span className="italic text-[var(--ratiwal-blue)]">without compromise.</span>
            </h1>
          </Reveal>

          <Reveal delay={150}>
            <p className="text-xs xs:text-sm sm:text-base md:text-lg text-[var(--text-secondary)] leading-relaxed max-w-2xl mx-auto font-normal sm:font-medium px-1 sm:px-0">
              Explore our vetted collection of development-ready residential and commercial plots across Rajasthan and Maharashtra.
            </p>
          </Reveal>

          {/* Quick Badges */}
          <Reveal delay={200}>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3.5 max-w-4xl mx-auto mt-6 sm:mt-8">
              {trustBadges.map((b, idx) => (
                <div
                  key={idx}
                  className="p-3 sm:p-3.5 rounded-2xl bg-white/95 backdrop-blur-md border border-[rgba(7,26,40,0.08)] shadow-xs text-left flex flex-col sm:flex-row items-start sm:items-center gap-2.5 sm:gap-3 transition-all duration-300 hover:border-[rgba(8,127,195,0.3)] hover:shadow-md"
                >
                  <div className="w-8 h-8 rounded-lg bg-[var(--cyan-soft)] text-[var(--ratiwal-blue)] flex items-center justify-center flex-shrink-0">
                    <b.icon size={16} strokeWidth={2.2} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="text-[12px] sm:text-[13px] font-bold text-[var(--midnight)] block leading-snug">
                      {b.label}
                    </span>
                    <span className="text-[11px] sm:text-xs text-[var(--text-secondary)] block mt-0.5 leading-tight font-medium">
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

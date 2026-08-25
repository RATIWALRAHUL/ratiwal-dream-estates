"use client";

import React from "react";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { Reveal } from "@/components/home/Reveal";
import { ShieldCheck, MapPin, Sparkles, FileCheck2, Scale, Layers } from "lucide-react";

export function PropertiesHero() {
  const breadcrumbItems = [{ label: "Properties Portfolio", href: "/properties" }];

  const trustBadges = [
    { icon: ShieldCheck, label: "100% Verified Titles", desc: "30-year Tehsil search" },
    { icon: FileCheck2, label: "Statutory Approvals", desc: "JDA / CIDCO / RERA checked" },
    { icon: MapPin, label: "Prime Growth Corridors", desc: "Expressways & ring roads" },
    { icon: Scale, label: "Direct Owner Pricing", desc: "Zero speculative markups" },
  ];

  return (
    <section className="relative pt-6 pb-10 sm:pb-14 overflow-hidden" aria-labelledby="properties-hero-title">
      {/* Background Glow */}
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
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[var(--advisor-ivory)] border border-[rgba(8,127,195,0.2)] shadow-xs mb-4">
              <Sparkles size={15} className="text-[var(--ratiwal-blue)]" />
              <span className="text-[11.5px] sm:text-[12.5px] font-bold tracking-[0.16em] uppercase text-[var(--ratiwal-blue)] font-body">
                VERIFIED PLOTTED ASSETS &amp; LAND HOLDINGS
              </span>
            </div>
          </Reveal>

          <Reveal delay={100}>
            <h1
              id="properties-hero-title"
              className="font-instrument text-[2.75rem] sm:text-[3.6rem] md:text-[4.4rem] lg:text-[4.8rem] text-[var(--midnight)] font-normal leading-[1.02] tracking-tight mb-5"
            >
              Curated land opportunities, verified{" "}
              <span className="italic text-[var(--ratiwal-blue)]">without compromise.</span>
            </h1>
          </Reveal>

          <Reveal delay={150}>
            <p className="text-base sm:text-lg md:text-xl text-[var(--text-secondary)] leading-relaxed max-w-2xl mx-auto font-medium">
              Explore our vetted collection of development-ready residential and commercial plots across Rajasthan and Maharashtra.
            </p>
          </Reveal>

          {/* Quick Badges */}
          <Reveal delay={200}>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-3xl mx-auto mt-8">
              {trustBadges.map((b, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-white border border-[rgba(7,26,40,0.08)] shadow-xs text-left flex items-center gap-2.5"
                >
                  <div className="w-8 h-8 rounded-lg bg-[var(--cyan-soft)] text-[var(--ratiwal-blue)] flex items-center justify-center flex-shrink-0">
                    <b.icon size={16} />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-[var(--midnight)] block leading-tight">
                      {b.label}
                    </span>
                    <span className="text-[11px] text-[var(--text-secondary)]">
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

"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ShieldCheck, Scale, Sparkles, MapPin, Award } from "lucide-react";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { MagneticButton } from "@/components/home/MagneticButton";
import { Reveal } from "@/components/home/Reveal";

export function AboutHero() {
  const breadcrumbItems = [{ label: "About Us", href: "/about" }];

  const badges = [
    { icon: ShieldCheck, label: "100% Verified Titles" },
    { icon: Scale, label: "Zero Speculative Markup" },
    { icon: Award, label: "10+ Years Advisory" },
    { icon: MapPin, label: "Jaipur & Maharashtra Hubs" },
  ];

  return (
    <section className="relative pt-6 pb-14 sm:pb-20 overflow-hidden" aria-labelledby="about-hero-title">
      {/* Background Subtle Gradient & Mesh Glow */}
      <div className="absolute inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute -top-[20%] left-1/2 -translate-x-1/2 w-[1000px] h-[550px] bg-[radial-gradient(ellipse_at_center,rgba(66,183,232,0.12),transparent_70%)] blur-3xl" />
        <div className="absolute top-[40%] right-[-10%] w-[500px] h-[500px] bg-[radial-gradient(circle,rgba(8,127,195,0.08),transparent_65%)] blur-3xl" />
      </div>

      <div className="max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6 sm:mb-8">
          <Breadcrumbs items={breadcrumbItems} />
        </div>

        {/* Hero Copy Container */}
        <div className="max-w-4xl mx-auto text-center">
          <Reveal>
            <div className="inline-flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 rounded-full bg-[var(--advisor-ivory)] border border-[rgba(8,127,195,0.2)] shadow-xs mb-5 max-w-full">
              <span className="w-2 h-2 rounded-full bg-[var(--ratiwal-blue)] animate-pulse flex-shrink-0" />
              <span className="text-[10px] xs:text-[11px] sm:text-[12.5px] font-bold tracking-[0.06em] xs:tracking-[0.1em] sm:tracking-[0.16em] uppercase text-[var(--ratiwal-blue)] font-body whitespace-nowrap leading-none">
                FOUNDED ON TRUST &amp; TRANSPARENCY
              </span>
            </div>
          </Reveal>

          <Reveal delay={100}>
            <h1
              id="about-hero-title"
              className="font-instrument text-[2.75rem] sm:text-[3.6rem] md:text-[4.4rem] lg:text-[4.9rem] text-[var(--midnight)] font-normal leading-[1.02] tracking-tight mb-5 sm:mb-6"
            >
              Guiding generational wealth through{" "}
              <span className="italic text-[var(--ratiwal-blue)]">verified land assets.</span>
            </h1>
          </Reveal>

          <Reveal delay={200}>
            <p className="text-base sm:text-lg md:text-xl text-[var(--text-secondary)] leading-relaxed max-w-2xl mx-auto mb-8 sm:mb-10 font-medium">
              We eliminate the ambiguity, opaque pricing, and legal risks of property acquisition. 
              Every plot we advise on is backed by 30-year title diligence, ground verification, and unwavering fiduciary commitment.
            </p>
          </Reveal>

          <Reveal delay={250}>
            <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 mb-10 sm:mb-12">
              <MagneticButton strength={6}>
                <Link href="/contact" className="button-primary shadow-glow">
                  Book Private Advisory <ArrowRight size={17} />
                </Link>
              </MagneticButton>
              <MagneticButton strength={6}>
                <Link href="/properties" className="button-ghost !text-[var(--midnight)] !border-[rgba(7,26,40,0.18)] hover:!bg-[var(--midnight)] hover:!text-white">
                  Explore Verified Land <ArrowRight size={17} />
                </Link>
              </MagneticButton>
            </div>
          </Reveal>

          {/* Quick Pill Badges */}
          <Reveal delay={300}>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3.5 max-w-3xl mx-auto">
              {badges.map((b, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 p-2.5 sm:p-3 rounded-xl bg-white/80 backdrop-blur-md border border-[rgba(7,26,40,0.08)] shadow-xs transition-all duration-300 hover:border-[rgba(8,127,195,0.3)] hover:shadow-sm"
                >
                  <div className="w-8 h-8 rounded-lg bg-[var(--cyan-soft)] text-[var(--ratiwal-blue)] flex items-center justify-center flex-shrink-0">
                    <b.icon size={16} strokeWidth={2} />
                  </div>
                  <span className="text-[12px] sm:text-[13px] font-semibold text-[var(--midnight)] text-left leading-tight">
                    {b.label}
                  </span>
                </div>
              ))}
            </div>
          </Reveal>
        </div>

        {/* Hero Visual Showcase Banner */}
        <Reveal delay={350}>
          <div className="relative mt-10 sm:mt-16 rounded-2xl sm:rounded-3xl overflow-hidden border border-[rgba(7,26,40,0.12)] shadow-xl bg-[var(--midnight)] min-h-[280px] sm:min-h-[360px] md:min-h-[440px] aspect-[16/11] sm:aspect-[16/8.5] max-h-[580px] w-full">
            <Image
              src="/images/about/office-consultation.jpg"
              alt="Ratiwal Dream Estates Advisory Council room overlooking historic Jaipur"
              fill
              priority
              sizes="(max-width: 1280px) 100vw, 1280px"
              className="object-cover opacity-95 transition-transform duration-1000 hover:scale-[1.02]"
            />
            {/* Ambient Gradients */}
            <div className="absolute inset-0 bg-gradient-to-t from-[var(--midnight)] via-transparent to-transparent opacity-80" />
            <div className="absolute inset-0 bg-gradient-to-r from-[var(--midnight)]/40 via-transparent to-[var(--midnight)]/40" />

            {/* Overlaid Floating Plaque */}
            <div className="absolute bottom-3 left-3 right-3 sm:bottom-6 sm:left-6 sm:right-auto max-w-md p-3.5 sm:p-5 rounded-xl sm:rounded-2xl bg-[rgba(7,26,40,0.9)] backdrop-blur-xl border border-white/15 text-white shadow-2xl">
              <div className="flex items-center gap-1.5 sm:gap-2 mb-1">
                <Sparkles size={14} className="text-[var(--cyan)] flex-shrink-0" />
                <span className="text-[10px] sm:text-[11px] uppercase tracking-widest font-bold text-[var(--cyan)]">
                  The Advisory Standard
                </span>
              </div>
              <p className="font-instrument text-[15px] sm:text-lg md:text-xl font-normal leading-snug text-white/95">
                “True consultancy begins by treating every client’s capital with the same caution and integrity as our own.”
              </p>
              <p className="text-[10.5px] sm:text-[11.5px] text-white/60 mt-1 font-medium">
                — Jaipur Advisory Office, Ratiwal Dream Estates
              </p>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

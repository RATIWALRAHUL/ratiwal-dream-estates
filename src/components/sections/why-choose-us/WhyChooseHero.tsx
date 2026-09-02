"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CheckCircle, ShieldCheck } from "lucide-react";
import { Reveal } from "@/components/home/Reveal";
import { whyChooseUsData } from "@/data/whyChooseUsData";

export function WhyChooseHero() {
  const { hero } = whyChooseUsData;

  return (
    <section
      className="relative min-h-[600px] lg:min-h-[660px] bg-[var(--alabaster)] pt-20 sm:pt-22 md:pt-24 pb-16 sm:pb-20 overflow-hidden border-b border-[rgba(7,26,40,0.08)]"
      aria-labelledby="why-hero-title"
    >
      {/* Subtle blueprint grid architectural backdrop */}
      <div
        className="absolute inset-0 opacity-[0.035] pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(#071a28 1px, transparent 1px), linear-gradient(to right, #071a28 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
        aria-hidden="true"
      />

      <div className="max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          
          {/* Left Column: Headline & Value Proposition (7 of 12 cols) */}
          <div className="lg:col-span-7">
            <Reveal>
              <div className="flex items-center gap-3 mb-4">
                <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-[var(--ratiwal-blue)] px-2.5 py-1 rounded bg-white border border-[rgba(7,26,40,0.08)] shadow-2xs">
                  {hero.index}
                </span>
                <span className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--ratiwal-blue)]">
                  {hero.eyebrow}
                </span>
              </div>

              <h1
                id="why-hero-title"
                className="font-instrument text-4xl sm:text-5xl md:text-6xl lg:text-[4.25rem] text-[var(--midnight)] font-normal leading-[1.04] tracking-tight mb-6"
              >
                Clarity before{" "}
                <span className="italic text-[var(--ratiwal-blue)] font-normal">
                  commitment.
                </span>
              </h1>

              <p className="text-base sm:text-lg md:text-xl text-[var(--text-secondary)] leading-relaxed font-normal mb-8 max-w-2xl">
                {hero.supportingCopy}
              </p>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 mb-6">
                <Link
                  href={hero.primaryCta.href}
                  className="inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-full bg-[var(--ratiwal-blue)] hover:bg-[var(--ratiwal-blue-deep)] text-white text-sm font-bold shadow-md shadow-[rgba(8,127,195,0.28)] transition-all duration-300 group hover:-translate-y-0.5"
                >
                  <span>{hero.primaryCta.label}</span>
                  <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" />
                </Link>

                <Link
                  href={hero.secondaryCta.href}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-white hover:bg-[var(--surface)] text-[var(--midnight)] border border-[rgba(7,26,40,0.12)] text-sm font-bold transition-colors"
                >
                  <span>{hero.secondaryCta.label}</span>
                  <ArrowRight size={14} className="text-[var(--ratiwal-blue)]" />
                </Link>
              </div>

              {/* Trust Microcopy & Architectural Geolocation Tag */}
              <div className="pt-6 border-t border-[rgba(7,26,40,0.08)] flex flex-wrap items-center justify-between gap-3 text-xs text-[var(--text-secondary)]">
                <div className="flex items-center gap-2">
                  <CheckCircle size={14} className="text-[var(--ratiwal-blue)] flex-shrink-0" />
                  <span className="font-medium">{hero.trustMicrocopy}</span>
                </div>
                <span className="font-mono text-[11px] text-[var(--text-secondary)] opacity-80">
                  {hero.geoLine}
                </span>
              </div>
            </Reveal>
          </div>

          {/* Right Column: Premium Advisory Showcase Visual (5 of 12 cols) */}
          <div className="lg:col-span-5">
            <Reveal delay={200}>
              <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden border border-[rgba(7,26,40,0.12)] shadow-xl bg-[var(--midnight)] aspect-[4/3] sm:aspect-[16/11] lg:aspect-[4/4.2] w-full group">
                <Image
                  src="/images/about/office-consultation.jpg"
                  alt="Ratiwal Dream Estates advisory council evaluating land documentation and masterplan layout"
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 540px"
                  className="object-cover opacity-95 transition-transform duration-1000 group-hover:scale-105"
                />

                {/* Subtle Ambient Gradients */}
                <div className="absolute inset-0 bg-gradient-to-t from-[var(--midnight)] via-transparent to-transparent opacity-80" />
                <div className="absolute inset-0 bg-gradient-to-r from-[var(--midnight)]/30 via-transparent to-transparent" />

                {/* Floating Architectural Quality Badge */}
                <div className="absolute bottom-4 left-4 right-4 sm:bottom-6 sm:left-6 sm:right-6 p-4 rounded-xl bg-[rgba(7,26,40,0.92)] backdrop-blur-xl border border-white/15 text-white shadow-2xl">
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <div className="flex items-center gap-2">
                      <ShieldCheck size={16} className="text-[var(--cyan)]" />
                      <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--cyan)]">
                        Verification Discipline
                      </span>
                    </div>
                    <span className="font-mono text-[10px] text-white/50">{hero.refNumber}</span>
                  </div>
                  <p className="text-xs sm:text-[13px] text-white/90 leading-snug">
                    Every plot evaluated against sanctioned masterplans, revenue Khatedari records, and physical ground demarcation.
                  </p>
                </div>
              </div>
            </Reveal>
          </div>

        </div>
      </div>
    </section>
  );
}

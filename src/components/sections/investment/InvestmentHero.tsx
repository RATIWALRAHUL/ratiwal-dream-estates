"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, TrendingUp, ShieldCheck, Sparkles, Award, Compass, Calculator } from "lucide-react";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { Reveal } from "@/components/home/Reveal";
import { MagneticButton } from "@/components/home/MagneticButton";

export function InvestmentHero() {
  const breadcrumbItems = [{ label: "Investment Strategy", href: "/investment" }];

  const highlights = [
    { icon: TrendingUp, label: "18% – 24% Historical CAGR", desc: "Across prime growth vectors" },
    { icon: ShieldCheck, label: "Zero Structural Depreciation", desc: "Pure land asset appreciation" },
    { icon: Compass, label: "Infrastructure-Linked", desc: "Expressway & airport corridors" },
    { icon: Award, label: "100% Clear Title Assurance", desc: "30-year revenue diligence" },
  ];

  return (
    <section className="relative pt-6 pb-14 sm:pb-20 overflow-hidden" aria-labelledby="investment-hero-title">
      {/* Background Glow */}
      <div className="absolute inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute -top-[10%] left-1/2 -translate-x-1/2 w-[1100px] h-[500px] bg-[radial-gradient(ellipse_at_center,rgba(66,183,232,0.14),transparent_70%)] blur-3xl" />
        <div className="absolute top-[45%] right-[-5%] w-[450px] h-[450px] bg-[radial-gradient(circle,rgba(8,127,195,0.08),transparent_65%)] blur-3xl" />
      </div>

      <div className="max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6 sm:mb-8">
          <Breadcrumbs items={breadcrumbItems} />
        </div>

        {/* Hero Copy */}
        <div className="max-w-4xl mx-auto text-center mb-12 sm:mb-16">
          <Reveal>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[var(--advisor-ivory)] border border-[rgba(8,127,195,0.2)] shadow-xs mb-4">
              <Sparkles size={15} className="text-[var(--ratiwal-blue)]" />
              <span className="text-[11.5px] sm:text-[12.5px] font-bold tracking-[0.16em] uppercase text-[var(--ratiwal-blue)] font-body">
                STRATEGIC LAND ALLOCATION &amp; WEALTH PRESERVATION
              </span>
            </div>
          </Reveal>

          <Reveal delay={100}>
            <h1
              id="investment-hero-title"
              className="font-instrument text-[2.75rem] sm:text-[3.6rem] md:text-[4.4rem] lg:text-[4.9rem] text-[var(--midnight)] font-normal leading-[1.02] tracking-tight mb-5 sm:mb-6"
            >
              Transforming strategic land into{" "}
              <span className="italic text-[var(--ratiwal-blue)]">generational wealth.</span>
            </h1>
          </Reveal>

          <Reveal delay={150}>
            <p className="text-base sm:text-lg md:text-xl text-[var(--text-secondary)] leading-relaxed max-w-2xl mx-auto font-medium mb-8 sm:mb-10">
              A disciplined, data-backed approach to acquiring verified, high-appreciation land parcels in Rajasthan and Maharashtra’s highest-velocity growth corridors.
            </p>
          </Reveal>

          <Reveal delay={200}>
            <div className="flex flex-wrap items-center justify-center gap-3.5 sm:gap-4 mb-10 sm:mb-12">
              <MagneticButton strength={6}>
                <a href="#calculator" className="button-primary shadow-glow">
                  <Calculator size={17} />
                  Calculate Land ROI <ArrowRight size={17} />
                </a>
              </MagneticButton>
              <MagneticButton strength={6}>
                <Link href="/contact" className="button-ghost !text-[var(--midnight)] !border-[rgba(7,26,40,0.18)] hover:!bg-[var(--midnight)] hover:!text-white">
                  Schedule Portfolio Advisory <ArrowRight size={17} />
                </Link>
              </MagneticButton>
            </div>
          </Reveal>

          {/* Key Metric Highlights */}
          <Reveal delay={250}>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 max-w-4xl mx-auto">
              {highlights.map((h, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl bg-white/80 backdrop-blur-md border border-[rgba(7,26,40,0.08)] shadow-xs transition-all duration-300 hover:border-[rgba(8,127,195,0.3)] hover:shadow-sm text-left flex flex-col justify-between"
                >
                  <div className="w-9 h-9 rounded-xl bg-[var(--cyan-soft)] text-[var(--ratiwal-blue)] flex items-center justify-center mb-3">
                    <h.icon size={18} strokeWidth={2} />
                  </div>
                  <div>
                    <div className="text-sm sm:text-[14.5px] font-bold text-[var(--midnight)] leading-snug">
                      {h.label}
                    </div>
                    <div className="text-[11.5px] text-[var(--text-secondary)] mt-0.5">
                      {h.desc}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Reveal>
        </div>

        {/* Hero Visual Banner */}
        <Reveal delay={300}>
          <div className="relative mt-8 sm:mt-12 rounded-2xl sm:rounded-3xl overflow-hidden border border-[rgba(7,26,40,0.12)] shadow-xl bg-[var(--midnight)] min-h-[280px] sm:min-h-[360px] md:min-h-[440px] aspect-[16/11] sm:aspect-[16/8.5] max-h-[520px] w-full">
            <Image
              src="/images/about/township-development.jpg"
              alt="Planned plotted development township with organized road infrastructure"
              fill
              priority
              sizes="(max-width: 1280px) 100vw, 1280px"
              className="object-cover opacity-95 transition-transform duration-1000 hover:scale-[1.02]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[var(--midnight)]/85 via-transparent to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-[var(--midnight)]/40 via-transparent to-[var(--midnight)]/40" />

            <div className="absolute bottom-3 left-3 right-3 sm:bottom-6 sm:left-6 sm:right-auto max-w-lg p-3.5 sm:p-5 rounded-xl sm:rounded-2xl bg-[rgba(7,26,40,0.9)] backdrop-blur-xl border border-white/15 text-white shadow-2xl">
              <span className="text-[10px] sm:text-[11px] uppercase tracking-widest font-bold text-[var(--cyan)] block mb-1">
                The Plotted Asset Advantage
              </span>
              <p className="font-instrument text-[15px] sm:text-lg md:text-xl font-normal leading-snug text-white/95">
                “Land is the only real estate asset that never depreciates. When paired with sanctioned infrastructure, it creates disproportionate compounding.”
              </p>
            </div>
          </div>
        </Reveal>

      </div>
    </section>
  );
}

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
    <section className="relative pt-20 sm:pt-22 md:pt-24 pb-14 sm:pb-20 overflow-hidden" aria-labelledby="investment-hero-title">
      {/* Background Glow */}
      <div className="absolute inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute -top-[10%] left-1/2 -translate-x-1/2 w-[1100px] h-[500px] bg-[radial-gradient(ellipse_at_center,rgba(66,183,232,0.14),transparent_70%)] blur-3xl" />
        <div className="absolute top-[45%] right-[-5%] w-[450px] h-[450px] bg-[radial-gradient(circle,rgba(8,127,195,0.08),transparent_65%)] blur-3xl" />
      </div>

      <div className="max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-3 sm:mb-6">
          <Breadcrumbs items={breadcrumbItems} />
        </div>

        {/* Hero Copy */}
        <div className="max-w-4xl mx-auto text-center mb-8 sm:mb-10">
          <Reveal>
            <div className="inline-flex items-center justify-center gap-1.5 px-3 py-1 sm:px-4 sm:py-1.5 rounded-full bg-[var(--advisor-ivory)] border border-[rgba(8,127,195,0.2)] shadow-2xs mb-3 sm:mb-4 max-w-full">
              <Sparkles size={13} className="text-[var(--ratiwal-blue)] flex-shrink-0" />
              <span className="text-[9.5px] xs:text-[10.5px] sm:text-[12px] font-bold tracking-[0.06em] xs:tracking-[0.08em] sm:tracking-[0.14em] uppercase text-[var(--ratiwal-blue)] font-body leading-none text-center">
                <span className="sm:hidden">STRATEGIC LAND ALLOCATION</span>
                <span className="hidden sm:inline">STRATEGIC LAND ALLOCATION &amp; WEALTH PRESERVATION</span>
              </span>
            </div>
          </Reveal>

          <Reveal delay={100}>
            <h1
              id="investment-hero-title"
              className="font-instrument text-[1.95rem] xs:text-[2.35rem] sm:text-[3.2rem] md:text-[4rem] lg:text-[4.6rem] text-[var(--midnight)] font-normal leading-[1.1] sm:leading-[1.03] tracking-tight mb-3 sm:mb-5"
            >
              Transforming strategic land into{" "}
              <span className="italic text-[var(--ratiwal-blue)]">generational wealth.</span>
            </h1>
          </Reveal>

          <Reveal delay={150}>
            <p className="text-xs xs:text-sm sm:text-base md:text-lg text-[var(--text-secondary)] leading-relaxed max-w-2xl mx-auto font-normal sm:font-medium mb-6 sm:mb-8 px-1 sm:px-0">
              A disciplined, data-backed approach to acquiring verified, high-appreciation land parcels in Rajasthan and Maharashtra’s highest-velocity growth corridors.
            </p>
          </Reveal>

          <Reveal delay={200}>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-6 sm:mb-8 max-w-md sm:max-w-none mx-auto w-full">
              <MagneticButton strength={6} className="w-full sm:w-auto flex justify-center">
                <a
                  href="#calculator"
                  className="button-primary shadow-glow w-full sm:w-[260px] justify-center whitespace-nowrap text-xs sm:text-sm px-6 py-3.5 min-h-[48px] sm:min-h-[52px]"
                >
                  <Calculator size={17} className="flex-shrink-0" />
                  <span>Calculate Land ROI</span>
                  <ArrowRight size={17} className="flex-shrink-0" />
                </a>
              </MagneticButton>
              <MagneticButton strength={6} className="w-full sm:w-auto flex justify-center">
                <Link
                  href="/contact"
                  className="button-ghost !text-[var(--midnight)] !border-[rgba(7,26,40,0.18)] hover:!bg-[var(--midnight)] hover:!text-white w-full sm:w-[260px] justify-center whitespace-nowrap text-xs sm:text-sm px-6 py-3.5 min-h-[48px] sm:min-h-[52px]"
                >
                  <span>Schedule Portfolio Advisory</span>
                  <ArrowRight size={17} className="flex-shrink-0" />
                </Link>
              </MagneticButton>
            </div>
          </Reveal>
        </div>

        {/* Key Metric Highlights - Fully Responsive Multi-Screen Grid */}
        <div className="max-w-7xl mx-auto mb-8 sm:mb-14">
          <Reveal delay={250}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4 lg:gap-5">
              {highlights.map((h, idx) => (
                <div
                  key={idx}
                  className="p-4.5 sm:p-5 lg:p-6 rounded-2xl bg-white/95 backdrop-blur-md border border-[rgba(7,26,40,0.08)] shadow-[0_4px_20px_rgba(7,26,40,0.04)] transition-all duration-300 hover:border-[rgba(8,127,195,0.35)] hover:shadow-md text-left flex flex-col justify-between"
                >
                  <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-[var(--cyan-soft)] text-[var(--ratiwal-blue)] flex items-center justify-center mb-3 sm:mb-4 flex-shrink-0">
                    <h.icon size={20} strokeWidth={2.2} />
                  </div>
                  <div className="flex-1 flex flex-col justify-between">
                    <div className="text-[14.5px] xs:text-[15px] sm:text-[16px] font-bold text-[var(--midnight)] leading-snug sm:min-h-[44px] flex items-center">
                      {h.label}
                    </div>
                    <div className="text-[12px] sm:text-[12.5px] text-[var(--text-secondary)] mt-1.5 leading-relaxed font-normal">
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

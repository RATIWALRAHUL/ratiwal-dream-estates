"use client";

import React from "react";
import { 
  Target, 
  MapPin, 
  FileCheck2, 
  Scale, 
  CheckCircle2, 
  ArrowRight,
  Sparkles
} from "lucide-react";
import { Reveal } from "@/components/home/Reveal";

export function InvestmentLifecycle() {
  const phases = [
    {
      num: "01",
      badge: "DISCOVERY",
      icon: Target,
      title: "Capital & Horizon Profiling",
      desc: "We analyze your investment liquidity, holding capacity (3 to 10 years), and risk preferences to establish clear return benchmarks.",
    },
    {
      num: "02",
      badge: "SELECTION",
      icon: MapPin,
      title: "Corridor & Vector Strategy",
      desc: "Identifying approved statutory sectors positioned directly along expanding expressways, ring roads, or aerotropolis corridors.",
    },
    {
      num: "03",
      badge: "AUDIT",
      icon: FileCheck2,
      title: "30-Year Revenue Scrutiny",
      desc: "Exhaustive verification of Jamabandi records, Khasra Milan, conversion orders (90A/90B), and non-encumbrance title certificates.",
    },
    {
      num: "04",
      badge: "EXECUTION",
      icon: Scale,
      title: "Transparent Registry Execution",
      desc: "Direct seller alignment with zero hidden middleman fees, standard agreement drafting, and biometric Sub-Registrar execution.",
    },
    {
      num: "05",
      badge: "GROWTH",
      icon: CheckCircle2,
      title: "Mutation, Demarcation & Resale",
      desc: "Expedited revenue Mutation (Dakhil Kharij), boundary stone installation, and long-term asset management or exit advisory.",
    },
  ];

  return (
    <section className="py-14 sm:py-20 bg-[var(--alabaster)] relative overflow-hidden" aria-labelledby="lifecycle-heading">
      {/* Background Accent Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[350px] bg-[radial-gradient(ellipse_at_center,rgba(8,127,195,0.06),transparent_70%)] blur-3xl pointer-events-none" />

      <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header */}
        <div className="max-w-3xl mx-auto text-center mb-10 sm:mb-14">
          <Reveal>
            <div className="inline-flex items-center justify-center gap-1.5 px-3.5 py-1 rounded-full bg-[var(--advisor-ivory)] border border-[rgba(8,127,195,0.2)] shadow-2xs mb-3">
              <Sparkles size={13} className="text-[var(--ratiwal-blue)] flex-shrink-0" />
              <span className="text-[10px] sm:text-[11.5px] font-bold tracking-[0.14em] uppercase text-[var(--ratiwal-blue)]">
                DISCIPLINED PROCESS
              </span>
            </div>

            <h2
              id="lifecycle-heading"
              className="font-instrument text-[2.2rem] sm:text-[3rem] md:text-[3.6rem] text-[var(--midnight)] font-normal leading-[1.08] tracking-tight mb-3 sm:mb-4"
            >
              The 5-phase land investment{" "}
              <span className="italic text-[var(--ratiwal-blue)]">lifecycle.</span>
            </h2>

            <p className="text-xs sm:text-base text-[var(--text-secondary)] leading-relaxed max-w-2xl mx-auto font-normal sm:font-medium">
              Every parcel acquisition follows a strict, repeatable blueprint ensuring complete legal safety and maximum capital compounding.
            </p>
          </Reveal>
        </div>

        {/* 5-Step Process Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-4.5 lg:gap-5">
          {phases.map((phase, idx) => (
            <Reveal key={idx} delay={idx * 60}>
              <div className="p-5 sm:p-5.5 rounded-[22px] bg-white/95 backdrop-blur-md border border-[rgba(11,34,57,0.08)] shadow-[0_4px_20px_rgba(11,34,57,0.04)] hover:border-[rgba(8,127,195,0.35)] hover:shadow-[0_16px_36px_rgba(8,127,195,0.12)] hover:-translate-y-1.5 transition-all duration-300 h-full flex flex-col justify-between relative group overflow-hidden">
                {/* Top Subtle Hover Accent Line */}
                <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-[#087fc3] via-[#0284c7] to-[#38bdf8] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                <div>
                  {/* Card Header: Step Number Badge + Icon */}
                  <div className="flex items-center justify-between mb-3.5">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#087fc3] to-[#0284c7] text-white flex items-center justify-center font-extrabold text-[12px] shadow-[0_4px_12px_rgba(8,127,195,0.3)]">
                      {phase.num}
                    </div>
                    <div className="w-9 h-9 rounded-xl bg-sky-50 text-[#087fc3] flex items-center justify-center group-hover:bg-[#087fc3] group-hover:text-white transition-colors duration-300">
                      <phase.icon size={17} strokeWidth={2.2} />
                    </div>
                  </div>

                  {/* Stage Category Pill */}
                  <span className="inline-block text-[9.5px] sm:text-[10px] font-bold tracking-[0.12em] uppercase text-[#087fc3] mb-1.5">
                    {phase.badge}
                  </span>

                  {/* Title */}
                  <h3 className="text-[15px] sm:text-[16px] text-[#0B2239] font-bold mb-2 leading-snug tracking-tight group-hover:text-[#087fc3] transition-colors">
                    {phase.title}
                  </h3>

                  {/* Description */}
                  <p className="text-[12px] text-[#52657A] leading-[1.6] font-normal">
                    {phase.desc}
                  </p>
                </div>

                {/* Card Footer: Step Progression Indicator */}
                <div className="pt-3.5 mt-4 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold text-slate-400 group-hover:text-[#087fc3] transition-colors">
                  <span>Phase {phase.num} / 05</span>
                  <ArrowRight size={13} className="transform group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Reveal>
          ))}
        </div>

      </div>
    </section>
  );
}

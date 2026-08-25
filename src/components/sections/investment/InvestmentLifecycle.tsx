"use client";

import React from "react";
import { 
  Target, 
  MapPin, 
  FileCheck2, 
  Scale, 
  CheckCircle, 
  ArrowRight 
} from "lucide-react";
import { Reveal } from "@/components/home/Reveal";

export function InvestmentLifecycle() {
  const phases = [
    {
      num: "01",
      icon: Target,
      title: "Capital & Horizon Profiling",
      desc: "We analyze your investment liquidity, holding capacity (3 to 10 years), and risk preferences to establish clear return benchmarks.",
    },
    {
      num: "02",
      icon: MapPin,
      title: "Corridor & Vector Selection",
      desc: "Identifying approved statutory sectors positioned directly along expanding expressways, ring roads, or aerotropolis corridors.",
    },
    {
      num: "03",
      icon: FileCheck2,
      title: "30-Year Revenue Scrutiny",
      desc: "Exhaustive verification of Jamabandi records, Khasra Milan, conversion orders (90A/90B), and non-encumbrance title certificates.",
    },
    {
      num: "04",
      icon: Scale,
      title: "Transparent Registry Execution",
      desc: "Direct seller alignment with zero hidden middleman fees, standard agreement drafting, and biometric Sub-Registrar execution.",
    },
    {
      num: "05",
      icon: CheckCircle,
      title: "Mutation, Demarcation & Resale",
      desc: "Expedited revenue Mutation (Dakhil Kharij), boundary stone installation, and long-term asset management or exit advisory.",
    },
  ];

  return (
    <section className="py-14 sm:py-20 bg-[var(--alabaster)]" aria-labelledby="lifecycle-heading">
      <div className="max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="max-w-3xl mx-auto text-center mb-12 sm:mb-16">
          <Reveal>
            <span className="text-[12px] font-bold tracking-[0.16em] uppercase text-[var(--ratiwal-blue)] block mb-2">
              DISCIPLINED PROCESS
            </span>

            <h2
              id="lifecycle-heading"
              className="font-instrument text-[2.4rem] sm:text-[3.2rem] md:text-[3.8rem] text-[var(--midnight)] font-normal leading-[1.05] tracking-tight mb-4"
            >
              The 5-phase land investment{" "}
              <span className="italic text-[var(--ratiwal-blue)]">lifecycle.</span>
            </h2>

            <p className="text-base sm:text-lg text-[var(--text-secondary)] leading-relaxed">
              Every parcel acquisition follows a strict, repeatable blueprint ensuring complete safety and maximum capital compounding.
            </p>
          </Reveal>
        </div>

        {/* 5-Step Process Horizontal / Stack Layout */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 sm:gap-6">
          {phases.map((phase, idx) => (
            <Reveal key={idx} delay={idx * 70}>
              <div className="p-5 sm:p-6 rounded-2xl bg-white border border-[rgba(7,26,40,0.08)] shadow-xs hover:border-[rgba(8,127,195,0.3)] hover:shadow-md transition-all duration-300 h-full flex flex-col justify-between relative group">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 rounded-xl bg-[var(--cyan-soft)] text-[var(--ratiwal-blue-deep)] flex items-center justify-center font-bold text-xs">
                      {phase.num}
                    </div>
                    <phase.icon size={18} className="text-[var(--text-secondary)] group-hover:text-[var(--ratiwal-blue)] transition-colors" />
                  </div>

                  <h3 className="font-instrument text-xl text-[var(--midnight)] font-normal mb-2 leading-snug">
                    {phase.title}
                  </h3>

                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                    {phase.desc}
                  </p>
                </div>

                <div className="pt-3 mt-3 border-t border-[rgba(7,26,40,0.04)] text-[11px] font-bold text-[var(--ratiwal-blue)]">
                  Step 0{idx + 1}
                </div>
              </div>
            </Reveal>
          ))}
        </div>

      </div>
    </section>
  );
}

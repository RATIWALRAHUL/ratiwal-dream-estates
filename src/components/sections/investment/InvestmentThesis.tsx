"use client";

import React from "react";
import { 
  Building2, 
  TrendingUp, 
  ShieldCheck, 
  Layers, 
  Clock, 
  CheckCircle2, 
  Sparkles 
} from "lucide-react";
import { Reveal } from "@/components/home/Reveal";

export function InvestmentThesis() {
  const comparisons = [
    {
      metric: "Structural Depreciation",
      land: "0% Depreciation — Pure land value compounds over decades.",
      built: "2% to 4% annual physical depreciation of constructed buildings.",
    },
    {
      metric: "Supply Scarcity",
      land: "Strictly fixed within statutory town masterplans (JDA / CIDCO).",
      built: "High vertical density increases apartment inventory endlessly.",
    },
    {
      metric: "Maintenance & Vacancy",
      land: "Negligible holding costs, zero tenant defaults or renovation bills.",
      built: "Ongoing society maintenance, tenant management, and refurbishment.",
    },
    {
      metric: "Appreciation Velocity",
      land: "Directly captures 100% of municipal infrastructure expansions.",
      built: "Gains diluted by aging construction and competition from newer towers.",
    },
  ];

  return (
    <section className="py-14 sm:py-20 bg-[var(--surface)] border-y border-[rgba(7,26,40,0.06)]" aria-labelledby="thesis-title">
      <div className="max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="max-w-3xl mx-auto text-center mb-12 sm:mb-16">
          <Reveal>
            <div className="flex items-center justify-center gap-2 mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--ratwal-blue)]" />
              <span className="text-[12px] font-bold tracking-[0.16em] uppercase text-[var(--ratwal-blue)]">
                OUR INVESTMENT THESIS
              </span>
            </div>

            <h2
              id="thesis-title"
              className="font-instrument text-[2.4rem] sm:text-[3.2rem] md:text-[3.8rem] text-[var(--midnight)] font-normal leading-[1.05] tracking-tight mb-4"
            >
              Why verified land consistently outperforms{" "}
              <span className="italic text-[var(--ratwal-blue)]">built assets.</span>
            </h2>

            <p className="text-base sm:text-lg text-[var(--text-secondary)] leading-relaxed">
              Historical real estate cycles across India confirm that land positioned along designated development vectors generates superior risk-adjusted alpha.
            </p>
          </Reveal>
        </div>

        {/* 4 Pillar Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-14">
          {[
            {
              icon: TrendingUp,
              title: "Pure Capital Compounding",
              desc: "While constructed buildings degrade with time, the underlying land captures pure economic surplus as surrounding density expands.",
            },
            {
              icon: Layers,
              title: "Fixed Statutory Supply",
              desc: "Municipal masterplans strictly enforce green belts and zoning. Sanctioned, title-clean plots remain a finite, scarce commodity.",
            },
            {
              icon: Sparkles,
              title: "Infrastructure Multiplier",
              desc: "Proximity to 6-lane expressways, airport zones, and SEZs creates step-function appreciation rather than slow linear growth.",
            },
            {
              icon: ShieldCheck,
              title: "Zero Holding Friction",
              desc: "No tenant churn, interior depreciation, or monthly maintenance drain. Your capital remains entirely productive and secure.",
            },
          ].map((item, idx) => (
            <Reveal key={idx} delay={idx * 60}>
              <div className="p-6 rounded-2xl bg-white border border-[rgba(7,26,40,0.08)] shadow-xs hover:border-[rgba(8,127,195,0.3)] hover:shadow-md transition-all duration-300 h-full flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-[var(--cyan-soft)] text-[var(--ratwal-blue-deep)] flex items-center justify-center mb-4">
                    <item.icon size={20} strokeWidth={2} />
                  </div>
                  <h3 className="font-instrument text-2xl text-[var(--midnight)] font-normal leading-snug mb-2">
                    {item.title}
                  </h3>
                  <p className="text-xs sm:text-[13px] text-[var(--text-secondary)] leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>

        {/* Comparative Institutional Analysis Table */}
        <Reveal delay={250}>
          <div className="rounded-2xl sm:rounded-3xl bg-white border border-[rgba(7,26,40,0.1)] shadow-md overflow-hidden">
            <div className="p-5 sm:p-6 bg-[var(--midnight)] text-white flex items-center justify-between">
              <div>
                <span className="text-[11px] uppercase tracking-widest font-bold text-[var(--cyan)] block mb-0.5">
                  Comparative Analysis
                </span>
                <h3 className="font-instrument text-2xl text-white font-normal">
                  Plotted Land vs. Constructed Apartments / Commercial Units
                </h3>
              </div>
              <span className="hidden sm:inline text-xs font-semibold px-3 py-1 rounded-full bg-white/10 text-white/90">
                10-Year Horizon
              </span>
            </div>

            <div className="divide-y divide-[rgba(7,26,40,0.06)]">
              {comparisons.map((row, idx) => (
                <div key={idx} className="p-5 sm:p-6 grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                  <div className="md:col-span-3 font-bold text-sm text-[var(--midnight)]">
                    {row.metric}
                  </div>
                  <div className="md:col-span-5 p-3 rounded-xl bg-[var(--mist-blue)] text-xs sm:text-sm text-[var(--ratwal-blue-deep)] font-medium">
                    <span className="font-bold block text-[11px] uppercase tracking-wider text-[var(--ratwal-blue)] mb-0.5">
                      ✓ Plotted Land Asset
                    </span>
                    {row.land}
                  </div>
                  <div className="md:col-span-4 p-3 rounded-xl bg-[var(--surface)] text-xs sm:text-sm text-[var(--text-secondary)]">
                    <span className="font-bold block text-[11px] uppercase tracking-wider text-[var(--text-secondary)] mb-0.5">
                      ✗ Built Real Estate
                    </span>
                    {row.built}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Reveal>

      </div>
    </section>
  );
}

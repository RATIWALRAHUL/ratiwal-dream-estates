"use client";

import React from "react";
import { 
  TrendingUp, 
  ShieldCheck, 
  Layers, 
  Clock, 
  CheckCircle2, 
  XCircle,
  Sparkles,
  Check
} from "lucide-react";
import { Reveal } from "@/components/home/Reveal";

export function InvestmentThesis() {
  const comparisons = [
    {
      metric: "Structural Depreciation",
      tag: "Asset Longevity",
      land: "0% Depreciation — Pure statutory land value compounds uninterrupted across market cycles and decades.",
      built: "2% to 4% annual physical depreciation of constructed buildings, requiring heavy CAPEX over time.",
    },
    {
      metric: "Supply Scarcity",
      tag: "Fixed Inventory",
      land: "Strictly fixed within statutory town masterplans (JDA / CIDCO / State Town Planning Authorities).",
      built: "High vertical FAR density increases apartment and tower inventory endlessly in surrounding pockets.",
    },
    {
      metric: "Maintenance & Holding Cost",
      tag: "Operating Friction",
      land: "Negligible holding costs with zero recurring society maintenance, tenant defaults, or structural repairs.",
      built: "Substantial monthly society CAM charges, tenant turnover vacancy, brokerage, and periodic refurbishment.",
    },
    {
      metric: "Appreciation Velocity",
      tag: "Growth Multiple",
      land: "Directly captures 100% of sovereign infrastructure expansions, ring roads, and expressway corridors.",
      built: "Capital gains diluted by aging construction quality and competition from newer high-rise projects nearby.",
    },
  ];

  return (
    <section className="py-14 sm:py-20 bg-[var(--surface)] border-y border-[rgba(7,26,40,0.06)]" aria-labelledby="thesis-title">
      <div className="max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="max-w-3xl mx-auto text-center mb-12 sm:mb-16">
          <Reveal>
            <div className="inline-flex items-center justify-center gap-1.5 px-3 py-1 rounded-full bg-[var(--advisor-ivory)] border border-[rgba(8,127,195,0.2)] shadow-2xs mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--ratiwal-blue)]" />
              <span className="text-[10px] sm:text-[11.5px] font-bold tracking-[0.14em] uppercase text-[var(--ratiwal-blue)]">
                OUR INVESTMENT THESIS
              </span>
            </div>

            <h2
              id="thesis-title"
              className="font-instrument text-[1.85rem] xs:text-[2.15rem] sm:text-[2.9rem] md:text-[3.5rem] lg:text-[3.8rem] text-[var(--midnight)] font-normal leading-[1.12] sm:leading-[1.05] tracking-tight mb-3 sm:mb-4"
            >
              Why verified land consistently outperforms{" "}
              <span className="italic text-[var(--ratiwal-blue)]">built assets.</span>
            </h2>

            <p className="text-xs sm:text-base md:text-lg text-[var(--text-secondary)] leading-relaxed max-w-2xl mx-auto font-normal sm:font-medium">
              Historical real estate cycles confirm that legally titled land positioned along designated development vectors generates superior risk-adjusted alpha.
            </p>
          </Reveal>
        </div>

        {/* 4 Pillar Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-12 sm:mb-14">
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
              <div className="p-4.5 sm:p-6 rounded-2xl bg-white border border-[rgba(7,26,40,0.08)] shadow-xs hover:border-[rgba(8,127,195,0.3)] hover:shadow-md transition-all duration-300 h-full flex flex-col justify-between group">
                <div>
                  <div className="flex items-center gap-3 sm:block sm:mb-4 mb-2.5">
                    <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-[var(--cyan-soft)] text-[var(--ratiwal-blue-deep)] flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform duration-300">
                      <item.icon size={20} strokeWidth={2} />
                    </div>
                    <h3 className="font-instrument text-[1.45rem] xs:text-[1.6rem] sm:text-2xl text-[var(--midnight)] font-normal leading-snug sm:mt-4 sm:mb-2 flex-1">
                      {item.title}
                    </h3>
                  </div>
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
          <div className="rounded-2xl sm:rounded-3xl bg-white border border-[rgba(7,26,40,0.1)] shadow-xl overflow-hidden">
            {/* Header Banner */}
            <div className="p-5 sm:p-7 bg-gradient-to-r from-[var(--midnight)] via-[#0d2a47] to-[var(--midnight)] text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-[10px] sm:text-[10.5px] uppercase tracking-widest font-bold text-[var(--cyan)] px-2.5 py-0.5 rounded-full bg-white/10 border border-white/15">
                    Institutional Breakdown
                  </span>
                  <span className="text-[11px] font-medium text-white/60 hidden xs:inline">
                    • 10-Year Growth Horizon
                  </span>
                </div>
                <h3 className="font-instrument text-xl xs:text-2xl sm:text-3xl text-white font-normal tracking-tight">
                  Plotted Land Assets <span className="text-white/60 font-sans text-base sm:text-lg font-light">vs.</span> Constructed Built Property
                </h3>
              </div>
              <div className="flex items-center gap-2 self-start sm:self-auto">
                <span className="text-[10.5px] sm:text-[11px] font-semibold px-3 py-1 rounded-full bg-[var(--ratiwal-blue)]/30 text-sky-200 border border-[var(--ratiwal-blue)]/40 flex items-center gap-1.5 shadow-2xs">
                  <Sparkles size={13} className="text-[var(--cyan)]" /> Statutory Backed Data
                </span>
              </div>
            </div>

            {/* Column Labels (Visible on Desktop) */}
            <div className="hidden md:grid md:grid-cols-12 gap-4 px-6 py-3.5 bg-slate-50 border-b border-[rgba(7,26,40,0.06)] text-[11px] font-bold uppercase tracking-wider text-slate-500">
              <div className="md:col-span-3">Comparison Metric</div>
              <div className="md:col-span-5 text-[#0369a1] flex items-center gap-1.5">
                <CheckCircle2 size={14} className="text-[#087fc3]" /> Plotted Land Assets (Clear Title)
              </div>
              <div className="md:col-span-4 text-slate-600 flex items-center gap-1.5">
                <XCircle size={14} className="text-slate-400" /> Built Real Estate (Apartments / Towers)
              </div>
            </div>

            {/* Comparison Rows */}
            <div className="divide-y divide-[rgba(7,26,40,0.06)] p-3.5 sm:p-5 md:p-0 space-y-4 md:space-y-0">
              {comparisons.map((row, idx) => (
                <div 
                  key={idx} 
                  className="p-3.5 sm:p-5 md:p-6 grid grid-cols-1 md:grid-cols-12 gap-3 sm:gap-4 md:items-stretch rounded-2xl md:rounded-none bg-slate-50/50 md:bg-transparent border md:border-none border-slate-200/80 hover:bg-slate-50/60 transition-colors"
                >
                  {/* Metric Label */}
                  <div className="md:col-span-3 flex md:flex-col justify-between md:justify-center items-start gap-1 pb-1 md:pb-0 border-b md:border-b-0 border-slate-200/60">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-[var(--midnight)] text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0">
                        {idx + 1}
                      </span>
                      <span className="font-bold text-sm sm:text-base text-[var(--midnight)] leading-snug">
                        {row.metric}
                      </span>
                    </div>
                    <span className="text-[10px] xs:text-[10.5px] font-semibold text-[var(--ratiwal-blue)] bg-sky-50 border border-sky-100 px-2 py-0.5 rounded-md self-center md:self-start md:mt-1">
                      {row.tag}
                    </span>
                  </div>

                  {/* Plotted Land Card (Winner) */}
                  <div className="md:col-span-5 p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-gradient-to-br from-[#eff8ff] via-[#f0f9ff] to-[#e0f2fe] border border-[#087fc3]/30 border-l-[4px] border-l-[#087fc3] shadow-xs flex flex-col justify-between group transition-all">
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2 pb-1.5 border-b border-[#087fc3]/15">
                        <div className="inline-flex items-center gap-1.5 text-[11px] sm:text-xs font-bold uppercase tracking-wider text-[#0369a1]">
                          <CheckCircle2 size={15} className="text-[#087fc3] flex-shrink-0" />
                          <span>Plotted Land Asset</span>
                        </div>
                        <span className="text-[9.5px] sm:text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#087fc3]/15 text-[#0369a1]">
                          Alpha Yield
                        </span>
                      </div>
                      <p className="text-xs sm:text-[13.5px] text-[#0c4a6e] font-medium leading-relaxed">
                        {row.land}
                      </p>
                    </div>
                  </div>

                  {/* Built Real Estate Card */}
                  <div className="md:col-span-4 p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-white md:bg-slate-50/90 border border-slate-200/90 border-l-[4px] border-l-slate-400 shadow-2xs flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2 pb-1.5 border-b border-slate-200">
                        <div className="inline-flex items-center gap-1.5 text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-slate-600">
                          <XCircle size={15} className="text-slate-400 flex-shrink-0" />
                          <span>Built Real Estate</span>
                        </div>
                        <span className="text-[9.5px] sm:text-[10px] font-medium uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-200/60 text-slate-500">
                          Standard
                        </span>
                      </div>
                      <p className="text-xs sm:text-[13px] text-slate-600 leading-relaxed font-normal">
                        {row.built}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Bottom Takeaway Footer */}
            <div className="p-4 sm:p-5 bg-gradient-to-r from-sky-50/80 via-blue-50/40 to-slate-50 border-t border-[rgba(7,26,40,0.08)] flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-[var(--ratiwal-blue)] text-white flex items-center justify-center flex-shrink-0">
                  <Check size={16} strokeWidth={2.5} />
                </div>
                <p className="text-xs sm:text-sm text-[var(--midnight)] font-medium">
                  <strong className="text-[var(--ratiwal-blue)]">Key Insight:</strong> 100% of sovereign infrastructure capital appreciation is captured by the ground plot.
                </p>
              </div>
              <span className="text-[10.5px] sm:text-[11px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">
                Ratiwal Institutional Standard
              </span>
            </div>
          </div>
        </Reveal>

      </div>
    </section>
  );
}

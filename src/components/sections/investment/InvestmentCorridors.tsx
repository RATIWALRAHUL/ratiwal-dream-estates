"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  Compass, 
  TrendingUp, 
  MapPin, 
  ArrowRight, 
  CheckCircle2, 
  Building2, 
  Sparkles, 
  ShieldCheck,
  Clock,
  Briefcase
} from "lucide-react";
import { Reveal } from "@/components/home/Reveal";

export function InvestmentCorridors() {
  const [activeTab, setActiveTab] = useState<number>(0);

  const corridorData = [
    {
      title: "Jaipur Ring Road 6-Lane Corridor",
      hub: "Jaipur, Rajasthan",
      cagr: "22.0%",
      cagrLabel: "Historical 5-Yr CAGR",
      badge: "Highest Capital Velocity",
      description:
        "The 47km 6-lane Ring Road has revolutionized Jaipur's connectivity, interconnecting Ajmer Road, Tonk Road, and Agra Road into a massive economic loop.",
      catalysts: [
        "Direct bypass for inter-state commercial freight traffic",
        "Designated transport terminals and commercial warehousing hubs",
        "Rapid statutory approvals under JDA planned sectors",
      ],
      idealFor: "Long-term wealth compounding & high-yield commercial land",
      horizon: "5 – 10 Years",
      targetYield: "3x – 4.5x Capital Appreciation",
    },
    {
      title: "Ajmer Road SEZ & IT Triangle",
      hub: "Jaipur, Rajasthan",
      cagr: "18.5%",
      cagrLabel: "Historical 5-Yr CAGR",
      badge: "Institutional Growth Hub",
      description:
        "Anchored by Mahindra World City (a 3,000-acre multi-product SEZ), this corridor hosts global tech leaders, universities, and premier gated residential developments.",
      catalysts: [
        "Over 50,000+ active direct white-collar jobs created in the SEZ",
        "Direct 8-lane connection to NH-48 and Delhi-Mumbai Expressway",
        "High demand for luxury plotted townships and gated communities",
      ],
      idealFor: "Family nest-egg plots, gated community villa construction",
      horizon: "3 – 7 Years",
      targetYield: "2.2x – 3.0x Capital Appreciation",
    },
    {
      title: "Navi Mumbai & Panvel (NAINA Hub)",
      hub: "Navi Mumbai, Maharashtra",
      cagr: "20.0%",
      cagrLabel: "Historical 5-Yr CAGR",
      badge: "Mega-Infrastructure Vector",
      description:
        "The convergence of the Navi Mumbai International Airport (NMIA) and Atal Setu (MTHL) has transformed Panvel and NAINA into India's most dynamic urban growth frontier.",
      catalysts: [
        "NMIA airport commercial operations and aerotropolis ecosystem",
        "20-minute direct expressway transit to South Mumbai via Atal Setu",
        "Virar-Alibaug Multi-Modal Transit Corridor integration",
      ],
      idealFor: "High-net-worth investors seeking Tier-1 metropolitan land alpha",
      horizon: "5 – 8 Years",
      targetYield: "2.5x – 3.8x Capital Appreciation",
    },
    {
      title: "Bhiwadi & NCR Logistics Axis",
      hub: "NCR / Rajasthan",
      cagr: "16.5%",
      cagrLabel: "Historical 5-Yr CAGR",
      badge: "Industrial & Freight Vector",
      description:
        "Positioned on the Delhi-Mumbai Industrial Corridor (DMIC), Bhiwadi provides strong commercial land fundamentals driven by manufacturing clusters and freight terminals.",
      catalysts: [
        "Direct proximity to Gurgaon and Southern NCR commercial belt",
        "Inland Container Depots (ICD) and automotive manufacturing hubs",
        "Lower initial land price per square yard with steady annual gains",
      ],
      idealFor: "Industrial plots, logistics facilities, and affordable land banking",
      horizon: "3 – 5 Years",
      targetYield: "1.8x – 2.4x Capital Appreciation",
    },
  ];

  return (
    <section className="py-14 sm:py-20 bg-[var(--surface)] border-t border-[rgba(7,26,40,0.06)]" id="corridors" aria-labelledby="corridor-heading">
      <div className="max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="max-w-3xl mx-auto text-center mb-12 sm:mb-16">
          <Reveal>
            <div className="inline-flex items-center justify-center gap-1.5 px-3 py-1 rounded-full bg-[var(--advisor-ivory)] border border-[rgba(8,127,195,0.2)] shadow-2xs mb-3">
              <Compass size={14} className="text-[var(--ratiwal-blue)]" />
              <span className="text-[10px] sm:text-[11.5px] font-bold tracking-[0.14em] uppercase text-[var(--ratiwal-blue)]">
                MICRO-MARKET DEEP DIVE
              </span>
            </div>

            <h2
              id="corridor-heading"
              className="font-instrument text-[1.85rem] xs:text-[2.15rem] sm:text-[2.9rem] md:text-[3.5rem] lg:text-[3.8rem] text-[var(--midnight)] font-normal leading-[1.12] sm:leading-[1.05] tracking-tight mb-3 sm:mb-4"
            >
              Strategic growth vectors analyzed by{" "}
              <span className="italic text-[var(--ratiwal-blue)]">our advisors.</span>
            </h2>

            <p className="text-xs sm:text-base md:text-lg text-[var(--text-secondary)] leading-relaxed max-w-2xl mx-auto font-normal sm:font-medium">
              We focus capital strictly in corridors with verified town planning masterplans, immediate road networks, and sustained capital inflows.
            </p>
          </Reveal>
        </div>

        {/* Corridor Tab Navigation */}
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-2.5 mb-8 sm:mb-12">
          {corridorData.map((corridor, idx) => (
            <button
              key={idx}
              onClick={() => setActiveTab(idx)}
              className={`px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all ${
                activeTab === idx
                  ? "bg-[var(--ratiwal-blue)] text-white shadow-md scale-102 sm:scale-105"
                  : "bg-white text-[var(--text-secondary)] hover:text-[var(--midnight)] hover:bg-[var(--mist-blue)] border border-[rgba(7,26,40,0.08)] shadow-2xs"
              }`}
            >
              {corridor.title.split(" ")[0]} {corridor.title.split(" ")[1]}
            </button>
          ))}
        </div>

        {/* Selected Corridor Showcase Card */}
        <Reveal key={activeTab}>
          <div className="p-5 sm:p-8 lg:p-10 rounded-2xl sm:rounded-3xl bg-white border border-[rgba(7,26,40,0.1)] shadow-xl grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-stretch">
            
            {/* Left 7 Cols: Information Panel */}
            <div className="lg:col-span-7 space-y-4 sm:space-y-5 flex flex-col justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <span className="px-3 py-1 rounded-full bg-[var(--cyan-soft)] text-[var(--ratiwal-blue-deep)] text-[11px] sm:text-xs font-bold uppercase tracking-wider">
                    {corridorData[activeTab].badge}
                  </span>
                  <span className="px-3 py-1 rounded-full bg-[var(--surface)] text-[var(--text-secondary)] text-[11px] sm:text-xs font-semibold border border-[rgba(7,26,40,0.08)] flex items-center gap-1">
                    <MapPin size={13} className="text-[var(--ratiwal-blue)]" />
                    {corridorData[activeTab].hub}
                  </span>
                </div>

                <h3 className="font-instrument text-2xl xs:text-3xl sm:text-4xl text-[var(--midnight)] font-normal leading-tight mb-3">
                  {corridorData[activeTab].title}
                </h3>

                <p className="text-xs sm:text-sm md:text-base text-[var(--text-secondary)] leading-relaxed mb-4 sm:mb-6">
                  {corridorData[activeTab].description}
                </p>

                {/* Infrastructure Catalysts */}
                <div className="space-y-2 sm:space-y-2.5 pt-3 border-t border-[rgba(7,26,40,0.06)]">
                  <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-[var(--midnight)] block mb-1">
                    Primary Economic &amp; Infrastructure Drivers:
                  </span>
                  {corridorData[activeTab].catalysts.map((cat, cIdx) => (
                    <div key={cIdx} className="flex items-start gap-2.5 text-xs sm:text-[13.5px] text-[var(--text-secondary)]">
                      <CheckCircle2 size={15} className="text-[var(--ratiwal-blue)] flex-shrink-0 mt-0.5" />
                      <span className="leading-snug">{cat}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right 5 Cols: Upgraded Corridor Performance Card */}
            <div className="lg:col-span-5 bg-gradient-to-b from-[var(--midnight)] via-[#09223a] to-[var(--midnight)] text-white p-5 sm:p-7 rounded-2xl sm:rounded-3xl border border-white/15 shadow-2xl flex flex-col justify-between space-y-4 sm:space-y-5">
              <div>
                {/* Header Badge */}
                <div className="flex items-center justify-between pb-3 mb-3 sm:mb-4 border-b border-white/10">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[var(--cyan)]" />
                    <span className="text-[10px] sm:text-[11px] uppercase tracking-widest font-bold text-[var(--cyan)]">
                      Corridor Performance
                    </span>
                  </div>
                  <span className="text-[10px] sm:text-[11px] font-semibold text-sky-200 px-2 py-0.5 rounded-full bg-white/10">
                    Statutory Track
                  </span>
                </div>

                {/* Main CAGR Display */}
                <div className="p-3.5 sm:p-4 rounded-2xl bg-white/[0.06] border border-white/10 mb-4 sm:mb-5">
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="font-instrument text-3xl xs:text-4xl sm:text-5xl text-white font-normal tracking-tight">
                      {corridorData[activeTab].cagr}
                    </span>
                    <span className="inline-flex items-center gap-1 text-[11px] sm:text-xs font-bold text-[#34d399] bg-[#20c978]/20 px-2.5 py-1 rounded-full border border-[#20c978]/30">
                      <TrendingUp size={13} />
                      CAGR
                    </span>
                  </div>
                  <p className="text-[11px] sm:text-xs text-white/70 mt-1">
                    {corridorData[activeTab].cagrLabel} across verified registry records.
                  </p>
                </div>

                {/* Structured Metric Tiles */}
                <div className="space-y-2 sm:space-y-2.5 text-xs">
                  
                  {/* Recommended Horizon */}
                  <div className="flex items-center justify-between gap-3 p-2.5 rounded-xl bg-white/[0.04] border border-white/[0.06]">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-6 h-6 rounded-md bg-white/10 flex items-center justify-center text-white/80 flex-shrink-0">
                        <Clock size={13} />
                      </div>
                      <span className="text-xs text-white/75 font-medium truncate">Recommended Horizon</span>
                    </div>
                    <span className="font-bold text-xs sm:text-[13px] text-white flex-shrink-0">
                      {corridorData[activeTab].horizon}
                    </span>
                  </div>

                  {/* Target Capital Yield */}
                  <div className="flex items-center justify-between gap-3 p-2.5 rounded-xl bg-white/[0.04] border border-white/[0.06]">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-6 h-6 rounded-md bg-[#20c978]/20 text-[#34d399] flex items-center justify-center flex-shrink-0">
                        <TrendingUp size={13} />
                      </div>
                      <span className="text-xs text-white/75 font-medium truncate">Target Capital Yield</span>
                    </div>
                    <span className="font-bold text-xs sm:text-[13px] text-[#34d399] flex-shrink-0">
                      {corridorData[activeTab].targetYield}
                    </span>
                  </div>

                  {/* Ideal Portfolio Use */}
                  <div className="p-2.5 rounded-xl bg-white/[0.04] border border-white/[0.06]">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-6 h-6 rounded-md bg-white/10 flex items-center justify-center text-white/80 flex-shrink-0">
                        <Briefcase size={13} />
                      </div>
                      <span className="text-xs text-white/75 font-medium">Ideal Portfolio Use</span>
                    </div>
                    <p className="text-xs font-semibold text-sky-100 pl-8 leading-snug">
                      {corridorData[activeTab].idealFor}
                    </p>
                  </div>

                </div>
              </div>

              {/* Action CTA Button */}
              <div className="pt-2">
                <Link
                  href="/contact"
                  className="inline-flex items-center justify-center gap-2 w-full py-3 sm:py-3.5 px-4 rounded-full bg-gradient-to-r from-[var(--ratiwal-blue)] to-[var(--ratiwal-blue-deep)] hover:brightness-110 text-white font-bold text-xs sm:text-sm shadow-md hover:shadow-lg transition-all group whitespace-nowrap"
                >
                  <span>Request Due Diligence Dossier</span>
                  <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>

          </div>
        </Reveal>

      </div>
    </section>
  );
}

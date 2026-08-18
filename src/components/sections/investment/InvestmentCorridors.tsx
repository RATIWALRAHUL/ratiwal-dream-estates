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
  ShieldCheck 
} from "lucide-react";
import { Reveal } from "@/components/home/Reveal";

export function InvestmentCorridors() {
  const [activeTab, setActiveTab] = useState<number>(0);

  const corridorData = [
    {
      title: "Jaipur Ring Road 6-Lane Corridor",
      hub: "Jaipur, Rajasthan",
      cagr: "22.0% Historical CAGR",
      badge: "Highest Capital Velocity",
      description:
        "The 47km 6-lane Ring Road has revolutionized Jaipur's connectivity, interconnecting Ajmer Road, Tonk Road, and Agra Road into a massive economic loop.",
      catalysts: [
        "Direct bypass for inter-state commercial freight traffic",
        "Designated transport terminals and commercial warehousing hubs",
        "Rapid statutory approvals under JDA planned sectors",
      ],
      idealFor: "Long-term capital wealth creation & high-yield commercial land",
      horizon: "5 – 10 Years",
      targetYield: "3x – 4.5x Capital Appreciation",
    },
    {
      title: "Ajmer Road SEZ & IT Triangle",
      hub: "Jaipur, Rajasthan",
      cagr: "18.5% Historical CAGR",
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
      targetYield: "2.2x – 3x Capital Appreciation",
    },
    {
      title: "Navi Mumbai & Panvel (NAINA Hub)",
      hub: "Navi Mumbai, Maharashtra",
      cagr: "20.0% Historical CAGR",
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
      cagr: "16.5% Historical CAGR",
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
            <div className="flex items-center justify-center gap-2 mb-3">
              <Compass size={16} className="text-[var(--ratwal-blue)]" />
              <span className="text-[12px] font-bold tracking-[0.16em] uppercase text-[var(--ratwal-blue)]">
                MICRO-MARKET DEEP DIVE
              </span>
            </div>

            <h2
              id="corridor-heading"
              className="font-instrument text-[2.4rem] sm:text-[3.2rem] md:text-[3.8rem] text-[var(--midnight)] font-normal leading-[1.05] tracking-tight mb-4"
            >
              Strategic growth vectors analyzed by{" "}
              <span className="italic text-[var(--ratwal-blue)]">our advisors.</span>
            </h2>

            <p className="text-base sm:text-lg text-[var(--text-secondary)] leading-relaxed">
              We focus capital strictly in corridors with verified town planning masterplans, immediate road networks, and sustained capital inflows.
            </p>
          </Reveal>
        </div>

        {/* Corridor Tab Navigation */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
          {corridorData.map((corridor, idx) => (
            <button
              key={idx}
              onClick={() => setActiveTab(idx)}
              className={`px-4 py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all ${
                activeTab === idx
                  ? "bg-[var(--ratwal-blue)] text-white shadow-sm scale-105"
                  : "bg-white text-[var(--text-secondary)] hover:text-[var(--midnight)] hover:bg-[var(--mist-blue)] border border-[rgba(7,26,40,0.08)]"
              }`}
            >
              {corridor.title.split(" ")[0]} {corridor.title.split(" ")[1]}
            </button>
          ))}
        </div>

        {/* Selected Corridor Showcase Card */}
        <Reveal key={activeTab}>
          <div className="p-7 sm:p-10 rounded-2xl sm:rounded-3xl bg-white border border-[rgba(7,26,40,0.1)] shadow-lg grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Left 7 Cols */}
            <div className="lg:col-span-7 space-y-5">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="px-3 py-1 rounded-full bg-[var(--cyan-soft)] text-[var(--ratwal-blue-deep)] text-xs font-bold uppercase tracking-wider">
                  {corridorData[activeTab].badge}
                </span>
                <span className="px-3 py-1 rounded-full bg-[var(--surface)] text-[var(--text-secondary)] text-xs font-semibold border border-[rgba(7,26,40,0.08)] flex items-center gap-1">
                  <MapPin size={13} className="text-[var(--ratwal-blue)]" />
                  {corridorData[activeTab].hub}
                </span>
              </div>

              <h3 className="font-instrument text-3xl sm:text-4xl text-[var(--midnight)] font-normal leading-tight">
                {corridorData[activeTab].title}
              </h3>

              <p className="text-sm sm:text-base text-[var(--text-secondary)] leading-relaxed">
                {corridorData[activeTab].description}
              </p>

              {/* Infrastructure Catalysts */}
              <div className="space-y-2.5 pt-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[var(--midnight)] block">
                  Primary Economic &amp; Infrastructure Drivers:
                </span>
                {corridorData[activeTab].catalysts.map((cat, cIdx) => (
                  <div key={cIdx} className="flex items-start gap-2.5 text-xs sm:text-sm text-[var(--text-secondary)]">
                    <CheckCircle2 size={16} className="text-[var(--ratwal-blue)] flex-shrink-0 mt-0.5" />
                    <span>{cat}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right 5 Cols: Investment Metric Box */}
            <div className="lg:col-span-5 bg-[var(--midnight)] text-white p-6 sm:p-8 rounded-2xl border border-white/10 shadow-xl space-y-4">
              <div>
                <span className="text-[11px] uppercase tracking-widest font-bold text-[var(--cyan)] block mb-1">
                  Corridor Performance
                </span>
                <div className="font-instrument text-3xl sm:text-4xl text-white font-normal leading-tight">
                  {corridorData[activeTab].cagr}
                </div>
              </div>

              <div className="space-y-2.5 pt-3 border-t border-white/10 text-xs">
                <div className="flex justify-between py-1 border-b border-white/5">
                  <span className="text-white/70">Recommended Horizon:</span>
                  <span className="font-bold text-white">{corridorData[activeTab].horizon}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-white/5">
                  <span className="text-white/70">Target Capital Yield:</span>
                  <span className="font-bold text-[#20c978]">{corridorData[activeTab].targetYield}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-white/70">Ideal Portfolio Use:</span>
                  <span className="font-bold text-white text-right max-w-[200px]">{corridorData[activeTab].idealFor}</span>
                </div>
              </div>

              <div className="pt-3">
                <Link
                  href="/contact"
                  className="inline-flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl bg-[var(--ratwal-blue)] hover:bg-[var(--ratwal-blue-deep)] text-white font-bold text-xs shadow-md transition-all"
                >
                  <span>Request Due Diligence Dossier</span>
                  <ArrowRight size={14} />
                </Link>
              </div>
            </div>

          </div>
        </Reveal>

      </div>
    </section>
  );
}

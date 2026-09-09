"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  Calculator, 
  TrendingUp, 
  ArrowRight, 
  Sparkles, 
  MapPin, 
  Clock, 
  ShieldCheck, 
  CheckCircle2,
  Coins,
  Percent,
  Compass
} from "lucide-react";
import { Reveal } from "@/components/home/Reveal";
import { MagneticButton } from "@/components/home/MagneticButton";
import { formatCurrency } from "@/lib/propertyFormatters";

interface CorridorOption {
  id: string;
  name: string;
  location: string;
  cagr: number;
  catalysts: string[];
}

const corridors: CorridorOption[] = [
  {
    id: "jaipur-ring-road",
    name: "Jaipur Ring Road Expressway Belt",
    location: "Jaipur, Rajasthan",
    cagr: 22.0,
    catalysts: [
      "Completion of Phase 1 & 2 6-Lane Expressway",
      "High-speed logistics & commercial warehousing nodes",
      "Massive outward economic spillover from central Jaipur",
    ],
  },
  {
    id: "jaipur-ajmer-road",
    name: "Ajmer Road SEZ & IT Corridor",
    location: "Jaipur, Rajasthan",
    cagr: 18.5,
    catalysts: [
      "Mahindra World City (3,000+ Acre Mega SEZ) job expansion",
      "Direct NH-48 connectivity to Delhi-Mumbai Expressway",
      "Rapidly developing luxury plotted gated communities",
    ],
  },
  {
    id: "navi-mumbai-panvel",
    name: "Navi Mumbai Airport & NAINA Hub",
    location: "Navi Mumbai / Panvel",
    cagr: 20.0,
    catalysts: [
      "Navi Mumbai International Airport (NMIA) operationalization",
      "Atal Setu (MTHL) 20-minute connectivity to South Mumbai",
      "Virar-Alibaug Multi-Modal Corridor infrastructure",
    ],
  },
  {
    id: "bhiwadi-ncr",
    name: "Bhiwadi & NCR Logistics Axis",
    location: "Rajasthan / NCR",
    cagr: 16.5,
    catalysts: [
      "Delhi-Mumbai Industrial Corridor (DMIC) freight hubs",
      "High industrial demand for worker residential plots",
      "Lower entry price point with steady capital growth",
    ],
  },
];

export function InvestmentCalculator() {
  const [capital, setCapital] = useState<number>(2500000); // 25 Lakhs default
  const [horizon, setHorizon] = useState<number>(5); // 5 Years default
  const [selectedCorridorId, setSelectedCorridorId] = useState<string>("jaipur-ring-road");

  const currentCorridor = corridors.find((c) => c.id === selectedCorridorId) || corridors[0];

  // Compound return formula: A = P * (1 + r)^t
  const rate = currentCorridor.cagr / 100;
  const futureValue = Math.round(capital * Math.pow(1 + rate, horizon));
  const capitalGain = futureValue - capital;
  const multiplier = (futureValue / capital).toFixed(2);

  const quickAmounts = [
    { label: "₹15 L", value: 1500000 },
    { label: "₹25 L", value: 2500000 },
    { label: "₹50 L", value: 5000000 },
    { label: "₹1 Cr", value: 10000000 },
    { label: "₹2.5 Cr", value: 25000000 },
  ];

  return (
    <section className="py-14 sm:py-20 bg-[var(--alabaster)] relative overflow-hidden" id="calculator" aria-labelledby="calc-title">
      <div className="max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="max-w-3xl mx-auto text-center mb-12 sm:mb-16">
          <Reveal>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--advisor-ivory)] border border-[rgba(8,127,195,0.2)] shadow-2xs mb-3">
              <Calculator size={14} className="text-[var(--ratiwal-blue)]" />
              <span className="text-[10px] sm:text-[11.5px] font-bold tracking-[0.14em] uppercase text-[var(--ratiwal-blue)]">
                INTERACTIVE ROI MODELING
              </span>
            </div>

            <h2
              id="calc-title"
              className="font-instrument text-[1.85rem] xs:text-[2.15rem] sm:text-[2.9rem] md:text-[3.5rem] lg:text-[3.8rem] text-[var(--midnight)] font-normal leading-[1.12] sm:leading-[1.05] tracking-tight mb-3 sm:mb-4"
            >
              Model your projected{" "}
              <span className="italic text-[var(--ratiwal-blue)]">land appreciation.</span>
            </h2>

            <p className="text-xs sm:text-base md:text-lg text-[var(--text-secondary)] leading-relaxed max-w-2xl mx-auto font-normal sm:font-medium">
              Based on historical corridor velocity, planned infrastructure execution, and municipal land zoning trends.
            </p>
          </Reveal>
        </div>

        {/* Calculator Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-stretch">
          
          {/* Controls Panel (Left 7 Cols) */}
          <div className="lg:col-span-7 bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-7 md:p-8 border border-[rgba(7,26,40,0.1)] shadow-md flex flex-col justify-between space-y-6 sm:space-y-7">
            
            {/* Input 1: Capital Amount */}
            <div>
              <div className="flex flex-wrap items-baseline justify-between gap-2 mb-2.5">
                <label htmlFor="capital-slider" className="text-xs font-bold uppercase tracking-wider text-[var(--midnight)] flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-[var(--midnight)] text-white text-[10px] font-bold flex items-center justify-center">1</span>
                  Initial Investment Capital
                </label>
                <span className="font-instrument text-2xl sm:text-3xl text-[var(--ratiwal-blue-deep)] font-normal">
                  {formatCurrency(capital)}
                </span>
              </div>

              {/* Range Slider */}
              <input
                id="capital-slider"
                type="range"
                min={1000000}
                max={50000000}
                step={500000}
                value={capital}
                onChange={(e) => setCapital(Number(e.target.value))}
                className="w-full h-2.5 bg-[var(--mist-blue)] rounded-lg appearance-none cursor-pointer accent-[var(--ratiwal-blue)] mb-3"
              />

              {/* Quick Preset Buttons */}
              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                {quickAmounts.map((q, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setCapital(q.value)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      capital === q.value
                        ? "bg-[var(--ratiwal-blue)] text-white shadow-xs font-bold"
                        : "bg-[var(--surface)] text-[var(--text-secondary)] hover:bg-[var(--mist-blue)] border border-[rgba(7,26,40,0.06)]"
                    }`}
                  >
                    {q.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Input 2: Investment Horizon */}
            <div>
              <div className="flex flex-wrap items-baseline justify-between gap-2 mb-2.5">
                <label className="text-xs font-bold uppercase tracking-wider text-[var(--midnight)] flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-[var(--midnight)] text-white text-[10px] font-bold flex items-center justify-center">2</span>
                  Holding Period Horizon
                </label>
                <span className="font-instrument text-2xl sm:text-3xl text-[var(--ratiwal-blue-deep)] font-normal">
                  {horizon} Years
                </span>
              </div>

              <div className="grid grid-cols-4 gap-2 sm:gap-2.5">
                {[3, 5, 7, 10].map((years) => (
                  <button
                    key={years}
                    type="button"
                    onClick={() => setHorizon(years)}
                    className={`py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                      horizon === years
                        ? "bg-[var(--ratiwal-blue)] text-white shadow-sm ring-2 ring-[var(--ratiwal-blue)]/20"
                        : "bg-[var(--surface)] text-[var(--text-secondary)] hover:bg-[var(--mist-blue)] border border-[rgba(7,26,40,0.06)]"
                    }`}
                  >
                    {years} Years
                  </button>
                ))}
              </div>
            </div>

            {/* Input 3: Strategic Growth Vector */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-[var(--midnight)] flex items-center gap-1.5 mb-3">
                <span className="w-5 h-5 rounded-full bg-[var(--midnight)] text-white text-[10px] font-bold flex items-center justify-center">3</span>
                Select Target Growth Vector
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
                {corridors.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setSelectedCorridorId(c.id)}
                    className={`p-3 sm:p-3.5 rounded-xl text-left border transition-all ${
                      selectedCorridorId === c.id
                        ? "bg-gradient-to-br from-[#eff8ff] to-[#e1f0fb] border-[var(--ratiwal-blue)] shadow-xs ring-1 ring-[var(--ratiwal-blue)]/30"
                        : "bg-[var(--surface)] border-[rgba(7,26,40,0.06)] hover:border-[rgba(8,127,195,0.25)] hover:bg-slate-50/70"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] sm:text-[11px] font-bold text-[var(--ratiwal-blue)] uppercase tracking-wider">
                        {c.cagr}% Historical CAGR
                      </span>
                    </div>
                    <div className="text-xs sm:text-[13px] font-bold text-[var(--midnight)] leading-snug">
                      {c.name}
                    </div>
                    <div className="text-[11px] text-[var(--text-secondary)] mt-0.5 flex items-center gap-1">
                      <MapPin size={11} className="text-slate-400 flex-shrink-0" />
                      <span>{c.location}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

          </div>

          {/* Projection Results Card (Right 5 Cols) */}
          <div className="lg:col-span-5 bg-gradient-to-b from-[var(--midnight)] via-[#0b2138] to-[var(--midnight)] text-white rounded-2xl sm:rounded-3xl p-5 sm:p-7 md:p-8 border border-white/15 shadow-2xl flex flex-col justify-between h-full">
            <div>
              {/* Card Header */}
              <div className="flex items-center justify-between pb-3.5 mb-4 sm:mb-5 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[var(--cyan)] animate-pulse" />
                  <span className="text-[11px] sm:text-[11.5px] uppercase tracking-widest font-bold text-[var(--cyan)]">
                    Projected Wealth Matrix
                  </span>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-white/10 text-[10.5px] sm:text-[11px] font-semibold text-white/90 border border-white/15">
                  {horizon}-Yr Horizon
                </span>
              </div>

              {/* Main Estimated Value */}
              <div className="mb-5 sm:mb-6">
                <span className="text-[11.5px] sm:text-xs text-white/70 block mb-1">
                  Estimated Asset Valuation at Year {horizon}
                </span>
                <div className="font-instrument text-3xl xs:text-4xl sm:text-5xl text-white font-normal leading-tight tracking-tight">
                  {formatCurrency(futureValue)}
                </div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#20c978]/20 border border-[#20c978]/30 text-[#34d399] text-[11px] sm:text-xs font-bold mt-2.5">
                  <TrendingUp size={13} />
                  <span>+{formatCurrency(capitalGain)} Estimated Capital Gain ({multiplier}x)</span>
                </div>
              </div>

              {/* Modern Breakdown Details (Upgraded & Fully Responsive) */}
              <div className="space-y-2 sm:space-y-2.5 p-3.5 sm:p-4 rounded-2xl bg-white/[0.06] border border-white/10 backdrop-blur-xs mb-5 sm:mb-6">
                
                {/* Initial Capital */}
                <div className="flex items-center justify-between gap-3 p-2 rounded-xl bg-white/[0.04] border border-white/[0.06]">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-6 h-6 rounded-md bg-white/10 flex items-center justify-center text-white/80 flex-shrink-0">
                      <Coins size={13} />
                    </div>
                    <span className="text-xs text-white/75 font-medium truncate">Initial Capital</span>
                  </div>
                  <span className="font-bold text-xs sm:text-sm text-white flex-shrink-0">
                    {formatCurrency(capital)}
                  </span>
                </div>

                {/* Selected Corridor */}
                <div className="flex flex-col xs:flex-row xs:items-center justify-between gap-1 xs:gap-3 p-2 rounded-xl bg-white/[0.04] border border-white/[0.06]">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-6 h-6 rounded-md bg-white/10 flex items-center justify-center text-white/80 flex-shrink-0">
                      <Compass size={13} />
                    </div>
                    <span className="text-xs text-white/75 font-medium flex-shrink-0">Selected Corridor</span>
                  </div>
                  <span className="font-bold text-xs sm:text-[13px] text-sky-200 text-left xs:text-right pl-8 xs:pl-0 truncate" title={currentCorridor.name}>
                    {currentCorridor.name}
                  </span>
                </div>

                {/* Assumed CAGR Benchmark */}
                <div className="flex items-center justify-between gap-3 p-2 rounded-xl bg-white/[0.04] border border-white/[0.06]">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-6 h-6 rounded-md bg-[var(--cyan)]/20 text-[var(--cyan)] flex items-center justify-center flex-shrink-0">
                      <Percent size={13} />
                    </div>
                    <span className="text-xs text-white/75 font-medium truncate">Assumed CAGR Benchmark</span>
                  </div>
                  <span className="font-bold text-xs sm:text-sm text-[var(--cyan)] bg-[var(--cyan)]/15 border border-[var(--cyan)]/30 px-2.5 py-0.5 rounded-md flex-shrink-0">
                    {currentCorridor.cagr}% p.a.
                  </span>
                </div>

              </div>

              {/* Infrastructure Catalysts */}
              <div className="mb-5 sm:mb-6">
                <span className="text-[10.5px] uppercase tracking-wider font-bold text-white/60 block mb-2">
                  Key Corridor Catalysts:
                </span>
                <ul className="space-y-1.5 text-xs text-white/85">
                  {currentCorridor.catalysts.map((cat, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <CheckCircle2 size={13} className="text-[var(--cyan)] flex-shrink-0 mt-0.5" />
                      <span className="leading-snug">{cat}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Action CTA */}
            <div className="pt-4 border-t border-white/10">
              <MagneticButton strength={6} className="w-full">
                <Link
                  href={`/contact?budget=${encodeURIComponent(formatCurrency(capital))}&location=${encodeURIComponent(currentCorridor.location.split(",")[0])}`}
                  className="inline-flex items-center justify-center gap-2.5 w-full py-3.5 px-5 rounded-full bg-gradient-to-r from-[var(--ratiwal-blue)] to-[var(--ratiwal-blue-deep)] hover:brightness-110 text-white font-bold text-xs sm:text-sm tracking-wide shadow-md hover:shadow-lg transition-all group whitespace-nowrap"
                >
                  <span>Explore Matching Plots</span>
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform flex-shrink-0 text-white" />
                </Link>
              </MagneticButton>
              <p className="text-[10.5px] text-white/50 text-center mt-2.5">
                Projections are indicative models based on historical micro-market data.
              </p>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}

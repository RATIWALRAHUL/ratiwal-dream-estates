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
  CheckCircle2 
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
      "High-speed logistics and commercial warehousing nodes",
      "Massive outward spillover from central Jaipur",
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
    { label: "₹15 Lakhs", value: 1500000 },
    { label: "₹25 Lakhs", value: 2500000 },
    { label: "₹50 Lakhs", value: 5000000 },
    { label: "₹1 Crore", value: 10000000 },
    { label: "₹2.5 Crores", value: 25000000 },
  ];

  return (
    <section className="py-14 sm:py-20 bg-[var(--alabaster)] relative overflow-hidden" id="calculator" aria-labelledby="calc-title">
      <div className="max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="max-w-3xl mx-auto text-center mb-12 sm:mb-16">
          <Reveal>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--advisor-ivory)] border border-[rgba(8,127,195,0.2)] mb-3">
              <Calculator size={15} className="text-[var(--ratwal-blue)]" />
              <span className="text-[11.5px] font-bold tracking-[0.16em] uppercase text-[var(--ratwal-blue)]">
                INTERACTIVE ROI MODELING
              </span>
            </div>

            <h2
              id="calc-title"
              className="font-instrument text-[2.4rem] sm:text-[3.2rem] md:text-[3.8rem] text-[var(--midnight)] font-normal leading-[1.05] tracking-tight mb-4"
            >
              Model your projected{" "}
              <span className="italic text-[var(--ratwal-blue)]">land appreciation.</span>
            </h2>

            <p className="text-base sm:text-lg text-[var(--text-secondary)] leading-relaxed">
              Based on historical corridor velocity, planned infrastructure execution, and municipal land zoning trends.
            </p>
          </Reveal>
        </div>

        {/* Calculator Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Controls Panel (Left 7 Cols) */}
          <div className="lg:col-span-7 bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-[rgba(7,26,40,0.1)] shadow-md space-y-7">
            
            {/* Input 1: Capital Amount */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="capital-slider" className="text-xs font-bold uppercase tracking-wider text-[var(--midnight)]">
                  1. Initial Investment Capital
                </label>
                <span className="font-instrument text-2xl sm:text-3xl text-[var(--ratwal-blue-deep)] font-normal">
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
                className="w-full h-2.5 bg-[var(--mist-blue)] rounded-lg appearance-none cursor-pointer accent-[var(--ratwal-blue)] mb-3"
              />

              {/* Quick Preset Buttons */}
              <div className="flex flex-wrap gap-2">
                {quickAmounts.map((q, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setCapital(q.value)}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                      capital === q.value
                        ? "bg-[var(--ratwal-blue)] text-white shadow-xs"
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
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold uppercase tracking-wider text-[var(--midnight)]">
                  2. Investment Holding Period
                </label>
                <span className="font-instrument text-2xl sm:text-3xl text-[var(--ratwal-blue-deep)] font-normal">
                  {horizon} Years
                </span>
              </div>

              <div className="grid grid-cols-4 gap-2.5">
                {[3, 5, 7, 10].map((years) => (
                  <button
                    key={years}
                    type="button"
                    onClick={() => setHorizon(years)}
                    className={`py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                      horizon === years
                        ? "bg-[var(--ratwal-blue)] text-white shadow-sm"
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
              <label className="text-xs font-bold uppercase tracking-wider text-[var(--midnight)] block mb-3">
                3. Select Target Growth Vector
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {corridors.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setSelectedCorridorId(c.id)}
                    className={`p-3.5 rounded-xl text-left border transition-all ${
                      selectedCorridorId === c.id
                        ? "bg-[var(--mist-blue)] border-[var(--ratwal-blue)] shadow-xs"
                        : "bg-[var(--surface)] border-[rgba(7,26,40,0.06)] hover:border-[rgba(8,127,195,0.2)]"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[11px] font-bold text-[var(--ratwal-blue)] uppercase">
                        {c.cagr}% Historical CAGR
                      </span>
                    </div>
                    <div className="text-xs sm:text-[13px] font-bold text-[var(--midnight)] leading-snug">
                      {c.name}
                    </div>
                    <div className="text-[11px] text-[var(--text-secondary)] mt-0.5">
                      {c.location}
                    </div>
                  </button>
                ))}
              </div>
            </div>

          </div>

          {/* Projection Results Card (Right 5 Cols) */}
          <div className="lg:col-span-5 bg-[var(--midnight)] text-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-white/10 shadow-xl flex flex-col justify-between h-full">
            <div>
              <div className="flex items-center justify-between pb-4 mb-5 border-b border-white/10">
                <span className="text-[11.5px] uppercase tracking-widest font-bold text-[var(--cyan)]">
                  Projected Wealth Matrix
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-white/10 text-[11px] font-semibold text-white/90">
                  {horizon}-Yr Horizon
                </span>
              </div>

              {/* Main Estimated Value */}
              <div className="mb-6">
                <span className="text-xs text-white/70 block mb-1">
                  Estimated Asset Valuation at Year {horizon}
                </span>
                <div className="font-instrument text-4xl sm:text-5xl text-white font-normal leading-tight tracking-tight">
                  {formatCurrency(futureValue)}
                </div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#20c978]/20 text-[#20c978] text-xs font-bold mt-2">
                  <TrendingUp size={14} />
                  <span>+{formatCurrency(capitalGain)} Estimated Capital Gain ({multiplier}x)</span>
                </div>
              </div>

              {/* Breakdown Details */}
              <div className="space-y-3 p-4 rounded-xl bg-white/5 border border-white/10 text-xs mb-6">
                <div className="flex justify-between text-white/80">
                  <span>Initial Capital:</span>
                  <span className="font-bold text-white">{formatCurrency(capital)}</span>
                </div>
                <div className="flex justify-between text-white/80">
                  <span>Selected Corridor:</span>
                  <span className="font-bold text-white">{currentCorridor.name}</span>
                </div>
                <div className="flex justify-between text-white/80">
                  <span>Assumed CAGR Benchmark:</span>
                  <span className="font-bold text-[var(--cyan)]">{currentCorridor.cagr}% p.a.</span>
                </div>
              </div>

              {/* Infrastructure Catalysts */}
              <div className="mb-6">
                <span className="text-[11px] uppercase tracking-wider font-bold text-white/60 block mb-2">
                  Key Corridor Catalysts:
                </span>
                <ul className="space-y-2 text-xs text-white/80">
                  {currentCorridor.catalysts.map((cat, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <CheckCircle2 size={14} className="text-[var(--cyan)] flex-shrink-0 mt-0.5" />
                      <span>{cat}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Action CTA */}
            <div className="pt-5 border-t border-white/10">
              <MagneticButton strength={6} className="w-full">
                <Link
                  href={`/contact?budget=${encodeURIComponent(formatCurrency(capital))}&location=${encodeURIComponent(currentCorridor.location.split(",")[0])}`}
                  className="inline-flex items-center justify-center gap-2 w-full py-3.5 px-6 rounded-full bg-[var(--ratwal-blue)] hover:bg-[var(--ratwal-blue-deep)] text-white font-bold text-xs sm:text-sm shadow-md transition-all"
                >
                  <span>Request Vetted Plots in This Budget</span>
                  <ArrowRight size={16} />
                </Link>
              </MagneticButton>
              <p className="text-[11px] text-white/50 text-center mt-2.5">
                Projections are indicative models based on historical micro-market data.
              </p>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}

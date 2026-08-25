"use client";

import React from "react";
import { 
  ShieldAlert, 
  ShieldCheck, 
  FileCheck2, 
  Scale, 
  Compass, 
  AlertTriangle, 
  CheckCircle2 
} from "lucide-react";
import { Reveal } from "@/components/home/Reveal";

export function InvestmentRiskMitigation() {
  const risks = [
    {
      riskTitle: "Title & Ownership Disputes",
      riskDescription: "Hidden co-sharer claims, ancestral inheritance litigation, or forged power of attorney deeds.",
      ratiwalShield: "30-Year Revenue Search across Tehsil & Sub-Registrar archives, Jamabandi, and Khasra non-encumbrance audit.",
      icon: FileCheck2,
    },
    {
      riskTitle: "Zoning & Masterplan Violations",
      riskDescription: "Agricultural land sold without statutory conversion (Section 90A/90B) or plots falling inside reserved green belts.",
      ratiwalShield: "Statutory validation of town planning masterplan (JDA / CIDCO / RERA) and municipal clearance orders.",
      icon: Compass,
    },
    {
      riskTitle: "Speculative Price Bubbles",
      riskDescription: "Unregulated broker cartels inflating land prices with fictitious future infrastructure claims.",
      ratiwalShield: "Real-time DLC / Circle rate parity analysis and historical registry transaction benchmarking.",
      icon: Scale,
    },
    {
      riskTitle: "Liquidity & Access Road Stagnation",
      riskDescription: "Buying interior land without dedicated statutory road rights-of-way, rendering resale impossible.",
      ratiwalShield: "Strict filter: Only acquiring plots with minimum 40ft/60ft sector road frontage and physical demarcation.",
      icon: ShieldCheck,
    },
  ];

  return (
    <section className="py-14 sm:py-20 bg-[var(--midnight)] text-white relative overflow-hidden" aria-labelledby="risk-heading">
      <div className="max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header */}
        <div className="max-w-3xl mx-auto text-center mb-12 sm:mb-16">
          <Reveal>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-[11.5px] font-bold uppercase tracking-widest text-[var(--cyan)] mb-3">
              <ShieldCheck size={14} />
              THE RATIWAL RISK SHIELD
            </div>

            <h2
              id="risk-heading"
              className="font-instrument text-[2.4rem] sm:text-[3.2rem] md:text-[3.8rem] text-white font-normal leading-[1.05] tracking-tight mb-4"
            >
              How we protect your capital from{" "}
              <span className="italic text-[var(--cyan)]">market pitfalls.</span>
            </h2>

            <p className="text-base sm:text-lg text-white/75 leading-relaxed">
              We reject high-risk land aggressively. Every investment recommendation must pass our 4-pillar fiduciary risk shield.
            </p>
          </Reveal>
        </div>

        {/* 4 Risk & Shield Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
          {risks.map((item, idx) => (
            <Reveal key={idx} delay={idx * 75}>
              <div className="p-6 sm:p-8 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md hover:border-white/20 transition-all duration-300 h-full flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 rounded-xl bg-[var(--ratiwal-blue)]/30 text-[var(--cyan)] flex items-center justify-center">
                      <item.icon size={20} />
                    </div>
                    <span className="text-[11px] uppercase tracking-wider font-bold text-white/50">
                      Safeguard 0{idx + 1}
                    </span>
                  </div>

                  <h3 className="font-instrument text-2xl text-white font-normal mb-3">
                    {item.riskTitle}
                  </h3>

                  {/* The Market Risk */}
                  <div className="p-3 rounded-xl bg-white/5 border border-white/5 text-xs text-white/70 mb-4">
                    <span className="text-[11px] uppercase font-bold text-red-400 block mb-1">
                      ⚠️ Industry Vulnerability:
                    </span>
                    {item.riskDescription}
                  </div>

                  {/* The Ratiwal Shield */}
                  <div className="p-3.5 rounded-xl bg-[var(--ratiwal-blue)]/20 border border-[var(--cyan)]/30 text-xs sm:text-[13px] text-white">
                    <span className="text-[11px] uppercase font-bold text-[var(--cyan)] flex items-center gap-1.5 mb-1">
                      <ShieldCheck size={14} />
                      The Ratiwal Shield:
                    </span>
                    {item.ratiwalShield}
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>

      </div>
    </section>
  );
}

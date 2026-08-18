"use client";

import React, { useState } from "react";
import { 
  FileCheck2, 
  Building2, 
  MapPin, 
  TrendingUp, 
  Scale, 
  CheckCircle, 
  ShieldAlert, 
  ShieldCheck,
  ChevronRight
} from "lucide-react";
import { Reveal } from "@/components/home/Reveal";

export function AboutVerificationProtocol() {
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    {
      num: "01",
      icon: FileCheck2,
      title: "30-Year Title & Revenue Search",
      short: "Deep registry & revenue check",
      details: [
        "Tracing continuous ownership records across 30 years in local Tehsil & Sub-Registrar archives.",
        "Examination of Jamabandi, Khasra Milan, Girdawari, and non-encumbrance certificate (NEC).",
        "Verification of clear succession, partition deeds, or registered sale deeds with zero pending legal notices.",
      ],
      tag: "Title Due Diligence",
    },
    {
      num: "02",
      icon: Building2,
      title: "Statutory & Masterplan Compliance",
      short: "JDA / CIDCO / RERA zoning audit",
      details: [
        "Validating conversion orders (e.g. Section 90A / 90B in Rajasthan) from agricultural to residential/commercial use.",
        "Cross-referencing master development plans (Jaipur Master Plan 2025/2031, CIDCO NAINA masterplans).",
        "Confirming sanctioned layout plans, green belt non-interference, and road widening reservations.",
      ],
      tag: "Regulatory Clearances",
    },
    {
      num: "03",
      icon: MapPin,
      title: "Physical GPS & Boundary Demarcation",
      short: "On-ground site inspection",
      details: [
        "Physical inspection with Total Station GPS coordinates matching the sanctioned scheme map.",
        "Verifying distinct corner boundary markers and road access widths (e.g. 40ft, 60ft, 100ft sectoral roads).",
        "Strict on-ground verification ensuring zero illegal encroachments or disputed neighboring borders.",
      ],
      tag: "Physical Audit",
    },
    {
      num: "04",
      icon: TrendingUp,
      title: "Growth Vector & Micro-Market Analysis",
      short: "Long-term appreciation modeling",
      details: [
        "Analyzing proximity to major infrastructure drivers (Ring Road, Delhi-Mumbai Expressway, Panvel Airport).",
        "Assessing immediate utility availability: water supply lines, electrical grid access, and sewerage planning.",
        "Evaluating historical appreciation trends to ensure fair capital valuation.",
      ],
      tag: "Investment Viability",
    },
    {
      num: "05",
      icon: Scale,
      title: "Transparent Agreement & Price Security",
      short: "Zero hidden charges",
      details: [
        "Drafting clear, standardized Agreement to Sell with clear timelines and token refund clauses if applicable.",
        "Complete breakdown of Government Circle Rates (DLC / Stamp Duty Rates) versus actual registry valuation.",
        "Direct alignment with verified titleholders—no arbitrary middleman markups.",
      ],
      tag: "Transactional Security",
    },
    {
      num: "06",
      icon: CheckCircle,
      title: "Registry, Mutation & Lifelong Support",
      short: "Dakhil Kharij & post-purchase",
      details: [
        "End-to-end facilitation at the Sub-Registrar's office for deed execution and biometric registration.",
        "Expedited filing and follow-up for official revenue Mutation (Namantran / Dakhil Kharij).",
        "Continuous advisory for boundary fencing, architectural planning, or eventual asset monetization.",
      ],
      tag: "Possession & Mutation",
    },
  ];

  return (
    <section className="py-14 sm:py-20 bg-[var(--alabaster)] relative overflow-hidden" aria-labelledby="protocol-title">
      <div className="max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center mb-12 sm:mb-16">
          <Reveal>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--advisor-ivory)] border border-[rgba(8,127,195,0.2)] mb-3">
              <ShieldCheck size={15} className="text-[var(--ratwal-blue)]" />
              <span className="text-[11.5px] font-bold tracking-[0.16em] uppercase text-[var(--ratwal-blue)]">
                OUR 6-STAGE VERIFICATION PROTOCOL
              </span>
            </div>

            <h2
              id="protocol-title"
              className="font-instrument text-[2.4rem] sm:text-[3.2rem] md:text-[3.8rem] text-[var(--midnight)] font-normal leading-[1.05] tracking-tight mb-4"
            >
              How we verify every parcel before{" "}
              <span className="italic text-[var(--ratwal-blue)]">you invest.</span>
            </h2>

            <p className="text-base sm:text-lg text-[var(--text-secondary)] leading-relaxed">
              We reject over 65% of evaluated properties because they fail our rigorous 6-stage legal, physical, or masterplan due diligence.
            </p>
          </Reveal>
        </div>

        {/* Interactive Desktop Grid & Steps */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Step Selector List (Left Column) */}
          <div className="lg:col-span-5 space-y-2.5">
            {steps.map((step, idx) => {
              const isCurrent = activeStep === idx;
              return (
                <button
                  key={idx}
                  onClick={() => setActiveStep(idx)}
                  className={`w-full text-left p-4 rounded-xl transition-all duration-300 flex items-center justify-between border ${
                    isCurrent
                      ? "bg-white border-[var(--ratwal-blue)] shadow-md translate-x-1"
                      : "bg-white/60 hover:bg-white border-[rgba(7,26,40,0.06)] hover:border-[rgba(8,127,195,0.2)]"
                  }`}
                  aria-pressed={isCurrent}
                >
                  <div className="flex items-center gap-3.5">
                    <div
                      className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold text-xs transition-colors ${
                        isCurrent
                          ? "bg-[var(--ratwal-blue)] text-white"
                          : "bg-[var(--cyan-soft)] text-[var(--ratwal-blue)]"
                      }`}
                    >
                      {step.num}
                    </div>
                    <div>
                      <div className="text-[14px] font-bold text-[var(--midnight)]">
                        {step.title}
                      </div>
                      <div className="text-[12px] text-[var(--text-secondary)]">
                        {step.short}
                      </div>
                    </div>
                  </div>
                  <ChevronRight
                    size={18}
                    className={`transition-transform duration-300 ${
                      isCurrent
                        ? "text-[var(--ratwal-blue)] translate-x-1"
                        : "text-[var(--text-secondary)] opacity-40"
                    }`}
                  />
                </button>
              );
            })}
          </div>

          {/* Detailed Stage Card Showcase (Right Column) */}
          <div className="lg:col-span-7">
            <div className="p-6 sm:p-8 rounded-2xl sm:rounded-3xl bg-white border border-[rgba(7,26,40,0.1)] shadow-xl relative overflow-hidden min-h-[380px] flex flex-col justify-between">
              {/* Background Watermark Number */}
              <span className="absolute -right-4 -bottom-8 font-instrument text-[12rem] text-[rgba(8,127,195,0.04)] select-none pointer-events-none font-bold">
                {steps[activeStep].num}
              </span>

              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-[var(--cyan-soft)] text-[var(--ratwal-blue-deep)] text-xs font-bold uppercase tracking-wider">
                    Stage {steps[activeStep].num} &bull; {steps[activeStep].tag}
                  </span>
                  <div className="w-10 h-10 rounded-xl bg-[var(--mist-blue)] text-[var(--ratwal-blue)] flex items-center justify-center">
                    {React.createElement(steps[activeStep].icon, { size: 20 })}
                  </div>
                </div>

                <h3 className="font-instrument text-2xl sm:text-3xl text-[var(--midnight)] font-normal leading-snug mb-5">
                  {steps[activeStep].title}
                </h3>

                <div className="space-y-3.5 mb-6">
                  {steps[activeStep].details.map((detail, dIdx) => (
                    <div key={dIdx} className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full bg-[rgba(8,127,195,0.12)] text-[var(--ratwal-blue)] flex items-center justify-center flex-shrink-0 mt-0.5">
                        <CheckCircle size={13} strokeWidth={2.5} />
                      </div>
                      <p className="text-sm sm:text-base text-[var(--text-secondary)] leading-relaxed">
                        {detail}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Assurance Guarantee Footer */}
              <div className="pt-4 border-t border-[rgba(7,26,40,0.08)] flex items-center justify-between text-xs text-[var(--midnight)] font-medium">
                <span className="flex items-center gap-1.5 text-[var(--ratwal-blue-deep)] font-semibold">
                  <ShieldCheck size={15} />
                  Ratiwal Due Diligence Standard
                </span>
                <span className="text-[var(--text-secondary)]">
                  Step {activeStep + 1} of {steps.length}
                </span>
              </div>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}

"use client";

import React, { useState } from "react";
import { Check, Info, ShieldCheck, Sparkles } from "lucide-react";
import { Reveal } from "@/components/home/Reveal";
import { whyChooseUsData } from "@/data/whyChooseUsData";
import { cn } from "@/lib/utils";

export function VerificationTimeline() {
  const { verificationProtocol } = whyChooseUsData;
  const [activeStep, setActiveStep] = useState(0);

  return (
    <section
      className="py-16 sm:py-24 bg-[var(--alabaster)] border-b border-[rgba(7,26,40,0.08)]"
      aria-labelledby="verification-timeline-title"
    >
      <div className="max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start">
          
          {/* Left Column: Sticky Section Overview (5 of 12 cols) */}
          <div className="lg:col-span-5 lg:sticky lg:top-28">
            <Reveal>
              <div className="flex items-center gap-2 mb-3">
                <ShieldCheck size={16} className="text-[var(--ratwal-blue)]" />
                <span className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--ratwal-blue)]">
                  {verificationProtocol.eyebrow}
                </span>
              </div>

              <h2
                id="verification-timeline-title"
                className="font-instrument text-3xl sm:text-4xl md:text-5xl text-[var(--midnight)] font-normal leading-[1.08] tracking-tight mb-5"
              >
                A structured approach to{" "}
                <span className="italic text-[var(--ratwal-blue)] font-normal">
                  property verification.
                </span>
              </h2>

              <p className="text-sm sm:text-base text-[var(--text-secondary)] leading-relaxed font-normal mb-8">
                {verificationProtocol.lead}
              </p>

              {/* Legal Disclosure Callout */}
              <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[rgba(7,26,40,0.1)] shadow-2xs mb-6">
                <div className="flex items-start gap-2.5">
                  <Info size={16} className="text-[var(--ratwal-blue)] flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                    <span className="font-bold text-[var(--midnight)]">Important Legal Note:</span>{" "}
                    {verificationProtocol.disclaimer}
                  </p>
                </div>
              </div>

              {/* Progress summary badge */}
              <div className="hidden lg:flex items-center gap-3 p-3 rounded-xl bg-[var(--surface)] border border-[rgba(7,26,40,0.06)]">
                <Sparkles size={16} className="text-[var(--ratwal-blue)]" />
                <span className="text-xs font-bold text-[var(--midnight)]">
                  Step {activeStep + 1} of {verificationProtocol.steps.length}: {verificationProtocol.steps[activeStep].title}
                </span>
              </div>
            </Reveal>
          </div>

          {/* Right Column: 6-Step Vertical Timeline (7 of 12 cols) */}
          <div className="lg:col-span-7 space-y-6 relative">
            {verificationProtocol.steps.map((step, idx) => {
              const isSelected = activeStep === idx;

              return (
                <Reveal key={step.stepNumber} delay={idx * 80}>
                  <div
                    onClick={() => setActiveStep(idx)}
                    className={cn(
                      "p-6 sm:p-7 rounded-2xl sm:rounded-3xl border transition-all duration-300 cursor-pointer text-left",
                      isSelected
                        ? "bg-white border-[var(--ratwal-blue)] shadow-md ring-1 ring-[var(--ratwal-blue)]/20"
                        : "bg-white/80 hover:bg-white border-[rgba(7,26,40,0.08)] hover:border-[rgba(7,26,40,0.16)] shadow-xs"
                    )}
                  >
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div className="flex items-center gap-3">
                        <span
                          className={cn(
                            "font-mono text-xs font-bold px-2.5 py-1 rounded-lg transition-colors",
                            isSelected
                              ? "bg-[var(--ratwal-blue)] text-white"
                              : "bg-[var(--surface)] text-[var(--text-secondary)]"
                          )}
                        >
                          STAGE {step.stepNumber}
                        </span>
                        <h3 className="font-instrument text-xl sm:text-2xl text-[var(--midnight)] font-normal">
                          {step.title}
                        </h3>
                      </div>
                    </div>

                    <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed mb-4">
                      {step.shortDesc}
                    </p>

                    {/* Expandable Detail Bullets */}
                    <ul className="space-y-2 mb-4 pt-2 border-t border-[rgba(7,26,40,0.06)]">
                      {step.details.map((detail, dIdx) => (
                        <li key={dIdx} className="flex items-start gap-2 text-xs text-[var(--midnight)]">
                          <span className="w-4 h-4 rounded-full bg-[var(--mist-blue)] text-[var(--ratwal-blue)] flex items-center justify-center flex-shrink-0 mt-0.5">
                            <Check size={10} className="stroke-[3]" />
                          </span>
                          <span className="leading-relaxed">{detail}</span>
                        </li>
                      ))}
                    </ul>

                    {/* Key Stage Outcome Pill */}
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[var(--surface)] text-[11px] font-semibold text-[var(--midnight)] border border-[rgba(7,26,40,0.06)]">
                      <span className="w-1.5 h-1.5 rounded-full bg-[var(--ratwal-blue)]" />
                      <span>Outcome: {step.keyOutcome}</span>
                    </div>
                  </div>
                </Reveal>
              );
            })}
          </div>

        </div>

      </div>
    </section>
  );
}

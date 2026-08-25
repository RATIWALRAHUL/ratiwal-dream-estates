"use client";

import React from "react";
import { Check, Dot, HelpCircle } from "lucide-react";
import { Reveal } from "@/components/home/Reveal";
import { whyChooseUsData } from "@/data/whyChooseUsData";

export function AdvisoryComparison() {
  const { comparison } = whyChooseUsData;

  return (
    <section
      className="py-16 sm:py-24 bg-white border-b border-[rgba(7,26,40,0.08)]"
      aria-labelledby="comparison-title"
    >
      <div className="max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="max-w-3xl mb-12 sm:mb-16">
          <Reveal>
            <span className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--ratiwal-blue)] block mb-2">
              METHODOLOGY COMPARISON
            </span>
            <h2
              id="comparison-title"
              className="font-instrument text-3xl sm:text-4xl md:text-5xl text-[var(--midnight)] font-normal leading-tight tracking-tight mb-4"
            >
              The difference structured guidance makes.
            </h2>
            <p className="text-sm sm:text-base text-[var(--text-secondary)] leading-relaxed font-normal">
              A balanced look at traditional unorganized property hunting versus our verification-first advisory model.
            </p>
          </Reveal>
        </div>

        {/* 2-Column Comparison Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10">
          
          {/* Column 1: Unstructured Search (Ivory Surface) */}
          <Reveal delay={100}>
            <div className="p-7 sm:p-9 rounded-2xl sm:rounded-3xl bg-[var(--surface)] border border-[rgba(7,26,40,0.08)] h-full flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-4 pb-4 border-b border-[rgba(7,26,40,0.06)]">
                  <HelpCircle size={18} className="text-[var(--text-secondary)]" />
                  <h3 className="font-instrument text-2xl sm:text-3xl text-[var(--midnight)] font-normal">
                    Unstructured Property Search
                  </h3>
                </div>

                <ul className="space-y-4">
                  {comparison.map((c, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
                      <Dot size={20} className="text-[var(--text-secondary)] flex-shrink-0 -mt-1" />
                      <span>{c.unstructured}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-6 mt-6 border-t border-[rgba(7,26,40,0.06)] text-[11px] text-[var(--text-secondary)] font-medium">
                Higher ambiguity &amp; time investment required from buyer
              </div>
            </div>
          </Reveal>

          {/* Column 2: Ratiwal Advisory Approach (Midnight Surface with Cyan Accent) */}
          <Reveal delay={200}>
            <div className="p-7 sm:p-9 rounded-2xl sm:rounded-3xl bg-[var(--midnight)] text-white border border-[var(--cyan)]/30 shadow-xl h-full flex flex-col justify-between relative overflow-hidden">
              {/* Subtle Ambient Cyan Glow */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--cyan)]/10 blur-3xl pointer-events-none" />

              <div className="relative z-10">
                <div className="flex items-center justify-between gap-3 mb-4 pb-4 border-b border-white/10">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[var(--cyan)]" />
                    <h3 className="font-instrument text-2xl sm:text-3xl text-white font-normal">
                      The Ratiwal Advisory Approach
                    </h3>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-[var(--cyan)]/15 border border-[var(--cyan)]/30 text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-[var(--cyan)]">
                    Verification-First
                  </span>
                </div>

                <ul className="space-y-4">
                  {comparison.map((c, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-xs sm:text-sm text-white/90 leading-relaxed">
                      <span className="w-4 h-4 rounded-full bg-[var(--ratiwal-blue)] text-white flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Check size={10} className="stroke-[3]" />
                      </span>
                      <span>{c.ratiwalApproach}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="relative z-10 pt-6 mt-6 border-t border-white/10 text-[11px] text-[var(--cyan)] font-medium flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--cyan)]" />
                <span>Buyer retains total decision control with complete documentation clarity</span>
              </div>
            </div>
          </Reveal>

        </div>

      </div>
    </section>
  );
}

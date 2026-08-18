"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle, Sparkles } from "lucide-react";
import { Reveal } from "@/components/home/Reveal";
import { whyChooseUsData } from "@/data/whyChooseUsData";

export function FinalConsultationCTA() {
  const { finalCta } = whyChooseUsData;

  return (
    <section className="py-20 sm:py-28 bg-[var(--alabaster)]" aria-labelledby="final-cta-title">
      <div className="max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-8">
        <Reveal>
          <div className="relative rounded-3xl bg-[var(--midnight)] text-white p-8 sm:p-14 md:p-20 overflow-hidden shadow-2xl border border-[rgba(255,255,255,0.1)] text-center">
            
            {/* Ambient Background Glows */}
            <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-[var(--ratwal-blue)]/20 blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -right-24 w-96 h-96 rounded-full bg-[var(--cyan)]/15 blur-3xl pointer-events-none" />

            <div className="relative z-10 max-w-3xl mx-auto">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/15 text-[var(--cyan)] text-xs font-bold uppercase tracking-wider mb-6">
                <Sparkles size={14} />
                <span>{finalCta.eyebrow}</span>
              </div>

              <h2
                id="final-cta-title"
                className="font-instrument text-3xl sm:text-5xl md:text-6xl text-white font-normal leading-[1.06] tracking-tight mb-6"
              >
                {finalCta.headline}
              </h2>

              <p className="text-sm sm:text-base md:text-lg text-white/80 leading-relaxed font-normal mb-8 max-w-2xl mx-auto">
                {finalCta.supportingText}
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
                <Link
                  href={finalCta.primaryCta.href}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-full bg-[var(--ratwal-blue)] hover:bg-[var(--ratwal-blue-deep)] text-white text-sm font-bold shadow-lg shadow-[rgba(8,127,195,0.4)] transition-all duration-300 group hover:scale-105"
                >
                  <span>{finalCta.primaryCta.label}</span>
                  <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                </Link>

                <Link
                  href={finalCta.secondaryCta.href}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-4 rounded-full bg-white/10 hover:bg-white/15 text-white border border-white/20 text-sm font-bold transition-colors"
                >
                  <span>{finalCta.secondaryCta.label}</span>
                </Link>
              </div>

              {/* Microcopy Guarantee */}
              <div className="flex items-center justify-center gap-2 text-xs text-white/60">
                <CheckCircle size={14} className="text-[var(--cyan)]" />
                <span>{finalCta.microcopy}</span>
              </div>
            </div>

          </div>
        </Reveal>
      </div>
    </section>
  );
}

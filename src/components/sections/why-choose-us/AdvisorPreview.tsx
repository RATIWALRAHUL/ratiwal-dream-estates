"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, Check, ShieldCheck, UserCheck } from "lucide-react";
import { Reveal } from "@/components/home/Reveal";
import { whyChooseUsData } from "@/data/whyChooseUsData";

export function AdvisorPreview() {
  const { advisorSection } = whyChooseUsData;

  return (
    <section
      className="py-16 sm:py-24 bg-[var(--alabaster)] border-b border-[rgba(7,26,40,0.08)]"
      aria-labelledby="advisor-preview-title"
    >
      <div className="max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-8">
        
        <Reveal>
          <div className="p-8 sm:p-12 md:p-16 rounded-2xl sm:rounded-3xl bg-white border border-[rgba(7,26,40,0.1)] shadow-sm">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
              
              {/* Left Column: Advisory Council Statement (7 cols) */}
              <div className="lg:col-span-7">
                <div className="flex items-center gap-2 mb-3">
                  <UserCheck size={16} className="text-[var(--ratiwal-blue)]" />
                  <span className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--ratiwal-blue)]">
                    {advisorSection.eyebrow}
                  </span>
                </div>

                <h2
                  id="advisor-preview-title"
                  className="font-instrument text-3xl sm:text-4xl md:text-5xl text-[var(--midnight)] font-normal leading-tight tracking-tight mb-4"
                >
                  {advisorSection.headline}
                </h2>

                <p className="text-sm sm:text-base text-[var(--text-secondary)] leading-relaxed font-normal mb-6">
                  {advisorSection.description}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
                  {advisorSection.pillars.map((pillar, pIdx) => (
                    <div key={pIdx} className="flex items-start gap-2 text-xs sm:text-[13px] text-[var(--midnight)] font-medium">
                      <span className="w-4 h-4 rounded-full bg-[var(--mist-blue)] text-[var(--ratiwal-blue)] flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Check size={10} className="stroke-[3]" />
                      </span>
                      <span>{pillar}</span>
                    </div>
                  ))}
                </div>

                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-full bg-[var(--ratiwal-blue)] hover:bg-[var(--ratiwal-blue-deep)] text-white text-sm font-bold shadow-md shadow-[rgba(8,127,195,0.25)] transition-all duration-300 group"
                >
                  <span>Talk to an Advisor</span>
                  <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" />
                </Link>
              </div>

              {/* Right Column: Advisory Integrity Plaque (5 cols) */}
              <div className="lg:col-span-5">
                <div className="p-7 sm:p-8 rounded-2xl bg-[var(--surface)] border border-[rgba(7,26,40,0.08)] shadow-2xs">
                  <div className="flex items-center gap-2 mb-4">
                    <ShieldCheck size={18} className="text-[var(--ratiwal-blue)]" />
                    <span className="font-instrument text-xl sm:text-2xl text-[var(--midnight)] font-normal">
                      {advisorSection.councilTitle}
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed font-normal mb-6">
                    “Our consultancy model is built on one simple standard: treating every client’s capital with the same caution, title scrutiny, and integrity as our own.”
                  </p>

                  <div className="pt-4 border-t border-[rgba(7,26,40,0.08)] flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-[var(--midnight)] block">Jaipur Advisory Office</span>
                      <span className="text-[11px] text-[var(--text-secondary)]">Rajasthan &amp; Maharashtra Corridors</span>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 text-[10px] font-bold uppercase tracking-wider border border-emerald-200">
                      Consultation Active
                    </span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </Reveal>

      </div>
    </section>
  );
}

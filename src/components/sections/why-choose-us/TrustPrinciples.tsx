"use client";

import React from "react";
import { Compass, MessageSquareCheck, ShieldCheck } from "lucide-react";
import { Reveal } from "@/components/home/Reveal";
import { whyChooseUsData } from "@/data/whyChooseUsData";

export function TrustPrinciples() {
  const { principles } = whyChooseUsData;

  const renderIcon = (iconName: string) => {
    switch (iconName) {
      case "shield":
        return <ShieldCheck className="w-5 h-5 text-[var(--ratwal-blue)]" />;
      case "message":
        return <MessageSquareCheck className="w-5 h-5 text-[var(--ratwal-blue)]" />;
      case "compass":
      default:
        return <Compass className="w-5 h-5 text-[var(--ratwal-blue)]" />;
    }
  };

  return (
    <section
      className="py-14 sm:py-20 bg-white border-b border-[rgba(7,26,40,0.08)]"
      aria-labelledby="principles-title"
    >
      <div className="max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Heading */}
        <div className="max-w-3xl mb-12 sm:mb-16">
          <Reveal>
            <span className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--ratwal-blue)] block mb-2">
              FOUNDATIONAL STANDARDS
            </span>
            <h2
              id="principles-title"
              className="font-instrument text-3xl sm:text-4xl md:text-5xl text-[var(--midnight)] font-normal leading-tight tracking-tight"
            >
              Three principles that guide every recommendation.
            </h2>
          </Reveal>
        </div>

        {/* 3-Column Editorial Grid with Thin Dividers */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12 relative">
          {principles.map((principle, idx) => (
            <Reveal key={idx} delay={idx * 150}>
              <div className="p-6 sm:p-8 rounded-2xl bg-[var(--surface)] border border-[rgba(7,26,40,0.08)] h-full flex flex-col justify-between hover:border-[var(--ratwal-blue)]/40 hover:shadow-sm transition-all duration-300 group">
                <div>
                  <div className="flex items-center justify-between gap-4 mb-6">
                    <div className="w-11 h-11 rounded-xl bg-white text-[var(--ratwal-blue)] flex items-center justify-center shadow-xs group-hover:bg-[var(--ratwal-blue)] group-hover:text-white transition-colors duration-300">
                      {renderIcon(principle.iconName)}
                    </div>
                    <span className="font-mono text-xs font-bold text-[var(--text-secondary)] px-2.5 py-1 rounded-full bg-white border border-[rgba(7,26,40,0.06)]">
                      {principle.number}
                    </span>
                  </div>

                  <h3 className="font-instrument text-2xl sm:text-[1.7rem] text-[var(--midnight)] font-normal leading-snug mb-3.5">
                    {principle.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed font-normal">
                    {principle.description}
                  </p>
                </div>

                <div className="pt-6 mt-6 border-t border-[rgba(7,26,40,0.06)] flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--ratwal-blue)]" />
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">
                    Non-negotiable protocol
                  </span>
                </div>
              </div>
            </Reveal>
          ))}
        </div>

      </div>
    </section>
  );
}

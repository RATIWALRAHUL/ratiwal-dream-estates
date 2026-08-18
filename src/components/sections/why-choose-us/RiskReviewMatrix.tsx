"use client";

import React, { useState } from "react";
import { ChevronDown, Info, ShieldCheck } from "lucide-react";
import { Reveal } from "@/components/home/Reveal";
import { whyChooseUsData } from "@/data/whyChooseUsData";
import { cn } from "@/lib/utils";

export function RiskReviewMatrix() {
  const { riskMatrix } = whyChooseUsData;
  const [expandedRow, setExpandedRow] = useState<string | null>("risk-ownership");

  const toggleRow = (id: string) => {
    setExpandedRow((prev) => (prev === id ? null : id));
  };

  return (
    <section
      className="py-16 sm:py-24 bg-[var(--alabaster)] border-b border-[rgba(7,26,40,0.08)]"
      aria-labelledby="risk-matrix-title"
    >
      <div className="max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="max-w-3xl mb-12 sm:mb-16">
          <Reveal>
            <div className="flex items-center gap-2 mb-2">
              <ShieldCheck size={16} className="text-[var(--ratwal-blue)]" />
              <span className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--ratwal-blue)]">
                {riskMatrix.eyebrow}
              </span>
            </div>
            <h2
              id="risk-matrix-title"
              className="font-instrument text-3xl sm:text-4xl md:text-5xl text-[var(--midnight)] font-normal leading-tight tracking-tight mb-4"
            >
              {riskMatrix.headline}
            </h2>
            <p className="text-sm sm:text-base text-[var(--text-secondary)] leading-relaxed font-normal">
              {riskMatrix.lead}
            </p>
          </Reveal>
        </div>

        {/* 10-Row Expandable Matrix */}
        <div className="space-y-3.5 mb-10">
          {riskMatrix.rows.map((row, idx) => {
            const isExpanded = expandedRow === row.id;

            return (
              <Reveal key={row.id} delay={idx * 30}>
                <div
                  className={cn(
                    "rounded-2xl border transition-all duration-200 overflow-hidden",
                    isExpanded
                      ? "bg-white border-[var(--ratwal-blue)]/50 shadow-sm"
                      : "bg-white/80 hover:bg-white border-[rgba(7,26,40,0.08)]"
                  )}
                >
                  {/* Row Trigger (Min 44px touch target) */}
                  <button
                    type="button"
                    onClick={() => toggleRow(row.id)}
                    aria-expanded={isExpanded}
                    aria-controls={`risk-details-${row.id}`}
                    className="w-full min-h-[56px] p-4 sm:p-5 flex items-center justify-between gap-4 text-left focus-visible:outline"
                  >
                    <div className="flex flex-wrap items-center gap-3 sm:gap-4 overflow-hidden">
                      <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-[var(--surface)] text-[var(--text-secondary)] border border-[rgba(7,26,40,0.06)]">
                        {String(idx + 1).padStart(2, "0")}
                      </span>

                      <span className="px-2.5 py-0.5 rounded-full bg-[var(--mist-blue)] text-[var(--ratwal-blue-deep)] text-[11px] font-bold uppercase tracking-wider">
                        {row.categoryBadge}
                      </span>

                      <h3 className="font-instrument text-xl sm:text-2xl text-[var(--midnight)] font-normal truncate">
                        {row.area}
                      </h3>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-[11px] font-bold text-[var(--ratwal-blue)] hidden sm:inline">
                        {isExpanded ? "Hide Details" : "View Checklist"}
                      </span>
                      <ChevronDown
                        size={18}
                        className={cn(
                          "text-[var(--ratwal-blue)] transition-transform duration-200",
                          isExpanded && "rotate-180"
                        )}
                      />
                    </div>
                  </button>

                  {/* Expanded Content Panel */}
                  {isExpanded && (
                    <div
                      id={`risk-details-${row.id}`}
                      className="px-4 sm:px-6 pb-6 pt-2 border-t border-[rgba(7,26,40,0.06)] bg-[var(--surface)]/50"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 pt-3">
                        {/* Questions Considered (6 cols) */}
                        <div className="md:col-span-6 space-y-1.5">
                          <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-secondary)] block">
                            Questions Considered
                          </span>
                          <p className="text-xs sm:text-sm text-[var(--midnight)] leading-relaxed font-medium">
                            {row.questions}
                          </p>
                        </div>

                        {/* Buyer Output & Diligence Items (6 cols) */}
                        <div className="md:col-span-6 space-y-2">
                          <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--ratwal-blue)] block">
                            Information Provided to Buyer
                          </span>
                          <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
                            {row.buyerOutput}
                          </p>

                          <div className="pt-2">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)] block mb-1">
                              Typical Documents Checked:
                            </span>
                            <div className="flex flex-wrap gap-1.5">
                              {row.typicalDiligenceItems.map((item, iIdx) => (
                                <span
                                  key={iIdx}
                                  className="px-2 py-1 rounded-md bg-white border border-[rgba(7,26,40,0.06)] text-[11px] text-[var(--midnight)] font-medium"
                                >
                                  {item}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </Reveal>
            );
          })}
        </div>

        {/* Non-Elimination Disclaimer Callout */}
        <Reveal delay={300}>
          <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[rgba(7,26,40,0.1)] text-xs text-[var(--text-secondary)] leading-relaxed">
            <div className="flex items-start gap-2.5">
              <Info size={16} className="text-[var(--ratwal-blue)] flex-shrink-0 mt-0.5" />
              <p>
                <span className="font-bold text-[var(--midnight)]">Market Transparency Note:</span>{" "}
                {riskMatrix.disclaimer}
              </p>
            </div>
          </div>
        </Reveal>

      </div>
    </section>
  );
}

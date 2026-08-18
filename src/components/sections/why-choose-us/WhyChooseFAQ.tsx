"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ChevronDown, HelpCircle } from "lucide-react";
import { Reveal } from "@/components/home/Reveal";
import { whyChooseUsData } from "@/data/whyChooseUsData";
import { cn } from "@/lib/utils";

export function WhyChooseFAQ() {
  const { faqs } = whyChooseUsData;
  const [openFaq, setOpenFaq] = useState<string | null>("faq-shortlist");

  const toggleFaq = (id: string) => {
    setOpenFaq((prev) => (prev === id ? null : id));
  };

  return (
    <section
      className="py-16 sm:py-24 bg-white border-b border-[rgba(7,26,40,0.08)]"
      aria-labelledby="why-faq-title"
    >
      <div className="max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="max-w-3xl mb-12 sm:mb-16">
          <Reveal>
            <div className="flex items-center gap-2 mb-2">
              <HelpCircle size={16} className="text-[var(--ratwal-blue)]" />
              <span className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--ratwal-blue)]">
                FREQUENTLY ASKED QUESTIONS
              </span>
            </div>
            <h2
              id="why-faq-title"
              className="font-instrument text-3xl sm:text-4xl md:text-5xl text-[var(--midnight)] font-normal leading-tight tracking-tight mb-4"
            >
              Clear answers to common questions.
            </h2>
            <p className="text-sm sm:text-base text-[var(--text-secondary)] leading-relaxed font-normal">
              Understand our advisory practices, document intake, and client representation standards.
            </p>
          </Reveal>
        </div>

        {/* 8-Accordion FAQ Stack */}
        <div className="max-w-4xl space-y-3.5">
          {faqs.map((faq, idx) => {
            const isOpen = openFaq === faq.id;

            return (
              <Reveal key={faq.id} delay={idx * 30}>
                <div
                  className={cn(
                    "rounded-2xl border transition-all duration-200 overflow-hidden",
                    isOpen
                      ? "bg-[var(--surface)] border-[var(--ratwal-blue)]/50 shadow-2xs"
                      : "bg-white hover:bg-[var(--surface)]/50 border-[rgba(7,26,40,0.08)]"
                  )}
                >
                  <button
                    type="button"
                    onClick={() => toggleFaq(faq.id)}
                    aria-expanded={isOpen}
                    aria-controls={`faq-answer-${faq.id}`}
                    className="w-full min-h-[56px] p-5 sm:p-6 text-left flex items-center justify-between gap-4 font-semibold text-sm sm:text-base text-[var(--midnight)] hover:text-[var(--ratwal-blue)] transition-colors focus-visible:outline"
                  >
                    <span className="font-instrument text-xl sm:text-2xl font-normal leading-snug">
                      {faq.question}
                    </span>
                    <ChevronDown
                      className={cn(
                        "w-5 h-5 text-[var(--ratwal-blue)] flex-shrink-0 transition-transform duration-300",
                        isOpen && "rotate-180"
                      )}
                    />
                  </button>

                  {isOpen && (
                    <div
                      id={`faq-answer-${faq.id}`}
                      className="px-5 sm:px-6 pb-6 pt-1 text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed border-t border-[rgba(7,26,40,0.06)]"
                    >
                      <p className="mb-2">{faq.answer}</p>
                      {faq.relatedLink && (
                        <div className="pt-2">
                          <Link
                            href={faq.relatedLink.href}
                            className="inline-flex items-center gap-1.5 font-bold text-xs text-[var(--ratwal-blue)] hover:text-[var(--ratwal-blue-deep)] underline transition-colors"
                          >
                            <span>{faq.relatedLink.label}</span>
                            <span>→</span>
                          </Link>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </Reveal>
            );
          })}
        </div>

      </div>
    </section>
  );
}

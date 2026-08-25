"use client";

import React, { useState } from "react";
import { ChevronDown, HelpCircle, ShieldCheck } from "lucide-react";
import { Reveal } from "@/components/home/Reveal";

export function ContactFAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      q: "Is there any consultation fee for meeting with a property advisor?",
      a: "No. Our initial 1-on-1 consultations, portfolio requirement reviews, and title diligence briefs are completely complimentary. We operate as fiduciary advisors dedicated to building lifelong client relationships.",
    },
    {
      q: "How do you verify the legal title of a land parcel before recommending a site visit?",
      a: "Every land asset on our roster undergoes an exhaustive 6-stage verification protocol. This includes 30-year revenue record searches at local Tehsils (Jamabandi, Khasra, Patta history), JDA/CIDCO/RERA statutory compliance checks, and on-ground GPS boundary demarcation.",
    },
    {
      q: "Can you arrange transportation for on-ground site visits in Jaipur?",
      a: "Yes. For scheduled site visits, our advisory team can arrange private accompanied transportation from your hotel or Jaipur city center. An advisor will accompany you to inspect boundary markers, road widths, and connectivity.",
    },
    {
      q: "How does Ratiwal Dream Estates support clients after the purchase is finalized?",
      a: "Our advisory relationship continues long after registry. We actively assist you with official revenue Mutation (Dakhil Kharij / Namantran), municipal tax registration, plot boundary fencing, and future monetization or construction planning.",
    },
    {
      q: "How do you assist NRI and outstation investors who cannot travel immediately?",
      a: "We provide comprehensive remote advisory dossiers including high-resolution video site surveys, satellite GIS overlays, legal deed scans, and verified circle rate analyses. When you decide to proceed, we assist with secure Power of Attorney (PoA) and biometric registry logistics.",
    },
  ];

  return (
    <section className="py-14 sm:py-20 bg-[var(--surface)] border-t border-[rgba(7,26,40,0.06)]" aria-labelledby="faq-title">
      <div className="max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="max-w-3xl mx-auto text-center mb-12 sm:mb-16">
          <Reveal>
            <div className="flex items-center justify-center gap-2 mb-3">
              <HelpCircle size={16} className="text-[var(--ratiwal-blue)]" />
              <span className="text-[12px] font-bold tracking-[0.16em] uppercase text-[var(--ratiwal-blue)]">
                FREQUENTLY ASKED QUESTIONS
              </span>
            </div>

            <h2
              id="faq-title"
              className="font-instrument text-[2.4rem] sm:text-[3.2rem] md:text-[3.8rem] text-[var(--midnight)] font-normal leading-[1.05] tracking-tight mb-4"
            >
              Everything you need to know about{" "}
              <span className="italic text-[var(--ratiwal-blue)]">consulting with us.</span>
            </h2>

            <p className="text-base sm:text-lg text-[var(--text-secondary)] leading-relaxed">
              Clear answers to common questions about our advisory process, site visits, and legal due diligence.
            </p>
          </Reveal>
        </div>

        {/* FAQ Accordion List */}
        <div className="max-w-3xl mx-auto space-y-3.5">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <Reveal key={idx} delay={idx * 50}>
                <div className="rounded-2xl bg-white border border-[rgba(7,26,40,0.08)] shadow-xs overflow-hidden transition-all duration-300">
                  <button
                    onClick={() => setOpenIndex(isOpen ? null : idx)}
                    className="w-full p-5 sm:p-6 text-left flex items-center justify-between gap-4 font-semibold text-sm sm:text-base text-[var(--midnight)] hover:text-[var(--ratiwal-blue)] transition-colors"
                    aria-expanded={isOpen}
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      size={18}
                      className={`text-[var(--ratiwal-blue)] flex-shrink-0 transition-transform duration-300 ${
                        isOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {isOpen && (
                    <div className="px-5 sm:px-6 pb-5 sm:pb-6 text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed border-t border-[rgba(7,26,40,0.04)] pt-3 animate-fadeIn">
                      <p>{faq.a}</p>
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

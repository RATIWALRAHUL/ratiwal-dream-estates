"use client";

import { useState } from "react";
import { ChevronDown, HelpCircle } from "lucide-react";
import { FAQItem } from "@/types/location";

interface LocationFAQProps {
  faq: FAQItem[];
  locationName: string;
}

export function LocationFAQ({ faq, locationName }: LocationFAQProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleItem = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="py-16 md:py-24 bg-[#F5F1E9] border-b border-[rgba(7,26,40,0.08)]" aria-labelledby="location-faq-heading">
      <div className="max-w-[1000px] w-[calc(100%-48px)] mx-auto">
        {/* Header */}
        <div className="text-center max-w-[650px] mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[rgba(7,132,200,0.08)] border border-[rgba(7,132,200,0.2)] text-[#0784C8] text-xs font-bold uppercase tracking-wider mb-3">
            <HelpCircle className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Frequently Asked Questions</span>
          </div>
          <h2
            id="location-faq-heading"
            className="font-heading text-3xl sm:text-4xl text-[#031C2B] font-normal tracking-tight mb-3"
          >
            Questions about {locationName} real estate.
          </h2>
          <p className="text-sm text-[#4a6171]">
            Clear, honest answers regarding statutory approvals, micro-markets, and documentation in {locationName}.
          </p>
        </div>

        {/* Accordion Stack */}
        <div className="space-y-4">
          {faq.map((item, index) => {
            const isOpen = openIndex === index;
            const buttonId = `faq-btn-${index}`;
            const regionId = `faq-content-${index}`;

            return (
              <div
                key={index}
                className="rounded-2xl bg-white border border-[rgba(7,26,40,0.1)] overflow-hidden shadow-sm transition-all"
              >
                <button
                  type="button"
                  id={buttonId}
                  aria-expanded={isOpen}
                  aria-controls={regionId}
                  onClick={() => toggleItem(index)}
                  className="w-full p-6 text-left flex items-center justify-between gap-4 font-heading text-lg sm:text-xl text-[#031C2B] hover:text-[#0784C8] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#0784C8]"
                >
                  <span>{item.question}</span>
                  <ChevronDown
                    className={`w-5 h-5 text-[#0784C8] flex-shrink-0 transition-transform duration-300 ${
                      isOpen ? "rotate-180" : ""
                    }`}
                    aria-hidden="true"
                  />
                </button>

                {isOpen && (
                  <div
                    id={regionId}
                    role="region"
                    aria-labelledby={buttonId}
                    className="px-6 pb-6 pt-1 text-sm text-[#4a6171] leading-relaxed border-t border-[rgba(7,26,40,0.06)] animate-in fade-in duration-200"
                  >
                    {item.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

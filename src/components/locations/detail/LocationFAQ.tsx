"use client";

import { useState } from "react";
import { ChevronDown, MessageCircle } from "lucide-react";
import { FAQItem } from "@/types/location";
import { generateWhatsAppUrl } from "@/lib/whatsapp";

interface LocationFAQProps {
  faq: FAQItem[];
  locationName: string;
}

export function LocationFAQ({ faq, locationName }: LocationFAQProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleItem = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const whatsappUrl = generateWhatsAppUrl({
    type: "location",
    locationName,
  });

  if (!faq || faq.length === 0) {
    return null;
  }

  return (
    <section
      className="py-16 sm:py-24 bg-white border-b border-[rgba(7,26,40,0.06)]"
      id="location-faq"
      aria-labelledby="location-faq-heading"
    >
      <div className="w-[calc(100%-32px)] sm:w-[calc(100%-48px)] max-w-[1100px] mx-auto">
        {/* Header */}
        <div className="max-w-3xl mx-auto text-center mb-10 sm:mb-14">
          <div className="inline-flex items-center justify-center gap-2 mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-[#0784C8]" aria-hidden="true" />
            <span className="text-xs font-bold uppercase tracking-[0.16em] text-[#0784C8]">
              Frequently Asked Questions
            </span>
          </div>

          <h2
            id="location-faq-heading"
            className="font-instrument text-3xl sm:text-4xl md:text-5xl text-[#0B2239] font-normal leading-tight tracking-tight mb-4"
          >
            Questions about {locationName} real estate.
          </h2>

          <p className="text-sm sm:text-base text-[#52657A] leading-relaxed max-w-2xl mx-auto">
            Clear, verified answers regarding statutory approvals, micro-markets, and documentation in {locationName}.
          </p>
        </div>

        {/* Accordion Stack */}
        <div className="max-w-3xl mx-auto space-y-3.5">
          {faq.map((item, index) => {
            const isOpen = openIndex === index;
            const buttonId = `loc-faq-btn-${index}`;
            const regionId = `loc-faq-content-${index}`;

            return (
              <div
                key={index}
                className={`rounded-2xl border transition-all duration-300 overflow-hidden ${
                  isOpen
                    ? "bg-[#F0F7FD]/70 border-[#0784C8]/40 shadow-xs"
                    : "bg-white border-[#0B2239]/8 hover:border-[#0784C8]/30 hover:bg-slate-50/50 shadow-2xs"
                }`}
              >
                <button
                  type="button"
                  id={buttonId}
                  aria-expanded={isOpen}
                  aria-controls={regionId}
                  onClick={() => toggleItem(index)}
                  className="w-full p-5 sm:p-6 text-left flex items-center justify-between gap-4 font-semibold text-base sm:text-lg text-[#0B2239] hover:text-[#0784C8] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#0784C8] cursor-pointer"
                >
                  <span className="font-medium text-sm sm:text-base text-[#0B2239] leading-snug">
                    {item.question}
                  </span>
                  <div
                    className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300 ${
                      isOpen
                        ? "bg-[#0784C8] text-white"
                        : "bg-slate-100 text-[#0784C8]"
                    }`}
                  >
                    <ChevronDown
                      className={`w-4 h-4 transition-transform duration-300 ${
                        isOpen ? "rotate-180" : ""
                      }`}
                      aria-hidden="true"
                    />
                  </div>
                </button>

                {isOpen && (
                  <div
                    id={regionId}
                    role="region"
                    aria-labelledby={buttonId}
                    className="px-5 sm:px-6 pb-5 sm:pb-6 pt-1 text-xs sm:text-sm text-[#52657A] leading-relaxed border-t border-[rgba(7,26,40,0.04)] animate-in fade-in duration-200"
                  >
                    <p>{item.answer}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Advisory Action Callout */}
        <div className="mt-10 sm:mt-12 text-center p-6 rounded-2xl bg-gradient-to-r from-slate-50 via-sky-50/40 to-slate-50 border border-slate-200/80 max-w-xl mx-auto">
          <p className="text-sm font-semibold text-[#0B2239] mb-1">
            Still have questions about {locationName}?
          </p>
          <p className="text-xs text-[#52657A] mb-4">
            Speak directly with our local {locationName} land advisory desk for independent legal guidance.
          </p>
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#0B2239] hover:bg-[#0784C8] text-white text-xs font-semibold transition-all shadow-xs"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            <span>Consult {locationName} Advisor</span>
          </a>
        </div>
      </div>
    </section>
  );
}

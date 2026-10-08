"use client";

import { useState } from "react";
import { ChevronDown, HelpCircle } from "lucide-react";
import { Property } from "@/types/property";

interface PropertyFAQProps {
  property: Property;
}

export function PropertyFAQ({ property }: PropertyFAQProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      q: `What plot dimensions and configurations are available at ${property.name}?`,
      a: `This development features plot dimensions ranging across ${property.plotSizes.join(
        ", "
      )}. Both regular rectilinear plots and dual-frontage corner plots are planned with wide sector road access.`,
    },
    {
      q: `Which government authority has sanctioned the layout plan?`,
      a: `${property.name} is approved under ${
        property.approvalAuthority || "Statutory Planning Authority"
      }${
        property.approvalDetails ? ` (Reference: ${property.approvalDetails})` : ""
      }. Title documents, Section 90A/NA orders, and revenue search reports are reviewed by our advisory desk.`,
    },
    {
      q: `Are the calculated prices and square yard rates final quotations?`,
      a: `The prices and rates displayed (${property.priceLabel}) represent indicative base rates for available inventory. Final registration charges, stamp duty, Preferential Location Charges (PLC), and municipal fees are finalized at the time of legal agreement execution.`,
    },
    {
      q: `Can I schedule a physical site visit or coordinate virtual due diligence?`,
      a: `Yes. Our local land advisory team provides escorted site inspections with boundary demarcation confirmation, physical revenue map cross-referencing, and developer meetings. You can schedule a visit directly using the booking form or on WhatsApp.`,
    },
  ];

  const toggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section aria-labelledby="property-faq-heading" className="mb-8 sm:mb-12">
      <div className="p-4 sm:p-7 sm:p-8 rounded-2xl sm:rounded-3xl bg-white border border-[rgba(7,26,40,0.08)] shadow-[0_4px_24px_rgba(7,26,40,0.04)]">
        <div className="max-w-[720px] mb-5 sm:mb-6">
          <div className="inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1 rounded-full bg-[rgba(7,132,200,0.08)] border border-[rgba(7,132,200,0.2)] text-[#0784C8] text-[10.5px] sm:text-xs font-semibold uppercase tracking-wider mb-2">
            <HelpCircle className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Buyer Due Diligence FAQs</span>
          </div>
          <h2
            id="property-faq-heading"
            className="font-instrument text-xl sm:text-2xl sm:text-3xl text-[#031C2B] font-normal leading-tight tracking-tight mb-1.5 sm:mb-2"
          >
            Frequently asked questions.
          </h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className={`rounded-2xl border transition-all duration-300 overflow-hidden ${
                  isOpen
                    ? "bg-white border-[rgba(7,132,200,0.35)] shadow-[0_4px_16px_rgba(7,132,200,0.06)]"
                    : "bg-white border-[rgba(7,26,40,0.08)] shadow-xs hover:border-[rgba(7,132,200,0.25)] hover:shadow-sm"
                }`}
              >
                <button
                  type="button"
                  onClick={() => toggle(idx)}
                  className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 font-semibold text-sm sm:text-base text-[#031C2B] hover:text-[#0784C8] transition-colors focus-visible:outline-none"
                  aria-expanded={isOpen}
                >
                  <span className="leading-snug">{faq.q}</span>
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300 ${
                      isOpen
                        ? "bg-[rgba(7,132,200,0.12)] text-[#0784C8]"
                        : "bg-[rgba(7,26,40,0.04)] text-[#667d8f]"
                    }`}
                  >
                    <ChevronDown
                      className={`w-4 h-4 transition-transform duration-300 ${
                        isOpen ? "rotate-180 text-[#0784C8]" : ""
                      }`}
                    />
                  </div>
                </button>

                {isOpen && (
                  <div className="px-4 sm:px-5 pb-5 pt-1 text-xs sm:text-sm text-[#4a6171] leading-relaxed border-t border-[rgba(7,26,40,0.04)] animate-fadeIn">
                    <p>{faq.a}</p>
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

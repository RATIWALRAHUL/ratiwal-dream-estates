"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown, MessageCircle, ArrowRight } from "lucide-react";
import { Reveal } from "@/components/home/Reveal";
import { generateWhatsAppUrl } from "@/lib/whatsapp";

const HOME_FAQS = [
  {
    question: "How does Ratiwal Dream Estates ensure all listed properties are legally verified?",
    answer:
      "Every plot and township on our roster undergoes rigorous legal due diligence. This includes a 30-year revenue record search (Jamabandi, Khasra, registry chain), JDA / ADA / CIDCO statutory approval verification, Rajasthan RERA compliance checks, and physical on-ground GPS demarcation before onboarding.",
  },
  {
    question: "What is the difference between JDA/ADA approved plots and agricultural land?",
    answer:
      "JDA (Jaipur Development Authority) and ADA (Ajmer Development Authority) approved plots are legally converted under Section 90-A with sanctioned sector road widths, open park allocations, and commercial facility reserves. Agricultural land cannot be legally built upon or subdivided without formal 90-A conversion and statutory master plan sanction.",
  },
  {
    question: "Can I schedule an accompanied on-ground site visit before booking?",
    answer:
      "Yes, absolutely. We provide complimentary escorted on-ground site visits across Jaipur, Ajmer, and Kishangarh. Our property advisors accompany you to inspect physical boundary pillars, check road widths, review revenue maps, and verify water and electrical connectivity with zero obligation.",
  },
  {
    question: "What additional charges should I anticipate beyond the base plot price?",
    answer:
      "Standard statutory expenses include Rajasthan State Stamp Duty (typically 6% for males, 5% for females), Registration Fee (1%), and nominal revenue mutation / documentation charges. All charges are outlined clearly in your pre-purchase advisory breakdown with 100% transparency.",
  },
  {
    question: "How do you assist outstation and NRI buyers with plot acquisition?",
    answer:
      "We provide remote advisory dossiers including high-resolution drone videos, geo-tagged GIS layout overlays, certified registry title scans, and circle rate comparative studies. When you are ready to acquire, we assist with secure Power of Attorney (PoA) documentation and registry logistics.",
  },
  {
    question: "What support is provided after the property sale deed is registered?",
    answer:
      "Our advisory engagement extends well beyond registration. We actively assist clients with official revenue Mutation (Dakhil Kharij / Namantran), municipal tax record updates, plot boundary fencing, and future monetization or villa construction planning.",
  },
];

export function HomeFAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleItem = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const whatsappUrl = generateWhatsAppUrl({
    type: "general",
  });

  return (
    <section
      className="py-16 sm:py-24 bg-white border-b border-[rgba(7,26,40,0.06)]"
      id="faq"
      aria-labelledby="home-faq-title"
    >
      <div className="w-[calc(100%-32px)] sm:w-[calc(100%-48px)] max-w-[1100px] mx-auto">
        {/* Header */}
        <Reveal>
          <div className="max-w-3xl mx-auto text-center mb-10 sm:mb-14">
            <div className="inline-flex items-center justify-center gap-2 mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-[#0784C8]" aria-hidden="true" />
              <span className="text-xs font-bold uppercase tracking-[0.16em] text-[#0784C8]">
                Frequently Asked Questions
              </span>
            </div>

            <h2
              id="home-faq-title"
              className="font-instrument text-3xl sm:text-4xl md:text-5xl text-[#0B2239] font-normal leading-tight tracking-tight mb-4"
            >
              Clear answers to common questions.
            </h2>

            <p className="text-sm sm:text-base text-[#52657A] leading-relaxed max-w-2xl mx-auto">
              Everything you need to know about statutory approvals, site visits, legal due diligence, and acquiring verified land with Ratiwal Dream Estates.
            </p>
          </div>
        </Reveal>

        {/* Accordion Stack */}
        <div className="max-w-3xl mx-auto space-y-3.5">
          {HOME_FAQS.map((faq, index) => {
            const isOpen = openIndex === index;
            const buttonId = `home-faq-btn-${index}`;
            const regionId = `home-faq-content-${index}`;

            return (
              <Reveal key={index} delay={index * 40}>
                <div
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
                      {faq.question}
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
                      <p>{faq.answer}</p>
                    </div>
                  )}
                </div>
              </Reveal>
            );
          })}
        </div>

        {/* Contact Strip */}
        <Reveal>
          <div className="mt-10 sm:mt-12 text-center p-6 rounded-2xl bg-gradient-to-r from-slate-50 via-sky-50/40 to-slate-50 border border-slate-200/80 max-w-xl mx-auto">
            <p className="text-sm font-semibold text-[#0B2239] mb-1">
              Have a specific question about an upcoming project?
            </p>
            <p className="text-xs text-[#52657A] mb-4">
              Our direct advisory desk is available 7 days a week for transparent guidance.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#0B2239] hover:bg-[#0784C8] text-white text-xs font-semibold transition-all shadow-xs"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>Chat on WhatsApp</span>
              </a>
              <Link
                href="/contact"
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-white hover:bg-slate-50 text-[#0B2239] border border-slate-200 text-xs font-semibold transition-all shadow-xs"
              >
                <span>Book Consultation</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

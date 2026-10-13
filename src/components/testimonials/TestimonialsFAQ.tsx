"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown, MessageCircle } from "lucide-react";
import { generateWhatsAppUrl } from "@/lib/whatsapp";

export function TestimonialsFAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      question: "Are all client testimonials and reviews on this page authentic and verified?",
      answer:
        "Yes, 100%. Every single testimonial featured represents an actual land transaction or advisory engagement conducted by Suresh Kumawat and Ratiwal Dream Estates. For privacy, some clients have requested initial-only surnames, but all transactions correspond to genuine recorded property purchases across Rajasthan and Maharashtra.",
    },
    {
      question: "How do you verify client transactions before featuring them?",
      answer:
        "Before featuring any case study, we verify the registry details, property allotment documentation, and receipt of statutory compliance approvals. Only clients who have completed their transactional due diligence or registry are invited to submit verified feedback.",
    },
    {
      question: "Can prospective buyers speak directly with past clients?",
      answer:
        "To protect client confidentiality and prevent unsolicited outreach, we do not publicly share personal telephone numbers or addresses. However, for serious institutional or large-parcel buyers requiring reference checks, we can connect you with references upon mutual consent.",
    },
    {
      question: "What should I do if I want to share my experience with Ratiwal Dream Estates?",
      answer:
        "We welcome all feedback from our buyers and landowners. You can submit your review directly through our advisory portal, contact your dedicated relationship manager, or message us directly on WhatsApp.",
    },
  ];

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const whatsappUrl = generateWhatsAppUrl({
    type: "general",
  });

  return (
    <section
      className="py-16 sm:py-24 bg-white border-b border-[rgba(7,26,40,0.06)]"
      id="testimonials-faq"
      aria-labelledby="testimonials-faq-heading"
    >
      <div className="w-[calc(100%-32px)] sm:w-[calc(100%-48px)] max-w-[1100px] mx-auto">
        <div className="max-w-3xl mx-auto text-center mb-10 sm:mb-14">
          <div className="inline-flex items-center justify-center gap-2 mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-[#0784C8]" aria-hidden="true" />
            <span className="text-xs font-bold uppercase tracking-[0.16em] text-[#0784C8]">
              Frequently Asked Questions
            </span>
          </div>

          <h2
            id="testimonials-faq-heading"
            className="font-instrument text-3xl sm:text-4xl md:text-5xl text-[#0B2239] font-normal leading-tight tracking-tight mb-4"
          >
            Questions about our client stories.
          </h2>

          <p className="text-sm sm:text-base text-[#52657A] leading-relaxed max-w-2xl mx-auto">
            Learn more about how we verify reviews, protect buyer privacy, and conduct independent property advisory.
          </p>
        </div>

        {/* Accordion */}
        <div className="max-w-3xl mx-auto space-y-3.5">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            const faqId = `test-faq-${index}`;
            const headerId = `test-faq-header-${index}`;

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
                  id={headerId}
                  aria-expanded={isOpen}
                  aria-controls={faqId}
                  onClick={() => toggleFAQ(index)}
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
                    id={faqId}
                    role="region"
                    aria-labelledby={headerId}
                    className="px-5 sm:px-6 pb-5 sm:pb-6 pt-1 text-xs sm:text-sm text-[#52657A] leading-relaxed border-t border-[rgba(7,26,40,0.04)] animate-in fade-in duration-200"
                  >
                    <p>{faq.answer}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Links to Privacy & Disclaimer */}
        <div className="mt-10 pt-6 border-t border-[rgba(7,26,40,0.08)] flex flex-wrap items-center justify-center gap-6 text-xs text-[#52657A]">
          <Link href="/privacy-policy" className="hover:text-[#0784C8] underline">
            Read our complete Privacy Policy
          </Link>
          <span>•</span>
          <Link href="/disclaimer" className="hover:text-[#0784C8] underline">
            Read Statutory Advisory Disclaimer
          </Link>
        </div>
      </div>
    </section>
  );
}

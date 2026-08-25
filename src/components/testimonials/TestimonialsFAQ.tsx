"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown, HelpCircle, ArrowRight } from "lucide-react";

export function TestimonialsFAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      question: "Are all testimonials and case studies from real Ratiwal clients?",
      answer:
        "Yes, 100%. Every story published on this page represents a genuine advisory consultation, statutory document audit, or property acquisition assisted by Ratiwal Dream Estates. We do not use placeholder reviews or AI-generated testimonials.",
    },
    {
      question: "What does the 'Verified Client Story' badge mean?",
      answer:
        "The 'Verified' badge indicates that our compliance desk has cross-checked the review against a documented advisory file, JDA/CIDCO submission record, site-visit log, or registered title deed.",
    },
    {
      question: "Why are some client names or exact details anonymized?",
      answer:
        "Real estate transactions involve sensitive family and financial information. When clients request privacy, we publish their authentic story under an authorized professional descriptor (e.g., 'NRI Property Buyer' or 'Commercial Logistics Partner') while protecting their full name, contact details, and exact plot numbers.",
    },
    {
      question: "Are property appreciation and investment returns guaranteed?",
      answer:
        "No. Real estate values, infrastructure timelines, and rental yields are subject to market conditions and statutory approvals. Ratiwal Dream Estates provides objective research, masterplan alignment, and legal due diligence, but does not guarantee speculative financial returns.",
    },
    {
      question: "Can I speak directly with a previous client for a reference?",
      answer:
        "To protect client confidentiality, we do not share private contact information. However, upon specific request and with prior written authorization, we may connect prospective corporate or institutional clients with consenting past partners.",
    },
    {
      question: "How does Ratiwal protect my personal information?",
      answer:
        "We adhere to strict data privacy practices. Your phone number, email address, property preferences, and documents are stored securely and never sold or shared with unsolicited third-party brokers. For full details, review our Privacy Policy.",
    },
    {
      question: "How can I start a property advisory consultation?",
      answer:
        "You can reach out directly via WhatsApp, schedule a phone callback, or submit our contact form. An advisor specializing in your preferred corridor (Jaipur, Ajmer, Navi Mumbai, or Panvel) will share verified masterplan insights and tailored opportunities.",
    },
  ];

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="py-16 md:py-24 bg-[#F5F1E9] border-b border-[rgba(7,26,40,0.08)]" aria-labelledby="testimonials-faq-heading">
      <div className="max-w-[960px] w-[calc(100%-48px)] mx-auto">
        <div className="text-center max-w-[620px] mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[rgba(7,132,200,0.08)] border border-[rgba(7,132,200,0.2)] text-[#0784C8] text-xs font-bold uppercase tracking-wider mb-3">
            <HelpCircle className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Frequently Asked Questions</span>
          </div>
          <h2
            id="testimonials-faq-heading"
            className="font-heading text-3xl sm:text-4xl text-[#031C2B] font-normal leading-tight tracking-tight mb-3"
          >
            Questions about our client stories.
          </h2>
          <p className="text-sm sm:text-base text-[#4a6171] leading-relaxed">
            Learn more about how we verify reviews, protect buyer privacy, and conduct independent property advisory.
          </p>
        </div>

        {/* Accordion */}
        <div className="space-y-3.5">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            const faqId = `test-faq-${index}`;
            const headerId = `test-faq-header-${index}`;

            return (
              <div
                key={index}
                className="rounded-2xl bg-white border border-[rgba(7,26,40,0.08)] overflow-hidden transition-colors"
              >
                <button
                  type="button"
                  id={headerId}
                  aria-expanded={isOpen}
                  aria-controls={faqId}
                  onClick={() => toggleFAQ(index)}
                  className="w-full p-5 sm:p-6 text-left flex items-center justify-between gap-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#0784C8]"
                >
                  <span className="font-heading text-base sm:text-lg font-bold text-[#031C2B]">
                    {faq.question}
                  </span>
                  <div
                    className={`w-7 h-7 rounded-full bg-[#F5F1E9] flex items-center justify-center flex-shrink-0 text-[#0784C8] transition-transform duration-300 ${
                      isOpen ? "rotate-180 bg-[#0784C8] text-white" : ""
                    }`}
                  >
                    <ChevronDown className="w-4 h-4" aria-hidden="true" />
                  </div>
                </button>

                {isOpen && (
                  <div
                    id={faqId}
                    role="region"
                    aria-labelledby={headerId}
                    className="px-5 pb-5 sm:px-6 sm:pb-6 text-sm text-[#4a6171] leading-relaxed border-t border-[rgba(7,26,40,0.06)] pt-4"
                  >
                    <p>{faq.answer}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Links to Privacy & Disclaimer */}
        <div className="mt-8 pt-6 border-t border-[rgba(7,26,40,0.1)] flex flex-wrap items-center justify-center gap-6 text-xs text-[#667d8f]">
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

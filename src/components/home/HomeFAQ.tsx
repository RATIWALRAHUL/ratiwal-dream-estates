"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { ChevronDown, MessageCircle, ArrowRight } from "lucide-react";
import { Reveal } from "@/components/home/Reveal";
import { generateWhatsAppUrl } from "@/lib/whatsapp";
import { HOME_FAQS } from "@/data/home-faqs";

export { HOME_FAQS };

/* Same enquiry form (and /api/enquiries backend) as the Contact page. */
const EnquiryForm = dynamic(
  () => import("@/components/forms/EnquiryForm").then((m) => m.EnquiryForm),
  { loading: () => <FormSkeleton /> }
);

function FormSkeleton() {
  return (
    <div className="space-y-4 animate-pulse" aria-hidden="true">
      {[0, 1, 2, 3, 4].map((i) => (
        <div key={i} className="h-12 rounded-xl bg-[#071a28]/[0.06]" />
      ))}
      <div className="h-24 rounded-xl bg-[#071a28]/[0.06]" />
      <div className="h-12 rounded-full bg-[#071a28]/[0.1]" />
    </div>
  );
}

export function HomeFAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  // Mount the form (and its /api/locations request) only when the section is near the viewport.
  const formRef = useRef<HTMLElement>(null);
  const [mountForm, setMountForm] = useState(false);
  useEffect(() => {
    const node = formRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setMountForm(true);
          observer.disconnect();
        }
      },
      { rootMargin: "400px 0px" }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const toggleItem = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const whatsappUrl = generateWhatsAppUrl({ type: "general" });

  return (
    <section
      className="bg-white border-b border-[rgba(7,26,40,0.06)]"
      id="faq"
      aria-labelledby="home-faq-title"
    >
      <div className="w-[calc(100%-32px)] sm:w-[calc(100%-48px)] max-w-[1300px] mx-auto py-16 sm:py-24 lg:py-28">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          {/* Questions */}
          <div className="lg:col-span-7">
            <Reveal>
              <div className="about-copy mb-8 sm:mb-10">
                <p className="eyebrow">Frequently asked questions</p>
                <h2 id="home-faq-title">
                  Clear answers to
                  <br className="hidden sm:inline" /> common questions.
                </h2>
                <p>
                  Statutory approvals, site visits, legal due diligence and buying verified land
                  with Ratiwal Dream Estates, answered plainly.
                </p>
              </div>
            </Reveal>

            <div className="space-y-3">
              {HOME_FAQS.map((faq, index) => {
                const isOpen = openIndex === index;
                const buttonId = `home-faq-btn-${index}`;
                const regionId = `home-faq-content-${index}`;

                return (
                  <Reveal key={index} delay={index * 40}>
                    <div
                      className={`rounded-[18px] border bg-white shadow-[0_14px_35px_rgba(7,29,45,0.06)] transition-colors duration-300 overflow-hidden ${
                        isOpen
                          ? "border-[#087fc3]/40"
                          : "border-[rgba(7,29,45,0.08)] hover:border-[#087fc3]/30"
                      }`}
                    >
                      <button
                        type="button"
                        id={buttonId}
                        aria-expanded={isOpen}
                        aria-controls={regionId}
                        onClick={() => toggleItem(index)}
                        className="w-full px-5 py-4 sm:px-6 sm:py-5 text-left flex items-center justify-between gap-4 cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[#087fc3]"
                      >
                        <span className="text-[.95rem] font-semibold leading-snug text-[#071a28]">
                          {faq.question}
                        </span>
                        <span
                          className={`grid place-items-center w-8 h-8 rounded-full flex-shrink-0 transition-colors duration-300 ${
                            isOpen
                              ? "bg-gradient-to-br from-[#087fc3] to-[#0a6ba3] text-white"
                              : "bg-[#eaf5fa] text-[#087fc3]"
                          }`}
                        >
                          <ChevronDown
                            className={`w-4 h-4 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
                            aria-hidden="true"
                          />
                        </span>
                      </button>

                      {isOpen && (
                        <div
                          id={regionId}
                          role="region"
                          aria-labelledby={buttonId}
                          className="px-5 sm:px-6 pb-5 pt-0 text-[.9rem] leading-[1.7] text-[#425466] animate-in fade-in duration-200"
                        >
                          <p>{faq.answer}</p>
                        </div>
                      )}
                    </div>
                  </Reveal>
                );
              })}
            </div>

            <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-3 text-[.86rem] text-[#425466]">
              <span>Prefer to talk?</span>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-link"
              >
                <MessageCircle size={16} aria-hidden="true" />
                <span>Chat on WhatsApp</span>
              </a>
              <Link href="/contact" className="text-link">
                <span>Full contact page</span>
                <ArrowRight size={15} aria-hidden="true" />
              </Link>
            </div>
          </div>

          {/* Enquiry form: same form and backend as /contact, in the site's blueprint-panel card */}
          <aside
            ref={formRef}
            aria-labelledby="home-faq-form-title"
            className="lg:col-span-5 lg:sticky lg:top-28"
          >
            <div className="about-visual">
              <div className="relative z-[2] rounded-[26px] border border-[rgba(7,29,45,0.08)] bg-white p-6 sm:p-8 shadow-[0_30px_74px_rgba(7,26,40,0.14)]">
                <p className="eyebrow">Ask an advisor</p>
                <h3
                  id="home-faq-form-title"
                  className="mt-2 font-instrument text-[1.8rem] sm:text-[2.1rem] leading-[1.1] text-[#071a28]"
                >
                  Still have a question? Ask us directly.
                </h3>
                <p className="mt-2 mb-6 text-[.9rem] leading-[1.7] text-[#425466]">
                  Share your requirement and a senior land advisor will get back to you. Free and confidential.
                </p>
                {mountForm ? <EnquiryForm /> : <FormSkeleton />}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}

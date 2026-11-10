"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { ChevronDown, MessageCircle, Phone, ArrowRight } from "lucide-react";
import { Reveal } from "@/components/home/Reveal";
import { generateWhatsAppUrl } from "@/lib/whatsapp";
import { HOME_FAQS } from "@/data/home-faqs";
import { advisorData } from "@/data/advisorData";

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

/* Bento card: the site's white story-card surface. */
const card =
  "rounded-[26px] border border-[rgba(7,29,45,0.08)] bg-white shadow-[0_14px_35px_rgba(7,29,45,0.06)]";

export function HomeFAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  // Mount the form (and its /api/locations request) only when it is near the viewport.
  const formRef = useRef<HTMLDivElement>(null);
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
    <section id="faq" aria-labelledby="home-faq-title">
      <div className="w-[calc(100%-32px)] sm:w-[calc(100%-48px)] max-w-[1300px] mx-auto py-14 sm:py-20 lg:py-24">
        {/*
          Bento grid, two rows. Cards in the same row always share one height (grid items stretch):
          row 1 heading | contact, row 2 questions | form.
          DOM order is the mobile reading order; lg auto-flow produces the 2x2 layout.
        */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5">
          {/* Heading card */}
          <Reveal className="lg:col-span-7 flex">
            <div className={`${card} w-full p-6 sm:p-9 flex flex-col justify-center`}>
              <p className="eyebrow">Frequently asked questions</p>
              <h2
                id="home-faq-title"
                className="mt-3 font-instrument font-normal text-[#071a28] leading-[1.04] tracking-tight text-[2.2rem] xs:text-[2.5rem] sm:text-[3rem] xl:text-[3.6rem]"
              >
                Clear answers to
                <br className="hidden sm:inline" /> common questions.
              </h2>
              <p className="mt-4 max-w-[34rem] text-[.95rem] sm:text-base leading-[1.7] text-[#4a5568]">
                Statutory approvals, site visits, legal due diligence and buying verified land with
                Ratiwal Dream Estates, answered plainly.
              </p>
            </div>
          </Reveal>

          {/* Contact card (dark): sits last on mobile */}
          <Reveal className="lg:col-span-5 flex order-4 lg:order-none" delay={80}>
            <div
              className="w-full relative overflow-hidden rounded-[26px] bg-[#071a28] text-white p-6 sm:p-9 flex flex-col justify-center
                         bg-[linear-gradient(rgba(66,183,232,.05)_1px,transparent_1px),linear-gradient(90deg,rgba(66,183,232,.05)_1px,transparent_1px)] bg-[size:35px_35px]
                         shadow-[0_30px_74px_rgba(7,26,40,0.18)]"
            >
              <p className="text-[.82rem] font-semibold text-white/70">Prefer to talk?</p>
              <a
                href={`tel:${advisorData.phoneRaw}`}
                className="mt-1 inline-flex items-center gap-3 font-instrument text-[2rem] sm:text-[2.4rem] leading-tight text-white hover:text-[#42b7e8] transition-colors rounded focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#42b7e8]"
              >
                <Phone className="w-6 h-6 text-[#42b7e8] flex-shrink-0" aria-hidden="true" />
                {advisorData.phone}
              </a>
              <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-3">
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="button-primary"
                >
                  <MessageCircle size={17} aria-hidden="true" />
                  <span>Chat on WhatsApp</span>
                </a>
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-1.5 text-[.86rem] font-bold text-white/85 hover:text-white underline decoration-white/30 underline-offset-4"
                >
                  <span>Full contact page</span>
                  <ArrowRight size={15} aria-hidden="true" />
                </Link>
              </div>
            </div>
          </Reveal>

          {/* Questions card */}
          <Reveal className="lg:col-span-7 flex order-2 lg:order-none">
            <div className={`${card} w-full p-3 sm:p-5 flex`}>
              {/* Closed questions share any spare height so this card matches the form beside it */}
              <div className="w-full flex flex-col gap-2.5">
                {HOME_FAQS.map((faq, index) => {
                  const isOpen = openIndex === index;
                  const buttonId = `home-faq-btn-${index}`;
                  const regionId = `home-faq-content-${index}`;

                  return (
                    <div
                      key={index}
                      className={`rounded-[18px] border transition-colors duration-300 overflow-hidden flex flex-col ${
                        isOpen
                          ? "border-[#087fc3]/40 bg-[#f5f9fc]"
                          : "flex-1 justify-center border-[rgba(7,29,45,0.08)] bg-white hover:border-[#087fc3]/30"
                      }`}
                    >
                      <button
                        type="button"
                        id={buttonId}
                        aria-expanded={isOpen}
                        aria-controls={regionId}
                        onClick={() => toggleItem(index)}
                        className="w-full px-5 py-4 text-left flex items-center justify-between gap-4 cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[#087fc3]"
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
                          className="px-5 pb-5 text-[.9rem] leading-[1.7] text-[#425466] animate-in fade-in duration-200"
                        >
                          <p>{faq.answer}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </Reveal>

          {/* Form card: same form and backend as /contact */}
          <Reveal className="lg:col-span-5 flex order-3 lg:order-none" delay={80}>
            <div ref={formRef} className={`${card} w-full p-6 sm:p-8`}>
              <p className="eyebrow">Ask an advisor</p>
              <h3 className="mt-2 font-instrument text-[1.8rem] sm:text-[2.1rem] leading-[1.1] text-[#071a28]">
                Still have a question? Ask us directly.
              </h3>
              <p className="mt-2 mb-6 text-[.9rem] leading-[1.7] text-[#425466]">
                Share your requirement and a senior land advisor will get back to you. Free and
                confidential.
              </p>
              {mountForm ? <EnquiryForm /> : <FormSkeleton />}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

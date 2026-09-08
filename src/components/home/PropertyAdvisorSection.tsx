"use client";

import React, { useEffect, useRef, useState } from "react";
import { ArrowRight, Phone, Mail, User, Users, BarChart3, Search, ShieldCheck, FileText } from "lucide-react";
import { AdvisorNavyPanel } from "./AdvisorNavyPanel";
import { generateWhatsAppUrl } from "@/lib/whatsapp";
import { advisorData } from "@/data/advisorData";

export function PropertyAdvisorSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const whatsappUrl = generateWhatsAppUrl({ type: "general" });

  useEffect(() => {
    const node = sectionRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="property-advisor"
      aria-labelledby="advisor-section-title"
      className="relative w-full bg-[#F7F5EF] py-10 sm:py-12 lg:py-14 overflow-hidden"
    >
      {/* Centered Wide Container */}
      <div className="max-w-[1440px] mx-auto px-5 sm:px-8 md:px-10 lg:px-12 xl:px-14">
        {/* Main Grid: Left Content (52%) + Right Navy Panel (48%) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 xl:gap-14 items-center">
          {/* LEFT COLUMN: Editorial Content Hierarchy */}
          <div
            className={`lg:col-span-6 xl:col-span-6 flex flex-col justify-center transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
            }`}
          >
            {/* 1. Eyebrow */}
            <div className="flex items-center gap-2.5 mb-2.5 sm:mb-3">
              <div className="w-7 h-[2.5px] bg-[#0798D8] rounded-full flex-shrink-0" aria-hidden="true" />
              <span className="text-[11.5px] sm:text-[12.5px] font-bold tracking-[0.16em] uppercase text-[#0798D8]">
                MEET YOUR PROPERTY ADVISOR
              </span>
            </div>

            {/* 2. Main Heading: Bold Editorial Serif */}
            <h2
              id="advisor-section-title"
              className="font-playfair text-[2.4rem] sm:text-[3rem] md:text-[3.35rem] lg:text-[3.55rem] xl:text-[3.85rem] text-[#0B2239] font-bold leading-[1.04] tracking-[-0.015em] mb-3 sm:mb-3.5"
            >
              Property guidance,
              <br />
              shaped around you.
            </h2>

            {/* 3. Gold Divider */}
            <div className="w-[58px] h-[3px] bg-[#D9A62E] rounded-full mb-3.5 sm:mb-4" aria-hidden="true" />

            {/* 4. Description Paragraph */}
            <p className="text-[14px] sm:text-[15px] lg:text-[15.5px] text-[#52657A] leading-[1.54] max-w-[590px] font-normal mb-5 sm:mb-6">
              Direct one-on-one advisory led by Senior Property Advisor{" "}
              <strong className="text-[#0B2239] font-bold">{advisorData.name}</strong> (RERA: {advisorData.rera}).
              Clear legal verification, realistic land valuations, and transparent guidance from first conversation to
              final registry.
            </p>

            {/* 5. Statistics: 3 Clean Columns with Vertical Dividers */}
            <div className="flex items-center justify-between max-w-[590px] py-1 mb-5 sm:mb-6 border-y border-[rgba(11,34,57,0.06)] sm:border-y-0">
              {/* Stat 1 */}
              <div className="flex items-center gap-2.5 flex-1 min-w-0">
                <User size={28} className="text-[#0798D8] flex-shrink-0" strokeWidth={1.75} aria-hidden="true" />
                <div className="min-w-0">
                  <div className="text-[16px] sm:text-[18px] lg:text-[19px] font-bold text-[#0B2239] leading-tight">
                    {advisorData.experience}
                  </div>
                  <div className="text-[10.5px] sm:text-[11.5px] text-[#52657A] font-medium leading-tight mt-0.5 truncate">
                    {advisorData.experienceLabel}
                  </div>
                </div>
              </div>

              {/* Vertical Divider */}
              <div className="w-px h-8 bg-[rgba(11,34,57,0.14)] mx-2 sm:mx-3.5 flex-shrink-0" aria-hidden="true" />

              {/* Stat 2 */}
              <div className="flex items-center gap-2.5 flex-1 min-w-0">
                <Users size={28} className="text-[#0798D8] flex-shrink-0" strokeWidth={1.75} aria-hidden="true" />
                <div className="min-w-0">
                  <div className="text-[16px] sm:text-[18px] lg:text-[19px] font-bold text-[#0B2239] leading-tight">
                    {advisorData.clients}
                  </div>
                  <div className="text-[10.5px] sm:text-[11.5px] text-[#52657A] font-medium leading-tight mt-0.5 truncate">
                    {advisorData.clientsLabel}
                  </div>
                </div>
              </div>

              {/* Vertical Divider */}
              <div className="w-px h-8 bg-[rgba(11,34,57,0.14)] mx-2 sm:mx-3.5 flex-shrink-0" aria-hidden="true" />

              {/* Stat 3 */}
              <div className="flex items-center gap-2.5 flex-1 min-w-0">
                <BarChart3 size={28} className="text-[#0798D8] flex-shrink-0" strokeWidth={1.75} aria-hidden="true" />
                <div className="min-w-0">
                  <div className="text-[16px] sm:text-[18px] lg:text-[19px] font-bold text-[#0B2239] leading-tight">
                    {advisorData.propertySold}
                  </div>
                  <div className="text-[10.5px] sm:text-[11.5px] text-[#52657A] font-medium leading-tight mt-0.5 truncate">
                    {advisorData.propertySoldLabel}
                  </div>
                </div>
              </div>
            </div>

            {/* 6. Advisory Benefits: 3 Editorial Rows with Clean Separators */}
            <div className="flex flex-col max-w-[590px] mb-5 sm:mb-6 divide-y divide-[rgba(11,34,57,0.1)]">
              {/* Row 1 */}
              <div className="flex items-start gap-3.5 py-2.5 sm:py-3">
                <div className="w-7 h-7 flex items-center justify-center text-[#0798D8] flex-shrink-0 mt-0.5">
                  <Search size={24} strokeWidth={1.8} aria-hidden="true" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-[14px] sm:text-[15px] font-bold text-[#0B2239] leading-snug">
                    Local market intelligence
                  </h3>
                  <p className="text-[12.5px] sm:text-[13px] text-[#52657A] mt-0.5 leading-normal">
                    Neighbourhood context, corridor pricing and infrastructure potential
                  </p>
                </div>
              </div>

              {/* Row 2 */}
              <div className="flex items-start gap-3.5 py-2.5 sm:py-3">
                <div className="w-7 h-7 flex items-center justify-center text-[#0798D8] flex-shrink-0 mt-0.5">
                  <ShieldCheck size={24} strokeWidth={1.8} aria-hidden="true" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-[14px] sm:text-[15px] font-bold text-[#0B2239] leading-snug">
                    Independent opportunity review
                  </h3>
                  <p className="text-[12.5px] sm:text-[13px] text-[#52657A] mt-0.5 leading-normal">
                    Objective title checks, JDA / RERA verification before you commit
                  </p>
                </div>
              </div>

              {/* Row 3 */}
              <div className="flex items-start gap-3.5 py-2.5 sm:py-3">
                <div className="w-7 h-7 flex items-center justify-center text-[#0798D8] flex-shrink-0 mt-0.5">
                  <FileText size={24} strokeWidth={1.8} aria-hidden="true" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-[14px] sm:text-[15px] font-bold text-[#0B2239] leading-snug">
                    Documentation and closing support
                  </h3>
                  <p className="text-[12.5px] sm:text-[13px] text-[#52657A] mt-0.5 leading-normal">
                    Registry, Patta, Sub-Registrar execution and transparent handover
                  </p>
                </div>
              </div>
            </div>

            {/* 7. CTA Buttons Area: Primary + Phone + Email */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3 max-w-[590px]">
              {/* Primary CTA */}
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex-1 inline-flex items-center justify-center gap-2 bg-[#0B2239] hover:bg-[#0798D8] text-white px-5 sm:px-6 h-[48px] sm:h-[50px] rounded-[9px] text-[13.5px] sm:text-[14px] font-bold tracking-normal whitespace-nowrap transition-all duration-300 shadow-[0_4px_16px_rgba(11,34,57,0.18)] hover:shadow-[0_6px_22px_rgba(7,152,216,0.3)] active:scale-[0.98]"
              >
                <span>Consult with {advisorData.name}</span>
                <ArrowRight
                  size={16}
                  className="flex-shrink-0 transition-transform duration-300 group-hover:translate-x-1"
                  aria-hidden="true"
                />
              </a>

              {/* Secondary Phone Button */}
              <a
                href={`tel:${advisorData.phoneRaw}`}
                className="inline-flex items-center justify-center gap-2 px-3.5 sm:px-4 h-[48px] sm:h-[50px] rounded-[9px] bg-white border border-[rgba(11,34,57,0.22)] hover:border-[#0798D8] text-[#0B2239] hover:text-[#0798D8] text-[13px] sm:text-[13.5px] font-bold shadow-xs transition-colors duration-200 whitespace-nowrap"
                title={`Call ${advisorData.phone}`}
              >
                <Phone size={14} className="text-[#0798D8] flex-shrink-0" strokeWidth={2} />
                <span>{advisorData.phone}</span>
              </a>

              {/* Secondary Email Button */}
              <a
                href={`mailto:${advisorData.email}`}
                className="inline-flex items-center justify-center gap-2 px-3.5 sm:px-4 h-[48px] sm:h-[50px] rounded-[9px] bg-white border border-[rgba(11,34,57,0.22)] hover:border-[#0798D8] text-[#0B2239] hover:text-[#0798D8] text-[13px] sm:text-[13.5px] font-bold shadow-xs transition-colors duration-200 whitespace-nowrap"
                title={`Email ${advisorData.email}`}
              >
                <Mail size={14} className="text-[#0798D8] flex-shrink-0" strokeWidth={2} />
                <span>Email</span>
              </a>
            </div>

            {/* 8. Muted Footnote */}
            <p className="text-[12px] sm:text-[12.5px] text-[#7A8B99] mt-3 font-normal">
              RERA Registered: {advisorData.rera} • Confidential, zero-pressure advisory.
            </p>
          </div>

          {/* RIGHT COLUMN: Large Navy Consultant Brand Panel */}
          <div
            className={`lg:col-span-6 xl:col-span-6 transition-all duration-700 delay-150 ease-[cubic-bezier(0.22,1,0.36,1)] ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
          >
            <AdvisorNavyPanel />
          </div>
        </div>
      </div>
    </section>
  );
}

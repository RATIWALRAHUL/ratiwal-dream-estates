"use client";

import React, { useEffect, useRef, useState } from "react";
import { ArrowRight, Lock, ShieldCheck, Phone, Mail, Award, Users, BarChart3 } from "lucide-react";
import { AdvisorExpertiseItem } from "./AdvisorExpertiseItem";
import DigitalVisitingCard from "./DigitalVisitingCard";
import { generateWhatsAppUrl } from "@/lib/whatsapp";
import { siteConfig } from "@/config/site";

// Clean custom SVG icons matching the reference design line-style
function MarketIntelligenceIcon() {
  return (
    <svg
      width="28"
      height="28"
      viewBox="0 0 28 28"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="w-7 h-7"
    >
      <circle cx="11.5" cy="11.5" r="7.5" />
      <path d="M17 17L23 23" />
      <path d="M8.5 14V11" />
      <path d="M11.5 14V8.5" />
      <path d="M14.5 14V10" />
    </svg>
  );
}

function OpportunityReviewIcon() {
  return (
    <svg
      width="28"
      height="28"
      viewBox="0 0 28 28"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="w-7 h-7"
    >
      <circle cx="14" cy="14" r="9" />
      <path d="M14 5V9" />
      <path d="M14 19V23" />
      <path d="M5 14H9" />
      <path d="M19 14H23" />
      <circle cx="14" cy="14" r="3.5" strokeDasharray="2 2" />
    </svg>
  );
}

function DocumentationSupportIcon() {
  return (
    <svg
      width="28"
      height="28"
      viewBox="0 0 28 28"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="w-7 h-7"
    >
      <path d="M7 4.5H16.5L22 10V23.5H7V4.5Z" />
      <path d="M16 4.5V10.5H22" />
      <path d="M10.5 14.5H17.5" />
      <path d="M10.5 18H15" />
    </svg>
  );
}

// Subtle topographic contours overlay
function TopographicPattern() {
  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none opacity-[0.055] text-[var(--advisor-cyan)]"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 1200 800"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <path
        d="M 380,80 C 430,120 450,220 420,310 C 390,400 320,440 280,520 C 240,600 250,710 320,780"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.2"
      />
      <path
        d="M 410,70 C 470,120 490,230 460,330 C 430,430 350,470 310,550 C 270,630 280,730 360,790"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.2"
      />
      <path
        d="M 440,60 C 510,120 530,240 500,350 C 470,460 380,500 340,580 C 300,660 310,750 400,800"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.2"
      />
      <path
        d="M 470,50 C 550,120 570,250 540,370 C 510,490 410,530 370,610 C 330,690 340,770 440,810"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.2"
      />
      <path
        d="M 500,40 C 590,120 610,260 580,390 C 550,520 440,560 400,640 C 360,720 370,790 480,820"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.2"
      />
      <path
        d="M 280,180 C 330,180 370,230 360,280 C 350,330 300,360 260,350 C 220,340 200,290 220,240 C 240,190 260,180 280,180 Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.2"
      />
      <path
        d="M 280,150 C 350,150 400,220 390,290 C 380,360 310,400 250,380 C 190,360 170,280 200,220 C 230,160 260,150 280,150 Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.2"
      />
      <path
        d="M 280,120 C 370,120 430,210 420,300 C 410,390 320,440 240,410 C 160,380 140,270 180,200 C 220,130 260,120 280,120 Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.2"
      />
    </svg>
  );
}

// Architectural elevation blueprint drawing for the navy panel
function ArchitecturalLineDrawing() {
  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none opacity-[0.085] text-[var(--advisor-cyan)]"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 400 700"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    >
      <line x1="40" y1="50" x2="360" y2="50" stroke="currentColor" strokeWidth="1" />
      <line x1="40" y1="120" x2="360" y2="120" stroke="currentColor" strokeWidth="1" />
      <line x1="40" y1="240" x2="360" y2="240" stroke="currentColor" strokeWidth="1" />
      <line x1="40" y1="360" x2="360" y2="360" stroke="currentColor" strokeWidth="1" />
      <line x1="40" y1="480" x2="360" y2="480" stroke="currentColor" strokeWidth="1" />
      <line x1="40" y1="600" x2="360" y2="600" stroke="currentColor" strokeWidth="1" />

      <line x1="60" y1="40" x2="60" y2="650" stroke="currentColor" strokeWidth="1" />
      <line x1="140" y1="40" x2="140" y2="650" stroke="currentColor" strokeWidth="1" />
      <line x1="220" y1="40" x2="220" y2="650" stroke="currentColor" strokeWidth="1" />
      <line x1="300" y1="40" x2="300" y2="650" stroke="currentColor" strokeWidth="1" />
      <line x1="340" y1="40" x2="340" y2="650" stroke="currentColor" strokeWidth="1" />

      {/* Balcony and window frames */}
      <rect x="80" y="140" width="40" height="70" fill="none" stroke="currentColor" strokeWidth="1" />
      <rect x="160" y="140" width="40" height="70" fill="none" stroke="currentColor" strokeWidth="1" />
      <rect x="240" y="140" width="40" height="70" fill="none" stroke="currentColor" strokeWidth="1" />

      <rect x="80" y="260" width="40" height="70" fill="none" stroke="currentColor" strokeWidth="1" />
      <rect x="160" y="260" width="40" height="70" fill="none" stroke="currentColor" strokeWidth="1" />
      <rect x="240" y="260" width="40" height="70" fill="none" stroke="currentColor" strokeWidth="1" />

      <rect x="80" y="380" width="40" height="70" fill="none" stroke="currentColor" strokeWidth="1" />
      <rect x="160" y="380" width="40" height="70" fill="none" stroke="currentColor" strokeWidth="1" />
      <rect x="240" y="380" width="40" height="70" fill="none" stroke="currentColor" strokeWidth="1" />

      {/* Stairs & foundation lines */}
      <line x1="40" y1="615" x2="360" y2="615" stroke="currentColor" strokeWidth="1" />
      <line x1="50" y1="630" x2="350" y2="630" stroke="currentColor" strokeWidth="1" />
      <line x1="60" y1="645" x2="340" y2="645" stroke="currentColor" strokeWidth="1" />
    </svg>
  );
}

export function PropertyAdvisorSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const whatsapp = generateWhatsAppUrl({ type: "general" });

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
      { threshold: 0.15 }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      aria-labelledby="advisor-section-title"
      className="relative w-full bg-[var(--advisor-alabaster)] py-14 sm:py-16 md:py-20 lg:py-24"
    >
      {/* Max-width container */}
      <div className="max-w-[1380px] mx-auto px-5 sm:px-8 md:px-10 lg:px-14 xl:px-16">

      {/* Main Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-8 lg:gap-12 xl:gap-16 items-center">
        {/* Left Column */}
        <div
          className={`md:col-span-7 flex flex-col justify-center transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
          }`}
        >
          {/* Eyebrow */}
          <div className="flex items-center gap-3 mb-4 sm:mb-5">
            <div className="w-7 sm:w-8 h-[2px] bg-[var(--advisor-blue)] rounded-full flex-shrink-0" aria-hidden="true" />
            <span className="text-[11px] sm:text-[12px] font-bold tracking-[0.18em] uppercase text-[var(--advisor-blue)]">
              Meet Your Property Advisor
            </span>
          </div>

          {/* Primary Heading */}
          <h2
            id="advisor-section-title"
            className="font-instrument text-[2.2rem] sm:text-[2.7rem] md:text-[3rem] lg:text-[3.35rem] xl:text-[3.75rem] text-[var(--advisor-midnight)] font-normal leading-[1.02] tracking-tight mt-1 sm:mt-1.5 mb-3 sm:mb-3.5 max-w-[640px]"
          >
            Property guidance,
            <br />
            shaped around you.
          </h2>

          {/* Supporting Copy with Advisor Name */}
          <p className="text-[14px] sm:text-[15px] md:text-[15.5px] lg:text-[16.5px] text-[var(--advisor-graphite)] leading-[1.5] max-w-[580px] font-normal mb-3.5 sm:mb-4">
            Direct one-on-one advisory led by Senior Property Advisor{" "}
            <strong className="text-[var(--advisor-midnight)] font-semibold">{siteConfig.agent.name}</strong>{" "}
            (RERA: {siteConfig.agent.reraNo}). Clear legal verification, realistic land valuations, and transparent guidance from first conversation to final registry.
          </p>

          {/* Stats — inline row with thin dividers */}
          <div className="flex items-center max-w-[580px] mb-4 sm:mb-5 bg-white border border-[rgba(6,30,46,0.08)] rounded-xl px-3 sm:px-4 py-3 shadow-[0_1px_8px_rgba(6,30,46,0.05)]">
            {/* Stat 1 */}
            <div className="flex items-center gap-2.5 flex-1 min-w-0">
              <Award size={17} className="text-[var(--advisor-blue)] flex-shrink-0" strokeWidth={1.6} aria-hidden="true" />
              <div className="min-w-0">
                <p className="text-[var(--advisor-midnight)] font-bold text-[13px] sm:text-sm leading-tight">{siteConfig.agent.experience}</p>
                <p className="text-[var(--advisor-muted)] text-[10px] sm:text-[11px] leading-tight truncate">Dedicated Land Advisory</p>
              </div>
            </div>
            {/* Divider */}
            <div className="w-px h-9 bg-[rgba(6,30,46,0.1)] mx-3 flex-shrink-0" aria-hidden="true" />
            {/* Stat 2 */}
            <div className="flex items-center gap-2.5 flex-1 min-w-0">
              <Users size={17} className="text-[var(--advisor-blue)] flex-shrink-0" strokeWidth={1.6} aria-hidden="true" />
              <div className="min-w-0">
                <p className="text-[var(--advisor-midnight)] font-bold text-[13px] sm:text-sm leading-tight">{siteConfig.agent.clients} Clients</p>
                <p className="text-[var(--advisor-muted)] text-[10px] sm:text-[11px] leading-tight truncate">Families &amp; Investors</p>
              </div>
            </div>
            {/* Divider */}
            <div className="w-px h-9 bg-[rgba(6,30,46,0.1)] mx-3 flex-shrink-0" aria-hidden="true" />
            {/* Stat 3 */}
            <div className="flex items-center gap-2.5 flex-1 min-w-0">
              <BarChart3 size={17} className="text-[var(--advisor-blue)] flex-shrink-0" strokeWidth={1.6} aria-hidden="true" />
              <div className="min-w-0">
                <p className="text-[var(--advisor-midnight)] font-bold text-[13px] sm:text-sm leading-tight">{siteConfig.agent.salesExperience}</p>
                <p className="text-[var(--advisor-muted)] text-[10px] sm:text-[11px] leading-tight truncate">Plots &amp; Land Sold</p>
              </div>
            </div>
          </div>

          {/* Expertise Items List */}
          <div className="space-y-0 max-w-[580px] mb-5 sm:mb-6">
            <AdvisorExpertiseItem
              icon={<MarketIntelligenceIcon />}
              title="Local market intelligence"
              description="Neighbourhood context, corridor pricing and infrastructure potential"
              hasSeparator={true}
            />
            <AdvisorExpertiseItem
              icon={<OpportunityReviewIcon />}
              title="Independent opportunity review"
              description="Objective title checks, JDA / RERA verification before you commit"
              hasSeparator={true}
            />
            <AdvisorExpertiseItem
              icon={<DocumentationSupportIcon />}
              title="Documentation and closing support"
              description="Registry, Patta, Sub-Registrar execution and transparent handover"
              hasSeparator={false}
            />
          </div>

          {/* CTAs & Direct Contact Row */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 mb-3">
            {/* Primary CTA Button */}
            <a
              href={whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center justify-center gap-2.5 bg-[var(--advisor-midnight)] hover:bg-[var(--advisor-blue)] active:scale-[0.985] text-[var(--advisor-ivory)] px-5 sm:px-7 min-h-[48px] sm:h-[50px] py-2.5 sm:py-0 rounded-lg sm:rounded-[8px] text-[13.5px] xs:text-[14px] sm:text-[14.5px] font-semibold tracking-normal whitespace-nowrap transition-all duration-300 shadow-[0_4px_14px_rgba(6,30,46,0.12)] hover:shadow-[0_6px_20px_rgba(8,127,195,0.28)]"
            >
              <span>Consult with Suresh Kumawat</span>
              <ArrowRight
                size={16}
                className="flex-shrink-0 transition-transform duration-300 group-hover:translate-x-1"
                aria-hidden="true"
              />
            </a>

            {/* Direct Phone & Email Links */}
            <div className="flex items-center gap-2">
              <a
                href={`tel:${siteConfig.agent.phone.replace(/[^0-9+]/g, "")}`}
                className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-lg bg-white border border-[var(--advisor-border)] text-[var(--advisor-midnight)] hover:text-[var(--advisor-blue)] hover:border-[var(--advisor-blue)] text-xs font-semibold shadow-2xs transition-colors"
                title={`Call ${siteConfig.agent.phone}`}
              >
                <Phone size={13} className="text-[var(--advisor-blue)]" />
                <span>{siteConfig.agent.displayPhone}</span>
              </a>
              <a
                href={`mailto:${siteConfig.agent.email}`}
                className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-lg bg-white border border-[var(--advisor-border)] text-[var(--advisor-midnight)] hover:text-[var(--advisor-blue)] hover:border-[var(--advisor-blue)] text-xs font-semibold shadow-2xs transition-colors"
                title={`Email ${siteConfig.agent.email}`}
              >
                <Mail size={13} className="text-[var(--advisor-blue)]" />
                <span className="hidden xs:inline">{siteConfig.agent.email}</span>
                <span className="xs:hidden">Email</span>
              </a>
            </div>
          </div>

          {/* Trust Note */}
          <div className="flex items-center gap-2 mt-1 text-[var(--advisor-muted)] text-[12px] sm:text-[12.5px]">
            <Lock size={13} className="flex-shrink-0 opacity-80" aria-hidden="true" />
            <span>RERA Registered: {siteConfig.agent.reraNo} &bull; Confidential, zero-pressure advisory.</span>
          </div>
        </div>

        {/* Right Column: Interactive Digital Visiting Card */}
        <div
          className={`md:col-span-5 transition-all duration-700 delay-200 ease-[cubic-bezier(0.22,1,0.36,1)] ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <DigitalVisitingCard />
        </div>
      </div>{/* end grid */}
      </div>{/* end max-w container */}
    </section>
  );
}

"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Lock } from "lucide-react";
import { AdvisorExpertiseItem } from "./AdvisorExpertiseItem";
import { AdvisorProfilePlaque } from "./AdvisorProfilePlaque";
import { generateWhatsAppUrl } from "@/lib/whatsapp";

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
      className="relative w-[calc(100%-32px)] sm:w-[calc(100%-48px)] max-w-[1900px] mx-auto my-8 sm:my-10 md:my-12 rounded-[18px] sm:rounded-[24px] md:rounded-[28px] overflow-hidden border border-[var(--advisor-border)] bg-[var(--advisor-alabaster)] shadow-[0_16px_40px_rgba(6,30,46,0.06)]"
    >
      {/* Topographic Background Overlay across alabaster area */}
      <TopographicPattern />

      {/* Midnight Navy Architectural Wing on Desktop & Tablet Right Edge */}
      <div
        className="hidden md:block absolute top-0 right-0 bottom-0 w-[34%] xl:w-[35%] bg-[var(--advisor-midnight)] z-0"
        aria-hidden="true"
      >
        <ArchitecturalLineDrawing />
      </div>

      {/* Main Grid Content: Left Content Area + Right Image Area */}
      <div className="relative z-10 grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-6 lg:gap-8 xl:gap-10 items-center">
        {/* Left Column: Editorial Content */}
        <div
          className={`md:col-span-7 xl:col-span-7 px-5 py-7 sm:px-8 sm:py-8 md:py-8 md:pl-10 lg:py-10 lg:pl-12 xl:pl-16 lg:pr-4 flex flex-col justify-center transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${
            isVisible
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-6"
          }`}
        >
          {/* Eyebrow */}
          <div className="flex items-center">
            <span className="text-[11.5px] sm:text-[12.5px] font-bold tracking-[0.16em] uppercase text-[var(--advisor-blue)] font-body">
              PRIVATE CLIENT ADVISORY
            </span>
          </div>

          {/* Primary Heading */}
          <h2
            id="advisor-section-title"
            className="font-instrument text-[2.2rem] sm:text-[2.7rem] md:text-[3rem] lg:text-[3.35rem] xl:text-[3.75rem] text-[var(--advisor-midnight)] font-normal leading-[1.02] tracking-tight mt-2.5 sm:mt-3 mb-3 sm:mb-3.5 max-w-[620px]"
          >
            Property guidance,
            <br />
            shaped around you.
          </h2>

          {/* Supporting Copy */}
          <p className="text-[14px] sm:text-[15px] md:text-[15.5px] lg:text-[16.5px] text-[var(--advisor-graphite)] leading-[1.5] max-w-[560px] font-normal mb-3.5 sm:mb-4">
            Local insight, verified opportunities and clear advice—from the first
            conversation to final documentation.
          </p>

          {/* Expert Statement */}
          <div className="mb-3.5 sm:mb-4">
            <p className="font-instrument text-[17.5px] sm:text-[19.5px] md:text-[21px] lg:text-[23px] text-[var(--advisor-midnight)] font-normal leading-[1.22] max-w-[560px]">
              Every recommendation begins with your goals, not a listing.
            </p>
          </div>

          {/* Expertise Items List */}
          <div className="space-y-0 max-w-[560px] mb-5 sm:mb-6">
            <AdvisorExpertiseItem
              icon={<MarketIntelligenceIcon />}
              title="Local market intelligence"
              description="Neighbourhood context and long-term potential"
              hasSeparator={true}
            />
            <AdvisorExpertiseItem
              icon={<OpportunityReviewIcon />}
              title="Independent opportunity review"
              description="Clear evaluation before you commit"
              hasSeparator={true}
            />
            <AdvisorExpertiseItem
              icon={<DocumentationSupportIcon />}
              title="Documentation and closing support"
              description="Guidance through every critical step"
              hasSeparator={false}
            />
          </div>

          {/* CTAs Row */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 sm:gap-6">
            {/* Primary CTA Button */}
            <a
              href={whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center justify-center gap-2.5 bg-[var(--advisor-midnight)] hover:bg-[var(--advisor-blue)] active:scale-[0.985] text-[var(--advisor-ivory)] px-5 sm:px-7 min-h-[48px] sm:h-[50px] py-2.5 sm:py-0 rounded-lg sm:rounded-[8px] text-[13.5px] xs:text-[14px] sm:text-[14.5px] font-semibold tracking-normal whitespace-nowrap transition-all duration-300 shadow-[0_4px_14px_rgba(6,30,46,0.12)] hover:shadow-[0_6px_20px_rgba(8,127,195,0.28)]"
            >
              <span>Schedule a private consultation</span>
              <ArrowRight
                size={16}
                className="flex-shrink-0 transition-transform duration-300 group-hover:translate-x-1"
                aria-hidden="true"
              />
            </a>

            {/* Secondary CTA Link */}
            <Link
              href="/about"
              className="group inline-flex items-center justify-center sm:justify-start gap-2 text-[var(--advisor-midnight)] hover:text-[var(--advisor-blue)] text-[13.5px] sm:text-[14.5px] font-semibold py-1.5 transition-colors duration-300 relative self-center sm:self-auto"
            >
              <span className="relative pb-0.5 border-b-[1.5px] border-[var(--advisor-cyan)] group-hover:border-[var(--advisor-blue)] transition-colors duration-300">
                Meet the advisory team
              </span>
            </Link>
          </div>

          {/* Trust Note */}
          <div className="flex items-center gap-2 mt-2.5 sm:mt-3 text-[var(--advisor-muted)] text-[12px] sm:text-[12.5px]">
            <Lock size={13} className="flex-shrink-0 opacity-80" aria-hidden="true" />
            <span>Confidential, no-pressure consultation.</span>
          </div>
        </div>

        {/* Right Column: Advisor Portrait & Plaque */}
        <div
          className={`md:col-span-5 xl:col-span-5 px-5 sm:px-8 pb-7 sm:pb-8 md:px-0 md:py-6 lg:py-8 md:pr-6 lg:pr-8 xl:pr-10 relative flex justify-center md:justify-end transition-all duration-900 delay-150 ease-[cubic-bezier(0.22,1,0.36,1)] ${
            isVisible
              ? "opacity-100 translate-y-0 scale-100"
              : "opacity-0 translate-y-8 scale-[0.98]"
          }`}
        >
          {/* Portrait Container */}
          <div className="relative w-full max-w-[380px] md:max-w-[390px] lg:max-w-[440px] xl:max-w-[470px] aspect-[4/5] sm:aspect-[3.6/4.5] md:h-[400px] lg:h-[460px] xl:h-[500px] rounded-[10px] rounded-tr-[54px] sm:rounded-tr-[70px] lg:rounded-tr-[84px] overflow-hidden shadow-[0_20px_44px_rgba(6,30,46,0.16)] border border-[rgba(255,255,255,0.2)]">
            <Image
              src="/images/brand/advisor-portrait.png"
              alt="Senior Property Advisor in a luxury real-estate gallery"
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 45vw"
              className="object-cover object-top hover:scale-[1.015] transition-transform duration-700 ease-out"
              priority={false}
            />

            {/* Subtle Gradient Vignette at the bottom for plaque readability on mobile */}
            <div
              className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[rgba(6,30,46,0.5)] to-transparent md:hidden pointer-events-none"
              aria-hidden="true"
            />
          </div>

          {/* Profile Plaque Overlay */}
          <div className="absolute left-4 sm:left-6 md:left-[-18px] lg:left-[-26px] xl:left-[-32px] bottom-3 sm:bottom-4 md:bottom-5 lg:bottom-6 z-20 w-[calc(100%-32px)] sm:w-auto">
            <AdvisorProfilePlaque />
          </div>
        </div>
      </div>
    </section>
  );
}

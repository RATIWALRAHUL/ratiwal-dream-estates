"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  Phone,
  Mail,
  Users,
  TrendingUp,
  ShieldCheck,
} from "lucide-react";
import { advisorData } from "@/data/advisorData";

/* ─────────────────────────────────────────────────────────────────────────────
   Architectural backdrop SVG — subtle, felt not noticed
───────────────────────────────────────────────────────────────────────────── */
function ArchitecturalBackdrop() {
  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 620 820"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    >
      <g fill="none" strokeLinecap="round" strokeLinejoin="round">
        {/* Modern building right-side elevation */}
        <g stroke="#0798D8" strokeWidth="1" opacity="0.18">
          <line x1="370" y1="60" x2="370" y2="820" />
          <line x1="420" y1="120" x2="420" y2="820" />
          <line x1="470" y1="160" x2="470" y2="820" />
          <line x1="520" y1="100" x2="520" y2="820" />
          <line x1="570" y1="140" x2="570" y2="820" />
          <path d="M 350 200 L 420 120 L 490 160 L 560 100 L 620 140" strokeWidth="1.5" />
          <path d="M 370 280 L 470 200 L 570 240" />
          <line x1="350" y1="300" x2="620" y2="300" strokeWidth="0.8" strokeDasharray="4 4" opacity="0.4" />
          <line x1="350" y1="420" x2="620" y2="420" strokeWidth="0.8" strokeDasharray="4 4" opacity="0.4" />
          <line x1="350" y1="540" x2="620" y2="540" strokeWidth="0.8" strokeDasharray="4 4" opacity="0.4" />
        </g>
        {/* Right-side building windows grid */}
        <g stroke="#0798D8" strokeWidth="0.8" opacity="0.12">
          {[300, 360, 420, 480, 540, 600].map((y) =>
            [390, 440, 490, 540].map((x) => (
              <rect key={`${x}-${y}`} x={x} y={y} width="22" height="34" rx="2" />
            ))
          )}
        </g>
        {/* Gold accent geometric */}
        <g stroke="#D9A62E" strokeWidth="1" opacity="0.15">
          <polygon points="460,160 520,100 580,160 520,220" />
          <line x1="520" y1="80" x2="520" y2="820" strokeWidth="1.5" opacity="0.2" />
        </g>
      </g>
    </svg>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   Brand Logo (vector) — top-left of navy panel
───────────────────────────────────────────────────────────────────────────── */
function BrandLogo() {
  return (
    <div className="flex items-center gap-2.5 min-w-0">
      <svg
        width="36"
        height="36"
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="flex-shrink-0"
        aria-hidden="true"
      >
        <path d="M 18 52 L 50 20 L 82 52" stroke="#0798D8" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
        <line x1="24" y1="58" x2="24" y2="80" stroke="#0798D8" strokeWidth="6" strokeLinecap="round" />
        <line x1="36" y1="42" x2="36" y2="90" stroke="#0798D8" strokeWidth="6" strokeLinecap="round" />
        <line x1="50" y1="28" x2="50" y2="96" stroke="#0798D8" strokeWidth="6" strokeLinecap="round" />
        <line x1="64" y1="18" x2="64" y2="90" stroke="#0798D8" strokeWidth="6" strokeLinecap="round" />
        <line x1="76" y1="58" x2="76" y2="80" stroke="#0798D8" strokeWidth="6" strokeLinecap="round" />
      </svg>
      <div className="flex flex-col min-w-0">
        <div className="flex items-baseline gap-1.5 font-extrabold text-[16px] sm:text-[18px] tracking-[0.02em] leading-tight">
          <span className="text-white">RATIWAL</span>
          <span className="text-[#0798D8]">DREAM</span>
        </div>
        <span className="text-white/75 font-medium text-[8.5px] sm:text-[10px] tracking-[0.26em] uppercase leading-none mt-0.5">
          ESTATES
        </span>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   WhatsApp SVG icon
───────────────────────────────────────────────────────────────────────────── */
function WhatsAppIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   Stat Item
───────────────────────────────────────────────────────────────────────────── */
function StatItem({
  icon: Icon,
  value,
  label1,
  label2,
}: {
  icon: React.ElementType;
  value: string;
  label1: string;
  label2: string;
}) {
  return (
    <div className="flex items-start gap-3 min-w-0">
      <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full border border-[#0798D8]/30 flex items-center justify-center text-[#0798D8] flex-shrink-0 mt-1">
        <Icon size={18} strokeWidth={1.8} />
      </div>
      <div className="min-w-0">
        <div className="text-[2rem] sm:text-[2.2rem] font-extrabold text-[#0B2239] leading-none tracking-tight font-body">
          {value}
        </div>
        <div className="text-[12.5px] sm:text-[13.5px] font-semibold text-[#0B2239] mt-1 leading-snug whitespace-nowrap">
          {label1}
        </div>
        <div className="text-[11.5px] sm:text-[12.5px] text-[#52657A] font-normal leading-snug whitespace-nowrap">
          {label2}
        </div>
      </div>
    </div>
  );
}



/* ─────────────────────────────────────────────────────────────────────────────
   Main Component
───────────────────────────────────────────────────────────────────────────── */
export function PropertyAdvisorSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  const whatsappMessage = encodeURIComponent(
    "Hello Suresh, I would like to discuss a property opportunity."
  );
  const whatsappUrl = `https://wa.me/919929533436?text=${whatsappMessage}`;

  useEffect(() => {
    const node = sectionRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) { setIsVisible(true); observer.disconnect(); }
      },
      { threshold: 0.08 }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="property-advisor"
      aria-labelledby="advisor-heading"
      className="relative w-full bg-[#F7F5EF] overflow-hidden"
    >
      {/* ── MAIN CONTENT ─────────────────────────────────────────────────────── */}
      <div className="max-w-[1500px] mx-auto px-5 sm:px-8 md:px-10 lg:px-14 xl:px-16 py-16 sm:py-20 lg:py-24 xl:py-28">
        <div className="grid grid-cols-1 lg:grid-cols-[54fr_46fr] gap-12 lg:gap-14 xl:gap-18 items-stretch">

          {/* ================================================================
              LEFT COLUMN
          ================================================================ */}
          <div
            className={`flex flex-col gap-8 sm:gap-9 transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
          >
            {/* ── TOP CONTENT ─────────────────────────────────────────────── */}
            <div>
              {/* EYEBROW */}
              <div className="flex items-center gap-3 mb-5 sm:mb-6">
                <div className="w-10 sm:w-14 h-[1.5px] bg-[#0798D8]" aria-hidden="true" />
                <span className="text-[11.5px] sm:text-[13px] font-bold tracking-[0.14em] uppercase text-[#0798D8] font-body">
                  DIRECT PROPERTY ADVISORY
                </span>
              </div>

              {/* MAIN HEADING */}
              <h2
                id="advisor-heading"
                className="font-instrument font-normal text-[#0B2239] leading-[1.08] tracking-tight mb-5 sm:mb-6
                           text-[1.85rem] xs:text-[2.15rem] sm:text-[2.9rem] md:text-[3.5rem] lg:text-[3.8rem]"
              >
                Property guidance,
                <br />
                shaped around you.
              </h2>

              {/* GOLD DIVIDER */}
              <div className="w-[62px] h-[3px] bg-[#D9A62E] mb-6 sm:mb-7" aria-hidden="true" />

              {/* DESCRIPTION */}
              <p className="text-[15px] sm:text-[17px] text-[#52657A] leading-[1.62] max-w-[640px]">
                Direct one-on-one advisory led by Senior Property Advisor{" "}
                <strong className="text-[#0B2239] font-semibold">{advisorData.name}</strong>{" "}
                (RERA: {advisorData.rera}). Clear legal verification, genuine corridor
                valuations, and transparent guidance from initial enquiry to final registry.
              </p>

              {/* EDITORIAL STATS ROW */}
              <div className="flex items-start flex-wrap gap-y-6 gap-x-6 sm:gap-x-8 lg:gap-x-10 border-t border-b border-[#0B2239]/10 py-6 sm:py-7">
                <StatItem icon={Users} value="8+" label1="Years Exp." label2="Land Advisory" />
                <div className="w-px self-stretch bg-[#D9A62E]/40 hidden xs:block" aria-hidden="true" />
                <StatItem icon={Users} value="250+" label1="Families" label2="Guided" />
                <div className="w-px self-stretch bg-[#D9A62E]/40 hidden xs:block" aria-hidden="true" />
                <StatItem icon={TrendingUp} value="50K+" label1="Sq. Yards" label2="Transacted" />
              </div>
            </div>

            {/* ── CTA BUTTONS ─────────────────────────────────────────────── */}
            <div>
              <div className="flex flex-wrap gap-3 sm:gap-4 mb-4">
                {/* WhatsApp */}
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2.5 bg-[#25D366] hover:bg-[#1da956] text-white
                             h-[52px] sm:h-[56px] px-5 sm:px-7 rounded-full
                             text-[14px] sm:text-[15px] font-bold whitespace-nowrap
                             shadow-[0_4px_18px_rgba(37,211,102,0.3)] hover:shadow-[0_6px_24px_rgba(37,211,102,0.4)]
                             transition-all duration-250 active:scale-[0.98]"
                  aria-label={`Message ${advisorData.name} on WhatsApp`}
                >
                  <WhatsAppIcon className="w-5 h-5 flex-shrink-0" />
                  WhatsApp
                </a>

                {/* Call */}
                <a
                  href={`tel:${advisorData.phoneRaw}`}
                  className="inline-flex items-center gap-2.5 bg-white hover:bg-[#f0f7fd] text-[#0B2239]
                             border border-[#0798D8]/40 hover:border-[#0798D8]
                             h-[52px] sm:h-[56px] px-5 sm:px-7 rounded-full
                             text-[14px] sm:text-[15px] font-bold whitespace-nowrap
                             shadow-[0_2px_10px_rgba(7,152,216,0.1)] hover:shadow-[0_4px_16px_rgba(7,152,216,0.18)]
                             transition-all duration-250 active:scale-[0.98]"
                >
                  <Phone size={17} className="text-[#0798D8]" strokeWidth={2} />
                  Call Advisor
                </a>

                {/* Email */}
                <a
                  href={`mailto:${advisorData.email}`}
                  className="inline-flex items-center gap-2.5 bg-white hover:bg-[#f0f7fd] text-[#0B2239]
                             border border-[#0798D8]/40 hover:border-[#0798D8]
                             h-[52px] sm:h-[56px] px-5 sm:px-7 rounded-full
                             text-[14px] sm:text-[15px] font-bold whitespace-nowrap
                             shadow-[0_2px_10px_rgba(7,152,216,0.1)] hover:shadow-[0_4px_16px_rgba(7,152,216,0.18)]
                             transition-all duration-250 active:scale-[0.98]"
                >
                  <Mail size={17} className="text-[#0798D8]" strokeWidth={2} />
                  Send Email
                </a>
              </div>

              {/* FOOTNOTE */}
              <p className="text-[12px] sm:text-[13px] text-[#8A9BAA] font-medium">
                RERA Registered: {advisorData.rera} &bull; 100% Free &amp; Confidential Advisory
              </p>
            </div>
          </div>

          {/* ================================================================
              RIGHT COLUMN — NAVY PANEL
          ================================================================ */}
          <div
            className={`relative flex h-full transition-all duration-700 delay-200 ease-[cubic-bezier(0.22,1,0.36,1)] ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
            }`}
          >
            <div className="relative w-full h-full
                            bg-[#082A40] rounded-[28px] sm:rounded-[32px] overflow-hidden
                            shadow-[0_30px_80px_rgba(4,18,31,0.45)] border border-white/[0.07]
                            flex flex-col select-none">

              {/* Subtle top-left radial glow */}
              <div className="absolute top-0 left-0 w-[300px] h-[300px] rounded-full bg-[#0798D8]/12 blur-[80px] pointer-events-none" aria-hidden="true" />
              {/* Subtle bottom-right warm glow */}
              <div className="absolute bottom-0 right-0 w-[280px] h-[280px] rounded-full bg-[#D9A62E]/08 blur-[70px] pointer-events-none" aria-hidden="true" />

              {/* Architectural backdrop */}
              <ArchitecturalBackdrop />

              {/* ── TOP BAR: Logo + RERA badge ─────────────────────────── */}
              <div className="relative z-30 flex items-center justify-between gap-3 px-5 sm:px-7 pt-5 sm:pt-6">
                <BrandLogo />

                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[#D9A62E] bg-transparent flex-shrink-0">
                  <ShieldCheck size={13} className="text-[#D9A62E]" strokeWidth={2.2} aria-hidden="true" />
                  <span className="text-white text-[9px] sm:text-[10.5px] font-bold tracking-[0.07em] uppercase whitespace-nowrap">
                    RERA VERIFIED
                  </span>
                </div>
              </div>

              {/* ── GOLD DIVIDER below header ──────────────────────────── */}
              <div className="relative z-20 mx-5 sm:mx-7 mt-4 w-14 h-[2px] bg-[#D9A62E]" aria-hidden="true" />

              {/* ── TRUST MOTTO ────────────────────────────────────────── */}
              <div className="relative z-20 px-5 sm:px-7 mt-4 sm:mt-5">
                <p className="text-[#D9A62E] font-bold text-[13px] sm:text-[14.5px] tracking-[0.14em] uppercase leading-[1.7] font-body max-w-[200px]">
                  TRUSTED GUIDANCE
                  <br />
                  FOR A BRIGHTER
                  <br />
                  TOMORROW
                </p>
              </div>

              {/* ── RIGHT SIDE VERTICAL TEXT ─────────────────────────── */}
              <div className="absolute right-5 sm:right-6 top-[180px] sm:top-[200px] z-20 flex flex-col gap-1 pointer-events-none" aria-hidden="true">
                {["PEOPLE", "TRUST", "", "PROPERTIES", "GROW", "", "RELATIONSHIPS", "LAST"].map((word, i) =>
                  word === "" ? (
                    <div key={i} className="h-4 w-px bg-[#D9A62E]/30 mx-auto" />
                  ) : (
                    <span key={i} className="text-white/70 font-bold text-[7.5px] sm:text-[8.5px] tracking-[0.18em] uppercase leading-none">
                      {word}
                    </span>
                  )
                )}
              </div>

              {/* ── SCRIPT SIGNATURE OVERLAY ─────────────────────────── */}
              <div className="absolute left-5 sm:left-7 top-[210px] sm:top-[240px] z-10 pointer-events-none" aria-hidden="true">
                <div className="font-signature text-[34px] sm:text-[42px] text-white/15 leading-[1.1] -rotate-6">
                  Suresh
                  <br />
                  Kumawat
                </div>
              </div>

              {/* ── CONSULTANT PORTRAIT ──────────────────────────────── */}
              <div className="absolute left-1/2 -translate-x-1/2 bottom-[88px] sm:bottom-[96px] z-[15] pointer-events-none w-[72%] sm:w-[68%] lg:w-[72%]" style={{top: "140px"}}>
                {/* Portrait fade at bottom */}
                <div className="absolute bottom-0 inset-x-0 h-[35%] bg-gradient-to-t from-[#082A40]/90 via-[#082A40]/30 to-transparent z-10" aria-hidden="true" />

                <div className="relative w-full h-full">
                  <Image
                    src={advisorData.imageCutout}
                    alt={`${advisorData.name} — Senior Property Advisor`}
                    fill
                    priority
                    sizes="(max-width: 768px) 80vw, 45vw"
                    className="object-contain object-top drop-shadow-[0_12px_30px_rgba(0,0,0,0.65)]"
                  />
                </div>
              </div>

              {/* ── ADVISOR IDENTITY CARD ────────────────────────────── */}
              <div className="relative z-30 mt-auto mx-4 sm:mx-5 mb-4 sm:mb-5">
                <div className="bg-[#051822]/85 backdrop-blur-md rounded-[18px] sm:rounded-[22px] border border-white/[0.12] px-4 sm:px-5 py-3.5 sm:py-4">
                  {/* Name + Role */}
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-white font-bold text-[20px] sm:text-[24px] font-playfair leading-tight tracking-tight">
                        {advisorData.name}
                      </h3>
                      <div className="text-[#D9A62E] text-[9.5px] sm:text-[10.5px] font-extrabold tracking-[0.14em] uppercase mt-0.5">
                        SENIOR PROPERTY ADVISOR
                      </div>
                      <div className="text-white/75 text-[12px] sm:text-[13px] font-medium mt-0.5">
                        {advisorData.role}
                      </div>
                      <div className="text-white/50 text-[11px] sm:text-[11.5px] font-mono mt-0.5">
                        RERA: {advisorData.rera}
                      </div>
                    </div>
                  </div>


                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* ── BOTTOM EDITORIAL SIGNATURE LINE ────────────────────────────────── */}
      <div className="max-w-[1500px] mx-auto px-5 sm:px-8 md:px-10 lg:px-14 xl:px-16 pb-10 sm:pb-12">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-baseline gap-2.5">
            <span className="font-signature text-[28px] sm:text-[34px] text-[#0B2239]/40 leading-none -rotate-3 inline-block">
              Let&apos;s Build
            </span>
            <span className="text-[10.5px] sm:text-[12px] font-bold text-[#0B2239]/35 tracking-[0.14em] uppercase">
              A BETTER TOMORROW
            </span>
            <div className="hidden sm:block h-px flex-1 min-w-[60px] bg-[#0B2239]/15" />
          </div>
          <div className="hidden sm:flex items-center gap-3 text-[10.5px] sm:text-[12px] font-bold text-[#0B2239]/35 tracking-[0.12em] uppercase whitespace-nowrap">
            <span>LAND</span>
            <span className="text-[#D9A62E]/50">|</span>
            <span>PEOPLE</span>
            <span className="text-[#D9A62E]/50">|</span>
            <span>OPPORTUNITY</span>
          </div>
        </div>
      </div>
    </section>
  );
}

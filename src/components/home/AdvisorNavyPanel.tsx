"use client";

import React from "react";
import Image from "next/image";
import { ShieldCheck, Phone } from "lucide-react";
import { advisorData } from "@/data/advisorData";

// Geometric architectural blueprint lines for subtle luxury backdrop
function ArchitecturalBlueprintBackdrop() {
  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none opacity-15 text-[#52BDE9]"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 600 700"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    >
      <g stroke="currentColor" strokeWidth="1" fill="none">
        <line x1="80" y1="100" x2="80" y2="650" strokeDasharray="4 4" opacity="0.3" />
        <line x1="520" y1="100" x2="520" y2="650" strokeDasharray="4 4" opacity="0.3" />
        <path d="M 120 400 L 300 240 L 480 400" strokeWidth="1.5" stroke="currentColor" opacity="0.5" />
        <path d="M 160 420 L 300 290 L 440 420" strokeWidth="1" stroke="currentColor" opacity="0.3" />
        <line x1="140" y1="320" x2="140" y2="680" opacity="0.4" />
        <line x1="200" y1="280" x2="200" y2="680" opacity="0.4" />
        <line x1="400" y1="280" x2="400" y2="680" opacity="0.4" />
        <line x1="460" y1="320" x2="460" y2="680" opacity="0.4" />
      </g>
    </svg>
  );
}

// Crisp Vector Brand Logo
function BrandLogo() {
  return (
    <div className="flex items-center gap-1.5 sm:gap-2.5 min-w-0">
      <svg
        width="28"
        height="28"
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="flex-shrink-0 sm:w-8 sm:h-8"
        aria-hidden="true"
      >
        <path
          d="M 22 52 L 50 24 L 78 52"
          stroke="#0798D8"
          strokeWidth="6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <line x1="28" y1="58" x2="28" y2="76" stroke="#0798D8" strokeWidth="5" strokeLinecap="round" />
        <line x1="39" y1="42" x2="39" y2="88" stroke="#0798D8" strokeWidth="5" strokeLinecap="round" />
        <line x1="50" y1="30" x2="50" y2="95" stroke="#0798D8" strokeWidth="5" strokeLinecap="round" />
        <line x1="61" y1="20" x2="61" y2="90" stroke="#0798D8" strokeWidth="5" strokeLinecap="round" />
        <line x1="72" y1="58" x2="72" y2="76" stroke="#0798D8" strokeWidth="5" strokeLinecap="round" />
      </svg>
      <div className="flex flex-col min-w-0">
        <div className="flex items-center gap-1 text-white font-extrabold text-[12px] sm:text-[15px] tracking-[0.03em] leading-tight">
          <span>RATIWAL</span>
          <span className="text-[#0798D8]">DREAM</span>
        </div>
        <span className="text-white/75 font-medium text-[7px] sm:text-[9px] tracking-[0.22em] uppercase leading-none mt-0.5">
          ESTATES
        </span>
      </div>
    </div>
  );
}

export function AdvisorNavyPanel() {
  return (
    <div className="relative w-full h-full min-h-[460px] xs:min-h-[490px] sm:min-h-[530px] lg:min-h-[580px] xl:min-h-[600px] bg-gradient-to-b from-[#0B253A] via-[#071D2F] to-[#04121F] rounded-[20px] sm:rounded-[28px] lg:rounded-[32px] overflow-hidden flex flex-col justify-between shadow-[0_20px_50px_rgba(4,18,31,0.35)] border border-[rgba(255,255,255,0.08)] select-none">
      {/* Dynamic Ambient Glow Layers */}
      <div
        className="absolute top-0 right-1/4 w-[340px] h-[340px] rounded-full bg-[#0798D8]/15 blur-[80px] pointer-events-none"
        aria-hidden="true"
      />
      <div
        className="absolute bottom-1/4 left-10 w-[260px] h-[260px] rounded-full bg-[#D9A62E]/10 blur-[70px] pointer-events-none"
        aria-hidden="true"
      />

      {/* Subtle Architectural Blueprint Vector */}
      <ArchitecturalBlueprintBackdrop />

      {/* Top Header Row: Brand Logo & RERA Verified Pill */}
      <div className="relative z-30 px-3.5 sm:px-6 pt-3.5 sm:pt-5 flex items-center justify-between gap-2">
        {/* Company Logo */}
        <BrandLogo />

        {/* RERA Verified Badge - Compact & Non-Overflowing */}
        <div className="inline-flex items-center gap-1 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full border border-[#D9A62E]/70 bg-[#0B253A]/85 backdrop-blur-md shadow-[0_2px_10px_rgba(217,166,46,0.18)] flex-shrink-0">
          <ShieldCheck size={11} className="text-[#D9A62E] flex-shrink-0 sm:w-3.5 sm:h-3.5" strokeWidth={2.4} aria-hidden="true" />
          <span className="text-white text-[8.5px] sm:text-[10.5px] font-bold tracking-[0.06em] uppercase whitespace-nowrap">
            RERA VERIFIED
          </span>
        </div>
      </div>

      {/* Advisor Centered/Anchored Cutout Portrait (Zero Obstructions) */}
      <div className="absolute inset-x-0 bottom-0 h-[80%] xs:h-[82%] sm:h-[85%] lg:h-[88%] z-10 pointer-events-none flex items-end justify-center">
        {/* Subtle Radial Backlight Arch */}
        <div
          className="absolute bottom-0 w-[85%] h-[75%] rounded-t-full bg-radial from-[#0798D8]/20 via-[#0798D8]/5 to-transparent blur-2xl pointer-events-none"
          aria-hidden="true"
        />

        <div className="relative w-[280px] xs:w-[320px] sm:w-[380px] lg:w-[420px] xl:w-[440px] h-full max-h-[500px]">
          <Image
            src={advisorData.imageCutout}
            alt={`${advisorData.name} - ${advisorData.designation}`}
            fill
            priority
            sizes="(max-width: 768px) 90vw, (max-width: 1200px) 45vw, 450px"
            className="object-contain object-bottom drop-shadow-[0_16px_36px_rgba(0,0,0,0.6)]"
          />
        </div>
      </div>

      {/* Bottom Glassmorphic Consultant Spotlight Card */}
      <div className="relative z-30 p-3 sm:p-4 m-2.5 sm:m-4 rounded-[16px] sm:rounded-[20px] bg-[#071D2F]/94 backdrop-blur-xl border border-white/12 shadow-[0_10px_30px_rgba(0,0,0,0.45)]">
        <div className="flex items-center justify-between gap-2.5">
          {/* Left Info: Name & Role */}
          <div className="flex flex-col min-w-0 flex-1">
            <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
              <h3 className="text-white font-extrabold text-[14px] sm:text-[17px] tracking-tight leading-snug whitespace-nowrap">
                {advisorData.name}
              </h3>
              <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-[#D9A62E]/20 text-[#D9A62E] text-[8.5px] sm:text-[9.5px] font-bold uppercase tracking-wider whitespace-nowrap">
                Senior Advisor
              </span>
            </div>
            <p className="text-[#A5B9C9] text-[10.5px] sm:text-[12px] font-medium leading-tight mt-0.5 truncate">
              {advisorData.designation} • RERA: {advisorData.rera}
            </p>
          </div>

          {/* Right Direct Call Action */}
          <div className="flex items-center flex-shrink-0">
            <a
              href={`tel:${advisorData.phoneRaw}`}
              className="inline-flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#0798D8] hover:bg-[#0684bd] text-white transition-transform duration-200 active:scale-95 shadow-[0_2px_10px_rgba(7,152,216,0.4)]"
              title={`Call ${advisorData.name}`}
              aria-label={`Call ${advisorData.name}`}
            >
              <Phone size={14} strokeWidth={2.2} />
            </a>
          </div>
        </div>

        {/* Bottom Feature Micro-Strip */}
        <div className="mt-2 pt-1.5 border-t border-white/10 flex items-center justify-between text-[9px] sm:text-[10px] font-semibold text-[#8FA6B8] tracking-normal">
          <span className="whitespace-nowrap">Direct Advisory</span>
          <span className="text-[#D9A62E]">•</span>
          <span className="whitespace-nowrap">100% Legal Checks</span>
          <span className="text-[#D9A62E]">•</span>
          <span className="whitespace-nowrap">Zero Pressure</span>
        </div>
      </div>
    </div>
  );
}

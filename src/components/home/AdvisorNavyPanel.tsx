"use client";

import React from "react";
import Image from "next/image";
import { ShieldCheck } from "lucide-react";
import { advisorData } from "@/data/advisorData";

// Architectural blueprint & geometric vector lines matching reference
function ArchitecturalVectorBackground() {
  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none opacity-[0.18] text-[#52BDE9]"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 700 800"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      {/* Modern Building Silhouette (Left Side Behind Tagline) */}
      <g stroke="currentColor" strokeWidth="1.2" fill="none">
        {/* Left tower */}
        <line x1="60" y1="360" x2="60" y2="720" />
        <line x1="140" y1="360" x2="140" y2="720" />
        <line x1="60" y1="360" x2="140" y2="360" />
        <line x1="60" y1="410" x2="140" y2="410" />
        <line x1="60" y1="460" x2="140" y2="460" />
        <line x1="60" y1="510" x2="140" y2="510" />
        <line x1="60" y1="560" x2="140" y2="560" />
        <line x1="60" y1="610" x2="140" y2="610" />

        {/* Tall middle tower */}
        <line x1="120" y1="280" x2="120" y2="720" />
        <line x1="210" y1="280" x2="210" y2="720" />
        <line x1="120" y1="280" x2="210" y2="280" />
        <line x1="120" y1="330" x2="210" y2="330" />
        <line x1="120" y1="380" x2="210" y2="380" />
        <line x1="120" y1="430" x2="210" y2="430" />
        <line x1="120" y1="480" x2="210" y2="480" />
        <line x1="120" y1="530" x2="210" y2="530" />
        <line x1="120" y1="580" x2="210" y2="580" />
        <line x1="120" y1="630" x2="210" y2="630" />

        {/* Right architectural structure */}
        <line x1="180" y1="340" x2="180" y2="720" />
        <line x1="260" y1="340" x2="260" y2="720" />
        <line x1="180" y1="340" x2="260" y2="340" />
        <line x1="180" y1="400" x2="260" y2="400" />
        <line x1="180" y1="460" x2="260" y2="460" />
        <line x1="180" y1="520" x2="260" y2="520" />
        <line x1="180" y1="580" x2="260" y2="580" />

        {/* Perspective Gable and Ridge Lines behind Suresh */}
        <path d="M 360 220 L 520 120 L 680 220" strokeWidth="1.6" />
        <path d="M 400 240 L 520 160 L 640 240" strokeWidth="1.2" />
        <path d="M 440 260 L 520 200 L 600 260" strokeWidth="1" />
        <line x1="520" y1="120" x2="520" y2="680" strokeWidth="1.4" />
        <line x1="360" y1="220" x2="360" y2="720" strokeWidth="1.2" />
        <line x1="680" y1="220" x2="680" y2="720" strokeWidth="1.2" />

        {/* Diagonal Perspective Rays */}
        <line x1="520" y1="120" x2="280" y2="480" strokeDasharray="3 3" opacity="0.6" />
        <line x1="520" y1="120" x2="680" y2="440" strokeDasharray="3 3" opacity="0.6" />
      </g>
    </svg>
  );
}

// Crisp Vector Brand Logo for Ratiwal Dream Estates
function BrandLogo() {
  return (
    <div className="flex items-center gap-3">
      <svg
        width="46"
        height="46"
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="flex-shrink-0"
        aria-hidden="true"
      >
        {/* House Roof */}
        <path
          d="M 22 52 L 50 24 L 78 52"
          stroke="#0798D8"
          strokeWidth="5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Vertical Pillars */}
        <line x1="28" y1="58" x2="28" y2="76" stroke="#0798D8" strokeWidth="4.5" strokeLinecap="round" />
        <line x1="39" y1="42" x2="39" y2="88" stroke="#0798D8" strokeWidth="4.5" strokeLinecap="round" />
        <line x1="50" y1="30" x2="50" y2="95" stroke="#0798D8" strokeWidth="4.5" strokeLinecap="round" />
        <line x1="61" y1="20" x2="61" y2="90" stroke="#0798D8" strokeWidth="4.5" strokeLinecap="round" />
        <line x1="72" y1="58" x2="72" y2="76" stroke="#0798D8" strokeWidth="4.5" strokeLinecap="round" />
      </svg>
      <div className="flex flex-col">
        <div className="flex items-center gap-1.5 text-white font-extrabold text-[17px] sm:text-[19px] tracking-[0.06em] leading-tight">
          <span>RATIWAL</span>
          <span className="text-[#0798D8]">DREAM</span>
        </div>
        <span className="text-white/80 font-medium text-[10px] sm:text-[11px] tracking-[0.38em] uppercase leading-none mt-1">
          ESTATES
        </span>
      </div>
    </div>
  );
}

export function AdvisorNavyPanel() {
  return (
    <div className="relative w-full h-[540px] sm:h-[570px] lg:h-[600px] xl:h-[610px] bg-[#082A40] rounded-[22px] sm:rounded-[28px] lg:rounded-[32px] overflow-hidden flex flex-col justify-between shadow-[0_20px_50px_rgba(8,42,64,0.22)] border border-[rgba(255,255,255,0.06)] select-none">
      {/* Background Radial Glow */}
      <div
        className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_70%_35%,_rgba(13,56,86,0.85)_0%,_rgba(8,42,64,0.95)_55%,_#051d2d_100%)]"
        aria-hidden="true"
      />

      {/* Architectural Vector Blueprint */}
      <ArchitecturalVectorBackground />

      {/* Top Header Row: Logo & RERA Verified Pill */}
      <div className="relative z-20 px-5 sm:px-7 lg:px-8 pt-5 sm:pt-6 lg:pt-7 flex items-center justify-between gap-4">
        {/* Company Logo */}
        <BrandLogo />

        {/* RERA Verified Badge */}
        <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-3.5 py-1.5 rounded-full border border-[#D9A62E] bg-[#082A40]/80 backdrop-blur-md shadow-[0_2px_10px_rgba(217,166,46,0.15)] flex-shrink-0">
          <ShieldCheck size={15} className="text-[#D9A62E] flex-shrink-0" strokeWidth={2.2} aria-hidden="true" />
          <span className="text-white text-[10.5px] sm:text-[11.5px] font-bold tracking-[0.14em] uppercase whitespace-nowrap">
            RERA VERIFIED
          </span>
        </div>
      </div>

      {/* Mid Left Area: Brand Tagline */}
      <div className="relative z-20 px-5 sm:px-7 lg:px-8 mt-4 sm:mt-5 max-w-[200px] sm:max-w-[220px]">
        {/* Thin Gold Accent Line */}
        <div className="w-8 h-[2px] bg-[#D9A62E] mb-2.5 sm:mb-3" aria-hidden="true" />
        <h3 className="text-[#D9A62E] font-bold text-[12.5px] sm:text-[14px] lg:text-[14.5px] leading-[1.32] tracking-[0.14em] uppercase">
          TRUSTED GUIDANCE
          <br />
          FOR A BRIGHTER
          <br />
          TOMORROW
        </h3>
      </div>

      {/* Consultant High-Resolution Cutout Portrait */}
      <div className="absolute right-0 bottom-0 w-[68%] sm:w-[62%] md:w-[64%] lg:w-[62%] xl:w-[60%] h-[82%] sm:h-[86%] lg:h-[89%] xl:h-[91%] z-10 pointer-events-none flex items-end justify-end">
        <Image
          src={advisorData.imageCutout}
          alt={`${advisorData.name} - ${advisorData.designation}`}
          fill
          priority
          sizes="(max-width: 768px) 80vw, (max-width: 1200px) 45vw, 550px"
          className="object-contain object-bottom drop-shadow-[0_12px_32px_rgba(0,0,0,0.45)]"
        />
      </div>

      {/* Subtle Bottom Vignette to ground portrait & provide contrast for bottom strip */}
      <div
        className="absolute bottom-0 inset-x-0 h-28 sm:h-32 bg-gradient-to-t from-[#082A40] via-[#082A40]/80 to-transparent z-20 pointer-events-none"
        aria-hidden="true"
      />

      {/* Bottom Brand Strip: Value Pillars & Consultant Signature */}
      <div className="relative z-30 px-5 sm:px-7 lg:px-8 pb-5 sm:pb-6 lg:pb-7 pt-2 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-3 sm:gap-6 w-full">
        {/* Left: 3 Value Pillars */}
        <div className="flex items-center gap-2.5 sm:gap-3.5 text-[9.5px] sm:text-[10.5px] font-semibold tracking-[0.14em] uppercase text-[#B9CAD8]">
          <div className="leading-tight">
            <span className="block text-white/90">PEOPLE</span>
            <span className="text-[#B9CAD8]">TRUST</span>
          </div>

          <div className="w-px h-5 sm:h-6 bg-[#D9A62E]/70 flex-shrink-0" aria-hidden="true" />

          <div className="leading-tight">
            <span className="block text-white/90">PROPERTIES</span>
            <span className="text-[#B9CAD8]">GROW</span>
          </div>

          <div className="w-px h-5 sm:h-6 bg-[#D9A62E]/70 flex-shrink-0" aria-hidden="true" />

          <div className="leading-tight">
            <span className="block text-white/90">RELATIONSHIPS</span>
            <span className="text-[#B9CAD8]">LAST</span>
          </div>
        </div>

        {/* Right: Golden Script Signature & Designation */}
        <div className="flex flex-col items-start sm:items-end flex-shrink-0">
          <span className="font-signature text-[30px] sm:text-[34px] lg:text-[38px] text-[#D9A62E] leading-none select-none tracking-normal font-normal">
            {advisorData.name}
          </span>
          <span className="text-white/90 font-bold text-[9px] sm:text-[10px] tracking-[0.22em] uppercase mt-0.5">
            {advisorData.designation}
          </span>
        </div>
      </div>
    </div>
  );
}

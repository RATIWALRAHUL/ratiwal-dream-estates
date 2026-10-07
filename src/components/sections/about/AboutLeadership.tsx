"use client";

import React from "react";
import Image from "next/image";
import { Phone, Mail, MessageSquare, ShieldCheck, Sparkles, CheckCircle2, Award, Check } from "lucide-react";
import { Reveal } from "@/components/home/Reveal";
import { generateWhatsAppUrl } from "@/lib/whatsapp";
import { siteConfig } from "@/config/site";
import { advisorData } from "@/data/advisorData";

export function AboutLeadership() {
  const whatsappUrl = generateWhatsAppUrl({ type: "general" });

  const credentials = [
    {
      title: "8+ Years Dedicated Land Advisory",
      metric: "8+ Yrs",
      desc: "Specializing in Rajasthan high-growth corridors, masterplan alignments, and long-term land wealth creation.",
    },
    {
      title: "250+ Satisfied Families & Investors",
      metric: "250+",
      desc: "Providing direct one-on-one fiduciary advisory with zero broker speculation and complete price transparency.",
    },
    {
      title: "50,000+ Sq. Yards Successfully Transacted",
      metric: "50K+ Yds",
      desc: "Expert legal verification across Jamabandi, Patta conversion, Section 90A/90B approvals, and Sub-Registrar registries.",
    },
  ];

  return (
    <section className="py-16 sm:py-24 bg-[#051825] text-white relative overflow-hidden" aria-labelledby="leadership-title">
      {/* Background Architectural Blueprint Pattern */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.06]" aria-hidden="true">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 750" preserveAspectRatio="none">
          <line x1="0" y1="120" x2="1000" y2="120" stroke="#0798D8" strokeWidth="1" strokeDasharray="6 6" />
          <line x1="0" y1="360" x2="1000" y2="360" stroke="#0798D8" strokeWidth="1" strokeDasharray="6 6" />
          <line x1="0" y1="600" x2="1000" y2="600" stroke="#0798D8" strokeWidth="1" strokeDasharray="6 6" />
          <line x1="250" y1="0" x2="250" y2="750" stroke="#0798D8" strokeWidth="1" strokeDasharray="6 6" />
          <line x1="500" y1="0" x2="500" y2="750" stroke="#0798D8" strokeWidth="1" strokeDasharray="6 6" />
          <line x1="750" y1="0" x2="750" y2="750" stroke="#0798D8" strokeWidth="1" strokeDasharray="6 6" />
        </svg>
      </div>

      {/* Atmospheric Ambient Glows */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 rounded-full bg-[#0798D8]/10 blur-[100px] pointer-events-none" aria-hidden="true" />
      <div className="absolute bottom-10 right-0 w-96 h-96 rounded-full bg-[#D9A62E]/08 blur-[100px] pointer-events-none" aria-hidden="true" />

      <div className="max-w-[1340px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 xl:gap-16 items-center">
          
          {/* LEFT COLUMN: Authority Leadership Showcase Card */}
          <div className="lg:col-span-5 flex justify-center w-full">
            <Reveal className="w-full max-w-[480px]">
              <div className="relative w-full rounded-3xl overflow-hidden border border-white/[0.14] bg-gradient-to-b from-[#092B42] via-[#072033] to-[#041421] shadow-[0_24px_60px_rgba(2,12,20,0.6)] flex flex-col">
                
                {/* Subtle Card Ambient Radial Glow */}
                <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-[#0798D8]/15 blur-[60px] pointer-events-none" aria-hidden="true" />

                {/* Top Header Strip: Logo + RERA Verification Badge */}
                <div className="relative z-20 flex items-center justify-between gap-3 px-5 sm:px-7 pt-5 sm:pt-6">
                  <div className="relative w-28 sm:w-32 h-9 sm:h-10">
                    <Image
                      src="/images/brand/ratiwal-logo-white.svg"
                      alt="Ratiwal Dream Estates"
                      fill
                      className="object-contain object-left"
                      priority
                    />
                  </div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-[#D9A62E]/60 bg-[#D9A62E]/10 backdrop-blur-md">
                    <ShieldCheck size={13} className="text-[#D9A62E]" aria-hidden="true" />
                    <span className="text-white text-[9.5px] sm:text-[10.5px] font-bold tracking-[0.08em] uppercase">
                      RERA VERIFIED
                    </span>
                  </div>
                </div>

                {/* Card Tagline */}
                <div className="relative z-20 px-5 sm:px-7 pt-3 pb-1">
                  <p className="text-[#D9A62E] font-bold text-[11px] sm:text-[12.5px] tracking-[0.14em] uppercase leading-snug">
                    DIRECT FIDUCIARY LEADERSHIP
                  </p>
                </div>

                {/* Advisor Visual Portrait Area */}
                <div className="relative w-full h-[360px] sm:h-[400px] overflow-hidden">
                  
                  {/* Script Watermark Signature in Background */}
                  <div className="absolute left-6 top-8 z-10 pointer-events-none opacity-20 select-none" aria-hidden="true">
                    <span className="font-signature text-[38px] sm:text-[46px] text-white leading-tight -rotate-6 inline-block">
                      Suresh Ratiwal
                    </span>
                  </div>

                  {/* Cutout Portrait Image */}
                  <Image
                    src={advisorData.imageCutout}
                    alt={`${advisorData.name} — Senior Property Advisor & Founder`}
                    fill
                    priority
                    sizes="(max-width: 640px) 100vw, 480px"
                    className="object-contain object-top z-15 drop-shadow-[0_16px_36px_rgba(0,0,0,0.5)]"
                  />

                  {/* Bottom Portrait Seamless Fade to Navy */}
                  <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-[#041421] via-[#041421]/60 to-transparent z-20 pointer-events-none" />
                </div>

                {/* Bottom Authority Identity Plaque */}
                <div className="relative z-30 px-4 sm:px-6 pb-5 pt-1">
                  <div className="bg-[#061A28]/95 backdrop-blur-xl rounded-2xl border border-white/15 p-4 sm:p-5 shadow-2xl">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        {/* Legal Trust Status Pill */}
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#20c978]/10 border border-[#20c978]/30 text-[10.5px] font-bold text-[#34d399] mb-2 shadow-xs">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#20c978] animate-pulse" />
                          100% Legal Title Clarity
                        </div>
                        <h3 className="text-xl sm:text-2xl font-bold font-instrument text-white leading-tight">
                          {advisorData.name}
                        </h3>
                        <div className="text-[#0798D8] text-[10.5px] sm:text-[11.5px] font-extrabold tracking-[0.12em] uppercase mt-0.5">
                          SENIOR PROPERTY ADVISOR &amp; FOUNDER
                        </div>
                        <div className="text-white/50 text-[11px] font-mono mt-1">
                          RERA: {advisorData.rera}{" "}
                          {advisorData.legalName && (
                            <span className="text-white/40 font-sans">(Regd: {advisorData.legalName})</span>
                          )}
                        </div>
                      </div>
                      <div className="w-9 h-9 rounded-xl bg-[var(--ratiwal-blue)]/20 border border-[var(--cyan)]/30 flex items-center justify-center flex-shrink-0 text-[var(--cyan)]">
                        <Award size={18} />
                      </div>
                    </div>

                    {/* Quick Metric Chips */}
                    <div className="grid grid-cols-3 gap-1.5 sm:gap-2.5 mt-3.5 pt-3 border-t border-white/10 text-center">
                      <div className="bg-white/[0.05] hover:bg-white/[0.09] border border-white/10 rounded-xl py-2 px-1 transition-all">
                        <span className="block text-[13px] sm:text-[15px] font-extrabold text-white leading-tight tracking-tight">
                          8+ Yrs
                        </span>
                        <span className="text-[9.5px] sm:text-[10px] text-white/60 uppercase tracking-wider font-semibold mt-0.5 block">
                          Advisory
                        </span>
                      </div>
                      <div className="bg-white/[0.05] hover:bg-white/[0.09] border border-white/10 rounded-xl py-2 px-1 transition-all">
                        <span className="block text-[13px] sm:text-[15px] font-extrabold text-white leading-tight tracking-tight">
                          250+
                        </span>
                        <span className="text-[9.5px] sm:text-[10px] text-white/60 uppercase tracking-wider font-semibold mt-0.5 block">
                          Families
                        </span>
                      </div>
                      <div className="bg-white/[0.05] hover:bg-white/[0.09] border border-white/10 rounded-xl py-2 px-1 transition-all">
                        <span className="block text-[13px] sm:text-[15px] font-extrabold text-white leading-tight tracking-tight">
                          50K+
                        </span>
                        <span className="text-[9.5px] sm:text-[10px] text-white/60 uppercase tracking-wider font-semibold mt-0.5 block">
                          Sq. Yards
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </Reveal>
          </div>

          {/* RIGHT COLUMN: Founder's Vision & Advisory Philosophy */}
          <div className="lg:col-span-7">
            <Reveal>
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/15 text-[11px] sm:text-[11.5px] font-bold uppercase tracking-widest text-[var(--cyan)] mb-4">
                <ShieldCheck size={14} />
                LEADERSHIP &amp; FIDUCIARY ETHOS
              </div>

              <h2
                id="leadership-title"
                className="font-instrument text-[2.2rem] xs:text-[2.6rem] sm:text-[3.2rem] md:text-[3.5rem] lg:text-[3.6rem] text-white font-normal leading-[1.06] tracking-tight mb-5"
              >
                “Real estate advice is not a sales pitch. It is a{" "}
                <span className="italic text-[var(--cyan)]">lifelong fiduciary pledge.</span>”
              </h2>
            </Reveal>

            {/* Editorial Philosophy Quote Block */}
            <Reveal delay={100}>
              <div className="relative pl-5 sm:pl-6 border-l-2 border-[#0798D8] space-y-3 sm:space-y-3.5 text-white/85 text-sm sm:text-base leading-relaxed mb-7">
                <p>
                  “When a family or investor purchases land, they are committing their hard-earned capital toward their future security. Our duty as advisors is to protect that trust with total transparency.”
                </p>
                <p>
                  “I founded Ratiwal Dream Estates because I believe clients deserve clear legal facts, honest corridor pricing, and genuine peace of mind. We refuse to recommend any property that we would not confidently invest in ourselves.”
                </p>
                <div className="pt-1 text-xs text-[#0798D8] font-bold tracking-wider uppercase">
                  &mdash; {advisorData.name}, Senior Property Advisor &amp; Founder
                </div>
              </div>
            </Reveal>

            {/* Credential Cards */}
            <div className="space-y-3 mb-8">
              {credentials.map((cred, idx) => (
                <Reveal key={idx} delay={150 + idx * 50}>
                  <div className="flex items-start gap-3.5 p-3.5 sm:p-4 rounded-2xl bg-white/[0.04] border border-white/[0.09] backdrop-blur-sm transition-all duration-300 hover:bg-white/[0.07] hover:border-white/20">
                    <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-[var(--ratiwal-blue)]/25 text-[var(--cyan)] flex items-center justify-center flex-shrink-0 mt-0.5">
                      <CheckCircle2 size={18} />
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-[14px] font-bold text-white mb-0.5">{cred.title}</h4>
                      <p className="text-[12px] sm:text-[13px] text-white/70 leading-normal">{cred.desc}</p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>

            {/* Direct Connect Action Hub */}
            <Reveal delay={250}>
              <div>
                <div className="grid grid-cols-3 gap-2 sm:gap-3 w-full max-w-[640px] pt-1">
                  {/* WhatsApp */}
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-1.5 sm:gap-2 px-2 sm:px-4 py-2.5 sm:py-3.5 rounded-full bg-[#25d366] hover:bg-[#20ba59] text-white font-bold text-[11px] sm:text-[13px] shadow-[0_4px_18px_rgba(37,211,102,0.3)] transition-all active:scale-[0.98] whitespace-nowrap text-center"
                    aria-label="Chat with Advisor on WhatsApp"
                  >
                    <MessageSquare className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0" />
                    <span>WhatsApp</span>
                  </a>
                  
                  {/* Direct Call */}
                  <a
                    href={`tel:${advisorData.phoneRaw}`}
                    className="inline-flex items-center justify-center gap-1.5 sm:gap-2 px-2 sm:px-4 py-2.5 sm:py-3.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-[11px] sm:text-[13px] transition-all active:scale-[0.98] whitespace-nowrap text-center"
                    title={`Call ${advisorData.phone}`}
                  >
                    <Phone className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0 text-[var(--cyan)]" />
                    <span>Call Advisor</span>
                  </a>

                  {/* Send Email */}
                  <a
                    href={`mailto:${advisorData.email}`}
                    className="inline-flex items-center justify-center gap-1.5 sm:gap-2 px-2 sm:px-4 py-2.5 sm:py-3.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-[11px] sm:text-[13px] transition-all active:scale-[0.98] whitespace-nowrap text-center"
                    title={`Email ${advisorData.email}`}
                  >
                    <Mail className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0 text-[var(--cyan)]" />
                    <span>Send Email</span>
                  </a>
                </div>

                {/* Bottom Legal Disclosure */}
                <p className="text-[11px] sm:text-[12px] text-white/50 mt-3 font-mono">
                  RERA Registered: {advisorData.rera} &bull; 100% Free &amp; Confidential Advisory
                </p>
              </div>
            </Reveal>

          </div>

        </div>
      </div>
    </section>
  );
}

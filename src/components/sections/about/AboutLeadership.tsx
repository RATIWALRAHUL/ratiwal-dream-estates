"use client";

import React from "react";
import Image from "next/image";
import { Phone, Mail, MessageSquare, ShieldCheck, Sparkles, CheckCircle2 } from "lucide-react";
import { Reveal } from "@/components/home/Reveal";
import { MagneticButton } from "@/components/home/MagneticButton";
import { generateWhatsAppUrl } from "@/lib/whatsapp";
import { siteConfig } from "@/config/site";

export function AboutLeadership() {
  const whatsappUrl = generateWhatsAppUrl({ type: "general" });

  const credentials = [
    { title: "8+ Years Dedicated Experience", desc: "Specializing in Rajasthan land markets, masterplan alignments, and high-growth development corridors." },
    { title: "250+ Satisfied Clients & Investors", desc: "Providing direct fiduciary advisory with complete transactional clarity for families and investors." },
    { title: "50,000+ Sq. Yards Land Sold", desc: "Expert in Jamabandi, Patta conversion, 90A/90B approvals, RERA compliance, and Sub-Registrar verification." },
  ];

  return (
    <section className="py-14 sm:py-20 bg-[var(--midnight)] text-white relative overflow-hidden" aria-labelledby="leadership-title">
      {/* Subtle Blueprint & Topographic Line Overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-10">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" preserveAspectRatio="none">
          <line x1="0" y1="100" x2="800" y2="100" stroke="#42b7e8" strokeWidth="1" strokeDasharray="4 4" />
          <line x1="0" y1="300" x2="800" y2="300" stroke="#42b7e8" strokeWidth="1" strokeDasharray="4 4" />
          <line x1="0" y1="500" x2="800" y2="500" stroke="#42b7e8" strokeWidth="1" strokeDasharray="4 4" />
          <line x1="200" y1="0" x2="200" y2="600" stroke="#42b7e8" strokeWidth="1" strokeDasharray="4 4" />
          <line x1="600" y1="0" x2="600" y2="600" stroke="#42b7e8" strokeWidth="1" strokeDasharray="4 4" />
        </svg>
      </div>

      <div className="max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 xl:gap-14 items-center">
          
          {/* Left Column: Premium Masterplanned Estate Image with Luxury Plaque */}
          <div className="lg:col-span-5 flex flex-col items-center">
            <Reveal>
              <div className="relative w-full max-w-[460px] aspect-[4/4.8] rounded-2xl sm:rounded-3xl overflow-hidden border border-white/15 shadow-2xl bg-gradient-to-b from-[#0b2a40] to-[var(--midnight)] group">
                <Image
                  src="/images/about/leadership-ethos.jpg"
                  alt="Ratiwal Dream Estates - Masterplanned Plotted Development & Fiduciary Excellence"
                  fill
                  sizes="(max-width: 768px) 100vw, 460px"
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[var(--midnight)] via-[var(--midnight)]/30 to-transparent opacity-90" />

                {/* Overlaid Floating Status Pill */}
                <div className="absolute top-4 left-4 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--midnight)]/90 backdrop-blur-md border border-white/20 text-[10.5px] sm:text-[11px] font-semibold text-white shadow-lg">
                  <span className="w-2 h-2 rounded-full bg-[#20c978] animate-pulse" />
                  Statutory Clear Masterplans
                </div>

                {/* Bottom Institutional Quality Plaque */}
                <div className="absolute bottom-3.5 left-3.5 right-3.5 sm:bottom-4 sm:left-4 sm:right-4 p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-[var(--midnight)]/92 backdrop-blur-xl border border-white/20 text-white shadow-2xl">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-instrument text-xl sm:text-2xl text-white font-normal leading-tight">
                      Fiduciary Land Governance
                    </h3>
                    <span className="text-[9.5px] sm:text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 whitespace-nowrap">
                      100% Title Clarity
                    </span>
                  </div>
                  <p className="text-[11.5px] sm:text-[12px] text-[var(--cyan)] font-semibold mt-0.5">
                    Section 90A Approved &bull; RERA Registered &bull; Zero Speculation
                  </p>
                  <p className="text-[10.5px] sm:text-[11px] text-white/70 mt-1 leading-snug">
                    Over 50,000+ Sq. Yards Transacted with Complete Revenue Verification.
                  </p>
                </div>
              </div>
            </Reveal>
          </div>

          {/* Right Column: Founder's Vision & Advisory Philosophy */}
          <div className="lg:col-span-7">
            <Reveal>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-[11px] sm:text-[11.5px] font-bold uppercase tracking-widest text-[var(--cyan)] mb-3 sm:mb-4">
                <Sparkles size={14} />
                LEADERSHIP &amp; FIDUCIARY ETHOS
              </div>

              <h2
                id="leadership-title"
                className="font-instrument text-[2.2rem] xs:text-[2.6rem] sm:text-[3.2rem] md:text-[3.6rem] text-white font-normal leading-[1.06] tracking-tight mb-4 sm:mb-6"
              >
                “Real estate advice is not a sales pitch. It is a{" "}
                <span className="italic text-[var(--cyan)]">lifelong fiduciary pledge.</span>”
              </h2>
            </Reveal>

            <Reveal delay={100}>
              <div className="space-y-3 sm:space-y-4 text-white/80 text-xs xs:text-sm sm:text-base md:text-[17px] leading-relaxed mb-6 sm:mb-8">
                <p>
                  “When a family or investor purchases land, they are committing their hard-earned capital toward their future security. Our duty as advisors is to protect that trust with total transparency.”
                </p>
                <p>
                  “I founded Ratiwal Dream Estates because I believe clients deserve clear legal facts, honest pricing, and genuine peace of mind. We refuse to recommend any property that we would not confidently invest in ourselves.”
                </p>
              </div>
            </Reveal>

            {/* Key Credentials */}
            <div className="space-y-2.5 sm:space-y-3 mb-6 sm:mb-8">
              {credentials.map((cred, idx) => (
                <Reveal key={idx} delay={150 + idx * 50}>
                  <div className="flex items-start gap-3 p-3 sm:p-3.5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-xs">
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-[var(--ratiwal-blue)]/30 text-[var(--cyan)] flex items-center justify-center flex-shrink-0 mt-0.5">
                      <ShieldCheck size={16} />
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-white mb-0.5">{cred.title}</h4>
                      <p className="text-[11.5px] sm:text-[12.5px] text-white/70 leading-normal">{cred.desc}</p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>

            {/* Direct Connect Buttons - GUARANTEED SINGLE ROW ON EVERY SCREEN */}
            <Reveal delay={250}>
              <div className="flex flex-row items-center gap-2 sm:gap-3 w-full max-w-[580px] pt-1">
                {/* 1. WhatsApp Button */}
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 min-w-0 inline-flex items-center justify-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-3 rounded-full bg-[#25d366] hover:bg-[#20ba59] text-white font-bold text-[11px] xs:text-xs sm:text-[13px] shadow-lg transition-all active:scale-[0.98] whitespace-nowrap"
                  aria-label="Chat on WhatsApp"
                >
                  <MessageSquare size={15} className="flex-shrink-0" />
                  <span className="truncate">WhatsApp</span>
                </a>
                
                {/* 2. Direct Call Button */}
                <a
                  href={`tel:${siteConfig.agent.phone.replace(/[^0-9+]/g, "")}`}
                  className="flex-1 min-w-0 inline-flex items-center justify-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-3 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-[11px] xs:text-xs sm:text-[13px] transition-all active:scale-[0.98] whitespace-nowrap"
                  title={`Call ${siteConfig.agent.displayPhone}`}
                >
                  <Phone size={14} className="flex-shrink-0 text-[var(--cyan)]" />
                  <span className="truncate">Call Advisor</span>
                </a>

                {/* 3. Send Email Button */}
                <a
                  href={`mailto:${siteConfig.agent.email}`}
                  className="flex-1 min-w-0 inline-flex items-center justify-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-3 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-[11px] xs:text-xs sm:text-[13px] transition-all active:scale-[0.98] whitespace-nowrap"
                  title={`Email ${siteConfig.agent.email}`}
                >
                  <Mail size={14} className="flex-shrink-0 text-[var(--cyan)]" />
                  <span className="truncate">Send Email</span>
                </a>
              </div>
            </Reveal>

          </div>

        </div>
      </div>
    </section>
  );
}

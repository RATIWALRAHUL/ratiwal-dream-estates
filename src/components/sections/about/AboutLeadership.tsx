"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Phone, MessageSquare, Award, CheckCircle2, ShieldCheck, Sparkles } from "lucide-react";
import { Reveal } from "@/components/home/Reveal";
import { MagneticButton } from "@/components/home/MagneticButton";
import { generateWhatsAppUrl } from "@/lib/whatsapp";
import { siteConfig } from "@/config/site";

export function AboutLeadership() {
  const whatsappUrl = generateWhatsAppUrl({ type: "general" });

  const credentials = [
    { title: "10+ Years Dedicated Experience", desc: "Specializing in Rajasthan & Maharashtra land markets and development corridors." },
    { title: "Direct Fiduciary Advisory", desc: "Providing unbiased guidance with complete transactional clarity for family offices and investors." },
    { title: "500+ Land Parcels Vetted", desc: "Expert in Jamabandi, Patta conversion, 90A/90B approvals, and Sub-Registrar verification." },
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
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          
          {/* Left Column: Portrait with Luxury Plaque */}
          <div className="lg:col-span-5 flex flex-col items-center">
            <Reveal>
              <div className="relative w-full max-w-[420px] aspect-[4/5] rounded-2xl sm:rounded-3xl overflow-hidden border border-white/15 shadow-2xl bg-gradient-to-b from-[#0b2a40] to-[var(--midnight)]">
                <Image
                  src="/images/brand/advisor-portrait.png"
                  alt="Rahul Ratiwal — Principal Advisor & Founder at Ratiwal Dream Estates"
                  fill
                  sizes="(max-width: 768px) 100vw, 420px"
                  className="object-cover object-top"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[var(--midnight)] via-transparent to-transparent opacity-80" />

                {/* Overlaid Floating Status Pill */}
                <div className="absolute top-4 left-4 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--midnight)]/85 backdrop-blur-md border border-white/20 text-[11px] font-semibold text-white">
                  <span className="w-2 h-2 rounded-full bg-[#20c978] animate-pulse" />
                  Available for Private Consultation
                </div>

                {/* Founder Plaque at bottom */}
                <div className="absolute bottom-4 left-4 right-4 p-4 rounded-xl bg-[var(--midnight)]/90 backdrop-blur-xl border border-white/20 text-white">
                  <h3 className="font-instrument text-2xl text-white font-normal leading-tight">
                    Rahul Ratiwal
                  </h3>
                  <p className="text-[12.5px] text-[var(--cyan)] font-semibold mt-0.5">
                    Founder &amp; Principal Property Advisor
                  </p>
                  <p className="text-[11.5px] text-white/70 mt-1">
                    Jaipur &bull; Ajmer &bull; Navi Mumbai
                  </p>
                </div>
              </div>
            </Reveal>
          </div>

          {/* Right Column: Founder's Vision & Advisory Philosophy */}
          <div className="lg:col-span-7">
            <Reveal>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-[11.5px] font-bold uppercase tracking-widest text-[var(--cyan)] mb-4">
                <Sparkles size={14} />
                LEADERSHIP &amp; FIDUCIARY ETHOS
              </div>

              <h2
                id="leadership-title"
                className="font-instrument text-[2.4rem] sm:text-[3.2rem] md:text-[3.6rem] text-white font-normal leading-[1.05] tracking-tight mb-6"
              >
                “Real estate advice is not a sales pitch. It is a{" "}
                <span className="italic text-[var(--cyan)]">lifelong fiduciary pledge.</span>”
              </h2>
            </Reveal>

            <Reveal delay={100}>
              <div className="space-y-4 text-white/80 text-base sm:text-lg leading-relaxed mb-8">
                <p>
                  “When a family or investor purchases land, they are committing their hard-earned capital toward their future security. Our duty as advisors is to protect that trust with total transparency.”
                </p>
                <p>
                  “I founded Ratiwal Dream Estates because I believe clients deserve clear legal facts, honest pricing, and genuine peace of mind. We refuse to recommend any property that we would not confidently invest in ourselves.”
                </p>
              </div>
            </Reveal>

            {/* Key Credentials */}
            <div className="space-y-3.5 mb-8">
              {credentials.map((cred, idx) => (
                <Reveal key={idx} delay={150 + idx * 50}>
                  <div className="flex items-start gap-3 p-3.5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
                    <div className="w-8 h-8 rounded-lg bg-[var(--ratwal-blue)]/30 text-[var(--cyan)] flex items-center justify-center flex-shrink-0 mt-0.5">
                      <ShieldCheck size={18} />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white mb-0.5">{cred.title}</h4>
                      <p className="text-[12.5px] text-white/70 leading-normal">{cred.desc}</p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>

            {/* Direct Connect Buttons */}
            <Reveal delay={250}>
              <div className="flex flex-wrap items-center gap-3.5 pt-2">
                <MagneticButton strength={6}>
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2.5 px-5 py-3 rounded-full bg-[#25d366] text-white font-bold text-sm shadow-lg hover:bg-[#20ba59] transition-all hover:scale-105"
                  >
                    <MessageSquare size={17} />
                    Chat Directly on WhatsApp
                  </a>
                </MagneticButton>
                
                <MagneticButton strength={6}>
                  <a
                    href={`tel:${siteConfig.contact.phone.replace(/[^0-9+]/g, "")}`}
                    className="inline-flex items-center gap-2.5 px-5 py-3 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-sm transition-all"
                  >
                    <Phone size={16} />
                    {siteConfig.contact.phone}
                  </a>
                </MagneticButton>
              </div>
            </Reveal>
          </div>

        </div>
      </div>
    </section>
  );
}

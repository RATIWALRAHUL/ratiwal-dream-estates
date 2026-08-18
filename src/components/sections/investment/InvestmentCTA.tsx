"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, MessageSquare, ShieldCheck, Sparkles, TrendingUp } from "lucide-react";
import { Reveal } from "@/components/home/Reveal";
import { MagneticButton } from "@/components/home/MagneticButton";
import { generateWhatsAppUrl } from "@/lib/whatsapp";

export function InvestmentCTA() {
  const whatsappUrl = generateWhatsAppUrl({ type: "general" });

  return (
    <section className="py-14 sm:py-20 relative overflow-hidden bg-[var(--midnight)] text-white" aria-labelledby="inv-cta-title">
      <Image
        src="/images/about/township-development.jpg"
        alt="Planned plotted development township"
        fill
        sizes="100vw"
        className="object-cover opacity-20 filter grayscale"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-[var(--midnight)] via-[var(--midnight)]/90 to-[var(--midnight)]/80" />

      <div className="max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          <Reveal>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-[11.5px] font-bold uppercase tracking-widest text-[var(--cyan)] mb-4">
              <TrendingUp size={14} />
              PORTFOLIO STRATEGY SESSION
            </div>

            <h2
              id="inv-cta-title"
              className="font-instrument text-[2.4rem] sm:text-[3.4rem] md:text-[4rem] text-white font-normal leading-[1.05] tracking-tight mb-5"
            >
              Ready to allocate capital into high-growth{" "}
              <span className="italic text-[var(--cyan)]">verified land?</span>
            </h2>

            <p className="text-white/80 text-base sm:text-lg leading-relaxed mb-8 max-w-2xl mx-auto">
              Schedule a confidential 1-on-1 strategy session with our senior advisors to review vetted opportunities across Jaipur and Maharashtra.
            </p>
          </Reveal>

          <Reveal delay={150}>
            <div className="flex flex-wrap items-center justify-center gap-4 mb-10">
              <MagneticButton strength={6}>
                <Link href="/contact" className="button-primary shadow-glow">
                  Book Portfolio Review <ArrowRight size={17} />
                </Link>
              </MagneticButton>
              <MagneticButton strength={6}>
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#25d366] hover:bg-[#20ba59] text-white font-bold text-sm shadow-md transition-all hover:scale-105"
                >
                  <MessageSquare size={17} />
                  WhatsApp an Advisor
                </a>
              </MagneticButton>
            </div>
          </Reveal>

          {/* Guarantees */}
          <Reveal delay={250}>
            <div className="flex flex-wrap items-center justify-center gap-6 text-xs sm:text-sm text-white/70">
              <span className="flex items-center gap-1.5">
                <ShieldCheck size={16} className="text-[var(--cyan)]" />
                30-Year Clear Revenue Title
              </span>
              <span className="hidden sm:inline text-white/30">&bull;</span>
              <span className="flex items-center gap-1.5">
                <ShieldCheck size={16} className="text-[var(--cyan)]" />
                Zero Consultation Fees
              </span>
              <span className="hidden sm:inline text-white/30">&bull;</span>
              <span className="flex items-center gap-1.5">
                <ShieldCheck size={16} className="text-[var(--cyan)]" />
                100% Conflict-Free Fiduciary Review
              </span>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

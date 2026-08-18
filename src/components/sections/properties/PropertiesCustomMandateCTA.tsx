"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, MessageSquare, Compass, ShieldCheck } from "lucide-react";
import { Reveal } from "@/components/home/Reveal";
import { MagneticButton } from "@/components/home/MagneticButton";
import { generateWhatsAppUrl } from "@/lib/whatsapp";

export function PropertiesCustomMandateCTA() {
  const whatsappUrl = generateWhatsAppUrl({ type: "general" });

  return (
    <section className="py-12 sm:py-16 bg-[var(--midnight)] text-white relative overflow-hidden rounded-3xl mx-4 sm:mx-6 lg:mx-8 mb-12" aria-labelledby="mandate-title">
      <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
        <Reveal>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-[11.5px] font-bold uppercase tracking-widest text-[var(--cyan)] mb-3">
            <Compass size={14} />
            BESPOKE LAND SOURCING
          </div>

          <h2
            id="mandate-title"
            className="font-instrument text-3xl sm:text-4xl md:text-5xl text-white font-normal leading-tight mb-4"
          >
            Looking for a specific plot dimension or{" "}
            <span className="italic text-[var(--cyan)]">multi-acre land bank?</span>
          </h2>

          <p className="text-sm sm:text-base text-white/80 leading-relaxed max-w-2xl mx-auto mb-8">
            Many institutional and prime residential parcels are managed under private fiduciary mandates without public listings. Connect with our senior advisors for off-market opportunities.
          </p>
        </Reveal>

        <Reveal delay={150}>
          <div className="flex flex-wrap items-center justify-center gap-4 mb-8">
            <MagneticButton strength={6}>
              <Link href="/contact" className="button-primary shadow-glow">
                Submit Custom Mandate <ArrowRight size={17} />
              </Link>
            </MagneticButton>
            <MagneticButton strength={6}>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-[#25d366] hover:bg-[#20ba59] text-white font-bold text-sm shadow-md transition-all hover:scale-105"
              >
                <MessageSquare size={17} />
                WhatsApp Advisory Desk
              </a>
            </MagneticButton>
          </div>
        </Reveal>

        <Reveal delay={200}>
          <div className="flex flex-wrap items-center justify-center gap-5 text-xs text-white/60">
            <span className="flex items-center gap-1.5">
              <ShieldCheck size={15} className="text-[var(--cyan)]" />
              100% Confidential Mandate
            </span>
            <span>&bull;</span>
            <span className="flex items-center gap-1.5">
              <ShieldCheck size={15} className="text-[var(--cyan)]" />
              Direct Titleholder Access
            </span>
            <span>&bull;</span>
            <span className="flex items-center gap-1.5">
              <ShieldCheck size={15} className="text-[var(--cyan)]" />
              Zero Middleman Broker Friction
            </span>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

"use client";

import React from "react";
import { Phone, MessageSquare, ShieldCheck, Clock, ArrowRight } from "lucide-react";
import { Reveal } from "@/components/home/Reveal";
import { MagneticButton } from "@/components/home/MagneticButton";
import { generateWhatsAppUrl } from "@/lib/whatsapp";
import { siteConfig } from "@/config/site";

export function ContactDirectBar() {
  const whatsappUrl = generateWhatsAppUrl({ type: "general" });

  return (
    <section className="py-12 sm:py-16 bg-[var(--midnight)] text-white relative overflow-hidden" aria-labelledby="direct-bar-title">
      <div className="max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="p-8 sm:p-10 md:p-12 rounded-2xl sm:rounded-3xl bg-gradient-to-r from-[#0b2a40] to-[var(--midnight)] border border-white/10 shadow-2xl flex flex-col lg:flex-row items-center justify-between gap-8">
          
          <div className="max-w-xl text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-[11.5px] font-bold uppercase tracking-widest text-[var(--cyan)] mb-3">
              <Clock size={13} />
              RAPID ADVISORY RESPONSE
            </div>
            
            <h2
              id="direct-bar-title"
              className="font-instrument text-3xl sm:text-4xl md:text-[2.6rem] text-white font-normal leading-tight mb-2"
            >
              Prefer a direct conversation?
            </h2>
            
            <p className="text-sm sm:text-base text-white/75 leading-relaxed">
              Connect immediately with a senior land advisor. No waiting in automated queues—reach direct decision-makers.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3.5 flex-shrink-0">
            <MagneticButton strength={6}>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-full bg-[#25d366] hover:bg-[#20ba59] text-white font-bold text-sm shadow-md transition-all hover:scale-105"
              >
                <MessageSquare size={18} />
                <span>WhatsApp Priority Desk</span>
              </a>
            </MagneticButton>

            <MagneticButton strength={6}>
              <a
                href={`tel:${siteConfig.contact.phone.replace(/[^0-9+]/g, "")}`}
                className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-sm transition-all"
              >
                <Phone size={17} />
                <span>{siteConfig.contact.phone}</span>
              </a>
            </MagneticButton>
          </div>

        </div>
      </div>
    </section>
  );
}

"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, Check, FileText, MessageSquare } from "lucide-react";
import { Reveal } from "@/components/home/Reveal";
import { whyChooseUsData } from "@/data/whyChooseUsData";
import { generateWhatsAppUrl } from "@/lib/whatsapp";

export function BuyerDeliverables() {
  const { deliverables } = whyChooseUsData;
  const whatsappUrl = generateWhatsAppUrl({ type: "general" });

  return (
    <section
      className="py-16 sm:py-24 bg-[var(--alabaster)] border-b border-[rgba(7,26,40,0.08)]"
      aria-labelledby="deliverables-title"
    >
      <div className="max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="max-w-3xl mb-12 sm:mb-16">
          <Reveal>
            <span className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--ratiwal-blue)] block mb-2">
              CLIENT DELIVERABLES
            </span>
            <h2
              id="deliverables-title"
              className="font-instrument text-3xl sm:text-4xl md:text-5xl text-[var(--midnight)] font-normal leading-tight tracking-tight mb-4"
            >
              Information designed for a more confident decision.
            </h2>
            <p className="text-sm sm:text-base text-[var(--text-secondary)] leading-relaxed font-normal">
              When evaluating a plotted opportunity through our advisory desk, you receive structured documentation packs rather than verbal promises.
            </p>
          </Reveal>
        </div>

        {/* 4 Deliverable Dossier Sheets Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 mb-12">
          {deliverables.map((del, idx) => (
            <Reveal key={del.id} delay={idx * 100}>
              <div className="p-7 sm:p-8 rounded-2xl sm:rounded-3xl bg-white border border-[rgba(7,26,40,0.08)] shadow-xs hover:shadow-md transition-all duration-300 h-full flex flex-col justify-between group">
                <div>
                  <div className="flex items-center justify-between gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-[var(--surface)] text-[var(--ratiwal-blue)] flex items-center justify-center group-hover:bg-[var(--mist-blue)] transition-colors">
                      <FileText size={18} />
                    </div>
                    <span className="px-3 py-1 rounded-full bg-[var(--surface)] text-[var(--ratiwal-blue-deep)] text-[11px] font-bold uppercase tracking-wider border border-[rgba(7,26,40,0.06)]">
                      {del.tag}
                    </span>
                  </div>

                  <h3 className="font-instrument text-2xl sm:text-3xl text-[var(--midnight)] font-normal mb-3">
                    {del.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed font-normal mb-6">
                    {del.description}
                  </p>

                  <div className="space-y-2 pt-4 border-t border-[rgba(7,26,40,0.06)]">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--midnight)] block mb-1">
                      Included in Dossier:
                    </span>
                    {del.itemsIncluded.map((item, iIdx) => (
                      <div key={iIdx} className="flex items-center gap-2 text-xs text-[var(--midnight)] font-medium">
                        <Check size={13} className="text-[var(--ratiwal-blue)] flex-shrink-0" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>

        {/* Lead Action: Request Information Pack Banner */}
        <Reveal delay={200}>
          <div className="p-7 sm:p-10 rounded-2xl sm:rounded-3xl bg-white border border-[rgba(7,26,40,0.12)] shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="max-w-xl text-center md:text-left">
              <h4 className="font-instrument text-2xl sm:text-3xl text-[var(--midnight)] font-normal mb-2">
                Request a property information pack
              </h4>
              <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
                Connect with an advisor to receive a comprehensive project dossier and sanctioned layout map for your preferred corridor.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto flex-shrink-0">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-[#25d366] hover:bg-[#20ba59] text-white text-xs sm:text-sm font-bold shadow-xs transition-colors"
              >
                <MessageSquare size={15} />
                <span>Request on WhatsApp</span>
              </a>

              <Link
                href="/contact"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-[var(--ratiwal-blue)] hover:bg-[var(--ratiwal-blue-deep)] text-white text-xs sm:text-sm font-bold shadow-xs transition-colors"
              >
                <span>Submit Inquiry</span>
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </Reveal>

      </div>
    </section>
  );
}

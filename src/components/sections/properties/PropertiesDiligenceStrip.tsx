"use client";

import React from "react";
import { FileText, ShieldCheck, MapPin, Scale, Layers, CheckCircle2 } from "lucide-react";
import { Reveal } from "@/components/home/Reveal";

export function PropertiesDiligenceStrip() {
  const items = [
    {
      icon: FileText,
      title: "Jamabandi & Khasra Milan Extracts",
      desc: "Tehsil certified revenue records confirming title continuity and zero encumbrances.",
    },
    {
      icon: Layers,
      title: "Sanctioned Scheme Layout Map",
      desc: "JDA, CIDCO, or ADA approved master drawings with demarcated road widths.",
    },
    {
      icon: Scale,
      title: "Section 90A/90B Conversion Orders",
      desc: "Statutory land use conversion orders from agriculture to residential/commercial.",
    },
    {
      icon: ShieldCheck,
      title: "30-Year Non-Encumbrance Report",
      desc: "Sub-Registrar record audit certifying zero pending mortgages, liens, or legal notices.",
    },
  ];

  return (
    <section className="py-12 sm:py-16 bg-[var(--surface)] border-y border-[rgba(7,26,40,0.06)] mb-14" aria-labelledby="diligence-heading">
      <div className="max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="max-w-3xl mx-auto text-center mb-10">
          <Reveal>
            <div className="flex items-center justify-center gap-2 mb-2">
              <ShieldCheck size={16} className="text-[var(--ratiwal-blue)]" />
              <span className="text-[11.5px] font-bold tracking-[0.16em] uppercase text-[var(--ratiwal-blue)]">
                FIDUCIARY ASSURANCE
              </span>
            </div>

            <h2
              id="diligence-heading"
              className="font-instrument text-2xl sm:text-3xl md:text-4xl text-[var(--midnight)] font-normal leading-tight"
            >
              Every property includes our verified{" "}
              <span className="italic text-[var(--ratiwal-blue)]">legal dossier.</span>
            </h2>
          </Reveal>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {items.map((item, idx) => (
            <Reveal key={idx} delay={idx * 60}>
              <div className="p-5 rounded-2xl bg-white border border-[rgba(7,26,40,0.08)] shadow-xs h-full flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-[var(--cyan-soft)] text-[var(--ratiwal-blue-deep)] flex items-center justify-center mb-3">
                    <item.icon size={20} />
                  </div>
                  <h3 className="text-sm font-bold text-[var(--midnight)] mb-1.5 leading-snug">
                    {item.title}
                  </h3>
                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                    {item.desc}
                  </p>
                </div>

                <div className="pt-3 mt-3 border-t border-[rgba(7,26,40,0.04)] flex items-center gap-1 text-[11px] font-bold text-[var(--ratiwal-blue)]">
                  <CheckCircle2 size={13} />
                  <span>Pre-Verified by Ratiwal</span>
                </div>
              </div>
            </Reveal>
          ))}
        </div>

      </div>
    </section>
  );
}

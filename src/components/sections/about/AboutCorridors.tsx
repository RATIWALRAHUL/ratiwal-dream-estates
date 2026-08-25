"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, MapPin, Navigation, TrendingUp } from "lucide-react";
import { Reveal } from "@/components/home/Reveal";

export function AboutCorridors() {
  const hubs = [
    {
      city: "Jaipur, Rajasthan",
      badge: "Flagship Advisory Hub",
      highlight: "Rajasthan's Highest Capital Growth Corridor",
      corridors: [
        { name: "Ajmer Road Expressway", desc: "SEZ zone, Mahindra World City, luxury plotted townships." },
        { name: "Jaipur Ring Road Zone", desc: "High-speed 6-lane ring connectivity & logistics corridor." },
        { name: "Tonk Road & Diggi Highway", desc: "Rapidly expanding residential suburbs with high appreciation." },
        { name: "Jagatpura & Mahal Road", desc: "Established premium educational & residential enclave." },
      ],
    },
    {
      city: "Maharashtra & NCR Focus",
      badge: "High-Yield Corridors",
      highlight: "Strategic Mega-Infrastructure Vectors",
      corridors: [
        { name: "Navi Mumbai & Panvel", desc: "Adjacent to Navi Mumbai International Airport & MTHL link." },
        { name: "Ajmer & Pushkar Belt", desc: "Heritage hospitality & institutional land opportunities." },
        { name: "Bhiwadi & NCR Axis", desc: "Industrial, warehousing & fast-transit logistics plots." },
        { name: "Emerging Growth Belts", desc: "Directly aligned along the Delhi-Mumbai Industrial Corridor." },
      ],
    },
  ];

  return (
    <section className="py-14 sm:py-20 bg-[var(--alabaster)]" aria-labelledby="corridors-title">
      <div className="max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="max-w-3xl mx-auto text-center mb-12 sm:mb-16">
          <Reveal>
            <div className="flex items-center justify-center gap-2 mb-3">
              <MapPin size={16} className="text-[var(--ratiwal-blue)]" />
              <span className="text-[12px] font-bold tracking-[0.16em] uppercase text-[var(--ratiwal-blue)]">
                GEOGRAPHIC SPECIALIZATION
              </span>
            </div>

            <h2
              id="corridors-title"
              className="font-instrument text-[2.4rem] sm:text-[3.2rem] md:text-[3.8rem] text-[var(--midnight)] font-normal leading-[1.05] tracking-tight mb-4"
            >
              Where we operate &amp;{" "}
              <span className="italic text-[var(--ratiwal-blue)]">create value.</span>
            </h2>

            <p className="text-base sm:text-lg text-[var(--text-secondary)] leading-relaxed">
              We specialize in deep micro-markets with verified masterplans, immediate road access, and high structural appreciation.
            </p>
          </Reveal>
        </div>

        {/* 2 Big Corridor Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {hubs.map((hub, idx) => (
            <Reveal key={idx} delay={idx * 100}>
              <div className="p-5 sm:p-7 md:p-9 rounded-2xl sm:rounded-3xl bg-white border border-[rgba(7,26,40,0.1)] shadow-sm hover:shadow-md transition-all duration-300 h-full flex flex-col justify-between">
                <div>
                  <div className="flex flex-wrap items-center justify-between gap-2.5 mb-4">
                    <span className="inline-flex items-center px-3 py-1 rounded-full bg-[var(--cyan-soft)] text-[var(--ratiwal-blue-deep)] text-[11px] sm:text-xs font-bold uppercase tracking-wider whitespace-nowrap">
                      {hub.badge}
                    </span>
                    <span className="text-[11.5px] sm:text-xs font-semibold text-[var(--text-secondary)] flex items-center gap-1.5">
                      <TrendingUp size={14} className="text-[var(--ratiwal-blue)] flex-shrink-0" />
                      <span>{hub.highlight}</span>
                    </span>
                  </div>

                  <h3 className="font-instrument text-2xl sm:text-3xl md:text-4xl text-[var(--midnight)] font-normal leading-tight mb-5 sm:mb-6">
                    {hub.city}
                  </h3>

                  <div className="space-y-4">
                    {hub.corridors.map((c, cIdx) => (
                      <div key={cIdx} className="p-3.5 rounded-xl bg-[var(--surface)] border border-[rgba(7,26,40,0.06)]">
                        <h4 className="text-sm font-bold text-[var(--midnight)] flex items-center gap-2 mb-1">
                          <Navigation size={14} className="text-[var(--ratiwal-blue)] flex-shrink-0" />
                          {c.name}
                        </h4>
                        <p className="text-xs sm:text-[13px] text-[var(--text-secondary)] pl-5 leading-normal">
                          {c.desc}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-6 mt-6 border-t border-[rgba(7,26,40,0.08)] flex items-center justify-between">
                  <Link
                    href="/locations"
                    className="inline-flex items-center gap-1.5 text-sm font-bold text-[var(--ratiwal-blue)] hover:text-[var(--ratiwal-blue-deep)] transition-colors group"
                  >
                    <span>Explore {hub.city.split(",")[0]} properties</span>
                    <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" />
                  </Link>
                </div>
              </div>
            </Reveal>
          ))}
        </div>

      </div>
    </section>
  );
}

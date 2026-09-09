"use client";

import React from "react";
import Image from "next/image";
import { CheckCircle2, FileSearch, ShieldCheck, Compass, Users, Sparkles, Scale } from "lucide-react";
import { Reveal } from "@/components/home/Reveal";

export function AboutStory() {
  const pillars = [
    {
      icon: FileSearch,
      number: "01",
      title: "30-Year Title Search",
      desc: "Every plot undergoes exhaustive revenue record verification across Jamabandi, Khasra, Patta history, and Sub-Registrar records to guarantee zero encumbrances.",
    },
    {
      icon: ShieldCheck,
      number: "02",
      title: "Statutory Approval Audit",
      desc: "We verify municipal masterplan sanctions and layout approvals (JDA, CIDCO, RERA) to protect your capital from unapproved or green belt risks.",
    },
    {
      icon: Compass,
      number: "03",
      title: "Growth Corridor Mapping",
      desc: "We curate plots strictly along high-momentum growth vectors—expressways, multi-modal logistics hubs, and designated urban expansion sectors.",
    },
    {
      icon: Users,
      number: "04",
      title: "End-to-End Mutation Support",
      desc: "Our advisory guides you through agreement drafting, registry registration, official mutation (Dakhil Kharij), and physical boundary pegging.",
    },
  ];

  return (
    <section className="py-14 sm:py-20 bg-[var(--surface)] border-y border-[rgba(7,26,40,0.06)]" aria-labelledby="story-title">
      <div className="max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Row: Narrative Copy (Left 7 cols) & Visual Showcase (Right 5 cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 xl:gap-14 items-center mb-12 sm:mb-16">
          
          {/* Left Column: Narrative Copy */}
          <div className="lg:col-span-7 flex flex-col justify-between">
            <Reveal>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--advisor-ivory)] border border-[rgba(8,127,195,0.2)] shadow-2xs mb-3 sm:mb-4">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--ratiwal-blue)]" />
                <span className="text-[10.5px] sm:text-[11.5px] font-bold tracking-[0.14em] uppercase text-[var(--ratiwal-blue)]">
                  OUR ORIGIN &amp; PURPOSE
                </span>
              </div>
              
              <h2
                id="story-title"
                className="font-instrument text-[2.1rem] xs:text-[2.5rem] sm:text-[3.2rem] md:text-[3.6rem] text-[var(--midnight)] font-normal leading-[1.08] sm:leading-[1.04] tracking-tight mb-4 sm:mb-5"
              >
                Built to bring institutional rigor to{" "}
                <span className="italic text-[var(--ratiwal-blue)]">private land ownership.</span>
              </h2>
            </Reveal>

            <Reveal delay={100}>
              <div className="space-y-3.5 sm:space-y-4 text-xs xs:text-sm sm:text-base md:text-[16.5px] text-[var(--text-secondary)] leading-relaxed mb-6 sm:mb-8 font-normal">
                <p>
                  Land ownership in India has historically been fraught with fragmented records, speculative broker markups, and unverified title claims. For individual buyers and family offices, acquiring a plot often felt like navigating a legal minefield.
                </p>
                <p>
                  <strong className="text-[var(--midnight)] font-semibold">Ratiwal Dream Estates</strong> was established with a singular, uncompromising mission: to make land transactions completely transparent, legally ironclad, and strategically profitable.
                </p>
                <p>
                  We operate not as transactional brokers chasing quick commissions, but as dedicated private property advisors. From initial title examination at local revenue tehsils to final registry and physical possession, we protect your capital with institutional precision.
                </p>
              </div>
            </Reveal>

            {/* Core Commitments Pill Grid */}
            <Reveal delay={150}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3 p-4 sm:p-5 rounded-2xl bg-white border border-[rgba(7,26,40,0.08)] shadow-2xs">
                {[
                  "100% On-Ground Boundary Demarcation",
                  "Direct Transparent Seller Valuations",
                  "Zero Speculative Middleman Markups",
                  "Comprehensive Written Title Dossiers",
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2.5 text-xs sm:text-[13px] font-bold text-[var(--midnight)]">
                    <CheckCircle2 size={16} className="text-[var(--ratiwal-blue)] flex-shrink-0" />
                    <span className="leading-snug">{item}</span>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>

          {/* Right Column: Visual Showcase Card */}
          <div className="lg:col-span-5">
            <Reveal delay={200}>
              <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden border border-[rgba(7,26,40,0.1)] shadow-xl bg-white aspect-[4/3] sm:aspect-[4/3.2] lg:aspect-[4/3.8] group">
                <Image
                  src="/images/about/township-development.jpg"
                  alt="Planned residential township with verified demarcated plots"
                  fill
                  sizes="(max-width: 1024px) 100vw, 550px"
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[var(--midnight)] via-[var(--midnight)]/30 to-transparent opacity-85" />
                
                {/* Floating Top Pill */}
                <div className="absolute top-4 left-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/90 backdrop-blur-md text-[10.5px] font-bold uppercase tracking-wider text-[var(--midnight)] shadow-md">
                  <Sparkles size={12} className="text-[var(--ratiwal-blue)]" />
                  <span>Vetted Land Assets</span>
                </div>

                {/* Bottom Image Caption */}
                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-widest text-[var(--cyan)] block mb-1">
                    Statutory Masterplanned Projects
                  </span>
                  <p className="font-instrument text-base sm:text-lg text-white font-normal leading-snug">
                    Every township undergoes rigorous masterplan, road connectivity, and boundary verification.
                  </p>
                </div>
              </div>
            </Reveal>
          </div>

        </div>

        {/* Bottom Row: 4 Full-Width Institutional Pillars */}
        <div className="pt-2 sm:pt-4 border-t border-[rgba(7,26,40,0.06)]">
          <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-10">
            <span className="text-[11px] font-bold uppercase tracking-widest text-[var(--ratiwal-blue)] block mb-1">
              THE RATIWAL ADVISORY STANDARD
            </span>
            <h3 className="font-instrument text-2xl sm:text-3xl text-[var(--midnight)] font-normal">
              How we protect and grow your capital.
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {pillars.map((pillar, index) => (
              <Reveal key={index} delay={index * 80}>
                <div className="p-5 sm:p-6 rounded-2xl bg-white border border-[rgba(7,26,40,0.08)] shadow-xs transition-all duration-300 hover:border-[rgba(8,127,195,0.3)] hover:shadow-md hover:-translate-y-1 h-full flex flex-col justify-between group">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-10 h-10 rounded-xl bg-[var(--cyan-soft)] text-[var(--ratiwal-blue)] flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                        <pillar.icon size={19} strokeWidth={2.2} />
                      </div>
                      <span className="font-instrument text-2xl text-[var(--text-secondary)]/30 font-normal">
                        {pillar.number}
                      </span>
                    </div>
                    
                    <h4 className="text-sm sm:text-base font-bold text-[var(--midnight)] mb-2 leading-snug group-hover:text-[var(--ratiwal-blue)] transition-colors">
                      {pillar.title}
                    </h4>

                    <p className="text-xs sm:text-[13px] text-[var(--text-secondary)] leading-relaxed">
                      {pillar.desc}
                    </p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}

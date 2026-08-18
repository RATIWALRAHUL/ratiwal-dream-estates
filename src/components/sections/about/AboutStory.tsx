"use client";

import React from "react";
import Image from "next/image";
import { CheckCircle2, FileSearch, ShieldCheck, Compass, Users } from "lucide-react";
import { Reveal } from "@/components/home/Reveal";

export function AboutStory() {
  const pillars = [
    {
      icon: FileSearch,
      title: "30-Year Title Search",
      desc: "Every plot undergoes exhaustive revenue record searches (Jamabandi, Khasra, Patta history, and Sub-Registrar records) to ensure zero encumbrances.",
    },
    {
      icon: ShieldCheck,
      title: "Statutory Approval Audit",
      desc: "We verify town planning approvals (JDA, CIDCO, RERA, Nagar Nigam) to safeguard your investment from unauthorized layout risks.",
    },
    {
      icon: Compass,
      title: "Growth Corridor Mapping",
      desc: "We prioritize plots situated along high-momentum growth vectors—expressways, metro corridors, and industrial corridors.",
    },
    {
      icon: Users,
      title: "End-to-End Mutation Support",
      desc: "Our advisory doesn't end at the token amount. We escort you through agreement drafting, registry registration, mutation (Dakhil Kharij), and possession.",
    },
  ];

  return (
    <section className="py-14 sm:py-20 bg-[var(--surface)] border-y border-[rgba(7,26,40,0.06)]" aria-labelledby="story-title">
      <div className="max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          
          {/* Left Column: Narrative Copy */}
          <div className="lg:col-span-7">
            <Reveal>
              <div className="flex items-center gap-2 mb-3">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--ratwal-blue)]" />
                <span className="text-[12px] font-bold tracking-[0.16em] uppercase text-[var(--ratwal-blue)]">
                  OUR ORIGIN &amp; PURPOSE
                </span>
              </div>
              
              <h2
                id="story-title"
                className="font-instrument text-[2.4rem] sm:text-[3rem] md:text-[3.5rem] text-[var(--midnight)] font-normal leading-[1.05] tracking-tight mb-6"
              >
                Built to bring institutional rigor to{" "}
                <span className="italic text-[var(--ratwal-blue)]">private land ownership.</span>
              </h2>
            </Reveal>

            <Reveal delay={100}>
              <div className="space-y-4 text-base sm:text-lg text-[var(--text-secondary)] leading-relaxed mb-8">
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

            {/* Core Commitments List */}
            <Reveal delay={150}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
                {[
                  "100% On-Ground Physical Verification",
                  "Direct Transparent Seller Discussions",
                  "Zero Hidden Middleman Overheads",
                  "Clear Written Documentation Briefs",
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2.5">
                    <CheckCircle2 size={18} className="text-[var(--ratwal-blue)] flex-shrink-0" />
                    <span className="text-sm font-semibold text-[var(--midnight)]">{item}</span>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>

          {/* Right Column: Visual Showcase + 4 Pillars Box */}
          <div className="lg:col-span-5">
            <Reveal delay={200}>
              <div className="relative rounded-2xl overflow-hidden border border-[rgba(7,26,40,0.12)] shadow-lg bg-white mb-6 aspect-[4/3]">
                <Image
                  src="/images/about/township-development.jpg"
                  alt="Planned residential township with verified demarcated plots"
                  fill
                  sizes="(max-width: 1024px) 100vw, 500px"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[var(--midnight)]/80 via-transparent to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--cyan)]">
                    Vetted Land Assets
                  </span>
                  <p className="font-instrument text-lg text-white font-normal mt-0.5">
                    Every township undergoes rigorous masterplan, road connectivity, and boundary verification.
                  </p>
                </div>
              </div>
            </Reveal>

            {/* 4 Pillars Card Grid */}
            <div className="space-y-3">
              {pillars.map((pillar, index) => (
                <Reveal key={index} delay={250 + index * 50}>
                  <div className="p-4 rounded-xl bg-white border border-[rgba(7,26,40,0.08)] shadow-xs transition-all duration-300 hover:border-[rgba(8,127,195,0.3)] hover:shadow-sm flex gap-3.5">
                    <div className="w-9 h-9 rounded-lg bg-[var(--cyan-soft)] text-[var(--ratwal-blue)] flex items-center justify-center flex-shrink-0 mt-0.5">
                      <pillar.icon size={18} strokeWidth={2} />
                    </div>
                    <div>
                      <h3 className="text-[14px] font-bold text-[var(--midnight)] mb-1">
                        {pillar.title}
                      </h3>
                      <p className="text-[12.5px] text-[var(--text-secondary)] leading-relaxed">
                        {pillar.desc}
                      </p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

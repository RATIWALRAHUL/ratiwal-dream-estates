"use client";

import React from "react";
import Link from "next/link";
import { Users, Globe, Building, Heart, ArrowRight } from "lucide-react";
import { Reveal } from "@/components/home/Reveal";

export function InvestmentProfiles() {
  const profiles = [
    {
      icon: Heart,
      title: "First-Time Buyers & Families",
      focus: "Gated residential plots & home construction",
      desc: "We help families acquire legally vetted plots in peaceful, infrastructure-ready gated communities in Jaipur and Ajmer to build their dream homes.",
      typicalBudget: "₹15 Lakhs – ₹60 Lakhs",
      recommendation: "JDA-approved residential plots with water/power connections",
    },
    {
      icon: Building,
      title: "HNIs & Family Offices",
      focus: "Strategic land banking & portfolio alpha",
      desc: "For private capital seeking multi-acre wealth preservation, we identify high-momentum growth parcels along expressways and future ring roads.",
      typicalBudget: "₹1 Crore – ₹25+ Crores",
      recommendation: "Expressway frontage commercial plots & strategic land banks",
    },
    {
      icon: Globe,
      title: "NRI & Outstation Investors",
      focus: "100% remote fiduciary representation",
      desc: "Complete end-to-end digital due diligence briefs, high-definition drone site surveys, and seamless Power of Attorney (PoA) registry support.",
      typicalBudget: "₹30 Lakhs – ₹3 Crores",
      recommendation: "High-growth corridors with clear mutation and resale liquidity",
    },
    {
      icon: Users,
      title: "Developers & Logistics Hubs",
      focus: "Commercial & industrial land acquisition",
      desc: "Institutional land acquisition for warehousing, manufacturing units, logistics hubs, and private educational or hospitality projects.",
      typicalBudget: "Custom Institutional Mandates",
      recommendation: "DMIC freight axis & NH-48 corridor industrial land",
    },
  ];

  return (
    <section className="py-14 sm:py-20 bg-[var(--surface)] border-y border-[rgba(7,26,40,0.06)]" aria-labelledby="profiles-heading">
      <div className="max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="max-w-3xl mx-auto text-center mb-12 sm:mb-16">
          <Reveal>
            <div className="inline-flex items-center justify-center gap-1.5 px-3 py-1 rounded-full bg-[var(--advisor-ivory)] border border-[rgba(8,127,195,0.2)] shadow-2xs mb-3">
              <Users size={14} className="text-[var(--ratiwal-blue)]" />
              <span className="text-[10px] sm:text-[11.5px] font-bold tracking-[0.14em] uppercase text-[var(--ratiwal-blue)]">
                INVESTOR PROFILES
              </span>
            </div>

            <h2
              id="profiles-heading"
              className="font-instrument text-[1.85rem] xs:text-[2.15rem] sm:text-[2.9rem] md:text-[3.5rem] lg:text-[3.8rem] text-[var(--midnight)] font-normal leading-[1.12] sm:leading-[1.05] tracking-tight mb-3 sm:mb-4"
            >
              Tailored advisory for your{" "}
              <span className="italic text-[var(--ratiwal-blue)]">capital goals.</span>
            </h2>

            <p className="text-xs sm:text-base md:text-lg text-[var(--text-secondary)] leading-relaxed max-w-2xl mx-auto font-normal sm:font-medium">
              Whether allocating family savings or managing an institutional land bank, our advisory adapts to your exact risk profile.
            </p>
          </Reveal>
        </div>

        {/* 4 Profile Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {profiles.map((p, idx) => (
            <Reveal key={idx} delay={idx * 60}>
              <div className="p-6 sm:p-7 rounded-2xl bg-white border border-[rgba(7,26,40,0.08)] shadow-xs hover:border-[rgba(8,127,195,0.3)] hover:shadow-md transition-all duration-300 h-full flex flex-col justify-between">
                <div>
                  <div className="w-11 h-11 rounded-xl bg-[var(--cyan-soft)] text-[var(--ratiwal-blue-deep)] flex items-center justify-center mb-4">
                    <p.icon size={22} strokeWidth={1.8} />
                  </div>

                  <h3 className="font-instrument text-2xl text-[var(--midnight)] font-normal mb-1">
                    {p.title}
                  </h3>

                  <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--ratiwal-blue)] block mb-3">
                    {p.focus}
                  </span>

                  <p className="text-xs sm:text-[13px] text-[var(--text-secondary)] leading-relaxed mb-4">
                    {p.desc}
                  </p>
                </div>

                <div className="pt-4 border-t border-[rgba(7,26,40,0.06)] space-y-2">
                  <div className="text-[11px] text-[var(--text-secondary)]">
                    Target Segment: <strong className="text-[var(--midnight)] block">{p.typicalBudget}</strong>
                  </div>
                  <Link
                    href="/contact"
                    className="inline-flex items-center gap-1 text-xs font-bold text-[var(--ratiwal-blue)] hover:text-[var(--ratiwal-blue-deep)] transition-colors group"
                  >
                    <span>Request Strategy</span>
                    <ArrowRight size={13} className="transition-transform group-hover:translate-x-1" />
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

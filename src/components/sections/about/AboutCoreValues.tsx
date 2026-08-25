"use client";

import React from "react";
import { 
  ShieldCheck, 
  FileText, 
  Compass, 
  HeartHandshake, 
  Eye, 
  Award 
} from "lucide-react";
import { Reveal } from "@/components/home/Reveal";

export function AboutCoreValues() {
  const values = [
    {
      icon: ShieldCheck,
      title: "Unwavering Fiduciary Duty",
      description:
        "We act exclusively in your best interest. If a land parcel has legal ambiguity or inflated pricing, we advise you to walk away—every single time.",
    },
    {
      icon: Eye,
      title: "100% Price & Doc Visibility",
      description:
        "No hidden middleman markups, undisclosed registry charges, or obscure paperwork. Every document and rate is laid bare before commitment.",
    },
    {
      icon: Compass,
      title: "Ground Reality over Speculation",
      description:
        "We evaluate plots based on actual development momentum, road approvals, and municipal infrastructure—not hollow marketing promises.",
    },
    {
      icon: FileText,
      title: "30-Year Revenue Title Scrutiny",
      description:
        "Our legal diligence traces 3 decades of Jamabandi, Patta records, and registry entries to guarantee flawless ownership transfer.",
    },
    {
      icon: HeartHandshake,
      title: "Lifelong Client Relationship",
      description:
        "Our relationship begins, not ends, at registry. We assist you with mutation, possession demarcation, and long-term asset management.",
    },
    {
      icon: Award,
      title: "Curated Portfolio Selection",
      description:
        "We do not list hundreds of arbitrary listings. Every plot on our roster is personally vetted by our senior property advisors.",
    },
  ];

  return (
    <section className="py-14 sm:py-20 bg-[var(--surface)] border-t border-[rgba(7,26,40,0.06)]" aria-labelledby="values-title">
      <div className="max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="max-w-3xl mx-auto text-center mb-12 sm:mb-16">
          <Reveal>
            <div className="flex items-center justify-center gap-2 mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--ratiwal-blue)]" />
              <span className="text-[12px] font-bold tracking-[0.16em] uppercase text-[var(--ratiwal-blue)]">
                OUR CORE VALUES
              </span>
            </div>

            <h2
              id="values-title"
              className="font-instrument text-[2.4rem] sm:text-[3.2rem] md:text-[3.8rem] text-[var(--midnight)] font-normal leading-[1.05] tracking-tight mb-4"
            >
              The principles that govern{" "}
              <span className="italic text-[var(--ratiwal-blue)]">our counsel.</span>
            </h2>

            <p className="text-base sm:text-lg text-[var(--text-secondary)] leading-relaxed">
              We hold ourselves to the highest ethical and professional standards in the Indian real estate consultancy landscape.
            </p>
          </Reveal>
        </div>

        {/* 6-Card Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {values.map((val, idx) => (
            <Reveal key={idx} delay={idx * 60}>
              <div className="h-full p-6 sm:p-7 rounded-2xl bg-white border border-[rgba(7,26,40,0.08)] shadow-xs transition-all duration-300 hover:shadow-md hover:border-[rgba(8,127,195,0.3)] hover:-translate-y-1 flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 rounded-xl bg-[var(--cyan-soft)] text-[var(--ratiwal-blue-deep)] flex items-center justify-center mb-5 shadow-xs">
                    <val.icon size={24} strokeWidth={1.8} />
                  </div>
                  
                  <h3 className="font-instrument text-2xl text-[var(--midnight)] font-normal leading-snug mb-3">
                    {val.title}
                  </h3>

                  <p className="text-sm sm:text-[14.5px] text-[var(--text-secondary)] leading-relaxed">
                    {val.description}
                  </p>
                </div>

                <div className="pt-5 mt-5 border-t border-[rgba(7,26,40,0.06)] flex items-center gap-1.5 text-xs font-bold text-[var(--ratiwal-blue)]">
                  <span>Ratiwal Integrity Standard</span>
                </div>
              </div>
            </Reveal>
          ))}
        </div>

      </div>
    </section>
  );
}

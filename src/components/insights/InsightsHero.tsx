"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, BookOpen, FileCheck2, Sparkles, ShieldCheck, Scale, Compass, CheckCircle2 } from "lucide-react";
import { InsightArticle } from "@/types/insight";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { Reveal } from "@/components/home/Reveal";
import { MagneticButton } from "@/components/home/MagneticButton";

interface InsightsHeroProps {
  featuredArticle: InsightArticle;
}

export function InsightsHero({ featuredArticle }: InsightsHeroProps) {
  const breadcrumbItems = [{ label: "Property Intelligence Journal", href: "/insights" }];

  const journalPillars = [
    { icon: ShieldCheck, label: "Statutory Due Diligence", desc: "Section 90A, Jamabandi & Tehsil record checks" },
    { icon: FileCheck2, label: "Revenue Documentation", desc: "Registry formats, Patta validations & encumbrance" },
    { icon: Scale, label: "RERA Buyer Safeguards", desc: "Escrow compliance & layout sanction protocols" },
    { icon: Compass, label: "Corridor Infrastructure", desc: "Expressway masterplans & town planning vector audits" },
  ];

  return (
    <section className="relative pt-20 sm:pt-22 md:pt-24 pb-12 sm:pb-16 overflow-hidden bg-[var(--surface)] border-b border-[rgba(7,26,40,0.06)]" aria-labelledby="insights-hero-heading">
      {/* Background Soft Glow */}
      <div className="absolute inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute -top-[15%] left-1/2 -translate-x-1/2 w-[1100px] h-[450px] bg-[radial-gradient(ellipse_at_center,rgba(66,183,232,0.12),transparent_70%)] blur-3xl" />
      </div>

      <div className="max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumb Navigation */}
        <div className="mb-4 sm:mb-6">
          <Breadcrumbs items={breadcrumbItems} />
        </div>

        {/* Hero Top Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center mb-10 sm:mb-14">
          
          {/* Left 7 Columns: Editorial Headline & Actions */}
          <div className="lg:col-span-7 flex flex-col items-start z-10">
            <Reveal>
              <div className="inline-flex items-center gap-1.5 px-3.5 py-1 sm:px-4 sm:py-1.5 rounded-full bg-[var(--advisor-ivory)] border border-[rgba(8,127,195,0.2)] shadow-2xs mb-3 sm:mb-4">
                <Sparkles size={13} className="text-[var(--ratiwal-blue)] flex-shrink-0" />
                <span className="text-[9.5px] xs:text-[10.5px] sm:text-[12px] font-bold tracking-[0.14em] uppercase text-[var(--ratiwal-blue)]">
                  PROPERTY INTELLIGENCE &amp; RESEARCH
                </span>
              </div>

              <h1
                id="insights-hero-heading"
                className="font-instrument text-[2rem] xs:text-[2.4rem] sm:text-[3.2rem] md:text-[3.8rem] lg:text-[4.2rem] text-[var(--midnight)] font-normal leading-[1.08] sm:leading-[1.04] tracking-tight mb-3 sm:mb-4"
              >
                Knowledge for more{" "}
                <span className="italic text-[var(--ratiwal-blue)]">considered decisions.</span>
              </h1>
            </Reveal>

            <Reveal delay={100}>
              <p className="text-xs xs:text-sm sm:text-base md:text-lg text-[var(--text-secondary)] leading-relaxed max-w-[620px] font-normal sm:font-medium mb-6 sm:mb-8">
                Explore authoritative field guides, statutory revenue documentation checklists, RERA compliance frameworks, and infrastructure evaluations curated by senior land advisors.
              </p>
            </Reveal>

            {/* Action Buttons */}
            <Reveal delay={150}>
              <div className="flex flex-col xs:flex-row items-stretch xs:items-center gap-3 w-full sm:w-auto mb-5">
                <MagneticButton strength={6} className="w-full xs:w-auto">
                  <a
                    href="#insights-directory"
                    className="inline-flex items-center justify-center gap-2 w-full xs:w-auto px-6 py-3.5 rounded-full bg-[var(--ratiwal-blue)] hover:bg-[var(--ratiwal-blue-deep)] text-white font-bold text-xs sm:text-sm shadow-md shadow-[rgba(8,127,195,0.25)] transition-all group whitespace-nowrap"
                  >
                    <span>Explore Research Journal</span>
                    <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
                  </a>
                </MagneticButton>

                <MagneticButton strength={6} className="w-full xs:w-auto">
                  <a
                    href="#resource-library"
                    className="inline-flex items-center justify-center gap-2 w-full xs:w-auto px-5 py-3.5 rounded-full bg-white hover:bg-[var(--mist-blue)] border border-[rgba(7,26,40,0.1)] text-[var(--midnight)] font-bold text-xs sm:text-sm transition-all shadow-2xs whitespace-nowrap"
                  >
                    <FileCheck2 size={15} className="text-[var(--ratiwal-blue)]" />
                    <span>Download Checklists</span>
                  </a>
                </MagneticButton>
              </div>

              {/* Verified Attribution Note */}
              <p className="text-[11px] sm:text-xs text-[var(--text-secondary)] flex items-center gap-1.5 font-medium">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-[var(--ratiwal-blue)]" aria-hidden="true" />
                Educational research journal. Grounded in statutory revenue authority guidelines (JDA, CIDCO, RERA).
              </p>
            </Reveal>
          </div>

          {/* Right 5 Columns: Lead Featured Publication Card */}
          <div className="lg:col-span-5 relative">
            <Reveal delay={200}>
              <Link
                href={`/insights/${featuredArticle.slug}`}
                className="group block relative rounded-2xl sm:rounded-3xl overflow-hidden bg-white border border-[rgba(7,26,40,0.1)] shadow-xl hover:shadow-2xl transition-all duration-300"
                aria-label={`Read featured guide: ${featuredArticle.title}`}
              >
                {/* Hero Image Container */}
                <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-100">
                  <Image
                    src={featuredArticle.heroImage}
                    alt={featuredArticle.title}
                    fill
                    priority
                    sizes="(max-width: 1024px) 100vw, 450px"
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[var(--midnight)] via-transparent to-transparent opacity-80" />

                  {/* Top Floating Badge */}
                  <div className="absolute top-3.5 left-3.5">
                    <span className="px-3 py-1 rounded-full bg-[var(--ratiwal-blue)] text-white text-[10.5px] font-bold uppercase tracking-wider shadow-md">
                      Lead Publication
                    </span>
                  </div>

                  {/* Reading Time Pill */}
                  <div className="absolute top-3.5 right-3.5 px-2.5 py-0.5 rounded-full bg-white/90 backdrop-blur-md text-[10.5px] font-bold text-[var(--midnight)] shadow-xs">
                    {featuredArticle.readingTimeMinutes} min read
                  </div>
                </div>

                {/* Card Content Footer */}
                <div className="p-4 sm:p-5">
                  <span className="text-[10.5px] font-bold uppercase tracking-widest text-[var(--ratiwal-blue)] block mb-1">
                    {featuredArticle.category}
                  </span>
                  
                  <h3 className="font-instrument text-lg sm:text-xl text-[var(--midnight)] font-normal leading-snug line-clamp-2 mb-2 group-hover:text-[var(--ratiwal-blue)] transition-colors">
                    {featuredArticle.title}
                  </h3>

                  <p className="text-xs text-[var(--text-secondary)] line-clamp-2 leading-relaxed mb-3">
                    {featuredArticle.excerpt}
                  </p>

                  <div className="pt-2.5 border-t border-[rgba(7,26,40,0.06)] flex items-center justify-between text-xs font-bold text-[var(--ratiwal-blue)]">
                    <span className="flex items-center gap-1">
                      <span>Read Research Paper</span>
                      <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                    </span>
                    <span className="text-[11px] font-medium text-[var(--text-secondary)]">
                      {featuredArticle.author.name}
                    </span>
                  </div>
                </div>
              </Link>
            </Reveal>
          </div>

        </div>

        {/* 4 Bottom Pillar Badges */}
        <Reveal delay={250}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 pt-4">
            {journalPillars.map((p, idx) => (
              <div
                key={idx}
                className="p-3.5 sm:p-4 rounded-2xl bg-white border border-[rgba(7,26,40,0.08)] shadow-xs hover:border-[rgba(8,127,195,0.3)] hover:shadow-md transition-all duration-300 flex items-start gap-3"
              >
                <div className="w-8 h-8 rounded-lg bg-[var(--cyan-soft)] text-[var(--ratiwal-blue)] flex items-center justify-center flex-shrink-0 mt-0.5">
                  <p.icon size={16} strokeWidth={2.2} />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-[12.5px] sm:text-[13px] font-bold text-[var(--midnight)] block leading-snug">
                    {p.label}
                  </span>
                  <span className="text-[11px] sm:text-xs text-[var(--text-secondary)] block mt-0.5 leading-snug">
                    {p.desc}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Reveal>

      </div>
    </section>
  );
}

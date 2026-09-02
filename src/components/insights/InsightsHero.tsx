import Link from "next/link";
import Image from "next/image";
import { ArrowRight, BookOpen, FileCheck2 } from "lucide-react";
import { InsightArticle } from "@/types/insight";

interface InsightsHeroProps {
  featuredArticle: InsightArticle;
}

export function InsightsHero({ featuredArticle }: InsightsHeroProps) {
  return (
    <section
      className="relative overflow-hidden bg-gradient-to-b from-[#031C2B] via-[#072435] to-[#082B3B] text-white pt-20 sm:pt-24 md:pt-24 pb-14 sm:pb-20 border-b border-[rgba(255,255,255,0.08)]"
      aria-labelledby="insights-hero-heading"
    >
      {/* Blueprint grid background */}
      <div
        className="absolute inset-0 opacity-[0.05] pointer-events-none bg-[radial-gradient(#52BDE9_1px,transparent_1px)] [background-size:28px_28px]"
        aria-hidden="true"
      />
      <div
        className="absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full bg-[radial-gradient(circle,rgba(7,132,200,0.2)_0%,transparent_70%)] pointer-events-none blur-2xl"
        aria-hidden="true"
      />

      <div className="relative max-w-[1320px] w-[calc(100%-48px)] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column: Editorial Headline & Actions */}
          <div className="lg:col-span-7 flex flex-col items-start z-10">
            {/* Eyebrow */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[rgba(82,189,233,0.12)] border border-[rgba(82,189,233,0.25)] text-[#52BDE9] text-xs font-bold uppercase tracking-wider mb-6">
              <BookOpen className="w-3.5 h-3.5" aria-hidden="true" />
              <span>01 / Property Intelligence</span>
            </div>

            {/* Headline */}
            <h1
              id="insights-hero-heading"
              className="font-heading text-3xl sm:text-4xl md:text-5xl lg:text-[3.35rem] font-normal leading-[1.08] tracking-tight text-white mb-6"
            >
              Knowledge for more <br className="hidden sm:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-[#d2ecf8] to-[#52BDE9]">
                considered decisions.
              </span>
            </h1>

            {/* Supporting Copy */}
            <p className="text-base md:text-lg text-[#c5d8e4] font-normal leading-relaxed max-w-[620px] mb-8">
              Explore practical guides, revenue documentation checklists, RERA compliance frameworks, and corridor
              infrastructure evaluations created for land buyers and real estate investors.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-4 mb-8 w-full sm:w-auto">
              <a
                href="#insights-directory"
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full bg-gradient-to-r from-[#0784C8] to-[#129be0] text-white font-medium text-sm shadow-[0_10px_25px_rgba(7,132,200,0.35)] hover:translate-y-[-2px] transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
              >
                <span>Explore latest insights</span>
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </a>

              <a
                href="#resource-library"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-[rgba(255,255,255,0.08)] hover:bg-[rgba(255,255,255,0.15)] text-white text-sm font-medium border border-[rgba(255,255,255,0.15)] transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
              >
                <FileCheck2 className="w-4 h-4 text-[#52BDE9]" aria-hidden="true" />
                <span>Download checklists</span>
              </a>
            </div>

            {/* Microcopy disclaimer */}
            <p className="text-[11.5px] text-[#7a93a5] flex items-center gap-1.5">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#52BDE9]" aria-hidden="true" />
              Educational research journal. Sourced against official state development authorities.
            </p>
          </div>

          {/* Right Column: Featured Publication Preview */}
          <div className="lg:col-span-5 relative">
            <Link
              href={`/insights/${featuredArticle.slug}`}
              className="group block relative aspect-[4/3] sm:aspect-[16/11] lg:aspect-[4/3] rounded-2xl overflow-hidden border border-[rgba(255,255,255,0.16)] shadow-[0_24px_60px_rgba(0,0,0,0.45)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
              aria-label={`Read featured guide: ${featuredArticle.title}`}
            >
              <Image
                src={featuredArticle.heroImage}
                alt={featuredArticle.title}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 42vw"
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#031C2B] via-[rgba(3,28,43,0.4)] to-transparent" />

              {/* Floating Lead Badge */}
              <div className="absolute top-4 left-4">
                <span className="px-3 py-1 rounded-full bg-[#0784C8] text-white text-[11px] font-bold uppercase tracking-wider shadow-md">
                  Lead Publication
                </span>
              </div>

              {/* Card Footer Info */}
              <div className="absolute bottom-4 left-4 right-4 p-4 rounded-xl bg-[rgba(3,28,43,0.92)] backdrop-blur-md border border-[rgba(255,255,255,0.14)]">
                <span className="text-[11px] font-bold text-[#52BDE9] uppercase tracking-wider block mb-1">
                  {featuredArticle.category} • {featuredArticle.readingTimeMinutes} min read
                </span>
                <h3 className="font-heading text-sm sm:text-base font-bold text-white leading-snug line-clamp-2 mb-2 group-hover:text-[#52BDE9] transition-colors">
                  {featuredArticle.title}
                </h3>
                <span className="text-[11px] text-[#c5d8e4] flex items-center gap-1">
                  <span>Read Complete Research Paper</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#52BDE9] transition-transform group-hover:translate-x-1" />
                </span>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

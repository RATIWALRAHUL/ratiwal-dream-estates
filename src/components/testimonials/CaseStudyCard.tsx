import Link from "next/link";
import Image from "next/image";
import { ArrowRight, MapPin, ShieldCheck, Clock } from "lucide-react";
import { CaseStudy } from "@/types/testimonial";

interface CaseStudyCardProps {
  caseStudy: CaseStudy;
}

export function CaseStudyCard({ caseStudy }: CaseStudyCardProps) {
  return (
    <article
      className="group bg-white rounded-2xl border border-[rgba(7,26,40,0.1)] overflow-hidden shadow-[0_4px_20px_rgba(7,26,40,0.04)] hover:shadow-[0_16px_36px_rgba(7,26,40,0.1)] hover:border-[rgba(7,132,200,0.35)] transition-all duration-300 flex flex-col justify-between"
      aria-labelledby={`cs-card-title-${caseStudy.slug}`}
    >
      {/* Thumbnail */}
      <div className="relative aspect-[16/10] w-full bg-[#072435] overflow-hidden">
        <Image
          src={caseStudy.heroImage}
          alt={`Case study: ${caseStudy.title}`}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#031C2B] via-transparent to-transparent opacity-80" />

        {/* Location & Category Badge */}
        <div className="absolute top-3.5 left-3.5 flex flex-wrap gap-2 z-10">
          <span className="px-3 py-1 rounded-full bg-[rgba(3,28,43,0.85)] backdrop-blur-md border border-[rgba(255,255,255,0.2)] text-white text-[11px] font-bold uppercase tracking-wider">
            {caseStudy.propertyType}
          </span>
        </div>

        <div className="absolute bottom-3 left-3.5 right-3.5 flex items-center justify-between text-white z-10 text-xs">
          <span className="flex items-center gap-1 text-[#d2ecf8]">
            <MapPin className="w-3.5 h-3.5 text-[#52BDE9]" />
            {caseStudy.location}
          </span>
          <span className="text-[11px] text-[#a0b6c6] flex items-center gap-1 font-mono">
            <Clock className="w-3 h-3 text-[#24D17F]" />
            {caseStudy.timeframe}
          </span>
        </div>
      </div>

      {/* Body */}
      <div className="p-6 flex-1 flex flex-col justify-between">
        <div>
          <span className="text-xs font-semibold text-[#0784C8] uppercase tracking-wider block mb-1">
            {caseStudy.clientProfile}
          </span>

          <h3
            id={`cs-card-title-${caseStudy.slug}`}
            className="font-heading text-xl text-[#031C2B] font-normal leading-snug mb-2 group-hover:text-[#0784C8] transition-colors"
          >
            {caseStudy.title}
          </h3>

          <p className="text-xs sm:text-sm text-[#4a6171] leading-relaxed mb-4 line-clamp-3">
            {caseStudy.summary}
          </p>

          <div className="p-3 rounded-xl bg-[#F5F1E9] border border-[rgba(7,26,40,0.06)] text-xs text-[#2c3e50] mb-4">
            <strong className="text-[#031C2B] block mb-0.5">Objective:</strong>
            <span className="line-clamp-2">{caseStudy.objective}</span>
          </div>
        </div>

        {/* Action Link */}
        <div className="pt-4 border-t border-[rgba(7,26,40,0.08)] flex items-center justify-between mt-auto">
          <span className="text-[11px] text-[#7a93a5] flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-[#24D17F]" />
            Verified Case Study
          </span>

          <Link
            href={`/testimonials/${caseStudy.slug}`}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0784C8] group-hover:text-[#031C2B] transition-colors focus-visible:outline"
            aria-label={`Read case study: ${caseStudy.title}`}
          >
            <span>Read Case Study</span>
            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </article>
  );
}

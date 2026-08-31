import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ShieldCheck, MapPin, Compass } from "lucide-react";
import { CaseStudy } from "@/types/testimonial";

interface FeaturedClientStoryProps {
  caseStudy?: CaseStudy;
}

export function FeaturedClientStory({ caseStudy }: FeaturedClientStoryProps) {
  if (!caseStudy) {
    return null;
  }

  return (
    <section className="py-16 md:py-24 bg-white border-b border-[rgba(7,26,40,0.08)]" aria-labelledby="featured-story-heading">
      <div className="max-w-[1320px] w-[calc(100%-48px)] mx-auto">
        <div className="rounded-3xl bg-[#F5F1E9] border border-[rgba(7,26,40,0.1)] p-7 sm:p-10 lg:p-12 overflow-hidden shadow-sm">
          {/* Section Eyebrow */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[rgba(7,132,200,0.08)] border border-[rgba(7,132,200,0.2)] text-[#0784C8] text-xs font-bold uppercase tracking-wider mb-6">
            <Compass className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Featured Experience</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            {/* Left Column: Story Editorial Details */}
            <div className="lg:col-span-7">
              <div className="flex items-center gap-2 text-xs text-[#0784C8] font-semibold mb-2">
                <MapPin className="w-3.5 h-3.5" />
                <span>{caseStudy.location} • {caseStudy.propertyType}</span>
              </div>

              <h2
                id="featured-story-heading"
                className="font-heading text-2xl sm:text-3xl lg:text-[2.4rem] text-[#031C2B] font-normal leading-tight tracking-tight mb-4"
              >
                {caseStudy.title}
              </h2>

              <p className="text-sm sm:text-base text-[#4a6171] leading-relaxed mb-6">
                {caseStudy.summary}
              </p>

              {/* Challenge & Approach Snippets */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                <div className="p-4 rounded-xl bg-white border border-[rgba(7,26,40,0.07)]">
                  <span className="text-xs font-bold text-[#b85e13] uppercase block mb-1">
                    The Challenge
                  </span>
                  <p className="text-xs text-[#536574] leading-relaxed">
                    {caseStudy.challenge}
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-white border border-[rgba(7,26,40,0.07)]">
                  <span className="text-xs font-bold text-[#0784C8] uppercase block mb-1">
                    Ratiwal Advisory Approach
                  </span>
                  <p className="text-xs text-[#536574] leading-relaxed">
                    {caseStudy.advisoryApproach[0]}
                  </p>
                </div>
              </div>

              {/* Client Quote Strip */}
              {caseStudy.clientQuote && (
                <div className="p-4 rounded-xl bg-white border-l-4 border-[#0784C8] mb-8">
                  <p className="text-xs sm:text-sm text-[#031C2B] italic leading-relaxed mb-1.5">
                    “{caseStudy.clientQuote}”
                  </p>
                  <span className="text-[11px] font-bold text-[#667d8f] uppercase">
                    — {caseStudy.clientDisplayName} ({caseStudy.clientProfile})
                  </span>
                </div>
              )}

              {/* Action Button */}
              <Link
                href={`/testimonials/${caseStudy.slug}`}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#031C2B] hover:bg-[#082B3B] text-white text-xs font-semibold tracking-wide uppercase transition-all"
              >
                <span>Read complete case study</span>
                <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
              </Link>
            </div>

            {/* Right Column: Visual */}
            <div className="lg:col-span-5 relative">
              <div className="relative aspect-[4/3] rounded-2xl overflow-hidden border border-[rgba(7,26,40,0.12)] shadow-md">
                <Image
                  src={caseStudy.heroImage}
                  alt={`Real estate land advisory in ${caseStudy.location}`}
                  fill
                  sizes="(max-width: 1024px) 100vw, 42vw"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#031C2B] via-transparent to-transparent opacity-75" />

                <div className="absolute bottom-4 left-4 right-4 p-3.5 rounded-xl bg-[rgba(3,28,43,0.9)] backdrop-blur-md border border-[rgba(255,255,255,0.14)] flex items-center justify-between text-xs text-white">
                  <span className="flex items-center gap-1.5 text-[#52BDE9]">
                    <ShieldCheck className="w-4 h-4 text-[#24D17F]" />
                    <span>Verified Client Story</span>
                  </span>
                  <span className="text-[#a0b6c6] text-[11px]">
                    Engagement: {caseStudy.timeframe}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

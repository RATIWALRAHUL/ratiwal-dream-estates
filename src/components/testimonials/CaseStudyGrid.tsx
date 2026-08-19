import { Compass } from "lucide-react";
import { CaseStudy } from "@/types/testimonial";
import { CaseStudyCard } from "./CaseStudyCard";

interface CaseStudyGridProps {
  caseStudies: CaseStudy[];
}

export function CaseStudyGrid({ caseStudies }: CaseStudyGridProps) {
  if (!caseStudies || caseStudies.length === 0) {
    return null;
  }

  return (
    <section className="py-16 md:py-24 bg-white border-b border-[rgba(7,26,40,0.08)]" aria-labelledby="case-studies-heading">
      <div className="max-w-[1320px] w-[calc(100%-48px)] mx-auto">
        {/* Section Header */}
        <div className="max-w-[720px] mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[rgba(7,132,200,0.08)] border border-[rgba(7,132,200,0.2)] text-[#0784C8] text-xs font-bold uppercase tracking-wider mb-3">
            <Compass className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Property Journeys</span>
          </div>
          <h2
            id="case-studies-heading"
            className="font-heading text-3xl sm:text-4xl lg:text-[2.75rem] text-[#031C2B] font-normal leading-tight tracking-tight mb-3"
          >
            More context than a review alone.
          </h2>
          <p className="text-sm sm:text-base text-[#4a6171] leading-relaxed">
            In-depth advisory walkthroughs illustrating how we evaluate masterplans, coordinate site visits,
            verify revenue records, and protect client interests across Rajasthan and Maharashtra.
          </p>
        </div>

        {/* Grid of Case Studies */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {caseStudies.map((caseStudy) => (
            <CaseStudyCard key={caseStudy.slug} caseStudy={caseStudy} />
          ))}
        </div>
      </div>
    </section>
  );
}

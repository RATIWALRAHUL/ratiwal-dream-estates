import { CheckCircle2, TrendingUp, Sparkles } from "lucide-react";
import { Property } from "@/types/property";

interface PropertyOverviewProps {
  property: Property;
}

export function PropertyOverview({ property }: PropertyOverviewProps) {
  return (
    <section aria-labelledby="property-overview-heading" className="mb-8 sm:mb-12">
      <div className="p-4 sm:p-7 sm:p-8 rounded-2xl sm:rounded-3xl bg-white border border-[rgba(7,26,40,0.08)] shadow-[0_4px_24px_rgba(7,26,40,0.04)]">
        <div className="inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1 rounded-full bg-[rgba(7,132,200,0.08)] border border-[rgba(7,132,200,0.2)] text-[#0784C8] text-[10.5px] sm:text-xs font-semibold uppercase tracking-wider mb-3 sm:mb-4">
          <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
          <span>Project Narrative &amp; Due Diligence</span>
        </div>

        <h2
          id="property-overview-heading"
          className="font-instrument text-xl sm:text-2xl sm:text-3xl text-[#031C2B] font-normal leading-tight tracking-tight mb-3 sm:mb-4"
        >
          About this property.
        </h2>

        <div className="prose max-w-none text-xs sm:text-sm md:text-base text-[#4a6171] leading-relaxed mb-6 sm:mb-8 space-y-3 sm:space-y-4">
          <p>{property.description}</p>
        </div>

        {/* Investment Perspective Callout */}
        {property.investmentPerspective && (
          <div className="p-3.5 sm:p-5 rounded-xl sm:rounded-2xl bg-[#edf5f9] border border-[#c4e3f3] text-[#07537d] mb-6 sm:mb-8 flex items-start gap-3">
            <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-[#0784C8] flex-shrink-0 mt-0.5" />
            <div>
              <strong className="text-[11px] sm:text-xs font-bold uppercase tracking-wider block mb-0.5">
                Strategic Investment Context
              </strong>
              <p className="text-xs sm:text-sm text-[#031C2B] leading-relaxed">
                {property.investmentPerspective}
              </p>
            </div>
          </div>
        )}

        {/* Key Highlights Grid */}
        <div>
          <h3 className="font-heading text-sm sm:text-base md:text-lg font-bold text-[#031C2B] mb-3 sm:mb-4">
            Masterplan Highlights &amp; Statutory Approvals
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3.5">
            {property.highlights.map((highlight, idx) => (
              <div
                key={idx}
                className="p-3 sm:p-3.5 rounded-xl bg-[#F5F1E9] border border-[rgba(7,26,40,0.06)] flex items-start gap-2 text-xs sm:text-sm text-[#031C2B]"
              >
                <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#24D17F] flex-shrink-0 mt-0.5" />
                <span>{highlight}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

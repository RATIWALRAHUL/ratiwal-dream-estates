import { CheckCircle2, TrendingUp, Sparkles } from "lucide-react";
import { Property } from "@/types/property";

interface PropertyOverviewProps {
  property: Property;
}

export function PropertyOverview({ property }: PropertyOverviewProps) {
  return (
    <section aria-labelledby="property-overview-heading" className="mb-12">
      <div className="p-7 sm:p-8 rounded-3xl bg-white border border-[rgba(7,26,40,0.08)] shadow-[0_4px_24px_rgba(7,26,40,0.04)]">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[rgba(7,132,200,0.08)] border border-[rgba(7,132,200,0.2)] text-[#0784C8] text-xs font-bold uppercase tracking-wider mb-4">
          <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
          <span>Project Narrative &amp; Due Diligence</span>
        </div>

        <h2
          id="property-overview-heading"
          className="font-heading text-2xl sm:text-3xl text-[#031C2B] font-normal leading-tight tracking-tight mb-4"
        >
          About this property.
        </h2>

        <div className="prose max-w-none text-sm sm:text-base text-[#4a6171] leading-relaxed mb-8 space-y-4">
          <p>{property.description}</p>
        </div>

        {/* Investment Perspective Callout */}
        {property.investmentPerspective && (
          <div className="p-5 rounded-2xl bg-[#edf5f9] border border-[#c4e3f3] text-[#07537d] mb-8 flex items-start gap-3.5">
            <TrendingUp className="w-5 h-5 text-[#0784C8] flex-shrink-0 mt-0.5" />
            <div>
              <strong className="text-xs font-bold uppercase tracking-wider block mb-1">
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
          <h3 className="font-heading text-lg font-bold text-[#031C2B] mb-4">
            Masterplan Highlights &amp; Statutory Approvals
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {property.highlights.map((highlight, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl bg-[#F5F1E9] border border-[rgba(7,26,40,0.06)] flex items-start gap-2.5 text-xs sm:text-sm text-[#031C2B]"
              >
                <CheckCircle2 className="w-4 h-4 text-[#24D17F] flex-shrink-0 mt-0.5" />
                <span>{highlight}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

import Link from "next/link";
import { ArrowRight, Building } from "lucide-react";
import { Property } from "@/types/property";
import { PropertyCard } from "@/components/property/PropertyCard";

interface RelatedPropertiesGridProps {
  relatedProperties: Property[];
  currentPropertyName: string;
}

export function RelatedPropertiesGrid({
  relatedProperties,
  currentPropertyName,
}: RelatedPropertiesGridProps) {
  if (!relatedProperties || relatedProperties.length === 0) {
    return null;
  }

  return (
    <section aria-labelledby="related-properties-heading" className="mt-10 sm:mt-16 pt-8 sm:pt-12 border-t border-[rgba(7,26,40,0.1)]">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 sm:gap-4 mb-6 sm:mb-8">
        <div>
          <div className="inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1 rounded-full bg-[rgba(7,132,200,0.08)] border border-[rgba(7,132,200,0.2)] text-[#0784C8] text-[10.5px] sm:text-xs font-semibold uppercase tracking-wider mb-2">
            <Building className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Similar Opportunities</span>
          </div>
          <h2
            id="related-properties-heading"
            className="font-instrument text-xl sm:text-2xl sm:text-3xl text-[#031C2B] font-normal leading-tight tracking-tight"
          >
            Explore related properties.
          </h2>
        </div>

        <Link
          href="/properties"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0784C8] hover:text-[#031C2B] uppercase tracking-wider transition-colors self-start sm:self-auto"
        >
          <span>View All Listings</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {relatedProperties.map((prop) => (
          <PropertyCard key={prop.id} property={prop} />
        ))}
      </div>
    </section>
  );
}

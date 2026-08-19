import Link from "next/link";
import { ArrowRight, Building2, MessageCircle, Compass } from "lucide-react";
import { Property } from "@/types/property";
import { PropertyCard } from "@/components/property/PropertyCard";
import { generateWhatsAppUrl } from "@/lib/whatsapp";

interface LocationPropertyGridProps {
  properties: Property[];
  locationName: string;
}

export function LocationPropertyGrid({ properties, locationName }: LocationPropertyGridProps) {
  const whatsappUrl = generateWhatsAppUrl({
    type: "location",
    locationName: locationName,
  });

  return (
    <section id="properties" className="py-16 md:py-24 bg-[#F5F1E9] border-b border-[rgba(7,26,40,0.08)]" aria-labelledby="available-properties-heading">
      <div className="max-w-[1320px] w-[calc(100%-48px)] mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="max-w-[700px]">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[rgba(7,132,200,0.08)] border border-[rgba(7,132,200,0.2)] text-[#0784C8] text-xs font-bold uppercase tracking-wider mb-3">
              <Building2 className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Available Opportunities</span>
            </div>
            <h2
              id="available-properties-heading"
              className="font-heading text-3xl sm:text-4xl lg:text-[2.75rem] text-[#031C2B] font-normal leading-tight tracking-tight mb-2"
            >
              Properties available in {locationName}.
            </h2>
            <p className="text-sm sm:text-base text-[#4a6171]">
              Every parcel in {locationName} carries complete revenue documentation, title verification, and statutory approvals.
            </p>
          </div>

          {properties.length > 0 && (
            <Link
              href={`/properties?city=${encodeURIComponent(locationName)}`}
              className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#0784C8] hover:text-[#031C2B] transition-colors self-start"
            >
              <span>Explore All {locationName} Listings</span>
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </Link>
          )}
        </div>

        {/* Properties Grid */}
        {properties.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {properties.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="bg-white rounded-3xl p-8 sm:p-12 text-center max-w-[700px] mx-auto border border-[rgba(7,26,40,0.1)] shadow-sm">
            <Compass className="w-12 h-12 text-[#0784C8] mx-auto mb-4" aria-hidden="true" />
            <h3 className="font-heading text-2xl sm:text-3xl text-[#031C2B] font-normal mb-3">
              New opportunities are being evaluated.
            </h3>
            <p className="text-sm text-[#4a6171] leading-relaxed max-w-[520px] mx-auto mb-8">
              Speak with our advisors about upcoming or privately available plotted and commercial options in {locationName}. We review every parcel for clear legal title before public listing.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-[#25D366] hover:bg-[#1fb355] text-[#031C2B] font-bold text-sm shadow-sm transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
                aria-label={`Share requirements for ${locationName} on WhatsApp (opens in a new tab)`}
              >
                <MessageCircle className="w-4 h-4" aria-hidden="true" />
                <span>Share your requirements</span>
              </a>

              <Link
                href="/contact"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-[#031C2B] hover:bg-[#082B3B] text-white text-sm font-semibold transition-colors"
              >
                <span>Request Market Callback</span>
              </Link>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

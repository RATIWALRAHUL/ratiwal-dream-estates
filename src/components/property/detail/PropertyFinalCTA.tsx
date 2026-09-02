import Link from "next/link";
import { MessageCircle, ArrowRight, ShieldCheck, Compass } from "lucide-react";
import { generateWhatsAppUrl } from "@/lib/whatsapp";

interface PropertyFinalCTAProps {
  propertyName: string;
  locationName: string;
}

export function PropertyFinalCTA({ propertyName, locationName }: PropertyFinalCTAProps) {
  const whatsappUrl = generateWhatsAppUrl({
    type: "property",
    propertyName,
    locationName,
  });

  return (
    <section className="py-12 sm:py-16 md:py-24 bg-[#F5F1E9] border-t border-[rgba(7,26,40,0.08)] mt-10 sm:mt-16" aria-labelledby="property-final-cta-heading">
      <div className="max-w-[1180px] w-[calc(100%-32px)] sm:w-[calc(100%-48px)] mx-auto">
        <div className="relative rounded-2xl sm:rounded-3xl bg-gradient-to-br from-[#031C2B] via-[#072435] to-[#082B3B] text-white p-6 sm:p-12 lg:p-16 overflow-hidden shadow-[0_24px_60px_rgba(3,28,43,0.3)] border border-[rgba(255,255,255,0.12)]">
          {/* Blueprint pattern */}
          <div
            className="absolute inset-0 opacity-[0.06] pointer-events-none bg-[radial-gradient(#52BDE9_1px,transparent_1px)] [background-size:24px_24px]"
            aria-hidden="true"
          />

          <div className="relative z-10 max-w-[720px] mx-auto text-center">
            {/* Eyebrow */}
            <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-3.5 py-1 sm:py-1.5 rounded-full bg-[rgba(82,189,233,0.14)] border border-[rgba(82,189,233,0.3)] text-[#52BDE9] text-[10.5px] sm:text-xs font-semibold uppercase tracking-wider mb-3 sm:mb-4">
              <Compass className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Private Property Guidance</span>
            </div>

            {/* Headline */}
            <h2
              id="property-final-cta-heading"
              className="font-instrument text-2xl xs:text-3xl sm:text-4xl lg:text-[2.75rem] font-normal leading-[1.1] tracking-tight mb-3 sm:mb-4 text-white"
            >
              Need help evaluating this opportunity?
            </h2>

            {/* Supporting Text */}
            <p className="text-xs sm:text-sm md:text-base text-[#c5d8e4] leading-relaxed max-w-[580px] mx-auto mb-6 sm:mb-8 font-normal">
              Speak directly with a senior land advisor about inventory availability, base rates, statutory documentation, and on-ground site-visit options for {propertyName}.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 max-w-md sm:max-w-none mx-auto">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 sm:px-7 py-3.5 rounded-full bg-[#25D366] hover:bg-[#1fb355] text-white font-bold text-xs sm:text-sm shadow-[0_10px_25px_rgba(37,211,102,0.3)] transition-all duration-300 whitespace-nowrap min-h-[48px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
                aria-label={`Start a private WhatsApp conversation for ${propertyName}`}
              >
                <MessageCircle className="w-4 h-4 text-white" aria-hidden="true" />
                <span>Start a private conversation</span>
              </a>

              <Link
                href="/properties"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-[rgba(255,255,255,0.1)] hover:bg-[rgba(255,255,255,0.18)] text-white text-xs sm:text-sm font-semibold border border-[rgba(255,255,255,0.2)] transition-all duration-300 whitespace-nowrap min-h-[48px]"
              >
                <span>Explore similar properties</span>
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </Link>
            </div>

            <p className="text-[11px] sm:text-[12px] text-[#7a93a5] mt-5 sm:mt-6 flex items-center justify-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-[#24D17F]" />
              Direct developer &amp; landowner coordination. Zero hidden brokerage.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

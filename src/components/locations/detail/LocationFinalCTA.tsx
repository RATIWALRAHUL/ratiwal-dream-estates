import Link from "next/link";
import { MessageCircle, ArrowRight, ShieldCheck, PhoneCall } from "lucide-react";
import { generateWhatsAppUrl } from "@/lib/whatsapp";

interface LocationFinalCTAProps {
  locationName: string;
}

export function LocationFinalCTA({ locationName }: LocationFinalCTAProps) {
  const whatsappUrl = generateWhatsAppUrl({
    type: "location",
    locationName: locationName,
  });

  return (
    <section className="py-16 md:py-24 bg-white" aria-labelledby="location-final-cta-heading">
      <div className="max-w-[1320px] w-[calc(100%-48px)] mx-auto">
        <div className="relative rounded-3xl bg-gradient-to-br from-[#031C2B] via-[#072435] to-[#082B3B] text-white p-8 sm:p-12 lg:p-16 overflow-hidden shadow-[0_24px_60px_rgba(3,28,43,0.3)] border border-[rgba(255,255,255,0.12)]">
          {/* Background grid */}
          <div
            className="absolute inset-0 opacity-[0.06] pointer-events-none bg-[radial-gradient(#52BDE9_1px,transparent_1px)] [background-size:24px_24px]"
            aria-hidden="true"
          />

          <div className="relative z-10 max-w-[760px] mx-auto text-center">
            {/* Eyebrow */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[rgba(82,189,233,0.14)] border border-[rgba(82,189,233,0.3)] text-[#52BDE9] text-xs font-bold uppercase tracking-wider mb-4">
              <ShieldCheck className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Explore {locationName}</span>
            </div>

            {/* Headline */}
            <h2
              id="location-final-cta-heading"
              className="font-heading text-3xl sm:text-4xl lg:text-[2.85rem] font-normal leading-[1.1] tracking-tight mb-4 text-white"
            >
              Find an opportunity aligned <br className="hidden sm:block" />
              with your goals in {locationName}.
            </h2>

            {/* Supporting Copy */}
            <p className="text-sm sm:text-base text-[#c5d8e4] leading-relaxed max-w-[620px] mx-auto mb-8">
              Tell us your preferred property type, plot size, budget, and timeline. Our advisors will share verified
              statutory layouts, revenue search reports, and privately available opportunities in {locationName}.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-4">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full bg-[#25D366] hover:bg-[#1fb355] text-[#031C2B] font-bold text-sm shadow-[0_10px_25px_rgba(37,211,102,0.3)] transition-all duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
                aria-label={`Start a private conversation about ${locationName} on WhatsApp (opens in a new tab)`}
              >
                <MessageCircle className="w-4 h-4" aria-hidden="true" />
                <span>Start a private conversation</span>
              </a>

              <Link
                href="/contact"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-[rgba(255,255,255,0.1)] hover:bg-[rgba(255,255,255,0.18)] text-white text-sm font-semibold border border-[rgba(255,255,255,0.2)] transition-all duration-300"
              >
                <PhoneCall className="w-4 h-4" aria-hidden="true" />
                <span>Request {locationName} Consultation</span>
              </Link>
            </div>

            <div className="mt-6">
              <a
                href="#properties"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#52BDE9] hover:underline"
              >
                <span>View available properties in {locationName}</span>
                <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

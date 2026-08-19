import Link from "next/link";
import { ArrowRight, MessageCircle, ShieldCheck, PhoneCall } from "lucide-react";
import { generateWhatsAppUrl } from "@/lib/whatsapp";

export function LocationAdvisoryCTA() {
  const whatsappUrl = generateWhatsAppUrl({
    type: "general",
  });

  return (
    <section className="py-16 md:py-24 bg-white" aria-labelledby="location-advisory-heading">
      <div className="max-w-[1320px] w-[calc(100%-48px)] mx-auto">
        <div className="relative rounded-3xl bg-gradient-to-br from-[#031C2B] via-[#072435] to-[#082B3B] text-white p-8 sm:p-12 lg:p-16 overflow-hidden shadow-[0_24px_60px_rgba(3,28,43,0.3)] border border-[rgba(255,255,255,0.12)]">
          {/* Subtle cartographic grid overlay */}
          <div
            className="absolute inset-0 opacity-[0.06] pointer-events-none bg-[radial-gradient(#52BDE9_1px,transparent_1px)] [background-size:24px_24px]"
            aria-hidden="true"
          />
          <div
            className="absolute -bottom-24 -right-24 w-[400px] h-[400px] rounded-full bg-[radial-gradient(circle,rgba(7,132,200,0.25)_0%,transparent_70%)] blur-2xl pointer-events-none"
            aria-hidden="true"
          />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-8 max-w-[700px]">
              {/* Eyebrow */}
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[rgba(82,189,233,0.14)] border border-[rgba(82,189,233,0.3)] text-[#52BDE9] text-xs font-bold uppercase tracking-wider mb-4">
                <ShieldCheck className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Local Property Guidance</span>
              </div>

              {/* Headline */}
              <h2
                id="location-advisory-heading"
                className="font-heading text-3xl sm:text-4xl lg:text-[2.85rem] font-normal leading-[1.08] tracking-tight mb-4 text-white"
              >
                Not sure which market <br className="hidden sm:block" />
                fits your long-term goals?
              </h2>

              {/* Supporting Copy */}
              <p className="text-sm sm:text-base text-[#c5d8e4] leading-relaxed max-w-[600px] mb-8">
                Speak with a dedicated Ratwal property advisor to compare sectoral land values, JDA/CIDCO statutory
                approvals, revenue conversion status, and private off-market opportunities tailored to your requirements.
              </p>

              {/* CTAs */}
              <div className="flex flex-wrap items-center gap-4">
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full bg-[#25D366] hover:bg-[#1fb355] text-[#031C2B] font-bold text-sm shadow-[0_10px_25px_rgba(37,211,102,0.3)] transition-all duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
                  aria-label="Talk to an advisor on WhatsApp (opens in a new tab)"
                >
                  <MessageCircle className="w-4 h-4" aria-hidden="true" />
                  <span>Talk to an advisor</span>
                </a>

                <Link
                  href="/contact"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-[rgba(255,255,255,0.1)] hover:bg-[rgba(255,255,255,0.18)] text-white text-sm font-semibold border border-[rgba(255,255,255,0.2)] transition-all duration-300"
                >
                  <PhoneCall className="w-4 h-4" aria-hidden="true" />
                  <span>Request a Callback</span>
                </Link>

                <Link
                  href="/properties"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#52BDE9] hover:underline ml-2"
                >
                  <span>Browse all properties</span>
                  <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                </Link>
              </div>
            </div>

            {/* Right Trust Column */}
            <div className="lg:col-span-4 bg-[rgba(3,28,43,0.6)] backdrop-blur-md p-6 rounded-2xl border border-[rgba(255,255,255,0.12)] text-xs text-[#c5d8e4] space-y-3.5">
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-[rgba(36,209,127,0.2)] text-[#24D17F] grid place-items-center flex-shrink-0 mt-0.5 font-bold">
                  ✓
                </span>
                <span>
                  <strong className="text-white block">30-Year Revenue Search:</strong>
                  Every recommended parcel backed by historical title search.
                </span>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-[rgba(36,209,127,0.2)] text-[#24D17F] grid place-items-center flex-shrink-0 mt-0.5 font-bold">
                  ✓
                </span>
                <span>
                  <strong className="text-white block">Statutory Map Verification:</strong>
                  On-ground total station superimposition with masterplan records.
                </span>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-[rgba(36,209,127,0.2)] text-[#24D17F] grid place-items-center flex-shrink-0 mt-0.5 font-bold">
                  ✓
                </span>
                <span>
                  <strong className="text-white block">Zero Speculation Standard:</strong>
                  Direct verified developer allotments and institutional landowners.
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

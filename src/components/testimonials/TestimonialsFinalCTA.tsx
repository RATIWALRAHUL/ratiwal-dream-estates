import Link from "next/link";
import { MessageCircle, ArrowRight, ShieldCheck, Compass, PhoneCall } from "lucide-react";
import { generateWhatsAppUrl } from "@/lib/whatsapp";

export function TestimonialsFinalCTA() {
  const whatsappUrl = generateWhatsAppUrl({ type: "general" });

  return (
    <section className="py-16 md:py-24 bg-white" aria-labelledby="testimonials-final-cta-heading">
      <div className="max-w-[1320px] w-[calc(100%-48px)] mx-auto">
        <div className="relative rounded-3xl bg-gradient-to-br from-[#031C2B] via-[#072435] to-[#082B3B] text-white p-8 sm:p-12 lg:p-16 overflow-hidden shadow-[0_24px_60px_rgba(3,28,43,0.3)] border border-[rgba(255,255,255,0.12)]">
          {/* Subtle grid background */}
          <div
            className="absolute inset-0 opacity-[0.06] pointer-events-none bg-[radial-gradient(#52BDE9_1px,transparent_1px)] [background-size:24px_24px]"
            aria-hidden="true"
          />

          <div className="relative z-10 max-w-[760px] mx-auto text-center">
            {/* Eyebrow */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[rgba(82,189,233,0.14)] border border-[rgba(82,189,233,0.3)] text-[#52BDE9] text-xs font-bold uppercase tracking-wider mb-4">
              <Compass className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Begin Your Property Journey</span>
            </div>

            {/* Headline */}
            <h2
              id="testimonials-final-cta-heading"
              className="font-heading text-3xl sm:text-4xl lg:text-[2.85rem] font-normal leading-[1.1] tracking-tight mb-4 text-white"
            >
              Make your next decision <br className="hidden sm:block" />
              with greater clarity.
            </h2>

            {/* Supporting Copy */}
            <p className="text-sm sm:text-base text-[#c5d8e4] leading-relaxed max-w-[620px] mx-auto mb-8">
              Tell us what you are looking for and speak with an advisor about verified residential plots, commercial
              land banking, or long-term growth corridors.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-4">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full bg-[#25D366] hover:bg-[#1fb355] text-[#031C2B] font-bold text-sm shadow-[0_10px_25px_rgba(37,211,102,0.3)] transition-all duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
                aria-label="Start a private conversation on WhatsApp (opens in a new tab)"
              >
                <MessageCircle className="w-4 h-4" aria-hidden="true" />
                <span>Start a private conversation</span>
              </a>

              <Link
                href="/properties"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-[rgba(255,255,255,0.1)] hover:bg-[rgba(255,255,255,0.18)] text-white text-sm font-semibold border border-[rgba(255,255,255,0.2)] transition-all duration-300"
              >
                <span>Explore properties</span>
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </Link>
            </div>

            <p className="text-[12px] text-[#7a93a5] mt-6 flex items-center justify-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-[#24D17F]" />
              Clear guidance. No pressure. Transparent land advisory.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

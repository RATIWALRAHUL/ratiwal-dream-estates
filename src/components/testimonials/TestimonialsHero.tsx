import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Quote, ShieldCheck, CheckCircle2, MessageCircle } from "lucide-react";
import { generateWhatsAppUrl } from "@/lib/whatsapp";

export function TestimonialsHero() {
  const whatsappUrl = generateWhatsAppUrl({ type: "general" });

  return (
    <section
      className="relative overflow-hidden bg-gradient-to-b from-[#031C2B] via-[#072435] to-[#082B3B] text-white pt-28 pb-16 md:pt-36 md:pb-24 border-b border-[rgba(255,255,255,0.08)]"
      aria-labelledby="testimonials-hero-heading"
    >
      {/* Blueprint grid background */}
      <div
        className="absolute inset-0 opacity-[0.05] pointer-events-none bg-[radial-gradient(#52BDE9_1px,transparent_1px)] [background-size:28px_28px]"
        aria-hidden="true"
      />
      <div
        className="absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full bg-[radial-gradient(circle,rgba(7,132,200,0.2)_0%,transparent_70%)] pointer-events-none blur-2xl"
        aria-hidden="true"
      />

      <div className="relative max-w-[1320px] w-[calc(100%-48px)] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column */}
          <div className="lg:col-span-7 flex flex-col items-start z-10">
            {/* Eyebrow */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[rgba(82,189,233,0.12)] border border-[rgba(82,189,233,0.25)] text-[#52BDE9] text-xs font-bold uppercase tracking-wider mb-6">
              <Quote className="w-3.5 h-3.5" aria-hidden="true" />
              <span>01 / Client Stories</span>
            </div>

            {/* Headline */}
            <h1
              id="testimonials-hero-heading"
              className="font-heading text-3xl sm:text-4xl md:text-5xl lg:text-[3.4rem] font-normal leading-[1.08] tracking-tight text-white mb-6"
            >
              Trust built through <br className="hidden sm:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-[#d2ecf8] to-[#52BDE9]">
                clearer decisions.
              </span>
            </h1>

            {/* Supporting Copy */}
            <p className="text-base md:text-lg text-[#c5d8e4] font-normal leading-relaxed max-w-[620px] mb-8">
              Read how buyers and investors experienced Ratwal Dream Estates’ approach to property discovery,
              revenue verification support, and local on-ground guidance across Rajasthan and Maharashtra.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-4 mb-8 w-full sm:w-auto">
              <a
                href="#stories-directory"
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full bg-gradient-to-r from-[#0784C8] to-[#129be0] text-white font-medium text-sm shadow-[0_10px_25px_rgba(7,132,200,0.35)] hover:translate-y-[-2px] transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
              >
                <span>Explore client stories</span>
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </a>

              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-[rgba(255,255,255,0.08)] hover:bg-[rgba(255,255,255,0.15)] text-white text-sm font-medium border border-[rgba(255,255,255,0.15)] transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
                aria-label="Talk to an advisor on WhatsApp (opens in a new tab)"
              >
                <MessageCircle className="w-4 h-4 text-[#25D366]" aria-hidden="true" />
                <span>Talk to an advisor</span>
              </a>
            </div>

            {/* Microcopy disclaimer */}
            <p className="text-[11.5px] text-[#7a93a5] flex items-center gap-1.5">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#24D17F]" aria-hidden="true" />
              Published with explicit client permission &amp; strict privacy protection.
            </p>
          </div>

          {/* Right Column: Editorial Visual Composition */}
          <div className="lg:col-span-5 relative">
            <div className="relative aspect-[4/3] sm:aspect-[16/11] lg:aspect-[4/3] rounded-2xl overflow-hidden border border-[rgba(255,255,255,0.16)] shadow-[0_24px_60px_rgba(0,0,0,0.45)]">
              <Image
                src="/images/about/office-consultation.jpg"
                alt="Ratwal Dream Estates advisory consultation and documentation review"
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 42vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#031C2B] via-transparent to-transparent opacity-80" />

              {/* Floating Quote Badge */}
              <div className="absolute bottom-4 left-4 right-4 p-4 rounded-xl bg-[rgba(3,28,43,0.9)] backdrop-blur-md border border-[rgba(255,255,255,0.14)]">
                <p className="text-xs text-[#d2ecf8] italic leading-relaxed mb-2">
                  “Their team physically inspected the 90A revenue conversion papers and JDA layout before we paid any token amount.”
                </p>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-bold text-white font-heading">Sunil &amp; Rashmi K.</span>
                  <span className="text-[#52BDE9]">Jaipur Plot Buyer</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

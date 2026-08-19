import Link from "next/link";
import { ShieldCheck, FileCheck, Clock, CheckCircle2, Scale, ExternalLink } from "lucide-react";

export function EditorialStandards() {
  const standards = [
    {
      icon: FileCheck,
      title: "Sourced from Statutory Portals",
      description:
        "Every claim regarding masterplans, 90A regularizations, or RERA escrow rules is cross-referenced directly against official gazettes, state authority circulars (JDA, CIDCO, ADA), or Acts of Parliament.",
    },
    {
      icon: Clock,
      title: "Transparent Revision Timestamps",
      description:
        "Real estate regulations evolve. All publications display explicit publication and last-reviewed dates. Material regulatory amendments prompt structured editorial revisions.",
    },
    {
      icon: CheckCircle2,
      title: "Zero Speculative Appreciation",
      description:
        "We never publish unverified 'guaranteed returns' or speculative price doubling claims. Infrastructure maturity is classified into clear phases (Proposed vs. Under Construction vs. Operational).",
    },
    {
      icon: Scale,
      title: "Independent Legal Review",
      description:
        "Legal guides and title frameworks are reviewed by practicing High Court revenue counsels to ensure statutory accuracy and compliance with state land revenue codes.",
    },
  ];

  return (
    <section className="py-16 md:py-24 bg-[#F5F1E9] border-b border-[rgba(7,26,40,0.08)]" aria-labelledby="editorial-standards-heading">
      <div className="max-w-[1320px] w-[calc(100%-48px)] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column */}
          <div className="lg:col-span-5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[rgba(36,209,127,0.1)] border border-[rgba(36,209,127,0.25)] text-[#10854d] text-xs font-bold uppercase tracking-wider mb-4">
              <ShieldCheck className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Editorial Integrity</span>
            </div>
            <h2
              id="editorial-standards-heading"
              className="font-heading text-3xl sm:text-4xl text-[#031C2B] font-normal leading-tight tracking-tight mb-4"
            >
              How our guides <br />are prepared.
            </h2>
            <p className="text-sm sm:text-base text-[#4a6171] leading-relaxed mb-6">
              Ratwal Dream Estates’ Property Intelligence platform is designed as an objective research resource for home-seekers and investors. We prioritize factual accuracy, verifiable documentation, and buyer protection over promotional marketing.
            </p>
            <div className="flex flex-wrap gap-4 text-xs font-bold text-[#0784C8]">
              <Link href="/why-choose-us" className="inline-flex items-center gap-1 hover:underline">
                <span>Our Advisory Philosophy</span>
                <ExternalLink className="w-3 h-3" />
              </Link>
              <span>•</span>
              <Link href="/disclaimer" className="inline-flex items-center gap-1 hover:underline">
                <span>Statutory Disclaimers</span>
                <ExternalLink className="w-3 h-3" />
              </Link>
            </div>
          </div>

          {/* Right Column: 4 Standards Grid */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-5">
            {standards.map((std, i) => {
              const Icon = std.icon;
              return (
                <div
                  key={i}
                  className="p-5 rounded-2xl bg-white border border-[rgba(7,26,40,0.07)] shadow-xs flex flex-col justify-between"
                >
                  <div className="w-8 h-8 rounded-lg bg-[#edf5f9] text-[#0784C8] flex items-center justify-center mb-3 shadow-2xs">
                    <Icon className="w-4 h-4" />
                  </div>
                  <h3 className="font-heading text-sm font-bold text-[#031C2B] mb-1.5">
                    {std.title}
                  </h3>
                  <p className="text-xs text-[#536574] leading-relaxed">
                    {std.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

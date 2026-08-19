import Link from "next/link";
import { ArrowRight, Compass, FileSearch, ShieldCheck, MapPin, Eye, Banknote } from "lucide-react";

export function GuidedContentPaths() {
  const paths = [
    {
      title: "Buying a Freehold Plot",
      description: "Understand land classifications, Section 90A conversion sanctions, and unapproved society risks.",
      slug: "essential-guide-plot-buying",
      icon: Compass,
      tag: "Master Checklist",
    },
    {
      title: "Reviewing Revenue Documents",
      description: "Decode Jamabandi (RoR), Khasra Milan maps, 7/12 extracts, and municipal mutation records.",
      slug: "understanding-property-documentation",
      icon: FileSearch,
      tag: "Legal Framework",
    },
    {
      title: "Understanding RERA Safeguards",
      description: "How 70% bank escrow accounts and statutory layout approvals protect plotted township buyers.",
      slug: "rera-fundamentals-for-plot-buyers",
      icon: ShieldCheck,
      tag: "Regulatory Guide",
    },
    {
      title: "Conducting an On-Ground Site Visit",
      description: "Physical inspection protocols for road widths, Total Station boundary pegs, and drainage.",
      slug: "site-visit-inspection-framework",
      icon: Eye,
      tag: "Field Protocol",
    },
    {
      title: "Auditing Infrastructure Claims",
      description: "Differentiating approved & funded expressways/metros from conceptual developer marketing.",
      slug: "evaluating-corridor-infrastructure-claims",
      icon: MapPin,
      tag: "Corridor Analysis",
    },
    {
      title: "Land Pricing & Additional Charges",
      description: "Deconstructing base rates, Preferential Location Charges (PLC), stamp duty, and registry taxes.",
      slug: "demystifying-land-pricing-additional-charges",
      icon: Banknote,
      tag: "Financial Model",
    },
  ];

  return (
    <section className="py-16 md:py-24 bg-white border-b border-[rgba(7,26,40,0.08)]" aria-labelledby="paths-heading">
      <div className="max-w-[1320px] w-[calc(100%-48px)] mx-auto">
        {/* Header */}
        <div className="max-w-[720px] mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[rgba(7,132,200,0.08)] border border-[rgba(7,132,200,0.2)] text-[#0784C8] text-xs font-bold uppercase tracking-wider mb-3">
            <Compass className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Curated Knowledge Tracks</span>
          </div>
          <h2
            id="paths-heading"
            className="font-heading text-3xl sm:text-4xl lg:text-[2.75rem] text-[#031C2B] font-normal leading-tight tracking-tight mb-3"
          >
            Start with what you need to understand.
          </h2>
          <p className="text-sm sm:text-base text-[#4a6171] leading-relaxed">
            Follow structured learning paths tailored to your specific stage—whether you are evaluating your first plot, auditing developer paperwork, or conducting on-site due diligence.
          </p>
        </div>

        {/* Paths Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {paths.map((path, idx) => {
            const Icon = path.icon;
            return (
              <Link
                key={idx}
                href={`/insights/${path.slug}`}
                className="group p-6 sm:p-7 rounded-2xl bg-[#F5F1E9] border border-[rgba(7,26,40,0.08)] hover:bg-white hover:border-[rgba(7,132,200,0.3)] hover:shadow-[0_12px_32px_rgba(7,26,40,0.08)] transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[11px] font-bold text-[#0784C8] uppercase tracking-wider bg-white px-2.5 py-1 rounded-md border border-[rgba(7,26,40,0.06)] shadow-2xs">
                      {path.tag}
                    </span>
                    <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center text-[#031C2B] group-hover:text-[#0784C8] transition-colors shadow-2xs">
                      <Icon className="w-4 h-4" />
                    </div>
                  </div>

                  <h3 className="font-heading text-lg text-[#031C2B] font-bold leading-snug mb-2 group-hover:text-[#0784C8] transition-colors">
                    {path.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-[#536574] leading-relaxed mb-4">
                    {path.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-[rgba(7,26,40,0.06)] flex items-center justify-between text-xs font-bold text-[#0784C8] mt-auto">
                  <span>Start Reading Track</span>
                  <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}

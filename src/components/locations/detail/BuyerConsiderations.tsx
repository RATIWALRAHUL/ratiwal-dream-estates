import Link from "next/link";
import { ShieldCheck, AlertCircle } from "lucide-react";
import { BuyerConsideration } from "@/types/location";

interface BuyerConsiderationsProps {
  considerations: BuyerConsideration[];
  locationName: string;
}

export function BuyerConsiderations({ considerations, locationName }: BuyerConsiderationsProps) {
  return (
    <section className="py-16 md:py-24 bg-white border-b border-[rgba(7,26,40,0.08)]" aria-labelledby="considerations-heading">
      <div className="max-w-[1320px] w-[calc(100%-48px)] mx-auto">
        {/* Header */}
        <div className="max-w-[720px] mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[rgba(7,132,200,0.08)] border border-[rgba(7,132,200,0.2)] text-[#0784C8] text-xs font-bold uppercase tracking-wider mb-3">
            <ShieldCheck className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Due Diligence Protocol</span>
          </div>
          <h2
            id="considerations-heading"
            className="font-heading text-3xl sm:text-4xl lg:text-[2.75rem] text-[#031C2B] font-normal leading-tight tracking-tight mb-3"
          >
            What to review before buying in {locationName}.
          </h2>
          <p className="text-sm sm:text-base text-[#4a6171] leading-relaxed">
            Essential legal, revenue, and masterplan checkpoints specific to {locationName} to ensure your investment is protected from title encumbrances and boundary disputes.
          </p>
        </div>

        {/* Considerations Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          {considerations.map((item, index) => (
            <article
              key={index}
              className="p-6 sm:p-7 rounded-2xl bg-[#F5F1E9] bg-opacity-70 border border-[rgba(7,26,40,0.09)] flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#0784C8]">
                    {item.category}
                  </span>
                  <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-white text-[#031C2B] font-semibold border border-[rgba(7,26,40,0.08)]">
                    {item.importance}
                  </span>
                </div>

                <h3 className="font-heading text-xl text-[#031C2B] font-normal mb-2.5">
                  {item.title}
                </h3>

                <p className="text-sm text-[#4a6171] leading-relaxed">
                  {item.description}
                </p>
              </div>
            </article>
          ))}
        </div>

        {/* Statutory Legal Disclaimer Notice */}
        <div className="p-6 sm:p-7 rounded-2xl bg-[#FFFDF8] border-2 border-[rgba(7,132,200,0.25)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-start gap-3 max-w-[850px]">
            <AlertCircle className="w-5 h-5 text-[#0784C8] flex-shrink-0 mt-0.5" aria-hidden="true" />
            <div className="text-xs text-[#4a6171] leading-relaxed">
              <strong className="text-[#031C2B] block text-sm mb-0.5">Statutory Legal Disclosure:</strong>
              Property details, regulatory approvals, pricing benchmarks, and infrastructure completion timelines should be independently verified before entering into binding agreements or financial commitments.
            </div>
          </div>

          <div className="flex items-center gap-4 flex-shrink-0">
            <Link
              href="/why-choose-us"
              className="text-xs font-bold text-[#0784C8] hover:underline"
            >
              Our Verification Process
            </Link>
            <Link
              href="/disclaimer"
              className="text-xs font-bold text-[#667d8f] hover:underline"
            >
              RERA Disclaimer
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

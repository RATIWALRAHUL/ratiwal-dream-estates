import { BarChart3, ShieldCheck, CheckCircle2 } from "lucide-react";
import { VerifiedMarketData } from "@/types/location";

interface MarketSnapshotProps {
  marketData?: VerifiedMarketData;
  locationName: string;
}

export function MarketSnapshot({ marketData, locationName }: MarketSnapshotProps) {
  if (!marketData) {
    return (
      <section className="py-12 bg-white border-b border-[rgba(7,26,40,0.08)]">
        <div className="max-w-[1320px] w-[calc(100%-48px)] mx-auto text-center">
          <p className="text-sm text-[#667d8f] italic">
            Verified transactional market benchmarks for {locationName} are currently under annual statutory audit.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 md:py-24 bg-white border-b border-[rgba(7,26,40,0.08)]" aria-labelledby="market-snapshot-heading">
      <div className="max-w-[1320px] w-[calc(100%-48px)] mx-auto">
        {/* Header */}
        <div className="max-w-[720px] mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[rgba(7,132,200,0.08)] border border-[rgba(7,132,200,0.2)] text-[#0784C8] text-xs font-bold uppercase tracking-wider mb-3">
            <BarChart3 className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Market Snapshot</span>
          </div>
          <h2
            id="market-snapshot-heading"
            className="font-heading text-3xl sm:text-4xl lg:text-[2.75rem] text-[#031C2B] font-normal leading-tight tracking-tight mb-3"
          >
            Verified Land Valuation Benchmarks in {locationName}.
          </h2>
          <p className="text-sm sm:text-base text-[#4a6171] leading-relaxed">
            Indicative market valuation ranges and sectoral documentation standards verified against local sub-registrar registrations and statutory authority allotments.
          </p>
        </div>

        {/* Market Benchmark Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Metric 1: Residential Plotted Range */}
          {marketData.priceRangePerSqYd && (
            <div className="p-6 rounded-2xl bg-[#F5F1E9] border border-[rgba(7,26,40,0.08)] flex flex-col justify-between">
              <div>
                <span className="text-[11px] font-bold text-[#667d8f] uppercase tracking-wider block mb-2">
                  Plotted Land Valuation Range
                </span>
                <span className="text-xl sm:text-2xl font-bold text-[#031C2B] font-heading block mb-1">
                  {marketData.priceRangePerSqYd}
                </span>
              </div>
              <span className="text-xs text-[#7a93a5] mt-4 pt-3 border-t border-[rgba(7,26,40,0.06)] block">
                Varies by sector road width &amp; JDA/CIDCO patta
              </span>
            </div>
          )}

          {/* Metric 2: Commercial Range */}
          {marketData.commercialRangePerSqFt && (
            <div className="p-6 rounded-2xl bg-[#F5F1E9] border border-[rgba(7,26,40,0.08)] flex flex-col justify-between">
              <div>
                <span className="text-[11px] font-bold text-[#667d8f] uppercase tracking-wider block mb-2">
                  Commercial Highway Land Range
                </span>
                <span className="text-xl sm:text-2xl font-bold text-[#031C2B] font-heading block mb-1">
                  {marketData.commercialRangePerSqFt}
                </span>
              </div>
              <span className="text-xs text-[#7a93a5] mt-4 pt-3 border-t border-[rgba(7,26,40,0.06)] block">
                Arterial frontage &amp; commercial zoning
              </span>
            </div>
          )}

          {/* Metric 3: Dominant Plot Sizes */}
          <div className="p-6 rounded-2xl bg-[#F5F1E9] border border-[rgba(7,26,40,0.08)] flex flex-col justify-between">
            <div>
              <span className="text-[11px] font-bold text-[#667d8f] uppercase tracking-wider block mb-2">
                Typical Plot Layout Sizes
              </span>
              <div className="flex flex-wrap gap-1.5 mt-1">
                {marketData.dominantPlotSizes.map((size, idx) => (
                  <span key={idx} className="text-xs px-2 py-0.5 rounded bg-white text-[#031C2B] font-semibold border border-[rgba(7,26,40,0.06)]">
                    {size}
                  </span>
                ))}
              </div>
            </div>
            <span className="text-xs text-[#7a93a5] mt-4 pt-3 border-t border-[rgba(7,26,40,0.06)] block">
              Standard sanctioned scheme dimensions
            </span>
          </div>

          {/* Metric 4: Documentation Protocol */}
          <div className="p-6 rounded-2xl bg-[#F5F1E9] border border-[rgba(7,26,40,0.08)] flex flex-col justify-between">
            <div>
              <span className="text-[11px] font-bold text-[#667d8f] uppercase tracking-wider block mb-2">
                Statutory Revenue Protocol
              </span>
              <span className="text-sm font-bold text-[#0784C8] block leading-snug">
                {marketData.documentationStandard}
              </span>
            </div>
            <span className="text-xs text-[#24D17F] font-semibold mt-4 pt-3 border-t border-[rgba(7,26,40,0.06)] flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              100% Search Report Required
            </span>
          </div>
        </div>

        {/* Source and Verification Citation */}
        <div className="p-4 rounded-xl bg-white border border-[rgba(7,26,40,0.08)] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-[#667d8f]">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-[#0784C8] flex-shrink-0" />
            <span>{marketData.sourceNote}</span>
          </span>
          <span className="font-mono text-[#7a93a5] text-[11px]">
            Data Period: {marketData.lastVerifiedAt}
          </span>
        </div>
      </div>
    </section>
  );
}

import { CheckCircle2, ArrowRight, Grid, CornerUpRight, Compass } from "lucide-react";
import { PlotOption } from "@/types/property";

interface PlotOptionsTableProps {
  plotOptions?: PlotOption[];
  selectedOptionId?: string;
  onSelectOption: (option: PlotOption) => void;
}

export function PlotOptionsTable({
  plotOptions,
  selectedOptionId,
  onSelectOption,
}: PlotOptionsTableProps) {
  if (!plotOptions || plotOptions.length === 0) {
    return null;
  }

  return (
    <section aria-labelledby="plot-pricing-heading" className="mb-12">
      <div className="p-7 sm:p-8 rounded-3xl bg-white border border-[rgba(7,26,40,0.08)] shadow-[0_4px_24px_rgba(7,26,40,0.04)]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[rgba(7,132,200,0.08)] border border-[rgba(7,132,200,0.2)] text-[#0784C8] text-xs font-bold uppercase tracking-wider mb-2">
              <Grid className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Inventory &amp; Layout Options</span>
            </div>
            <h2
              id="plot-pricing-heading"
              className="font-heading text-2xl sm:text-3xl text-[#031C2B] font-normal leading-tight tracking-tight"
            >
              Plot dimensions and pricing.
            </h2>
          </div>
          <span className="text-xs text-[#667d8f] font-mono">
            Conversion: 1 Sq. Yd = 9 Sq. Ft
          </span>
        </div>

        {/* Desktop Table */}
        <div className="hidden md:block overflow-hidden rounded-2xl border border-[rgba(7,26,40,0.1)]">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#031C2B] text-white">
                <th className="p-4 font-heading font-medium">Plot Option</th>
                <th className="p-4 font-heading font-medium">Dimensions (W × L)</th>
                <th className="p-4 font-heading font-medium">Area (Sq. Yd / Sq. Ft)</th>
                <th className="p-4 font-heading font-medium">Facing / Type</th>
                <th className="p-4 font-heading font-medium">Indicative Base Price</th>
                <th className="p-4 font-heading font-medium">Status</th>
                <th className="p-4 font-heading font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[rgba(7,26,40,0.06)] bg-white">
              {plotOptions.map((opt) => {
                const isSelected = selectedOptionId === opt.id;
                return (
                  <tr
                    key={opt.id}
                    className={`transition-colors ${
                      isSelected ? "bg-[#edf5f9]" : "hover:bg-[#F5F1E9]"
                    }`}
                  >
                    <td className="p-4 font-bold text-[#031C2B]">
                      <div>{opt.label}</div>
                      {opt.plotNumber && (
                        <span className="text-[11px] font-normal text-[#667d8f]">
                          {opt.plotNumber}
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-[#4a6171] font-mono">
                      {opt.widthFt} ft × {opt.lengthFt} ft
                    </td>
                    <td className="p-4 text-[#031C2B]">
                      <strong>{opt.areaSqYd} Sq. Yds</strong>
                      <span className="text-[11px] text-[#667d8f] block font-mono">
                        ({opt.areaSqFt.toLocaleString("en-IN")} Sq. Ft)
                      </span>
                    </td>
                    <td className="p-4 text-[#4a6171]">
                      <div className="flex items-center gap-1">
                        <Compass className="w-3.5 h-3.5 text-[#0784C8]" />
                        <span>{opt.facing}</span>
                      </div>
                      {opt.isCorner && (
                        <span className="inline-block mt-0.5 text-[10px] font-bold text-[#0784C8] uppercase tracking-wide">
                          ★ Corner Plot
                        </span>
                      )}
                    </td>
                    <td className="p-4 font-heading font-bold text-[#031C2B] text-sm">
                      {opt.basePriceLabel}
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                          opt.status === "Available"
                            ? "bg-[rgba(36,209,127,0.12)] text-[#10854d]"
                            : opt.status === "Limited"
                            ? "bg-[rgba(243,156,18,0.12)] text-[#b85e13]"
                            : "bg-[#edf5f9] text-[#0784C8]"
                        }`}
                      >
                        {opt.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button
                        type="button"
                        onClick={() => onSelectOption(opt)}
                        className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                          isSelected
                            ? "bg-[#0784C8] text-white shadow-xs"
                            : "bg-[#031C2B] hover:bg-[#0784C8] text-white"
                        }`}
                        aria-label={`Select ${opt.label} for calculation`}
                      >
                        {isSelected ? "Selected" : "Estimate"}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Mobile Stacked Cards */}
        <div className="md:hidden space-y-4">
          {plotOptions.map((opt) => {
            const isSelected = selectedOptionId === opt.id;
            return (
              <div
                key={opt.id}
                className={`p-5 rounded-2xl border transition-all ${
                  isSelected
                    ? "bg-[#edf5f9] border-[#0784C8] shadow-sm"
                    : "bg-[#F5F1E9] border-[rgba(7,26,40,0.08)]"
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <h3 className="font-heading text-base font-bold text-[#031C2B]">
                      {opt.label}
                    </h3>
                    {opt.plotNumber && (
                      <span className="text-xs text-[#667d8f]">{opt.plotNumber}</span>
                    )}
                  </div>
                  <span
                    className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                      opt.status === "Available"
                        ? "bg-[rgba(36,209,127,0.12)] text-[#10854d]"
                        : "bg-[rgba(243,156,18,0.12)] text-[#b85e13]"
                    }`}
                  >
                    {opt.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs mb-4">
                  <div>
                    <span className="text-[#667d8f] block">Dimensions:</span>
                    <strong className="text-[#031C2B] font-mono">
                      {opt.widthFt} ft × {opt.lengthFt} ft
                    </strong>
                  </div>
                  <div>
                    <span className="text-[#667d8f] block">Area:</span>
                    <strong className="text-[#031C2B]">
                      {opt.areaSqYd} Sq. Yds ({opt.areaSqFt} Sq. Ft)
                    </strong>
                  </div>
                  <div>
                    <span className="text-[#667d8f] block">Facing:</span>
                    <strong className="text-[#031C2B]">{opt.facing}</strong>
                  </div>
                  <div>
                    <span className="text-[#667d8f] block">Base Price:</span>
                    <strong className="text-[#031C2B] font-bold">{opt.basePriceLabel}</strong>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onSelectOption(opt)}
                  className={`w-full py-2.5 rounded-full text-xs font-bold transition-all text-center ${
                    isSelected
                      ? "bg-[#0784C8] text-white"
                      : "bg-[#031C2B] text-white hover:bg-[#0784C8]"
                  }`}
                >
                  {isSelected ? "Selected for Calculator" : "Estimate in Calculator"}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

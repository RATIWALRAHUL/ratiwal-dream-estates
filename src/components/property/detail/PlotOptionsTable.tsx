import { Grid, Compass } from "lucide-react";
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
    <section aria-labelledby="plot-pricing-heading" className="mb-8 sm:mb-12">
      <div className="p-4 sm:p-7 sm:p-8 rounded-2xl sm:rounded-3xl bg-white border border-[rgba(7,26,40,0.08)] shadow-[0_4px_24px_rgba(7,26,40,0.04)]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3 mb-5 sm:mb-6">
          <div>
            <div className="inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1 rounded-full bg-[rgba(7,132,200,0.08)] border border-[rgba(7,132,200,0.2)] text-[#0784C8] text-[10.5px] sm:text-xs font-semibold uppercase tracking-wider mb-2">
              <Grid className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Inventory &amp; Layout Options</span>
            </div>
            <h2
              id="plot-pricing-heading"
              className="font-instrument text-xl sm:text-2xl sm:text-3xl text-[#031C2B] font-normal leading-tight tracking-tight"
            >
              Plot dimensions and pricing.
            </h2>
          </div>
          <span className="text-[11px] sm:text-xs text-[#667d8f] font-mono">
            Conversion: 1 Sq. Yd = 9 Sq. Ft
          </span>
        </div>

        {/* Desktop Table */}
        <div className="hidden md:block overflow-hidden rounded-2xl border border-[rgba(7,26,40,0.1)] shadow-2xs">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#071A28] text-white border-b border-[rgba(255,255,255,0.08)]">
                <th className="py-3.5 px-4 text-[11px] font-semibold tracking-wider uppercase text-[#c5d8e4]">
                  Plot Option
                </th>
                <th className="py-3.5 px-4 text-[11px] font-semibold tracking-wider uppercase text-[#c5d8e4] whitespace-nowrap">
                  Dimensions (W × L)
                </th>
                <th className="py-3.5 px-4 text-[11px] font-semibold tracking-wider uppercase text-[#c5d8e4] whitespace-nowrap">
                  Area (Sq. Yd / Sq. Ft)
                </th>
                <th className="py-3.5 px-4 text-[11px] font-semibold tracking-wider uppercase text-[#c5d8e4]">
                  Facing / Type
                </th>
                <th className="py-3.5 px-4 text-[11px] font-semibold tracking-wider uppercase text-[#c5d8e4] whitespace-nowrap">
                  Indicative Base Price
                </th>
                <th className="py-3.5 px-4 text-[11px] font-semibold tracking-wider uppercase text-[#c5d8e4]">
                  Status
                </th>
                <th className="py-3.5 px-4 text-[11px] font-semibold tracking-wider uppercase text-[#c5d8e4] text-right">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[rgba(7,26,40,0.06)] bg-white">
              {plotOptions.map((opt) => {
                const isSelected = selectedOptionId === opt.id;
                return (
                  <tr
                    key={opt.id}
                    className={`transition-colors ${
                      isSelected ? "bg-[#edf5f9]" : "hover:bg-[#FAF8F5]"
                    }`}
                  >
                    <td className="py-3.5 px-4 align-middle">
                      <span className="font-semibold text-xs sm:text-[13px] text-[#071A28] block leading-snug">
                        {opt.label}
                      </span>
                      {opt.plotNumber && (
                        <span className="text-[11px] font-normal text-[#667d8f] block mt-0.5">
                          {opt.plotNumber}
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 align-middle whitespace-nowrap text-xs text-[#4a6171] font-mono">
                      {opt.widthFt} ft × {opt.lengthFt} ft
                    </td>
                    <td className="py-3.5 px-4 align-middle whitespace-nowrap text-xs">
                      <span className="font-semibold text-[#071A28]">{opt.areaSqYd} Sq. Yds</span>
                      <span className="text-[11px] text-[#667d8f] block font-mono">
                        ({opt.areaSqFt.toLocaleString("en-IN")} Sq. Ft)
                      </span>
                    </td>
                    <td className="py-3.5 px-4 align-middle whitespace-nowrap text-xs text-[#4a6171]">
                      <div className="flex items-center gap-1.5 font-medium">
                        <Compass className="w-3.5 h-3.5 text-[#0784C8] flex-shrink-0" />
                        <span>{opt.facing}</span>
                      </div>
                      {opt.isCorner && (
                        <span className="inline-block mt-1 px-1.5 py-0.5 rounded bg-[#edf5f9] text-[9.5px] font-semibold text-[#0784C8] uppercase tracking-wider">
                          ★ Corner Plot
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 align-middle whitespace-nowrap text-xs sm:text-[13px] font-bold text-[#071A28]">
                      {opt.basePriceLabel}
                    </td>
                    <td className="py-3.5 px-4 align-middle whitespace-nowrap">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10.5px] font-semibold inline-block ${
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
                    <td className="py-3.5 px-4 align-middle text-right whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => onSelectOption(opt)}
                        className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
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
        <div className="md:hidden space-y-3">
          {plotOptions.map((opt) => {
            const isSelected = selectedOptionId === opt.id;
            return (
              <div
                key={opt.id}
                className={`p-3.5 sm:p-5 rounded-xl sm:rounded-2xl border transition-all ${
                  isSelected
                    ? "bg-[#edf5f9] border-[#0784C8] shadow-sm"
                    : "bg-[#F5F1E9] border-[rgba(7,26,40,0.08)]"
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-2.5">
                  <div>
                    <h3 className="text-xs sm:text-sm font-semibold text-[#071A28]">
                      {opt.label}
                    </h3>
                    {opt.plotNumber && (
                      <span className="text-[11px] text-[#667d8f]">{opt.plotNumber}</span>
                    )}
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] font-semibold ${
                      opt.status === "Available"
                        ? "bg-[rgba(36,209,127,0.12)] text-[#10854d]"
                        : opt.status === "Limited"
                        ? "bg-[rgba(243,156,18,0.12)] text-[#b85e13]"
                        : "bg-[#edf5f9] text-[#0784C8]"
                    }`}
                  >
                    {opt.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] sm:text-xs mb-3.5">
                  <div>
                    <span className="text-[#667d8f] block">Dimensions:</span>
                    <strong className="text-[#071A28] font-mono font-medium">
                      {opt.widthFt} ft × {opt.lengthFt} ft
                    </strong>
                  </div>
                  <div>
                    <span className="text-[#667d8f] block">Area:</span>
                    <strong className="text-[#071A28] font-semibold">
                      {opt.areaSqYd} Sq. Yds ({opt.areaSqFt} Sq. Ft)
                    </strong>
                  </div>
                  <div>
                    <span className="text-[#667d8f] block">Facing:</span>
                    <strong className="text-[#071A28] font-medium">{opt.facing}</strong>
                  </div>
                  <div>
                    <span className="text-[#667d8f] block">Base Price:</span>
                    <strong className="text-[#071A28] font-bold">{opt.basePriceLabel}</strong>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onSelectOption(opt)}
                  className={`w-full py-2.5 rounded-xl text-xs font-semibold transition-all text-center min-h-[40px] ${
                    isSelected
                      ? "bg-[#0784C8] text-white shadow-xs"
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

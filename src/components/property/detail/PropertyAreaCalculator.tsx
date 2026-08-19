"use client";

import { useState, useEffect, useId } from "react";
import { Calculator, RotateCcw, Scale, Check, ArrowRight } from "lucide-react";
import { PlotOption } from "@/types/property";

interface PropertyAreaCalculatorProps {
  plotOptions?: PlotOption[];
  selectedOption?: PlotOption | null;
  defaultRatePerSqYd?: number;
}

export function PropertyAreaCalculator({
  plotOptions = [],
  selectedOption = null,
  defaultRatePerSqYd = 25000,
}: PropertyAreaCalculatorProps) {
  const widthId = useId();
  const lengthId = useId();
  const rateId = useId();
  const presetId = useId();

  // Initial State from selected plot or defaults
  const [width, setWidth] = useState<number>(selectedOption ? selectedOption.widthFt : 30);
  const [length, setLength] = useState<number>(selectedOption ? selectedOption.lengthFt : 50);
  const [ratePerSqYd, setRatePerSqYd] = useState<number>(
    selectedOption ? selectedOption.ratePerSqYd : defaultRatePerSqYd
  );

  const [prevSelectedOption, setPrevSelectedOption] = useState(selectedOption);

  // Sync state if selectedOption changes externally during render
  if (selectedOption !== prevSelectedOption) {
    setPrevSelectedOption(selectedOption);
    if (selectedOption) {
      setWidth(selectedOption.widthFt);
      setLength(selectedOption.lengthFt);
      setRatePerSqYd(selectedOption.ratePerSqYd);
    }
  }

  // Derived Safe Area Computations
  const safeWidth = Number.isFinite(width) && width > 0 && width <= 500 ? width : 0;
  const safeLength = Number.isFinite(length) && length > 0 && length <= 1000 ? length : 0;
  const safeRate = Number.isFinite(ratePerSqYd) && ratePerSqYd > 0 ? ratePerSqYd : 0;

  const areaSqFt = Math.round(safeWidth * safeLength * 100) / 100;
  const areaSqYd = Math.round((areaSqFt / 9) * 100) / 100;
  const estimatedBasePrice = Math.round(areaSqYd * safeRate);

  const formatINR = (amount: number) => {
    if (amount <= 0) return "₹0";
    if (amount >= 10000000) {
      return `₹${(amount / 10000000).toFixed(2)} Crores`;
    }
    if (amount >= 100000) {
      return `₹${(amount / 100000).toFixed(2)} Lakhs`;
    }
    return `₹${amount.toLocaleString("en-IN")}`;
  };

  const handleReset = () => {
    if (selectedOption) {
      setWidth(selectedOption.widthFt);
      setLength(selectedOption.lengthFt);
      setRatePerSqYd(selectedOption.ratePerSqYd);
    } else {
      setWidth(30);
      setLength(50);
      setRatePerSqYd(defaultRatePerSqYd);
    }
  };

  return (
    <section id="area-calculator" aria-labelledby="calc-heading" className="mb-12">
      <div className="p-7 sm:p-8 rounded-3xl bg-[#031C2B] text-white border border-[rgba(255,255,255,0.12)] shadow-[0_12px_36px_rgba(3,28,43,0.25)] relative overflow-hidden">
        {/* Subtle grid accent */}
        <div
          className="absolute inset-0 opacity-[0.05] pointer-events-none bg-[radial-gradient(#52BDE9_1px,transparent_1px)] [background-size:20px_20px]"
          aria-hidden="true"
        />

        <div className="relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[rgba(82,189,233,0.14)] border border-[rgba(82,189,233,0.3)] text-[#52BDE9] text-xs font-bold uppercase tracking-wider mb-2">
                <Calculator className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Area &amp; Price Estimator</span>
              </div>
              <h2
                id="calc-heading"
                className="font-heading text-2xl sm:text-3xl text-white font-normal leading-tight tracking-tight"
              >
                Square-Yards &amp; Base Price Calculator.
              </h2>
            </div>

            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[rgba(255,255,255,0.08)] hover:bg-[rgba(255,255,255,0.15)] text-[#c5d8e4] text-xs transition-colors self-start sm:self-auto"
              aria-label="Reset calculator to defaults"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Column: Inputs */}
            <div className="lg:col-span-7 space-y-4">
              {/* Presets dropdown if options exist */}
              {plotOptions.length > 0 && (
                <div>
                  <label htmlFor={presetId} className="block text-xs font-bold text-[#a0b6c6] uppercase tracking-wider mb-1.5">
                    Quick Preset Selection
                  </label>
                  <select
                    id={presetId}
                    className="w-full px-4 py-2.5 rounded-xl bg-[rgba(255,255,255,0.08)] border border-[rgba(255,255,255,0.15)] text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#52BDE9]"
                    onChange={(e) => {
                      const found = plotOptions.find((p) => p.id === e.target.value);
                      if (found) {
                        setWidth(found.widthFt);
                        setLength(found.lengthFt);
                        setRatePerSqYd(found.ratePerSqYd);
                      }
                    }}
                    value={plotOptions.find((p) => p.widthFt === width && p.lengthFt === length)?.id || ""}
                  >
                    <option value="" className="bg-[#031C2B] text-white">Custom Dimensions</option>
                    {plotOptions.map((opt) => (
                      <option key={opt.id} value={opt.id} className="bg-[#031C2B] text-white">
                        {opt.label} ({opt.widthFt} × {opt.lengthFt} ft — {opt.areaSqYd} Sq. Yd)
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Width & Length Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor={widthId} className="block text-xs font-bold text-[#a0b6c6] uppercase tracking-wider mb-1.5">
                    Frontage / Width (Feet)
                  </label>
                  <input
                    id={widthId}
                    type="number"
                    min={1}
                    max={500}
                    value={width || ""}
                    onChange={(e) => setWidth(Number(e.target.value))}
                    className="w-full px-4 py-2.5 rounded-xl bg-[rgba(255,255,255,0.08)] border border-[rgba(255,255,255,0.15)] text-white text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#52BDE9]"
                  />
                </div>

                <div>
                  <label htmlFor={lengthId} className="block text-xs font-bold text-[#a0b6c6] uppercase tracking-wider mb-1.5">
                    Depth / Length (Feet)
                  </label>
                  <input
                    id={lengthId}
                    type="number"
                    min={1}
                    max={1000}
                    value={length || ""}
                    onChange={(e) => setLength(Number(e.target.value))}
                    className="w-full px-4 py-2.5 rounded-xl bg-[rgba(255,255,255,0.08)] border border-[rgba(255,255,255,0.15)] text-white text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#52BDE9]"
                  />
                </div>
              </div>

              {/* Rate per Sq. Yd */}
              <div>
                <label htmlFor={rateId} className="block text-xs font-bold text-[#a0b6c6] uppercase tracking-wider mb-1.5">
                  Indicative Rate (₹ per Sq. Yard / Gaj)
                </label>
                <input
                  id={rateId}
                  type="number"
                  min={100}
                  max={500000}
                  value={ratePerSqYd || ""}
                  onChange={(e) => setRatePerSqYd(Number(e.target.value))}
                  className="w-full px-4 py-2.5 rounded-xl bg-[rgba(255,255,255,0.08)] border border-[rgba(255,255,255,0.15)] text-white text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#52BDE9]"
                />
              </div>
            </div>

            {/* Right Column: Output Card */}
            <div className="lg:col-span-5 p-6 rounded-2xl bg-[rgba(255,255,255,0.06)] border border-[rgba(255,255,255,0.12)] flex flex-col justify-between">
              <div className="space-y-4 mb-6">
                <div>
                  <span className="text-[11px] font-bold text-[#52BDE9] uppercase tracking-wider block mb-1">
                    Computed Plot Area
                  </span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-heading font-bold text-white">
                      {areaSqYd.toLocaleString("en-IN")}
                    </span>
                    <span className="text-sm font-medium text-[#c5d8e4]">Sq. Yards (Gaj)</span>
                  </div>
                  <span className="text-xs text-[#7a93a5] font-mono">
                    = {areaSqFt.toLocaleString("en-IN")} Sq. Feet
                  </span>
                </div>

                <div className="pt-4 border-t border-[rgba(255,255,255,0.08)]">
                  <span className="text-[11px] font-bold text-[#24D17F] uppercase tracking-wider block mb-1">
                    Estimated Base Price
                  </span>
                  <div className="text-2xl sm:text-3xl font-heading font-bold text-white">
                    {formatINR(estimatedBasePrice)}
                  </div>
                  <span className="text-[11px] text-[#7a93a5]">
                    @ ₹{safeRate.toLocaleString("en-IN")} / Sq. Yd
                  </span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] text-[11px] text-[#a0b6c6] flex items-start gap-2">
                <Scale className="w-3.5 h-3.5 text-[#52BDE9] flex-shrink-0 mt-0.5" />
                <span>
                  Exact 1:9 conversion rule applied (1 Sq. Yd = 9 Sq. Ft). Excludes registration, GST/Stamp duty, and PLC.
                </span>
              </div>
            </div>
          </div>

          {/* Statutory Calculator Disclaimer */}
          <p className="text-[11px] text-[#7a93a5] leading-relaxed mt-6 pt-4 border-t border-[rgba(255,255,255,0.08)]">
            <strong>Disclaimer:</strong> Calculated values are estimates based on the information currently displayed. Final dimensions, pricing, taxes, registration charges, and other costs must be independently confirmed before payment.
          </p>
        </div>
      </div>
    </section>
  );
}

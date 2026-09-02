"use client";

import { useState, useId, useRef, useEffect } from "react";
import { Calculator, RotateCcw, Scale, Layers, ChevronDown, Check } from "lucide-react";
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

  // Initial State from selected plot or defaults
  const [width, setWidth] = useState<number>(selectedOption ? selectedOption.widthFt : 30);
  const [length, setLength] = useState<number>(selectedOption ? selectedOption.lengthFt : 50);
  const [ratePerSqYd, setRatePerSqYd] = useState<number>(
    selectedOption ? selectedOption.ratePerSqYd : defaultRatePerSqYd
  );

  const [prevSelectedOption, setPrevSelectedOption] = useState(selectedOption);
  const [isPresetOpen, setIsPresetOpen] = useState(false);
  const presetDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (presetDropdownRef.current && !presetDropdownRef.current.contains(event.target as Node)) {
        setIsPresetOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Sync state if selectedOption changes externally during render
  if (selectedOption !== prevSelectedOption) {
    setPrevSelectedOption(selectedOption);
    if (selectedOption) {
      setWidth(selectedOption.widthFt);
      setLength(selectedOption.lengthFt);
      setRatePerSqYd(selectedOption.ratePerSqYd);
    }
  }

  // Current matched preset option
  const matchedPreset = plotOptions.find((p) => p.widthFt === width && p.lengthFt === length);

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
    <section id="area-calculator" aria-labelledby="calc-heading" className="mb-8 sm:mb-12">
      <div className="p-4 sm:p-7 sm:p-8 rounded-2xl sm:rounded-3xl bg-[#031C2B] text-white border border-[rgba(255,255,255,0.12)] shadow-[0_12px_36px_rgba(3,28,43,0.25)] relative overflow-hidden">
        {/* Subtle grid accent */}
        <div
          className="absolute inset-0 opacity-[0.05] pointer-events-none bg-[radial-gradient(#52BDE9_1px,transparent_1px)] [background-size:20px_20px]"
          aria-hidden="true"
        />

        <div className="relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3 mb-5 sm:mb-6">
            <div>
              <div className="inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1 rounded-full bg-[rgba(82,189,233,0.14)] border border-[rgba(82,189,233,0.3)] text-[#52BDE9] text-[10.5px] sm:text-xs font-semibold uppercase tracking-wider mb-2">
                <Calculator className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Area &amp; Price Estimator</span>
              </div>
              <h2
                id="calc-heading"
                className="font-instrument text-xl sm:text-2xl sm:text-3xl text-white font-normal leading-tight tracking-tight"
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
              {/* Presets custom dropdown matching HomeSearch if options exist */}
              {plotOptions.length > 0 && (
                <div
                  ref={presetDropdownRef}
                  className="relative"
                  onKeyDown={(e) => {
                    if (e.key === "Escape") setIsPresetOpen(false);
                  }}
                >
                  <label className="block text-[11px] sm:text-xs font-bold text-[#a0b6c6] uppercase tracking-wider mb-1.5">
                    Quick Preset Selection
                  </label>

                  <button
                    type="button"
                    onClick={() => setIsPresetOpen((prev) => !prev)}
                    aria-haspopup="listbox"
                    aria-expanded={isPresetOpen}
                    aria-label="Select plot configuration preset"
                    className={`w-full flex items-center justify-between gap-3 px-4 py-2.5 sm:py-3 rounded-xl transition-all text-left cursor-pointer border ${
                      isPresetOpen
                        ? "bg-[rgba(255,255,255,0.14)] border-[#52BDE9] ring-2 ring-[rgba(82,189,233,0.3)] shadow-md"
                        : "bg-[rgba(255,255,255,0.08)] hover:bg-[rgba(255,255,255,0.12)] border-[rgba(255,255,255,0.15)] hover:border-[rgba(82,189,233,0.4)]"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <Layers size={16} className="text-[#52BDE9] flex-shrink-0" />
                      <div className="flex flex-col min-w-0 flex-1">
                        <span className="truncate font-bold text-white text-xs sm:text-sm">
                          {matchedPreset ? matchedPreset.label : "Custom Dimensions"}
                        </span>
                        {matchedPreset && (
                          <span className="text-[10.5px] text-[#a0b6c6] font-mono truncate">
                            {matchedPreset.widthFt} × {matchedPreset.lengthFt} ft • {matchedPreset.areaSqYd} Sq. Yd
                          </span>
                        )}
                      </div>
                    </div>

                    <ChevronDown
                      size={16}
                      className={`text-[#a0b6c6] flex-shrink-0 transition-transform duration-200 ${
                        isPresetOpen ? "rotate-180 text-[#52BDE9]" : ""
                      }`}
                    />
                  </button>

                  {/* Floating Custom Listbox */}
                  {isPresetOpen && (
                    <div
                      role="listbox"
                      aria-label="Plot configuration presets"
                      className="absolute top-[calc(100%+6px)] left-0 right-0 z-50 max-h-64 overflow-y-auto rounded-xl bg-[#031C2B] border border-[rgba(82,189,233,0.3)] shadow-[0_16px_48px_rgba(0,0,0,0.6)] p-1.5 backdrop-blur-md animate-in fade-in-0 zoom-in-95 duration-150"
                    >
                      {/* Custom Option */}
                      <button
                        type="button"
                        role="option"
                        aria-selected={!matchedPreset}
                        onClick={() => setIsPresetOpen(false)}
                        className={`w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-lg text-left transition-all cursor-pointer ${
                          !matchedPreset
                            ? "bg-[rgba(82,189,233,0.15)] text-[#52BDE9]"
                            : "text-white hover:bg-[rgba(255,255,255,0.08)]"
                        }`}
                      >
                        <span className="text-xs sm:text-sm font-semibold">Custom Dimensions</span>
                        {!matchedPreset && <Check size={16} className="text-[#52BDE9] flex-shrink-0" />}
                      </button>

                      {/* Plot Options */}
                      {plotOptions.map((opt) => {
                        const isSelected = matchedPreset?.id === opt.id;
                        return (
                          <button
                            key={opt.id}
                            type="button"
                            role="option"
                            aria-selected={isSelected}
                            onClick={() => {
                              setWidth(opt.widthFt);
                              setLength(opt.lengthFt);
                              setRatePerSqYd(opt.ratePerSqYd);
                              setIsPresetOpen(false);
                            }}
                            className={`w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg text-left transition-all cursor-pointer ${
                              isSelected
                                ? "bg-[rgba(82,189,233,0.15)] text-[#52BDE9]"
                                : "text-white hover:bg-[rgba(255,255,255,0.08)]"
                            }`}
                          >
                            <div className="flex flex-col min-w-0 flex-1">
                              <span className="text-xs sm:text-sm font-bold truncate">
                                {opt.label}
                              </span>
                              <span className="text-[11px] text-[#a0b6c6] font-mono mt-0.5">
                                {opt.widthFt} × {opt.lengthFt} ft — {opt.areaSqYd} Sq. Yd
                              </span>
                            </div>
                            {isSelected && <Check size={16} className="text-[#52BDE9] flex-shrink-0" />}
                          </button>
                        );
                      })}
                    </div>
                  )}
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
            <div className="lg:col-span-5 p-4 sm:p-6 rounded-xl sm:rounded-2xl bg-[rgba(255,255,255,0.06)] border border-[rgba(255,255,255,0.12)] flex flex-col justify-between">
              <div className="space-y-3.5 sm:space-y-4 mb-4 sm:mb-6">
                <div>
                  <span className="text-[10.5px] sm:text-[11px] font-bold text-[#52BDE9] uppercase tracking-wider block mb-1">
                    Computed Plot Area
                  </span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl sm:text-3xl font-heading font-bold text-white">
                      {areaSqYd.toLocaleString("en-IN")}
                    </span>
                    <span className="text-xs sm:text-sm font-medium text-[#c5d8e4]">Sq. Yards (Gaj)</span>
                  </div>
                  <span className="text-[11px] sm:text-xs text-[#7a93a5] font-mono">
                    = {areaSqFt.toLocaleString("en-IN")} Sq. Feet
                  </span>
                </div>

                <div className="pt-3.5 sm:pt-4 border-t border-[rgba(255,255,255,0.08)]">
                  <span className="text-[10.5px] sm:text-[11px] font-bold text-[#24D17F] uppercase tracking-wider block mb-1">
                    Estimated Base Price
                  </span>
                  <div className="text-xl sm:text-2xl md:text-3xl font-heading font-bold text-white">
                    {formatINR(estimatedBasePrice)}
                  </div>
                  <span className="text-[10.5px] sm:text-[11px] text-[#7a93a5]">
                    @ ₹{safeRate.toLocaleString("en-IN")} / Sq. Yd
                  </span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] text-[10.5px] sm:text-[11px] text-[#a0b6c6] flex items-start gap-2">
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

"use client";

import { rupeesToPaise, paiseToRupees, formatPaiseToRupeeString } from "@/lib/utils/currency";
import { sqFtToSqYards } from "@/lib/utils/area";
import type { PriceVisibility } from "@/types/database";

export type PricingType = "FIXED" | "STARTING_FROM" | "PRICE_RANGE" | "ON_REQUEST";
export type AreaDisplayPreference = "SQ_FT" | "SQ_YD" | "BOTH";

interface PricingAreaSectionProps {
  formData: {
    pricingType: PricingType;
    startingPricePaise?: number;
    maximumPricePaise?: number;
    ratePerSqYdPaise?: number;
    priceVisibility: PriceVisibility;
    pricingNote?: string;
    minimumAreaSqFt: number;
    maximumAreaSqFt: number;
    displayPreference: AreaDisplayPreference;
  };
  errors: Record<string, string[]>;
  onChange: (fields: Partial<PricingAreaSectionProps["formData"]>) => void;
}

export function PricingAreaSection({
  formData,
  errors,
  onChange,
}: PricingAreaSectionProps) {
  const startingRupees = formData.startingPricePaise ? paiseToRupees(formData.startingPricePaise) : "";
  const maxRupees = formData.maximumPricePaise ? paiseToRupees(formData.maximumPricePaise) : "";
  const rateRupees = formData.ratePerSqYdPaise ? paiseToRupees(formData.ratePerSqYdPaise) : "";

  const minSqYds = sqFtToSqYards(formData.minimumAreaSqFt || 0);
  const maxSqYds = sqFtToSqYards(formData.maximumAreaSqFt || 0);

  const handleStartingRupeesChange = (val: string) => {
    const num = Number(val);
    if (!val || isNaN(num) || num < 0) {
      onChange({ startingPricePaise: undefined });
    } else {
      onChange({ startingPricePaise: rupeesToPaise(num) });
    }
  };

  const handleMaxRupeesChange = (val: string) => {
    const num = Number(val);
    if (!val || isNaN(num) || num < 0) {
      onChange({ maximumPricePaise: undefined });
    } else {
      onChange({ maximumPricePaise: rupeesToPaise(num) });
    }
  };

  const handleRateRupeesChange = (val: string) => {
    const num = Number(val);
    if (!val || isNaN(num) || num < 0) {
      onChange({ ratePerSqYdPaise: undefined });
    } else {
      onChange({ ratePerSqYdPaise: rupeesToPaise(num) });
    }
  };

  return (
    <div id="section-pricing" className="p-6 rounded-2xl bg-white border border-[rgba(7,26,40,0.08)] shadow-xs space-y-6">
      <div className="flex items-center justify-between pb-3 border-b border-[rgba(7,26,40,0.06)]">
        <div>
          <h2 className="text-sm font-bold text-[#071a28]">4. Commercial Pricing & Land Dimensions</h2>
          <p className="text-xs text-[#647581] mt-0.5">
            Monetary amounts stored as exact integer paise; areas stored in canonical square feet.
          </p>
        </div>
      </div>

      {/* Pricing Models */}
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-[#071a28] mb-1">Pricing Model</label>
            <select
              value={formData.pricingType}
              onChange={(e) => onChange({ pricingType: e.target.value as PricingType })}
              className="w-full p-2.5 rounded-xl border border-[rgba(7,26,40,0.12)] bg-white text-xs sm:text-sm text-[#071a28] font-medium focus:border-[#087fc3] focus:outline-none"
            >
              <option value="STARTING_FROM">Starting From (Range / Baseline)</option>
              <option value="FIXED">Fixed Base Price</option>
              <option value="RANGE">Price Range (Min to Max)</option>
              <option value="PRICE_ON_REQUEST">Price on Request Only</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#071a28] mb-1">Public Price Visibility</label>
            <select
              value={formData.priceVisibility}
              onChange={(e) => onChange({ priceVisibility: e.target.value as PriceVisibility })}
              className="w-full p-2.5 rounded-xl border border-[rgba(7,26,40,0.12)] bg-white text-xs sm:text-sm text-[#071a28] font-medium focus:border-[#087fc3] focus:outline-none"
            >
              <option value="PUBLIC">Display Public Price Figure</option>
              <option value="ON_REQUEST">Mask Price ("Price on Request")</option>
            </select>
          </div>
        </div>

        {formData.priceVisibility === "PUBLIC" && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div>
              <label className="block text-xs font-bold text-[#071a28] mb-1">
                Starting Base Price (INR ₹)
              </label>
              <input
                type="number"
                min={0}
                value={startingRupees}
                onChange={(e) => handleStartingRupeesChange(e.target.value)}
                placeholder="e.g. 2850000"
                className="w-full p-2.5 rounded-xl border border-[rgba(7,26,40,0.12)] text-xs sm:text-sm text-[#071a28] focus:outline-none focus:border-[#087fc3]"
              />
              {formData.startingPricePaise ? (
                <p className="text-[11px] font-mono text-[#087fc3] mt-1 font-semibold">
                  Formatted: {formatPaiseToRupeeString(formData.startingPricePaise)}
                </p>
              ) : null}
            </div>

            <div>
              <label className="block text-xs font-bold text-[#071a28] mb-1">
                Maximum Price (INR ₹, optional)
              </label>
              <input
                type="number"
                min={0}
                value={maxRupees}
                onChange={(e) => handleMaxRupeesChange(e.target.value)}
                placeholder="e.g. 8500000"
                className="w-full p-2.5 rounded-xl border border-[rgba(7,26,40,0.12)] text-xs sm:text-sm text-[#071a28] focus:outline-none focus:border-[#087fc3]"
              />
              {formData.maximumPricePaise ? (
                <p className="text-[11px] font-mono text-[#087fc3] mt-1 font-semibold">
                  Formatted: {formatPaiseToRupeeString(formData.maximumPricePaise)}
                </p>
              ) : null}
              {errors.maximumPricePaise && (
                <p className="text-[11px] text-rose-600 mt-1 font-mono">{errors.maximumPricePaise[0]}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-[#071a28] mb-1">
                Rate per Sq Yard (INR ₹)
              </label>
              <input
                type="number"
                min={0}
                value={rateRupees}
                onChange={(e) => handleRateRupeesChange(e.target.value)}
                placeholder="e.g. 28500"
                className="w-full p-2.5 rounded-xl border border-[rgba(7,26,40,0.12)] text-xs sm:text-sm text-[#071a28] focus:outline-none focus:border-[#087fc3]"
              />
              {formData.ratePerSqYdPaise ? (
                <p className="text-[11px] font-mono text-[#087fc3] mt-1 font-semibold">
                  Formatted: ₹{paiseToRupees(formData.ratePerSqYdPaise).toLocaleString("en-IN")}/sq yd
                </p>
              ) : null}
            </div>
          </div>
        )}

        <div>
          <label className="block text-xs font-bold text-[#071a28] mb-1">Pricing Notes & Terms</label>
          <input
            type="text"
            value={formData.pricingNote || ""}
            onChange={(e) => onChange({ pricingNote: e.target.value })}
            placeholder="e.g. Registry fees & PLC charges extra as applicable"
            maxLength={500}
            className="w-full p-2.5 rounded-xl border border-[rgba(7,26,40,0.12)] text-xs sm:text-sm text-[#071a28] focus:outline-none focus:border-[#087fc3]"
          />
        </div>
      </div>

      {/* Land Area Dimensions */}
      <div className="space-y-4 pt-4 border-t border-[rgba(7,26,40,0.06)]">
        <h3 className="text-xs font-bold font-mono text-[#071a28] uppercase tracking-wider">
          Area Range & Display Preferences
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-[#071a28] mb-1">
              Minimum Plot Size (Sq Ft) <span className="text-rose-500">*</span>
            </label>
            <input
              type="number"
              min={1}
              required
              value={formData.minimumAreaSqFt || ""}
              onChange={(e) => onChange({ minimumAreaSqFt: Number(e.target.value) || 0 })}
              className="w-full p-2.5 rounded-xl border border-[rgba(7,26,40,0.12)] text-xs sm:text-sm text-[#071a28] focus:outline-none focus:border-[#087fc3]"
            />
            <p className="text-[11px] font-mono text-[#647581] mt-1">
              ≈ {minSqYds.toLocaleString()} Sq Yards
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#071a28] mb-1">
              Maximum Plot Size (Sq Ft) <span className="text-rose-500">*</span>
            </label>
            <input
              type="number"
              min={1}
              required
              value={formData.maximumAreaSqFt || ""}
              onChange={(e) => onChange({ maximumAreaSqFt: Number(e.target.value) || 0 })}
              className={`w-full p-2.5 rounded-xl border text-xs sm:text-sm text-[#071a28] focus:outline-none ${
                errors.maximumAreaSqFt ? "border-rose-400 bg-rose-50/20" : "border-[rgba(7,26,40,0.12)] focus:border-[#087fc3]"
              }`}
            />
            <p className="text-[11px] font-mono text-[#647581] mt-1">
              ≈ {maxSqYds.toLocaleString()} Sq Yards
            </p>
            {errors.maximumAreaSqFt && (
              <p className="text-[11px] text-rose-600 mt-1 font-mono">{errors.maximumAreaSqFt[0]}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-[#071a28] mb-1">Unit Display Preference</label>
            <select
              value={formData.displayPreference}
              onChange={(e) => onChange({ displayPreference: e.target.value as AreaDisplayPreference })}
              className="w-full p-2.5 rounded-xl border border-[rgba(7,26,40,0.12)] bg-white text-xs sm:text-sm text-[#071a28] font-medium focus:border-[#087fc3] focus:outline-none"
            >
              <option value="BOTH">Show Both (Sq Yds & Sq Ft)</option>
              <option value="SQ_YD">Show Sq Yards Primarily</option>
              <option value="SQ_FT">Show Sq Feet Primarily</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}

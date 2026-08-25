"use client";

import { useState } from "react";
import { TrendingUp, Plus, Trash2, ShieldCheck, Lock, ExternalLink, Save, X, AlertCircle } from "lucide-react";
import type { IMarketObservation } from "@/types/database";

interface MarketIntelligenceSectionProps {
  marketObservations: IMarketObservation[];
  onChange: (fields: Record<string, any>) => void;
}

export function MarketIntelligenceSection({
  marketObservations = [],
  onChange,
}: MarketIntelligenceSectionProps) {
  const [isAdding, setIsAdding] = useState(false);

  const [formData, setFormData] = useState<Partial<IMarketObservation>>({
    metricType: "AVERAGE_ASKING_RATE",
    numericValue: 450000, // 4,500 INR in paise
    canonicalUnit: "PAISE_PER_SQ_FT",
    observationPeriod: "Q1 2026",
    sourceName: "JDA Registrar & Stamp Duty Circle Rates",
    sourceUrl: "https://igrs.rajasthan.gov.in",
    sourceType: "GOVERNMENT",
    verificationStatus: "VERIFIED",
    isPublic: true,
    internalNotes: "",
  });

  const [rateRupees, setRateRupees] = useState<number>(4500);

  const handleDelete = (index: number) => {
    const list = marketObservations.filter((_, idx) => idx !== index);
    onChange({ marketObservations: list });
  };

  const handleSave = () => {
    if (!formData.metricType || !formData.observationPeriod || !formData.sourceName) return;

    const isInternal = formData.sourceType === "INTERNAL_RESEARCH";
    const isPublic = isInternal ? false : (formData.isPublic ?? true);

    const numericValue =
      formData.canonicalUnit === "PAISE_PER_SQ_FT"
        ? Math.round(rateRupees * 100)
        : Number(formData.numericValue) || 0;

    const itemData: IMarketObservation = {
      ...formData,
      numericValue,
      canonicalUnit: formData.canonicalUnit || "PAISE_PER_SQ_FT",
      observationPeriod: formData.observationPeriod.trim(),
      sourceName: formData.sourceName.trim(),
      sourceUrl: formData.sourceUrl?.trim() || undefined,
      sourceType: formData.sourceType || "GOVERNMENT",
      verificationStatus: formData.verificationStatus || "VERIFIED",
      isPublic,
      internalNotes: formData.internalNotes?.trim(),
      createdAt: new Date(),
    } as IMarketObservation;

    const list = [...marketObservations, itemData];
    onChange({ marketObservations: list });
    setIsAdding(false);
    setFormData({
      metricType: "AVERAGE_ASKING_RATE",
      numericValue: 450000,
      canonicalUnit: "PAISE_PER_SQ_FT",
      observationPeriod: "Q1 2026",
      sourceName: "JDA Registrar & Stamp Duty Circle Rates",
      sourceUrl: "",
      sourceType: "GOVERNMENT",
      verificationStatus: "VERIFIED",
      isPublic: true,
      internalNotes: "",
    });
    setRateRupees(4500);
  };

  return (
    <section className="p-6 sm:p-8 rounded-3xl bg-white border border-[rgba(7,26,40,0.08)] shadow-[0_4px_24px_rgba(7,26,40,0.04)] space-y-6">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div>
          <h2 className="text-base font-bold text-[#071a28] font-body flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-[#087fc3]" />
            <span>8. Sourced Market Intelligence &amp; Rate Observations</span>
          </h2>
          <p className="text-xs text-[#647581] mt-0.5 font-body">
            Strictly sourced property price rates (integer paise/sq ft), registry data, and period observations.
          </p>
        </div>

        {!isAdding && (
          <button
            type="button"
            onClick={() => setIsAdding(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#087fc3] text-white text-xs font-semibold hover:bg-[#0a6ba3] transition-colors shadow-2xs font-body"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Observation</span>
          </button>
        )}
      </div>

      {/* Form */}
      {isAdding && (
        <div className="p-5 sm:p-6 rounded-2xl bg-[#f7f5ef]/70 border border-[#087fc3]/25 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#071a28] font-body">
              Log Sourced Market Metric Observation
            </h3>
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="p-1 rounded-lg text-[#647581] hover:text-[#071a28]"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#071a28] mb-1 font-body">
                Metric Classification <span className="text-rose-500">*</span>
              </label>
              <select
                value={formData.metricType || "AVERAGE_ASKING_RATE"}
                onChange={(e) => setFormData((prev) => ({ ...prev, metricType: e.target.value }))}
                className="w-full text-xs p-2.5 rounded-xl border border-[rgba(7,26,40,0.15)] bg-white font-body shadow-2xs"
              >
                <option value="AVERAGE_ASKING_RATE">Average Asking Rate</option>
                <option value="MIN_OBSERVED_RATE">Minimum Observed Rate</option>
                <option value="MAX_OBSERVED_RATE">Maximum Observed Rate</option>
                <option value="RATE_PER_SQ_FT">Base Rate per Sq. Ft.</option>
                <option value="RATE_PER_SQ_YD">Base Rate per Sq. Yard</option>
                <option value="PERIOD_CHANGE_PERCENT">Period-over-Period Change %</option>
                <option value="INVENTORY_LEVEL">Active Plotted Inventory</option>
                <option value="DEVELOPMENT_ACTIVITY">Development Activity Index</option>
                <option value="INVESTOR_INTEREST">Investor Demand Sentiment</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#071a28] mb-1 font-body">
                Observation Rate (₹ / sq ft) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                min="0"
                required
                value={rateRupees}
                onChange={(e) => setRateRupees(parseFloat(e.target.value) || 0)}
                placeholder="4500"
                className="w-full text-xs p-2.5 rounded-xl border border-[rgba(7,26,40,0.15)] bg-white font-mono shadow-2xs"
              />
              <span className="text-[10px] font-mono text-[#647581] mt-0.5 block">
                Stored as {(rateRupees * 100).toLocaleString()} paise/sq ft (₹
                {Math.round(rateRupees * 9).toLocaleString()}/sq yd)
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#071a28] mb-1 font-body">
                Observation Period <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.observationPeriod || ""}
                onChange={(e) => setFormData((prev) => ({ ...prev, observationPeriod: e.target.value }))}
                placeholder="e.g. Q1 2026 or 2025-H2"
                className="w-full text-xs p-2.5 rounded-xl border border-[rgba(7,26,40,0.15)] bg-white font-body shadow-2xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#071a28] mb-1 font-body">
                Source Classification <span className="text-rose-500">*</span>
              </label>
              <select
                value={formData.sourceType || "GOVERNMENT"}
                onChange={(e) => setFormData((prev) => ({ ...prev, sourceType: e.target.value as any }))}
                className="w-full text-xs p-2.5 rounded-xl border border-[rgba(7,26,40,0.15)] bg-white font-body shadow-2xs"
              >
                <option value="GOVERNMENT">Government / Circle Rate Registry</option>
                <option value="RERA">RERA State Authority Filing</option>
                <option value="REGISTERED_MARKET_REPORT">Registered Market Agency Report</option>
                <option value="DEVELOPER_DOCUMENT">Developer Price Schedule</option>
                <option value="INTERNAL_RESEARCH">Internal Analyst Research (Private)</option>
                <option value="OTHER">Other Verified Industry Source</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#071a28] mb-1 font-body">
                Source Organization / Document <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.sourceName || ""}
                onChange={(e) => setFormData((prev) => ({ ...prev, sourceName: e.target.value }))}
                placeholder="e.g. JDA Circle Rate Master Table Q1 2026"
                className="w-full text-xs p-2.5 rounded-xl border border-[rgba(7,26,40,0.15)] bg-white font-body shadow-2xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#071a28] mb-1 font-body">
                Source Document URL
              </label>
              <input
                type="url"
                value={formData.sourceUrl || ""}
                onChange={(e) => setFormData((prev) => ({ ...prev, sourceUrl: e.target.value }))}
                placeholder="https://igrs.rajasthan.gov.in"
                className="w-full text-xs p-2.5 rounded-xl border border-[rgba(7,26,40,0.15)] bg-white font-mono shadow-2xs"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-[#071a28] font-body select-none">
              <input
                type="checkbox"
                checked={formData.sourceType !== "INTERNAL_RESEARCH" && (formData.isPublic ?? true)}
                disabled={formData.sourceType === "INTERNAL_RESEARCH"}
                onChange={(e) => setFormData((prev) => ({ ...prev, isPublic: e.target.checked }))}
                className="w-4 h-4 rounded text-[#087fc3]"
              />
              <span>Publicly Visible on Marketplace Insights</span>
            </label>

            {formData.sourceType === "INTERNAL_RESEARCH" && (
              <span className="text-[11px] font-mono text-amber-700 flex items-center gap-1">
                <Lock className="w-3 h-3" />
                Internal estimates remain private by default
              </span>
            )}
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-[rgba(7,26,40,0.08)]">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-4 py-2 rounded-xl border border-[rgba(7,26,40,0.1)] text-xs font-semibold text-[#071a28] hover:bg-white"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={!formData.observationPeriod || !formData.sourceName}
              className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-[#087fc3] text-white text-xs font-semibold hover:bg-[#0a6ba3] disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Log Observation</span>
            </button>
          </div>
        </div>
      )}

      {/* Observations Table */}
      {marketObservations.length === 0 ? (
        <div className="p-8 rounded-2xl bg-[#f7f5ef]/40 border border-dashed border-[rgba(7,26,40,0.1)] text-center">
          <TrendingUp className="w-8 h-8 text-[#647581]/40 mx-auto mb-2" />
          <p className="text-xs font-bold text-[#071a28]">No market observations recorded</p>
          <p className="text-xs text-[#647581] mt-0.5">
            Record government circle rates, developer price schedules, or RERA registered metrics for price trend charts.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-[#647581] font-mono uppercase text-[10px] tracking-wider">
                <th className="py-2.5 px-3">Period</th>
                <th className="py-2.5 px-3">Metric Type</th>
                <th className="py-2.5 px-3">Observed Rate</th>
                <th className="py-2.5 px-3">Source Attribution</th>
                <th className="py-2.5 px-3">Visibility</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {marketObservations.map((obs, idx) => {
                const rateRupees =
                  obs.canonicalUnit === "PAISE_PER_SQ_FT"
                    ? Math.round(obs.numericValue / 100)
                    : obs.numericValue;

                return (
                  <tr key={obs._id?.toString() || idx} className="hover:bg-[#f7f5ef]/40">
                    <td className="py-3 px-3 font-mono font-bold text-[#071a28]">
                      {obs.observationPeriod}
                    </td>
                    <td className="py-3 px-3 text-[#071a28] font-body">
                      {obs.metricType}
                    </td>
                    <td className="py-3 px-3 font-mono font-bold text-[#087fc3]">
                      ₹{rateRupees.toLocaleString()} / sq ft
                      <span className="text-[10px] text-[#647581] block font-normal">
                        (₹{Math.round(rateRupees * 9).toLocaleString()} / sq yd)
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <div className="space-y-0.5">
                        <span className="text-xs font-medium text-[#071a28] block">
                          {obs.sourceName}
                        </span>
                        <span className="text-[10px] font-mono text-[#647581] block">
                          {obs.sourceType}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      {obs.isPublic ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          <ShieldCheck className="w-3 h-3" />
                          Public
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-full">
                          <Lock className="w-3 h-3" />
                          Internal
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        type="button"
                        onClick={() => handleDelete(idx)}
                        className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50"
                        title="Delete observation"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

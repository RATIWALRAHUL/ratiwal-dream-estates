"use client";

import { Home, Building2, Trees, Landmark } from "lucide-react";
import type { PropertyType } from "@/types/database";
import { PropertyTypeEnum } from "@/types/database";

interface PropertyTypesSectionProps {
  supportedPropertyTypes: PropertyType[];
  onChange: (fields: Record<string, any>) => void;
}

export function PropertyTypesSection({
  supportedPropertyTypes = ["RESIDENTIAL_PLOT", "COMMERCIAL_PLOT"],
  onChange,
}: PropertyTypesSectionProps) {
  const toggleType = (type: PropertyType) => {
    const exists = supportedPropertyTypes.includes(type);
    let updated: PropertyType[];
    if (exists) {
      if (supportedPropertyTypes.length === 1) return; // Keep at least one
      updated = supportedPropertyTypes.filter((t) => t !== type);
    } else {
      updated = [...supportedPropertyTypes, type];
    }
    onChange({ supportedPropertyTypes: updated });
  };

  const typeLabels: Record<PropertyType, { label: string; desc: string }> = {
    RESIDENTIAL_PLOT: { label: "Residential Plots", desc: "Plotted township parcels, gated communities" },
    COMMERCIAL_PLOT: { label: "Commercial Plots", desc: "Retail SCO, showroom pads, expressway fronts" },
    INDUSTRIAL_PLOT: { label: "Industrial Plots", desc: "Logistics warehousing, manufacturing belts" },
    FARM_LAND: { label: "Farm Lands / Agri Parcels", desc: "Agricultural estates, weekend retreat parcels" },
    VILLA: { label: "Villas & Independent Houses", desc: "Custom-built luxury villas, duplex homes" },
    APARTMENT: { label: "Apartments & Multi-Family", desc: "High-rise & low-rise residential units" },
    OTHER: { label: "Special Purpose Zoning", desc: "Institutional, healthcare, or mixed-use land" },
  };

  return (
    <section className="p-6 sm:p-8 rounded-3xl bg-white border border-[rgba(7,26,40,0.08)] shadow-[0_4px_24px_rgba(7,26,40,0.04)] space-y-6">
      <div className="border-b border-slate-100 pb-4">
        <h2 className="text-base font-bold text-[#071a28] font-body flex items-center gap-2">
          <Landmark className="w-4 h-4 text-[#087fc3]" />
          <span>9. Supported Zoning &amp; Property Types</span>
        </h2>
        <p className="text-xs text-[#647581] mt-0.5 font-body">
          Configure which land uses and asset classes are permitted and showcased in this growth corridor.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {PropertyTypeEnum.map((type) => {
          const isSelected = supportedPropertyTypes.includes(type);
          const meta = typeLabels[type] || { label: type, desc: "" };

          return (
            <div
              key={type}
              onClick={() => toggleType(type)}
              className={`p-4 rounded-2xl border cursor-pointer select-none transition-all ${
                isSelected
                  ? "bg-[#eaf5fa]/70 border-[#087fc3] text-[#071a28] shadow-2xs"
                  : "bg-white border-[rgba(7,26,40,0.08)] hover:border-slate-300 text-[#647581]"
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-1">
                <span className="text-xs font-bold font-body text-[#071a28]">{meta.label}</span>
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => toggleType(type)}
                  className="w-4 h-4 rounded text-[#087fc3]"
                />
              </div>
              <p className="text-[11px] text-[#647581] font-body leading-relaxed">{meta.desc}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}

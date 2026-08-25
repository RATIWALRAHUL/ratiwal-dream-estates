"use client";

import { MapPin } from "lucide-react";

interface LocationOption {
  id: string;
  name: string;
  city: string;
  state: string;
  publicationStatus?: string;
}

interface LocationClassificationSectionProps {
  locationId: string;
  locations: LocationOption[];
  errors: Record<string, string[]>;
  onChange: (locationId: string) => void;
}

export function LocationClassificationSection({
  locationId,
  locations,
  errors,
  onChange,
}: LocationClassificationSectionProps) {
  const selectedLoc = locations.find((l) => l.id === locationId);

  return (
    <div id="section-location" className="p-6 rounded-2xl bg-white border border-[rgba(7,26,40,0.08)] shadow-xs space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-[rgba(7,26,40,0.06)]">
        <div>
          <h2 className="text-sm font-bold text-[#071a28]">2. Location & Growth Corridor Hub</h2>
          <p className="text-xs text-[#647581] mt-0.5">
            Link property to an approved regional growth corridor across Jaipur, Navi Mumbai, or Ajmer.
          </p>
        </div>
      </div>

      <div className="space-y-3">
        <div>
          <label className="block text-xs font-bold text-[#071a28] mb-1">
            Growth Corridor Hub <span className="text-rose-500">*</span>
          </label>
          <select
            value={locationId}
            onChange={(e) => onChange(e.target.value)}
            className={`w-full p-3 rounded-xl border bg-white text-xs sm:text-sm text-[#071a28] font-medium focus:outline-none ${
              errors.locationId ? "border-rose-400 bg-rose-50/20" : "border-[rgba(7,26,40,0.12)] focus:border-[#087fc3]"
            }`}
          >
            {locations.map((loc) => (
              <option key={loc.id} value={loc.id}>
                {loc.name} — {loc.city}, {loc.state} ({loc.publicationStatus || "ACTIVE"})
              </option>
            ))}
          </select>
          {errors.locationId && (
            <p className="text-[11px] text-rose-600 mt-1 font-mono">{errors.locationId[0]}</p>
          )}
        </div>

        {selectedLoc && (
          <div className="p-4 rounded-xl bg-[#f7f5ef]/60 border border-[rgba(7,26,40,0.06)] flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#eaf5fa] text-[#087fc3] flex items-center justify-center shrink-0">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-[#071a28]">{selectedLoc.name}</p>
              <p className="text-[11px] text-[#647581]">
                {selectedLoc.city}, {selectedLoc.state} • Hub Status: {selectedLoc.publicationStatus || "PUBLISHED"}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

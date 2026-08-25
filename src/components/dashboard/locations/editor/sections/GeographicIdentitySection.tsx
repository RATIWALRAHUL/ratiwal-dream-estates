"use client";

import { MapPin, CheckCircle2, ShieldAlert } from "lucide-react";

interface GeographicIdentitySectionProps {
  coordinates?: {
    latitude?: number;
    longitude?: number;
    isVerified?: boolean;
    source?: string;
  };
  onChange: (fields: Record<string, any>) => void;
}

export function GeographicIdentitySection({
  coordinates = {},
  onChange,
}: GeographicIdentitySectionProps) {
  const hasCoordinates =
    typeof coordinates.latitude === "number" && typeof coordinates.longitude === "number";

  const handleCoordChange = (key: string, value: any) => {
    onChange({
      coordinates: {
        ...coordinates,
        [key]: value,
      },
    });
  };

  return (
    <section className="p-6 sm:p-8 rounded-3xl bg-white border border-[rgba(7,26,40,0.08)] shadow-[0_4px_24px_rgba(7,26,40,0.04)] space-y-6">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div>
          <h2 className="text-base font-bold text-[#071a28] font-body flex items-center gap-2">
            <MapPin className="w-4 h-4 text-[#087fc3]" />
            <span>2. Geographic Identity &amp; Verified Coordinates</span>
          </h2>
          <p className="text-xs text-[#647581] mt-0.5 font-body">
            Precise centroid coordinates for GIS mapping and connectivity routing.
          </p>
        </div>

        {hasCoordinates && coordinates.isVerified ? (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold font-mono border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Verified GIS Point</span>
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-[#647581] text-xs font-semibold font-mono">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Unverified / Non-Public</span>
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
        <div>
          <label className="block text-xs font-semibold text-[#071a28] mb-1.5 font-body">
            Latitude (-90.0 to 90.0)
          </label>
          <input
            type="number"
            step="any"
            min="-90"
            max="90"
            value={coordinates.latitude ?? ""}
            onChange={(e) =>
              handleCoordChange(
                "latitude",
                e.target.value === "" ? undefined : parseFloat(e.target.value)
              )
            }
            placeholder="e.g. 26.8504"
            className="w-full text-xs p-3 rounded-xl border border-[rgba(7,26,40,0.15)] font-mono focus:border-[#087fc3] focus:outline-hidden shadow-2xs"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#071a28] mb-1.5 font-body">
            Longitude (-180.0 to 180.0)
          </label>
          <input
            type="number"
            step="any"
            min="-180"
            max="180"
            value={coordinates.longitude ?? ""}
            onChange={(e) =>
              handleCoordChange(
                "longitude",
                e.target.value === "" ? undefined : parseFloat(e.target.value)
              )
            }
            placeholder="e.g. 75.7601"
            className="w-full text-xs p-3 rounded-xl border border-[rgba(7,26,40,0.15)] font-mono focus:border-[#087fc3] focus:outline-hidden shadow-2xs"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-[#071a28] mb-1.5 font-body">
            Geographic Data Source
          </label>
          <input
            type="text"
            value={coordinates.source ?? ""}
            onChange={(e) => handleCoordChange("source", e.target.value)}
            placeholder="e.g. Survey of India / Masterplan Sheet / On-Site GPS"
            className="w-full text-xs p-3 rounded-xl border border-[rgba(7,26,40,0.15)] focus:border-[#087fc3] focus:outline-hidden font-body shadow-2xs"
          />
        </div>

        <div className="flex items-center pt-6">
          <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-[#071a28] font-body select-none">
            <input
              type="checkbox"
              checked={coordinates.isVerified ?? false}
              onChange={(e) => handleCoordChange("isVerified", e.target.checked)}
              className="w-4 h-4 rounded text-[#087fc3] focus:ring-[#087fc3]"
            />
            <span>Mark Coordinates as Verified by Audit Team</span>
          </label>
        </div>
      </div>
    </section>
  );
}

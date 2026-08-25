"use client";

import { Compass, Sparkles, AlertCircle } from "lucide-react";

interface BasicInfoSectionProps {
  name: string;
  slug: string;
  city: string;
  state: string;
  country: string;
  region?: string;
  tagline?: string;
  featured: boolean;
  sortOrder: number;
  publicationStatus: string;
  userRole: string;
  onChange: (fields: Record<string, any>) => void;
  onRequestSlugChange?: () => void;
}

export function BasicInfoSection({
  name,
  slug,
  city,
  state,
  country,
  region = "",
  tagline = "",
  featured,
  sortOrder,
  publicationStatus,
  userRole,
  onChange,
  onRequestSlugChange,
}: BasicInfoSectionProps) {
  const isPublished = publicationStatus === "PUBLISHED";
  const canChangePublishedSlug = userRole === "SUPER_ADMIN";

  return (
    <section className="p-6 sm:p-8 rounded-3xl bg-white border border-[rgba(7,26,40,0.08)] shadow-[0_4px_24px_rgba(7,26,40,0.04)] space-y-6">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div>
          <h2 className="text-base font-bold text-[#071a28] font-body flex items-center gap-2">
            <Compass className="w-4 h-4 text-[#087fc3]" />
            <span>1. Basic Information &amp; Jurisdiction</span>
          </h2>
          <p className="text-xs text-[#647581] mt-0.5 font-body">
            Core territorial identity, city jurisdiction, and catalog hierarchy.
          </p>
        </div>

        {/* Featured Toggle */}
        <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-[#071a28] font-body select-none">
          <input
            type="checkbox"
            checked={featured}
            onChange={(e) => onChange({ featured: e.target.checked })}
            className="w-4 h-4 rounded text-[#087fc3] focus:ring-[#087fc3]"
          />
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span>Featured Corridor</span>
        </label>
      </div>

      {/* Name and Slug Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        <div>
          <label className="block text-xs font-semibold text-[#071a28] mb-1.5 font-body">
            Location Name <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => onChange({ name: e.target.value })}
            placeholder="e.g. Ajmer Road Expressway Corridor, Jaipur"
            className="w-full text-xs p-3 rounded-xl border border-[rgba(7,26,40,0.15)] focus:border-[#087fc3] focus:outline-hidden font-body shadow-2xs"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-semibold text-[#071a28] font-body">
              URL Slug <span className="text-rose-500">*</span>
            </label>
            {isPublished && (
              <span className="text-[10px] font-mono text-amber-600 font-semibold flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                Published Slug Locked
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <input
              type="text"
              disabled={isPublished}
              value={slug}
              onChange={(e) => onChange({ slug: e.target.value })}
              className="w-full text-xs p-3 rounded-xl border border-[rgba(7,26,40,0.15)] font-mono text-[#071a28] focus:border-[#087fc3] focus:outline-hidden shadow-2xs disabled:bg-slate-50 disabled:text-[#647581]"
            />
            {isPublished && canChangePublishedSlug && onRequestSlugChange && (
              <button
                type="button"
                onClick={onRequestSlugChange}
                className="shrink-0 px-3 py-2 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold hover:bg-amber-100 transition-colors"
                title="Super Admin Slug Change with Redirect Tracking"
              >
                Change Slug
              </button>
            )}
          </div>
        </div>
      </div>

      {/* City, State, Country, Region */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <label className="block text-xs font-semibold text-[#071a28] mb-1.5 font-body">
            City <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            required
            value={city}
            onChange={(e) => onChange({ city: e.target.value })}
            placeholder="e.g. Jaipur"
            className="w-full text-xs p-3 rounded-xl border border-[rgba(7,26,40,0.15)] focus:border-[#087fc3] focus:outline-hidden font-body shadow-2xs"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#071a28] mb-1.5 font-body">
            State <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            required
            value={state}
            onChange={(e) => onChange({ state: e.target.value })}
            placeholder="e.g. Rajasthan"
            className="w-full text-xs p-3 rounded-xl border border-[rgba(7,26,40,0.15)] focus:border-[#087fc3] focus:outline-hidden font-body shadow-2xs"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#071a28] mb-1.5 font-body">
            Country <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            required
            value={country}
            onChange={(e) => onChange({ country: e.target.value })}
            placeholder="e.g. India"
            className="w-full text-xs p-3 rounded-xl border border-[rgba(7,26,40,0.15)] focus:border-[#087fc3] focus:outline-hidden font-body shadow-2xs"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#071a28] mb-1.5 font-body">
            Region / Zone
          </label>
          <input
            type="text"
            value={region}
            onChange={(e) => onChange({ region: e.target.value })}
            placeholder="e.g. Western Corridor"
            className="w-full text-xs p-3 rounded-xl border border-[rgba(7,26,40,0.15)] focus:border-[#087fc3] focus:outline-hidden font-body shadow-2xs"
          />
        </div>
      </div>

      {/* Tagline & Sort Order */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="sm:col-span-3">
          <label className="block text-xs font-semibold text-[#071a28] mb-1.5 font-body">
            Market Tagline / Catchphrase
          </label>
          <input
            type="text"
            value={tagline}
            onChange={(e) => onChange({ tagline: e.target.value })}
            placeholder="e.g. Western Expressway Growth Hub & Plotted Township Belt"
            className="w-full text-xs p-3 rounded-xl border border-[rgba(7,26,40,0.15)] focus:border-[#087fc3] focus:outline-hidden font-body shadow-2xs"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#071a28] mb-1.5 font-body">
            Sort Order Weight
          </label>
          <input
            type="number"
            value={sortOrder}
            onChange={(e) => onChange({ sortOrder: Number(e.target.value) || 0 })}
            className="w-full text-xs p-3 rounded-xl border border-[rgba(7,26,40,0.15)] font-mono focus:border-[#087fc3] focus:outline-hidden shadow-2xs"
          />
        </div>
      </div>
    </section>
  );
}

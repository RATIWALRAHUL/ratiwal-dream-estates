"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Sparkles, AlertTriangle } from "lucide-react";
import { createPropertyDraftAction } from "@/lib/actions/property.actions";
import { normalizeSlug } from "@/lib/utils/slug";
import type { ListingStatus } from "@/types/database";

interface NewPropertyFormProps {
  locations: { id: string; name: string; city: string; state: string }[];
}

export function NewPropertyForm({ locations }: NewPropertyFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [customSlugEdited, setCustomSlugEdited] = useState(false);
  const [locationId, setLocationId] = useState(locations[0]?.id || "");
  const [propertyType, setPropertyType] = useState<"RESIDENTIAL_PLOT" | "COMMERCIAL_PLOT" | "INDUSTRIAL_PLOT" | "FARM_LAND" | "VILLA">("RESIDENTIAL_PLOT");
  const [shortDescription, setShortDescription] = useState("");
  const [listingStatus, setListingStatus] = useState<ListingStatus>("AVAILABLE");

  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [serverError, setServerError] = useState<string | null>(null);

  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!customSlugEdited) {
      setSlug(normalizeSlug(val));
    }
  };

  const handleSlugChange = (val: string) => {
    setCustomSlugEdited(true);
    setSlug(normalizeSlug(val));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setServerError(null);

    // Client-side quick check
    const newErrors: Record<string, string[]> = {};
    if (title.trim().length < 3) {
      newErrors.title = ["Title must be at least 3 characters."];
    }
    if (shortDescription.trim().length < 10) {
      newErrors.shortDescription = ["Short description must be at least 10 characters."];
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    startTransition(async () => {
      const res = await createPropertyDraftAction({
        title: title.trim(),
        slug: slug.trim() || undefined,
        locationId,
        propertyType,
        shortDescription: shortDescription.trim(),
        listingStatus,
      });

      if (res.success && res.data) {
        // Redirect to full editor
        router.push(`/dashboard/properties/${res.data.propertyId}/edit`);
      } else {
        if (!res.success && res.fieldErrors) {
          setErrors(res.fieldErrors);
        }
        setServerError(res.message);
      }
    });
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header & Back Link */}
      <div className="flex items-center justify-between pb-4 border-b border-[rgba(7,26,40,0.06)]">
        <div>
          <Link
            href="/dashboard/properties"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#647581] hover:text-[#071a28] transition-colors mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Property Catalog</span>
          </Link>
          <h1 className="text-xl sm:text-2xl font-bold font-serif text-[#071a28]">
            Create New Property Draft
          </h1>
          <p className="text-xs text-[#647581] mt-0.5">
            Initialize minimum required project details. You will be redirected to the full 11-section editor to complete media, pricing, and diligence.
          </p>
        </div>
      </div>

      {serverError && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{serverError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="p-6 rounded-2xl bg-white border border-[rgba(7,26,40,0.08)] shadow-xs space-y-5">
          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-[#071a28] mb-1">
              Property Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="e.g. Royal Palms Luxury Township — Ajmer Road"
              maxLength={200}
              className={`w-full p-3 rounded-xl border text-xs sm:text-sm text-[#071a28] placeholder:text-[#647581] focus:outline-none ${
                errors.title ? "border-rose-400 bg-rose-50/20" : "border-[rgba(7,26,40,0.12)] focus:border-[#087fc3]"
              }`}
            />
            {errors.title && <p className="text-[11px] text-rose-600 mt-1 font-mono">{errors.title[0]}</p>}
          </div>

          {/* Generated Slug */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold text-[#071a28]">
                URL Slug Candidate <span className="text-rose-500">*</span>
              </label>
              <span className="text-[10px] font-mono text-[#647581]">Auto-generated from title</span>
            </div>
            <div className="flex items-center">
              <span className="px-3 py-3 rounded-l-xl bg-slate-100 border border-r-0 border-[rgba(7,26,40,0.12)] text-xs text-[#647581] font-mono">
                /properties/
              </span>
              <input
                type="text"
                required
                value={slug}
                onChange={(e) => handleSlugChange(e.target.value)}
                placeholder="royal-palms-luxury-township-ajmer-road"
                maxLength={100}
                className={`w-full p-3 rounded-r-xl border text-xs sm:text-sm font-mono text-[#071a28] focus:outline-none ${
                  errors.slug ? "border-rose-400 bg-rose-50/20" : "border-[rgba(7,26,40,0.12)] focus:border-[#087fc3]"
                }`}
              />
            </div>
            {errors.slug && <p className="text-[11px] text-rose-600 mt-1 font-mono">{errors.slug[0]}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Location Corridor */}
            <div>
              <label className="block text-xs font-bold text-[#071a28] mb-1">
                Growth Corridor Hub <span className="text-rose-500">*</span>
              </label>
              <select
                value={locationId}
                onChange={(e) => setLocationId(e.target.value)}
                className="w-full p-3 rounded-xl border border-[rgba(7,26,40,0.12)] bg-white text-xs sm:text-sm text-[#071a28] font-medium focus:border-[#087fc3] focus:outline-none"
              >
                {locations.map((loc) => (
                  <option key={loc.id} value={loc.id}>
                    {loc.name} ({loc.city}, {loc.state})
                  </option>
                ))}
              </select>
              {errors.locationId && (
                <p className="text-[11px] text-rose-600 mt-1 font-mono">{errors.locationId[0]}</p>
              )}
            </div>

            {/* Property Classification */}
            <div>
              <label className="block text-xs font-bold text-[#071a28] mb-1">
                Zoning & Classification <span className="text-rose-500">*</span>
              </label>
              <select
                value={propertyType}
                onChange={(e) => setPropertyType(e.target.value as any)}
                className="w-full p-3 rounded-xl border border-[rgba(7,26,40,0.12)] bg-white text-xs sm:text-sm text-[#071a28] font-medium focus:border-[#087fc3] focus:outline-none"
              >
                <option value="RESIDENTIAL_PLOT">Residential Plot</option>
                <option value="COMMERCIAL_PLOT">Commercial Plot</option>
                <option value="INDUSTRIAL_PLOT">Industrial Plot</option>
                <option value="FARM_LAND">Farm Land / Agricultural</option>
                <option value="VILLA">Villa / Plotted Villa</option>
              </select>
            </div>
          </div>

          {/* Short Description */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold text-[#071a28]">
                Short Description / Overview <span className="text-rose-500">*</span>
              </label>
              <span className="text-[10px] font-mono text-[#647581]">
                {shortDescription.length}/500 chars
              </span>
            </div>
            <textarea
              required
              rows={3}
              value={shortDescription}
              onChange={(e) => setShortDescription(e.target.value)}
              placeholder="Provide a concise 2-3 sentence overview highlighting statutory approvals, corridor connectivity, and plot size options..."
              maxLength={500}
              className={`w-full p-3 rounded-xl border text-xs sm:text-sm text-[#071a28] placeholder:text-[#647581] focus:outline-none ${
                errors.shortDescription
                  ? "border-rose-400 bg-rose-50/20"
                  : "border-[rgba(7,26,40,0.12)] focus:border-[#087fc3]"
              }`}
            />
            {errors.shortDescription && (
              <p className="text-[11px] text-rose-600 mt-1 font-mono">{errors.shortDescription[0]}</p>
            )}
          </div>

          {/* Initial Listing Status */}
          <div>
            <label className="block text-xs font-bold text-[#071a28] mb-1">
              Initial Availability Status
            </label>
            <select
              value={listingStatus}
              onChange={(e) => setListingStatus(e.target.value as ListingStatus)}
              className="w-full sm:w-1/2 p-3 rounded-xl border border-[rgba(7,26,40,0.12)] bg-white text-xs sm:text-sm text-[#071a28] font-medium focus:border-[#087fc3] focus:outline-none"
            >
              <option value="AVAILABLE">Available for Booking</option>
              <option value="LIMITED">Limited Units Available</option>
              <option value="RESERVED">Reserved</option>
              <option value="SOLD">Sold Out</option>
            </select>
          </div>
        </div>

        {/* Submit Actions */}
        <div className="flex items-center justify-between pt-2">
          <Link
            href="/dashboard/properties"
            className="px-5 py-2.5 rounded-xl border border-[rgba(7,26,40,0.12)] text-[#071a28] text-xs font-semibold hover:bg-slate-50 transition-colors"
          >
            Cancel
          </Link>

          <button
            type="submit"
            disabled={isPending}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#071a28] text-white text-xs font-bold hover:bg-[#0a6ba3] disabled:opacity-50 transition-all shadow-md cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-[#42b7e8]" />
            <span>{isPending ? "Creating Draft..." : "Create Draft & Open Editor"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}

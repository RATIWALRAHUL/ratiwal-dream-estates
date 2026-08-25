"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Compass, Loader2, Sparkles, AlertCircle } from "lucide-react";
import { createLocationDraftAction } from "@/lib/actions/location.actions";
import { normalizeSlug } from "@/lib/utils/slug";

export function NewLocationForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    city: "Jaipur",
    state: "Rajasthan",
    country: "India",
    region: "",
    shortDescription: "",
  });

  const [slugManual, setSlugManual] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setFormData((prev) => ({
      ...prev,
      name: val,
      slug: slugManual ? prev.slug : normalizeSlug(val),
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setFieldErrors({});

    startTransition(async () => {
      const res = await createLocationDraftAction({
        name: formData.name,
        slug: formData.slug || undefined,
        city: formData.city,
        state: formData.state,
        country: formData.country,
        region: formData.region || undefined,
        shortDescription: formData.shortDescription,
      });

      if (res.success && res.data) {
        router.push(`/dashboard/locations/${res.data.locationId}/edit`);
      } else if (!res.success) {
        setErrorMsg(res.message || "Failed to create location draft.");
        if (res.fieldErrors) {
          setFieldErrors(res.fieldErrors);
        }
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2 font-body">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-[rgba(7,26,40,0.08)] shadow-[0_4px_24px_rgba(7,26,40,0.04)] space-y-6">
        <div className="border-b border-slate-100 pb-4">
          <h2 className="text-base font-bold text-[#071a28] font-body flex items-center gap-2">
            <Compass className="w-4 h-4 text-[#087fc3]" />
            <span>Corridor Identity &amp; Geography</span>
          </h2>
          <p className="text-xs text-[#647581] mt-0.5 font-body">
            Provide the initial regional designation and jurisdictional territory.
          </p>
        </div>

        {/* Location Name */}
        <div>
          <label className="block text-xs font-semibold text-[#071a28] mb-1.5 font-body">
            Location Corridor Name <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={handleNameChange}
            placeholder="e.g. Ajmer Road Expressway Corridor, Jaipur"
            className="w-full text-xs p-3.5 rounded-xl border border-[rgba(7,26,40,0.15)] focus:border-[#087fc3] focus:outline-hidden font-body shadow-2xs"
          />
          {fieldErrors.name && (
            <p className="text-[11px] text-rose-600 mt-1 font-body">{fieldErrors.name[0]}</p>
          )}
        </div>

        {/* Slug Candidate */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-semibold text-[#071a28] font-body">
              URL Slug <span className="text-rose-500">*</span>
            </label>
            <span className="text-[10px] font-mono text-[#647581]">
              /locations/{formData.slug || "..."}
            </span>
          </div>
          <div className="relative">
            <input
              type="text"
              required
              value={formData.slug}
              onChange={(e) => {
                setSlugManual(true);
                setFormData((prev) => ({ ...prev, slug: normalizeSlug(e.target.value) }));
              }}
              placeholder="ajmer-road-jaipur"
              className="w-full text-xs p-3.5 rounded-xl border border-[rgba(7,26,40,0.15)] font-mono text-[#071a28] focus:border-[#087fc3] focus:outline-hidden shadow-2xs"
            />
          </div>
          {fieldErrors.slug && (
            <p className="text-[11px] text-rose-600 mt-1 font-body">{fieldErrors.slug[0]}</p>
          )}
        </div>

        {/* City & State & Country Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-[#071a28] mb-1.5 font-body">
              City <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.city}
              onChange={(e) => setFormData((prev) => ({ ...prev, city: e.target.value }))}
              placeholder="e.g. Jaipur"
              className="w-full text-xs p-3 rounded-xl border border-[rgba(7,26,40,0.15)] focus:border-[#087fc3] focus:outline-hidden font-body shadow-2xs"
            />
            {fieldErrors.city && (
              <p className="text-[11px] text-rose-600 mt-1 font-body">{fieldErrors.city[0]}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#071a28] mb-1.5 font-body">
              State <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.state}
              onChange={(e) => setFormData((prev) => ({ ...prev, state: e.target.value }))}
              placeholder="e.g. Rajasthan"
              className="w-full text-xs p-3 rounded-xl border border-[rgba(7,26,40,0.15)] focus:border-[#087fc3] focus:outline-hidden font-body shadow-2xs"
            />
            {fieldErrors.state && (
              <p className="text-[11px] text-rose-600 mt-1 font-body">{fieldErrors.state[0]}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#071a28] mb-1.5 font-body">
              Country <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.country}
              onChange={(e) => setFormData((prev) => ({ ...prev, country: e.target.value }))}
              placeholder="e.g. India"
              className="w-full text-xs p-3 rounded-xl border border-[rgba(7,26,40,0.15)] focus:border-[#087fc3] focus:outline-hidden font-body shadow-2xs"
            />
          </div>
        </div>

        {/* Region */}
        <div>
          <label className="block text-xs font-semibold text-[#071a28] mb-1.5 font-body">
            Region / Sub-Market (Optional)
          </label>
          <input
            type="text"
            value={formData.region}
            onChange={(e) => setFormData((prev) => ({ ...prev, region: e.target.value }))}
            placeholder="e.g. Western Growth Corridor, North NCR Zone"
            className="w-full text-xs p-3 rounded-xl border border-[rgba(7,26,40,0.15)] focus:border-[#087fc3] focus:outline-hidden font-body shadow-2xs"
          />
        </div>

        {/* Short Description */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-semibold text-[#071a28] font-body">
              Short Description / Summary <span className="text-rose-500">*</span>
            </label>
            <span className="text-[10px] font-mono text-[#647581]">
              {formData.shortDescription.length}/500
            </span>
          </div>
          <textarea
            required
            rows={3}
            maxLength={500}
            value={formData.shortDescription}
            onChange={(e) => setFormData((prev) => ({ ...prev, shortDescription: e.target.value }))}
            placeholder="High-growth plotted residential & commercial investment belt with direct expressway connectivity, planned industrial corridors, and verified masterplans..."
            className="w-full text-xs p-3.5 rounded-xl border border-[rgba(7,26,40,0.15)] focus:border-[#087fc3] focus:outline-hidden font-body shadow-2xs leading-relaxed"
          />
          {fieldErrors.shortDescription && (
            <p className="text-[11px] text-rose-600 mt-1 font-body">{fieldErrors.shortDescription[0]}</p>
          )}
        </div>
      </div>

      {/* Submission Actions */}
      <div className="flex items-center justify-between gap-4 p-4 rounded-2xl bg-white border border-[rgba(7,26,40,0.08)] shadow-xs">
        <Link
          href="/dashboard/locations"
          className="px-4 py-2.5 rounded-xl border border-[rgba(7,26,40,0.15)] text-xs font-semibold text-[#071a28] hover:bg-slate-50 transition-colors font-body"
        >
          Cancel
        </Link>

        <button
          type="submit"
          disabled={isPending || !formData.name || !formData.city || formData.shortDescription.length < 10}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#087fc3] hover:bg-[#0a6ba3] text-white text-xs font-semibold shadow-[0_4px_16px_rgba(8,127,195,0.35)] transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed font-body"
        >
          {isPending ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Creating Draft...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>Create Location Draft</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}

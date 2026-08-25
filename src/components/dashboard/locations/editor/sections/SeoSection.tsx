"use client";

import { Search, Globe } from "lucide-react";
import type { ISeoMetadata } from "@/types/database";

interface SeoSectionProps {
  seo?: ISeoMetadata;
  slug: string;
  onChange: (fields: Record<string, any>) => void;
}

export function SeoSection({
  seo = { metaTitle: "", metaDescription: "" },
  slug,
  onChange,
}: SeoSectionProps) {
  const handleSeoChange = (key: keyof ISeoMetadata, val: any) => {
    onChange({
      seo: {
        ...seo,
        [key]: val,
      },
    });
  };

  const metaTitle = seo.metaTitle || "";
  const metaDescription = seo.metaDescription || "";

  return (
    <section className="p-6 sm:p-8 rounded-3xl bg-white border border-[rgba(7,26,40,0.08)] shadow-[0_4px_24px_rgba(7,26,40,0.04)] space-y-6">
      <div className="border-b border-slate-100 pb-4">
        <h2 className="text-base font-bold text-[#071a28] font-body flex items-center gap-2">
          <Search className="w-4 h-4 text-[#087fc3]" />
          <span>10. Search Engine Optimization (SEO) &amp; Open Graph</span>
        </h2>
        <p className="text-xs text-[#647581] mt-0.5 font-body">
          Configure organic search metadata and social snippet preview for this landing page.
        </p>
      </div>

      {/* Google SERP Preview Card */}
      <div className="p-4 sm:p-5 rounded-2xl bg-[#f7f5ef]/70 border border-[rgba(7,26,40,0.08)] space-y-1.5 font-sans">
        <span className="text-[10px] font-mono uppercase tracking-wider text-[#647581] font-semibold block">
          Search Snippet Live Preview
        </span>
        <div className="flex items-center gap-2 text-xs text-[#202124]">
          <Globe className="w-3.5 h-3.5 text-[#087fc3]" />
          <span className="text-[#202124]">ratiwaldreamestates.com</span>
          <span className="text-[#5f6368]">› locations › {slug || "corridor-slug"}</span>
        </div>
        <h4 className="text-base text-[#1a0dab] hover:underline font-medium cursor-pointer truncate">
          {metaTitle || "Corridor Title | Ratiwal Dream Estates"}
        </h4>
        <p className="text-xs text-[#4d5156] line-clamp-2 leading-relaxed">
          {metaDescription || "Explore master-planned residential and commercial land investment opportunities..."}
        </p>
      </div>

      {/* Inputs */}
      <div className="space-y-4">
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-semibold text-[#071a28] font-body">
              SEO Meta Title (50-60 characters recommended) <span className="text-rose-500">*</span>
            </label>
            <span
              className={`text-[10px] font-mono ${
                metaTitle.length > 70 ? "text-rose-600 font-bold" : "text-[#647581]"
              }`}
            >
              {metaTitle.length}/70
            </span>
          </div>
          <input
            type="text"
            required
            maxLength={70}
            value={metaTitle}
            onChange={(e) => handleSeoChange("metaTitle", e.target.value)}
            placeholder="e.g. Plots in Ajmer Road Jaipur | Ratiwal Dream Estates"
            className="w-full text-xs p-3 rounded-xl border border-[rgba(7,26,40,0.15)] focus:border-[#087fc3] focus:outline-hidden font-body shadow-2xs"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-semibold text-[#071a28] font-body">
              SEO Meta Description (140-160 characters recommended) <span className="text-rose-500">*</span>
            </label>
            <span
              className={`text-[10px] font-mono ${
                metaDescription.length > 160 ? "text-rose-600 font-bold" : "text-[#647581]"
              }`}
            >
              {metaDescription.length}/160
            </span>
          </div>
          <textarea
            required
            rows={3}
            maxLength={160}
            value={metaDescription}
            onChange={(e) => handleSeoChange("metaDescription", e.target.value)}
            placeholder="Explore verified residential and commercial plots on Ajmer Road Expressway, Jaipur. Complete JDA documentation and direct expressway connectivity."
            className="w-full text-xs p-3.5 rounded-xl border border-[rgba(7,26,40,0.15)] focus:border-[#087fc3] focus:outline-hidden font-body shadow-2xs leading-relaxed"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-[#071a28] mb-1.5 font-body">
              Custom Canonical URL
            </label>
            <input
              type="url"
              value={seo.canonicalUrl || ""}
              onChange={(e) => handleSeoChange("canonicalUrl", e.target.value)}
              placeholder="https://ratiwaldreamestates.com/locations/ajmer-road-jaipur"
              className="w-full text-xs p-3 rounded-xl border border-[rgba(7,26,40,0.15)] focus:border-[#087fc3] focus:outline-hidden font-mono shadow-2xs"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#071a28] mb-1.5 font-body">
              Social OG Image URL
            </label>
            <input
              type="url"
              value={seo.ogImageUrl || ""}
              onChange={(e) => handleSeoChange("ogImageUrl", e.target.value)}
              placeholder="https://ik.imagekit.io/ratiwaldream/locations/ajmer-road-og.jpg"
              className="w-full text-xs p-3 rounded-xl border border-[rgba(7,26,40,0.15)] focus:border-[#087fc3] focus:outline-hidden font-mono shadow-2xs"
            />
          </div>
        </div>

        <div className="flex items-center gap-6 pt-2">
          <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-[#071a28] font-body select-none">
            <input
              type="checkbox"
              checked={seo.noIndex || false}
              onChange={(e) => handleSeoChange("noIndex", e.target.checked)}
              className="w-4 h-4 rounded text-rose-600"
            />
            <span>noIndex (Prevent Google Indexing)</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-[#071a28] font-body select-none">
            <input
              type="checkbox"
              checked={seo.noFollow || false}
              onChange={(e) => handleSeoChange("noFollow", e.target.checked)}
              className="w-4 h-4 rounded text-rose-600"
            />
            <span>noFollow (Prevent Link Following)</span>
          </label>
        </div>
      </div>
    </section>
  );
}

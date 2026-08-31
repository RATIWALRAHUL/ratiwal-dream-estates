"use client";

interface SeoSectionProps {
  seo: {
    metaTitle?: string;
    metaDescription?: string;
    canonicalUrl?: string;
    ogImage?: string;
    noIndex: boolean;
    noFollow: boolean;
  };
  onChange: (seo: Partial<SeoSectionProps["seo"]>) => void;
}

export function SeoSection({ seo, onChange }: SeoSectionProps) {
  const metaTitle = seo.metaTitle || "";
  const metaDesc = seo.metaDescription || "";

  return (
    <div id="section-seo" className="p-6 rounded-2xl bg-white border border-[rgba(7,26,40,0.08)] shadow-xs space-y-6">
      <div className="flex items-center justify-between pb-3 border-b border-[rgba(7,26,40,0.06)]">
        <div>
          <h2 className="text-sm font-bold text-[#071a28]">9. Search Engine Optimization (SEO) & Metadata</h2>
          <p className="text-xs text-[#647581] mt-0.5">
            Configure OpenGraph social preview cards and search engine indexation directives.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {/* Meta Title */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-xs font-bold text-[#071a28]">Meta Title Tag</label>
            <span
              className={`text-[10px] font-mono ${
                metaTitle.length > 60 ? "text-amber-600 font-bold" : "text-[#647581]"
              }`}
            >
              {metaTitle.length}/60 chars (recommended)
            </span>
          </div>
          <input
            type="text"
            value={metaTitle}
            onChange={(e) => onChange({ metaTitle: e.target.value })}
            placeholder="e.g. Royal Palms Plots Ajmer Road Jaipur | JDA Approved Land"
            maxLength={100}
            className="w-full p-2.5 rounded-xl border border-[rgba(7,26,40,0.12)] text-xs sm:text-sm text-[#071a28] focus:outline-none focus:border-[#087fc3]"
          />
        </div>

        {/* Meta Description */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-xs font-bold text-[#071a28]">Meta Description Tag</label>
            <span
              className={`text-[10px] font-mono ${
                metaDesc.length > 160 ? "text-amber-600 font-bold" : "text-[#647581]"
              }`}
            >
              {metaDesc.length}/160 chars (recommended)
            </span>
          </div>
          <textarea
            rows={2}
            value={metaDesc}
            onChange={(e) => onChange({ metaDescription: e.target.value })}
            placeholder="e.g. Explore verified residential plots in Royal Palms on Ajmer Road, Jaipur. 100-300 sq yd plots with 60ft road frontage and 30-year clear title."
            maxLength={300}
            className="w-full p-2.5 rounded-xl border border-[rgba(7,26,40,0.12)] text-xs sm:text-sm text-[#071a28] focus:outline-none focus:border-[#087fc3]"
          />
        </div>

        {/* OG Image & Indexation Toggles */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div>
            <label className="block text-xs font-bold text-[#071a28] mb-1">
              OpenGraph Preview Image URL
            </label>
            <input
              type="text"
              value={seo.ogImage || ""}
              onChange={(e) => onChange({ ogImage: e.target.value })}
              placeholder="e.g. /images/properties/royal-palms-og.jpg"
              className="w-full p-2.5 rounded-xl border border-[rgba(7,26,40,0.12)] text-xs sm:text-sm text-[#071a28] focus:outline-none focus:border-[#087fc3]"
            />
          </div>

          <div className="flex items-center gap-4 sm:pt-6">
            <label className="inline-flex items-center gap-1.5 text-xs text-[#071a28] cursor-pointer">
              <input
                type="checkbox"
                checked={seo.noIndex}
                onChange={(e) => onChange({ noIndex: e.target.checked })}
                className="w-3.5 h-3.5 rounded text-[#087fc3]"
              />
              <span>noIndex (Hide from Search Engines)</span>
            </label>

            <label className="inline-flex items-center gap-1.5 text-xs text-[#071a28] cursor-pointer">
              <input
                type="checkbox"
                checked={seo.noFollow}
                onChange={(e) => onChange({ noFollow: e.target.checked })}
                className="w-3.5 h-3.5 rounded text-[#087fc3]"
              />
              <span>noFollow</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}

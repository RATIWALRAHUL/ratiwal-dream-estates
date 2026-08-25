"use client";

import { FileText } from "lucide-react";

interface DescriptionsSectionProps {
  shortDescription: string;
  longDescription?: string;
  onChange: (fields: Record<string, any>) => void;
}

export function DescriptionsSection({
  shortDescription,
  longDescription = "",
  onChange,
}: DescriptionsSectionProps) {
  return (
    <section className="p-6 sm:p-8 rounded-3xl bg-white border border-[rgba(7,26,40,0.08)] shadow-[0_4px_24px_rgba(7,26,40,0.04)] space-y-6">
      <div className="border-b border-slate-100 pb-4">
        <h2 className="text-base font-bold text-[#071a28] font-body flex items-center gap-2">
          <FileText className="w-4 h-4 text-[#087fc3]" />
          <span>3. Regional Overview &amp; Editorial Descriptions</span>
        </h2>
        <p className="text-xs text-[#647581] mt-0.5 font-body">
          Macro investment overview, territorial advantages, and public landing page content.
        </p>
      </div>

      {/* Short Description */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="block text-xs font-semibold text-[#071a28] font-body">
            Short Description / Corridor Summary <span className="text-rose-500">*</span>
          </label>
          <span className="text-[10px] font-mono text-[#647581]">
            {shortDescription.length}/500
          </span>
        </div>
        <textarea
          required
          rows={3}
          maxLength={500}
          value={shortDescription}
          onChange={(e) => onChange({ shortDescription: e.target.value })}
          placeholder="High-growth plotted residential & commercial investment belt with direct expressway connectivity..."
          className="w-full text-xs p-3.5 rounded-xl border border-[rgba(7,26,40,0.15)] focus:border-[#087fc3] focus:outline-hidden font-body shadow-2xs leading-relaxed"
        />
      </div>

      {/* Long Description */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="block text-xs font-semibold text-[#071a28] font-body">
            Full Editorial &amp; Investment Thesis
          </label>
          <span className="text-[10px] font-mono text-[#647581]">
            {longDescription.length} characters
          </span>
        </div>
        <textarea
          rows={8}
          value={longDescription}
          onChange={(e) => onChange({ longDescription: e.target.value })}
          placeholder="Provide in-depth market context, masterplan history, industrial corridors, upcoming infrastructure milestones, and long-term land banking insights..."
          className="w-full text-xs p-3.5 rounded-xl border border-[rgba(7,26,40,0.15)] focus:border-[#087fc3] focus:outline-hidden font-body shadow-2xs leading-relaxed"
        />
      </div>
    </section>
  );
}

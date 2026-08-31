"use client";

import { useState } from "react";
import { Plus, Trash2, ArrowUp, ArrowDown } from "lucide-react";

interface DescriptionsSectionProps {
  highlights: string[];
  amenities: string[];
  onChange: (fields: { highlights?: string[]; amenities?: string[] }) => void;
}

export function DescriptionsSection({
  highlights,
  amenities,
  onChange,
}: DescriptionsSectionProps) {
  const [newHighlight, setNewHighlight] = useState("");
  const [newAmenity, setNewAmenity] = useState("");

  // Highlights handlers
  const addHighlight = () => {
    if (!newHighlight.trim()) return;
    onChange({ highlights: [...highlights, newHighlight.trim()] });
    setNewHighlight("");
  };

  const removeHighlight = (idx: number) => {
    onChange({ highlights: highlights.filter((_, i) => i !== idx) });
  };

  const moveHighlight = (idx: number, dir: -1 | 1) => {
    const targetIdx = idx + dir;
    if (targetIdx < 0 || targetIdx >= highlights.length) return;
    const copy = [...highlights];
    const item = copy.splice(idx, 1)[0];
    copy.splice(targetIdx, 0, item);
    onChange({ highlights: copy });
  };

  // Amenities handlers
  const addAmenity = () => {
    if (!newAmenity.trim()) return;
    onChange({ amenities: [...amenities, newAmenity.trim()] });
    setNewAmenity("");
  };

  const removeAmenity = (idx: number) => {
    onChange({ amenities: amenities.filter((_, i) => i !== idx) });
  };

  const moveAmenity = (idx: number, dir: -1 | 1) => {
    const targetIdx = idx + dir;
    if (targetIdx < 0 || targetIdx >= amenities.length) return;
    const copy = [...amenities];
    const item = copy.splice(idx, 1)[0];
    copy.splice(targetIdx, 0, item);
    onChange({ amenities: copy });
  };

  return (
    <div id="section-descriptions" className="p-6 rounded-2xl bg-white border border-[rgba(7,26,40,0.08)] shadow-xs space-y-6">
      <div className="flex items-center justify-between pb-3 border-b border-[rgba(7,26,40,0.06)]">
        <div>
          <h2 className="text-sm font-bold text-[#071a28]">3. Key Highlights & Infrastructure Amenities</h2>
          <p className="text-xs text-[#647581] mt-0.5">
            Key selling propositions, zoning certifications, and physical on-ground utilities.
          </p>
        </div>
      </div>

      {/* 1. Highlights */}
      <div className="space-y-3">
        <label className="block text-xs font-bold text-[#071a28]">
          Township Highlights ({highlights.length})
        </label>

        <div className="flex items-center gap-2">
          <input
            type="text"
            value={newHighlight}
            onChange={(e) => setNewHighlight(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addHighlight();
              }
            }}
            placeholder="e.g. JDA Approved 90A Patta with 60ft arterial road frontage"
            className="flex-1 p-2.5 rounded-xl border border-[rgba(7,26,40,0.12)] text-xs text-[#071a28] focus:outline-none focus:border-[#087fc3]"
          />
          <button
            type="button"
            onClick={addHighlight}
            className="px-3.5 py-2.5 rounded-xl bg-[#071a28] text-white text-xs font-semibold hover:bg-[#0a6ba3] transition-colors shrink-0 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 inline mr-1" />
            Add
          </button>
        </div>

        {highlights.length === 0 ? (
          <p className="text-[11px] text-[#647581] italic">No highlights added yet.</p>
        ) : (
          <div className="space-y-2">
            {highlights.map((h, idx) => {
              const highlightText = typeof h === "string" ? h : (h as any)?.name || (h as any)?.title || String(h || "");
              return (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-[#f7f5ef]/40 border border-[rgba(7,26,40,0.06)] text-xs"
                >
                  <div className="flex items-center gap-2 flex-1 pr-2">
                    <span className="w-5 h-5 rounded-full bg-[#eaf5fa] text-[#087fc3] text-[10px] font-bold flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <span className="text-[#071a28]">{highlightText}</span>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => moveHighlight(idx, -1)}
                      disabled={idx === 0}
                      aria-label="Move item up"
                      className="p-1 text-[#647581] hover:text-[#071a28] disabled:opacity-30 cursor-pointer"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => moveHighlight(idx, 1)}
                      disabled={idx === highlights.length - 1}
                      aria-label="Move item down"
                      className="p-1 text-[#647581] hover:text-[#071a28] disabled:opacity-30 cursor-pointer"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => removeHighlight(idx)}
                      aria-label="Remove item"
                      className="p-1 text-rose-500 hover:text-rose-700 cursor-pointer ml-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 2. Amenities */}
      <div className="space-y-3 pt-3 border-t border-[rgba(7,26,40,0.06)]">
        <label className="block text-xs font-bold text-[#071a28]">
          On-Ground Amenities ({amenities.length})
        </label>

        <div className="flex items-center gap-2">
          <input
            type="text"
            value={newAmenity}
            onChange={(e) => setNewAmenity(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addAmenity();
              }
            }}
            placeholder="e.g. Underground Electrification, Gated Boundary, 40ft Bitumen Roads"
            className="flex-1 p-2.5 rounded-xl border border-[rgba(7,26,40,0.12)] text-xs text-[#071a28] focus:outline-none focus:border-[#087fc3]"
          />
          <button
            type="button"
            onClick={addAmenity}
            className="px-3.5 py-2.5 rounded-xl bg-[#071a28] text-white text-xs font-semibold hover:bg-[#0a6ba3] transition-colors shrink-0 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 inline mr-1" />
            Add
          </button>
        </div>

        {amenities.length === 0 ? (
          <p className="text-[11px] text-[#647581] italic">No amenities added yet.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {amenities.map((a, idx) => {
              const amenityText = typeof a === "string" ? a : (a as any)?.name || (a as any)?.title || String(a || "");
              return (
                <div
                  key={idx}
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#eaf5fa] text-[#071a28] text-xs border border-[#42b7e8]/30"
                >
                  <span>{amenityText}</span>
                  <button
                    type="button"
                    onClick={() => removeAmenity(idx)}
                    aria-label={`Remove ${amenityText}`}
                    className="text-[#647581] hover:text-rose-600 cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

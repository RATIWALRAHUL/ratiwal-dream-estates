"use client";

import { useState } from "react";
import {
  Layers,
  Plus,
  Trash2,
  ChevronUp,
  ChevronDown,
  Sparkles,
  Edit2,
  Save,
  X,
  Compass,
} from "lucide-react";
import { normalizeSlug } from "@/lib/utils/slug";
import type { IMicroMarket } from "@/types/database";

interface MicroMarketsSectionProps {
  microMarkets: IMicroMarket[];
  onChange: (fields: Record<string, any>) => void;
}

export function MicroMarketsSection({
  microMarkets = [],
  onChange,
}: MicroMarketsSectionProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  const [formData, setFormData] = useState<Partial<IMicroMarket>>({
    name: "",
    slug: "",
    tagline: "",
    description: "",
    propertyTypes: ["RESIDENTIAL_PLOT"],
    highlights: [],
    marketType: "RESIDENTIAL_CORRIDOR",
    featured: false,
    isPublic: true,
    sourceReferences: [],
  });

  const [highlightInput, setHighlightInput] = useState("");
  const [sourceInput, setSourceInput] = useState("");

  const handleMove = (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= microMarkets.length) return;

    const list = [...microMarkets];
    const temp = list[index];
    list[index] = list[targetIndex];
    list[targetIndex] = temp;

    // update sort orders
    list.forEach((m, idx) => {
      m.sortOrder = idx;
    });

    onChange({ microMarkets: list });
  };

  const handleDelete = (index: number) => {
    const list = microMarkets.filter((_, idx) => idx !== index);
    onChange({ microMarkets: list });
  };

  const handleStartEdit = (index: number) => {
    const mm = microMarkets[index];
    setFormData({
      ...mm,
    });
    setEditingId(mm._id?.toString() || `idx-${index}`);
    setIsAdding(false);
  };

  const handleSave = () => {
    if (!formData.name?.trim() || !formData.description?.trim()) return;

    const targetSlug = formData.slug || normalizeSlug(formData.name);
    const itemData: IMicroMarket = {
      ...formData,
      name: formData.name.trim(),
      slug: targetSlug,
      description: formData.description.trim(),
      propertyTypes: formData.propertyTypes || [],
      highlights: formData.highlights || [],
      sourceReferences: formData.sourceReferences || [],
    } as IMicroMarket;

    let list = [...microMarkets];
    if (isAdding) {
      list.push({ ...itemData, sortOrder: list.length });
    } else if (editingId) {
      list = list.map((m, idx) =>
        (m._id?.toString() === editingId || `idx-${idx}` === editingId) ? itemData : m
      );
    }

    onChange({ microMarkets: list });
    setIsAdding(false);
    setEditingId(null);
    setFormData({
      name: "",
      slug: "",
      tagline: "",
      description: "",
      propertyTypes: ["RESIDENTIAL_PLOT"],
      highlights: [],
      marketType: "RESIDENTIAL_CORRIDOR",
      featured: false,
      isPublic: true,
      sourceReferences: [],
    });
  };

  const addHighlight = () => {
    if (!highlightInput.trim()) return;
    setFormData((prev) => ({
      ...prev,
      highlights: [...(prev.highlights || []), highlightInput.trim()],
    }));
    setHighlightInput("");
  };

  const removeHighlight = (idx: number) => {
    setFormData((prev) => ({
      ...prev,
      highlights: prev.highlights?.filter((_, i) => i !== idx) || [],
    }));
  };

  const addSource = () => {
    if (!sourceInput.trim()) return;
    setFormData((prev) => ({
      ...prev,
      sourceReferences: [...(prev.sourceReferences || []), sourceInput.trim()],
    }));
    setSourceInput("");
  };

  const removeSource = (idx: number) => {
    setFormData((prev) => ({
      ...prev,
      sourceReferences: prev.sourceReferences?.filter((_, i) => i !== idx) || [],
    }));
  };

  return (
    <section className="p-6 sm:p-8 rounded-3xl bg-white border border-[rgba(7,26,40,0.08)] shadow-[0_4px_24px_rgba(7,26,40,0.04)] space-y-6">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div>
          <h2 className="text-base font-bold text-[#071a28] font-body flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#087fc3]" />
            <span>5. Micro-Market Nodes &amp; Sub-Corridors</span>
          </h2>
          <p className="text-xs text-[#647581] mt-0.5 font-body">
            Structure individual growth belts, industrial nodes, and plotted clusters within this location.
          </p>
        </div>

        {!isAdding && !editingId && (
          <button
            type="button"
            onClick={() => {
              setIsAdding(true);
              setEditingId(null);
              setFormData({
                name: "",
                slug: "",
                tagline: "",
                description: "",
                propertyTypes: ["RESIDENTIAL_PLOT"],
                highlights: [],
                marketType: "RESIDENTIAL_CORRIDOR",
                featured: false,
                isPublic: true,
                sourceReferences: [],
              });
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#087fc3] text-white text-xs font-semibold hover:bg-[#0a6ba3] transition-colors shadow-2xs font-body"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Micro-Market</span>
          </button>
        )}
      </div>

      {/* Adding / Editing Modal / Form */}
      {(isAdding || editingId) && (
        <div className="p-5 sm:p-6 rounded-2xl bg-[#f7f5ef]/70 border border-[#087fc3]/25 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#071a28] font-body">
              {isAdding ? "Add New Micro-Market Node" : "Edit Micro-Market Node"}
            </h3>
            <button
              type="button"
              onClick={() => {
                setIsAdding(false);
                setEditingId(null);
              }}
              className="p-1 rounded-lg text-[#647581] hover:text-[#071a28]"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#071a28] mb-1 font-body">
                Node Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.name || ""}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    name: e.target.value,
                    slug: prev.slug || normalizeSlug(e.target.value),
                  }))
                }
                placeholder="e.g. Bagru Industrial & Logistics Belt"
                className="w-full text-xs p-2.5 rounded-xl border border-[rgba(7,26,40,0.15)] bg-white font-body shadow-2xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#071a28] mb-1 font-body">
                Node Slug
              </label>
              <input
                type="text"
                value={formData.slug || ""}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    slug: normalizeSlug(e.target.value),
                  }))
                }
                placeholder="bagru-industrial-belt"
                className="w-full text-xs p-2.5 rounded-xl border border-[rgba(7,26,40,0.15)] bg-white font-mono shadow-2xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#071a28] mb-1 font-body">
                Market Classification
              </label>
              <select
                value={formData.marketType || "RESIDENTIAL_CORRIDOR"}
                onChange={(e) => setFormData((prev) => ({ ...prev, marketType: e.target.value as any }))}
                className="w-full text-xs p-2.5 rounded-xl border border-[rgba(7,26,40,0.15)] bg-white font-body shadow-2xs"
              >
                <option value="RESIDENTIAL_CORRIDOR">Residential Corridor</option>
                <option value="COMMERCIAL_HUB">Commercial Hub</option>
                <option value="INDUSTRIAL_BELT">Industrial Belt</option>
                <option value="AIRPORT_CORRIDOR">Airport Corridor</option>
                <option value="HIGHWAY_CORRIDOR">Highway Corridor</option>
                <option value="TOWNSHIP_CLUSTER">Township Cluster</option>
                <option value="MIXED_USE">Mixed Use</option>
                <option value="OTHER">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#071a28] mb-1 font-body">
                Tagline / Focus
              </label>
              <input
                type="text"
                value={formData.tagline || ""}
                onChange={(e) => setFormData((prev) => ({ ...prev, tagline: e.target.value }))}
                placeholder="e.g. Riico Approved Plotted & Logistics Zone"
                className="w-full text-xs p-2.5 rounded-xl border border-[rgba(7,26,40,0.15)] bg-white font-body shadow-2xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#071a28] mb-1 font-body">
              Description <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={2}
              value={formData.description || ""}
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              placeholder="High-density employment node with direct expressway ramps, master-planned power sub-stations, and RERA residential clusters..."
              className="w-full text-xs p-2.5 rounded-xl border border-[rgba(7,26,40,0.15)] bg-white font-body shadow-2xs"
            />
          </div>

          {/* Highlights Tag List */}
          <div>
            <label className="block text-xs font-semibold text-[#071a28] mb-1 font-body">
              Key Highlights &amp; Catalysts
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={highlightInput}
                onChange={(e) => setHighlightInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addHighlight();
                  }
                }}
                placeholder="e.g. 60-meter wide arterial masterplan road"
                className="flex-1 text-xs p-2 rounded-xl border border-[rgba(7,26,40,0.15)] bg-white font-body"
              />
              <button
                type="button"
                onClick={addHighlight}
                className="px-3 py-2 rounded-xl bg-slate-100 text-[#071a28] text-xs font-semibold hover:bg-slate-200"
              >
                Add
              </button>
            </div>
            {formData.highlights && formData.highlights.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {formData.highlights.map((h, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-lg bg-white border border-[rgba(7,26,40,0.1)] text-[#071a28]"
                  >
                    <span>{h}</span>
                    <button
                      type="button"
                      onClick={() => removeHighlight(i)}
                      className="text-slate-400 hover:text-rose-600"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Sourcing Citations */}
          <div>
            <label className="block text-xs font-semibold text-[#071a28] mb-1 font-body">
              Source Citations &amp; Verification References
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={sourceInput}
                onChange={(e) => setSourceInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addSource();
                  }
                }}
                placeholder="e.g. JDA Master Plan 2025, Sector 12 Zonal Gazette"
                className="flex-1 text-xs p-2 rounded-xl border border-[rgba(7,26,40,0.15)] bg-white font-body"
              />
              <button
                type="button"
                onClick={addSource}
                className="px-3 py-2 rounded-xl bg-slate-100 text-[#071a28] text-xs font-semibold hover:bg-slate-200"
              >
                Add
              </button>
            </div>
            {formData.sourceReferences && formData.sourceReferences.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {formData.sourceReferences.map((s, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-lg bg-white border border-emerald-200 text-emerald-800"
                  >
                    <span>{s}</span>
                    <button
                      type="button"
                      onClick={() => removeSource(i)}
                      className="text-emerald-400 hover:text-rose-600"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-[rgba(7,26,40,0.08)]">
            <button
              type="button"
              onClick={() => {
                setIsAdding(false);
                setEditingId(null);
              }}
              className="px-4 py-2 rounded-xl border border-[rgba(7,26,40,0.1)] text-xs font-semibold text-[#071a28] hover:bg-white"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={!formData.name || !formData.description}
              className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-[#087fc3] text-white text-xs font-semibold hover:bg-[#0a6ba3] disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Micro-Market</span>
            </button>
          </div>
        </div>
      )}

      {/* List of Micro-Markets with Accessible Up/Down Reordering */}
      {microMarkets.length === 0 ? (
        <div className="p-8 rounded-2xl bg-[#f7f5ef]/40 border border-dashed border-[rgba(7,26,40,0.1)] text-center">
          <Compass className="w-8 h-8 text-[#647581]/40 mx-auto mb-2" />
          <p className="text-xs font-bold text-[#071a28]">No micro-markets configured yet</p>
          <p className="text-xs text-[#647581] mt-0.5">
            Add key growth corridors, industrial nodes, or commercial sub-zones for detailed buyer guidance.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {microMarkets.map((mm, idx) => (
            <div
              key={mm._id?.toString() || idx}
              className="p-4 rounded-2xl bg-white border border-[rgba(7,26,40,0.08)] shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-[#087fc3]/30 transition-colors"
            >
              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono font-bold text-[#647581] px-1.5 py-0.5 bg-slate-100 rounded">
                    #{idx + 1}
                  </span>
                  <h4 className="text-sm font-bold text-[#071a28] font-body truncate">{mm.name}</h4>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#eaf5fa] text-[#087fc3] font-semibold">
                    {mm.marketType || "CORRIDOR"}
                  </span>
                </div>
                <p className="text-xs text-[#647581] line-clamp-1 font-body">{mm.description}</p>
                {mm.sourceReferences && mm.sourceReferences.length > 0 && (
                  <p className="text-[10px] font-mono text-emerald-700">
                    Source: {mm.sourceReferences.join(", ")}
                  </p>
                )}
              </div>

              {/* Action and Reorder Buttons */}
              <div className="flex items-center gap-1 self-end sm:self-center shrink-0">
                <button
                  type="button"
                  onClick={() => handleMove(idx, "up")}
                  disabled={idx === 0}
                  className="p-1.5 rounded-lg border border-[rgba(7,26,40,0.1)] text-[#647581] hover:text-[#071a28] hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed"
                  title="Move Up"
                  aria-label={`Move ${mm.name} up`}
                >
                  <ChevronUp className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleMove(idx, "down")}
                  disabled={idx === microMarkets.length - 1}
                  className="p-1.5 rounded-lg border border-[rgba(7,26,40,0.1)] text-[#647581] hover:text-[#071a28] hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed"
                  title="Move Down"
                  aria-label={`Move ${mm.name} down`}
                >
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>

                <button
                  type="button"
                  onClick={() => handleStartEdit(idx)}
                  className="p-1.5 rounded-lg border border-[rgba(7,26,40,0.1)] text-[#087fc3] hover:bg-[#eaf5fa]"
                  title="Edit Node"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>

                <button
                  type="button"
                  onClick={() => handleDelete(idx)}
                  className="p-1.5 rounded-lg border border-[rgba(7,26,40,0.1)] text-rose-600 hover:bg-rose-50"
                  title="Remove Node"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

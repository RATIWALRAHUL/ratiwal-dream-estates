"use client";

import { useState } from "react";
import { Building, Plus, Trash2, Edit2, Save, X, ExternalLink } from "lucide-react";
import type { IInfrastructureMilestone } from "@/types/database";

interface InfrastructureSectionProps {
  infrastructureHighlights: IInfrastructureMilestone[];
  onChange: (fields: Record<string, any>) => void;
}

export function InfrastructureSection({
  infrastructureHighlights = [],
  onChange,
}: InfrastructureSectionProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  const [formData, setFormData] = useState<Partial<IInfrastructureMilestone>>({
    name: "",
    category: "Highway / Expressway",
    status: "OPERATIONAL",
    description: "",
    distanceKm: undefined,
    expectedCompletionDate: "",
    source: "",
    sourceUrl: "",
    isPublic: true,
  });

  const handleDelete = (index: number) => {
    const list = infrastructureHighlights.filter((_, idx) => idx !== index);
    onChange({ infrastructureHighlights: list });
  };

  const handleStartEdit = (index: number) => {
    const item = infrastructureHighlights[index];
    setFormData({ ...item });
    setEditingId(item._id?.toString() || `idx-${index}`);
    setIsAdding(false);
  };

  const handleSave = () => {
    if (!formData.name?.trim() || !formData.category?.trim() || !formData.source?.trim()) return;

    const itemData: IInfrastructureMilestone = {
      ...formData,
      name: formData.name.trim(),
      category: formData.category.trim(),
      status: formData.status || "OPERATIONAL",
      description: formData.description?.trim() || "",
      source: formData.source.trim(),
      sourceUrl: formData.sourceUrl?.trim() || undefined,
      lastVerifiedAt: new Date(),
    } as IInfrastructureMilestone;

    let list = [...infrastructureHighlights];
    if (isAdding) {
      list.push({ ...itemData, sortOrder: list.length });
    } else if (editingId) {
      list = list.map((item, idx) =>
        (item._id?.toString() === editingId || `idx-${idx}` === editingId) ? itemData : item
      );
    }

    onChange({ infrastructureHighlights: list });
    setIsAdding(false);
    setEditingId(null);
    setFormData({
      name: "",
      category: "Highway / Expressway",
      status: "OPERATIONAL",
      description: "",
      distanceKm: undefined,
      expectedCompletionDate: "",
      source: "",
      sourceUrl: "",
      isPublic: true,
    });
  };

  return (
    <section className="p-6 sm:p-8 rounded-3xl bg-white border border-[rgba(7,26,40,0.08)] shadow-[0_4px_24px_rgba(7,26,40,0.04)] space-y-6">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div>
          <h2 className="text-base font-bold text-[#071a28] font-body flex items-center gap-2">
            <Building className="w-4 h-4 text-[#087fc3]" />
            <span>6. Infrastructure Milestones &amp; Civic Projects</span>
          </h2>
          <p className="text-xs text-[#647581] mt-0.5 font-body">
            Official infrastructure records, expressway connectivity, industrial corridors, and verified government sources.
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
                category: "Highway / Expressway",
                status: "OPERATIONAL",
                description: "",
                distanceKm: undefined,
                expectedCompletionDate: "",
                source: "",
                sourceUrl: "",
                isPublic: true,
              });
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#087fc3] text-white text-xs font-semibold hover:bg-[#0a6ba3] transition-colors shadow-2xs font-body"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Infrastructure</span>
          </button>
        )}
      </div>

      {/* Form */}
      {(isAdding || editingId) && (
        <div className="p-5 sm:p-6 rounded-2xl bg-[#f7f5ef]/70 border border-[#087fc3]/25 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#071a28] font-body">
              {isAdding ? "Add Infrastructure Record" : "Edit Infrastructure Record"}
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

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-[#071a28] mb-1 font-body">
                Project Title <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.name || ""}
                onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="e.g. Ring Road Phase-2 6-Lane Expressway"
                className="w-full text-xs p-2.5 rounded-xl border border-[rgba(7,26,40,0.15)] bg-white font-body shadow-2xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#071a28] mb-1 font-body">
                Category <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.category || ""}
                onChange={(e) => setFormData((prev) => ({ ...prev, category: e.target.value }))}
                placeholder="e.g. Ring Road, Metro, SEZ, Airport"
                className="w-full text-xs p-2.5 rounded-xl border border-[rgba(7,26,40,0.15)] bg-white font-body shadow-2xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#071a28] mb-1 font-body">
                Execution Status <span className="text-rose-500">*</span>
              </label>
              <select
                value={formData.status || "OPERATIONAL"}
                onChange={(e) => setFormData((prev) => ({ ...prev, status: e.target.value }))}
                className="w-full text-xs p-2.5 rounded-xl border border-[rgba(7,26,40,0.15)] bg-white font-body shadow-2xs"
              >
                <option value="OPERATIONAL">Operational / Live</option>
                <option value="UNDER_CONSTRUCTION">Under Construction</option>
                <option value="APPROVED">Approved / Sanctioned</option>
                <option value="PROPOSED">Proposed</option>
                <option value="DELAYED">Delayed</option>
                <option value="UNKNOWN">Unknown</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#071a28] mb-1 font-body">
                Distance to Corridor (km)
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                value={formData.distanceKm ?? ""}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    distanceKm: e.target.value === "" ? undefined : parseFloat(e.target.value),
                  }))
                }
                placeholder="e.g. 2.5"
                className="w-full text-xs p-2.5 rounded-xl border border-[rgba(7,26,40,0.15)] bg-white font-mono shadow-2xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#071a28] mb-1 font-body">
                Expected Completion Date
              </label>
              <input
                type="text"
                value={formData.expectedCompletionDate || ""}
                onChange={(e) => setFormData((prev) => ({ ...prev, expectedCompletionDate: e.target.value }))}
                placeholder="e.g. Q4 2026 (Operational)"
                className="w-full text-xs p-2.5 rounded-xl border border-[rgba(7,26,40,0.15)] bg-white font-body shadow-2xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#071a28] mb-1 font-body">
              Project Description
            </label>
            <textarea
              rows={2}
              value={formData.description || ""}
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              placeholder="High-speed transport link connecting Western and Southern industrial corridors..."
              className="w-full text-xs p-2.5 rounded-xl border border-[rgba(7,26,40,0.15)] bg-white font-body shadow-2xs"
            />
          </div>

          {/* Sourcing */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#071a28] mb-1 font-body">
                Official Source Name (Required for Public Visibility) <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.source || ""}
                onChange={(e) => setFormData((prev) => ({ ...prev, source: e.target.value }))}
                placeholder="e.g. NHAI Gazette / JDA Notification"
                className="w-full text-xs p-2.5 rounded-xl border border-[rgba(7,26,40,0.15)] bg-white font-body shadow-2xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#071a28] mb-1 font-body">
                Official Source URL (Optional)
              </label>
              <input
                type="url"
                value={formData.sourceUrl || ""}
                onChange={(e) => setFormData((prev) => ({ ...prev, sourceUrl: e.target.value }))}
                placeholder="https://jda.urban.rajasthan.gov.in/masterplan"
                className="w-full text-xs p-2.5 rounded-xl border border-[rgba(7,26,40,0.15)] bg-white font-mono shadow-2xs"
              />
            </div>
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
              disabled={!formData.name || !formData.source}
              className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-[#087fc3] text-white text-xs font-semibold hover:bg-[#0a6ba3] disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Record</span>
            </button>
          </div>
        </div>
      )}

      {/* List of Infrastructure */}
      {infrastructureHighlights.length === 0 ? (
        <div className="p-8 rounded-2xl bg-[#f7f5ef]/40 border border-dashed border-[rgba(7,26,40,0.1)] text-center">
          <Building className="w-8 h-8 text-[#647581]/40 mx-auto mb-2" />
          <p className="text-xs font-bold text-[#071a28]">No infrastructure records added yet</p>
          <p className="text-xs text-[#647581] mt-0.5">
            Add highways, metro routes, ring roads, and SEZ zones with official government source citations.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {infrastructureHighlights.map((item, idx) => (
            <div
              key={item._id?.toString() || idx}
              className="p-4 rounded-2xl bg-white border border-[rgba(7,26,40,0.08)] shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-[#087fc3]/30 transition-colors"
            >
              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-[#071a28] font-body truncate">{item.name}</h4>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold uppercase">
                    {item.status}
                  </span>
                  <span className="text-[10px] font-mono text-[#647581]">{item.category}</span>
                </div>
                <p className="text-xs text-[#647581] line-clamp-1 font-body">{item.description}</p>
                <div className="flex items-center gap-3 text-[10px] font-mono text-[#647581]">
                  <span>Source: {item.source}</span>
                  {item.sourceUrl && (
                    <a
                      href={item.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#087fc3] hover:underline inline-flex items-center gap-0.5"
                    >
                      <span>Verified link</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-1 self-end sm:self-center shrink-0">
                <button
                  type="button"
                  onClick={() => handleStartEdit(idx)}
                  className="p-1.5 rounded-lg border border-[rgba(7,26,40,0.1)] text-[#087fc3] hover:bg-[#eaf5fa]"
                  title="Edit Record"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(idx)}
                  className="p-1.5 rounded-lg border border-[rgba(7,26,40,0.1)] text-rose-600 hover:bg-rose-50"
                  title="Remove Record"
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

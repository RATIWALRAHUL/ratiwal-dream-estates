"use client";

import { useState } from "react";
import { Navigation, Plus, Trash2, Edit2, Save, X, Clock } from "lucide-react";
import type { IConnectivityMilestone } from "@/types/database";

interface ConnectivitySectionProps {
  connectivityHighlights: IConnectivityMilestone[];
  onChange: (fields: Record<string, any>) => void;
}

export function ConnectivitySection({
  connectivityHighlights = [],
  onChange,
}: ConnectivitySectionProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  const [formData, setFormData] = useState<Partial<IConnectivityMilestone>>({
    destination: "",
    destinationCategory: "Airport / Transport",
    distanceKm: 15,
    approxTravelTime: "25 mins",
    travelMode: "Signal-Free Expressway",
    route: "Ajmer Road 6-Lane Expressway",
    supportingNote: "",
    source: "",
    isPublic: true,
  });

  const handleDelete = (index: number) => {
    const list = connectivityHighlights.filter((_, idx) => idx !== index);
    onChange({ connectivityHighlights: list });
  };

  const handleStartEdit = (index: number) => {
    const item = connectivityHighlights[index];
    setFormData({ ...item });
    setEditingId(item._id?.toString() || `idx-${index}`);
    setIsAdding(false);
  };

  const handleSave = () => {
    if (!formData.destination?.trim() || formData.distanceKm === undefined || !formData.approxTravelTime?.trim()) return;

    const itemData: IConnectivityMilestone = {
      ...formData,
      destination: formData.destination.trim(),
      distanceKm: formData.distanceKm,
      approxTravelTime: formData.approxTravelTime.trim(),
      travelMode: formData.travelMode?.trim() || "Expressway",
      route: formData.route?.trim() || "Main Corridor",
      supportingNote: formData.supportingNote?.trim(),
      source: formData.source?.trim(),
      lastVerifiedAt: new Date(),
    } as IConnectivityMilestone;

    let list = [...connectivityHighlights];
    if (isAdding) {
      list.push({ ...itemData, sortOrder: list.length });
    } else if (editingId) {
      list = list.map((item, idx) =>
        (item._id?.toString() === editingId || `idx-${idx}` === editingId) ? itemData : item
      );
    }

    onChange({ connectivityHighlights: list });
    setIsAdding(false);
    setEditingId(null);
    setFormData({
      destination: "",
      destinationCategory: "Airport / Transport",
      distanceKm: 15,
      approxTravelTime: "25 mins",
      travelMode: "Signal-Free Expressway",
      route: "Ajmer Road 6-Lane Expressway",
      supportingNote: "",
      source: "",
      isPublic: true,
    });
  };

  return (
    <section className="p-6 sm:p-8 rounded-3xl bg-white border border-[rgba(7,26,40,0.08)] shadow-[0_4px_24px_rgba(7,26,40,0.04)] space-y-6">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div>
          <h2 className="text-base font-bold text-[#071a28] font-body flex items-center gap-2">
            <Navigation className="w-4 h-4 text-[#087fc3]" />
            <span>7. Connectivity Milestones &amp; Travel Proximity</span>
          </h2>
          <p className="text-xs text-[#647581] mt-0.5 font-body">
            Accurate transit times to key business districts, airports, railways, and arterial junctions.
          </p>
        </div>

        {!isAdding && !editingId && (
          <button
            type="button"
            onClick={() => {
              setIsAdding(true);
              setEditingId(null);
              setFormData({
                destination: "",
                destinationCategory: "Airport / Transport",
                distanceKm: 15,
                approxTravelTime: "25 mins",
                travelMode: "Signal-Free Expressway",
                route: "Ajmer Road 6-Lane Expressway",
                supportingNote: "",
                source: "",
                isPublic: true,
              });
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#087fc3] text-white text-xs font-semibold hover:bg-[#0a6ba3] transition-colors shadow-2xs font-body"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Connectivity</span>
          </button>
        )}
      </div>

      {/* Form */}
      {(isAdding || editingId) && (
        <div className="p-5 sm:p-6 rounded-2xl bg-[#f7f5ef]/70 border border-[#087fc3]/25 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#071a28] font-body">
              {isAdding ? "Add Connectivity Milestone" : "Edit Connectivity Milestone"}
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
                Destination Landmark <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.destination || ""}
                onChange={(e) => setFormData((prev) => ({ ...prev, destination: e.target.value }))}
                placeholder="e.g. Jaipur International Airport (JAI)"
                className="w-full text-xs p-2.5 rounded-xl border border-[rgba(7,26,40,0.15)] bg-white font-body shadow-2xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#071a28] mb-1 font-body">
                Destination Category
              </label>
              <input
                type="text"
                value={formData.destinationCategory || ""}
                onChange={(e) => setFormData((prev) => ({ ...prev, destinationCategory: e.target.value }))}
                placeholder="e.g. Airport, Metro Hub, Railway"
                className="w-full text-xs p-2.5 rounded-xl border border-[rgba(7,26,40,0.15)] bg-white font-body shadow-2xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#071a28] mb-1 font-body">
                Distance (km) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                required
                value={formData.distanceKm ?? ""}
                onChange={(e) => setFormData((prev) => ({ ...prev, distanceKm: parseFloat(e.target.value) || 0 }))}
                placeholder="15.0"
                className="w-full text-xs p-2.5 rounded-xl border border-[rgba(7,26,40,0.15)] bg-white font-mono shadow-2xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#071a28] mb-1 font-body">
                Approx Travel Time <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.approxTravelTime || ""}
                onChange={(e) => setFormData((prev) => ({ ...prev, approxTravelTime: e.target.value }))}
                placeholder="e.g. 25 mins (Peak Hours)"
                className="w-full text-xs p-2.5 rounded-xl border border-[rgba(7,26,40,0.15)] bg-white font-body shadow-2xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#071a28] mb-1 font-body">
                Travel Mode / Transit <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.travelMode || ""}
                onChange={(e) => setFormData((prev) => ({ ...prev, travelMode: e.target.value }))}
                placeholder="e.g. Signal-Free Expressway / Car"
                className="w-full text-xs p-2.5 rounded-xl border border-[rgba(7,26,40,0.15)] bg-white font-body shadow-2xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#071a28] mb-1 font-body">
                Route / Expressway Corridor <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.route || ""}
                onChange={(e) => setFormData((prev) => ({ ...prev, route: e.target.value }))}
                placeholder="e.g. Ajmer Road 6-Lane Expressway to Ring Road"
                className="w-full text-xs p-2.5 rounded-xl border border-[rgba(7,26,40,0.15)] bg-white font-body shadow-2xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#071a28] mb-1 font-body">
                Supporting Verification Source / Route Context
              </label>
              <input
                type="text"
                value={formData.source || ""}
                onChange={(e) => setFormData((prev) => ({ ...prev, source: e.target.value }))}
                placeholder="e.g. Google Maps Speed & Distance Survey Q1 2026"
                className="w-full text-xs p-2.5 rounded-xl border border-[rgba(7,26,40,0.15)] bg-white font-body shadow-2xs"
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
              disabled={!formData.destination || !formData.approxTravelTime}
              className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-[#087fc3] text-white text-xs font-semibold hover:bg-[#0a6ba3] disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Milestone</span>
            </button>
          </div>
        </div>
      )}

      {/* List of Connectivity */}
      {connectivityHighlights.length === 0 ? (
        <div className="p-8 rounded-2xl bg-[#f7f5ef]/40 border border-dashed border-[rgba(7,26,40,0.1)] text-center">
          <Clock className="w-8 h-8 text-[#647581]/40 mx-auto mb-2" />
          <p className="text-xs font-bold text-[#071a28]">No connectivity milestones configured</p>
          <p className="text-xs text-[#647581] mt-0.5">
            Add accurate transit times to airports, commercial hubs, metro routes, and expressway exits.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {connectivityHighlights.map((item, idx) => (
            <div
              key={item._id?.toString() || idx}
              className="p-4 rounded-2xl bg-white border border-[rgba(7,26,40,0.08)] shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-[#087fc3]/30 transition-colors"
            >
              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-[#071a28] font-body truncate">{item.destination}</h4>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#eaf5fa] text-[#087fc3] font-bold">
                    {item.distanceKm} km
                  </span>
                  <span className="text-[10px] font-mono font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    ⏱ {item.approxTravelTime}
                  </span>
                </div>
                <p className="text-xs text-[#647581] font-body">
                  Via {item.route} ({item.travelMode})
                </p>
                {item.source && (
                  <p className="text-[10px] font-mono text-[#647581]">
                    Verified Source: {item.source}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-1 self-end sm:self-center shrink-0">
                <button
                  type="button"
                  onClick={() => handleStartEdit(idx)}
                  className="p-1.5 rounded-lg border border-[rgba(7,26,40,0.1)] text-[#087fc3] hover:bg-[#eaf5fa]"
                  title="Edit Milestone"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(idx)}
                  className="p-1.5 rounded-lg border border-[rgba(7,26,40,0.1)] text-rose-600 hover:bg-rose-50"
                  title="Remove Milestone"
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

"use client";

import { useState } from "react";
import { Plus, Trash2, ArrowUp, ArrowDown, MapPin, Clock } from "lucide-react";

export type TransportMode = "DRIVE" | "METRO" | "AIRPORT" | "TRAIN" | "WALK" | "HIGHWAY";
export type MilestoneStatus = "OPERATIONAL" | "UNDER_CONSTRUCTION" | "APPROVED" | "PROPOSED";

interface ConnectivityMilestone {
  destination: string;
  travelTimeMinutes: number;
  distanceKm?: number;
  transportMode: TransportMode;
  note?: string;
  sortOrder: number;
}

interface InfrastructureMilestone {
  title: string;
  description?: string;
  status: MilestoneStatus;
  completionYear?: number;
  sortOrder: number;
}

interface MilestonesSectionProps {
  connectivity: ConnectivityMilestone[];
  infrastructure: InfrastructureMilestone[];
  onChange: (fields: {
    connectivityMilestones?: ConnectivityMilestone[];
    infrastructureMilestones?: InfrastructureMilestone[];
  }) => void;
}

export function MilestonesSection({
  connectivity,
  infrastructure,
  onChange,
}: MilestonesSectionProps) {
  // New connectivity input state
  const [newDest, setNewDest] = useState("");
  const [newTime, setNewTime] = useState(15);
  const [newDist, setNewDist] = useState(10);
  const [newMode, setNewMode] = useState<TransportMode>("DRIVE");
  const [newNote, setNewNote] = useState("");

  // New infra input state
  const [newInfraTitle, setNewInfraTitle] = useState("");
  const [newInfraDesc, setNewInfraDesc] = useState("");
  const [newInfraStatus, setNewInfraStatus] = useState<MilestoneStatus>("OPERATIONAL");
  const [newInfraYear, setNewInfraYear] = useState<number>(2025);

  const addConnectivity = () => {
    if (!newDest.trim()) return;
    const item: ConnectivityMilestone = {
      destination: newDest.trim(),
      travelTimeMinutes: Number(newTime) || 15,
      distanceKm: Number(newDist) || undefined,
      transportMode: newMode,
      note: newNote.trim() || undefined,
      sortOrder: connectivity.length,
    };
    onChange({ connectivityMilestones: [...connectivity, item] });
    setNewDest("");
    setNewNote("");
  };

  const removeConnectivity = (idx: number) => {
    onChange({ connectivityMilestones: connectivity.filter((_, i) => i !== idx) });
  };

  const moveConnectivity = (idx: number, dir: -1 | 1) => {
    const targetIdx = idx + dir;
    if (targetIdx < 0 || targetIdx >= connectivity.length) return;
    const copy = [...connectivity];
    const item = copy.splice(idx, 1)[0];
    copy.splice(targetIdx, 0, item);
    onChange({ connectivityMilestones: copy });
  };

  const addInfrastructure = () => {
    if (!newInfraTitle.trim()) return;
    const item: InfrastructureMilestone = {
      title: newInfraTitle.trim(),
      description: newInfraDesc.trim() || undefined,
      status: newInfraStatus,
      completionYear: Number(newInfraYear) || undefined,
      sortOrder: infrastructure.length,
    };
    onChange({ infrastructureMilestones: [...infrastructure, item] });
    setNewInfraTitle("");
    setNewInfraDesc("");
  };

  const removeInfrastructure = (idx: number) => {
    onChange({ infrastructureMilestones: infrastructure.filter((_, i) => i !== idx) });
  };

  return (
    <div id="section-milestones" className="p-6 rounded-2xl bg-white border border-[rgba(7,26,40,0.08)] shadow-xs space-y-6">
      <div className="flex items-center justify-between pb-3 border-b border-[rgba(7,26,40,0.06)]">
        <div>
          <h2 className="text-sm font-bold text-[#071a28]">5. Connectivity & Infrastructure Timelines</h2>
          <p className="text-xs text-[#647581] mt-0.5">
            Key transit milestones (airports, expressways, rail) and physical development progress.
          </p>
        </div>
      </div>

      {/* 1. Connectivity Milestones */}
      <div className="space-y-4">
        <label className="block text-xs font-bold text-[#071a28]">
          Transit & Proximity Milestones ({connectivity.length})
        </label>

        <div className="p-4 rounded-xl bg-[#f7f5ef]/40 border border-[rgba(7,26,40,0.06)] space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
            <div className="sm:col-span-2">
              <label className="block text-[10px] font-mono uppercase text-[#647581] mb-1">Destination Landmark</label>
              <input
                type="text"
                value={newDest}
                onChange={(e) => setNewDest(e.target.value)}
                placeholder="e.g. Jaipur International Airport / Ring Road Interchange"
                className="w-full p-2.5 rounded-xl border border-[rgba(7,26,40,0.12)] text-xs text-[#071a28] bg-white focus:outline-none focus:border-[#087fc3]"
              />
            </div>
            <div>
              <label className="block text-[10px] font-mono uppercase text-[#647581] mb-1">Drive Time (Mins)</label>
              <input
                type="number"
                min={1}
                value={newTime}
                onChange={(e) => setNewTime(Number(e.target.value) || 1)}
                className="w-full p-2.5 rounded-xl border border-[rgba(7,26,40,0.12)] text-xs text-[#071a28] bg-white focus:outline-none focus:border-[#087fc3]"
              />
            </div>
            <div>
              <label className="block text-[10px] font-mono uppercase text-[#647581] mb-1">Distance (Km)</label>
              <input
                type="number"
                min={0.1}
                step={0.1}
                value={newDist}
                onChange={(e) => setNewDist(Number(e.target.value) || 1)}
                className="w-full p-2.5 rounded-xl border border-[rgba(7,26,40,0.12)] text-xs text-[#071a28] bg-white focus:outline-none focus:border-[#087fc3]"
              />
            </div>
          </div>

          <div className="flex items-center justify-between gap-3 pt-2">
            <input
              type="text"
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              placeholder="Supporting note (e.g. Direct signal-free access via 6-lane elevated road)"
              className="flex-1 p-2 rounded-xl border border-[rgba(7,26,40,0.12)] text-xs text-[#071a28] bg-white focus:outline-none"
            />
            <button
              type="button"
              onClick={addConnectivity}
              className="px-4 py-2 rounded-xl bg-[#071a28] text-white text-xs font-semibold hover:bg-[#0a6ba3] transition-colors cursor-pointer shrink-0"
            >
              <Plus className="w-3.5 h-3.5 inline mr-1" />
              Add Milestone
            </button>
          </div>
        </div>

        {connectivity.length > 0 && (
          <div className="space-y-2">
            {connectivity.map((c, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3 rounded-xl bg-white border border-[rgba(7,26,40,0.08)] shadow-2xs text-xs"
              >
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-[#eaf5fa] text-[#087fc3] flex items-center justify-center font-bold font-mono text-[10px]">
                    {idx + 1}
                  </div>
                  <div>
                    <p className="font-semibold text-[#071a28]">{c.destination}</p>
                    <p className="text-[11px] text-[#647581] font-mono">
                      {c.travelTimeMinutes} mins • {c.distanceKm ? `${c.distanceKm} km • ` : ""}{c.transportMode} {c.note ? `• ${c.note}` : ""}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => moveConnectivity(idx, -1)}
                    disabled={idx === 0}
                    aria-label="Move milestone up"
                    className="p-1 text-[#647581] hover:text-[#071a28] disabled:opacity-30 cursor-pointer"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => moveConnectivity(idx, 1)}
                    disabled={idx === connectivity.length - 1}
                    aria-label="Move milestone down"
                    className="p-1 text-[#647581] hover:text-[#071a28] disabled:opacity-30 cursor-pointer"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => removeConnectivity(idx)}
                    aria-label="Remove milestone"
                    className="p-1 text-rose-500 hover:text-rose-700 cursor-pointer ml-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 2. Infrastructure Milestones */}
      <div className="space-y-4 pt-4 border-t border-[rgba(7,26,40,0.06)]">
        <label className="block text-xs font-bold text-[#071a28]">
          On-Site Infrastructure Progress ({infrastructure.length})
        </label>

        <div className="p-4 rounded-xl bg-[#f7f5ef]/40 border border-[rgba(7,26,40,0.06)] space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="sm:col-span-2">
              <label className="block text-[10px] font-mono uppercase text-[#647581] mb-1">Infrastructure Item</label>
              <input
                type="text"
                value={newInfraTitle}
                onChange={(e) => setNewInfraTitle(e.target.value)}
                placeholder="e.g. 60ft Arterial Road Bitumen Laying & LED Streetlights"
                className="w-full p-2.5 rounded-xl border border-[rgba(7,26,40,0.12)] text-xs text-[#071a28] bg-white focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[10px] font-mono uppercase text-[#647581] mb-1">Status</label>
              <select
                value={newInfraStatus}
                onChange={(e) => setNewInfraStatus(e.target.value as MilestoneStatus)}
                className="w-full p-2.5 rounded-xl border border-[rgba(7,26,40,0.12)] text-xs text-[#071a28] bg-white font-medium focus:outline-none"
              >
                <option value="COMPLETED">Completed</option>
                <option value="UNDER_CONSTRUCTION">Under Construction</option>
                <option value="PROPOSED">Proposed / Planned</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between gap-3 pt-2">
            <input
              type="text"
              value={newInfraDesc}
              onChange={(e) => setNewInfraDesc(e.target.value)}
              placeholder="Description (optional)"
              className="flex-1 p-2 rounded-xl border border-[rgba(7,26,40,0.12)] text-xs text-[#071a28] bg-white focus:outline-none"
            />
            <button
              type="button"
              onClick={addInfrastructure}
              className="px-4 py-2 rounded-xl bg-[#071a28] text-white text-xs font-semibold hover:bg-[#0a6ba3] transition-colors cursor-pointer shrink-0"
            >
              <Plus className="w-3.5 h-3.5 inline mr-1" />
              Add Progress Item
            </button>
          </div>
        </div>

        {infrastructure.length > 0 && (
          <div className="space-y-2">
            {infrastructure.map((inf, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3 rounded-xl bg-white border border-[rgba(7,26,40,0.08)] shadow-2xs text-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-[#071a28]">{inf.title}</p>
                    <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-100 text-[#071a28]">
                      {inf.status}
                    </span>
                  </div>
                  {inf.description && <p className="text-[11px] text-[#647581] mt-0.5">{inf.description}</p>}
                </div>
                <button
                  type="button"
                  onClick={() => removeInfrastructure(idx)}
                  aria-label="Remove progress item"
                  className="p-1 text-rose-500 hover:text-rose-700 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

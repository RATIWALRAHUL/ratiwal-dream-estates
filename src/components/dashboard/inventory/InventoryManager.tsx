/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Layers,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  X,
} from "lucide-react";
import {
  createPlotOptionAction,
  updatePlotOptionAction,
  changePlotOptionStatusAction,
  removePlotOptionAction,
} from "@/lib/actions/inventory.actions";
import { rupeesToPaise, paiseToRupees, formatPaiseToRupeeString } from "@/lib/utils/currency";
import { sqFtToSqYards } from "@/lib/utils/area";
import type { PlotStatus } from "@/types/database";

export type FacingDirection = "NORTH" | "SOUTH" | "EAST" | "WEST" | "NORTH_EAST" | "NORTH_WEST" | "SOUTH_EAST" | "SOUTH_WEST";

interface InventoryManagerProps {
  initialData: any;
  userRole: string;
}

export function InventoryManager({ initialData, userRole }: InventoryManagerProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const { property, inventorySummary, totalPlots, items, pagination } = initialData;

  // Search & Filter State
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [statusFilter, setStatusFilter] = useState(searchParams.get("status") || "ALL");
  const [facingFilter, setFacingFilter] = useState(searchParams.get("facing") || "ALL");

  // Modals State
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalPlot, setEditModalPlot] = useState<any | null>(null);
  const [toastMessage, setToastMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Add/Edit Form State
  const [plotNumber, setPlotNumber] = useState("");
  const [label, setLabel] = useState("");
  const [areaSqFt, setAreaSqFt] = useState<number>(900);
  const [widthFt, setWidthFt] = useState<number>(30);
  const [lengthFt, setLengthFt] = useState<number>(30);
  const [facing, setFacing] = useState<FacingDirection>("EAST");
  const [isCorner, setIsCorner] = useState(false);
  const [basePriceRupees, setBasePriceRupees] = useState<string>("2850000");
  const [ratePerSqYdRupees, setRatePerSqYdRupees] = useState<string>("28500");
  const [plotStatus, setPlotStatus] = useState<PlotStatus>("AVAILABLE");
  const [publicVisibility, setPublicVisibility] = useState(true);
  const [formErrors, setFormErrors] = useState<Record<string, string[]>>({});

  const applyFilters = (overrides: Record<string, string> = {}) => {
    const params = new URLSearchParams(searchParams.toString());
    const newSearch = overrides.search !== undefined ? overrides.search : search;
    const newStatus = overrides.status !== undefined ? overrides.status : statusFilter;
    const newFacing = overrides.facing !== undefined ? overrides.facing : facingFilter;

    if (newSearch.trim()) params.set("search", newSearch.trim());
    else params.delete("search");

    if (newStatus && newStatus !== "ALL") params.set("status", newStatus);
    else params.delete("status");

    if (newFacing && newFacing !== "ALL") params.set("facing", newFacing);
    else params.delete("facing");

    params.set("page", "1");
    router.push(`${pathname}?${params.toString()}`);
  };

  const openAddModal = () => {
    setPlotNumber("");
    setLabel("");
    setAreaSqFt(900);
    setWidthFt(30);
    setLengthFt(30);
    setFacing("EAST");
    setIsCorner(false);
    setBasePriceRupees("2850000");
    setRatePerSqYdRupees("28500");
    setPlotStatus("AVAILABLE");
    setPublicVisibility(true);
    setFormErrors({});
    setAddModalOpen(true);
  };

  const openEditModal = (plot: any) => {
    setEditModalPlot(plot);
    setPlotNumber(plot.plotNumber);
    setLabel(plot.label || "");
    setAreaSqFt(plot.areaSqFt);
    setWidthFt(plot.dimensions?.widthFt || 0);
    setLengthFt(plot.dimensions?.lengthFt || 0);
    setFacing(plot.facing || "EAST");
    setIsCorner(Boolean(plot.isCorner));
    setBasePriceRupees(plot.basePricePaise ? String(paiseToRupees(plot.basePricePaise)) : "");
    setRatePerSqYdRupees(plot.ratePerSqYdPaise ? String(paiseToRupees(plot.ratePerSqYdPaise)) : "");
    setPlotStatus(plot.status);
    setPublicVisibility(plot.publicVisibility !== false);
    setFormErrors({});
  };

  const handleSavePlot = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors({});
    setToastMessage(null);

    const basePaise = basePriceRupees ? rupeesToPaise(Number(basePriceRupees)) : undefined;
    const ratePaise = ratePerSqYdRupees ? rupeesToPaise(Number(ratePerSqYdRupees)) : undefined;

    const payload = {
      plotNumber: plotNumber.trim(),
      label: label.trim() || undefined,
      areaSqFt: Number(areaSqFt) || 900,
      dimensions: {
        widthFt: Number(widthFt) || undefined,
        lengthFt: Number(lengthFt) || undefined,
      },
      facing,
      isCorner,
      basePricePaise: basePaise,
      ratePerSqYdPaise: ratePaise,
      status: plotStatus,
      publicVisibility,
      sortOrder: 0,
    };

    startTransition(async () => {
      let res;
      if (editModalPlot) {
        res = await updatePlotOptionAction(property.id, editModalPlot._id, {
          ...payload,
          expectedVersion: editModalPlot.__v,
        });
      } else {
        res = await createPlotOptionAction(property.id, payload);
      }

      if (res.success) {
        setAddModalOpen(false);
        setEditModalPlot(null);
        setToastMessage({ type: "success", text: res.message });
        router.refresh();
      } else {
        if (res.fieldErrors) setFormErrors(res.fieldErrors);
        setToastMessage({ type: "error", text: res.message });
      }
    });
  };

  const handleQuickStatusChange = async (plotId: string, newStatus: PlotStatus) => {
    setToastMessage(null);
    startTransition(async () => {
      const res = await changePlotOptionStatusAction(property.id, plotId, newStatus);
      if (res.success) {
        setToastMessage({ type: "success", text: res.message });
        router.refresh();
      } else {
        setToastMessage({ type: "error", text: res.message });
      }
    });
  };

  const handleRemovePlot = async (plotId: string) => {
    if (!confirm("Are you sure you want to mark this plot as UNAVAILABLE and remove it from active inventory?")) {
      return;
    }
    setToastMessage(null);
    startTransition(async () => {
      const res = await removePlotOptionAction(property.id, plotId);
      if (res.success) {
        setToastMessage({ type: "success", text: res.message });
        router.refresh();
      } else {
        setToastMessage({ type: "error", text: res.message });
      }
    });
  };

  const statusPillStyles: Record<string, string> = {
    AVAILABLE: "bg-emerald-50 text-emerald-700 border-emerald-200",
    RESERVED: "bg-purple-50 text-purple-700 border-purple-200",
    SOLD: "bg-rose-50 text-rose-700 border-rose-200",
    ON_REQUEST: "bg-amber-50 text-amber-700 border-amber-200",
    UNAVAILABLE: "bg-slate-100 text-slate-700 border-slate-200",
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[rgba(7,26,40,0.06)]">
        <div>
          <Link
            href={`/dashboard/properties/${property.id}/edit`}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#647581] hover:text-[#071a28] mb-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Property Editor</span>
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-xl sm:text-2xl font-bold font-serif text-[#071a28]">
              Plot Inventory Management
            </h1>
            <span className="text-xs font-mono font-bold text-[#087fc3]">
              ({totalPlots} total units)
            </span>
          </div>
          <p className="text-xs text-[#647581] mt-0.5">
            {property.title} • /{property.slug}
          </p>
        </div>

        <button
          type="button"
          onClick={openAddModal}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0088cc] hover:bg-[#0077b5] text-white text-xs font-semibold transition-colors shadow-xs cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Plot Unit</span>
        </button>
      </div>

      {/* Toast Alert */}
      {toastMessage && (
        <div
          className={`p-4 rounded-xl text-xs flex items-center justify-between shadow-2xs border ${
            toastMessage.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
              : "bg-rose-50 border-rose-200 text-rose-800"
          }`}
        >
          <div className="flex items-center gap-2">
            {toastMessage.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span className="font-semibold">{toastMessage.text}</span>
          </div>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="p-1 hover:opacity-70 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* KPI Distribution Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="p-4 rounded-2xl bg-white border border-[rgba(7,26,40,0.08)] shadow-xs">
          <span className="text-[10px] font-mono uppercase text-[#647581] block">Available</span>
          <span className="text-lg font-bold font-mono text-emerald-700">
            {inventorySummary.AVAILABLE || 0}
          </span>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-[rgba(7,26,40,0.08)] shadow-xs">
          <span className="text-[10px] font-mono uppercase text-[#647581] block">Reserved</span>
          <span className="text-lg font-bold font-mono text-purple-700">
            {inventorySummary.RESERVED || 0}
          </span>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-[rgba(7,26,40,0.08)] shadow-xs">
          <span className="text-[10px] font-mono uppercase text-[#647581] block">Sold Out</span>
          <span className="text-lg font-bold font-mono text-rose-700">
            {inventorySummary.SOLD || 0}
          </span>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-[rgba(7,26,40,0.08)] shadow-xs">
          <span className="text-[10px] font-mono uppercase text-[#647581] block">On Request</span>
          <span className="text-lg font-bold font-mono text-amber-700">
            {inventorySummary.ON_REQUEST || 0}
          </span>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-[rgba(7,26,40,0.08)] shadow-xs">
          <span className="text-[10px] font-mono uppercase text-[#647581] block">Unavailable</span>
          <span className="text-lg font-bold font-mono text-slate-700">
            {inventorySummary.UNAVAILABLE || 0}
          </span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="p-4 rounded-2xl bg-white border border-[rgba(7,26,40,0.08)] shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#647581]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") applyFilters();
            }}
            placeholder="Search by plot number (e.g. A-101)..."
            className="w-full pl-10 pr-20 py-2 rounded-xl border border-[rgba(7,26,40,0.12)] text-xs text-[#071a28] focus:outline-none focus:border-[#087fc3]"
          />
          <button
            type="button"
            onClick={() => applyFilters()}
            className="absolute right-1.5 top-1/2 -translate-y-1/2 px-2.5 py-1 rounded-lg bg-[#0088cc] hover:bg-[#0077b5] text-white text-[11px] font-semibold transition cursor-pointer"
          >
            Search
          </button>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              applyFilters({ status: e.target.value });
            }}
            className="p-2 rounded-xl border border-[rgba(7,26,40,0.12)] bg-white text-xs text-[#071a28] font-medium"
          >
            <option value="ALL">All Statuses</option>
            <option value="AVAILABLE">Available</option>
            <option value="RESERVED">Reserved</option>
            <option value="SOLD">Sold</option>
            <option value="ON_REQUEST">On Request</option>
            <option value="UNAVAILABLE">Unavailable</option>
          </select>

          <select
            value={facingFilter}
            onChange={(e) => {
              setFacingFilter(e.target.value);
              applyFilters({ facing: e.target.value });
            }}
            className="p-2 rounded-xl border border-[rgba(7,26,40,0.12)] bg-white text-xs text-[#071a28] font-medium"
          >
            <option value="ALL">All Facings</option>
            <option value="NORTH">North</option>
            <option value="SOUTH">South</option>
            <option value="EAST">East</option>
            <option value="WEST">West</option>
            <option value="NORTH_EAST">North-East</option>
          </select>
        </div>
      </div>

      {/* Plot Table */}
      <div className="bg-white rounded-2xl border border-[rgba(7,26,40,0.08)] shadow-xs overflow-hidden">
        {items.length === 0 ? (
          <div className="text-center py-12 px-4">
            <Layers className="w-10 h-10 text-[#647581]/40 mx-auto mb-2" />
            <h3 className="text-sm font-bold text-[#071a28]">No plot units found</h3>
            <p className="text-xs text-[#647581] mt-1">Add your first plot unit or clear current search filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[rgba(7,26,40,0.08)] bg-[#f7f5ef]/40 text-[#647581] font-mono uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4 font-semibold">Plot #</th>
                  <th className="py-3 px-4 font-semibold">Area</th>
                  <th className="py-3 px-4 font-semibold">Dimensions</th>
                  <th className="py-3 px-4 font-semibold">Orientation</th>
                  <th className="py-3 px-4 font-semibold">Base Price</th>
                  <th className="py-3 px-4 font-semibold">Status</th>
                  <th className="py-3 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[rgba(7,26,40,0.04)] font-medium text-[#071a28]">
                {items.map((plot: any) => {
                  const style = statusPillStyles[plot.status] || statusPillStyles.AVAILABLE;

                  return (
                    <tr key={plot._id} className="hover:bg-[#f7f5ef]/40 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-[#071a28]">
                        <div className="flex items-center gap-1.5">
                          <span>{plot.plotNumber}</span>
                          {plot.isCorner && (
                            <span className="text-[9px] font-mono font-bold bg-amber-50 text-amber-700 px-1 py-0.2 rounded border border-amber-200">
                              Corner
                            </span>
                          )}
                        </div>
                        {plot.label && <span className="text-[10px] text-[#647581] block">{plot.label}</span>}
                      </td>

                      <td className="py-3.5 px-4 font-mono">
                        <span className="font-semibold text-[#071a28]">{sqFtToSqYards(plot.areaSqFt)} sq yd</span>
                        <span className="text-[10px] text-[#647581] block">({plot.areaSqFt} sq ft)</span>
                      </td>

                      <td className="py-3.5 px-4 font-mono text-[#647581]">
                        {plot.dimensions?.widthFt && plot.dimensions?.lengthFt
                          ? `${plot.dimensions.widthFt}' × ${plot.dimensions.lengthFt}'`
                          : "—"}
                      </td>

                      <td className="py-3.5 px-4 text-xs font-semibold">{plot.facing}</td>

                      <td className="py-3.5 px-4 font-mono font-semibold">
                        {plot.basePricePaise ? formatPaiseToRupeeString(plot.basePricePaise) : "On Request"}
                      </td>

                      <td className="py-3.5 px-4">
                        <select
                          value={plot.status}
                          onChange={(e) => handleQuickStatusChange(plot._id, e.target.value as PlotStatus)}
                          disabled={isPending}
                          className={`px-2 py-1 rounded-full text-[10px] font-mono font-bold uppercase border cursor-pointer ${style}`}
                        >
                          <option value="AVAILABLE">AVAILABLE</option>
                          <option value="RESERVED">RESERVED</option>
                          <option value="SOLD">SOLD</option>
                          <option value="ON_REQUEST">ON REQUEST</option>
                          <option value="UNAVAILABLE">UNAVAILABLE</option>
                        </select>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="inline-flex items-center gap-1 justify-end">
                          <button
                            type="button"
                            onClick={() => openEditModal(plot)}
                            title="Edit Plot"
                            className="p-1.5 rounded-lg text-[#071a28] hover:bg-slate-100 border border-[rgba(7,26,40,0.1)] cursor-pointer"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRemovePlot(plot._id)}
                            title="Archive Plot"
                            className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 border border-[rgba(7,26,40,0.1)] cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Plot Modal Dialog */}
      {(addModalOpen || editModalPlot) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="max-w-md w-full p-6 rounded-3xl bg-white shadow-2xl border border-[rgba(7,26,40,0.1)] space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-[rgba(7,26,40,0.06)]">
              <h3 className="text-sm font-bold text-[#071a28]">
                {editModalPlot ? `Edit Plot Unit (${editModalPlot.plotNumber})` : "Add New Plot Unit"}
              </h3>
              <button
                type="button"
                onClick={() => {
                  setAddModalOpen(false);
                  setEditModalPlot(null);
                }}
                className="p-1 text-[#647581] hover:text-[#071a28] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSavePlot} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-mono uppercase text-[#071a28] font-bold mb-1">
                    Plot Number <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={plotNumber}
                    onChange={(e) => setPlotNumber(e.target.value)}
                    placeholder="e.g. A-101"
                    className="w-full p-2.5 rounded-xl border border-[rgba(7,26,40,0.12)] text-xs text-[#071a28] font-mono focus:outline-none focus:border-[#087fc3]"
                  />
                  {formErrors.plotNumber && (
                    <p className="text-[10px] text-rose-600 mt-1">{formErrors.plotNumber[0]}</p>
                  )}
                </div>

                <div>
                  <label className="block text-[10px] font-mono uppercase text-[#071a28] font-bold mb-1">
                    Custom Label (optional)
                  </label>
                  <input
                    type="text"
                    value={label}
                    onChange={(e) => setLabel(e.target.value)}
                    placeholder="e.g. Park Facing Corner"
                    className="w-full p-2.5 rounded-xl border border-[rgba(7,26,40,0.12)] text-xs text-[#071a28] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[10px] font-mono uppercase text-[#071a28] font-bold mb-1">
                    Area (Sq Ft) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={areaSqFt}
                    onChange={(e) => setAreaSqFt(Number(e.target.value) || 0)}
                    className="w-full p-2.5 rounded-xl border border-[rgba(7,26,40,0.12)] text-xs text-[#071a28] focus:outline-none"
                  />
                  <p className="text-[10px] font-mono text-[#647581] mt-0.5">
                    ≈ {sqFtToSqYards(areaSqFt)} sq yd
                  </p>
                </div>

                <div>
                  <label className="block text-[10px] font-mono uppercase text-[#071a28] font-bold mb-1">
                    Width (Ft)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={widthFt}
                    onChange={(e) => setWidthFt(Number(e.target.value) || 0)}
                    className="w-full p-2.5 rounded-xl border border-[rgba(7,26,40,0.12)] text-xs text-[#071a28] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-mono uppercase text-[#071a28] font-bold mb-1">
                    Length (Ft)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={lengthFt}
                    onChange={(e) => setLengthFt(Number(e.target.value) || 0)}
                    className="w-full p-2.5 rounded-xl border border-[rgba(7,26,40,0.12)] text-xs text-[#071a28] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-mono uppercase text-[#071a28] font-bold mb-1">
                    Facing Orientation
                  </label>
                  <select
                    value={facing}
                    onChange={(e) => setFacing(e.target.value as FacingDirection)}
                    className="w-full p-2.5 rounded-xl border border-[rgba(7,26,40,0.12)] bg-white text-xs text-[#071a28] font-medium"
                  >
                    <option value="EAST">East</option>
                    <option value="NORTH">North</option>
                    <option value="WEST">West</option>
                    <option value="SOUTH">South</option>
                    <option value="NORTH_EAST">North-East</option>
                    <option value="NORTH_WEST">North-West</option>
                    <option value="SOUTH_EAST">South-East</option>
                    <option value="SOUTH_WEST">South-West</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-mono uppercase text-[#071a28] font-bold mb-1">
                    Plot Status
                  </label>
                  <select
                    value={plotStatus}
                    onChange={(e) => setPlotStatus(e.target.value as PlotStatus)}
                    className="w-full p-2.5 rounded-xl border border-[rgba(7,26,40,0.12)] bg-white text-xs text-[#071a28] font-medium"
                  >
                    <option value="AVAILABLE">AVAILABLE</option>
                    <option value="RESERVED">RESERVED</option>
                    <option value="SOLD">SOLD</option>
                    <option value="ON_REQUEST">ON REQUEST</option>
                    <option value="UNAVAILABLE">UNAVAILABLE</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-mono uppercase text-[#071a28] font-bold mb-1">
                    Base Price (INR ₹)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={basePriceRupees}
                    onChange={(e) => setBasePriceRupees(e.target.value)}
                    placeholder="2850000"
                    className="w-full p-2.5 rounded-xl border border-[rgba(7,26,40,0.12)] text-xs text-[#071a28]"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-mono uppercase text-[#071a28] font-bold mb-1">
                    Rate / Sq Yd (INR ₹)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={ratePerSqYdRupees}
                    onChange={(e) => setRatePerSqYdRupees(e.target.value)}
                    placeholder="28500"
                    className="w-full p-2.5 rounded-xl border border-[rgba(7,26,40,0.12)] text-xs text-[#071a28]"
                  />
                </div>
              </div>

              <div className="flex items-center gap-4 pt-1">
                <label className="inline-flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isCorner}
                    onChange={(e) => setIsCorner(e.target.checked)}
                    className="w-3.5 h-3.5 rounded text-[#087fc3]"
                  />
                  <span>Corner Plot Premium</span>
                </label>

                <label className="inline-flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={publicVisibility}
                    onChange={(e) => setPublicVisibility(e.target.checked)}
                    className="w-3.5 h-3.5 rounded text-[#087fc3]"
                  />
                  <span>Publicly Visible on Table</span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[rgba(7,26,40,0.06)]">
                <button
                  type="button"
                  onClick={() => {
                    setAddModalOpen(false);
                    setEditModalPlot(null);
                  }}
                  className="px-4 py-2 rounded-xl border border-[rgba(7,26,40,0.12)] text-[#071a28] text-xs font-semibold hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-5 py-2 rounded-xl bg-[#0088cc] hover:bg-[#0077b5] text-white text-xs font-semibold transition-colors shadow-xs cursor-pointer"
                >
                  {isPending ? "Saving..." : editModalPlot ? "Update Unit" : "Create Unit"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

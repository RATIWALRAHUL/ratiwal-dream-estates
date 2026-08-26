"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Building,
  Edit,
  Eye,
  CheckSquare,
  Square,
  ShieldAlert,
  ArrowUpDown,
  Compass,
} from "lucide-react";
import { InventoryUnitSummary, UnitStatus } from "@/types/inventory";

const STATUS_BADGES: Record<UnitStatus, { bg: string; text: string; border: string }> = {
  AVAILABLE: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200" },
  ON_HOLD: { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200" },
  RESERVED: { bg: "bg-purple-50", text: "text-purple-700", border: "border-purple-200" },
  BOOKED: { bg: "bg-indigo-50", text: "text-indigo-700", border: "border-indigo-200" },
  SOLD: { bg: "bg-slate-100", text: "text-slate-700", border: "border-slate-300" },
  BLOCKED: { bg: "bg-rose-50", text: "text-rose-700", border: "border-rose-200" },
  UNAVAILABLE: { bg: "bg-zinc-100", text: "text-zinc-600", border: "border-zinc-300" },
  DRAFT: { bg: "bg-sky-50", text: "text-sky-700", border: "border-sky-200" },
  ARCHIVED: { bg: "bg-gray-100", text: "text-gray-500", border: "border-gray-300" },
};

interface InventoryUnitTableProps {
  units: InventoryUnitSummary[];
  total: number;
  page: number;
  perPage: number;
  selectedUnitIds?: string[];
  onToggleSelect?: (unitId: string) => void;
  onSelectAll?: () => void;
}

export function InventoryUnitTable({
  units,
  total,
  page,
  perPage,
  selectedUnitIds: controlledSelectedUnitIds,
  onToggleSelect: controlledOnToggleSelect,
  onSelectAll: controlledOnSelectAll,
}: InventoryUnitTableProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [internalSelectedIds, setInternalSelectedIds] = useState<string[]>([]);
  const selectedUnitIds = controlledSelectedUnitIds ?? internalSelectedIds;

  const handleToggleSelect = (unitId: string) => {
    if (controlledOnToggleSelect) {
      controlledOnToggleSelect(unitId);
    } else {
      setInternalSelectedIds((prev) =>
        prev.includes(unitId) ? prev.filter((id) => id !== unitId) : [...prev, unitId]
      );
    }
  };

  const handleSelectAll = () => {
    if (controlledOnSelectAll) {
      controlledOnSelectAll();
    } else {
      setInternalSelectedIds((prev) =>
        prev.length === units.length ? [] : units.map((u) => u._id)
      );
    }
  };

  const allSelected = units.length > 0 && units.every((u) => selectedUnitIds.includes(u._id));
  const totalPages = Math.ceil(total / perPage);

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(newPage));
    router.push(`?${params.toString()}`);
  };

  return (
    <div className="bg-white rounded-2xl border border-[rgba(7,26,40,0.08)] shadow-xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-[#f8f7f4] border-b border-[rgba(7,26,40,0.06)] text-[10px] font-mono uppercase tracking-wider text-[#647581]">
              <th className="py-3 px-4 w-10">
                <button
                  type="button"
                  onClick={handleSelectAll}
                  className="text-slate-500 hover:text-[#071a28]"
                  title="Select All"
                >
                  {allSelected ? (
                    <CheckSquare className="w-4 h-4 text-[#087fc3]" />
                  ) : (
                    <Square className="w-4 h-4" />
                  )}
                </button>
              </th>
              <th className="py-3 px-4">Unit / Plot Ref</th>
              <th className="py-3 px-4">Property & Block</th>
              <th className="py-3 px-4">Category & Config</th>
              <th className="py-3 px-4">Area (Sq Ft / Yd)</th>
              <th className="py-3 px-4">Price (INR)</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">Visibility</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[rgba(7,26,40,0.04)] font-mono text-xs">
            {units.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-16 text-center text-[#647581] italic">
                  No inventory units found matching your active criteria.
                </td>
              </tr>
            ) : (
              units.map((u) => {
                const isSelected = selectedUnitIds.includes(u._id);
                const badge = STATUS_BADGES[u.status] || STATUS_BADGES.AVAILABLE;

                return (
                  <tr
                    key={u._id}
                    className={`hover:bg-[#f8f7f4]/60 transition-colors ${
                      isSelected ? "bg-[#087fc3]/5" : ""
                    }`}
                  >
                    <td className="py-3 px-4">
                      <button
                        type="button"
                        onClick={() => handleToggleSelect(u._id)}
                        className="text-slate-500 hover:text-[#071a28]"
                      >
                        {isSelected ? (
                          <CheckSquare className="w-4 h-4 text-[#087fc3]" />
                        ) : (
                          <Square className="w-4 h-4" />
                        )}
                      </button>
                    </td>

                    <td className="py-3 px-4">
                      <Link
                        href={`/dashboard/inventory/${u._id}`}
                        className="font-bold text-[#071a28] hover:text-[#087fc3] block font-sans text-sm"
                      >
                        {u.unitNumber}
                      </Link>
                      <span className="text-[10px] text-[#647581] font-mono">{u.referenceCode}</span>
                    </td>

                    <td className="py-3 px-4 text-[#071a28] font-sans">
                      <span className="font-semibold block truncate max-w-[160px]">
                        {u.propertyName}
                      </span>
                      <span className="text-[10px] text-[#647581] font-mono block">
                        {[u.phaseName, u.towerBlockSector, u.floorLevel].filter(Boolean).join(" • ") || "Main"}
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      <span className="font-bold text-[#071a28] block">{u.configuration}</span>
                      <span className="text-[10px] text-[#647581] font-sans">
                        {u.unitCategory.replace(/_/g, " ")}
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      <span className="font-bold text-[#071a28] block">
                        {u.areaSqFt ? `${u.areaSqFt.toLocaleString("en-IN")} sq.ft` : "—"}
                      </span>
                      {u.areaSqYd && (
                        <span className="text-[10px] text-[#647581]">
                          {u.areaSqYd.toLocaleString("en-IN")} sq.yd
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-4">
                      {u.priceOnRequest ? (
                        <span className="text-amber-700 font-bold text-[11px] font-sans">Price on Request</span>
                      ) : u.displayPriceRupees ? (
                        <span className="font-bold text-[#071a28]">
                          ₹{(u.displayPriceRupees / 100000).toFixed(2)} L
                        </span>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>

                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-mono font-bold border ${badge.bg} ${badge.text} ${badge.border}`}
                      >
                        {u.status.replace(/_/g, " ")}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-[10px] text-[#647581]">
                      {u.visibility.replace(/_/g, " ")}
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5 font-sans">
                        <Link
                          href={`/dashboard/inventory/${u._id}`}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-[#087fc3] hover:bg-[#f8f7f4]"
                          title="View Details"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </Link>
                        <Link
                          href={`/dashboard/inventory/${u._id}/edit`}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-[#071a28] hover:bg-[#f8f7f4]"
                          title="Edit Unit"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Bar */}
      {totalPages > 1 && (
        <div className="p-4 border-t border-[rgba(7,26,40,0.06)] flex items-center justify-between text-xs text-[#647581]">
          <span>
            Page {page} of {totalPages} ({total} total units)
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => handlePageChange(page - 1)}
              disabled={page <= 1}
              className="px-3 py-1.5 rounded-xl border border-[rgba(7,26,40,0.1)] hover:bg-[#f8f7f4] font-bold text-[#071a28] disabled:opacity-40"
            >
              Previous
            </button>
            <button
              type="button"
              onClick={() => handlePageChange(page + 1)}
              disabled={page >= totalPages}
              className="px-3 py-1.5 rounded-xl border border-[rgba(7,26,40,0.1)] hover:bg-[#f8f7f4] font-bold text-[#071a28] disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

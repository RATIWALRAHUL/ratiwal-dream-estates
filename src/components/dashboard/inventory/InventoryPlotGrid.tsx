"use client";

import Link from "next/link";
import { Compass, Eye, Edit } from "lucide-react";
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

interface InventoryPlotGridProps {
  units: InventoryUnitSummary[];
}

export function InventoryPlotGrid({ units }: InventoryPlotGridProps) {
  if (units.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-[rgba(7,26,40,0.08)] p-12 text-center text-xs text-[#647581]">
        No plot records found matching your active criteria.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {units.map((unit) => {
        const badge = STATUS_BADGES[unit.status] || STATUS_BADGES.AVAILABLE;
        return (
          <div
            key={unit._id}
            className="bg-white rounded-2xl border border-[rgba(7,26,40,0.08)] shadow-xs p-5 flex flex-col justify-between hover:border-[#087fc3]/40 transition-all group"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-[10px] font-mono text-[#647581] uppercase tracking-wider">
                  {unit.referenceCode}
                </span>
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-mono font-bold border ${badge.bg} ${badge.text} ${badge.border}`}
                >
                  {unit.status}
                </span>
              </div>

              <h4 className="text-base font-bold text-[#071a28] font-sans group-hover:text-[#087fc3] transition-colors">
                <Link href={`/dashboard/inventory/${unit._id}`}>
                  Plot {unit.unitNumber}
                </Link>
              </h4>

              <p className="text-xs text-[#647581] mt-0.5 font-medium truncate">
                {unit.propertyName}
              </p>

              {/* Area & Facing Specs */}
              <div className="mt-3 pt-3 border-t border-[rgba(7,26,40,0.06)] grid grid-cols-2 gap-2 text-xs font-mono">
                <div>
                  <span className="text-[9px] text-[#647581] block uppercase">Area</span>
                  <span className="font-bold text-[#071a28]">
                    {unit.areaSqFt} sq.ft
                  </span>
                  {unit.areaSqYd && (
                    <span className="text-[10px] text-[#647581] block">
                      ({unit.areaSqYd} sq.yd)
                    </span>
                  )}
                </div>

                <div>
                  <span className="text-[9px] text-[#647581] block uppercase">Facing</span>
                  <span className="font-bold text-[#071a28] flex items-center gap-1">
                    <Compass className="w-3 h-3 text-[#087fc3]" />
                    <span>{unit.facing || "Standard"}</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Price & Actions Bottom */}
            <div className="mt-4 pt-3 border-t border-[rgba(7,26,40,0.06)] flex items-center justify-between">
              <div>
                {unit.priceOnRequest ? (
                  <span className="text-amber-700 font-bold text-xs">On Request</span>
                ) : unit.displayPriceRupees ? (
                  <span className="font-bold text-sm text-[#071a28] font-mono">
                    ₹{(unit.displayPriceRupees / 100000).toFixed(2)} L
                  </span>
                ) : (
                  <span className="text-slate-400 text-xs">—</span>
                )}
              </div>

              <div className="flex items-center gap-1">
                <Link
                  href={`/dashboard/inventory/${unit._id}`}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-[#087fc3] hover:bg-[#f8f7f4]"
                  title="View"
                >
                  <Eye className="w-3.5 h-3.5" />
                </Link>
                <Link
                  href={`/dashboard/inventory/${unit._id}/edit`}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-[#071a28] hover:bg-[#f8f7f4]"
                  title="Edit"
                >
                  <Edit className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

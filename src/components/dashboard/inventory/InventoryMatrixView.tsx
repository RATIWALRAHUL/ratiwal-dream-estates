"use client";

import Link from "next/link";
import { InventoryMatrixTower, UnitStatus } from "@/types/inventory";

const MATRIX_STATUS_COLORS: Record<UnitStatus, { bg: string; text: string; border: string }> = {
  AVAILABLE: { bg: "bg-emerald-50 hover:bg-emerald-100", text: "text-emerald-800", border: "border-emerald-300" },
  ON_HOLD: { bg: "bg-amber-50 hover:bg-amber-100", text: "text-amber-800", border: "border-amber-300" },
  RESERVED: { bg: "bg-purple-50 hover:bg-purple-100", text: "text-purple-800", border: "border-purple-300" },
  BOOKED: { bg: "bg-indigo-50 hover:bg-indigo-100", text: "text-indigo-800", border: "border-indigo-300" },
  SOLD: { bg: "bg-slate-100 hover:bg-slate-200", text: "text-slate-600", border: "border-slate-300" },
  BLOCKED: { bg: "bg-rose-50 hover:bg-rose-100", text: "text-rose-800", border: "border-rose-300" },
  UNAVAILABLE: { bg: "bg-zinc-100 hover:bg-zinc-200", text: "text-zinc-600", border: "border-zinc-300" },
  DRAFT: { bg: "bg-sky-50 hover:bg-sky-100", text: "text-sky-800", border: "border-sky-300" },
  ARCHIVED: { bg: "bg-gray-100 hover:bg-gray-200", text: "text-gray-500", border: "border-gray-300" },
};

interface InventoryMatrixViewProps {
  towers: InventoryMatrixTower[];
}

export function InventoryMatrixView({ towers }: InventoryMatrixViewProps) {
  if (towers.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-[rgba(7,26,40,0.08)] p-12 text-center text-xs text-[#647581]">
        No tower/floor inventory available for matrix rendering.
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {towers.map((tower) => (
        <div
          key={tower.towerBlockSector}
          className="bg-white rounded-2xl border border-[rgba(7,26,40,0.08)] shadow-xs overflow-hidden"
        >
          {/* Tower Header */}
          <div className="p-4 bg-[#f8f7f4] border-b border-[rgba(7,26,40,0.06)] flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#071a28]">
              {tower.towerBlockSector} ({tower.floors.reduce((acc, f) => acc + f.units.length, 0)} Units)
            </h3>
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#647581]">
              Tower Matrix
            </span>
          </div>

          {/* Matrix Grid by Floors */}
          <div className="p-6 space-y-4 overflow-x-auto">
            {tower.floors.map((floor) => (
              <div key={floor.floorLevel} className="flex items-center gap-4 min-w-[600px]">
                {/* Floor Label Badge */}
                <div className="w-24 shrink-0 font-mono text-xs font-bold text-[#071a28] bg-[#f8f7f4] px-3 py-2 rounded-xl text-center border border-[rgba(7,26,40,0.06)]">
                  {floor.floorLevel}
                </div>

                {/* Unit Cells */}
                <div className="flex flex-wrap items-center gap-2.5 flex-1">
                  {floor.units.map((unit) => {
                    const style = MATRIX_STATUS_COLORS[unit.status] || MATRIX_STATUS_COLORS.AVAILABLE;
                    return (
                      <Link
                        key={unit.unitId}
                        href={`/dashboard/inventory/${unit.unitId}`}
                        className={`p-2.5 rounded-xl border text-center transition-all min-w-[90px] shadow-2xs ${style.bg} ${style.border}`}
                      >
                        <span className="font-bold text-xs font-sans text-[#071a28] block">
                          {unit.unitNumber}
                        </span>
                        <span className="text-[9px] font-mono text-[#647581] block">
                          {unit.configuration}
                        </span>
                        <span className={`text-[9px] font-mono font-bold mt-0.5 block ${style.text}`}>
                          {unit.status}
                        </span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

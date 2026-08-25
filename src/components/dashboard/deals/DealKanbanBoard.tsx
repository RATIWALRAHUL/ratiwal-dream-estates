"use client";

import React from "react";
import Link from "next/link";
import { DealSummary, DealStage } from "@/types/deal";

interface DealKanbanBoardProps {
  deals: DealSummary[];
}

interface KanbanColumn {
  id: string;
  title: string;
  stages: DealStage[];
  color: string;
}

const COLUMNS: KanbanColumn[] = [
  { id: "col-1", title: "Qualification", stages: ["DRAFT", "QUALIFICATION"], color: "border-amber-400 bg-amber-50/40" },
  { id: "col-2", title: "Negotiation", stages: ["NEGOTIATION"], color: "border-sky-400 bg-sky-50/40" },
  { id: "col-3", title: "Offers", stages: ["OFFER_PENDING_APPROVAL", "OFFER_APPROVED"], color: "border-orange-400 bg-orange-50/40" },
  { id: "col-4", title: "On Hold", stages: ["HOLD_PENDING", "ON_HOLD"], color: "border-purple-400 bg-purple-50/40" },
  { id: "col-5", title: "Reserved", stages: ["RESERVED", "BOOKING_REQUIREMENTS_PENDING"], color: "border-indigo-400 bg-indigo-50/40" },
  { id: "col-6", title: "Booked / Won", stages: ["BOOKED", "WON"], color: "border-emerald-400 bg-emerald-50/40" },
];

export function DealKanbanBoard({ deals }: DealKanbanBoardProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 overflow-x-auto pb-4">
      {COLUMNS.map((col) => {
        const colDeals = deals.filter((d) => col.stages.includes(d.status));
        const totalValue = colDeals.reduce((sum, d) => sum + (d.offeredAmountRupees || 0), 0);

        return (
          <div
            key={col.id}
            className="flex flex-col rounded-2xl bg-[#fbfaf8] border border-[rgba(7,26,40,0.06)] min-w-[240px] max-h-[calc(100vh-260px)]"
          >
            {/* Column Header */}
            <div className={`p-3.5 border-t-4 rounded-t-2xl ${col.color} border-b border-slate-100 flex items-center justify-between`}>
              <div>
                <h4 className="text-xs font-bold font-serif text-[#071a28]">{col.title}</h4>
                <div className="text-[10px] text-slate-500 font-semibold">
                  ₹{(totalValue / 100000).toFixed(1)}L ({colDeals.length})
                </div>
              </div>
              <span className="w-5 h-5 rounded-full bg-white text-[#071a28] text-[10px] font-bold flex items-center justify-center shadow-xs">
                {colDeals.length}
              </span>
            </div>

            {/* Column Cards List */}
            <div className="p-2.5 space-y-2.5 overflow-y-auto flex-1">
              {colDeals.length === 0 ? (
                <div className="p-6 text-center text-[11px] text-slate-400 italic">
                  No deals in this stage
                </div>
              ) : (
                colDeals.map((deal) => (
                  <Link
                    key={deal._id}
                    href={`/dashboard/deals/${deal._id}`}
                    className="block p-3 rounded-xl bg-white border border-[rgba(7,26,40,0.08)] shadow-xs hover:border-[#c5a880] hover:shadow-md transition-all space-y-2 group"
                  >
                    <div className="flex justify-between items-start">
                      <span className="font-mono text-[11px] font-bold text-slate-500 group-hover:text-[#c5a880] transition-colors">
                        {deal.dealNumber}
                      </span>
                      {deal.priority === "URGENT" && (
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-rose-100 text-rose-800">
                          Urgent
                        </span>
                      )}
                    </div>

                    <div>
                      <div className="text-xs font-bold text-[#071a28] truncate">{deal.leadName}</div>
                      <div className="text-[11px] text-slate-500 truncate">{deal.propertyName}</div>
                    </div>

                    {deal.unitNumber && (
                      <div className="inline-block px-1.5 py-0.5 rounded bg-slate-100 text-[10px] font-mono font-bold text-slate-700">
                        Unit {deal.unitNumber}
                      </div>
                    )}

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                      <span className="font-bold text-[#071a28]">
                        {deal.offeredAmountRupees ? `₹${(deal.offeredAmountRupees / 100000).toFixed(2)}L` : "—"}
                      </span>
                      <span className="text-[10px] text-slate-400 truncate max-w-[80px]">
                        {deal.assignedAdvisorName.split(" ")[0]}
                      </span>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

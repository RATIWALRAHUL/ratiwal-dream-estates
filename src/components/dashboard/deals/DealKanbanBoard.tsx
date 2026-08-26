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
  badge: string;
}

const COLUMNS: KanbanColumn[] = [
  { id: "col-1", title: "Qualification", stages: ["DRAFT", "QUALIFICATION"], color: "border-amber-400", badge: "bg-amber-50 text-amber-800" },
  { id: "col-2", title: "Negotiation", stages: ["NEGOTIATION"], color: "border-sky-400", badge: "bg-sky-50 text-sky-800" },
  { id: "col-3", title: "Offers", stages: ["OFFER_PENDING_APPROVAL", "OFFER_APPROVED"], color: "border-orange-400", badge: "bg-orange-50 text-orange-800" },
  { id: "col-4", title: "On Hold", stages: ["HOLD_PENDING", "ON_HOLD"], color: "border-purple-400", badge: "bg-purple-50 text-purple-800" },
  { id: "col-5", title: "Reserved", stages: ["RESERVED", "BOOKING_REQUIREMENTS_PENDING"], color: "border-indigo-400", badge: "bg-indigo-50 text-indigo-800" },
  { id: "col-6", title: "Booked / Won", stages: ["BOOKED", "WON"], color: "border-emerald-400", badge: "bg-emerald-50 text-emerald-800" },
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
            className="flex flex-col rounded-3xl bg-[#f8f7f4] border border-[rgba(7,26,40,0.08)] min-w-[240px] max-h-[calc(100vh-260px)] shadow-2xs"
          >
            {/* Column Header */}
            <div className={`p-4 border-t-4 rounded-t-3xl ${col.color} border-b border-[rgba(7,26,40,0.06)] bg-white flex items-center justify-between`}>
              <div>
                <h4 className="text-xs font-bold font-serif text-[#071a28]">{col.title}</h4>
                <div className="text-[10px] text-[#647581] font-semibold mt-0.5">
                  ₹{(totalValue / 100000).toFixed(1)}L ({colDeals.length})
                </div>
              </div>
              <span className={`w-5 h-5 rounded-full ${col.badge} text-[10px] font-bold flex items-center justify-center`}>
                {colDeals.length}
              </span>
            </div>

            {/* Column Cards List */}
            <div className="p-3 space-y-3 overflow-y-auto flex-1">
              {colDeals.length === 0 ? (
                <div className="p-6 text-center text-[11px] text-[#647581] italic">
                  No deals in this stage
                </div>
              ) : (
                colDeals.map((deal) => (
                  <Link
                    key={deal._id}
                    href={`/dashboard/deals/${deal._id}`}
                    className="block p-3.5 rounded-2xl bg-white border border-[rgba(7,26,40,0.08)] shadow-2xs hover:border-[#0088cc]/40 hover:shadow-[0_4px_16px_rgba(0,136,204,0.08)] transition-all space-y-2 group"
                  >
                    <div className="flex justify-between items-start">
                      <span className="font-mono text-[11px] font-bold text-[#647581] group-hover:text-[#0088cc] transition-colors">
                        {deal.dealNumber}
                      </span>
                      {deal.priority === "URGENT" && (
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-rose-50 text-rose-700 border border-rose-200">
                          Urgent
                        </span>
                      )}
                    </div>

                    <div>
                      <div className="text-xs font-bold text-[#071a28] truncate">{deal.leadName}</div>
                      <div className="text-[11px] text-[#647581] truncate">{deal.propertyName}</div>
                    </div>

                    {deal.unitNumber && (
                      <div className="inline-block px-2 py-0.5 rounded-lg bg-[#f8f7f4] border border-[rgba(7,26,40,0.06)] text-[10px] font-mono font-bold text-[#071a28]">
                        Unit {deal.unitNumber}
                      </div>
                    )}

                    <div className="pt-2 border-t border-[rgba(7,26,40,0.06)] flex items-center justify-between text-[11px]">
                      <span className="font-bold text-[#071a28]">
                        {deal.offeredAmountRupees ? `₹${(deal.offeredAmountRupees / 100000).toFixed(2)}L` : "—"}
                      </span>
                      <span className="text-[10px] text-[#647581] truncate max-w-[80px]">
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

"use client";

import React from "react";
import Link from "next/link";
import { DealSummary, DealStage } from "@/types/deal";

interface DealTableProps {
  deals: DealSummary[];
}

const STAGE_COLORS: Record<DealStage, { bg: string; text: string; border: string }> = {
  DRAFT: { bg: "bg-slate-50", text: "text-slate-700", border: "border-slate-200" },
  QUALIFICATION: { bg: "bg-amber-50", text: "text-amber-800", border: "border-amber-200" },
  NEGOTIATION: { bg: "bg-sky-50", text: "text-sky-800", border: "border-sky-200" },
  OFFER_PENDING_APPROVAL: { bg: "bg-orange-50", text: "text-orange-800", border: "border-orange-200" },
  OFFER_APPROVED: { bg: "bg-emerald-50", text: "text-emerald-800", border: "border-emerald-200" },
  HOLD_PENDING: { bg: "bg-purple-50", text: "text-purple-800", border: "border-purple-200" },
  ON_HOLD: { bg: "bg-purple-100", text: "text-purple-900", border: "border-purple-300" },
  RESERVED: { bg: "bg-indigo-50", text: "text-indigo-900", border: "border-indigo-200" },
  BOOKING_REQUIREMENTS_PENDING: { bg: "bg-yellow-50", text: "text-yellow-900", border: "border-yellow-200" },
  BOOKED: { bg: "bg-teal-50", text: "text-teal-900", border: "border-teal-200" },
  WON: { bg: "bg-emerald-100", text: "text-emerald-900", border: "border-emerald-300" },
  LOST: { bg: "bg-rose-50", text: "text-rose-800", border: "border-rose-200" },
  CANCELLED: { bg: "bg-slate-100", text: "text-slate-600", border: "border-slate-200" },
  ARCHIVED: { bg: "bg-slate-100", text: "text-slate-500", border: "border-slate-200" },
};

export function DealTable({ deals }: DealTableProps) {
  if (deals.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-[rgba(7,26,40,0.06)] p-12 text-center">
        <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-700 flex items-center justify-center mx-auto mb-3 font-bold">
          💼
        </div>
        <h3 className="text-base font-bold font-serif text-[#071a28]">No Deals Found</h3>
        <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
          Convert qualified leads into deals or create a new sales opportunity to begin tracking.
        </p>
        <Link
          href="/dashboard/deals/new"
          className="inline-flex items-center px-4 py-2 rounded-xl bg-[#c5a880] text-[#071a28] font-bold text-xs hover:bg-[#b59870] transition-colors"
        >
          + Create New Deal
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-[rgba(7,26,40,0.06)] shadow-xs overflow-hidden">
      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-slate-100 bg-[#fbfaf8] text-slate-500 font-bold uppercase tracking-wider">
              <th className="py-3.5 px-4">Deal Number</th>
              <th className="py-3.5 px-4">Lead / Buyer</th>
              <th className="py-3.5 px-4">Property & Unit</th>
              <th className="py-3.5 px-4">Stage</th>
              <th className="py-3.5 px-4">Offer Value</th>
              <th className="py-3.5 px-4">Advisor</th>
              <th className="py-3.5 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {deals.map((deal) => {
              const color = STAGE_COLORS[deal.status] || STAGE_COLORS.DRAFT;
              return (
                <tr key={deal._id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-[#071a28]">
                    <Link href={`/dashboard/deals/${deal._id}`} className="hover:text-[#c5a880] transition-colors">
                      {deal.dealNumber}
                    </Link>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-[#071a28]">{deal.leadName}</div>
                    {deal.leadPhone && <div className="text-[11px] text-slate-400">{deal.leadPhone}</div>}
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-slate-700">{deal.propertyName}</div>
                    {deal.unitNumber ? (
                      <span className="inline-block text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 mt-0.5">
                        Unit {deal.unitNumber}
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-400">No unit selected</span>
                    )}
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold border ${color.bg} ${color.text} ${color.border}`}
                    >
                      {deal.status.replace(/_/g, " ")}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-[#071a28]">
                    {deal.offeredAmountRupees ? (
                      `₹${deal.offeredAmountRupees.toLocaleString("en-IN")}`
                    ) : (
                      <span className="text-slate-400 font-normal">Pending Offer</span>
                    )}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="inline-flex items-center gap-1 text-slate-600 font-medium">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      {deal.assignedAdvisorName}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <Link
                      href={`/dashboard/deals/${deal._id}`}
                      className="inline-flex items-center px-2.5 py-1 rounded-lg bg-slate-100 text-[#071a28] font-bold text-[11px] hover:bg-[#c5a880] hover:text-white transition-colors"
                    >
                      Workspace →
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden divide-y divide-slate-100">
        {deals.map((deal) => {
          const color = STAGE_COLORS[deal.status] || STAGE_COLORS.DRAFT;
          return (
            <div key={deal._id} className="p-4 space-y-2.5 text-xs">
              <div className="flex justify-between items-start">
                <div>
                  <Link href={`/dashboard/deals/${deal._id}`} className="font-mono font-bold text-[#071a28] text-sm">
                    {deal.dealNumber}
                  </Link>
                  <div className="font-bold text-slate-800 mt-0.5">{deal.leadName}</div>
                </div>
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${color.bg} ${color.text} ${color.border}`}
                >
                  {deal.status.replace(/_/g, " ")}
                </span>
              </div>

              <div className="flex items-center justify-between text-slate-600 text-[11px] pt-1">
                <span>{deal.propertyName}</span>
                {deal.unitNumber && <span className="font-mono font-bold">Unit {deal.unitNumber}</span>}
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <span className="font-bold text-[#071a28]">
                  {deal.offeredAmountRupees ? `₹${deal.offeredAmountRupees.toLocaleString("en-IN")}` : "No offer"}
                </span>
                <Link
                  href={`/dashboard/deals/${deal._id}`}
                  className="px-3 py-1 rounded-lg bg-[#071a28] text-white font-bold text-[11px]"
                >
                  View Deal
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

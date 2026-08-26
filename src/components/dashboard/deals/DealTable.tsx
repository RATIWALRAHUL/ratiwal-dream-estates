"use client";

import React from "react";
import Link from "next/link";
import { Plus, Briefcase, ChevronRight, ArrowRight } from "lucide-react";
import { DealSummary, DealStage } from "@/types/deal";

interface DealTableProps {
  deals: DealSummary[];
}

const STAGE_COLORS: Record<DealStage, { bg: string; text: string; border: string }> = {
  DRAFT: { bg: "bg-stone-100", text: "text-stone-700", border: "border-stone-200" },
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
  CANCELLED: { bg: "bg-stone-100", text: "text-stone-600", border: "border-stone-200" },
  ARCHIVED: { bg: "bg-stone-100", text: "text-stone-500", border: "border-stone-200" },
};

export function DealTable({ deals }: DealTableProps) {
  if (deals.length === 0) {
    return (
      <div className="bg-white rounded-3xl border border-[rgba(7,26,40,0.08)] p-12 text-center shadow-[0_4px_24px_rgba(7,26,40,0.02)]">
        <div className="w-12 h-12 rounded-2xl bg-[#eaf5fa] text-[#0088cc] border border-[#0088cc]/20 flex items-center justify-center mx-auto mb-3">
          <Briefcase className="w-6 h-6 stroke-[2.2]" />
        </div>
        <h3 className="text-base font-bold font-serif text-[#071a28]">No Deals Found</h3>
        <p className="text-xs text-[#647581] max-w-sm mx-auto mt-1 mb-4">
          Convert qualified leads into deals or create a new sales opportunity to begin tracking.
        </p>
        <Link
          href="/dashboard/deals/new"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0088cc] hover:bg-[#0077b5] text-white font-semibold text-xs transition-colors shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Deal</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl border border-[rgba(7,26,40,0.08)] shadow-2xs overflow-hidden">
      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-[rgba(7,26,40,0.08)] bg-[#f8f7f4] text-[#647581] font-semibold">
              <th className="py-3.5 px-4 text-[#071a28]">Deal Number</th>
              <th className="py-3.5 px-4 text-[#071a28]">Lead / Buyer</th>
              <th className="py-3.5 px-4 text-[#071a28]">Property & Unit</th>
              <th className="py-3.5 px-4 text-[#071a28]">Stage</th>
              <th className="py-3.5 px-4 text-[#071a28]">Offer Value</th>
              <th className="py-3.5 px-4 text-[#071a28]">Advisor</th>
              <th className="py-3.5 px-4 text-right text-[#071a28]">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[rgba(7,26,40,0.06)]">
            {deals.map((deal) => {
              const color = STAGE_COLORS[deal.status] || STAGE_COLORS.DRAFT;
              return (
                <tr key={deal._id} className="hover:bg-[#f8f7f4]/60 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-[#071a28]">
                    <Link href={`/dashboard/deals/${deal._id}`} className="hover:text-[#0088cc] transition-colors">
                      {deal.dealNumber}
                    </Link>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-[#071a28]">{deal.leadName}</div>
                    {deal.leadPhone && <div className="text-[11px] text-[#647581]">{deal.leadPhone}</div>}
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-[#071a28]">{deal.propertyName}</div>
                    {deal.unitNumber ? (
                      <span className="inline-block text-[10px] font-mono font-bold px-2 py-0.5 rounded-lg bg-[#f8f7f4] border border-[rgba(7,26,40,0.06)] text-[#071a28] mt-0.5">
                        Unit {deal.unitNumber}
                      </span>
                    ) : (
                      <span className="text-[10px] text-[#647581]">No unit selected</span>
                    )}
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-semibold border ${color.bg} ${color.text} ${color.border}`}
                    >
                      {deal.status.replace(/_/g, " ")}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-bold text-[#071a28]">
                    {deal.offeredAmountRupees ? (
                      `₹${deal.offeredAmountRupees.toLocaleString("en-IN")}`
                    ) : (
                      <span className="text-[#647581] font-normal">Pending Offer</span>
                    )}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="inline-flex items-center gap-1.5 text-[#071a28] font-medium">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      {deal.assignedAdvisorName}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <Link
                      href={`/dashboard/deals/${deal._id}`}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#f8f7f4] border border-[rgba(7,26,40,0.08)] text-[#071a28] font-semibold text-xs hover:bg-[#0088cc] hover:text-white hover:border-[#0088cc] transition-all shadow-2xs"
                    >
                      <span>Workspace</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden divide-y divide-[rgba(7,26,40,0.06)]">
        {deals.map((deal) => {
          const color = STAGE_COLORS[deal.status] || STAGE_COLORS.DRAFT;
          return (
            <div key={deal._id} className="p-4 space-y-2.5 text-xs">
              <div className="flex justify-between items-start">
                <div>
                  <Link href={`/dashboard/deals/${deal._id}`} className="font-mono font-bold text-[#071a28] text-sm">
                    {deal.dealNumber}
                  </Link>
                  <div className="font-bold text-[#071a28] mt-0.5">{deal.leadName}</div>
                </div>
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${color.bg} ${color.text} ${color.border}`}
                >
                  {deal.status.replace(/_/g, " ")}
                </span>
              </div>

              <div className="flex items-center justify-between text-[#647581] text-[11px] pt-1">
                <span>{deal.propertyName}</span>
                {deal.unitNumber && <span className="font-mono font-bold text-[#071a28]">Unit {deal.unitNumber}</span>}
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-[rgba(7,26,40,0.06)]">
                <span className="font-bold text-[#071a28]">
                  {deal.offeredAmountRupees ? `₹${deal.offeredAmountRupees.toLocaleString("en-IN")}` : "No offer"}
                </span>
                <Link
                  href={`/dashboard/deals/${deal._id}`}
                  className="px-3 py-1.5 rounded-xl bg-[#0088cc] text-white font-semibold text-xs shadow-xs"
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

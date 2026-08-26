"use client";

import React from "react";
import Link from "next/link";
import { Building, ArrowRight, ShieldCheck, CreditCard, Clock, CheckCircle2 } from "lucide-react";
import { MoneyUtils } from "@/lib/utils/money";

interface PortalBookingsListViewProps {
  bookings: any[];
}

export function PortalBookingsListView({ bookings }: PortalBookingsListViewProps) {
  if (!bookings || bookings.length === 0) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
        <div className="bg-[#071a28]/90 border border-white/10 rounded-2xl p-12 text-white">
          <Building className="w-12 h-12 text-slate-500 mx-auto mb-4" />
          <h2 className="text-xl font-serif font-bold">No Bookings Found</h2>
          <p className="text-xs text-slate-400 mt-2 max-w-md mx-auto">
            You do not currently have any active bookings linked to your account. If you recently reserved a plot, please contact your sales advisor.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-white tracking-wide">
            Your Property Bookings
          </h1>
          <p className="text-xs text-slate-300 mt-1">
            View verified plot details, conveyance milestones, and linked payment plans.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {bookings.map((b) => (
          <div
            key={b._id}
            className="bg-[#071a28]/90 border border-white/10 rounded-2xl p-6 text-white shadow-xl hover:border-[#087fc3]/50 transition-all flex flex-col md:flex-row md:items-center justify-between gap-6"
          >
            <div className="space-y-2 max-w-xl">
              <div className="flex items-center space-x-2">
                <span className="text-xs font-mono font-semibold px-2.5 py-1 rounded-lg bg-[#087fc3]/20 text-[#087fc3] border border-[#087fc3]/30">
                  {b.bookingNumber}
                </span>
                <span className="text-xs px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {b.operationalStatus}
                </span>
              </div>

              <h2 className="text-xl font-serif font-bold text-white">
                {b.propertyId?.title || "Residential Plot"}
              </h2>

              <p className="text-xs text-slate-400">
                Plot #{b.unitId?.plotNumber || "N/A"} • Area: {b.unitId?.plotAreaSqYd || "N/A"} Sq. Yds.
              </p>

              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300 pt-2">
                <span className="flex items-center space-x-1.5">
                  <CreditCard className="w-3.5 h-3.5 text-[#087fc3]" />
                  <span>Approved Price: ₹{b.approvedPricingSnapshot?.agreedBasePriceRupees?.toLocaleString("en-IN") || "N/A"}</span>
                </span>
                <span className="flex items-center space-x-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>Booked on: {new Date(b.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row md:flex-col items-stretch sm:items-center md:items-end gap-3 shrink-0">
              <Link
                href={`/portal/bookings/${b._id}`}
                className="px-5 py-2.5 rounded-xl bg-[#087fc3] hover:bg-[#066ca8] text-xs font-semibold text-white shadow-md flex items-center justify-center space-x-2 transition-all"
              >
                <span>View Workspace</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

"use client";

import React from "react";
import Link from "next/link";
import {
  Building,
  CreditCard,
  ShieldCheck,
  CheckCircle2,
  Clock,
  ArrowLeft,
  FileText,
  Calendar,
  AlertCircle,
  LifeBuoy,
} from "lucide-react";
import { MoneyUtils } from "@/lib/utils/money";

interface PortalBookingDetailsViewProps {
  data: any;
}

export function PortalBookingDetailsView({ data }: PortalBookingDetailsViewProps) {
  const { booking, paymentPlan, instalments, payments, receipts, kycCase, applicants, milestones } =
    data;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Breadcrumb & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Link
          href="/portal/bookings"
          className="inline-flex items-center space-x-2 text-xs text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to All Bookings</span>
        </Link>

        <div className="flex items-center space-x-3">
          <Link
            href="/portal/support/new"
            className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold text-white transition-all flex items-center space-x-1.5"
          >
            <LifeBuoy className="w-3.5 h-3.5" />
            <span>Support Request</span>
          </Link>
        </div>
      </div>

      {/* Booking Header Banner */}
      <div className="bg-[#071a28]/90 border border-white/10 rounded-3xl p-6 sm:p-8 text-white shadow-xl space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-white/10">
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <span className="text-xs font-mono font-semibold px-2.5 py-1 rounded-lg bg-[#087fc3]/20 text-[#087fc3] border border-[#087fc3]/30">
                {booking.bookingNumber}
              </span>
              <span className="text-xs px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                {booking.operationalStatus}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-white">
              {booking.propertyId?.title}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1">
              Plot #{booking.unitId?.plotNumber || "N/A"} • Plot Area: {booking.unitId?.plotAreaSqYd || "N/A"} Sq. Yds.
            </p>
          </div>

          <div className="text-right space-y-1">
            <div className="text-xs text-slate-400">Agreed Price Snapshot</div>
            <div className="text-2xl font-bold font-serif text-white">
              ₹{booking.approvedPricingSnapshot?.agreedBasePriceRupees?.toLocaleString("en-IN") || "N/A"}
            </div>
          </div>
        </div>

        {/* Milestone Progress Flow */}
        <div>
          <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-300 mb-4">
            Conveyance & Milestone Progress
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {milestones.map((m: any, idx: number) => (
              <div
                key={m.key}
                className={`p-4 rounded-2xl border text-xs flex flex-col justify-between space-y-3 ${
                  m.isCompleted
                    ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                    : "bg-slate-800/60 border-white/10 text-slate-400"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono opacity-60">0{idx + 1}</span>
                  {m.isCompleted ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Clock className="w-4 h-4 text-slate-500" />
                  )}
                </div>
                <div>
                  <div className="font-semibold text-white">{m.title}</div>
                  <div className="text-[10px] opacity-80 mt-0.5">{m.description}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Grid: Payment Plan & KYC Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Payment Schedule */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-[#071a28]/90 border border-white/10 rounded-2xl p-6 text-white shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-serif font-bold text-white flex items-center space-x-2">
                <CreditCard className="w-5 h-5 text-[#087fc3]" />
                <span>Milestone Payment Schedule</span>
              </h2>

              {paymentPlan && (
                <span className="text-xs font-mono text-slate-400">
                  Plan #{paymentPlan.planNumber}
                </span>
              )}
            </div>

            {instalments && instalments.length > 0 ? (
              <div className="space-y-3">
                {instalments.map((inst: any) => (
                  <div
                    key={inst._id}
                    className="p-4 rounded-xl bg-white/5 border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold text-sm text-white">{inst.name}</span>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                            inst.status === "PAID"
                              ? "bg-emerald-500/20 text-emerald-300"
                              : inst.status === "OVERDUE"
                              ? "bg-rose-500/20 text-rose-300"
                              : "bg-amber-500/20 text-amber-300"
                          }`}
                        >
                          {inst.status}
                        </span>
                      </div>
                      <div className="text-xs text-slate-400 mt-1">
                        Due: {inst.dueDate ? new Date(inst.dueDate).toLocaleDateString("en-IN") : "Milestone linked"}
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-sm font-bold text-white font-serif">
                        {MoneyUtils.formatINR(inst.installmentAmountPaise)}
                      </div>
                      {inst.paidAmountPaise > 0 && (
                        <div className="text-[10px] text-emerald-400">
                          Paid: {MoneyUtils.formatINR(inst.paidAmountPaise)}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 text-center text-xs text-slate-400">
                Payment plan is currently being drafted by the accounts desk.
              </div>
            )}
          </div>
        </div>

        {/* Right 1 Col: KYC & Verification Status */}
        <div className="space-y-6">
          <div className="bg-[#071a28]/90 border border-white/10 rounded-2xl p-6 text-white shadow-xl space-y-4">
            <h2 className="text-lg font-serif font-bold text-white flex items-center space-x-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <span>KYC & Identity Case</span>
            </h2>

            {kycCase ? (
              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between pb-2 border-b border-white/10">
                  <span className="text-slate-400">Case Status:</span>
                  <span className="font-semibold text-emerald-400">{kycCase.status}</span>
                </div>
                <div className="flex items-center justify-between pb-2 border-b border-white/10">
                  <span className="text-slate-400">Risk Tier:</span>
                  <span className="font-semibold text-slate-200">{kycCase.riskRating || "STANDARD"}</span>
                </div>

                <div className="pt-2">
                  <Link
                    href={`/portal/kyc`}
                    className="w-full py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold text-white flex items-center justify-center space-x-1.5 transition-all"
                  >
                    <span>Manage Documents</span>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="p-4 text-xs text-slate-400">
                No KYC case initiated yet.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

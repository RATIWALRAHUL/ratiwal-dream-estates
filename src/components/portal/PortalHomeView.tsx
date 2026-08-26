"use client";

import React from "react";
import Link from "next/link";
import {
  Building,
  ShieldCheck,
  CreditCard,
  Calendar,
  LifeBuoy,
  FileText,
  ArrowRight,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ExternalLink,
} from "lucide-react";
import { MoneyUtils } from "@/lib/utils/money";

interface PortalHomeViewProps {
  data: any;
}

export function PortalHomeView({ data }: PortalHomeViewProps) {
  const { user, primaryBooking, activeKyc, nextInstalment, financialSummary, upcomingSiteVisits } =
    data;

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* 1. Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#071a28] via-[#0d314c] to-[#087fc3]/40 border border-white/10 p-6 sm:p-8 text-white shadow-2xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/10 border border-white/10 text-[11px] font-medium text-[#087fc3]">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Verified Customer Workspace</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold tracking-wide">
              Welcome back, {user?.name || "Valued Client"}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
              Track your land acquisition progress, milestone instalments, verification documents, and site visits in real time.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/portal/support/new"
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 text-xs font-semibold text-white transition-all flex items-center space-x-2"
            >
              <LifeBuoy className="w-4 h-4" />
              <span>Get Support</span>
            </Link>
            <Link
              href="/portal/payments"
              className="px-5 py-2.5 rounded-xl bg-[#087fc3] hover:bg-[#066ca8] text-xs font-semibold text-white shadow-lg shadow-[#087fc3]/30 transition-all flex items-center space-x-2"
            >
              <span>View Payment Plan</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* 2. Key Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Booking Card */}
        <div className="bg-[#071a28]/80 backdrop-blur-md border border-white/10 rounded-2xl p-5 text-white shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-slate-400 font-medium">Active Booking</span>
            <div className="p-2 rounded-xl bg-[#087fc3]/10 text-[#087fc3]">
              <Building className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-bold font-serif truncate">
            {primaryBooking ? primaryBooking.bookingNumber : "No Active Booking"}
          </div>
          <div className="text-xs text-slate-400 mt-1 truncate">
            {primaryBooking?.propertyId?.title || "Residential Plot"}
          </div>
        </div>

        {/* KYC Status */}
        <div className="bg-[#071a28]/80 backdrop-blur-md border border-white/10 rounded-2xl p-5 text-white shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-slate-400 font-medium">KYC Verification</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-bold font-serif flex items-center space-x-2">
            <span>{activeKyc?.status || "IN_PROGRESS"}</span>
          </div>
          <div className="text-xs text-slate-400 mt-1">
            {activeKyc?.status === "VERIFIED"
              ? "All documents verified"
              : "Review & submission pending"}
          </div>
        </div>

        {/* Total Outstanding */}
        <div className="bg-[#071a28]/80 backdrop-blur-md border border-white/10 rounded-2xl p-5 text-white shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-slate-400 font-medium">Outstanding Balance</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-bold font-serif text-amber-300">
            {financialSummary.formattedOutstanding}
          </div>
          <div className="text-xs text-slate-400 mt-1">
            Paid: ₹{financialSummary.totalPaidAmountRupees.toLocaleString("en-IN")}
          </div>
        </div>

        {/* Site Visits */}
        <div className="bg-[#071a28]/80 backdrop-blur-md border border-white/10 rounded-2xl p-5 text-white shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-slate-400 font-medium">Upcoming Visit</span>
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-bold font-serif truncate">
            {upcomingSiteVisits && upcomingSiteVisits.length > 0
              ? new Date(upcomingSiteVisits[0].scheduledDate).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                })
              : "None Scheduled"}
          </div>
          <div className="text-xs text-slate-400 mt-1 truncate">
            {upcomingSiteVisits && upcomingSiteVisits.length > 0
              ? upcomingSiteVisits[0].propertyId?.title || "Property inspection"
              : "Plan an on-site visit"}
          </div>
        </div>
      </div>

      {/* 3. Main Split Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Primary Property & Next Instalment */}
        <div className="lg:col-span-2 space-y-6">
          {/* Active Booking Card */}
          {primaryBooking ? (
            <div className="bg-[#071a28]/90 border border-white/10 rounded-2xl p-6 text-white shadow-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
                <div>
                  <span className="text-xs uppercase tracking-wider text-[#087fc3] font-semibold">
                    Current Property & Unit
                  </span>
                  <h2 className="text-xl font-serif font-bold text-white mt-1">
                    {primaryBooking.propertyId?.title}
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Plot #{primaryBooking.unitId?.plotNumber || "N/A"} • Area:{" "}
                    {primaryBooking.unitId?.plotAreaSqYd || "N/A"} Sq. Yds.
                  </p>
                </div>
                <Link
                  href={`/portal/bookings/${primaryBooking._id}`}
                  className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold text-white transition-all self-start"
                >
                  <span>View Details</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              </div>

              {/* Progress Milestones preview */}
              <div className="pt-6">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300 mb-4">
                  Conveyance Progress
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 flex items-center space-x-2.5">
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                    <div>
                      <div className="font-semibold">Booking Created</div>
                      <div className="text-[10px] text-emerald-400/80">
                        {primaryBooking.bookingNumber}
                      </div>
                    </div>
                  </div>

                  <div
                    className={`p-3.5 rounded-xl border flex items-center space-x-2.5 ${
                      activeKyc?.status === "VERIFIED"
                        ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-300"
                        : "bg-amber-500/10 border-amber-500/20 text-amber-300"
                    }`}
                  >
                    {activeKyc?.status === "VERIFIED" ? (
                      <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                    ) : (
                      <Clock className="w-4 h-4 shrink-0 text-amber-400" />
                    )}
                    <div>
                      <div className="font-semibold">Identity Verification</div>
                      <div className="text-[10px] opacity-80">
                        {activeKyc?.status || "In Progress"}
                      </div>
                    </div>
                  </div>

                  <div
                    className={`p-3.5 rounded-xl border flex items-center space-x-2.5 ${
                      financialSummary.totalPaidAmountRupees > 0
                        ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-300"
                        : "bg-slate-800/80 border-white/10 text-slate-400"
                    }`}
                  >
                    {financialSummary.totalPaidAmountRupees > 0 ? (
                      <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                    ) : (
                      <Clock className="w-4 h-4 shrink-0 text-slate-500" />
                    )}
                    <div>
                      <div className="font-semibold">Payment Plan</div>
                      <div className="text-[10px] opacity-80">Active Schedule</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-[#071a28]/90 border border-white/10 rounded-2xl p-8 text-center text-white">
              <Building className="w-10 h-10 text-slate-500 mx-auto mb-3" />
              <h3 className="text-lg font-serif font-bold">No Operational Booking Found</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                Your account is activated. Once your booking is finalized by our sales desk, all details will appear here.
              </p>
            </div>
          )}

          {/* Next Scheduled Payment Milestone */}
          {nextInstalment && (
            <div className="bg-[#071a28]/90 border border-white/10 rounded-2xl p-6 text-white shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs uppercase tracking-wider text-amber-400 font-semibold flex items-center space-x-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Next Milestone Due</span>
                </span>
                <span className="text-xs px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-medium">
                  {nextInstalment.status}
                </span>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h4 className="text-lg font-serif font-bold text-white">
                    {nextInstalment.name}
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Due Date:{" "}
                    {nextInstalment.dueDate
                      ? new Date(nextInstalment.dueDate).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })
                      : "Upon Milestone Completion"}
                  </p>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <div className="text-lg font-bold text-white font-serif">
                      ₹{MoneyUtils.toMajorUnits(nextInstalment.outstandingAmountPaise).toLocaleString("en-IN")}
                    </div>
                    <div className="text-[10px] text-slate-400">Payable Balance</div>
                  </div>

                  <Link
                    href="/portal/payments"
                    className="px-4 py-2.5 rounded-xl bg-[#087fc3] hover:bg-[#066ca8] text-xs font-semibold text-white shadow-md transition-all"
                  >
                    Pay Online
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right 1 Col: Quick Links, Support & Visits */}
        <div className="space-y-6">
          {/* Quick Actions Panel */}
          <div className="bg-[#071a28]/90 border border-white/10 rounded-2xl p-6 text-white shadow-xl space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Quick Portals
            </h3>

            <Link
              href="/portal/kyc"
              className="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 transition-all text-xs"
            >
              <div className="flex items-center space-x-3">
                <ShieldCheck className="w-4 h-4 text-[#087fc3]" />
                <span className="font-medium">Upload KYC Documents</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
            </Link>

            <Link
              href="/portal/documents"
              className="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 transition-all text-xs"
            >
              <div className="flex items-center space-x-3">
                <FileText className="w-4 h-4 text-emerald-400" />
                <span className="font-medium">Download Receipts & Vault</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
            </Link>

            <Link
              href="/portal/site-visits/new"
              className="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 transition-all text-xs"
            >
              <div className="flex items-center space-x-3">
                <Calendar className="w-4 h-4 text-purple-400" />
                <span className="font-medium">Schedule Site Inspection</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
            </Link>

            <Link
              href="/portal/support"
              className="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 transition-all text-xs"
            >
              <div className="flex items-center space-x-3">
                <LifeBuoy className="w-4 h-4 text-amber-400" />
                <span className="font-medium">Customer Care & Tickets</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
            </Link>
          </div>

          {/* Institutional Compliance Notice */}
          <div className="p-5 rounded-2xl bg-slate-900/60 border border-white/5 text-slate-400 text-xs space-y-2">
            <div className="flex items-center space-x-2 text-slate-300 font-medium">
              <ShieldCheck className="w-4 h-4 text-[#087fc3]" />
              <span>RERA & DPDP Compliance</span>
            </div>
            <p className="text-[11px] leading-relaxed text-slate-500">
              All transactions, receipts, and identity documents are encrypted and audited according to Indian Real Estate (RERA) and Digital Personal Data Protection (DPDP) standards.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

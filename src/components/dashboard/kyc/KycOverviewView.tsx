"use client";

import React from "react";
import Link from "next/link";
import {
  ShieldCheck,
  FileCheck,
  Clock,
  AlertTriangle,
  FileText,
  UserCheck,
  Layers,
  ArrowRight,
  Lock,
  ExternalLink,
  Plus,
  RefreshCw,
} from "lucide-react";
import { KycOverviewMetrics } from "@/types/kyc";

interface KycOverviewViewProps {
  metrics: KycOverviewMetrics;
  recentCases: any[];
}

export function KycOverviewView({ metrics, recentCases }: KycOverviewViewProps) {
  const statCards = [
    {
      label: "Total KYC Cases",
      value: metrics.totalCases,
      sublabel: `${metrics.completed} verified & completed`,
      icon: ShieldCheck,
      color: "text-[#087fc3]",
      bg: "bg-[#eaf5fa]",
    },
    {
      label: "Awaiting Review",
      value: metrics.submitted + metrics.underReview,
      sublabel: `${metrics.submitted} new, ${metrics.underReview} in progress`,
      icon: Clock,
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
    {
      label: "Action Required",
      value: metrics.actionRequired,
      sublabel: "Needs customer correction",
      icon: AlertTriangle,
      color: "text-rose-600",
      bg: "bg-rose-50",
    },
    {
      label: "Blocking Bookings",
      value: metrics.blockingBookingCount,
      sublabel: "Bookings pending KYC verification",
      icon: Lock,
      color: "text-purple-600",
      bg: "bg-purple-50",
    },
  ];

  return (
    <div className="space-y-8 antialiased">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono uppercase tracking-widest text-[#087fc3] font-bold">
              PRD 15 • Compliance & Due Diligence
            </span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
              DPDPA 2023 Compliant
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold font-serif text-[#071a28] tracking-tight mt-1">
            Customer KYC & Verification
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Privacy-first identity due diligence, document verification workflows, and statutory registry compliance.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/kyc/review"
            className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-[#071a28] font-bold text-xs flex items-center gap-2 shadow-xs transition-colors"
          >
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            <span>Review Queue</span>
            {metrics.submitted > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-amber-100 text-amber-800 text-[10px]">
                {metrics.submitted}
              </span>
            )}
          </Link>

          <Link
            href="/dashboard/kyc/cases/new"
            className="px-4 py-2.5 rounded-xl bg-[#071a28] hover:bg-[#0d2c42] text-white font-bold text-xs flex items-center gap-2 shadow-md transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Initiate KYC Case</span>
          </Link>
        </div>
      </div>

      {/* Blocking Bookings Alert Banner */}
      {metrics.blockingBookingCount > 0 && (
        <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-800 flex items-center justify-center shrink-0">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <p className="font-bold text-[#071a28]">
                {metrics.blockingBookingCount} Operational Booking{metrics.blockingBookingCount > 1 ? "s" : ""} Awaiting Mandatory KYC Completion
              </p>
              <p className="text-slate-600 text-[11px] mt-0.5">
                Per compliance policy, booking confirmation from RESERVED to SOLD requires fully satisfied KYC verification.
              </p>
            </div>
          </div>
          <Link
            href="/dashboard/kyc/cases?blockingBookingOnly=true"
            className="px-3 py-1.5 rounded-xl bg-white border border-amber-300 text-amber-900 font-bold text-[11px] hover:bg-amber-100 transition-colors whitespace-nowrap self-start sm:self-center"
          >
            View Blocking Cases →
          </Link>
        </div>
      )}

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((c) => {
          const Icon = c.icon;
          return (
            <div
              key={c.label}
              className="p-5 rounded-3xl bg-white border border-[rgba(7,26,40,0.08)] shadow-xs space-y-2 hover:border-slate-300 transition-colors"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  {c.label}
                </span>
                <div className={`w-8 h-8 rounded-xl ${c.bg} ${c.color} flex items-center justify-center`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-bold font-serif text-[#071a28]">{c.value}</div>
              <div className="text-[11px] text-slate-500">{c.sublabel}</div>
            </div>
          );
        })}
      </div>

      {/* Main Content Split: Recent Cases & Compliance Navigation */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): Active Cases Stream */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-3xl border border-[rgba(7,26,40,0.08)] p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold font-serif text-[#071a28] uppercase tracking-wider">
                  Active KYC Cases
                </h3>
                <p className="text-[11px] text-slate-500">Most recent identity verification workflows</p>
              </div>
              <Link
                href="/dashboard/kyc/cases"
                className="text-xs font-bold text-[#087fc3] hover:underline flex items-center gap-1"
              >
                <span>View All Cases</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {recentCases.length === 0 ? (
              <div className="p-8 text-center bg-[#fbfaf8] rounded-2xl border border-dashed border-slate-200 text-xs text-slate-500">
                No KYC cases found. Create a new case from an active deal or reservation.
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {recentCases.map((kCase) => {
                  const statusColors: Record<string, string> = {
                    COMPLETED: "bg-emerald-50 text-emerald-800 border-emerald-200",
                    UNDER_REVIEW: "bg-blue-50 text-blue-800 border-blue-200",
                    SUBMITTED: "bg-amber-50 text-amber-800 border-amber-200",
                    ACTION_REQUIRED: "bg-rose-50 text-rose-800 border-rose-200",
                    IN_PROGRESS: "bg-slate-100 text-slate-700 border-slate-200",
                  };
                  return (
                    <div
                      key={kCase._id}
                      className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs hover:bg-[#fbfaf8] rounded-xl px-2 transition-colors"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-[#071a28]">
                            {kCase.kycCaseNumber}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-full font-bold text-[10px] border ${
                              statusColors[kCase.status] || "bg-slate-100 text-slate-700"
                            }`}
                          >
                            {kCase.status.replace(/_/g, " ")}
                          </span>
                        </div>
                        <div className="text-slate-600 font-semibold">
                          {kCase.partyId?.displayName || "Buyer Entity"} • {kCase.propertyId?.title || "Property"}
                        </div>
                      </div>

                      <div className="flex items-center gap-4 text-[11px] text-slate-500">
                        <span>
                          {kCase.satisfiedRequirementsCount}/{kCase.totalRequirementsCount} Completed
                        </span>
                        <Link
                          href={`/dashboard/kyc/cases/${kCase._id}`}
                          className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-[#071a28] font-bold text-xs transition-colors"
                        >
                          Workspace
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Governance Quick Actions & Links */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-[rgba(7,26,40,0.08)] p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold font-serif text-[#071a28] uppercase tracking-wider">
              Governance & Privacy
            </h3>

            <div className="space-y-2 text-xs">
              <Link
                href="/dashboard/kyc/review"
                className="p-3.5 rounded-2xl bg-[#fbfaf8] border border-slate-100 hover:border-slate-300 flex items-center justify-between transition-colors block"
              >
                <div className="flex items-center gap-3">
                  <Clock className="w-4 h-4 text-amber-600" />
                  <div>
                    <div className="font-bold text-[#071a28]">Document Review Queue</div>
                    <div className="text-[11px] text-slate-500">Pending verification actions</div>
                  </div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </Link>

              <Link
                href="/dashboard/kyc/expiring"
                className="p-3.5 rounded-2xl bg-[#fbfaf8] border border-slate-100 hover:border-slate-300 flex items-center justify-between transition-colors block"
              >
                <div className="flex items-center gap-3">
                  <AlertTriangle className="w-4 h-4 text-rose-500" />
                  <div>
                    <div className="font-bold text-[#071a28]">Expiring Documents</div>
                    <div className="text-[11px] text-slate-500">Upcoming document renewals</div>
                  </div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </Link>

              <Link
                href="/dashboard/kyc/privacy-requests"
                className="p-3.5 rounded-2xl bg-[#fbfaf8] border border-slate-100 hover:border-slate-300 flex items-center justify-between transition-colors block"
              >
                <div className="flex items-center gap-3">
                  <UserCheck className="w-4 h-4 text-[#087fc3]" />
                  <div>
                    <div className="font-bold text-[#071a28]">Data Principal Requests</div>
                    <div className="text-[11px] text-slate-500">DPDPA Access, Correction & Erasure</div>
                  </div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </Link>

              <Link
                href="/dashboard/kyc/settings"
                className="p-3.5 rounded-2xl bg-[#fbfaf8] border border-slate-100 hover:border-slate-300 flex items-center justify-between transition-colors block"
              >
                <div className="flex items-center gap-3">
                  <Layers className="w-4 h-4 text-slate-600" />
                  <div>
                    <div className="font-bold text-[#071a28]">Templates & Retention</div>
                    <div className="text-[11px] text-slate-500">Policy rules, legal holds & audits</div>
                  </div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </Link>
            </div>
          </div>

          <div className="p-5 rounded-3xl bg-[#071a28] text-white space-y-2">
            <div className="text-[10px] font-mono uppercase text-[#42b7e8] tracking-widest font-bold">
              Privacy & Security Policy
            </div>
            <h4 className="font-serif font-bold text-sm">Protected PII Architecture</h4>
            <p className="text-[11px] text-[#cbd5e1] leading-relaxed">
              All raw identity fields are encrypted at rest with AES-256-GCM. Plaintext Aadhaar numbers and biometrics are never stored. Duplicate detection uses server-side keyed HMACs.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

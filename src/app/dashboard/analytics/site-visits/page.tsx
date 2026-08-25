import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { getAdminSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { AnalyticsService } from "@/lib/services/analytics.service";
import { AnalyticsDateRangeFilter } from "@/components/dashboard/analytics/AnalyticsDateRangeFilter";
import { DemandDistributionChart } from "@/components/dashboard/analytics/DemandDistributionChart";
import { ArrowLeft, Calendar, CheckCircle2, XCircle, Clock, Users } from "lucide-react";
import { AnalyticsFilterParams, AnalyticsDatePreset } from "@/types/analytics";

export const metadata: Metadata = {
  title: "Site Visit & Tour Performance Analytics | Ratiwal Dream Estates Dashboard",
  description: "Tour scheduling completion rates, cancellation reasons, and operational no-show metrics.",
};

interface SiteVisitsAnalyticsPageProps {
  searchParams: Promise<{
    preset?: string;
    dateFrom?: string;
    dateTo?: string;
  }>;
}

export default async function SiteVisitsAnalyticsPage({ searchParams }: SiteVisitsAnalyticsPageProps) {
  const session = await getAdminSession();
  if (!session) redirect("/dashboard/login");

  const params = await searchParams;
  const filterParams: AnalyticsFilterParams = {
    preset: (params.preset as AnalyticsDatePreset) || "LAST_30_DAYS",
    dateFrom: params.dateFrom,
    dateTo: params.dateTo,
  };

  const data = await AnalyticsService.getSiteVisitAnalytics(filterParams, session);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <Link
            href="/dashboard/analytics"
            className="inline-flex items-center gap-1.5 text-xs text-[#647581] hover:text-[#071a28] transition-colors mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Analytics Overview
          </Link>
          <h1 className="text-2xl font-bold font-serif text-[#071a28] tracking-tight">
            Site Visit Performance & Tour Outcomes
          </h1>
          <p className="text-sm text-[#647581] mt-1">
            Execution rates of guided plotted asset visits, tour completion metrics, and cancellation reasons.
          </p>
        </div>
      </div>

      {/* Date Filter */}
      <Suspense>
        <AnalyticsDateRangeFilter />
      </Suspense>

      {/* 4 Summary Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-[rgba(7,26,40,0.08)] shadow-xs p-5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase text-[#647581] font-bold">Total Requested</span>
            <Calendar className="w-4 h-4 text-[#087fc3]" />
          </div>
          <p className="text-3xl font-bold font-serif text-[#071a28]">{data.totalRequested}</p>
          <p className="text-[10px] text-[#647581]">{data.totalScheduled} locked with advisor</p>
        </div>

        <div className="bg-white rounded-2xl border border-[rgba(7,26,40,0.08)] shadow-xs p-5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase text-emerald-700 font-bold">Completed</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-3xl font-bold font-serif text-emerald-800">{data.totalCompleted}</p>
          <p className="text-[10px] text-emerald-700 font-bold">{data.completionRate}% completion rate</p>
        </div>

        <div className="bg-white rounded-2xl border border-[rgba(7,26,40,0.08)] shadow-xs p-5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase text-rose-600 font-bold">Cancelled</span>
            <XCircle className="w-4 h-4 text-rose-600" />
          </div>
          <p className="text-3xl font-bold font-serif text-rose-700">{data.totalCancelled}</p>
          <p className="text-[10px] text-rose-600">{data.cancellationRate}% cancellation rate</p>
        </div>

        <div className="bg-white rounded-2xl border border-[rgba(7,26,40,0.08)] shadow-xs p-5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase text-purple-700 font-bold">Inquiry → Visit Time</span>
            <Clock className="w-4 h-4 text-purple-700" />
          </div>
          <p className="text-3xl font-bold font-serif text-purple-800">
            {data.avgHoursFromInquiryToVisit !== null ? `${data.avgHoursFromInquiryToVisit}h` : "—"}
          </p>
          <p className="text-[10px] text-purple-700">Average booking lead time</p>
        </div>
      </div>

      {/* Breakdowns Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cancellation Reasons */}
        <div className="bg-white rounded-2xl border border-[rgba(7,26,40,0.08)] shadow-xs p-6 space-y-4">
          <div className="pb-3 border-b border-[rgba(7,26,40,0.06)]">
            <h3 className="text-base font-bold font-serif text-[#071a28]">Cancellation Reasons</h3>
            <p className="text-xs text-[#647581] mt-0.5">Reasons logged by staff upon tour cancellation.</p>
          </div>

          <DemandDistributionChart
            items={data.cancellationReasonBreakdown.map((r) => ({
              label: r.label,
              count: r.count,
              percentage: r.percentage,
            }))}
          />
        </div>

        {/* Tour Meeting Modes */}
        <div className="bg-white rounded-2xl border border-[rgba(7,26,40,0.08)] shadow-xs p-6 space-y-4">
          <div className="pb-3 border-b border-[rgba(7,26,40,0.06)]">
            <h3 className="text-base font-bold font-serif text-[#071a28]">Tour Meeting Modes</h3>
            <p className="text-xs text-[#647581] mt-0.5">In-Person physical visits vs Virtual live walkthroughs.</p>
          </div>

          <div className="space-y-3">
            {data.meetingModeBreakdown.map((m) => (
              <div key={m.mode} className="p-3.5 rounded-xl bg-[#f8f7f4] flex items-center justify-between">
                <span className="text-xs font-bold text-[#071a28]">{m.label}</span>
                <span className="font-mono text-xs font-bold text-[#087fc3]">{m.count} visits</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { getAdminSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { AnalyticsService } from "@/lib/services/analytics.service";
import { AnalyticsDateRangeFilter } from "@/components/dashboard/analytics/AnalyticsDateRangeFilter";
import { FunnelChart } from "@/components/dashboard/analytics/FunnelChart";
import { DemandDistributionChart } from "@/components/dashboard/analytics/DemandDistributionChart";
import { ArrowLeft, Clock, ShieldAlert } from "lucide-react";
import { AnalyticsFilterParams, AnalyticsDatePreset } from "@/types/analytics";

export const metadata: Metadata = {
  title: "Sales Funnel Intelligence | Ratiwal Dream Estates Dashboard",
  description: "Stage-to-stage lead conversion tracking, drop-off analysis, and stage duration metrics.",
};

interface FunnelPageProps {
  searchParams: Promise<{
    preset?: string;
    dateFrom?: string;
    dateTo?: string;
  }>;
}

export default async function FunnelPage({ searchParams }: FunnelPageProps) {
  const session = await getAdminSession();
  if (!session) redirect("/dashboard/login");

  const params = await searchParams;
  const filterParams: AnalyticsFilterParams = {
    preset: (params.preset as AnalyticsDatePreset) || "LAST_30_DAYS",
    dateFrom: params.dateFrom,
    dateTo: params.dateTo,
  };

  const funnelData = await AnalyticsService.getFunnelAnalytics(filterParams, session);

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
            Sales Funnel & Stage Duration Intelligence
          </h1>
          <p className="text-sm text-[#647581] mt-1">
            Real pipeline progression from raw inquiry through qualification, site visits, negotiations, and outcomes.
          </p>
        </div>
      </div>

      {/* Date Filter */}
      <Suspense>
        <AnalyticsDateRangeFilter />
      </Suspense>

      {/* Main Funnel and Lost Reasons Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Funnel Visualization */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-[rgba(7,26,40,0.08)] shadow-xs p-6 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-[rgba(7,26,40,0.06)]">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#647581] font-bold">
                LEAD STAGE PROGRESSION
              </span>
              <h3 className="text-base font-bold font-serif text-[#071a28] mt-0.5">
                Conversion Pipeline ({funnelData.totalEntered} Inquiries Entered)
              </h3>
            </div>
          </div>

          <FunnelChart stages={funnelData.stages} totalEntered={funnelData.totalEntered} />

          {/* Historical Duration Coverage Note */}
          <div className="p-4 bg-[#f8f7f4] rounded-xl border border-[rgba(7,26,40,0.06)] text-xs text-[#647581] flex items-start gap-2.5">
            <Clock className="w-4 h-4 text-[#087fc3] shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-semibold text-[#071a28]">Stage Duration Tracking Protocol</p>
              <p className="text-[11px] leading-relaxed">
                Stage durations are computed exclusively from the append-only `LeadStageHistory` ledger.
                Coverage started on {new Date(funnelData.stageHistoryCoverageStartDate).toLocaleDateString("en-IN", { dateStyle: "medium" })}.
                Historical transitions prior to this date are never fabricated or estimated.
              </p>
            </div>
          </div>
        </div>

        {/* Lost Reasons Breakdown */}
        <div className="bg-white rounded-2xl border border-[rgba(7,26,40,0.08)] shadow-xs p-6 space-y-6">
          <div className="pb-4 border-b border-[rgba(7,26,40,0.06)]">
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#647581] font-bold">
              OPPORTUNITY LOSS REASONS
            </span>
            <h3 className="text-base font-bold font-serif text-[#071a28] mt-0.5">
              Lost Deal Attribution
            </h3>
            <p className="text-xs text-[#647581] mt-0.5">
              Documented reasons when leads do not proceed.
            </p>
          </div>

          <DemandDistributionChart
            items={funnelData.lostReasonBreakdown.map((r) => ({
              label: r.label,
              count: r.count,
              percentage: r.percentage,
            }))}
          />
        </div>
      </div>
    </div>
  );
}

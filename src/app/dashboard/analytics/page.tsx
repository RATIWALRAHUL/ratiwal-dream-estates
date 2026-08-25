import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { getAdminSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { AnalyticsService } from "@/lib/services/analytics.service";
import { AnalyticsDateRangeFilter } from "@/components/dashboard/analytics/AnalyticsDateRangeFilter";
import { AnalyticsKpiCard } from "@/components/dashboard/analytics/AnalyticsKpiCard";
import { TimeSeriesTrendChart } from "@/components/dashboard/analytics/TimeSeriesTrendChart";
import { DemandDistributionChart } from "@/components/dashboard/analytics/DemandDistributionChart";
import {
  Users,
  Calendar,
  Clock,
  TrendingUp,
  ShieldCheck,
  FileText,
  AlertTriangle,
  Building,
  MapPin,
} from "lucide-react";
import { AnalyticsFilterParams, AnalyticsDatePreset } from "@/types/analytics";

export const metadata: Metadata = {
  title: "Executive Analytics & Intelligence | Ratiwal Dream Estates Dashboard",
  description: "Real database-backed executive KPIs, sales funnel movements, and demand analytics.",
};

interface AnalyticsPageProps {
  searchParams: Promise<{
    preset?: string;
    dateFrom?: string;
    dateTo?: string;
    advisorId?: string;
    propertyId?: string;
    locationId?: string;
    source?: string;
  }>;
}

export default async function AnalyticsPage({ searchParams }: AnalyticsPageProps) {
  const session = await getAdminSession();
  if (!session) redirect("/dashboard/login");

  const params = await searchParams;
  const filterParams: AnalyticsFilterParams = {
    preset: (params.preset as AnalyticsDatePreset) || "LAST_30_DAYS",
    dateFrom: params.dateFrom,
    dateTo: params.dateTo,
    advisorId: params.advisorId,
    propertyId: params.propertyId,
    locationId: params.locationId,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    source: (params.source as any) || "ALL",
  };

  const data = await AnalyticsService.getOverviewAnalytics(filterParams, session);

  return (
    <div className="space-y-6">
      {/* Header & Sub-Nav Links */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-[10px] font-mono uppercase tracking-widest text-[#647581] mb-1">
            BUSINESS INTELLIGENCE & PERFORMANCE
          </p>
          <h1 className="text-2xl font-bold font-serif text-[#071a28] tracking-tight">
            Sales Funnel & Demand Analytics
          </h1>
          <p className="text-sm text-[#647581] mt-1">
            Real-time conversion tracking, advisor workload benchmarks, and plotted asset demand insights.
          </p>
        </div>

        {/* Analytics Sub-nav */}
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/dashboard/analytics/funnel"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-[rgba(7,26,40,0.12)] text-[#071a28] hover:bg-white text-xs font-bold transition-colors shadow-2xs"
          >
            <TrendingUp className="w-3.5 h-3.5 text-[#087fc3]" />
            <span>Funnel</span>
          </Link>
          <Link
            href="/dashboard/analytics/properties"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-[rgba(7,26,40,0.12)] text-[#071a28] hover:bg-white text-xs font-bold transition-colors shadow-2xs"
          >
            <Building className="w-3.5 h-3.5 text-[#087fc3]" />
            <span>Properties</span>
          </Link>
          <Link
            href="/dashboard/analytics/team"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-[rgba(7,26,40,0.12)] text-[#071a28] hover:bg-white text-xs font-bold transition-colors shadow-2xs"
          >
            <Users className="w-3.5 h-3.5 text-[#087fc3]" />
            <span>Advisors</span>
          </Link>
          <Link
            href="/dashboard/analytics/site-visits"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-[rgba(7,26,40,0.12)] text-[#071a28] hover:bg-white text-xs font-bold transition-colors shadow-2xs"
          >
            <Calendar className="w-3.5 h-3.5 text-[#087fc3]" />
            <span>Site Visits</span>
          </Link>
          <Link
            href="/dashboard/reports"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#071a28] text-white hover:bg-[#087fc3] text-xs font-bold transition-colors shadow-xs"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Reports</span>
          </Link>
        </div>
      </div>

      {/* Date Range Preset Selector */}
      <Suspense>
        <AnalyticsDateRangeFilter />
      </Suspense>

      {/* Top Level Core KPIs (8 Cards) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        <AnalyticsKpiCard
          title="Total Inquiries"
          metric={data.metrics.totalInquiries}
          subtitle={`vs ${data.comparisonLabel}`}
          icon={<Users className="w-4 h-4" />}
        />
        <AnalyticsKpiCard
          title="Qualified Prospects"
          metric={data.metrics.qualifiedLeads}
          subtitle={`${data.metrics.inquiryToLeadRate.formatted} qual. rate`}
          icon={<ShieldCheck className="w-4 h-4" />}
        />
        <AnalyticsKpiCard
          title="Site Visits Booked"
          metric={data.metrics.totalSiteVisits}
          subtitle={`${data.metrics.leadToVisitConversionRate.formatted} conversion`}
          icon={<Calendar className="w-4 h-4" />}
        />
        <AnalyticsKpiCard
          title="Completed Tours"
          metric={data.metrics.completedSiteVisits}
          subtitle={`${data.metrics.siteVisitCompletionRate.formatted} tour success`}
          icon={<Calendar className="w-4 h-4" />}
        />
        <AnalyticsKpiCard
          title="First Human Response"
          metric={data.metrics.avgFirstResponseHours}
          subtitle="Staff interaction SLA"
          icon={<Clock className="w-4 h-4" />}
          invertColors={true}
        />
        <AnalyticsKpiCard
          title="Active CRM Pipeline"
          metric={data.metrics.activePipelineLeads}
          subtitle="In active advisory stages"
          icon={<TrendingUp className="w-4 h-4" />}
        />
        <AnalyticsKpiCard
          title="Unassigned Leads"
          metric={data.metrics.unassignedLeads}
          subtitle="Pending staff allocation"
          icon={<AlertTriangle className="w-4 h-4" />}
          invertColors={true}
        />
        <AnalyticsKpiCard
          title="Communication Deliveries"
          metric={data.metrics.communicationDeliveryRate}
          subtitle="Email & WhatsApp verified"
          icon={<ShieldCheck className="w-4 h-4" />}
        />
      </div>

      {/* Time Series Trend Section */}
      <div className="bg-white rounded-2xl border border-[rgba(7,26,40,0.08)] shadow-xs p-6 space-y-4">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-widest text-[#647581] font-bold">
            HISTORICAL TRAJECTORY
          </span>
          <h3 className="text-lg font-bold font-serif text-[#071a28] mt-0.5">
            Inquiry, Lead & Site Visit Trends ({data.periodLabel})
          </h3>
        </div>

        <TimeSeriesTrendChart
          dates={data.timeSeries.dates}
          inquiries={data.timeSeries.inquiries}
          leads={data.timeSeries.leads}
          siteVisits={data.timeSeries.siteVisits}
        />
      </div>

      {/* Demand & Breakdown Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Source Mix */}
        <div className="bg-white rounded-2xl border border-[rgba(7,26,40,0.08)] shadow-xs p-6 space-y-4">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#647581] font-bold">
              ATTRIBUTION & CHANNELS
            </span>
            <h3 className="text-base font-bold font-serif text-[#071a28] mt-0.5">
              Inquiry Source Distribution
            </h3>
          </div>

          <DemandDistributionChart
            items={data.sourceDistribution.map((s) => ({
              label: s.label,
              count: s.count,
              percentage: s.percentage,
            }))}
          />
        </div>

        {/* Top Demand Properties */}
        <div className="bg-white rounded-2xl border border-[rgba(7,26,40,0.08)] shadow-xs p-6 space-y-4">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#647581] font-bold">
              PLOTTED ASSET DEMAND
            </span>
            <h3 className="text-base font-bold font-serif text-[#071a28] mt-0.5">
              Top Demand Properties
            </h3>
          </div>

          <div className="divide-y divide-[rgba(7,26,40,0.04)]">
            {data.topDemandProperties.length === 0 ? (
              <div className="p-8 text-center text-xs text-[#647581]">
                No property inquiries recorded in this period.
              </div>
            ) : (
              data.topDemandProperties.map((prop) => (
                <div key={prop.propertyId} className="py-3 flex items-center justify-between gap-3">
                  <div>
                    <h4 className="text-xs font-bold text-[#071a28] hover:text-[#087fc3]">
                      <Link href={`/properties/${prop.slug}`} target="_blank">
                        {prop.title}
                      </Link>
                    </h4>
                    <p className="text-[10px] text-[#647581] mt-0.5 flex items-center gap-1">
                      <MapPin className="w-2.5 h-2.5" />
                      <span>{prop.locationName}</span>
                    </p>
                  </div>

                  <div className="text-right font-mono text-xs">
                    <span className="font-bold text-[#071a28]">{prop.inquiryCount} inq</span>
                    <span className="text-[10px] text-[#647581] block">
                      {prop.siteVisitCount} visits ({prop.conversionRate}%)
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { getAdminSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { AnalyticsService } from "@/lib/services/analytics.service";
import { AnalyticsDateRangeFilter } from "@/components/dashboard/analytics/AnalyticsDateRangeFilter";
import { ArrowLeft, Building, MapPin, ExternalLink } from "lucide-react";
import { AnalyticsFilterParams, AnalyticsDatePreset } from "@/types/analytics";

export const metadata: Metadata = {
  title: "Property & Location Demand Analytics | Ratiwal Dream Estates Dashboard",
  description: "Granular inquiry, lead, and site-visit demand breakdowns across plotted developments.",
};

interface PropertiesAnalyticsPageProps {
  searchParams: Promise<{
    preset?: string;
    dateFrom?: string;
    dateTo?: string;
  }>;
}

export default async function PropertiesAnalyticsPage({ searchParams }: PropertiesAnalyticsPageProps) {
  const session = await getAdminSession();
  if (!session) redirect("/dashboard/login");

  const params = await searchParams;
  const filterParams: AnalyticsFilterParams = {
    preset: (params.preset as AnalyticsDatePreset) || "LAST_30_DAYS",
    dateFrom: params.dateFrom,
    dateTo: params.dateTo,
  };

  const data = await AnalyticsService.getPropertyDemandAnalytics(filterParams, session);

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
            Property & Location Demand Intelligence
          </h1>
          <p className="text-sm text-[#647581] mt-1">
            Real market demand metrics, qualified prospect volume, and site-visit interest per plotted development.
          </p>
        </div>
      </div>

      {/* Date Range Filter */}
      <Suspense>
        <AnalyticsDateRangeFilter />
      </Suspense>

      {/* Properties Demand Table */}
      <div className="bg-white rounded-2xl border border-[rgba(7,26,40,0.08)] shadow-xs overflow-hidden">
        <div className="p-4 bg-[#f8f7f4] border-b border-[rgba(7,26,40,0.06)] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Building className="w-4 h-4 text-[#087fc3]" />
            <h3 className="text-xs font-bold text-[#071a28]">Plotted Assets Performance ({data.properties.length} Properties)</h3>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#f8f7f4] border-b border-[rgba(7,26,40,0.06)] text-[10px] font-mono uppercase tracking-wider text-[#647581]">
                <th className="py-3 px-4">Property</th>
                <th className="py-3 px-4">Location</th>
                <th className="py-3 px-4">Asset Type</th>
                <th className="py-3 px-4">Inquiries</th>
                <th className="py-3 px-4">Qualified Leads</th>
                <th className="py-3 px-4">Tours Requested</th>
                <th className="py-3 px-4">Tours Completed</th>
                <th className="py-3 px-4">Inq → Visit Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[rgba(7,26,40,0.04)] font-mono text-xs">
              {data.properties.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-[#647581] italic">
                    No property demand recorded in this period.
                  </td>
                </tr>
              ) : (
                data.properties.map((prop) => (
                  <tr key={prop.propertyId} className="hover:bg-[#f8f7f4]/60 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-[#071a28]">
                      <Link href={`/properties/${prop.slug}`} target="_blank" className="hover:text-[#087fc3] flex items-center gap-1 font-sans">
                        <span>{prop.title}</span>
                        <ExternalLink className="w-2.5 h-2.5 text-slate-400" />
                      </Link>
                    </td>
                    <td className="py-3.5 px-4 text-[#647581] font-sans">
                      {prop.locationName}
                    </td>
                    <td className="py-3.5 px-4 text-[#647581]">
                      {prop.propertyType}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-[#071a28]">
                      {prop.inquiryCount}
                    </td>
                    <td className="py-3.5 px-4 text-emerald-700 font-bold">
                      {prop.qualifiedLeadCount}
                    </td>
                    <td className="py-3.5 px-4 text-purple-700 font-bold">
                      {prop.siteVisitRequestedCount}
                    </td>
                    <td className="py-3.5 px-4 text-teal-700 font-bold">
                      {prop.siteVisitCompletedCount}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-[#087fc3]">
                      {prop.inquiryToVisitRate}%
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Regional / Location Breakdown */}
      <div className="bg-white rounded-2xl border border-[rgba(7,26,40,0.08)] shadow-xs p-6 space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-[rgba(7,26,40,0.06)]">
          <MapPin className="w-4 h-4 text-[#087fc3]" />
          <h3 className="text-sm font-bold text-[#071a28]">Regional Market Demand ({data.locations.length} Locations)</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {data.locations.map((loc) => (
            <div key={loc.locationId} className="p-4 rounded-xl bg-[#f8f7f4] border border-[rgba(7,26,40,0.06)] space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-[#071a28]">{loc.name}</h4>
                <span className="text-[10px] font-mono text-[#647581]">{loc.state}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[11px] font-mono pt-1">
                <div>
                  <span className="text-[#647581] block text-[9px] uppercase">Inquiries</span>
                  <span className="font-bold text-[#071a28] text-sm">{loc.inquiryCount}</span>
                </div>
                <div>
                  <span className="text-[#647581] block text-[9px] uppercase">Site Visits</span>
                  <span className="font-bold text-purple-700 text-sm">{loc.siteVisitCount}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

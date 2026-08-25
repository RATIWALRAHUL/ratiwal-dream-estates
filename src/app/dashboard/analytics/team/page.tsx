import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { getAdminSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { AnalyticsService } from "@/lib/services/analytics.service";
import { AnalyticsDateRangeFilter } from "@/components/dashboard/analytics/AnalyticsDateRangeFilter";
import { ArrowLeft, Users, Clock, AlertTriangle, CheckCircle2 } from "lucide-react";
import { AnalyticsFilterParams, AnalyticsDatePreset } from "@/types/analytics";

export const metadata: Metadata = {
  title: "Advisor Workload & Performance SLAs | Ratiwal Dream Estates Dashboard",
  description: "Staff assignment workload, first-response times, and follow-up compliance tracking.",
};

interface TeamAnalyticsPageProps {
  searchParams: Promise<{
    preset?: string;
    dateFrom?: string;
    dateTo?: string;
  }>;
}

export default async function TeamAnalyticsPage({ searchParams }: TeamAnalyticsPageProps) {
  const session = await getAdminSession();
  if (!session) redirect("/dashboard/login");

  const params = await searchParams;
  const filterParams: AnalyticsFilterParams = {
    preset: (params.preset as AnalyticsDatePreset) || "LAST_30_DAYS",
    dateFrom: params.dateFrom,
    dateTo: params.dateTo,
  };

  const advisors = await AnalyticsService.getAdvisorWorkloadAnalytics(filterParams, session);

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
            Advisor Workload & Response Performance
          </h1>
          <p className="text-sm text-[#647581] mt-1">
            Real staff assignment volume, human first-response speeds, and tour completion counts.
          </p>
        </div>
      </div>

      {/* Date Filter */}
      <Suspense>
        <AnalyticsDateRangeFilter />
      </Suspense>

      {/* Advisor Table */}
      <div className="bg-white rounded-2xl border border-[rgba(7,26,40,0.08)] shadow-xs overflow-hidden">
        <div className="p-4 bg-[#f8f7f4] border-b border-[rgba(7,26,40,0.06)] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-[#087fc3]" />
            <h3 className="text-xs font-bold text-[#071a28]">Advisor Performance Matrix ({advisors.length} Advisors)</h3>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#f8f7f4] border-b border-[rgba(7,26,40,0.06)] text-[10px] font-mono uppercase tracking-wider text-[#647581]">
                <th className="py-3 px-4">Advisor</th>
                <th className="py-3 px-4">Active Pipeline</th>
                <th className="py-3 px-4">New Assignments</th>
                <th className="py-3 px-4">Overdue Follow-ups</th>
                <th className="py-3 px-4">Completed Tours</th>
                <th className="py-3 px-4">Avg First Response</th>
                <th className="py-3 px-4">2h SLA Met %</th>
                <th className="py-3 px-4">Won Deals</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[rgba(7,26,40,0.04)] font-mono text-xs">
              {advisors.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-[#647581] italic">
                    No advisor activity recorded in this period.
                  </td>
                </tr>
              ) : (
                advisors.map((adv) => (
                  <tr key={adv.advisorId} className="hover:bg-[#f8f7f4]/60 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-[#071a28]">
                      <span className="font-sans block">{adv.advisorName}</span>
                      <span className="text-[10px] text-[#647581] font-normal">{adv.advisorEmail}</span>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-[#071a28]">
                      {adv.assignedActiveLeads}
                    </td>
                    <td className="py-3.5 px-4 text-[#087fc3] font-bold">
                      {adv.newAssignmentsInPeriod}
                    </td>
                    <td className="py-3.5 px-4">
                      {adv.overdueFollowUps > 0 ? (
                        <span className="px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 font-bold border border-rose-200">
                          {adv.overdueFollowUps} overdue
                        </span>
                      ) : (
                        <span className="text-emerald-700 font-bold">0</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-purple-700 font-bold">
                      {adv.completedSiteVisitsInPeriod}
                    </td>
                    <td className="py-3.5 px-4 text-[#071a28]">
                      {adv.avgFirstResponseHours !== null ? `${adv.avgFirstResponseHours.toFixed(1)} hrs` : "—"}
                    </td>
                    <td className="py-3.5 px-4">
                      {adv.slaCompliancePercent !== null ? (
                        <span className={`font-bold ${adv.slaCompliancePercent >= 80 ? "text-emerald-700" : "text-amber-700"}`}>
                          {adv.slaCompliancePercent}%
                        </span>
                      ) : (
                        <span className="text-slate-400">No data</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-emerald-800 font-bold">
                      {adv.wonLeadsCount}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

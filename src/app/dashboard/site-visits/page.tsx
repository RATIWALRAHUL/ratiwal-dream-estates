import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { getAdminSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { getSiteVisits, getSiteVisitMetrics } from "@/lib/services/site-visit.service";
import { SiteVisitMetrics } from "@/components/dashboard/site-visits/SiteVisitMetrics";
import { SiteVisitFilterToolbar } from "@/components/dashboard/site-visits/SiteVisitFilterToolbar";
import { SiteVisitTable } from "@/components/dashboard/site-visits/SiteVisitTable";
import { SiteVisitCardList } from "@/components/dashboard/site-visits/SiteVisitCardList";
import { Calendar, Clock } from "lucide-react";
import type { SiteVisitStatus, SiteVisitPriority, MeetingMode, VisitSource } from "@/types/site-visit";

export const metadata: Metadata = {
  title: "Site Visit Operations | Ratiwal Dream Estates Dashboard",
  description: "Schedule, coordinate, and review on-ground and virtual site visits.",
};

interface SiteVisitsPageProps {
  searchParams: Promise<{
    search?: string;
    status?: string;
    priority?: string;
    meetingMode?: string;
    source?: string;
    assignedAdvisorId?: string;
    propertyId?: string;
    locationId?: string;
    dateFrom?: string;
    dateTo?: string;
    page?: string;
  }>;
}

export default async function SiteVisitsPage({ searchParams }: SiteVisitsPageProps) {
  const session = await getAdminSession();
  if (!session) redirect("/dashboard/login");

  const params = await searchParams;

  const filters = {
    search: params.search?.trim(),
    status: params.status as SiteVisitStatus | undefined,
    priority: params.priority as SiteVisitPriority | undefined,
    meetingMode: params.meetingMode as MeetingMode | undefined,
    source: params.source as VisitSource | undefined,
    assignedAdvisorId: params.assignedAdvisorId,
    propertyId: params.propertyId,
    locationId: params.locationId,
    dateFrom: params.dateFrom,
    dateTo: params.dateTo,
    page: params.page ? parseInt(params.page, 10) : 1,
    perPage: 25,
  };

  const { user } = session;

  const [metrics, siteVisits] = await Promise.all([
    getSiteVisitMetrics(user.role, user.id),
    getSiteVisits(filters, user.role, user.id),
  ]);

  const currentParams = new URLSearchParams(
    Object.entries(params).filter(([, v]) => v !== undefined) as [string, string][]
  ).toString();

  const isManager = user.role === "ADMIN" || user.role === "SUPER_ADMIN";

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-[10px] font-mono uppercase tracking-widest text-[#647581] mb-1">
            PROPERTY VISITS
          </p>
          <h1 className="text-2xl font-bold font-serif text-[#071a28] tracking-tight">
            Site Visit Operations
          </h1>
          <p className="text-sm text-[#647581] mt-1">
            {user.role === "EDITOR"
              ? "Your assigned on-site inspections and virtual consultations"
              : "Coordinate and review plot inspections across all micro-markets"}
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          <Link
            href="/dashboard/site-visits/calendar"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-[rgba(7,26,40,0.12)] text-[#071a28] hover:bg-white text-xs font-bold transition-colors shadow-xs"
          >
            <Calendar className="w-4 h-4 text-[#087fc3]" />
            Calendar View
          </Link>
          {isManager && (
            <Link
              href="/dashboard/site-visits/availability"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-[rgba(7,26,40,0.12)] text-[#071a28] hover:bg-white text-xs font-bold transition-colors shadow-xs"
            >
              <Clock className="w-4 h-4 text-[#087fc3]" />
              Availability Rules
            </Link>
          )}
        </div>
      </div>

      {/* KPI Metrics */}
      <SiteVisitMetrics metrics={metrics} />

      {/* Filter toolbar */}
      <Suspense>
        <SiteVisitFilterToolbar />
      </Suspense>

      {/* Count bar */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-[#647581]">
          <span className="font-semibold text-[#071a28]">
            {siteVisits.totalCount.toLocaleString("en-IN")}
          </span>{" "}
          visit{siteVisits.totalCount !== 1 ? "s" : ""} found
        </p>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block">
        <SiteVisitTable
          items={siteVisits.items}
          totalCount={siteVisits.totalCount}
          page={siteVisits.page}
          perPage={siteVisits.perPage}
          totalPages={siteVisits.totalPages}
          currentParams={currentParams}
        />
      </div>

      {/* Mobile Card List */}
      <div className="md:hidden">
        <SiteVisitCardList
          items={siteVisits.items}
          totalCount={siteVisits.totalCount}
          page={siteVisits.page}
          perPage={siteVisits.perPage}
          totalPages={siteVisits.totalPages}
          currentParams={currentParams}
        />
      </div>
    </div>
  );
}

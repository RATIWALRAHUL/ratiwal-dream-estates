import { Suspense } from "react";
import type { Metadata } from "next";
import { getAdminSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { getLeads, getLeadMetrics } from "@/lib/services/lead.service";
import { LeadsOverviewMetrics } from "@/components/dashboard/leads/LeadsOverviewMetrics";
import { LeadsFilterToolbar } from "@/components/dashboard/leads/LeadsFilterToolbar";
import { LeadTable } from "@/components/dashboard/leads/LeadTable";
import { LeadCardList } from "@/components/dashboard/leads/LeadCardList";
import type { LeadStatus, LeadPriority, LeadSource } from "@/models/Lead";

export const metadata: Metadata = {
  title: "Leads & Inquiries | Ratiwal Dream Estates Dashboard",
  description: "Manage and respond to client inquiries in the Ratiwal Dream Estates advisory pipeline.",
};

interface LeadsPageProps {
  searchParams: Promise<{
    search?: string;
    status?: string;
    priority?: string;
    source?: string;
    assignedToId?: string;
    propertyId?: string;
    locationId?: string;
    dateFrom?: string;
    dateTo?: string;
    followUpStatus?: string;
    page?: string;
  }>;
}

export default async function LeadsPage({ searchParams }: LeadsPageProps) {
  const session = await getAdminSession();
  if (!session) redirect("/dashboard/login");

  const params = await searchParams;

  const filters = {
    search: params.search?.trim(),
    status: params.status as LeadStatus | undefined,
    priority: params.priority as LeadPriority | undefined,
    source: params.source as LeadSource | undefined,
    assignedToId: params.assignedToId,
    propertyId: params.propertyId,
    locationId: params.locationId,
    dateFrom: params.dateFrom,
    dateTo: params.dateTo,
    followUpStatus: params.followUpStatus as "overdue" | "due_today" | "has_followup" | "no_followup" | undefined,
    page: params.page ? parseInt(params.page, 10) : 1,
    perPage: 25,
  };

  const { user } = session;

  const [metrics, leads] = await Promise.all([
    getLeadMetrics(user.role, user.id),
    getLeads(filters, user.role, user.id),
  ]);

  // Build current params string for pagination links
  const currentParams = new URLSearchParams(
    Object.entries(params).filter(([, v]) => v !== undefined) as [string, string][]
  ).toString();

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <p className="text-[10px] font-mono uppercase tracking-widest text-[#647581] mb-1">Dashboard</p>
        <h1 className="text-2xl font-bold font-serif text-[#071a28] tracking-tight">Client Advisory Pipeline</h1>
        <p className="text-sm text-[#647581] mt-1">
          {user.role === "EDITOR"
            ? "Your assigned leads and upcoming follow-ups"
            : "All lead inquiries across properties and locations"}
        </p>
      </div>

      {/* KPI Metrics */}
      <LeadsOverviewMetrics metrics={metrics} />

      {/* Filters — client component */}
      <Suspense>
        <LeadsFilterToolbar />
      </Suspense>

      {/* Results count */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-[#647581]">
          <span className="font-semibold text-[#071a28]">{leads.totalCount.toLocaleString("en-IN")}</span> lead{leads.totalCount !== 1 ? "s" : ""} found
        </p>
      </div>

      {/* Desktop table (hidden on mobile) */}
      <div className="hidden md:block">
        <LeadTable
          items={leads.items}
          totalCount={leads.totalCount}
          page={leads.page}
          perPage={leads.perPage}
          totalPages={leads.totalPages}
          currentParams={currentParams}
        />
      </div>

      {/* Mobile card list */}
      <div className="md:hidden">
        <LeadCardList
          items={leads.items}
          totalCount={leads.totalCount}
          page={leads.page}
          perPage={leads.perPage}
          totalPages={leads.totalPages}
          currentParams={currentParams}
        />
      </div>
    </div>
  );
}

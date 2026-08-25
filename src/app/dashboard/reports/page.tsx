import type { Metadata } from "next";
import Link from "next/link";
import { getAdminSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { ReportExportService, REPORT_COLUMN_CATALOG } from "@/lib/services/report-export.service";
import { AnalyticsService } from "@/lib/services/analytics.service";
import { ReportTable } from "@/components/dashboard/reports/ReportTable";
import { DataQualityPanel } from "@/components/dashboard/analytics/DataQualityPanel";
import { FileText, ArrowLeft } from "lucide-react";
import { ReportType } from "@/types/analytics";

export const metadata: Metadata = {
  title: "Operational Report Centre & Data Audit | Ratiwal Dream Estates Dashboard",
  description: "Downloadable audit reports, CRM logs, and data quality hygiene scanner.",
};

interface ReportsPageProps {
  searchParams: Promise<{
    type?: string;
    page?: string;
  }>;
}

export default async function ReportsPage({ searchParams }: ReportsPageProps) {
  const session = await getAdminSession();
  if (!session) redirect("/dashboard/login");

  const params = await searchParams;
  const reportType: ReportType = (params.type as ReportType) || "INQUIRY_REPORT";
  const page = params.page ? parseInt(params.page, 10) : 1;

  const [reportResult, dataQualityReport] = await Promise.all([
    ReportExportService.executeReport(reportType, page, 25, session),
    AnalyticsService.getDataQualityReport(session),
  ]);

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
            Operational Report Centre & Data Hygiene
          </h1>
          <p className="text-sm text-[#647581] mt-1">
            Generate, filter, and export verified CRM registers, advisor workloads, and data quality diagnostics.
          </p>
        </div>
      </div>

      {/* Tabular Report Section */}
      <ReportTable
        initialReportType={reportType}
        initialColumns={reportResult.columns}
        initialRows={reportResult.rows}
        initialTotal={reportResult.totalRows}
        initialPage={reportResult.page}
        initialPerPage={reportResult.perPage}
      />

      {/* Data Quality Panel */}
      <DataQualityPanel report={dataQualityReport} />
    </div>
  );
}

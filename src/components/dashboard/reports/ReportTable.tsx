"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Download, Table, Loader2 } from "lucide-react";
import { ReportType, ReportColumnDefinition, REPORT_TYPES } from "@/types/analytics";
import { executeReportAction } from "@/lib/actions/analytics.actions";

const REPORT_LABELS: Record<ReportType, string> = {
  INQUIRY_REPORT: "Inquiry Register",
  LEAD_PIPELINE_REPORT: "Lead Pipeline Report",
  LEAD_FOLLOWUP_REPORT: "Follow-Up Health",
  ADVISOR_WORKLOAD_REPORT: "Advisor Workload",
  SITE_VISIT_REPORT: "Site Visit Register",
  PROPERTY_DEMAND_REPORT: "Property Demand",
  LOCATION_DEMAND_REPORT: "Location Demand",
  COMMUNICATION_DELIVERY_REPORT: "Communication Deliveries",
  DATA_QUALITY_REPORT: "Data Quality Exceptions",
};

interface ReportTableProps {
  initialReportType: ReportType;
  initialColumns: ReportColumnDefinition[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  initialRows: Record<string, any>[];
  initialTotal: number;
  initialPage: number;
  initialPerPage: number;
}

export function ReportTable({
  initialReportType,
  initialColumns,
  initialRows,
  initialTotal,
  initialPage,
  initialPerPage,
}: ReportTableProps) {
  const [reportType, setReportType] = useState<ReportType>(initialReportType);
  const [columns, setColumns] = useState<ReportColumnDefinition[]>(initialColumns);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [rows, setRows] = useState<Record<string, any>[]>(initialRows);
  const [totalRows, setTotalRows] = useState(initialTotal);
  const [page, setPage] = useState(initialPage);
  const [isPending, startTransition] = useTransition();

  const handleReportChange = (type: ReportType) => {
    setReportType(type);
    setPage(1);
    startTransition(async () => {
      const data = await executeReportAction(type, 1, initialPerPage);
      setColumns(data.columns);
      setRows(data.rows);
      setTotalRows(data.totalRows);
    });
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    startTransition(async () => {
      const data = await executeReportAction(reportType, newPage, initialPerPage);
      setColumns(data.columns);
      setRows(data.rows);
      setTotalRows(data.totalRows);
    });
  };

  const totalPages = Math.ceil(totalRows / initialPerPage);

  return (
    <div className="space-y-4">
      {/* Control Bar: Report Switcher & Export */}
      <div className="bg-white rounded-2xl border border-[rgba(7,26,40,0.08)] shadow-xs p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-[#071a28] flex items-center gap-1.5 mr-1">
            <Table className="w-4 h-4 text-[#087fc3]" />
            <span>Select Report:</span>
          </span>

          <select
            value={reportType}
            onChange={(e) => handleReportChange(e.target.value as ReportType)}
            disabled={isPending}
            className="px-3.5 py-2 rounded-xl border border-[rgba(7,26,40,0.12)] bg-[#f8f7f4] text-xs font-semibold text-[#071a28] focus:outline-none focus:ring-2 focus:ring-[#087fc3]/30"
          >
            {REPORT_TYPES.map((t) => (
              <option key={t} value={t}>{REPORT_LABELS[t]}</option>
            ))}
          </select>
        </div>

        {/* CSV Download Action */}
        <div className="flex items-center gap-2">
          <a
            href={`/api/reports/export?type=${reportType}`}
            download
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#071a28] hover:bg-[#087fc3] text-white text-xs font-bold transition-all shadow-xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </a>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white rounded-2xl border border-[rgba(7,26,40,0.08)] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#f8f7f4] border-b border-[rgba(7,26,40,0.06)] text-[10px] font-mono uppercase tracking-wider text-[#647581]">
                {columns.map((col) => (
                  <th key={col.key} className="py-3 px-4" title={col.description}>
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[rgba(7,26,40,0.04)] font-mono text-xs">
              {isPending ? (
                <tr>
                  <td colSpan={columns.length} className="py-12 text-center text-[#647581]">
                    <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2 text-[#087fc3]" />
                    <span>Loading report data…</span>
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="py-12 text-center text-[#647581] italic">
                    No records found for this report.
                  </td>
                </tr>
              ) : (
                rows.map((row, idx) => (
                  <tr key={idx} className="hover:bg-[#f8f7f4]/60 transition-colors">
                    {columns.map((col) => (
                      <td key={col.key} className="py-3 px-4 text-[#071a28]">
                        {row[col.key] !== undefined && row[col.key] !== null ? String(row[col.key]) : "—"}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-[rgba(7,26,40,0.06)] flex items-center justify-between text-xs text-[#647581]">
            <span>
              Page {page} of {totalPages} ({totalRows} total rows)
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => handlePageChange(page - 1)}
                disabled={page <= 1 || isPending}
                className="px-3 py-1.5 rounded-xl border border-[rgba(7,26,40,0.1)] hover:bg-[#f8f7f4] font-bold text-[#071a28] disabled:opacity-40"
              >
                Previous
              </button>
              <button
                type="button"
                onClick={() => handlePageChange(page + 1)}
                disabled={page >= totalPages || isPending}
                className="px-3 py-1.5 rounded-xl border border-[rgba(7,26,40,0.1)] hover:bg-[#f8f7f4] font-bold text-[#071a28] disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

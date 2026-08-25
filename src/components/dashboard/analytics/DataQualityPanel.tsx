import Link from "next/link";
import { ShieldAlert, AlertTriangle, Info, ArrowUpRight, CheckCircle2 } from "lucide-react";
import { DataQualityReport } from "@/types/analytics";

interface DataQualityPanelProps {
  report: DataQualityReport;
}

export function DataQualityPanel({ report }: DataQualityPanelProps) {
  const isHealthy = report.issues.every((i) => i.affectedCount === 0);

  return (
    <div className="bg-white rounded-2xl border border-[rgba(7,26,40,0.08)] shadow-xs p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[rgba(7,26,40,0.06)]">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-widest text-[#647581] font-bold">
            DATA INTEGRITY & HYGIENE SCANNER
          </span>
          <h3 className="text-lg font-bold font-serif text-[#071a28] mt-0.5">
            Analytics Data Quality Health
          </h3>
          <p className="text-xs text-[#647581] mt-0.5">
            Operational gaps in CRM records that affect funnel accuracy and advisor benchmarks.
          </p>
        </div>

        {/* Health Score Pill */}
        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-[10px] font-mono text-[#647581] block">Integrity Score</span>
            <span className={`text-xl font-bold font-mono ${
              report.overallScore >= 90
                ? "text-emerald-700"
                : report.overallScore >= 70
                ? "text-amber-700"
                : "text-rose-700"
            }`}>
              {report.overallScore}/100
            </span>
          </div>
        </div>
      </div>

      {/* Issues List */}
      {isHealthy ? (
        <div className="p-8 text-center bg-emerald-50 rounded-2xl border border-emerald-200">
          <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
          <h4 className="text-xs font-bold text-emerald-900">All CRM Data Meets High Integrity Standards</h4>
          <p className="text-[11px] text-emerald-700 mt-0.5">
            No unassigned leads, missing follow-ups, or unassigned site visits found.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-[rgba(7,26,40,0.04)] space-y-3">
          {report.issues.map((issue) => {
            const hasProblem = issue.affectedCount > 0;
            return (
              <div
                key={issue.id}
                className={`pt-3 first:pt-0 p-4 rounded-xl transition-colors ${
                  hasProblem && issue.severity === "CRITICAL"
                    ? "bg-rose-50/60 border border-rose-200/80"
                    : hasProblem && issue.severity === "WARNING"
                    ? "bg-amber-50/60 border border-amber-200/80"
                    : "bg-[#f8f7f4]/60 border border-transparent"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 shrink-0">
                      {issue.severity === "CRITICAL" ? (
                        <ShieldAlert className="w-4 h-4 text-rose-600" />
                      ) : issue.severity === "WARNING" ? (
                        <AlertTriangle className="w-4 h-4 text-amber-600" />
                      ) : (
                        <Info className="w-4 h-4 text-sky-600" />
                      )}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-bold text-[#071a28]">{issue.title}</h4>
                        <span className={`px-2 py-0.2 rounded-full text-[9px] font-mono font-bold ${
                          hasProblem
                            ? issue.severity === "CRITICAL"
                              ? "bg-rose-100 text-rose-800"
                              : "bg-amber-100 text-amber-800"
                            : "bg-emerald-100 text-emerald-800"
                        }`}>
                          {issue.affectedCount} affected
                        </span>
                      </div>
                      <p className="text-xs text-[#647581] mt-1 leading-relaxed">{issue.description}</p>
                      <p className="text-[11px] text-[#071a28] font-medium mt-1 bg-white/60 p-2 rounded-lg border border-[rgba(7,26,40,0.04)]">
                        <strong className="text-[#647581]">Analytics Impact:</strong> {issue.impactOnAnalytics}
                      </p>
                    </div>
                  </div>

                  {issue.navigationHref && hasProblem && (
                    <Link
                      href={issue.navigationHref}
                      className="inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-white border border-[rgba(7,26,40,0.1)] text-[#071a28] hover:bg-[#087fc3] hover:text-white text-xs font-bold transition-colors shadow-2xs shrink-0"
                    >
                      <span>Fix</span>
                      <ArrowUpRight className="w-3 h-3" />
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Stage History Coverage Badge */}
      <div className="p-3.5 bg-[#f8f7f4] rounded-xl border border-[rgba(7,26,40,0.06)] flex items-center justify-between text-[11px] text-[#647581]">
        <span>Append-Only Stage History Tracking Active Since:</span>
        <span className="font-mono font-bold text-[#071a28]">
          {new Date(report.stageHistoryCoverageStartDate).toLocaleDateString("en-IN", { timeZone: "Asia/Kolkata", dateStyle: "medium" })}
        </span>
      </div>
    </div>
  );
}

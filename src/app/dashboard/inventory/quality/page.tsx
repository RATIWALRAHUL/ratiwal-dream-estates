import type { Metadata } from "next";
import Link from "next/link";
import { getAdminSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { InventoryService } from "@/lib/services/inventory.service";
import { ArrowLeft, ShieldAlert, CheckCircle2, AlertTriangle, Info } from "lucide-react";

export const metadata: Metadata = {
  title: "Inventory Data Quality & Reconciliation | Ratiwal Dream Estates Dashboard",
  description: "Scanner for unit pricing gaps, missing area specs, counter mismatches, and orphan references.",
};

export default async function InventoryQualityPage() {
  const session = await getAdminSession();
  if (!session) redirect("/dashboard/login");

  const report = await InventoryService.scanDataQuality();

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <Link
          href="/dashboard/inventory"
          className="inline-flex items-center gap-1.5 text-xs text-[#647581] hover:text-[#071a28] transition-colors mb-2"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Inventory</span>
        </Link>
        <h1 className="text-2xl font-bold font-serif text-[#071a28] tracking-tight">
          Inventory Data Hygiene & Reconciliation Scanner
        </h1>
        <p className="text-sm text-[#647581] mt-1">
          Automated audit scanning for unit pricing gaps, missing area specifications, and counter discrepancies.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-[rgba(7,26,40,0.08)] shadow-xs p-6 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[rgba(7,26,40,0.06)]">
          <div>
            <h3 className="text-base font-bold font-serif text-[#071a28]">
              Overall Inventory Integrity Score
            </h3>
            <p className="text-xs text-[#647581] mt-0.5">
              Audited across {report.totalUnits} total unit and plot records.
            </p>
          </div>

          <span
            className={`text-2xl font-bold font-mono ${
              report.overallScore >= 90
                ? "text-emerald-700"
                : report.overallScore >= 70
                ? "text-amber-700"
                : "text-rose-700"
            }`}
          >
            {report.overallScore}/100
          </span>
        </div>

        {report.issues.length === 0 ? (
          <div className="p-8 text-center bg-emerald-50 rounded-2xl border border-emerald-200">
            <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
            <h4 className="text-xs font-bold text-emerald-900">
              Zero Data Quality Defects Detected
            </h4>
            <p className="text-[11px] text-emerald-700 mt-0.5">
              All inventory units have valid area measurements, appropriate pricing tags, and verified parent properties.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {report.issues.map((issue, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl bg-[#f8f7f4] border border-[rgba(7,26,40,0.06)] flex items-start gap-3"
              >
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-bold text-[#071a28]">{issue.title}</h4>
                    <span className="px-2 py-0.2 rounded-full bg-amber-100 text-amber-800 text-[9px] font-mono font-bold">
                      {issue.affectedCount} affected
                    </span>
                  </div>
                  <p className="text-xs text-[#647581]">{issue.impact}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

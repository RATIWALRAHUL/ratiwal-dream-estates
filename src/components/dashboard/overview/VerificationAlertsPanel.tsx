import Link from "next/link";
import { AlertTriangle, AlertCircle, ShieldCheck, ArrowRight, CheckCircle2 } from "lucide-react";
import type { DashboardOverviewData } from "@/lib/services/dashboard.service";

interface VerificationAlertsPanelProps {
  alerts: DashboardOverviewData["verificationAlerts"];
}

export function VerificationAlertsPanel({ alerts }: VerificationAlertsPanelProps) {
  if (alerts.length === 0) {
    return (
      <div className="relative overflow-hidden p-6 sm:p-7 rounded-3xl bg-gradient-to-br from-[#f0fdf4] via-[#f7fdf9] to-[#fffdf8] border border-emerald-200/70 shadow-[0_4px_24px_rgba(16,185,129,0.06)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-4">
          <div className="relative w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 border border-emerald-200 flex items-center justify-center shrink-0 shadow-xs">
            <ShieldCheck className="w-6 h-6" />
            <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white shadow-[0_0_8px_#10b981]" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-emerald-700">
                100% Statutory Compliance
              </span>
              <span className="inline-flex items-center gap-1 text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-emerald-100/80 text-emerald-800">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                Audit Passed
              </span>
            </div>
            <h3 className="text-base font-bold font-serif text-[#071a28] mt-0.5">
              All Property Due Diligence in Order
            </h3>
            <p className="text-xs text-[#647581] mt-0.5">
              Every registered parcel meets mandatory 90A revenue conversion, statutory RERA registration, and physical boundary demarcation standards.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
          <span className="text-[11px] font-mono text-emerald-700 font-bold px-3 py-1.5 rounded-xl bg-emerald-100/70 border border-emerald-200">
            Zero Active Flags
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 sm:p-7 rounded-3xl bg-gradient-to-br from-white via-[#fffdf8] to-[#fbf9f4] border border-[rgba(7,26,40,0.08)] shadow-[0_4px_24px_rgba(7,26,40,0.03)] space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 border border-rose-200/60 flex items-center justify-center shadow-xs">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-normal font-serif text-[#071a28] tracking-tight">
              Verification & Compliance Attention
            </h2>
            <p className="text-xs text-[#647581] mt-0.5">
              Properties requiring statutory audit, fresh RERA validation, or primary photo verification
            </p>
          </div>
        </div>

        <span className="text-xs font-mono font-bold text-rose-600 px-3 py-1 rounded-full bg-rose-50 border border-rose-200 shadow-xs">
          {alerts.length} Flagged
        </span>
      </div>

      <div className="space-y-3">
        {alerts.map((a) => {
          const isHigh = a.severity === "HIGH";
          return (
            <div
              key={a.propertyId}
              className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all duration-200 ${
                isHigh
                  ? "bg-rose-50/50 border-rose-200/80 hover:bg-rose-50"
                  : "bg-amber-50/50 border-amber-200/80 hover:bg-amber-50"
              }`}
            >
              <div className="flex items-start gap-3">
                {isHigh ? (
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                )}
                <div>
                  <h4 className="text-xs font-bold text-[#071a28]">
                    {a.title}
                  </h4>
                  <p className="text-[11px] text-[#647581] mt-0.5 font-mono">
                    {a.reason}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 self-end sm:self-center">
                {a.lastVerifiedAt && (
                  <span className="text-[10px] font-mono text-[#647581]">
                    Audited: {new Date(a.lastVerifiedAt).toLocaleDateString()}
                  </span>
                )}
                <Link
                  href={`/dashboard/properties?search=${encodeURIComponent(a.slug)}`}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white border border-[rgba(7,26,40,0.1)] text-xs font-bold text-[#087fc3] hover:bg-[#071a28] hover:text-white transition-all shadow-2xs"
                >
                  <span>Review</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

"use client";

import Link from "next/link";
import { CheckCircle2, AlertTriangle, Clock, XCircle, FileText, ArrowRight } from "lucide-react";
import { IPropertyChecklistItem } from "@/models/PropertyLegalChecklist";

const ITEM_STATUS_ICONS = {
  INTERNALLY_VERIFIED: { icon: CheckCircle2, color: "text-emerald-600 bg-emerald-50 border-emerald-200" },
  UNDER_REVIEW: { icon: Clock, color: "text-amber-600 bg-amber-50 border-amber-200" },
  ACTION_REQUIRED: { icon: AlertTriangle, color: "text-orange-600 bg-orange-50 border-orange-200" },
  EXPIRED: { icon: AlertTriangle, color: "text-rose-600 bg-rose-50 border-rose-200" },
  REJECTED: { icon: XCircle, color: "text-rose-600 bg-rose-50 border-rose-200" },
  UPLOADED: { icon: FileText, color: "text-sky-600 bg-sky-50 border-sky-200" },
  NOT_PROVIDED: { icon: XCircle, color: "text-slate-400 bg-slate-50 border-slate-200" },
  NOT_APPLICABLE: { icon: FileText, color: "text-zinc-400 bg-zinc-50 border-zinc-200" },
};

interface PropertyChecklistCardProps {
  propertyId: string;
  propertyName: string;
  items: IPropertyChecklistItem[];
  readinessPercentage: number;
}

export function PropertyChecklistCard({
  propertyId,
  propertyName,
  items,
  readinessPercentage,
}: PropertyChecklistCardProps) {
  return (
    <div className="bg-white rounded-2xl border border-[rgba(7,26,40,0.08)] shadow-xs p-6 space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[rgba(7,26,40,0.06)]">
        <div>
          <span className="text-[10px] font-mono uppercase text-[#647581] font-bold">
            DOCUMENT READINESS
          </span>
          <h3 className="text-base font-bold font-serif text-[#071a28]">
            {propertyName} Statutory Checklist
          </h3>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-xs font-bold text-[#071a28] block">
              {readinessPercentage}% Readiness
            </span>
            <span className="text-[10px] text-[#647581]">
              {items.filter((i) => i.status === "INTERNALLY_VERIFIED").length} of {items.length} verified
            </span>
          </div>

          <div className="w-12 h-12 rounded-full border-4 border-[#eaf5fa] flex items-center justify-center relative font-mono text-xs font-bold text-[#087fc3]">
            {readinessPercentage}%
          </div>
        </div>
      </div>

      {/* Checklist Items List */}
      <div className="space-y-2.5">
        {items.map((item, idx) => {
          const config = ITEM_STATUS_ICONS[item.status] || ITEM_STATUS_ICONS.NOT_PROVIDED;
          const Icon = config.icon;

          return (
            <div
              key={idx}
              className="p-3.5 rounded-xl border border-[rgba(7,26,40,0.06)] bg-[#f8f7f4]/60 flex items-center justify-between gap-3 hover:bg-[#f8f7f4] transition-colors"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center border shrink-0 ${config.color}`}>
                  <Icon className="w-4 h-4" />
                </div>

                <div className="truncate">
                  <span className="text-xs font-bold text-[#071a28] block truncate">
                    {item.displayName}
                  </span>
                  <div className="flex items-center gap-2 text-[10px] text-[#647581] font-mono">
                    <span>{item.category.replace(/_/g, " ")}</span>
                    {item.isRequired && <span className="text-rose-600 font-bold">• Required</span>}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span className="text-[10px] font-mono font-bold text-[#647581]">
                  {item.status.replace(/_/g, " ")}
                </span>

                {item.documentId ? (
                  <Link
                    href={`/dashboard/legal-vault/documents/${item.documentId}`}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-[#087fc3] hover:bg-white transition-colors"
                    title="View Document"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                ) : (
                  <Link
                    href={`/dashboard/legal-vault/documents/new?propertyId=${propertyId}&category=${item.category}&checklistItemKey=${item.itemKey}`}
                    className="px-2.5 py-1 rounded-lg bg-[#071a28] text-white hover:bg-[#087fc3] text-[10px] font-bold transition-all shadow-2xs"
                  >
                    Upload
                  </Link>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

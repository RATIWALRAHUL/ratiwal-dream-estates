"use client";

import React from "react";
import Link from "next/link";
import { Calendar, ArrowLeft, Eye } from "lucide-react";

interface KycExpiringViewProps {
  expiringDocs: any[];
}

export function KycExpiringView({ expiringDocs }: KycExpiringViewProps) {
  return (
    <div className="space-y-6 antialiased">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono uppercase tracking-widest text-[#087fc3] font-bold">
              Expiry & Renewal Tracking
            </span>
          </div>
          <h1 className="text-2xl font-bold font-serif text-[#071a28] tracking-tight mt-1">
            Expiring Documents & Review Due ({expiringDocs.length})
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Identity evidence approaching expiration date or due for periodic compliance review.
          </p>
        </div>

        <Link
          href="/dashboard/kyc"
          className="px-4 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-[#071a28] font-bold text-xs flex items-center gap-2 transition-colors shadow-2xs self-start sm:self-center"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Overview</span>
        </Link>
      </div>

      <div className="bg-white rounded-3xl border border-[rgba(7,26,40,0.08)] shadow-xs overflow-hidden">
        {expiringDocs.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-xs space-y-2">
            <Calendar className="w-8 h-8 text-emerald-500 mx-auto" />
            <p className="font-bold text-[#071a28]">No expiring documents!</p>
            <p>All active identity evidence is current within validity periods.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 text-xs">
            {expiringDocs.map((doc) => {
              const daysLeft = Math.ceil(
                (new Date(doc.expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
              );
              return (
                <div
                  key={doc._id}
                  className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[#fbfaf8] transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-[#071a28]">{doc.requirementKey}</span>
                      <span className="px-2 py-0.5 rounded-full bg-rose-50 text-rose-800 border border-rose-200 text-[10px] font-bold">
                        Expires in {daysLeft} day{daysLeft !== 1 ? "s" : ""}
                      </span>
                    </div>
                    <div className="text-slate-500 text-[11px]">
                      Applicant: <strong>{doc.applicantId?.fullName || "Applicant"}</strong> • Type:{" "}
                      <strong>{doc.documentType}</strong>
                    </div>
                    <div className="text-slate-400 text-[10px]">
                      Expiry Date: {new Date(doc.expiryDate).toLocaleDateString()}
                    </div>
                  </div>

                  <Link
                    href={`/dashboard/kyc/cases/${doc.kycCaseId?._id || doc.kycCaseId}`}
                    className="px-3.5 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-[#071a28] font-bold text-xs transition-colors flex items-center gap-1.5 shadow-2xs self-start sm:self-center"
                  >
                    <Eye className="w-3.5 h-3.5 text-[#087fc3]" />
                    <span>View Case</span>
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Eye, CheckCircle2, ArrowLeft } from "lucide-react";

interface KycReviewQueueProps {
  pendingDocuments: any[];
}

export function KycReviewQueue({ pendingDocuments }: KycReviewQueueProps) {
  return (
    <div className="space-y-6 antialiased">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono uppercase tracking-widest text-[#087fc3] font-bold">
              Reviewer Worklist
            </span>
          </div>
          <h1 className="text-2xl font-bold font-serif text-[#071a28] tracking-tight mt-1">
            Pending Document Review Queue ({pendingDocuments.length})
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Documents submitted by buyers requiring internal inspection or provider verification.
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
        {pendingDocuments.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-xs space-y-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
            <p className="font-bold text-[#071a28]">Review queue is clean!</p>
            <p>No documents are currently awaiting verification.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 text-xs">
            {pendingDocuments.map((doc) => (
              <div
                key={doc._id}
                className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[#fbfaf8] transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[#071a28]">{doc.requirementKey}</span>
                    <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-800 border border-blue-200 text-[10px] font-bold">
                      {doc.status.replace(/_/g, " ")}
                    </span>
                    <span className="text-slate-400 font-mono text-[10px]">
                      v{doc.currentVersionNumber}
                    </span>
                  </div>
                  <div className="text-slate-500 text-[11px]">
                    Buyer: <strong>{doc.applicantId?.fullName || "Applicant"}</strong> ({doc.applicantId?.role || "PRIMARY"})
                    • Type: <strong>{doc.documentType}</strong>
                  </div>
                  {doc.currentVersionId && (
                    <div className="text-slate-400 text-[10px] font-mono">
                      File: {doc.currentVersionId.sanitizedOriginalFilename} (
                      {Math.round(doc.currentVersionId.fileSizeBytes / 1024)} KB)
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 self-start sm:self-center">
                  <Link
                    href={`/dashboard/kyc/cases/${doc.kycCaseId?._id || doc.kycCaseId}`}
                    className="px-3.5 py-1.5 rounded-xl bg-[#071a28] hover:bg-[#0d2c42] text-white font-bold text-xs transition-colors flex items-center gap-1.5 shadow-xs"
                  >
                    <Eye className="w-3.5 h-3.5 text-[#42b7e8]" />
                    <span>Open Case Workspace</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

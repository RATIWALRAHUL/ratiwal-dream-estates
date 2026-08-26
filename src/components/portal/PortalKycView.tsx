"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ShieldCheck, FileCheck, UploadCloud, AlertTriangle, CheckCircle2, Clock, Lock } from "lucide-react";

interface PortalKycViewProps {
  data: any;
}

export function PortalKycView({ data }: PortalKycViewProps) {
  const { kycCases, applicants, documents } = data;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-white tracking-wide">
            KYC & Identity Documents
          </h1>
          <p className="text-xs text-slate-300 mt-1">
            Official statutory compliance documents (PAN, Aadhaar, Passport) for property registration and RERA validation.
          </p>
        </div>
      </div>

      {/* Notice Banner */}
      <div className="p-4 rounded-2xl bg-[#087fc3]/10 border border-[#087fc3]/30 text-slate-200 text-xs flex items-start space-x-3">
        <ShieldCheck className="w-5 h-5 text-[#087fc3] shrink-0 mt-0.5" />
        <div className="space-y-1">
          <span className="font-semibold text-white">DPDP & Aadhaar Redaction Notice</span>
          <p className="text-slate-300 leading-relaxed text-[11px]">
            In compliance with UIDAI regulations and the Digital Personal Data Protection (DPDP) Act, only the last 4 digits of Aadhaar/PAN are stored. All submitted images are watermarked and stored in quarantined, encrypted private vaults.
          </p>
        </div>
      </div>

      {/* KYC Case Details */}
      {kycCases && kycCases.length > 0 ? (
        <div className="space-y-6">
          {kycCases.map((kc: any) => (
            <div
              key={kc._id}
              className="bg-[#071a28]/90 border border-white/10 rounded-2xl p-6 text-white shadow-xl space-y-6"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
                <div>
                  <span className="text-xs font-mono text-[#087fc3] font-semibold">
                    Case #{kc.caseNumber}
                  </span>
                  <h2 className="text-lg font-serif font-bold text-white mt-0.5">
                    {kc.partyId?.displayName || "Primary Buyer"}
                  </h2>
                </div>

                <div className="flex items-center space-x-2">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      kc.status === "VERIFIED"
                        ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                        : kc.status === "ACTION_REQUIRED"
                        ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                        : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                    }`}
                  >
                    Status: {kc.status}
                  </span>
                </div>
              </div>

              {/* Applicants & Documents */}
              <div className="space-y-4">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                  Applicants & Identity Checklist
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {applicants
                    .filter((a: any) => a.kycCaseId?.toString() === kc._id.toString())
                    .map((app: any) => {
                      const appDocs = documents.filter(
                        (d: any) => d.applicantId?.toString() === app._id.toString()
                      );

                      return (
                        <div
                          key={app._id}
                          className="p-5 rounded-xl bg-white/5 border border-white/10 space-y-3"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-semibold text-sm text-white">{app.fullName}</div>
                              <div className="text-[10px] text-slate-400">
                                {app.applicantType} • {app.isPrimaryApplicant ? "Primary" : "Co-Applicant"}
                              </div>
                            </div>
                            <span className="text-xs px-2 py-0.5 rounded-md bg-white/10 text-slate-300">
                              {app.verificationStatus}
                            </span>
                          </div>

                          <div className="space-y-2 pt-2 border-t border-white/5 text-xs">
                            <div className="text-[11px] text-slate-400 font-medium">
                              Submitted Documents:
                            </div>

                            {appDocs && appDocs.length > 0 ? (
                              appDocs.map((doc: any) => (
                                <div
                                  key={doc._id}
                                  className="flex items-center justify-between p-2 rounded-lg bg-black/20 text-slate-300"
                                >
                                  <div className="flex items-center space-x-2 truncate">
                                    <FileCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                                    <span className="truncate">{doc.documentType}</span>
                                  </div>
                                  <span className="text-[10px] text-emerald-400 font-mono">
                                    {doc.status}
                                  </span>
                                </div>
                              ))
                            ) : (
                              <div className="text-[11px] text-amber-300/80">
                                No documents submitted for this applicant.
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-[#071a28]/90 border border-white/10 rounded-2xl p-12 text-center text-white">
          <ShieldCheck className="w-12 h-12 text-slate-500 mx-auto mb-3" />
          <h2 className="text-lg font-serif font-bold">No Active KYC Case</h2>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            Your identity case will be initialized automatically upon booking confirmation.
          </p>
        </div>
      )}
    </div>
  );
}

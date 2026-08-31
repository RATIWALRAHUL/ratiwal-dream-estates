"use client";

import React from "react";
import Link from "next/link";
import { FileText, ExternalLink, ShieldCheck, CheckCircle2 } from "lucide-react";
import { MoneyUtils } from "@/lib/utils/money";

interface PortalDocumentsViewProps {
  data: any;
}

export function PortalDocumentsView({ data }: PortalDocumentsViewProps) {
  const { receipts, approvedPropertyDocuments } = data;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <h1 className="text-2xl font-serif font-bold text-white tracking-wide">
          Customer Document Vault
        </h1>
        <p className="text-xs text-slate-300 mt-1">
          Access customer-approved statutory approvals, property master plans, RERA disclosures, and official payment receipts.
        </p>
      </div>

      {/* Official Receipts */}
      <div className="bg-[#071a28]/90 border border-white/10 rounded-2xl p-6 text-white shadow-xl space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-300 flex items-center space-x-2">
          <FileText className="w-4 h-4 text-[#087fc3]" />
          <span>Payment Acknowledgement Receipts</span>
        </h2>

        {receipts && receipts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {receipts.map((rcp: any) => (
              <div
                key={rcp._id}
                className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono font-bold text-[#087fc3]">{rcp.receiptNumber}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300">
                      {rcp.status}
                    </span>
                  </div>
                  <div className="text-base font-serif font-bold text-white mt-1">
                    {MoneyUtils.formatINR(rcp.amountPaise)}
                  </div>
                  <div className="text-[11px] text-slate-400">
                    {new Date(rcp.receiptDate).toLocaleDateString("en-IN")}
                  </div>
                </div>

                <a
                  href={`/api/payments/receipts/${rcp._id}/preview`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full mt-2 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-semibold text-white flex items-center justify-center space-x-1.5 transition-all"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Download PDF</span>
                </a>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-xs text-slate-400 py-4">No receipts available.</div>
        )}
      </div>

      {/* Approved Legal Documents */}
      <div className="bg-[#071a28]/90 border border-white/10 rounded-2xl p-6 text-white shadow-xl space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-300 flex items-center space-x-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Statutory Disclosures & Master Layouts</span>
        </h2>

        {approvedPropertyDocuments && approvedPropertyDocuments.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {approvedPropertyDocuments.map((doc: any) => (
              <div
                key={doc._id}
                className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2 flex flex-col justify-between"
              >
                <div>
                  <div className="text-xs font-semibold text-white">{doc.title}</div>
                  <div className="text-[11px] text-slate-400">{doc.documentCategory}</div>
                  <div className="text-[10px] text-slate-500 font-mono mt-1">
                    Ref: {doc.referenceNumber || "N/A"}
                  </div>
                </div>

                <div className="text-[10px] text-emerald-400 flex items-center space-x-1 pt-2">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Public Verified Disclosure</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-xs text-slate-400 py-4">
            No public property legal disclosures published for your plots yet.
          </div>
        )}
      </div>
    </div>
  );
}

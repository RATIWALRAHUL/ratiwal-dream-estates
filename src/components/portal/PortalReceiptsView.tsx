"use client";

import React from "react";
import Link from "next/link";
import { FileText, ExternalLink } from "lucide-react";
import { MoneyUtils } from "@/lib/utils/money";

interface PortalReceiptsViewProps {
  receipts: any[];
}

export function PortalReceiptsView({ receipts }: PortalReceiptsViewProps) {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-white tracking-wide">
            Payment Receipts Vault
          </h1>
          <p className="text-xs text-slate-300 mt-1">
            Immutable, official payment acknowledgement receipts with unique cryptographic identifiers.
          </p>
        </div>
      </div>

      <div className="bg-[#071a28]/90 border border-white/10 rounded-2xl p-6 text-white shadow-xl space-y-4">
        {receipts && receipts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {receipts.map((rcp) => (
              <div
                key={rcp._id}
                className="p-5 rounded-xl bg-white/5 border border-white/10 flex flex-col justify-between space-y-4 hover:border-[#087fc3]/40 transition-all"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-sm text-[#087fc3]">
                      {rcp.receiptNumber}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      {rcp.status}
                    </span>
                  </div>

                  <div className="text-xs text-slate-400">
                    Date: {new Date(rcp.receiptDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                  </div>

                  <div className="text-lg font-serif font-bold text-white pt-1">
                    {MoneyUtils.formatINR(rcp.amountPaise)}
                  </div>
                </div>

                <div className="pt-3 border-t border-white/10 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">
                    Mode: {rcp.paymentMethod}
                  </span>

                  <a
                    href={`/api/payments/receipts/${rcp._id}/preview`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-semibold text-white flex items-center space-x-1.5 transition-all"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>View Receipt</span>
                  </a>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-slate-400 text-xs">
            <FileText className="w-10 h-10 text-slate-500 mx-auto mb-3" />
            <p>No official payment receipts issued yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}

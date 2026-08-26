"use client";

import React from "react";
import Link from "next/link";
import { LifeBuoy, Plus, MessageSquare, Clock, ArrowRight, CheckCircle2 } from "lucide-react";

interface PortalSupportViewProps {
  requests: any[];
}

export function PortalSupportView({ requests }: PortalSupportViewProps) {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-white tracking-wide">
            Customer Care & Support Tickets
          </h1>
          <p className="text-xs text-slate-300 mt-1">
            Submit inquiries regarding your bookings, payments, KYC documents, or legal registrations.
          </p>
        </div>

        <Link
          href="/portal/support/new"
          className="px-4 py-2.5 rounded-xl bg-[#087fc3] hover:bg-[#066ca8] text-xs font-semibold text-white shadow-md flex items-center space-x-1.5 transition-all self-start"
        >
          <Plus className="w-4 h-4" />
          <span>New Support Ticket</span>
        </Link>
      </div>

      <div className="bg-[#071a28]/90 border border-white/10 rounded-2xl p-6 text-white shadow-xl space-y-4">
        {requests && requests.length > 0 ? (
          <div className="space-y-3">
            {requests.map((req) => (
              <div
                key={req._id}
                className="p-5 rounded-xl bg-white/5 border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-[#087fc3]/40 transition-all"
              >
                <div className="space-y-1.5 max-w-xl">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-xs font-semibold text-[#087fc3]">
                      {req.requestNumber}
                    </span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                        req.status === "RESOLVED" || req.status === "CLOSED"
                          ? "bg-emerald-500/20 text-emerald-300"
                          : req.status === "AWAITING_CUSTOMER"
                          ? "bg-amber-500/20 text-amber-300"
                          : "bg-blue-500/20 text-blue-300"
                      }`}
                    >
                      {req.status}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      • Category: {req.category}
                    </span>
                  </div>

                  <h3 className="text-sm font-semibold text-white">{req.subject}</h3>
                  <p className="text-xs text-slate-400 line-clamp-1">{req.sanitizedDescription}</p>

                  <div className="text-[11px] text-slate-500 flex items-center space-x-2 pt-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>
                      Updated {new Date(req.updatedAt).toLocaleDateString("en-IN")} • {req.messages?.length || 1} messages
                    </span>
                  </div>
                </div>

                <Link
                  href={`/portal/support/${req._id}`}
                  className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold text-white flex items-center justify-center space-x-1.5 transition-all shrink-0"
                >
                  <span>Open Ticket</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-slate-400 text-xs">
            <LifeBuoy className="w-10 h-10 text-slate-500 mx-auto mb-3" />
            <p>No support requests created yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}

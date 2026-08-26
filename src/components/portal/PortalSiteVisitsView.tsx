"use client";

import React, { useTransition } from "react";
import Link from "next/link";
import { Calendar, Plus, Clock, MapPin, CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import { cancelSiteVisitFromPortalAction } from "@/lib/actions/portal.actions";

interface PortalSiteVisitsViewProps {
  siteVisits: any[];
}

export function PortalSiteVisitsView({ siteVisits }: PortalSiteVisitsViewProps) {
  const [isPending, startTransition] = useTransition();

  const handleCancel = (visitId: string) => {
    if (confirm("Are you sure you want to cancel this scheduled site visit?")) {
      startTransition(async () => {
        await cancelSiteVisitFromPortalAction(visitId);
      });
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-white tracking-wide">
            Site Visits & On-Site Inspections
          </h1>
          <p className="text-xs text-slate-300 mt-1">
            Schedule private property viewings, boundary inspections, and township walkthroughs.
          </p>
        </div>

        <Link
          href="/portal/site-visits/new"
          className="px-4 py-2.5 rounded-xl bg-[#087fc3] hover:bg-[#066ca8] text-xs font-semibold text-white shadow-md flex items-center space-x-1.5 transition-all self-start"
        >
          <Plus className="w-4 h-4" />
          <span>Schedule New Visit</span>
        </Link>
      </div>

      <div className="bg-[#071a28]/90 border border-white/10 rounded-2xl p-6 text-white shadow-xl space-y-4">
        {siteVisits && siteVisits.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {siteVisits.map((v) => (
              <div
                key={v._id}
                className="p-5 rounded-xl bg-white/5 border border-white/10 flex flex-col justify-between space-y-4 hover:border-[#087fc3]/40 transition-all"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-serif font-bold text-base text-white">
                      {v.propertyId?.title || "Property Inspection"}
                    </span>
                    <span
                      className={`text-[10px] px-2.5 py-0.5 rounded-full font-medium ${
                        v.status === "CONFIRMED"
                          ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                          : v.status === "CANCELLED"
                          ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                          : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                      }`}
                    >
                      {v.status}
                    </span>
                  </div>

                  <div className="text-xs text-slate-300 flex items-center space-x-2">
                    <Calendar className="w-3.5 h-3.5 text-[#087fc3]" />
                    <span>
                      {new Date(v.scheduledDate).toLocaleDateString("en-IN", {
                        weekday: "short",
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </div>

                  <div className="text-xs text-slate-400 flex items-center space-x-2">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>{v.timeSlot}</span>
                  </div>

                  {v.notes && (
                    <p className="text-[11px] text-slate-400 italic pt-1">
                      &quot;{v.notes}&quot;
                    </p>
                  )}
                </div>

                {v.status !== "CANCELLED" && v.status !== "COMPLETED" && (
                  <div className="pt-3 border-t border-white/10 flex justify-end">
                    <button
                      type="button"
                      disabled={isPending}
                      onClick={() => handleCancel(v._id.toString())}
                      className="text-xs text-rose-400 hover:text-rose-300 font-medium"
                    >
                      Cancel Visit
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-slate-400 text-xs">
            <Calendar className="w-10 h-10 text-slate-500 mx-auto mb-3" />
            <p>No site visits scheduled yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}

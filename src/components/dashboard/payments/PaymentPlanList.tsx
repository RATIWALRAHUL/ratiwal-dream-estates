"use client";

import React, { useTransition } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Search,
  Layers,
  CheckCircle2,
  Clock,
  Plus,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { MoneyUtils } from "@/lib/utils/money";
import { PAYMENT_PLAN_STATUSES } from "@/types/payment";

interface PaymentPlanListProps {
  initialPlans: any[];
  total: number;
  currentPage: number;
  totalPages: number;
  properties: any[];
}

export function PaymentPlanList({
  initialPlans,
  total,
  currentPage,
  totalPages,
  properties,
}: PaymentPlanListProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const currentStatus = searchParams.get("status") || "ALL";
  const currentProperty = searchParams.get("propertyId") || "";

  const updateFilters = (key: string, val: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (val && val !== "ALL") {
      params.set(key, val);
    } else {
      params.delete(key);
    }
    params.set("page", "1");
    startTransition(() => {
      router.push(`/dashboard/payment-plans?${params.toString()}`);
    });
  };

  const statusColors: Record<string, string> = {
    ACTIVE: "bg-emerald-50 text-emerald-800 border-emerald-200",
    DRAFT: "bg-slate-100 text-slate-700 border-slate-200",
    PENDING_APPROVAL: "bg-amber-50 text-amber-800 border-amber-200",
    SUPERSEDED: "bg-purple-50 text-purple-800 border-purple-200",
    COMPLETED: "bg-emerald-50 text-emerald-800 border-emerald-200",
    CANCELLED: "bg-rose-50 text-rose-800 border-rose-200",
  };

  return (
    <div className="space-y-6 antialiased">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-serif text-[#071a28] tracking-tight">
            Payment Plans Directory
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Total {total} structured milestone payment plans registered across active bookings.
          </p>
        </div>

        <Link
          href="/dashboard/payment-plans/new"
          className="px-4 py-2.5 rounded-xl bg-[#071a28] hover:bg-[#0d2c42] text-white font-bold text-xs flex items-center gap-2 shadow-md transition-colors self-start sm:self-center"
        >
          <Plus className="w-4 h-4" />
          <span>New Payment Plan</span>
        </Link>
      </div>

      {/* Filters */}
      <div className="p-4 rounded-3xl bg-white border border-[rgba(7,26,40,0.08)] shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
          <select
            value={currentStatus}
            onChange={(e) => updateFilters("status", e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-[#fbfaf8] text-xs font-semibold text-[#071a28]"
          >
            <option value="ALL">All Plan Statuses</option>
            {PAYMENT_PLAN_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s.replace(/_/g, " ")}
              </option>
            ))}
          </select>

          <select
            value={currentProperty}
            onChange={(e) => updateFilters("propertyId", e.target.value || null)}
            className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-[#fbfaf8] text-xs font-semibold text-[#071a28]"
          >
            <option value="">All Properties</option>
            {properties.map((p) => (
              <option key={p._id} value={p._id}>
                {p.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Plans Table */}
      <div className="bg-white rounded-3xl border border-[rgba(7,26,40,0.08)] shadow-xs overflow-hidden">
        {initialPlans.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-xs space-y-2">
            <p className="font-bold text-[#071a28]">No payment plans found.</p>
            <p>Draft a new payment plan for a confirmed booking or reservation.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-[#fbfaf8] text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  <th className="py-3.5 px-6">Plan Number</th>
                  <th className="py-3.5 px-6">Booking / Property</th>
                  <th className="py-3.5 px-6">Total Consideration</th>
                  <th className="py-3.5 px-6">Status</th>
                  <th className="py-3.5 px-6">Version</th>
                  <th className="py-3.5 px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {initialPlans.map((plan) => (
                  <tr key={plan._id} className="hover:bg-[#fbfaf8]/80 transition-colors">
                    <td className="py-4 px-6 font-mono font-bold text-[#071a28]">
                      {plan.paymentPlanNumber}
                    </td>
                    <td className="py-4 px-6">
                      <div className="font-bold text-[#071a28]">
                        Booking: {plan.bookingId?.bookingNumber || "—"}
                      </div>
                      <div className="text-[11px] text-slate-500 font-semibold">
                        {plan.propertyId?.title || "—"} • Unit {plan.unitId?.unitNumber || "—"}
                      </div>
                    </td>
                    <td className="py-4 px-6 font-bold text-[#071a28]">
                      {MoneyUtils.format(plan.totalConsiderationPaise, plan.currency)}
                    </td>
                    <td className="py-4 px-6">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                          statusColors[plan.status] || "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {plan.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 font-mono text-slate-500">
                      v{plan.version}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <Link
                        href={`/dashboard/payment-plans/${plan._id}`}
                        className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-[#071a28] font-bold text-xs shadow-2xs transition-colors"
                      >
                        Workspace
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <div>
              Page {currentPage} of {totalPages}
            </div>
            <div className="flex items-center gap-2">
              <button
                disabled={currentPage <= 1 || isPending}
                onClick={() => updateFilters("page", String(currentPage - 1))}
                className="p-2 rounded-xl border border-slate-200 disabled:opacity-40 hover:bg-slate-50"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                disabled={currentPage >= totalPages || isPending}
                onClick={() => updateFilters("page", String(currentPage + 1))}
                className="p-2 rounded-xl border border-slate-200 disabled:opacity-40 hover:bg-slate-50"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

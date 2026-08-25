import React, { Suspense } from "react";
import Link from "next/link";
import { requireAdminSession } from "@/lib/auth/guard";
import { DealService } from "@/lib/services/deal.service";
import { DealTable } from "@/components/dashboard/deals/DealTable";
import { DealKanbanBoard } from "@/components/dashboard/deals/DealKanbanBoard";
import { DealKpiSkeleton, DealTableSkeleton } from "@/components/dashboard/deals/DealsSkeletons";

export const dynamic = "force-dynamic";

interface DealsPageProps {
  searchParams: Promise<{
    view?: string;
    stage?: string;
    search?: string;
    page?: string;
  }>;
}

export default async function DealsPage({ searchParams }: DealsPageProps) {
  const session = await requireAdminSession(["SUPER_ADMIN", "ADMIN", "EDITOR"]);
  const params = await searchParams;

  const currentView = params.view === "kanban" ? "kanban" : "table";
  const stage = params.stage || "ALL";
  const search = params.search || "";
  const page = parseInt(params.page || "1", 10);

  const [pipelineSummary, dealsResult] = await Promise.all([
    DealService.getPipelineSummary(),
    DealService.listDeals({
      stage: stage as any,
      search,
      page,
      perPage: currentView === "kanban" ? 100 : 25,
    }),
  ]);

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[#c5a880] uppercase tracking-wider">
              PRD 14 • Sales Closures
            </span>
          </div>
          <h1 className="text-2xl font-bold font-serif text-[#071a28]">Deals & Pipeline</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage sales opportunities, pricing offers, inventory holds, and confirmed bookings.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* View Toggle */}
          <div className="flex items-center rounded-xl bg-slate-100 p-1 text-xs font-bold text-slate-600">
            <Link
              href={`/dashboard/deals?view=table${stage !== "ALL" ? `&stage=${stage}` : ""}`}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                currentView === "table" ? "bg-white text-[#071a28] shadow-xs" : "hover:text-slate-900"
              }`}
            >
              ☰ Table
            </Link>
            <Link
              href={`/dashboard/deals?view=kanban${stage !== "ALL" ? `&stage=${stage}` : ""}`}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                currentView === "kanban" ? "bg-white text-[#071a28] shadow-xs" : "hover:text-slate-900"
              }`}
            >
              ☷ Pipeline
            </Link>
          </div>

          <Link
            href="/dashboard/deals/new"
            className="px-4 py-2 rounded-xl bg-[#c5a880] text-[#071a28] font-bold text-xs hover:bg-[#b59870] transition-colors shadow-xs"
          >
            + Create Deal
          </Link>
        </div>
      </div>

      {/* KPI Overview Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
        <div className="p-3.5 rounded-2xl bg-white border border-[rgba(7,26,40,0.06)] space-y-1">
          <div className="text-[10px] uppercase font-bold text-slate-400">Total Deals</div>
          <div className="text-lg font-bold font-serif text-[#071a28]">
            {pipelineSummary.totalDeals}
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-white border border-[rgba(7,26,40,0.06)] space-y-1">
          <div className="text-[10px] uppercase font-bold text-slate-400">Active Pipeline</div>
          <div className="text-lg font-bold font-serif text-[#071a28]">
            ₹{(pipelineSummary.totalPipelineValueRupees / 10000000).toFixed(2)} Cr
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-purple-50 border border-purple-200/70 space-y-1">
          <div className="text-[10px] uppercase font-bold text-purple-700">Active Holds</div>
          <div className="text-lg font-bold font-serif text-purple-950">
            {pipelineSummary.activeHoldsCount}
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-indigo-50 border border-indigo-200/70 space-y-1">
          <div className="text-[10px] uppercase font-bold text-indigo-700">Reservations</div>
          <div className="text-lg font-bold font-serif text-indigo-950">
            {pipelineSummary.activeReservationsCount}
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200/70 space-y-1">
          <div className="text-[10px] uppercase font-bold text-emerald-700">Confirmed Bookings</div>
          <div className="text-lg font-bold font-serif text-emerald-950">
            {pipelineSummary.confirmedBookingsCount}
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
          <div className="text-[10px] uppercase font-bold text-slate-500">Won / Closed</div>
          <div className="text-lg font-bold font-serif text-slate-900">
            {pipelineSummary.wonDealsCount}
          </div>
        </div>
      </div>

      {/* Main View */}
      {currentView === "kanban" ? (
        <DealKanbanBoard deals={dealsResult.deals} />
      ) : (
        <DealTable deals={dealsResult.deals} />
      )}
    </div>
  );
}

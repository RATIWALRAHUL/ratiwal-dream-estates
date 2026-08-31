import React from "react";
import Link from "next/link";
import { Plus, LayoutGrid, List } from "lucide-react";
import { requireAdminSession } from "@/lib/auth/guard";
import { DealService } from "@/lib/services/deal.service";
import { DealTable } from "@/components/dashboard/deals/DealTable";
import { DealKanbanBoard } from "@/components/dashboard/deals/DealKanbanBoard";

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
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-bold text-[#0088cc] uppercase tracking-wider">
              PRD 14 • Sales Closures
            </span>
          </div>
          <h1 className="font-serif text-2xl md:text-3xl font-bold tracking-tight text-[#071a28]">
            Deals & Pipeline
          </h1>
          <p className="text-xs md:text-sm text-[#647581] mt-0.5">
            Manage sales opportunities, pricing offers, inventory holds, and confirmed bookings.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* View Toggle */}
          <div className="flex items-center rounded-xl bg-white border border-[rgba(7,26,40,0.12)] p-1 text-xs font-semibold text-[#647581] shadow-2xs">
            <Link
              href={`/dashboard/deals?view=table${stage !== "ALL" ? `&stage=${stage}` : ""}`}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                currentView === "table"
                  ? "bg-[#071a28] text-white shadow-xs"
                  : "hover:text-[#071a28]"
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>Table</span>
            </Link>
            <Link
              href={`/dashboard/deals?view=kanban${stage !== "ALL" ? `&stage=${stage}` : ""}`}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                currentView === "kanban"
                  ? "bg-[#071a28] text-white shadow-xs"
                  : "hover:text-[#071a28]"
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Pipeline</span>
            </Link>
          </div>

          <Link
            href="/dashboard/deals/new"
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0088cc] hover:bg-[#0077b5] text-white font-semibold text-xs transition-colors shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Create Deal</span>
          </Link>
        </div>
      </div>

      {/* KPI Overview Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="p-4 rounded-2xl bg-white border border-[rgba(7,26,40,0.08)] shadow-2xs space-y-1">
          <div className="text-[11px] font-semibold text-[#647581]">TOTAL DEALS</div>
          <div className="text-2xl font-serif font-bold text-[#071a28]">
            {pipelineSummary.totalDeals}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-[rgba(7,26,40,0.08)] shadow-2xs space-y-1">
          <div className="text-[11px] font-semibold text-[#647581]">ACTIVE PIPELINE</div>
          <div className="text-2xl font-serif font-bold text-[#0088cc]">
            ₹{(pipelineSummary.totalPipelineValueRupees / 10000000).toFixed(2)} Cr
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-[rgba(7,26,40,0.08)] shadow-2xs space-y-1">
          <div className="text-[11px] font-semibold text-purple-700">ACTIVE HOLDS</div>
          <div className="text-2xl font-serif font-bold text-purple-900">
            {pipelineSummary.activeHoldsCount}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-[rgba(7,26,40,0.08)] shadow-2xs space-y-1">
          <div className="text-[11px] font-semibold text-blue-700">RESERVATIONS</div>
          <div className="text-2xl font-serif font-bold text-blue-900">
            {pipelineSummary.activeReservationsCount}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-[rgba(7,26,40,0.08)] shadow-2xs space-y-1">
          <div className="text-[11px] font-semibold text-emerald-700">CONFIRMED BOOKINGS</div>
          <div className="text-2xl font-serif font-bold text-emerald-800">
            {pipelineSummary.confirmedBookingsCount}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-[rgba(7,26,40,0.08)] shadow-2xs space-y-1">
          <div className="text-[11px] font-semibold text-[#647581]">WON / CLOSED</div>
          <div className="text-2xl font-serif font-bold text-[#071a28]">
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

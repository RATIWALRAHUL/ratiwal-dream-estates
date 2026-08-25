import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { getAdminSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { connectToDatabase } from "@/lib/db/mongoose";
import { Property } from "@/models/Property";
import { InventoryService } from "@/lib/services/inventory.service";
import { InventoryFilters } from "@/components/dashboard/inventory/InventoryFilters";
import { InventoryUnitTable } from "@/components/dashboard/inventory/InventoryUnitTable";
import { InventoryMatrixView } from "@/components/dashboard/inventory/InventoryMatrixView";
import { InventoryPlotGrid } from "@/components/dashboard/inventory/InventoryPlotGrid";
import {
  Building2,
  Plus,
  Upload,
  Download,
  CheckCircle2,
  ShieldAlert,
  Grid,
  List,
  LayoutGrid,
  Layers,
  History,
} from "lucide-react";
import { InventoryFilterParams } from "@/types/inventory";

export const metadata: Metadata = {
  title: "Property Inventory & Units | Ratiwal Dream Estates Dashboard",
  description: "Live sellable inventory management, unit availability, and pricing matrix.",
};

interface InventoryPageProps {
  searchParams: Promise<{
    propertyId?: string;
    phaseName?: string;
    towerBlockSector?: string;
    floorLevel?: string;
    category?: string;
    configuration?: string;
    status?: string;
    visibility?: string;
    search?: string;
    view?: "table" | "matrix" | "grid";
    page?: string;
  }>;
}

export default async function InventoryPage({ searchParams }: InventoryPageProps) {
  const session = await getAdminSession();
  if (!session) redirect("/dashboard/login");

  await connectToDatabase();
  const properties = await Property.find().select("title inventoryMode").sort({ title: 1 }).lean();

  const params = await searchParams;
  const viewMode = params.view || "table";
  const page = params.page ? parseInt(params.page, 10) : 1;

  const filterParams: InventoryFilterParams = {
    propertyId: params.propertyId,
    phaseName: params.phaseName,
    towerBlockSector: params.towerBlockSector,
    floorLevel: params.floorLevel,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    category: (params.category as any) || undefined,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    configuration: (params.configuration as any) || undefined,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    status: (params.status as any) || undefined,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    visibility: (params.visibility as any) || undefined,
    search: params.search,
    page,
    perPage: 25,
  };

  const [queryResult, availabilitySummaries, matrixData] = await Promise.all([
    InventoryService.queryUnits(filterParams, session),
    InventoryService.getAvailabilitySummary(params.propertyId),
    viewMode === "matrix" && params.propertyId
      ? InventoryService.getMatrixViewData(params.propertyId, params.towerBlockSector)
      : Promise.resolve([]),
  ]);

  const totalAllUnits = availabilitySummaries.reduce((acc, s) => acc + s.totalUnits, 0);
  const totalAvailable = availabilitySummaries.reduce((acc, s) => acc + s.availableCount, 0);
  const totalOnHold = availabilitySummaries.reduce((acc, s) => acc + (s.onHoldCount + s.reservedCount + s.bookedCount), 0);
  const totalSold = availabilitySummaries.reduce((acc, s) => acc + s.soldCount, 0);

  return (
    <div className="space-y-6">
      {/* Header & Primary Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-[10px] font-mono uppercase tracking-widest text-[#647581] mb-1">
            INVENTORY & SELLABLE ASSETS
          </p>
          <h1 className="text-2xl font-bold font-serif text-[#071a28] tracking-tight">
            Units, Plots & Pricing Management
          </h1>
          <p className="text-sm text-[#647581] mt-1">
            Real inventory records, Tower × Floor matrices, and category-conditional pricing controls.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/dashboard/inventory/quality"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-[rgba(7,26,40,0.1)] text-[#071a28] hover:bg-white text-xs font-bold transition-colors shadow-2xs"
          >
            <ShieldAlert className="w-3.5 h-3.5 text-[#087fc3]" />
            <span>Data Health</span>
          </Link>

          <Link
            href="/dashboard/inventory/history"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-[rgba(7,26,40,0.1)] text-[#071a28] hover:bg-white text-xs font-bold transition-colors shadow-2xs"
          >
            <History className="w-3.5 h-3.5 text-[#087fc3]" />
            <span>Audit Log</span>
          </Link>

          <Link
            href="/dashboard/inventory/import"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-[rgba(7,26,40,0.1)] text-[#071a28] hover:bg-white text-xs font-bold transition-colors shadow-2xs"
          >
            <Upload className="w-3.5 h-3.5 text-[#087fc3]" />
            <span>Import CSV</span>
          </Link>

          <a
            href={`/api/inventory/export?${new URLSearchParams(params as any).toString()}`}
            download
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-[rgba(7,26,40,0.1)] text-[#071a28] hover:bg-white text-xs font-bold transition-colors shadow-2xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export</span>
          </a>

          <Link
            href="/dashboard/inventory/new"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#071a28] hover:bg-[#087fc3] text-white text-xs font-bold transition-all shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Add Unit / Plot</span>
          </Link>
        </div>
      </div>

      {/* 4 Summary Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-[rgba(7,26,40,0.08)] shadow-xs p-5 space-y-1">
          <span className="text-[10px] font-mono uppercase text-[#647581] font-bold">Total Sellable Units</span>
          <p className="text-3xl font-bold font-serif text-[#071a28]">{totalAllUnits}</p>
          <p className="text-[10px] text-[#647581]">Across all registered developments</p>
        </div>

        <div className="bg-white rounded-2xl border border-[rgba(7,26,40,0.08)] shadow-xs p-5 space-y-1">
          <span className="text-[10px] font-mono uppercase text-emerald-700 font-bold">Available Now</span>
          <p className="text-3xl font-bold font-serif text-emerald-800">{totalAvailable}</p>
          <p className="text-[10px] text-emerald-700">
            {totalAllUnits > 0 ? `${Math.round((totalAvailable / totalAllUnits) * 100)}% available` : "—"}
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-[rgba(7,26,40,0.08)] shadow-xs p-5 space-y-1">
          <span className="text-[10px] font-mono uppercase text-amber-700 font-bold">Under Hold / Reserved</span>
          <p className="text-3xl font-bold font-serif text-amber-800">{totalOnHold}</p>
          <p className="text-[10px] text-amber-700">Pre-booking state locks</p>
        </div>

        <div className="bg-white rounded-2xl border border-[rgba(7,26,40,0.08)] shadow-xs p-5 space-y-1">
          <span className="text-[10px] font-mono uppercase text-slate-600 font-bold">Sold / Conveyed</span>
          <p className="text-3xl font-bold font-serif text-slate-700">{totalSold}</p>
          <p className="text-[10px] text-slate-600">Documented sales</p>
        </div>
      </div>

      {/* Filter Controls Bar */}
      <Suspense>
        <InventoryFilters
          properties={properties.map((p) => ({ _id: p._id.toString(), title: p.title }))}
        />
      </Suspense>

      {/* View Mode Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link
            href={`?${new URLSearchParams({ ...params, view: "table" }).toString()}`}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              viewMode === "table"
                ? "bg-[#071a28] text-white shadow-xs"
                : "bg-white border border-[rgba(7,26,40,0.1)] text-[#647581] hover:text-[#071a28]"
            }`}
          >
            <List className="w-3.5 h-3.5" />
            <span>Table View</span>
          </Link>

          <Link
            href={`?${new URLSearchParams({ ...params, view: "grid" }).toString()}`}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              viewMode === "grid"
                ? "bg-[#071a28] text-white shadow-xs"
                : "bg-white border border-[rgba(7,26,40,0.1)] text-[#647581] hover:text-[#071a28]"
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>Plot Card Grid</span>
          </Link>

          {params.propertyId && (
            <Link
              href={`?${new URLSearchParams({ ...params, view: "matrix" }).toString()}`}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                viewMode === "matrix"
                  ? "bg-[#071a28] text-white shadow-xs"
                  : "bg-white border border-[rgba(7,26,40,0.1)] text-[#647581] hover:text-[#071a28]"
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Tower Matrix</span>
            </Link>
          )}
        </div>

        <span className="text-xs font-mono text-[#647581]">
          Showing {queryResult.units.length} of {queryResult.total} units
        </span>
      </div>

      {/* Main Content Area */}
      {viewMode === "matrix" ? (
        <InventoryMatrixView towers={matrixData} />
      ) : viewMode === "grid" ? (
        <InventoryPlotGrid units={queryResult.units} />
      ) : (
        <InventoryUnitTable
          units={queryResult.units}
          total={queryResult.total}
          page={queryResult.page}
          perPage={queryResult.perPage}
          selectedUnitIds={[]}
          onToggleSelect={() => {}}
          onSelectAll={() => {}}
        />
      )}
    </div>
  );
}

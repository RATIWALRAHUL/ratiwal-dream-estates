import "server-only";
import { getDashboardLocations } from "@/lib/services/dashboard.service";
import { MarketAtlas } from "@/components/dashboard/locations/MarketAtlas";
import { LocationFilters } from "@/components/dashboard/locations/LocationFilters";
import { LocationGrid } from "@/components/dashboard/locations/LocationGrid";
import { LocationTable } from "@/components/dashboard/locations/LocationTable";
import type { PublicationStatus } from "@/types/database";

export const dynamic = "force-dynamic";

interface DashboardLocationsPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function DashboardLocationsPage({
  searchParams,
}: DashboardLocationsPageProps) {
  const params = await searchParams;

  const search = typeof params.search === "string" ? params.search : undefined;
  const publicationStatus = typeof params.publicationStatus === "string" ? (params.publicationStatus as PublicationStatus) : undefined;
  const state = typeof params.state === "string" ? params.state : undefined;
  const featured = params.featured === "true" ? true : params.featured === "false" ? false : undefined;
  const view = typeof params.view === "string" ? params.view : "grid";
  const page = typeof params.page === "string" ? Number(params.page) || 1 : 1;

  const locationsResult = await getDashboardLocations({
    search,
    publicationStatus,
    state,
    featured,
    page,
    pageSize: view === "table" ? 10 : 9,
  });

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* 1. Market Atlas Panel with Brand Hero & Real Metrics */}
      <MarketAtlas summary={locationsResult.summary} activeState={state} />

      {/* 2. Enhanced Filter Controls */}
      <LocationFilters />

      {/* 3. Location Inventory (Cards Grid or Detailed Table) */}
      {view === "table" ? (
        <LocationTable data={locationsResult} />
      ) : (
        <LocationGrid data={locationsResult} />
      )}
    </div>
  );
}

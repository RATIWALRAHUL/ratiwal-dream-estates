import "server-only";
import { getDashboardProperties, getLocationOptions } from "@/lib/services/dashboard.service";
import { PropertyFilters } from "@/components/dashboard/properties/PropertyFilters";
import { PropertyTable } from "@/components/dashboard/properties/PropertyTable";
import type { PropertyType, PublicationStatus, ListingStatus, VerificationStatus } from "@/types/database";

export const dynamic = "force-dynamic";

interface DashboardPropertiesPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function DashboardPropertiesPage({
  searchParams,
}: DashboardPropertiesPageProps) {
  const params = await searchParams;

  const search = typeof params.search === "string" ? params.search : undefined;
  const locationId = typeof params.locationId === "string" ? params.locationId : undefined;
  const propertyType = typeof params.propertyType === "string" ? (params.propertyType as PropertyType) : undefined;
  const publicationStatus = typeof params.publicationStatus === "string" ? (params.publicationStatus as PublicationStatus) : undefined;
  const listingStatus = typeof params.listingStatus === "string" ? (params.listingStatus as ListingStatus) : undefined;
  const verificationStatus = typeof params.verificationStatus === "string" ? (params.verificationStatus as VerificationStatus) : undefined;
  const sortBy = typeof params.sortBy === "string" ? (params.sortBy as "newest" | "oldest" | "updated" | "title" | "sortOrder") : "updated";
  const page = typeof params.page === "string" ? Number(params.page) || 1 : 1;

  const [propertiesResult, locations] = await Promise.all([
    getDashboardProperties({
      search,
      locationId,
      propertyType,
      publicationStatus,
      listingStatus,
      verificationStatus,
      sortBy,
      page,
      pageSize: 10,
    }),
    getLocationOptions(),
  ]);

  return (
    <div className="space-y-6">
      {/* Page Title Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold font-serif text-[#071a28] tracking-tight">
          Properties Catalog Management
        </h1>
        <p className="text-xs text-[#647581] mt-0.5">
          Read-only property portfolio overview, filterable by corridor, zoning type, publication state, and statutory due diligence status.
        </p>
      </div>

      {/* Filter Controls */}
      <PropertyFilters locations={locations} />

      {/* Property Results Table & Mobile Card List */}
      <PropertyTable data={propertiesResult} />
    </div>
  );
}

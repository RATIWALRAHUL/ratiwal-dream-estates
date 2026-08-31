import "server-only";
import { connectToDatabase } from "@/lib/db/mongoose";
import { Location } from "@/models/Location";
import { Property } from "@/models/Property";
import { PlotOption } from "@/models/PlotOption";
import { formatPaiseToRupeeString } from "@/lib/utils/currency";
import type {
  PropertyType,
  ListingStatus,
  PublicationStatus,
  VerificationStatus,
  PlotStatus,
} from "@/types/database";

export interface DashboardOverviewData {
  metrics: {
    totalProperties: number;
    publishedProperties: number;
    draftOrReviewProperties: number;
    totalPlotOptions: number;
    availablePlots: number;
    reservedPlots: number;
    soldPlots: number;
    onRequestPlots: number;
    unavailablePlots: number;
    activeLocations: number;
  };
  inventoryBreakdown: {
    status: PlotStatus;
    label: string;
    count: number;
    percentage: number;
  }[];
  publicationBreakdown: {
    status: PublicationStatus;
    label: string;
    count: number;
  }[];
  verificationAlerts: {
    propertyId: string;
    title: string;
    slug: string;
    reason: string;
    severity: "HIGH" | "MEDIUM" | "LOW";
    lastVerifiedAt?: string;
  }[];
  recentProperties: {
    id: string;
    title: string;
    slug: string;
    locationName: string;
    propertyType: PropertyType;
    publicationStatus: PublicationStatus;
    listingStatus: ListingStatus;
    verificationStatus: VerificationStatus;
    priceDisplay: string;
    primaryImageUrl?: string;
    updatedAt: string;
    isPublished: boolean;
  }[];
  locationCoverage: {
    id: string;
    name: string;
    city: string;
    state: string;
    propertyCount: number;
    availablePlotCount: number;
    publicationStatus: PublicationStatus;
    lastVerifiedAt?: string;
  }[];
  lastRefreshedAt: string;
}

export interface PropertyQueryFilters {
  search?: string;
  locationId?: string;
  propertyType?: PropertyType;
  publicationStatus?: PublicationStatus;
  listingStatus?: ListingStatus;
  verificationStatus?: VerificationStatus;
  sortBy?: "newest" | "oldest" | "updated" | "title" | "sortOrder";
  page?: number;
  pageSize?: number;
}

export interface PaginatedPropertiesResult {
  items: {
    id: string;
    title: string;
    slug: string;
    locationId: string;
    locationName: string;
    propertyType: PropertyType;
    listingStatus: ListingStatus;
    publicationStatus: PublicationStatus;
    verificationStatus: VerificationStatus;
    areaDisplay: string;
    priceDisplay: string;
    priceVisibility: string;
    primaryImageUrl?: string;
    updatedAt: string;
    lastVerifiedAt?: string;
    isPublished: boolean;
  }[];
  pagination: {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export interface LocationQueryFilters {
  search?: string;
  publicationStatus?: PublicationStatus;
  state?: string;
  featured?: boolean;
  page?: number;
  pageSize?: number;
}

export interface DashboardLocationItem {
  id: string;
  name: string;
  slug: string;
  city: string;
  state: string;
  region?: string;
  tagline?: string;
  shortDescription?: string;
  heroImageUrl?: string;
  microMarkets: { id?: string; name: string; tagline?: string }[];
  supportedPropertyTypes?: string[];
  propertyCount: number;
  activePlotCount: number;
  publicationStatus: PublicationStatus;
  featured: boolean;
  sortOrder: number;
  lastVerifiedAt?: string;
}

export interface PaginatedLocationsResult {
  summary: {
    totalLocations: number;
    activeMarkets: number;
    totalProperties: number;
    totalAvailablePlots: number;
    verifiedStates: number;
  };
  items: DashboardLocationItem[];
  pagination: {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

/**
 * Escapes special regex characters in search strings to prevent injection.
 */
export function escapeRegex(text: string): string {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
}

/**
 * Aggregates all high-level overview metrics for the /dashboard page.
 */
export async function getDashboardOverview(): Promise<DashboardOverviewData> {
  await connectToDatabase();

  // Run primary aggregate queries in parallel
  const [
    propertyCounts,
    plotCounts,
    locationCounts,
    verificationIssues,
    recentPropDocs,
    locationsWithCounts,
  ] = await Promise.all([
    // 1. Property publication and status counts
    Property.aggregate<{
      _id: PublicationStatus;
      count: number;
    }>([
      {
        $group: {
          _id: "$publicationStatus",
          count: { $sum: 1 },
        },
      },
    ]),

    // 2. Plot option status counts
    PlotOption.aggregate<{
      _id: PlotStatus;
      count: number;
    }>([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]),

    // 3. Location publication counts
    Location.aggregate<{
      _id: PublicationStatus;
      count: number;
    }>([
      {
        $group: {
          _id: "$publicationStatus",
          count: { $sum: 1 },
        },
      },
    ]),

    // 4. Verification alert query
    Property.find({
      $or: [
        { verificationStatus: "UNVERIFIED" },
        { verificationStatus: "EXPIRED" },
        { verificationStatus: "UNDER_REVIEW" },
        { "rera.applicable": true, "rera.registrationNumber": { $exists: false } },
        { "rera.applicable": true, "rera.registrationNumber": "" },
        { lastVerifiedAt: { $exists: false } },
        { lastVerifiedAt: { $lt: new Date(Date.now() - 180 * 86400000) } }, // Older than 180 days
      ],
    })
      .select("title slug verificationStatus rera media lastVerifiedAt")
      .limit(10)
      .lean(),

    // 5. Recent properties with location populated
    Property.find()
      .sort({ updatedAt: -1, createdAt: -1 })
      .limit(5)
      .populate<{ locationId: { name: string; city: string } }>("locationId", "name city")
      .select(
        "title slug locationId propertyType publicationStatus listingStatus verificationStatus pricing area media updatedAt"
      )
      .lean(),

    // 6. Location coverage with property and plot counts (optimized: early sort and limit before foreign lookup)
    Location.aggregate([
      { $sort: { sortOrder: 1, name: 1 } },
      { $limit: 8 },
      {
        $lookup: {
          from: "properties",
          localField: "_id",
          foreignField: "locationId",
          as: "properties",
        },
      },
      {
        $lookup: {
          from: "plotoptions",
          localField: "properties._id",
          foreignField: "propertyId",
          as: "plots",
        },
      },
      {
        $project: {
          name: 1,
          city: 1,
          state: 1,
          publicationStatus: 1,
          lastVerifiedAt: 1,
          sortOrder: 1,
          propertyCount: { $size: "$properties" },
          availablePlotCount: {
            $size: {
              $filter: {
                input: "$plots",
                as: "p",
                cond: { $eq: ["$$p.status", "AVAILABLE"] },
              },
            },
          },
        },
      },
    ]),
  ]);

  // Aggregate property counts
  let totalProperties = 0;
  let publishedProperties = 0;
  let draftOrReviewProperties = 0;

  const pubBreakdownMap: Record<PublicationStatus, number> = {
    DRAFT: 0,
    REVIEW: 0,
    PUBLISHED: 0,
    ARCHIVED: 0,
  };

  for (const pc of propertyCounts) {
    const count = pc.count;
    totalProperties += count;
    if (pc._id === "PUBLISHED") publishedProperties = count;
    if (pc._id === "DRAFT" || pc._id === "REVIEW") draftOrReviewProperties += count;
    if (pc._id in pubBreakdownMap) {
      pubBreakdownMap[pc._id] = count;
    }
  }

  // Aggregate plot counts
  const plotBreakdownMap: Record<PlotStatus, number> = {
    AVAILABLE: 0,
    RESERVED: 0,
    SOLD: 0,
    ON_REQUEST: 0,
    UNAVAILABLE: 0,
  };

  let totalPlots = 0;
  for (const plc of plotCounts) {
    totalPlots += plc.count;
    if (plc._id in plotBreakdownMap) {
      plotBreakdownMap[plc._id] = plc.count;
    }
  }

  // Aggregate location counts
  let activeLocations = 0;
  for (const lc of locationCounts) {
    if (lc._id === "PUBLISHED") {
      activeLocations += lc.count;
    }
  }

  // Format inventory breakdown items with percentage
  const inventoryBreakdown = [
    {
      status: "AVAILABLE" as PlotStatus,
      label: "Available Units",
      count: plotBreakdownMap.AVAILABLE,
      percentage: totalPlots > 0 ? Math.round((plotBreakdownMap.AVAILABLE / totalPlots) * 100) : 0,
    },
    {
      status: "RESERVED" as PlotStatus,
      label: "Reserved Units",
      count: plotBreakdownMap.RESERVED,
      percentage: totalPlots > 0 ? Math.round((plotBreakdownMap.RESERVED / totalPlots) * 100) : 0,
    },
    {
      status: "SOLD" as PlotStatus,
      label: "Sold Units",
      count: plotBreakdownMap.SOLD,
      percentage: totalPlots > 0 ? Math.round((plotBreakdownMap.SOLD / totalPlots) * 100) : 0,
    },
    {
      status: "ON_REQUEST" as PlotStatus,
      label: "Price On Request",
      count: plotBreakdownMap.ON_REQUEST,
      percentage: totalPlots > 0 ? Math.round((plotBreakdownMap.ON_REQUEST / totalPlots) * 100) : 0,
    },
    {
      status: "UNAVAILABLE" as PlotStatus,
      label: "Unavailable / Phased",
      count: plotBreakdownMap.UNAVAILABLE,
      percentage: totalPlots > 0 ? Math.round((plotBreakdownMap.UNAVAILABLE / totalPlots) * 100) : 0,
    },
  ];

  // Publication breakdown list
  const publicationBreakdown: { status: PublicationStatus; label: string; count: number }[] = [
    { status: "PUBLISHED", label: "Live in Catalog", count: pubBreakdownMap.PUBLISHED },
    { status: "REVIEW", label: "Under Legal Review", count: pubBreakdownMap.REVIEW },
    { status: "DRAFT", label: "Draft Parcels", count: pubBreakdownMap.DRAFT },
    { status: "ARCHIVED", label: "Soft Archived", count: pubBreakdownMap.ARCHIVED },
  ];

  // Map verification alert items
  const verificationAlerts = verificationIssues.map((p) => {
    let reason = "Requires due diligence review";
    let severity: "HIGH" | "MEDIUM" | "LOW" = "MEDIUM";

    if (p.verificationStatus === "UNVERIFIED") {
      reason = "Unverified listing — title & statutory review pending";
      severity = "HIGH";
    } else if (p.verificationStatus === "EXPIRED") {
      reason = "Verification validity expired (> 180 days)";
      severity = "HIGH";
    } else if (p.rera?.applicable && !p.rera.registrationNumber) {
      reason = "Applicable RERA registration number missing";
      severity = "HIGH";
    } else if (!p.lastVerifiedAt) {
      reason = "Missing formal statutory verification timestamp";
      severity = "MEDIUM";
    } else if (Array.isArray(p.media) && !p.media.some((m) => m.isPrimary)) {
      reason = "Approved primary public photo missing";
      severity = "LOW";
    }

    return {
      propertyId: String(p._id),
      title: p.title,
      slug: p.slug,
      reason,
      severity,
      lastVerifiedAt: p.lastVerifiedAt ? new Date(p.lastVerifiedAt).toISOString() : undefined,
    };
  });

  // Map recent properties view model
  const recentProperties = recentPropDocs.map((p) => {
    const loc = p.locationId && typeof p.locationId === "object" ? p.locationId : null;
    const locationName = loc ? `${loc.name}` : "Unknown Location";

    let priceDisplay = "On Request";
    if (p.pricing?.startingPricePaise) {
      priceDisplay = `${formatPaiseToRupeeString(p.pricing.startingPricePaise)} Onwards`;
    } else if (p.pricing?.ratePaisePerSqFt) {
      priceDisplay = `₹${(p.pricing.ratePaisePerSqFt / 100).toLocaleString("en-IN")}/sq.ft.`;
    }

    const primaryMedia = Array.isArray(p.media) ? p.media.find((m) => m.isPrimary) || p.media[0] : null;

    return {
      id: String(p._id),
      title: p.title,
      slug: p.slug,
      locationName,
      propertyType: p.propertyType,
      publicationStatus: p.publicationStatus,
      listingStatus: p.listingStatus,
      verificationStatus: p.verificationStatus,
      priceDisplay,
      primaryImageUrl: primaryMedia?.url,
      updatedAt: p.updatedAt ? new Date(p.updatedAt).toISOString() : new Date().toISOString(),
      isPublished: p.publicationStatus === "PUBLISHED",
    };
  });

  // Map location coverage
  const locationCoverage = locationsWithCounts.map((loc) => ({
    id: String(loc._id),
    name: loc.name,
    city: loc.city,
    state: loc.state,
    propertyCount: loc.propertyCount || 0,
    availablePlotCount: loc.availablePlotCount || 0,
    publicationStatus: loc.publicationStatus,
    lastVerifiedAt: loc.lastVerifiedAt ? new Date(loc.lastVerifiedAt).toISOString() : undefined,
  }));

  return {
    metrics: {
      totalProperties,
      publishedProperties,
      draftOrReviewProperties,
      totalPlotOptions: totalPlots,
      availablePlots: plotBreakdownMap.AVAILABLE,
      reservedPlots: plotBreakdownMap.RESERVED,
      soldPlots: plotBreakdownMap.SOLD,
      onRequestPlots: plotBreakdownMap.ON_REQUEST,
      unavailablePlots: plotBreakdownMap.UNAVAILABLE,
      activeLocations,
    },
    inventoryBreakdown,
    publicationBreakdown,
    verificationAlerts,
    recentProperties,
    locationCoverage,
    lastRefreshedAt: new Date().toISOString(),
  };
}

/**
 * Queries properties with search, filters, pagination, and safe field projections.
 */
export async function getDashboardProperties(
  filters: PropertyQueryFilters = {}
): Promise<PaginatedPropertiesResult> {
  await connectToDatabase();

  const page = Math.max(1, Number(filters.page) || 1);
  const pageSize = Math.min(50, Math.max(1, Number(filters.pageSize) || 10));
  const skip = (page - 1) * pageSize;

  const query: Record<string, unknown> = {};

  // Safe search
  if (filters.search && filters.search.trim().length > 0) {
    const cleanSearch = filters.search.trim().slice(0, 50);
    const regex = new RegExp(escapeRegex(cleanSearch), "i");
    query.$or = [{ title: regex }, { slug: regex }, { locality: regex }];
  }

  // Exact filters
  if (filters.locationId && filters.locationId !== "ALL") {
    query.locationId = filters.locationId;
  }
  if (filters.propertyType && filters.propertyType !== ("ALL" as unknown)) {
    query.propertyType = filters.propertyType;
  }
  if (filters.publicationStatus && filters.publicationStatus !== ("ALL" as unknown)) {
    query.publicationStatus = filters.publicationStatus;
  }
  if (filters.listingStatus && filters.listingStatus !== ("ALL" as unknown)) {
    query.listingStatus = filters.listingStatus;
  }
  if (filters.verificationStatus && filters.verificationStatus !== ("ALL" as unknown)) {
    query.verificationStatus = filters.verificationStatus;
  }

  // Sort definition
  let sortOption: Record<string, 1 | -1> = { updatedAt: -1 };
  if (filters.sortBy === "newest") sortOption = { createdAt: -1 };
  if (filters.sortBy === "oldest") sortOption = { createdAt: 1 };
  if (filters.sortBy === "title") sortOption = { title: 1 };
  if (filters.sortBy === "sortOrder") sortOption = { sortOrder: 1, createdAt: -1 };

  const [totalItems, propertyDocs] = await Promise.all([
    Property.countDocuments(query),
    Property.find(query)
      .sort(sortOption)
      .skip(skip)
      .limit(pageSize)
      .populate<{ locationId: { name: string; city: string } }>("locationId", "name city")
      .select(
        "title slug locationId propertyType listingStatus publicationStatus verificationStatus area pricing media updatedAt lastVerifiedAt"
      )
      .lean(),
  ]);

  const items = propertyDocs.map((p) => {
    const loc = p.locationId && typeof p.locationId === "object" ? p.locationId : null;
    const locationName = loc ? `${loc.name}, ${loc.city}` : "Unassigned";

    let priceDisplay = "On Request";
    if (p.pricing?.startingPricePaise) {
      priceDisplay = `${formatPaiseToRupeeString(p.pricing.startingPricePaise)}`;
    } else if (p.pricing?.ratePaisePerSqFt) {
      priceDisplay = `₹${(p.pricing.ratePaisePerSqFt / 100).toLocaleString("en-IN")}/sq.ft.`;
    }

    const minSqYd = p.area?.minimumAreaSqFt ? Math.round(p.area.minimumAreaSqFt / 9) : 0;
    const maxSqYd = p.area?.maximumAreaSqFt ? Math.round(p.area.maximumAreaSqFt / 9) : 0;
    const areaDisplay =
      minSqYd > 0 && maxSqYd > 0
        ? minSqYd === maxSqYd
          ? `${minSqYd} Sq. Yd`
          : `${minSqYd} - ${maxSqYd} Sq. Yd`
        : "Area On Request";

    const primaryMedia = Array.isArray(p.media) ? p.media.find((m) => m.isPrimary) || p.media[0] : null;

    return {
      id: String(p._id),
      title: p.title,
      slug: p.slug,
      locationId: loc ? String((p.locationId as unknown as { _id: string })._id || "") : "",
      locationName,
      propertyType: p.propertyType,
      listingStatus: p.listingStatus,
      publicationStatus: p.publicationStatus,
      verificationStatus: p.verificationStatus,
      areaDisplay,
      priceDisplay,
      priceVisibility: p.pricing?.priceVisibility || "PUBLIC",
      primaryImageUrl: primaryMedia?.url,
      updatedAt: p.updatedAt ? new Date(p.updatedAt).toISOString() : new Date().toISOString(),
      lastVerifiedAt: p.lastVerifiedAt ? new Date(p.lastVerifiedAt).toISOString() : undefined,
      isPublished: p.publicationStatus === "PUBLISHED",
    };
  });

  const totalPages = Math.ceil(totalItems / pageSize) || 1;

  return {
    items,
    pagination: {
      page,
      pageSize,
      totalItems,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
  };
}

/**
 * Queries locations with search, filters, pagination, and enriched plot counts.
 */
export async function getDashboardLocations(
  filters: LocationQueryFilters = {}
): Promise<PaginatedLocationsResult> {
  await connectToDatabase();

  const page = Math.max(1, Number(filters.page) || 1);
  const pageSize = Math.min(50, Math.max(1, Number(filters.pageSize) || 10));
  const skip = (page - 1) * pageSize;

  const matchQuery: Record<string, unknown> = {};

  if (filters.search && filters.search.trim().length > 0) {
    const cleanSearch = filters.search.trim().slice(0, 50);
    const regex = new RegExp(escapeRegex(cleanSearch), "i");
    matchQuery.$or = [{ name: regex }, { city: regex }, { state: regex }];
  }

  if (filters.publicationStatus && filters.publicationStatus !== ("ALL" as unknown)) {
    matchQuery.publicationStatus = filters.publicationStatus;
  }
  if (filters.state && filters.state !== "ALL") {
    matchQuery.state = filters.state;
  }
  if (filters.featured !== undefined) {
    matchQuery.featured = filters.featured;
  }

  const [totalItems, results, summaryStats] = await Promise.all([
    Location.countDocuments(matchQuery),
    Location.aggregate([
      { $match: matchQuery },
      { $sort: { sortOrder: 1, name: 1 } },
      { $skip: skip },
      { $limit: pageSize },
      {
        $lookup: {
          from: "properties",
          localField: "_id",
          foreignField: "locationId",
          as: "properties",
        },
      },
      {
        $lookup: {
          from: "plotoptions",
          localField: "properties._id",
          foreignField: "propertyId",
          as: "plots",
        },
      },
      {
        $project: {
          name: 1,
          slug: 1,
          city: 1,
          state: 1,
          region: 1,
          tagline: 1,
          shortDescription: 1,
          heroImage: 1,
          microMarkets: 1,
          supportedPropertyTypes: 1,
          publicationStatus: 1,
          featured: 1,
          sortOrder: 1,
          lastVerifiedAt: 1,
          propertyCount: { $size: "$properties" },
          activePlotCount: {
            $size: {
              $filter: {
                input: "$plots",
                as: "p",
                cond: { $eq: ["$$p.status", "AVAILABLE"] },
              },
            },
          },
        },
      },
    ]),
    Promise.all([
      Location.aggregate<{
        totalLocations: { count: number }[];
        activeMarkets: { count: number }[];
        states: { _id: string }[];
      }>([
        {
          $facet: {
            totalLocations: [{ $count: "count" }],
            activeMarkets: [
              { $match: { publicationStatus: "PUBLISHED" } },
              { $count: "count" },
            ],
            states: [{ $group: { _id: "$state" } }],
          },
        },
      ]),
      Property.countDocuments({ publicationStatus: { $ne: "ARCHIVED" } }),
      PlotOption.countDocuments({ status: "AVAILABLE" }),
    ]).then(([locFacet, totalProps, availPlots]) => {
      const facetResult = locFacet[0] || {
        totalLocations: [],
        activeMarkets: [],
        states: [],
      };
      return {
        totalLocations: facetResult.totalLocations[0]?.count || 0,
        activeMarkets: facetResult.activeMarkets[0]?.count || 0,
        totalProperties: totalProps,
        totalAvailablePlots: availPlots,
        verifiedStates: facetResult.states.length,
      };
    }),
  ]);

  const items: DashboardLocationItem[] = results.map((loc) => ({
    id: String(loc._id),
    name: loc.name,
    slug: loc.slug,
    city: loc.city,
    state: loc.state,
    region: loc.region,
    tagline: loc.tagline,
    shortDescription: loc.shortDescription,
    heroImageUrl: loc.heroImage?.url || `/images/locations/${loc.slug}.jpg`,
    microMarkets: (loc.microMarkets || []).map((mm: any) => ({
      id: mm.id,
      name: mm.name,
      tagline: mm.tagline,
    })),
    supportedPropertyTypes: loc.supportedPropertyTypes || [],
    propertyCount: loc.propertyCount || 0,
    activePlotCount: loc.activePlotCount || 0,
    publicationStatus: loc.publicationStatus,
    featured: Boolean(loc.featured),
    sortOrder: loc.sortOrder || 0,
    lastVerifiedAt: loc.lastVerifiedAt ? new Date(loc.lastVerifiedAt).toISOString() : undefined,
  }));

  const totalPages = Math.ceil(totalItems / pageSize) || 1;

  return {
    summary: summaryStats,
    items,
    pagination: {
      page,
      pageSize,
      totalItems,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
  };
}

/**
 * Retrieves all locations as id/name pairs for property filter dropdowns.
 */
export async function getLocationOptions(): Promise<{ id: string; name: string }[]> {
  await connectToDatabase();
  const locs = await Location.find().select("_id name city").sort({ sortOrder: 1, name: 1 }).lean();
  return locs.map((l) => ({ id: String(l._id), name: `${l.name} (${l.city})` }));
}

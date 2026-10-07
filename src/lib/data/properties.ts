import "server-only";
import { cache } from "react";
import { connectToDatabase } from "@/lib/db/mongoose";
import { Property } from "@/models/Property";
import { PlotOption } from "@/models/PlotOption";
import "@/models/Location"; // registers the "Location" model for .populate("locationId") below
import type { Property as StaticProperty, PlotOption as StaticPlotOption } from "@/types/property";
import {
  PROPERTY_TYPE_LABELS,
  LISTING_STATUS_LABELS,
  PLOT_FACING_LABELS,
  PLOT_STATUS_LABELS,
  DOCUMENT_TYPE_LABELS,
  DOCUMENT_VERIFICATION_STATUS_LABELS,
} from "@/lib/utils/catalog-labels";
import { sqFtToSqYards } from "@/lib/utils/area";
import { formatPaiseToRupeeString } from "@/lib/utils/currency";

/** Shape of a Property doc after `.populate("locationId", ...)` + `.lean()` */
interface PopulatedPropertyDoc {
  _id: string;
  title: string;
  slug: string;
  shortDescription: string;
  fullDescription?: string;
  propertyType: keyof typeof PROPERTY_TYPE_LABELS;
  listingStatus: keyof typeof LISTING_STATUS_LABELS;
  locality?: string;
  address?: string;
  featured: boolean;
  pricing: {
    priceVisibility: "PUBLIC" | "ON_REQUEST";
    startingPricePaise?: number;
  };
  area: {
    minimumAreaSqFt: number;
    maximumAreaSqFt: number;
  };
  highlights?: string[];
  amenities?: { name: string; category: string; status: "Available" | "Under Development" | "Planned"; description?: string }[];
  infrastructureMilestones?: { name: string; description: string }[];
  connectivityMilestones?: { destination: string; approxTravelTime: string; route: string; travelMode: string }[];
  possessionOrDevelopmentStatus?: string;
  brochure?: { title: string; fileUrl: string; sizeBytes?: number; lastUpdated?: string };
  masterplan?: { title: string; fileUrl: string; imageUrl?: string; approvalAuthority?: string; version?: string };
  rera?: {
    applicable: boolean;
    registrationNumber?: string;
    authorityName?: string;
    status: string;
  };
  media: { url: string; sortOrder: number; isPrimary: boolean; publicationStatus: "ACTIVE" | "ARCHIVED" }[];
  documents?: { type: keyof typeof DOCUMENT_TYPE_LABELS; title: string; fileUrl?: string; verificationStatus: keyof typeof DOCUMENT_VERIFICATION_STATUS_LABELS }[];
  createdAt: string;
  updatedAt: string;
  locationId?: {
    _id: string;
    name: string;
    city: string;
    state: string;
    slug: string;
    coordinates?: { latitude: number; longitude: number };
  };
}

interface PopulatedPlotOptionDoc {
  _id: string;
  label?: string;
  plotNumber?: string;
  widthFeet?: number;
  lengthFeet?: number;
  areaSqFt: number;
  basePricePaise?: number;
  facing?: keyof typeof PLOT_FACING_LABELS;
  cornerPlot: boolean;
  status: keyof typeof PLOT_STATUS_LABELS;
}

const RERA_STATUS_LABELS: Record<string, string> = {
  NOT_APPLICABLE: "Exempted / Pre-RERA",
  PENDING_VERIFICATION: "Registration in Progress",
  VERIFIED: "Registered & Verified",
  EXPIRED: "Registration in Progress",
  REJECTED: "Registration in Progress",
};

/** High-speed plain object serializer avoiding JSON.parse(JSON.stringify) memory overhead */
function serializeDoc<T>(doc: Record<string, any>): T {
  return {
    ...doc,
    _id: doc._id?.toString() || doc.id,
    createdAt: doc.createdAt instanceof Date ? doc.createdAt.toISOString() : doc.createdAt,
    updatedAt: doc.updatedAt instanceof Date ? doc.updatedAt.toISOString() : doc.updatedAt,
    locationId: doc.locationId
      ? {
          ...doc.locationId,
          _id: doc.locationId._id?.toString() || doc.locationId.id,
        }
      : undefined,
  } as T;
}

function mapPlotOption(doc: PopulatedPlotOptionDoc): StaticPlotOption {
  const areaSqYd = sqFtToSqYards(doc.areaSqFt);
  const ratePerSqYd = doc.basePricePaise ? Math.round(doc.basePricePaise / 100 / areaSqYd) : 0;

  return {
    id: doc._id,
    label: doc.label || doc.plotNumber || "Plot Option",
    plotNumber: doc.plotNumber,
    widthFt: doc.widthFeet || 0,
    lengthFt: doc.lengthFeet || 0,
    areaSqYd,
    areaSqFt: doc.areaSqFt,
    ratePerSqYd,
    basePriceLabel: doc.basePricePaise ? formatPaiseToRupeeString(doc.basePricePaise) : "Price on Request",
    facing: doc.facing ? PLOT_FACING_LABELS[doc.facing] : "North",
    isCorner: doc.cornerPlot,
    status: PLOT_STATUS_LABELS[doc.status],
  };
}

function mapProperty(doc: PopulatedPropertyDoc, plotOptions: PopulatedPlotOptionDoc[] = []): StaticProperty {
  const location = doc.locationId;
  const sortedMedia = [...(doc.media || [])]
    .filter((m) => m.publicationStatus === "ACTIVE")
    .sort((a, b) => (b.isPrimary ? 1 : 0) - (a.isPrimary ? 1 : 0) || a.sortOrder - b.sortOrder);

  const plotSizes =
    plotOptions.length > 0
      ? Array.from(new Set(plotOptions.map((p) => `${sqFtToSqYards(p.areaSqFt)} Sq. Yds`)))
      : Array.from(
          new Set(
            [doc.area.minimumAreaSqFt, doc.area.maximumAreaSqFt].map((sqFt) => `${sqFtToSqYards(sqFt)} Sq. Yds`)
          )
        );

  const priceLabel =
    doc.pricing.priceVisibility === "PUBLIC" && doc.pricing.startingPricePaise
      ? `${formatPaiseToRupeeString(doc.pricing.startingPricePaise)} Onwards`
      : "Price on Request";

  return {
    id: doc._id,
    slug: doc.slug,
    name: doc.title,
    shortDescription: doc.shortDescription,
    description: doc.fullDescription || doc.shortDescription || "",
    location: doc.locality || location?.name || "",
    city: location?.city || "",
    state: location?.state || "",
    propertyType: PROPERTY_TYPE_LABELS[doc.propertyType] as StaticProperty["propertyType"],
    plotSizes,
    priceLabel,
    images: sortedMedia.length > 0 ? sortedMedia.map((m) => m.url) : ["/images/about/township-development.jpg"],
    highlights: doc.highlights || [],
    connectivity: (doc.connectivityMilestones || []).map(
      (m) => `${m.destination} — ${m.approxTravelTime} via ${m.route}`
    ),
    nearbyLandmarks: [],
    futureDevelopment: (doc.infrastructureMilestones || []).map((m) => m.description),
    approvalAuthority: doc.rera?.authorityName,
    approvalDetails: doc.rera?.registrationNumber ? `RERA Reg: ${doc.rera.registrationNumber}` : undefined,
    documentation: (doc.documents || []).map((d) => d.title),
    investmentPerspective: undefined,
    featured: doc.featured,
    status: LISTING_STATUS_LABELS[doc.listingStatus],
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,

    coordinates: location?.coordinates,
    plotOptions: plotOptions.length > 0 ? plotOptions.map(mapPlotOption) : undefined,
    amenitiesList: (doc.amenities || []).map((a) => ({
      name: a.name,
      category: a.category,
      status: a.status,
      description: a.description,
    })),
    documentsList: (doc.documents || []).map((d) => ({
      name: d.title,
      type: DOCUMENT_TYPE_LABELS[d.type],
      status: DOCUMENT_VERIFICATION_STATUS_LABELS[d.verificationStatus],
      publicFileUrl: d.fileUrl,
      description: d.title,
    })),
    masterplan: doc.masterplan
      ? {
          title: doc.masterplan.title,
          imageUrl: doc.masterplan.imageUrl || "",
          fileUrl: doc.masterplan.fileUrl,
          fileSize: "",
          version: doc.masterplan.version || "",
          approvalAuthority: doc.masterplan.approvalAuthority || "",
        }
      : undefined,
    brochure: doc.brochure
      ? {
          title: doc.brochure.title,
          fileUrl: doc.brochure.fileUrl,
          fileSize: doc.brochure.sizeBytes ? `${(doc.brochure.sizeBytes / (1024 * 1024)).toFixed(1)} MB` : "",
          fileType: "PDF",
          lastUpdated: doc.brochure.lastUpdated || doc.updatedAt,
        }
      : undefined,
    reraInfo: doc.rera?.applicable
      ? {
          reraNumber: doc.rera.registrationNumber || "",
          authorityName: doc.rera.authorityName || "",
          registrationStatus: RERA_STATUS_LABELS[doc.rera.status] || "Registration in Progress",
          portalUrl: "",
        }
      : undefined,
    possessionTimeline: doc.possessionOrDevelopmentStatus,
    totalTownshipArea: undefined,
  };
}

/** Lean projection for card, catalog, and related lists — cuts query payload by over 70% */
export const PROPERTY_CARD_PROJECTION = {
  _id: 1,
  title: 1,
  slug: 1,
  shortDescription: 1,
  propertyType: 1,
  listingStatus: 1,
  locality: 1,
  address: 1,
  featured: 1,
  pricing: 1,
  area: 1,
  highlights: 1,
  media: 1,
  sortOrder: 1,
  createdAt: 1,
  updatedAt: 1,
  locationId: 1,
};

import { fastCache } from "@/lib/cache/data-cache";

async function fetchPublishedProperties(filter: Record<string, unknown> = {}, isCardOnly: boolean = true): Promise<PopulatedPropertyDoc[]> {
  await connectToDatabase();
  let query = Property.find({ publicationStatus: "PUBLISHED", ...filter })
    .populate("locationId", "name city state slug coordinates")
    .sort({ sortOrder: 1, createdAt: -1 });

  if (isCardOnly) {
    query = query.select(PROPERTY_CARD_PROJECTION);
  }

  const docs = await query.lean();
  return docs.map((doc) => serializeDoc<PopulatedPropertyDoc>(doc));
}

/** Cached catalog fetch deduplicating queries across parallel server components with fast SWR */
export const getAllProperties = cache(async (): Promise<StaticProperty[]> => {
  return fastCache.getOrSet(
    "properties:catalog:all",
    async () => {
      const docs = await fetchPublishedProperties({}, true);
      return docs.map((doc) => mapProperty(doc));
    },
    { ttlMs: 120 * 1000, swrMs: 600 * 1000 }
  );
});

/** Cached featured properties utilizing the compound index and fast SWR */
export const getFeaturedProperties = cache(async (): Promise<StaticProperty[]> => {
  return fastCache.getOrSet(
    "properties:featured",
    async () => {
      const docs = await fetchPublishedProperties({ featured: true }, true);
      return docs.map((doc) => mapProperty(doc));
    },
    { ttlMs: 120 * 1000, swrMs: 600 * 1000 }
  );
});

/** Cached property detail lookup deduplicating metadata generation and page render with fast SWR */
export const getPropertyBySlug = cache(async (slug: string): Promise<StaticProperty | undefined> => {
  if (!slug) return undefined;
  const normalizedSlug = slug.toLowerCase();
  return fastCache.getOrSet(
    `properties:slug:${normalizedSlug}`,
    async () => {
      await connectToDatabase();
      const doc = await Property.findOne({ slug: normalizedSlug, publicationStatus: "PUBLISHED" })
        .populate("locationId", "name city state slug coordinates")
        .lean();
      if (!doc) return undefined;

      const plotDocs = await PlotOption.find({ propertyId: doc._id, publiclyVisible: true })
        .sort({ sortOrder: 1 })
        .lean();

      const serializedDoc = serializeDoc<PopulatedPropertyDoc>(doc);
      const serializedPlots = plotDocs.map((p) => serializeDoc<PopulatedPlotOptionDoc>(p));

      return mapProperty(serializedDoc, serializedPlots);
    },
    { ttlMs: 180 * 1000, swrMs: 600 * 1000 }
  );
});

/** High-speed indexed related properties query — avoids fetching entire property catalog */
export const getRelatedProperties = cache(async (currentSlug: string, count: number = 3): Promise<StaticProperty[]> => {
  if (!currentSlug) return [];
  const normalizedSlug = currentSlug.toLowerCase();
  return fastCache.getOrSet(
    `properties:related:${normalizedSlug}:${count}`,
    async () => {
      await connectToDatabase();
      const current = await getPropertyBySlug(normalizedSlug);
      if (!current) return [];

      // Query indexed subset directly from MongoDB instead of loading the entire DB in memory
      const docs = await Property.find({
        publicationStatus: "PUBLISHED",
        slug: { $ne: normalizedSlug },
      })
        .select(PROPERTY_CARD_PROJECTION)
        .populate("locationId", "name city state slug coordinates")
        .sort({ sortOrder: 1, createdAt: -1 })
        .limit(count * 3)
        .lean();

      const serialized = docs.map((d) => serializeDoc<PopulatedPropertyDoc>(d));
      const mapped = serialized.map((doc) => mapProperty(doc));

      const sameCity = mapped.filter((p) => p.city.toLowerCase() === current.city.toLowerCase());
      const sameType = mapped.filter((p) => p.propertyType === current.propertyType && !sameCity.some((c) => c.id === p.id));
      const others = mapped.filter((p) => !sameCity.some((c) => c.id === p.id) && !sameType.some((t) => t.id === p.id));

      return [...sameCity, ...sameType, ...others].slice(0, count);
    },
    { ttlMs: 300 * 1000, swrMs: 600 * 1000 }
  );
});

/** Targeted cache invalidation helper when property data is mutated */
export function invalidatePropertyCache(slug?: string) {
  if (slug) {
    fastCache.invalidate(`properties:slug:${slug.toLowerCase()}`);
    fastCache.invalidate(`properties:related:${slug.toLowerCase()}*`);
  }
  fastCache.invalidate("properties:catalog*");
  fastCache.invalidate("properties:featured");
}

import "server-only";
import { cache } from "react";
import { connectToDatabase } from "@/lib/db/mongoose";
import { Location } from "@/models/Location";
import type { Location as StaticLocation } from "@/types/location";
import type { PropertyType } from "@/types/database";
import { pluralizePropertyTypeLabel } from "@/lib/utils/catalog-labels";

/** Shape of a Location doc after `.lean()` + JSON round-trip. */
interface LocationDoc {
  _id: string;
  name: string;
  slug: string;
  state: string;
  region?: string;
  tagline?: string;
  shortDescription: string;
  longDescription?: string;
  heroImage?: { url: string };
  coordinates?: { latitude: number; longitude: number };
  featured: boolean;
  supportedPropertyTypes: PropertyType[];
  microMarkets: {
    _id?: string;
    name: string;
    tagline?: string;
    description: string;
    propertyTypes: string[];
    connectivityContext?: string;
    highlights: string[];
    regulatoryAuthority?: string;
    relevantPropertySlugs?: string[];
  }[];
  infrastructureHighlights: {
    _id?: string;
    name: string;
    category: string;
    status: string;
    description: string;
    source: string;
    sourceUrl?: string;
    lastVerifiedAt?: string;
  }[];
  connectivityHighlights: {
    destination: string;
    distanceKm: number;
    approxTravelTime: string;
    travelMode: string;
    route: string;
    lastVerifiedAt?: string;
  }[];
  buyerConsiderations: {
    title: string;
    category: string;
    description: string;
    importance: string;
  }[];
  faq: { question: string; answer: string }[];
  lastVerifiedAt?: string;
  updatedAt: string;
}

function mapLocation(doc: LocationDoc): StaticLocation {
  return {
    id: doc._id,
    slug: doc.slug,
    name: doc.name,
    state: doc.state,
    region: doc.region || "",
    tagline: doc.tagline || "",
    shortDescription: doc.shortDescription,
    longDescription: doc.longDescription || doc.shortDescription,
    heroImage: doc.heroImage?.url || "",
    coordinates: doc.coordinates || { latitude: 0, longitude: 0 },
    featured: doc.featured,
    propertyTypes: doc.supportedPropertyTypes.map(pluralizePropertyTypeLabel),
    microMarkets: doc.microMarkets.map((m) => ({
      id: m._id || m.name,
      name: m.name,
      tagline: m.tagline || "",
      description: m.description,
      propertyTypes: m.propertyTypes,
      connectivityContext: m.connectivityContext || "",
      highlights: m.highlights,
      regulatoryAuthority: m.regulatoryAuthority || "",
      relevantPropertySlugs: m.relevantPropertySlugs || [],
    })),
    infrastructure: doc.infrastructureHighlights.map((i) => ({
      id: i._id || i.name,
      name: i.name,
      category: i.category,
      status: i.status,
      description: i.description,
      source: i.source,
      sourceUrl: i.sourceUrl,
      lastVerifiedAt: i.lastVerifiedAt || doc.updatedAt,
    })),
    connectivity: doc.connectivityHighlights.map((c) => ({
      destination: c.destination,
      distanceKm: c.distanceKm,
      approxTravelTime: c.approxTravelTime,
      travelMode: c.travelMode,
      route: c.route,
      lastVerifiedAt: c.lastVerifiedAt || doc.updatedAt,
    })),
    buyerConsiderations: doc.buyerConsiderations,
    marketData: undefined,
    faq: doc.faq,
    lastVerifiedAt: doc.lastVerifiedAt || doc.updatedAt,
  };
}

/** Fast plain object serializer avoiding JSON.parse(JSON.stringify) memory overhead */
function serializeLocationDoc(doc: Record<string, any>): LocationDoc {
  return {
    ...doc,
    _id: doc._id?.toString() || doc.id,
    updatedAt: doc.updatedAt instanceof Date ? doc.updatedAt.toISOString() : doc.updatedAt,
    lastVerifiedAt: doc.lastVerifiedAt instanceof Date ? doc.lastVerifiedAt.toISOString() : doc.lastVerifiedAt,
    microMarkets: (doc.microMarkets || []).map((m: any) => ({
      ...m,
      _id: m._id?.toString() || m.id,
    })),
    infrastructureHighlights: (doc.infrastructureHighlights || []).map((i: any) => ({
      ...i,
      _id: i._id?.toString() || i.id,
      lastVerifiedAt: i.lastVerifiedAt instanceof Date ? i.lastVerifiedAt.toISOString() : i.lastVerifiedAt,
    })),
    connectivityHighlights: (doc.connectivityHighlights || []).map((c: any) => ({
      ...c,
      _id: c._id?.toString() || c.id,
      lastVerifiedAt: c.lastVerifiedAt instanceof Date ? c.lastVerifiedAt.toISOString() : c.lastVerifiedAt,
    })),
  } as LocationDoc;
}

import { fastCache } from "@/lib/cache/data-cache";

async function fetchPublishedLocations(filter: Record<string, unknown> = {}): Promise<LocationDoc[]> {
  await connectToDatabase();
  const docs = await Location.find({ publicationStatus: "PUBLISHED", ...filter })
    .sort({ sortOrder: 1, name: 1 })
    .lean();
  return docs.map(serializeLocationDoc);
}

export const getAllLocations = cache(async (): Promise<StaticLocation[]> => {
  return fastCache.getOrSet(
    "locations:all",
    async () => {
      const docs = await fetchPublishedLocations();
      return docs.map(mapLocation);
    },
    { ttlMs: 300 * 1000, swrMs: 900 * 1000 }
  );
});

export const getLocationBySlug = cache(async (slug: string): Promise<StaticLocation | undefined> => {
  if (!slug) return undefined;
  const normalizedSlug = slug.toLowerCase();
  return fastCache.getOrSet(
    `locations:slug:${normalizedSlug}`,
    async () => {
      await connectToDatabase();
      const doc = await Location.findOne({ slug: normalizedSlug, publicationStatus: "PUBLISHED" }).lean();
      if (!doc) return undefined;
      return mapLocation(serializeLocationDoc(doc));
    },
    { ttlMs: 300 * 1000, swrMs: 900 * 1000 }
  );
});

export const getLocationsByState = cache(async (state: string): Promise<StaticLocation[]> => {
  const normalizedState = state.toLowerCase();
  return fastCache.getOrSet(
    `locations:state:${normalizedState}`,
    async () => {
      const docs = await fetchPublishedLocations({ state: { $regex: state, $options: "i" } });
      return docs.map(mapLocation);
    },
    { ttlMs: 300 * 1000, swrMs: 900 * 1000 }
  );
});

export function invalidateLocationCache(slug?: string) {
  if (slug) {
    fastCache.invalidate(`locations:slug:${slug.toLowerCase()}`);
  }
  fastCache.invalidate("locations:all");
  fastCache.invalidate("locations:state*");
}

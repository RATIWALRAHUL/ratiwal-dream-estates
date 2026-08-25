import { z } from "zod";
import {
  PropertyTypeEnum,
  MicroMarketTypeEnum,
  InfrastructureStatusEnum,
  MarketObservationMetricTypeEnum,
  MarketObservationSourceTypeEnum,
  MarketObservationVerificationEnum,
  VerificationStatusEnum,
} from "@/types/database";

/**
 * 1. Minimal Draft Creation Schema
 */
export const createLocationDraftSchema = z.object({
  name: z.string().trim().min(2, "Location name must be at least 2 characters").max(100, "Location name cannot exceed 100 characters"),
  slug: z.string().trim().toLowerCase().optional(),
  city: z.string().trim().min(2, "City is required"),
  state: z.string().trim().min(2, "State is required"),
  country: z.string().trim().min(2, "Country is required").default("India"),
  region: z.string().trim().optional(),
  shortDescription: z.string().trim().min(10, "Short description must be at least 10 characters").max(500, "Short description cannot exceed 500 characters"),
});

export type CreateLocationDraftInput = z.infer<typeof createLocationDraftSchema>;

/**
 * 2. Full Location Update Schema (with Optimistic Concurrency)
 */
export const updateLocationSchema = z.object({
  expectedVersion: z.number().int().min(0, "Invalid version"),
  name: z.string().trim().min(2).max(100).optional(),
  city: z.string().trim().min(2).optional(),
  state: z.string().trim().min(2).optional(),
  country: z.string().trim().min(2).optional(),
  region: z.string().trim().optional(),
  tagline: z.string().trim().optional(),
  shortDescription: z.string().trim().min(10).max(500).optional(),
  longDescription: z.string().trim().optional(),
  heroImage: z
    .object({
      url: z.string().trim().url("Invalid image URL").or(z.literal("")),
      storagePublicId: z.string().trim().optional(),
      altText: z.string().trim().optional(),
      caption: z.string().trim().optional(),
      width: z.number().positive().optional(),
      height: z.number().positive().optional(),
    })
    .optional(),
  coordinates: z
    .object({
      latitude: z.number().min(-90).max(90).optional(),
      longitude: z.number().min(-180).max(180).optional(),
      isVerified: z.boolean().optional(),
      source: z.string().trim().optional(),
    })
    .optional(),
  supportedPropertyTypes: z.array(z.enum(PropertyTypeEnum)).optional(),
  featured: z.boolean().optional(),
  sortOrder: z.number().int().optional(),
  verificationStatus: z.enum(VerificationStatusEnum).optional(),
  verifiedBy: z.string().trim().optional(),
  verificationNotes: z.string().trim().optional(),
  nextReviewDate: z.string().datetime().or(z.date()).optional(),
  seo: z
    .object({
      metaTitle: z.string().trim().min(5, "Meta title must be at least 5 characters").max(70, "Meta title cannot exceed 70 characters").optional(),
      metaDescription: z.string().trim().min(10, "Meta description must be at least 10 characters").max(160, "Meta description cannot exceed 160 characters").optional(),
      canonicalUrl: z.string().trim().url().optional().or(z.literal("")),
      ogImageUrl: z.string().trim().url().optional().or(z.literal("")),
      noIndex: z.boolean().optional(),
      noFollow: z.boolean().optional(),
    })
    .optional(),
});

export type UpdateLocationInput = z.infer<typeof updateLocationSchema>;

/**
 * 3. Lifecycle Schemas
 */
export const returnLocationToDraftSchema = z.object({
  reason: z.string().trim().min(5, "A reason of at least 5 characters is required to return to draft").max(1000),
});

export const archiveLocationSchema = z.object({
  reason: z.string().trim().min(5, "A reason of at least 5 characters is required to archive this location").max(1000),
});

export const changePublishedLocationSlugSchema = z.object({
  newSlug: z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must only contain lowercase alphanumeric characters and hyphens")
    .min(3, "Slug must be at least 3 characters")
    .max(100),
  reason: z.string().trim().min(5, "Reason for changing published slug is required").max(500),
  confirmed: z.literal(true, { error: "You must explicitly confirm this permanent routing change" }),
});

/**
 * 4. Micro-Market Schema
 */
export const microMarketSchema = z.object({
  _id: z.string().optional(),
  name: z.string().trim().min(2, "Micro-market name is required"),
  slug: z.string().trim().toLowerCase().optional(),
  tagline: z.string().trim().optional(),
  description: z.string().trim().min(5, "Description is required"),
  propertyTypes: z.array(z.string()).default([]),
  connectivityContext: z.string().trim().optional(),
  highlights: z.array(z.string().trim()).default([]),
  regulatoryAuthority: z.string().trim().optional(),
  relevantPropertySlugs: z.array(z.string()).default([]),
  marketType: z.enum(MicroMarketTypeEnum).default("RESIDENTIAL_CORRIDOR"),
  featured: z.boolean().default(false),
  sortOrder: z.number().int().default(0),
  isPublic: z.boolean().default(true),
  coordinates: z
    .object({
      latitude: z.number().min(-90).max(90),
      longitude: z.number().min(-180).max(180),
    })
    .optional(),
  sourceReferences: z.array(z.string().trim()).default([]),
});

export type MicroMarketInput = z.infer<typeof microMarketSchema>;

/**
 * 5. Infrastructure Milestone Schema
 */
export const infrastructureMilestoneSchema = z.object({
  _id: z.string().optional(),
  name: z.string().trim().min(2, "Infrastructure name is required"),
  title: z.string().trim().optional(),
  category: z.string().trim().min(2, "Category is required (e.g. Ring Road, Airport, Metro)"),
  status: z.enum(InfrastructureStatusEnum).default("OPERATIONAL"),
  description: z.string().trim().min(5, "Description is required"),
  distanceKm: z.number().min(0, "Distance cannot be negative").optional(),
  expectedCompletionDate: z.string().trim().optional(),
  source: z.string().trim().min(2, "Official data source is required"),
  sourceUrl: z.string().trim().url("Valid source URL required").optional().or(z.literal("")),
  sourceDate: z.string().or(z.date()).optional(),
  isPublic: z.boolean().default(true),
  sortOrder: z.number().int().default(0),
});

export type InfrastructureMilestoneInput = z.infer<typeof infrastructureMilestoneSchema>;

/**
 * 6. Connectivity Milestone Schema
 */
export const connectivityMilestoneSchema = z.object({
  _id: z.string().optional(),
  destination: z.string().trim().min(2, "Destination landmark is required"),
  destinationCategory: z.string().trim().optional(),
  distanceKm: z.number().min(0, "Distance must be non-negative"),
  approxTravelTime: z.string().trim().min(2, "Travel time estimate is required (e.g. 25 mins)"),
  travelMode: z.string().trim().min(2, "Travel mode is required (e.g. Expressway / Car)"),
  route: z.string().trim().min(2, "Route corridor is required"),
  supportingNote: z.string().trim().optional(),
  source: z.string().trim().optional(),
  isPublic: z.boolean().default(true),
  sortOrder: z.number().int().default(0),
});

export type ConnectivityMilestoneInput = z.infer<typeof connectivityMilestoneSchema>;

/**
 * 7. Market Observation Schema
 */
export const marketObservationSchema = z.object({
  _id: z.string().optional(),
  metricType: z.enum(MarketObservationMetricTypeEnum).or(z.string().trim().min(2)),
  numericValue: z.number({ error: "Numeric value is required" }),
  canonicalUnit: z.string().trim().min(1).default("PAISE_PER_SQ_FT"),
  observationPeriod: z.string().trim().min(2, "Observation period is required (e.g. Q1 2026, 2025-H2)"),
  sourceName: z.string().trim().min(2, "Data source name is required"),
  sourceUrl: z.string().trim().url("Source URL must be a valid link").optional().or(z.literal("")),
  sourceType: z.enum(MarketObservationSourceTypeEnum).default("GOVERNMENT"),
  verificationStatus: z.enum(MarketObservationVerificationEnum).default("UNVERIFIED"),
  isPublic: z.boolean().default(true),
  internalNotes: z.string().trim().optional(),
});

export type MarketObservationInput = z.infer<typeof marketObservationSchema>;

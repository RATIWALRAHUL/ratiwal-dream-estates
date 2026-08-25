import { z } from "zod";
import { isValidHttpUrl } from "@/lib/utils/url";

const objectIdRegex = /^[0-9a-fA-F]{24}$/;
const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

// Custom URL validator that allows both HTTP(S) and root-relative static asset paths
const mediaUrlSchema = z.string().refine((val) => !val || isValidHttpUrl(val), {
  message: "Must be a valid HTTP/HTTPS URL or root-relative path (e.g. /images/...)",
});

// Custom HTTP/HTTPS URL validator for external links
const httpUrlSchema = z.string().refine((val) => !val || (typeof val === "string" && (val.startsWith("http://") || val.startsWith("https://"))), {
  message: "Must be a valid HTTP or HTTPS URL",
});

/**
 * Minimum fields required to initialize a Property Draft
 */
export const createPropertyDraftSchema = z.object({
  title: z
    .string()
    .min(3, "Title must be at least 3 characters")
    .max(200, "Title must not exceed 200 characters")
    .trim(),
  slug: z
    .string()
    .min(3, "Slug must be at least 3 characters")
    .max(100, "Slug must not exceed 100 characters")
    .regex(slugRegex, "Slug must contain only lowercase letters, numbers, and hyphens")
    .trim()
    .optional(),
  locationId: z
    .string()
    .min(1, "Location corridor is required")
    .regex(objectIdRegex, "Invalid location ID format"),
  propertyType: z.enum(
    ["RESIDENTIAL_PLOT", "COMMERCIAL_PLOT", "INDUSTRIAL_PLOT", "FARM_LAND", "VILLA"]
  ),
  shortDescription: z
    .string()
    .min(10, "Short description must be at least 10 characters")
    .max(500, "Short description must not exceed 500 characters")
    .trim(),
  listingStatus: z
    .enum(["AVAILABLE", "LIMITED", "RESERVED", "SOLD", "UNAVAILABLE"])
    .default("AVAILABLE"),
});

export type CreatePropertyDraftInput = z.infer<typeof createPropertyDraftSchema>;

/**
 * Subdocument schemas
 */
const mediaItemSchema = z.object({
  url: mediaUrlSchema,
  altText: z.string().max(200, "Alt text must not exceed 200 characters").trim().optional(),
  caption: z.string().max(300, "Caption must not exceed 300 characters").trim().optional(),
  isPrimary: z.boolean().default(false),
  publicationStatus: z.enum(["PUBLISHED", "DRAFT"]).default("PUBLISHED"),
  sortOrder: z.number().int().min(0).default(0),
});

const documentItemSchema = z.object({
  title: z.string().min(2, "Document title is required").max(150).trim(),
  type: z.enum(["BROCHURE", "MASTERPLAN", "RERA_CERTIFICATE", "TITLE_DEED", "APPROVAL", "PRICE_SHEET", "OTHER"]),
  fileUrl: mediaUrlSchema,
  visibility: z.enum(["PUBLIC", "PRIVATE", "INTERNAL"]).default("PUBLIC"),
  verificationStatus: z.enum(["VERIFIED", "UNVERIFIED", "EXPIRED"]).default("UNVERIFIED"),
  version: z.string().max(20).trim().optional(),
});

const connectivityMilestoneSchema = z.object({
  destination: z.string().min(2, "Destination is required").max(150).trim(),
  travelTimeMinutes: z.number().min(1, "Travel time must be at least 1 minute").max(300),
  distanceKm: z.number().min(0.1, "Distance must be greater than 0").max(500).optional(),
  transportMode: z.enum(["CAR", "METRO", "BUS", "TRAIN", "FLIGHT", "WALK"]).default("CAR"),
  note: z.string().max(200).trim().optional(),
  sortOrder: z.number().int().min(0).default(0),
});

const infrastructureMilestoneSchema = z.object({
  title: z.string().min(2).max(150).trim(),
  description: z.string().max(500).trim().optional(),
  status: z.enum(["COMPLETED", "UNDER_CONSTRUCTION", "PROPOSED", "DELAYED"]).default("COMPLETED"),
  completionYear: z.number().int().min(2000).max(2050).optional(),
  sortOrder: z.number().int().min(0).default(0),
});

/**
 * Full 11-Section Property Update Schema
 */
export const updatePropertySchema = z
  .object({
    expectedVersion: z.number().int().min(0, "Invalid document version"),

    // 1. Basic Information
    title: z.string().min(3).max(200).trim(),
    slug: z.string().min(3).max(100).regex(slugRegex, "Invalid slug format").trim(),
    shortDescription: z.string().min(10).max(500).trim(),
    fullDescription: z.string().max(5000).trim().optional(),
    propertyType: z.enum(["RESIDENTIAL_PLOT", "COMMERCIAL_PLOT", "INDUSTRIAL_PLOT", "FARM_LAND", "VILLA"]),
    listingStatus: z.enum(["AVAILABLE", "LIMITED", "RESERVED", "SOLD", "UNAVAILABLE"]),
    sourceType: z
      .enum(["DIRECT_LANDOWNER", "DEVELOPER", "AUTHORIZED_CHANNEL_PARTNER", "INTERNAL", "OTHER"])
      .default("INTERNAL"),
    developerName: z.string().max(150).trim().optional(),
    featured: z.boolean().default(false),
    sortOrder: z.number().int().min(0).default(0),

    // 2. Location
    locationId: z.string().regex(objectIdRegex, "Invalid location ID"),

    // 3. Descriptions, Highlights, Amenities
    highlights: z.array(z.string().max(200).trim()).default([]),
    amenities: z.array(z.string().max(100).trim()).default([]),

    // 4. Pricing
    pricingType: z.enum(["STARTING_FROM", "FIXED", "RANGE", "PRICE_ON_REQUEST"]).default("STARTING_FROM"),
    startingPricePaise: z.number().int().min(0).optional(),
    maximumPricePaise: z.number().int().min(0).optional(),
    ratePerSqYdPaise: z.number().int().min(0).optional(),
    priceVisibility: z.enum(["PUBLIC", "ON_REQUEST"]).default("PUBLIC"),
    pricingNote: z.string().max(500).trim().optional(),

    // 5. Area (canonical sq ft)
    minimumAreaSqFt: z.number().min(1, "Minimum area must be greater than 0"),
    maximumAreaSqFt: z.number().min(1, "Maximum area must be greater than 0"),
    displayPreference: z.enum(["SQ_FT", "SQ_YD", "BOTH"]).default("BOTH"),

    // 6. Infrastructure & Connectivity
    infrastructureMilestones: z.array(infrastructureMilestoneSchema).default([]),
    connectivityMilestones: z.array(connectivityMilestoneSchema).default([]),

    // 7. Media
    media: z.array(mediaItemSchema).default([]),

    // 8. Documents
    documents: z.array(documentItemSchema).default([]),

    // 9. RERA
    rera: z.object({
      isApplicable: z.boolean().default(true),
      registrationNumber: z.string().max(100).trim().optional(),
      authorityName: z.string().max(150).trim().optional(),
      authorityUrl: httpUrlSchema.optional(),
      reraStatus: z.enum(["REGISTERED", "APPLIED", "EXEMPTED", "NOT_APPLICABLE"]).default("REGISTERED"),
      internalNotes: z.string().max(2000).trim().optional(),
    }),

    // 10. Diligence Verification Status
    verificationStatus: z.enum(["UNVERIFIED", "UNDER_REVIEW", "VERIFIED", "EXPIRED"]).default("UNVERIFIED"),

    // 11. SEO
    seo: z.object({
      metaTitle: z.string().max(100).trim().optional(),
      metaDescription: z.string().max(300).trim().optional(),
      canonicalUrl: httpUrlSchema.optional(),
      ogImage: mediaUrlSchema.optional(),
      noIndex: z.boolean().default(false),
      noFollow: z.boolean().default(false),
    }),
  })
  .refine(
    (data) => {
      if (data.maximumAreaSqFt < data.minimumAreaSqFt) {
        return false;
      }
      return true;
    },
    {
      message: "Maximum area cannot be smaller than minimum area",
      path: ["maximumAreaSqFt"],
    }
  )
  .refine(
    (data) => {
      if (
        data.startingPricePaise &&
        data.maximumPricePaise &&
        data.maximumPricePaise < data.startingPricePaise
      ) {
        return false;
      }
      return true;
    },
    {
      message: "Maximum price cannot be smaller than starting price",
      path: ["maximumPricePaise"],
    }
  )
  .refine(
    (data) => {
      const primaryCount = data.media.filter((m) => m.isPrimary).length;
      return primaryCount <= 1;
    },
    {
      message: "Only one primary image is allowed",
      path: ["media"],
    }
  );

export type UpdatePropertyInput = z.infer<typeof updatePropertySchema>;

/**
 * Return to Draft Schema (requires reason)
 */
export const returnToDraftSchema = z.object({
  reason: z
    .string()
    .min(5, "Reason must be at least 5 characters")
    .max(1000, "Reason must not exceed 1000 characters")
    .trim(),
  expectedVersion: z.number().int().min(0),
});

/**
 * Archive Property Schema (requires reason)
 */
export const archivePropertySchema = z.object({
  reason: z
    .string()
    .min(5, "Reason must be at least 5 characters")
    .max(1000, "Reason must not exceed 1000 characters")
    .trim(),
  expectedVersion: z.number().int().min(0),
});

/**
 * Change Published Slug Schema (Super Admin only, requires reason)
 */
export const changePublishedSlugSchema = z.object({
  newSlug: z
    .string()
    .min(3, "New slug is required")
    .max(100)
    .regex(slugRegex, "Invalid slug format")
    .trim(),
  reason: z
    .string()
    .min(5, "Reason for changing published URL slug is required")
    .max(1000)
    .trim(),
  expectedVersion: z.number().int().min(0),
});

/**
 * Plot Option Management Schemas
 */
export const createPlotOptionSchema = z.object({
  plotNumber: z
    .string()
    .min(1, "Plot number cannot be empty")
    .max(50)
    .trim(),
  label: z.string().max(100).trim().optional(),
  areaSqFt: z.number().min(1, "Area must be greater than 0"),
  dimensions: z
    .object({
      widthFt: z.number().min(0).optional(),
      lengthFt: z.number().min(0).optional(),
      widthYd: z.number().min(0).optional(),
      lengthYd: z.number().min(0).optional(),
    })
    .optional(),
  facing: z
    .enum(["NORTH", "SOUTH", "EAST", "WEST", "NORTH_EAST", "NORTH_WEST", "SOUTH_EAST", "SOUTH_WEST"])
    .default("EAST"),
  isCorner: z.boolean().default(false),
  basePricePaise: z.number().int().min(0).optional(),
  ratePerSqYdPaise: z.number().int().min(0).optional(),
  status: z
    .enum(["AVAILABLE", "RESERVED", "SOLD", "ON_REQUEST", "UNAVAILABLE"])
    .default("AVAILABLE"),
  publicVisibility: z.boolean().default(true),
  sortOrder: z.number().int().min(0).default(0),
});

export type CreatePlotOptionInput = z.infer<typeof createPlotOptionSchema>;

export const updatePlotOptionSchema = createPlotOptionSchema.extend({
  expectedVersion: z.number().int().min(0).optional(),
});

export type UpdatePlotOptionInput = z.infer<typeof updatePlotOptionSchema>;

export const changePlotStatusSchema = z.object({
  status: z.enum(["AVAILABLE", "RESERVED", "SOLD", "ON_REQUEST", "UNAVAILABLE"]),
  expectedVersion: z.number().int().min(0).optional(),
});

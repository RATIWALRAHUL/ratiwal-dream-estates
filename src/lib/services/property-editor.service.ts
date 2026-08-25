import "server-only";
import { Types } from "mongoose";
import { connectToDatabase } from "@/lib/db/mongoose";
import { Property } from "@/models/Property";
import { PlotOption } from "@/models/PlotOption";
import { NotFoundError } from "@/lib/api/errors";
import { escapeRegex } from "@/lib/services/dashboard.service";

export interface PublishingChecklistResult {
  canPublish: boolean;
  ready: string[];
  warnings: string[];
  blocking: string[];
}

/**
 * Loads a complete Property document for the editorial dashboard.
 */
export async function getPropertyForEditor(propertyId: string) {
  await connectToDatabase();

  if (!Types.ObjectId.isValid(propertyId)) {
    throw new NotFoundError("Invalid property ID format", "propertyId");
  }

  const property = await Property.findById(propertyId).populate("locationId", "name city state publicationStatus").lean();

  if (!property) {
    throw new NotFoundError(`Property with ID "${propertyId}" was not found`);
  }

  // Convert Mongo document to serializable view model
  return JSON.parse(JSON.stringify(property));
}

/**
 * Validates the 16-point publishing pre-flight checklist.
 */
export async function validatePublishingChecklist(propertyId: string): Promise<PublishingChecklistResult> {
  await connectToDatabase();

  if (!Types.ObjectId.isValid(propertyId)) {
    return {
      canPublish: false,
      ready: [],
      warnings: [],
      blocking: ["Invalid property ID format"],
    };
  }

  const [property, plotCount, location] = await Promise.all([
    Property.findById(propertyId).lean(),
    PlotOption.countDocuments({ propertyId: new Types.ObjectId(propertyId) }),
    Property.findById(propertyId)
      .populate("locationId")
      .then((p) => (p ? (p.locationId as unknown as { publicationStatus: string; name: string }) : null)),
  ]);

  if (!property) {
    return {
      canPublish: false,
      ready: [],
      warnings: [],
      blocking: ["Property record does not exist"],
    };
  }

  const ready: string[] = [];
  const warnings: string[] = [];
  const blocking: string[] = [];

  // 1. Title & Slug
  if (property.title && property.title.trim().length >= 3) {
    ready.push("Valid property title specified");
  } else {
    blocking.push("Property title must be at least 3 characters");
  }

  if (property.slug && property.slug.trim().length >= 3) {
    ready.push(`URL Slug configured: /${property.slug}`);
  } else {
    blocking.push("Property slug is missing or invalid");
  }

  // 2. Location Check
  if (location) {
    if (location.publicationStatus === "PUBLISHED") {
      ready.push(`Location corridor "${location.name}" is published and active`);
    } else {
      blocking.push(`Location corridor "${location.name}" is not published (Current: ${location.publicationStatus}). A property cannot be published in an unapproved location.`);
    }
  } else {
    blocking.push("Associated location hub is missing or was deleted");
  }

  // 3. Property Type & Short Description
  if (property.propertyType) {
    ready.push(`Property classification: ${property.propertyType}`);
  } else {
    blocking.push("Property type classification is required");
  }

  if (property.shortDescription && property.shortDescription.trim().length >= 10) {
    ready.push("Executive summary / short description provided");
  } else {
    blocking.push("Short description must be at least 10 characters");
  }

  if (!property.fullDescription || property.fullDescription.trim().length < 50) {
    warnings.push("Full editorial description is brief or empty (recommended for investor presentation)");
  } else {
    ready.push("Comprehensive property description provided");
  }

  // 4. Area Range
  const minArea = property.area?.minimumAreaSqFt || 0;
  const maxArea = property.area?.maximumAreaSqFt || 0;
  if (minArea > 0 && maxArea >= minArea) {
    ready.push(`Area range configured (${minArea.toLocaleString()} - ${maxArea.toLocaleString()} sq ft)`);
  } else {
    blocking.push("Valid minimum and maximum area range in sq ft is required");
  }

  // 5. Media & Primary Image
  const mediaList = property.media || [];
  const primaryImages = mediaList.filter((m) => m.isPrimary);

  if (primaryImages.length === 1) {
    const primary = primaryImages[0];
    if (primary.url) {
      ready.push("Approved primary hero image configured");
    } else {
      blocking.push("Primary image has no valid image URL");
    }
  } else if (primaryImages.length === 0) {
    blocking.push("At least one primary hero image must be designated");
  } else {
    blocking.push("Only one primary image may be designated");
  }

  if (mediaList.length < 3) {
    warnings.push(`Only ${mediaList.length} media asset(s) uploaded. Adding at least 3 high-res images or layout plans is recommended.`);
  } else {
    ready.push(`${mediaList.length} media assets attached`);
  }

  // 6. RERA & Verification
  const reraApplicable = property.rera?.applicable ?? false;
  const reraStatus = property.rera?.status;

  if (reraApplicable) {
    if (property.rera?.registrationNumber && property.rera.registrationNumber.trim().length > 0) {
      ready.push(`RERA Registration verified: ${property.rera.registrationNumber}`);
    } else {
      if (String(reraStatus) === "REGISTERED" || String(reraStatus) === "VERIFIED") {
        blocking.push("RERA registration number is required when RERA status is marked REGISTERED");
      } else {
        warnings.push(`RERA status is "${reraStatus || "APPLIED"}" without a formal registration number.`);
      }
    }
  } else {
    ready.push("RERA marked Not Applicable (Exempted Land Parcel)");
  }

  if (property.verificationStatus === "VERIFIED") {
    ready.push("Statutory title & legal due diligence is verified");
  } else {
    warnings.push(`Property due diligence is currently marked "${property.verificationStatus}".`);
  }

  // 7. Plot Inventory Check
  const requiresPlotInventory = ["RESIDENTIAL_PLOT", "COMMERCIAL_PLOT", "INDUSTRIAL_PLOT"].includes(property.propertyType);
  if (requiresPlotInventory) {
    if (plotCount > 0) {
      ready.push(`${plotCount} plot inventory unit(s) linked to property`);
    } else {
      warnings.push("No discrete plot inventory units have been added yet. Prospective buyers will only see aggregate pricing.");
    }
  }

  // 8. SEO Metadata
  if (!property.seo?.metaTitle || !property.seo?.metaDescription) {
    warnings.push("Custom SEO meta title or meta description is empty. System defaults will be used.");
  } else {
    ready.push("Search Engine Optimization (SEO) metadata configured");
  }

  const canPublish = blocking.length === 0;

  return {
    canPublish,
    ready,
    warnings,
    blocking,
  };
}

export interface InventoryQueryParams {
  propertyId: string;
  search?: string;
  status?: string;
  facing?: string;
  isCorner?: boolean;
  sortBy?: "plotNumber" | "area" | "price" | "sortOrder" | "updated";
  sortOrder?: "asc" | "desc";
  page?: number;
  pageSize?: number;
}

/**
 * Queries plot inventory for a property with filters and pagination.
 */
export async function getPropertyInventory(params: InventoryQueryParams) {
  await connectToDatabase();

  const {
    propertyId,
    search,
    status,
    facing,
    isCorner,
    sortBy = "plotNumber",
    sortOrder = "asc",
    page = 1,
    pageSize = 20,
  } = params;

  if (!Types.ObjectId.isValid(propertyId)) {
    throw new NotFoundError("Invalid property ID format", "propertyId");
  }

  const targetPropertyId = new Types.ObjectId(propertyId);
  const property = await Property.findById(targetPropertyId).select("title slug propertyType publicationStatus").lean();

  if (!property) {
    throw new NotFoundError(`Property with ID "${propertyId}" was not found`);
  }

  const filter: Record<string, unknown> = { propertyId: targetPropertyId };

  if (search && search.trim()) {
    const escaped = escapeRegex(search.trim().slice(0, 50));
    filter.$or = [
      { plotNumber: { $regex: escaped, $options: "i" } },
      { label: { $regex: escaped, $options: "i" } },
    ];
  }

  if (status && status !== "ALL") {
    filter.status = status;
  }

  if (facing && facing !== "ALL") {
    filter.facing = facing;
  }

  if (isCorner !== undefined) {
    filter.isCorner = isCorner;
  }

  const safePage = Math.max(1, page);
  const safePageSize = Math.min(100, Math.max(1, pageSize));
  const skip = (safePage - 1) * safePageSize;

  const sortDirection = sortOrder === "desc" ? -1 : 1;
  const sortObj: Record<string, 1 | -1> = {};

  if (sortBy === "area") {
    sortObj.areaSqFt = sortDirection;
  } else if (sortBy === "price") {
    sortObj.basePricePaise = sortDirection;
  } else if (sortBy === "sortOrder") {
    sortObj.sortOrder = sortDirection;
  } else if (sortBy === "updated") {
    sortObj.updatedAt = sortDirection;
  } else {
    sortObj.plotNumber = sortDirection;
  }

  const [totalItems, plots, statusCounts] = await Promise.all([
    PlotOption.countDocuments(filter),
    PlotOption.find(filter).sort(sortObj).skip(skip).limit(safePageSize).lean(),
    PlotOption.aggregate([
      { $match: { propertyId: targetPropertyId } },
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]),
  ]);

  const totalPages = Math.max(1, Math.ceil(totalItems / safePageSize));

  const countMap: Record<string, number> = {
    AVAILABLE: 0,
    RESERVED: 0,
    SOLD: 0,
    ON_REQUEST: 0,
    UNAVAILABLE: 0,
  };

  for (const item of statusCounts) {
    if (item._id && countMap[item._id] !== undefined) {
      countMap[item._id] = item.count;
    }
  }

  return {
    property: {
      id: property._id.toString(),
      title: property.title,
      slug: property.slug,
      propertyType: property.propertyType,
      publicationStatus: property.publicationStatus,
    },
    inventorySummary: countMap,
    totalPlots: Object.values(countMap).reduce((a, b) => a + b, 0),
    items: JSON.parse(JSON.stringify(plots)),
    pagination: {
      page: safePage,
      pageSize: safePageSize,
      totalItems,
      totalPages,
      hasNextPage: safePage < totalPages,
      hasPrevPage: safePage > 1,
    },
  };
}

/**
 * Loads a property for protected administrative preview.
 */
export async function getPropertyForPreview(propertyId: string) {
  await connectToDatabase();

  if (!Types.ObjectId.isValid(propertyId)) {
    throw new NotFoundError("Invalid property ID format", "propertyId");
  }

  const targetPropertyId = new Types.ObjectId(propertyId);
  const [property, plots, location] = await Promise.all([
    Property.findById(targetPropertyId).lean(),
    PlotOption.find({ propertyId: targetPropertyId, publicVisibility: true }).sort({ sortOrder: 1, plotNumber: 1 }).lean(),
    Property.findById(targetPropertyId)
      .populate("locationId")
      .then((p) => p?.locationId),
  ]);

  if (!property) {
    throw new NotFoundError(`Property with ID "${propertyId}" was not found`);
  }

  return {
    property: JSON.parse(JSON.stringify(property)),
    location: location ? JSON.parse(JSON.stringify(location)) : null,
    plotOptions: JSON.parse(JSON.stringify(plots)),
  };
}

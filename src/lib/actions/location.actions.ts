/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { Types } from "mongoose";
import { revalidatePath } from "next/cache";

function safeRevalidatePath(path: string) {
  try {
    revalidatePath(path);
  } catch {
    // Ignore static generation store missing in CLI test execution
  }
}

import { connectToDatabase } from "@/lib/db/mongoose";
import { Location } from "@/models/Location";
import { requireAdminSession } from "@/lib/auth/guard";
import { logAuditEvent } from "@/lib/services/audit.service";
import {
  validateLocationPublishingChecklist,
  checkLocationDependencies,
} from "@/lib/services/location-editor.service";
import { normalizeSlug } from "@/lib/utils/slug";
import {
  createLocationDraftSchema,
  updateLocationSchema,
  returnLocationToDraftSchema,
  archiveLocationSchema,
  changePublishedLocationSlugSchema,
  microMarketSchema,
  infrastructureMilestoneSchema,
  connectivityMilestoneSchema,
  marketObservationSchema,
  type CreateLocationDraftInput,
  type UpdateLocationInput,
  type MicroMarketInput,
  type InfrastructureMilestoneInput,
  type ConnectivityMilestoneInput,
  type MarketObservationInput,
} from "@/lib/validations/location.schema";
import type { ActionResult } from "./types";

/**
 * 1. Create a new Location Draft
 */
export async function createLocationDraftAction(
  input: CreateLocationDraftInput
): Promise<ActionResult<{ locationId: string; slug: string }>> {
  try {
    const session = await requireAdminSession(["EDITOR", "ADMIN", "SUPER_ADMIN"]);
    await connectToDatabase();

    const parsed = createLocationDraftSchema.safeParse(input);
    if (!parsed.success) {
      const fieldErrors: Record<string, string[]> = {};
      for (const err of parsed.error.issues) {
        const field = err.path.join(".");
        if (!fieldErrors[field]) fieldErrors[field] = [];
        fieldErrors[field].push(err.message);
      }
      return {
        success: false,
        code: "VALIDATION_ERROR",
        message: "Invalid location draft submission.",
        fieldErrors,
      };
    }

    const { name, city, state, country, region, shortDescription } = parsed.data;

    // Generate slug candidate
    const rawSlug = parsed.data.slug?.trim() || normalizeSlug(name);
    let targetSlug = rawSlug;

    // Check slug uniqueness
    const existing = await Location.findOne({ slug: targetSlug });
    if (existing) {
      targetSlug = `${rawSlug}-${Date.now().toString().slice(-4)}`;
    }

    const location = await Location.create({
      name,
      slug: targetSlug,
      city,
      state,
      country,
      region,
      shortDescription,
      longDescription: shortDescription,
      publicationStatus: "DRAFT",
      verificationStatus: "UNVERIFIED",
      version: 0,
      seo: {
        metaTitle: `${name} Land & Plots | Ratiwal Dream Estates`,
        metaDescription: shortDescription.slice(0, 155),
      },
    });

    await logAuditEvent({
      action: "LOCATION_CREATED",
      actor: session.user,
      targetLocationId: location._id.toString(),
    });

    safeRevalidatePath("/dashboard/locations");
    safeRevalidatePath("/dashboard");

    return {
      success: true,
      message: "Location corridor draft created successfully.",
      data: {
        locationId: location._id.toString(),
        slug: targetSlug,
      },
    };
  } catch (err: any) {
    if (err.name === "AuthenticationError") {
      return { success: false, code: "UNAUTHORIZED", message: err.message };
    }
    if (err.name === "AuthorizationError") {
      return { success: false, code: "FORBIDDEN", message: err.message };
    }
    return {
      success: false,
      code: "DATABASE_ERROR",
      message: err.message || "Failed to create location draft.",
    };
  }
}

/**
 * 2. Update Location (with Optimistic Concurrency check)
 */
export async function updateLocationAction(
  locationId: string,
  input: UpdateLocationInput
): Promise<ActionResult<{ locationId: string; version: number }>> {
  try {
    const session = await requireAdminSession(["EDITOR", "ADMIN", "SUPER_ADMIN"]);
    await connectToDatabase();

    const parsed = updateLocationSchema.safeParse(input);
    if (!parsed.success) {
      const fieldErrors: Record<string, string[]> = {};
      for (const err of parsed.error.issues) {
        const field = err.path.join(".");
        if (!fieldErrors[field]) fieldErrors[field] = [];
        fieldErrors[field].push(err.message);
      }
      return {
        success: false,
        code: "VALIDATION_ERROR",
        message: "Invalid location update payload.",
        fieldErrors,
      };
    }

    const location = await Location.findById(locationId);
    if (!location) {
      return { success: false, code: "NOT_FOUND", message: "Location not found." };
    }

    if (location.publicationStatus === "ARCHIVED") {
      return {
        success: false,
        code: "INVALID_STATUS_TRANSITION",
        message: "Cannot edit an archived location. Restore it to draft first.",
      };
    }

    // Optimistic concurrency check
    if (location.version !== parsed.data.expectedVersion) {
      return {
        success: false,
        code: "CONFLICT",
        message: `Stale update detected. Record has been updated by another user (current version ${location.version}, expected ${parsed.data.expectedVersion}). Please refresh.`,
      };
    }

    const data = parsed.data;
    if (data.name !== undefined) location.name = data.name;
    if (data.city !== undefined) location.city = data.city;
    if (data.state !== undefined) location.state = data.state;
    if (data.country !== undefined) location.country = data.country;
    if (data.region !== undefined) location.region = data.region;
    if (data.tagline !== undefined) location.tagline = data.tagline;
    if (data.shortDescription !== undefined) location.shortDescription = data.shortDescription;
    if (data.longDescription !== undefined) location.longDescription = data.longDescription;
    if (data.heroImage !== undefined) location.heroImage = data.heroImage as any;
    if (data.supportedPropertyTypes !== undefined) location.supportedPropertyTypes = data.supportedPropertyTypes;
    if (data.featured !== undefined) location.featured = data.featured;
    if (data.sortOrder !== undefined) location.sortOrder = data.sortOrder;
    if (data.verificationStatus !== undefined) location.verificationStatus = data.verificationStatus;
    if (data.verifiedBy !== undefined) location.verifiedBy = data.verifiedBy;
    if (data.verificationNotes !== undefined) location.verificationNotes = data.verificationNotes;
    if (data.nextReviewDate !== undefined) location.nextReviewDate = new Date(data.nextReviewDate);
    if (data.seo !== undefined) location.seo = data.seo as any;

    // Handle coordinates & GeoJSON order [longitude, latitude]
    if (data.coordinates) {
      if (typeof data.coordinates.latitude === "number" && typeof data.coordinates.longitude === "number") {
        location.coordinates = {
          latitude: data.coordinates.latitude,
          longitude: data.coordinates.longitude,
          geoJson: {
            type: "Point",
            coordinates: [data.coordinates.longitude, data.coordinates.latitude],
          },
          isVerified: data.coordinates.isVerified ?? false,
          source: data.coordinates.source,
          verifiedAt: data.coordinates.isVerified ? new Date() : undefined,
        };
      }
    }

    // Increment document version
    location.version += 1;
    await location.save();

    await logAuditEvent({
      action: "LOCATION_UPDATED",
      actor: session.user,
      targetLocationId: location._id.toString(),
    });

    safeRevalidatePath("/dashboard/locations");
    safeRevalidatePath(`/dashboard/locations/${locationId}/edit`);
    safeRevalidatePath(`/dashboard/locations/${locationId}/preview`);
    safeRevalidatePath(`/locations/${location.slug}`);

    return {
      success: true,
      message: "Location updated successfully.",
      data: {
        locationId: location._id.toString(),
        version: location.version,
      },
    };
  } catch (err: any) {
    if (err.name === "AuthenticationError") {
      return { success: false, code: "UNAUTHORIZED", message: err.message };
    }
    if (err.name === "AuthorizationError") {
      return { success: false, code: "FORBIDDEN", message: err.message };
    }
    return {
      success: false,
      code: "DATABASE_ERROR",
      message: err.message || "Failed to update location.",
    };
  }
}

/**
 * 3. Submit Location for Review (DRAFT -> REVIEW)
 */
export async function submitLocationForReviewAction(
  locationId: string
): Promise<ActionResult<{ locationId: string; status: string }>> {
  try {
    const session = await requireAdminSession(["EDITOR", "ADMIN", "SUPER_ADMIN"]);
    await connectToDatabase();

    const location = await Location.findById(locationId);
    if (!location) {
      return { success: false, code: "NOT_FOUND", message: "Location not found." };
    }

    if (location.publicationStatus !== "DRAFT") {
      return {
        success: false,
        code: "INVALID_STATUS_TRANSITION",
        message: `Only DRAFT locations can be submitted for review. Current status: ${location.publicationStatus}.`,
      };
    }

    location.publicationStatus = "REVIEW";
    location.submittedForReviewAt = new Date();
    location.version += 1;
    await location.save();

    await logAuditEvent({
      action: "LOCATION_SUBMITTED_FOR_REVIEW",
      actor: session.user,
      targetLocationId: location._id.toString(),
    });

    safeRevalidatePath("/dashboard/locations");
    safeRevalidatePath(`/dashboard/locations/${locationId}/edit`);

    return {
      success: true,
      message: "Location submitted for review successfully.",
      data: { locationId: location._id.toString(), status: "REVIEW" },
    };
  } catch (err: any) {
    if (err.name === "AuthenticationError") {
      return { success: false, code: "UNAUTHORIZED", message: err.message };
    }
    if (err.name === "AuthorizationError") {
      return { success: false, code: "FORBIDDEN", message: err.message };
    }
    return {
      success: false,
      code: "DATABASE_ERROR",
      message: err.message || "Failed to submit location for review.",
    };
  }
}

/**
 * 4. Return Location to Draft (REVIEW -> DRAFT)
 */
export async function returnLocationToDraftAction(
  locationId: string,
  input: { reason: string }
): Promise<ActionResult<{ locationId: string; status: string }>> {
  try {
    const session = await requireAdminSession(["ADMIN", "SUPER_ADMIN"]);
    await connectToDatabase();

    const parsed = returnLocationToDraftSchema.safeParse(input);
    if (!parsed.success) {
      return {
        success: false,
        code: "VALIDATION_ERROR",
        message: parsed.error.issues[0]?.message || "Invalid reason.",
      };
    }

    const location = await Location.findById(locationId);
    if (!location) {
      return { success: false, code: "NOT_FOUND", message: "Location not found." };
    }

    if (location.publicationStatus !== "REVIEW") {
      return {
        success: false,
        code: "INVALID_STATUS_TRANSITION",
        message: `Only locations under REVIEW can be returned to draft. Current status: ${location.publicationStatus}.`,
      };
    }

    location.publicationStatus = "DRAFT";
    location.reviewReason = parsed.data.reason;
    location.reviewedAt = new Date();
    location.version += 1;
    await location.save();

    await logAuditEvent({
      action: "LOCATION_RETURNED_TO_DRAFT",
      actor: session.user,
      targetLocationId: location._id.toString(),
      reason: parsed.data.reason,
    });

    safeRevalidatePath("/dashboard/locations");
    safeRevalidatePath(`/dashboard/locations/${locationId}/edit`);

    return {
      success: true,
      message: "Location returned to draft with feedback.",
      data: { locationId: location._id.toString(), status: "DRAFT" },
    };
  } catch (err: any) {
    if (err.name === "AuthenticationError") {
      return { success: false, code: "UNAUTHORIZED", message: err.message };
    }
    if (err.name === "AuthorizationError") {
      return { success: false, code: "FORBIDDEN", message: err.message };
    }
    return {
      success: false,
      code: "DATABASE_ERROR",
      message: err.message || "Failed to return location to draft.",
    };
  }
}

/**
 * 5. Publish Location (REVIEW -> PUBLISHED)
 */
export async function publishLocationAction(
  locationId: string
): Promise<ActionResult<{ locationId: string; status: string; slug: string }>> {
  try {
    const session = await requireAdminSession(["ADMIN", "SUPER_ADMIN"]);
    await connectToDatabase();

    const location = await Location.findById(locationId);
    if (!location) {
      return { success: false, code: "NOT_FOUND", message: "Location not found." };
    }

    if (location.publicationStatus !== "REVIEW" && location.publicationStatus !== "DRAFT") {
      return {
        success: false,
        code: "INVALID_STATUS_TRANSITION",
        message: `Only DRAFT or REVIEW locations can be published. Current status: ${location.publicationStatus}.`,
      };
    }

    // 16-point checklist validation
    const checklist = validateLocationPublishingChecklist(location.toObject());
    if (!checklist.canPublish) {
      const blockingIssues = checklist.items
        .filter((i) => i.status === "BLOCKING")
        .map((i) => i.message)
        .join("; ");
      return {
        success: false,
        code: "VALIDATION_ERROR",
        message: `Cannot publish location. Blocking compliance issues: ${blockingIssues}`,
      };
    }

    location.publicationStatus = "PUBLISHED";
    location.publishedAt = new Date();
    location.lastVerifiedAt = new Date();
    location.version += 1;
    await location.save();

    await logAuditEvent({
      action: "LOCATION_PUBLISHED",
      actor: session.user,
      targetLocationId: location._id.toString(),
    });

    safeRevalidatePath("/dashboard/locations");
    safeRevalidatePath(`/dashboard/locations/${locationId}/edit`);
    safeRevalidatePath(`/locations/${location.slug}`);

    return {
      success: true,
      message: "Location published live to public directory.",
      data: {
        locationId: location._id.toString(),
        status: "PUBLISHED",
        slug: location.slug,
      },
    };
  } catch (err: any) {
    if (err.name === "AuthenticationError") {
      return { success: false, code: "UNAUTHORIZED", message: err.message };
    }
    if (err.name === "AuthorizationError") {
      return { success: false, code: "FORBIDDEN", message: err.message };
    }
    return {
      success: false,
      code: "DATABASE_ERROR",
      message: err.message || "Failed to publish location.",
    };
  }
}

/**
 * 6. Archive Location (PUBLISHED/REVIEW -> ARCHIVED)
 * Guard: Blocks archival if published properties depend on this location.
 */
export async function archiveLocationAction(
  locationId: string,
  input: { reason: string }
): Promise<ActionResult<{ locationId: string; status: string }>> {
  try {
    const session = await requireAdminSession(["ADMIN", "SUPER_ADMIN"]);
    await connectToDatabase();

    const parsed = archiveLocationSchema.safeParse(input);
    if (!parsed.success) {
      return {
        success: false,
        code: "VALIDATION_ERROR",
        message: parsed.error.issues[0]?.message || "Invalid archive reason.",
      };
    }

    const location = await Location.findById(locationId);
    if (!location) {
      return { success: false, code: "NOT_FOUND", message: "Location not found." };
    }

    if (location.publicationStatus === "ARCHIVED") {
      return {
        success: false,
        code: "INVALID_STATUS_TRANSITION",
        message: "Location is already archived.",
      };
    }

    // Check published property dependencies
    const dependencyCheck = await checkLocationDependencies(locationId);
    if (!dependencyCheck.canArchive) {
      const titles = dependencyCheck.publishedPropertyTitles.slice(0, 3).join(", ");
      return {
        success: false,
        code: "PUBLISHED_PROPERTIES_EXIST",
        message: `Cannot archive location. ${dependencyCheck.publishedProperties} published property parcel(s) still reference this location: ${titles}${
          dependencyCheck.publishedProperties > 3 ? "..." : ""
        }. Please unpublish or reassign them first.`,
      };
    }

    location.publicationStatus = "ARCHIVED";
    location.archivedAt = new Date();
    location.archiveReason = parsed.data.reason;
    location.version += 1;
    await location.save();

    await logAuditEvent({
      action: "LOCATION_ARCHIVED",
      actor: session.user,
      targetLocationId: location._id.toString(),
      reason: parsed.data.reason,
    });

    safeRevalidatePath("/dashboard/locations");
    safeRevalidatePath(`/dashboard/locations/${locationId}/edit`);
    safeRevalidatePath(`/locations/${location.slug}`);

    return {
      success: true,
      message: "Location archived successfully.",
      data: { locationId: location._id.toString(), status: "ARCHIVED" },
    };
  } catch (err: any) {
    if (err.name === "AuthenticationError") {
      return { success: false, code: "UNAUTHORIZED", message: err.message };
    }
    if (err.name === "AuthorizationError") {
      return { success: false, code: "FORBIDDEN", message: err.message };
    }
    return {
      success: false,
      code: "DATABASE_ERROR",
      message: err.message || "Failed to archive location.",
    };
  }
}

/**
 * 7. Restore Location to Draft (ARCHIVED -> DRAFT)
 */
export async function restoreLocationToDraftAction(
  locationId: string
): Promise<ActionResult<{ locationId: string; status: string }>> {
  try {
    const session = await requireAdminSession(["ADMIN", "SUPER_ADMIN"]);
    await connectToDatabase();

    const location = await Location.findById(locationId);
    if (!location) {
      return { success: false, code: "NOT_FOUND", message: "Location not found." };
    }

    if (location.publicationStatus !== "ARCHIVED") {
      return {
        success: false,
        code: "INVALID_STATUS_TRANSITION",
        message: `Only ARCHIVED locations can be restored. Current status: ${location.publicationStatus}.`,
      };
    }

    location.publicationStatus = "DRAFT";
    location.version += 1;
    await location.save();

    await logAuditEvent({
      action: "LOCATION_RESTORED",
      actor: session.user,
      targetLocationId: location._id.toString(),
    });

    safeRevalidatePath("/dashboard/locations");
    safeRevalidatePath(`/dashboard/locations/${locationId}/edit`);

    return {
      success: true,
      message: "Location restored to DRAFT status.",
      data: { locationId: location._id.toString(), status: "DRAFT" },
    };
  } catch (err: any) {
    if (err.name === "AuthenticationError") {
      return { success: false, code: "UNAUTHORIZED", message: err.message };
    }
    if (err.name === "AuthorizationError") {
      return { success: false, code: "FORBIDDEN", message: err.message };
    }
    return {
      success: false,
      code: "DATABASE_ERROR",
      message: err.message || "Failed to restore location.",
    };
  }
}

/**
 * 8. Change Published Location Slug (SUPER_ADMIN ONLY)
 */
export async function changePublishedLocationSlugAction(
  locationId: string,
  input: { newSlug: string; reason: string; confirmed: boolean }
): Promise<ActionResult<{ locationId: string; oldSlug: string; newSlug: string }>> {
  try {
    const session = await requireAdminSession(["SUPER_ADMIN"]);
    await connectToDatabase();

    const parsed = changePublishedLocationSlugSchema.safeParse(input);
    if (!parsed.success) {
      return {
        success: false,
        code: "VALIDATION_ERROR",
        message: parsed.error.issues[0]?.message || "Invalid slug payload.",
      };
    }

    const location = await Location.findById(locationId);
    if (!location) {
      return { success: false, code: "NOT_FOUND", message: "Location not found." };
    }

    const oldSlug = location.slug;
    const targetSlug = normalizeSlug(parsed.data.newSlug);

    if (oldSlug === targetSlug) {
      return {
        success: false,
        code: "VALIDATION_ERROR",
        message: "New slug must differ from current slug.",
      };
    }

    // Check slug collision
    const existing = await Location.findOne({ slug: targetSlug, _id: { $ne: locationId } });
    if (existing) {
      return {
        success: false,
        code: "DUPLICATE_SLUG",
        message: `Slug "/locations/${targetSlug}" is already in use by another corridor.`,
      };
    }

    location.slug = targetSlug;
    location.version += 1;
    await location.save();

    await logAuditEvent({
      action: "LOCATION_SLUG_CHANGED",
      actor: session.user,
      targetLocationId: location._id.toString(),
      reason: `Slug changed from "${oldSlug}" to "${targetSlug}". Reason: ${parsed.data.reason}`,
    });

    safeRevalidatePath("/dashboard/locations");
    safeRevalidatePath(`/dashboard/locations/${locationId}/edit`);
    safeRevalidatePath(`/locations/${oldSlug}`);
    safeRevalidatePath(`/locations/${targetSlug}`);

    return {
      success: true,
      message: `Location slug successfully updated to "${targetSlug}".`,
      data: {
        locationId: location._id.toString(),
        oldSlug,
        newSlug: targetSlug,
      },
    };
  } catch (err: any) {
    if (err.name === "AuthenticationError") {
      return { success: false, code: "UNAUTHORIZED", message: err.message };
    }
    if (err.name === "AuthorizationError") {
      return { success: false, code: "FORBIDDEN", message: err.message };
    }
    return {
      success: false,
      code: "DATABASE_ERROR",
      message: err.message || "Failed to update location slug.",
    };
  }
}

/**
 * 9. Subdocument Operations: Micro-Markets
 */
export async function addMicroMarketAction(
  locationId: string,
  input: MicroMarketInput
): Promise<ActionResult<{ microMarketId: string }>> {
  try {
    const session = await requireAdminSession(["EDITOR", "ADMIN", "SUPER_ADMIN"]);
    await connectToDatabase();

    const parsed = microMarketSchema.safeParse(input);
    if (!parsed.success) {
      return {
        success: false,
        code: "VALIDATION_ERROR",
        message: parsed.error.issues[0]?.message || "Invalid micro-market data.",
      };
    }

    const location = await Location.findById(locationId);
    if (!location) {
      return { success: false, code: "NOT_FOUND", message: "Location not found." };
    }

    const slug = parsed.data.slug || normalizeSlug(parsed.data.name);
    const isDuplicate = location.microMarkets?.some((m) => m.slug === slug);
    if (isDuplicate) {
      return {
        success: false,
        code: "DUPLICATE_MICRO_MARKET",
        message: `Micro-market node with slug "${slug}" already exists in this location.`,
      };
    }

    const newId = new Types.ObjectId();
    const newMarket = {
      _id: newId,
      name: parsed.data.name,
      slug,
      tagline: parsed.data.tagline,
      description: parsed.data.description,
      propertyTypes: parsed.data.propertyTypes,
      highlights: parsed.data.highlights || [],
      marketType: parsed.data.marketType || "RESIDENTIAL_CORRIDOR",
      featured: parsed.data.featured ?? false,
      sortOrder: parsed.data.sortOrder ?? (location.microMarkets?.length || 0),
      isPublic: parsed.data.isPublic ?? true,
      sourceReferences: parsed.data.sourceReferences || [],
    };

    location.microMarkets.push(newMarket as any);
    location.version += 1;
    await location.save();

    await logAuditEvent({
      action: "MICRO_MARKET_ADDED",
      actor: session.user,
      targetLocationId: location._id.toString(),
      reason: `Added micro-market node: ${newMarket.name}`,
    });

    safeRevalidatePath(`/dashboard/locations/${locationId}/edit`);
    safeRevalidatePath(`/dashboard/locations/${locationId}/intelligence`);

    return {
      success: true,
      message: "Micro-market added successfully.",
      data: { microMarketId: newId.toString() },
    };
  } catch (err: any) {
    return {
      success: false,
      code: "DATABASE_ERROR",
      message: err.message || "Failed to add micro-market.",
    };
  }
}

export async function removeMicroMarketAction(
  locationId: string,
  microMarketId: string
): Promise<ActionResult<{ success: boolean }>> {
  try {
    const session = await requireAdminSession(["EDITOR", "ADMIN", "SUPER_ADMIN"]);
    await connectToDatabase();

    const location = await Location.findById(locationId);
    if (!location) {
      return { success: false, code: "NOT_FOUND", message: "Location not found." };
    }

    location.microMarkets = location.microMarkets.filter(
      (m) => m._id?.toString() !== microMarketId
    ) as any;
    location.version += 1;
    await location.save();

    await logAuditEvent({
      action: "MICRO_MARKET_REMOVED",
      actor: session.user,
      targetLocationId: location._id.toString(),
    });

    safeRevalidatePath(`/dashboard/locations/${locationId}/edit`);

    return {
      success: true,
      message: "Micro-market removed successfully.",
      data: { success: true },
    };
  } catch (err: any) {
    return {
      success: false,
      code: "DATABASE_ERROR",
      message: err.message || "Failed to remove micro-market.",
    };
  }
}

/**
 * 10. Subdocument Operations: Infrastructure Milestones
 */
export async function addInfrastructureMilestoneAction(
  locationId: string,
  input: InfrastructureMilestoneInput
): Promise<ActionResult<{ milestoneId: string }>> {
  try {
    const session = await requireAdminSession(["EDITOR", "ADMIN", "SUPER_ADMIN"]);
    await connectToDatabase();

    const parsed = infrastructureMilestoneSchema.safeParse(input);
    if (!parsed.success) {
      return {
        success: false,
        code: "VALIDATION_ERROR",
        message: parsed.error.issues[0]?.message || "Invalid infrastructure data.",
      };
    }

    const location = await Location.findById(locationId);
    if (!location) {
      return { success: false, code: "NOT_FOUND", message: "Location not found." };
    }

    const newId = new Types.ObjectId();
    const newMilestone = {
      _id: newId,
      ...parsed.data,
      sortOrder: parsed.data.sortOrder ?? (location.infrastructureHighlights?.length || 0),
      isPublic: parsed.data.isPublic ?? true,
      lastVerifiedAt: new Date(),
    };

    location.infrastructureHighlights.push(newMilestone as any);
    location.version += 1;
    await location.save();

    await logAuditEvent({
      action: "INFRASTRUCTURE_ADDED",
      actor: session.user,
      targetLocationId: location._id.toString(),
      reason: `Added infrastructure milestone: ${newMilestone.name}`,
    });

    safeRevalidatePath(`/dashboard/locations/${locationId}/edit`);

    return {
      success: true,
      message: "Infrastructure milestone added successfully.",
      data: { milestoneId: newId.toString() },
    };
  } catch (err: any) {
    return {
      success: false,
      code: "DATABASE_ERROR",
      message: err.message || "Failed to add infrastructure milestone.",
    };
  }
}

export async function removeInfrastructureMilestoneAction(
  locationId: string,
  milestoneId: string
): Promise<ActionResult<{ success: boolean }>> {
  try {
    const session = await requireAdminSession(["EDITOR", "ADMIN", "SUPER_ADMIN"]);
    await connectToDatabase();

    const location = await Location.findById(locationId);
    if (!location) {
      return { success: false, code: "NOT_FOUND", message: "Location not found." };
    }

    location.infrastructureHighlights = location.infrastructureHighlights.filter(
      (i) => i._id?.toString() !== milestoneId
    ) as any;
    location.version += 1;
    await location.save();

    await logAuditEvent({
      action: "INFRASTRUCTURE_REMOVED",
      actor: session.user,
      targetLocationId: location._id.toString(),
    });

    safeRevalidatePath(`/dashboard/locations/${locationId}/edit`);

    return {
      success: true,
      message: "Infrastructure milestone removed successfully.",
      data: { success: true },
    };
  } catch (err: any) {
    return {
      success: false,
      code: "DATABASE_ERROR",
      message: err.message || "Failed to remove infrastructure milestone.",
    };
  }
}

/**
 * 11. Subdocument Operations: Connectivity Milestones
 */
export async function addConnectivityMilestoneAction(
  locationId: string,
  input: ConnectivityMilestoneInput
): Promise<ActionResult<{ milestoneId: string }>> {
  try {
    const session = await requireAdminSession(["EDITOR", "ADMIN", "SUPER_ADMIN"]);
    await connectToDatabase();

    const parsed = connectivityMilestoneSchema.safeParse(input);
    if (!parsed.success) {
      return {
        success: false,
        code: "VALIDATION_ERROR",
        message: parsed.error.issues[0]?.message || "Invalid connectivity data.",
      };
    }

    const location = await Location.findById(locationId);
    if (!location) {
      return { success: false, code: "NOT_FOUND", message: "Location not found." };
    }

    const newId = new Types.ObjectId();
    const newMilestone = {
      _id: newId,
      ...parsed.data,
      sortOrder: parsed.data.sortOrder ?? (location.connectivityHighlights?.length || 0),
      isPublic: parsed.data.isPublic ?? true,
      lastVerifiedAt: new Date(),
    };

    location.connectivityHighlights.push(newMilestone as any);
    location.version += 1;
    await location.save();

    await logAuditEvent({
      action: "CONNECTIVITY_ADDED",
      actor: session.user,
      targetLocationId: location._id.toString(),
      reason: `Added connectivity destination: ${newMilestone.destination}`,
    });

    safeRevalidatePath(`/dashboard/locations/${locationId}/edit`);

    return {
      success: true,
      message: "Connectivity milestone added successfully.",
      data: { milestoneId: newId.toString() },
    };
  } catch (err: any) {
    return {
      success: false,
      code: "DATABASE_ERROR",
      message: err.message || "Failed to add connectivity milestone.",
    };
  }
}

export async function removeConnectivityMilestoneAction(
  locationId: string,
  milestoneId: string
): Promise<ActionResult<{ success: boolean }>> {
  try {
    const session = await requireAdminSession(["EDITOR", "ADMIN", "SUPER_ADMIN"]);
    await connectToDatabase();

    const location = await Location.findById(locationId);
    if (!location) {
      return { success: false, code: "NOT_FOUND", message: "Location not found." };
    }

    location.connectivityHighlights = location.connectivityHighlights.filter(
      (c) => c._id?.toString() !== milestoneId
    ) as any;
    location.version += 1;
    await location.save();

    await logAuditEvent({
      action: "CONNECTIVITY_REMOVED",
      actor: session.user,
      targetLocationId: location._id.toString(),
    });

    safeRevalidatePath(`/dashboard/locations/${locationId}/edit`);

    return {
      success: true,
      message: "Connectivity milestone removed successfully.",
      data: { success: true },
    };
  } catch (err: any) {
    return {
      success: false,
      code: "DATABASE_ERROR",
      message: err.message || "Failed to remove connectivity milestone.",
    };
  }
}

/**
 * 12. Subdocument Operations: Market Observations
 */
export async function addMarketObservationAction(
  locationId: string,
  input: MarketObservationInput
): Promise<ActionResult<{ observationId: string }>> {
  try {
    const session = await requireAdminSession(["EDITOR", "ADMIN", "SUPER_ADMIN"]);
    await connectToDatabase();

    const parsed = marketObservationSchema.safeParse(input);
    if (!parsed.success) {
      return {
        success: false,
        code: "VALIDATION_ERROR",
        message: parsed.error.issues[0]?.message || "Invalid market observation.",
      };
    }

    const location = await Location.findById(locationId);
    if (!location) {
      return { success: false, code: "NOT_FOUND", message: "Location not found." };
    }

    const newId = new Types.ObjectId();
    const isInternal = parsed.data.sourceType === "INTERNAL_RESEARCH";
    const isPublic = isInternal ? false : (parsed.data.isPublic ?? true);

    const newObs = {
      _id: newId,
      ...parsed.data,
      isPublic,
      verifiedBy: session.user.email,
      createdAt: new Date(),
    };

    location.marketObservations.push(newObs as any);
    location.version += 1;
    await location.save();

    await logAuditEvent({
      action: "MARKET_OBSERVATION_ADDED",
      actor: session.user,
      targetLocationId: location._id.toString(),
      reason: `Logged market observation: ${newObs.metricType} (${newObs.observationPeriod})`,
    });

    safeRevalidatePath(`/dashboard/locations/${locationId}/edit`);
    safeRevalidatePath(`/dashboard/locations/${locationId}/intelligence`);

    return {
      success: true,
      message: "Market observation logged successfully.",
      data: { observationId: newId.toString() },
    };
  } catch (err: any) {
    return {
      success: false,
      code: "DATABASE_ERROR",
      message: err.message || "Failed to log market observation.",
    };
  }
}

export async function removeMarketObservationAction(
  locationId: string,
  observationId: string
): Promise<ActionResult<{ success: boolean }>> {
  try {
    const session = await requireAdminSession(["EDITOR", "ADMIN", "SUPER_ADMIN"]);
    await connectToDatabase();

    const location = await Location.findById(locationId);
    if (!location) {
      return { success: false, code: "NOT_FOUND", message: "Location not found." };
    }

    location.marketObservations = location.marketObservations.filter(
      (o) => o._id?.toString() !== observationId
    ) as any;
    location.version += 1;
    await location.save();

    await logAuditEvent({
      action: "MARKET_OBSERVATION_REMOVED",
      actor: session.user,
      targetLocationId: location._id.toString(),
    });

    safeRevalidatePath(`/dashboard/locations/${locationId}/edit`);
    safeRevalidatePath(`/dashboard/locations/${locationId}/intelligence`);

    return {
      success: true,
      message: "Market observation removed successfully.",
      data: { success: true },
    };
  } catch (err: any) {
    return {
      success: false,
      code: "DATABASE_ERROR",
      message: err.message || "Failed to remove market observation.",
    };
  }
}

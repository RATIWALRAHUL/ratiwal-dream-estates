/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { Types } from "mongoose";
import { revalidatePath } from "next/cache";
import { connectToDatabase } from "@/lib/db/mongoose";
import { MediaAsset } from "@/models/MediaAsset";
import { requireAdminSession } from "@/lib/auth/guard";
import { logAuditEvent } from "@/lib/services/audit.service";
import { getStorageProvider } from "@/lib/storage";
import { ALWAYS_PRIVATE_PURPOSES } from "@/lib/storage/types";
import type { ActionResult } from "./types";

function safeRevalidate(path: string) {
  try { revalidatePath(path); } catch { /* CLI test env */ }
}

// ─── Query: List assets for an owner ─────────────────────────────────────────

export async function getOwnerAssetsAction(
  ownerType: "PROPERTY" | "LOCATION",
  ownerId: string
): Promise<ActionResult<{ assets: any[] }>> {
  try {
    await requireAdminSession(["EDITOR", "ADMIN", "SUPER_ADMIN"]);
    await connectToDatabase();

    if (!Types.ObjectId.isValid(ownerId)) {
      return { success: false, code: "VALIDATION_ERROR", message: "Invalid ownerId." };
    }

    const assets = await MediaAsset.find({
      ownerType,
      ownerId: new Types.ObjectId(ownerId),
      status: { $nin: ["DELETED"] },
    })
      .sort({ sortOrder: 1, createdAt: -1 })
      .lean();

    return {
      success: true,
      message: "Assets loaded.",
      data: {
        assets: assets.map((a) => ({
          id: a._id.toString(),
          assetCategory: a.assetCategory,
          purpose: a.purpose,
          access: a.access,
          status: a.status,
          safeDisplayName: a.safeDisplayName,
          originalFilename: a.originalFilename,
          mimeType: a.mimeType,
          sizeBytes: a.sizeBytes,
          width: a.width,
          height: a.height,
          publicUrl: a.publicUrl,
          altText: a.altText,
          caption: a.caption,
          sortOrder: a.sortOrder,
          isPrimary: a.isPrimary,
          documentTitle: a.documentTitle,
          documentVersion: a.documentVersion,
          uploadedByEmail: a.uploadedByEmail,
          uploadedAt: a.uploadedAt?.toISOString(),
          createdAt: (a as any).createdAt?.toISOString(),
          rejectionReason: a.rejectionReason,
        })),
      },
    };
  } catch (e: any) {
    return { success: false, code: "DATABASE_ERROR", message: e.message || "Failed to load assets." };
  }
}

// ─── Update Alt Text ──────────────────────────────────────────────────────────

export async function updateAltTextAction(
  assetId: string,
  altText: string
): Promise<ActionResult<{ assetId: string }>> {
  try {
    const session = await requireAdminSession(["EDITOR", "ADMIN", "SUPER_ADMIN"]);
    await connectToDatabase();

    if (!Types.ObjectId.isValid(assetId)) {
      return { success: false, code: "VALIDATION_ERROR", message: "Invalid assetId." };
    }
    const trimmed = altText?.trim() ?? "";
    if (trimmed.length < 3) {
      return { success: false, code: "VALIDATION_ERROR", message: "Alt text must be at least 3 characters." };
    }
    if (trimmed.length > 300) {
      return { success: false, code: "VALIDATION_ERROR", message: "Alt text cannot exceed 300 characters." };
    }

    const asset = await MediaAsset.findByIdAndUpdate(assetId, { altText: trimmed }, { new: true });
    if (!asset) return { success: false, code: "NOT_FOUND", message: "Asset not found." };

    await logAuditEvent({
      actor: session.user,
      action: "ALT_TEXT_CHANGED",
      targetAssetId: assetId,
      ...(asset.ownerType === "PROPERTY"
        ? { targetPropertyId: asset.ownerId.toString() }
        : { targetLocationId: asset.ownerId.toString() }),
    });

    safeRevalidate(`/dashboard/${asset.ownerType === "PROPERTY" ? "properties" : "locations"}/${asset.ownerId}/media`);
    return { success: true, message: "Alt text updated.", data: { assetId } };
  } catch (e: any) {
    return { success: false, code: "DATABASE_ERROR", message: e.message };
  }
}

// ─── Set Primary Image ────────────────────────────────────────────────────────

export async function setPrimaryImageAction(
  assetId: string
): Promise<ActionResult<{ assetId: string }>> {
  try {
    const session = await requireAdminSession(["EDITOR", "ADMIN", "SUPER_ADMIN"]);
    await connectToDatabase();

    if (!Types.ObjectId.isValid(assetId)) {
      return { success: false, code: "VALIDATION_ERROR", message: "Invalid assetId." };
    }

    const asset = await MediaAsset.findById(assetId);
    if (!asset) return { success: false, code: "NOT_FOUND", message: "Asset not found." };
    if (asset.status !== "READY") {
      return { success: false, code: "INVALID_STATUS_TRANSITION", message: "Only READY assets can be set as primary." };
    }
    if (asset.assetCategory !== "IMAGE") {
      return { success: false, code: "VALIDATION_ERROR", message: "Only images can be set as primary." };
    }

    // Enforce one primary image rule
    await MediaAsset.updateMany(
      { ownerType: asset.ownerType, ownerId: asset.ownerId, assetCategory: "IMAGE", isPrimary: true, _id: { $ne: asset._id } },
      { isPrimary: false }
    );
    await MediaAsset.findByIdAndUpdate(assetId, { isPrimary: true });

    await logAuditEvent({
      actor: session.user,
      action: "PRIMARY_IMAGE_CHANGED",
      targetAssetId: assetId,
      ...(asset.ownerType === "PROPERTY"
        ? { targetPropertyId: asset.ownerId.toString() }
        : { targetLocationId: asset.ownerId.toString() }),
      reason: `Set ${asset.safeDisplayName} as primary image`,
    });

    safeRevalidate(`/dashboard/${asset.ownerType === "PROPERTY" ? "properties" : "locations"}/${asset.ownerId}/media`);
    return { success: true, message: "Primary image updated.", data: { assetId } };
  } catch (e: any) {
    return { success: false, code: "DATABASE_ERROR", message: e.message };
  }
}

// ─── Reorder Gallery ──────────────────────────────────────────────────────────

export async function reorderMediaAction(
  ownerType: "PROPERTY" | "LOCATION",
  ownerId: string,
  orderedAssetIds: string[]
): Promise<ActionResult<{ updated: number }>> {
  try {
    const session = await requireAdminSession(["EDITOR", "ADMIN", "SUPER_ADMIN"]);
    await connectToDatabase();

    if (!Types.ObjectId.isValid(ownerId)) {
      return { success: false, code: "VALIDATION_ERROR", message: "Invalid ownerId." };
    }
    if (!Array.isArray(orderedAssetIds) || orderedAssetIds.length === 0) {
      return { success: false, code: "VALIDATION_ERROR", message: "orderedAssetIds must be a non-empty array." };
    }

    const objectId = new Types.ObjectId(ownerId);
    const assets = await MediaAsset.find({
      ownerType, ownerId: objectId,
      _id: { $in: orderedAssetIds.map((id) => new Types.ObjectId(id)) },
    }).select("_id");

    if (assets.length !== orderedAssetIds.length) {
      return { success: false, code: "VALIDATION_ERROR", message: "One or more asset IDs do not belong to this owner." };
    }

    await Promise.all(orderedAssetIds.map((id, index) =>
      MediaAsset.findByIdAndUpdate(id, { sortOrder: index })
    ));

    await logAuditEvent({
      actor: session.user,
      action: "MEDIA_REORDERED",
      ...(ownerType === "PROPERTY" ? { targetPropertyId: ownerId } : { targetLocationId: ownerId }),
      reason: `Reordered ${orderedAssetIds.length} media assets`,
    });

    safeRevalidate(`/dashboard/${ownerType === "PROPERTY" ? "properties" : "locations"}/${ownerId}/media`);
    return { success: true, message: "Media reordered.", data: { updated: orderedAssetIds.length } };
  } catch (e: any) {
    return { success: false, code: "DATABASE_ERROR", message: e.message };
  }
}

// ─── Detach Asset ─────────────────────────────────────────────────────────────

export async function detachAssetAction(
  assetId: string
): Promise<ActionResult<{ assetId: string }>> {
  try {
    const session = await requireAdminSession(["EDITOR", "ADMIN", "SUPER_ADMIN"]);
    await connectToDatabase();

    if (!Types.ObjectId.isValid(assetId)) {
      return { success: false, code: "VALIDATION_ERROR", message: "Invalid assetId." };
    }

    const asset = await MediaAsset.findById(assetId);
    if (!asset) return { success: false, code: "NOT_FOUND", message: "Asset not found." };

    if (session.user.role === "EDITOR" && asset.uploadedBy !== session.user.id) {
      return { success: false, code: "FORBIDDEN", message: "Editors can only detach their own uploads." };
    }

    await MediaAsset.findByIdAndUpdate(assetId, { status: "DELETED", deletedAt: new Date(), isPrimary: false });

    await logAuditEvent({
      actor: session.user,
      action: "ASSET_DETACHED",
      targetAssetId: assetId,
      ...(asset.ownerType === "PROPERTY"
        ? { targetPropertyId: asset.ownerId.toString() }
        : { targetLocationId: asset.ownerId.toString() }),
      reason: `Detached ${asset.safeDisplayName}`,
    });

    safeRevalidate(`/dashboard/${asset.ownerType === "PROPERTY" ? "properties" : "locations"}/${asset.ownerId}/media`);
    return { success: true, message: "Asset detached.", data: { assetId } };
  } catch (e: any) {
    return { success: false, code: "DATABASE_ERROR", message: e.message };
  }
}

// ─── Permanently Delete Storage ───────────────────────────────────────────────

export async function permanentlyDeleteAssetAction(
  assetId: string
): Promise<ActionResult<{ assetId: string }>> {
  try {
    const session = await requireAdminSession(["ADMIN", "SUPER_ADMIN"]);
    await connectToDatabase();

    if (!Types.ObjectId.isValid(assetId)) {
      return { success: false, code: "VALIDATION_ERROR", message: "Invalid assetId." };
    }

    const asset = await MediaAsset.findById(assetId);
    if (!asset) return { success: false, code: "NOT_FOUND", message: "Asset not found." };

    if (asset.status !== "DELETED") {
      return { success: false, code: "INVALID_STATUS_TRANSITION", message: "Asset must be detached before permanent deletion." };
    }

    if (asset.providerFileId && asset.providerFileId !== "pending") {
      const provider = getStorageProvider();
      await provider.deleteAsset({ providerFileId: asset.providerFileId, providerKey: asset.providerKey });
    }

    await MediaAsset.findByIdAndUpdate(assetId, {
      providerKey: "[deleted]",
      providerFileId: undefined,
      publicUrl: undefined,
    });

    await logAuditEvent({
      actor: session.user,
      action: "PROVIDER_OBJECT_DELETED",
      targetAssetId: assetId,
      reason: `Permanently deleted provider object for ${asset.safeDisplayName}`,
    });

    return { success: true, message: "Asset permanently deleted.", data: { assetId } };
  } catch (e: any) {
    return { success: false, code: "DATABASE_ERROR", message: e.message };
  }
}

// ─── Approve Asset ────────────────────────────────────────────────────────────

export async function approveAssetAction(
  assetId: string
): Promise<ActionResult<{ assetId: string }>> {
  try {
    const session = await requireAdminSession(["ADMIN", "SUPER_ADMIN"]);
    await connectToDatabase();

    if (!Types.ObjectId.isValid(assetId)) {
      return { success: false, code: "VALIDATION_ERROR", message: "Invalid assetId." };
    }

    const asset = await MediaAsset.findById(assetId);
    if (!asset) return { success: false, code: "NOT_FOUND", message: "Asset not found." };

    if (asset.status !== "PROCESSING" && asset.status !== "PENDING") {
      return { success: false, code: "INVALID_STATUS_TRANSITION", message: `Cannot approve asset with status: ${asset.status}` };
    }

    await MediaAsset.findByIdAndUpdate(assetId, {
      status: "READY",
      verifiedBy: session.user.email,
      verifiedAt: new Date(),
    });

    await logAuditEvent({
      actor: session.user,
      action: "ASSET_APPROVED",
      targetAssetId: assetId,
      ...(asset.ownerType === "PROPERTY"
        ? { targetPropertyId: asset.ownerId.toString() }
        : { targetLocationId: asset.ownerId.toString() }),
      reason: `Approved ${asset.purpose}: ${asset.safeDisplayName}`,
    });

    safeRevalidate(`/dashboard/properties/${asset.ownerId}/documents`);
    return { success: true, message: "Asset approved.", data: { assetId } };
  } catch (e: any) {
    return { success: false, code: "DATABASE_ERROR", message: e.message };
  }
}

// ─── Change Document Visibility ───────────────────────────────────────────────

const PUBLICLY_ALLOWABLE_PURPOSES = new Set(["BROCHURE", "MASTERPLAN"]);

export async function changeDocumentVisibilityAction(
  assetId: string,
  newAccess: "PUBLIC" | "PRIVATE" | "INTERNAL",
  reason: string
): Promise<ActionResult<{ assetId: string }>> {
  try {
    const session = await requireAdminSession(["ADMIN", "SUPER_ADMIN"]);
    await connectToDatabase();

    if (!Types.ObjectId.isValid(assetId)) {
      return { success: false, code: "VALIDATION_ERROR", message: "Invalid assetId." };
    }
    if (!["PUBLIC", "PRIVATE", "INTERNAL"].includes(newAccess)) {
      return { success: false, code: "VALIDATION_ERROR", message: "Invalid access value." };
    }
    if (!reason || reason.trim().length < 10) {
      return { success: false, code: "VALIDATION_ERROR", message: "A justification reason of at least 10 characters is required." };
    }

    const asset = await MediaAsset.findById(assetId);
    if (!asset) return { success: false, code: "NOT_FOUND", message: "Asset not found." };

    if (asset.assetCategory !== "DOCUMENT") {
      return { success: false, code: "VALIDATION_ERROR", message: "Visibility changes only apply to documents." };
    }

    if (newAccess === "PUBLIC") {
      if (!PUBLICLY_ALLOWABLE_PURPOSES.has(asset.purpose)) {
        return { success: false, code: "FORBIDDEN", message: `Documents of type "${asset.purpose}" cannot be made public.` };
      }
      if (ALWAYS_PRIVATE_PURPOSES.includes(asset.purpose as any)) {
        return { success: false, code: "FORBIDDEN", message: `Documents of type "${asset.purpose}" must remain PRIVATE.` };
      }
    }

    const previousAccess = asset.access;
    await MediaAsset.findByIdAndUpdate(assetId, {
      access: newAccess,
      publicUrl: newAccess !== "PUBLIC" ? undefined : asset.publicUrl,
    });

    await logAuditEvent({
      actor: session.user,
      action: "DOCUMENT_VISIBILITY_CHANGED",
      targetAssetId: assetId,
      ...(asset.ownerType === "PROPERTY"
        ? { targetPropertyId: asset.ownerId.toString() }
        : { targetLocationId: asset.ownerId.toString() }),
      changes: [{ field: "access", from: previousAccess, to: newAccess }],
      reason: reason.trim(),
    });

    safeRevalidate(`/dashboard/properties/${asset.ownerId}/documents`);
    return { success: true, message: `Visibility changed to ${newAccess}.`, data: { assetId } };
  } catch (e: any) {
    return { success: false, code: "DATABASE_ERROR", message: e.message };
  }
}

// ─── Update Document Metadata ─────────────────────────────────────────────────

export async function updateDocumentMetadataAction(
  assetId: string,
  documentTitle: string,
  documentVersion?: string
): Promise<ActionResult<{ assetId: string }>> {
  try {
    await requireAdminSession(["EDITOR", "ADMIN", "SUPER_ADMIN"]);
    await connectToDatabase();

    if (!Types.ObjectId.isValid(assetId)) {
      return { success: false, code: "VALIDATION_ERROR", message: "Invalid assetId." };
    }
    if (!documentTitle || documentTitle.trim().length < 2) {
      return { success: false, code: "VALIDATION_ERROR", message: "Document title must be at least 2 characters." };
    }

    const asset = await MediaAsset.findByIdAndUpdate(
      assetId,
      { documentTitle: documentTitle.trim().slice(0, 300), documentVersion: documentVersion?.trim().slice(0, 50) },
      { new: true }
    );

    if (!asset) return { success: false, code: "NOT_FOUND", message: "Asset not found." };

    safeRevalidate(`/dashboard/properties/${asset.ownerId}/documents`);
    return { success: true, message: "Document metadata updated.", data: { assetId } };
  } catch (e: any) {
    return { success: false, code: "DATABASE_ERROR", message: e.message };
  }
}

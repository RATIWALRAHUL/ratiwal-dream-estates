import "server-only";
import { NextRequest, NextResponse } from "next/server";
import { Types } from "mongoose";
import { connectToDatabase } from "@/lib/db/mongoose";
import { MediaAsset } from "@/models/MediaAsset";
import { Property } from "@/models/Property";
import { Location } from "@/models/Location";
import { requireAdminSession } from "@/lib/auth/guard";
import { logAuditEvent } from "@/lib/services/audit.service";
import { getStorageProvider } from "@/lib/storage";
import {
  ALLOWED_IMAGE_MIMES,
  ALLOWED_DOCUMENT_MIMES,
  getMaxBytesForMime,
  sanitizeFilename,
  getFileExtension,
  DISALLOWED_EXTENSIONS,
  ALLOWED_IMAGE_EXTENSIONS,
  ALLOWED_DOCUMENT_EXTENSIONS,
  FILE_SIZE_LABELS,
} from "@/lib/storage/policy";
import {
  ALWAYS_PRIVATE_PURPOSES,
  type OwnerType,
  type AssetCategory,
  type AssetPurpose,
  type AssetAccess,
} from "@/lib/storage/types";

const VALID_OWNER_TYPES = new Set<OwnerType>(["PROPERTY", "LOCATION"]);
const VALID_PURPOSES = new Set<AssetPurpose>([
  "PROPERTY_GALLERY",
  "PROPERTY_HERO",
  "LOCATION_HERO",
  "BROCHURE",
  "MASTERPLAN",
  "RERA_CERTIFICATE",
  "TITLE_DOCUMENT",
  "APPROVAL",
  "PRICE_SHEET",
  "OTHER",
]);
const VALID_ACCESS = new Set<AssetAccess>(["PUBLIC", "PRIVATE", "INTERNAL"]);

function err(status: number, message: string) {
  return NextResponse.json({ success: false, error: message }, { status });
}

export async function POST(request: NextRequest) {
  try {
    // 1. Authenticate
    const session = await requireAdminSession(["EDITOR", "ADMIN", "SUPER_ADMIN"]);
    await connectToDatabase();

    // 2. Parse body
    let body: Record<string, unknown>;
    try {
      body = await request.json();
    } catch {
      return err(400, "Invalid JSON body.");
    }

    const {
      ownerType,
      ownerId,
      purpose,
      category,
      access: requestedAccess,
      originalFilename,
      proposedMimeType,
      proposedSizeBytes,
    } = body as {
      ownerType: OwnerType;
      ownerId: string;
      purpose: AssetPurpose;
      category: AssetCategory;
      access: AssetAccess;
      originalFilename: string;
      proposedMimeType: string;
      proposedSizeBytes: number;
    };

    // 3. Validate owner type
    if (!VALID_OWNER_TYPES.has(ownerType)) {
      return err(400, `Invalid ownerType. Must be PROPERTY or LOCATION.`);
    }

    // 4. Validate ownerId
    if (!ownerId || !Types.ObjectId.isValid(ownerId)) {
      return err(400, "Invalid ownerId format.");
    }

    // 5. Validate purpose
    if (!VALID_PURPOSES.has(purpose)) {
      return err(400, `Invalid purpose: ${purpose}`);
    }

    // 6. Validate category
    if (category !== "IMAGE" && category !== "DOCUMENT") {
      return err(400, "category must be IMAGE or DOCUMENT.");
    }

    // 7. Determine effective access (server enforces ALWAYS_PRIVATE purposes)
    let effectiveAccess: AssetAccess = requestedAccess;
    if (!VALID_ACCESS.has(effectiveAccess)) {
      return err(400, "access must be PUBLIC, PRIVATE, or INTERNAL.");
    }
    if (ALWAYS_PRIVATE_PURPOSES.includes(purpose)) {
      effectiveAccess = "PRIVATE";
    }
    // Editors cannot make documents public — only ADMIN+
    if (
      effectiveAccess === "PUBLIC" &&
      category === "DOCUMENT" &&
      session.user.role === "EDITOR"
    ) {
      effectiveAccess = "INTERNAL"; // Demote to internal until admin approves
    }

    // 8. Validate owner exists and user can edit it
    const objectId = new Types.ObjectId(ownerId);
    if (ownerType === "PROPERTY") {
      const prop = await Property.findById(objectId).select("_id publicationStatus").lean();
      if (!prop) return err(404, "Property not found.");
      if (prop.publicationStatus === "ARCHIVED") {
        return err(403, "Cannot upload media to an archived property.");
      }
    } else {
      const loc = await Location.findById(objectId).select("_id publicationStatus").lean();
      if (!loc) return err(404, "Location corridor not found.");
      if (loc.publicationStatus === "ARCHIVED") {
        return err(403, "Cannot upload media to an archived location.");
      }
    }

    // 9. Validate filename & extension
    if (!originalFilename || typeof originalFilename !== "string" || originalFilename.trim().length === 0) {
      return err(400, "originalFilename is required.");
    }
    const ext = getFileExtension(originalFilename);
    if (DISALLOWED_EXTENSIONS.has(ext)) {
      return err(400, `File extension "${ext}" is not permitted.`);
    }
    if (category === "IMAGE" && !ALLOWED_IMAGE_EXTENSIONS.has(ext)) {
      return err(400, `Image files must be JPEG, PNG, or WebP. Got: "${ext}"`);
    }
    if (category === "DOCUMENT" && !ALLOWED_DOCUMENT_EXTENSIONS.has(ext)) {
      return err(400, `Document files must be PDF. Got: "${ext}"`);
    }

    // 10. Validate MIME type (server-side — not trusted from client)
    if (category === "IMAGE" && !ALLOWED_IMAGE_MIMES.has(proposedMimeType)) {
      return err(
        400,
        `MIME type "${proposedMimeType}" is not allowed for images. Allowed: JPEG, PNG, WebP.`
      );
    }
    if (category === "DOCUMENT" && !ALLOWED_DOCUMENT_MIMES.has(proposedMimeType)) {
      return err(400, `MIME type "${proposedMimeType}" is not allowed. Only PDF is accepted.`);
    }

    // 11. Validate file size
    if (!proposedSizeBytes || typeof proposedSizeBytes !== "number" || proposedSizeBytes <= 0) {
      return err(400, "proposedSizeBytes must be a positive number.");
    }
    const maxBytes = getMaxBytesForMime(proposedMimeType);
    if (proposedSizeBytes > maxBytes) {
      const limitLabel = category === "IMAGE" ? FILE_SIZE_LABELS.IMAGE_MAX : FILE_SIZE_LABELS.PUBLIC_PDF_MAX;
      return err(
        400,
        `File size ${(proposedSizeBytes / 1024 / 1024).toFixed(1)} MB exceeds the ${limitLabel} limit.`
      );
    }

    // 12. Create PENDING asset record
    const safeDisplayName = sanitizeFilename(originalFilename);
    const newAsset = await MediaAsset.create({
      ownerType,
      ownerId: objectId,
      assetCategory: category,
      purpose,
      provider: "imagekit",
      providerKey: "pending", // updated on completion
      access: effectiveAccess,
      originalFilename: originalFilename.trim().slice(0, 255),
      safeDisplayName,
      mimeType: proposedMimeType,
      extension: ext,
      sizeBytes: proposedSizeBytes,
      status: "PENDING",
      uploadedBy: session.user.id,
      uploadedByEmail: session.user.email,
      uploadedAt: new Date(),
    });

    // 13. Get signed upload authorization from provider
    const provider = getStorageProvider();
    const auth = await provider.createUploadAuthorization({
      ownerType,
      ownerId,
      purpose,
      category,
      access: effectiveAccess,
      originalFilename,
      proposedMimeType,
      proposedSizeBytes,
      actorId: session.user.id,
    });

    // Update providerKey on asset now that we have the server-assigned path
    await MediaAsset.findByIdAndUpdate(newAsset._id, {
      providerKey: auth.providerKey,
      status: "UPLOADING",
    });

    // 14. Audit
    await logAuditEvent({
      actor: session.user,
      action: "UPLOAD_AUTHORIZED",
      targetAssetId: newAsset._id.toString(),
      ...(ownerType === "PROPERTY" ? { targetPropertyId: ownerId } : { targetLocationId: ownerId }),
      reason: `Upload authorized for ${purpose} (${category}) — ${safeDisplayName}`,
    });

    return NextResponse.json(
      {
        success: true,
        assetId: newAsset._id.toString(),
        providerKey: auth.providerKey,
        // ImageKit client-side upload fields
        token: auth.uploadToken,
        signature: auth.signature,
        expire: auth.expire,
        publicKey: auth.publicKey,
        uploadUrl: auth.uploadUrl,
        folder: auth.folder,
        fileName: auth.fileName,
        expiresAt: auth.expiresAt,
      },
      { status: 201 }
    );
  } catch (err: unknown) {
    const e = err as Error;
    if (e.name === "AuthenticationError") {
      return NextResponse.json({ success: false, error: "Authentication required." }, { status: 401 });
    }
    if (e.name === "AuthorizationError") {
      return NextResponse.json({ success: false, error: "Insufficient permissions." }, { status: 403 });
    }
    console.error("[upload/authorize] Unexpected error:", e.message);
    return NextResponse.json(
      { success: false, error: "Upload authorization failed. Please try again." },
      { status: 500 }
    );
  }
}

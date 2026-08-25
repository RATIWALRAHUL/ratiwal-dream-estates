import "server-only";
import { NextRequest, NextResponse } from "next/server";
import { Types } from "mongoose";
import { connectToDatabase } from "@/lib/db/mongoose";
import { MediaAsset } from "@/models/MediaAsset";
import { requireAdminSession } from "@/lib/auth/guard";
import { logAuditEvent } from "@/lib/services/audit.service";
import { getStorageProvider } from "@/lib/storage";
import { ALLOWED_IMAGE_MIMES, ALLOWED_DOCUMENT_MIMES, getMaxBytesForMime } from "@/lib/storage/policy";

function err(status: number, message: string) {
  return NextResponse.json({ success: false, error: message }, { status });
}

export async function POST(request: NextRequest) {
  try {
    // 1. Authenticate
    const session = await requireAdminSession(["EDITOR", "ADMIN", "SUPER_ADMIN"]);
    await connectToDatabase();

    let body: Record<string, unknown>;
    try {
      body = await request.json();
    } catch {
      return err(400, "Invalid JSON body.");
    }

    const {
      assetId,
      providerFileId,
      providerKey,
      reportedSizeBytes,
      reportedMimeType,
      reportedWidth,
      reportedHeight,
      publicUrl,
    } = body as {
      assetId: string;
      providerFileId: string;
      providerKey: string;
      reportedSizeBytes: number;
      reportedMimeType: string;
      reportedWidth?: number;
      reportedHeight?: number;
      publicUrl?: string;
    };

    // 2. Validate assetId
    if (!assetId || !Types.ObjectId.isValid(assetId)) {
      return err(400, "Invalid assetId.");
    }

    // 3. Find the PENDING asset
    const asset = await MediaAsset.findById(assetId);
    if (!asset) {
      return err(404, "Asset record not found.");
    }

    // 4. Replay attack prevention — already completed
    if (asset.status === "READY" || asset.status === "PROCESSING") {
      return err(409, "Upload completion has already been recorded for this asset.");
    }

    // 5. Status guard — must be UPLOADING or PENDING
    if (asset.status !== "UPLOADING" && asset.status !== "PENDING") {
      return err(400, `Asset is in an invalid state for completion: ${asset.status}`);
    }

    // 6. Verify providerKey matches server record
    if (!providerKey || !asset.providerKey.endsWith(providerKey.split("/").pop() || "")) {
      // Allow if providerKey has the same filename segment
      if (asset.providerKey !== providerKey) {
        // Tolerate path prefix differences from ImageKit
        const serverFile = asset.providerKey.split("/").pop();
        const clientFile = providerKey.split("/").pop();
        if (serverFile !== clientFile) {
          return err(400, "Provider key mismatch. Possible path manipulation attempt.");
        }
      }
    }

    // 7. Verify owner relationship — providerKey must contain the ownerId
    const ownerIdStr = asset.ownerId.toString();
    if (!providerKey.includes(ownerIdStr)) {
      return err(400, "Provider key does not match expected owner path.");
    }

    // 8. Validate MIME type server-side
    const allAllowed = new Set([...ALLOWED_IMAGE_MIMES, ...ALLOWED_DOCUMENT_MIMES]);
    if (!allAllowed.has(reportedMimeType)) {
      await MediaAsset.findByIdAndUpdate(assetId, {
        status: "REJECTED",
        rejectionReason: `Unsupported MIME type: ${reportedMimeType}`,
      });
      return err(400, `File type "${reportedMimeType}" is not permitted.`);
    }

    // 9. Validate size against policy
    if (reportedSizeBytes > getMaxBytesForMime(reportedMimeType)) {
      await MediaAsset.findByIdAndUpdate(assetId, {
        status: "REJECTED",
        rejectionReason: `File size ${reportedSizeBytes} exceeds the allowed limit.`,
      });
      return err(400, "File exceeds the maximum allowed size.");
    }

    // 10. Verify the file actually exists in storage
    const provider = getStorageProvider();
    const exists = await provider.assetExists({ providerKey, providerFileId });
    if (!exists) {
      await MediaAsset.findByIdAndUpdate(assetId, {
        status: "REJECTED",
        rejectionReason: "Provider reports the file does not exist in storage.",
      });
      return err(400, "Uploaded file not found in storage. Upload may have failed.");
    }

    // 11. Verify via provider (size cross-check)
    let verified;
    try {
      verified = await provider.verifyCompletedUpload({
        assetId,
        providerFileId,
        providerKey,
        reportedSizeBytes,
        reportedMimeType,
        reportedWidth,
        reportedHeight,
        publicUrl,
      });
    } catch (verifyErr: unknown) {
      const msg = verifyErr instanceof Error ? verifyErr.message : "Verification failed";
      await MediaAsset.findByIdAndUpdate(assetId, {
        status: "REJECTED",
        rejectionReason: msg,
      });
      return err(400, `Upload verification failed: ${msg}`);
    }

    // 12. Determine effective access for publicUrl
    // Only PUBLIC assets get a persisted public URL
    const shouldPersistPublicUrl =
      asset.access === "PUBLIC" && verified.publicUrl;

    // 13. Mark PROCESSING (async processing placeholder) or READY
    // Documents require manual approval, so they go PROCESSING
    const newStatus = asset.assetCategory === "DOCUMENT" ? "PROCESSING" : "READY";

    await MediaAsset.findByIdAndUpdate(assetId, {
      providerFileId,
      providerKey,
      status: newStatus,
      sizeBytes: verified.sizeBytes,
      detectedMimeType: reportedMimeType,
      width: verified.width,
      height: verified.height,
      // Only persist publicUrl for truly public assets
      publicUrl: shouldPersistPublicUrl ? verified.publicUrl : undefined,
      uploadedAt: new Date(),
    });

    // 14. Audit
    await logAuditEvent({
      actor: session.user,
      action: "UPLOAD_COMPLETED",
      targetAssetId: assetId,
      ...(asset.ownerType === "PROPERTY"
        ? { targetPropertyId: asset.ownerId.toString() }
        : { targetLocationId: asset.ownerId.toString() }),
      reason: `Upload completed for ${asset.purpose} (${asset.assetCategory}) — ${asset.safeDisplayName} — ${newStatus}`,
    });

    return NextResponse.json({
      success: true,
      assetId,
      status: newStatus,
      publicUrl: shouldPersistPublicUrl ? verified.publicUrl : undefined,
      width: verified.width,
      height: verified.height,
      sizeBytes: verified.sizeBytes,
    });
  } catch (e: unknown) {
    const err2 = e as Error;
    if (err2.name === "AuthenticationError") {
      return NextResponse.json({ success: false, error: "Authentication required." }, { status: 401 });
    }
    if (err2.name === "AuthorizationError") {
      return NextResponse.json({ success: false, error: "Insufficient permissions." }, { status: 403 });
    }
    console.error("[upload/complete] Error:", err2.message);
    return NextResponse.json(
      { success: false, error: "Upload completion failed. Please try again." },
      { status: 500 }
    );
  }
}

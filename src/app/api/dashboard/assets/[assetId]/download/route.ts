import "server-only";
import { NextRequest, NextResponse } from "next/server";
import { Types } from "mongoose";
import { connectToDatabase } from "@/lib/db/mongoose";
import { MediaAsset } from "@/models/MediaAsset";
import { requireAdminSession } from "@/lib/auth/guard";
import { logAuditEvent } from "@/lib/services/audit.service";
import { getStorageProvider } from "@/lib/storage";
import { PRIVATE_DOWNLOAD_TTL_SECONDS } from "@/lib/storage/policy";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ assetId: string }> }
) {
  try {
    // 1. Authenticate — any dashboard role can download
    const session = await requireAdminSession(["EDITOR", "ADMIN", "SUPER_ADMIN"]);
    await connectToDatabase();

    const { assetId } = await params;

    // 2. Validate assetId
    if (!assetId || !Types.ObjectId.isValid(assetId)) {
      return NextResponse.json({ error: "Invalid asset ID." }, { status: 400 });
    }

    // 3. Find asset
    const asset = await MediaAsset.findById(assetId);
    if (!asset) {
      return NextResponse.json({ error: "Asset not found." }, { status: 404 });
    }

    // 4. Must not be deleted
    if (asset.status === "DELETED" || asset.deletedAt) {
      return NextResponse.json({ error: "Asset has been deleted." }, { status: 410 });
    }

    // 5. Must be READY or PROCESSING (PENDING/UPLOADING not accessible)
    if (asset.status !== "READY" && asset.status !== "PROCESSING") {
      return NextResponse.json(
        { error: "Asset is not available for download." },
        { status: 400 }
      );
    }

    // 6. Permission enforcement:
    //    - PUBLIC: any authenticated admin can access
    //    - INTERNAL: ADMIN and SUPER_ADMIN only
    //    - PRIVATE: ADMIN and SUPER_ADMIN only, with audit log
    if (asset.access === "PRIVATE" || asset.access === "INTERNAL") {
      if (session.user.role === "EDITOR") {
        return NextResponse.json(
          { error: "Insufficient permissions to access this document." },
          { status: 403 }
        );
      }
    }

    // 7. PUBLIC assets: redirect to public URL
    if (asset.access === "PUBLIC" && asset.publicUrl) {
      return NextResponse.redirect(asset.publicUrl, { status: 302 });
    }

    // 8. Private/Internal: generate short-lived signed URL
    const provider = getStorageProvider();
    const download = await provider.createPrivateDownload({
      assetId,
      providerKey: asset.providerKey,
      ttlSeconds: PRIVATE_DOWNLOAD_TTL_SECONDS,
    });

    // 9. Audit private document downloads
    if (asset.access === "PRIVATE") {
      await logAuditEvent({
        actor: session.user,
        action: "PRIVATE_DOCUMENT_DOWNLOADED",
        targetAssetId: assetId,
        ...(asset.ownerType === "PROPERTY"
          ? { targetPropertyId: asset.ownerId.toString() }
          : { targetLocationId: asset.ownerId.toString() }),
        reason: `Private download: ${asset.safeDisplayName} (${asset.purpose})`,
      });
    }

    // 10. Return signed URL — never persist this URL
    // Use a redirect so the signed URL is never in our response body
    const response = NextResponse.redirect(download.signedUrl, { status: 302 });

    // 11. Prevent caching — private downloads must not be cached by CDN or browser
    response.headers.set("Cache-Control", "private, no-store, no-cache, must-revalidate");
    response.headers.set("Pragma", "no-cache");
    response.headers.set("X-Robots-Tag", "noindex, nofollow");
    response.headers.set(
      "Content-Disposition",
      `attachment; filename="${asset.safeDisplayName}"`
    );

    return response;
  } catch (e: unknown) {
    const err = e as Error;
    if (err.name === "AuthenticationError") {
      return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    }
    if (err.name === "AuthorizationError") {
      return NextResponse.json({ error: "Insufficient permissions." }, { status: 403 });
    }
    console.error("[assets/download] Error:", err.message);
    return NextResponse.json(
      { error: "Failed to generate download link. Please try again." },
      { status: 500 }
    );
  }
}

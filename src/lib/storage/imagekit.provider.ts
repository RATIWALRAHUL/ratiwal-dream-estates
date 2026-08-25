import "server-only";

import { getImageKitClient, getImageKitAuthParams } from "@/lib/imagekit/client";
import { sanitizeFilename, UPLOAD_AUTH_TTL_SECONDS, PRIVATE_DOWNLOAD_TTL_SECONDS } from "./policy";
import type {
  StorageProvider,
  UploadAuthorizationInput,
  UploadAuthorization,
  CompletedUploadInput,
  VerifiedUpload,
  PrivateDownloadInput,
  PrivateDownload,
  DeleteAssetInput,
  AssetLookupInput,
} from "./types";
import { getServerEnv } from "@/lib/env";

class ImageKitStorageProvider implements StorageProvider {
  /**
   * Generate a short-lived, single-purpose ImageKit upload token.
   * The storage path is server-controlled and never user-supplied.
   */
  async createUploadAuthorization(input: UploadAuthorizationInput): Promise<UploadAuthorization> {
    const auth = getImageKitAuthParams();
    const env = getServerEnv();

    const safeName = sanitizeFilename(input.originalFilename);
    const ext = safeName.includes(".") ? "" : "";

    // Build server-controlled canonical path
    // Format: ratiwal/{ownerType}/{ownerId}/{category}/{assetId}-{safeName}
    const ownerSegment = input.ownerType === "PROPERTY" ? "properties" : "locations";
    const categorySegment = input.category === "IMAGE" ? "images" : "documents";
    const folder = `/ratiwal/${ownerSegment}/${input.ownerId}/${categorySegment}`;
    const fileName = `${input.actorId.slice(-8)}-${Date.now()}-${safeName}`;
    const providerKey = `${folder}/${fileName}`;

    const expiresAt = new Date(Date.now() + UPLOAD_AUTH_TTL_SECONDS * 1000).toISOString();

    return {
      assetId: input.ownerId, // overridden by caller with real assetId
      providerKey,
      uploadToken: auth.token,
      signature: auth.signature,
      expire: auth.expire,
      publicKey: auth.publicKey,
      uploadUrl: "https://upload.imagekit.io/api/v1/files/upload",
      folder,
      fileName,
      expiresAt,
    };
  }

  /**
   * Verify a completed upload exists in ImageKit with correct metadata.
   */
  async verifyCompletedUpload(input: CompletedUploadInput): Promise<VerifiedUpload> {
    const ik = getImageKitClient();

    // Fetch file details from ImageKit using fileId
    let fileDetails: {
      size: number;
      mimeType?: string;
      width?: number;
      height?: number;
      url?: string;
      filePath?: string;
    };
    try {
      fileDetails = (await ik.getFileDetails(input.providerFileId)) as typeof fileDetails;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      throw new Error(`ImageKit file verification failed: ${msg}`);
    }

    // Validate reported vs actual size (allow 5% tolerance for encoding differences)
    const sizeDiff = Math.abs(fileDetails.size - input.reportedSizeBytes);
    const sizeTolerance = Math.max(input.reportedSizeBytes * 0.05, 1024);
    if (sizeDiff > sizeTolerance) {
      throw new Error(
        `Size mismatch: reported ${input.reportedSizeBytes} bytes, provider reports ${fileDetails.size} bytes.`
      );
    }

    return {
      assetId: input.assetId,
      status: "READY",
      publicUrl: fileDetails.url || input.publicUrl,
      width: fileDetails.width,
      height: fileDetails.height,
      sizeBytes: fileDetails.size,
    };
  }

  /**
   * Generate a short-lived signed URL for a private asset.
   * This URL must never be persisted to the database.
   */
  async createPrivateDownload(input: PrivateDownloadInput): Promise<PrivateDownload> {
    const ik = getImageKitClient();
    const env = getServerEnv();
    const ttl = input.ttlSeconds ?? PRIVATE_DOWNLOAD_TTL_SECONDS;

    // ImageKit signed URL generation
    const expiresAt = Math.floor(Date.now() / 1000) + ttl;

    // For private files, use ImageKit's signed URL with expiry
    // The signed URL is generated server-side and returned as a temporary redirect
    const signedUrl = ik.url({
      path: input.providerKey,
      signed: true,
      expireSeconds: ttl,
    });

    // Extract filename from key
    const parts = input.providerKey.split("/");
    const filename = parts[parts.length - 1] || "download";

    return {
      signedUrl,
      expiresAt,
      filename,
      mimeType: "application/octet-stream", // caller sets real MIME from DB
    };
  }

  /**
   * Permanently delete an object from ImageKit storage.
   */
  async deleteAsset(input: DeleteAssetInput): Promise<void> {
    const ik = getImageKitClient();
    try {
      await ik.deleteFile(input.providerFileId);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      // If already deleted, treat as success (idempotent)
      if (msg.includes("not found") || msg.includes("404")) return;
      throw new Error(`ImageKit deletion failed: ${msg}`);
    }
  }

  /**
   * Check if an asset exists in ImageKit storage.
   */
  async assetExists(input: AssetLookupInput): Promise<boolean> {
    const ik = getImageKitClient();
    try {
      if (input.providerFileId) {
        await ik.getFileDetails(input.providerFileId);
        return true;
      }
      // Search by path
      const files = (await ik.listFiles({ searchQuery: `filePath = "${input.providerKey}"` })) as unknown[];
      return Array.isArray(files) && files.length > 0;
    } catch {
      return false;
    }
  }
}

// Singleton provider instance
let providerInstance: StorageProvider | null = null;

/**
 * Returns the active StorageProvider implementation.
 * Currently uses ImageKit (existing provider).
 */
export function getStorageProvider(): StorageProvider {
  if (!providerInstance) {
    providerInstance = new ImageKitStorageProvider();
  }
  return providerInstance;
}

/** Reset singleton (for testing) */
export function _resetStorageProvider(): void {
  providerInstance = null;
}

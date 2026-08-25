/**
 * Storage provider abstraction types.
 * Business code must not depend on provider-specific response shapes.
 */

export type OwnerType = "PROPERTY" | "LOCATION";

export type AssetCategory = "IMAGE" | "DOCUMENT";

export type AssetPurpose =
  | "PROPERTY_GALLERY"
  | "PROPERTY_HERO"
  | "LOCATION_HERO"
  | "BROCHURE"
  | "MASTERPLAN"
  | "RERA_CERTIFICATE"
  | "TITLE_DOCUMENT"
  | "APPROVAL"
  | "PRICE_SHEET"
  | "OTHER";

export type AssetAccess = "PUBLIC" | "PRIVATE" | "INTERNAL";

export type AssetStatus =
  | "PENDING"
  | "UPLOADING"
  | "PROCESSING"
  | "READY"
  | "REJECTED"
  | "QUARANTINED"
  | "DELETED";

/** Canonical purposes that are always PRIVATE regardless of requested access */
export const ALWAYS_PRIVATE_PURPOSES: AssetPurpose[] = [
  "TITLE_DOCUMENT",
  "APPROVAL",
  "PRICE_SHEET",
];

/** Canonical purposes that are always PUBLIC (when READY + approved) */
export const ALWAYS_PUBLIC_PURPOSES: AssetPurpose[] = [
  "PROPERTY_GALLERY",
  "PROPERTY_HERO",
  "LOCATION_HERO",
];

// ─── Upload Authorization ─────────────────────────────────────────────────────

export interface UploadAuthorizationInput {
  ownerType: OwnerType;
  ownerId: string;
  purpose: AssetPurpose;
  category: AssetCategory;
  access: AssetAccess;
  originalFilename: string;
  proposedMimeType: string;
  proposedSizeBytes: number;
  actorId: string;
}

export interface UploadAuthorization {
  /** Canonical asset ID created in PENDING state */
  assetId: string;
  /** Provider-controlled storage path (never user-supplied) */
  providerKey: string;
  /** Short-lived token for direct-to-storage upload */
  uploadToken: string;
  /** HMAC signature for ImageKit */
  signature: string;
  /** Epoch seconds when token expires */
  expire: number;
  /** Provider's public key (safe for browser) */
  publicKey: string;
  /** Upload URL endpoint */
  uploadUrl: string;
  /** Folder path in provider */
  folder: string;
  /** File name to use in provider */
  fileName: string;
  /** When this authorization expires (ISO) */
  expiresAt: string;
}

// ─── Upload Completion ────────────────────────────────────────────────────────

export interface CompletedUploadInput {
  assetId: string;
  providerFileId: string;
  providerKey: string;
  reportedSizeBytes: number;
  reportedMimeType: string;
  reportedWidth?: number;
  reportedHeight?: number;
  publicUrl?: string;
}

export interface VerifiedUpload {
  assetId: string;
  status: AssetStatus;
  publicUrl?: string;
  width?: number;
  height?: number;
  sizeBytes: number;
}

// ─── Private Download ────────────────────────────────────────────────────────

export interface PrivateDownloadInput {
  assetId: string;
  providerKey: string;
  /** Seconds the signed URL should remain valid (default: 120) */
  ttlSeconds?: number;
}

export interface PrivateDownload {
  /** Short-lived signed URL — never persisted to DB */
  signedUrl: string;
  /** Expiry epoch */
  expiresAt: number;
  /** Original filename for Content-Disposition */
  filename: string;
  mimeType: string;
}

// ─── Asset Existence / Deletion ──────────────────────────────────────────────

export interface DeleteAssetInput {
  providerFileId: string;
  providerKey: string;
}

export interface AssetLookupInput {
  providerKey: string;
  providerFileId?: string;
}

// ─── Provider Interface ──────────────────────────────────────────────────────

export interface StorageProvider {
  /** Generate a short-lived, single-purpose upload token */
  createUploadAuthorization(input: UploadAuthorizationInput): Promise<UploadAuthorization>;
  /** Verify a completed upload exists in storage with correct metadata */
  verifyCompletedUpload(input: CompletedUploadInput): Promise<VerifiedUpload>;
  /** Generate a short-lived signed URL for a private asset (never stored) */
  createPrivateDownload(input: PrivateDownloadInput): Promise<PrivateDownload>;
  /** Permanently delete an object from storage */
  deleteAsset(input: DeleteAssetInput): Promise<void>;
  /** Check if an object exists in storage */
  assetExists(input: AssetLookupInput): Promise<boolean>;
}

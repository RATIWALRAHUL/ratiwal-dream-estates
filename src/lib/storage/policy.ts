/**
 * Central server-side file policy configuration.
 * All limits and allowed types are defined here.
 * Never trust client-supplied values — re-validate server-side.
 */

// ─── File Size Limits ─────────────────────────────────────────────────────────

export const FILE_SIZE_LIMITS = {
  /** Max image upload size in bytes (15 MB) */
  IMAGE_MAX_BYTES: 15 * 1024 * 1024,
  /** Max public brochure/masterplan PDF in bytes (25 MB) */
  PUBLIC_PDF_MAX_BYTES: 25 * 1024 * 1024,
  /** Max private/legal PDF in bytes (25 MB) */
  PRIVATE_PDF_MAX_BYTES: 25 * 1024 * 1024,
} as const;

/** Human-readable size labels (for UI display) */
export const FILE_SIZE_LABELS = {
  IMAGE_MAX: "15 MB",
  PUBLIC_PDF_MAX: "25 MB",
  PRIVATE_PDF_MAX: "25 MB",
} as const;

// ─── Allowed MIME Types ───────────────────────────────────────────────────────

export const ALLOWED_IMAGE_MIMES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
]);

export const ALLOWED_DOCUMENT_MIMES = new Set([
  "application/pdf",
]);

/** All allowed MIME types combined */
export const ALL_ALLOWED_MIMES: Set<string> = new Set([
  ...ALLOWED_IMAGE_MIMES,
  ...ALLOWED_DOCUMENT_MIMES,
]);

// ─── Disallowed Extensions ────────────────────────────────────────────────────

export const DISALLOWED_EXTENSIONS = new Set([
  ".svg",
  ".html",
  ".htm",
  ".js",
  ".jsx",
  ".ts",
  ".tsx",
  ".mjs",
  ".cjs",
  ".exe",
  ".sh",
  ".bash",
  ".cmd",
  ".bat",
  ".ps1",
  ".zip",
  ".rar",
  ".7z",
  ".tar",
  ".gz",
  ".docm",
  ".xlsm",
  ".pptm",
  ".doc",
  ".xls",
  ".ppt",
]);

// ─── Magic Bytes Signatures ───────────────────────────────────────────────────

/**
 * File magic byte signatures (hex prefix, offset 0).
 * Used for server-side file type verification — never trust the declared MIME alone.
 */
export const MAGIC_BYTES: Record<string, { mimes: string[]; label: string }> = {
  // JPEG: FF D8 FF
  "ffd8ff": { mimes: ["image/jpeg", "image/jpg"], label: "JPEG" },
  // PNG: 89 50 4E 47
  "89504e47": { mimes: ["image/png"], label: "PNG" },
  // WebP: RIFF....WEBP (bytes 0-3 = RIFF, bytes 8-11 = WEBP)
  "52494646": { mimes: ["image/webp"], label: "RIFF/WebP" },
  // PDF: %PDF
  "25504446": { mimes: ["application/pdf"], label: "PDF" },
};

/** Minimum bytes to read for magic byte verification */
export const MAGIC_BYTES_READ_LENGTH = 12;

// ─── Allowed Extensions Per Category ─────────────────────────────────────────

export const ALLOWED_IMAGE_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp"]);
export const ALLOWED_DOCUMENT_EXTENSIONS = new Set([".pdf"]);

// ─── Upload Authorization Expiry ──────────────────────────────────────────────

/** Upload authorization token TTL in seconds (10 minutes) */
export const UPLOAD_AUTH_TTL_SECONDS = 600;

/** Private download signed URL TTL in seconds (2 minutes) */
export const PRIVATE_DOWNLOAD_TTL_SECONDS = 120;

/** PENDING asset timeout: assets stuck PENDING beyond this are orphans (4 hours) */
export const PENDING_ASSET_TIMEOUT_HOURS = 4;

// ─── Rate Limiting ────────────────────────────────────────────────────────────

/** Max upload authorization requests per minute per admin user */
export const UPLOAD_AUTH_RATE_LIMIT_PER_MINUTE = 20;

/** Max private download requests per minute per admin user */
export const PRIVATE_DOWNLOAD_RATE_LIMIT_PER_MINUTE = 30;

/** Max permanent deletion requests per hour per admin user */
export const DELETION_RATE_LIMIT_PER_HOUR = 10;

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Returns the max allowed bytes for a given MIME type.
 */
export function getMaxBytesForMime(mime: string): number {
  if (ALLOWED_IMAGE_MIMES.has(mime)) return FILE_SIZE_LIMITS.IMAGE_MAX_BYTES;
  if (ALLOWED_DOCUMENT_MIMES.has(mime)) return FILE_SIZE_LIMITS.PUBLIC_PDF_MAX_BYTES;
  return 0;
}

/**
 * Extracts a normalized lowercase file extension from a filename.
 */
export function getFileExtension(filename: string): string {
  const parts = filename.split(".");
  if (parts.length < 2) return "";
  return `.${parts[parts.length - 1].toLowerCase()}`;
}

/**
 * Sanitizes an original filename into a safe storage-friendly name.
 * Removes special characters, trims whitespace, enforces max length.
 */
export function sanitizeFilename(originalFilename: string): string {
  const name = originalFilename
    .toLowerCase()
    .replace(/[^a-z0-9._-]/g, "-")
    .replace(/-{2,}/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 100);
  return name || "upload";
}

/**
 * Returns hex string of the first N bytes of a buffer (for magic byte checking).
 */
export function bufferToHex(buffer: Buffer, bytes: number): string {
  return buffer.slice(0, bytes).toString("hex");
}

/**
 * Verifies that the given buffer's magic bytes match the declared MIME type.
 * Returns { valid: boolean, detectedLabel: string }
 */
export function verifyMagicBytes(
  buffer: Buffer,
  declaredMime: string
): { valid: boolean; detectedLabel: string | null } {
  const hex4 = bufferToHex(buffer, 4);
  const hex3 = bufferToHex(buffer, 3);

  // Check 4-byte signatures
  for (const [magic, info] of Object.entries(MAGIC_BYTES)) {
    const hexToCheck = magic.length === 6 ? hex3 : hex4;
    if (hexToCheck.startsWith(magic) || hex4.startsWith(magic)) {
      // Verify WebP: bytes 8-11 must be "57455250" (WEBP)
      if (magic === "52494646" && info.mimes.includes("image/webp")) {
        const riffSuffix = bufferToHex(buffer.slice(8, 12), 4);
        if (riffSuffix !== "57455250") continue; // Not WebP
      }
      return {
        valid: info.mimes.includes(declaredMime),
        detectedLabel: info.label,
      };
    }
  }

  return { valid: false, detectedLabel: null };
}

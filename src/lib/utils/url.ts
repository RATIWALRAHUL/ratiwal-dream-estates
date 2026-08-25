/**
 * Ratiwal Dream Estates — URL Validation Utility
 * Ensures URLs use secure and supported web protocols (http, https).
 */

/**
 * Validates if a string is a valid HTTP, HTTPS, or root-relative web asset URL.
 */
export function isValidHttpUrl(url: unknown): boolean {
  if (typeof url !== "string" || !url.trim()) {
    return false;
  }

  const trimmed = url.trim();

  // Support local public static assets starting with /
  if (trimmed.startsWith("/") && !trimmed.startsWith("//") && !trimmed.includes("\\")) {
    return true;
  }

  try {
    const parsed = new URL(trimmed);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

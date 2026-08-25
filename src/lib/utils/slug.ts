/**
 * Ratiwal Dream Estates — Slug Normalization Utility
 * Generates lowercase, clean, URL-safe kebab-case slugs.
 */

/**
 * Normalizes any string into a clean lowercase kebab-case slug.
 */
export function normalizeSlug(input: string): string {
  if (typeof input !== "string") {
    throw new Error("Slug input must be a valid string.");
  }

  const slug = input
    .normalize("NFKD") // Normalize unicode decomposed forms
    .toLowerCase()
    .trim()
    .replace(/[^\p{L}\p{N}\s\-_]/gu, "") // Keep letters, numbers, spaces, hyphens, and underscores
    .replace(/[\s_]+/g, "-") // Replace spaces and underscores with hyphens
    .replace(/-+/g, "-") // Collapse repeated hyphens
    .replace(/^-+|-+$/g, ""); // Trim leading and trailing hyphens

  if (!slug) {
    throw new Error(`Failed to generate slug: input "${input}" resulted in an empty string.`);
  }

  return slug;
}

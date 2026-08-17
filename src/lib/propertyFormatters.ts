/**
 * Strips internal dev placeholder markers (e.g. "[CONTENT REQUIRED]",
 * "[DEVELOPMENT PLACEHOLDER — REPLACE BEFORE PRODUCTION]") from
 * customer-facing text without touching the underlying data record.
 */
export function stripPlaceholder(value: string | undefined | null): string {
  if (!value) return "";
  return value.replace(/\[.*?\]/g, "").trim();
}

export function displayOrFallback(value: string | undefined | null, fallback = "Details available on request"): string {
  const cleaned = stripPlaceholder(value);
  return cleaned || fallback;
}

export function displayListOrFallback(values: string[] | undefined | null, fallback = "Details available on request"): string {
  const cleaned = (values ?? []).map(stripPlaceholder).filter(Boolean);
  return cleaned.length ? cleaned.join(", ") : fallback;
}

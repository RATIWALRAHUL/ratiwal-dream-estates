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

/**
 * Formats an amount in INR with Indian numbering nomenclature (Crores, Lakhs).
 */
export function formatCurrency(amount: number): string {
  if (amount >= 10000000) {
    const cr = amount / 10000000;
    return `₹${cr % 1 === 0 ? cr : cr.toFixed(2)} Cr`;
  }
  if (amount >= 100000) {
    const l = amount / 100000;
    return `₹${l % 1 === 0 ? l : l.toFixed(2)} Lakhs`;
  }
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

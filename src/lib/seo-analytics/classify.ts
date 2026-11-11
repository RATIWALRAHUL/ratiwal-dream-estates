/**
 * Page and query classification for SEO analytics.
 * Page category is derived deterministically from the site's route map.
 * Search intent is a transparent keyword HEURISTIC, not Google's own label.
 */

export const PAGE_CATEGORIES = [
  "HOMEPAGE",
  "PROPERTY_LISTING",
  "PROPERTY_DETAIL",
  "LOCATION",
  "INSIGHT",
  "TESTIMONIAL",
  "CONTACT_INFO",
  "OTHER",
] as const;
export type PageCategory = (typeof PAGE_CATEGORIES)[number];

export const PAGE_CATEGORY_LABELS: Record<PageCategory, string> = {
  HOMEPAGE: "Homepage",
  PROPERTY_LISTING: "Property listings",
  PROPERTY_DETAIL: "Property details",
  LOCATION: "Locations",
  INSIGHT: "Insights",
  TESTIMONIAL: "Testimonials",
  CONTACT_INFO: "Contact & information",
  OTHER: "Other",
};

const INFO_PATHS = new Set([
  "/contact",
  "/about",
  "/why-choose-us",
  "/investment",
  "/privacy-policy",
  "/terms-of-service",
  "/disclaimer",
]);

/** Returns a normalised path ("/" for home, no query/hash, no trailing slash). */
export function normalizePagePath(pageUrl: string): string {
  try {
    const u = new URL(pageUrl);
    return normalizePath(u.pathname);
  } catch {
    return normalizePath(pageUrl.split(/[?#]/)[0] || "/");
  }
}

function normalizePath(p: string): string {
  let path = p.startsWith("/") ? p : `/${p}`;
  if (path.length > 1) path = path.replace(/\/+$/, "");
  return path || "/";
}

export function classifyPage(path: string): PageCategory {
  const p = normalizePath(path);
  if (p === "/") return "HOMEPAGE";
  if (p === "/properties") return "PROPERTY_LISTING";
  if (p.startsWith("/properties/")) return "PROPERTY_DETAIL";
  if (p === "/locations" || p.startsWith("/locations/")) return "LOCATION";
  if (p === "/insights" || p.startsWith("/insights/")) return "INSIGHT";
  if (p === "/testimonials" || p.startsWith("/testimonials/")) return "TESTIMONIAL";
  if (INFO_PATHS.has(p)) return "CONTACT_INFO";
  return "OTHER";
}

// ─── Search intent (heuristic) ───────────────────────────────────────────────

export const SEARCH_INTENTS = ["BRAND", "INFORMATIONAL", "TRANSACTIONAL", "COMMERCIAL", "OTHER"] as const;
export type SearchIntent = (typeof SEARCH_INTENTS)[number];

export const SEARCH_INTENT_LABELS: Record<SearchIntent, string> = {
  BRAND: "Brand",
  INFORMATIONAL: "Informational",
  TRANSACTIONAL: "Transactional",
  COMMERCIAL: "Commercial research",
  OTHER: "Unclassified",
};

const BRAND = /\b(ratiwal|dream\s*estates?)\b/;
const INFORMATIONAL =
  /^(how|what|why|when|which|is|are|can|does|do|should)\b|\b(guide|process|documents?|rules?|meaning|difference|vs|checklist|procedure|eligibility|steps|90\s?a|patta|conversion|registry|mutation)\b/;
const TRANSACTIONAL = /\b(buy|buying|sale|for sale|price|prices|cost|rate|rates|booking|book|site visit|invest|investment|purchase)\b/;
const COMMERCIAL = /\b(plot|plots|land|property|properties|flat|flats|villa|villas|township|colony|jda|approved)\b/;

export function classifySearchIntent(query: string): SearchIntent {
  const q = query.toLowerCase().trim();
  if (BRAND.test(q)) return "BRAND";
  if (INFORMATIONAL.test(q)) return "INFORMATIONAL";
  if (TRANSACTIONAL.test(q)) return "TRANSACTIONAL";
  if (COMMERCIAL.test(q)) return "COMMERCIAL";
  return "OTHER";
}

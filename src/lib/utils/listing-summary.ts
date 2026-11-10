/**
 * Describes where Ratiwal Dream Estates operates, derived from the saved
 * Location records in MongoDB. The business deals in every property type in every
 * saved location, so SEO copy follows the saved locations and updates
 * automatically when a location is added, edited or unpublished in the dashboard.
 *
 * Locations are ranked by how many published properties they hold (most first),
 * with ties kept in dashboard order. This puts the main market first in titles,
 * where space is limited.
 *
 * Pure function (no I/O).
 */
export interface ListingSummary {
  /** Saved location names, ranked by listings then dashboard order. */
  cities: string[];
  /** "Jaipur, Ajmer & Navi Mumbai" ("" when no location is saved). */
  cityLabel: string;
  /** Distinct states of the saved locations. */
  states: string[];
  /** "Rajasthan & Maharashtra" ("" when no location is saved). */
  stateLabel: string;
  /** Property types the business deals in. Not limited to current inventory. */
  typeLabel: string;
}

/** Wording for the property types the business deals in (owner-confirmed). */
export const DEALT_PROPERTY_TYPES_LABEL = "Residential & Commercial Plots";

/** "A" · "A & B" · "A, B & C" */
export function joinList(items: string[]): string {
  if (items.length <= 1) return items[0] ?? "";
  return `${items.slice(0, -1).join(", ")} & ${items[items.length - 1]}`;
}

/**
 * First `n` names, then "& More" if there are others: "Jaipur, Ajmer & More".
 * Used in <title>, where space is limited.
 */
export function titleCities(cities: string[], n: number): string {
  if (cities.length <= n) return joinList(cities);
  return `${cities.slice(0, n).join(", ")} & More`;
}

/**
 * As many names as fit in `maxChars`, then "& More" if some were dropped.
 * Used in meta descriptions.
 */
export function fitCities(cities: string[], maxChars: number): string {
  for (let n = cities.length; n >= 1; n--) {
    const label = n === cities.length ? joinList(cities) : `${cities.slice(0, n).join(", ")} & More`;
    if (label.length <= maxChars) return label;
  }
  return cities[0] ?? "";
}

function unique(values: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const raw of values) {
    const value = raw?.trim();
    if (!value) continue;
    const key = value.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(value);
  }
  return out;
}

export function summarizeLocations(
  locations: { name: string; state: string }[],
  properties: { city?: string }[] = []
): ListingSummary {
  const counts = new Map<string, number>();
  for (const p of properties) {
    const key = p.city?.trim().toLowerCase();
    if (key) counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  const ranked = unique(locations.map((l) => l.name))
    .map((name, index) => ({ name, index, count: counts.get(name.toLowerCase()) ?? 0 }))
    .sort((a, b) => b.count - a.count || a.index - b.index)
    .map((x) => x.name);

  // "Rajasthan / NCR" -> "Rajasthan"
  const states = unique(locations.map((l) => (l.state ?? "").split("/")[0]));

  return {
    cities: ranked,
    cityLabel: joinList(ranked),
    states,
    stateLabel: joinList(states),
    typeLabel: DEALT_PROPERTY_TYPES_LABEL,
  };
}

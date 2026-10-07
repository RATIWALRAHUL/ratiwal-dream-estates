import type { Property } from "@/types/property";
import type { Location } from "@/types/location";

/**
 * Pure array-filtering logic (no I/O) extracted from the old static
 * src/data/locations.ts so client components can still use it once
 * properties/locations are fetched from the DB by their parent server page.
 */
export function getPropertiesForLocation(allProperties: Property[], locationName: string): Property[] {
  const normalized = locationName.toLowerCase().trim();
  return allProperties.filter((prop) => {
    const cityMatch = prop.city.toLowerCase().trim() === normalized;
    const locationFieldMatch = prop.location.toLowerCase().includes(normalized);
    // Special handling for Panvel / Navi Mumbai cross-linking
    const panvelNaviMumbaiMatch =
      (normalized === "panvel" && prop.city.toLowerCase().includes("navi mumbai")) ||
      (normalized === "navi mumbai" && prop.location.toLowerCase().includes("panvel"));
    return cityMatch || locationFieldMatch || panvelNaviMumbaiMatch;
  });
}

export function getLocationSummaryStats(allProperties: Property[], location: Location) {
  const matchedProperties = getPropertiesForLocation(allProperties, location.name);
  const propertyCount = matchedProperties.length;
  const propertyTypes = Array.from(new Set(matchedProperties.map((p) => p.propertyType)));

  return {
    propertyCount,
    propertyTypes: propertyTypes.length > 0 ? propertyTypes : location.propertyTypes,
    hasActiveProperties: propertyCount > 0,
  };
}

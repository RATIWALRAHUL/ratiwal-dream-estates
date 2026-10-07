/**
 * Shared label maps for converting DB enum values (Property/Location/PlotOption
 * models) into the human-readable strings the public-site static Property/Location
 * TypeScript shapes (src/types/property.ts, src/types/location.ts) expect.
 */
import type {
  PropertyType,
  ListingStatus,
  PlotFacing,
  PlotStatus,
  DocumentType,
  VerificationStatus,
} from "@/types/database";
import type { PropertyStatus, PropertyDocumentItem, PlotOption } from "@/types/property";

export const PROPERTY_TYPE_LABELS: Record<PropertyType, string> = {
  RESIDENTIAL_PLOT: "Residential Plot",
  COMMERCIAL_PLOT: "Commercial Plot",
  INDUSTRIAL_PLOT: "Industrial Plot",
  FARM_LAND: "Farm Land",
  VILLA: "Villa",
  APARTMENT: "Apartment",
  OTHER: "Other",
};

export function pluralizePropertyTypeLabel(type: PropertyType): string {
  return `${PROPERTY_TYPE_LABELS[type]}s`;
}

export const LISTING_STATUS_LABELS: Record<ListingStatus, PropertyStatus> = {
  AVAILABLE: "Available",
  LIMITED: "Limited",
  RESERVED: "Reserved",
  SOLD: "Sold Out",
  UNAVAILABLE: "Unavailable",
};

export const PLOT_FACING_LABELS: Record<PlotFacing, PlotOption["facing"]> = {
  NORTH: "North",
  EAST: "East",
  NORTH_EAST: "North-East",
  WEST: "West",
  SOUTH: "South",
  DUAL_ROAD_FRONTAGE: "Dual Road Frontage",
  OTHER: "Other",
};

export const PLOT_STATUS_LABELS: Record<PlotStatus, PlotOption["status"]> = {
  AVAILABLE: "Available",
  RESERVED: "Reserved",
  SOLD: "Sold",
  ON_REQUEST: "On Request",
  UNAVAILABLE: "Unavailable",
};

export const DOCUMENT_TYPE_LABELS: Record<DocumentType, string> = {
  BROCHURE: "Brochure",
  MASTERPLAN: "Masterplan",
  RERA_CERTIFICATE: "RERA Certificate",
  TITLE_DOCUMENT: "Title Document",
  APPROVAL: "Approval",
  PRICE_SHEET: "Price Sheet",
  OTHER: "Other",
};

export const DOCUMENT_VERIFICATION_STATUS_LABELS: Record<VerificationStatus, PropertyDocumentItem["status"]> = {
  UNVERIFIED: "Requested",
  UNDER_REVIEW: "Verification in Progress",
  VERIFIED: "Reviewed",
  REJECTED: "Not Applicable",
  EXPIRED: "Not Applicable",
};

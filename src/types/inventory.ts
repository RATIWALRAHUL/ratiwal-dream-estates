/**
 * @file inventory.ts
 * @description Strongly typed definitions for PRD 11:
 * Property Inventory, Units, Availability & Pricing Management.
 */

// ─── Inventory Modes ─────────────────────────────────────────────────────────

export const INVENTORY_MODES = [
  "SINGLE_LISTING",
  "MULTI_UNIT_PROJECT",
  "PLOT_INVENTORY",
  "COMMERCIAL_INVENTORY",
  "MIXED_INVENTORY",
] as const;

export type InventoryMode = (typeof INVENTORY_MODES)[number];

// ─── Unit Categories ─────────────────────────────────────────────────────────

export const UNIT_CATEGORIES = [
  "APARTMENT",
  "PENTHOUSE",
  "STUDIO",
  "VILLA",
  "INDEPENDENT_FLOOR",
  "RESIDENTIAL_PLOT",
  "COMMERCIAL_PLOT",
  "SHOP",
  "OFFICE",
  "SHOWROOM",
  "WAREHOUSE",
  "OTHER",
] as const;

export type UnitCategory = (typeof UNIT_CATEGORIES)[number];

// ─── Unit Configurations ─────────────────────────────────────────────────────

export const UNIT_CONFIGURATIONS = [
  "1BHK",
  "2BHK",
  "3BHK",
  "4BHK",
  "5BHK",
  "STUDIO",
  "DUPLEX",
  "PENTHOUSE",
  "VILLA",
  "PLOT",
  "RETAIL_SHOP",
  "OFFICE_SPACE",
  "SHOWROOM_SPACE",
  "OTHER",
] as const;

export type UnitConfiguration = (typeof UNIT_CONFIGURATIONS)[number];

// ─── Unit Statuses ───────────────────────────────────────────────────────────

export const UNIT_STATUSES = [
  "DRAFT",
  "AVAILABLE",
  "ON_HOLD",
  "RESERVED",
  "BOOKED",
  "SOLD",
  "BLOCKED",
  "UNAVAILABLE",
  "ARCHIVED",
] as const;

export type UnitStatus = (typeof UNIT_STATUSES)[number];

// ─── Unit Visibilities ───────────────────────────────────────────────────────

export const UNIT_VISIBILITIES = [
  "INTERNAL_ONLY",
  "PUBLIC_SUMMARY",
  "PUBLIC_DETAIL",
  "HIDDEN",
] as const;

export type UnitVisibility = (typeof UNIT_VISIBILITIES)[number];

// ─── Area Measurement Units ─────────────────────────────────────────────────

export const AREA_UNITS = ["SQ_FT", "SQ_YD", "SQ_M"] as const;
export type AreaUnit = (typeof AREA_UNITS)[number];

// ─── Facing Directions & View Types ──────────────────────────────────────────

export const FACING_DIRECTIONS = [
  "NORTH",
  "SOUTH",
  "EAST",
  "WEST",
  "NORTH_EAST",
  "NORTH_WEST",
  "SOUTH_EAST",
  "SOUTH_WEST",
] as const;

export type FacingDirection = (typeof FACING_DIRECTIONS)[number];

export const VIEW_TYPES = [
  "GARDEN",
  "PARK",
  "ROAD",
  "CLUBHOUSE",
  "CORNER",
  "POOL",
  "MAIN_ROAD",
  "INTERNAL_ROAD",
  "OPEN",
  "OTHER",
] as const;

export type ViewType = (typeof VIEW_TYPES)[number];

export const FURNISHING_STATUSES = [
  "UNFURNISHED",
  "SEMI_FURNISHED",
  "FULLY_FURNISHED",
  "BARE_SHELL",
] as const;

export type FurnishingStatus = (typeof FURNISHING_STATUSES)[number];

// ─── Transition Policy Matrix ────────────────────────────────────────────────

export const PERMITTED_STATUS_TRANSITIONS: Record<UnitStatus, UnitStatus[]> = {
  DRAFT: ["AVAILABLE", "ARCHIVED"],
  AVAILABLE: ["ON_HOLD", "BLOCKED", "UNAVAILABLE", "ARCHIVED"],
  ON_HOLD: ["AVAILABLE", "RESERVED", "BLOCKED", "UNAVAILABLE", "ARCHIVED"],
  RESERVED: ["BOOKED", "AVAILABLE", "ON_HOLD", "ARCHIVED"],
  BOOKED: ["SOLD", "AVAILABLE", "RESERVED", "ARCHIVED"],
  SOLD: ["AVAILABLE", "ARCHIVED"], // Reversal workflow only
  BLOCKED: ["AVAILABLE", "UNAVAILABLE", "ARCHIVED"],
  UNAVAILABLE: ["AVAILABLE", "BLOCKED", "ARCHIVED"],
  ARCHIVED: ["DRAFT", "AVAILABLE"],
};

export function isValidStatusTransition(from: UnitStatus, to: UnitStatus): boolean {
  if (from === to) return true;
  const allowed = PERMITTED_STATUS_TRANSITIONS[from];
  return allowed ? allowed.includes(to) : false;
}

// ─── Client / Data Transfer Interfaces ────────────────────────────────────────

export interface InventoryUnitSummary {
  _id: string;
  propertyId: string;
  propertyName?: string;
  referenceCode: string;
  inventoryKey: string;
  phaseName?: string;
  towerBlockSector?: string;
  floorLevel?: string;
  unitNumber: string;
  unitCategory: UnitCategory;
  configuration: UnitConfiguration;
  status: UnitStatus;
  visibility: UnitVisibility;
  areaSqFt: number;
  areaSqYd?: number;
  basePricePaise?: number;
  basePriceRupees?: number | null;
  displayPricePaise?: number;
  displayPriceRupees?: number | null;
  priceOnRequest: boolean;
  cornerUnit: boolean;
  facing?: FacingDirection;
  version: number;
  updatedAt: string;
  createdAt: string;
}

export interface InventoryFilterParams {
  propertyId?: string;
  phaseName?: string;
  towerBlockSector?: string;
  floorLevel?: string;
  category?: UnitCategory | "ALL";
  configuration?: UnitConfiguration | "ALL";
  status?: UnitStatus | "ALL";
  visibility?: UnitVisibility | "ALL";
  minPricePaise?: number;
  maxPricePaise?: number;
  minAreaSqFt?: number;
  maxAreaSqFt?: number;
  search?: string;
  page?: number;
  perPage?: number;
  sortBy?: "unitNumber" | "basePricePaise" | "areaSqFt" | "createdAt" | "status";
  sortOrder?: "asc" | "desc";
}

export interface InventoryAvailabilitySummary {
  propertyId: string;
  propertyName: string;
  inventoryMode: InventoryMode;
  totalUnits: number;
  availableCount: number;
  onHoldCount: number;
  reservedCount: number;
  bookedCount: number;
  soldCount: number;
  blockedCount: number;
  unavailableCount: number;
  archivedCount: number;
  publiclyVisibleCount: number;
  startingPricePaise?: number;
  startingPriceRupees?: number | null;
  areaRangeSqFt: { min: number; max: number };
  configurationBreakdown: { configuration: UnitConfiguration; count: number; available: number }[];
  updatedAt: string;
}

export interface InventoryMatrixCell {
  unitId: string;
  unitNumber: string;
  referenceCode: string;
  configuration: UnitConfiguration;
  category: UnitCategory;
  status: UnitStatus;
  visibility: UnitVisibility;
  displayPriceRupees?: number | null;
  priceOnRequest: boolean;
  areaSqFt: number;
  version: number;
}

export interface InventoryMatrixFloor {
  floorLevel: string;
  units: InventoryMatrixCell[];
}

export interface InventoryMatrixTower {
  towerBlockSector: string;
  floors: InventoryMatrixFloor[];
}

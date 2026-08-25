import type { Types } from "mongoose";

/**
 * Publication Status
 */
export const PublicationStatusEnum = ["DRAFT", "REVIEW", "PUBLISHED", "ARCHIVED"] as const;
export type PublicationStatus = (typeof PublicationStatusEnum)[number];

/**
 * Supported Property Types
 */
export const PropertyTypeEnum = [
  "RESIDENTIAL_PLOT",
  "COMMERCIAL_PLOT",
  "INDUSTRIAL_PLOT",
  "FARM_LAND",
  "VILLA",
  "APARTMENT",
  "OTHER",
] as const;
export type PropertyType = (typeof PropertyTypeEnum)[number];

/**
 * Listing Availability Status
 */
export const ListingStatusEnum = [
  "AVAILABLE",
  "LIMITED",
  "RESERVED",
  "SOLD",
  "UNAVAILABLE",
] as const;
export type ListingStatus = (typeof ListingStatusEnum)[number];

/**
 * Due Diligence Verification Status
 */
export const VerificationStatusEnum = [
  "UNVERIFIED",
  "UNDER_REVIEW",
  "VERIFIED",
  "REJECTED",
  "EXPIRED",
] as const;
export type VerificationStatus = (typeof VerificationStatusEnum)[number];

/**
 * Property Source Classification
 */
export const SourceTypeEnum = [
  "DIRECT_LANDOWNER",
  "DEVELOPER",
  "AUTHORIZED_CHANNEL_PARTNER",
  "INTERNAL",
  "OTHER",
] as const;
export type SourceType = (typeof SourceTypeEnum)[number];

/**
 * Price Display Visibility
 */
export const PriceVisibilityEnum = ["PUBLIC", "ON_REQUEST"] as const;
export type PriceVisibility = (typeof PriceVisibilityEnum)[number];

/**
 * Plot Availability Status
 */
export const PlotStatusEnum = [
  "AVAILABLE",
  "RESERVED",
  "SOLD",
  "ON_REQUEST",
  "UNAVAILABLE",
] as const;
export type PlotStatus = (typeof PlotStatusEnum)[number];

/**
 * Plot Facing Directions
 */
export const PlotFacingEnum = [
  "NORTH",
  "EAST",
  "NORTH_EAST",
  "WEST",
  "SOUTH",
  "DUAL_ROAD_FRONTAGE",
  "OTHER",
] as const;
export type PlotFacing = (typeof PlotFacingEnum)[number];

/**
 * Media Types
 */
export const MediaTypeEnum = ["IMAGE", "VIDEO"] as const;
export type MediaType = (typeof MediaTypeEnum)[number];

/**
 * Document Classification Types
 */
export const DocumentTypeEnum = [
  "BROCHURE",
  "MASTERPLAN",
  "RERA_CERTIFICATE",
  "TITLE_DOCUMENT",
  "APPROVAL",
  "PRICE_SHEET",
  "OTHER",
] as const;
export type DocumentType = (typeof DocumentTypeEnum)[number];

/**
 * Document Access Visibility
 */
export const DocumentVisibilityEnum = ["PUBLIC", "PRIVATE", "INTERNAL"] as const;
export type DocumentVisibility = (typeof DocumentVisibilityEnum)[number];

/**
 * RERA Registration Status
 */
export const ReraStatusEnum = [
  "NOT_APPLICABLE",
  "PENDING_VERIFICATION",
  "VERIFIED",
  "EXPIRED",
  "REJECTED",
] as const;
export type ReraStatus = (typeof ReraStatusEnum)[number];

/**
 * Micro-Market Classification Types
 */
export const MicroMarketTypeEnum = [
  "RESIDENTIAL_CORRIDOR",
  "COMMERCIAL_HUB",
  "INDUSTRIAL_BELT",
  "AIRPORT_CORRIDOR",
  "HIGHWAY_CORRIDOR",
  "TOWNSHIP_CLUSTER",
  "MIXED_USE",
  "OTHER",
] as const;
export type MicroMarketType = (typeof MicroMarketTypeEnum)[number];

/**
 * Infrastructure Status Types
 */
export const InfrastructureStatusEnum = [
  "OPERATIONAL",
  "UNDER_CONSTRUCTION",
  "APPROVED",
  "PROPOSED",
  "DELAYED",
  "UNKNOWN",
] as const;
export type InfrastructureStatus = (typeof InfrastructureStatusEnum)[number];

/**
 * Market Intelligence Observation Metric Types
 */
export const MarketObservationMetricTypeEnum = [
  "AVERAGE_ASKING_RATE",
  "MIN_OBSERVED_RATE",
  "MAX_OBSERVED_RATE",
  "RATE_PER_SQ_FT",
  "RATE_PER_SQ_YD",
  "PERIOD_CHANGE_PERCENT",
  "INVENTORY_LEVEL",
  "DEVELOPMENT_ACTIVITY",
  "INVESTOR_INTEREST",
] as const;
export type MarketObservationMetricType = (typeof MarketObservationMetricTypeEnum)[number];

/**
 * Market Intelligence Source Types
 */
export const MarketObservationSourceTypeEnum = [
  "GOVERNMENT",
  "RERA",
  "DEVELOPER_DOCUMENT",
  "REGISTERED_MARKET_REPORT",
  "INTERNAL_RESEARCH",
  "OTHER",
] as const;
export type MarketObservationSourceType = (typeof MarketObservationSourceTypeEnum)[number];

/**
 * Market Intelligence Verification Types
 */
export const MarketObservationVerificationEnum = [
  "UNVERIFIED",
  "VERIFIED",
  "INTERNAL_ESTIMATE",
  "REJECTED",
] as const;
export type MarketObservationVerification = (typeof MarketObservationVerificationEnum)[number];

/* ==========================================================================
   Subdocument Interfaces
   ========================================================================== */

export interface ISeoMetadata {
  metaTitle: string;
  metaDescription: string;
  canonicalUrl?: string;
  ogImageUrl?: string;
  noIndex?: boolean;
  noFollow?: boolean;
}

export interface IMediaItem {
  _id?: Types.ObjectId;
  type: MediaType;
  url: string;
  storagePublicId?: string;
  provider?: string;
  altText: string;
  caption?: string;
  width?: number;
  height?: number;
  sortOrder: number;
  isPrimary: boolean;
  publicationStatus: "ACTIVE" | "ARCHIVED";
}

export interface IDocumentItem {
  _id?: Types.ObjectId;
  type: DocumentType;
  title: string;
  fileUrl?: string;
  storagePublicId?: string;
  mimeType?: string;
  sizeBytes?: number;
  version?: string;
  visibility: DocumentVisibility;
  verificationStatus: VerificationStatus;
  lastVerifiedAt?: Date;
  uploadedAt?: Date;
}

export interface IReraInfo {
  applicable: boolean;
  registrationNumber?: string;
  authorityName?: string;
  authorityUrl?: string;
  status: ReraStatus;
  lastVerifiedAt?: Date;
  notes?: string; // Internal non-public notes
}

export interface IInfrastructureMilestone {
  _id?: Types.ObjectId;
  name: string;
  title?: string;
  category: string;
  status: string;
  description: string;
  distanceKm?: number;
  expectedCompletionDate?: string;
  source: string;
  sourceUrl?: string;
  sourceDate?: Date;
  lastVerifiedAt?: Date;
  isPublic?: boolean;
  sortOrder?: number;
}

export interface IConnectivityMilestone {
  _id?: Types.ObjectId;
  destination: string;
  destinationCategory?: string;
  distanceKm: number;
  approxTravelTime: string;
  travelMode: string;
  route: string;
  supportingNote?: string;
  source?: string;
  lastVerifiedAt?: Date;
  isPublic?: boolean;
  sortOrder?: number;
}

export interface IAmenityItem {
  _id?: Types.ObjectId;
  name: string;
  category: string;
  status: "Available" | "Under Development" | "Planned";
  description?: string;
}

export interface IPricingInfo {
  currency: "INR";
  priceVisibility: PriceVisibility;
  startingPricePaise?: number; // Integer paise
  maximumPricePaise?: number; // Integer paise
  ratePaisePerSqFt?: number; // Integer paise
  additionalPricingNotes?: string;
}

export interface IAreaInfo {
  minimumAreaSqFt: number;
  maximumAreaSqFt: number;
  displayUnitPreference: "SQ_FT" | "SQ_YD";
}

export interface IMicroMarket {
  _id?: Types.ObjectId;
  name: string;
  slug?: string;
  tagline?: string;
  description: string;
  propertyTypes: string[];
  connectivityContext?: string;
  highlights: string[];
  regulatoryAuthority?: string;
  relevantPropertySlugs?: string[];
  marketType?: MicroMarketType;
  featured?: boolean;
  sortOrder?: number;
  isPublic?: boolean;
  lastVerifiedAt?: Date;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  sourceReferences?: string[];
}

export interface IMarketObservation {
  _id?: Types.ObjectId;
  metricType: MarketObservationMetricType | string;
  numericValue: number; // Stored in integer paise for rates, percentage, or index number
  canonicalUnit: string; // e.g. "PAISE_PER_SQ_FT", "PERCENTAGE", "UNITS", "SCORE"
  observationPeriod: string; // e.g. "Q1 2026", "2025-H2"
  sourceName: string;
  sourceUrl?: string;
  sourceType: MarketObservationSourceType;
  verificationStatus: MarketObservationVerification;
  verifiedBy?: string;
  verifiedAt?: Date;
  isPublic: boolean;
  internalNotes?: string;
  createdAt?: Date;
}

export interface IBuyerConsideration {
  _id?: Types.ObjectId;
  title: string;
  category: string;
  description: string;
  importance: string;
}

export interface IFaqItem {
  _id?: Types.ObjectId;
  question: string;
  answer: string;
}

export interface IAdditionalCharge {
  _id?: Types.ObjectId;
  name: string;
  chargePaise: number;
  isOptional: boolean;
  notes?: string;
}

/* ==========================================================================
   Primary Model Interfaces
   ========================================================================== */

export interface ILocation {
  _id?: Types.ObjectId;
  name: string;
  slug: string;
  city: string;
  state: string;
  country: string;
  region?: string;
  tagline?: string;
  shortDescription: string;
  longDescription?: string;
  heroImage?: {
    url: string;
    storagePublicId?: string;
    altText?: string;
    caption?: string;
    width?: number;
    height?: number;
  };
  coordinates?: {
    latitude: number;
    longitude: number;
    geoJson?: {
      type: "Point";
      coordinates: [number, number]; // [longitude, latitude]
    };
    isVerified?: boolean;
    source?: string;
    verifiedAt?: Date;
  };
  microMarkets: IMicroMarket[];
  infrastructureHighlights: IInfrastructureMilestone[];
  connectivityHighlights: IConnectivityMilestone[];
  marketObservations: IMarketObservation[];
  buyerConsiderations: IBuyerConsideration[];
  faq: IFaqItem[];
  supportedPropertyTypes: PropertyType[];
  publicationStatus: PublicationStatus;
  featured: boolean;
  sortOrder: number;
  version: number;
  submittedForReviewAt?: Date;
  reviewedAt?: Date;
  publishedAt?: Date;
  archivedAt?: Date;
  lastVerifiedAt?: Date;
  reviewReason?: string;
  archiveReason?: string;
  verificationStatus?: VerificationStatus;
  verifiedBy?: string;
  verificationNotes?: string;
  nextReviewDate?: Date;
  seo: ISeoMetadata;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IProperty {
  _id?: Types.ObjectId;
  title: string;
  slug: string;
  shortDescription: string;
  fullDescription: string;
  propertyType: PropertyType;
  inventoryMode?: "SINGLE_LISTING" | "MULTI_UNIT_PROJECT" | "PLOT_INVENTORY" | "COMMERCIAL_INVENTORY" | "MIXED_INVENTORY";
  listingStatus: ListingStatus;
  publicationStatus: PublicationStatus;
  verificationStatus: VerificationStatus;
  locationId: Types.ObjectId;
  locality?: string;
  address?: string;
  sourceType: SourceType;
  developerOrOwnerName?: string;
  featured: boolean;
  sortOrder: number;

  pricing: IPricingInfo;
  area: IAreaInfo;

  highlights: string[];
  amenities: IAmenityItem[];
  infrastructureMilestones: IInfrastructureMilestone[];
  connectivityMilestones: IConnectivityMilestone[];
  possessionOrDevelopmentStatus?: string;
  virtualTourUrl?: string;

  brochure?: {
    title: string;
    fileUrl: string;
    mimeType?: string;
    sizeBytes?: number;
    version?: string;
    lastUpdated?: Date;
  };

  masterplan?: {
    title: string;
    fileUrl: string;
    imageUrl?: string;
    approvalAuthority?: string;
    version?: string;
  };

  rera: IReraInfo;
  media: IMediaItem[];
  documents: IDocumentItem[];

  publishedAt?: Date;
  archivedAt?: Date;
  lastVerifiedAt?: Date;
  seo: ISeoMetadata;
  createdAt?: Date;
  updatedAt?: Date;

  // Virtual helper types
  minimumAreaSqYd?: number;
  maximumAreaSqYd?: number;
  startingPriceRupees?: number | null;
  maximumPriceRupees?: number | null;
  rateRupeesPerSqFt?: number | null;
}

export interface IPlotOption {
  _id?: Types.ObjectId;
  propertyId: Types.ObjectId;
  plotNumber?: string;
  label?: string;
  widthFeet?: number;
  lengthFeet?: number;
  areaSqFt: number;
  ratePaisePerSqFt?: number;
  basePricePaise?: number;
  additionalCharges: IAdditionalCharge[];
  facing?: PlotFacing;
  cornerPlot: boolean;
  status: PlotStatus;
  publiclyVisible: boolean;
  sortOrder: number;
  lastVerifiedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;

  // Virtual helper types
  areaSqYd?: number;
  basePriceRupees?: number | null;
  rateRupeesPerSqFt?: number | null;
}

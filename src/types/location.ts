export type InfrastructureStatus =
  | "Operational"
  | "Under construction"
  | "Approved"
  | "Proposed"
  | "Status unverified";

export type InfrastructureCategory =
  | "Highway & Expressways"
  | "Airport & Aviation"
  | "Rail & Metro"
  | "Industrial & Logistics"
  | "Urban Master Planning";

export interface InfrastructureItem {
  id: string;
  name: string;
  category: InfrastructureCategory;
  status: InfrastructureStatus;
  description: string;
  source: string;
  sourceUrl?: string;
  lastVerifiedAt: string;
}

export interface ConnectivityItem {
  destination: string;
  distanceKm: number;
  approxTravelTime: string;
  travelMode: "Drive / Highway" | "Transit / Rail" | "Flight / Airport";
  route: string;
  lastVerifiedAt: string;
}

export interface MicroMarket {
  id: string;
  name: string;
  tagline: string;
  description: string;
  propertyTypes: string[];
  connectivityContext: string;
  highlights: string[];
  regulatoryAuthority: string;
  relevantPropertySlugs: string[];
}

export interface BuyerConsideration {
  title: string;
  category: "Title & Documentation" | "Zoning & Land Use" | "Access & Infrastructure" | "Statutory Approvals" | "Regulatory Verification";
  description: string;
  importance: "Mandatory Due Diligence" | "Strategic Advantage" | "Regulatory Verification";
}

export interface VerifiedMarketData {
  priceRangePerSqYd?: string;
  commercialRangePerSqFt?: string;
  dominantPlotSizes: string[];
  activeGrowthCorridors: string[];
  documentationStandard: string;
  sourceNote: string;
  sourceUrl?: string;
  lastVerifiedAt: string;
  historicalDataPoints?: Array<{
    year: string;
    pricePerSqYd: number;
    label: string;
  }>;
}

export interface FAQItem {
  question: string;
  answer: string;
}

export interface SourceReference {
  label: string;
  url?: string;
  publisher: string;
  verifiedAt: string;
}

export interface Location {
  id: string;
  slug: string;
  name: string;
  state: string;
  region: string;
  tagline: string;
  shortDescription: string;
  longDescription: string;
  heroImage: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  featured: boolean;
  propertyTypes: string[];
  microMarkets: MicroMarket[];
  infrastructure: InfrastructureItem[];
  connectivity: ConnectivityItem[];
  buyerConsiderations: BuyerConsideration[];
  marketData?: VerifiedMarketData;
  faq: FAQItem[];
  sourceReferences?: SourceReference[];
  lastVerifiedAt: string;
}

export type PropertyType = "Residential Plot" | "Commercial Plot";
export type PropertyStatus = "Available" | "Sold Out" | "Upcoming" | "Limited";

export interface PlotOption {
  id: string;
  label: string;
  plotNumber?: string;
  widthFt: number;
  lengthFt: number;
  areaSqYd: number;
  areaSqFt: number;
  ratePerSqYd: number;
  basePriceLabel: string;
  facing: "North" | "East" | "North-East" | "West" | "South" | "Dual Road Frontage";
  isCorner: boolean;
  status: "Available" | "Limited" | "Reserved";
}

export interface PropertyAmenity {
  name: string;
  category: "Roads & Access" | "Utilities & Power" | "Security & Safety" | "Greenery & Leisure" | "Infrastructure";
  status: "Available" | "Under Development" | "Planned";
  description?: string;
}

export interface PropertyDocumentItem {
  name: string;
  type: string;
  status: "Available" | "Reviewed" | "Requested" | "Verification in Progress" | "Not Applicable";
  publicFileUrl?: string;
  description: string;
}

export interface MasterplanInfo {
  title: string;
  imageUrl: string;
  fileUrl: string;
  fileSize: string;
  version: string;
  approvalAuthority: string;
}

export interface BrochureInfo {
  title: string;
  fileUrl: string;
  fileSize: string;
  fileType: "PDF";
  lastUpdated: string;
}

export interface ReraInfo {
  reraNumber: string;
  authorityName: string;
  registrationStatus: "Registered & Verified" | "Exempted / Pre-RERA" | "Registration in Progress";
  portalUrl: string;
}

export interface PropertyCoordinates {
  latitude: number;
  longitude: number;
}

export interface Property {
  id: string;
  slug: string;
  name: string;
  shortDescription: string;
  description: string;
  location: string; // Specific area, e.g. "Ajmer Road"
  city: string; // e.g. "Jaipur"
  state: string; // e.g. "Rajasthan"
  propertyType: PropertyType;
  plotSizes: string[]; // e.g. ["100 Sq. Yds", "200 Sq. Yds"]
  priceLabel: string; // e.g. "₹28.5 Lakhs Onwards"
  images: string[];
  highlights: string[];
  connectivity: string[];
  nearbyLandmarks: string[];
  futureDevelopment?: string[];
  approvalAuthority?: string; // e.g. "JDA", "ADA", "MMRDA"
  approvalDetails?: string; // Approval or RERA registry numbers (if verified)
  documentation?: string[]; // Required paperwork, certificates
  investmentPerspective?: string; // Rationale for investment
  featured: boolean;
  status: PropertyStatus;
  createdAt: string;
  updatedAt: string;

  // Rich Structured Data Enhancements
  coordinates?: PropertyCoordinates;
  plotOptions?: PlotOption[];
  amenitiesList?: PropertyAmenity[];
  documentsList?: PropertyDocumentItem[];
  masterplan?: MasterplanInfo;
  brochure?: BrochureInfo;
  reraInfo?: ReraInfo;
  possessionTimeline?: string;
  totalTownshipArea?: string;
}

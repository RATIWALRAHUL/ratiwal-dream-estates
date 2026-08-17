export type PropertyType = "Residential Plot" | "Commercial Plot";
export type PropertyStatus = "Available" | "Sold Out" | "Upcoming";

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
  priceLabel: string; // e.g. "Price on Request"
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
}

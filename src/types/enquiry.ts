import { PropertyType } from "./property";

export interface EnquiryInput {
  name: string;
  phone: string;
  email: string;
  preferredLocation: string;
  propertyType: PropertyType | "Any";
  budget: string;
  message: string;
  propertyId?: string;
  propertySlug?: string;
  honeypot?: string; // Hidden anti-spam honeypot
}

export interface SiteVisitInput {
  name: string;
  phone: string;
  email: string;
  propertyId: string;
  propertyName: string;
  preferredDate: string;
  preferredTime: string;
  numberOfVisitors: number;
  message?: string;
  honeypot?: string; // Hidden anti-spam honeypot
}

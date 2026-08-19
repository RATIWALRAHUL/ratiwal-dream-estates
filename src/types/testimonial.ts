export interface ConsentScope {
  showName: boolean;
  showPhoto: boolean;
  showLocation: boolean;
  showProperty: boolean;
  showVideo: boolean;
}

export type TestimonialSourceType = "direct" | "written" | "google" | "video" | "other";

export interface Testimonial {
  id: string;
  quote: string;
  clientDisplayName: string;
  clientType?: string;
  city?: string;
  state?: string;
  propertyType?: string;
  relatedPropertySlug?: string;
  relatedLocationSlug?: string;
  rating?: number;
  reviewDate?: string;
  sourceType: TestimonialSourceType;
  sourceUrl?: string;
  verified: boolean;
  verificationMethod?: string;
  clientConsent: boolean;
  consentScope: ConsentScope;
  avatar?: string;
  featured?: boolean;
}

export interface EvidenceReference {
  type: "written-consent" | "transaction-record" | "site-visit" | "review-source" | "other";
  label: string;
  internalReference?: string;
  publicUrl?: string;
}

export interface CaseStudy {
  slug: string;
  title: string;
  tagline: string;
  summary: string;
  clientDisplayName: string;
  clientProfile: string;
  location: string;
  propertyType: string;
  objective: string;
  challenge: string;
  advisoryApproach: string[];
  verificationSteps: string[];
  outcome: string;
  timeframe: string;
  clientQuote?: string;
  relatedPropertySlug?: string;
  relatedLocationSlug?: string;
  heroImage: string;
  evidence?: EvidenceReference[];
  clientConsent: boolean;
  published: boolean;
  lastReviewedAt: string;
}

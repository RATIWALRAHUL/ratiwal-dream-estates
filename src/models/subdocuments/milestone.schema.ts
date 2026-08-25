import { Schema } from "mongoose";
import type {
  IInfrastructureMilestone,
  IConnectivityMilestone,
  IAmenityItem,
  IMicroMarket,
  IBuyerConsideration,
  IFaqItem,
  IMarketObservation,
} from "@/types/database";
import {
  MicroMarketTypeEnum,
  InfrastructureStatusEnum,
  MarketObservationMetricTypeEnum,
  MarketObservationSourceTypeEnum,
  MarketObservationVerificationEnum,
} from "@/types/database";
import { isValidHttpUrl } from "@/lib/utils/url";

export const InfrastructureMilestoneSchema = new Schema<IInfrastructureMilestone>(
  {
    name: {
      type: String,
      required: [true, "Infrastructure milestone name is required"],
      trim: true,
    },
    title: {
      type: String,
      trim: true,
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      trim: true,
    },
    status: {
      type: String,
      enum: InfrastructureStatusEnum,
      required: [true, "Status is required"],
      default: "OPERATIONAL",
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
    },
    distanceKm: {
      type: Number,
      min: [0, "Distance cannot be negative"],
    },
    expectedCompletionDate: {
      type: String,
      trim: true,
    },
    source: {
      type: String,
      required: [true, "Data source is required"],
      trim: true,
    },
    sourceUrl: {
      type: String,
      trim: true,
      validate: {
        validator: (v: string) => !v || isValidHttpUrl(v),
        message: "Source URL must be a valid HTTP or HTTPS URL",
      },
    },
    sourceDate: {
      type: Date,
    },
    lastVerifiedAt: {
      type: Date,
    },
    isPublic: {
      type: Boolean,
      default: true,
    },
    sortOrder: {
      type: Number,
      default: 0,
    },
  },
  { _id: true }
);

export const ConnectivityMilestoneSchema = new Schema<IConnectivityMilestone>(
  {
    destination: {
      type: String,
      required: [true, "Destination landmark is required"],
      trim: true,
    },
    destinationCategory: {
      type: String,
      trim: true,
    },
    distanceKm: {
      type: Number,
      required: [true, "Distance in kilometers is required"],
      min: [0, "Distance cannot be negative"],
    },
    approxTravelTime: {
      type: String,
      required: [true, "Travel time estimate is required"],
      trim: true,
    },
    travelMode: {
      type: String,
      required: [true, "Travel mode is required"],
      trim: true,
    },
    route: {
      type: String,
      required: [true, "Route or corridor name is required"],
      trim: true,
    },
    supportingNote: {
      type: String,
      trim: true,
    },
    source: {
      type: String,
      trim: true,
    },
    lastVerifiedAt: {
      type: Date,
    },
    isPublic: {
      type: Boolean,
      default: true,
    },
    sortOrder: {
      type: Number,
      default: 0,
    },
  },
  { _id: true }
);

export const AmenitySchema = new Schema<IAmenityItem>(
  {
    name: {
      type: String,
      required: [true, "Amenity name is required"],
      trim: true,
    },
    category: {
      type: String,
      required: [true, "Amenity category is required"],
      trim: true,
    },
    status: {
      type: String,
      enum: ["Available", "Under Development", "Planned"],
      default: "Available",
    },
    description: {
      type: String,
      trim: true,
    },
  },
  { _id: true }
);

export const MicroMarketSchema = new Schema<IMicroMarket>(
  {
    name: {
      type: String,
      required: [true, "Micro-market name is required"],
      trim: true,
    },
    slug: {
      type: String,
      trim: true,
      lowercase: true,
    },
    tagline: {
      type: String,
      trim: true,
      default: "",
    },
    description: {
      type: String,
      required: [true, "Micro-market description is required"],
      trim: true,
    },
    propertyTypes: {
      type: [String],
      default: [],
    },
    connectivityContext: {
      type: String,
      trim: true,
      default: "",
    },
    highlights: {
      type: [String],
      default: [],
    },
    regulatoryAuthority: {
      type: String,
      trim: true,
      default: "",
    },
    relevantPropertySlugs: {
      type: [String],
      default: [],
    },
    marketType: {
      type: String,
      enum: MicroMarketTypeEnum,
      default: "RESIDENTIAL_CORRIDOR",
    },
    featured: {
      type: Boolean,
      default: false,
    },
    sortOrder: {
      type: Number,
      default: 0,
    },
    isPublic: {
      type: Boolean,
      default: true,
    },
    lastVerifiedAt: {
      type: Date,
    },
    coordinates: {
      latitude: Number,
      longitude: Number,
    },
    sourceReferences: {
      type: [String],
      default: [],
    },
  },
  { _id: true }
);

export const MarketObservationSchema = new Schema<IMarketObservation>(
  {
    metricType: {
      type: String,
      enum: MarketObservationMetricTypeEnum,
      required: [true, "Metric type is required"],
      trim: true,
    },
    numericValue: {
      type: Number,
      required: [true, "Numeric value is required"],
    },
    canonicalUnit: {
      type: String,
      required: [true, "Canonical unit is required"],
      default: "PAISE_PER_SQ_FT",
      trim: true,
    },
    observationPeriod: {
      type: String,
      required: [true, "Observation period is required (e.g. Q1 2026)"],
      trim: true,
    },
    sourceName: {
      type: String,
      required: [true, "Source name is required"],
      trim: true,
    },
    sourceUrl: {
      type: String,
      trim: true,
      validate: {
        validator: (v: string) => !v || isValidHttpUrl(v),
        message: "Source URL must be a valid HTTP or HTTPS URL",
      },
    },
    sourceType: {
      type: String,
      enum: MarketObservationSourceTypeEnum,
      required: [true, "Source type is required"],
      default: "GOVERNMENT",
    },
    verificationStatus: {
      type: String,
      enum: MarketObservationVerificationEnum,
      default: "UNVERIFIED",
    },
    verifiedBy: {
      type: String,
      trim: true,
    },
    verifiedAt: {
      type: Date,
    },
    isPublic: {
      type: Boolean,
      default: true,
    },
    internalNotes: {
      type: String,
      trim: true,
    },
  },
  { _id: true, timestamps: { createdAt: true, updatedAt: false } }
);

export const BuyerConsiderationSchema = new Schema<IBuyerConsideration>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    importance: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { _id: true }
);

export const FaqItemSchema = new Schema<IFaqItem>(
  {
    question: {
      type: String,
      required: true,
      trim: true,
    },
    answer: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { _id: true }
);

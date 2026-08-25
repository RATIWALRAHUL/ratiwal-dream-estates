import mongoose, { Schema, type Model } from "mongoose";
import type { ILocation } from "@/types/database";
import { PublicationStatusEnum, PropertyTypeEnum, VerificationStatusEnum } from "@/types/database";
import { SeoSchema } from "./subdocuments/seo.schema";
import {
  MicroMarketSchema,
  InfrastructureMilestoneSchema,
  ConnectivityMilestoneSchema,
  MarketObservationSchema,
  BuyerConsiderationSchema,
  FaqItemSchema,
} from "./subdocuments/milestone.schema";
import { normalizeSlug } from "@/lib/utils/slug";
import { isValidHttpUrl } from "@/lib/utils/url";

const LocationSchema = new Schema<ILocation>(
  {
    name: {
      type: String,
      required: [true, "Location name is required"],
      trim: true,
      minlength: [2, "Location name must be at least 2 characters"],
      maxlength: [100, "Location name must not exceed 100 characters"],
    },
    slug: {
      type: String,
      required: [true, "Location slug is required"],
      unique: true,
      trim: true,
      lowercase: true,
    },
    city: {
      type: String,
      required: [true, "City is required"],
      trim: true,
    },
    state: {
      type: String,
      required: [true, "State is required"],
      trim: true,
    },
    country: {
      type: String,
      required: [true, "Country is required"],
      default: "India",
      trim: true,
    },
    region: {
      type: String,
      trim: true,
    },
    tagline: {
      type: String,
      trim: true,
    },
    shortDescription: {
      type: String,
      required: [true, "Short description is required"],
      trim: true,
      maxlength: [500, "Short description must not exceed 500 characters"],
    },
    longDescription: {
      type: String,
      trim: true,
    },
    heroImage: {
      url: {
        type: String,
        trim: true,
        validate: {
          validator: (v: string) => !v || isValidHttpUrl(v),
          message: "Hero image URL must be a valid HTTP or HTTPS URL",
        },
      },
      storagePublicId: {
        type: String,
        trim: true,
      },
      altText: {
        type: String,
        trim: true,
      },
      caption: {
        type: String,
        trim: true,
      },
      width: Number,
      height: Number,
    },
    coordinates: {
      latitude: {
        type: Number,
        min: [-90, "Latitude must be between -90 and 90"],
        max: [90, "Latitude must be between -90 and 90"],
      },
      longitude: {
        type: Number,
        min: [-180, "Longitude must be between -180 and 180"],
        max: [180, "Longitude must be between -180 and 180"],
      },
      geoJson: {
        type: new mongoose.Schema(
          {
            type: {
              type: String,
              enum: ["Point"],
              required: true,
            },
            coordinates: {
              type: [Number], // [longitude, latitude]
              required: true,
            },
          },
          { _id: false }
        ),
        default: undefined,
      },
      isVerified: {
        type: Boolean,
        default: false,
      },
      source: {
        type: String,
        trim: true,
      },
      verifiedAt: {
        type: Date,
      },
    },
    microMarkets: {
      type: [MicroMarketSchema],
      default: [],
    },
    infrastructureHighlights: {
      type: [InfrastructureMilestoneSchema],
      default: [],
    },
    connectivityHighlights: {
      type: [ConnectivityMilestoneSchema],
      default: [],
    },
    marketObservations: {
      type: [MarketObservationSchema],
      default: [],
    },
    buyerConsiderations: {
      type: [BuyerConsiderationSchema],
      default: [],
    },
    faq: {
      type: [FaqItemSchema],
      default: [],
    },
    supportedPropertyTypes: {
      type: [String],
      enum: PropertyTypeEnum,
      default: ["RESIDENTIAL_PLOT", "COMMERCIAL_PLOT"],
    },
    publicationStatus: {
      type: String,
      enum: PublicationStatusEnum,
      required: [true, "Publication status is required"],
      default: "DRAFT",
      index: true,
    },
    featured: {
      type: Boolean,
      default: false,
      index: true,
    },
    sortOrder: {
      type: Number,
      default: 0,
      index: true,
    },
    version: {
      type: Number,
      default: 0,
      index: true,
    },
    submittedForReviewAt: {
      type: Date,
    },
    reviewedAt: {
      type: Date,
    },
    publishedAt: {
      type: Date,
    },
    archivedAt: {
      type: Date,
    },
    lastVerifiedAt: {
      type: Date,
    },
    reviewReason: {
      type: String,
      trim: true,
    },
    archiveReason: {
      type: String,
      trim: true,
    },
    verificationStatus: {
      type: String,
      enum: VerificationStatusEnum,
      default: "UNVERIFIED",
    },
    verifiedBy: {
      type: String,
      trim: true,
    },
    verificationNotes: {
      type: String,
      trim: true,
    },
    nextReviewDate: {
      type: Date,
    },
    seo: {
      type: SeoSchema,
      required: [true, "SEO metadata is required"],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Pre-validation / pre-save hooks
LocationSchema.pre("validate", function () {
  if (this.slug) {
    this.slug = normalizeSlug(this.slug);
  } else if (this.name) {
    this.slug = normalizeSlug(this.name);
  }

  // Ensure default SEO metadata if missing
  if (!this.seo || !this.seo.metaTitle) {
    this.seo = {
      metaTitle: this.name ? `${this.name} | Ratiwal Dream Estates` : "Growth Corridor | Ratiwal Dream Estates",
      metaDescription: this.shortDescription
        ? this.shortDescription.slice(0, 155)
        : "Explore verified residential and commercial plotted opportunities with Ratiwal Dream Estates.",
    };
  }

  // Populate GeoJSON if latitude and longitude exist
  if (
    this.coordinates &&
    typeof this.coordinates.latitude === "number" &&
    typeof this.coordinates.longitude === "number"
  ) {
    this.coordinates.geoJson = {
      type: "Point",
      coordinates: [this.coordinates.longitude, this.coordinates.latitude], // GeoJSON order: [lon, lat]
    };
  } else if (this.coordinates) {
    this.coordinates.geoJson = undefined;
  }

  if (this.publicationStatus === "PUBLISHED" && !this.publishedAt) {
    this.publishedAt = new Date();
  }

  if (this.publicationStatus === "ARCHIVED" && !this.archivedAt) {
    this.archivedAt = new Date();
  }
});

// Indexes
LocationSchema.index({ publicationStatus: 1, featured: 1, sortOrder: 1 });
LocationSchema.index({ state: 1, city: 1 });
LocationSchema.index({ "coordinates.geoJson": "2dsphere" }, { sparse: true });

export const Location: Model<ILocation> =
  (mongoose.models.Location as Model<ILocation>) ||
  mongoose.model<ILocation>("Location", LocationSchema);

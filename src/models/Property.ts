import mongoose, { Schema, type Model } from "mongoose";
import type { IProperty } from "@/types/database";
import {
  PublicationStatusEnum,
  PropertyTypeEnum,
  ListingStatusEnum,
  VerificationStatusEnum,
  SourceTypeEnum,
} from "@/types/database";
import { SeoSchema } from "./subdocuments/seo.schema";
import { MediaItemSchema } from "./subdocuments/media.schema";
import { DocumentItemSchema } from "./subdocuments/document.schema";
import { ReraSchema } from "./subdocuments/rera.schema";
import {
  AmenitySchema,
  InfrastructureMilestoneSchema,
  ConnectivityMilestoneSchema,
} from "./subdocuments/milestone.schema";
import { PricingSchema, AreaSchema } from "./subdocuments/pricing.schema";
import { normalizeSlug } from "@/lib/utils/slug";
import { isValidHttpUrl } from "@/lib/utils/url";
import { sqFtToSqYards } from "@/lib/utils/area";
import { paiseToRupees } from "@/lib/utils/currency";

const PropertySchema = new Schema<IProperty>(
  {
    title: {
      type: String,
      required: [true, "Property title is required"],
      trim: true,
      minlength: [3, "Title must be at least 3 characters long"],
      maxlength: [200, "Title must not exceed 200 characters"],
    },
    slug: {
      type: String,
      required: [true, "Property slug is required"],
      unique: true,
      trim: true,
      lowercase: true,
    },
    shortDescription: {
      type: String,
      required: [true, "Short description is required"],
      trim: true,
      maxlength: [500, "Short description must not exceed 500 characters"],
    },
    fullDescription: {
      type: String,
      required: [true, "Full description is required"],
      trim: true,
    },
    propertyType: {
      type: String,
      enum: PropertyTypeEnum,
      required: [true, "Property type is required"],
      index: true,
    },
    inventoryMode: {
      type: String,
      enum: ["SINGLE_LISTING", "MULTI_UNIT_PROJECT", "PLOT_INVENTORY", "COMMERCIAL_INVENTORY", "MIXED_INVENTORY"],
      default: "SINGLE_LISTING",
      index: true,
    },
    listingStatus: {
      type: String,
      enum: ListingStatusEnum,
      required: [true, "Listing status is required"],
      default: "AVAILABLE",
      index: true,
    },
    publicationStatus: {
      type: String,
      enum: PublicationStatusEnum,
      required: [true, "Publication status is required"],
      default: "DRAFT",
      index: true,
    },
    verificationStatus: {
      type: String,
      enum: VerificationStatusEnum,
      required: [true, "Verification status is required"],
      default: "UNVERIFIED",
    },
    locationId: {
      type: Schema.Types.ObjectId,
      ref: "Location",
      required: [true, "Property must belong to a location"],
      index: true,
    },
    locality: {
      type: String,
      trim: true,
    },
    address: {
      type: String,
      trim: true,
    },
    sourceType: {
      type: String,
      enum: SourceTypeEnum,
      required: [true, "Source type is required"],
      default: "INTERNAL",
    },
    developerOrOwnerName: {
      type: String,
      trim: true,
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

    pricing: {
      type: PricingSchema,
      required: [true, "Pricing information is required"],
    },
    area: {
      type: AreaSchema,
      required: [true, "Area specifications are required"],
    },

    highlights: {
      type: [String],
      default: [],
    },
    amenities: {
      type: [AmenitySchema],
      default: [],
    },
    infrastructureMilestones: {
      type: [InfrastructureMilestoneSchema],
      default: [],
    },
    connectivityMilestones: {
      type: [ConnectivityMilestoneSchema],
      default: [],
    },
    possessionOrDevelopmentStatus: {
      type: String,
      trim: true,
    },
    virtualTourUrl: {
      type: String,
      trim: true,
      validate: {
        validator: (v: string) => !v || isValidHttpUrl(v),
        message: "Virtual tour URL must be a valid HTTP or HTTPS URL",
      },
    },

    brochure: {
      title: { type: String, trim: true },
      fileUrl: {
        type: String,
        trim: true,
        validate: {
          validator: (v: string) => !v || isValidHttpUrl(v),
          message: "Brochure URL must be a valid HTTP or HTTPS URL",
        },
      },
      mimeType: { type: String, trim: true },
      sizeBytes: { type: Number, min: 0 },
      version: { type: String, trim: true },
      lastUpdated: { type: Date },
    },

    masterplan: {
      title: { type: String, trim: true },
      fileUrl: {
        type: String,
        trim: true,
        validate: {
          validator: (v: string) => !v || isValidHttpUrl(v),
          message: "Masterplan file URL must be a valid HTTP or HTTPS URL",
        },
      },
      imageUrl: {
        type: String,
        trim: true,
        validate: {
          validator: (v: string) => !v || isValidHttpUrl(v),
          message: "Masterplan image preview URL must be a valid HTTP or HTTPS URL",
        },
      },
      approvalAuthority: { type: String, trim: true },
      version: { type: String, trim: true },
    },

    rera: {
      type: ReraSchema,
      required: [true, "RERA metadata is required"],
    },

    media: {
      type: [MediaItemSchema],
      default: [],
    },
    documents: {
      type: [DocumentItemSchema],
      default: [],
    },

    publishedAt: {
      type: Date,
    },
    archivedAt: {
      type: Date,
    },
    lastVerifiedAt: {
      type: Date,
      index: true,
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

// Virtual getters for sq yard area conversions
PropertySchema.virtual("minimumAreaSqYd").get(function () {
  return this.area?.minimumAreaSqFt ? sqFtToSqYards(this.area.minimumAreaSqFt) : undefined;
});

PropertySchema.virtual("maximumAreaSqYd").get(function () {
  return this.area?.maximumAreaSqFt ? sqFtToSqYards(this.area.maximumAreaSqFt) : undefined;
});

// Virtual getters for rupee prices
PropertySchema.virtual("startingPriceRupees").get(function () {
  return typeof this.pricing?.startingPricePaise === "number"
    ? paiseToRupees(this.pricing.startingPricePaise)
    : null;
});

PropertySchema.virtual("maximumPriceRupees").get(function () {
  return typeof this.pricing?.maximumPricePaise === "number"
    ? paiseToRupees(this.pricing.maximumPricePaise)
    : null;
});

PropertySchema.virtual("rateRupeesPerSqFt").get(function () {
  return typeof this.pricing?.ratePaisePerSqFt === "number"
    ? paiseToRupees(this.pricing.ratePaisePerSqFt)
    : null;
});

// Validation & lifecycle hooks
PropertySchema.pre("validate", function () {
  if (this.slug) {
    this.slug = normalizeSlug(this.slug);
  } else if (this.title) {
    this.slug = normalizeSlug(this.title);
  }

  // Check primary image count: maximum 1 primary image allowed
  if (Array.isArray(this.media)) {
    const primaryImages = this.media.filter((item) => item.isPrimary);
    if (primaryImages.length > 1) {
      this.invalidate("media", "A property cannot have more than one primary image");
    }
  }

  // Publication invariants
  if (this.publicationStatus === "PUBLISHED") {
    if (!this.publishedAt) {
      this.publishedAt = new Date();
    }

    if (!this.lastVerifiedAt) {
      this.invalidate("lastVerifiedAt", "Published properties must include a verification timestamp");
    }

    // Must have at least one primary image for publication
    const hasPrimaryImage = Array.isArray(this.media) && this.media.some((item) => item.isPrimary);
    if (!hasPrimaryImage) {
      this.invalidate("media", "Published properties must have at least one approved primary image");
    }
  }

  if (this.publicationStatus === "ARCHIVED" && !this.archivedAt) {
    this.archivedAt = new Date();
  }
});

// Compound query indexes
PropertySchema.index({ publicationStatus: 1, listingStatus: 1, publishedAt: -1 });
PropertySchema.index({ locationId: 1, publicationStatus: 1, listingStatus: 1 });
PropertySchema.index({ propertyType: 1, publicationStatus: 1 });
PropertySchema.index({ featured: 1, sortOrder: 1 });
PropertySchema.index({ lastVerifiedAt: -1 });

export const Property: Model<IProperty> =
  (mongoose.models.Property as Model<IProperty>) ||
  mongoose.model<IProperty>("Property", PropertySchema);

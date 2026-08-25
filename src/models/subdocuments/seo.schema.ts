import { Schema } from "mongoose";
import type { ISeoMetadata } from "@/types/database";
import { isValidHttpUrl } from "@/lib/utils/url";

export const SeoSchema = new Schema<ISeoMetadata>(
  {
    metaTitle: {
      type: String,
      required: [true, "Meta title is required"],
      trim: true,
      maxlength: [100, "Meta title must not exceed 100 characters"],
    },
    metaDescription: {
      type: String,
      required: [true, "Meta description is required"],
      trim: true,
      maxlength: [300, "Meta description must not exceed 300 characters"],
    },
    canonicalUrl: {
      type: String,
      trim: true,
      validate: {
        validator: (v: string) => !v || isValidHttpUrl(v),
        message: "Canonical URL must be a valid HTTP or HTTPS URL",
      },
    },
    ogImageUrl: {
      type: String,
      trim: true,
      validate: {
        validator: (v: string) => !v || isValidHttpUrl(v),
        message: "OG Image URL must be a valid HTTP or HTTPS URL",
      },
    },
    noIndex: {
      type: Boolean,
      default: false,
    },
    noFollow: {
      type: Boolean,
      default: false,
    },
  },
  { _id: false }
);

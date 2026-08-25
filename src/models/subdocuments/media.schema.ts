import { Schema } from "mongoose";
import type { IMediaItem } from "@/types/database";
import { MediaTypeEnum } from "@/types/database";
import { isValidHttpUrl } from "@/lib/utils/url";

export const MediaItemSchema = new Schema<IMediaItem>(
  {
    type: {
      type: String,
      enum: MediaTypeEnum,
      required: [true, "Media type is required"],
      default: "IMAGE",
    },
    url: {
      type: String,
      required: [true, "Media URL is required"],
      trim: true,
      validate: {
        validator: isValidHttpUrl,
        message: "Media URL must be a valid HTTP or HTTPS URL",
      },
    },
    storagePublicId: {
      type: String,
      trim: true,
    },
    provider: {
      type: String,
      trim: true,
    },
    altText: {
      type: String,
      required: [true, "Alt text is required for accessibility"],
      trim: true,
      minlength: [3, "Alt text must be at least 3 characters long"],
    },
    caption: {
      type: String,
      trim: true,
    },
    width: {
      type: Number,
      min: [1, "Width must be a positive number"],
    },
    height: {
      type: Number,
      min: [1, "Height must be a positive number"],
    },
    sortOrder: {
      type: Number,
      default: 0,
    },
    isPrimary: {
      type: Boolean,
      default: false,
    },
    publicationStatus: {
      type: String,
      enum: ["ACTIVE", "ARCHIVED"],
      default: "ACTIVE",
    },
  },
  { _id: true }
);

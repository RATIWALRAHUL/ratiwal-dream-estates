import { Schema } from "mongoose";
import type { IPricingInfo, IAreaInfo, IAdditionalCharge } from "@/types/database";
import { PriceVisibilityEnum } from "@/types/database";
import { isValidPaise } from "@/lib/utils/currency";
import { isValidArea } from "@/lib/utils/area";

export const PricingSchema = new Schema<IPricingInfo>(
  {
    currency: {
      type: String,
      enum: ["INR"],
      default: "INR",
      required: true,
    },
    priceVisibility: {
      type: String,
      enum: PriceVisibilityEnum,
      required: [true, "Price visibility is required"],
      default: "PUBLIC",
    },
    startingPricePaise: {
      type: Number,
      validate: {
        validator: (v: number | undefined) => v === undefined || isValidPaise(v),
        message: "Starting price must be a non-negative safe integer in paise",
      },
    },
    maximumPricePaise: {
      type: Number,
      validate: {
        validator: (v: number | undefined) => v === undefined || isValidPaise(v),
        message: "Maximum price must be a non-negative safe integer in paise",
      },
    },
    ratePaisePerSqFt: {
      type: Number,
      validate: {
        validator: (v: number | undefined) => v === undefined || isValidPaise(v),
        message: "Rate per sq ft must be a non-negative safe integer in paise",
      },
    },
    additionalPricingNotes: {
      type: String,
      trim: true,
    },
  },
  { _id: false }
);

// Validation hook for pricing invariants
PricingSchema.pre("validate", function () {
  if (this.priceVisibility === "PUBLIC") {
    // If public, at least starting price or rate per sqft must be present and > 0
    const hasStarting = typeof this.startingPricePaise === "number" && this.startingPricePaise > 0;
    const hasRate = typeof this.ratePaisePerSqFt === "number" && this.ratePaisePerSqFt > 0;
    if (!hasStarting && !hasRate) {
      this.invalidate(
        "startingPricePaise",
        "Public pricing requires a valid positive startingPricePaise or ratePaisePerSqFt"
      );
    }
  }

  if (
    typeof this.startingPricePaise === "number" &&
    typeof this.maximumPricePaise === "number" &&
    this.maximumPricePaise < this.startingPricePaise
  ) {
    this.invalidate("maximumPricePaise", "Maximum price cannot be less than starting price");
  }
});

export const AreaSchema = new Schema<IAreaInfo>(
  {
    minimumAreaSqFt: {
      type: Number,
      required: [true, "Minimum area in square feet is required"],
      validate: {
        validator: isValidArea,
        message: "Minimum area must be a positive finite number in square feet",
      },
    },
    maximumAreaSqFt: {
      type: Number,
      required: [true, "Maximum area in square feet is required"],
      validate: {
        validator: isValidArea,
        message: "Maximum area must be a positive finite number in square feet",
      },
    },
    displayUnitPreference: {
      type: String,
      enum: ["SQ_FT", "SQ_YD"],
      default: "SQ_YD",
    },
  },
  { _id: false }
);

// Area range validation hook
AreaSchema.pre("validate", function () {
  if (
    typeof this.minimumAreaSqFt === "number" &&
    typeof this.maximumAreaSqFt === "number" &&
    this.maximumAreaSqFt < this.minimumAreaSqFt
  ) {
    this.invalidate("maximumAreaSqFt", "Maximum area cannot be smaller than minimum area");
  }
});

export const AdditionalChargeSchema = new Schema<IAdditionalCharge>(
  {
    name: {
      type: String,
      required: [true, "Charge name is required"],
      trim: true,
    },
    chargePaise: {
      type: Number,
      required: [true, "Charge amount in paise is required"],
      validate: {
        validator: isValidPaise,
        message: "Charge amount must be a non-negative safe integer in paise",
      },
    },
    isOptional: {
      type: Boolean,
      default: false,
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  { _id: true }
);

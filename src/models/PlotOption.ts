import mongoose, { Schema, type Model } from "mongoose";
import type { IPlotOption } from "@/types/database";
import { PlotStatusEnum, PlotFacingEnum } from "@/types/database";
import { AdditionalChargeSchema } from "./subdocuments/pricing.schema";
import { isValidPaise, paiseToRupees } from "@/lib/utils/currency";
import { isValidArea, sqFtToSqYards } from "@/lib/utils/area";

const PlotOptionSchema = new Schema<IPlotOption>(
  {
    propertyId: {
      type: Schema.Types.ObjectId,
      ref: "Property",
      required: [true, "PlotOption must be linked to a Property"],
      index: true,
    },
    plotNumber: {
      type: String,
      trim: true,
    },
    label: {
      type: String,
      trim: true,
    },
    widthFeet: {
      type: Number,
      validate: {
        validator: (v: number | undefined) => v === undefined || (typeof v === "number" && v > 0),
        message: "Plot width must be a positive number in feet",
      },
    },
    lengthFeet: {
      type: Number,
      validate: {
        validator: (v: number | undefined) => v === undefined || (typeof v === "number" && v > 0),
        message: "Plot length must be a positive number in feet",
      },
    },
    areaSqFt: {
      type: Number,
      required: [true, "Plot area in square feet is required"],
      validate: {
        validator: isValidArea,
        message: "Plot area must be a positive finite number in square feet",
      },
    },
    ratePaisePerSqFt: {
      type: Number,
      validate: {
        validator: (v: number | undefined) => v === undefined || isValidPaise(v),
        message: "Rate per sq ft must be a non-negative safe integer in paise",
      },
    },
    basePricePaise: {
      type: Number,
      validate: {
        validator: (v: number | undefined) => v === undefined || isValidPaise(v),
        message: "Base price must be a non-negative safe integer in paise",
      },
    },
    additionalCharges: {
      type: [AdditionalChargeSchema],
      default: [],
    },
    facing: {
      type: String,
      enum: PlotFacingEnum,
    },
    cornerPlot: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: PlotStatusEnum,
      required: [true, "Plot status is required"],
      default: "AVAILABLE",
      index: true,
    },
    publiclyVisible: {
      type: Boolean,
      default: true,
    },
    sortOrder: {
      type: Number,
      default: 0,
      index: true,
    },
    lastVerifiedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual getters for sq yard area conversions
PlotOptionSchema.virtual("areaSqYd").get(function () {
  return this.areaSqFt ? sqFtToSqYards(this.areaSqFt) : undefined;
});

// Virtual getters for rupee prices
PlotOptionSchema.virtual("basePriceRupees").get(function () {
  return typeof this.basePricePaise === "number" ? paiseToRupees(this.basePricePaise) : null;
});

PlotOptionSchema.virtual("rateRupeesPerSqFt").get(function () {
  return typeof this.ratePaisePerSqFt === "number" ? paiseToRupees(this.ratePaisePerSqFt) : null;
});

// Compound Indexes
PlotOptionSchema.index({ propertyId: 1, status: 1, sortOrder: 1 });
PlotOptionSchema.index({ propertyId: 1, plotNumber: 1 }, { unique: true, sparse: true });
PlotOptionSchema.index({ propertyId: 1, areaSqFt: 1 });
PlotOptionSchema.index({ propertyId: 1, basePricePaise: 1 });

export const PlotOption: Model<IPlotOption> =
  (mongoose.models.PlotOption as Model<IPlotOption>) ||
  mongoose.model<IPlotOption>("PlotOption", PlotOptionSchema);

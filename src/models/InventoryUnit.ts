import mongoose, { Schema, Document, Model, Types } from "mongoose";
import {
  UnitCategory,
  UNIT_CATEGORIES,
  UnitConfiguration,
  UNIT_CONFIGURATIONS,
  UnitStatus,
  UNIT_STATUSES,
  UnitVisibility,
  UNIT_VISIBILITIES,
  FacingDirection,
  FACING_DIRECTIONS,
  ViewType,
  VIEW_TYPES,
  FurnishingStatus,
  FURNISHING_STATUSES,
} from "@/types/inventory";
import { isValidPaise, paiseToRupees } from "@/lib/utils/currency";
import { isValidArea, sqFtToSqYards } from "@/lib/utils/area";

export interface IInventoryUnit extends Document {
  propertyId: Types.ObjectId;
  phaseName?: string;
  towerBlockSector?: string;
  floorLevel?: string;
  unitNumber: string;
  inventoryKey: string;
  referenceCode: string;

  unitCategory: UnitCategory;
  configuration: UnitConfiguration;
  bedrooms?: number;
  bathrooms?: number;
  balconies?: number;

  facing?: FacingDirection;
  viewType?: ViewType;
  furnishingStatus?: FurnishingStatus;
  cornerUnit: boolean;

  // Areas
  carpetAreaSqFt?: number;
  builtUpAreaSqFt?: number;
  superBuiltUpAreaSqFt?: number;
  plotAreaSqFt?: number;
  balconyAreaSqFt?: number;
  terraceAreaSqFt?: number;
  chargeableAreaSqFt?: number;
  widthFeet?: number;
  lengthFeet?: number;

  // Status & Visibility
  status: UnitStatus;
  visibility: UnitVisibility;

  // Pricing (Integer Paise)
  basePricePaise?: number;
  ratePaisePerSqFt?: number;
  ratePaisePerSqYd?: number;
  plcChargePaise?: number;
  floorRiseChargePaise?: number;
  parkingChargePaise?: number;
  clubChargePaise?: number;
  maintenanceDepositPaise?: number;
  otherChargesPaise?: number;
  discountCeilingPaise?: number;
  estimatedTaxPaise?: number;
  displayPricePaise?: number;
  priceOnRequest: boolean;

  // Media references
  floorPlanAssetId?: Types.ObjectId;
  mediaAssetIds: Types.ObjectId[];

  // Notes & Internal Meta
  internalNotes?: string;

  // Concurrency & Lifecycle
  version: number;
  publishedAt?: Date;
  archivedAt?: Date;
  createdBy: string;
  createdByName?: string;
  updatedBy: string;
  updatedByName?: string;
  createdAt: Date;
  updatedAt: Date;

  // Virtuals
  primaryAreaSqFt: number;
  primaryAreaSqYd?: number;
  basePriceRupees?: number | null;
  displayPriceRupees?: number | null;
}

const InventoryUnitSchema = new Schema<IInventoryUnit>(
  {
    propertyId: {
      type: Schema.Types.ObjectId,
      ref: "Property",
      required: [true, "Property reference is required"],
      index: true,
    },
    phaseName: {
      type: String,
      trim: true,
      index: true,
    },
    towerBlockSector: {
      type: String,
      trim: true,
      index: true,
    },
    floorLevel: {
      type: String,
      trim: true,
      index: true,
    },
    unitNumber: {
      type: String,
      required: [true, "Unit number is required"],
      trim: true,
      index: true,
    },
    inventoryKey: {
      type: String,
      required: [true, "Normalized inventory key is required"],
      trim: true,
      uppercase: true,
    },
    referenceCode: {
      type: String,
      required: [true, "Reference code is required"],
      unique: true,
      trim: true,
      uppercase: true,
    },
    unitCategory: {
      type: String,
      enum: UNIT_CATEGORIES,
      required: [true, "Unit category is required"],
      default: "RESIDENTIAL_PLOT",
      index: true,
    },
    configuration: {
      type: String,
      enum: UNIT_CONFIGURATIONS,
      required: [true, "Unit configuration is required"],
      default: "PLOT",
      index: true,
    },
    bedrooms: {
      type: Number,
      min: 0,
      max: 20,
    },
    bathrooms: {
      type: Number,
      min: 0,
      max: 20,
    },
    balconies: {
      type: Number,
      min: 0,
      max: 10,
    },
    facing: {
      type: String,
      enum: FACING_DIRECTIONS,
    },
    viewType: {
      type: String,
      enum: VIEW_TYPES,
    },
    furnishingStatus: {
      type: String,
      enum: FURNISHING_STATUSES,
    },
    cornerUnit: {
      type: Boolean,
      default: false,
    },

    // Areas
    carpetAreaSqFt: {
      type: Number,
      min: 0,
    },
    builtUpAreaSqFt: {
      type: Number,
      min: 0,
    },
    superBuiltUpAreaSqFt: {
      type: Number,
      min: 0,
    },
    plotAreaSqFt: {
      type: Number,
      min: 0,
      validate: {
        validator: (v: number | undefined) => v === undefined || isValidArea(v),
        message: "Plot area must be a positive number",
      },
    },
    balconyAreaSqFt: {
      type: Number,
      min: 0,
    },
    terraceAreaSqFt: {
      type: Number,
      min: 0,
    },
    chargeableAreaSqFt: {
      type: Number,
      min: 0,
    },
    widthFeet: {
      type: Number,
      min: 0,
    },
    lengthFeet: {
      type: Number,
      min: 0,
    },

    // Status & Visibility
    status: {
      type: String,
      enum: UNIT_STATUSES,
      required: [true, "Unit status is required"],
      default: "DRAFT",
      index: true,
    },
    visibility: {
      type: String,
      enum: UNIT_VISIBILITIES,
      required: [true, "Unit visibility is required"],
      default: "PUBLIC_DETAIL",
      index: true,
    },

    // Pricing (Paise)
    basePricePaise: {
      type: Number,
      validate: {
        validator: (v: number | undefined) => v === undefined || isValidPaise(v),
        message: "Base price must be a non-negative integer in paise",
      },
    },
    ratePaisePerSqFt: {
      type: Number,
      validate: {
        validator: (v: number | undefined) => v === undefined || isValidPaise(v),
        message: "Rate per sq ft must be a non-negative integer in paise",
      },
    },
    ratePaisePerSqYd: {
      type: Number,
      validate: {
        validator: (v: number | undefined) => v === undefined || isValidPaise(v),
        message: "Rate per sq yd must be a non-negative integer in paise",
      },
    },
    plcChargePaise: { type: Number, min: 0 },
    floorRiseChargePaise: { type: Number, min: 0 },
    parkingChargePaise: { type: Number, min: 0 },
    clubChargePaise: { type: Number, min: 0 },
    maintenanceDepositPaise: { type: Number, min: 0 },
    otherChargesPaise: { type: Number, min: 0 },
    discountCeilingPaise: { type: Number, min: 0 },
    estimatedTaxPaise: { type: Number, min: 0 },
    displayPricePaise: { type: Number, min: 0 },
    priceOnRequest: {
      type: Boolean,
      default: false,
    },

    // Media
    floorPlanAssetId: {
      type: Schema.Types.ObjectId,
      ref: "MediaAsset",
    },
    mediaAssetIds: {
      type: [Schema.Types.ObjectId],
      ref: "MediaAsset",
      default: [],
    },

    // Notes
    internalNotes: {
      type: String,
      trim: true,
    },

    // Concurrency & Auditing
    version: {
      type: Number,
      required: true,
      default: 1,
    },
    publishedAt: { type: Date },
    archivedAt: { type: Date },
    createdBy: { type: String, required: true },
    createdByName: { type: String },
    updatedBy: { type: String, required: true },
    updatedByName: { type: String },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ─── Virtuals ────────────────────────────────────────────────────────────────

InventoryUnitSchema.virtual("primaryAreaSqFt").get(function (this: IInventoryUnit) {
  return (
    this.plotAreaSqFt ||
    this.superBuiltUpAreaSqFt ||
    this.builtUpAreaSqFt ||
    this.carpetAreaSqFt ||
    0
  );
});

InventoryUnitSchema.virtual("primaryAreaSqYd").get(function (this: IInventoryUnit) {
  const sqFt = this.plotAreaSqFt || this.superBuiltUpAreaSqFt || this.builtUpAreaSqFt || this.carpetAreaSqFt;
  return sqFt ? sqFtToSqYards(sqFt) : undefined;
});

InventoryUnitSchema.virtual("basePriceRupees").get(function (this: IInventoryUnit) {
  return typeof this.basePricePaise === "number" ? paiseToRupees(this.basePricePaise) : null;
});

InventoryUnitSchema.virtual("displayPriceRupees").get(function (this: IInventoryUnit) {
  const price = this.displayPricePaise ?? this.basePricePaise;
  return typeof price === "number" ? paiseToRupees(price) : null;
});

// ─── Compound Indexes ────────────────────────────────────────────────────────

// 1. Compound uniqueness of inventory key within property
InventoryUnitSchema.index({ propertyId: 1, inventoryKey: 1 }, { unique: true });

// 2. Querying by property and status
InventoryUnitSchema.index({ propertyId: 1, status: 1, visibility: 1 });

// 3. Matrix querying by property, tower, and floor
InventoryUnitSchema.index({ propertyId: 1, towerBlockSector: 1, floorLevel: 1, unitNumber: 1 });

// 4. Price and area filtering
InventoryUnitSchema.index({ propertyId: 1, basePricePaise: 1 });
InventoryUnitSchema.index({ propertyId: 1, plotAreaSqFt: 1 });

export const InventoryUnit: Model<IInventoryUnit> =
  (mongoose.models.InventoryUnit as Model<IInventoryUnit>) ||
  mongoose.model<IInventoryUnit>("InventoryUnit", InventoryUnitSchema);

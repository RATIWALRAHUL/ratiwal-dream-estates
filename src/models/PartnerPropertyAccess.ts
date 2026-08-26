import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface IPartnerPropertyAccess extends Document {
  _id: Types.ObjectId;
  partnerId: Types.ObjectId;
  propertyId: Types.ObjectId;
  locationId?: Types.ObjectId;

  accessLevel: "FULL_MARKETING" | "BASIC_INVENTORY" | "RESTRICTED";
  effectiveDate: Date;
  expiryDate?: Date;
  isActive: boolean;

  permittedCollateralKeys: string[];
  customCommissionPlanId?: Types.ObjectId;

  grantedBy: string;
  grantedByName?: string;
  revokedBy?: string;
  revokedAt?: Date;

  createdAt: Date;
  updatedAt: Date;
}

const PartnerPropertyAccessSchema = new Schema<IPartnerPropertyAccess>(
  {
    partnerId: {
      type: Schema.Types.ObjectId,
      ref: "ChannelPartner",
      required: [true, "Partner reference is required"],
      index: true,
    },
    propertyId: {
      type: Schema.Types.ObjectId,
      ref: "Property",
      required: [true, "Property reference is required"],
      index: true,
    },
    locationId: {
      type: Schema.Types.ObjectId,
      ref: "Location",
    },
    accessLevel: {
      type: String,
      enum: ["FULL_MARKETING", "BASIC_INVENTORY", "RESTRICTED"],
      default: "FULL_MARKETING",
    },
    effectiveDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    expiryDate: {
      type: Date,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    permittedCollateralKeys: {
      type: [String],
      default: [],
    },
    customCommissionPlanId: {
      type: Schema.Types.ObjectId,
      ref: "CommissionPlan",
    },
    grantedBy: {
      type: String,
      required: true,
    },
    grantedByName: {
      type: String,
    },
    revokedBy: {
      type: String,
    },
    revokedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

PartnerPropertyAccessSchema.index({ partnerId: 1, propertyId: 1 }, { unique: true });

export const PartnerPropertyAccess: Model<IPartnerPropertyAccess> =
  mongoose.models.PartnerPropertyAccess ||
  mongoose.model<IPartnerPropertyAccess>("PartnerPropertyAccess", PartnerPropertyAccessSchema);

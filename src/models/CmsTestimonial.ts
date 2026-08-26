import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface ICmsTestimonial extends Document {
  _id: Types.ObjectId;
  clientName: string;
  clientRoleOrCity?: string;
  avatarUrl?: string;
  testimonialText: string;
  rating: number; // 1 to 5

  relatedPropertyId?: Types.ObjectId;
  relatedLocationId?: Types.ObjectId;

  // DPDP & Consent Verification
  hasClientConsent: boolean;
  consentRecordRef?: string;
  allowPublicDisplay: boolean;
  maskIdentity: boolean;

  status: "DRAFT" | "APPROVED" | "PUBLISHED" | "ARCHIVED";
  displayOrder: number;

  verifiedBy?: string;
  verifiedAt?: Date;

  createdAt: Date;
  updatedAt: Date;
}

const CmsTestimonialSchema = new Schema<ICmsTestimonial>(
  {
    clientName: {
      type: String,
      required: true,
      trim: true,
    },
    clientRoleOrCity: {
      type: String,
      trim: true,
    },
    avatarUrl: {
      type: String,
      trim: true,
    },
    testimonialText: {
      type: String,
      required: true,
      trim: true,
      maxlength: [1000, "Testimonial text cannot exceed 1000 characters"],
    },
    rating: {
      type: Number,
      default: 5,
      min: 1,
      max: 5,
    },
    relatedPropertyId: {
      type: Schema.Types.ObjectId,
      ref: "Property",
    },
    relatedLocationId: {
      type: Schema.Types.ObjectId,
      ref: "Location",
    },
    hasClientConsent: {
      type: Boolean,
      required: true,
      default: true,
    },
    consentRecordRef: {
      type: String,
      trim: true,
    },
    allowPublicDisplay: {
      type: Boolean,
      default: true,
    },
    maskIdentity: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ["DRAFT", "APPROVED", "PUBLISHED", "ARCHIVED"],
      default: "DRAFT",
      index: true,
    },
    displayOrder: {
      type: Number,
      default: 0,
    },
    verifiedBy: {
      type: String,
    },
    verifiedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

export const CmsTestimonial: Model<ICmsTestimonial> =
  mongoose.models.CmsTestimonial ||
  mongoose.model<ICmsTestimonial>("CmsTestimonial", CmsTestimonialSchema);

import { Schema } from "mongoose";
import type { IReraInfo } from "@/types/database";
import { ReraStatusEnum } from "@/types/database";
import { isValidHttpUrl } from "@/lib/utils/url";

export const ReraSchema = new Schema<IReraInfo>(
  {
    applicable: {
      type: Boolean,
      required: [true, "RERA applicability flag is required"],
      default: true,
    },
    registrationNumber: {
      type: String,
      trim: true,
    },
    authorityName: {
      type: String,
      trim: true,
    },
    authorityUrl: {
      type: String,
      trim: true,
      validate: {
        validator: (v: string) => !v || isValidHttpUrl(v),
        message: "RERA authority URL must be a valid HTTP or HTTPS URL",
      },
    },
    status: {
      type: String,
      enum: ReraStatusEnum,
      required: [true, "RERA status is required"],
      default: "NOT_APPLICABLE",
    },
    lastVerifiedAt: {
      type: Date,
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  { _id: false }
);

// Schema validation hook for RERA invariants
ReraSchema.pre("validate", function () {
  if (this.applicable && this.status === "VERIFIED") {
    if (!this.registrationNumber || !this.registrationNumber.trim()) {
      this.invalidate("registrationNumber", "RERA registration number is required when RERA status is VERIFIED");
    }
    if (!this.lastVerifiedAt) {
      this.invalidate("lastVerifiedAt", "RERA verification timestamp is required when RERA status is VERIFIED");
    }
  }
});
